(function($) {
    var strTemplate =
    '<div class="ac-table" <%= main["rows"] %>>\
        <table class="table table-bordered" >\
            <% if (main["table_header"]) { %>\
                <thead>\
                    <tr>\
                        <% for(j = 0; j < main["columns"]; j++ ){ %>\
                            <th class="content-text">Heading</th>\
                        <% } %>\
                    </tr>\
                </thead>\
            <% } %>\
            <tbody>\
                <% for(i = 0; i < main["rows"]; i++ ){ %>\
                    <tr>\
                        <% for(j = 0; j < main["columns"]; j++ ){ %>\
                            <td class="content-text">Cell</td>\
                        <% } %>\
                    </tr>\
                <% } %>\
            </tbody>\
            <% if (main["table_footer"]) { %>\
                <tfoot>\
                    <tr>\
                        <% for(j = 0; j < main["columns"]; j++ ){ %>\
                            <td class="content-text">Footer</td>\
                        <% } %>\
                    </tr>\
                </tfoot>\
            <% } %>\
        </table>\
    </div>';
    $.aweBuilderTemplate('el-table', strTemplate);
})(jQuery)