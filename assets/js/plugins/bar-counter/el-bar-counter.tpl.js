(function($) {
	var strTemplate = 	'<% if(main["style"] == undefined || main["style"] == 1){ %>\
						  <div class="ac-progress-line progress-fill-text">\
						    <div class="progress-value" data-transitiongoal="<%= main["percent"] %>" role="progressbar">\
						      <div class="progress-name"><%= main["text_content"] %></div>\
						    </div>\
						  </div>\
						<% }else if(main["style"] == 2) { %>\
						  <div class="ac-progress-line <%= main["progress_interfaces"] %>">\
						    <div class="progress-name"><%= main["text_content"] %></div>\
						    <div class="progress-value" data-transitiongoal="<%= main["percent"] %>" role="progressbar"></div>\
						  </div>\
						<% }else{ %>\
						  <div class="ac-progress-line progress-vertical vertical">\
						    <div class="progress-value" data-transitiongoal="<%= main["percent"] %>" role="progressbar"></div>\
						    <div class="progress-name"><%= main["text_content"] %></div>\
						  </div>\
						<% } %>';
    $.aweBuilderTemplate('el-bar-counter', strTemplate);
})(jQuery)