
var w_template_use_html = '<span id="$id" style="$style">$label</span>';
var w_template_use_style ='margin:0 auto; display:block;font-size: 30;text-align: center;padding: 5px 5px 5px 5px;';

var w_template_cfg_html = `Label: <input type="text" onchange="w_label_change($widget_index);" id="cfg_label_$id" value="$label"/>`;

function w_template_constructor(widget_index)
{
	// Construct a button 
	console.log("Constructing static text widget with index: "+ widget_index);

	let s = w_template_use_html;
	s = s.replace("$id", widgets[widget_index].id);
	s = s.replace('$label', widgets[widget_index].label);
	s = s.replace('$style', w_template_use_style);
	
	return s;
}

function w_template_cfg(widget_index)
{
	
	s = widget_cfg_html + w_template_cfg_html + "</div></div>";
	s = s.replace("$widget_type","Template Widget");
	s = s.replace(/\$id/g,widgets[widget_index].id);
	s = s.replace(/\$widget_index/g, widget_index);
	s = s.replace("$label",widgets[widget_index].label);

	return s;
}

function w_new_template_widget(separator,widget_id)
{
	let new_widget = {"id":"","type":"template","label":"Static Text", "expanded":true };
	new_widget.id = widget_id;
	widgets.splice(separator,0,new_widget);
}