  var spotar_mem_dev;
  var spotar_gpiomap;
  var spotar_mem_info;
  var spotar_patch_len;
  var spotar_patch_data;
  var spotar_serv_status;
  var firmware_ptr = 0;
  var chunk_sent = 0;

  var position = 0;
  var infile ="";
  var infile_length;

  var done;

  var time_start;

  SPOTAR_SERVICE = 0xFEF5;

  SPOTA_MEM_DEV     = "8082caa8-41a6-4021-91c6-56f9b954cc34";
  SPOTA_GPIOMAP     = "724249f0-5ec3-4b5f-8804-42345af08651";
  SPOTA_MEM_INFO    = "6c53db25-47a1-45fe-a022-7c92fb334fd4";
  SPOTA_PATCH_LEN   = "9d84b9a3-000c-49d8-9183-855b673fda31";
  SPOTA_PATCH_DATA  = "457871e8-d516-4ca1-9116-57d0b17b9cb2";
  SPOTA_SERV_STATUS = "5f78df94-798c-46f5-990a-b3eb6a065c88";

  RESET_CMD  =  [0x00,0x00,0x00,0xFD];  // Reset SUotA target command
  FINAL_CMD  =  [0x00,0x00,0x00,0xFE];  // Finalize SUotA command
  ABORT_CMD  =  [0x00,0x00,0x00,0xFF];  // Abort SUotA command
  
  GPIO_CMD   =  [0x04,0x01,0x00,0x03];  // SPI_CLK=P00, SPI_SS=P03, SPI_MOSI=P06, SPI_MISO=P05 (devkit defaults)

  FLASH_CMD  =  [0x00,0x00,0x00,0x13];  // Target firmware is stored in bank with the oldest image
  
  BLOCK_SIZE =  0xF0;                   // Bytes per block over the air (0xF0 = 240 decimal)

  img_header = [0x70,0x51,0xAA,0x00, 0x0C,0x69,0x00,0x00, 0x50,0xD2,0xB6,0x0D,  
                0x36,0x2E,0x30,0x2E, 0x31,0x30,0x2E,0x35, 0x31,0x33,0x00,0xFF, 0xFF,0xFF,0xFF,0xFF,
                0xC0,0x9F,0xB6,0x62,
                0x00,0xFF,0xFF,0xFF, 0xFF,0xFF,0xFF,0xFF,
                0xFF,0xFF,0xFF,0xFF, 0xFF,0xFF,0xFF,0xFF,
                0xFF,0xFF,0xFF,0xFF, 0xFF,0xFF,0xFF,0xFF,
                0xFF,0xFF,0xFF,0xFF, 0xFF,0xFF,0xFF,0xFF
  ];

 

  function progress(x,total){
    // Update the progressbar
    var bar = document.getElementById('bar');
    //bar.style = "height:20px;background-color: limegreen;width:"+(100 * x/total).toString()+"%"; 
    bar.style.width = (100 * x/total).toString()+"%"; 
    document.getElementById('progresstext').innerHTML = x.toString()+" of "+total.toString()+" Bytes uploaded";
  }
    
  async function incomingSuotaData(event){
    // Data was received from BLE peer
    let v = event.target.value;
    let x = v.getUint8(0);
    
    if( x == 0x02){
      progress(position,infile_length);
      if((position<infile_length))
        // More to upload - insert a slight delay
        setTimeout(function(){upload_image();},10);
      else if(!done){
        // Uploading complete
        done = true;
        // Verify that image was complely received by checking the peer byte count
        console.log("Image was transferred - Verifying...");
        readInValue = await spotar_mem_info.readValue();
        let result = ((readInValue.getUint8(0) + 256 * readInValue.getUint8(1)));
        console.log("Bytes received by peer: "+(result+1));

        // Finalize
        await spotar_mem_dev.writeValue(new Uint8Array(FINAL_CMD));   

        // Reset the peer device
        try{ 
          await spotar_mem_dev.writeValue(new Uint8Array(RESET_CMD)); 
        }
        catch(err){}

        console.log("Update Completed."); 
        console.log("Update time: "+ (Date.now()-time_start)/1000+"s");
        location.reload();
      }
    }
    // Error messages
    else if(x==0x07)
      console.log("Internal Memory Error. Not enough internal memory space for patch!");
    else if(x==0x08)
      console.log("Invalid memory device!");
    else if(x==0x09)
      console.log("Application error!");
    else if(x==0x11)
      console.log("Invalid image bank!");
    else if(x==0x12)
      console.log("Invalid image header!");
    else if(x==0x13)
      console.log("Invalid image size!");
    else if(x==0x14)
      console.log("Invalid product header!");
    else if(x==0x15)
      console.log("Same image error!");
    else if(x==0x16)
      console.log("Failed to read from external memory device!");
    
  }

  async function onSuotaDisconnected(){
    // Peer has disconnected or connection was lost
    //document.getElementById("refresh_card").style.display = "inline";
    //document.getElementById("dropfile_card").style.display = "none";
    //document.getElementById("settings_icon").style.display = "none";
    //document.getElementById("info_icon").style.display = "none";
    console.log("Peer has disconnected.");
  }
 
  async function connect_to_peer() {

    firmware_ptr = 0;
    chunk_sent = 0;
    position = 0;
    var name = "";
    var device;

    // Update GUI to match current activity
    //document.getElementById("connect_card").style.display = "none";
    //document.getElementById("progress_card").style.display = "none";
    //document.getElementById("dropfile_card").style.display = "none";
    //var textarea = document.getElementById('console.log');
    //textarea.value = "";

    // Set BLE scan filters
    let options = {
        filters: [{namePrefix: 'Static'}],
        optionalServices: [SPOTAR_SERVICE]
      }
    
    // Try to connect to a BLE device
    try {
      console.log('Requesting Bluetooth Device...');

      device  = await navigator.bluetooth.requestDevice(options);
      device.addEventListener('gattserverdisconnected', onSuotaDisconnected);
     
      name = device.name;
      console.log("Connected to ["+name+"]");

      console.log('Connecting to GATT Server...');
      server = await device.gatt.connect();
      
      //console.log('Mapping SUotA Service...');
      const spotar_service = await server.getPrimaryService(SPOTAR_SERVICE);

      //console.log(' Getting SPOTA_SERV_STATUS Characteristic...');
      spotar_serv_status = await spotar_service.getCharacteristic(SPOTA_SERV_STATUS);
    
      //console.log('Subscribing to SPOTA_SERV_STATUS notifications ...');
      await spotar_serv_status.startNotifications();
      spotar_serv_status.addEventListener('characteristicvaluechanged', incomingSuotaData);

      //console.log(' Getting SPOTA_MEM_DEV Characteristic...');
      spotar_mem_dev = await spotar_service.getCharacteristic(SPOTA_MEM_DEV);
    
      //console.log(' Getting SPOTA_GPIOMAP Characteristic...');
      spotar_gpiomap = await spotar_service.getCharacteristic(SPOTA_GPIOMAP);
    
      //console.log(' Getting SPOTA_MEM_INFO Characteristic...');
      spotar_mem_info = await spotar_service.getCharacteristic(SPOTA_MEM_INFO);

      //console.log(' Getting SPOTA_PATCH_LEN Characteristic...');
      spotar_patch_len = await spotar_service.getCharacteristic(SPOTA_PATCH_LEN);
    
      //console.log(' Getting SPOTA_PATCH_DATA Characteristic...');
      spotar_patch_data = await spotar_service.getCharacteristic(SPOTA_PATCH_DATA);
      
      // Initialize SUotA
      await spotar_mem_dev.writeValue(new Uint8Array(FLASH_CMD)); 
      await spotar_gpiomap.writeValue(new Uint8Array(GPIO_CMD));
      await spotar_patch_len.writeValue(Uint8Array.of(BLOCK_SIZE,0x00));
     document.getElementById("progress").style.display = "inline";
      console.log('Ready to update firmware');
      upload_image();
    } catch(error) {
      console.log('Failed: ' + error);
    }
  }

  function toBytesInt32 (num) {
    // Convert a 32bit integer to Arraybuffer of 4 bytes
    arr = new ArrayBuffer(4); 
    view = new DataView(arr);
    view.setUint32(0, num, true); // byteOffset = 0; littleEndian = false
    return arr;
  }
 

function createImage() {
        infile_length = latest_firmware.length;

        console.log("2nd Byte: "+latest_firmware[2]);        

        console.log("File Size: "+infile_length);

        for(let i=0;i<infile_length;i++)
          infile += String.fromCharCode(latest_firmware[i]);

        // Calculate the CRC
        let infile_crc32 = crc32(infile);
        // Get the current timestamp
        let timestamp = Math.floor(Date.now() / 1000);

        // Overwrite file length, crc and timestamp in the default image header
        img_header[7]  = 0xFF & (infile_length & 0xff000000) >> 24;
        img_header[6]  = 0xFF & (infile_length & 0x00ff0000) >> 16;
        img_header[5]  = 0xFF & (infile_length & 0x0000ff00) >> 8;
        img_header[4]  = 0xFF & (infile_length & 0x000000ff);

        img_header[11] = 0xFF & (infile_crc32 & 0xff000000) >> 24;
        img_header[10] = 0xFF & (infile_crc32 & 0x00ff0000) >> 16;
        img_header[9]  = 0xFF & (infile_crc32 & 0x0000ff00) >> 8;
        img_header[8]  = 0xFF & (infile_crc32 & 0x000000ff);

        img_header[31] = 0xFF & (timestamp & 0xff000000) >> 24;
        img_header[30] = 0xFF & (timestamp & 0x00ff0000) >> 16;
        img_header[29] = 0xFF & (timestamp & 0x0000ff00) >> 8;
        img_header[28] = 0xFF & (timestamp & 0x000000ff);
        
        // Prepend the created image header
        let temp_str = "";
        for(i=0;i<0x40;i++){
          temp_str = temp_str + String.fromCharCode(img_header[i]);
        }
        infile = temp_str + infile;
        infile_length = infile_length + 0x40;
        
        console.log("Updating...");
       
        // Calculate 8bit checksum and append it to the image
        let chksum = 0;
        for(i=0; i<infile_length; i++)
          chksum = 0xFF & (chksum ^ infile.charCodeAt(i));
        infile = infile + String.fromCharCode(chksum);
        infile_length++;

        // Prepare for the update process
        done = false;

        // Start counting the time it takes to update the image
        time_start = Date.now();
        
        console.log("Image is ready!!!");
  }



  async function upload_image(){
          
    // Upload the image in chunks of 20 bytes
    let chunks_sent = 0;
    let remaining = infile_length - position;
    if(remaining < BLOCK_SIZE){
      await spotar_patch_len.writeValue(Uint8Array.of(remaining,0x00));      
    }

    // As long as there is still data to upload...
    while( (position < infile_length) && (chunks_sent < (BLOCK_SIZE/20)) ){
      chunks_sent++;     
      if((infile_length - position) < 20){
        let data2 = new ArrayBuffer(infile_length - position);
        let dataview2 = new Uint8Array(data2);
        for(i=0; i<(infile_length - position);i++){
          dataview2[i] = infile.charCodeAt(position + i);
        }
        position = position + (infile_length - position);
        await spotar_patch_data.writeValueWithoutResponse(dataview2); 
        break;
      }

      let data = new ArrayBuffer(20);
      let dataview = new Uint8Array(data);
      for(i=0; i<20;i++){
        dataview[i] = infile.charCodeAt(position + i);
      }
      position = position + 20;
      await spotar_patch_data.writeValueWithoutResponse(dataview);      
    }
  }

//---------------------------------------------
// CRC FUNCTIONS
//---------------------------------------------

  var makeCRCTable = function(){
    // Construct a table for CRC
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
  }

  var crc32 = function(str) {
    // Calculate CRC of a string of char
    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
    var crc = 0 ^ (-1);
    for (var i = 0; i < str.length; i++ ) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  