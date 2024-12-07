import React, { useState, useContext } from 'react'
import { TouchableOpacity, StyleSheet, View , KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard,} from 'react-native'
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
import GradientResetPassButton from '../../components/GradientResetPassButton'; 
import ResetPassTextInput from '../../components/ResetPassTextInput';
import { GradientBackground, GradientButton } from '../../components';
import Icon from 'react-native-vector-icons/Ionicons';


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
  const [loading, setLoading] = useState(false);

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
    
    <View style={styles.container}>
      {/* Top gradient for the status bar */}
      <GradientBackground/>
    
      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="chevron-back-outline" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Header text */}
      <View style={styles.headerContainer}>
        <Text style={styles.whiteText}>Sign In</Text>
        <View className="flex-row gap-3">
            <Text style={styles.whiteText}>to</Text>
            <Text style={styles.yellowText}>Sanket Bani</Text>
        </View>
        
      </View>


      {/* Email input field */}
      <ResetPassTextInput
        label="E-mail address"
        returnKeyType="done"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoLowerCase={true}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        style={styles.textInput}
      />

      <ResetPassTextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        autoCapitalize="none"
        autoCompleteType="password"
        textContentType="password"
        keyboardType="default"
        secureTextEntry
        style={styles.textInput}

      />

      {/* Informative text */}
      <Text onPress={()=> navigation.navigate('ResetPasswordScreen')} style={styles.notifyinfoText}>
        Forgot Password?
      </Text>
      
      {/* Reset button and footer */}
      <View className="mt-12">
        <View className="mb-2 h-[70]">

        <GradientButton onPress={onLoginPressed} text="Countinue"  />
        </View>
        <Text style={styles.footerText1} > OR </Text>
        <View className="mt-2 h-[70]"> 
          <GradientButton onPress={GoogleSignIn} text="Continue With Google" />
        </View>
        <Text style={styles.footerText1}>
        Don’t have an account?&nbsp;
          <Text style={styles.link1} onPress={() => navigation.replace('RegisterScreen')}>Sign up</Text>
        </Text>
      </View>
    </View>
  
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-start',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
  },
  headerContainer: {
    
    marginTop: 54,
    marginBottom: 10,
  },
  whiteText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  yellowText: {
    color: '#FFE70A',
    fontSize: 48,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#000',
    width: '100%',
    marginBottom: -6,
  },
  infoText: {
    fontSize: 15,
    color: '#fff',
    alignSelf: 'flex-start',
    paddingRight: 66,
    marginBottom: 15,
  },
  notifyinfoText: {
    fontSize: 12,
    color: '#E5E4E2',
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginRight: 5,
  },
  footerContainer: {
    
  },
  footerText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    margin: 7,
  },
  assistanceText: {
    color: '#FFE70A', 
  },
  footerText1: {
    color: '#808080',
    marginVertical : 3,
    textAlign: 'center',
  },
  link1: {
    fontWeight: 'bold',
    color: '#FFE70A',
    marginBottom: 3,
  },
  button: {
    height: 50,
    width: '100%',
  },
});
