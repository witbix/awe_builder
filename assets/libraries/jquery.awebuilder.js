jQuery(function($){
    function changeAnimation(){
        var window_width = $(window).width();
        $("[data-animation]").each(function(){
            var $item = $(this),
                animation = $item.attr("data-animation");
            if(animation !== ""){
                animation = $.parseJSON(animation);
                for(var selector in animation){
                    var selector_arr = selector.split('.'),
                        screen = selector_arr[1],
                        value = animation[selector],
                        $part;
                    if(value["selector"] !== ""){
                        $part = $item.find(value["selector"]);
                    } else {
                        $part = $item;
                    }
                    switch(screen){
                        case "lg":
                            if(window_width <= 1199 && window_width > 991){
                                $part.addClass(value["defaultClass"] + " " + value["class"]);
                            }else {
                                $part.removeClass(value["defaultClass"] + " " + value["class"]);
                            }
                            break;
                        case "md":
                            if(window_width <= 991 && window_width > 767){
                                $part.addClass(value["defaultClass"] + " " + value["class"]);
                            }else {
                                $part.removeClass(value["defaultClass"] + " " + value["class"]);
                            }
                            break;
                        case "sm":
                            if(window_width <= 767  && window_width > 575){
                                $part.addClass(value["defaultClass"] + " " + value["class"]);
                            }else {
                                $part.removeClass(value["defaultClass"] + " " + value["class"]);
                            }
                            break;
                        case "xs":
                            if(window_width <= 575){
                                $part.addClass(value["defaultClass"] + " " + value["class"]);
                            }else {
                                $part.removeClass(value["defaultClass"] + " " + value["class"]);
                            }
                            break;
                        default :
                            if(window_width >= 1200){
                                $part.addClass(value["defaultClass"] + " " + value["class"]);
                            }else {
                                $part.removeClass(value["defaultClass"] + " " + value["class"]);
                            }
                    }
                }
            }
        });
    }

    $(window).resize(function(){
        changeAnimation();
    });
    changeAnimation();
});