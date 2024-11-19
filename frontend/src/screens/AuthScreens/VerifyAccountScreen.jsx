import React, { useState, useContext } from 'react'
import {Background, BackButton, Logo, Header, TextInput, Button} from '../../components'
import Toast from 'react-native-toast-message';
import axios from 'axios'
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { UserContext } from '../../context/UserContext'

export default function VerifyAccountScreen({ navigation, route }) {
    const [otp, setOtp] = useState({ value: '', error: '' });
    const { email } = route.params;
    const { setUserEmail } = useContext(UserContext);

    const handleAccountVerification = async ({email , otp}) => {
        // Validate input
        if (!otp) {
            Toast.show({
            type: 'error',
            text1: 'Invalid input',
            text2: 'Please fill in all fields',
            position: 'bottom',
            visibilityTime: 2000,
            swipeable: true,
            });
            return;
        }
        
        try {
    
            const response = await axios.post(`${API_URL}/api/v1/auth/verifyemail`, {
                email,otp
            });
            
            return response.data;
    
        } catch (error) {
         
            console.error('Account Verification Error:', error.message); // Improved error logging
             console.log(error);
            
            Toast.show({
            type: 'error',
            text1: 'Account verification failed',
            text2: error.response?.data?.message || 'Something went wrong!', // Show error details
            position: 'bottom',
            visibilityTime: 3000,
            swipeable: true,
            });
        
            return error.response?.data;
        };

    }

    const onVerifyPressed = async () => {
        const response = await handleAccountVerification({ email: email, otp: otp.value });
        if (response.statusCode === 200) {
            await AsyncStorage.setItem('token' , response.data);
            setUserEmail(email);
            Toast.show({
                type: 'success',
                text1: 'Account verified successfully',
                position: 'bottom',
                visibilityTime: 1000,
                swipeable: true,
                onHide: () => { navigation.reset({
                    index: 0,
                    routes: [{ name: 'Tabs' }]
                }) }
            });
            
            
         
        }else{
            Toast.show({
                type: 'error',
                text1: 'Account verification failed',
                position: 'bottom',
                visibilityTime: 2000,
                swipeable: true,
            });
        }
    }

  return (
    <Background>
        <BackButton goBack={navigation.goBack} />
        <Logo />
        <Header>Account Verification</Header>
        <TextInput
          label="OTP Code"
          returnKeyType="done"
          value={otp.value}
          onChangeText={(text) => setOtp({ value: text, error: '' })}
          error={!!otp.error}
          errorText={otp.error}
          autoCapitalize="none"
          description="You have received OTP code in your email."
        />
      
        <Button
          mode="contained"
          onPress={onVerifyPressed}
          style={{ marginTop: 16 }}
        >
          Verify Account
        </Button>
      </Background>
  )
}
