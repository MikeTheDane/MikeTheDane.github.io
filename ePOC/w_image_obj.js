
var w_image_use_html = '<div style="$box_style"><img id="$id" style="$style" src="$image"/></div>';

var w_image_use_style ='margin:0 auto; display:block;border-radius: 4px; padding-bottom: 10px;width:100%';

var w_image_cfg_defaults = {"id":"","type":"image","src":"img1","expanded":true,"deletethis":true};

function find_image_index_by_src(image_src)
{ 
  for(image_idx=0; image_idx<images.length; image_idx++)
  {
    if(images[image_idx].id == image_src)
	{
	  return image_idx;
	}
  }
  return -1;
}

function w_image_constructor(widget_index)
{
	// Construct an image 
	//console.log("Constructing image widget with index: "+ widget_index);

	let s = w_image_use_html;
	s = s.replace("$id", widgets[widget_index].id);

	let image_idx = find_image_index_by_src(widgets[widget_index].src);
	s = s.replace("$image", gui_json.images[image_idx].src );
    
	if(widgets[widget_index].style == null)
		s = s.replace("$style",w_image_use_style);
	else
		s = s.replace("$style",widgets[widget_index].style);

	if(widgets[widget_index].box_style == null)
		s = s.replace("$box_style",w_image_use_style);
	else
		s = s.replace("$box_style",widgets[widget_index].box_style);



    return s;	
}

function w_image_cfg(widget_index)
{
	let image_idx = find_image_index_by_src(widgets[widget_index].src);
    
    let properties = [property_style_raw, _g, property_image_selection, _g];
	let s = generate_cfg_widget("Image Widget", w_image_use_style, widget_index, properties);
	
    s = s.replace(/\$image/g,widgets[widget_index].src);

	let options = "";
	//<option>Image</option>
	for (let image_idx = 0; image_idx < images.length; image_idx++)
	{
		if(images[image_idx].id == widgets[widget_index].src)
			options = options + "<option selected>" + images[image_idx].id +" </option>"
		else
		 	options = options + "<option>" + images[image_idx].id +" </option>"
	}

	s = s.replace("$list_of_images",options);

	return s;
}

function w_new_image_widget(separator,widget_id)
{
	let new_widget = {"id":"","type":"image","src":"img1","expanded":true,"deletethis":true};
	new_widget.id = widget_id;
	
	widgets.splice(separator,0,new_widget);
}