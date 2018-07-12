/**
 * File: src/elements/accordion/el_accordion.js
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: $(time)
 */
(function ($, _$, _window) {
    var partStyle = {
        enabled: {
            font: {
                status: ['normal', 'hover', 'active']
            },
            background: {
                status: ['normal', 'hover', 'active']
            },
            border: {},
            padding: {},
            margin: {}
        }
    };
    AweBuilder.elementInfo('el_accordion', {
        title: 'Accordion',
        icon: 'acicon acicon-elm-accordions',
        objClassName: 'AccordionElement',
        data: {
            main: {
                style: {
                    enabled: ['margin', 'padding']
                },
                settings: {
                    collapsible: {
                        type: 'toggle',
                        title: 'Collapsible',
                        inlineTitle: true,
                        defaultValue: false
                    },
                    onOffIcon: {
                        type: 'group',
                        elements: {
                            enable: {
                                type: 'toggle',
                                title: 'Enable status icons',
                                inlineTitle: true,
                                defaultValue: false,
                                change: function ($panel, el, values, element) {
                                    if (!values.current)
                                        $('.el-position, .el-expandIcon, .el-collapseIcon', $panel).hide();
                                    else
                                        $('.el-position, .el-expandIcon, .el-collapseIcon', $panel).show();
                                    if (!values.updateModel) {
                                        if (values.current) {
                                            var onOffIcon = element.getSettingsAttr("main.settings.onOffIcon");
                                            _$('.js-ac-accordion__header-icon:not(.js-ac-accordion__panel-body .js-ac-accordion__header-icon)', el).show();
                                        }
                                        else
                                            _$('.js-ac-accordion__header-icon:not(.js-ac-accordion__panel-body .js-ac-accordion__header-icon)', el).hide();
                                    }
                                }
                            },
                            position: {
                                type: 'select',
                                title: 'Position',
                                inlineTitle: true,
                                options: {
                                    'left': 'Left',
                                    'right': 'Right'
                                },
                                defaultValue: 'right',
                                change: function ($panel, el, values, element) {
                                    if (!values.updateModel) {
                                        _$('.js-ac-accordion__header-icon:not(.js-ac-accordion__panel-body .js-ac-accordion__header-icon)', el).each(function () {
                                            var $header = _$(this).parents('.js-ac-accordion__header');
                                            if (values.current === "left")
                                                $header.addClass('ac-accordion__header--icon-left');
                                            else
                                                $header.removeClass('ac-accordion__header--icon-left');
                                        });
                                    }
                                }
                            },
                            expandIcon: {
                                type: 'icon',
                                title: 'Expanded icon',
                                defaultValue: 'acicon acicon-minus',
                                change: function ($panel, el, values, element) {
                                    if (!values.updateModel) {
                                        var selectClasses = values.prev.split(' ').join('.');
                                        selectClasses = '.js-ac-accordion__header-icon.'+selectClasses+':not(.js-ac-accordion__panel-body .js-ac-accordion__header-icon)';
                                        _$(selectClasses, el).removeClass(values.prev).addClass(values.current);
                                        _$('.js-ac-accordion__header-icon:not(.js-ac-accordion__panel-body .js-ac-accordion__header-icon)', el).attr('data-expand-icon', values.current);
                                    }
                                }
                            },
                            collapseIcon: {
                                type: 'icon',
                                title: 'Collapsed icon',
                                defaultValue: 'acicon acicon-plus',
                                change: function ($panel, el, values, element) {
                                    if (!values.updateModel) {
                                        var selectClasses = values.prev.split(' ').join('.');
                                        selectClasses = '.js-ac-accordion__header-icon.'+selectClasses+':not(.js-ac-accordion__panel-body .js-ac-accordion__header-icon)';
                                        _$(selectClasses, el).removeClass(values.prev).addClass(values.current);
                                        _$('.js-ac-accordion__header-icon:not(.js-ac-accordion__panel-body .js-ac-accordion__header-icon)', el).attr('data-collapse-icon', values.current);
                                    }
                                }
                            }
                        }
                    },
                    duration: {
                        type: 'ranger',
                        title: 'Expand/Collapse duration',
                        min: 0,
                        max: 10000,
                        unit: 'ms',
                        defaultValue: 200
                    },
                    activeEvent: {
                        type: 'select',
                        title: 'Activate accordion event',
                        options: {
                            'click': 'Click',
                            'hover': 'Hover'
                        },
                        defaultValue: 'click'
                    },
                    
                    active: {
                        type: 'input',
                        title: 'Default accordion',
                        defaultValue: '0'
                    }
                }
            },
            title: {
                title: 'Title',
                selector: '.ac-accordion__header a',
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
                        change: function ($panel, el, values, model) {
                            if (values.current.indexOf("icon") === -1)
                                jQuery(".el-iconPosition", $panel).hide();
                            else
                                jQuery(".el-iconPosition", $panel).show();
                            if (!values.updateModel) {
                                let $icon_el = _$('.js-ac-accordion__title-icon:not(.js-ac-accordion__panel-body .js-ac-accordion__title-icon)', el),
                                    $title_el = _$('.js-ac-accordion__title:not(.js-ac-accordion__panel-body .js-ac-accordion__title)', el),
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
                        change: function ($panel, el, values, model) {
                            if (!values.updateModel) {
                                if (values.current === 'left' || values.current === 'top')
                                    _$('.js-ac-accordion__title-icon', el).each(function () {
                                        _$(this).parent().prepend(_$(this));
                                    });
                                else
                                    _$('.js-ac-accordion__title-icon', el).each(function () {
                                        _$(this).parent().append(_$(this));
                                    });
                                if (values.current === 'top' || values.current === 'bottom')
                                    _$('.js-ac-accordion__title-icon', el).addClass('ac-icon--block');
                                else
                                    _$('.js-ac-accordion__title-icon', el).removeClass('ac-icon--block');
                            }
                        }
                    }
                }
            },
            icon: {
                title: 'Status icon',
                selector: '.ac-accordion__header-icon',
                style: partStyle,
                animation: false
            },
            content: {
                selector: '.ac-accordion__body',
                style: partStyle
            }
        }
    });
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
