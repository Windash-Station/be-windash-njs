const { Worker } = require('worker_threads');

function runServer(filename, port, sensorname) {
  return new Worker(filename, { workerData: { port, sensorname } });
}

runServer('./server.js', 3001, 'U2_RS485_2');
runServer('./server.js', 3002, 'M1');
runServer('./server.js', 3003, 'U1_analog');

console.log('Main thread is running. Servers are being started in different worker threads.');
