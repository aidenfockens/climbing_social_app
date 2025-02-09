import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

export default function PublicPostsScreen() {
  const [locations, setLocations] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [image, setImage] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5001/get_locations');
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
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

  const handleAddLocation = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('state', state);

    const base64Image = image.split(',')[1];
    const byteCharacters = atob(base64Image);
    const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    formData.append('file', blob, `${name}.jpg`);

    try {
      const response = await fetch('http://127.0.0.1:5001/add_location', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setModalVisible(false);
        fetchLocations();
      } else {
        console.error('Error adding location:', data.error);
      }
    } catch (error) {
      console.error('Error adding location:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('LocationPosts', { locationId: item.id })}>
            <View style={styles.location}>
              <Image source={{ uri: item.picture_url }} style={styles.locationImage} />
              <Text style={styles.locationName}>{item.name}</Text>
              <Text style={styles.locationState}>{item.state}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Button title="Add Location" onPress={() => setModalVisible(true)} />
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Location Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="State"
            value={state}
            onChangeText={setState}
          />
          <Button title="Pick Image" onPress={pickImage} />
          {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
          <Button title="Add Location" onPress={handleAddLocation} />
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
  location: {
    marginBottom: 20,
  },
  locationImage: {
    width: '100%',
    height: 200,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationState: {
    fontSize: 16,
    color: '#666',
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