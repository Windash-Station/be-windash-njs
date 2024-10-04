const express = require('express');
const bodyParser = require('body-parser');
const mqtt = require('mqtt');
const app = express();
const { U2_RS485_2 , M1 , U1_analog } = require('./database');
const { workerData } = require('worker_threads');

const mqttClient = mqtt.connect('mqtt://broker.hivemq.com');
let schema;

mqttClient.on('connect', () => {
  console.log(`[${workerData.sensorname}] Connected to MQTT broker`);
  mqttClient.subscribe(`${workerData.sensorname}/data`, (err) => {
    if (!err) {
      console.log(`[${workerData.sensorname}] Subscribed to ${workerData.sensorname.toLowerCase()}/data topic`);
    }
  });
});

mqttClient.on('message', async (topic, message) => {
  console.log(topic);
  if (topic === 'U2_RS485_2/data' || topic === 'M1/data' || topic === 'U1_analog/data') {
    const sensorData = JSON.parse(message.toString());
    // console.log(sensorData);

    if (workerData.sensorname === 'U2_RS485_2') {
      schema = U2_RS485_2;
    } else if (workerData.sensorname === "M1") {
      schema = M1;
    } else {
      schema = U1_analog;
    }

    const newSensorData = new schema({
      sensorName: sensorData.sensorName,
      windSpeedmsData: sensorData.windSpeedmsData,
      totalSpeedData: sensorData.totalSpeedData,
      batteryVoltageData: sensorData.batteryVoltageData,
    });

    await newSensorData.save();
    console.log('Data saved to MongoDB:', newSensorData);
  }
});

app.use(bodyParser.json());

function getStartTime(hoursAgo) {
  const now = new Date();
  return new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
}

app.get('/api/live-data', async (req, res) => {
  const latestData = await schema.findOne().sort({ timestamp: -1 });
  res.json(latestData);
});

app.get('/api/data/last30minutes', async (req, res) => {
  const startTime = new Date(Date.now() - 30 * 60 * 1000);
  const data = await schema.find({ timestamp: { $gte: startTime } });
  res.json(data);
});

app.get('/api/data/lasthour', async (req, res) => {
  const startTime = getStartTime(1);
  const data = await schema.find({ timestamp: { $gte: startTime } });
  res.json(data);
});

app.get('/api/data/last6hours', async (req, res) => {
  const startTime = getStartTime(6);
  const data = await schema.find({ timestamp: { $gte: startTime } });
  res.json(data);
});

app.get('/api/data/last12hours', async (req, res) => {
  const startTime = getStartTime(12);
  const data = await schema.find({ timestamp: { $gte: startTime } });
  res.json(data);
});

app.get('/api/data/lastday', async (req, res) => {
  const startTime = getStartTime(24);
  const data = await schema.find({ timestamp: { $gte: startTime } });
  res.json(data);
});

app.listen(workerData.port, () => {
  console.log(`[${workerData.sensorname}] Server running on port ${workerData.port}`);
}); 