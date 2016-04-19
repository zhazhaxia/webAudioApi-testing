define('./js/lib/audioEffect',function( require, exports, module){
    
    exports = module.exports={
        init:function(audio){//<audio>对象
            this.audio = audio;
            this.source = this.audioContext.createMediaElementSource(this.audio);
        },
        audioContext: (function() {
            var AudioContext = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext);

            return new AudioContext();
        })(),
        getContext: function() {
            return this.audioContext;
        },
        getAnalyser:function(){
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
        deleteVoice: function(audiobuffer) {
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
            gain4.gain.value = 1;
            channelMerger.connect(gain4);
            gain4.connect(audioContext.destination);
        },
        effect3d:function(){
            this.cancelJob();
            var panner=this.audioContext.createPanner(),
                gain = this.audioContext.createGain();

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
            gain.gain.value = 5;
            panner.connect(gain);
            gain.connect(this.audioContext.destination);
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
        cancelJob:function(){
            this.source.disconnect(0);
            if(this.analyser)this.analyser.disconnect(0);
            clearInterval(this.effectTimer);
        }
    }
});