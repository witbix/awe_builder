(function ($) {    
    function mdCoverBox($selector) {
        $children = $selector.children('.cover-box');
        var oldCol = 0;
        
        $(window).on('resize load', function () {
            var numCol = returnNumcol($selector);

            if (numCol === 0) {
                $children.removeClass('active').addClass('normal-style').css({
                    'width': '100%',
                    'margin-right': '0%'
                });
                oldCol = numCol;
            }
            else if (!(numCol === oldCol)) {
                
                if (numCol === 1) {
                    $children.initBox(numCol);
                    $children.activeBox(numCol);
                }
                else {
                    $children.initBox(numCol);
                    $children.filter(function (index) {
                        
                        return (index % numCol === 0);
                    }).activeBox(numCol).css('clear', 'left');

                }
                oldCol = numCol;
            }
            
            // set min height fix for small image
            var maxHeight = 0;
            $children.each(function(){
                if(($(this).hasClass('active') || $(this).hasClass('normal-style')) && numCol > 1){
                    var item_height = $(this).height(), item_content_height = $(this).find('.cover-box-content').height(),
                        maxH = (item_height >= item_content_height) ? item_height:item_content_height;
                    if(maxHeight < maxH)
                        maxHeight = maxH;
                }
            });
            $children.css('min-height',maxHeight + 'px');
        });
        
        $children.on('mouseover', function () {
            var numCol = returnNumcol($selector);
            if (numCol > 0 && !($(this).hasClass('active'))) {
                var From = parseInt($(this).index() / numCol, 10) * numCol;
                $children.slice(From, From + numCol).deactiveBox();
                $(this).activeBox(numCol);
            }
        });

        function returnNumcol($elem) {
            var WW = window.innerWidth;
            var numCol = 1;
            if (WW >= 480) {
                numCol = $elem.data('xs') || numCol;
            }
            if (WW >= 768) {
                numCol = $elem.data('sm') || numCol;
            }
            if (WW >= 1020) {
                numCol = $elem.data('md') || numCol;
            }
            if (WW >= 1230) {
                numCol = $elem.data('lg') || numCol;
            }
            return numCol;
        }

        $.fn.initBox = function (numCol) {
            $(this).removeClass('active normal-style');
            $(this).css({
                'width': 100 / (numCol + 1) + '%',
                'margin-right': '0%'
            });
        };
        $.fn.activeBox = function (numCol) {
            $(this).addClass('active');
            $(this).css('margin-right', 100 / (numCol + 1) + '%');
            return this;
        };
        $.fn.deactiveBox = function () {
            $(this).removeClass('active');
            $(this).css('margin-right', '0');
            return this;
        }
    }

    $(document).ready(function(){
        $(".cover-box-wrapper").each(function(){
            mdCoverBox($(this));
        });
    })

})(jQuery);