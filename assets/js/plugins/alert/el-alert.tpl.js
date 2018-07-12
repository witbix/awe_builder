(function($) {
    var strTemplate = '<div class="alert <% if (alert["type"]) { %> <%= alert["type"] %> <% } %><% if (alert["style"]) { %> <%= alert["style"] %> <% } %>">\
	<%  if (alert["enableicon"]) {   %>\
		<i class="<%= (alert["icon"])? alert["icon"]: "fa fa-thumbs-up" %>"></i>\
	<%  }  %>\
	<div class="alert__content" style="min-height: auto">\
		<%= main["content"] %>\
	</div>\
</div>';
    $.aweBuilderTemplate('el-alert', strTemplate);
})(jQuery)