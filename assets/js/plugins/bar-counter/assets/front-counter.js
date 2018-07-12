(function ($) {
    
    $(document).ready(function () {
    	$('.ac-progress-line').each(function () {
            var $item = $(this);
            if ($.fn.waypoint) {
                $item.waypoint({
                    handler: function (direction) {
                        $item.find('.progress-value').progressbar({display_text: 'center'});
                    },
                    offset: "68%"
                });
            }else{
                $item.find('.progress-value').progressbar({display_text: 'center'});	
            }
            if($item.hasClass('progress-vertical')){
                $('.progressbar-back-text', this).css({width:'auto'});
                setTimeout(function(){
                    var text_width = $('.progressbar-back-text', $item).width(),
                        el_width = $item.width(),
                        text_left = (el_width - text_width)/2;
                    $('.progressbar-back-text', $item).css({left:text_left+'px'});
                }, 500);                    
            }              
        })
    })

})(jQuery);