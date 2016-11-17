##  Web Audio API介绍与web音频应用案例分析  ##

Web Audio API是web处理与合成音频的高级javascript api。Web Audio API草案规范由W3C audio working group定制，旨在解决javascript在web平台处理音频的短板，底层由c++引擎提供支持与优化。Web Audio API提供了非常丰富的接口让开发者在web平台上实现对web音频进行处理。利用Web Audio API，web开发者能够在web平台实现音频音效、音频可视化、3D音频等音频效果。本篇文章首先介绍了Web Audio API相关概念、常用的几个接口节点，以便不熟悉Web Audio的开发人员有个了解。后面主要分析了3个Web Audio API的应用案例，web音频录音与实时回放、web音频剪切、web实现在线k歌，通过应用案例加深对Web Audio API的了解。读者也可以根据案例开拓思维，做出更好玩的web音频应用。

### Web Audio API基本概念 ###
- audio context

	audio context是Web Audio API处理web音频的核心对象。在整个web 音频处理中，所有处理连接过程都由audio context管理。（如图，audio context控制source节点的生成和destination节点的生成，同时控制着source节点与destination节点之间的连接）

	![audio context](http://i.imgur.com/RsnkTgj.png)

- modular routing

	模块路由是Web Audio API处理web音频的工作方式，这里可以理解为web音频处理的过程就像学CCNA的时候路由器的路由连接方式，从源到目的，中间有很多路由节点，它们之间相互连接且无回路，类似一个有向图。

	![modular routing](http://i.imgur.com/Zu2X2ZU.png)


- audio node

	audio node是Web Audio API处理音频时的音频节点。节点由audio context生成，每个节点有自己的功能。

- audio routing graph

	音频路由拓扑图就是在audio context控制下，许多个音频节点相互连接，从源到节点，形成的有向图。每个拓扑图代表了一种音频处理的效果。

## Web Audio API节点介绍 ##

Web Audio API处理web音频的过程：AudioContext产生实例节点，音频在每个节点中按次序连通。一次成功音频播放必须有源节点和目的节点，即`sourceNode ——> destinationNode`。音频从源节点到目的节点的中间可以有许多中间节点，这一点类似路由拓扑图，节点间必须畅通才能实现音频的播放。每个AudioContext对象可以一多个音频源节点实例，但是只能有一个目的节点实例。AudioContext的中间节点实例可以对音频进行处理，如音频可视化、音效处理。

- AudioContext

	AudioContext是Web Audio API的核心对象。所有的audio 节点实例由AudioContext生成。
    `var audioContext = new AudioContext(); `
	不同浏览器厂商实现AudioContext有所差异，可以加上对应前缀进行兼容。

- sourceNode

	音频源节点，表示音频在webAudio的一个输出，一个audio graph允许有多个音频源输出。在webAudio中有三种类型的音频源输出：

	    var audioContext = new AudioContext(); 
	    var source1 = audioContext.createMediaElementSource(audio);
	    var source2 = audioContext.createMediaStreamAudioSourceNode(stream);
	    var source3 = audioContext.createBufferSource(buffer);
	
	MediaElementSource是指从HTML5标签<audio>获取的音频源输出
		
	StreamAudioSource是指从navigator.getUserMedia获取的外部（如麦克风）stream音频输出

	BufferSource是指通过xhr获取服务器音频输出

	不同的音频源输出有不同的应用场景或处理方式，如StreamAudioSource可以用来音频录音，BufferSource可以用来音频剪辑等。

- audio effects filters

	这里介绍几个webAudio的音效处理节点。
	
	

	- DelayNode，可以将音频延时播放，如果在音频播放时，一路正常到达destinationNode，一路通过DelayNode到达destinationNode，就可以产生回音混响的效果
	
					——————————————>
			source 					——>destinationNode
					——>delayNode——>
	
	- gainNode，在webAudio中，可以通过gainNode来控制音量

	- BiquadFilterNode，可以用于音频滤波处理。Web Audio API提供了高通滤波、低通滤波的接口，利用这些接口也可以实现中通滤波。

	音频经过这些音效处理节点后，再输入destinationNode，就可以实现相应的音效效果。

		var filter = audioContext.createBiquadFilter();//滤波器
		var delay = audioContext.createDelay();//音效延迟
		var gain = audioContext.createGain();//音量控制
		filter.frequency.value = 20;
		delay.delayTime.value = 2;
		gain.gain.value = 0.5;
		source.connect(filter);
		source.connect(delay);
		source.connect(gain);
		//输入destination节点
		filter.connect(audioContext.destination);
		delay.connect(audioContext.destination);
		gain.connect(audioContext.destination);

- audio destinations

	weAudio经过处理后，最后只有输出到AudioDestinationNode才能播放，从而实现一个完整的Audio graph。

		audioNode.connect(audioContext.destination);

- Data analysis and visualisation

	在webAudio实现可视化可以利用analyser节点实现音频可视化。analyser提供了傅立叶时域变换和频域变换后的数据，根据对应的数据实现可视化的效果。
			
		var analyser = audioContext.createAnalyser();//音频分析节点
		    analyser.fftSize = 512;
		var bufferLength = analyser.fftSize;
		var dataArray = new Float32Array(bufferLength);
		analyser.getFloatTimeDomainData(dataArray);//获取音频数据

	![音频可视化](http://i.imgur.com/rd0Hvxr.png)

- Splitting and merging audio channels

	webAudio提供了的对声道的处理节点，包括声道分离和声道合并。实际应用场景比如通过对声道的分离，经过一系列处理后再合并，实现在歌曲中人声的消除。

		var channelSplitter = audioContext.createChannelSplitter(2);
		var channelMerger = audioContext.createChannelMerger(2);


- Audio spatialization

	在webAudio中也可以实现3D音效，对应的节点是PannerNode。PannerNode可以设置音频源的方位（上下、左右、远近）从而在听觉上产生空间的感觉。

		var panner=audioContext.createPanner();
		    panner.setOrientation(0,0,0,0,1,0);//设置音频源的位置
		var a=0,r=8;
		    panner.setPosition(Math.sin(a/100)*r,0,Math.cos(a/100)*r);//音频源运动轨迹

- Audio processing via JavaScript

	Web Audio API提供了丰富的音频处理接口为音效处理提供了许多方便，但是这些接口也有局限性，开发人员无法定制自己需要的效果，因此，webAudio提供了ScriptProcessorNode节点。ScriptProcessorNode可以获取到音频原始处理数据，然后开发人员根据对应音频音效算法对这些音频数据进行处理，从而实现定制音频音效效果。

		var source = audioContext.createMediaStreamSource(stream);
		var recorder = audioContext.createScriptProcessor(1024,1,1);
		source.connect(recorder);
		recorder.connect(exports.audioContext.destination)
		recorder.onaudioprocess=function(e){//音频播放过程中实现对音频数据处理
		    var inputBuffer = e.inputBuffer;
		    var outputBuffer = e.outputBuffer;
		    for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
		        var inputData = inputBuffer.getChannelData(channel);
		        var outputData = outputBuffer.getChannelData(channel);
		        for (var sample = 0; sample < inputBuffer.length; sample++) {
		          outputData[sample] = inputData[sample] * 0.5;
		        }
		    }
		};

## Web Audio API应用案例分析 ##

- web音频录音和实时回放

	思路：首先创建一个stream源节点，通过`navigator.getUserMedia`获取麦克风音频stream，然后再连接到ScriptProcessorNode对外部声音进行处理（数据存储、转换），最后连接到destination进行实时的播放。通过ScriptProcessorNode获取的音频数据可以浏览器播放并保存到本地。
		
							  ————>获取音频数据存储————>转blob保存本地
		navigator.getUserMedia								
							  ————>ScriptProcessorNode处理数据————>实时回放

	关于webAudio也可以通过W3C提供的一个新的音频处理接口MediaRecorder Api进行录音，具体使用参考[https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API "MediaStream_Recording_API")

	**具体实现过程**
	
	1 获取麦克风

	

		getSpeaker:function () {
        	navigator.getUserMedia({audio:true},exports.onSuccess,exports.onError);
        }
	
	2 使用MediaRecorder Api进行录音
	
	MediaRecorder可以读取到navigator.getUserMedia输入的音频数据，并提供了接口进行数据存取。MediaRecorder读取的数据进行转码后，才能通过window.URL.createObjectURL转成blob:资源后保存本地。

		onSuccess:function (stream) {
        	exports.mediaRecorder = new MediaRecorder(stream);//创建MediaRecorder对象
        	exports.mediaRecorder.onstop = function (e) {//结束录音
      			var blob = new Blob(exports.chunk, { 'type' : 'audio/wav;' }),
      			    url = window.URL.createObjectURL(blob);//将音频数据转blob
        		exports.audio.src = url;//播放录音
        	}
			exports.mediaRecorder.start();//读取麦克风音频
        	exports.mediaRecorder.ondataavailable = function (e) {
        		exports.chunk.push(e.data);//存取音频数据
        	}
        }
	
	3 录音过程采用ScriptProcessor实现音频实时回放

	在navigator.getUserMedia录音过程中，将MediaStreamSource源连接到ScriptProcessor进行处理。ScriptProcessor获取到音频后实时播放。


		//设置音频源为麦克风
        var source=exports.audioContext.createMediaStreamSource(stream);
        //用于录音的processor节点
        var recorder=exports.audioContext.createScriptProcessor(1024,1,1);
        source.connect(recorder);
        recorder.connect(exports.audioContext.destination);
        recorder.onaudioprocess=function(e){//实时处理音频
	        var inputBuffer = e.inputBuffer;
	        var outputBuffer = e.outputBuffer;
	        for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
	            var inputData = inputBuffer.getChannelData(channel);//获取输出音频数据
	            var outputData = outputBuffer.getChannelData(channel);
	            for (var sample = 0; sample < inputBuffer.length; sample++) {
	            	outputData[sample] = inputData[sample];//音频实时输入到耳机实时播放
	            }
	        }
        }

	4 注意问题

	延时：实时播放的时候会有些延时，造成的主要原因，一是ScriptProcessor处理输出数据播放的时候需要一定时间，在性能比较好的机器上表现不明显。二是不同硬件设备也会造成延时，这个表现会明星许多。

	

	案例地址[http://zhazhaxia.github.io/webaudio/public/recordsong.html](http://zhazhaxia.github.io/webaudio/public/recordsong.html "web音频录音与实时回放")
	（建议在PC新版本chrome or firefox体验）

	![web录音](http://i.imgur.com/olSB8kl.png)
	
	代码[https://github.com/zhazhaxia/webAudioApi-testing/blob/master/public/js/recordsong.js](https://github.com/zhazhaxia/webAudioApi-testing/blob/master/public/js/recordsong.js)

- web实现音频剪切

	思路：音频剪切的一般实现是先读取整段音频数据，再根据区间截取数据，保存，从而实现音频的剪切。但是在web上无法直接读取整段音频，只能创建BufferSource源，用xhr获取音频，在音频经过ScriptProcessorNode时，才能获取到目标区间的音频数据。因此，在web平台实现音频剪切需要等音频播放到指定位置时，才能实现效果，体验上会差点。

		加载BufferSource
			↓
		ScriptProcessorNode音频数据
			↓
		获取剪切区间的音频数据	——→	保存音频数据audio/wav
			↓
		连接destination播放
	
	音频源必须是BufferSource，通过xhr读取，因为BufferSource才能用AudioContext提供的start()接口进行指定位置播放。

	**具体实现过程**
	
	1 xhr读取音频源
	
	web音频剪切采用的音频源是BufferSource（BufferSource的源提供了start接口设置播放时间段），所以需要通过xhr获取资源，并通过audioContext的decodeAudioData接口将xhr读取的资源解码为BufferSource能读取的音频buffer。
	
		getData:function (src) {
            request = new XMLHttpRequest();
                request.open('GET', src, true);
                request.responseType = 'arraybuffer';
                request.onload = function() {
                  var audioData = request.response;
                  audioContext.decodeAudioData(audioData, function(buffer) {
                    loadBuffer(buffer);//音频数据解码，ff支持，chrome支持不太友好
                },
              function(e){"Error with decoding audio data" + e.err});
            }
            request.send();
        }

	2 设置音频源为buffer，并设置音频剪切区间
	
	BufferSource读取从xhr获取的音频数据，并设置音频剪切区间。

		loadBuffer:function (data) {
            exports.xhrSource = exports.audioContext.createBufferSource();
            exports.xhrSource.buffer = data;//获取buffer数据
            exports.pNode = exports.audioContext.createScriptProcessor(4096,1,1);//ScriptProcessor处理数据
            exports.xhrSource.connect(exports.pNode);
            exports.pNode.connect(exports.audioContext.destination);
            exports.xhrSource.start(this.min,this.max-this.min,this.max-this.min);//设置剪切音频的区间位置
        }

	3 开始剪切音频片段

	音频通过BufferSource的start接口播放，ScriptProcessor节点进行区间段的资源存取、保存（保存实现在案例3——web在线k歌——介绍）。

		clipBufferSource:function (addr,min,max) {
		    this.min = min;
		    this.max = max;
		    exports.pNode.onaudioprocess = function (e) {//处理音频数据
		        var ct = ~~exports.audioContext.currentTime;
		        if(ct >= exports.max){//超过区间停止剪切音频时间段数据
		            exports.stopBufferSource()
		        }
		        if (ct <= exports.min || ct >= exports.max) {return;}//到达指定区间才获取音频数据
		        var inputBuffer = e.inputBuffer;
		        var outputBuffer = e.outputBuffer;
		        for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
		            var inputData = inputBuffer.getChannelData(channel);//输出的音频数据
		            var outputData = outputBuffer.getChannelData(channel);
		            var bufferData = [];
		            for (var sample = 0; sample < inputBuffer.length; sample++) {
		              outputData[sample] = inputData[sample];//将输出音频数据播放
		              bufferData[sample] = inputData[sample];
		            }
		            if (ct >= exports.min && ct <= exports.max){
		            	exports.buffer.push(bufferData);//获取到指定剪切区间的数据，并保存
		            }
		        }
		    }
		}

	4 注意问题

	利用WebAudioAPI剪切音频时，通过BufferSource的start接口设置目标时间段后，需要从头播放到目标区间才能开始剪切。WebAudioAPI无法读取全局的音频数据，这一点处理会比较麻烦些。

	案例地址[http://zhazhaxia.github.io/webaudio/public/songclip.html](http://zhazhaxia.github.io/webaudio/public/songclip.html "音频剪切")

	![](http://i.imgur.com/uEJDike.png)

	代码[https://github.com/zhazhaxia/webAudioApi-testing/blob/master/public/js/songclip.js](https://github.com/zhazhaxia/webAudioApi-testing/blob/master/public/js/songclip.js)

- web实现在线K歌

	思路：在web平台实现k歌应用，关键在于将人声跟伴奏的音频整合一起。首先需要两个声源，一个是伴奏，声源类型ElementSource。一个是人声，通过麦克风录音获取，声源类型StreamSource。在K歌过程将声音经过ScriptProcessorNode处理，整合，然后保存数据。最后将音频连接到destination。保存的数据可以本地存储和在线播放，从而实现在web平台的在线k歌应用。

		伴奏ElementSource	人声录音StreamSource
				↓					↓
			转buffer			保存为blob数据并arraybuffer
					↓		↓
					 合并音频
					↓		↓
				  重放 		保存本地合并音频

	 web实现在线K歌实际上是webAudio录音与web音频剪切的综合实现。
	
	**具体实现过程**

	1 通过MediaRecorder录音并转blob资源

	MediaRecorder录音后需要将音频数据转blob:资源，以便xhr获取。
		
		exports.mediaRecorder = new MediaRecorder(stream);//获取麦克风音频
		exports.mediaRecorder.start();
		exports.mediaRecorder.onstop = function (e) {
				var blob = new Blob(exports.chunk, { 'type' : 'audio/mp3; codecs=opus' }),
				    url = window.URL.createObjectURL(blob);
			exports.audio.src = url;//将获取的音频转blob资源后在<audio>播放
		}
		exports.mediaRecorder.ondataavailable = function (e) {
			exports.chunk.push(e.data);
		}		
	
	2 通过xhr读取录音音频、伴奏音频，并转音频buffer

	外部伴奏资源http:与录音blob:资源通过xhr读取，转成BufferSource能够获取的源数据。

		getData:function (src) {//http:或blob:资源
			var dtd = $.Deferred();
			request = new XMLHttpRequest();
			request.open('GET', src, true);
			request.responseType = 'arraybuffer';
			request.onload = function() {
			  var audioData = request.response;
			  //解码后bufferSource才能获取
			  exports.audioContext.decodeAudioData(audioData, function(buffer) {
			    dtd.resolve(buffer);
			  },function(e){"Error with decoding audio data" + e.err});
			}
			request.send();
			return dtd.promise();
		}
	
	3 合并录音、伴奏

	将伴奏BufferSource跟录音BufferSource连接到ScriptProcessor节点，进行音频的合并。

		mergeBuffer:function (buffer1,buffer2) {
		    exports.source1 = exports.audioContext.createBufferSource();//录音音频
		    exports.source2 = exports.audioContext.createBufferSource();//伴奏音频
			
		    exports.source1.buffer = buffer1;
		    exports.source2.buffer = buffer2;
			
			//ScriptProcessor处理合并音频
		    exports.pNode = exports.audioContext.createScriptProcessor(4096,1,1);
		    
		    exports.source1.connect(exports.pNode);
		    exports.source2.connect(exports.pNode);
		
			//连接到destination
		    exports.pNode.connect(exports.audioContext.destination);
		    exports.pNode.connect(exports.audioContext.destination);
			
			//开始播放合并后的音频
		    exports.source1.start(0);
		    exports.source2.start(0);
			
			//采集合并音频数据
		    exports.pNode.onaudioprocess = function (e) {
		        var inputBuffer = e.inputBuffer;
		        var outputBuffer = e.outputBuffer;
		        for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
		            var inputData = inputBuffer.getChannelData(channel);
		            var outputData = outputBuffer.getChannelData(channel);
		            var tmp = [];//合并后的数据
		            for (var sample = 0; sample < inputBuffer.length; sample++) {
		              outputData[sample] = inputData[sample];
		              tmp[sample] = inputData[sample];
		            }
		            exports.chunk.push(tmp);
		        }
		    }
		}

	4 保存合并伴奏与录音的k歌数据，转audio/wav

	合并的音频即类似k歌后的音频，然后将合并音频进行转码audio/wav（wav文件比较大，但是不需要解码，在web中处理比较简单。类似mp3这种有损音频算法比较复杂，在此不演示。），然后保存到本地。

		saveKge:function (chunk) {
		    var data = chunk;
		    var frequency=this.audioContext.sampleRate; //采样频率
		    var pointSize=16; //采样点大小
		    var channelNumber=1; //声道数量
		    var blockSize=channelNumber*pointSize/8; //采样块大小
		    var wave=[]; //数据
		    for(var i=0;i<data.length;i++)
		      for(var j=0;j<data[i].length;j++)
		        wave.push(data[i][j]*0x8000|0);
		    var length=wave.length*pointSize/8; //数据长度
		    var buffer=new Uint8Array(length+44); //wav文件数据
		    var view=new DataView(buffer.buffer); //数据视图
		    buffer.set(new Uint8Array([0x52,0x49,0x46,0x46])); //"RIFF"
		    view.setUint32(4,data.length+44,true); //总长度
		    buffer.set(new Uint8Array([0x57,0x41,0x56,0x45]),8); //"WAVE"
		    buffer.set(new Uint8Array([0x66,0x6D,0x74,0x20]),12); //"fmt "
		    view.setUint32(16,16,true); //WAV头大小
		    view.setUint16(20,1,true); //编码方式
		    view.setUint16(22,1,true); //声道数量
		    view.setUint32(24,frequency,true); //采样频率
		    view.setUint32(28,frequency*blockSize,true); //每秒字节数
		    view.setUint16(32,blockSize,true); //采样块大小
		    view.setUint16(34,pointSize,true); //采样点大小
		    buffer.set(new Uint8Array([0x64,0x61,0x74,0x61]),36); //"data"
		    view.setUint32(40,length,true); //数据长度
		    buffer.set(new Uint8Array(new Int16Array(wave).buffer),44); //数据
		    //打开文件
		    var blob=new Blob([buffer],{type:"audio/wav"});
		    // console.log('blob',blob)
		    var src = URL.createObjectURL(blob);
		    $('#player')[0].src = src;
		    window.open(src);
		    $('body').append('<a href="'+src+'" download="filename"> download the cliped song</a>');
		}

	5 注意问题

	audioContext解码blob:数据在chrome目前（56.0.2914.3）还不支持，firefox已提供接口解决。
	
	在线k歌的歌曲伴奏也可以通过Web Audio API实现，主要原理的：人声是有固定频率范围的，把一首歌曲读取后，根据webAudio提供的接口，实现人声频段的过滤，保留下伴奏，从而实现web平台下的伴奏人声消除应用。

	
	
	案例地址
	
	在线k歌[http://zhazhaxia.github.io/webaudio/public/kge.html](http://zhazhaxia.github.io/webaudio/public/kge.html "web在线k歌")（firefox下体验）


	伴奏消声[http://zhazhaxia.github.io/public/](http://zhazhaxia.github.io/public/ "伴奏消声")
	
	代码[https://github.com/zhazhaxia/webAudioApi-testing/blob/master/public/js/kge.js](https://github.com/zhazhaxia/webAudioApi-testing/blob/master/public/js/kge.js)

## 最后 ##

- 以上所有代码地址：[https://github.com/zhazhaxia/webAudioApi-testing/tree/master/public](https://github.com/zhazhaxia/webAudioApi-testing/tree/master/public "zhazhaxia")
	
- 参考

	MDN
	
	[https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
	
	[https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder_API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder_API)
	
	W3C

	[https://www.w3.org/TR/webaudio/](https://www.w3.org/TR/webaudio/)

	others

	[http://chimera.labs.oreilly.com/books/1234000001552/ch02.html](http://chimera.labs.oreilly.com/books/1234000001552/ch02.html)

	[http://webaudiodemos.appspot.com/MIDIDrums/index.html](http://webaudiodemos.appspot.com/MIDIDrums/index.html)

	[https://guitar-tuner.appspot.com/](https://guitar-tuner.appspot.com/)

	[http://webaudiodemos.appspot.com/](http://webaudiodemos.appspot.com/)

	[http://codepen.io/edball/pen/WQjMEN/](http://codepen.io/edball/pen/WQjMEN/)

	[https://modernweb.com/2014/03/31/creating-sound-with-the-web-audio-api-and-oscillators/](https://modernweb.com/2014/03/31/creating-sound-with-the-web-audio-api-and-oscillators/)





