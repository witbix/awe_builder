(function($) {
    var strTemplate = '<!-- DC Flickr Feed Start -->\
                        <div id="jflickr_feed_container" class="ac-flickr <%= \'type-column-\'+((main[\'column\'])?main[\'column\']:\'4\') %>">\
                                <ul id="jflickr" class="jflickr" style="margin: -<%= (main[\'img_margin\'])?main[\'img_margin\']:\'3px\' %>"></ul>\
                        </div>';
    $.aweBuilderTemplate('el-flickr', strTemplate);
})(jQuery)