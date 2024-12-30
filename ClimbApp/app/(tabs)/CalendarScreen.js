import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  FlatList,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function CalendarScreen() {
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [privacy, setPrivacy] = useState('public');
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [newEvent, setNewEvent] = useState({
    time: '',
    location: '',
    description: '',
  });
  const [time, setTime] = useState({ hour: '12', minute: '00', ampm: 'AM' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5001/getEvents', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const eventsObj = {};
        data.forEach((event) => {
          if (!eventsObj[event.date]) {
            eventsObj[event.date] = {
              marked: true,
              dots: [{ color: 'blue' }],
              details: [],
            };
          }
          eventsObj[event.date].details.push(event);
        });
        setEvents(eventsObj);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleUserSearch = async (query) => {
    try {
      const response = await fetch(`http://127.0.0.1:5001/search_users?q=${query}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const resetForm = () => {
    setNewEvent({ time: '', location: '', description: '' });
    setPrivacy('public');
    setAllowedUsers([]);
    setSearchQuery('');
    setSearchResults([]);
    setTime({ hour: '12', minute: '00', ampm: 'AM' });
    setShowForm(false);
  };

  const addEvent = async () => {
    const formattedTime = `${time.hour}:${time.minute} ${time.ampm}`;
    const eventToSubmit = {
      ...newEvent,
      date: selectedDate,
      time: formattedTime,
      privacy,
      allowedUsers,
    };

    try {
      const response = await fetch('http://127.0.0.1:5001/addEvents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(eventToSubmit),
      });

      if (response.ok) {
        fetchEvents();
        resetForm();
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const togglePrivacy = () => {
    const updatedPrivacy = privacy === 'public' ? 'private' : 'public';
    if (updatedPrivacy === 'public') {
      setAllowedUsers([]); // Clear allowed users when switching back to public
    }
    setPrivacy(updatedPrivacy);
  };

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={events}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          setShowForm(false); // Reset form visibility
        }}
      />

      {selectedDate && (
        <View>
          <Text style={styles.selectedDateText}>Events on {selectedDate}:</Text>
          <FlatList
            data={events[selectedDate]?.details || []}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.eventContainer}>
                <Text style={styles.eventTime}>User: {item.username}</Text>

                <Text style={styles.eventTime}>{item.location}, {item.time}</Text>
                <Text style={styles.eventDescription}>Description: {item.description}</Text>
   

              </View>
            )}
          />
          <Button title="Add Event" onPress={() => setShowForm(true)} />
        </View>
      )}

      <Modal visible={showForm} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Add Event</Text>
            <View style={styles.timeInputContainer}>
              <TextInput
                placeholder="HH"
                value={time.hour}
                keyboardType="numeric"
                maxLength={2}
                onChangeText={(text) => setTime({ ...time, hour: text })}
                style={styles.timeInput}
              />
              <Text>:</Text>
              <TextInput
                placeholder="MM"
                value={time.minute}
                keyboardType="numeric"
                maxLength={2}
                onChangeText={(text) => setTime({ ...time, minute: text })}
                style={styles.timeInput}
              />
              <TouchableOpacity
                onPress={() =>
                  setTime({ ...time, ampm: time.ampm === 'AM' ? 'PM' : 'AM' })
                }
              >
                <Text style={styles.ampmButton}>{time.ampm}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Location"
              value={newEvent.location}
              onChangeText={(text) =>
                setNewEvent({ ...newEvent, location: text })
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={newEvent.description}
              onChangeText={(text) =>
                setNewEvent({ ...newEvent, description: text })
              }
              style={styles.input}
            />
            <Button
              title={`Set as ${privacy}`}
              onPress={togglePrivacy}
              color={privacy === 'public' ? 'green' : 'orange'}
            />
            {privacy === 'private' && (
              <>
                <TextInput
                  placeholder="Search users"
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    handleUserSearch(text);
                  }}
                  style={styles.input}
                />
                {searchResults.length > 0 &&
                  searchResults.map((result) => (
                    <TouchableOpacity
                      key={result.username}
                      onPress={() => {
                        if (!allowedUsers.includes(result.username)) {
                          setAllowedUsers([...allowedUsers, result.username]);
                        }
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      <Text style={styles.searchResult}>{result.username}</Text>
                    </TouchableOpacity>
                  ))}
                {allowedUsers.length > 0 && (
                  <Text style={styles.allowedUsers}>
                    Allowed: {allowedUsers.join(', ')}
                  </Text>
                )}
              </>
            )}
            <Button title="Submit" onPress={addEvent} />
            <Button
              title="Cancel"
              onPress={resetForm}
              color="red"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  eventContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#eef',
  },
  eventTime: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  eventDescription: {
    fontSize: 14,
  },
  eventLocation: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 8,
    borderRadius: 4,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    width: 50,
    textAlign: 'center',
    marginHorizontal: 5,
    borderRadius: 4,
  },
  ampmButton: {
    fontWeight: 'bold',
    color: 'blue',
    paddingHorizontal: 10,
  },
  searchResult: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  allowedUsers: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
