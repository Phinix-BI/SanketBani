import {useEffect, useState, useContext, useCallback} from 'react';
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import {Text} from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '@env';
import {UserContext} from '../../context/UserContext'; // Import UserContext
import {Header, SaveContactIcon} from '../../components';
import {useFocusEffect} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function ContactsScreen({navigation}) {
  // const [userEmail, setUserEmail] = useState(null);
  const {userEmail} = useContext(UserContext); // Access userEmail from context
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);


  // Fetch contacts once userEmail is set
  const fetchContacts = async () => {
    if (userEmail) {
      try {
        const response = await axios.get(
          `${API_URL}/api/v1/friend/get-friends/${userEmail}`,
        );
        setContacts(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setError('Failed to fetch contacts.');
      }
    }
  };

  useEffect(() => {
    fetchContacts();
    return () => setContacts([]); // Cleanup contacts on unmount
  }, [userEmail]);

  // Fetch contacts on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchContacts();
    }, [userEmail]),
  );

  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('ChatScreen', {
          sender: userEmail,
          recipient: item.email,
          recipientName: item.userName,
        })
      }
      className="flex-row items-center px-4 pt-4">
      <Image
        source={{uri: item.profilePicture ? item.profilePicture : ''}}
        className="w-12 h-12 rounded-full bg-gray-200"
      />
      <View className="flex-1">
        <View className="flex-row justify-between items-center">
          <Text className="ml-4 text-md text-slate-200 font-bold">
            {item.userName}
          </Text>
          <Text className="text-xs text-slate-300">12:30</Text>
        </View>
        <Text className="ml-4 text-xs text-slate-300">
          {item.userName} sent you a message...
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
  
    <View className="flex-1" style={{backgroundColor: '#000000'}}>
    {/* <StatusBar barStyle={'light-content'} backgroundColor="transparent" translucent={true} /> */}
      <Header title="SanketChat" icon="more-vert" />
      
      {/* Search input */}
      <View className="items-center w-full px-3 mb-2">
        <TextInput
          placeholder="Search contacts..."
          placeholderTextColor={'#a3a3a3'}
          cursorColor={'white'}
          className="flex-1 w-full py-2 px-5 text-slate-300 rounded-3xl"
          style={{
            backgroundColor: '#242B31',
            textAlignVertical: 'center',
            minHeight: 45,
          }}
          multiline={true}
        />
      </View>

      {/* Filter options */}
      <View className="flex-row mt-12 mb-0 mx-4">
        <View
          className="py-1 px-3 rounded-2xl mr-2"
          style={{backgroundColor: '#242B31'}}>
          <Text className="text-md text-center" style={{color: '#a3a3a3'}}>
            All
          </Text>
        </View>
        <View
          className="py-1 px-3 rounded-2xl mr-2"
          style={{backgroundColor: '#242B31'}}>
          <Text className="text-md text-center" style={{color: '#a3a3a3'}}>
            Most Chats
          </Text>
        </View>
        <View
          className="py-1 px-3 rounded-2xl mr-2"
          style={{backgroundColor: '#242B31'}}>
          <Text className="text-md text-center" style={{color: '#a3a3a3'}}>
            Friend Requests
          </Text>
        </View>
      </View>

      {/* Contact List */}
      <View className="flex-1">
        {loading ? (
          <Text className="text-center mt-4">Loading...</Text>
        ) : (
          <FlatList
            data={contacts}
            renderItem={renderItem}
            keyExtractor={item => item.userId}
            contentContainerStyle={{paddingBottom: 80}} // Ensure it doesn't overlap the tab bar
          />
        )}
      </View>

      {/* Save contact icon */}
      <SaveContactIcon
        classStyle="rounded-xl absolute bottom-0 right-0 mb-7 mr-5"
        onPress={() => navigation.navigate('SaveContactScreen')}
      />
    </View>
    
  );
}
