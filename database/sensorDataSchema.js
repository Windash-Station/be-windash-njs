const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
    windSpeedmsData: Number,
    totalSpeedData: Number,
    batteryVoltageData: Number,
    hourSpeed: Number,
    date: { type: Date, default: Date.now },
});

const U1AnalogSchema = mongoose.model('U1_analog', sensorSchema, 'U1_analog');
const M1Schema = mongoose.model('M1', sensorSchema, 'M1');
const U2RS4852Schema = mongoose.model('U2_RS485_2', sensorSchema, 'U2_RS485_2');

module.exports = { U1AnalogSchema, M1Schema, U2RS4852Schema };