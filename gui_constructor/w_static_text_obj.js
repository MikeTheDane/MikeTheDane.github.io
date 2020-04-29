
var w_static_text_use_html = '<span id="$id" style="$style">$label</span>';
var w_static_text_use_style ='margin:0 auto; display:block;text-align: center;padding: 5px 5px 5px 5px;font-size:30px;background-color: black;color:white;';



var w_static_text_cfg_html = `Label: <input type="text" onchange="w_label_change($widget_index);" id="cfg_label_$id" value="$label"/>`;

function w_static_text_constructor(widget_index)
{
	
	//console.log("Constructing static text widget with index: "+ widget_index);

	let s = w_static_text_use_html;
	s = s.replace("$id", widgets[widget_index].id);
	s = s.replace('$label', widgets[widget_index].label);
	
	if(widgets[widget_index].style == null)
		s = s.replace("$style",w_static_text_use_style);
	else
		s = s.replace("$style",widgets[widget_index].style);

	return s;
}

function w_static_text_cfg(widget_index)
{
	let properties = [property_label, property_font_size, property_font_color, property_background_color, _g, property_style_raw];
	let s = generate_cfg_widget("Static Text Widget", w_static_text_use_style, widget_index, properties);
	return s;
}

function w_new_static_text_widget(separator,widget_id)
{
	let new_widget = {"id":"","type":"static_text","label":"Static Text","expanded":true ,"padding_top":"10px"};
	new_widget.id = widget_id;
	widgets.splice(separator,0,new_widget);
}