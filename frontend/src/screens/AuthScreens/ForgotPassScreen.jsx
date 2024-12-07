import React, { useState } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { API_URL } from '@env';
import GradientButton from '../../components/GradientButton'; 
import ResetPassTextInput from '../../components/ResetPassTextInput';
import { GradientBackground, Logo } from '../../components';

export default function ForgotPassScreen({ navigation, route }) {
  const [password, setPassword] = useState({ value: '', error: '' });
  const [confirmPassword, setConfirmPassword] = useState({ value: '', error: '' });
  const { email , otp } = route.params;
  
  const handlePasswordReset = async ({ email,otp, password, confirmPassword }) => {
    if (!password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Invalid input',
        text2: 'Please fill in all fields',
        position: 'bottom',
        visibilityTime: 3000,
        swipeable: true,
      });
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/resetpassword`, {
        email,
        otp,
        password,
        confirmPassword,
      });
      return response.data.statusCode;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Reset password failed',
        text2: error.response?.data?.message || 'Something went wrong!',
        position: 'bottom',
        visibilityTime: 3000,
        swipeable: true,
      });
      return error.response?.data;
    }
  };

  const sendResetPasswordEmail = async () => {
    const response = await handlePasswordReset({ email, otp, password: password.value, confirmPassword: confirmPassword.value });
    
    if (response === 200) {
      Toast.show({
        type: 'success',
        text1: 'Password reset',
        text2: 'Password reset successfully',
        position: 'bottom',
        visibilityTime: 1000,
        swipeable: true,
        onHide: () => navigation.navigate('LoginScreen'),
      });
    } else {
      console.log(response);
      Toast.show({
        type: 'error',
        text1: 'Password reset failed',
        text2: 'Check your password',
        position: 'bottom',
        visibilityTime: 3000,
        swipeable: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <GradientBackground/>
      
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="chevron-back-outline" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <Text style={styles.whiteText}>Reset </Text>
        <Text style={styles.yellowText}>Password </Text>
      
      </View>
     

      <ResetPassTextInput
        label="New Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
        description="Password must contain at least 8 characters"
      />

      <ResetPassTextInput
        label="Confirm Password"
        returnKeyType="done"
        value={confirmPassword.value}
        onChangeText={(text) => setConfirmPassword({ value: text, error: '' })}
        error={!!confirmPassword.error}
        errorText={confirmPassword.error}
        secureTextEntry
        description="Please confirm your new password"
      />

      <View style={styles.footerContainer}>
        <GradientButton onPress={sendResetPasswordEmail} 
        text = "Change Password"
        style={styles.button} />
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
    left: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    marginTop: 54,
    marginBottom: 10,
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
  footerContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
});

