mvc.controllers.main={
    iscroll:null,
    init:function(){
        $("#config").transform({
            translateX:-253
        });
        
    },
    appSize:function(){
        var windowHeight=$(window).height();
        var windowWidth=$(window).width();
        $("body").height(windowHeight);
        $("body").width(windowWidth);
    },
    loadCoverPage:function(){
         mvc.view("cover").show();
    },
    initSlideEvents:function(){
        var cfgPanel=$("#config .cfgbg");
        var cfg=$("#config");
        var pg=$("#pageContainer");
        var opt=$("#config .option img");
        var optRect=$("#config .option");
        var cfgWidth=253;
        $(function(){
           $("#config .option").toggle(function(){
              cfgPanel.show();
              cfg.animate({
                translateX:0 
              });
              pg.animate({
                translateX:cfgWidth  
              });
              opt.animate({
                  rotate:180
              });
              optRect.addClass('noopacity');
              
           },function(){
               pg.animate({
                   translateX:0
               });
               cfg.animate({
                   translateX:-cfgWidth
               },function(){
                   cfgPanel.hide();
               });
               opt.animate({
                  rotate:-180
              });
              optRect.removeClass('noopacity');
               
           });
        });
    },
    initMenuEvents:function(){
    	$("#header .menu ul li").click(function(){
    		var id=$(this).attr("id");
        var act=id.split("_")[1];
        mvc.controllers.menu[act]();
    	});
    },
    preparePageCanvas:function(){
      $("#pages").addClass("embed");
      $("#header").fadeIn();
      $("#footer").fadeIn();
      var that=this;
      mvc.viewMgr.events.bind("beforeLoad","showwait",function(){
        console.log("showwait");
        that.showWait();
        var tmp=0;

      });
      mvc.viewMgr.events.bind("displayed","hidewait",function(){
        console.log("hidewait");
        that.hideWait();
        var curView=mvc.view();
        setTimeout(function(){
          if (curView.$(".pageWrapper").length>0){
            that.iscroll=new iScroll(mvc.view().$().attr("id"),{
              vScrollbar:false,
              hScrollbar:false
            });
          }else{
            that.iscroll=null;
          }
        },1);
      });
      mvc.opt.showNextPage=function (pageID) {
        var jQueryObj = mvc.$("#" + pageID);
        var curPage = mvc.$(".currentPage");
        
        jQueryObj.css("opacity","0");
        jQueryObj.css("display","block");
        if (curPage.length>0){
          curPage.animate({
            opacity:0
          },300,function(){
            curPage.removeClass("currentPage");
            curPage.css("display","none");
            jQueryObj.css({
              opacity:0
            });
            jQueryObj.addClass("currentPage");
            jQueryObj.animate({
              opacity:1
            },300);
          });
       }else{
        jQueryObj.css({
          opacity:0
        });
        jQueryObj.addClass("currentPage");
        jQueryObj.animate({
          opacity:1
        },300);


        
      }
    }

    },
    showWait:function(){
      setTimeout(function(){
        $("#mask").fadeIn();
      },0)
      
    },
    hideWait:function(){
      setTimeout(function(){
        $("#mask").stop();
        $("#mask").fadeOut(function(){
          $("#mask").hide();
        });
    },0);
    },
    initModels:function(cb){
      var that=this;
      var models=[];
      mvc.modelMgr.get("assembly").load(undefined,function(err,res){
        mvc.opt.assembly=res;
        that.initCfg();
        defineModels();

        var data=mvc.opt.cfg.data;
        for (var key in data){
          models.push(key);
        }
        if (models.length>0){
          loadModel(models,cb);
        }
        
      });

      function loadModel(models,callback){
        var name="";
        if (models.length>0){
          name=models.shift();
        }else{
          callback();
          return false;
        }
        
        var model=mvc.modelMgr.get(name);
        
        model.load(undefined,function(err,res){
          loadModel(models,callback);
        });
      }
    },
    initCfg:function(){
      if (mvc.opt.assembly){
        var lang=this.getLang();
        if (mvc.opt.assembly[lang]){
          mvc.opt.cfg=mvc.opt.assembly[lang];
        }
      }
    },
    getLang:function(){
      if (mvc.opt.lang){
        return mvc.opt.lang;
      }else{
        return "en";
      }
    },
    showVersion:function(){
      var version=mvc.opt.cfg.version;
      $(".version").text(version);
    }
}
