/**
 * File: el-alert.js
 */
(function($, _$, _window) {
    function ready(el, model) {
        var _alert = $('.alert .alert__content', el);
        _alert.attr('contenteditable', 'true');

        //save data
        _alert.blur(function(event) {
            var _text = $(this).aweHtml();
            model.setStorageValue('content', _text);
        })

        $('.alert .close', el).click(function(event) {
            $(this).parent().hide();
        });
    }

    function changeClass(el, values) {
        $('.alert', el).removeClass(values['prev']).addClass(values['current']);
    }

    function enableIcon($panel, el, values, element) {
        if (values.current) {
            $('.el-icon', $panel).show()
        } else {
            $('.el-icon', $panel).hide()
        }
        $('.el-icon', $panel).trigger('change');
    }

	AweBuilder.elementInfo('el-alert', {
		title: 'Alert',
		icon: 'acicon acicon-elm-message',
        enableEditor: {
            selector: '.alert__content',
            saveTo: {}
        },
        defaultPart: "alert",
        data: {
            main:{
                style: {
                    enabled: ['border', 'padding', 'margin'],
                    status: ['normal', 'hover']
                },
                settings:{
                    content: {
                        type: 'storage',
                        defaultValue: 'Your message goes here.'
                    }
                }
            },
            alert:{
                title: 'Alert',
                selector: '.alert',
                style: {
                    enabled: {
                        font: {
                            status: ['normal']
                        },
                        background: {
                            status: ['normal', 'hover']
                        },
                        border: {
                            status: ['normal']
                        },
                        padding: {
                            status: ['normal']
                        },
                        margin: {
                            status: ['normal']
                        },
                        transform: {
                            status: ['normal']
                        }
                    }
                },
                settings: {
                    type: {
                        type: 'select',
                        inlineTitle: false,
                        title: 'Type',
                        options: {
                            'alert-success': 'Success',
                            'alert-info': 'Info',
                            'alert-warning': 'Warning',
                            'alert-danger': 'Danger'
                        },
                        devices: false,
                        defaultValue: 'alert-success',
                        change: function($panel, el, values, element) {
                            changeClass(el, values);
                        }
                    },
                    style: {
                        type: 'select',
                        inlineTitle: true,
                        title: 'Style',
                        options: {
                            '': 'Default',
                            'alert-style-2': 'Style 2',
                            'alert-style-3': 'Style 3',
                            'alert-style-4': 'Style 4'
                        },
                        devices: false,
                        defaultValue: '',
                        change: function($panel, el, values, element) {
                            changeClass(el, values);
                        }
                    },
                    // enableclose: {
                    //     type: 'toggle',
                    //     title: 'Enable close button',
                    //     defaultValue: false,
                    //     devices: false,
                    //     change: function($panel, el, values, element) {
                    //         if(values.current == true && $('.alert .close', el).length == false){
                    //             $('.alert', el).prepend('<a href="#" class="close" data-dismiss="alert" aria-label="close" title="close">×</a>')
                    //         }else if(values.current == false){
                    //             $('.alert .close', el).remove();
                    //         }
                    //     }
                    // },
                    enableicon: {
                        type: 'toggle',
                        title: 'Enable icon',
                        defaultValue: false,
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(values.current == true && $('.alert i', el).length == false){
                                $('.alert', el).prepend('<i class="fa fa-thumbs-up"></i>');
                            }else if(values.current == false){
                                $('.alert i', el).remove();
                            }
                            enableIcon($panel, el, values, element);
                        }
                    },
                    icon: {
                        type: 'icon',
                        title: 'Icon',
                        defaultValue: '',
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(values.current !== ''){
                                $('.alert > i', el).attr('class', '');
                                $('.alert > i', el).addClass(values.current);
                            }
                        }
                    }
                }
            }

        },
		ready: ready
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
