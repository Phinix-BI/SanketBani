import React, { useState, useRef, Suspense } from 'react';
import {
  View,
  Image,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,StyleSheet,
  StatusBar,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { suggestions } from '../utils/index.js';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei/native'
import useControls from 'r3f-native-orbitcontrols';
import Character from '../components/Charecter.jsx';
import axios from 'axios';
import {API_URL} from '@env';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const EngToSign = ({ navigation }) => {
  const [translationText, setTranslationText] = useState('');
  const [OrbitControls, events] = useControls();
  const [isFile, setIsFile] = useState(false);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [sequence, setSequence] = useState([]);
  const [playAnimation, setPlayAnimation] = useState(false);

  const audioRecorderPlayer = new AudioRecorderPlayer();

  const startRecording = async () => {
    console.log('Recording started');
      try{
        const filePath = `${RNFS.CachesDirectoryPath}/voiceMessage.m4a`;
        const result = await audioRecorderPlayer.startRecorder(filePath);
        console.log('Recording started. File path: ', result);
        setFile(result);
        setIsFile(true);
        setIsRecording(true);
        audioRecorderPlayer.addRecordBackListener((e) => {
          setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
          return;
        });
      }catch(error){
        console.error('Error starting recording: ', error);
      }
  };

  const cancelRecording = async () => {
    try{
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      console.log('Recording stopped. File path: ', result);
      setIsRecording(false);
      setFile(null);
      setIsFile(false);
      setRecordTime('00:00');
      console.log('Recording cancelled');
    }catch(error){
      console.error('Error cancelling recording: ', error);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setRecordTime('00:00');
      setIsFile(false);
      console.log('Recording stopped. File path: ', result);
      await uploadVoiceMessage();
      console.log('Recording stopped. Uploading file: ', file);
    }catch(error){
      console.log('Error stopping recording: ', error);
    }
  };

  const uploadVoiceMessage = async () => {
    try{
      const formData = new FormData();
      formData.append('file', {
        uri: file,
        type: 'audio/mp3',
        name: 'voiceMessage.mp3',
      });

      const response = await axios.post(`${API_URL}/api/v1/animation/generate/sequence/isl`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': await AsyncStorage.getItem('token'),
        },
      });

      setFile(null);
      setIsFile(false);

      console.log(response.data);
    }catch(error){
      console.error('Error uploading voice message: ', error);
    }
  };

  const handleTextChange = text => {
    setTranslationText(text);
    // If the text input is cleared, reset the file-related states
    if (text === '') {
      setFile(null);
      setIsFile(false);
    }
  };

  const openCamera = () => {
    Keyboard.dismiss();
    launchCamera(
      {
        mediaType: 'photo',
        saveToPhotos: false, // Save to gallery (optional)
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else {
          // Use the captured image
          setTranslationText(response.assets[0].uri);
          setFile(response.assets[0]);
          setIsFile(true);
          console.log(response.assets[0].uri);
        }
      },
    );
  };

  const chooseFromGallery = () => {
    Keyboard.dismiss();
    launchImageLibrary(
      {
        mediaType: 'photo',
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else {
          // Use the selected image
          setTranslationText(response.assets[0].uri);
          setFile(response.assets[0]);
          setIsFile(true);
          console.log(isFile);
          console.log(response.assets[0].uri);
        }
      },
    );
  };

  const handleTranslate = async () => {

    Keyboard.dismiss();

    let response;

    try {
      setIsLoading(true);
      setTranslationText('');
      setFile(null);
      setIsFile(false);

      if (!isFile) {

      response = await axios.post(  // handel for text translation
        `${API_URL}/api/v1/animation/generate/sequence/isl`,
        {
          text: translationText,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': await AsyncStorage.getItem('token')
          },
        }
      );

    } else {

      const formData = new FormData();

      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.fileName,
      }); // Append the file to the form data

      response = await axios.post(  // handel for file translation
        `${API_URL}/api/v1/animation/generate/sequence/isl`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': await AsyncStorage.getItem('token'),
          },
        }
      );
    }

      console.log(response.data);
      setSequence(response.data);

      setIsLoading(false);
      
    } catch (err) {
      console.log(err);
    }
  };

  const handelFileClose = () => {
    setFile(null);
    setIsFile(false);
    setTranslationText('');
  };

  return (
    <View className="flex-1" style={{backgroundColor: '#E5E4E2'}}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <View className="mt-2  mx-2  w-full">
        <View className="h-full" {...events}>
          <Canvas
            onCreated={state => {
              const _gl = state.gl.getContext();

              // Override pixelStorei to handle unsupported parameters in expo-gl
              const originalPixelStorei = _gl.pixelStorei.bind(_gl);
              _gl.pixelStorei = function (parameter, value) {
                if (parameter === _gl.UNPACK_FLIP_Y_WEBGL) {
                  return originalPixelStorei(parameter, value);
                }
                // Ignore unsupported parameters to avoid the warning
              };
            }} shadowMap>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              maxPolarAngle={Math.PI / 2} // Limit the vertical angle to lock the model vertically
              minPolarAngle={Math.PI / 2}
            />
            <Suspense fallback={null}>
              <ambientLight intensity={2} />
              <Character sequence={sequence}/>
            </Suspense>
          </Canvas>
        </View>

        <View className="absolute bottom-[140] right-3">
          <MaterialIcons
            name="swap-vert"
            size={50}
            color="white"
            onPress={() => navigation.navigate('SignToText')}
          />
        </View>
      </View>

      <View className="bg-[#000000] py-3 absolute bottom-0 opacity-90 ">
        <ScrollView horizontal className="flex-row gap-2 mx-9">
          {suggestions.map(message => (
            <TouchableOpacity
              key={message.id}
              onPress={() => console.log('Handle model animation')}>
              <View>
                <Text className="text-center text-[#f59e0b] border-solid rounded-md bg-[#1A2130] px-2 py-1 text-md font-semibold">
                  {message.message}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="flex mx-7 flex-row items-center mt-2 mb-2">
          <View className="w-5/6 mx-2 border-solid border-zinc-200 border-2 rounded-md px-2">
            <TextInput
              placeholder="Type to Translate"
              value={translationText}
              onChangeText={handleTextChange}
              editable={!isLoading && !isFile ? true : false}
              placeholderTextColor="#f59e0b"
              className="pr-10 text-[#f59e0b]"
            />

            {translationText === '' && !isRecording && (
              <View className="absolute right-3 top-1/4 transform -translate-y-1/2 flex-row gap-2">
                <MaterialIcons
                  name="attach-file"
                  size={23}
                  color="#f59e0b"
                  onPress={() => chooseFromGallery()}
                />
                <FontAwesome5
                  name="camera"
                  size={23}
                  color="#f59e0b"
                  onPress={() => openCamera()}
                />
              </View>
            )}
 
            {isFile && (
              <View className="absolute right-3 top-1/4 transform -translate-y-1/2">
                <MaterialIcons
                  name="close"
                  size={20}
                  color="#f59e0b"
                  onPress={handelFileClose}
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            // onPress={() => handleTranslate()}
            className="mx-auto bg-[#f59e0b] w-10 h-10 justify-center items-center border-solid rounded-3xl">
            {translationText === '' && !isRecording ? (
              <MaterialIcons name="keyboard-voice" size={26} color="white" onPress={startRecording} />
            ) : (
              <MaterialIcons name="send" size={23} color="white" onPress={handleTranslate}/>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};


export default EngToSign;
