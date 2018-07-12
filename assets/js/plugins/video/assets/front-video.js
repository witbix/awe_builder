(function ($) {
    function setMagnificPopup($selector) {
       $selector.magnificPopup({
            disableOn: 700,
            //prependTo: '.ac_page-wrapper',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: false,
            fixedContentPos: false,

            type: 'iframe',
            iframe: {
              markup: '<div class="mfp-iframe-scaler">'+
                        '<div class="mfp-close"></div>'+
                        '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>'+
                      '</div>',
              patterns: {
                youtube: {
                  index: 'youtube.com/',

                  id: '',
                  src: '%id%'
                },
                vimeo: {
                  index: 'vimeo.com/',
                  id: '',
                  src: '%id%'
                },
                gmaps: {
                  index: '//maps.google.',
                  src: '%id%&output=embed'
                }
              },
              srcAction: 'iframe_src',
            }
        });
    }
		
  $(document).ready(function(){
    if($(".js-ac-buildzone").length < 1){
        $('.ac-video').each(function(){
            var $item = $(this);
            var $str = $('.mfp-md-video', $item).attr("href"),
                $typePlay = $item.attr("data-playtype");
            $('.thumb-video', $item).click(function(){
                if($typePlay== "inline"){
                    var linkProcessed = $str.replace("autoplay=0", "autoplay=1");
                    $('iframe', $item).attr('src', linkProcessed);
                    $('.thumb-video', $item).hide();
                } else {
                    var link_lightbox = $str.replace("autoplay=0", "autoplay=1");
                    $('.mfp-md-video', $item).attr('href', link_lightbox);

                    setMagnificPopup($('.mfp-md-video', $item));
                    $('.mfp-md-video', $item).trigger('click');
                }
            });
        });
    }
});
	
})(jQuery);