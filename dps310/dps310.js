
var cmdChar;
var coefChar;
var bluetooth_device;
var coefValues;		
			
// Define the DPS310 UUIDs 
var DPS310_SVC_UUID = "2d86686a-53dc-25b3-0c4a-f0e10c8dee20";
var CMD_CHAR_UUID 	= "2d86686a-53dc-25b3-0c4a-f0e10c8dee21";
var COEF_UUID 	    = "2d86686a-53dc-25b3-0c4a-f0e10c8dee22";
var MEAS_UUID		= "2d86686a-53dc-25b3-0c4a-f0e10c8dee23";

// Display text in log field text area 
function log(text)
{
	console.log(text);
}

// Scan, connect and explore DPS310 BLE device
async function ble_connect() {
	try {
		// Define a scan filter and prepare for interaction with Codeless Service
		log('Requesting Bluetooth Device...');
		bluetooth_device  = await navigator.bluetooth.requestDevice({
			filters: [{name: 'DPS310'}],
			optionalServices: [DPS310_SVC_UUID]
		});		
		// Connect to device and perform attribute discovery
		log('Connecting to GATT Server...');
		server = await bluetooth_device.gatt.connect();
		dialog_elm = document.getElementById("ble_activity");
        dialog_elm.showModal();
  
		bluetooth_device.addEventListener('gattserverdisconnected', ble_disconnect_event);
		log('Exploring DPS310 Service...');
		const service = await server.getPrimaryService(DPS310_SVC_UUID);
		log('  Mapping DPS310 Inbound Command Characteristic...');
		cmdChar = await service.getCharacteristic(CMD_CHAR_UUID);
		log('  Mapping DPS310 Outbound Command Characteristic...');
		coefChar = await service.getCharacteristic(COEF_UUID);
		log('  Mapping DPS310 Flow Control Characteristic...');
		const measurementChar = await service.getCharacteristic(MEAS_UUID);
		// Subscribe to notifications
		await measurementChar.startNotifications();
		measurementChar.addEventListener('characteristicvaluechanged', incomingData);
		log('Ready to communicate!\n');
		// Request calibration coefficients 
		log('Requesting calibration coefficients\n');
		coefValues = await coefChar.readValue();
		
		parseCoef();        		

		ble_connection_completed();
	}
	catch(error) {
		log('Failed: ' + error);
		ble_connection_failed_or_disconnected();
	}
}

function ble_disconnect() {
  if (bluetooth_device) 
  {
  	log('Disconnecting from Bluetooth Device...');
  	if (bluetooth_device.gatt.connected) 
  	{
	    bluetooth_device.gatt.disconnect();
  	} 
  	else 
  	{
	    log('> Bluetooth Device is already disconnected');
  	}
  }
  ble_connection_failed_or_disconnected();
}

function ble_disconnect_event(event) {
  // Object event.target is Bluetooth Device getting disconnected.
  log('> Bluetooth Device disconnected');
  
  ble_connection_failed_or_disconnected();
}

// Incoming GATT notification was received
async function incomingData(event){
	// Read data from BLE DPS310 peer
    let v = event.target.value;
	notification_message_received(v);
}

// Send an AT command to the DPS310 BLE peer
async function sendCommand(cmd) {
	// Display the command in the log
	log(' -> ' + cmd );
	try{
		let encoder = new TextEncoder('utf-8');
		// Send command via GATT Write request 
		await inboundChar.writeValue(encoder.encode(cmd));
	} 
	catch(error) {
		log('Failed: ' + error);
	}
}

			
