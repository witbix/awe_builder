(function($) {
    $.fn.aweJustifiedGrid = function(){
        this.each(function(){
            var $list_wrapper = $(this);
            var enable_lightbox = $list_wrapper.attr('data-enable-lightbox');
            
            if($.fn.imagesLoaded){
                $list_wrapper.imagesLoaded(function() {
                    var $justified = jQuery('.js-ac_el-justified', $list_wrapper),
                        setRowHeight = $list_wrapper.data('row-height'),
                        setmargins = $list_wrapper.data('gallery-gap');
                    $list_wrapper.css('margin', -setmargins);
                    $justified.justifiedGallery({
                        rowHeight: setRowHeight,
                        lastRow : 'justify',
                        margins: setmargins
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
                                var $caption = item.el.closest('.grid-item').find('.js-caption');
                                if ($caption.attr('data-on-lightbox') == 'true')
                                    values.title = $('<div />').html($caption.text()).css('color', '#fff');
                                else
                                    values.title = '';
                            }
                        }
                    });
                }
            }
        });
        
        return this;
    };
    $(document).ready(function(){
        $('.js-front-justified-wrapper').aweJustifiedGrid();
    });    
})(jQuery);

