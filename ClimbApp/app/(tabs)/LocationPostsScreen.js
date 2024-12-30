import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRoute } from '@react-navigation/native';

export default function LocationPostsScreen() {
  const [posts, setPosts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const route = useRoute();
  const { locationId } = route.params;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5001/get_posts/${locationId}`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddPost = async () => {
    const formData = new FormData();
    formData.append('location_id', locationId);
    formData.append('content', content);

    const base64Image = image.split(',')[1];
    const byteCharacters = atob(base64Image);
    const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    formData.append('file', blob, `${locationId}.jpg`);

    try {
      const response = await fetch('http://127.0.0.1:5001/add_post', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setModalVisible(false);
        fetchPosts();
      } else {
        console.error('Error adding post:', data.error);
      }
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.post}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
            <Text style={styles.content}>{item.content}</Text>
            {item.picture_url && <Image source={{ uri: item.picture_url }} style={styles.postImage} />}
          </View>
        )}
      />
      <Button title="Add Post" onPress={() => setModalVisible(true)} />
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Post Content"
            value={content}
            onChangeText={setContent}
          />
          <Button title="Pick Image" onPress={pickImage} />
          {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
          <Button title="Add Post" onPress={handleAddPost} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  post: {
    marginBottom: 20,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    fontSize: 16,
    marginVertical: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
});