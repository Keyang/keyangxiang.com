mvc.controllers.workexp={
	workexperienceiScroll:null,
	init:function(){
		var view=mvc.view("workexperience");
		view.setDomEvent(this.getDomEvent());
		mvc.view("workexperience").show();
		this.initiScroll();
		
	},
	getDomEvent:function(){
		var that=this;
		return {
			".wenavbar .btn":{
				"click":function(){

					var pageNum=parseInt($(this).text())-1;
					that.workexperienceiScroll.scrollToPage(pageNum);
				}
			}
		};
	},
	initiScroll:function(){
		var workexps=mvc.view("workexperience").$(".workexps")[0];
		var that=this;
		var view=mvc.view("workexperience");
		setTimeout(function(){
			var width=view.$(".pageContent").width();
			console.log(width);
			width=1000;
			var itemsNum=3;
			view.$(".workexperiencexps").width(width);
			//view.$(".workexps li").width(width);
			view.$(".workexps .innderWrapper").width(width*itemsNum);
			view.$(".wenavbar").css("margin-left","-"+(29*itemsNum/2)+"px");
			that.workexperienceiScroll=new iScroll(workexps,{
				snap: true,
				momentum: false,
				hScrollbar: false,
				vScroll:false,
				onScrollEnd:function(){
					var curPage=that.workexperienceiScroll.currPageX;
					that.setNavBtnStyle(curPage);

				}
			});
		},1);
	},
	setNavBtnStyle:function(num){
		var view=mvc.view("workexperience");
		var btns=view.$(".wenavbar .btn");
		btns.removeClass("active");
		var curBtn=$(btns[num]);
		curBtn.addClass("active");
	}
}