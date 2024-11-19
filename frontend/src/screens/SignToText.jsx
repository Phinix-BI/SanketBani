import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StatusBar, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import BackButton from '../components/BackButton';
import { API_URL } from '@env';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {io} from 'socket.io-client';
import ImageResizer from 'react-native-image-resizer';


const socket = io(API_URL);


export default function SignToText({ navigation }) {
  const [cameraDevice, setCameraDevice] = useState('front');
  const device = useCameraDevice(cameraDevice);
  const camera = useRef(null);
  const [imageData, setImageData] = useState('');
  const [takePhotoClicked, setTakePhotoClicked] = useState(false);
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [apiResponse, setApiResponse] = useState(null); // State to handle API response
  const [predictedData, setPredictedData] = useState("");

  useEffect(() => {
    checkPermission();

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    
    return () => {
      // This will run when navigating away or unmounting the component
      stopCamera();
      socket.disconnect();
    };
  }, []);

  const checkPermission = async () => {
    const newCameraPermission = await Camera.requestCameraPermission();
    console.log('Camera permission: ', newCameraPermission);
  };

  const stopCamera = () => {
    if (camera.current) {
      camera.current.stopRecording();  // Stop any ongoing recording
      camera.current = null;           // Clear the camera reference
      setImageData('');                // Reset image data if any
    }
  };

  const takePicture = async () => {
    if (camera.current == null) return;
    
    const image = await camera.current.takePhoto();
    setImageData(image.path);
    setTakePhotoClicked(true);
    sendImageToBackend(image.path);
  };


  // const frameProcessor = useFrameProcessor((frame) => {
  //   // Convert frame to JPEG or WebP here
  //   console.log('Frame captured:', frame);
  //   // const compressedImage = convertFrameToCompressedFormat(frame.path, ' JPEG'); // Assume this function handles conversion

  //   // if(compressedImage){
  //     socket.emit("realTimeVideoFromFrontend", frame);
  //   // }

  // }, []);

  // const convertFrameToCompressedFormat = async(frameUri, format = 'JPEG') => {
  //   // Convert the frame to the desired format (JPEG or WebP)
  //   // Return the compressed image data
  //   try {
  //     // Adjust width and height according to your requirements
  //     const quality = 70; // JPEG quality percentage (0-100)
  
  //     // Compress the frame to the specified format (JPEG) with the desired width, height, and quality
  //     const compressedFrame = await ImageResizer.createResizedImage(
  //       frameUri,    // URI of the frame to be compressed
  //       format,      // Format, e.g., 'JPEG' or 'PNG'
  //       quality      // Quality (for JPEG only; ignored for PNG)
  //     );
  
  //     // compressedFrame.uri is the URI of the compressed image
  //     return compressedFrame.uri;  // Return the compressed frame URI for transmission
  
  //   } catch (error) {
  //     console.error("Error compressing frame:", error);
  //     return null;
  //   }
  // };

  const sendImageToBackend = async (imagePath) => {
    setLoading(true); // Show loading indicator
    const formData = new FormData();
    formData.append('aiUpload', {
      uri: 'file://' + imagePath,
      type: 'image/jpeg', // Adjust type as needed
      name: 'photo.jpg',
    });

    try {
      const response = await fetch(`${API_URL}/api/v1/ai/upload/sendimageai`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        const data = await response.json(); // Parse the response JSON
        setApiResponse(data); // Save the response data
        setPredictedData(data.data.predictedData); // Save the predicted data
        console.log('Image uploaded successfully', data);
      } else {
        console.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false); // Hide loading indicator after response is received
    }
  };

  if (device == null) return <ActivityIndicator />;

  return (
    <>
      {/* <StatusBar barStyle={'light-content'} backgroundColor="transparent" translucent={true} /> */}

      <View className="flex-1 justify-center items-center bg-black">
        
          <View className="w-full h-full">
               
              <Camera
                ref={camera}
                className="w-full h-full mt-1"
                device={device}
                isActive={!imageData}
                photo
              />
              
              {/* <View className="absolute top-3 left-2  items-center">
                  <MaterialIcons name="arrow-back-ios" size={25} color="#ffffff" onPress={() => navigation.replace("EngToSign")} />
              </View> */}
                
              <View className="h-28 w-full absolute bottom-0" style={{backgroundColor:'rgba(0, 0, 0, 0.89)'}}>

                <View className="absolute bottom-8 left-5">
                  <MaterialIcons name="swap-vertical-circle" size={40} color={"white"} onPress={() => navigation.replace("EngToSign")} />
                </View>

                <View className="absolute bottom-5 left-[150]">
                  <TouchableOpacity onPress={takePicture} className="flex-1 justify-center items-center">
                    <View className="items-center my-auto">
                      {/* Outer circle */}
                      <View className="border-4 border-white bg-transparent rounded-full p-1">
                        {/* Inner circle */}
                        <View className="border-2 border-white bg-white rounded-full p-6" />
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>

                <View className="absolute bottom-9 right-5">
                  <MaterialIcons name="flip-camera-ios" size={35} color={"white"} onPress={() => cameraDevice === "front" ? setCameraDevice("back") : setCameraDevice("front")} />
                </View>

              </View>

          </View>
       
      </View>
    </>
  );
}
