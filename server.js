const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const {U2RS4852Schema} = require('./database/sensorDataSchema'); // The schema from the previous step

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://jawwad:Growmore1@cluster0.bedgwkj.mongodb.net/windash_station?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Endpoint to fetch all sensor data
app.get('/get/sensor-data/all', async (req, res) => {
  try {
    const sensorData = await U2RS4852Schema.find();
    res.json(sensorData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Endpoint to fetch sensor data for a specific time range
app.get('/get/sensor-data/range/:range', async (req, res) => {
  const { range } = req.params;
  const now = Date.now();

  let query = {};
  switch (range) {
    case '5m':
      query.date = { $gte: now - 5 * 60 * 1000 }; // last 5 minutes
      break;
    case '30m':
      query.date = { $gte: now - 30 * 60 * 1000 }; // last 30 minutes
      break;
    case '1h':
      query.date = { $gte: now - 60 * 60 * 1000 }; // last 1 hours
      break;
      case '3h':
        query.date = { $gte: now - 180 * 60 * 1000 }; // last 3 hours
        break;
    case '12h':
        query.date = { $gte: now - 720 * 60 * 1000 }
        break;
    default:
      return res.status(400).json({ message: 'Invalid range' });
  }

  try {
    const sensorData = await U2RS4852Schema.find(query);
    res.json(sensorData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});