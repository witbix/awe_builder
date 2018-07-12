(function($) {
    var strTemplate = '<div class="ac_el-justified-wrapper js-ac_el-justified-wrapper" data-row-height="200" data-gallery-gap="10">\
                        <div class="ac_el-justified js-ac_el-justified">\
                            <div class="grid-item">\
                                <img src="elements/justified-grid/assets/blank.jpg" alt="image grid">\
                                <div class="caption">I\'m a custom caption! I\'m a div</div>\
                            </div>\
                        </div>\
                    </div>';
    
    $.aweBuilderTemplate('el-justified-grid', strTemplate);
})(jQuery);