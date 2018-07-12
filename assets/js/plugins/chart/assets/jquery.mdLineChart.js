(function ($) {
    $.fn.mdLineChart = function () {
        this.each(function () {
            var $this = $(this),
                options = {
                    showTooltips: $this.data('mdTooltips'),
                    animationEasing: $this.data('mdAnimation'),
                    responsive: $this.data('mdResponsive'),
                };

            var ctx = $this.find('canvas')[0].getContext('2d');
            
            var showChart = setInterval(function(){
                ctx.canvas.width = $this.find('canvas').parent().width();
                ctx.canvas.height = $this.find('canvas').parent().width();
                if(ctx.canvas.width){
                    clearInterval(showChart);
                    var data = $this.data('mdValues'),
                        labels = $this.data('mdLabels');
                    var CharData = ({"labels":labels, "datasets":data});

                    if ($this.data('mdType')=='line') {
                        new Chart(ctx).Line(CharData, options);
                      } else if($this.data('mdType')=='radar') {
                        new Chart(ctx).Radar(CharData, options);
                      } else if($this.data('mdType')=='bar') {
                        new Chart(ctx).Bar(CharData, options);
                      }
              }
            },500);
        });
        return this;
    };

    $(document).ready(function () {
    	$('.element-line-chart').mdLineChart();
    })
})(jQuery);