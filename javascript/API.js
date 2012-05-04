window.onrequest = false;

function paramURL(_data) {
		var p = [];
		for (var i in _data) {
			p.push(i + "=" + encodeURIComponent(_data[i]));
		}
		return p.join("&");
	}

 function request(url, _callbacks){
	 /*if(window.onrequest){
		 if(_callbacks && _callbacks.fail){
				_callbacks.fail();
			}
		 return false;
	 }
	 */
	var xmlhttp = new XMLHttpRequest();
	if(!xmlhttp)
		return false;
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			if(API.request_stop){
				API.request_stop();
			}
			if(_callbacks && _callbacks.success){
				_callbacks.success(xmlhttp.responseText);
			}		
		}
		else if (xmlhttp.readyState == 4 && xmlhttp.status !=200){
			if(API.request_stop){
				API.request_stop();
			}
			if(_callbacks && _callbacks.fail){
				_callbacks.fail();
			}
			Mojo.Controller.errorDialog("网络连接失败。"); 
		}
		else if(xmlhttp.readyState == 1){
			if(API.request_start){
				API.request_start();
			}
		}
	};
	//Mojo.Log.info(url);
	xmlhttp.open("GET", url);
	xmlhttp.send();	
}

var main_url = "http://minterface.tudou.com" ;

window.API = 
{
	//api url
	
	signin_url : main_url+'/signin_complex?',
	search_url : main_url+'/search?',
	rec_url : main_url+'/ih?',//recommandation
	channel_url : main_url+'/column?',//lanmu shuju
	channel_index_url : main_url+'/columncate?',//lanmu fenlei
	item_info_url : main_url+'/iteminfo?',//shipinxiangxi
	related_url : main_url+'/related?',//get xiangguan tuijian 
	//play_video_stat_url : main_url+'/playvideostat?',//playvideostat


	//seriaNum : 0 ,
	seriaNum : Mojo.Environment.DeviceInfo.serialNumber ,
	count : 0,
	c_num : 0,
	rec_page : 0,
	channel_page : 0,
	search_page :0,
	pagesize : 18,
	SESSIONID : "",

	//API functions 
	
	signin_api : function(_param){
		var url = this.signin_url + paramURL({
			ver:"2.0.0",
			imei:this.seriaNum,
			imsi:this.seriaNum,
			ua:"touchpad",
			pf:this.pagesize,
			subpf:'000',
			projid:1031,
			op:0,
			child:9999,
			sw:screen.width,
			sh:screen.height	
		});
		request(url, _param);
	},

	rec_api : function(_param){
		var url = this.rec_url + paramURL({
			sessionid:this.SESSIONID,
			page:this.rec_page,
			pagesize:this.pagesize,
			type:'index'
		});
		this.rec_page ++ ;
		this.channel_page = 0;
		this.search_page = 0;
		request(url, _param);		
	},

	search_api : function(_kw, _param){
		var url = this.search_url + paramURL({
			sessionid:this.SESSIONID,
			page:this.search_page,
			pagesize:45,
			kw:_kw,
			area:1
		});
		this.rec_page = 0 ;
		this.channel_page = 0;
		this.search_page ++;
		request(url, _param);
	},
	
	channel_api : function(_idx, _param){
		if(this.last_column_id != _idx){
			this.channel_page = 0;
			this.last_column_id = _idx;
		}
		var url = this.channel_url + paramURL({
			sessionid:this.SESSIONID,
			page:this.channel_page,
			pagesize:this.pagesize,
			columnid:_idx,
		});
		this.rec_page = 0 ;
		this.channel_page ++;
		this.search_page = 0;
		request(url, _param);
	},
	
	item_info_api : function(_obj, _param){
		var itemId=_obj.itemid;
		if(itemId==""||itemId==0||itemId==undefined)
			itemId=1;
			var column_params_id="";
			if(_obj.columnid){
				column_params_id=_obj.columnid;
				}
		var url = this.item_info_url + paramURL({
			sessionid:this.SESSIONID,
			itemid:itemId,
			origin:_obj.origin,
			ishd: _obj.ishd,
			columnid: column_params_id,
			type:'index',
		});
		//Mojo.Log.info(url);
		request(url, _param);
	},
	related_data_api : function(_itemid){
		var url = this.related_url + paramURL({
			sessionid:this.SESSIONID,
			itemid:_itemid,
		});
		request(url, _param);
	}
};


window.PlayerOption = {
	video_clear : "clear"
};