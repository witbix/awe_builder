(function($) {
    var strTemplate = '<div class="drupal-block <%= class_random %>">\
                            <%= content_block %>\
                        </div>';
    $.aweBuilderTemplate('drupalBlocks', strTemplate);
})(jQuery)