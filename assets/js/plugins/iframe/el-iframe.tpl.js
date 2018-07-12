(function($) {
    var strTemplate = '<iframe class="ac-iframe" height="<%= iframe[\'iframe_height\'] %>px" width="100%" src="<%= iframe[\'iframe_link\'] %>" frameborder="0"></iframe>';
    $.aweBuilderTemplate('el-iframe', strTemplate);
})(jQuery)