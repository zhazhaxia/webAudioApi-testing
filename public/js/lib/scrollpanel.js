define('./js/lib/scrollpanel',function( require, exports, module){
    
    var $obj = null;
    exports = module.exports={
        init:function(o){
            $obj = $(o);
            this.bind();
        },
        bind:function(){
            var self = this;
            $obj.bind('mousewheel', function(event) {
                var delta= event.originalEvent.wheelDelta;//滚轮距离120
                self.render(delta,$(this));
            });
        },
        render:function(d,$obj){
            var top = parseInt($obj.css('top')),
                height = parseInt($obj.height()) - parseInt($obj.parent().height());
            if (height <=0 ) {return;};
            top += d;
            top = top > 0 ? 0 : top < -height ? -height : top;//设置区间
            $obj.css('top',top);
        }
    }
});