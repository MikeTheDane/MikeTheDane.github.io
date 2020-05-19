
var w_progress_bar_use_html = '<div style="margin:0 auto; display:block;padding-top: 4px;border-radius: 4px; padding-bottom: 4px;width:100%;text-align:center;"><progress id="w_progress_bar_value_$widget_index" value="$value" max="100"></progress></div>';

var w_progress_bar_use_style ='margin:0 auto; display:block;border-radius: 4px; padding-bottom: 10px;width:100%;text-align:center;';

var w_progress_bar_cfg_defaults = {"id":"","type":"progress_bar","$value":"0","expanded":true};


function w_progress_bar_constructor(widget_index)
{
	// Construct an progress bar 
	let s = w_progress_bar_use_html;
	
	s = s.replace("$widget_index", widget_index);

	
	s = s.replace("$value",widgets[widget_index].value);

    return s;	
}

function w_progress_bar_cfg(widget_index)
{
	
    let properties = [property_style_raw, _g, property_input_filter, _g, property_parser, _g ];
	let s = generate_cfg_widget("Progress Bar Widget", w_progress_bar_use_style, widget_index, properties);
	
    s = s.replace(/\$value/g,widgets[widget_index].value);

	
	return s;
}

function w_new_progress_bar_widget(separator,widget_id)
{
	
	let new_widget =  
	{	"type":"progress_bar",
		"expanded":true ,
		"trigger":{"s":0, "filter":"|00"},
		"parser_start":3,
		"parser_count":0,
		"parser_style":0,

	};


	new_widget.id = widget_id;
	new_widget.style = w_progress_bar_use_style;
	widgets.splice(separator,0,new_widget);
}