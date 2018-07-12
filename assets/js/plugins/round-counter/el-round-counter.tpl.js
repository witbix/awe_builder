(function($) {
  var strTemplate =   '<% if(main["style"] == undefined || main["style"] == 1){ %>\
                            <div class="ac-progress-round">\
                              <div class="round-value"></div>\
                              <div class="round-title" <% if(!main["enable_title"]) { print(\'style="display:none"\')} %>><%= main["title"] %></div>\
                              <div class="round-description" <% if(!main["enable_description"]) { print(\'style="display:none"\')} %>><%= main["description"] %></div>\
                            </div>\
                        <% }else{ %>\
                            <div class="ac-progress-round">\
                                <div class="round-value round-icon">\
                                  <i class="ac-icon <%= main["choose_icon"] %>"></i>\
                                </div>\
                                <div class="round-title" <% if(!main["enable_title"]) { print(\'style="display:none"\')} %>><%= main["title"] %></div>\
                                <div class="round-description" <% if(!main["enable_description"]) { print(\'style="display:none"\')} %>><%= main["description"] %></div>\
                            </div>\
                        <% } %>';
    $.aweBuilderTemplate('el-round-counter', strTemplate);
})(jQuery)