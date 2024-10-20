class BluetoothDevicePicker{
    
    constructor(user_callback){
        
        this.user_callback = user_callback;

        
        this.USER_CANCELLED = 0;
        this.USER_SELECTED =  1;
        this.USER_RESCAN =    2;
        
        
        this.isListEmpty = true;
        this.selectedDevice = "";
        this.firstRun = true;
        this.instanceName = "";

        this.dialog_style = 
        `   width: 300px; padding-top: 3px; padding-left: 5px; padding-right:5px;border-radius: 10px;
            border: 1px solid darkgrey;box-shadow:1px 2px rgba(0,0,0,0.3);
        `
        
        this.dialog_template = 
        `   <small>This application wants to pair</small><br/>    
            <div id="blescanlist" style ="height:350px; margin-top:5px;margin-bottom:15px;overflow-y: auto;overflow-x:hidden;">
                <div style="width:100%;text-align:center; padding-top:160px">
                    <small>No compatible devices found.</small>
                </div>
            </div>
            <div id="blescanspinner"><div class="blescanspinner"></div>
            <div style="float:left;padding-left:10px;">Scanning...</div></div>
            <button id="rescanbtn" style="display:none;" onclick="thispickerinstance.reStartBleScan();">Re-scan</button>
            <button id="cancelbtn" style="float:right;" onclick="thispickerinstance.closeDialog(false)">Cancel</button>
            <button id="pairbtn" style="float:right;margin-right: 10px;" onclick="thispickerinstance.closeDialog(true)" disabled>Pair</button>
        `;

        this.scanlist_template = `<div style="width:100%;text-align:center; padding-top:160px"><small>No compatible devices found.</small></div>`

        this.device_style = "width:99%; border:1px solid lightgrey; border-radius:4px;margin-bottom:2px;background-color: rgb(0,0,0,0.05);"

        this.device_template = 
        `   <table width="100%">
                <tr><td>$bdname</td><td align="right"><div id="rssigraph$bdaddress">$rssigraph</div></td></tr>
                <tr><td style="font-size:8px;padding-top:0px;">$bdaddress</td>
                <td style="font-size:8px;text-align:right;padding-top:0px;"><span id="rssinumber$bdaddress">$rssi</span> dB</small></td></tr>
            </table>
        `;

        this.spinner_style = `
            .blescanspinner {
                float: left;
                border: 3px solid #f3f3f3;
                border-radius: 50%;
                border-top: 3px solid #3498db;
                width: 14px;
                height: 14px;
                -webkit-animation: spin 1s linear infinite; /* Safari */
                animation: blescanspinner 1s linear infinite;
            }
            
            /* Safari */
            @-webkit-keyframes blescanspinner {
                0% { -webkit-transform: rotate(0deg); }
                100% { -webkit-transform: rotate(360deg); }
            }
            
            @keyframes blescanspinner {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;

        this.signalstrength_template =
        `   <svg width="20" height="20" viewBox="0 0 20 28">
                <rect style="fill:#008000; stroke:none; stroke-width:1" ry="1" width="3" height= "4"  x="2" y="20" />    
                <rect style="fill:$1"; stroke:none; stroke-width:1" ry="1" width="3" height= "8"  x="6" y="16" />
                <rect style="fill:$2"; stroke:none; stroke-width:1" ry="1" width="3" height="12" x="10" y="12" />
                <rect style="fill:$3"; stroke:none; stroke-width:1" ry="1" width="3" height="16" x="14" y= "8"  />
                <rect style="fill:$4"; stroke:none; stroke-width:1" ry="1" width="3" height="20" x="18" y= "4"  />
            </svg>
        `;

        // Add the scan spinner style to the DOM but only once
        if(this.firstRun){
            const style = document.createElement('style');
            style.innerHTML = this.spinner_style;
            document.head.appendChild(style);
            this.firstRun = false;   
        }
    }

    // Restart scanning
    reStartBleScan(){
        //console.log("User is requesting scanner to be restarted")
        document.getElementById("blescanspinner").style.display = "inline";
        document.getElementById("rescanbtn").style.display = "none";
        document.getElementById("blescanlist").innerHTML = this.scanlist_template;
        this.isListEmpty = true;
        this.user_callback(this.USER_RESCAN);
    }

    // Open the device selector dialog
    openSelectorDialog(){
        // Find the name of this class instance (used in onclick handlers)
        for(var instance in window){
            if(window[instance] === this){
                this.instanceName = instance;
            }
        }

        // Reset the scan list properties
        this.isListEmpty = true;
        this.selectedDevice = "";

        // Create the device picker dialog
        var dlg = document.createElement('dialog');
        let s = this.dialog_template;
        // Modify onclick handlers so they use the correct class instance name
        s = s.replace("thispickerinstance",this.instanceName);
        s = s.replace("thispickerinstance",this.instanceName);
        s = s.replace("thispickerinstance",this.instanceName);
        dlg.innerHTML = s;
        dlg.style = this.dialog_style;
        dlg.setAttribute("id","myDialog");

        // Append the dialog to the body element and open the dialog
        document.body.appendChild(dlg);
        document.getElementById("myDialog").showModal();
    }
    
    // User has closed the dialog by either pairing with a device or by cliclking cancel 
    closeDialog(success){
        if(success){
            //console.log("User wants to pair with: " + this.selectedDevice);
            this.user_callback(this.USER_SELECTED);
        }
        else{
            //console.log("User pressed cancel")
            this.user_callback(this.USER_CANCELLED);
        }
        // Close and remove the scan picker dialog entirely
        document.getElementById("myDialog").close();
        document.getElementById("myDialog").remove();
    }

    // User has clicked on a displayed device
    bledeviceclick(address){
        this.selectedDevice = address;
        let parentElement = document.getElementById("blescanlist");
        // Iterate through and clear any already highlighted device
        for (const child of parentElement.children) {
            child.style.backgroundColor = "rgb(0,0,0,0.05)";
        }
        //console.log("User highlighted: "+address);
        // Highlight the selected device
        let s = "bleDeviceId"+address.split(":").join("");
        document.getElementById(s).style.backgroundColor = "lightblue";
        document.getElementById("pairbtn").disabled = false;
    }

    // Creates a signal strength icon based on the RSSI
    createRssiGraph(rssi){
        // Load the template
        var signalstrength = this.signalstrength_template;
        for(let i=1;i<5;i++){
            let f = "$" + i.toString();
            if(rssi >= (-105+20*i))
                // Green bar
                signalstrength = signalstrength.replace(f,"#008000");
            else
                // Grey bar
                signalstrength = signalstrength.replace(f,"#cccccc");
        }
        return signalstrength; 
    }

    // Update only the RSSI (graph and value field) for a device already on the list
    deviceKnown(address,rssi){
        let s = "rssigraph"+address.split(":").join("");
        //console.log("Looking for "+s);
        document.getElementById(s).innerHTML =  this.createRssiGraph(rssi);
        s = "rssinumber"+address.split(":").join("");
        document.getElementById(s).innerHTML = rssi.toString();          
    }

    // Create a new device object
    deviceUnknown(name,address,rssi){
        let scanlistDiv = document.getElementById("blescanlist");
        // If this is the first device, make sure that the scanlist is cleared first
        if(this.isListEmpty){
            scanlistDiv.innerHTML = "";
            this.selectedDevice = "";
            this.isListEmpty = false;
        }
        
        // Modify the device element using the template
        let s = this.device_template;            
        s = s.replace("$rssigraph", this.createRssiGraph(rssi));
        s = s.replace("$rssi",rssi.toString());
        s = s.replace("$bdaddress",address.split(":").join(""));
        s = s.replace("$bdaddress",address);
        s = s.replace("$bdaddress",address.split(":").join(""));
        s = s.replace("$bdname",name);
        // Create the device element 
        var device = document.createElement('div');
        device.id = "bleDeviceId" + address.split(":").join("");
        device.style = this.device_style;
        device.innerHTML = s;
        // Modify the onclick handler so it uses the name of this class instance
        device.setAttribute("onclick", this.instanceName+".bledeviceclick('"+ address +"')");
        scanlistDiv.appendChild(device);
    }

    deviceUpdate(name,address,rssi){
        let device_element = document.getElementById("bleDeviceId" + address.split(":").join(""));
        if(device_element === null)
            this.deviceUnknown(name,address,rssi)
        else
            this.deviceKnown(address,rssi)
    }

    // Scan timeout call. Hides the spinner and enables the re-scan button
    scantimeout(){
        document.getElementById("blescanspinner").style.display = "none";
        document.getElementById("rescanbtn").style.display = "inline";
    }

}