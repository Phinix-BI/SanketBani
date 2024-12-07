import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TranslatorNavigator from './TranslatorNavigator';
import ChatingNavigator from './ChatingNavigator';
import ProfileScreen from './screens/ProfileScreen';
import GoogleAuthScreen from './screens/AuthScreens/GoogleAuthScreen';
import Testing from './screens/Testing';



const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0F1E26', // Dark background color
          borderTopWidth: 0, // Remove border
          height: 70, // Make it taller like the image
        },
        tabBarLabelStyle: {
          fontSize: 12, // Adjust font size if needed
          marginBottom: 8, // Add some margin for the labels
        },
        tabBarActiveTintColor: '#f59e0b', // Active icon color (greenish)
        tabBarInactiveTintColor: '#FFFFFF', // Inactive icon color (white)
      }}>
      <Tab.Screen
        name="Translator"
        component={TranslatorNavigator}
        options={{
          tabBarLabel: 'Translator',
          tabBarIcon: ({color, size}) => (
            // <View>
              <MaterialIcons name="translate" color={color} size={size} />
              // Add badge for new message notification 
              // <View
                // style={{
                //   position: 'absolute',
                //   right: -6,
                //   top: -3,
                //   backgroundColor: 'green',
                //   borderRadius: 10,
                //   width: 16,
                //   height: 16,
                //   justifyContent: 'center',
                //   alignItems: 'center',
                // }}>
                // <Text style={{color: 'white', fontSize: 10}}>1</Text>
              // </View> 
            // </View>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Call"
        component={ChatingNavigator}
        options={({route}) => ({
          tabBarLabel: 'Chats',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="phone" color={color} size={size} />
          ),
          headerShown: false,
          
        })}
      />
      <Tab.Screen
        name="Account"
        component={ProfileScreen}
        // component={Testing}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="account-circle" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

export default Tabs;
