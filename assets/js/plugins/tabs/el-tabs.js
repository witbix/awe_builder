/**
 * File: el-tabs.js
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 09/05/2016
 */
(function($, _$, _window) {
    var partStyle = {
            enabled: {
                font: {
                    status: ['normal','hover','active']
                },
                background: {
                    status: ['normal','hover','active']
                },
                border: {},
                padding: {},
                margin: {}
            }
        };
    AweBuilder.elementInfo('el_tabs', {
        title: 'Tabs',
        icon: 'acicon acicon-elm-tabs',
        objClassName: 'TabsElement',
        data: {
            main: {
                style: {
                    enabled: ['margin', 'padding']
                },
                settings: {
                    navigatorPosition: {
                        type: 'select',
                        title: 'Title position',
                        options: {
                            'top': 'Top',
                            'right': 'Right',
                            'bottom': 'Bottom',
                            'left': 'Left'
                        },
                        defaultValue: 'top',
                        change: function($panel, el, values, element) {
                            if (!values.updateModel) {
                                _$('.js-ac-tab__nav', el).removeClass('ac-tab__nav--'+values.prev).addClass('ac-tab__nav--'+values.current);
                                if (values.current === 'bottom')
                                    _$('.js-ac-tab', el).prepend(_$('.js-ac-tab__content', el));
                                else
                                    _$('.js-ac-tab', el).prepend(_$('.js-ac-tab__nav', el));
                                // change sort tabs axis
                                var view = element.getView();
                                if (values.current === 'top' || values.current === 'bottom')
                                    view.changeSortAxis('x');
                                else
                                    view.changeSortAxis('y');
                            }
                        }
                    },
                    heightStyle: {
                        type: 'select',
                        title: "Height Style",
                        options: {
                            'content': 'Content',
                            'auto': "Auto",
                            'fill': 'Fill'
                        },
                        defaultValue: 'content'
                    },
                    collapsible: {
                        type: 'toggle',
                        title: 'Collapsible',
                        inlineTitle: true,
                        defaultValue: false
                    },
                    activeEvent: {
                        type: 'select',
                        title: 'Activate tab event',
                        options: {
                            'click': 'Click',
                            'hover': 'Hover'
                        },
                        defaultValue: 'click'
                    },
                    
                    active: {
                        type: 'input',
                        title: 'Default tab',
                        defaultValue: '0'
                    }
                }
            },
            title: {
                title: 'Title',
                selector: '.ac-tab__nav li a',
                style: partStyle,
                animation: false,
                settings: {
                    type: {
                        type: 'select',
                        title: 'Type',
                        inlineTitle: true,
                        options: {
                            'icon': 'Icon',
                            'icon+text': 'Icon + Text',
                            'text': 'Text'
                        },
                        defaultValue: 'text',
                        change: function($panel, el, values, model) {
                            if (!values.updateModel) {
                                let $icon_el = _$('.js-ac-tab__item-icon', el),
                                    $title_el = _$('.js-ac-tab__item-title', el),
                                    iconPosition = model.getSettingsAttr('title.settings.iconPosition');
                                    
                                if (values.current.indexOf('icon') > -1){
                                    $icon_el.show();
                                    if(iconPosition === 'top' || iconPosition === 'bottom')
                                        $icon_el.addClass('ac-icon--block');
                                }
                                else
                                    $icon_el.removeClass('ac-icon--block').hide();
                                if (values.current.indexOf('text') > -1)
                                    $title_el.show();
                                else
                                    $title_el.hide();
                            }

                            if(values.current != 'icon+text')
                                $('.el-iconPosition', $panel).hide();
                            else
                                $('.el-iconPosition', $panel).show();
                        }
                    },
                    iconPosition: {
                        type: 'select',
                        title: 'Icon position',
                        options: {
                            'top': 'Top',
                            'right': 'Right',
                            'bottom': 'Bottom',
                            'left': 'Left'
                        },
                        defaultValue: 'left',
                        change: function($panel, el, values) {
                            if (!values.updateModel) {
                                _$('.js-ac-tab__nav', el).removeClass('ac-tab__nav--icon-'+values.prev).addClass('ac-tab__nav--icon-'+values.current);
                                if (values.current === 'left' || values.current === 'top') {
                                    _$('.js-ac-tab__item a', el).each(function() {
                                        _$(this).prepend(_$('.js-ac-tab__item-icon', this));
                                    });
                                }
                                else {
                                    _$('.js-ac-tab__item a', el).each(function() {
                                        _$(this).prepend(_$('.js-ac-tab__item-title', this));
                                    });
                                }
                                if (values.current === 'top' || values.current === 'bottom')
                                    _$('.js-ac-tab__item .js-ac-tab__item-icon', el).addClass('ac-icon--block');
                                else
                                    _$('.js-ac-tab__item .js-ac-tab__item-icon', el).removeClass('ac-icon--block');
                            }
                        }
                    }
                }
            },
            icon: {
                title: 'Icon',
                selector: '.ac-tab__nav li a .ac-tab__item-icon',
                animation: false,
                style: partStyle
            },
            content: {
                title: 'Content',
                selector: '.ac-tab__content',
                style: partStyle
            }
        }
    })
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
