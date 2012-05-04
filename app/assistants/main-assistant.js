function MainAssistant() {
	
}

MainAssistant.prototype.setup = function() {
	this.controller.enableFullScreenMode(true);
	if(screen.width == 320){
		var container_height = screen.height - 40 + "px"
	}
	else{
		var container_height = screen.height - 60 + "px";
	}
	
	this.controller.stageController.setWindowOrientation("up");
	
	
	this.controller.get("NEV").className = "NEV_" + screen.width;
	this.controller.get("BODY_CONTAINER").style.height = container_height;
	this.controller.get("list_contianer").style.height = container_height;
	this.controller.get("channel_list_container").style.height = container_height;
	
	this.spinner = this.controller.setupWidget("main_spinner",
		{spinnerSize: Mojo.Widget.spinnerLarge}, {spinning: true}); 
	this.spinner = this.controller.get("main_spinner");
	this.spinner.style.top = screen.height/2 - 64 + "px";
	
	this.controller.setupWidget("search_value",
			  attributes = {
			      hintText: $L("输入搜索视频"),
			      multiline: false,
			      enterSubmits: false,
			      focus: true
			  },
			  model = {
			      value: "",
			      disabled: false
			  }
			); 
			
	
	this.controller.setupWidget("channel_list_scroller",{},{ mode: "vertical"});
	this.controller.setupWidget("video_list_scroll",{},{ mode: "vertical"}); 
	this.video_list = new VideoListView("video_list");
	
	this.moved = this.video_list_scroll_moved.bind(this);
	
	this.search_btn = this.controller.get("search_btn");
	this.channel_list_control_btn = this.controller.get("channel_list_control_btn");
	this.video_list_scroll = this.controller.get("video_list_scroll");
	this.channel_list_container = this.controller.get("channel_list_container");
	
	
		
	this.insert_video_list = this.insert_video_list.bind(this);
	this.nev_btn_tap = this.nev_btn_tap.curry(this);
	this.channel_list_control_btn_tap = this.channel_list_control_btn_tap.bind(this);
	this.search_tap = this.search_tap.bind(this);
	this.video_list_scroll_update = this.video_list_scroll_update.bind(this);
	
	this.mouseup_channel_list = this.mouseup_channel_list.bind(this);
	this.mousedown_channel_list = this.mousedown_channel_list.bind(this);
	
	this.spinner_start = this.spinner_start.bind(this);
	this.spinner_stop = this.spinner_stop.bind(this);
	
	this.hide_channel_list = this.toggle_channel_list.curry("hide").bind(this);
	
	Mojo.Event.listen(this.search_btn, Mojo.Event.tap ,this.search_tap);
	Mojo.Event.listen(this.channel_list_control_btn, Mojo.Event.tap, this.channel_list_control_btn_tap);
	Mojo.Event.listen(this.video_list_scroll, Mojo.Event.scrollStarting, this.video_list_scroll_update);
	
	Mojo.Event.listen(this.channel_list_container, "mousedown", this.mousedown_channel_list, true);
	Mojo.Event.listen(this.channel_list_container, "mouseup", this.mouseup_channel_list, true);
	Mojo.Event.listen(this.channel_list_container, "click", this.hide_channel_list, true);
	
	API.request_start = this.spinner_start;
	API.request_stop = this.spinner_stop;
	
	this.init_nev();
	
	API.signin_api({
		success : this.data_init.bind(this)
	});
	
}
  
MainAssistant.prototype.data_init = function(data){
	if(!data){
		//Mojo.AlertDialog();
		return false;
	}
	
	if(typeof(data) === "string"){
		data = Mojo.parseJSON(data);
	}
	API.SESSIONID = data["sessionid"];
	this.init_channel_list(data["columns"]);
	API.rec_api({
		success : this.insert_video_list
	});
	this._ready = true;
}

MainAssistant.prototype.spinner_start = function(){
	this.spinner.parentNode.style.display = "block";
	if(this.spinner.mojo)
		this.spinner.mojo.start();
}

MainAssistant.prototype.spinner_stop = function(){
	this.spinner.parentNode.style.display = "none";
	this.spinner.mojo.stop();
}

MainAssistant.prototype.init_channel_list = function(data){
	if(!data){
		return false;
	}
	this.channel_list = new ChannelListView("channel_list", "video_list");
	this.channel_list.insert(data);
}

MainAssistant.prototype.search_tap = function(){
	this.video_list.clear();
	var kw = this.controller.get("search_value").mojo.getValue();
	API.search_api(kw, {
		success : this.insert_video_list.bind(this)
	});	
}

MainAssistant.prototype.channel_list_control_btn_tap = function(){
	if(this.channel_list_control_btn_hide)
		window.clearInterval(this.channel_list_control_btn_hide);
	this.channel_list_control_btn.style.opacity = 0.5;
	this.toggle_channel_list();
	this.channel_list_control_btn_hide = window.setInterval(this.channel_list_control_btn_opacity.bind(this),100);
}

MainAssistant.prototype.channel_list_control_btn_opacity = function(){
	this.channel_list_control_btn.style.opacity = this.channel_list_control_btn.style.opacity - 0.01;
	if(this.channel_list_control_btn.style.opacity == 0){
		if(this.channel_list_control_btn_hide)
			window.clearInterval(this.channel_list_control_btn_hide);
		this.toggle_channel_list("hide");
	}
}

MainAssistant.prototype.video_list_scroll_update = function(event){
	event.scroller.addListener(this);
}

MainAssistant.prototype.video_list_scroll_moved = function(stopping){
	if(stopping){
		if(this.video_list._height() +
				this.video_list_scroll.mojo.getScrollPosition().top - 
					this.video_list_scroll.mojo.scrollerSize().height <= 0){
			this.update_video_list();
		}
	}
	//getBoundaries
}
MainAssistant.prototype.mousedown_channel_list = function(){
	if(this.channel_list_control_btn_hide){
		window.clearInterval(this.channel_list_control_btn_hide);
		this.channel_list_control_btn.style.opacity = 0;
	}
	if(this.channel_list_hide){
		window.clearTimeout(this.channel_list_hide);
	}
	this.toggle_channel_list("show");
}

MainAssistant.prototype.mouseup_channel_list = function(){
	if(this.channel_list_control_btn_hide){
		window.clearInterval(this.channel_list_control_btn_hide);
		this.channel_list_control_btn.style.opacity = 0;
	}
	if(this.channel_list_hide){
		window.clearTimeout(this.channel_list_hide);
	}
	this.toggle_channel_list("show");
	this.channel_list_hide = window.setTimeout(
				this.toggle_channel_list.curry("hide").bind(this), 5000);
}

MainAssistant.prototype.toggle_channel_list = function(options){
	if(options){
		if(options == "hide"){
			this.controller.get("channel_list_container").style.display = "none";
			return true;
		}
		else if(options == "show"){
			this.controller.get("channel_list_container").style.display = "";
			return true;
		}
	}
	if(this.controller.get("channel_list_container").style.display != "none")
		this.toggle_channel_list("hide");
	else{
		this.toggle_channel_list("show");
	}
}

MainAssistant.prototype.toggle_search_bar = function(options){
	if(options){
		if(options == "hide"){
			this.controller.get("search_bar").style.display = "none";
			return true;
		}
		else if(options == "show"){
			this.controller.get("search_bar").style.display = "";
			return true;
		}
	}
	if(this.controller.get("search_bar").style.display != "none")
		this.toggle_channel_list("hide");
	else{
		this.toggle_channel_list("show");
	}
}


MainAssistant.prototype.insert_video_list = function(data){
	if(typeof(data) === "string")
		data = Mojo.parseJSON(data);
	if(data["items"])
		this.video_list.insert(data["items"]);
	else
		this.video_list.insert(data);
}

MainAssistant.prototype.init_nev = function(){
	var NEV = this.controller.get("NEV");
	
	var rec_nev_button = this.create_nev_button("rec");
	var channel_nev_btn = this.create_nev_button("channel");
	var search_nev_btn = this.create_nev_button("search");
	var option_nev_btn = this.create_nev_button("option");
	this.nev_btn_tap.bind(rec_nev_button)();
}



MainAssistant.prototype.nev_btn_tap = function(_parent){
	var btn = this;
	var btn_name = btn.getAttribute("name");
	if(_parent.last_nev_tap){
		var last_name = _parent.last_nev_tap.getAttribute("name") ;
		if(last_name == btn_name)
			return true;
		_parent.last_nev_tap.setAttribute("src","images/" + last_name + ".png");
	}
	if(_parent.video_list_scroll && _parent.video_list_scroll.mojo)
		_parent.video_list_scroll.mojo.scrollTo(0,0,false);
	btn.setAttribute("src","images/" + btn_name + "_press.png");
	_parent.last_nev_tap = btn;
	switch(btn_name){
	case "rec" :
		_parent.controller.get("list_contianer").style.display = "";
		_parent.channel_list_control_btn.style.display="none";
		_parent.toggle_channel_list("hide");
		_parent.toggle_search_bar("hide");
		_parent.video_list.clear();
		_parent.update_video_list();
		break;
	case "channel" :
		_parent.controller.get("list_contianer").style.display = "";
		_parent.channel_list_control_btn.style.display="";
		_parent.toggle_channel_list("hide");
		_parent.toggle_search_bar("hide");
		_parent.channel_list_control_btn_tap();
		
		_parent.video_list.clear();
		_parent.update_video_list();
		break;
	case "search" :
		_parent.controller.get("list_contianer").style.display = "";
		_parent.channel_list_control_btn.style.display="none";
		_parent.toggle_channel_list("hide");
		_parent.toggle_search_bar("show");
		break;
	case "option" :
		_parent.channel_list_control_btn.style.display="none";
		_parent.controller.get("list_contianer").style.display = "none";
		_parent.controller.get("option").style.display = "";
		break;
	}
}

MainAssistant.prototype.create_nev_button = function(name){
	var btn = document.createElement("img");
	btn.setAttribute("src","images/" + name + ".png");
	btn.setAttribute("name", name);
	btn.className = "nev_btn";
	NEV.appendChild(btn);
	Mojo.Event.listen(btn,Mojo.Event.tap, this.nev_btn_tap);
	return btn;
}

MainAssistant.prototype.update_video_list = function(){
	if(!this.last_nev_tap)
		return false;
	if(!this._ready)
		return false;
	switch(this.last_nev_tap.getAttribute("name")){
		case "rec" : 
			API.rec_api({
				success : this.insert_video_list
			});
			break;
		case "channel" :
			this.channel_list.update();
			break;
		case "search" :
			var kw = this.controller.get("search_value").mojo.getValue();
			API.search_api(kw, {
				success : this.insert_video_list
			});	
			break;
	}
}

MainAssistant.prototype.releaseEvent = function(){
	//release the NEV events
	var NEV = this.controller.get("NEV");
	var child_node = NEV.childNodes;
	for(var i in child_node){
		if(child_node[i].tagName == "IMG"){
			Mojo.Event.stopListening(child_node[i],Mojo.Event.tap,this.nev_btn_tap)
		}
	}
	Mojo.Event.stopListening(this.search_btn, Mojo.Event.tap ,this.search_tap);
	Mojo.Event.stopListening(this.channel_list_control_btn, Mojo.Event.tap, this.channel_list_control_btn_tap);
	Mojo.Event.stopListening(this.video_list_scroll, Mojo.Event.scrollStarting, this.video_list_scroll_update);
	
	Mojo.Event.stopListening(this.channel_list_container, "mousedown", this.mousedown_channel_list, true);
	Mojo.Event.stopListening(this.channel_list_container, "mouseup", this.mouseup_channel_list, true);
	
	Mojo.Event.listen(this.channel_list_container, "click", this.hide_channel_list, true);
}


MainAssistant.prototype.activate = function(event) {
	this.controller.stageController.setWindowOrientation("up");
	API.request_start = this.spinner_start;
	API.request_stop = this.spinner_stop;

}	
	
MainAssistant.prototype.deactivate = function(event) {
	
}

MainAssistant.prototype.cleanup = function(event) {
	this.channel_list.destory();
	this.releaseEvent();
}