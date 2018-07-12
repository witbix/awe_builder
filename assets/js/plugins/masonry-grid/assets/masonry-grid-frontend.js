(function($) {
    $.fn.aweMasonryGrid = function(){
        this.each(function(){
            var $list_wrapper = $(this);
            var $lastItem = $('> .grid-item:last', $list_wrapper);console.log($lastItem);
            if($lastItem.length){console.log($('.ac_element', $lastItem));
                if(!$('.ac_element', $lastItem).length){
                    $lastItem.remove();           
                }
            }
            $list_wrapper.masonry({
                columnWidth: '.grid-sizer',
                itemSelector: '.grid-item'
            });
        });        
        
        return this;
    };
    $(document).ready(function(){
        $('.js-front-masonry').aweMasonryGrid();
    });    
})(jQuery);