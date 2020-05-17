var inboundChar;
var outboundChar;
var bluetooth_device;		
			// Define the codeless UUIDs 
var CODELESS_SVC_UUID 	= "866d3b04-e674-40dc-9c05-b7f91bec6e83";
var INBOUND_CHAR_UUID 	= "914f8fb9-e8cd-411d-b7d1-14594de45425";
var OUTBOUND_CHAR_UUID 	= "3bb535aa-50b2-4fbe-aa09-6b06dc59a404";
var CNTRL_CHAR_UUID		= "e2048b39-d4f9-4a45-9f25-1856c10d5639";

// Display text in log field text area 
function log(text)
{
	console.log(text);
}

// Scan, connect and explore CodeLess BLE device
async function ble_connect() {
	try {
		// Define a scan filter and prepare for interaction with Codeless Service
		log('Requesting Bluetooth Device...');
		bluetooth_device  = await navigator.bluetooth.requestDevice({
			filters: [{name: 'CLv2'}],
			optionalServices: [CODELESS_SVC_UUID]
		});		
		// Connect to device and perform attribute discovery
		log('Connecting to GATT Server...');
		server = await bluetooth_device.gatt.connect();
		dialog_elm = document.getElementById("ble_activity");
        dialog_elm.showModal();
  
		bluetooth_device.addEventListener('gattserverdisconnected', ble_disconnect_event);
		log('Exploring CodeLess Service...');
		const service = await server.getPrimaryService(CODELESS_SVC_UUID);
		log('  Mapping CodeLess Inbound Command Characteristic...');
		inboundChar = await service.getCharacteristic(INBOUND_CHAR_UUID);
		log('  Mapping CodeLess Outbound Command Characteristic...');
		outboundChar = await service.getCharacteristic(OUTBOUND_CHAR_UUID);
		log('  Mapping CodeLess Flow Control Characteristic...');
		const flowcontrolChar = await service.getCharacteristic(CNTRL_CHAR_UUID);
		// Subscribe to notifications
		await flowcontrolChar.startNotifications();
		flowcontrolChar.addEventListener('characteristicvaluechanged', incomingData);
		log('Ready to communicate!\n');
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
	// Read data from BLE CodeLess peer
	let readInValue = await outboundChar.readValue();
	let decoder = new TextDecoder('utf-8');
	// Log the incoming string (format slightly)
	log(" <- " + decoder.decode(readInValue).replace('\r','\r <- ').replace('\n','').replace('\0',''));
	message_received(decoder.decode(readInValue).replace('\r','\r <- ').replace('\n','').replace('\0',''));
}

// Send an AT command to the CodeLess BLE peer
async function sendAT(cmd) {
	// Display the command in the log
	log(' -> ' + cmd );
	// Append an extra character as expected by CodeLess
	var commandToSend = cmd + "\0";
	try{
		let encoder = new TextEncoder('utf-8');
		// Send command via GATT Write request 
		await inboundChar.writeValue(encoder.encode(commandToSend));
	} 
	catch(error) {
		log('Failed: ' + error);
	}
}

			
