(function($) {
    function initFlickrResponsive($selector, options){
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
    
    $.fn.aweFlickr = function(){
        var default_settings = {
            flickrbase : 'https://api.flickr.com/services/feeds/',
            feedapi : 'photos_public.gne',
            limit: 12,
            qstrings:'',
            itemTemplate: '<li class="ac-item-flickr" style="padding: 3px">' + '<a target="_blank" href="{{link}}" title="{{title}}" class="mfp-zoom-in">' + '<img src="{{image_q}}" alt="{{title}}" />' + '</a>' + '</li>',
            enableLightbox: false
        };
        
        this.each(function(){
            var $item = $(this);
            if ($item.attr('data-flickr') != undefined){
                var settings = JSON.parse($item.attr('data-flickr'));
                settings = $.extend(default_settings, settings);
                
                $item.jflickrfeed(settings,function(){
                    if(settings.enableLightbox){
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
                            }
                        });
                    }
                });
                
                // responsive                
                if(settings.enableResponsive){
                    var $parentFlickr = $item.parent();
                    initFlickrResponsive($parentFlickr, settings);
                    $(window).resize(function(){
                        initFlickrResponsive($parentFlickr, settings);
                    });
                }
            }
        });
        return this;
    };
    $(document).ready(function(){
        $('.js-jflickr').aweFlickr();
    });    
})(jQuery);