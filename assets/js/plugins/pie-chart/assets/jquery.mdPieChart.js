(function ($) {
    $.fn.mdPieChart = function () {
        this.each(function () {
            var $this = $(this),
                options = {
                        showTooltips: $this.data('mdTooltips'),
                        animationEasing: $this.data('mdAnimation'),
                        responsive: $this.data('mdResponsive'),
                        segmentStrokeColor: $this.data('mdStrokeColor'),
                        segmentShowStroke: $this.data('mdEnstroke'),
                        segmentStrokeWidth: $this.data('mdStrokeWidth'),
                    };
                    
            var ctx = $this.find('canvas')[0].getContext('2d');
            
            var showChart = setInterval(function(){                
                ctx.canvas.width = $this.find('canvas').parent().width();
                ctx.canvas.height = $this.find('canvas').parent().width();            
                if(ctx.canvas.width){
                    clearInterval(showChart);
                    var data = $this.data('mdValues');

                    if ($this.data('mdType')=='doughnut') {
                        new Chart(ctx).Doughnut(data, options);
                      } else if($this.data('mdType')=='pie') {
                        new Chart(ctx).Pie(data, options);
                      } 
                      else if($this.data('mdType')=='polararea') {
                        new Chart(ctx).PolarArea(data, options);
                      }
              }
            },500);
        });
        return this;
    };

    $(document).ready(function () {
    	$('.element-chart-pie').mdPieChart();
    })
})(jQuery);