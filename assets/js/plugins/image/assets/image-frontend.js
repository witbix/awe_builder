(function($) {
    $.fn.aweImage = function(){
        this.each(function(){
            var $item = $(this);
            if ($item.attr('data-enable-lightbox') != undefined){
                var enable = $item.attr('data-enable-lightbox');
                if(enable){
                    $item.find('a').magnificPopup({
                        type: 'image',
                        removalDelay: 300,
                        mainClass: 'mfp-fade',
                        zoom: {
                            enabled: true,
                        },
                        callbacks: {
                            markupParse: function (template, values, item) {
                                var $caption = item.el.closest('.ac-image').find('.ac-image__caption');
                                if ($caption.attr('data-on-lightbox')){
                                    values.title = $('<div />').html($caption.text()).css('color', '#fff');
                                }
                                else{
                                    values.title = '';
                                }
                            }
                        }
                    });

                    //fix lightbox over link            
                    $('.js-ac-image__caption', $item).on('click', function(){
                        var $image_item = $(this).closest('.js-front-image');
                        if($image_item.hasClass('ac-image--hover'))
                            $image_item.find('a.mgf-md-popup').trigger('click');
                    });
                }
            }
        });
        
        return this;
    };
    $(document).ready(function(){
        $('.js-front-image').aweImage();
    });    
})(jQuery);

