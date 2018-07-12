(function($) {

	var strTemplate = '<div class="ac-pinterest <%=  main["pinterest_align"] %>">\
						<% if(main["pinterest_link"].indexOf("/pin/") != -1){ %>\
						  	<a data-pin-do="embedPin" data-pin-width="<%= main["pinterest_width"]%>" href="<%= main["pinterest_link"]%>"></a>\
						<% }else if(main["pinterest_link"].indexOf("/pinterest/") != -1){ %>\
						  	<% if (main["pinterest_follow"]=="embed"){ %>\
						  		<a data-pin-do="embedBoard" data-pin-board-width="<%= main["pinterest_boad_width"] %>" data-pin-scale-height="<%= main["pinterest_scale_height"] %>" data-pin-scale-width="<%= main["pinterest_scale_width"] %>" href="<%= main["pinterest_link"] %>"></a>\
						  	<% }else{ %>\
								<a data-pin-do="buttonFollow" href="<%=  main["pinterest_link"] %>"></a>\
							<% } %>\
						<% }else{ %>\
							<% if (main["pinterest_follow"]=="embed"){ %>\
						  		<a data-pin-do="embedUser" data-pin-board-width="<%= main["pinterest_boad_width"] %>" data-pin-scale-height="<%= main["pinterest_scale_height"] %>" data-pin-scale-width="<%= main["pinterest_scale_width"] %>" href="<%= main["pinterest_link"] %>"></a>\
						  	<% }else{ %>\
								<a data-pin-do="buttonFollow" href="<%=  main["pinterest_link"] %>"></a>\
							<% } %>\
						<% } %>\
					</div>';

    $.aweBuilderTemplate('el-pinterest', strTemplate);
})(jQuery)