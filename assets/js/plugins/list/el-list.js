/**
 * File: el-list.js
 */
(function($, _$, _window) {
    function ready(el, model) {

    }

    function changeClass(el, values) {
        $('.ac-list', el).removeClass(values['prev']).addClass(values['current']);
    }

    AweBuilder.elementInfo('el-list', {
        title: 'List',
        icon: 'acicon acicon-elm-list',
        defaultPart: "list",
        data: {
            main:{
                style: {
                    enabled: ['border', 'padding', 'margin'],
                    status: ['normal']
                },
                settings:{
                    content: {
                        type: 'storage',
                        defaultValue: '<li>List</li>'
                    }
                }
            },
            listwrap:{
                title: 'List wrap',
                selector: '.ac-list',
                style: {
                    enabled: ['font', 'background', 'border', 'padding', 'margin', 'shadow', 'transform'],
                    status: ['normal']
                },
                settings: {
                    tag: {
                        type: 'select',
                        inlineTitle: true,
                        title: 'Type',
                        options: {
                            'ul': 'Unordered list',
                            'ol': 'Ordered list'
                        },
                        devices: false,
                        defaultValue: 'ul',
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                                var _self = $('.ac-list', el),
                                elementData = element.getSettingsAttr('main.settings');
                                elementData.content = $('.ac-list', el).html();
                                _self.replaceWith( '<'+values.current+' class="ac-list">' + elementData.content + '</"'+values.current+'">' );
                            }
                        }
                    },
                    style: {
                        type: 'select',
                        inlineTitle: true,
                        title: 'Style',
                        options: {
                            '': 'None',
                            'ac-list--icon': 'Using custom icon',
                            'ac-list--arrow': 'Arrow list',
                            'ac-list--check': 'Check list',
                            'ac-list--star': 'Star list',
                        },
                        devices: false,
                        defaultValue: '',
                        change: function($panel, el, values, element) {
                            changeClass(el, values);
                        }
                    }
                }
            },
            list:{
                title: 'List',
                selector: '.ac-list li',
                style: {
                    enabled: ['font', 'background', 'border', 'padding', 'margin'],
                    status: ['normal']
                },
                settings: {
                    list_content: {
                        type: 'attributes',
                        title: 'List',
                        formElements: {
                            list_text: {
                                type: 'input',
                                title: 'Text',
                                inlineTitle: true,
                                defaultValue: ''
                            },
                            list_icon: {
                                type: 'icon',
                                title: 'Icon',
                                inlineTitle: true,
                                defaultValue: ''
                            }
                        },
                        primaryEl: 'list_text',
                        defaultValue: [{"list_text":"List"}],
                        validate: function(values) {
                            if (values.list_text === ''){
                                alert('Please input text');
                                return false;
                            }
                            else
                                return true;
                        },
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                var list_html = '';
                                        $.each(values.current, function(item, obj){
                                            if (obj['list_icon'] != '')
                                                _list_icon = '<i class="' + obj['list_icon'] + '"></i> ';
                                            else
                                                _list_icon = ''
                                            list_html += '<li>' + _list_icon + obj['list_text'] + '</li>'
                                        });

                                element.setStorageValue('content', list_html, 'main');
                                $('.ac-list', el).html(list_html);
                            }
                        },
                    },
                }
            }

        },
        ready: ready
    });
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
