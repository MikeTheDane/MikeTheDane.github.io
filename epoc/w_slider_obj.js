
// HTML Templates

var w_slider_use_html = `
  <div style="font-size:30px;color:white;padding: 5px 5px;text-align:center;display:inline-block;font-size: 16px;border-radius: 8px;margin:0 auto;display:block;">
  <input type = "range" id="slider_$widget_index" value="$value" max="$max" min="$min" 
  onchange="w_slider_use_handler($widget_index);" style="$style"></input>
  <span id="slider1_$widget_index" style="font-size:30px;color:white;">$value</span></div>`;

var w_slider_use_style ='padding: 15px 32px;';

function w_slider_use_handler(widget_index)
{
	//console.log("Slider widget with Index: " + widget_index + " was changed");
	//navigator.vibrate(50);
	let elm = document.getElementById("slider_"+widget_index);
	// execute the user defined action for this widget
	let val  =elm.value;
	widgets[widget_index].value = val;
	let cmd = widgets[widget_index].output  + val + "!";
	console.log("Trying to send command: "+cmd);
	sendAT(cmd);
	redraw();
}

function w_slider_constructor(widget_index)
{
	// Construct a button 
	//console.log("Constructing button widget with index: "+ widget_index);
    s = w_slider_use_html;
	s = s.replace(/\$id/g, widgets[widget_index].id);
	s = s.replace(/\$widget_index/g, widget_index);
	
    if(widgets[widget_index].style == null)
		s = s.replace("$style",w_button_use_style);
	else
		s = s.replace("$style",widgets[widget_index].style);

	s = s.replace("$min",widgets[widget_index].min);
    s = s.replace("$max",widgets[widget_index].max);
    s = s.replace(/\$value/g,widgets[widget_index].value);
    //console.log("----------------------"+s);
	return s;
}

function w_slider_cfg(widget_index)
{
	let properties = [property_style_raw, _g, property_output_data, _g, property_min_max, _g ];
	let s = generate_cfg_widget("Slider Widget", w_slider_use_style, widget_index, properties);
	return s;
}

function w_new_slider_widget(separator,widget_id)
{
	let new_widget = 
	{
		"type":"slider",
		"min":"0",
		"expanded":true,
		"output":"|00",
		"max":"100",
		"value":"0"
	};
	new_widget.id = widget_id;
	new_widget.style = w_slider_use_style;
	widgets.splice(separator,0,new_widget);
}