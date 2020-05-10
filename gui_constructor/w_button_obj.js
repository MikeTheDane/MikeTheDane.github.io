
// HTML Templates

var w_button_use_html = `
  <button id="button_$id" onclick="w_button_use_handler($widget_index);" style="$style">$label
  </button>`;

var w_button_use_style ='margin:0 auto; display:block; border-radius:4px;';

function w_button_use_handler(widget_index)
{
	console.log("Button widget with Index: " + widget_index + " was pressed");
	navigator.vibrate(1000);
	// execute the user defined action for this widget
}

function w_button_constructor(widget_index)
{
	// Construct a button 
	//console.log("Constructing button widget with index: "+ widget_index);
    s = w_button_use_html;
	s = s.replace(/\$id/g, widgets[widget_index].id);
	s = s.replace(/\$widget_index/g, widget_index);
	s = s.replace('$label', widgets[widget_index].label);
	
    if(widgets[widget_index].style == null)
		s = s.replace("$style",w_button_use_style);
	else
		s = s.replace("$style",widgets[widget_index].style);

	return s;
}

function w_button_cfg(widget_index)
{
	let properties = [property_label, property_font_size, property_font_color, property_background_color, _g, property_output_data, _g, property_style_raw];
	let s = generate_cfg_widget("Button Widget", w_button_use_style, widget_index, properties);
	return s;
}

function w_new_button_widget(separator,widget_id)
{
	let new_widget = {"id":"","type":"button","label":"Button","expanded":true};
	new_widget.id = widget_id;
	widgets.splice(separator,0,new_widget);
}
