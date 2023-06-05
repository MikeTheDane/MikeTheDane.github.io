class ContextMenu{
    constructor(){

        // Initialize Context Menu Array
        this.menu = [];
        
        // Check if the Context Menu styles have already been inserted
        var idx;
        let found_styles = false;
        for(idx=0; idx < document.styleSheets.length; idx++){
            if(document.styleSheets[idx].cssRules.title == "Context menu styles"){
                found_styles = true;
                //console.log("Styles were already inserted")
            }
        }

        // Insert Context Menu styles if they are not already inserted
        if(found_styles==false){
            //console.log("Context menu styles must be inserted")
            
            // Create a new style sheet
            var sheet = (function() {
                // Create the <style> tag
                var style = document.createElement("style");
                    
                // Add the <style> element to the page
                document.head.appendChild(style);
            
                return style.sheet;
            })();

            // Context Menu Container
            sheet.insertRule(
                `div.ctx-container{
                    color:darkgrey; 
                    background-color: rgb(0,0,0,1); 
                    border-radius: 10px; 
                    width: 200px; 
                    font-size: 1em;
                    display: none;
                    position: absolute;
                    padding-top: 2px;
                    padding-bottom: 2px;
                    border: solid 1px black;
                    font-family: Verdana, sans-serif;
                 }`
            );
            // Group container
            sheet.insertRule(
                `div.ctx-group{
                    border-bottom: solid 1px grey;
                    padding-top: 5px; 
                    padding-bottom: 5px;
                 }`
            )

            // No group separator at the bottom of the context menu
            sheet.insertRule(
                `div.ctx-group:last-child{
                    border-bottom: 0px;
                 }`
            )
            
            // context menu item
            sheet.insertRule(
                `div.ctx-item{
                    color: #cacbcc;
                    background-color:rgb(0,0,0,1);
                    padding-left: 25px;
                    border-radius: 5px;  
                 }`
            )
            
            // Hover over highlight and mouse cursor to pointer (enabled items only)
            sheet.insertRule(
                `div.ctx-item-enabled:hover{
                    background-color: #12395f;
                    cursor: pointer;
                 }`
            )

            // Disabled menu item color control (standard cursor)
            sheet.insertRule(
                `div.ctx-item-disabled{
                    color:rgb(146, 137, 137) !important;
                    cursor: default;
                 }`
            )

            // Set the style sheet title to prevent multiple inserts
            document.styleSheets[idx].cssRules.title = "Context menu styles";
        }
        //console.log(document.styleSheets);

        // Add an event listener to detect is user clicks outside the context menu
        window.onclick = function (event) {
            var elm = document.getElementById('ctx-container');
            if(elm != null){
                //console.log("Removing context menu");
                elm.remove();
            }        
        }
    }

    // Append a context menu item
    appendItem(label=undefined, enabled=true, callback=undefined, keybdShortKey=undefined, icon=undefined){
        this.menu.push({label:label, enabled:enabled, callback:callback, keybdShortKey:keybdShortKey, icon:icon});
    }

    // User selected a menu item
    onselected(index){
        
        // Call appropriate callback (with user object as argument)
        let callback = this.menu[index].callback;
        
        if(callback !== undefined)
            callback(this.userObj); 
        
        // Clear menu items
        this.menu = [];
    }

    clearMenu(){
        // Clear menu items
        this.menu = [];
        let elm = document.getElementById('ctx-container');
        if(elm != null)
            elm.remove();
    }

    displayMenu(x,y,userObj={}){

        // Find the instance name
        for (var instance in window){
            if (window[instance] === this){
                console.log(instance);
                this.instance_name = instance;
            }          
        }

        // Create a non visible context menu div at the end of the document
        this.userObj = userObj;
        let container = document.createElement('div');
        container.setAttribute("class","ctx-container");
        container.setAttribute("id",'ctx-container');
        // Construct the menu groups and items
        let temp_str = "";

        // If the first menu item was not a group separator, then insert one at the top
        if (this.menu[0].label !== undefined) 
            temp_str += '<div class="ctx-group">';

        // Iterate through all the menu items and append them
        for(let i=0; i < this.menu.length; i++){
            // Was this a group separator ?
            if(this.menu[i].label === undefined)
                temp_str += '</div><div class="ctx-group">';
            else{
                // This was a menu item
                // Was this item enabled ?
                if(this.menu[i].enabled == true){
                    temp_str += '<div class="ctx-item ctx-item-enabled"';
                    // Register the on click handler
                    temp_str += 'onclick="' + this.instance_name+'.onselected('+i+');">';
                }
                else{
                    temp_str += '<div class="ctx-item ctx-item-disabled">';        
                }
                // Insert the label
                temp_str += this.menu[i].label+'</div>';
            }
        }
        
        // End the last group div
        temp_str += "</div>"
        
        container.innerHTML = temp_str;

        // Position and display the menu
        container.style.left = (5+x)+"px";
        container.style.top = (5+y)+"px";
        container.style.display = "block";
        document.body.appendChild(container);
    }


} // End of class