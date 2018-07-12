/**
 * File: el-button.js
 */
(function($, _$, _window) {

    function ready_config(el, model) {
        var button_text = $('.ac-btn span', el);
        button_text.attr('contenteditable', 'true');

        //save data
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


    function changeLink(el, values) {
        $('.ac-btn', el).attr('href', values['current']);
    }


	AweBuilder.elementInfo('el-button', {
		title: 'Button',
		icon: 'acicon acicon-elm-button',
		data: {
            main: {},
            button: {
                title: 'Button',
                selector: '.ac-btn',
                style: {
                    enabled: ['font','background','border','shadow','padding','margin'],
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
                                changeLink(el, values);
                        }
                    },
                    button_style:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Style',
                        options: {
                            'btn-default': 'Default',
                            'btn-primary': 'Primary',
                            'btn-success': 'Success',
                            'btn-info': 'Info',
                            'btn-warning': 'Warning',
                            'btn-danger': 'Danger',
                            'btn-link': 'Link',
                        },
                        devices: false,
                        defaultValue: 'btn-default',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                changeClass($('.ac-btn', el), values)
                        }
                    },
                    button_size:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Size',
                        options: {
                            'btn-lg': 'Large',
                            'btn-md': 'Default',
                            'btn-sm': 'Small',
                            'btn-xs': 'Extra small'
                        },
                        devices: false,
                        defaultValue: 'btn-md',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                changeClass($('.ac-btn', el), values)
                        }
                    },
                    button_target:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Target',
                        options: {
                            '': 'Default',
                            '_blank': 'Blank',
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
                    button_rel:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Relationship',
                        customStyles: {
                            '.ac_panel-item-general__content': {
                                'padding-left': '100px'
                            }
                        },
                        options: {
                            '': 'Default',
                            'nofollow': 'No follow'
                        },
                        devices: false,
                        defaultValue: '',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                $('.ac-btn',el).removeAttr('rel')
                                if (values.current)
                                    $('.ac-btn',el).attr('rel', values.current);
                            }
                        }
                    },
                    button_disable: {
                        type: 'toggle',
                        title: 'Disable',
                        defaultValue: false,
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                if (values.current) {
                                    $('.ac-btn',el).attr('disabled', 'disabled');
                                } else {
                                    $('.ac-btn',el).removeAttr('disabled');
                                }
                            }
                        }
                    }
                }
            },
            icon: {
                title: 'Icon',
                selector: '.ac-icon',
                style: {
                    enabled: ['font','background','border','shadow','padding','margin'],
                    status: ['normal','hover'],
                },
                settings: {
                    icon_enable: {
                        type: 'toggle',
                        inlineTitle: true,
                        title: 'Enable Icon',
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                                if (values.current) {
                                    if(!values.updateModel){
                                        $('.ac-btn i' , el).css("display","inline");
                                        var icon_align = element.getSettingsAttr("icon.settings.icon_option.icon_align");
                                        $('.ac-btn' , el).addClass(icon_align);
                                    }


                                    $('.icon-option', $panel).show();
                                } else {
                                    if(!values.updateModel){
                                        $('.ac-btn i' , el).hide();
                                        var icon_align = element.getSettingsAttr("icon.settings.icon_option.icon_align");
                                        $('.ac-btn' , el).removeClass(icon_align);
                                    }

                                    $('.icon-option', $panel).hide();
                                }
                        }
                    },
                    icon_option: {
                        type: 'group',
                        className: 'icon-option',
                        elements: {
                            icon_class: {
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
                            icon_align:{
                                type: 'select',
                                inlineTitle: true,
                                title: 'Align',
                                className: 'icon-align',
                                options: {
                                    "icon-left":            "Left",
                                    "icon-right":           "Right",
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
                },
            },
		},
        ready: ready_config

	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
