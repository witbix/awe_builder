(function($) {
    var strTemplate = '<div class="cover-box-wrapper" data-lg=\'<%= main["desktops_large"] %>\' data-md=\'<%= main["desktops_medium"] %>\'  data-sm=\'<%= main["tablets"] %>\' data-xs=\'<%= main["phones"] %>\'>\
	<%  _.each( main[\'element_value\'] ,function(value,key){  %>\
		<div class="cover-box">\
			<div class="cover-box-image">\
				<a href="<%= value["button_link"] %>" target="<%= value["button_target"] %>">\
					<img src="<%= value["thumb_upload"]["url"] %>" alt="banner image">\
					<div class="cover-box-overlay">\
						<div class="cell-vertical">\
							<div class="cell-middle">\
								<i class="ac-icon <%= value["choose_icon"] %>"></i>\
							</div>\
						</div>\
					</div>\
				</a>\
			</div>\
			<div class="cover-box-content">\
				<h4 class="title"><%= value["title"] %></h4>\
				<div class="subtitle" <% if(!main["enable_subtitle"]) { %> <%= \'style="display:none"\' %> <% } %>><%= value["subtitle"] %></div>\
				<div class="description" <% if(!main["enable_description"]) { %> <%= \'style="display:none"\' %> <% } %>><%= value["description"] %></div>\
				<a class="ac-btn btn" href="<%= value["button_link"] %>" target="<%= value["button_target"] %>" <% if(!main["enable_button"]) { %> <%= \'style="display:none"\' %> <% } %>><%= value["button_text"] %></a>\
			</div>\
		</div>\
	<%  })  %>\
</div>';
    $.aweBuilderTemplate('el-coverbox', strTemplate);
})(jQuery)