(function($) {
    var strTemplate = '<<%= listwrap[\'tag\'] %> class="ac-list <% if (listwrap[\'style\']) { %> <%= listwrap[\'style\'] %> <% } %>">\
        				<%= main[\'content\'] %>\
        				</<%= listwrap[\'tag\'] %>>';
    $.aweBuilderTemplate('el-list', strTemplate);
})(jQuery)