mvc.controllers.cover = {
    viewName : "cover",
    initView : function() {
        var view = mvc.view(this.viewName);
        view.setDomEvent({
            ".myprofile" : {
                mouseup : function() {
                    mvc.controllers.cover.opencv();
                },
                mousedown:function(){
                	mvc.controllers.cover.shrink();
                }
            }
        });
    },
    shrink:function(){
    	var view=mvc.view(this.viewName);
    	 var front=view.$(".front");
    	 var myprofile=view.$(".myprofile");
    	 myprofile.transform({
    	 	origin:["center","center"]
    	 });
    	 myprofile.animate({
    	 	scale:0.9
    	 },50,function(){
    	 	myprofile.animate({
    	 	scale:1
    	 },50);
    	 });
    },
    opencv : function() {
        var view=mvc.view(this.viewName);
        if (view.$().length == 0){
           view.remove();
           mvc.controllers.main.preparePageCanvas();
           mvc.controllers.menu.basicInfo();
           return;
        }
        var viewContainer=view.$();
        var bg=view.$(".bg");
        var front=view.$(".front");
        var myprofile=view.$(".myprofile");
        var cv=view.$(".cv");
        myprofile.transform({
        	origin:["center","center"]
        });
        myprofile.animate({
        	scale:2,
        	opacity:0
        });
        viewContainer.animate({
            opacity:0
        },undefined,function(){
           view.remove();
           mvc.controllers.main.preparePageCanvas();
           mvc.controllers.menu.basicinfo();
        });
        /*cv.animate({
            translateY:-50,
            opacity:0
        },undefined,function(){
           myprofile.transform({
               origin:['right','bottom']
           })
           myprofile.animate({
               scale:1.6,
               translateX:50,
               translateY:-20
           },undefined,function(){
               myprofile.addClass("openedcv");
               front.transform({
                  origin:['left','top'] 
               });
                front.animate({
                   scale:[0.3,0.3],
                   left:0,
                   top:0
                });
           }) ;
        });*/
       
    }
}