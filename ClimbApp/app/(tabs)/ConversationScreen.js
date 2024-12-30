import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function ConversationScreen({ route }) {
  const { recipient, isNew } = route.params; // Receive the 'isNew' flag
  const [messages, setMessages] = useState(isNew ? [] : null); // Start with empty messages if new
  const [newMessage, setNewMessage] = useState('');
  const navigation = useNavigation();

  // Fetch messages from the backend
  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5001/get_messages/${recipient}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Ensure messages are re-fetched every time the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchMessages();
    }, [recipient]) // Re-fetch messages when the recipient changes
  );

  const sendMessage = async () => {
    if (!newMessage.trim()) return; // Prevent sending empty messages

    const messageData = {
      sender: 'me', // Temporary display
      recipient,
      content: newMessage,
      timestamp: new Date().toISOString(), // Temporary display
    };

    // Optimistically add the message to the UI
    setMessages((prevMessages) => [...prevMessages, messageData]);

    try {
      const response = await fetch('http://127.0.0.1:5001/send_message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recipient, content: newMessage }),
      });

      if (!response.ok) {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setNewMessage(''); // Clear input
      fetchMessages(); // Refresh messages from server to ensure correctness
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{recipient}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Messages')} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.message}>
            <Text style={styles.sender}>{item.sender}</Text>
            <Text>{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noMessages}>No messages yet. Start the conversation!</Text>
        }
      />
      <TextInput
        style={styles.input}
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Aligns the title on the left and back button on the right
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  message: {
    marginVertical: 5,
  },
  sender: {
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  noMessages: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});
