
var w_toggle_use_html = `<div style="$style"><svg
   viewBox="0 0 18.466116 10.0089"
   height="12mm"
   width="20mm"
   onclick="toggle($widget_index);">
  <g
     transform="translate(-0.78330716,-286.70389)"
     id="layer1">
    <g
       id="toggle_$widget_index">
      <ellipse
         style="opacity:1;fill:#4d4d4d;fill-opacity:1;fill-rule:evenodd;stroke:#4d4d4d;stroke-width:0.46499997;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.55072464"
         id="path6600"
         cx="10.016365"
         cy="291.70834"
         rx="9.0005579"
         ry="4.7719498" />
      <ellipse
         style="opacity:1;fill:grey;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:0.76499999;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
         id="$led_$widget_index"
         cx="9.9454956"
         cy="291.68472"
         rx="8.3863468"
         ry="4.0868678" />
      <ellipse
         style="display:inline;opacity:1;fill:#000000;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:0.46499997;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
         id="left_circle_$widget_index"
         cx="6.5437016"
         cy="291.66107"
         rx="3.0238094"
         ry="2.8348215" />
      <ellipse
         style="display:none;opacity:1;fill:#000000;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:0.46499997;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
         id="right_circle_$widget_index"
         cx="13.347275"
         cy="291.61386"
         rx="3.0238094"
         ry="2.8348215" />
    </g>
  </g>
</svg></div>`;

var style_show = "display:inline;opacity:1;fill:#000000;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:0.46499997;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1";
var style_hide = "display:none;opacity:1;fill:#000000;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:0.46499997;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1";


var w_toggle_use_style = `font-size: 30px; color:black; margin:0 auto; display:block;text-align: center; padding: 5px 5px 5px 5px;`;

function toggle(widget_index)
{
	//console.log("Toggle here");
	// Waht is the current value of toggle switch?
	let toggle_state = widgets[widget_index].value;

	//console.log(JSON.stringify(widgets[widget_index]));

  	let elm_left=document.getElementById("left_circle_"+ widget_index);
	let elm_right=document.getElementById("right_circle_"+ widget_index);
	let elm_led=document.getElementById("$led_"+widget_index);
 	console.log("Toggle state is "+toggle_state);
  
	if (toggle_state == "1")
  	{
    	toggle_state="0";
		elm_left.style= style_hide;
	 	elm_right.style = style_show;
	 	elm_led.style = "opacity:1;fill:grey;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:0.76499999;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1";
  	}
  	else
  	{
    	toggle_state="1";
		elm_left.style=style_show;
	 	elm_right.style = style_hide;
	 	elm_led.style = "opacity:1;fill:grey;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:0.76499999;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1";
  	}
  	
  	widgets[widget_index].value = toggle_state;
  	let cmd = widgets[widget_index].output + toggle_state +"!";
	console.log("Trying to send command: "+cmd);
	sendAT(cmd);
}

function remote_toggle(widget_index, toggle_state)
{
  let elm_left=document.getElementById("left_circle_"+ widget_index);
  let elm_right=document.getElementById("right_circle_"+ widget_index);
  let elm_led=document.getElementById("$led_"+widget_index);
  
  console.log("Toggle state is "+toggle_state);

  if (toggle_state == "0")
  	{
		elm_left.style= style_show;
	 	elm_right.style = style_hide;
	 	elm_led.style = "opacity:1;fill:red;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:0.76499999;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1";
  	}
  	else
  	{
		elm_left.style=style_hide;
	 	elm_right.style = style_show;
	 	elm_led.style = "opacity:1;fill:limegreen;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:0.76499999;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1";
  	}
  	
}

function w_toggle_constructor(widget_index)
{
	//console.log("Constructing dynamic text widget with index: "+ widget_index);

	let s = w_toggle_use_html;
	s = s.replace(/\$widget_index/g,widget_index);
	if(widgets[widget_index].style == null)
		s = s.replace("$style",w_toggle_use_style);
	else
		s = s.replace("$style",widgets[widget_index].style);
	return s;
}

function w_toggle_cfg(widget_index)
{
	let properties = [
		property_style_raw, _g, property_input_filter, property_parser, _g, property_output_data,_g];

	let s = generate_cfg_widget("Toggle Switch Widget", w_toggle_use_style, widget_index, properties);
	return s;
}

function w_new_toggle_widget(separator,widget_id)
{
	let new_widget =  
	{	"type":"toggle",
		"expanded":true ,
		"trigger":{"s":0, "filter":"|10"},
		"value":"0",
		"output":"|00",
		"parser_start":3,
		"parser_count":0,
		"parser_style":0
	};

	new_widget.style = w_toggle_use_style;
	new_widget.id = widget_id;

	widgets.splice(separator,0,new_widget);
}