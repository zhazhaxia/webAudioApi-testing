define('./js/songclip',function( require, exports, module){
    exports = module.exports={
        init:function(audio){
            this.audio = audio;
            this.audioContext = this.getContext();
            this.source = this.audioContext.createMediaElementSource(this.audio);
            this.source.connect(this.audioContext.destination)
        },
        getContext: function() {
            return new AudioContext();;
        },
        buffer:[],
        min:0,
        max:0,
        clipBufferSource:function (addr,min,max) {//歌曲地址，开始时间，结束时间
            $('body').append('<div id="info-clip" style="font-size:28px;">cliping...</div>');
            this.min = min;
            this.max = max;
            if (exports.xhrSource) {
                exports.xhrSource.disconnect(0);
            }
            exports.audioContext = exports.getContext();
            exports.xhrSource = exports.audioContext.createBufferSource();
            exports.pNode = exports.audioContext.createScriptProcessor(4096,1,1);

            exports.getData(addr);//获取音频数据
            exports.pNode.onaudioprocess = function (e) {
                // console.log(exports.audioContext.currentTime)
                var ct = ~~exports.audioContext.currentTime;
                // console.log(ct)

                if(ct >= exports.max){
                    $('#info-clip').text('cliping end!!success!!!')
                    exports.stopBufferSource()
                }
                if (ct <= exports.min || ct >= exports.max) {return;}
                
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
                    if (ct >= exports.min && ct <= exports.max){
                        // console.log(ct)
                    exports.buffer.push(bufferData);
                    // console.log('buffer',exports.buffer)

                    }
                // console.log(exports.buffer)

                }
            }
        },
        getData:function (src) {
            request = new XMLHttpRequest();
                request.open('GET', src, true);
                request.responseType = 'arraybuffer';
                request.onload = function() {
                  var audioData = request.response;
                  exports.audioContext.decodeAudioData(audioData, function(buffer) {
                    exports.loadBuffer(buffer);
                },
              function(e){"Error with decoding audio data" + e.err});
            }
            request.send();
        },
        loadBuffer:function (data) {
            exports.xhrSource.buffer = data;
            exports.xhrSource.connect(exports.pNode);
            exports.pNode.connect(exports.audioContext.destination);
            console.log(exports.audioContext,exports.xhrSource)
            exports.xhrSource.start(this.min,this.max-this.min,this.max-this.min);
        },
        stopBufferSource:function () {
            exports.xhrSource.disconnect()
            exports.pNode.disconnect(exports.audioContext.destination);
            exports.xhrSource.stop();
        },
        startBufferSource:function () {
            exports.xhrSource.start(exports.audioContext.currentTime);
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
            var blob=new Blob([buffer],{type:"audio/mp3"});
            // console.log('blob',blob)
            var src = URL.createObjectURL(blob);
            $('#player')[0].src = src;
            window.open(src);
            $('body').append('<a href="'+src+'" download="filename"> download the cliped song</a>');
        }
    }
});