define('./js/lib/deleteVoice',function( require, exports, module){
    exports = module.exports={
        init:function(audio){
            this.audio = audio;
            this.audioContext = this.getContext();
            this.source = this.audioContext.createMediaElementSource(this.audio);
        },
        // audioContext: (function() {
        //     var AudioContext = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext);

        //     return new AudioContext();
        // })(),
        getContext: function() {
            return new AudioContext();
        },
        buffer:[],
        getAnalyser:function(){//用于音频数据可视化
            this.cancelJob();
            this.analyser = this.audioContext.createAnalyser();
            this.source.connect(this.analyser);
            // 让扬声器的音频通过分析器
            this.analyser.connect(this.audioContext.destination);

            // 设置数据
            this.analyser.fftSize = 512;//频道数量
            this.bufferLength = this.analyser.fftSize;
            this.dataArray = new Float32Array(this.bufferLength);//每个频道的频率
            this.frame = 0;//音频帧数
            return {analyser:this.analyser,bufferLength:this.bufferLength,frame:this.frame};
            //console.log(this.analyser);
        },
        deleteVoice: function(audiobuffer) {//伴奏消除
            this.cancelJob();
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
            // channelMerger.connect(audioContext.destination);
            // 普通合成
             channelMerger.connect(audioContext.destination);
        },
        effect3d:function(){//音频3D效果
            this.cancelJob();
            var panner=this.audioContext.createPanner();
            //设置声源属性
            panner.setOrientation(0,0,0,0,1,0); //方向朝向收听者
            var a=0,r=8;
            this.effectTimer = setInterval(function(){
              //然声源绕着收听者以8的半径旋转
              panner.setPosition(Math.sin(a/100)*r,0,Math.cos(a/100)*r);
              a++;
            },16);
            //连接：source → panner → destination
            this.source.connect(panner);
            panner.connect(this.audioContext.destination);
        },
        delay:function(){//音频延时
            this.cancelJob();
            var delay=this.audioContext.createDelay();
            var gain=this.audioContext.createGain();
            //设置节点参数
            delay.delayTime.value=0.1;
            gain.gain.value=1.2;
            //连接： source → destination
            //         ↓      ↑
            //       delay → gain
            this.source.connect(this.audioContext.destination);
            this.source.connect(delay);
            delay.connect(gain);
            gain.connect(this.audioContext.destination);
        },
        waveShaper:function(){//AudioAPI中提供了WaveShaper节点，它用于对音频波形做一些非线性的变换。在它的属性中可以设置一条曲线，以一个Float32Array类型的强类型数组作为一组曲线的表数据来设置。普通情况下这条线是一条直线，这条线上拥有和数据块大小一样多的点。
            this.cancelJob();
            var shaper=this.audioContext.createWaveShaper();
            //初始化shaper
            var s=[],l=2048,i;
            for(i=0;i<=l;i++)s.push(i/l*2-1);
            shaper.curve=new Float32Array(s);
            shaper.connect(this.audioContext.destination);
            //连接：source → shaper → denstination
            this.source.connect(shaper);
            shaper.connect(this.audioContext.destination);
        },
        convolver:function(){//混响是非常普遍的音频特效，很多音频处理软件中都自带了混响效果的功能。在AudioAPI中，我们也可以自己实现这个效果。实现混响的方法有很多，但既然AudioAPI中提供了Convolver节点，我们就不考虑其它,直接使用Convolver节点来实现混响。
            this.cancelJob();
            var convolver=this.audioContext.createConvolver();
            var gain=this.audioContext.createGain();
            var gain2=this.audioContext.createGain();
            //模拟混响样本
            var length=44100;
            var buffer=this.audioContext.createBuffer(2,length,length);
            var data=[buffer.getChannelData(0),buffer.getChannelData(1)];
            for(var i=0;i<length;i++){
              //平方根衰减
              var v=1-Math.sqrt(i/length);
              //叠加24个不同频率
              for(var j=1;j<=24;j++)v*=Math.sin(i/j);
              //记录数据
              data[0][i]=data[1][i]=v;
            };
            //配置节点
            gain.gain.value=0.5;
            gain2.gain.value=2;
            convolver.buffer=buffer;
            //连接：       → convolver → 
            //      source               destination
            //             →    gain   → 
            this.source.connect(convolver);
            this.source.connect(gain);
            gain.connect(this.audioContext.destination);
            //动作
            convolver.connect(gain2);
            gain2.connect(this.audioContext.destination)
        },
        splitterMerger:function(){//声道合成
            this.cancelJob();

            var lGain=this.audioContext.createGain();
            var rGain=this.audioContext.createGain();
            //创建声道离合器
            var splitter=this.audioContext.createChannelSplitter(2);
            var merger=this.audioContext.createChannelMerger(2);
            /*
                             → lGain
            source → splitter         → merger → destination
                             → rGain
            */
            lGain.gain.value = 3;
            rGain.gain.value = 7;
            this.source.connect(splitter);
            splitter.connect(lGain,0);
            splitter.connect(rGain,1);
            lGain.connect(merger,0,0);
            rGain.connect(merger,0,1);
            merger.connect(this.audioContext.destination);
        },
        audioParam:function(){//震荡器
            this.cancelJob();
            var oscillator=this.audioContext.createOscillator();
            var gain=this.audioContext.createGain();
            //配置节点
            oscillator.frequency.value=1;
            gain.gain.value=500;
            //连接 source → gain 
            //                ↓
            // oscillator.frequency
            //     ↓
            // destination
            this.source.connect(gain);
            gain.connect(oscillator.frequency);
            oscillator.connect(this.audioContext.destination);
            //播放
            oscillator.start(0);
        },
        biquadFilter:function(){//　在AudioAPI中提供了对一些波形过滤的接口，可以通过BiquadFilter节点来操作。BiquadFilter节点又有许多操作类型，使用不同的类型配上特定的参数就可以对几乎所有频率的声音做波形过滤。下面的例子就是把频率大于800Hz的声音过滤掉。
            this.cancelJob();
            var filter=this.audioContext.createBiquadFilter();
            //只允许小于800的频率通过
            filter.type='lowpass';
            filter.Q.vaule = 2;
            filter.frequency.value=800;
            //连接：media → filter → destination
            this.source.connect(filter);
            filter.connect(this.audioContext.destination);
        },
        BufferSource:function (addr) {console.log(addr)
            if (exports.xhrSource) {
                exports.xhrSource.disconnect(0);
            }
            exports.audioContext = exports.getContext();
            exports.xhrSource = exports.audioContext.createBufferSource();
            exports.pNode = exports.audioContext.createScriptProcessor(4096,1,1);
            getData();
            exports.pNode.onstatechange = function (e) {
                console.log('state',e)
            }
            exports.pNode.onended = function (e) {
                console.log('end',e)
            }
            exports.pNode.onloaded = function (e) {
                console.log('load',e)
            }
            exports.pNode.onaudioprocess = function (e) {
                // console.log(exports.audioContext.currentTime)
                var ct = ~~exports.audioContext.currentTime;
                // console.log(ct)
                if(ct >= 10){
                    exports.stopBufferSource()
                }
                if (ct <= 5 || ct >= 10) {return;}
                
                // console.log(ct)
                
                // The input buffer is the song we loaded earlier
                var inputBuffer = e.inputBuffer;

                // The output buffer contains the samples that will be modified and played
                var outputBuffer = e.outputBuffer;
                // Loop through the output channels (in this case there is only one)
                for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
                    var inputData = inputBuffer.getChannelData(channel);
                    var outputData = outputBuffer.getChannelData(channel);
                    // console.log('output',outputData)
                    var bufferData = [];
                    // Loop through the 4096 samples
                    for (var sample = 0; sample < inputBuffer.length; sample++) {
                      // make output equal to the same as the input
                      outputData[sample] = inputData[sample];  
                      bufferData[sample] = inputData[sample];
                    }
                    if (ct >= 5 && ct <= 10){
                        // console.log(ct)
                    exports.buffer.push(bufferData);
                    // console.log('buffer',exports.buffer)

                    }
                // console.log(exports.buffer)

                }

            }
            function getData() {
              request = new XMLHttpRequest();
                request.open('GET', addr, true);
                request.responseType = 'arraybuffer';
                request.onload = function() {
                  var audioData = request.response;
                  exports.audioContext.decodeAudioData(audioData, function(buffer) {
                    loadBuffer(buffer);
                },
                  function(e){"Error with decoding audio data" + e.err});
                }
                request.send();
            }
            function loadBuffer(data){console.log('buffer:',data)
                exports.xhrSource.buffer = data;
                exports.xhrSource.connect(exports.pNode);
                exports.pNode.connect(exports.audioContext.destination);
                console.log(exports.audioContext,exports.xhrSource)
                exports.xhrSource.start(5,5,5);
            }
            exports.audioContext.onstatechange=function (e) {
              console.log("e",e)  
            };
        },
        stopBufferSource:function () {
            exports.xhrSource.disconnect()
            exports.pNode.disconnect(exports.audioContext.destination);
            exports.xhrSource.stop();
        },
        startBufferSource:function () {
            exports.xhrSource.start(exports.audioContext.currentTime);
        },
        cancelJob:function(){
            this.source.disconnect(0);
            if(this.analyser)this.analyser.disconnect(0);
            clearInterval(this.effectTimer);
        },
        saveClipSong:function () {
            var data = exports.buffer;
            // console.log('data',data)
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
            // window.open(src);
            $('body').append('<a href="'+src+'" download="filename"> click download</a>');
        }
    }
});