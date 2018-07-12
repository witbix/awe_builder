(function ($) {
    $.fn.mdCounter = function () {
            $(this).countTo({
                    from: $(this).data('from') ? $(this).data('from') : 0,
                    to: $(this).data('to') ? $(this).data('to') : 100,
                    speed: $(this).data('speed') ? $(this).data('speed') : 1000,
                    refreshInterval: $(this).data('refresh') ? $(this).data('refresh') : 50
                });
    }

    $(document).ready(function () {
        $('.ac-counter').each(function () {
            if ($.fn.waypoint) {
                $(this).waypoint({
                    handler: function (direction) {
                        $(this).find('.counter-value').mdCounter();
                    },
                    offset: "68%"
                });
            }else{
                $(this).find('.counter-value').mdCounter();
            }

        });
    })

})(jQuery);