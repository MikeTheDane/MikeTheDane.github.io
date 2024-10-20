class TreeView{
    constructor(instance_name, tree_div_id, branch_selected_cb = null, branch_hover_cb = null){  
        this.instance_name = instance_name;
        this.tree_div_id = tree_div_id;
        this.branch_selected_cb = branch_selected_cb;
        this.branch_hover_cb = branch_hover_cb;

        // Set default colors
        this.selectedColor = "#cbf0f7"; // Light bluish color
        this.hoverOverColor = "lightgrey";
        this.selectedTextColor = "black";
        this.hoverOverTextColor = "black";
      
        // Find the background color, the text color and the font size of the TreeView element
        let elm = document.getElementById(tree_div_id);
        this.hoverAwayColor = window.getComputedStyle(elm).backgroundColor;
        this.textColor = window.getComputedStyle(elm).color;
        this.fontSize = window.getComputedStyle(elm).fontSize;
        this.fontSizeNumber = Number(this.fontSize.replace("px",""));
        this.iconColor = this.textColor;
        this.expandIconColor = "#606060";
        
        // Set the indent multiplier
        this.indentMultiplier = 1;
        
        // Start with an empty tree
        this.branch_idx = 0;
        this.list = [];

        // Branch template // viewBox="0 96 400 400"
        this.branch_template = `<table><tr style="vertical-align: center;"><td><svg id="expand_collapse-$uid" height="$expSize" width="$expSize" viewBox="0 0 100 100" onclick="$instance_name.expandClicked(this);"></svg></td><td>$branch_type</td><td><span class="branchname" style="font-size: $fontSize;vertical-align: center;horizontal-align:left;">$branch_name</span></td></tr></table>`;

        // Expansion Icons:
        this.can_expand ='<path style="fill:rgb(0,0,0,0);stroke:$icon-fill-color; stroke-width:15%;" d="M 10,10 L 50,50 L 10,90"/>';
        this.is_expanded = '<path style="fill:rgb(0,0,0,0);stroke:$icon-fill-color; stroke-width:15%;" d="M 10,50 L 50,80 L 90,50"/>';
        
        this.cannot_expand ="";

        // Branch Type icons
        this.document_icon = '<svg height="$fontSize" width="$fontSize" viewBox="0 96 960 960"><path style="fill:$icon-fill-color;" d="m388 976-20-126q-19-7-40-19t-37-25l-118 54-93-164 108-79q-2-9-2.5-20.5T185 576q0-9 .5-20.5T188 535L80 456l93-164 118 54q16-13 37-25t40-18l20-127h184l20 126q19 7 40.5 18.5T669 346l118-54 93 164-108 77q2 10 2.5 21.5t.5 21.5q0 10-.5 21t-2.5 21l108 78-93 164-118-54q-16 13-36.5 25.5T592 850l-20 126H388Zm92-270q54 0 92-38t38-92q0-54-38-92t-92-38q-54 0-92 38t-38 92q0 54 38 92t92 38Zm0-60q-29 0-49.5-20.5T410 576q0-29 20.5-49.5T480 506q29 0 49.5 20.5T550 576q0 29-20.5 49.5T480 646Zm0-70Zm-44 340h88l14-112q33-8 62.5-25t53.5-41l106 46 40-72-94-69q4-17 6.5-33.5T715 576q0-17-2-33.5t-7-33.5l94-69-40-72-106 46q-23-26-52-43.5T538 348l-14-112h-88l-14 112q-34 7-63.5 24T306 414l-106-46-40 72 94 69q-4 17-6.5 33.5T245 576q0 17 2.5 33.5T254 643l-94 69 40 72 106-46q24 24 53.5 41t62.5 25l14 112Z"/></svg>';
        
        this.folder_icon = 
            `<svg width="$fontSize" height="$fontSize" viewBox="0 0 12.7 12.7"><path style="fill:$icon-fill-color;stroke-width:0.0243999" d="M 8.5127099,11.847543 C 8.3768032,11.77575 8.3265868,11.684174 8.2699388,11.404805 8.2418324,11.266202 8.2157453,11.149451 8.211966,11.145359 c -0.00382,-0.0041 -0.1075411,0.05865 -0.2305763,0.139452 -0.4005572,0.263021 -0.4390234,0.252306 -0.9657962,-0.26904 L 6.6245407,10.62875 3.4878999,10.62235 0.35125911,10.61595 0.26509801,10.55023 C 0.0835374,10.411712 0.09777071,10.840978 0.10477956,5.7153387 l 0.006276,-4.5996147 0.050305,-0.067374 c 0.0276698,-0.037057 0.0806354,-0.090022 0.11769216,-0.11769218 0.0668414,-0.049896 0.0844147,-0.050305 2.17198538,-0.050305 H 4.555643 l 0.087675,0.066882 c 0.06388,0.048723 0.1314862,0.15302648 0.249087,0.38429998 L 5.0538114,1.6489557 H 8.276129 c 3.587239,0 3.320174,-0.012826 3.456769,0.1662276 l 0.06573,0.086161 0.0064,2.2572186 0.0064,2.2572187 0.142146,0.1480812 c 0.1551,0.161575 0.212199,0.2880824 0.188071,0.4166897 -0.0084,0.045338 -0.08156,0.1830955 -0.162356,0.3061347 -0.08079,0.1230406 -0.143545,0.2267982 -0.139453,0.2305762 0.004,0.00382 0.121758,0.030058 0.261483,0.058382 0.281654,0.057113 0.383682,0.1148952 0.450122,0.2549019 0.05967,0.1257284 0.05967,1.3702514 0,1.4959757 -0.06645,0.1400095 -0.168468,0.1977886 -0.450122,0.2549033 -0.139724,0.028339 -0.257391,0.054603 -0.261483,0.058382 -0.004,0.0038 0.05867,0.107541 0.139453,0.2305767 0.270976,0.412672 0.261286,0.440609 -0.369917,1.066654 -0.615276,0.610274 -0.634694,0.616738 -1.044414,0.347701 -0.12304,-0.08079 -0.226798,-0.143547 -0.230576,-0.139453 -0.0038,0.0041 -0.03006,0.121758 -0.05838,0.261483 -0.05711,0.281654 -0.114895,0.383682 -0.254903,0.45012 -0.072012,0.03418 -0.1820884,0.03988 -0.7516743,0.03896 -0.6119611,-9.87e-4 -0.6747366,
            -0.0051 -0.7568469,-0.04838 z m 1.0531512,-0.871644 c 0.050769,-0.257378 0.095739,-0.38607 0.1540081,-0.440815 0.092274,-0.08668 0.4515638,-0.231067 0.6025708,-0.242145 0.128785,-0.0094 0.1429,-0.0042 0.349764,0.129945 l 0.215564,0.13979 0.184775,-0.184773 0.184774,-0.184773 -0.139791,-0.215565 C 10.983379,9.7706969 10.978133,9.7565839 10.987582,9.6277995 c 0.01105,-0.1510077 0.155459,-0.510299 0.242145,-0.6025713 0.05474,-0.058273 0.183435,-0.1032296 0.440813,-0.1540094 l 0.1403,-0.027684 V 8.5785956 8.3136558 l -0.1403,-0.027683 C 11.413162,8.2352038 11.284472,8.1902328 11.229727,8.1319642 11.143047,8.0396902 10.998659,7.6804007 10.987582,7.529393 10.978182,7.4006083 10.983382,7.3864951 11.117526,7.1796292 L 11.257317,6.9640654 11.072543,6.7792917 10.887768,6.594518 10.674675,6.7325559 C 10.402946,6.9085785 10.334765,6.9124793 10.005242,6.7708543 9.8777535,6.7160605 9.7483944,6.6479639 9.7177803,6.6195423 9.6614719,6.5672453 9.616297,6.4369311 9.5658611,6.1812938 L 9.5381776,6.0409937 H 9.2732393 9.0082995 L 8.9806161,6.1812938 C 8.9298471,6.4386721 8.884877,6.5673639 8.826608,6.6221073 8.7343344,6.7088006 8.3750431,6.8531761 8.2240367,6.8642522 8.095252,6.8736665 8.0811375,6.8684818 7.8742729,6.7343079 L 7.6587077,6.5945167 7.4739354,6.7792904 7.2891617,6.964064 7.4289515,7.179628 C 7.5630982,7.3864938 7.5683456,7.400607 7.5588959,7.5293916 7.5478402,7.6803994 7.4034374,8.0396907 7.316751,8.131963 7.2620114,8.1902359 7.1333157,8.2351926 6.8759375,8.2859711 l -0.1403001,0.027683 v 0.2649397 0.2649397 l 0.1403001,0.027684 c 0.2573782,0.050782 0.3860701,0.095739 0.4408135,0.1540095 0.086693,0.092274 0.2310673,0.4515634 0.2421449,0.6025713 0.00942,0.1287846 0.00423,0.1428976 -0.1299444,0.3497637 l -0.1397898,0.215564 0.1847737,0.184774 0.1847723,
            0.184772 0.2155652,-0.13979 c 0.2068646,-0.134146 0.2209791,-0.139392 0.3497638,-0.129944 0.1510064,0.01106 0.510299,0.15546 0.6025713,0.242145 0.058273,0.05474 0.1032296,0.183437 0.1540081,0.440815 l 0.027683,0.140298 H 9.2732388 9.5381771 Z M 9.0170439,9.921823 C 8.5139338,9.813135 8.1339352,9.4689506 7.9650893,8.9690045 7.9019727,8.7821079 7.9021774,8.3740492 7.9654577,8.1882058 8.0785792,7.8561423 8.241962,7.6350186 8.5034211,7.4601449 8.9377524,7.1696461 9.4364925,7.1379827 9.901607,7.3713778 c 0.302567,0.151829 0.565738,0.466659 0.671753,0.803614 0.07055,0.2242481 0.07426,0.5953769 0.0079,0.7940114 C 10.388802,9.5453987 9.917904,9.909719 9.3341762,9.933833 9.2134005,9.938933 9.0706568,9.933464 9.0169777,9.921823 Z M 9.4534136,9.1345294 C 9.5874375,9.0949348 9.7895703,8.8927993 9.829169,8.758774 9.8930496,8.5425785 9.850317,8.3602702 9.6953497,8.1879166 9.46415,7.9307688 9.1195463,7.9254505 8.8698182,8.1752278 8.6198239,8.425222 8.6253812,8.7695364 8.8831892,9.0012928 9.0561105,9.1567635 9.2360311,9.1988167 9.4534504,9.1345799 Z M 6.6488364,9.7475629 c 0.036334,-0.054917 0.062503,-0.103148 0.058137,-0.1072 C 6.702607,9.6362697 6.5847237,9.6098278 6.4450035,9.5814895 6.1633486,9.5243762 6.0613196,9.4665943 5.9948822,9.3265862 c -0.059665,-0.1257284 -0.059665,-1.37025 0,-1.4959757 C 6.0613143,7.690601 6.1633486,7.6328233 6.4450035,7.5757086 6.5847265,7.5473703 6.702394,7.5211057 6.7064859,7.5173263 6.710579,7.5135061 6.6478308,7.4097852 6.5670331,7.2867502 6.2979961,6.8770297 6.3044606,6.8576131 6.9147339,6.242312 7.5407782,5.611109 7.5687153,5.6014204 7.981387,5.8723949 c 0.1230405,0.080785 0.2267983,0.1435459 0.2305761,0.1394542 0.00382,-0.0041 0.029866,-0.120844 0.057973,-0.2594468 0.057304,-0.2825703 0.1073634,-0.3722052 0.2479899,
            -0.4439448 0.087334,-0.04456 0.1452515,-0.048245 0.7567555,-0.048245 0.5633042,0 0.6747802,0.006 0.7465475,0.040032 0.140011,0.066446 0.197788,0.1684679 0.254903,0.4501227 0.02834,0.139723 0.0546,0.2573893 0.05838,0.2614825 0.0038,0.0041 0.107541,-0.058669 0.230576,-0.1394542 0.216088,-0.1418896 0.351264,-0.1937405 0.428161,-0.1642329 0.03235,0.012416 0.03678,-0.090118 0.03678,-0.8510115 V 3.9920245 L 8.2404379,3.9856119 5.4508404,3.9791993 5.3611591,3.9108024 C 5.2848898,3.8526249 5.1893812,3.6784565 4.7222609,2.7457046 L 4.1730385,1.6490185 H 2.526347 0.87965544 V 5.7482069 9.847397 H 3.7312045 6.5827536 Z M 11.03004,2.8202207 V 2.4298227 H 8.2361033 5.4421669 L 5.6376539,2.8202207 5.8331407,3.21062 H 8.4315902 11.03004 Z"/></svg>`;
    }

    // Returns the selected branch or 'undefined' if no branch is selected
    selectedBranch(){
        // Return -1 if no branch is currently selected
        for (let i=0; i < this.list.length; i++)
            if(this.list[i].selected == true)
                return i;
        return undefined;
    }

    // Returns the branch matching the uid or 'undefined' if no branch is selected
    findBranchIdx(uid){
        for(let i=0; i < this.list.length; i++)
            if(this.list[i].uid == uid)
                return i;  
        return undefined;
    }

    // Sets the user object for the branch matching the uid. Returns 'undefined' if uid wasn't found
    setUserObj(uid, object){
        let index = this.findBranchIdx(uid);
        if(index === undefined)
            return undefined;
        this.list[index].user = object;
        return 0;
    }

    // Returns the user object for the branch matching the uid. Returns 'undefined' if uid wasn't found
    getUserObj(uid){
        let index = this.findBranchIdx(uid);
        if(index === undefined)
            return undefined;
        return this.list[index].user;
    }

    // Sets the label of the the branch matching the uid. Returns 'undefined' if uid wasn't found
    setLabel(uid, label){
        let index = this.findBranchIdx(uid);
        if(index === undefined)
            return undefined;
        this.list[index].label = label;
        this.drawTree();
        return 0;
    }

    // Returns the label of the branch matching the uid. Returns 'undefined' if the branch wasn't found
    getLabel(uid){
        let index = this.findBranchIdx(uid);
        if(index === undefined)
            return undefined;
        return this.list[index].label;
    }

    // Appends a branch to tree. Appends a root node if uid wasn't found ou uid equals empty string
    append(uid, label, type, userObj = {}){
        let idx = this.branch_idx;
        let new_uid = this.tree_div_id + "-" + idx.toString();
        
        if(uid=="")
            uid = this.tree_div_id+"-undefined";

        // Find index of the branch with uid matching uid argument
        let index = this.findBranchIdx(uid);

        // If the uid was not found, apend to bottom
        if(index === undefined){
            index = this.list.length;
            let new_branch = {expanded:false, selected:false, type:type, level:0,label:label,uid:new_uid,user:userObj};
            this.list.push(new_branch);
        }
        else {
            // Find level of parent branch and increment
            let level = this.list[index].level + 1;

            // Find the index of the last sibling (the new child is to be appended at the bottom)
            let i;
            for(i = index+1; i < this.list.length; i++)
                if(this.list[i].level < level)
                    break;
            index = i;
            // Create new branch object
            let new_branch = {expanded:false, selected:false, type:type, level:level,label:label,uid:new_uid,user:userObj};
            this.list.splice(index, 0, new_branch);
        }
        // Create new branch object
        this.branch_idx++;
        this.drawTree();
        return new_uid;
    }

    // Appends a child node branch to the tree. Returns 'undefined' if no branch is selected or uid wasn't found
    appendChildAtSelection(label, type, userObj = {}, expand = true){
        let selected = this.selectedBranch();
        // console.log(selected);
        // Insert child branch only if a branch is currently selected by the user
        if(selected === undefined)
            return undefined;
        let selected_uid = this.list[selected].uid
        if(expand == true)
            this.list[this.selectedBranch()].expanded = true;
        let new_uid = this.append(selected_uid, label, type, userObj);
        return new_uid;          
    }

    // Removes a branch matching the uid. Returns 'undefined' if no branch is selected 
    removeSelectedBranch(){
        let selected = this.selectedBranch();
        // Remove branch only if a branch is currently selected by the user
        if(selected === undefined)
            return undefined;
        // Remove selected branch and all of its children
        let remove_count = 1;
        for(let i = selected+1; i<this.list.length; i++){
            if(this.list[i].level > this.list[selected].level)
                remove_count++;
            else
                break;
        }
        this.list.splice(selected,remove_count);
        this.drawTree();
        return 0;
    }

    // Expands the entire tree
    expandTree(){
        for(var i=0; i < this.list.length; i++){
            this.list[i].expanded = true;
        }  
        this.drawTree();
    }

    // Collapses the entire tree
    collapseTree(){
        for(var i=0; i < this.list.length; i++){
            this.list[i].expanded = false;
        }
        this.drawTree();
    }

    // Expand/collapse icon was clicked
    expandClicked(elm){
        event.stopPropagation();
        let parent_branch = elm.closest("div"); 
        let parent_idx = this.findBranchIdx(parent_branch.getAttribute("id"));
        if(this.list[parent_idx].expanded == false){
            elm.innerHTML = this.is_expanded;
            this.list[parent_idx].expanded = true;
        }
        else{
            elm.innerHTML = this.can_expand;
            this.list[parent_idx].expanded = false;
        }
        this.drawTree();
    }

    // A branch has been selected
    branchClick(elm, dblClick = false){
        // A branch was selected
        for (let i=0; i < this.list.length; i++){
            this.list[i].selected = false;
        }
        
        let branchIdx = this.findBranchIdx(elm.getAttribute("id"));
        
        this.list[branchIdx].selected = true;
        this.drawTree();
        
        // Call user to inform that a branch was selected. Provides branch object as argument
        this.branch_selected_cb(this.list[branchIdx].uid,this.list[branchIdx].user, dblClick);
    }

    // User double-clicked on a branch 
    branchDblClick(elm){
        // Double click event handler
        this.branchClick(elm, true);
    }

    // User mouse hovered over a branch
    branchMouseOver(elm){
        // Only color the hovered-over branch if it is not the selected branch
        if(this.list[this.findBranchIdx(elm.getAttribute("id"))].selected != true){
            elm.style.backgroundColor = this.hoverOverColor;
            elm.style.color = this.hoverOverTextColor;
        }
        // Callback
        let branchIdx = this.findBranchIdx(elm.getAttribute("id"));
        this.branch_hover_cb(this.list[branchIdx].uid,this.list[branchIdx].user, true);
    }

    // User mouse hovered away from a branch
    branchMouseLeave(elm){
        // Set the color of hovered-away branch if it is not the selected branch
        if(this.list[this.findBranchIdx(elm.getAttribute("id"))].selected != true){
            elm.style.backgroundColor = this.hoverAwayColor;
            elm.style.color = this.textColor;
        }
        // Callback
        let branchIdx = this.findBranchIdx(elm.getAttribute("id"));
        this.branch_hover_cb(this.list[branchIdx].uid,this.list[branchIdx].user, false);
    }

    // Draw or re-draw the tree
    drawTree(){
        // Clear tree before redrawing
        document.getElementById(this.tree_div_id).innerHTML = "";

        // Initialize the previous tree element to first element in tree
        let previous_uid = this.tree_div_id+"undefined";
        let previous_level = 0;
        let expansion_list = ["show"];

        /*
        // Match all icon colors to actual font color
        this.folder_icon = this.folder_icon.replace("$icon-fill-color",this.iconColor);
        this.document_icon = this.document_icon.replace("$icon-fill-color",this.iconColor);
        */

        this.folder_icon = this.folder_icon.replace("$fontSize",this.fontSizeNumber.toString()).replace("$fontSize",this.fontSizeNumber.toString());
        this.document_icon = this.document_icon.replace("$fontSize",this.fontSizeNumber.toString()).replace("$fontSize",this.fontSizeNumber.toString());
        
        this.is_expanded = this.is_expanded.replace("$icon-fill-color",this.expandIconColor);
        this.can_expand = this.can_expand.replace("$icon-fill-color",this.expandIconColor);

        // Calculate and modify the size of the expand/collapse icon (two-thirds of font size)
        let expander_size = 2 * this.fontSizeNumber / 3;
        this.branch_template = this.branch_template.replace("$expSize",expander_size.toString()).replace("$expSize",expander_size.toString());

        // Iterate over all branches in entire tree 
        for(let i=0; i < this.list.length; i++){
            
            let branch = this.list[i];
            let this_level = branch.level;

            // Set expansion icon of parent if this branch is a child                
            if(previous_level < this_level){
                let parent_element = document.getElementById(previous_uid);
                if(parent_element !== null){
                    let parent_idx = this.findBranchIdx(parent_element.getAttribute("id"));
                    if(this.list[parent_idx].expanded == true){
                        document.getElementById("expand_collapse-"+previous_uid).innerHTML=this.is_expanded;
                    }
                    else{
                        document.getElementById("expand_collapse-"+previous_uid).innerHTML=this.can_expand;
                    }
                }
            }
                        
            expansion_list = expansion_list.slice(0,this_level+1);
            
            if(expansion_list.slice(-1)=="show"){
                // Draw the branch
                var div = document.createElement('div');

                // Modify branch template
                let tempstr = this.branch_template.replace("$branch_name",branch.label);
                tempstr = tempstr.replace("$uid",branch.uid);
                tempstr = tempstr.replace("$uid",branch.uid);
                tempstr = tempstr.replace("$instance_name",this.instance_name);
                tempstr = tempstr.replace("$fontSize",this.fontSize);

                let type_icon = "";
                // Insert icon depending on branch type
                if(branch.type == 'root'){
                    //this.folder_icon = this.folder_icon.replace("$icon-fill-color",this.iconColor);
                    type_icon = this.folder_icon;
                }
                else{
                    type_icon = this.document_icon;
                }

                // Highlight branch if this is the selected branch
                if(branch.selected == true){
                    div.style.backgroundColor=this.selectedColor; 
                    div.style.color = this.selectedTextColor;
                    type_icon = type_icon.replace("$icon-fill-color",this.selectedTextColor);          
                }
                else{
                    type_icon = type_icon.replace("$icon-fill-color",this.iconColor);
                }
                tempstr = tempstr.replace("$branch_type",type_icon);

                // Insert modified template into branch
                div.innerHTML = tempstr;
                div.setAttribute('class', 'branch');
                div.setAttribute('onclick', this.instance_name+".branchClick(this);");
                div.setAttribute('ondblclick',this.instance_name+".branchDblClick(this);");
                div.setAttribute('id', branch.uid);
                div.setAttribute('data-type', branch.type);
                
                // Calculate branch indent based on branch level and font size used      
                div.style.paddingLeft = this.indentMultiplier*(branch.level)*(this.fontSizeNumber).toString() +"px";
                                    
                // Register hover functions
                div.setAttribute('onmouseover',this.instance_name+".branchMouseOver(this);");
                div.setAttribute('onmouseleave',this.instance_name+".branchMouseLeave(this);");
                
                // Prevent text selection when double-clicking on branch
                div.addEventListener('mousedown', function(e){ e.preventDefault(); }, false);

                // Append the branch to the tree
                document.getElementById(this.tree_div_id).appendChild(div);

                // Temporarily draw the expansion icon as cannot expand
                document.getElementById("expand_collapse-"+branch.uid).innerHTML = this.cannot_expand;

                // Prepare for drawing of next branch
                previous_level = branch.level;
                previous_uid = branch.uid;
            }
            else{
                // If we are not drawing the branch, it should be deselected
                branch.selected = false;
            }
            
            // Maintain the expansion list
            if(branch.expanded == true && expansion_list.slice(-1)=="show"){
                expansion_list.push("show");
            }
            else
                expansion_list.push("hide");                  
        }
    }
}  // End of class TreeView