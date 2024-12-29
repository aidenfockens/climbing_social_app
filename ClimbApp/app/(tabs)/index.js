import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CalendarScreen from './CalendarScreen';
import MessagesScreen from './MessagesScreen';
import PublicPostsScreen from './PublicPostsScreen';
import PotentialFriendsScreen from './PotentialFriendsScreen';
import { View, Text, Image, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';


const Tab = createBottomTabNavigator();

export default function Tabs() {
  const [username, setUsername] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const router = useRouter();
  // Fetch user details
  const fetchUserDetails = async (username) => {
    try {
      const response = await fetch(`http://localhost:5001/userdetails/${username}`);
      if (response.ok) {
        const data = await response.json();
        setUserDetails(data);
      } else {
        console.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Fetch username and then user details
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5001/user', {
          method: 'GET',
          credentials: 'include', // Ensures cookies are included in the request
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.username);
          fetchUserDetails(data.username);
        } else {
          console.error('Failed to fetch username');
        }
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    fetchUsername();
  }, []);

  const handleLogout = async () => {
    
    try {
      const response = await fetch('http://127.0.0.1:5001/logout', {
        method: 'POST',
        credentials: 'include', // Ensures cookies are included in the request
      });
  
      if (response.ok) {
        const data = await response.json();
        router.push('../login');
        console.log('Logout successful:', data.message);
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <Tab.Navigator
      initialRouteName="Calendar"
      screenOptions={{
        headerStyle: {
          elevation: 0, 
          shadowOpacity: 0, 
          borderBottomWidth: 0, 
        },
        headerRight: () => (
          <View style={styles.headerContainer}>
            {userDetails && (
              <>
                <Image
                  source={{ uri: userDetails.picture_url || 'https://via.placeholder.com/40' }}
                  style={styles.profilePicture}
                />
                <Text style={styles.username}>{userDetails.username}</Text>
              </>
            )}
            <Button title="Log Out" onPress={handleLogout} />
          </View>
        ),
        tabBarStyle: { height: 70, backgroundColor: '#f9f9f9', borderTopWidth: 1, borderTopColor: '#ccc' },
        tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold', paddingBottom: 10 },
      }}
    >
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarLabel: 'Calendar',headerTitle: '' }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ tabBarLabel: 'Messages',headerTitle: '' }} />
      <Tab.Screen name="Public Posts" component={PublicPostsScreen} options={{ tabBarLabel: 'Public Posts',headerTitle: '' }} />
      <Tab.Screen name="Potential Friends" component={PotentialFriendsScreen} options={{ tabBarLabel: 'Potential Friends',headerTitle: '' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
});
