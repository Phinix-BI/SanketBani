import React, { useState, useContext } from 'react';
import { View, TextInput, Text, ActivityIndicator, TouchableOpacity, ScrollView , StatusBar } from 'react-native';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { API_URL } from '@env';
import Toast from 'react-native-toast-message';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BackButton } from '../../components';

const SaveContactScreen = ({ navigation }) => {
  const { userEmail } = useContext(UserContext); // Get userEmail from UserContext
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSaveContact = async () => {
    // Input validation
    if (!firstName || !email) {
      setError('Please fill in the required fields.');
      return;
    }

    // Combine firstName and lastName
    const fullName = `${firstName} ${lastName}`;

    // Reset error before submission
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/v1/friend/save-friend`, {
        userName: fullName,
        friendEmail: email,
        userEmail, // Send the current user's email as context
      });

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Contact Saved',
          text2: `${fullName} has been added to your contacts.`,
        });

        // Reset form and navigate back
        setFirstName('');
        setLastName('');
        setEmail('');
        navigation.goBack(); // Go back to previous screen
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      setError('Failed to save contact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-5 bg-[#000000]">
        <View className="py-2 px-5 items-center mt-5">
        
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-0 left-0">
            <MaterialIcons name="arrow-back-ios" size={24} color="#f59e0b"  />
        </TouchableOpacity>
          <Text className="text-xl font-bold text-white mb-6 text-center">New Contact</Text>
        </View>
      {/* First Name Input */}
      <View className="mb-4">
        <Text className="text-gray-400 text-xs mb-2 ml-2">First Name</Text>
        <View className="bg-[#1b1a23] px-4 rounded-lg">
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            placeholderTextColor="#777"
            className="text-white"
          />
        </View>
      </View>

      {/* Last Name Input */}
      <View className="mb-4">
        <Text className="text-gray-400 text-xs mb-2 ml-2">Last Name</Text>
        <View className="bg-[#1b1a23] px-4 rounded-lg">
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
            placeholderTextColor="#777"
            className="text-white"
          />
        </View>
      </View>

      {/* Email Input */}
      <View className="mb-4">
        <Text className="text-gray-400 text-xs mb-2 ml-2">Email</Text>
        <View className="bg-[#1b1a23] px-4 rounded-lg">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            placeholderTextColor="#777"
            className="text-white"
            keyboardType="email-address"
          />
        </View>
      </View>

      {error && <Text className="text-red-500 mb-4">{error}</Text>}

      {loading ? (
        <ActivityIndicator size="large" color="#00ff00" />
      ) : (
        
        <TouchableOpacity 
      className="items-center justify-center py-4 w-full bg-amber-500 rounded-xl mb-10"
      onPress={handleSaveContact}
      >
        <Text className="text-gray-100 text-lg font-bold">Save Contact</Text>
      </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default SaveContactScreen;
