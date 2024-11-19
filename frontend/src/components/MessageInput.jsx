import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import axios from 'axios';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import RNFS from 'react-native-fs';

const socket = io(API_URL);

const audioRecorderPlayer = new AudioRecorderPlayer();

const MessageInput = ({
  message,
  setMessage,
  fileResponse,
  selectFile,
  sendMessage,
  uploadFile,
  senderId,
  recipientId,
}) => {

  const [recording, setRecording] = useState(false);
  const [filePath, setFilePath] = useState('');
  const [recordTime, setRecordTime] = useState('00:00');
  
  // Start recording audio and save the file path
  const startRecording = async () => {
    try {
       // Set the path where you want the file to be saved with .m4a extension
      const filePath = `${RNFS.CachesDirectoryPath}/voiceMessage.m4a`;
      const result = await audioRecorderPlayer.startRecorder(filePath);
      setFilePath(result); // Save file path for upload
      setRecording(true);
      audioRecorderPlayer.addRecordBackListener((e) => {
        setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
        return;
      });
      console.log('Recording started. File path: ', result);
    } catch (error) {
      console.error('Error starting recording: ', error);
    }
  };

  // Stop recording and call upload function
  const stopRecording = async () => {
    try {
      await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setRecording(false);
      console.log('Recording stopped. Uploading file: ', filePath);
      await uploadVoiceMessage(); // Use uploadFile function for upload
    } catch (error) {
      console.error('Error stopping recording: ', error);
    }
  };

  // Cancel recording and reset the state
  const cancelRecording = async () => {
    try {
      await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setRecording(false);
      setFilePath('');
      setRecordTime('00:00');
      console.log('Recording canceled.');
    } catch (error) {
      console.error('Error canceling recording: ', error);
    }
  };  

  const uploadVoiceMessage = async () => {
    const formData = new FormData();
    formData.append('mediaUpload', {
      uri: filePath,
      name: 'audio.mp3',  // Make sure to set .m4a here
      type: 'audio/mp3',         // Correct MIME type
      resource_type: 'audio',    // Resource type for cloudinary
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
          timeout: 10000, // Increase timeout to 10 seconds
        }
      );

      const messageObject = {
        sender: senderId,
        recipient: recipientId,
        content: {
          message: '',
          mediaUrl: {
            url: response.data.data.finalResult.url,
            type: response.data.data.finalResult.resource_type,
            audio : response.data.data.finalResult.audio,
          },
        },
        timestamp: new Date(),
      };

      socket.emit('sendMessage', messageObject);
      setMessage({message: '', mediaUrl: {url: '', type: '',audio : false}});
    } catch (error) {
      console.log('Error uploading file:', error);
    }
  };

  
  return (
    <View className="flex-row items-center mt-4 px-3">
      <View className="flex-row flex-1 relative">
        {recording ? (
          <Text
            className="flex-1 py-2 px-4 text-slate-300 rounded-3xl"
            style={{ backgroundColor: '#1f2c34' }}>
            {recordTime}  {/* Show recording timer */}
          </Text>
        ) : (
          fileResponse ? (
            <Text
              className="flex-1 py-2 px-4 text-slate-300 rounded-3xl"
              style={{ backgroundColor: '#1f2c34' }}>
              {fileResponse.name}
            </Text>
          ) : (
            <TextInput
              value={message.message}
              onChangeText={(text) => setMessage({ ...message, message: text })}
              placeholder="Type a message..."
              placeholderTextColor={'#a3a3a3'}
              cursorColor={'white'}
              className="flex-1 py-2 px-4 text-slate-300 rounded-3xl"
              style={{
                backgroundColor: '#1f2c34',
                textAlignVertical: 'center',
                minHeight: 40,
              }}
              multiline={true}
            />
          )
        )}

        {message.message === '' && !recording && (
          <>
            <TouchableOpacity
              onPress={selectFile}
              style={{
                position: 'absolute',
                right: 48,
                top: '50%',
                transform: [{ translateY: -12 }],
              }}>
              <MaterialIcons name="attach-file" size={23} color={'white'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={selectFile}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: [{ translateY: -12 }],
              }}>
              <MaterialIcons name="photo-camera" size={23} color={'white'} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {recording && (
        <TouchableOpacity
          onPress={cancelRecording}  // Cancel recording
          className="ml-2 p-2 rounded-full"
          style={{ backgroundColor: '#f44336' }}>
          <MaterialIcons name="close" size={23} color={'white'} />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={recording ? stopRecording : message.message === '' ? fileResponse ? uploadFile : startRecording : sendMessage}
        className="ml-2 p-2 rounded-full"
        style={{ backgroundColor: '#21c063' }}>
        <MaterialIcons
          name={recording || fileResponse ? 'send' : message.message === '' ? 'mic' : 'send'}
          size={23}
          color={'white'}
        />
      </TouchableOpacity>
    </View>
  );
};

export default MessageInput;