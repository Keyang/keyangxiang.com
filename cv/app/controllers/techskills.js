mvc.controllers.techskills={
	init:function(){
		var data=this.getUIData();
		mvc.view("techskill").setUIData(data);
		mvc.view("techskill").show();
	},
	getUIData:function(){
		var data=mvc.modelMgr.get("techskills").getData();
		var headers=[];
		var rows=0;
		for (var key in data){
			headers.push(key);
			rows=rows>data[key].length?rows:data[key].length;
		}
		return {
			headers:headers,
			data:data,
			rows:rows
		}
	}
}