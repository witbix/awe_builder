(function($) {
    function initInstagramResponsive($selector, options){
        var window_width = $(window).width(),
            prefixClass = 'type-column-';
        
        $selector.removeClass(prefixClass + options.col_lg).removeClass(prefixClass + options.col_md).removeClass(prefixClass + options.col_sm).removeClass(prefixClass + options.col_xs);
        
        if(window_width >= 1200){
            $selector.addClass(prefixClass + options.col_lg);
        } else if(window_width <= 1199 && window_width > 991){
            $selector.addClass(prefixClass + options.col_md);    
        } else if(window_width <= 991 && window_width > 767){
            $selector.addClass(prefixClass + options.col_sm);
        } else if(window_width <= 767){
            $selector.addClass(prefixClass + options.col_xs);
        }        
    }
    
    $.fn.aweInstagram = function(){
        var default_settings = {
            get: 'user',
            template : '<div class="awe-item-instagram" style="padding: 3px;"><a target="_blank" href="{{link}}"><img src="{{image}}" class="img-responsive"/></a></div>',
            target:'awe-instafeed',
            enableLightbox: false
        };
        
        this.each(function(){
            var $item = $(this);
            if ($item.attr('data-instagram') != undefined){
                var settings = JSON.parse($item.attr('data-instagram'));
                settings = $.extend(default_settings, settings);
                
                if(settings.enableLightbox){
                    settings.after = function(){
                        $item.find('a').magnificPopup({
                            type: 'image',
                            removalDelay: 300,
                            mainClass: 'mfp-fade',
                            gallery:{
                                enabled:true,
                                preload: [0, 2],
                                navigateByImgClick: true
                            },
                            zoom: {
                                enabled: true,
                            },
                          });
                          
                        // responsive                
                        if(settings.enableResponsive){
                            var $parentInstagram = $item.parent();
                            initInstagramResponsive($parentInstagram, settings);
                            $(window).resize(function(){
                                initInstagramResponsive($parentInstagram, settings);
                            });
                        }
                    };
                }

                var feed = new Instafeed(settings);
               feed.run();
            }
        });
        
        return this;
    };
    $(document).ready(function(){
        $('.js-front-instagram').aweInstagram();
    });    
})(jQuery);

