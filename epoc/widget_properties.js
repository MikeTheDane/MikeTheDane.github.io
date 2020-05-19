var _g = "<hr/>";


var widget_cfg_html =
`<div class='widget_edit' id='$id_cfg' draggable='true' ondragstart='drag(event)' ondrop='drop(event,$widget_index)'
 onclick = 'expand_widget("cfg_details_$id")'
 ondragover='allowDrop(event)'><b>$widget_type [$id]</b>
    <div id="cfg_details_$id" style="display:none;">
    <img src="hide.png" onclick='implode_widget("cfg_details_$id")' style="border-radius: 3px;border: 1px solid black;width: 30px;height:30px;float:left;padding:5px;"/>
    <img src="delete.png" onclick='remove_widget("$widget_index")' style="border-radius: 3px;border: 1px solid black;width: 30px;height:30px;float:right;padding:5px;"/>
    <div style"display:flex;text-align:left">
    `;


var property_label =
`Label <input type="text" onchange="w_label_change($widget_index);" id="cfg_label_$id" value="$label"/>`


var property_style_raw = 
`<button id="$id" onclick="w_style_handler($widget_index,$default_style);">Styling</button>
`;

var property_input_filter =
`Filter <input type="text" onchange="w_filter_change($widget_index);" id="cfg_filter_$id" value="$filter"/>`;

var property_output_data = 
`Command <input type="text" onchange="w_output_data_change($widget_index);" id="cfg_output_$widget_index" value="$output"/>`;

var property_parser =
`Start parsing at index 
 <input id="cfg_parser_start_$id" type="number" min="0" max="100" value="$parser_start_value" onchange="w_parser_start_change($widget_index);"/><br/>
 Number of characters <input id="cfg_parser_length_$id" type="number" min="1" max="100" value="$value" onchange="w_parser_count_change($widget_index)"/>
 `;

 var property_parser_append = `
 Prepend String <input type="text" onchange="w_parser_prepend_change($widget_index);" id="cfg_prepend_$widget_index" value="$prepend"/>
 <br>Append String <input type="text" onchange="w_parser_append_change($widget_index);" id="cfg_append_$widget_index" value="$append"/>
 `;

var property_min_max =`Min value <input type="number" id="cfg_min_$widget_index" value="$min_value" onchange="w_min_changed($widget_index)"/><br/>
Max value <input type="number" id="cfg_max_$widget_index" value="$max_value" onchange="w_max_changed($widget_index)"/>`;

var property_font_size = `Font size <input type="number" min="1" max="100" value="14" onchange="w_font_size_changed($widget_index)"/>Pixels`;

var property_font_color =
`Font color <input type="color" id="font_color_$widget_index" value="#000000" onchange="w_font_color_changed($widget_index)">
 &nbsp;Opacity <input type="number" min="0" max="100" value="100" onchange="w_font_color_opacity_changed($widget_index)"/>%`;

var property_background_color =
`Background color <input type="color" id="b_color_$widget_index" value="#FFFFFF" onchange="w_b_color_changed($widget_index)">
 &nbsp;Opacity <input type="number" min="0" max="100" value="0" onchange="w_b_color_opacity_changed($widget_index)"/>%`;

var property_image_selection =
`Image
    <select id="image_selection_$widget_index" onchange="image_changed($widget_index)"> 
    $list_of_images
    </select>`;

var property_gauge = `
 Label <input type="text" onchange="w_label_change($widget_index);" id="cfg_label_$id" value="$label"/>
 <br>Unit <input type="text" onchange="w_gauge_unit_change($widget_index);" id="cfg_unit_$id" value="$unit"/>
 <br>Max Value<input type="number" id="cfg_max_$id" min="3" max="12000" value="$max" onchange="w_max_value_changed($widget_index)"/>
 `;


function redraw()
{
  draw_widgets();
  draw_config();
}

function generate_cfg_widget(widget_type, widget_style, widget_index, widget_properties)
{

    let  s = widget_cfg_html;
    for(let property_idx = 0; property_idx < widget_properties.length; property_idx++)
    {
    	if(property_idx == 0)
    	  s =s + "<hr/>"
    	else if ((widget_properties[property_idx] != _g)&&(widget_properties[property_idx-1] != _g))
    	  s = s + "<br/>";
    	s = s +widget_properties[property_idx];
    }

    s = s + "</div></div></div>";
	
    s = s.replace(/\$id/g,widgets[widget_index].id);
	s = s.replace(/\$widget_index/g,widget_index);
	
	// all very generic from here
	// Label:
	s = s.replace("$label",widgets[widget_index].label);

    // Data Parser
	s = s.replace('option value="'+widgets[widget_index].parser_style+'"','option selected value="'+widgets[widget_index].parser_style+'"');
	
	
	s = s.replace("$min_value",widgets[widget_index].min);
	s = s.replace("$max_value",widgets[widget_index].max);
	
    s = s.replace("$value",widgets[widget_index].parser_count);

	s = s.replace("$widget_type", widget_type);
	s = s.replace("$default_style","'"+ widget_style +"'");
	
	if(widgets[widget_index].output ==null)
	{
		widgets[widget_index].output = "|00";
	}
	
	s = s.replace("$output",widgets[widget_index].output);

	// Display style
	if(widgets[widget_index].style == null)
		s = s.replace("$style",widget_style);
	else
		s = s.replace("$style",widgets[widget_index].style);

	if(widgets[widget_index].parser_style != null)
	{
		s = s.replace("$parser_start_value",widgets[widget_index].parser_start);
	
		if(widgets[widget_index].parser_style == 0)
			s = s.replace("$visibleA","inline");
		else
			s = s.replace("$visibleA","none");

		// uint16 or uint32? Enable endianess checkbox
		if(widgets[widget_index].parser_style > 1) 
			s = s.replace("$visibleB","inline");
		else
			s = s.replace("$visibleB","none");

    	if(widgets[widget_index].parser_little_endian == 1)
    		s = s.replace("$checked","checked");
    	else
	    	s = s.replace("$checked","");
	}
    
    // Data filter:
	if(widgets[widget_index].trigger != null)
		s = s.replace("$filter",widgets[widget_index].trigger.filter);


	if(widgets[widget_index].prepend != null)
		s = s.replace("$prepend",widgets[widget_index].prepend);

	if(widgets[widget_index].append != null)
		s = s.replace("$append",widgets[widget_index].append);
  
 
    //console.log(s);

	return s;
}

 ///// Editor handlers

// Handles change of 'label' text in any widget type
function w_label_change(widget_index)
{
	let cfg_widget_id = "cfg_label_"+widgets[widget_index].id;
	let elm = document.getElementById(cfg_widget_id);
	widgets[widget_index].label = elm.value;
	console.log("Widget w"+widget_index+" Label was changed to "+elm.value);
	redraw();
}


function w_gauge_unit_change(widget_index)
{
	let cfg_widget_id = "cfg_unit_"+widgets[widget_index].id;
	let elm = document.getElementById(cfg_widget_id);
	widgets[widget_index].unit = elm.value;
	console.log("Widget w"+widget_index+" Unit was changed to "+elm.value);
	redraw();
}

function w_max_value_changed(widget_index)
{
	let cfg_widget_id = "cfg_max_"+widgets[widget_index].id;
	let elm = document.getElementById(cfg_widget_id);
	widgets[widget_index].max = elm.value;
	console.log("Widget w"+widget_index+" Max was changed to "+elm.value);
	redraw();
}


// Data parsing change handlers
function w_parser_type_change(widget_index)
{
  let cfg_widget_id = "cfg_parser_type_"+widgets[widget_index].id;
  let elm = document.getElementById(cfg_widget_id);
  widgets[widget_index].parser_style = elm.selectedIndex;
  console.log("Widget w"+widget_index+" Parser option was changed to "+elm.selectedIndex);
  redraw();
}

function w_parser_count_change(widget_index)
{
  let cfg_widget_id = "cfg_parser_length_"+widgets[widget_index].id;
  let elm = document.getElementById(cfg_widget_id);
  widgets[widget_index].parser_count = elm.value;
  console.log("Widget w"+widget_index+" Parserlength was changed to "+elm.value);
  redraw();
}

function w_parser_endianess_change(widget_index)
{
  let cfg_widget_id = "cfg_endianess_"+widgets[widget_index].id;
  let elm = document.getElementById(cfg_widget_id);

  if(elm.checked)
    widgets[widget_index].parser_little_endian = 1;
  else
    widgets[widget_index].parser_little_endian = 0;
  console.log("Widget w"+widget_index+" ("+cfg_widget_id+") Parser endianess was changed");
  redraw();
}

function w_parser_prepend_change(widget_index)
{
  let cfg_widget_id = "cfg_prepend_"+widget_index;
  let elm = document.getElementById(cfg_widget_id);
  widgets[widget_index].prepend = elm.value;
  console.log("Widget w"+widget_index+" Parser prepend was changed to "+elm.value);
  redraw();
}

function w_parser_append_change(widget_index)
{
  let cfg_widget_id = "cfg_append_"+widget_index;
  let elm = document.getElementById(cfg_widget_id);
  widgets[widget_index].append = elm.value;
  console.log("Widget w"+widget_index+" Parser append was changed to "+elm.value);
  redraw();
}

function w_output_data_change(widget_index)
{
	console.log("Output changed. Widget_idx:  "+widget_index);
	let elm_value = document.getElementById("cfg_output_"+widget_index).value; //button_$widget_index
	//let elm_value = document.getElementById("cfg_output_"+widget_index).value; 
	widgets[widget_index].output = elm_value;
	console.log("Value changed to  "+elm_value);
}

function w_filter_change(widget_index)
{
  cfg_widget_id = "cfg_filter_"+widgets[widget_index].id;
  let elm = document.getElementById(cfg_widget_id);
  widgets[widget_index].trigger.filter = elm.value;
  
  console.log("Widget w"+widget_index+" Filter was changed to "+elm.value);
  generate_filter_object();
  //console.log("Filters Now "+JSON.stringify(trigger_filters));
  redraw();
}

function w_parser_start_change(widget_index)
{
  cfg_widget_id = "cfg_parser_start_"+widgets[widget_index].id;
  elm = document.getElementById(cfg_widget_id);
  widgets[widget_index].parser_start = elm.value;
  console.log("Widget w"+widget_index+" Parser Start index was changed to "+elm.value);
  redraw();
}

// Style change handlers
function w_styling_change(widget_index)
{
  cfg_widget_id = "cfg_styling_"+widgets[widget_index].id;
  elm = document.getElementById(cfg_widget_id);
  widgets[widget_index].style = elm.value;
  console.log("Widget w"+widget_index+" styling was changed to "+elm.value);
  redraw();
}

function w_style_default_handler(widget_index, default_style)
{
  cfg_widget_id = "cfg_styling_"+widgets[widget_index].id;
  widgets[widget_index].style = default_style;
  console.log("Widget w"+widget_index+" styling was changed to default");
  redraw();
}

function w_min_changed(widget_index)
{
   let elm = document.getElementById("cfg_min_"+widget_index);
   widgets[widget_index].min = elm.value;
   if(widgets[widget_index].min > widgets[widget_index].value)
   {
   	 let slider = document.getElementById("slider_"+widget_index);
     slider.value = elm.value;

     let slider1 = document.getElementById("slider1_"+widget_index);
     slider1.value = elm.value;

     widgets[widget_index].value =  elm.value;
   }
   console.log("+++++++++"+elm.value);
   redraw();
}

function w_max_changed(widget_index)
{
   let elm = document.getElementById("cfg_max_"+widget_index);
   widgets[widget_index].max = elm.value;
   if(widgets[widget_index].max < widgets[widget_index].value)
   {
   	 let slider = document.getElementById("slider_"+widget_index);
     slider.value = elm.value;

     let slider1 = document.getElementById("slider1_"+widget_index);
     slider1.value = elm.value;

     widgets[widget_index].value =  elm.value;
   }

   redraw();
}

function display_styling(s)
{
	let result = "";
	s = s.replace(/; /g,';');
	for(let i=0;i<s.length;i++)
	{
		result = result + s.charAt(i);
		if (s.charAt(i) == ';')
			result = result + '\n';
	}
	return result;
}

function serialize_styling(s)
{
   return s.replace(/\r?\n|\r/g,"");
}

function styling_dialog_btn(button, widget_index)
{
	let dialog_elm = document.getElementById("advanced_styling"); 

    // Load Default button was pressed
    if(button == 0)
	{
		let content_elm = document.getElementById("styling_dialog_content"); 
	    let widget_type = widgets[widget_index].type;
	    if(widget_type == "dynamic_text")
	    	content_elm.value = display_styling(w_dynamic_text_use_style);
	    if(widget_type == "static_text")
	    	content_elm.value = display_styling(w_dynamic_text_use_style);
	    if(widget_type == "button")
	    	content_elm.value = display_styling(w_button_use_style);
		if(widget_type == "image")
	    	content_elm.value = display_styling(w_image_use_style);
	    if(widget_type == "progress_bar")
	    	content_elm.value = display_styling(w_progress_bar_use_style);
	     if(widget_type == "slider")
	    	content_elm.value = display_styling(w_slider_use_style);

	}
	// Cancel button was pressed
	if(button == 1)
	{
		dialog_elm.close();
	}

	// Accept button was pressed
	if(button == 2)
	{

		let content_elm = document.getElementById("styling_dialog_content"); 

		widgets[widget_index].style = serialize_styling(content_elm.value);
		dialog_elm.close();
		console.log(serialize_styling(content_elm.value));
		redraw();
	}
}


function project_settings()
{
  dialog_elm = document.getElementById("project_settings"); 
  console.log("Project Editor opened");
  let s = `Project Options<hr>
	
	<div class="tooltip" style="float:left;">
	<button id="showdialog1" style="float:left;background-color:lightgrey;width:250px;" onclick="save_project_locally();">Store Locally</button><br/><br/>
	<span class="tooltiptext">Save project to browser storage</span></div><br>
	
	<div class="tooltip" style="float:left;">
	<button id="showdialog2" style="float:left;background-color:lightgrey;width:250px;" onclick="upload_project();">Upload Project</button><br/><br/>
	<span class="tooltiptext">Upload a project from your harddrive</span></div><br>

	<div class="tooltip" style="float:left;">
	<button id="showdialog3" style="float:left;background-color:lightgrey;width:250px;" onclick="download_project();">Download Project</button><br/><br/>
	<span class="tooltiptext">Save project to your harddrive</span></div><hr/>

	<div class="tooltip" style="float:left;">
	<button id="showdialog3" style="float:left;background-color:lightgray;width:250px;" onclick="close_project_dialog();">Close</button>
    <span class="tooltiptext">Close this window</span></div>
`;

  dialog_elm.innerHTML = s;
  dialog_elm.showModal();
}

function draw_image_management()
{
  dialog_elm = document.getElementById("image_management"); 
  let s = `Images<hr><div style="height: 150px; overflow-y: scroll; overflow-x:hidden;border: 1px solid black;border-radius: 3px;"><table><tr>`;

  // List all images with a trash bin to the left
  for(let image_idx = 0; image_idx < images.length; image_idx++)
  {
  	s = s + `<td width="40px">
  					<img src="delete.png" onclick='delete_img(`+image_idx+`)' style="border-radius: 3px;border: 1px solid black;width: 15px;height:15px;padding:4px;"/></td>
  				<td style="font-size:20px;">`+images[image_idx].id +`</td></tr>`; 	
  }
  s = s + `</table></div><br/>
	
	<div class="tooltip">
	  <button id="showdialog1" style="float:left;background-color:lightgrey;width:250px;" onclick="upload_image();">Upload new image</button>
	  <span class="tooltiptext">Upload an image to browser storage</span>
	</div><hr/>
    
    <div class="tooltip">
	  <button id="showdialog3" style="float:left;background-color:lightgray;width:250px;" onclick="close_image_dialog();">Close</button>
      <span class="tooltiptext">Close this window</span>
    </div>		

`;

  dialog_elm.innerHTML = s;
}

function image_management()
{
  console.log("Image Management opened");
  draw_image_management();
  dialog_elm = document.getElementById("image_management"); 
  dialog_elm.showModal();
}

function w_style_handler(widget_index, default_style)
{
  dialog_elm = document.getElementById("advanced_styling"); 
  console.log("Widget "+widget_index+" Advanced styling dialog is open");
  let s = `Styling [$identity]<hr>
	<textarea id="styling_dialog_content" rows="10" style="width: 100%; resize: none;white-space: nowrap;  overflow: auto;font-size: 20px;font-family: "Lucida Console", Courier, monospace;">$styling</textarea><hr>
	<button id="showdialog1" style="background-color:orange" onclick="styling_dialog_btn(0,$widget_index);">Load Default</button>
	<button id="showdialog2" style="background-color:red" onclick="styling_dialog_btn(1,$widget_index);">Cancel</button>
	<button id="showdialog3" style="background-color:green" onclick="styling_dialog_btn(2,$widget_index);">Accept</button>`;
  
  s = s.replace("$styling", display_styling(widgets[widget_index].style));
  s = s.replace("$identity", widgets[widget_index].id);
  s = s.replace(/\$widget_index/g,widget_index);
  console.log("style "+ widgets[widget_index].style);
  dialog_elm.innerHTML = s;
  dialog_elm.showModal();
}

function save_project_locally()
{
	localStorage.setItem("project_script", JSON.stringify(gui_json));
	close_project_dialog();
}

function close_project_dialog()
{
	let dialog_elm = document.getElementById("project_settings"); 
	if(dialog_elm !=null)
		dialog_elm.close();
}

function download_project()
{
	var json_file_content = JSON.stringify(gui_json);
	var data = new Blob([json_file_content], {type: 'application/json'});

	var elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(data);
    elem.download = 'my_project.json';        
    document.body.appendChild(elem);
    elem.click();        
    document.body.removeChild(elem);
    close_project_dialog();
}

function upload_project()
{
	var elem = window.document.createElement('input');
	elem.type = "file";
	elem.accept = ".json";
	elem.id = "file-selector";
	elem.addEventListener
	('change', (event) => 
		{
      		const fileList = event.target.files;
      		console.log(fileList[0]);
      		var reader = new FileReader();
            reader.onload = function(event) {
         		console.log(event.target.result); 
         		gui_json = JSON.parse(event.target.result); 
         		images = gui_json.images;
				widgets = gui_json.widgets;
				next_new_widget_id = "w0";  
				localStorage.setItem("project_script", JSON.stringify(gui_json));        
         		redraw();
       		}
            reader.readAsText(fileList[0]);
    	}
    );
    document.body.appendChild(elem);
    elem.click();        
    document.body.removeChild(elem);
    close_project_dialog();     		
}

function close_image_dialog()
{
	let dialog_elm = document.getElementById("image_management"); 
	dialog_elm.close();
}

function delete_img(image_idx)
{
  images.splice(image_idx,1);
  draw_image_management();
}

function encodeImageFileAsURL(element) 
{
  var file = element.files[0];
  var reader = new FileReader();
  reader.onloadend = function() {
    console.log('RESULT', reader.result)
  }
  reader.readAsDataURL(file);
}

function upload_image()
{
   var elem = window.document.createElement('input');
	elem.type = "file";
	elem.accept = "image/*";
	elem.id = "file-selector";
	elem.addEventListener
	('change', (event) => 
		{
      		var file = elem.files[0];
  			var reader = new FileReader();
  			reader.onloadend = function() 
  			{
    			console.log('image file size: ' + elem.files[0].size + " octets");
    			if(elem.files[0].size > 3 * 1024 * 1024)
    			{
    				alert("Image size exceeds 3MB!\nUpload rejected.");
    			}
    			else
    			{
    				var img = {};
    				img.src = reader.result;
    				img.id = elem.files[0].name;
	    			images.push(img);
	    			localStorage.setItem("project_script", JSON.stringify(gui_json));        
         		    redraw();
    			}
    			draw_image_management();
  			}
  			reader.readAsDataURL(file);
    	}
    );
    document.body.appendChild(elem);
    elem.click();        
    document.body.removeChild(elem);
    draw_image_management();     	
}

function image_changed(widget_index)
{
	let image_id = document.getElementById("image_selection_" + widget_index).value;
	widgets[widget_index].src = image_id;
	redraw(); 
}