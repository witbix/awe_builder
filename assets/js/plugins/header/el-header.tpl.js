(function($) {
    var strTemplate = '<<%= header[\'tag\'] %> class="ac-header">\
                                <%= header[\'content\'] %>\
                        </<%= header[\'tag\'] %>>';
    $.aweBuilderTemplate('el-header', strTemplate);
})(jQuery)