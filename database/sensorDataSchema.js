const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  sensorName: { type: String, required: true },
  windSpeedmsData: { type: Number, required: true },
  totalSpeedData: { type: Number, required: true },
  batteryVoltageData: { type: Number, required: true },
  date: { type: Number, required: true } // UNIX timestamp
}, { versionKey: false }); // Remove __v field

const U1AnalogSchema = mongoose.model('U1_analog', sensorSchema, 'U1_analog');
const M1Schema = mongoose.model('M1', sensorSchema, 'M1');
const U2RS4852Schema = mongoose.model('U2_RS485_2', sensorSchema, 'U2_RS485_2');

module.exports = { U1AnalogSchema, M1Schema, U2RS4852Schema };