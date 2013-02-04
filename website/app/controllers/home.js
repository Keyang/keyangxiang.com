mvc.regCtl("home", {
	curSlidePos : -1,
	timer : null,
	changeHomeImage : function(num) {
		this.curSlidePos = num;
		var homeView = viewMgr.get("home");
		var lastImg = $(homeView.$(".album img.active"))
		var nextImg = $(homeView.$(".album img")[num]);
		lastImg.removeClass("active");
		lastImg.fadeOut();
		nextImg.fadeIn("normal",function(){
			nextImg.addClass("active");
		});
		homeView.$(".rect.active").removeClass("active");
		$(homeView.$(".rect")[num]).addClass("active");
	},
	startSlides : function() {
		//ms
		var timeSpan = 5000;
		var that = this;
		this.timer = setInterval(function() {
			var curPos = that.curSlidePos;
			var amount = home_image.getData().images.length;
			if(curPos == amount - 1) {
				curPos = 0;
			} else {
				curPos++;
			}
			if(!amount || amount === 0) {
				return;
			}
			var homeView = viewMgr.get("home");
			that.changeHomeImage(curPos);
		}, timeSpan);
	},
	stopSlides : function() {
		if(this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}
});
