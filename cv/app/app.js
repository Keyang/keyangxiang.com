mvc.app.init({
    launch:function(start){
        var mainCtl= mvc.controllers.main;
        mainCtl.initModels(function(){
            //setup version
            mainCtl.showVersion();
            //mainCtl.appSize();
            mainCtl.init();
            mainCtl.initSlideEvents();
            mainCtl.initMenuEvents();
            
            console.log(start);
            if (start.controller=="nav"){
                //init cover view
                mainCtl.loadCoverPage();
                mvc.controllers.cover.initView();
            }else{
                if (start.controller != "cover"){
                    mainCtl.preparePageCanvas();
                }
                mvc.controllers[start.controller][start.method]();
            }
        });
        
    }
});
