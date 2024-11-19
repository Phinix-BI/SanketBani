import React, { useState, useContext } from 'react'
import { TouchableOpacity, StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import {Background , Logo, Header, Button, TextInput , LoginIcons} from '../../components'
import { theme } from '../../core/theme'
import { emailValidator } from '../../helpers/emailValidator'
import { passwordValidator } from '../../helpers/passwordValidator'
import Toast from 'react-native-toast-message';
import axios from 'axios'
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../../context/UserContext'; // Import UserContext
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

GoogleSignin.configure({
  webClientId: '13700200648-nrcmepkts63h3r4teapaoco467vppvgh.apps.googleusercontent.com', 
  scopes: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'], 
  offlineAccess: true,
  forceCodeForRefreshToken: true,

});

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })
  const {setUserEmail} = useContext(UserContext);

  const handleLogin = async ({ email, password }) => {
    // Validate input
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Invalid input',
        text2: 'Please fill in all fields',
        position: 'bottom',
        visibilityTime: 1000,
        swipeable: true,
      });
      return;
    }
  
    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
        email,
        password,
      });
      
      return response.data;

    } catch (error) {
      console.error('Login Error:', error.message); // Improved error logging
      console.log(error);
      
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: error.response?.data?.message || 'Something went wrong!', // Show error details
        position: 'bottom',
        duration: 3000,
        swipeable: true,
      });
  
      return error.response?.data;
  };
}

  const onLoginPressed = async() => {
    const emailError = emailValidator(email.value)
    const passwordError = passwordValidator(password.value)
    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError })
      setPassword({ ...password, error: passwordError })
      return
    }
    const response = await handleLogin({ email: email.value, password: password.value });
    console.log(response);

    if (response.statusCode == "200") {
      await AsyncStorage.setItem('token', response.data);
      setUserEmail(email.value);
      Toast.show({
        type: 'success',
        text1: 'User Login successful',
        text2: 'You have successfully logged in',
        position: 'bottom',
        visibilityTime: 1000,
        swipeable: true,
        onHide: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Tabs' }],
          });
        },
      });
  }
}

const GoogleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();

    const userInfo = await GoogleSignin.signIn();

    if (!userInfo) {
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: 'Google authentication failed!', // Show error details
        position: 'bottom',
        duration: 3000,
        swipeable: true,
      });

      return;
    }

    const response = await axios.post(`${API_URL}/api/v1/auth/googleauth`, {
      userInfo
    });
    console.log(response.status);
    if (!response || response.status !== 200) {
      
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: 'Google authentication failed due to server!', // Show error details
        position: 'bottom',
        duration: 3000,
        swipeable: true,
      });

      return;
    }

    if(response.status === 200) {
     
      await AsyncStorage.setItem('token', response.data.data);
      
      setUserEmail(userInfo.data.user.email);
      Toast.show({
        type: 'success',
        text1: 'User Login successful',
        text2: 'You have successfully logged in',
        position: 'bottom',
        visibilityTime: 1000,
        swipeable: true,
        onHide: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Tabs' }],
          });
        },
      });
    
    }

  } catch (error) {
    console.error(error);
    Toast.show({
      type: 'error',
      text1: 'Login failed',
      text2: error.response?.data?.message || 'Something went wrong!', // Show error details
      position: 'bottom',
      duration: 3000,
      swipeable: true,
    });
  }
};

  return (
    <Background>
      <Logo />
      <Header>Welcome back.</Header>
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <View style={styles.forgotPassword}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ResetPasswordScreen')}
        >
          <Text style={styles.forgot}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
      <Button mode="contained" onPress={onLoginPressed}>
        Login
      </Button>
      {/* <LoginIcons /> */}
      <View style={styles.row}>
        <Text>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('RegisterScreen')}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={GoogleSignIn}>
          <MaterialIcons name="sports-esports" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </Background>
  )
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});
