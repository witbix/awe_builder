/**
 * File: el-dropcaps.js
 */
(function($, _$, _window) {

    function ready_config(el, model) {
        // Edit Text
        var edit_title = $('.action-title', el);
        edit_title.attr('contenteditable', 'true');
        edit_title.blur(function(event) {
            var _text = $(this).text();
            model.setStorageValue('title', _text, 'main');
        })

        var edit_subtitle = $('.action-subtitle', el);
        edit_subtitle.attr('contenteditable', 'true');
        edit_subtitle.blur(function(event) {
            var _text = $(this).text();
            model.setStorageValue('subtitle', _text, 'main');
        })

        var edit_description = $('.action-description', el);
        edit_description.attr('contenteditable', 'true');
        edit_description.blur(function(event) {
            var _text = $(this).text();
            model.setStorageValue('description', _text, 'main');
        })

        // Edit Text Button
        var button_text = $('.ac-btn span', el);
        button_text.attr('contenteditable', 'true');
        $('.ac-btn', el).click(function(event) {
            event.preventDefault();
        })
        button_text.blur(function(event) {
            var _text = $(this).text();
            model.setStorageValue('button_text', _text, 'button');
        })
    }

    function changeClass($selector, values) {
        $selector.removeClass(values['prev']).addClass(values['current']);
    }

	AweBuilder.elementInfo('el-call-to-action', {
		title: 'Call to action',
		icon: 'acicon acicon-call-to-action',
        enableEditor: [{
                selector: '.action-title',
                saveTo: {}
            },{
                selector: '.action-subtitle',
                saveTo: {}
            },{
                selector: '.action-description',
                saveTo: {}
            },{
                selector: '.ac-btn span',
                saveTo: {}
            }],
        data: {
            main: {
                style: {
                    enabled: ['font', 'background','border','padding','margin','shadow'],
                    status: ['normal','hover'],
                },
                settings: {
                    align: {
                        type: "select",
                        title: "Align",
                        inlineTitle: true,
                        devices: false,
                        options: {
                            "direction-left": "Left",
                            "direction-right": "Right",
                            "align-center": "Center",
                        },
                        defaultValue: "direction-left",
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                changeClass($('.call-to-action', el), values);

                                if (values.current != 'align-center') {
                                    $('.call-to-action', el).addClass("display-cell");
                                    $('.action-icon, .action-btn', el).addClass("fit-cell");
                                    $('.action-icon, .action-information, .action-btn', el).addClass("middle-cell");
                                }else{
                                    $('.call-to-action', el).removeClass("display-cell");
                                    $('.action-icon, .action-btn', el).removeClass("fit-cell");
                                    $('.action-icon, .action-information, .action-btn', el).removeClass("middle-cell");
                                }
                            }

                        }
                    },
                    title: {
                        type: 'storage',
                        defaultValue: 'Title call to action',
                    },
                    enable_subtitle: {
                        type: 'toggle',
                        title: 'Enable subtitle',
                        inlineTitle: true,
                        className: 'enable-description',
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                                if (values.current) {
                                    if(!values.updateModel)
                                        $('.action-subtitle' , el).show();
                                } else {
                                    if(!values.updateModel)
                                        $('.action-subtitle' , el).hide();
                                }
                        }
                    },
                    subtitle: {
                        type: 'storage',
                        defaultValue: 'Subtitle call to action',
                    },
                    enable_description: {
                        type: 'toggle',
                        title: 'Enable Description',
                        inlineTitle: true,
                        className: 'enable-description',
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                                if (values.current) {
                                    if(!values.updateModel)
                                        $('.action-description' , el).show();
                                } else {
                                    if(!values.updateModel)
                                        $('.action-description' , el).hide();
                                }
                        }
                    },
                    description: {
                        type: 'storage',
                        defaultValue: 'Description call to action',
                    }
                }
            },
            icon: {
                title: 'Icon',
                selector: '.action-icon i',
                style: {
                    enabled: ['font','background','border','padding','margin'],
                    status: ['normal','hover'],
                },
                settings: {
                    icon_enable: {
                        type: 'toggle',
                        inlineTitle: false,
                        title: 'Enable Icon',
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                                if (values.current) {
                                    if(!values.updateModel)
                                        $('.action-icon' , el).show();
                                    $('.choose-icon', $panel).show();
                                } else {
                                    if(!values.updateModel)
                                        $('.action-icon' , el).hide();
                                    $('.choose-icon', $panel).hide();
                                }
                        }
                    },
                    icon_class: {
                        type: 'icon',
                        inlineTitle: false,
                        title: 'Choose Icon',
                        className: 'choose-icon',
                        devices: false,
                        defaultValue: '',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                changeClass($('.action-icon i', el), values)
                        }
                    },
                },
            },
            button: {
                title: 'Button',
                selector: '.ac-btn',
                style: {
                    enabled: ['font','background','border','padding','margin'],
                    status: ['normal','hover'],
                },
                settings: {
                    button_text: {
                        type: 'storage',
                        defaultValue: 'Button',
                        title: 'Content'
                    },
                    button_link: {
                        type: 'input',
                        inlineTitle: true,
                        title: 'Link',
                        defaultValue: '',
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                $('.ac-btn', el).attr('href', values.current);
                        }
                    },
                    button_target:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Target',
                        options: {
                            '': 'Default',
                            '_blank': 'New window'
                        },
                        devices: false,
                        defaultValue: '',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                $('.ac-btn',el).removeAttr('target')
                                if (values.current)
                                    $('.ac-btn',el).attr('target', values.current);
                            }
                        }
                    },
                    button_icon_enable: {
                        type: 'toggle',
                        inlineTitle: true,
                        title: 'Enable Icon',
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                                if (values.current) {
                                    if(!values.updateModel)
                                        $('.ac-btn i' , el).css("display","inline");
                                    $('.icon-option', $panel).show();
                                } else {
                                    if(!values.updateModel)
                                        $('.ac-btn i' , el).hide();
                                    $('.icon-option', $panel).hide();
                                }
                        }
                    },
                    button_icon_option: {
                        type: 'group',
                        className: 'icon-option',
                        elements: {
                            button_icon_class: {
                                type: 'icon',
                                inlineTitle: false,
                                title: 'Choose Icon',
                                className: 'choose-icon',
                                devices: false,
                                defaultValue: '',
                                change: function($panel, el, values, element) {
                                    if(!values.updateModel)
                                        changeClass($('.ac-btn i', el), values)
                                }
                            },
                            button_icon_align:{
                                type: 'select',
                                inlineTitle: true,
                                title: 'Align',
                                className: 'icon-align',
                                options: {
                                    "icon-left":"Left",
                                    "icon-right":"Right",
                                },
                                devices: false,
                                defaultValue: 'icon-left',
                                change: function($panel, el, values, element) {
                                    if(!values.updateModel)
                                            changeClass($('.ac-btn', el), values)
                                }
                            },
                        }
                    },
                }
            },
            button_icon: {
                title: 'Button Icon',
                selector: '.ac-btn i',
                style: {
                    enabled: ['font','background','border','padding','margin'],
                    status: ['normal','hover'],
                },
            },
            style_title: {
                title: 'Title',
                selector: '.action-title',
                style: {
                    enabled: ['font', 'border','padding','margin','shadow'],
                    status: ['normal','hover'],
                },
            },
            style_subtitle: {
                title: 'Subtitle',
                selector: '.action-subtitle',
                style: {
                    enabled: ['font', 'border','padding','margin','shadow'],
                    status: ['normal','hover'],
                },
            },
            style_description: {
                title: 'Description',
                selector: '.action-description',
                style: {
                    enabled: ['font', 'border','padding','margin','shadow'],
                    status: ['normal','hover'],
                },
            },
        },
		ready: ready_config
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);