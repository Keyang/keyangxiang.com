mvc.regCtl("project",{
	csv2json:function(){
		var pjView=viewMgr.get("csv2json");
		var pjModel=mvc.modelMgr.get("projects");
		pjModel.load([],function(){
			pjView.bindModel(pjModel);
			pjView.show();
		});
	}
});
