import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, Picker } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Import for selecting images
import { useRouter } from 'expo-router';
import { Image } from 'react-native'; // Import Image from react-native
import { TouchableOpacity } from 'react-native';


export default function UserDetailsInput() {
  const [age, setAge] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [yearsClimbing, setYearsClimbing] = useState('');
  const [rope, setRope] = useState('No');
  const [quickdraws, setQuickdraws] = useState('No');
  const [tradGear, setTradGear] = useState('None');
  const [topRopingLevel, setTopRopingLevel] = useState('None');
  const [leadingLevel, setLeadingLevel] = useState('None');
  const [tradClimbingLevel, setTradClimbingLevel] = useState('None');
  const [image, setImage] = useState(null); // To store selected file
  const router = useRouter();

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

  const handleSaveDetails = async () => {
    const formData = new FormData();

    let username = ""
    const response = await fetch('http://127.0.0.1:5001/user', {
        method: 'GET',
        credentials: 'include', // Ensures cookies are included in the request
    });

    if (response.ok) {
        const data = await response.json();
        username = data.username; // Extract the username from the response
        console.log("Username:", username);
    }
    
    

    // Convert Base64 to Blob
    const base64Image = image.split(',')[1];
    const byteCharacters = atob(base64Image);
    const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    

    formData.append('name', name);
    formData.append('age', age);
    formData.append('location', location);
    formData.append('years_climbing', yearsClimbing);
    formData.append('rope', rope);
    formData.append('quickdraws', quickdraws);
    formData.append('tradGear', tradGear);
    formData.append('top_roping_level', topRopingLevel);
    formData.append('leading_level', leadingLevel);
    formData.append('trad_climbing_level', tradClimbingLevel);
    formData.append('leading_level', leadingLevel)
    formData.append('tradClimbinglevel', tradClimbingLevel);
    formData.append('file',blob,username+".jpg")


    try {
      const response = await fetch('http://127.0.0.1:5001/addUserDetails', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Details and image saved successfully!');
        router.push('/(tabs)');
      } else {
        Alert.alert('Error', data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error saving user details:', error);
      Alert.alert('Error', 'Failed to connect to the server');
    }
  };

  

return (
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.container}>
      
      <Text style={styles.label}>What's your name?</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.label}>How old are you?</Text>
      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Where do you live? (City or State)</Text>
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <Text style={styles.label}>How many years have you been climbing for?</Text>
      <TextInput
        style={styles.input}
        placeholder="Years Climbing"
        value={yearsClimbing}
        onChangeText={setYearsClimbing}
        keyboardType="numeric"
      />
      <Text style={styles.label}>If you have any trad Gear, describe it! Otherwise, write none :D</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe Trad Gear"
        value={tradGear}
        onChangeText={setTradGear}
      />
      <Text style={styles.label}>Do you have a rope?</Text>
      <Picker
        selectedValue={rope}
        style={styles.picker}
        onValueChange={(itemValue) => setRope(itemValue)}
      >
        <Picker.Item label="No" value="No" />
        <Picker.Item label="Yes" value="Yes" />
      </Picker>
      <Text style={styles.label}>Quickdraws</Text>
      <Picker
        selectedValue={quickdraws}
        style={styles.picker}
        onValueChange={(itemValue) => setQuickdraws(itemValue)}
      >
        <Picker.Item label="No" value="No" />
        <Picker.Item label="6" value="6" />
        <Picker.Item label="12" value="12" />
        <Picker.Item label="More than 12" value="More than 12" />
      </Picker>
      <Text style={styles.label}>Top Roping Confidence Level</Text>
      <Picker
        selectedValue={topRopingLevel}
        style={styles.picker}
        onValueChange={(itemValue) => setTopRopingLevel(itemValue)}
      >
        <Picker.Item label="None" value="No Experience" />
        <Picker.Item label="Somewhat Confident" value="Somewhat Confident" />
        <Picker.Item label="Very Confident" value="Very Confident" />
      </Picker>
      <Text style={styles.label}>Leading Confidence Level</Text>
      <Picker
        selectedValue={leadingLevel}
        style={styles.picker}
        onValueChange={(itemValue) => setLeadingLevel(itemValue)}
      >
        <Picker.Item label="None" value="No Experience" />
        <Picker.Item label="Somewhat Confident" value="Somewhat Confident" />
        <Picker.Item label="Very Confident" value="Very Confident" />
      </Picker>
      <Text style={styles.label}>Trad Climbing Confidence Level</Text>
      <Picker
        selectedValue={tradClimbingLevel}
        style={styles.picker}
        onValueChange={(itemValue) => setTradClimbingLevel(itemValue)}
      >
        <Picker.Item label="None" value="No Experience" />
        <Picker.Item label="Somewhat Confident" value="Somewhat Confident" />
        <Picker.Item label="Very Confident" value="Very Confident" />
      </Picker>

      <Text style={styles.label}>Upload a Profile Picture</Text>
        <View style={styles.rowContainer}>

        <TouchableOpacity style={styles.smallButton} onPress={pickImage}>
            <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>
        

        {image && (
            <View style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.image} />
            </View>
        )}
        </View>

        {/* Smaller Save Details button below */}
        <View style={styles.SavebuttonContainer}>
        <TouchableOpacity style={styles.smallButton} onPress={handleSaveDetails}>
            <Text style={styles.buttonText}>Save Details</Text>
        </TouchableOpacity>
        </View>

    </View>
  </ScrollView>
);
}

const styles = StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      paddingVertical: 20,
    },
    container: {
      flex: 1,
      padding: 20,
    },
    label: {
      marginBottom: 12,
      fontSize: 18,
      fontWeight: 'bold',
    },
    input: {
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
    },
    picker: {
      marginBottom: 16,
      height: 50,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
    },
    rowContainer: {
      flexDirection: 'row', // Align items in a row
      alignItems: 'center', // Vertically center-align items
      justifyContent: 'space-between', // Space between button and image
      marginTop: 20, // Add spacing above the row
    },
    button: {
      flex: 1, // Allow button to take up available space
      marginRight: 10, // Add spacing between button and image
      width: 100,
    },
    imagePreview: {
      flex: 1, // Allow image to take up available space
      alignItems: 'flex-end', // Align the image to the right
    },
    image: {
      width: 200,
      height: 200,
      borderRadius: 100, // Circular image
    },
    SavebuttonContainer: {
      marginTop: 100,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    smallButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
      },
  });
  
  