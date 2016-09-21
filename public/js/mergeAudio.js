//recordsong
define('./js/mergeAudio',function( require, exports, module){
    exports = module.exports={
        init:function(){
            this.audioContext = this.getContext();
            // this.source = this.audioContext.createMediaElementSource(this.audio);
            // this.source.connect(this.audioContext.destination);
    		
        },
        chunk:[],
        kgeBuffer:[],
        getContext: function() {
            return new AudioContext();
        },
        mergeSong:function (src1,src2) {
            $.when(exports.getData(src1)).done(function (b1) {
                console.log("b1",b1)
                $.when(exports.getData(src2)).done(function (b2) {
                    console.log('b2',b2);
                    exports.mergeBuffer(b1,b2);
                }).fail(function (err) {
                    console.log(err);
                });
                
            }).fail(function (err) {
                console.log(err);
            });
        },
        getData:function (src) {
            console.log(src)
            var dtd = $.Deferred();


            request = new XMLHttpRequest();
            request.open('GET', src, true);
            request.responseType = 'arraybuffer';
            request.onload = function() {
              var audioData = request.response;
              // console.log(audioData)
              exports.audioContext.decodeAudioData(audioData, function(buffer) {
                // console.log(buffer)
                dtd.resolve(buffer);
              },function(e){"Error with decoding audio data" + e.err});
            }
            request.send();
            return dtd.promise();
        },
        mergeBuffer:function (buffer1,buffer2) {
            exports.source1 = exports.audioContext.createBufferSource();
            exports.source2 = exports.audioContext.createBufferSource();

            exports.source1.buffer = buffer1;
            exports.source2.buffer = buffer2;


            exports.pNode = exports.audioContext.createScriptProcessor(4096,1,1);

            
            this.play();
            // exports.source1.start(0);
            // exports.source2.start(0);

            exports.pNode.onaudioprocess = function (e) {
                // The input buffer is the song we loaded earlier
                var inputBuffer = e.inputBuffer;
                // console.log(inputBuffer)
                // The output buffer contains the samples that will be modified and played
                var outputBuffer = e.outputBuffer;
                // Loop through the output channels (in this case there is only one)
                for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
                    var inputData = inputBuffer.getChannelData(channel);
                    var outputData = outputBuffer.getChannelData(channel);
                    var tmp = [];
                    // Loop through the 4096 samples
                    for (var sample = 0; sample < inputBuffer.length; sample++) {
                      // make output equal to the same as the input
                      outputData[sample] = inputData[sample];
                      tmp[sample] = inputData[sample];
                    }
                    exports.chunk.push(tmp);
                    // console.log(exports.buffer)
                }
            }
        },
        stop:function () {
            exports.source1.disconnect();
            exports.source2.disconnect();
            exports.pNode.disconnect(exports.audioContext.destination);

        	exports.source1.stop();
            exports.source2.stop();
        },
        play:function () {
            // exports.source1.connect(exports.audioContext.destination);
            // exports.source2.connect(exports.audioContext.destination);
            exports.source1.connect(exports.pNode);
            exports.source2.connect(exports.pNode);

            exports.pNode.connect(exports.audioContext.destination);
            exports.pNode.connect(exports.audioContext.destination);

            exports.source1.start(0);
            exports.source2.start(0);
        },
        saveKge:function () {
            var data = exports.chunk;
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
            window.open(src);
            $('body').append('<a href="'+src+'" download="filename"> download the cliped song</a>');
        }
    }
});