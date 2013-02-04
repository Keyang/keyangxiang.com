function fu() {
	var url=$("#uploader").val();
	var sendObj={
		csv:$("#rawcsv").val(),
		omit:$("#omitcolumn").val()
	}	
	$.ajax({
		url:url,
		type:"POST",
		data:sendObj,
		dataType:"text",
		success:function(res){
			$("#res").text(res);
			
		}
	});

	return false;

}