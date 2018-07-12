(function ($) {
    /* RoundProgress */
    $.fn.mdProgressRound = function () {
            var $this = $(this);
            var value = Number($this.data("value")) / 100;
            var trailcolor = $this.data("trailcolor"),
                roundcolor = $this.data("roundcolor"),
                fillcolor = $this.data("fillcolor"),
                trailWidth = $this.data("trailwidth"),
                strokeWidth = $this.data("strokewidth"),
                easing_type = $this.data("easing"),
                option;

            if ($this.hasClass('round-icon')) {
                option = {
                    duration: 1500,
                    easing: easing_type,
                };
            }
            else {
                option = {
                    duration: 1500,
                    easing: easing_type,
                    text: {
                        value: '0%'
                    },
                    step: function (state, bar) {
                        bar.setText((bar.value() * 100).toFixed(0) + "%");
                    }
                }
            }
            if(strokeWidth !=''){
              option.strokeWidth = strokeWidth;
            }
            if(trailWidth !=''){
              option.trailWidth = trailWidth;
            }
            if(roundcolor !=''){
              option.color = roundcolor;
            }
            if(trailcolor !=''){
              option.trailColor = trailcolor;
            }
            if(fillcolor !=''){
              option.fill = fillcolor;
            }

            var circle = new ProgressBar.Circle($this[0], option);
                circle.animate(value);
    }
    $(document).ready(function () {
        $('.ac-progress-round').each(function () {
            if ($.fn.waypoint) {
                $(this).waypoint({
                    handler: function (direction) {
                        $(this).find('.round-value').mdProgressRound();
                    },
                    offset: "68%"
                });
            }else{
                $(this).find('.round-value').mdProgressRound();
            }

        });
    })

})(jQuery);