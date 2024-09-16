require('./database/connection');
const { M1Schema, U1AnalogSchema, U2RS4852Schema } = require('./database/sensorDataSchema');
const express = require('express');
const os = require('os');

const getIPAddress = () => {
    const networkInterfaces = os.networkInterfaces();
    for (let interfaceName in networkInterfaces) {
      for (let iface of networkInterfaces[interfaceName]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return '127.0.0.1';
  };

const createExpressServer = async (sensorName, port) => {
  const app = express();
  const ip = getIPAddress();
  let SensorData;
  app.use(express.json());

  if (sensorName === "U1_analog") {
    SensorData = U1AnalogSchema;
  } else if (sensorName === "U2_RS485_2") {
    SensorData = U2RS4852Schema;
  } else {
    SensorData = M1Schema;
  } 

  app.listen(port, ip, () => {
    console.log(`[server.js] Server for ${sensorName} is running at http://${ip}:${port}`);
  });

  app.get('/', (req, res) => {
    res.send(`Home page for server running on port ${port}`);
  });

  app.get('/get/sensor-data/all/', async (req, res) => {
    try {
        console.log(port);
        const sensorData = await SensorData.find();
        res.send(sensorData);
    } catch (error) {
        res.send("Internal server error: ", error);
    }
  });

  app.post('/post/sensor-data/', async (req, res) => {
    try {
    console.log(req.body);
      const { windSpeedmsData, totalSpeedData, batteryVoltageData, hourSpeed } = req.body;
      console.log(windSpeedmsData, totalSpeedData, batteryVoltageData, hourSpeed);

      const newData = new SensorData({ windSpeedmsData, totalSpeedData, batteryVoltageData, hourSpeed });
      await newData.save();
  
      res.status(200).send("Data received and saved successfully");
    } catch (error) {
      res.status(500).send(error.message);  
    }
  });
};

createExpressServer("U1_analog", 3161);
createExpressServer("M1", 3162);
createExpressServer("U2_RS485_2", 3163);