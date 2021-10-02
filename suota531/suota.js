
  var spotar_mem_dev;
  var spotar_gpiomap;
  var spotar_mem_info;
  var spotar_patch_len;
  var spotar_patch_data;
  var spotar_serv_status;
  var firmware_ptr = 0;
  var chunk_sent = 0;

  var files;
  var position = 0;
  var infile;
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
  EEPROM_CMD =  [0x00,0x00,0x00,0x12];  // Target firmware is stored in bank with the oldest image

  //BLOCK_SIZE =  0xA0;                   // Bytes per block over the air (0xA0 = 160 decimal)
  BLOCK_SIZE =  0xF0;                   // Bytes per block over the air (0xF0 = 240 decimal)

  img_header = [0x70,0x51,0xAA,0x00, 0x0C,0x69,0x00,0x00, 0x50,0xD2,0xB6,0x0D,  
                0x36,0x2E,0x30,0x2E, 0x31,0x30,0x2E,0x35, 0x31,0x33,0x00,0xFF, 0xFF,0xFF,0xFF,0xFF,
                0xC0,0x9F,0xB6,0x62,
                0x00,0xFF,0xFF,0xFF, 0xFF,0xFF,0xFF,0xFF,
                0xFF,0xFF,0xFF,0xFF, 0xFF,0xFF,0xFF,0xFF,
                0xFF,0xFF,0xFF,0xFF, 0xFF,0xFF,0xFF,0xFF,
                0xFF,0xFF,0xFF,0xFF, 0xFF,0xFF,0xFF,0xFF
  ];

  function on_html_loaded(){
    // Setup the drag-and-drop listeners.
    var dropZone = document.getElementById('dropfile_card');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false); 
    document.getElementById('file-upload').addEventListener('change', handleFileSelectBrowse, false);
  }

  
  function log(text)
  {
    // Dump log data to text field
    var textarea = document.getElementById('log');
    textarea.value += "\n" + text;
    textarea.scrollTop = textarea.scrollHeight;
  }

  function progress(x,total){
    // Update the progressbar
    var bar = document.getElementById('bar');
    bar.style = "width:"+(100 * x/total).toString()+"%"; 
    document.getElementById('progresstext').innerHTML = x.toString()+" of "+total.toString()+" Bytes uploaded";
  }
    
  async function incomingData(event){
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
        log("Image was transferred - Verifying...");
        readInValue = await spotar_mem_info.readValue();
        let result = ((readInValue.getUint8(0) + 256 * readInValue.getUint8(1)));
        log("Bytes received by peer: "+(result+1));

        // Finalize
        await spotar_mem_dev.writeValue(new Uint8Array(FINAL_CMD));   

        // Reset the peer device
        try{ 
          await spotar_mem_dev.writeValue(new Uint8Array(RESET_CMD)); 
        }
        catch(err){}

        log("Update Completed."); 
        log("Update time: "+ (Date.now()-time_start)/1000+"s");
      }
    }
    // Error messages
    else if(x==0x07)
      log("Internal Memory Error. Not enough internal memory space for patch!");
    else if(x==0x08)
      log("Invalid memory device!");
    else if(x==0x09)
      log("Application error!");
    else if(x==0x11)
      log("Invalid image bank!");
    else if(x==0x12)
      log("Invalid image header!");
    else if(x==0x13)
      log("Invalid image size!");
    else if(x==0x14)
      log("Invalid product header!");
    else if(x==0x15)
      log("Same image error!");
    else if(x==0x16)
      log("Failed to read from external memory device!");
    
  }

  async function onDisconnected(){
    // Peer has disconnected or connection was lost
    document.getElementById("refresh_card").style.display = "inline";
    document.getElementById("dropfile_card").style.display = "none";
    document.getElementById("settings_icon").style.display = "none";
    document.getElementById("info_icon").style.display = "none";
    log("Peer has disconnected.");
  }
 
  async function connect_to_peer() {

    firmware_ptr = 0;
    chunk_sent = 0;
    position = 0;
    var name = "";
    var device;

    // Update GUI to match current activity
    document.getElementById("connect_card").style.display = "none";
    document.getElementById("progress_card").style.display = "none";
    document.getElementById("dropfile_card").style.display = "none";
    var textarea = document.getElementById('log');
    textarea.value = "";

    // Set BLE scan filters
    let options = {
        filters: [
          {services: [SPOTAR_SERVICE]}
        ],
        optionalServices: [SPOTAR_SERVICE]
      }
    
    // Try to connect to a BLE device
    try {
      log('Requesting Bluetooth Device...');

      device  = await navigator.bluetooth.requestDevice(options);
      device.addEventListener('gattserverdisconnected', onDisconnected);
     
      name = device.name;
      log("Connected to ["+name+"]");

      log('Connecting to GATT Server...');
      server = await device.gatt.connect();
      
      //log('Mapping SUotA Service...');
      const spotar_service = await server.getPrimaryService(SPOTAR_SERVICE);

      //log(' Getting SPOTA_SERV_STATUS Characteristic...');
      spotar_serv_status = await spotar_service.getCharacteristic(SPOTA_SERV_STATUS);
    
      //log('Subscribing to SPOTA_SERV_STATUS notifications ...');
      await spotar_serv_status.startNotifications();
      spotar_serv_status.addEventListener('characteristicvaluechanged', incomingData);

      //log(' Getting SPOTA_MEM_DEV Characteristic...');
      spotar_mem_dev = await spotar_service.getCharacteristic(SPOTA_MEM_DEV);
    
      //log(' Getting SPOTA_GPIOMAP Characteristic...');
      spotar_gpiomap = await spotar_service.getCharacteristic(SPOTA_GPIOMAP);
    
      //log(' Getting SPOTA_MEM_INFO Characteristic...');
      spotar_mem_info = await spotar_service.getCharacteristic(SPOTA_MEM_INFO);

      //log(' Getting SPOTA_PATCH_LEN Characteristic...');
      spotar_patch_len = await spotar_service.getCharacteristic(SPOTA_PATCH_LEN);
    
      //log(' Getting SPOTA_PATCH_DATA Characteristic...');
      spotar_patch_data = await spotar_service.getCharacteristic(SPOTA_PATCH_DATA);
      
      // Initialize SUotA
      await spotar_mem_dev.writeValue(new Uint8Array(FLASH_CMD)); 
      await spotar_gpiomap.writeValue(new Uint8Array(GPIO_CMD));
      await spotar_patch_len.writeValue(Uint8Array.of(BLOCK_SIZE,0x00));

      log('Ready to communicate.');

      // Update GUI to show that we are ready to receive a file
      document.getElementById("dropfile_card").style.display = "inline";
      
    } catch(error) {
      log('Failed: ' + error);
      document.getElementById("refresh_card").style.display = "inline";
      document.getElementById("settings_icon").style.display = "none";
      document.getElementById("info_icon").style.display = "none";
    }
  }

  function handleFileSelect(evt) {
    // A file or a group of files were selected by user
    evt.stopPropagation();
    evt.preventDefault();
    files = evt.dataTransfer.files; // FileList object.
    readBlob();
  }

  function handleFileSelectBrowse(evt) {
    // A file or a group of files were selected by user
    files = evt.target.files; // FileList object.
    readBlob();
  }

  function toBytesInt32 (num) {
    // Convert a 32bit integer to Arraybuffer of 4 bytes
    arr = new ArrayBuffer(4); 
    view = new DataView(arr);
    view.setUint32(0, num, true); // byteOffset = 0; littleEndian = false
    return arr;
  }

  function convert2bin(){
    // Intel Hexadecimal to binary file conversion 
    let tempStr = String.fromCharCode(0xFF).repeat(0x10000);
    let idx = 0;
    let temp_length = 0;
    while (idx < infile_length){
      let s = infile.substring(idx+7,idx+9);
      if(s == "00"){
        let address = parseInt(infile.substring(idx+3,idx+7),16);
        let len = parseInt(infile.substring(idx+1,idx+3),16);
        for(i=0;i<len;i++){
          let b = parseInt(infile.substring(idx+9+i*2,idx+11+i*2),16);
          tempStr =  tempStr.substring(0,address+i) + String.fromCharCode(b) + tempStr.substring(address+i+1);
        }
        temp_length = address + len;
      } 
      idx = infile.indexOf(":",idx + 1);
      if(idx<0)
        idx = infile_length;
    }
    log("File Conversion Complete.");
    infile = tempStr.substring(0, temp_length);
    infile_length = temp_length;
  }

  function readBlob(opt_startByte, opt_stopByte) {
    // Select the first file in the group of files selected by the user
    var file = files[0];
    // Strat reading in the file
    var reader = new FileReader();
    document.getElementById("dropfile_card").style.display = "none";
    reader.onloadend = function(evt) {
      // When file has been fully loaded:
      if (evt.target.readyState == FileReader.DONE) { 
        let filename = escape(file.name)
        log("Update File: "+filename)
        
        // Copy the loaded file into the infile string
        infile = evt.target.result;
        infile_length = file.size;

        // If a hex file was selected, convert it to binary
        if(filename.slice(filename.lastIndexOf('.') + 1) == "hex"){
          log("Converting hex file to binary...");
          convert2bin();
        }

        // If an img file was selected, peel off and dicard the image header from that file
        if(filename.slice(filename.lastIndexOf('.') + 1) == "img"){
          log("Removing image header");
          infile =  infile.substring(0x40);
          infile_length = infile_length - 0x40;
        }
        
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
        
        log("Updating...");

        // Display the progreess bar
        document.getElementById("progress_card").style.display = "inline";
        
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
        
        // Upload the image
        upload_image();
      }
    };

    // Read the selected file as a binary string
    var blob = file.slice(0,file.size);
    reader.readAsBinaryString(blob);
    
  }

  function handleDragOver(evt) {
    // Show when a file is dragged over the file drop zone
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; 
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

  function open_information(){
     // Update GUI to display the setttings card
    document.getElementById('information').setAttribute("style", "display:inline");
  }

  function close_information(){
     // Update GUI to display the setttings card
    document.getElementById('information').setAttribute("style", "display:none");
  }

  function open_settings(){
    // Update GUI to display the setttings card
    document.getElementById('settings_card').setAttribute("style", "display:inline");
    document.getElementById('settings').setAttribute("style", "display:none");
    document.getElementById('connect_card').setAttribute("style", "display:none");
    document.getElementById('logcard').setAttribute("style", "display:none");
  }

  function store_settings(result){
    // If settings was closed using the "Save" button
    if(result){
      // Fetch the GPIO settings from the GUI
      let spi_clk = document.getElementById('gpio_spi_clk').value;
      let spi_ss = document.getElementById('gpio_spi_ss').value;
      let spi_miso = document.getElementById('gpio_spi_miso').value;
      let spi_mosi = document.getElementById('gpio_spi_mosi').value;

      // Update the GPIO settings
      GPIO_CMD   =  [parseInt(spi_clk),parseInt(spi_ss),parseInt(spi_mosi),parseInt(spi_miso)];  

      // Update the settings view card
      document.getElementById('sw_gpio').innerHTML=
          "CLK=P" + spi_clk.substring(0,1) + "_" + spi_clk.substring(1,2) +
          ", SS=P" + spi_ss.substring(0,1) + "_" + spi_ss.substring(1,2) +
          ", MISO=P" + spi_miso.substring(0,1) + "_" + spi_miso.substring(1,2) +
          ", MOSI=P" + spi_mosi.substring(0,1) + "_" + spi_mosi.substring(1,2);
    }
    
    // Update the GUI to show initial state
    document.getElementById('settings_card').setAttribute("style", "display:none");
    document.getElementById('settings').setAttribute("style", "display:inline");
    document.getElementById('connect_card').setAttribute("style", "display:inline");
    document.getElementById('logcard').setAttribute("style", "display:inline");
  } 
