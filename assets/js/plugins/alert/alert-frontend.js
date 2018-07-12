(function($) {
    $.fn.aweAlert = function(){
        $('.js-btn-close', this).click(function(){
            $(this).closest('.ac_element').hide();
        });
        
        return this;
    };
    $(document).ready(function(){
        $('.js-alert').aweAlert();
    });    
})(jQuery);

