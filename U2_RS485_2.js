const mqtt = require('mqtt');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Express App Setup
const app = express();
app.use(bodyParser.json());

// MongoDB connection (optional if storing in MongoDB)
mongoose.connect('mongodb://localhost:27017/sensorData');
const analogSchema = new mongoose.Schema({
    sensorName: String,
    windSpeedmsData: Number,
    totalSpeedData: Number,
    batteryVoltageData: Number,
    timestamp: { type: Date, default: Date.now }
});
const AnalogData = mongoose.model('U2_RS485_2', analogSchema, 'U2_RS485_2');

// MQTT broker details
const mqttBrokerUrl = 'mqtt://broker.hivemq.com:1883';  // Replace with your MQTT broker URL
const mqttTopic = 'U2_RS485_2/data';               // Replace with your topic

// Connect to MQTT Broker
const client = mqtt.connect(mqttBrokerUrl);

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    // Subscribe to the MQTT topic where the ESP8266 publishes
    client.subscribe(mqttTopic, (err) => {
        if (!err) {
            console.log(`Subscribed to topic: ${mqttTopic}`);
        } else {
            console.error('Failed to subscribe to topic:', err);
        }
    });
});

// Handle incoming MQTT messages
client.on('message', (topic, message) => {
    if (topic === mqttTopic) {
        try {
            // Parse the incoming message (JSON string)
            const sensorData = JSON.parse(message.toString());

            console.log(`Received data from topic: ${topic}`);
            console.log(sensorData);

            // Store data in MongoDB (Optional)
            const newData = new AnalogData(sensorData);
            newData.save()
                .then(() => console.log('Data saved to database'))
                .catch(err => console.error('Error saving data:', err));
        } catch (error) {
            console.error('Error parsing MQTT message:', error);
        }
    }
});

function getStartTime(hoursAgo) {
    const now = new Date();
    return new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
  }
  
  app.get('/api/live-data', async (req, res) => {
    const latestData = await AnalogData.findOne().sort({ timestamp: -1 });
    res.json(latestData);
  });
  
  app.get('/api/data/last30minutes', async (req, res) => {
    const startTime = new Date(Date.now() - 30 * 60 * 1000);
    const data = await AnalogData.find({ timestamp: { $gte: startTime } });
    res.json(data);
  });
  
  app.get('/api/data/lasthour', async (req, res) => {
    const startTime = getStartTime(1);
    const data = await AnalogData.find({ timestamp: { $gte: startTime } });
    res.json(data);
  });
  
  app.get('/api/data/last6hours', async (req, res) => {
    const startTime = getStartTime(6);
    const data = await AnalogData.find({ timestamp: { $gte: startTime } });
    res.json(data);
  });
  
  app.get('/api/data/last12hours', async (req, res) => {
    const startTime = getStartTime(12);
    const data = await AnalogData.find({ timestamp: { $gte: startTime } });
    res.json(data);
  });
  
  app.get('/api/data/lastday', async (req, res) => {
    const startTime = getStartTime(24);
    const data = await AnalogData.find({ timestamp: { $gte: startTime } });
    res.json(data);
  });
  

// Simple API to fetch stored analog data (Optional)
app.get('/api/analog-data', async (req, res) => {
    try {
        const data = await AnalogData.find().sort({ timestamp: -1 }).limit(1); // Get last 10 readings
        res.json(data);
    } catch (error) {
        res.status(500).send('Error retrieving data');
    }
});

// Start the Express server
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});