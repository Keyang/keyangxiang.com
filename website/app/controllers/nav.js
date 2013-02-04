mvc.ext(mvc.controllers, "nav", {
	home : function() {
		home_image.load(undefined, function() {
			var homeView = viewMgr.get("home");
			homeView.bindModel(home_image);
			homeView.setDomEvent({
				".rect" : {
					"click" : function() {
						var val = $(this).find("input").val();
						mvc.ctl("home").postMSG("changeHomeImage", [val]);
						homeView.$(".rect").removeClass("active");
						$(this).addClass("active");
					}
				},
				".album" : {
					"mouseenter" : function() {
						mvc.ctl("home").postMSG("stopSlides");
					},
					"mouseleave" : function() {
						mvc.ctl("home").postMSG("startSlides");
					}
				}
			});
			homeView.show();
			mvc.ctl("home").sendMSG("startSlides");
			mvc.ctl("home").postMSG("changeHomeImage", [0]);
		});
	},
	sidebar : function() {
		var aboutView = viewMgr.get("sidebar");
		var projectModel = mvc.modelMgr.get("projects");
		projectModel.load([],function() {
			var data = projectModel.getData();
			aboutView.setUIData(data);
			aboutView.show();
		});
	},
	projects:function(){
		var pjView=viewMgr.get("projects");
		var pjModel=mvc.modelMgr.get("projects");
		pjModel.load([],function(){
			pjView.bindModel(pjModel);
			pjView.show();
		});
	},
	jqmvc:function(){
		this.projects();
	},
	html2data:function(){
		this.projects();
	}
})