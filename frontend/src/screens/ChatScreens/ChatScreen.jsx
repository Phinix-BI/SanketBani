import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  Animated,
} from 'react-native';
import io from 'socket.io-client';
import { API_URL } from '@env';
import MessageInput from '../../components/MessageInput';
import {
  selectFile,
  uploadFile,
  sendMessage,
  fetchUserIds,
  handleImagePress,
  formatTime,
  handleLongPressEnd,
  handleLongPressStart,
  handlePanelAction,
  closeViewer,
} from '../../utils/chatHelpers';
import {setHeaderLeft, setHeaderRight} from '../../components/ChatHeader';
import MessageList from '../../components/MessageList';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCView,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
import {IncomingCallScreen , OutgoingCallScreen , WebrtcRoomScreen} from '../index'

const socket = io(API_URL);

const ChatScreen = ({navigation, route}) => {
  const otherUserId = useRef(null); // State to hold the other user's id
  const [message, setMessage] = useState({
    message: '',
    mediaUrl: {url: '', type: '', audio: false},
  });
  const [chat, setChat] = useState([]);
  const [senderId, setSenderId] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [fileResponse, setFileResponse] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null); // State to hold profile picture URL
  const {sender, recipient, recipientName} = route.params;
  const flatListRef = useRef(null); // Create FlatList reference
  const videoRef = useRef(null); // Reference to the video player
  const [panelPosition, setPanelPosition] = useState({x: 0, y: 0});
  const [activeItemId, setActiveItemId] = useState(null); // State to track the active item
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [isViewerVisible, setIsViewerVisible] = useState(false); // Track ImageViewer visibility
  const [viewerData, setViewerData] = useState({ imageUrl: '', videoUrl: '', senderName: '', type: '' , audio : false}); // Data for ImageViewer
  const [type, setType] = useState('CHAT'); // State to hold the type of call
  const [localStream, setlocalStream] = useState(null); // Stream of local user
  const [remoteStream, setRemoteStream] = useState(null); /* When a call is connected, the video stream from the receiver is appended to this state in the stream*/
  
  useEffect(() => {
    fetchUserIds(
      sender,
      recipient,
      setSenderId,
      setRecipientId,
      setProfilePicture,
      setChat,
    );
    if (senderId && recipientId) {
      socket.emit('joinRoom', {sender: senderId, recipient: recipientId});

      socket.on('receiveMessage', message => {
        setChat(prevChat => [...prevChat, message]);
      });

      return () => {
        socket.off('receiveMessage');
      };
    }
  }, [senderId, recipientId]);


  // Scroll to the end when chat data changes
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, [chat]);

  // for video call

   /* This creates an WebRTC Peer Connection, which will be used to set local/remote descriptions and offers. */
   const peerConnection = useRef(
    new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
        {
          urls: 'stun:stun1.l.google.com:19302',
        },
        {
          urls: 'stun:stun2.l.google.com:19302',
        },
      ],
    }),
  );

  let remoteRTCMessage = useRef(null)

  useEffect(() => {
    
      socket.on("newCall", (data) => {
      remoteRTCMessage.current = data.rtcMessage;
      otherUserId.current = data.callerId;
      setType("INCOMING_CALL");
      });
  
      socket.on("callAnswered", (data) => {
          // 7. When Alice gets Bob's session description, she sets that as the remote description with `setRemoteDescription` method.
          remoteRTCMessage.current = data.rtcMessage;
          peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(remoteRTCMessage.current)
          );

          setType("WEBRTC_ROOM");
      });
  
        socket.on("ICEcandidate", (data) => {
  const { rtcMessage } = data;
  const { candidate, label, id } = rtcMessage;

  if (candidate && label !== null && id !== null) {
    console.log("Adding ICE candidate");
    const iceCandidate = new RTCIceCandidate({
      sdpMLineIndex: label,
      sdpMid: id,
      candidate: candidate,
    });

    peerConnection?.current
      .addIceCandidate(iceCandidate)
      .then(() => {
        console.log("ICE candidate added successfully");
      })
      .catch((err) => {
        console.log("Error adding ICE candidate:", err);
      });
  } else {
    console.log("Received ICE candidate with missing fields:", rtcMessage);
  }
});
        

      socket.on("callEnded", () => {
          processEndCall();
      });
  
      let isFront = false;
  
  /*The MediaDevices interface allows you to access connected media inputs such as cameras and microphones. We ask the user for permission to access those media inputs by invoking the mediaDevices.getUserMedia() method. */
      mediaDevices.enumerateDevices().then(sourceInfos => {
        let videoSourceId;
        for (let i = 0; i < sourceInfos.length; i++) {
          const sourceInfo = sourceInfos[i];
          if (
            sourceInfo.kind == 'videoinput' &&
            sourceInfo.facing == (isFront ? 'user' : 'environment')
          ) {
            videoSourceId = sourceInfo.deviceId;
          }
        }
  
  
        mediaDevices
          .getUserMedia({
            audio: true,
            video: {
              mandatory: {
                minWidth: 500, // Provide your own width, height and frame rate here
                minHeight: 300,
                minFrameRate: 60,
              },
              facingMode: isFront ? 'user' : 'environment',
              optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
            },
          })
          .then(stream => {
            // Get local stream!
          
            setlocalStream(stream);
           
           // Add each track (audio and video) to the peer connection
          stream.getTracks().forEach(track => {
             peerConnection.current.addTrack(track, stream); // Correct usage of addTrack
           });
          })
          .catch(error => {
            // Log error
            console.log("Error in getting local stram : ",error);
            throw new Error(" Error in getting local stream ");
            
          });
      });
  
      peerConnection.current.ontrack = (event) => {
        console.log("ontrack sr a", event.streams[0]);
        // When a remote stream arrives, display it in the remote video element
        setRemoteStream(event.streams[0]);
      };

      // Alice creates an RTCPeerConnection object with an `onicecandidate` handler, which runs when network candidates become available.
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          const { sdpMLineIndex, sdpMid, candidate } = event.candidate;
          if (sdpMLineIndex !== null && sdpMid !== null && candidate) {
            console.log("Sending ICE candidate", event.candidate);
            sendICEcandidate({
              calleeId: otherUserId.current,
              rtcMessage: {
                label: sdpMLineIndex,
                id: sdpMid,
                candidate: candidate,
              },
            });
          } else {
            console.log("ICE candidate has missing fields:", event.candidate);
          }
        } else {
          console.log("End of candidates.");
        }
      };
      
  
      return () => {
    
        socket.off('newCall');
        socket.off('callAnswered');
        socket.off('ICEcandidate');
        socket.off('callEnded');
      };
    }, []);
  
async function processCall() {
      // 1. Alice runs the `createOffer` method for getting SDP.
      const sessionDescription = await peerConnection.current.createOffer();
    
      // 2. Alice sets the local description using `setLocalDescription`.
      await peerConnection.current.setLocalDescription(sessionDescription);
    
      // 3. Send this session description to Bob uisng socket
      sendCall({
        calleeId: otherUserId.current,
        rtcMessage: sessionDescription,
      });

      setType("Outgoing_CALL");
    }
    
    async function processAccept() {
      // 4. Bob sets the description, Alice sent him as the remote description using `setRemoteDescription()`
      peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(remoteRTCMessage.current)
      );
    
      // 5. Bob runs the `createAnswer` method
      const sessionDescription = await peerConnection.current.createAnswer();
      
      // 6. Bob sets that as the local description and sends it to Alice
      await peerConnection.current.setLocalDescription(sessionDescription);

      answerCall({
        callerId: otherUserId.current,
        rtcMessage: sessionDescription,
      });

      setType("WEBRTC_ROOM");
    }

    async function processEndCall() {
      // 8. When the call ends, Alice and Bob close the connection.
      peerConnection.current.close();
      setlocalStream(null);
      setRemoteStream(null);
      setType("CHAT");
    }

    async function processEnd(){
      // console.log("End Call");
      await processEndCall();
      socket.emit("endCall", {calleeId: otherUserId.current});
    }
    
    function answerCall(data) {
      socket.emit("answerCall", data);
    }
    
    function sendCall(data) {
      socket.emit("call", data);
    }

    function sendICEcandidate(data) {
      socket.emit("sendICEcandidate", data);
    }
     // Set the profile picture in the header
  useLayoutEffect(() => {
    if (profilePicture) {
      navigation.setOptions({
        headerLeft: () => setHeaderLeft(navigation, profilePicture),
        headerRight: () => setHeaderRight(otherUserId, recipientId, processCall, processAccept),
        headerTitle: recipientName,
        headerStyle: {
          backgroundColor: '#12191f', // Ensure consistent header background color
          elevation: 0, // Removes shadow on Android
          shadowOpacity: 0, // Removes shadow on iOS
          borderBottomWidth: 0, // Removes bottom border on iOS
        },
      });

    }
  }, [profilePicture]);

  switch (type) {
    case 'Outgoing_CALL':
        return <OutgoingCallScreen calleeName={recipientName} profilePicture={profilePicture} processEnd={processEnd} />;
    case 'INCOMING_CALL':
        return <IncomingCallScreen calleeName={recipientName} profilePicture={profilePicture} processAccept={processAccept} processEnd={processEnd} />; // it should be the caller name and profile picture
    case 'WEBRTC_ROOM':
        return <WebrtcRoomScreen localStream={localStream} remoteStream={remoteStream} peerConnection={peerConnection} setlocalStream={setlocalStream} setRemoteStream={setRemoteStream} setType={setType} />;
    case 'CHAT':
        return (
    <View className="flex-1" style={{backgroundColor: '#12191f'}}>
      <ImageBackground
        source={require('../../assets/w-b-g.jpg')}
        resizeMode="cover"
        className="py-3 flex-1 justify-center">

        <MessageList 
          chat={chat}
          flatListRef={flatListRef}
          senderId={senderId}
          recipientName={recipientName}
          videoRef={videoRef}
          activeItemId={activeItemId}
          setActiveItemId={setActiveItemId}
          handleLongPressStart={handleLongPressStart}
          handleLongPressEnd={handleLongPressEnd}
          handleImagePress={handleImagePress}
          closeViewer = {closeViewer}
          handlePanelAction={handlePanelAction}
          formatTime={formatTime}
          setPanelPosition={setPanelPosition}
          setLongPressTimer={setLongPressTimer}
          panelPosition={panelPosition}
          longPressTimer={longPressTimer}
          navigation={navigation}
          viewerData={viewerData}
          setIsViewerVisible={setIsViewerVisible}
          setViewerData={setViewerData}
        />

        <MessageInput
          message={message}
          setMessage={setMessage}
          fileResponse={fileResponse}
          setFileResponse={setFileResponse}
          senderId={senderId}
          recipientId={recipientId}
          selectFile={() => selectFile(setFileResponse, setMessage)}
          sendMessage={() =>
            sendMessage(
              message,
              senderId,
              recipientId,
              setMessage,
              setFileResponse,
            )
          }
          uploadFile={() =>
            uploadFile(
              fileResponse,
              setFileResponse,
              message,
              senderId,
              recipientId,
              setMessage,
            )
          }
        />
        
      </ImageBackground>
    </View>
        );
    default:
        return null;
}
};

export default ChatScreen;
