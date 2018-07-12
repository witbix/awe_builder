(function($) {
    var strTemplate = '<div class="ac-divider <%= main["style"] %> <%= main["contentType"] %> \
      <% if((typeof main["customWidth"] != "undefined") && main["customWidth"]){ %> <%= main["customWidthWrap"]["align"]  %> <% } %> \
      <% if (main["contentType"] !="ac-divider--notext"){ %> <%= main["contentPosition"]  %> <% } %>" \
      style = "<% if((typeof main["customWidth"] != "undefined") && main["customWidth"]) { %> <%=  "width:" + main["customWidthWrap"]["width"]+ ";"  %> <% } %>\
                <% if (main["contentType"] =="ac-divider--notext"){ %> <%= "border-top-width:" + main["height"] + ";border-color:" + main["color"]  %> <% } %>" \
    > \
        <div class="ac-divider__text" style = "<% if (main["height"] > 1) { %> <%=  "line-height:" + main["height"] + ";"  %> <% } %> <% if (main["contentType"] == "ac-divider--notext") { %> <%=  \' display:none;\'  %> <% } %>"> \
            <div class="ac-divider__textval"> \
                <span  <% if (main["contentType"] != "ac-divider--text") { %> <%=  \' style="display:none"\'  %> <% } %>><%= main["contentText"] %></span> \
                <i class="ac-icon <%= main["contentIcon"] %>" <% if (main["contentType"] != "ac-divider--icon") { %> <%=  \' style="display:none"\'  %> <% } %>></i> \
            </div> \
            <div class="ac-divider__line-left" style = "border-color: <%= main["color"] %>; <% if (main["height"]) { %> <%=  "border-width:" + main["height"]  %> <% } %>"></div> \
            <div class="ac-divider__line-right" style = "border-color: <%= main["color"] %>; <% if (main["height"]) { %> <%=  "border-width:" + main["height"]  %> <% } %>"></div> \
        </div> \
    </div>';
    $.aweBuilderTemplate("el-divider", strTemplate);
})(jQuery);
