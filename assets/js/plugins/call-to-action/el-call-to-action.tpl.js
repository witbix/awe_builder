(function($) {
    var strTemplate = '<div class="<% if(main["align"] != "align-center") { %> <%=  "display-cell" %> <% } %> call-to-action <%= main["align"] %>">\
	<div class="<% if(main["align"] != "align-center") { %> <%=  "middle-cell fit-cell" %> <% } %> action-icon" <% if (!icon["icon_enable"]) { %> <%=  \'style="display:none"\'  %> <% } %>>\
		<i class="ac-icon <%= icon["icon_class"] %>"></i>\
	</div>\
	<div class="<% if(main["align"] != "align-center") { %> <%=  "middle-cell" %> <% } %> action-information">\
            <div class="action-title"><%= main["title"] %></div>\
            <div class="action-subtitle" <% if (!main["enable_subtitle"]) { %> <%=  \'style="display:none"\'  %> <% } %>><%= main["subtitle"] %></div>\
            <div class="action-description" <% if (!main["enable_description"]) { %> <%=  \'style="display:none"\'  %> <% } %>><%= main["description"] %></div>\
        </div>\
	<div class="<% if(main["align"] != "align-center") { %> <%=  "middle-cell fit-cell" %> <% } %> action-btn"> \
		<a class="ac-btn btn <% if (button["button_icon_enable"]) { %> <%= button["button_icon_option"]["button_icon_align"] %> <% } %>" href="<%= button["button_link"] %>" target="<%= button["button_target"] %>">\
			<i class="ac-icon <%= button[\'button_icon_option\'][\'button_icon_class\'] %>" <% if (!button["button_icon_enable"]) { %> <%=  \' style="display:none"\'  %> <% } %>></i>\
			<span><%= button[\'button_text\'] %></span>\
		</a>\
	</div>\
</div>';
    $.aweBuilderTemplate('el-call-to-action', strTemplate);
})(jQuery)