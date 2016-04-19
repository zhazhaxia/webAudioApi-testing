define('./js/main',function( require, exports, module){
    var initTimer = null,
        drawTimer = null,
        visualType = "1",
        util = require('lib/util'),
        audioEffect = require('lib/audioEffect'),
        isSource = true,
        songlist = [];
    audioEffect.init($('#player')[0]);

    exports = module.exports = {
        init:function(){
            
            this.waves = $("#waves")[0];
            this.player = $('#player')[0];
            this.resetCanvasSize(this.waves,$(window).width(),$(window).height());
            this.initData();
            this.bind();
            jc.start('waves',true);
            // requestAnimationFrame(function(){
            //     jc.circle(300,0,50,'#ff0',1).animate({y:500,x:500,radius:10,color:'#0ff'},2000,{type:'inOut',fn:'linear',n:1.5});
            // });
            var self = this;
            
            
            

            
            
        },
        initData:function(){
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();//音频上下文
            this.ctx = waves.getContext("2d");//画布上下文
            
            this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);//清空画布
            this.ctx.fillStyle = 'rgb(200, 200, 200)';
            this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

            this.setAnalyser();
            this.player.pause();

        },
        setAnalyser:function(){
            var ans = audioEffect.getAnalyser();
            this.analyser = ans.analyser;
            this.bufferLength = ans.bufferLength;
            this.frame = ans.frame;
            
            // 设置音频分析器
            //audio音频 -> analyser分析器 -> speaker扬声器
            //this.analyser = this.audioContext.createAnalyser();
            //this.source = this.audioContext.createMediaElementSource(player);
            //this.source.connect(this.analyser);
            // 让扬声器的音频通过分析器
            //this.analyser.connect(this.audioContext.destination);

            // 设置数据
            this.analyser.fftSize = 512;//频道数量
            this.bufferLength = this.analyser.fftSize;
            this.dataArray = new Float32Array(this.bufferLength);//每个频道的频率
            this.frame = 300;//音频帧数
            //console.log(this.analyser);
        },
        draw:function(){
            if (!isSource) {return;}

            if (!this.player.paused) {
                // 更新音频数据
                this.analyser.getFloatTimeDomainData(this.dataArray);

                //每一帧都重新渲染画布一次
                switch (visualType) {
                    case "1":
                        this.renderRect(this.dataArray, this.bufferLength,this.ctx, this.WIDTH, this.HEIGHT);
                        break;
                    case "2":
                        this.renderCircle(this.dataArray, this.bufferLength,this.ctx, this.WIDTH, this.HEIGHT);
                        break;
                    case "3":
                        this.renderLine(this.dataArray, this.bufferLength,this.ctx, this.WIDTH, this.HEIGHT);
                        break;
                }
                
                var self = this;
                clearTimeout(drawTimer);
                drawTimer = setTimeout(function() {
                    //jc.clear();
                    self.draw();
                },self.frame);
            }
            if (this.player.paused){
                //jc.rect(0,0,this.WIDTH,this.HEIGHT,'rgb(70, 70, 70)',1);
            }
        },
        drawInit:function(){
            this.initImage();
                
        },
        renderRect: function(data, len, context, WIDTH, HEIGHT) {
            WIDTH = this.WIDTH||WIDTH;
            HEIGHT = this.HEIGHT||HEIGHT;
            ///////矩形
            var self = this;
            // Create gradient
            var gradient=jc.lGradient(0,300,0,0).id('myGradient_1');
            jc('#myGradient_1').addColorStop(0,'rgba(255,0,255,0.5)');
            jc('#myGradient_1').addColorStop(0.6,'rgb(200,200,0,0.5)');
            jc('#myGradient_1').addColorStop(1,'rgb(255,255,0)');

            //300,200,100,300jc.rect(300,200,100,300,gradient,1)
            var x = 0, per = len/8 ,db = len/2,sliceWIDTH = WIDTH*1.0/(2*per);
            for(var i = db-per,length = db+per;i < length; i=i+1){
                //if (data[i] < 0) {continue;};
                (function(i,x,gradient){//闭包控制循环，否则变量无法顺利访问
                    requestAnimationFrame(function(){//给个缓冲，否则没有动画

                        var y = data[i] * 1000+20;
                        var r = Math.floor(Math.random() * (254)),
                            g = Math.floor(Math.random() * (254)),
                            b = Math.floor(Math.random() * (254)),
                            color = "rgba("+r+", "+g+", "+b+", 0.6)";
                        jc.rect(x, HEIGHT, sliceWIDTH, y,color,1).queue(function(){
                            this.animate({y:HEIGHT - y},300);
                        },function(){
                            this.animate({y:HEIGHT,opacity:0},200);
                        },function(){this.del();});
                    });
                })(i,x,gradient);

                x += sliceWIDTH;
                
            }
        },
        renderCircle: function(data, len, context, WIDTH, HEIGHT) {//console.log(data);
            WIDTH = this.WIDTH||WIDTH;
            HEIGHT = this.HEIGHT||HEIGHT;
            // Create gradient
            var self = this;
            var x = 0, sliceWIDTH = WIDTH*1.0/len;
            for(var i = 0;i < len; i=i+2){
                if (data[i] < 0) {data[i] = -data[i];};
                (function(i,x){//闭包控制循环，否则变量无法顺利访问
                    requestAnimationFrame(function(){//给个缓冲，否则没有动画
                        var r = Math.floor(Math.random() * (254)),
                            g = Math.floor(Math.random() * (254)),
                            b = Math.floor(Math.random() * (254)),
                            y = Math.floor(Math.random() * (self.HEIGHT)),
                            color = "rgba("+r+", "+g+", "+b+", 0.6)",
                            filled = true,
                            radius = 1;
                        jc.circle(x, y, radius, color,filled).animate({radius:radius+data[i] * 100,opacity:0.1},500,function(){this.del();});
                    });
                })(i,x);
                x += sliceWIDTH*2;
            }
        },
        renderLine: function(data, len, context, WIDTH, HEIGHT) {
            WIDTH = this.WIDTH||WIDTH;
            HEIGHT = this.HEIGHT||HEIGHT;
            var self = this;
            var x = 0, per = len/2 ,db = len/2,sliceWIDTH = WIDTH*1.0/(2*per),arr = [];
            for(var i = db-per,length = db+per;i < length; i=i+1){
                var y = data[i] < 0 ? 0 + HEIGHT/2: data[i]*HEIGHT + HEIGHT/2;
                arr.push([x ,HEIGHT - y])
                x += sliceWIDTH;
            }
            requestAnimationFrame(function(){
                var r = Math.floor(Math.random() * (254)),
                    g = Math.floor(Math.random() * (254)),
                    b = Math.floor(Math.random() * (254)),
                    color = "rgba("+r+", "+g+", "+b+", 0.6)";
                jc.line(arr , color).attr('lineWidth',5).animate({opacity: 0},200,function(){this.del();});
            });
        },
        renderImage: function(data, len, context, WIDTH, HEIGHT) {
            WIDTH = this.WIDTH||WIDTH;
            HEIGHT = this.HEIGHT||HEIGHT;
            ///////矩形
            var self = this;
            // Create gradient
            var gradient=jc.lGradient(0,300,0,0).id('myGradient_1');
            jc('#myGradient_1').addColorStop(0,'rgba(255,0,255,0.5)');
            jc('#myGradient_1').addColorStop(0.6,'rgb(200,200,0,0.5)');
            jc('#myGradient_1').addColorStop(1,'rgb(255,255,0)');

            //300,200,100,300jc.rect(300,200,100,300,gradient,1)
            var x = 0, per = len/8 ,db = len/2,sliceWIDTH = WIDTH*1.0/(2*per);
            for(var i = db-per,length = db+per;i < length; i=i+1){
                

                x += sliceWIDTH;
                
            }
        },
        initImage: function() {
            var self = this;
            clearInterval(initTimer);
            initTimer = setInterval(function(){
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
                        color = "rgba("+r+", "+g+", "+b+", 0.5)",
                        radius = parseInt(Math.random()*3)+5;
                    jc.circle(xIdx,self.HEIGHT,radius,color,1).shadow({x:0,y:0,blur:10,color:'#fff'}).animate({y:10},8000,{type:'in',fn:'sine'},{fn:function(){
                            this.animate({x:sb+'=1'});
                        }},function(){this.del();})
                //})
            },100);
        },
        bind:function(){
            var self = this,
                $fcontainer = $('#file .filecontainer'),
                $songfile = $('#songfile');
            $('#player').on('play', function() {
                console.log('playing...');
                // 清空画布
                if (!isSource) {return;}
                clearInterval(initTimer);
                self.setJC();
                self.draw();
                self.drawInit();
            }).on('pause', function() {
                console.log('pausing...');
                clearInterval(initTimer);
                
            }).on('ended', function() {
                console.log('endeding...');
                clearInterval(initTimer);
                self.nextSong();
                
            }).on('timeupdate', function() {
                
                
            })
            ;
            $('body').on('click', '#waves', function(event) {
                event.preventDefault();
                $('#left').toggleClass('hide-left');
                $('#right').toggleClass('hide-right');
            }).on('click', '.song', function(event) {
                event.preventDefault();
                $(this).addClass('ch-song').siblings().removeClass('ch-song');
                self.setPlay($(this).attr('data-url'));
            }).on('dragenter', '#songfile', function(e) {
                e.preventDefault();
                e = e.originalEvent;
                $fcontainer.text('Please mouse up');
            }).on('dragleave', '#songfile', function(event) {
                event.preventDefault();
                $fcontainer.text('Please drag your music files here');
            }).on('drop', '#songfile', function(e) {
                e.preventDefault();
                e = e.originalEvent;//事件代理需要提取源事件才能获取真实的事件
                $fcontainer.text('');
                self.addSonglist(e.dataTransfer.files);
            }).on('click', '.effect-3d', function(e) {
                isSource = false;
                audioEffect.effect3d();
            }).on('click', '.biquadFilter', function(e) {
                isSource = false;
                audioEffect.biquadFilter();
            }).on('click', '.delay', function(e) {
                isSource = false;
                audioEffect.delay();
            }).on('click', '.waveShaper', function(e) {
                isSource = false;
                audioEffect.waveShaper();
            }).on('click', '.convolver', function(e) {
                isSource = false;
                audioEffect.convolver();
            }).on('click', '.splitterMerger', function(e) {
                isSource = false;
                audioEffect.splitterMerger();
            }).on('click', '.audioParam', function(e) {
                isSource = false;
                audioEffect.audioParam();
            }).on('click', '.effect-source', function(e) {
                isSource = true;
                self.setAnalyser();
                $('#player').trigger('play');
                
            }).on('click', '.effect-devete-voice', function(e) {
                isSource = false;
                audioEffect.deleteVoice();
            }).on('click', '.visual', function(event) {
                visualType = $(this).attr('data-type');
                             
            }).on('click', '.list', function() {
                
                $(this).addClass('ch-effect').siblings().removeClass('ch-effect');
            });
            

            $songfile.on('change', function(e) {
                e.preventDefault();
                self.addSonglist(e.target.files);
            });
            $(window).on('resize', function() {
                
                self.resetCanvasSize(self.waves,$(this).width(),$(this).height());
            });


        },
        resetCanvasSize:function(canvas,width,height){
            canvas.width = this.WIDTH = width;
            canvas.height = this.HEIGHT = height;
            this.setJC();
        },
        setJC:function(){
            jc.start('waves',true);
            jc('#full').del();
            jc.rect(0,0,this.WIDTH,this.HEIGHT,'rgba(70, 70, 70,0.1)',1).level(0).id('full');
        },
        addSonglist:function(files){
            //console.log(files);
            for (var i = files.length - 1; i >= 0; i--) {
                if(files[i].type.indexOf('audio') < 0)continue;
                var name = files[i].name.substr(0,files[i].name.lastIndexOf('.')),
                    blob = URL.createObjectURL(files[i]);

                songlist.push({name:name,url:blob});
            };
            this.renderSonglist(songlist);
        },
        renderSonglist:function(data){
            var html = [];
            for (var i = data.length - 1; i >= 0; i--) {
                html.push('<li class="song" data-url="'+data[i].url+'">'+data[i].name+'</li>');
            };
            $('.ul-list').html(html.join(''));
            this.initPlay();
        },
        initPlay:function(){
            var $song = $('.song'),
                $checksong = $('.ch-song'),
                $now,
                self = this;
            if ($song.length === 0) {return;}

            if ($checksong.length === 0){
                $now = $song.eq(0);
                $now.addClass('ch-song').siblings().removeClass('ch-song');
                self.setPlay($now.attr('data-url'));
                return;
            }
        },
        setPlay:function(url){
            this.player.src = url;
            this.player.play();
        },
        nextSong:function(){//下一曲
            var $checksong = $('.ch-song'),
                $next = $checksong.next();
            if ($next.length === 0) {return;}

            $next.addClass('ch-song').siblings().removeClass('ch-song');
            this.setPlay($next.attr('data-url'));
        }
    }
});