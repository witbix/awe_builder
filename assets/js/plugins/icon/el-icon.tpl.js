(function($) {
    var strTemplate = '<div class="ac-icon <% if(icon["style"]){ %> <%=  \'ac-icon-\' + icon["style"] %> <% } %>">\
                                <i class="<%= (icon["icon"])? icon["icon"]: \'fa fa-user\' %>"></i>\
                        </div>';
    $.aweBuilderTemplate('el-icon', strTemplate);
})(jQuery)