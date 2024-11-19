import React from 'react'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import Paragraph from '../components/Paragraph'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'

export default function StartScreen({ navigation }) {
  return (
    <>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <WebView
        originWhitelist={['*']}
        source={{html: '<h1>Hello World </h1>'}} // Replace with your deployed app URL
        javaScriptEnabled={true}
        onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.warn('WebView error: ', nativeEvent);
        }}
        style={{ flex: 1 }}
      />
      </View>
    </>
  )
}
