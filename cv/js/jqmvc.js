/*
* JQMVC framework
* https://github.com/Keyang/JQMVC
*
* Copyright 2011-2012, Keyang Xiang
* Licensed under the MIT
*/

/**
 * part_basic.js
 */

(function(parent, opt) {
	var nameSpace = "mvc";
	parent[nameSpace] = {};
	var obj = parent[nameSpace];
	obj.ext = function(parent, key, tarObj) {
		if( typeof parent != "object") {
			throw ("mvc.ext first param should be entry object.");
		}
		if( typeof key != "string") {
			throw ("mvc.ext second param should be key as string.");
		}
		parent[key] = tarObj;
	}
	obj.opt = opt;
})(window, {});
mvc.ext(mvc, "cls", {});
mvc.ext(mvc, "util", {
	text : {
		format : function() {
			var args = arguments;
			var str = args[0];
			var rtn = str;
			for(var i = 1; i < args.length; i++) {
				var index = i - 1;
				rtn = rtn.replace("{" + index + "}", args[i]);
			}
			return rtn;
		}
	},
	/**
	 * deeply merge two jsonObj and return a new copy (not a reference)
	 * 
	 * final json object will be returned
	 */
	copyJSON : function(jsonObj, toJson, override) {
		if (typeof jsonObj!="object" || jsonObj===null){
			return jsonObj;
		}
		var tmpObj = {};
		//fix for old version 
		if(toJson != undefined) {
			tmpObj = mvc.util.copyJSON(toJson, undefined, true);
		}
		//deep clone for setting json obj
		var tmpOri = jsonObj;
		if( tmpOri instanceof Array) {
			tmpObj=[];
			for (var i=0;i<tmpOri.length;i++){
				tmpObj.push(mvc.util.copyJSON(tmpOri[i]));
			}
		} else {
			for(var key in tmpOri) {
				if(override === false) {
					if(tmpObj[key] != undefined) {
						continue;
					}
				}
				tmpObj[key]=mvc.util.copyJSON(tmpOri[key]);
			}
		}
		return tmpObj;
	},
	/**
	 * return true if given value is empty.
	 */
	isEmpty : function(val) {
		return val == undefined || val === "" || val === null || val === {};
	}
});
/**
 * part_class.js
 */
mvc.ext(mvc, "Class", (function() {
	function isFunction(param) {
		if( typeof param == "function") {
			return true;
		}
		return false;
	};

	function subclass() {
	};

	function apply(host, items) {
		for(var key in items) {
			host[key] = items[key];
		}
	}

	function $A(arr) {
		var rtn = new Array();
		for(var i = 0; i < arr.length; i++) {
			rtn.push(arr[i]);
		}
		return rtn;
	}

	function argumentNames(func) {
		var names = func.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1].replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '').replace(/\s+/g, '').split(',');
		return names.length == 1 && !names[0] ? [] : names;
	}

	function create() {
		var parent = null, properties = $A(arguments);
		if(isFunction(properties[0])) {
			parent = properties.shift();
		}
		
		function mvclass() {
			this.props=mvc.util.copyJSON(mvclass.props,undefined,true);
			this.initialise.apply(this, arguments);
		}

		apply(mvclass, mvc.Class.Methods);
		mvclass.props={};
		mvclass.superclass = parent;
		mvclass.subclasses = [];

		if(parent) {
			subclass.prototype = parent.prototype;
			mvclass.prototype = new subclass;
			parent.subclasses.push(mvclass);
			var anc=mvclass.prototype;
			for (var key in anc){
				var data=anc[key];
				if (data===null){
					properties[0][key]=null;
				}else if (typeof data==="object" && key==="props"){
					if (properties[0][key]===undefined){
						properties[0][key]={};
					}
					 properties[0][key]=mvc.util.copyJSON(data,properties[0][key],false);
				}
			}
		}

		mvclass.addMethods(properties[0]);

		if(!mvclass.prototype.initialise) {
			mvclass.prototype.initialise = function() {
			};
		}
		mvclass.prototype.constructor = mvclass;
		return mvclass;
	}

	function addMethods(source) {
		var ancestor = this.superclass && this.superclass.prototype;

		for(var key in source) {
			var property = key, value = source[key];
			if(ancestor && isFunction(value) && argumentNames(value)[0] == "$super") {
				var oldValue = value;
				value = (function() {
					var curFunc = oldValue;
					var m = property;
					return function() {
						var that=this;
						var method = function() {
								return ancestor[m].apply(that, arguments);
							};
						var argu = $A(arguments) || [];
						argu.unshift(method);
						curFunc.apply(this, argu);
					}
				})();
			}
			if (typeof value==="object"){
				if (key==="props"){
					this.props=value;
				}
			}
			this.prototype[property] = value;
		}

		return this;
	}

	return {
		create : create,
		Methods : {
			addMethods : addMethods
		}
	};
})());
/**
 * Applicatinon Definition
 * ./part_app.js
 */

mvc.ext(mvc, "app", {
	props:{
		readyFuncs:[]
	},
	init : function(opt) {
		mvc.opt = mvc.util.copyJSON(opt, mvc.opt, true);
		if (mvc.opt.ready!=undefined){
			for (var i=0;i<this.props.readyFuncs.length;i++){
				var func=this.props.readyFuncs[i];
				mvc.opt.ready(func);
			}
		}else{
			for (var i=0;i<this.props.readyFuncs.length;i++){
				var func=this.props.readyFuncs[i];
				func();
			}
		}
	},
	ready:function(func){
		this.props.readyFuncs.push(func);
	}
});
/**
 * Abstract config class
 * ./part_cfg.js
 */

mvc.ext(mvc.cls,"cfg",mvc.Class.create({
	props:{
		name:"undefined",
		checkItems:{}
	},
	initialise:function(name){
		this.props.name=name;
		
	},
	check:function(opt){
		for (var key in this.props.checkItems){
			var func=this.props.checkItems[key];
			var res=func(opt);
			if (res===false){
				throw("error happend");
				return false;
			}
		}
		return "Configuration check passed.";
	},
	addItem:function(name,func){
		if (typeof name==="string" && typeof func ==="function"){
			this.props.checkItems[name]=func;
		}
	},
	removeItem:function(name){
		if (this.props.checkItems[name]){
			delete this.props.checkItems[name]
		};
	},
	err:function(com,extra){
		var str=" object is required in app configuration.";
		if (typeof extra !="undefined"){
			str+=extra;
		}
		throw (com +str);
	}
}));

mvc.cfg=new mvc.cls.cfg("cfg");
/**
 * Observer
 * part_observer.js
 */

mvc.ext(mvc.cls, "observer", mvc.Class.create({
	notify : function() {
		throw ("notify is not overwritten");
	}
}));

mvc.ext(mvc.cls, "subject", mvc.Class.create(mvc.cls.observer,{
	props : {
		observers : {},
		name:null
	},
	initialise:function(name){
		this.props.name=name;
	},
	getName:function(){
		return this.props.name;
	},
	unsubscribe : function(name) {
		if (this.props.observers[name]){
			delete this.props.observers[name];
		}
	},
	subscribe : function(name, observer) {
		if (observer.notify===undefined){
			throw("subscribed object should be subclass of observer");
		}
		this.props.observers[name]=observer;
	},
	notifyAll : function() {
		for(var key in this.props.observers) {
			var ob = this.props.observers[key];
			ob.notify.apply(ob,arguments);
		}
	},
	notify:function(){
		//empty
	}
}));
/**
 * console Log definition
 * part_log.js
 */
mvc.ext(mvc['cls'], '_log', function() {
	var props = {

	}
	var _private = {
		log : function(str) {
			if (typeof console==="undefined"){
				console={};
			}
			if (console.log==="undefined"){
				console.log=function(){};
			}
			console.log(str);
		}
	}
	var _public = {
		/**
		 * Debug message
		 */
		d : function(debugInfo) {
			debugInfo=debugInfo ||"";
			var template="DEBUG: {0}";
			_private.log(mvc.util.text.format(template,debugInfo));
		},
		/**
		 * Info Message
		 */
		i : function(info) {
			info=info || "";
			var template="INFO: {0}";
			_private.log(mvc.util.text.format(template,info));
		},
		/**
		 * Log an error message
		 * @param e: error message as string
		 * @param place: location of the message
		 * @param data: related data
		 */
		e : function(e, place, data) {
			e=e || "";
			if (typeof e==="string"){
			var tmplate="ERROR: {0}. {1}:{2}.";
			_private.log(mvc.util.text.format(tmplate,e,place,data));
			}else{
				throw(e);
			}
		},
		/**
		 * Warning message
		 */
		w:function(str){
			var template="WARNNING: {0}";
			_private.log(mvc.util.text.format(template,str));
		}
	}
	return _public;
});

mvc.log=new mvc.cls._log();
/**
 * Controller Definition
 * part_controller.js
 */
mvc.ext(mvc, "ctl", function(name) {
	var _public = {
		/**
		 * Send Message to this controller synchronously.
		 */
		sendMSG : function(msg, args) {
			return _private.sendMSG(msg, args);
		},
		/**
		 * Post Message to this controller asynchronously.
		 */
		postMSG : function(msg, args, callback) {
			return _private.postMSG(msg, args, callback);
		},
		/**
		 * Check if specified controller and method exists.
		 */
		checkCtl : function(method) {
			return _private.checkCtl(method);
		}
	};
	var _props = {
		_ctl : null
	};
	var _private = {
		checkCtl : function(method) {
			if(!_private.isCtlExisted(name)) {
				return false;
			}
			if(method) {
				if(!mvc.controllers[name][method]) {
					return false;
				}
			}
			return true;
		},
		checkMSG : function(msg) {
			var ctl = _props._ctl;
			if(ctl[msg] != undefined) {
				if( typeof ctl[msg] === "function") {
					return true;
				} else {
					mvc.log.i("Detected non-function item assigned to controller.");
				}
			} else {
				mvc.log.i("Refered non-defined message:" + msg);
			}
			return false;
		},
		sendMSG : function(msg, args) {
			if(!_private.isCtlExisted(name)) {
				throw ("Controller with name:" + name + " Does not exist.");
			}
			var ctl = _props._ctl;
			if(_private.checkMSG(msg)) {
				if(args === undefined || args === null) {
					args = [];
				}
				if(!( args instanceof Array)) {
					args = [args];
				}
				return ctl[msg].apply(ctl, args);
			}
			return;
		},
		postMSG : function(msg, args, callback) {
			if(!_private.isCtlExisted(name)) {
				throw ("Controller with name:" + name + " Does not exist.");
			}
			var ctl = _props._ctl;
			if(_private.checkMSG(msg)) {
				setTimeout(function() {
					if(args === undefined || args === null) {
						args = [];
					}
					if(!( args instanceof Array)) {
						args = [args];
					}
					var res = ctl[msg].apply(ctl, args);
					if(callback != undefined && typeof callback === "function") {
						callback(res);
					}
				}, 0)
			}
			return;
		},
		init : function() {
			_props._ctl = mvc.controllers[name];
		},
		isCtlExisted : function(name) {
			if(mvc.controllers[name] == undefined) {
				return false;
			}
			return true;
		}
	}
	_private.init();
	return _public;
});

mvc.ext(mvc, "controllers", {});
//empty controller entry
mvc.ext(mvc, "regCtl", function(name, controllerObj) {
	if( typeof controllerObj != "object") {
		mvc.log.e("Controller should be a JSON object!");
		return false;
	}
	mvc.ext(mvc.controllers, name, controllerObj);
	return true;
});
/**
 * Part_event.js
 */
mvc.ext(mvc.cls, "event", function(that) {
	var _public = {
		/**
		 * bind a function to an event with key as identifier. If key existed, it will replace existed handler.
		 * @param eventType event type that will be bound.
		 * @param key identifier of the handler.
		 * @param func callback handler.
		 * @param override existed function. default true
		 */
		bind : function(eventType, key, func, override) {
			return _private.bind(eventType, key, func, override);
		},
		/**
		 * fire an event.
		 * @param eventType event that will be fired.
		 * @param param parameters will be passed in.
		 * @param key handler that will be triggered. if ommited, all handlers of that event type will be triggered.
		 * @param async whether fire the events asynchrously. default is false
		 * @param scope scope that will be used for event handler. (this)
		 */
		fire : function(eventType, param, key, async, scope) {
			return _private.fire(eventType, param, key, async, scope);
		},
		/**
		 * It will unbind itself once it is fired.
		 * @param eventType event type that will be bound.
		 * @param key identifier of the handler.
		 * @param func handler.
		 * @param override existed function. default true
		 */
		bindFireOnce : function(eventType, key, func, override) {
			return _public.bind(eventType, key, function() {
				_public.unbind(eventType, key);
				return func.apply(this, arguments);
			}, override);
		},
		/**
		 * Unbind a handler. if Key is ommited all handlers to that eventType will be unbound.
		 */
		unbind : function(eventType, key) {
			return _private.unbind(eventType, key);
		}
	};

	var _private = {
		setScope : function(scope) {
			_props.scope = scope;
		},
		unbind : function(eventType, key) {
			if(key != undefined) {
				delete _props.events[eventType][key];
			} else {
				_props.events[eventType] = {};
			}
		},
		bind : function(eventType, key, func, override) {
			if(override == undefined) {
				override = true;
			}
			if(_props.events[eventType] == undefined) {
				_props.events[eventType] = {};
			}
			if(_props.events[eventType][key] != undefined) {
				if(override === false) {
					return true;
				}
			}
			_props.events[eventType][key] = func;
			return true;
		},
		fire : function(eventType, param, key, async, scope) {
			function proc() {
				if(_props.events[eventType] == undefined) {
					return param;
				}
				var _funcs = _props.events[eventType];
				var res = param;
				if(key != undefined) {
					var func = funcs[key];
					res = _private.exec(func, param, scope);
				} else {
					for(var key in _funcs) {
						var func = _funcs[key];
						res = _private.exec(func, res, scope);
						if(res === undefined) {
							res = param;
						}
					}
				}
				if(res === undefined) {
					res = param;
				}
				return res;
			}

			if(async == undefined) {
				async = false;
			}
			if(async === true) {
				setTimeout(proc, 0);
			} else {
				return proc();
			}
		},
		exec : function(func, param, scope) {
			if(param == undefined) {
				param = []
			}
			if(scope == undefined) {
				scope = _props.scope;
			}
			if(!( param instanceof Array)) {
				param = [param];
			}
			try {
				return func.apply(scope, param);
			} catch(e) {
				mvc.log.e(e, "Execute event handler", func.toString());
			}

		},
		eventExists : function(eventType, key) {
			try {
				var obj = _props.events[eventType][key];
				if(obj != undefined) {
					return true;
				}
				return false;
			} catch(e) {
				mvc.log.e(e, "Event", eventType + "->" + key);
			}
			return false;
		}
	};
	var _props = {
		events : {
			init : {},
			rendered : {},
			updated : {},
			displayed : {}
		},
		scope : that || {}
	};
	return _public;
});
/**
 * Model Definition
 *
 */
mvc.ext(mvc.cls, "model", mvc.Class.create(mvc.cls.subject, {
	props : {
		name : null,
		data : null,
		sorter : null,
		filter : null,
		proxy : null,
		_data : null,
		autoNotify : false,
		autoLoad:false
	},
	events : null,
	subscribe : function($super, view) {
		var name = view.getName();
		$super(name, view);
	},
	initialise : function(opt) {
		if(!opt.name) {
			throw ("Model name should be specified");
		}
		this.events = new mvc.cls["event"](this);
		for(var key in opt) {
			if(key === "data") {
				this.props["_data"] = opt[key];
				continue;
			}
			this.props[key] = opt[key];
		}
		if(this.props["_data"]) {
			this.reset();
			this.arrangeData();
		}
		if (opt.methods!=undefined){
			for (var key in opt.methods){
				if (this[key]!=undefined){
					continue; //over-written existing key, skip it!
				}
				this[key]=opt.methods[key];
			}
		}
		if (this.props.autoLoad===true){
			this.load();
		}
	},
	setProxy:function(proxy){
		this.props.proxy=proxy;
	},
	setFilter : function(filter) {
		if (filter==undefined || filter==null){
			filter=null;
		}
		this.props.filter = filter;
		this.reset();
		this.arrangeData();
	},
	setSorter : function(sorter) {
		if (sorter==undefined || sorter==null){
			sorter=null;
		}
		this.props.sorter = sorter;
		this.reset();
		this.arrangeData();
	},
	reset : function() {
		this.props.data = {};
		this.props.data = mvc.util.copyJSON(this.props._data, undefined, true);
	},
	/**
	 * adapt filter and sorter to current data
	 */
	arrangeData : function() {
		if(this.props.filter === null && this.props.sorter === null) {
			return true;
		}
		if(this.props.data instanceof Array) {
			if(this.props.filter) {
				var tmpData=[];
				for(var i = 0; i < this.props.data.length; i++) {
					var data = this.props.data[i];
					var res = this.props.filter(data);
					if(res != false) {
						tmpData.push(data);
					}
				}
				this.props.data=tmpData;
			}
			if(this.props.sorter) {
				this.props.data = this.props.data.sort(this.props.sorter);
			}
		}
	},
	/**
	 * load data to 'local'
	 */
	load : function(params, callback) {
		if(this.props.proxy) {
			var that = this;
			this.exec("load", params, function(err, data) {
				that.props._data = data;
				that.reset();
				that.arrangeData();
				if(callback) {
					callback(err,that.getData());
				}
			});
		} else {
			mvc.log.e("Proxy is not setup in model:" + this.props.name);
		}
	},
	/**
	 * save data to 'remote'
	 */
	save : function(data, callback) {
		if(this.props.proxy) {
			var that = this;
			this.exec("save", data, function(err, res) {
				that.props._data = res;
				that.reset();
				that.arrangeData();
				if(callback) {
					callback(err,that.getData());
				}
			});
		} else {
			mvc.log.e("Proxy is not setup in model:" + this.props.name);
		}
	},
	exec : function(cmd, params, callback) {
		var that = this;
		if(this.props.proxy) {
			var that = this;
			that.events.fire("before" + cmd);
			this.props.proxy.exec(cmd, params, function(err, res) {
				if(!err) {
					res = that.events.fire("after" + cmd, res);
				}
				callback(err,res);
				if(that.props.autoNotify === true) {
					that.notifyAll();
				}
			});
		} else {
			mvc.log.e("Proxy is not setup in model:" + this.props.name);
		}
	},
	/**
	 * return local cached data;
	 */
	getData : function() {
		return this.props.data;
	},
	/**
	 * return raw data from proxy
	 */
	getRawData : function() {
		return this.props._data;
	}
}));
mvc.ext(mvc, "models", {});
mvc.ext(mvc, "modelMgr", {
	regModel : function(opt) {
		if(!opt.name) {
			throw ("Model name should be specified");
		}
		mvc.ext(mvc.models, opt.name, new mvc.cls.model(opt));
		return mvc.models[opt.name];
	},
	get : function(name) {
		return mvc.models[name];
	}
});

mvc.regModel=mvc.modelMgr.regModel; //shortcuts.
/**
 * Model Proxy
 * part_proxy.js
 *
 */

mvc.ext(mvc.cls, "proxy", mvc.Class.create(mvc.cls.observer, {
	events : null,
	initialise : function() {
		this.events = new mvc.cls["event"](this);
	},
	exec : function(cmd, params, callback) {
		var that = this;
		if(this[cmd] === undefined) {
			throw ("command:" + cmd + " is not implemented in proxy.");
		}
		that.events.fire("before" + cmd);
		this[cmd](params,function(err,response) {
			if (!err){
				var res = that.events.fire("after" + cmd, response);
			}
			callback(err, res);
		});
	}
}));

mvc.ext(mvc, "proxy", {});
/**
 * Simple Data Proxy. Contain data instance.
 * ./part_simpleData.js
 */

mvc.ext(mvc.proxy,"simpleData",mvc.Class.create(mvc.cls.proxy,{
	props:{
		data:null
	},
	initialise:function($super,data){
		this.props.data=data;
		$super();
	},
	load:function(param,callback){
		if (callback){
			callback(null,this.props.data);
		}
	},
	save:function(data,callback){
		this.props.data=data;
		if (callback){
			callback(null,this.props.data);
		}
	}
}));
mvc.ext(mvc,"string",{
	error:{
		view:{
		"vnun":"View name should not be undefined",
		"vnex":"Cannot set a view as current view that is not existed!"
		},
		ajax:{
			"loadErr":"Ajax loading file error"
			
		},
		event:{
			"etnf":"Event type indicated not found."
		}
	},
	info:{
		view:{
			"ravt":"Trying to render a view that is displaying. Use update method instead.",
			"lpf":"Load Page From:"
		}
	}
});
/**
 * part_history.js
 */
mvc.ext(mvc.cls, "history", function() {
	var _public={
		/**
		 * push a entry to stack.
		 */
		push:function(name){
			return _private.push(name);
		},
		/**
		 * clear stack
		 */
		clear:function(){
			return _private.clear();
		},
		/**
		 * back to a specified entry.
		 * back to last entry if name is ommited.
		 */
		back:function(name){
			return _private.back(name);
		}
	}
	var _props = {
		stack : []
	}
	var _private = {
		push : function(pageID) {
			if(pageID && pageID != null) {
				_props.stack.push(pageID);
			}
		},
		clear : function(clearDom) {
				_props.stack = [];
		},
		pop : function() {
			return _props.stack.pop();
		},
		back : function(pageID) {
			var lastPageID = "";
			if(pageID === undefined) {//back to last page
				lastPageID = _private.pop();
				while(_props.stack.length > 0 && ( typeof (lastPageID) == "undefined" || mvc.util.isEmpty(lastPageID) || $("#" + lastPageID).length == 0)) {
					lastPageID = _private.pop();
				}
			} else {//back to page with id: pageID
				while(_props.stack.length > 0 && pageID != lastPageID) {// check whether specified page has been loaded.
					lastPageID = _private.pop();
				}
				if(lastPageID != pageID) {// cannot find page in history stack. Load specified page from scratch.
					lastPageID=pageID;
				}
			}
			if(lastPageID != undefined && lastPageID != null) {
				return lastPageID;
			}
		}
	}
	
	return _public;
});
/**
 *  abstract view class
 * part_viewcls.js
 */
mvc.ext(mvc.cls, "absview", mvc.Class.create(mvc.cls.observer, {
	"viewMgr" : null,
	"name" : "undefined",
	"op_buf" : "",
	"events" : null,
	"model" : null,
	/**
	 * bind model to current view
	 */
	bindModel : function(model) {
		if(this.model) {
			this.model.unsubscribe(this.getName());
		}
		this.model = model;
		this.model.subscribe(this);
	},
	/**
	 * class constructor
	 */
	initialise : function(name, viewMgr) {
		this.name = name;
		this.viewMgr = viewMgr;
		this.events = new mvc.cls.event(this);
	},
	/**
	 * Echo data to output buffer
	 */
	echo : function(str) {
		this.op_buf += str;
	},
	show : function() {
		throw ("Show method should be overwritten.");
	},
	update : function() {
		throw ("update method should be overwritten.");
	},
	/**
	 * fire an event of both global and private.
	 * @param eventType event that will be fired.
	 * @param param parameters will be passed in.
	 * @param key handler that will be triggered. if ommited, all handlers of that event type will be triggered.
	 * @param async whether fire the events asynchrously. default is false
	 */
	fire : function(eventType, param, key, async) {
		var res;
		if(this.viewMgr && this.viewMgr != null) {
			res = this.viewMgr.events.fire(eventType, param, key, async, this);
		}
		return this.events.fire(eventType, res, key, async);
	},
	getName : function() {
		return this.name; 
	},
	/**
	 * remove this view
	 */
	remove : function() {
		for(var key in this) {
			if( typeof this[key] == "function") {
				this[key] = function() {
				};
			} else {
				this[key] = null;
			}
		}
	},
	/**
	 * display current view
	 * It will fire "displayed" event
	 * Return displayed content
	 */
	display : function(isStack) {
		
		var vmgr=this.viewMgr;
		if (isStack){
			var curView=vmgr.get();
			if (curView!=null){
				vmgr.historyStack.push(curView.getName());
			}
			
		}
		this.fire("displayed", [this,vmgr], undefined, false);
		return this.op_buf;
	},
	/**
	 * overwrite observer notify method. Notification should be from subscribing models.
	 */
	notify : function() {
		this.update();
	}
}));
/**
 * Abstract view manager class
 * part_absViewMgr.js
 *
 */
mvc.ext(mvc.cls, "absViewMgr", mvc.Class.create({
	props : {
		viewCls : null,
		curView : null,
		_views : {}
	},
	historyStack : new mvc.cls.history(),
	initialise : function(newprops) {
		this.events = new mvc.cls['event']();
		if(newprops && typeof newprops === "object") {
			for(var key in newprops) {
				this.props[key] = newprops[key];
			}
		}
		this.events.bind("displayed", "_history_event", function(v,vmgr) {
			vmgr.props.curView = v;
		});
	},
	/**
	 * Get or created a view with specific name & Push created view to view manager.
	 * If no name is given, current view (displayed) will be returned. If current view is not set, null will return.
	 * If a new name is given, a new view will be created.
	 */
	get : function(name) {
		if( typeof name == "undefined") {
			return this.props.curView;
		}
		if(this.props._views[name] != undefined) {
			return this.props._views[name];
		} else {
			var obj = new this.props.viewCls(name);
			this.props._views[name] = obj;
			return obj;
		}
	},
	/**
	 * view callback iterator
	 */
	each : function(func) {
		for(var key in this.props._views) {
			func(this.props._views[key]);
		}
	},
	/**
	 * Return whether a specified view existed.
	 */
	isViewExisted : function(name) {
		if( typeof name == "undefined") {
			mvc.log.e(mvc.string.error.view["vnun"], "mvc.view.isViewExisted with parameter:", name);
			return false;
		}
		if(this.props._views[name] != undefined) {
			return true;
		} else {
			return false;
		}
	},
	/**
	 * Forcely init a new view. it will replace existing one.
	 */
	init : function(name) {
		return this.props._views[name] = new this.props.viewCls(name);
	},
	/**
	 * clear history stack
	 */
	clearHistory : function() {
		return this.historyStack.clear();
	},
	clearAll : function() {
		this.each(function(v) {
			v.remove();
		})
		this.clearHistory();
		this.props._views = {};
		this.props.curView = null;
	}
}));
/**
 * ./html/part_html_init.js
 */

mvc.ext(mvc,"html",{});
mvc.ext(mvc, "$", function(selector) {
	if(selector != undefined) {
		return $(mvc.opt.appContainer).find(selector);
	} else {
		return $(mvc.opt.appContainer);
	}
});

mvc.cfg.addItem("html_init",function(opt){
	if (opt.appContainer==undefined){
		mvc.cfg.err("appContainer");
		return false;
	}	
});


mvc.app.ready(function(){
	mvc.cfg.check(mvc.opt);
});

//fix ie console issue
if ($.browser.msie===true){
	if (typeof console==="undefined"){
		console={};
		console.log=function(str){};
	}
}
//default init
mvc.app.init({
	ajax : {}, //ajax configurations. checkout jqueyr ajax parameter.
	appContainer : "#pages", //the element in which the app will be rendered. it could be any jquery selector.
	elementPath : "app/views/elements", //the absolute path of element folder
	viewPath : "app/views", // the absolute path of page folder
	onStart : {//default user action once user opens the app.
		controller : "nav",
		method : "home"
	},
	/**
	 * This is invoked when viewer finished initilising loading page and ask UI to render page
	 * Change to next page. Generally it is manipulated by UI library currently using.
	 * @param pageID: id of Page to be loaded.
	 */
	showNextPage : function(pageID) {
		var jQueryObj = mvc.$("#" + pageID);
		var curPage = mvc.$(".currentPage");
		if(curPage.length > 0) {
			curPage.removeClass("currentPage");
		}
		jQueryObj.addClass("currentPage");
	},
	/**
	 * This is invoked when framework receives a "back" action. e.g. If you have different animation for goFowardPage and goBackPage, you should set up them differently.
	 */
	showLastPage : function(pageID) {
		var jQueryObj = mvc.$("#" + pageID);
		var curPage = mvc.$(".currentPage");
		if(curPage.length > 0) {
			curPage.removeClass("currentPage");
		}
		jQueryObj.addClass("currentPage");
	},
	ready:function(func){
		$(document).ready(func);
	}
});
/**
 * ./html/part_ajax.js
 */

mvc.ext(mvc.cls, "dom_ajax", function() {
	var _props = {
		cachedHtml : {},
		cfg_ajax:null
	};
	var _private = {
		init:function(){
			mvc.cfg.addItem("html.ajax",function(opt){
				if (opt.ajax===undefined){
					mvc.cfg.err("ajax");
					return false;
				}
				_props.cfg_ajax=opt.ajax;
			})
		},
		ajax : function(defparam, userParam) {
			var param = defparam;
			if( _props.cfg_ajax!=null) {// global configuration
				for (var key in _props.cfg_ajax){
					param[key]=_props.cfg_ajax[key];
				}
			}
			if(userParam !== undefined) { // user configuration
				for(var key in userParam) {
					param[key] = userParam[key];
				}
			}
			
			return $.ajax(param);
		},
		asyncLoad : function(path, callback, userParam) {
			function cb(data) {
				try {
					callback(data);
				} catch(e) {
					mvc.log.e(e, "asyncLoad", path);
				}
			}

			if(_props.cachedHtml[path] != undefined) {
				cb(_props.cachedHtml[path]);
				return;
			}
			var param = {
				async : true,
				url : path,
				type : "GET",
				dataType : "text",
				success : function(res) {
					_props.cachedHtml[path]=res;
					cb(res);
				},
				error:function(xhr,text,err){
					mvc.log.e(text,"asyncLoad",path);
					cb("");
				}
			};
			_private.ajax(param,userParam);
		},
		syncLoad : function(path, userParam) {
			var result = null;
			if(_props.cachedHtml[path] != undefined) {
				return _props.cachedHtml[path];
			}
			var param = {
				async : false,
				url : path,
				type : "GET",
				dataType : "text"
			};
			try {
				var _res = _private.ajax(param,userParam);
				if(_res.statusText === "error") {
					mvc.log.e(mvc.string.error.ajax.loadErr, "FilePath", path);
				}
				var res = "";
				//console.log(JSON.stringify(_res));
				if(_res.responseText) {
					res = _res.responseText;
					_props.cachedHtml[path] = res;
				}
				return res;
			} catch(e) {
				mvc.log.e(mvc.string.error.ajax.loadErr, "FilePath", path);
				return "";
			}
		}
	};
	_private.init();
	var _public = {
		/**
		 * Synchorous ajax call
		 * @ path url
		 * @ userParam parameters of $.ajax
		 */
		syncLoad : _private.syncLoad,
		/**
		 * Asynchorous ajax call
		 * @ path url
		 * @ callback callback function
		 * @ userParam parameters of $.ajax
		 */
		asyncLoad : _private.asyncLoad
	};
	return _public;
});


mvc.app.ready(function(){
	mvc.ext(mvc.html,"ajax",new mvc.cls.dom_ajax());
});
/**
 *  view class based on jQuery
 * Events registered:  beforeLoad, beforeParse,afterParse, loaded, domReady, displayed
 * ./html/part_domview.js
 */
mvc.ext(mvc.html, "view_dom", mvc.Class.create(mvc.cls.absview, {
	uidata : {},
	"wrapperTag" : "div",
	"htmlPagePath" : null,
	"loadStatus" : "init", // init,  loading, parsing, loaded
	initialise : function($super, name) {
		$super(name, mvc.html.viewMgr);
	},
	update : function(data) {
		if (this.model!=undefined && !data){
			data = this.model.getData();
		}
		if (data==undefined){
			data=this.uidata;
		}
		data=this.fire("beforeUpdate", data, undefined, false);
		this.uidata = data;
		this.load(true);
		this.loadDom(true);
		var currentView = this.viewMgr.get();
		if(currentView) {
			var currentViewName = this.viewMgr.get().getName();
			if(currentViewName === this.getName()) {
				this.display();
			}
		}
	},
	/**
	 * Synchorously load / render / display current view.
	 */
	show : function() {
		if(this.model) {
			this.uidata = this.model.getData();
		}
		this.load();
		this.loadDom();
		this.display(true);
	},
	/**
	 * Display this view.
	 * @param forward Is page go forward or backward.
	 */
	display : function($super, forward) {
		var obj = this.$();
		if(obj.length == 0) {
			this.loadDom(true);
		}
		try {
			if(forward === true) {
				func = mvc.opt.showNextPage;
				


			} else {
				func = mvc.opt.showLastPage;
			}
			func(this.getName());
			return $super(forward);
		} catch(e) {
			mvc.log.e(e, "Display View", this.getName());
		}
	},
	/**
	 * Asynchrously and forcely load view to memory. "loaded" event will be triggered if it is done.
	 * @param isReload: forcely reload
	 * @param cb: callback func once loaded
	 */
	load : function(isReload) {
		if(isReload === true) {
			this.loadStatus = "init";
			this.op_buf = "";
		}
		if("loaded" === this.loadStatus) {
			return;
		}
		if("init" != this.loadStatus) {
			return;
		}
		var path = "";
		if(this.htmlPagePath == null) {
			path = mvc.opt.viewPath + "/" + this.getName() + ".html";
		} else {
			path = this.htmlPagePath;
		}
		var pageID = this.getName();
		// var layoutPath = mvc.opt.layoutPath + "/" + _props.layout + ".html";
		this.fire("beforeLoad");
		mvc.log.i(mvc.string.info.view.lpf + path);
		var pageHtml = mvc.html.ajax.syncLoad(path);
		// if(!_props.isUIdataLoaded) {
		// _props.uidata = mvc.html.uidata.getUIDataScope(_private.getUIDataPath());
		// }
		var uidata = {};
		uidata = mvc.util.copyJSON(this.uidata, uidata);
		var params = {"data":uidata};
		this.loadStatus = "loading";
		pageHtml = this.fire("beforeParse", pageHtml, undefined, false);
		var parsedPageHtml = mvc.html.parser.parseHtml(pageHtml, params);
		this.loadStatus = "parsing";
		parsedPageHtml = this.fire("afterParse", parsedPageHtml, undefined, false);
		if(this.op_buf != null && this.op_buf != "") {
			parsedPageHtml = this.op_buf + parsedPageHtml;
		}
		var finalHtml = mvc.util.text.format("<{1} id='{0}' class='{3}'>{4}</{2}>", pageID, this.wrapperTag, this.wrapperTag, this.viewMgr.getPageCls(), parsedPageHtml);

		this.op_buf = finalHtml;
		this.loadStatus = "loaded";
		this.fire("loaded", {}, undefined, false);
	},
	/**
	 * Load stored html to dom.
	 * @param isReload. default false.
	 */
	loadDom : function(isReload) {
		if(isReload == undefined) {
			isReload = false;
		}
		if(this.loadStatus != "loaded") {
			this.removeDom();
			this.load(true);
		}
		if(this.loadStatus === "loaded") {
			if(mvc.$("#" + this.getName()).length === 0 || isReload === true) {
				if(isReload) {
					this.removeDom();
					//may conflict with some UI libraries
				}
				mvc.$().append(this.op_buf);
				this.fire("domReady", this.$(), undefined, false);
			}
			return;

		} else {
			mvc.log.e("Cannot load view properly.", "view name:", this.getName());
		}
	},
	removeDom : function() {
		mvc.$("#" + this.name).remove();
	},
	/**
	 * Return a jQuery Object indicating a html element in current view
	 * page container will be returned if no selector given.
	 */
	$ : function(selector) {
		if( typeof selector != "undefined") {
			return mvc.$("#" + this.name).find(selector);

		}
		return mvc.$("#" + this.name);
	},
	/**
	 * remove this view
	 */
	remove : function($super) {
		this.removeDom();
		$super();
	},
	/**
	 * set dom events to view
	 */
	setDomEvent : function() {
		var that = this;
		var args = arguments;
		function bindEvent() {
			var domEvent = null;
			if(args.length === 0) {
				return;
			} else {
				for(var i = 0; i < args.length; i++) {
					domEvent = args[i];
					for(var selector in domEvent) {
						for(var evnt in domEvent[selector]) {
							that.$(selector).unbind(evnt);
							that.$(selector).bind(evnt, domEvent[selector][evnt]);
						}
					}
				}

			}

		}

		if(this.$().length === 0) {
			this.events.bind("domReady", "_setDomEvents", function() {
				this.events.unbind("domReady", "_setDomEvents");
				bindEvent();
			});
		} else {
			bindEvent();
		}
	},
	setUIData : function(data) {
		this.uidata = data;
	}
}));

mvc.cfg.addItem("html.domview", function(opt) {
	if(opt.showNextPage == undefined) {
		mvc.cfg.err("showNextPage");
		return false;
	}
	if(opt.showLastPage == undefined) {
		mvc.cfg.err("showLastPage");
		return false;
	}
	if(opt.viewPath == undefined) {
		mvc.cfg.err("viewPath");
		return false;
	}
});
/**
 * View Manager Definition
 * ./html/part_domViewMgr.js
 */
mvc.ext(mvc.html, "_domViewMgr",mvc.Class.create(mvc.cls.absViewMgr,new (function() {
	var _public = {
		/**
		 * display last view in history stack.
		 */
		back : function() {
			var viewName = this.historyStack.back();
			if(viewName != undefined) {
				this.get(viewName).display(false);
			}
			return viewName;
		},
		/**
		 * preload views
		 * @param view array.
		 * @param async. default true
		 * @param cb, callback function when async is true
		 */
		preLoad : function(viewArr, async,cb) {
			return _private.preLoad(viewArr,async,cb);
		},
		/**
		 * preload all views
		 * @param async. default true
		 * @param cb. callback function when async is true
		 */
		preLoadAll : function(async,cb) {
			var count=0;
			for (var key in _props._views){
				count++;
			}
			this.each(function(v) {
				if(async === false) {
					v.loadDom();
				} else {
					setTimeout(function() {
						v.loadDom();
						count--;
						if (count===0){
							if (cb && typeof cb==="function"){
								cb();
							}
						}
					}, 1);
				}
			});
		},
		/**
		 * setup the cls of page
		 * @param str class name
		 */
		setPageCls : function(str) {
			return _private.setPageCls(str);
		},
		/**
		 * get the cls of page
		 */
		getPageCls : function() {
			return _private.getPageCls();
		},
		initialise : function($super) {
			this.props.viewCls=mvc.html.view_dom;
			$super(_props);
		}
	}

	var _props = {
		pageCls : "page"
	};
	var _private = {
		preLoad : function(viewArr, async,cb) {
			var count=viewArr.length;
			for (var i=0;i<viewArr.length;i++){
				var view=viewArr[i];
				if (async===false){
					view.loadDom();
				}else{
					(function(){
						var v=view;
						setTimeout(function(){
							v.loadDom();
							count--;
							if (count===0){
								if (cb && typeof cb ==="function"){
									cb();
								}
							}
						},1)
					})();
				}
			}
		},
		getPageCls : function() {
			return _props.pageCls;
		},
		setPageCls:function(str){
			_props.pageCl=str;
			return str;
		}
		
	};
	return _public;
})()));

mvc.app.ready(function(){
	mvc.html.viewMgr=new mvc.html._domViewMgr();
	mvc.viewMgr=mvc.html.viewMgr;// create a shortcut for html view manager.
	mvc.view=function(){   //shortcut for most commonly used method.
		return mvc.viewMgr.get.apply(mvc.viewMgr,arguments);
	}
});
/**
 * Parser of <?mvc code ?>.
 * ./html/part_parser.js
 */
mvc.ext(mvc.cls, "html_js_parser", function() {
	var _public = {
		/**
		 * Parse html code within specific scope(params).
		 * @html Html code be parsed
		 * @param scope JSON object
		 */
		parseHtml : function(html, param) {
			return _private.parseHtml(html, param);
		},
		addScopeItem:function(key,val){
			if (key && val){
				_props._basic[key]=val;
			}
		},
		removeScopeItem:function(key){
			if (key && _props._basic[key]){
				delete _props._basic[key];
			}
		}
	};
	var _props = {
		startTag : "<?mvc",
		endTag : "?>",
		_basic : {
			__resStack : "",
			echo : function(str) {
				this.__resStack += str;
			},
			_var:function(name,val){
				if (this[name]){

				}
				this[name]=val;
			}
		}
	};
	var _private = {
		init:function(){
			if (mvc.opt.injectTag){
				if (mvc.opt.injectTag.startTag){
					_props.startTag=mvc.opt.injectTag.startTag;
				}
				if (mvc.opt.injectTag.endTag){
					_props.endTag=mvc.opt.injectTag.endTag;
				}
			}
		},
		parseHtml : function(__html, param) {
			var __index = -1;
			if(param == undefined || mvc.util.isEmpty(param)) {
				param = {};
			}
			param=mvc.util.copyJSON(_props._basic, param);
			if(__html == undefined) {
				return "";
			}
			var st = _props.startTag;
			var et = _props.endTag;
			var html_buffer=[];
			var js_buffer=[];
			var codeSnippts=__html.split(st);
			for (var i=0;i<codeSnippts.length;i++){
				var cs=codeSnippts[i];
				if (cs.indexOf(et) == -1){ //pure html
					html_buffer.push(cs);
				}else{ //mixture of partial js and html
					var mixture=cs.split(et);
					var htmlcode=mixture[1];
					var jscode=mixture[0];
					js_buffer.push(jscode);
					html_buffer.push(htmlcode);
				}
			}
			
			var result=mvc.html.parseExec(html_buffer,js_buffer,param);
			/*while(( __index = __html.indexOf(st)) != -1) {

				param.__resStack = "";
				var __startPos = __index + st.length + 1;
				var __endPos = __html.indexOf(et, __startPos);
				var __statement = __html.substring(__startPos, __endPos);
				var __val = "";
				__val = mvc.html.parseExec(__statement, param);
				if(__val == undefined) {
					__val = "";
				}
				__val = param.__resStack + __val;
				__html = __html.replace(__html.substring(__index, __endPos + et.length), __val);
			}*/
			return param.__resStack;
		}
	};
	
	_private.init();
	return _public;
});

mvc.ext(mvc.html, "parseExec", function(__htmlBuf__, __jsBuf__,__scope__) {
	var __htmlCounter__=0;
	function __wrapHtml__(){
		return "echo (__htmlBuf__["+__htmlCounter__+++"]);";
	}
	var __jsCode__="";
	for (var __i=0;__i<__jsBuf__.length;__i++){
		__jsCode__+=__wrapHtml__();
		__jsCode__+=__jsBuf__[__i];
	}
	__jsCode__+=__wrapHtml__();
	with(__scope__) {
		try {
			return eval(__jsCode__);
		} catch(e) {
			mvc.log.e(e, "Parse MVC code:", __jsCode__);
		}
	}
});
mvc.ext(mvc.html, "parseJSON", function(__code__) {
		try {
			return eval("("+__code__+")");
		} catch(e) {
			mvc.log.e(e, "Parse JSON Object:", __code__);
		}
});


mvc.app.ready(function(){
	mvc.ext(mvc.html,"parser",new mvc.cls.html_js_parser());
});

/**
 * Element is a re-usable UI component in views.
 * It is an extension of domview. It mainly adds an "element" method to html parser. 
 * "element" method will search for specified re-useable ui element file and pull the file content using ajax.
 *  the content will be returned.
 * 
 * "element" method can be used in an iteration way.
 * 
 * elements code is DOM parsable code or MVC HTML parser understandable code (<?mvc ?>).
 * 
 * ./html/part_html_element.js
 * 
 */
mvc.ext(mvc.html,"element",function(){
	try{
		if (mvc.html.parser == undefined){
			throw ("MVC HTML parser is not ready");
		}
	}catch(e){
		mvc.log.e(e);
	}
	//stub method
	function _element(name,params){
		if (params==undefined) {
          params= {};
        }
        var path=mvc.opt.elementPath+"/"+name+".html";
        var res= mvc.html.ajax.syncLoad(path);
        res=mvc.html.parser.parseHtml(res,params);
        return res;
	}
	
	//TODO add confg check
	mvc.html.parser.removeScopeItem("element");
	mvc.html.parser.addScopeItem("element",_element);
	
});

mvc.app.ready(function(){
	mvc.html.element();
});
mvc.cfg.addItem("html_element",function(opt){
	if (opt.elementPath==undefined){
		mvc.cfg.err("elementPath");
		return false;
	}
});


/**
 * Add permenant link supporting.
 * access of a static link is considered as a user action in this framework.
 * ./html/part_permenant_link.js
 */

mvc.cfg.addItem("html_startup_action", function(opt) {
	if(opt.onStart === undefined) {
		mvc.err("onStart");
		return false;
	}
})

mvc.ext(mvc.cls, "staticLink", function(hrefStr) {
	var conStr = mvc.opt.onStart.controller;
	var actStr = mvc.opt.onStart.method;
	var params = [];
	var s1 = hrefStr.indexOf('_ctl=');
	if(s1 > 0) {
		var subStr = hrefStr.substr(s1 + 5);
		var e1 = subStr.indexOf("&");
		if(e1 == -1) {
			conStr = subStr;
			e1 = subStr.indexOf("#");
			if(e1 != -1) {
				conStr = subStr.substring(0, e1);
			}
		} else {
			conStr = subStr.substring(0, e1);
		}
		var s2 = hrefStr.indexOf('_act=');
		if(s2 > 0) {
			subStr = hrefStr.substr(s2 + 5);
			var e2 = subStr.indexOf("&");
			if(e2 == -1) {
				actStr = subStr;
				e2 = subStr.indexOf("#");
				if(e2 != -1) {
					actStr = subStr.substring(0, e2);
				}
			} else {
				actStr = subStr.substring(0, e2);
			}
			var s3 = hrefStr.indexOf('_param=');
			if(s3 > 0) {
				subStr = hrefStr.substr(s3 + 7);
				var e2 = subStr.indexOf("&");
				var paramStr = "[]";
				if(e2 == -1) {
					paramStr = subStr;
					e2 = subStr.indexOf("#");
					if(e2 != -1) {
						paramStr = subStr.substring(0, e2);
					}
				} else {
					paramStr = subStr.substring(0, e2);
				}
				params = paramStr;
			}
		} else {
			mvc.log.i("_act is not found in static link");
		}

	}
	return {
			controller:conStr,
			method:actStr,
			params:params
	}
	
});
mvc.app.ready(function() {
	var hrefStr = window.location.href;
	var msgObj= mvc.cls.staticLink(hrefStr);
	var conStr=msgObj.controller;
	var actStr=msgObj.method;
	var params=msgObj.params;
	if( typeof mvc.opt.launch === "function") {
		mvc.opt.launch(msgObj);
	}else if(mvc.ctl(conStr).checkCtl(actStr)) {
		mvc.ctl(conStr).sendMSG(actStr, params);
	} else {
		mvc.log.i("default launch method or controller or method is not found.");
	}
	return;
});
/**
 *
 * ajax proxy
 *
 * ./html/part_ajax_proxy.js
 */

mvc.ext(mvc.proxy, "ajax", mvc.Class.create(mvc.cls.proxy, {
	props : {
		url : "",
		cfg_ajax:null,
		dataType:"text"
	},
	load : function(params, callback) {
		var url=this.props.url;
		if (params!=undefined&&typeof params==="object"){
			url+="?";
			for (var key in params){
				url+=key+"="+params[key]+"&";
			}
		}
		var that=this;
		var param = {
			async : true,
			url : url,
			type : "GET",
			dataType : this.props.dataType,
			success : function(res) {
				if (callback){
					callback(null,res);
				}
			},
			error : function(xhr, text, err) {
				mvc.log.e(text, "asyncLoad", that.props.url);
				if (callback){
					callback(text,{});
				}
			}
		};
		if(this.props.cfg_ajax != null) {// global configuration
			for(var key in this.props.cfg_ajax) {
				param[key] = this.props.cfg_ajax[key];
			}
		}
		$.ajax(param);
	},
	initialise:function($super,url,dataType){
		if (url==undefined){
			throw("Ajax proxy needs url as param of constructor.");
		}
		this.props.url=url;
		this.props.cfg_ajax=mvc.opt.ajax;
		this.props.dataType=dataType;
		$super();
	}
}));
