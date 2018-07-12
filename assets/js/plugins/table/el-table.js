/**
 * File: el-text.js
 */
(function($, _$, _window) {
    function initTable(el, option){
        var default_option;
        if($(el).data('table_option')){
            default_option = $(el).data('table_option')
        }else{
            default_option = {
                content:[],
            }
        };
        default_option = $.extend(default_option, option);
        $(el).data('table_option', default_option);

        if(default_option.content.length > 0){
            $('.ac-table table tr', el).each(function(index, val) {
                $(this).find('.content-text').each(function(index2, val2) {
                    var string = default_option.content[index][index2];
                    $(val2).html(string);
                });
            });
        }

        setOddEven(el, 'table tbody tr ');
        setOddEven(el, 'table tbody tr td');
        setOddEven(el, 'table tfoot tr td');
        setOddEven(el, 'table thead tr th');
    }

    function changeHeaderFooter(el, values, elementData, stringAdd, tyle){
        tyle = tyle || false;
        var string= '';
        for(i = 1; i <= $('.ac-table tbody tr:first td', el).length; i++){
            string += stringAdd;
        }
        if(tyle ===  false){
            var stringFooter = "<tfoot><tr>"+string+"</tr></tfoot>";
            if(values.prev != undefined){
                if($('.ac-table table tfoot', el).length){
                    if(values.current === false){
                        $('.ac-table table tfoot', el).hide();
                        $('.ac-table table tfoot tr', el).addClass('table-hide');
                    }else{
                        $('.ac-table table tfoot', el).show();
                        $('.ac-table table tfoot tr', el).removeClass('table-hide');
                    }
                }else{
                    $('.ac-table table', el).append(stringFooter);
                }
            }
            elementData.getView().reinitEditor('.ac-table table tfoot td');
        }else{
            var stringHeader = "<thead><tr>"+string+"</tr></thead>";
            if(values.prev != undefined){
                if($('.ac-table table thead', el).length){
                    if(values.current === false){
                        $('.ac-table table thead', el).hide();
                        $('.ac-table table thead tr', el).addClass('table-hide');
                    }else{
                        $('.ac-table table thead', el).show();
                        $('.ac-table table thead tr', el).removeClass('table-hide');
                    }
                }else{
                    $('.ac-table table', el).prepend(stringHeader);
                }
            }
            elementData.getView().reinitEditor('.ac-table table th');
        }
    }

    function optionColumn(el, values){
        if(values.prev > 20)
            values.prev = 20;
        if(values.current > 20)
            values.current = 20;
        if(values.current > values.prev){
            var loop = values.current - values.prev;
            for(var i = 0; i<loop; i++){
                if($('.ac-table table thead', el).length){
                    $('.ac-table table thead tr', el).append('<th class="content-text">Heading</th>');
                }
                if($('.ac-table table tfoot', el).length){
                    $('.ac-table table tfoot tr', el).append('<td class="content-text">Footer</td>');
                }
                $('.ac-table table tbody tr', el).append('<td class="content-text">Cell</td>');
            }
        }else if(values.current < values.prev){
            var loop = values.prev - values.current;
            for(var i = 0; i<loop; i++){
                if($('.ac-table table thead', el).length){
                    $('.ac-table table thead tr th:last-child', el).remove();
                }
                if($('.ac-table table tfoot', el).length){
                    $('.ac-table table tfoot tr td:last-child', el).remove();
                }
                $('.ac-table table tbody tr td:last-child', el).remove();
            }
        }
    }

    function saveText(el, model){
        var _content = [];
        $('.ac-table table tr', el).not(".table-hide").each(function(index, val) {
            _content[index] = [];
            $(this).find('.content-text').each(function(index2, val2) {
                _content[index][index2] = $(val2).aweHtml();
            });
        });
        model.setStorageValue('content', _content);
    }

    function setOddEven(el, select){
        $(select, el).each(function(index, val) {
            if(($(val).index()) % 2 == 0){
                $(val).addClass('odd');
            }else{
                $(val).addClass('even');
            }
        });
    }

    function ready(el, model) {
        //get data
        var settings = model.get('settings');
        var option = settings.main.settings ? settings.main.settings : {};
        initTable(el, option);

        //save text
        $('.js-ac-toolbar .js-elements-tab').mouseleave(function(){
            saveText(el, model);
        });

    }

    function changeClass(el, value) {
        $('.ac-table', el).removeClass(value['prev']).addClass(value['current']);
    }

	AweBuilder.elementInfo('el-table', {
		title: 'Table',
		icon: 'acicon acicon-elm-table',
        enableEditor: {
            selector: '.ac-table .table',
            saveTo: {}
        },
        data: {
            main:{
                style: {
                    enabled: ['font', 'background', 'border', 'padding', 'margin', 'shadow', 'transform'],
                    status: ['normal', 'hover']
                },
                settings: {
                    content: {
                        type: 'storage',
                        defaultValue: []
                    },
                    columns: {
                        type: 'ranger',
                        title: 'Columns',
                        widget: 'button',
                        allowChangeRange: false,
                        min: 1,
                        max: 20,
                        devices: false,
                        widthNumber: 2,
                        defaultValue: 3,
                        unit: '',
                        change: function($panel, el, values, elementData) {
                            if(values.prev != undefined){
                                optionColumn(el, values);
                                setOddEven(el, 'table tbody tr td');
                                setOddEven(el, 'table tfoot tr td');
                                setOddEven(el, 'table thead tr th');
                            }

                        }
                    },
                    rows: {
                        type: 'ranger',
                        title: 'Rows',
                        widget: 'button',
                        allowChangeRange: false,
                        min: 1,
                        max: 20,
                        devices: false,
                        widthNumber: 2,
                        defaultValue: 3,
                        unit: '',
                        change: function($panel, el, values, elementData) {
                            if(values.prev != undefined){
                                if(values.prev > 20)
                                    values.prev = 20;
                                if(values.current > 20)
                                    values.current = 20;
                                if(values.current > values.prev){
                                    var loop = values.current - values.prev;
                                    var strCon = '';
                                    for (var i = 1; i <= ($('table tbody tr:last-child td', el).length); i++) {
                                        strCon += '<td class="content-text">Cell</td>';
                                    }
                                    for(var i = 0; i<loop; i++){
                                        $('table tbody', el).append("<tr>"+strCon+"</tr>");
                                    }
                                }else if(values.current < values.prev){
                                    var loop = values.prev - values.current;
                                    for(var i = 0; i<loop; i++){
                                        $('table tbody tr:last-child', el).remove();
                                    }
                                }
                                setOddEven(el, 'table tbody tr ');
                                setOddEven(el, 'table tbody tr td');
                            }

                        }
                    },
                    table_header: {
                        type: 'toggle',
                        title: 'Table Header',
                        defaultValue: true,
                        devices: false,
                        inlineTitle: true,
                        change: function($panel, el, values, elementData) {
                            changeHeaderFooter(el, values, elementData, "<th class='content-text' contenteditable='true'>Heading</th>", true);
                            setOddEven(el, 'table thead tr th');
                        }
                    },
                    table_footer: {
                        type: 'toggle',
                        title: 'Table Footer',
                        defaultValue: true,
                        devices: false,
                        inlineTitle: true,
                        change: function($panel, el, values, elementData) {
                            changeHeaderFooter(el, values, elementData, "<td class='content-text' contenteditable='true'>Footer</td>", false);
                            setOddEven(el, 'table tfoot tr td');
                        }
                    }
                }
            },
            cell:{
                title: 'Cell',
                selector: '.ac-table table .content-text',
                style: {
                    enabled: ['padding', 'background'],
                    status: ['normal']
                }
            },
            header:{
                title: 'Header',
                selector: '.ac-table table thead tr .content-text',
                style: {
                    enabled: ['font', 'padding', 'background'],
                    status: ['normal']
                }
            },
            footer:{
                title: 'Footer',
                selector: '.ac-table table tfoot tr .content-text',
                style: {
                    enabled: ['font', 'padding', 'background'],
                    status: ['normal']
                }
            },
            bg_odd_col:{
                title: 'Odd Columns',
                selector: '.ac-table table tr .odd',
                style: {
                    enabled: ['padding', 'background'],
                    status: ['normal']
                }
            },
            bg_even_col:{
                title: 'Even Columns',
                selector: '.ac-table table tr .even',
                style: {
                    enabled: ['padding', 'background'],
                    status: ['normal']
                }
            },
            bg_odd_row:{
                title: 'Odd Rows',
                selector: '.ac-table table tr.odd',
                style: {
                    enabled: ['padding', 'background'],
                    status: ['normal']
                }
            },
            bg_even_row:{
                title: 'Even Rows',
                selector: '.ac-table table tr.even',
                style: {
                    enabled: ['padding', 'background'],
                    status: ['normal']
                }
            }

        },
		ready: ready
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
