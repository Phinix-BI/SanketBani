import React, { useState } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { emailValidator } from '../../helpers/emailValidator';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { API_URL } from '@env';
import GradientResetPassButton from '../../components/GradientResetPassButton'; 
import ResetPassTextInput from '../../components/ResetPassTextInput';
import { GradientBackground, GradientButton } from '../../components';

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState({ value: '', error: '' });
  const [loading, setLoading] = useState(false);

  const handleOtpSent = async ({ email }) => {
    if (!email) {
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
      const response = await axios.post(`${API_URL}/api/v1/auth/sentotp`, {
        email,
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
    const emailError = emailValidator(email.value);
    if (emailError) {
      setEmail({ ...email, error: emailError });
      return;
    }

    setLoading(true);
    const response = await handleOtpSent({ email: email.value });
    setLoading(false);

    if (response === 200) {
      Toast.show({
        type: 'success',
        text1: 'Email sent',
        text2: 'Please check your inbox',
        position: 'bottom',
        visibilityTime: 1000,
        swipeable: true,
        onHide: () => navigation.navigate('EnterOtpScreen', { email: email.value }),
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Email not sent',
        text2: 'Please try again',
        position: 'bottom',
        visibilityTime: 3000,
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
        <Text style={styles.whiteText}>Restore </Text>
        <Text style={styles.yellowText}>Password</Text>
      </View>

      {/* Informative text */}
      <Text style={styles.infoText}>
        Please ensure that the Email ID provided is correct to receive the OTP.
      </Text>

      {/* Email input field */}
      <ResetPassTextInput
        label="E-mail address"
        returnKeyType="done"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        style={styles.textInput}
      />

      {/* Informative text */}
      <Text style={styles.notifyinfoText}>
        You will receive an email with a password reset code.
      </Text>

      {/* Reset button and footer */}
      <View style={styles.footerContainer}>
        <GradientResetPassButton onPress={sendResetPasswordEmail} loading={loading} style={styles.button} />
        <Text style={styles.footerText}>
          If you encounter any issues, kindly check your network connection or contact support for&nbsp;
          <Text style={styles.assistanceText}>assistance.</Text>
        </Text>
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
    color: '#fff',
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginLeft: 2,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 30, // Positions the container above the screen bottom
    left: 20,
    right: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    margin: 7,
  },
  assistanceText: {
    color: '#FFE70A', 
    textDecorationLine: 'underline', 
  },
});
