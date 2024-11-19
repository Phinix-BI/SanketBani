import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DocumentPicker from 'react-native-document-picker';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const ProfileScreen = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState({
    fullName: 'Victoria Heard',
    email: 'heard_j@gmail.com',
    category : 'Deaf',
    gender : 'Female',
    location: 'Antigua',
    createdAt: 'Jul. 2019',
    profilePicture: null, // Placeholder image
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const defaultImage = require('../assets/man.jpeg'); // Placeholder image

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    
    const day = date.getDate(); // Get the day (20)
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear(); // Get the year (2020)
  
    return `${day} ${month}, ${year}`;
  };

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        return navigation.navigate('LoginScreen');
      }
  
      const response = await axios.get(`${API_URL}/api/v1/user/getuser`, {
        headers: {
          'x-auth-token': token
        }
      });
  
      setUserDetails(response.data.data);
      
    } catch (error) {
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        console.error('Error request data:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const token = await AsyncStorage.getItem('token');

      const formData = new FormData();
      formData.append('profilePicture',{
        uri:  selectedImage.uri,
        type: selectedImage.type,
        name: selectedImage.name,
      });

      const response = await axios.post(`${API_URL}/api/v1/user/upload-profile-picture`, formData , {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token,
        }
      });


      Toast.show({
        type: 'success',
        text1: 'Profile image updated successfully!',
      });

      setUserDetails((prev) => ({ ...prev, profileImage: { uri: file.uri } }));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Image upload failed. Please try again.',
      });
      console.log('Error uploading image:', error);
      console.error('Error uploading image:', error.message);
    }
  };

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      });

      setSelectedImage(result[0]);
      handleImageUpload(result[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('Image selection canceled');
      } else {
        console.error('Error selecting image:', err);
      }
    }
  };

  
  const handleLogout = async () => {
    Toast.show({
      type: 'success',
      text1: 'Logged out successfully',
      visibilityTime: 3000,
      autoHide: true,
    });
    // await GoogleSignin.revokeAccess(); Optional: Revokes access so the user sees consent screen on re-login
    await GoogleSignin.signOut();
    
    await AsyncStorage.removeItem('token');
    // Reset navigation and go to LoginScreen in the Auth stack
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'AuthNavigator' }],
      })
    );
  };

  return (
    <ScrollView className="flex-1" style={{backgroundColor:'#000000'}}>
        {/* <StatusBar backgroundColor="#000000" barStyle="light-content"/> */}
      
      {/* Header */}
      <View className="bg-black py-6 px-5 items-center mt-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-0 left-0">
            <MaterialIcons name="arrow-back-ios" size={24} color="#f59e0b" style={{marginLeft: 20, marginTop: 20}} />
          </TouchableOpacity>
          <View style={styles.glowEffect}>
          <TouchableOpacity onPress={pickImage}>
            <Image
             source={selectedImage ? { uri: selectedImage.uri } : userDetails.profilePicture ? { uri: userDetails.profilePicture } : defaultImage} // Update this with the actual image
              className="w-24 h-24 rounded-full border-4"
            />
          </TouchableOpacity>
            {/* <TouchableOpacity className="absolute top-2 right-2 bg-purple-600 p-2 rounded-full">
              <Text className="text-white">✎</Text>
            </TouchableOpacity> */}
          </View>
          <Text className="text-2xl font-semibold mt-3" style={{color:'#D0CFD2'}}>{userDetails.fullName}</Text>
          <Text className="text-amber-500 text-sm">Active since - {formatDate(userDetails.createdAt)}</Text>
      </View>

      {/* Personal Information */}
      <View className="mt-1 px-5">
        <Text className="text-amber-500 mb-3 text-lg">Personal Information</Text>
        <View className="rounded-xl py-6 pr-6 pl-2 space-y-6" style={{backgroundColor:'#0E0D1A'}}>

          {/* Phone */}
          <View className="flex-row items-center">
            {userDetails.gender === "Male" ? 
            <MaterialIcons name="male" size={15} color="#f59e0b" />
            :
            userDetails.gender === "Other" ?
            <MaterialIcons name='transgender' size={15} color="#f59e0b" />
            :
            <MaterialIcons name='female' size={15} color="#f59e0b" />
            
            }
            <Text className="text-gray-300 w-20 ml-2">Gender</Text>
            <Text className="absolute right-0 text-amber-500">{userDetails.gender}</Text>
          </View>

          {/* Website */}
          <View className="flex-row items-center">
            <MaterialIcons name="category" size={15} color="#f59e0b" />
            <Text className="text-gray-300 w-20 ml-2">Category</Text>
            <Text className="absolute right-0 text-amber-500" >{userDetails.category}</Text>
          </View>

          {/* Email */}
          <View className="flex-row items-center">
            <MaterialIcons name="email" size={15} color="#f59e0b" />
            <Text className="text-gray-300 w-20 ml-2">Email</Text>
            <Text className="absolute right-0 text-amber-500"  >{userDetails.email}</Text>
          </View>
          
          {/* Location */}
          <View className="flex-row items-center">
            <MaterialIcons name="location-on" size={15} color="#f59e0b" />
            <Text className="text-slate-300 w-20 ml-2">Location</Text>
            <Text className="absolute right-0 text-amber-500" >{userDetails.location}</Text>
          </View>
        </View>
      </View>

      {/* Utilities */}
      <View className="mt-8 px-5">
        <Text className="text-amber-500 mb-2 text-lg">Utilities</Text>
        <View className="rounded-xl p-4 space-y-4" style={{backgroundColor:'#0E0D1A'}}>
          <TouchableOpacity className="flex-row items-center space-x-3">
            <MaterialIcons name='download' size={20} color="#f59e0b" />
            <Text className="text-white">Downloads</Text>
          </TouchableOpacity>
         
          <TouchableOpacity className="flex-row items-center space-x-3">
            <MaterialIcons name='help' size={20} color="#f59e0b" />
            <Text className="text-white">Ask Help Desk</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Log out Button */}
      <View className="px-12 items-center mt-3">
      <TouchableOpacity 
      className=" flex-row items-center justify-center py-3 w-full bg-amber-500 rounded-2xl"
      onPress={handleLogout}
      >
        <MaterialIcons name="logout" size={20} color="white" />
        <Text className="text-gray-100 text-lg font-bold  ml-2">Log Out</Text>
      </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  
  glowEffect: {
    borderRadius: 100,
    shadowColor: '#FF007F',  // Neon Pink
    shadowOpacity: 1,         // Maximum intensity (full opaque shadow)
    shadowRadius: 20,         // Increased radius for a larger glow
    shadowOffset: { width: 0, height: 0 }, // Centered shadow
    elevation: 50,            // Increased for a bigger Android shadow
    backgroundColor: '#1c1c1c',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileScreen;
