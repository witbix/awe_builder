(function($) {
    $.fn.aweCarousel= function(){
        var default_settings = {
            effect: 'none',
            show_control: false,
            auto_play: false,
            stop_hover: false,
            speed: 4000,
            transpeed: 400,
            nav: 'none',
            thumb_display: 5,
            position: 'bottom',
            loop:true,
            responsiveClass:true
        };
        this.each(function(){
            var $owl = $(this);            
            // remove last item if has no element
            var $items = $('.js-owl-item', $owl),
                $lastItem = $($items[$items.length - 1]),
                hasWrapper = false;
            if($lastItem){
                if(!$('.ac_element', $lastItem).length){
                    if($lastItem.parent().hasClass('js-front-owl-carousel'))
                        $lastItem.remove();
                    else {
                        $lastItem.parent().remove();
                        hasWrapper = true;
                    }
                }
            } 
            
            // fix if carousel item has wrapper auto
            if(hasWrapper){
                $items.parent().removeClass('ac_element');
            }
            
            if ($owl.attr('data-carousel') != undefined){
                var settings = JSON.parse($owl.attr('data-carousel'));
                settings = $.extend(default_settings, settings);
                $owl.owlCarousel(settings);

                if(settings.navType == 'number'){
                    var i = 1;
                    $('> .owl-dots .owl-dot', $owl).each(function(){
                        $(this).find('span').addClass('dot-number').append(i);
                        i++;
                    });
                }
                
                //add class to parent
                $('.js-owl-item', $owl).each(function(){
                    $(this).parent().addClass($(this).attr('data-class-parent'));
                });
            }
        });         
        
        return this;
    };
    $(document).ready(function(){
        $('.js-front-owl-carousel').aweCarousel();
    });    
})(jQuery);