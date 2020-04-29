
var w_dynamic_text_use_html = '<span  id="$id" style="$style">$label</span>';

var w_dynamic_text_use_style ='margin:0 auto; display:block;text-align: center;padding: 5px 5px 5px 5px;color:white';

function w_dynamic_text_constructor(widget_index)
{
	//console.log("Constructing dynamic text widget with index: "+ widget_index);

	let s = w_dynamic_text_use_html;
	s = s.replace("$id", widgets[widget_index].id);
	s = s.replace('$label', widgets[widget_index].label);
	
	if(widgets[widget_index].style == null)
		s = s.replace("$style",w_dynamic_text_use_style);
	else
		s = s.replace("$style",widgets[widget_index].style);
	return s;
}

function w_dynamic_text_cfg(widget_index)
{
	let properties = [property_label, property_font_size, property_font_color, property_background_color, _g, property_parser, _g, property_input_filter, _g, property_style_raw];
	let s = generate_cfg_widget("Dynamic Text Widget", w_dynamic_text_use_style, widget_index, properties);
	return s;
}

function w_new_dynamic_text_widget(separator,widget_id)
{
	let new_widget =  {"id":"","type":"dynamic_text","label":"Dynamic Text","expanded":true ,"trigger":{"s":0, "filter":[99,99]},"parser_start":1,"parser_count":4,"parser_style":2,"parser_little_endian":1};
	new_widget.id = widget_id;
	widgets.splice(separator,0,new_widget);
}