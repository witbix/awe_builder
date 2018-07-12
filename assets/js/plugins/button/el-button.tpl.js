(function($) {
    var strTemplate = '<a class="ac-btn btn <%= button["button_style"] %> <%= button["button_size"] %> <% if (icon["icon_enable"]) { %> <%= icon["icon_option"]["icon_align"] %> <% } %>" href="<%= button["button_link"] %>" target="<%= button["button_target"] %>" <% if (button["button_disable"]) { %> <%=  \'disabled="\'+button["button_disable"]+\'"\' %> <% } %> <% if (button["button_rel"]) { %> <%=  \'rel="\'+button["button_rel"]+\'"\' %> <% } %> role="button">\
	<i class="ac-icon <%= icon["icon_option"]["icon_class"] %>"  <% if (!icon["icon_enable"]) { %> <%=  \' style="display:none"\'  %> <% } %>></i>\
	<span><%= button["button_text"] %></span></a>';
    $.aweBuilderTemplate('el-button', strTemplate);
})(jQuery)