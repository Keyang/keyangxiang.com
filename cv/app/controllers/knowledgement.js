mvc.controllers.knowledgement={
	init:function(){
		var data=this.getUIData();
		mvc.view("knowledgement").setUIData(data);
		mvc.view("knowledgement").show();
	},
	getUIData:function(){
		var data=mvc.modelMgr.get("knowledgement").getData();
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