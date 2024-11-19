import { Canvas } from '@react-three/fiber'
import React, { Suspense , useEffect } from 'react'
import { TouchableOpacity, View , Text } from 'react-native'
import { WebView } from 'react-native-webview'
import Character from '../components/Charecter'
import useControls from 'r3f-native-orbitcontrols'
import {io} from 'socket.io-client'
import {API_URL} from '@env'


const socket = io(API_URL);


export default function Testing() {

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  });

  const handelClick = () => {
    console.log('Clicked');
    socket.emit('realTimeVideoFromFrontend', { message: 'Hello from the client!' });

    socket.on('realTimeVideoFromBackend', (data) => {
      console.log('Data from the server:', data);
    });
  }
  
  return (
    <>
      
      <View>
      <TouchableOpacity onPress={handelClick}>
        <View style={{padding:10 , color:'white'}} className="mt-20 mx-10 text-center text-white">
          <Text>Click me</Text>
        </View>
      </TouchableOpacity>
      </View>
     
    </>
  )
}
