(function($) {
    var strTemplate = '<div class="ac-image js-ac-image">\
            <div class="ac-image_content js-ac-image_content">\
            <% if (image["enable_lightbox"] && image["file"]["url"]) { %>\
                <a href="<% if(image["enable_lightbox"]){image["file"]["url"]} %>" class="mgf-md-popup">\
            <% } %>\
                    <img class="ac-image-thumb" src="<%= image["file"]["url"] %>" alt="" />\
            <% if (image["enable_lightbox"] && image["file"]["url"]) { %>\
            </a>\
            <% } %>\
            </div>\
            <div class="ac-image__caption js-ac-image__caption" contenteditable="true" style="display: none"><%= caption["content"] %></div>\
            </div>';
    $.aweBuilderTemplate('el-image', strTemplate);
})(jQuery)