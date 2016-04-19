define('./js/lib/util',function(require ,exports ,module){
exports = module.exports = {
	//obj = {url,data:{key1:value1,key2:value2...},fileid,success,complete,progress,fail}支持多字段多文件上传
	ajaxPostFormData:function(obj){
		var xhr = new XMLHttpRequest(),
			file,//文件
			form=new FormData(),//表单对象
			target=document.getElementById(obj.fileid);//获取文件端id
		
		obj.data = obj.data || {};
		
		for(var attr in obj.data){
			form.append(attr,obj.data[attr]);//添加数据字段
		}
		if (target) {
			file = target.files;
			
			for(var i = 0,len = file.length;i < len;i++){
				form.append('file'+i,file[i]);//添加文件
			}
		};
		
		xhr.open("post", obj.url, true);//异步方式上传文件
		xhr.onreadystatechange=function(){
			if(xhr.readyState==4){
				obj.complete && obj.complete(xhr.status,xhr);//完成请求
				if(xhr.status >= 200 && xhr.status < 300){//上传成功返回回调信息xhr.responseT
					obj.success && obj.success(xhr.responseText,xhr.status,xhr);//请求成功
				}else{
					obj.fail && obj.fail(xhr.status,xhr);//请求失败
				}
			}
		}
		xhr.upload.onprogress = function(e){
			obj.progress && obj.progress((e.loaded / e.totalSize *100).toFixed(2), e.loaded, e.totalSize);//上传文件时候文件上传进度
		}
     	xhr.send(form);//发送表单内容	
	},
	test:function(){
		alert('testing...');
	}
}
});
