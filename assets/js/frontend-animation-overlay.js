jQuery(function($){       
    function changeAnimation(){
      var window_width = $(window).width();
      $("[data-animation]:not(.awemenu-submenu)").each(function(){
        var $item = $(this),
            animation = $item.attr("data-animation");
        if(animation !== ""){
            animation = $.parseJSON(animation);
            for(var selector in animation){
                var selector_arr = selector.split('.'),
                    screen = selector_arr[1],
                    value = animation[selector],
                    $part;
                if(value['enable']){
                    if(value["selector"] !== "" && selector_arr[0] != 'main'){
                      $part = $item.find(value["selector"]);
                    } else {
                      $part = $item;
                    }
                    switch(screen){
                      case "lg":
                        if(window_width <= 1199 && window_width > 991){
                            $part.addClass(value["defaultClass"] + " wow " + value["class"]);
                        }else {
                            $part.removeClass(value["defaultClass"] + " wow " + value["class"]);
                        }
                          break;
                      case "md":
                        if(window_width <= 991 && window_width > 767){
                            $part.addClass(value["defaultClass"] + " wow " + value["class"]);
                        }else {
                            $part.removeClass(value["defaultClass"] + " wow " + value["class"]);
                        }
                          break;
                      case "sm":
                          if(window_width <= 767 && window_width > 575){
                            $part.addClass(value["defaultClass"] + " wow " + value["class"]);
                            }else {
                                $part.removeClass(value["defaultClass"] + " wow " + value["class"]);
                            }
                          break;
                     case "xs":
                          if(window_width <= 575){
                                $part.addClass(value["defaultClass"] + " wow " + value["class"]);
                            }else {
                                $part.removeClass(value["defaultClass"] + " wow " + value["class"]);
                            }
                          break;
                      default :
                          if(window_width >= 1200){
                            $part.addClass(value["defaultClass"] + " wow " + value["class"]);
                        }else {
                            $part.removeClass(value["defaultClass"] + " wow " + value["class"]);
                        }
                  }
                }
            }
        }
      });
    }
    
    jQuery('[data-overlay]').each(function (index, el) {
        var $el = jQuery(el),
            overlay;
        try {
            overlay = JSON.parse($el.attr('data-overlay'));
        }
        catch (error) {
            overlay = null;
        }

        if (overlay) {
            var i = 0;
            jQuery.map(overlay, function (data, key) {
                if(i === 0){
                    var $partEl = data.selector ? jQuery(data.selector, $el) : $el;
                    $partEl.prepend('<div class="ac_bg__overlay"/>');
                    i++;
                }
            });
        }
    });

    $(window).resize(function(){
      changeAnimation();
    });
    changeAnimation();
    
    if(window.WOW){
        new WOW().init();
    }
});