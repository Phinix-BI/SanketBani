import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import axios from 'axios'
import { API_URL } from '@env';

import axios from 'axios';
import {baseUrl} from '../../utils';
import GradientButton from '../../components/GradientButton';
import ResetPassTextInput from '../../components/ResetPassTextInput';
import {GradientBackground} from '../../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function RegisterScreen({navigation}) {
  const [name, setName] = useState({value: '', error: ''});
  const [email, setEmail] = useState({value: '', error: ''});
  const [password, setPassword] = useState({value: '', error: ''});
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState(null);
  const [personType, setPersonType] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const handleRegister = async ({name, email, password}) => {
    if (!name || !email || !password || !gender || !dob || !personType) {
      Toast.show({
        type: 'error',
        text1: 'Invalid input',
        text2: 'Please fill in all fields',
        position: 'bottom',
        duration: 3000,
        swipeable: true,
      });
      return;
    }

    try {
     const response = await axios.post(`${API_URL}/api/v1/auth/register` ,{
        fullName : name,
        email,
        password,
        gender,
        dob,
        personType,
      });

      return response.data.statusCode;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'User registration failed',
        text2: error.response?.data?.message || 'Something went wrong!',
        position: 'bottom',
        duration: 3000,
        swipeable: true,
      });

      return false;
    }
  };

  const onSignUpPressed = async () => {
    const response = await handleRegister({
      name: name.value,
      email: email.value,
      password: password.value,
    });

    if (response === 200) {
      Toast.show({
        type: 'success',
        text1: 'User registration successful',
        text2: 'You have successfully registered!',
        position: 'bottom',
        visibilityTime: 3000,
        swipeable: true,
      });
      navigation.navigate('VerifyAccountScreen', {email: email.value});
    }
  };

  // Function to handle date change
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dob; // Use selected date or keep previous
    setShowPicker(false); // Hide the picker
    setDob(currentDate); // Set the date of birth
  };

  return (
    <View style={styles.container}>
      <GradientBackground />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.replace('LoginScreen')}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Text style={styles.whiteText}>Create </Text>
          <Text style={styles.yellowText}>Account</Text>
        </View>

        <Text style={styles.subHeaderText}>We're excited to have you 💛</Text>

        <View style={styles.content}>
          <ResetPassTextInput
            label="Full Name"
            value={name.value}
            onChangeText={text => setName({value: text, error: ''})}
            error={!!name.error}
            errorText={name.error}
          />
          <ResetPassTextInput
            label="E-mail address"
            value={email.value}
            onChangeText={text => setEmail({value: text, error: ''})}
            error={!!email.error}
            errorText={email.error}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <ResetPassTextInput
            label="Password"
            value={password.value}
            onChangeText={text => setPassword({value: text, error: ''})}
            error={!!password.error}
            errorText={password.error}
            secureTextEntry
            style={styles.passfield}
          />

          {/* Gender Selection */}
          <Text style={styles.label}>Gender</Text>
          <View style={styles.selectionContainer}>
            <TouchableOpacity
              style={[
                styles.selectionButton,
                gender === 'Male' && styles.selectedOption,
              ]}
              onPress={() => setGender('Male')}>
              <Text
                style={[
                  styles.selectionText,
                  gender === 'Male' && styles.selectedText,
                ]}>
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.selectionButton,
                gender === 'Female' && styles.selectedOption,
              ]}
              onPress={() => setGender('Female')}>
              <Text
                style={[
                  styles.selectionText,
                  gender === 'Female' && styles.selectedText,
                ]}>
                Female
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date of Birth Selection */}
          {/* Date of Birth Selection */}
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity
            style={[styles.dateInput, dob && styles.selectedOption]}
            onPress={() => setShowPicker(true)} // Show the date picker
          >
            <View style={styles.dateInputContainer}>
              <Text style={[styles.dateText, dob && styles.selectedText]}>
                {dob ? dob.toDateString() : 'Select Date'}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={24}
                color="#808080"
                style={styles.calendarIcon}
              />
            </View>
          </TouchableOpacity>

          {/* DateTimePicker Component */}
          {showPicker && (
            <DateTimePicker
              value={dob ? dob : new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          {/* Person Type Selection */}
          <Text style={styles.label}>Person Type</Text>
          <View style={styles.selectionContainer}>
            <TouchableOpacity
              style={[
                styles.selectionButton,
                personType === 'Hearing' && styles.selectedOption,
              ]}
              onPress={() => setPersonType('Hearing')}>
              <Text
                style={[
                  styles.selectionText,
                  personType === 'Hearing' && styles.selectedText,
                ]}>
                Hearing
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.selectionButton,
                personType === 'Deaf' && styles.selectedOption,
              ]}
              onPress={() => setPersonType('Deaf')}>
              <Text
                style={[
                  styles.selectionText,
                  personType === 'Deaf' && styles.selectedText,
                ]}>
                Deaf
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Button at the Bottom */}
      <View style={styles.buttonContainer}>
        <GradientButton
          onPress={onSignUpPressed}
          text="Continue"
          style={styles.button}
        />

        <View style={styles.row}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace('LoginScreen')}>
            <Text style={styles.link}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  backButton: {
    position: 'absolute',
    top: 45,
    left: 20,
    zIndex: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    marginTop: 80,
    marginBottom: 5,
    paddingHorizontal: 20,
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
  subHeaderText: {
    color: '#fff',
    fontSize: 13,
    marginTop: -2,
    marginLeft: 24,
    marginBottom: 10,
    textAlign: 'left',
  },
  passfield: {
    marginBottom: 10,
  },
  content: {
    paddingHorizontal: 20,
  },
  label: {
    fontWeight: 'bold',
    color: '#F6F3E7',
    fontSize: 15,
    marginBottom: 5,
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  selectionButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#808080',
    borderRadius: 2,
    marginHorizontal: 5,
  },
  selectedOption: {
    borderColor: '#FFE70A',
  },
  selectionText: {
    color: '#808080',
    fontWeight: '600',
  },
  selectedText: {
    color: '#FFE70A',
  },
  dateInput: {
    padding: 15,
    borderColor: '#808080',
    borderWidth: 1,
    borderRadius: 2,
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontWeight: '600',
    color: '#808080',
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  calendarIcon: {
    marginLeft: 10, // Add spacing between text and icon
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  button: {
    height: 50,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerText: {
    color: '#808080',
    marginBottom: 3,
  },
  link: {
    fontWeight: 'bold',
    color: '#FFE70A',
    marginBottom: 3,
  },
});
