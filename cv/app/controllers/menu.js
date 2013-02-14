mvc.controllers.menu={
	
	selectMenu:function(name){
		$("#header .menu .active").removeClass("active");
		$("#header #menu_"+name).addClass("active");
	},
	basicinfo:function(){
		this.selectMenu("basicinfo");
		var that=this;
		mvc.view("basicinfo").setDomEvent({
			".more":{
				"click":function(){
					var name=$(this).data("item");
					that[name]();
					return false;
				}
			}
		});
		mvc.view("basicinfo").show();

	},
	workexperience:function(){
		this.selectMenu("workexperience");
		mvc.controllers.workexp.init();
	},
	techskill:function(){
		this.selectMenu("techskill");
		mvc.controllers.techskills.init();
	},
	knowledge:function(){
		this.selectMenu("knowledge");
		mvc.controllers.knowledgement.init();
	},
	education:function(){
		this.selectMenu("education");
		mvc.view("education").show();
	},
	projects:function(){
		this.selectMenu("projects");
		mvc.view("projects").show();
	}

}