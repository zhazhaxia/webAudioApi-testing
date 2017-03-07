//recordsong
define('./js/recordsong',function( require, exports, module){
    exports = module.exports={
        init:function(audio){
            this.audio = audio;
            this.audioContext = this.getContext();
            this.source = this.audioContext.createMediaElementSource(this.audio);
            this.source.connect(this.audioContext.destination);

    		navigator.getUserMedia = (navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);
        },
        mediaRecorder:null,
        chunk:[],
        getContext: function() {
            return new AudioContext();;
        },
        getSpeaker:function () {
        	if(!navigator.getUserMedia){alert('不支持麦克风录音');return;}
        	navigator.getUserMedia({audio:true}, exports.onSuccess,exports.onError);
        },
        onSuccess:function (stream) {
        	exports.mediaRecorder = new MediaRecorder(stream);


            //录音的同时在耳机播放
            var source=exports.audioContext.createMediaStreamSource(stream);
            //用于录音的processor节点
            var recorder=exports.audioContext.createScriptProcessor(1024,1,1);
            source.connect(recorder);
            recorder.connect(exports.audioContext.destination)
            recorder.onaudioprocess=function(e){
                var inputBuffer = e.inputBuffer;
                // console.log(inputBuffer)
                var outputBuffer = e.outputBuffer;
                for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
                    var inputData = inputBuffer.getChannelData(channel);
                    var outputData = outputBuffer.getChannelData(channel);
                    for (var sample = 0; sample < inputBuffer.length; sample++) {
                      outputData[sample] = inputData[sample] * 0.5;
                    }
                    // console.log(exports.buffer)
                }
            };






        	exports.mediaRecorder.onstop = function (e) {
      			var blob = new Blob(exports.chunk, { 'type' : 'audio/wav;' }),
      			    url = window.URL.createObjectURL(blob);
        		exports.audio.src = url;
        	}
        	exports.mediaRecorder.ondataavailable = function (e) {
                
        		exports.chunk.push(e.data);
        	}
        },
        record:function () {
        	exports.chunk = [];
        	exports.mediaRecorder.start();
	      	console.log(exports.mediaRecorder.state);
        },
        stop:function () {
        	
        	exports.mediaRecorder.stop();
        },
        onError:function (err) {
        	console.log("err",err);
        }
    }
});