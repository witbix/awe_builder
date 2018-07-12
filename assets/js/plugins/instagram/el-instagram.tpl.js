(function($) {
    var strTemplate = '<div class="awe-instagram" data-id=\'<% if (main["instagram_id"]) { %> <%= main["instagram_id"] %> <% } %>\'>\
                            <div id="awe-instafeed" class="awe-instagram-list" style="margin: -<%= (main[\'margin_image\'])?main[\'margin_image\']:\'3px\' %>"></div>\
                        </div>';
    $.aweBuilderTemplate('el-instagram', strTemplate);
})(jQuery)