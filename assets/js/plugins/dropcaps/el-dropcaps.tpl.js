(function($) {
    var strTemplate = '<p class="dropcap-style">\
                                <span class="first-letter <%= main[\'style\'] %>"><%= main[\'character\'] %></span>\
                                <span class="description"><%= main[\'description\'] %></span>\
                        </p>';
    $.aweBuilderTemplate('el-dropcaps', strTemplate);
})(jQuery)