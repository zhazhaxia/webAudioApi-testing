##  web audio api介绍  ##

web audio api是web处理与合成音频的高级javascript api。web audio api草案规范由W3C audio working group定制，旨在解决javascript在web平台处理音频的短板，底层由c++引擎提供支持与优化。Web Audio API提供了非常丰富的接口让开发者在web平台上实现对web音频进行处理。利用Web Audio API，web开发者能够在web平台实现音频音效、音频可视化、3D音频等音频效果。	

### Web Audio API基本概念 ###
- audio context

	audio context是Web Audio API处理web音频的核心对象。在整个web 音频处理中，所有处理连接过程都由audio context管理。（如图，audio context控制source节点的生成和destination节点的生成，同时控制着source节点与destination节点之间的连接）

	![audio context](http://i.imgur.com/RsnkTgj.png)

- modular routing

	模块路由是web audio api处理web音频的工作方式，这里可以理解为web音频处理的过程就像学CCNA的时候路由器的路由连接方式，从源到目的，中间有很多路由节点，它们之间相互连接且无回路，类似一个有向图。

	![modular routing](http://i.imgur.com/Zu2X2ZU.png)


- audio node

	audio node是web audio api处理音频时的音频节点。节点由audio context生成，每个节点有自己的功能。

- audio routing graph

	音频路由拓扑图就是在audio context控制下，许多个音频节点相互连接，从源到节点，形成的有向图。每个拓扑图代表了一种音频处理的效果。

## Web Audio API节点介绍 ##

Web Audio API处理web音频的过程：AudioContext产生实例节点，音频在每个节点中按次序连通。一次成功音频播放必须有源节点和目的节点，即`sourceNode ——> destinationNode`。音频从源节点到目的节点的中间可以有许多中间节点，这一点类似路由拓扑图，节点间必须畅通才能实现音频的播放。每个AudioContext对象可以一多个音频源节点实例，但是只能有一个目的节点实例。AudioContext的中间节点实例可以对音频进行处理，如音频可视化、音效处理。

- AudioContext

	AudioContext是Web Audio Api的核心对象。所有的audio 节点实例由AudioContext生成。
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
	
	

	- DelayNode，可以讲音频延时播放，如果在音频播放时，一路正常到达destinationNode，一路通过DelayNode到达destinationNode，就可以产生回音混响的效果
	
					——————————————>
			source 					——>destinationNode
					——>delayNode——>
	
	- gainNode，在webAudio中，可以通过gainNode来控制音量

	- BiquadFilterNode，可以用于音频滤波处理。web Audio api提供了高通滤波、低通滤波的接口，利用这些接口也可以实现中通滤波。

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

	webAudioApi提供了丰富的音频处理接口为音效处理提供了许多方便，但是这些接口也有局限性，开发人员无法定制自己需要的效果，因此，webAudio提供了ScriptProcessorNode节点。ScriptProcessorNode可以获取到音频原始处理数据，然后开发人员根据对应音频音效算法对这些音频数据进行处理，从而实现定制音频音效效果。

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

## webAudioApi应用案例分析 ##

- web音频录音和实时回放

	思路：首先创建一个stream源节点，通过`navigator.getUserMedia`获取麦克风音频stream，然后再连接到ScriptProcessorNode对外部声音进行处理（数据存储、转换），最后连接到destination进行实时的播放。通过ScriptProcessorNode获取的音频数据可以浏览器播放并保存到本地。具体过程：
		
							  ————>获取音频数据存储————>转blob保存本地
		navigator.getUserMedia								
							  ————>ScriptProcessorNode处理数据————>实时回放

	关于webAudio也可以通过W3C提供的一个新的音频处理接口MediaRecorder Ap进行录音，具体使用参考[https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API "MediaStream_Recording_API")

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
	
	音频源必须是BufferSource，通过xhr读取，因为BufferSource才能用AudioContext提供的start()接口进行指定位置播放。xhr读取音频代码：
	
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
	
	案例地址[http://zhazhaxia.github.io/webaudio/public/songclip.html](http://zhazhaxia.github.io/webaudio/public/songclip.html "音频剪切")

	![](http://i.imgur.com/uEJDike.png)

	代码[https://github.com/zhazhaxia/webAudioApi-testing/blob/master/public/js/songclip.js](https://github.com/zhazhaxia/webAudioApi-testing/blob/master/public/js/songclip.js)

- web实现在线K歌

	思路：在web平台实现k歌应用，关键在于将人声跟伴奏的音频整合一起。首先需要两个声源，一个是伴奏，声源类型ElementSource。一个是人声，通过麦克风录音获取，声源类型StreamSource。在K歌过程将声音经过ScriptProcessorNode处理，整合，然后保存数据。最后将音频链接到destination。保存的数据可以本地存储和在线播放，从而实现在web平台的在线k歌应用。

		伴奏ElementSource	人声录音StreamSource
				↓					↓
			转buffer			保存为blob数据并arraybuffer
					↓		↓
					 合并音频
					↓		↓
				  重放 		保存本地合并音频

	 web实现在线K歌实际上是webAudio录音与web音频剪切的综合实现。
	
	在线k歌的歌曲伴奏也可以通过webAudioApi实现，主要原理的：人声是有固定频率范围的，把一首歌曲读取后，根据webAudio提供的接口，实现人声频段的过滤，保留下伴奏，从而实现web平台下的伴奏人声消除应用。
	
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
