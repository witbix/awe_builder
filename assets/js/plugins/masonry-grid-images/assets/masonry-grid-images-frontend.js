(function($) {
    $.fn.aweMasonryGridImages = function(){
        this.each(function(){
            var $list_wrapper = $(this),
                enable_lightbox = $list_wrapper.attr('data-enable-lightbox'),
                margin_image = (parseInt($list_wrapper.attr('data-margin-image'))/2) + 'px';
                
            $list_wrapper.closest('.js-masonry-grid').css('margin','-'+margin_image);
            if($.fn.imagesLoaded){
                $list_wrapper.imagesLoaded(function() {
                    $list_wrapper.masonry({
                        columnWidth: '.grid-sizer',
                        itemSelector: '.grid-item'
                    });
                });
                if(enable_lightbox){
                    $list_wrapper.find('.js-lightbox').magnificPopup({
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
                        callbacks: {
                            markupParse: function (template, values, item) {
                                //values.title = '';
                            }
                        }
                    });
                }
                // render image margin
                $('.grid-item .grid-item__content-wrapper', $list_wrapper).css({top:margin_image,left:margin_image, right:margin_image, bottom:margin_image});
            }
        });        
        
        return this;
    };
    $(document).ready(function(){
        $('.js-front-masonry-images').aweMasonryGridImages();
    });    
})(jQuery);