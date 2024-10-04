const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/sensorData');
  
const sensorSchema = new mongoose.Schema({
    sensorName: String,
    windSpeedmsData: Number,
    totalSpeedData: Number,
    batteryVoltageData: Number,
    timestamp: { type: Date, default: Date.now },
});
  
const U2_RS485_2 = mongoose.model('U2_RS485_2', sensorSchema, 'U2_RS485_2');
const M1 = mongoose.model('M1', sensorSchema, 'M1');
const U1_analog = mongoose.model('U1_analog', sensorSchema, 'U1_analog');

module.exports = { U2_RS485_2, M1 , U1_analog };