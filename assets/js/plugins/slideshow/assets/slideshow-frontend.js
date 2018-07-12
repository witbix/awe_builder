(function($) {
    $.fn.aweSlideshow= function(){
        var default_settings = {
            navType:'',
            loop:true
        };
        this.each(function(){
            var $item = $(this);
            if ($item.attr('data-slideshow') != undefined){
                var settings = JSON.parse($item.attr('data-slideshow'));
                settings = $.extend(default_settings, settings);
               
                var owl = jQuery('.ac-slideshow.owl-carousel', $item);

                if(settings.navType == 'thumbnail'){
                    var dotsOwl = jQuery('.dotsCont.owl-carousel', $item);
                    owl.addClass('thumb-nav');
                    //dotsOwl.remove();               

                    // widthImg = (jQuery('.dotsCont img:first', _self).width()) * settings.thumb_display;
                    var widthImg = 150*settings.thumb_display;
                    dotsOwl.css('width', widthImg);

                    var flag = false;var duration = 300;
                    owl.owlCarousel(settings);
                    var owlNavigation = owl.data('owl.carousel')._plugins.navigation;
                   
                    owl.on('changed.owl.carousel', function (e) {
                        var thumbIndex = e.item.index; 
                        if(settings.loop){
                            thumbIndex = $.inArray(owlNavigation.current(), owlNavigation._pages);
                        }                    
                        
                        if (!flag) {
                            flag = true;
                            dotsOwl.trigger('to.owl.carousel', [thumbIndex, duration, true]);
                            flag = false;
                        }
                        
                        var current = thumbIndex;
                        dotsOwl.find(".owl-item").removeClass("current").eq(current).addClass("current");
                    });
                    dotsOwl.on('initialized.owl.carousel', function () {
                        dotsOwl.find(".owl-item").eq(0).addClass("current");
                    }).owlCarousel({
                        items: settings.thumb_display,
                        nav: false,
                        dots: false
                    }).on('click', '.owl-item', function () {
                        owl.trigger('to.owl.carousel', [jQuery(this).index(), duration, true]);
                    }).on('changed.owl.carousel', function (e) {
                        if (!flag) {
                            flag = true;
                            owl.trigger('to.owl.carousel', [e.item.index, duration, true]);
                            flag = false;
                        }
                    });
                } else {
                    owl.owlCarousel(settings);
                }

                if(settings.navType == 'number'){
                    var i = 1;
                    $('.ac-slideshow .owl-dot', $item).each(function(){
                        $(this).find('span').addClass('dot-number').append(i);
                        i++;
                    });
                }
            }
        });
        
        
        return this;
    };
    $(document).ready(function(){
        $('.js-slideshow-wrap').aweSlideshow();
    });    
})(jQuery);