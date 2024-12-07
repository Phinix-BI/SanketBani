import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { API_URL } from '@env';
import GradientButton from '../../components/GradientButton';
import { GradientBackground } from '../../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../../context/UserContext';

export default function VerifyAccountScreen({ navigation, route }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6-digit OTP
  const inputRefs = useRef([]);
  const [timer, setTimer] = useState(59); // Timer starts at 59 sec
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [canResend, setCanResend] = useState(false);
  const { email } = route.params;
  const { setUserEmail } = useContext(UserContext);

  useEffect(() => {
    let interval = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const handleChangeText = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    } else if (!text && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleKeyPress = (key, index) => {
    if (key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleAccountVerification = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Please enter the complete OTP',
        position: 'bottom',
        visibilityTime: 3000,
        swipeable: true,
      });
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/verifyemail`, {
        email,
        otp: otpString,
      });

      if (response.data.statusCode === 200) {
        await AsyncStorage.setItem('token', response.data.data);
        setUserEmail(email);
        Toast.show({
          type: 'success',
          text1: 'Account verified successfully',
          position: 'bottom',
          visibilityTime: 1000,
          swipeable: true,
          onHide: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Tabs' }],
            }),
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Account verification failed',
          text2: 'Please try again',
          position: 'bottom',
          visibilityTime: 3000,
          swipeable: true,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Something went wrong!',
        position: 'bottom',
        visibilityTime: 3000,
        swipeable: true,
      });
    }
  };

  const handleResendOTP = () => {
    if (canResend) {
      console.log('Resend OTP');
      setTimer(59);
      setIsTimerActive(true);
      setCanResend(false);

      Toast.show({
        type: 'success',
        text1: 'OTP Resent',
        text2: 'Please check your email for the new OTP.',
        position: 'bottom',
        visibilityTime: 3000,
        swipeable: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <GradientBackground />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back-outline" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <Text style={styles.whiteText}>OTP</Text>
        <Text style={styles.yellowText}>Verification</Text>
      </View>

      <Text style={styles.infoText}>Please enter the OTP code entered correctly.</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            value={digit}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            ref={(ref) => (inputRefs.current[index] = ref)} // Store refs
            style={styles.otpInput}
            maxLength={1}
            keyboardType="numeric"
            selectionColor="#fff"
            blurOnSubmit={false} // Prevent losing focus after entering a digit
          />
        ))}
      </View>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>
          Haven't received the OTP?{' '}
          <Text
            style={[styles.sendOtp, { color: canResend ? 'grey' : 'lightgrey' }]}
            onPress={handleResendOTP}
          >
            Send OTP
          </Text>
        </Text>
        <Text style={styles.timerText}>{`00:${timer < 10 ? `0${timer}` : timer}`}</Text>
      </View>

      <View style={styles.footerContainer}>
        <GradientButton onPress={handleAccountVerification} text="Verify OTP" />
      </View>
    </View>
  );
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
    left: 20,
    zIndex: 1,
  },
  headerContainer: {
    flexDirection: 'column',
    marginTop: 54,
    marginBottom: 8,
  },
  whiteText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  yellowText: {
    color: '#FFE70A',
    fontSize: 36,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 15,
    color: '#fff',
    marginVertical: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  resendText: {
    color: '#fff',
    fontSize: 14,
  },
  sendOtp: {
    textDecorationLine: 'underline',
  },
  timerText: {
    color: '#FFE70A',
    fontSize: 14,
  },
});

