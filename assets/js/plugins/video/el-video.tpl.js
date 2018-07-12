(function($) {
    var strTemplate = '<div class="ac-video" data-playtype="<%= main["video_play"] %>" style="height: <%= main[\'video_responsive\'] == "embed-responsive-custom" ? main[\'video_height\']+\'px\' :  \'auto\' %>">\
                            <div class="thumb-video" <% if (main["video_auto_play"] || (main["video_play"] == \'inline\' && !main["video_enable"])) { %> <%=  \' style="display:none"\'  %> <% } %>>\
                                    <div class="image-content"><img src="<%= main[\'video_thumb\'] %>" alt="video"/></div>\
                                    <div class="play-control"><div class="play-action"><i class="ic ac-icon-play">play</i></div></div>\
                            </div>\
                            <a href="<%= main[\'ember_url\'] %>" class="mfp-md-video"></a>\
                            <div class="embed-responsive <%= main[\'video_responsive\'] %>">\
                                    <iframe class="embed-responsive-item" src="<%= main[\'ember_url\'] %>" frameborder="0"></iframe>\
                            </div>\
                        </div>';

    $.aweBuilderTemplate('el-video', strTemplate);
})(jQuery)