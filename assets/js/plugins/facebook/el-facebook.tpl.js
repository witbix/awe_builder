(function($) {
    var strTemplate = '<div class="ac-facebook <%= main[\'facebook_align\'] %>">\
                                <iframe src="<%= main[\'ember_url\'] %>"  width="<%= main[\'facebook_width\'] %>" height="<%= main[\'facebook_height\'] %>" frameborder="0"></iframe>\
                        </div>';
    $.aweBuilderTemplate('el-facebook', strTemplate);
})(jQuery)