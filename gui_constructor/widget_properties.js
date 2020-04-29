var _g = "<hr/>";

var widget_cfg_html =
`<div class='widget_edit' id='$id_cfg' draggable='true' ondragstart='drag(event)' ondrop='drop(event,$widget_index)'
 onclick = 'expand_widget("cfg_details_$id")' style="text-align:center;"
 ondragover='allowDrop(event)'><b>$widget_type [$id]</b>
    <div id="cfg_details_$id" style="display:none;">
    <img src="hide.png" onclick='implode_widget("cfg_details_$id")' style="width: 15px;left: 35;position: absolute;"/>
    <img src="hide.png" onclick='remove_widget("$widget_index")' style="width: 15px;left: 60;position: absolute;"/>
    <div style"display:flex;text-align:left">`;

var property_label =
`Label <input type="text" onchange="w_label_change($widget_index);" id="cfg_label_$id" value="$label"/>`

var property_style_raw = 
`Styling (CSS) 
 <input type="text" size="50" onchange="w_styling_change($widget_index);" id="cfg_styling_$id" value="$style"/>
 <button id="$id" onclick="w_style_default_handler($widget_index,$default_style);">Use Default</button>`;

var property_input_filter =
`Input Filter (hex digits) <input type="text" onchange="w_filter_change($widget_index);" id="cfg_filter_$id" value="$filter"/>`;

var property_output_data = 
`Output (hex digits) <input type="text" onchange="w_output_data_change($widget_index);" id="cfg_output_$id" value="$output"/>`;

var property_parser =
`Start parsing at index 
 <input id="cfg_parser_start_$id" type="number" min="0" max="100" value="$parser_start_value" onchange="w_parser_start_change($widget_index);"/><br/>
 Parse incoming data as 
 <select id="cfg_parser_type_$id" onchange="w_parser_type_change($widget_index);">
   <option value="0">String</option>
   <option value="1">uint8</option>
   <option value="2">uint16</option>
   <option value="3">uint32</option>
 </select>
 <div style="display:$visibleA">
   <br/>Number of characters <input id="cfg_parser_length_$id" type="number" min="1" max="100" value="$value" onchange="w_parser_count_change($widget_index)"/>
 </div>
 <div style="display:$visibleB">
   <br>Parse as little-endian <input type="checkbox" id="cfg_endianess_$id" $checked onchange="w_parser_endianess_change($widget_index)"/>
 </div>`;

var property_font_size = `Font size <input type="number" min="1" max="100" value="14" onchange="w_font_size_changed($widget_index)"/>Pixels`;

var property_font_color =
`Font color <input type="color" id="font_color_$widget_index" value="#000000" onchange="w_font_color_changed($widget_index)">
 &nbsp;Opacity <input type="number" min="0" max="100" value="100" onchange="w_font_color_opacity_changed($widget_index)"/>%`;

var property_background_color =
`Background color <input type="color" id="b_color_$widget_index" value="#FFFFFF" onchange="w_b_color_changed($widget_index)">
 &nbsp;Opacity <input type="number" min="0" max="100" value="0" onchange="w_b_color_opacity_changed($widget_index)"/>%`;

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
	s = s.replace("$value",widgets[widget_index].parser_count);
	s = s.replace("$widget_type", widget_type);
	s = s.replace("$default_style","'"+ widget_style +"'");
	s = s.replace("$output","5566");

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
		s = s.replace("$filter",arrayToHexString(widgets[widget_index].trigger.filter));
    
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

function w_filter_change(widget_index)
{
  cfg_widget_id = "cfg_filter_"+widgets[widget_index].id;
  elm = document.getElementById(cfg_widget_id);
  widgets[widget_index].trigger.filter = hexStringToArray(elm.value);
  
  console.log("Widget w"+widget_index+" Filter was changed to "+elm.value);
  generate_filter_object();
  console.log("Filters Now "+JSON.stringify(trigger_filters));
  //check_widget_trigger_filters([99,99,4,0,11,22,33,44,55,77]);
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