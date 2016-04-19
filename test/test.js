//纯粹保留一些测试例子


// requestAnimationFrame(function(){
//     jc.circle(300,0,50,'#ff0',1).animate({y:500,x:500,radius:10,color:'#0ff'},2000,{type:'inOut',fn:'linear',n:1.5});
// });
var self = this;
setInterval(function(){
    requestAnimationFrame(function(){
        //jc.circle(300,100,5,'#ff0',1).shadow({x:0,y:0,blur:20,color:'#f00'});
        // var colors=[
        //             [0,'rgba(255,255,0,0.8)'],
        //             [1,'rgba(255,255,255,0.1)']];
        // var gradient=jc.rGradient({x1:300,y1:300,r1:0,x2:300,y2:300,r2:10,colors:colors});
        
        jc.circle(parseInt(Math.random()*self.WIDTH),self.HEIGHT,10,'#ff0',1).animate({y:10},5000,{type:'in',fn:'linear'},{fn:function(){
                this.animate({x:'+=1'});
                var self = this;
                var colors=[[0,'rgba(255,0,0,0.8)'],
                            [1,'rgba(255,255,255,0.1)']];
                var gradient=jc.rGradient({x1:self.getCenter().x,y1:self.getCenter().y,r1:0,x2:self.getCenter().x,y2:self.getCenter().y,r2:10,colors:colors});
                this.color(gradient)
            }},function(){this.del();})
    })
},1000);



// jc.start('waves',true);
// jc.circle(300,200,100,'#f0f',1).id('a');
// setTimeout(function(){jc("#a").del(); }, 2000)


setInterval(function(){
    //requestAnimationFrame(function(){
        //jc.circle(300,100,5,'#ff0',1).shadow({x:0,y:0,blur:20,color:'#f00'});
        // var colors=[
        //             [0,'rgba(255,255,0,0.8)'],
        //             [1,'rgba(255,255,255,0.1)']];
        // var gradient=jc.rGradient({x1:300,y1:300,r1:0,x2:300,y2:300,r2:10,colors:colors});
        var xIdx = parseInt(Math.random()*self.WIDTH),
            sb = parseInt(Math.random()*10) < 5 ? '+' : '-',
            r = Math.floor(Math.random() * (254)),
            g = Math.floor(Math.random() * (254)),
            b = Math.floor(Math.random() * (254)),
            y = Math.floor(Math.random() * (self.HEIGHT)),
            color = "rgba("+r+", "+g+", "+b+", 0.5)";
        jc.circle(xIdx,self.HEIGHT,5,color,1).shadow({x:0,y:0,blur:10,color:'#fff'}).animate({y:10},5000,{type:'in',fn:'sine'},{fn:function(){
                this.animate({x:sb+'=2'});
            }},function(){this.del();})
    //})
},100);

////////////////////////////

router.post('/', function(req, res ,next) {
    console.log(req.body);

    console.log(req.files);  // 上传的文件信息

    var des_file = __dirname + "/" + req.files[0].originalname;
    fs.readFile( req.files[0].path, function (err, data) {

        fs.writeFile(des_file, data, function (err) {
         if( err ){
              console.log( err );
         }else{
               response = {
                   message:'File uploaded successfully', 
                   filename:req.files[0].originalname
              };
          }
          console.log( response );
          res.end( JSON.stringify( response ) );
       });
    });

 res.send({a:8});
});

////////////////////////////

util.ajaxPostFormData({
    url:'http://127.0.0.1:3000/upload',
    data:{milu:'aaa'},
    fileid:'file',
    success:function(res){
        console.log(res)
    },
    complete:function(){
        //alert('complete')
    },
    fail:function(){
        alert('fail')
    },
    progress:function(per,loaded,total){
        console.log(per, loaded, total);
    }
});

//////////////////////////////////

(function() {
    var DeleteVoice = {
        audioContext: (function() {
            var AudioContext = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext);

            return new AudioContext();
        })(),
        getContext: function() {
            return this.audioContext;
        },
        deleteVoice: function(audiobuffer) {
            var audioContext = this.audioContext,
                source = this.source,
                gain = audioContext.createGain(1),
                gain2 = audioContext.createGain(1),
                gain3 = audioContext.createGain(),
                channelSplitter = audioContext.createChannelSplitter(2),
                channelMerger = audioContext.createChannelMerger(2),
                filterlow = audioContext.createBiquadFilter(),
                filterhigh = audioContext.createBiquadFilter(),
                gain4 = audioContext.createGain(),
                jsNode = audioContext.createScriptProcessor(2048);


            // Note: the Web Audio spec is moving from constants to strings.
            filterlow.type = filterlow.LOWPASS;
            filterlow.frequency.value = 20;
            filterlow.Q.value = 0;
            filterhigh.type = filterhigh.HIGHPASS;
            filterhigh.frequency.value = 20000;
            filterhigh.Q.value = 0;

            // 反相音频组合
            gain.gain.value = -1;
            gain2.gain.value = -1;

            // 方案 a
            if (audiobuffer) {
                source.buffer = audiobuffer;
            } else {

            }

            source.connect(gain3);
            gain3.connect(channelSplitter);

            // 2-1>2
            channelSplitter.connect(gain, 0);
            gain.connect(channelMerger, 0, 1);
            channelSplitter.connect(channelMerger, 1, 1);

            //1-2>1
            channelSplitter.connect(gain2, 1);
            gain2.connect(channelMerger, 0, 0);
            channelSplitter.connect(channelMerger, 0, 0);

            // 高低频补偿合成
            // source.connect(filterhigh);
            // source.connect(filterlow);
            // filterlow.connect(channelMerger);
            // filterhigh.connect(channelMerger);
            channelMerger.connect(audioContext.destination);
            // 普通合成
             //channelMerger.connect(audioContext.destination);

        },

        load: function(options) {
            // 方案a
            // var self = this,
            //     url = options.url,
            //     request = new XMLHttpRequest(),
            //     callback = options.callback;
            // request.open('GET', url, true);
            // request.responseType = 'arraybuffer';
            // request.onload = function() {
            //     self.audioContext.decodeAudioData(request.response, function(audiobuffer) {
            //         var audioContext = self.audioContext,
            //             source = audioContext.createBufferSource();
            //         self.source = source;
            //         self.deleteVoice(audiobuffer);
            //         window.currentBgBuffer = audiobuffer;
            //         if (callback) {
            //             callback();
            //         }
            //     }, function() {
            //         console.log('error');
            //     });
            // }
            // request.send();

            // // 方案b ， 无法获取audio的buffer 做不了录音合成，但是去人声load效率和速度快很多
            var audio = new Audio(),
            source = this.audioContext.createMediaElementSource(audio);
            console.log(source);
            audio.src = options.url;
            this.audio = audio;
            this.source = source;
            this.deleteVoice();
        },
        play: function() {
            if (this.audio) {
                this.audio.play();
            } else {
                this.source.start(0);
            }
        },

        stop: function() {
            if (this.audio) {
                this.audio.pause();
            } else {
                this.source.stop(0);
            }
        }
    };
    window.DeleteVoice = DeleteVoice;
})();
var d = DeleteVoice;
d.load({url:'./media/tongai.m4a',callback:function(){alert('ok');}});







//res.end("ok");
    if (req.body.data) {
        //能正确解析 json 格式的post参数
        res.send({"status": "success", "name": req.body.data.name, "age": req.body.data.age});
    } else {
        //不能正确解析json 格式的post参数
        var body = '', jsonStr;
        req.on('data', function (chunk) {
            body += chunk; //读取参数流转化为字符串
        });
        req.on('end', function () {
            //读取参数流结束后将转化的body字符串解析成 JSON 格式
            try {
                jsonStr = JSON.parse(body);
            } catch (err) {
                jsonStr = null;
            }
            console.log(body);
            jsonStr ? res.send({"status":"success", "name": jsonStr.data.phone, "age": jsonStr.data.name}) : res.end({"status":"error"});
           res.end();
        });
    }










    