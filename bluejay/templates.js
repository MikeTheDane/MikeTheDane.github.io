let main_html_template =
`<!DOCTYPE html>
<html lang="en-US">

  <head>
      <title>Web Bluetooth</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>

  <body>
    <button id="connect-button" type="button" class="button" onclick="bleConnect();">
      Connect
    </button>
    <br/>
    <button id="disconnect-button" type="button" class="button" onclick="bleDisconnect();">
      Disconnect
    </button>

    <script>
    $javascript
    </script>

  </body>

</html>
`;

let main_template =
`
// UUID definitions$uuid_defines

// Global variables
var bleDevice;

// GATT characteristics (global)
$global_vars

// Incoming data handlers (notifications and indications)
$incoming_data_cbs
async function gatt_read_txt(characteristic){
    let s = await characteristic.readValue();
    return (new TextDecoder('utf-8')).decode(s);
}

async function gatt_write_txt(characteristic, text, with_response){
    if(with_response)
        await characteristic.writeWithResponse((new TextDecoder('utf-8')).encode(text));
    else
        await characteristic.writeWithoutResponse((new TextDecoder('utf-8')).encode(text));
}

async function onBleDisconnected(){
  console.log("Bluetooth connection terminated!");
}

async function bleDisconnect() {
  if (bleDevice.gatt.connected) {
    console.log("Disconnecting");
    bleDevice.gatt.disconnect();
  }
  else {
    console.log('Bluetooth Device is already disconnected');
  }
}


// Scan, connect and explore BLE device
async function bleConnect() {
  try {
    // Define a scan filter and prepare for connection
    console.log('Requesting Bluetooth Device...');
    bleDevice  = await navigator.bluetooth.requestDevice({
      filters: [{name: '$name'}],
      optionalServices: [$serviceUuids]
    }); 
    bleDevice.addEventListener('gattserverdisconnected', onBleDisconnected);  
    // Connect to device GATT and perform attribute discovery
    server = await bleDevice.gatt.connect();
    
    var service;
    $services&characteristics
    console.log("BLE Connected");

    console.log("Device name: "+ await gatt_read_txt(gatt_device_name));
  }
  catch(error) {
    console.log('Failed: ' + error);
  }
}
`;

let incoming_data_template =
`async function incoming_data_$charName() {
    let value = event.target.value;
    let dataLength = event.target.value.byteLength;
    
    // Get the first octet: let x = value.getUint8(0);
    // Get the 2nd octet: let x = value.getUint8(1);
    // Get a uint16 little-endian from 4th byte: let x = value.getUint32(3,true);
    // Get a uint32 little-endian from 3rd byte: let x = value.getUint32(2,true);
    // Get a uint32 big-endian from 2nd byte: let x = value.getUint32(1); 
    // Get text: let x = (new TextDecoder('utf-8')).decode(value);
    
}
`;

let exploration_template_svc =
`
    service = await server.getPrimaryService($service_uuid_SVC_UUID);`;

let exploration_template_char =
`
    $charName = await service.getCharacteristic($char_uuid_CHAR_UUID);`;

let exploration_template_char_ni =
`
    $charName = await service.getCharacteristic($char_uuid_CHAR_UUID);
    await $charName.startNotifications();
    $charName.addEventListener('characteristicvaluechanged', incoming_data_$charName);`;

