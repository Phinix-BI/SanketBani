import axios from 'axios';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import DocumentPicker from 'react-native-document-picker';
import { act } from 'react';

const socket = io(API_URL);

export const selectFile = async (setFileResponse, setMessage) => {
  try {
    const res = await DocumentPicker.pick({
      type: [DocumentPicker.types.images, DocumentPicker.types.video],
    });
    setFileResponse(res[0]);
    setMessage({ message: '', mediaUrl: { type: res[0].type, url: '' } });
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      console.log('Canceled file picker');
    } else {
      console.error('Unknown error:', err);
    }
  }
};


export const sendMessage = async (message, senderId, recipientId, setMessage , setFileResponse) => {
    if (message.message.trim() === '' && message.mediaUrl.url.trim() === '')
      return;
    if (!senderId || !recipientId) return;

    const messageObject = {
      sender: senderId,
      recipient: recipientId,
      content: message,
      timestamp: new Date(),
    };

    socket.emit('sendMessage', messageObject);

    setMessage({message: '', mediaUrl: {url: '', type: ''}});
    setFileResponse(null);
  };


 export const uploadFile = async (fileResponse, setFileResponse, message, senderId, recipientId , setMessage) => {
    if (!fileResponse) return;

    const formData = new FormData();
    formData.append('mediaUpload', {
      uri: fileResponse.uri,
      type: fileResponse.type,
      name: fileResponse.name,
    });

    try {
      const response = await axios.post(
        `${API_URL}/api/v1/sender/upload-media`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': await AsyncStorage.getItem('token'),
          },
        },
      );

      const messageObject = {
        sender: senderId,
        recipient: recipientId,
        content: {
          message: '',
          mediaUrl: {
            url: response.data.data.finalResult.url,
            type: response.data.data.finalResult.resource_type,
          },
        },
        timestamp: new Date(),
      };

      socket.emit('sendMessage', messageObject);
      setMessage({message: '', mediaUrl: {url: '', type: ''}});
      setFileResponse(null);
    } catch (error) {
      console.log('Error uploading file:', error);
    }
  };

 export const fetchUserIds = async (sender, recipient, setSenderId, setRecipientId, setProfilePicture, setChat) => {
    try {
      // Fetch the sender's user ID
      const senderResponse = await axios.get(`${API_URL}/api/v1/auth/getUserId/${sender}`);
      const senderId = senderResponse.data.data.id;
      setSenderId(senderId);
  
      // Fetch the recipient's user ID
      const recipientResponse = await axios.get(`${API_URL}/api/v1/auth/getUserId/${recipient}`);
      const recipientId = recipientResponse.data.data.id;
      setRecipientId(recipientId);
  
      // Fetch the recipient's profile picture
      const recipientProfileResponse = await axios.get(
        `${API_URL}/api/v1/user/getProfilePicture/${recipientId}`,
        {
          headers: {
            'x-auth-token': await AsyncStorage.getItem('token'),
          },
        },
      );
      setProfilePicture(recipientProfileResponse.data.data);
  
      // Fetch the chat messages
      try {
        const messagesResponse = await axios.get(
          `${API_URL}/api/v1/chat/messages/${senderId}/${recipientId}`,
        );
        const messages = messagesResponse.data.data.messages;
        setChat(messages.length !== 0 ? messages : []);
      } catch (messageError) {
        console.error('Error fetching messages:', messageError);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setChat([]);
      }
      console.error('Error fetching user IDs:', error);
    }
  };
 export const formatTime = timestamp => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  };

  export const handleImagePress = ({ imageUrl = '', videoUrl = '', senderName, type , navigation , audio = false}) => {
    navigation.navigate('ImageViewer', {
      imageUrl: imageUrl || null,  // Pass null if no imageUrl is provided
      videoUrl: videoUrl || null,  // Pass null if no videoUrl is provided
      senderName,
      type,
      audio 
    });
  };

  export const handleLongPressStart = (event, item , setPanelPosition , setActiveItemId , setLongPressTimer) => {
    const {pageX, pageY} = event.nativeEvent;
    const timer = setTimeout(() => {
      console.log('Long press started');
      setPanelPosition({x: pageX, y: pageY});
      setActiveItemId(item._id); // Set the active item
    }, 1000);

    setLongPressTimer(timer);
  };

  export const handleLongPressEnd = (longPressTimer) => {
    clearTimeout(longPressTimer);
  };

  export const handlePanelAction = (action,setActiveItemId,senderId,message, mediaUrl) => {
    if (action === 'close') {
      setActiveItemId(null); // Reset the active item
      return;
    }
    
    const messageObject = {
      userId: senderId,
      message: message ? message : null,
      mediaUrl : {
        url : mediaUrl.url ? mediaUrl.url : null,
        type : mediaUrl.type === 'image' ? 'image' : mediaUrl.audio ? 'audio' : 'video'
      },
      selectedService : action,
    };

    socket.emit('useService', messageObject);
    
    console.log('Panel action:', action);

    setActiveItemId(null); // Reset the active item
  };


