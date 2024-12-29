import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CalendarScreen() {
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    date: '',
    time: '',
    location: '',
    description: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5001/events', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Transform events into the format required by `react-native-calendars`
        const eventsObj = {};
        data.forEach((event) => {
          if (!eventsObj[event.date]) eventsObj[event.date] = { marked: true, dots: [{ color: 'blue' }] };
        });
        setEvents(eventsObj);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const addEvent = async () => {
    try {
      const response = await fetch('http://localhost:5001/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newEvent),
      });

      if (response.ok) {
        fetchEvents(); // Refresh events
        setShowForm(false);
        setNewEvent({ date: '', time: '', location: '', description: '' });
      }
    } catch (error) {
      console.log("oh shittt")
      console.error('Error adding event:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Calendar
          markedDates={events}
          onDayPress={(day) => setSelectedDate(day.dateString)}
        />

        {selectedDate && (
          <View>
            <Text style={styles.selectedDateText}>Events on {selectedDate}:</Text>
            <FlatList
              data={Object.values(events[selectedDate] || [])}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => <Text style={styles.event}>{item.description}</Text>}
            />
          </View>
        )}

        <Button title="Add Event" onPress={() => setShowForm(!showForm)} />

        {showForm && (
          <View style={styles.form}>
            <TextInput
              placeholder="Date (YYYY-MM-DD)"
              value={newEvent.date}
              onChangeText={(text) => setNewEvent({ ...newEvent, date: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Time (HH:MM)"
              value={newEvent.time}
              onChangeText={(text) => setNewEvent({ ...newEvent, time: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Location"
              value={newEvent.location}
              onChangeText={(text) => setNewEvent({ ...newEvent, location: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={newEvent.description}
              onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
              style={styles.input}
            />
            <Button title="Submit" onPress={addEvent} />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  event: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  form: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 8,
    borderRadius: 4,
  },
});
