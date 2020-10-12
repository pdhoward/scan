require('dotenv').config();

///////////////////////////////////////////////////////////////
////////     Proxy Server - Mocking IOT Messages       ///////
//////            mainline processing                 ///////
////// c strategic machines 2018 all rights reserved ///////
///////////////////////////////////////////////////////////

const express =                require('express');
const util =                   require('util')
const advlib =                 require('advlib')
const advlibble =              require('advlib-ble')
const advlibbleservices =      require('advlib-ble-services')
const advlibblemanufacturers = require('advlib-ble-manufacturers')

const { v4: uuidv4 } =         require('uuid');
const {events} =               require('../events')
const { g, b, gr, r, y } =     require('../console');

// Express app
const app = express();
const PORT = process.env.SCAN_PORT || 4200

const log = (msg) => console.log(msg)

const PROCESSORS = [
  { processor: advlibble,
    libraries: [ advlibbleservices, advlibblemanufacturers],                
    options: { ignoreProtocolOverhead: true } }
 ]
//////////////////////////////////////////////////////////////////////////
////////////////////  Register Middleware       /////////////////////////
////////////////////////////////////////////////////////////////////////

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const isDev = (app.get('env') === 'development');
log(`Stream is currently running in ${isDev ? `development` : `production`}`);

//////////////////////////////////////////////////////////////////////////
////////////  Event Registration for server, streams and db      ////////
////////////////////////////////////////////////////////////////////////
const createServers = () => {
  return new Promise(async (resolve, reject) => {
    const servers = await events(app)
    resolve(servers)
  })  
}

const startScan = async() => {
  const servers = await createServers()     
  const redis = servers['redis']
  const db = servers['db']
  
  // supports promise as well as other commands
  // redis.monitor().then(function (monitor) {
  //     monitor.on('monitor', function (time, args, source, database) {
  //       console.log(time + ": " + util.inspect(args));
  //     });
  //   });

  redis.subscribe('device', function (err, count) {
      console.log(`Currently tracking ${count} channels`)
  });

  redis.on('message', function (channel, msg) {        
    let msgObj = JSON.parse(msg)
    switch (msgObj.Context) {     
      case 'GeoFence':          
        console.log(`RECEIVED FROM: ${ channel } Message: ${msg}`);
        //db.collection('signals').insertOne(msgObj)
        break;
      default:
        console.log(`------No context detected-----`)    
    }
  });
  
}

startScan()
// let testmsg = 'Tests Started'
// require('../test')(testmsg)


//////////////////////////////////////////////////////////////////////////
///////  Configuration and Processing of raw packets from BLE    ////////
////////////////////////////////////////////////////////////////////////

// hexadecimal value
// adType values:
// https://www.bluetooth.com/specifications/assigned-numbers/generic-access-profile/
// services values:
// https://www.bluetooth.com/specifications/gatt/services/
let elementSchema = {
  "elementOne": {
    "length": '1 byte',
    "adType": '1 byte', // ie 1 = flag
    "value": '1 byte' // for adType of flag, the value is 8 bits, each bit sets a flag
  },
  "elementTwo": {
    "length": '1 byte',
    "adType": '1 byte', // ie 03 = services
    "value": "service" // ie 0x1809 = health thermometer - recorder in little endian order - ie 0x1809 = 0918
  },
  "elementThree": {
    "length": "1 byte",
    "adType": "1 byte",  // ie 09 = compete local name
    "value": "remainder up to 31 bytes"  // local name
  }
}
// go here to decode https://reelyactive.github.io/advlib/
let advname = 'c21d04acbe55daba16096164766c6962206279207265656c79416374697665'
let advurl =  'c21904acbe55daba1216aafe10fc017265656c7961637469766507'
let advservices =  'c21804acbe55daba1116aafe20000c4815200000004500000258' 
let thermometer = '020106030309181409546865726d6f6d65746572204578616d706c65'
let applenearby = '00150000007b209c02011a0bff4c0009060202c0a8006a'
let packets = [    
    applenearby
  ];

let processedPackets = advlib.process(packets, PROCESSORS);
console.log(processedPackets);

app.listen(PORT, () => {
  console.log(g(`Server listening on port ${PORT}`)) 
})










