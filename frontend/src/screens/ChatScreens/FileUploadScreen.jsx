import React, { useState } from 'react';
import { View, Button } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

const audioRecorderPlayer = new AudioRecorderPlayer();

const FileUploadScreen = () => {
  const [recording, setRecording] = useState(false);
  const [filePath, setFilePath] = useState('');

  // Start recording audio and save the file path
  const startRecording = async () => {
    try {
      const result = await audioRecorderPlayer.startRecorder();
      setFilePath(result);  // Save the file path here
      setRecording(true);
      console.log('Recording started. File path: ', result);
    } catch (error) {
      console.error('Error starting recording: ', error);
    }
  };

  // Stop recording and then upload the audio file
  const stopRecording = async () => {
    try {
      await audioRecorderPlayer.stopRecorder();
      setRecording(false);
      console.log('Recording stopped. Uploading file: ', filePath);
      uploadVoiceMessage(filePath);  // Use file path to upload
    } catch (error) {
      console.error('Error stopping recording: ', error);
    }
  };

  // Function to upload voice message to the backend
  const uploadVoiceMessage = async (fileUri) => {
    const formData = new FormData();
    formData.append('mediaUpload', {
      uri: fileUri,  // Use the file path from startRecorder()
      name: 'voiceMessage.mp3',  // Name of the file
      type: 'audio/mp3',  // MIME type
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
      console.log('Upload successful', response.data);
    } catch (error) {
      console.error('Upload failed', error);
    }
  };

  return (
    <View>
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />
    </View>
  );
};

export default FileUploadScreen;
