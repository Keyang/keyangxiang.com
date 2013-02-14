function defineModels(){
	mvc.regModel({
		name:"techskills",
		proxy:new mvc.proxy.ajax(mvc.opt.cfg.data.techskills,"json")
	});
	mvc.regModel({
		name:"knowledgement",
		proxy:new mvc.proxy.ajax(mvc.opt.cfg.data.knowledgement,"json")
	});
}

