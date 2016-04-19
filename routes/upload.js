var express = require('express');
    router = express.Router(),
    url = require('url'),//解析get参数
 	util = require('util'),//工具模块
 	//bodyParser = require("body-parser"),
 	formidable = require('formidable'),
 	fs = require("fs"),
 	app = express();


//app.use(bodyParser.urlencoded({extended: false}));//用来解析post数据




/* GET upload listing. */
router.get('/', function(req, res, next) {
	var query = util.inspect(url.parse(req.url, true));
  	res.send(query);
});

router.post('/', function(req, res ,next) {
	console.log(88);

	res.header("Access-Control-Allow-Origin", "*");
	//设置返回字符串编码
	res.header( 'Content-Type','text/javascript;charset=utf-8');
	//new一个formidable.IncomingForm();
	var form = new formidable.IncomingForm();
	//设置临时文件存放的路径
	form.uploadDir = "./tmp";
	//设置上传数据的编码
	form.encoding='utf-8';
	//设置是否保持上传文件的拓展名
	form.keepExtensions = true;
	//文件上传过程中触发可以做上传进度查看
	form.on('progress', function(bytesReceived, bytesExpected) {
		//console.log(bytesReceived);
		if(bytesExpected>1024*1024*10){//bytesExpected为等待上传的文件的大小，超过大小就返回错手动触发error
		  this.emit('error',"file too big")
		};
	});
	//返回非文件的部分数据
	form.on('field', function(name, value) {
		//console.log('filed:');
		//console.log(name+" "+value)
	});
	//文件上传成功后触发
	form.on('file', function(name, file) {
		//console.log(file);
		if(file.type == 'text/css'){//文件类型不是合法的
			console.log('error');
		    this.emit('error',"unknow file type");//手动触发error
		    fs.unlink(file.path)//删掉临时文件
		}
		else {
		  //成功上传，把临时文件移动到public文件夹下面
		  console.log(66666,file.path);
		  fs.renameSync(file.path, "./public/" + file.name);
		}
	});
	//流程正常处理
	form.on('end',function(){
		res.end('上传成功');
	});
	//出错
	form.on('error',function(err){
		res.end('error:'+err);
	})
	//执行文件上传任务
	form.parse(req,function(errors, fields, files){
		if (errors) {this.emit('error',"unknow file type");};//手动触发error
		console.log(fields);
		//console.log(999999999);
		console.log(files);
	});
	res.send({a:8});
});

module.exports = router;
