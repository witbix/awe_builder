/**
 * File: el-divider.js
 */
(function($, _$, _window) {
    function ready_config(el, model) {
        var _divider_text = $('.ac-divider__textval span', el);
        _divider_text.attr('contenteditable', 'true');

        //save data
        _divider_text.blur(function(event) {
            var _text = $(this).aweHtml();
            model.setStorageValue('contentText', _text);
        })
    }

    function changeClass($selector, values) {
        $selector.removeClass(values['prev']).addClass(values['current']);
    }

    function enableToggle($panel, values, $toggleEl) {
        if (values.current) {
            $($toggleEl, $panel).show()
        } else {
            $($toggleEl, $panel).hide()
        }
    }


    AweBuilder.elementInfo('el-divider', {
        title: 'Divider',
        icon: 'acicon acicon-elm-divider',
        enableEditor: [{
            selector: '.ac-divider__textval span',
            saveTo: {}
        }],
        data: {
            main: {
                style: {
                    enabled: {
                        padding: {
                            status: ['normal']
                        },
                        margin: {
                            status: ['normal']
                        },
                        transform: {
                            status: ['normal'],
                            devices: false
                        }
                    }
                },
                settings: {
                    style:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Type',
                        options: {
                            "": "Solid",
                            "ac-divider--dotted": "Dotter",
                            "ac-divider--dashed": "Dashed",
                        },
                        devices: false,
                        defaultValue: '',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                changeClass($('.ac-divider', el), values);
                        }
                    },
                    color: {
                        type: 'colorpicker',
                        title: 'Divider color',
                        defaultValue: '#000000',
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(values != null && !values.updateModel) {
                                $('.ac-divider__line-left, .ac-divider__line-right', el).css({
                                    'border-color': values.current
                                });
                                if ($('.ac-divider--notext', el)) {
                                    $('.ac-divider--notext', el).css({
                                        'border-color': values.current
                                    });
                                }
                            }

                        }
                    },
                    height: {
                        type: 'ranger',
                        title: 'Height',
                        min: 1,
                        max: 100,
                        widthNumber: 2,
                        defaultValue: 1,
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){                                
                                $('.ac-divider__line-left, .ac-divider__line-right', el).css({
                                    'border-width': values.current
                                });
                                
                                if ($('.ac-divider--notext', el)) {
                                    $('.ac-divider--notext', el).css({
                                        'border-top-width': values.current
                                    });
                                } else {
                                    $('.ac-divider', el).css({
                                        'border-top-width': 0
                                    });
                                }
                            }
                        }
                    },
                    customWidth: {
                        type: 'toggle',
                        title: 'Custom width',
                        defaultValue: false,
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(values.current == true){
                                if(!values.updateModel){
                                    $('.ac-divider', el).css({'width': element.getSettingsAttr("main.settings.customWidthWrap.width")});
                                    $('.ac-divider', el).removeClass('ac-divider--left ac-divider--right ac-divider--center').addClass(element.getSettingsAttr("main.settings.customWidthWrap.align"));
                                }

                                $('.align-width',$panel).show();
                            }else{
                                if(!values.updateModel){
                                    $('.ac-divider', el).css({'width': 'auto'});
                                    $('.ac-divider', el).removeClass('ac-divider--left ac-divider--right ac-divider--center');
                                }

                                $('.align-width',$panel).hide();
                            }
                        },
                    },
                    customWidthWrap: {
                        type: 'group',
                        className: 'align-width',
                        elements: {
                            width: {
                                type: 'ranger',
                                title: 'Width',
                                min: 1,
                                max: 800,
                                widthNumber: 2,
                                defaultValue: 300,
                                devices: false,
                                change: function($panel, el, values, element) {
                                    if(!values.updateModel){
                                        if(element.getSettingsAttr("main.settings.customWidth"))
                                            $('.ac-divider', el).css({'width': values.current});
                                    }
                                }
                            },
                            align: {
                                type: 'select',
                                inlineTitle: true,
                                title: 'Align',
                                options: {
                                    'ac-divider--center': 'Center',
                                    'ac-divider--left': 'Left',
                                    'ac-divider--right': 'Right'
                                },
                                devices: false,
                                defaultValue: 'ac-divider--center',
                                change: function($panel, el, values, element) {
                                    if(!values.updateModel){
                                        if(element.getSettingsAttr("main.settings.customWidth"))
                                            changeClass($('.ac-divider', el), values);
                                    }
                                }
                            },
                        }
                    },
                    contentType:{
                        title: 'With',
                        type: 'select',
                        inlineTitle: true,
                        options: {
                            "ac-divider--notext": "None",
                            "ac-divider--text": "Text",
                            "ac-divider--icon": "Icon",
                        },
                        devices: false,
                        defaultValue: 'ac-divider--notext',
                        change: function($panel, el, values, element) {
                            changeClass($('.ac-divider', el), values);
                            if(values.current != 'ac-divider--notext'){
                                $('.ac-divider__text', el).show();
                                $('.content-position', $panel).show();
                                if(!values.updateModel)
                                    $('.ac-divider__textval', el).show();
                            }else{
                                $('.ac-divider__text', el).hide();
                                $('.ac-divider', el).css({
                                    'border-top-width': element.getSettingsAttr("main.settings.height"),
                                    'border-color': element.getSettingsAttr("main.settings.color")
                                });
                                $('.content-position', $panel).hide();
                                if(!values.updateModel)
                                    $('.ac-divider__textval', el).hide();
                            }
                            if(values.current == 'ac-divider--icon'){
                                $('.content-icon', $panel).show();

                                if(!values.updateModel)
                                    $('.ac-divider i', el).show();
                            }else{
                                $('.content-icon', $panel).hide();

                                if(!values.updateModel)
                                    $('.ac-divider i', el).hide();
                            }

                            if(!values.updateModel){
                                if(values.current == 'ac-divider--text'){
                                    $('.ac-divider__textval span', el).show();
                                }else{
                                    $('.ac-divider__textval span', el).hide();
                                }
                            }
                        }
                    },
                    contentText: {
                        type: 'storage',
                        title: 'Content Text',
                        defaultValue: 'Text Divider',
                    },
                    contentIcon: {
                        type: 'icon',
                        title: 'Choose icon',
                        className: 'content-icon',
                        devices: false,
                        defaultValue: '',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                changeClass($('.ac-divider i', el), values);
                        }
                    },
                    contentPosition: {
                        type: 'select',
                        inlineTitle: true,
                        title: 'Position',
                        className: 'content-position',
                        options: {
                            'ac-divider--text-center': 'Center',
                            'ac-divider--text-left': 'Left',
                            'ac-divider--text-right': 'Right'
                        },
                        devices: false,
                        defaultValue: '',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                var contenType = element.getSettingsAttr("main.settings.contentType");
                                if(contenType != 'divider-none')
                                    changeClass($('.ac-divider', el), values);
                            }
                        }
                    }
                }
            },
            content: {
                title: 'Text',
                selector: '.ac-divider__textval',
                style: {
                    enabled: ['font','background','border','padding','margin'],
                    status: ['normal','hover'],
                },
            }
        },
        ready: ready_config
    });
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
