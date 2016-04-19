module.exports = {
	//obj = {url,data:{key1:value1,key2:value2...},fileid,success,complete,processing,fail}支持多字段多文件上传
	ajaxPostFormData:function(obj){
		var xhr = new XMLHttpRequest(),
			file,//文件
			form=new FormData(),//表单对象
			target=document.getElementById(obj.id);//获取文件端id
		
		file=target.files[0];
		form.append('file',file);
		form.append('name','milu');
		
		
		xhr.open("post", obj.url, true);//异步方式上传文件
		xhr.onreadystatechange=function(){
			if(xhr.readyState==4){
				if(xhr.status==200){//上传成功返回回调信息xhr.responseT
					obj.success(xhr.responseText);
				}
			}
		}
     	xhr.send(form);//发送表单内容	
	},
	test:function(){
		console.log('testing...');
	}
}