// context/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

// Create the context
export const UserContext = createContext();

// Create the provider
export const UserProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
          setError('User is not logged in');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/api/v1/user/getuser`, {
          headers: { 'x-auth-token': token },
        });
        
        setUserEmail(response.data.data.email);
      } catch (err) {
        console.error('Error fetching user email:', err);
        setError('Failed to fetch user email.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserEmail();
  }, []);

  return (
    <UserContext.Provider value={{ userEmail, setUserEmail, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};
