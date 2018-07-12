var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * File: awe-core.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 05/10/2016
 */
/// <reference path="../../ts-libraries/backbone.d.ts" />
window.AweBuilderSettings = window.AweBuilderSettings || {
    settings: {
        showGrid: false,
        showTooltips: true,
        customCss: {
            enable: false,
            style: ''
        }
    },
    elements: {},
    elementsTemplate: {},
    elementTabs: {},
    cachedSettings: {},
    styleForms: {},
    settingForms: {},
    libraries: {},
    baseURL: '',
    URLs: {
        buildPage: 'http://localhost:8080/layout.php',
        save: 'http://localhost:8080/save.php',
        element: 'http://localhost:8080/element.php',
        templates: 'http://localhost:8080/templates.php',
        fonts: 'http://localhost:8080/get-fonts.php',
        icon: 'http://localhost:8080/get-icon.php',
        library: 'http://localhost:8080/src/server/files.php',
        fileUpload: 'http://localhost:8080/upload.php'
    },
    spectrumPalette: ['red', 'green', 'blue', 'cyan']
};
/**
 * register custom underscore template for element in admin mode
 * @param {string} machineName: element's machine name what will declare or existed in system.
 * @param {string} strTemplate: underscore format template string
 */
jQuery.aweBuilderTemplate = function (machineName, strTemplate) {
    window.AweBuilderSettings.elementsTemplate[machineName] = strTemplate;
};
jQuery.aweBuilderTabElement = function (options) {
    // validate options
    if (options.machineName === undefined)
        throw Error('You must define machine name for element tab and machine name is exclusively.');
    if (window.AweBuilderSettings.elementTabs[options.machineName] !== undefined)
        throw Error('This machine name is used for another tab. Please choose other name!');
    // if (jQuery.type(options.renderElementContent) !== 'function')
    //     throw Error('You must define render content for elements in this tab!');
    if (options.title === undefined)
        throw Error('You must define title for this tab!');
    if (options.elements === undefined)
        throw Error('You must define elements list or url to get elements info for this tab!');
    // create plugin for element in this panel
    var elementOpts = {
        machineName: options.machineName,
        data: options.elementSettings ? options.elementSettings : {}
    };
    // process ready callback options
    if (options.elementReady && typeof options.elementReady === 'function')
        elementOpts.ready = options.elementReady;
    window.AweBuilderSettings.elements[options.machineName] = elementOpts;
    // save custom tab info
    window.AweBuilderSettings.elementTabs[options.machineName] = options;
};
/**
 * define translate function
 */
window.aweTranslate = window.aweTranslate || function (text) {
    return text;
};
var AweBuilder;
(function (AweBuilder) {
    /**
     * Define status string value
     */
    AweBuilder.STYLE_NORMAL = 'normal';
    AweBuilder.STYLE_HOVER = 'hover';
    AweBuilder.STYLE_ACTIVE = 'active';
    /**
     * Define style elements attribute
     * @type {Object}
     */
    AweBuilder.STYLE_ELEMENTS = {
        font: {
            title: 'Font',
            elements: {
                enable: {
                    type: 'toggle',
                    title: 'Enable custom font',
                    defaultValue: false,
                    listenChange: function (from, values, form) {
                        var me = form.getElements()["enable"];
                        if (me && me.getValue() === false)
                            me.setValue(true);
                    }
                },
                family: {
                    title: 'Font',
                    type: 'select',
                    options: {
                        '': 'Default'
                    },
                    ajax: function () {
                        return window.AweBuilderSettings.URLs.fonts;
                    },
                    ajaxSuccess: function (response, element) {
                        var ajaxOpts;
                        switch (jQuery.type(response)) {
                            case "string":
                                ajaxOpts = parseJSON(response);
                                break;
                            case "object":
                                ajaxOpts = response;
                                break;
                        }
                        jQuery.map(ajaxOpts.data, function (opt, name) {
                            element.opts[name] = opt.title;
                            // render option
                            var $option = jQuery('<li></li>');
                            $option.html(opt.title);
                            $option.attr('data-val', name);
                            if (opt.data) {
                                if (jQuery.type(opt.data) !== 'string')
                                    opt.data = JSON.stringify(opt.data);
                                $option.attr('data-data', opt.data);
                            }
                            jQuery('ul.option-list', element.$el).append($option);
                        });
                        // add libraries
                        if (response.libraries !== undefined && jQuery.type(response.libraries) === 'object') {
                            jQuery.map(response.libraries, function (libPath, options) {
                                addLibraries(response.libraries);
                            });
                        }
                    },
                    defaultValue: '',
                    compareWithDefault: false,
                    changeTo: ['weight', 'enable'],
                    inlineTitle: true
                },
                weight: {
                    type: 'select',
                    title: 'Style',
                    options: {
                        normal: 'Normal'
                    },
                    defaultValue: AweBuilder.STYLE_NORMAL,
                    compareWithDefault: false,
                    listenChange: function (from, values, form) {
                        var newOpts = { normal: 'Normal' }, $actor = form.getElements()[from].$el, $selected = jQuery('.js-selected', $actor);
                        if ($selected.length === 1) {
                            newOpts = parseJSON($selected.attr('data-data'));
                        }
                        // remove all current options
                        this.opts = newOpts;
                        jQuery('ul.option-list', this.$el).html('');
                        this.renderElementFormOpts();
                        // set new default value
                        var defaultValue = newOpts[Object.keys(newOpts)[0]];
                        this.setValue(defaultValue);
                    }
                },
                styles: {
                    type: 'checkboxes',
                    widget: 'button',
                    options: {
                        'italic': {
                            title: 'Italic',
                            classes: 'italic',
                            text: 'i'
                        },
                        'underline': {
                            title: 'Underline',
                            classes: 'underline',
                            text: 'u'
                        },
                        'line-through': {
                            title: 'Line through',
                            classes: 'line-through',
                            text: 's'
                        },
                        'uppercase': {
                            title: 'Line through',
                            classes: 'uppercase',
                            text: 'A'
                        }
                    },
                    defaultValue: [],
                    compareWithDefault: false,
                    changeTo: 'enable'
                },
                align: {
                    type: 'select',
                    inlineTitle: true,
                    title: "Align",
                    options: {
                        'left': 'Left',
                        'center': 'Center',
                        'right': 'Right'
                    },
                    defaultValue: 'left',
                    compareWithDefault: false,
                    changeTo: 'enable'
                },
                size: {
                    type: 'ranger',
                    widthNumber: 2,
                    title: 'Font size',
                    min: 0,
                    max: 100,
                    defaultValue: 0,
                    compareWithDefault: false,
                    unit: 'px',
                    changeTo: 'enable'
                },
                lineHeight: {
                    type: 'ranger',
                    widthNumber: 2,
                    title: 'Line height',
                    min: 0,
                    max: 100,
                    defaultValue: 0,
                    compareWithDefault: false,
                    unit: 'px',
                    changeTo: 'enable'
                },
                letterSpacing: {
                    type: 'ranger',
                    widthNumber: 2,
                    title: 'Letter spacing',
                    min: 0,
                    max: 100,
                    defaultValue: 0,
                    compareWithDefault: false,
                    unit: 'px',
                    changeTo: 'enable'
                },
                color: {
                    type: 'colorpicker',
                    title: 'Color',
                    defaultValue: '',
                    changeTo: 'enable'
                }
            },
            renderHeader: function (values, responsiveMode) {
                var headerInfo = { text: '', changed: false };
                if (values !== undefined && values.enable) {
                    var color = values.color ? "<span class=\"color-info\" style=\"background-color: " + values.color + "\"></span>" : '', size = values.size ? values.size + " " : '', family = values.family ? values.family + ",  " : '';
                    headerInfo.text = "" + family + size + color;
                    headerInfo.changed = true;
                }
                return headerInfo;
            }
        },
        background: {
            title: 'Background',
            elements: {
                enable: {
                    type: 'toggle',
                    title: 'Enable background',
                    defaultValue: false,
                    listenChange: function (from, values, form) {
                        var me = form.getElements()["enable"];
                        if (me && me.getValue() === false)
                            me.setValue(true);
                    }
                },
                color: {
                    title: 'Background color',
                    type: 'colorpicker',
                    defaultValue: '',
                    compareWithDefault: false,
                    changeTo: 'enable'
                },
                image: {
                    type: 'group',
                    elements: {
                        file: {
                            title: 'Background Image',
                            type: 'fileselector',
                            defaultValue: {
                                fid: -1,
                                url: ''
                            },
                            compareWithDefault: false,
                            changeTo: 'enable',
                            change: function ($panel, $el, value, elementData) {
                                if (value.current.url)
                                    jQuery('.el-attachment, .el-repeat, .el-position', $panel).show();
                                else
                                    jQuery('.el-attachment, .el-repeat, .el-position', $panel).hide();
                            }
                        },
                        attachment: {
                            title: 'Mode',
                            type: 'select',
                            options: {
                                scroll: 'Scroll',
                                fixed: 'Fixed',
                                parallax: 'Parallax'
                            },
                            defaultValue: 'scroll',
                            compareWithDefault: false,
                            changeTo: 'enable'
                        },
                        repeat: {
                            title: 'Repeat',
                            type: 'select',
                            options: {
                                'repeat': 'Repeat',
                                'repeat-x': 'Repeat X',
                                'repeat-y': 'Repeat Y',
                                'no-repeat': 'No repeat',
                                'auto': 'Size auto',
                                'cover': 'Size cover'
                            },
                            defaultValue: 'cover',
                            compareWithDefault: false,
                            changeTo: 'enable'
                        },
                        position: {
                            title: 'Position',
                            type: 'select',
                            options: {
                                'top left': 'Top Left',
                                'right top': 'Top Right',
                                'center top': 'Top Center',
                                'left center': 'Center Left',
                                'right center': 'Center Right',
                                'center center': 'Center Center',
                                'left bottom': 'Bottom Left',
                                'right bottom': 'Bottom Right',
                                'bottom center': 'Bottom Center'
                            },
                            defaultValue: 'center center',
                            compareWithDefault: false,
                            changeTo: 'enable'
                        }
                    }
                },
                overlay: {
                    type: 'colorpicker',
                    title: 'Overlay',
                    defaultValue: '',
                    compareWithDefault: false,
                    changeTo: 'enable'
                }
            },
            renderHeader: function (values) {
                var headerInfo = { text: '', changed: false };
                if (values !== undefined && values.enable) {
                    var color = values.color ? "<span class=\"color-info\" style=\"background-color: " + values.color + "\"></span>" : '', image = (values.image !== undefined && values.image.file !== undefined && values.image.file.url) ? "<span class=\"img-info\" style=\"background-image: url('" + values.image.file.url + "')\"></span>" : '';
                    headerInfo.text = "" + color + image;
                    headerInfo.changed = true;
                }
                return headerInfo;
            }
        },
        border: {
            title: 'Border & Radius',
            elements: {
                settings: {
                    type: 'group',
                    widget: 'tabs',
                    useParentKey: true,
                    elements: {
                        border: {
                            type: 'group',
                            title: 'Border',
                            useParentKey: true,
                            elements: {
                                enable: {
                                    title: 'Enable border',
                                    type: 'toggle',
                                    defaultValue: false,
                                    listenChange: function (from, values, form) {
                                        var me = form.getElement('settings.border.enable');
                                        if (me && me.getValue() === false)
                                            me.setValue(true);
                                    }
                                },
                                borders: {
                                    type: 'group',
                                    widget: 'constraint',
                                    primary: 'top',
                                    useParentKey: true,
                                    elements: {
                                        top: {
                                            title: 'Top',
                                            type: 'borderbox',
                                            unit: 'px',
                                            min: 0,
                                            max: 100,
                                            defaultValue: "0px none #000",
                                            compareWithDefault: false,
                                            changeTo: 'settings.border.enable'
                                        },
                                        right: {
                                            title: 'Right',
                                            unit: 'px',
                                            min: 0,
                                            max: 100,
                                            type: 'borderbox',
                                            defaultValue: "0px none #000",
                                            compareWithDefault: false,
                                            changeTo: 'settings.border.enable'
                                        },
                                        bottom: {
                                            title: 'Bottom',
                                            type: 'borderbox',
                                            unit: 'px',
                                            min: 0,
                                            max: 100,
                                            defaultValue: "0px none #000",
                                            compareWithDefault: false,
                                            changeTo: 'settings.border.enable'
                                        },
                                        left: {
                                            title: 'Left',
                                            type: 'borderbox',
                                            unit: 'px',
                                            min: 0,
                                            max: 100,
                                            defaultValue: "0px none #000",
                                            compareWithDefault: false,
                                            changeTo: 'settings.border.enable'
                                        }
                                    }
                                }
                            }
                        },
                        borderRadius: {
                            type: 'group',
                            title: 'Radius',
                            useParentKey: true,
                            elements: {
                                enableRadius: {
                                    title: 'Enable border radius',
                                    type: 'toggle',
                                    defaultValue: false,
                                    listenChange: function (from, values, form) {
                                        var me = form.getElement('settings.borderRadius.enableRadius');
                                        if (me && me.getValue() === false)
                                            me.setValue(true);
                                    }
                                },
                                borderRadius: {
                                    type: 'group',
                                    useParentKey: true,
                                    widget: 'constraint',
                                    elements: {
                                        topLeftRadius: {
                                            title: 'Top left',
                                            type: 'ranger',
                                            unit: 'px',
                                            min: 0,
                                            max: 100,
                                            defaultValue: 0,
                                            compareWithDefault: false,
                                            widthNumber: 2,
                                            changeTo: 'settings.borderRadius.enableRadius'
                                        },
                                        topRightRadius: {
                                            title: 'Top right',
                                            unit: 'px',
                                            min: 0,
                                            max: 100,
                                            type: 'ranger',
                                            defaultValue: 0,
                                            compareWithDefault: false,
                                            widthNumber: 2,
                                            changeTo: 'settings.borderRadius.enableRadius'
                                        },
                                        bottomLeftRadius: {
                                            title: 'Bottom left',
                                            type: 'ranger',
                                            unit: 'px',
                                            min: 0,
                                            max: 100,
                                            defaultValue: 0,
                                            compareWithDefault: false,
                                            widthNumber: 2,
                                            changeTo: 'settings.borderRadius.enableRadius'
                                        },
                                        bottomRightRadius: {
                                            title: 'Bottom right',
                                            type: 'ranger',
                                            unit: 'px',
                                            min: 0,
                                            max: 100,
                                            defaultValue: 0,
                                            compareWithDefault: false,
                                            widthNumber: 2,
                                            changeTo: 'settings.borderRadius.enableRadius'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            renderHeader: function (values) {
                var headerInfo = { text: '', changed: false };
                if (values && ((values.border && values.border.enable) || (values.borderRadius && values.borderRadius.enableRadius)))
                    headerInfo.changed = true;
                return headerInfo;
            }
        },
        padding: {
            title: 'Padding',
            elements: {
                enable: {
                    title: 'Enable padding',
                    type: 'toggle',
                    defaultValue: false,
                    listenChange: function (from, values, form) {
                        var me = form.getElements()["enable"];
                        if (me && me.getValue() === false)
                            me.setValue(true);
                    }
                },
                paddings: {
                    type: 'group',
                    widget: 'constraint',
                    useParentKey: true,
                    elements: {
                        top: {
                            title: 'Top',
                            type: 'ranger',
                            widthNumber: 2,
                            min: 0,
                            max: 100,
                            step: 1,
                            defaultValue: 0,
                            compareWithDefault: false,
                            changeTo: 'enable'
                        },
                        right: {
                            title: 'Right',
                            type: 'ranger',
                            widthNumber: 2,
                            min: 0,
                            max: 100,
                            step: 1,
                            defaultValue: 0,
                            compareWithDefault: false,
                            changeTo: 'enable'
                        },
                        bottom: {
                            title: 'Bottom',
                            type: 'ranger',
                            widthNumber: 2,
                            min: 0,
                            max: 100,
                            step: 1,
                            defaultValue: 0,
                            compareWithDefault: false,
                            changeTo: 'enable'
                        },
                        left: {
                            title: 'Left',
                            type: 'ranger',
                            widthNumber: 2,
                            min: 0,
                            max: 100,
                            step: 1,
                            defaultValue: 0,
                            compareWithDefault: false,
                            changeTo: 'enable'
                        }
                    }
                }
            },
            renderHeader: function (values) {
                var headerInfo = { text: '', changed: false };
                if (values && values.enable) {
                    var top_1 = values.top ? "" + values.top : 'x', left = values.left ? "" + values.left : 'x', right = values.right ? "" + values.right : 'x', bottom = values.bottom ? "" + values.bottom : 'x';
                    headerInfo.text = top_1 + " " + right + " " + bottom + " " + left;
                    headerInfo.changed = true;
                }
                return headerInfo;
            }
        },
        margin: {
            title: 'Margin',
            elements: {
                enable: {
                    title: 'Enable margin',
                    type: 'toggle',
                    defaultValue: false,
                    listenChange: function (from, values, form) {
                        var me = form.getElements()["enable"];
                        if (me && me.getValue() === false)
                            me.setValue(true);
                    }
                },
                margins: {
                    type: 'group',
                    widget: 'constraint',
                    useParentKey: true,
                    elements: {
                        top: {
                            title: 'Top',
                            type: 'ranger',
                            widthNumber: 2,
                            min: 0,
                            max: 100,
                            step: 1,
                            defaultValue: 0,
                            compareWithDefault: false,
                            changeTo: 'enable'
                        },
                        right: {
                            title: 'Right',
                            type: 'ranger',
                            widthNumber: 2,
                            min: 0,
                            max: 100,
                            step: 1,
                            defaultValue: 0,
                            compareWithDefault: false,
                            changeTo: 'enable'
                        },
                        bottom: {
                            title: 'Bottom',
                            type: 'ranger',
                            widthNumber: 2,
                            min: 0,
                            max: 100,
                            step: 1,
                            defaultValue: 0,
                            compareWithDefault: false,
                            changeTo: 'enable'
                        },
                        left: {
                            title: 'Left',
                            type: 'ranger',
                            widthNumber: 2,
                            min: 0,
                            max: 100,
                            step: 1,
                            defaultValue: 0,
                            compareWithDefault: false,
                            changeTo: 'enable'
                        }
                    }
                }
            },
            renderHeader: function (values) {
                var headerInfo = { text: '', changed: false };
                if (values && values.enable) {
                    var top_2 = values.top ? "" + values.top : 'x', left = values.left ? "" + values.left : 'x', right = values.right ? "" + values.right : 'x', bottom = values.bottom ? "" + values.bottom : 'x';
                    headerInfo.text = top_2 + " " + right + " " + bottom + " " + left;
                    headerInfo.changed = true;
                }
                return headerInfo;
            }
        },
        transform: {
            title: 'Transform',
            renderHeader: function (values) {
                var headerInfo = { text: '', changed: false };
                if (values && values.enable)
                    headerInfo.changed = true;
                return headerInfo;
            },
            elements: {
                enable: {
                    title: 'Transform',
                    type: 'toggle',
                    defaultValue: false,
                    listenChange: function (from, values, form) {
                        var me = form.getElements()["enable"];
                        if (me && me.getValue() === false)
                            me.setValue(true);
                    }
                },
                translateX: {
                    title: 'TranslateX',
                    type: 'ranger',
                    widthNumber: 2,
                    min: 0,
                    max: 100,
                    step: 1,
                    defaultValue: 0,
                    compareWithDefault: false,
                    changeTo: 'enable'
                },
                translateY: {
                    title: 'TranslateY',
                    type: 'ranger',
                    widthNumber: 2,
                    min: 0,
                    max: 100,
                    step: 1,
                    defaultValue: 0,
                    compareWithDefault: false,
                    changeTo: 'enable'
                },
                scaleX: {
                    title: 'ScaleX',
                    type: 'ranger',
                    widthNumber: 2,
                    min: 0,
                    max: 100,
                    step: 1,
                    unit: false,
                    defaultValue: 0,
                    compareWithDefault: false,
                    changeTo: 'enable'
                },
                scaleY: {
                    title: 'ScaleY',
                    type: 'ranger',
                    widthNumber: 2,
                    min: 0,
                    max: 100,
                    step: 1,
                    unit: false,
                    defaultValue: 0,
                    compareWithDefault: false,
                    changeTo: 'enable'
                },
                rotateX: {
                    title: 'RotateX',
                    type: 'ranger',
                    widthNumber: 2,
                    min: 0,
                    max: 100,
                    step: 1,
                    defaultValue: 0,
                    unit: 'deg',
                    compareWithDefault: false,
                    changeTo: 'enable'
                },
                rotateY: {
                    title: 'RotateY',
                    type: 'ranger',
                    widthNumber: 2,
                    min: 0,
                    max: 100,
                    step: 1,
                    unit: 'deg',
                    defaultValue: 0,
                    compareWithDefault: false,
                    changeTo: 'enable'
                },
                skewX: {
                    title: 'SkewX',
                    type: 'ranger',
                    widthNumber: 2,
                    min: 0,
                    max: 100,
                    step: 1,
                    unit: 'deg',
                    defaultValue: 0,
                    compareWithDefault: false,
                    changeTo: 'enable'
                },
                skewY: {
                    title: 'SkewY',
                    type: 'ranger',
                    widthNumber: 2,
                    unit: 'deg',
                    min: 0,
                    max: 100,
                    step: 1,
                    defaultValue: 0,
                    compareWithDefault: false,
                    changeTo: 'enable'
                },
                perspective: {
                    title: 'Perspective',
                    type: 'ranger',
                    widthNumber: 2,
                    min: 0,
                    max: 100,
                    step: 1,
                    defaultValue: 0,
                    compareWithDefault: false,
                    changeTo: 'enable'
                }
            }
        },
        shadow: {
            title: 'Shadow',
            elements: {
                shadow: {
                    type: "group",
                    widget: 'tabs',
                    useParentKey: true,
                    elements: {
                        box: {
                            type: 'group',
                            title: 'Box',
                            elements: {
                                enable: {
                                    type: 'toggle',
                                    title: 'Enable box shadow',
                                    defaultValue: false,
                                    listenChange: function (from, values, form) {
                                        var me = form.getElement('shadow.box.enable');
                                        if (me && me.getValue() === false)
                                            me.setValue(true);
                                    }
                                },
                                horizontal: {
                                    title: 'Horizontal Length',
                                    type: 'ranger',
                                    widthNumber: 2,
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    defaultValue: 0,
                                    compareWithDefault: false,
                                    changeTo: 'shadow.box.enable'
                                },
                                vertical: {
                                    title: 'Vertical Length',
                                    type: 'ranger',
                                    widthNumber: 2,
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    compareWithDefault: false,
                                    defaultValue: 0,
                                    changeTo: 'shadow.box.enable'
                                },
                                blur: {
                                    title: 'Blur Radius',
                                    type: 'ranger',
                                    widthNumber: 2,
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    compareWithDefault: false,
                                    defaultValue: 0,
                                    changeTo: 'shadow.box.enable'
                                },
                                spread: {
                                    title: 'Spread Radius',
                                    type: 'ranger',
                                    widthNumber: 2,
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    compareWithDefault: false,
                                    defaultValue: 0,
                                    changeTo: 'shadow.box.enable'
                                },
                                color: {
                                    type: 'colorpicker',
                                    title: 'Shadow color',
                                    defaultValue: '',
                                    compareWithDefault: false,
                                    changeTo: 'shadow.box.enable'
                                },
                                inset: {
                                    type: 'toggle',
                                    title: 'Inset',
                                    defaultValue: false,
                                    compareWithDefault: false,
                                    changeTo: 'shadow.box.enable'
                                }
                            }
                        },
                        text: {
                            type: 'group',
                            title: 'Text',
                            elements: {
                                enable: {
                                    type: 'toggle',
                                    title: 'Enable text shadow',
                                    defaultValue: false,
                                    listenChange: function (from, values, form) {
                                        var me = form.getElement('shadow.text.enable');
                                        if (me && me.getValue() === false)
                                            me.setValue(true);
                                    }
                                },
                                horizontal: {
                                    title: 'Horizontal Length',
                                    type: 'ranger',
                                    widthNumber: 2,
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    compareWithDefault: false,
                                    defaultValue: 0,
                                    changeTo: 'shadow.text.enable'
                                },
                                vertical: {
                                    title: 'Vertical Length',
                                    type: 'ranger',
                                    widthNumber: 2,
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    compareWithDefault: false,
                                    defaultValue: 0,
                                    changeTo: 'shadow.text.enable'
                                },
                                blur: {
                                    title: 'Blur Radius',
                                    type: 'ranger',
                                    widthNumber: 2,
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    defaultValue: 0,
                                    compareWithDefault: false,
                                    changeTo: 'shadow.text.enable'
                                },
                                color: {
                                    type: 'colorpicker',
                                    title: 'Shadow color',
                                    compareWithDefault: false,
                                    defaultValue: '',
                                    changeTo: 'shadow.text.enable'
                                }
                            }
                        }
                    }
                }
            },
            renderHeader: function (values) {
                var headerInfo = { text: '', changed: false };
                if (values && ((values.box && values.box.enable) || (values.text && values.text.enable)))
                    headerInfo.changed = true;
                return headerInfo;
            }
        },
        sizePosition: {
            title: 'Size & Postion',
            renderHeader: function (values) {
                var headerInfo = { text: '', changed: false };
                if (values && ((values.size && values.size.enableSize) || (values.position && values.position.enablePosition)))
                    headerInfo.changed = true;
                return headerInfo;
            },
            elements: {
                settings: {
                    type: 'group',
                    widget: 'tabs',
                    useParentKey: true,
                    elements: {
                        size: {
                            type: 'group',
                            title: 'Size',
                            useParentKey: true,
                            elements: {
                                enableSize: {
                                    type: 'toggle',
                                    title: 'Enable custom size',
                                    defaultValue: false,
                                    listenChange: function (from, values, form) {
                                        var me = form.getElement('settings.size.enableSize');
                                        if (me && me.getValue() === false)
                                            me.setValue(true);
                                    }
                                },
                                width: {
                                    title: 'Width',
                                    type: 'ranger',
                                    widthNumber: 2,
                                    min: 0,
                                    max: 1000,
                                    step: 1,
                                    defaultValue: '0px',
                                    compareWithDefault: false,
                                    changeTo: 'settings.size.enableSize'
                                },
                                height: {
                                    title: 'Height',
                                    type: 'ranger',
                                    widthNumber: 2,
                                    min: 0,
                                    max: 1000,
                                    step: 1,
                                    defaultValue: '0px',
                                    compareWithDefault: false,
                                    changeTo: 'settings.size.enableSize'
                                },
                                minHeight: {
                                    title: 'Min Height',
                                    type: 'ranger',
                                    widthNumber: 2,
                                    min: 0,
                                    max: 1000,
                                    step: 1,
                                    defaultValue: '0px',
                                    compareWithDefault: false,
                                    changeTo: 'settings.size.enableSize'
                                }
                            }
                        },
                        position: {
                            type: 'group',
                            title: 'Position',
                            useParentKey: true,
                            elements: {
                                enablePosition: {
                                    type: 'toggle',
                                    title: 'Enable custom position',
                                    defaultValue: false,
                                    listenChange: function (from, values, form) {
                                        var me = form.getElement('settings.position.enablePosition');
                                        if (me && me.getValue() === false)
                                            me.setValue(true);
                                    }
                                },
                                position: {
                                    title: 'Position',
                                    type: 'select',
                                    inlineTitle: true,
                                    options: {
                                        'relative': 'Relative',
                                        'absolute': 'Absolute',
                                        'fixed': 'Fixed',
                                        'static': 'Static'
                                    },
                                    compareWithDefault: false,
                                    defaultValue: 'static',
                                    change: function ($panel, el, values) {
                                        if (values.current === 'static') {
                                            jQuery('.el-special, .el-left, .el-right, .el-top, .el-bottom, .el-zIndex', $panel).hide();
                                        }
                                        else if (values.current === "relative") {
                                            jQuery('.el-left, .el-right, .el-top, .el-bottom, .el-zIndex', $panel).show();
                                            jQuery('.el-special', $panel).hide();
                                        }
                                        else {
                                            jQuery('.el-special, .el-left, .el-right, .el-top, .el-bottom, .el-zIndex', $panel).show();
                                        }
                                    },
                                    changeTo: 'settings.position.enablePosition'
                                },
                                special: {
                                    type: 'select',
                                    title: 'Special',
                                    inlineTitle: true,
                                    options: {
                                        'none': 'None',
                                        'center_top': 'Center Top',
                                        'center_center': 'Center Center',
                                        'center_bottom': 'Center Bottom',
                                        'left_center': 'Left Center',
                                        'right_center': 'Right Center'
                                    },
                                    defaultValue: 'custom',
                                    compareWithDefault: false,
                                    change: function ($panel, el, values) {
                                        jQuery('.el-left, .el-right, .el-top, .el-bottom', $panel).hide();
                                        switch (values.current) {
                                            case "center_top":
                                                jQuery('.el-top', $panel).show();
                                                break;
                                            case 'center_bottom':
                                                jQuery('.el-bottom', $panel).show();
                                                break;
                                            case 'left_center':
                                                jQuery('.el-left', $panel).show();
                                                break;
                                            case 'right_center':
                                                jQuery('.el-right', $panel).show();
                                                break;
                                            case 'none':
                                                jQuery('.el-left, .el-right, .el-top, .el-bottom', $panel).show();
                                                break;
                                        }
                                    },
                                    changeTo: 'settings.position.enablePosition'
                                },
                                top: {
                                    title: 'Top',
                                    type: 'ranger',
                                    widthNumber: 2,
                                    min: 0,
                                    max: 1000,
                                    step: 1,
                                    compareWithDefault: false,
                                    defaultValue: 0,
                                    changeTo: 'settings.position.enablePosition'
                                },
                                right: {
                                    title: 'Right',
                                    type: 'ranger',
                                    widthNumber: 2,
                                    min: 0,
                                    max: 1000,
                                    step: 1,
                                    compareWithDefault: false,
                                    defaultValue: 0,
                                    changeTo: 'settings.position.enablePosition'
                                },
                                bottom: {
                                    title: 'Bottom',
                                    type: 'ranger',
                                    widthNumber: 2,
                                    min: 0,
                                    max: 1000,
                                    step: 1,
                                    defaultValue: 0,
                                    compareWithDefault: false,
                                    changeTo: 'settings.position.enablePosition'
                                },
                                left: {
                                    title: 'Left',
                                    type: 'ranger',
                                    widthNumber: 2,
                                    min: 0,
                                    max: 1000,
                                    compareWithDefault: false,
                                    step: 1,
                                    defaultValue: 0,
                                    changeTo: 'settings.position.enablePosition'
                                },
                                zIndex: {
                                    title: 'z index',
                                    type: 'ranger',
                                    widthNumber: 2,
                                    min: 0,
                                    max: 1000,
                                    compareWithDefault: false,
                                    step: 1,
                                    defaultValue: 0,
                                    unit: false,
                                    changeTo: 'settings.position.enablePosition'
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    AweBuilder.ANIMATION_ELEMENTS = {
        enable: {
            type: 'toggle',
            title: 'Animation',
            defaultValue: false,
            listenChange: function (from, values, form) {
                var me = form.getElements()["enable"];
                if (me && me.getValue() === false)
                    me.setValue(true);
            }
        },
        animation: {
            type: 'select',
            title: 'Animate',
            options: {
                'fadeIn': 'fadeIn',
                'fadeInDown': 'fadeInDown',
                'fadeInDownBig': 'fadeInDownBig',
                'fadeInLeft': 'fadeInLeft',
                'fadeInLeftBig': 'fadeInLeftBig',
                'fadeInRight': 'fadeInRight',
                'fadeInRightBig': 'fadeInRightBig',
                'fadeInUp': 'fadeInUp',
                'fadeInUpBig': 'fadeInUpBig',
                'slideInDown': 'slideInDown',
                'slideInLeft': 'slideInLeft',
                'slideInRight': 'slideInRight',
                'zoomIn': 'zoomIn',
                'rotateIn': 'rotateIn',
                'rollIn': 'rollIn'
            },
            defaultValue: 'fadeIn',
            compareWithDefault: false,
            inlineTitle: true,
            changeTo: 'enable'
        },
        advance: {
            type: 'toggle',
            title: 'Advanced',
            defaultValue: false,
            change: function ($panel, $el, value, element, form) {
                if (value.current) {
                    // show advance options
                    jQuery('.el-linear, .el-duration, .el-delay', $panel).show();
                    // show options for cubic linear
                    if (form !== undefined) {
                        var linear = form.getFormValues()['linear'];
                        if (linear === 'cubic-bezier')
                            jQuery('.el-cubic', $panel).show();
                    }
                }
                else
                    jQuery('.el-linear, .el-cubic, .el-duration, .el-delay', $panel).hide();
            },
            compareWithDefault: false,
            changeTo: 'enable'
        },
        linear: {
            type: 'select',
            title: 'Timing function',
            options: {
                'ease': 'Ease',
                'ease-in': 'Ease In',
                'ease-in-out': 'Ease In Out',
                'ease-out': 'Ease Out',
                'cubic-bezier': 'Cubic bezier'
            },
            compareWithDefault: false,
            defaultValue: 'linear',
            changeTo: 'cubic'
        },
        cubic: {
            type: 'input',
            title: 'Cubic bezier',
            compareWithDefault: false,
            defaultValue: '',
            listenChange: function (from, values, form) {
                if (values.current === 'cubic-bezier')
                    jQuery('.el-cubic', form.$el).show();
                else
                    jQuery('.el-cubic', form.$el).hide();
            }
        },
        duration: {
            type: 'ranger',
            widthNumber: 2,
            title: 'Duration',
            min: 0,
            max: 10000,
            unit: 'ms',
            compareWithDefault: false,
            defaultValue: 0
        },
        delay: {
            type: 'ranger',
            widthNumber: 2,
            title: 'Delay',
            min: 0,
            max: 10000,
            compareWithDefault: false,
            unit: 'ms',
            defaultValue: 0
        }
    };
    /**
     * Define responsive mode strings and values
     */
    AweBuilder.RES_XL = 'xl';
    AweBuilder.RES_LG = 'lg';
    AweBuilder.RES_MD = 'md';
    AweBuilder.RES_SM = 'sm';
    AweBuilder.RES_XS = 'xs';
    AweBuilder.RESPONSIVE_SETTINGS = {
        hidden: {
            xl: false,
            lg: false,
            md: false,
            sm: false,
            xs: false
        }
    };
    AweBuilder.DEVICES_SIZE = {
        xl: '',
        lg: 1024,
        md: 768,
        sm: 576,
        xs: 480
    };
    /**
     * Define add library function
     */
    AweBuilder.CSS_FILE = 'css';
    AweBuilder.JS_FILE = 'js';
    function addLibrary(options) {
        // callback call when file is loaded
        function fileReady(opts) {
            if (options.type === AweBuilder.JS_FILE && typeof options.checkCallback === 'string' && options.checkCallback) {
                var jQueryFn = options.addToIframe ? jQuery('.js-ac-buildzone > iframe').get(0).contentWindow.jQuery : jQuery, checkCallback_1 = options.checkCallback.replace('jQuery.', 'jQueryFn.').replace('$.', 'jQueryFn.'), libraryReady_1;
                libraryReady_1 = setInterval(function () {
                    if (eval(checkCallback_1) !== undefined) {
                        clearInterval(libraryReady_1);
                        options.readyCallback(opts);
                    }
                }, 100);
            }
            else {
                options.readyCallback(opts);
            }
        }
        // process add library
        var doc = options.addToIframe ? jQuery('.js-ac-buildzone > iframe').get(0).contentWindow.document : document, head = doc.getElementsByTagName('head')[0], tagName = options.type === AweBuilder.JS_FILE ? 'script' : 'link', node = doc.createElement(tagName), filePath = "" + options.path;
        switch (options.type) {
            case AweBuilder.CSS_FILE:
                var link = node;
                // set attribute for link tag
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = filePath;
                link.media = 'all';
                break;
            case AweBuilder.JS_FILE:
                var script = node;
                script.type = "text/javascript";
                script.src = filePath;
                break;
        }
        if (jQuery.type(options.attributes) === 'object') {
            jQuery.map(options.attributes, function (value, name) {
                jQuery(node).attr(name, value);
            });
        }
        // wait to load file
        var fileOpts = {
            type: options.type,
            el: node
        };
        if (node.readyState) {
            node.onreadystatechange = function () {
                if (node.readyState == "loaded" || node.readyState == "complete") {
                    node.onreadystatechange = null;
                    fileReady(fileOpts);
                }
            };
        }
        else {
            node.onload = function () {
                fileReady(fileOpts);
            };
        }
        head.appendChild(node);
    }
    function addLibraries(libraries, readyCallback) {
        var loadedFiles = [], loadingFiles = 0;
        // library file is ready callback
        function fileReadyCallback(fileOpts) {
            loadedFiles.push(fileOpts);
        }
        // implement load files
        jQuery.map(libraries, function (options, libPath) {
            var libPathArray = libPath.split('.'), libType = options && options.type ? options.type : libPathArray.pop(), destination = options && options.destination && jQuery.type(options.destination) === 'array' && options.destination.length > 0 ? options.destination : ['frontend', 'backend'], opts = {
                type: libType,
                path: libPath,
                readyCallback: fileReadyCallback,
                attributes: options.attributes,
                alwaysAdded: options.alwaysAdded
            };
            // add check callback options
            if (options.checkCallback)
                opts.checkCallback = options.checkCallback;
            // add file to backend builder
            if (jQuery.inArray('backend', destination) !== -1) {
                addLibrary(opts);
                loadingFiles++;
            }
            // add library to frontend builder
            if (jQuery.inArray('frontend', destination) !== -1) {
                opts.addToIframe = true;
                addLibrary(opts);
                loadingFiles++;
            }
        });
        // wait to all files is loaded
        if (jQuery.type(readyCallback) === 'function') {
            var waitReady_1;
            waitReady_1 = setInterval(function () {
                if (loadedFiles.length === loadingFiles) {
                    clearInterval(waitReady_1);
                    readyCallback(loadedFiles);
                }
            }, 50);
        }
    }
    AweBuilder.addLibraries = addLibraries;
    /**
     * Define JSON parse function
     */
    function parseJSON(parseStr) {
        var parser;
        try {
            parser = jQuery.parseJSON(parseStr);
        }
        catch (error) {
            parser = {};
        }
        return parser;
    }
    AweBuilder.parseJSON = parseJSON;
    /**
     * get parameters for action request
     * @param name
     * @param data
     * @returns {any}
     */
    function prepareAjaxParamenters(name, data) {
        var URLData = window.AweBuilderSettings.URLs[name], output = {
            url: '',
            data: {}
        };
        switch (jQuery.type(URLData)) {
            case "object":
                if (URLData.url && typeof URLData.url === 'string') {
                    output = {
                        url: URLData.url,
                        data: jQuery.extend(true, {}, data)
                    };
                    if (URLData.extraData && jQuery.type(URLData.extraData === 'object')) {
                        output.data = jQuery.extend(true, {}, URLData.extraData, output.data);
                    }
                }
                break;
            case "string":
                output = {
                    url: URLData,
                    data: jQuery.extend(true, {}, data)
                };
                break;
            default:
                output = false;
                break;
        }
        return output;
    }
    AweBuilder.prepareAjaxParamenters = prepareAjaxParamenters;
    /**
     * declare an element for builder
     * @param machineName
     * @param elData
     */
    function elementInfo(machineName, elData) {
        if (window.AweBuilderSettings.elements[machineName] === undefined)
            window.AweBuilderSettings.elements[machineName] = elData;
        else
            throw Error("Element plugin \"" + machineName + "\" is existed.");
    }
    AweBuilder.elementInfo = elementInfo;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: awe-abstract.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 05/31/2016
 */
/// <reference path="awe-core.ts" />
var AweBuilder;
(function (AweBuilder) {
    var Abstract = (function (_super) {
        __extends(Abstract, _super);
        function Abstract() {
            _super.apply(this, arguments);
        }
        /**
         * Overrides initialize method
         */
        Abstract.prototype.initialize = function (options) {
            // Add title attribute for object
            if (!this.get('title'))
                this.set('title', '');
            // implement extra initialize for object
            this.init(options);
            // create view object for current model
            this.createView();
        };
        /**
         * Implements custom initialize for model class before create view
         */
        Abstract.prototype.init = function (options) { };
        /**
         * create view object for this model
         */
        Abstract.prototype.createView = function () {
            this.view = new AbstractView({ model: this });
        };
        /**
         * get view object of this model
         * @return {View}
         */
        Abstract.prototype.getView = function () {
            return this.view;
        };
        /**
         * get collection what contains current model
         * @return {any} if this model is in a collection return collection. If model does not in a collection return undefined.
         */
        Abstract.prototype.getCollection = function () {
            if (this.collection)
                return this.collection;
            else
                return undefined;
        };
        /**
         * convert a JSONString to object
         * @param {string} parseString: string contains JSONString
         *
         * @returns {object}: If string pass is a JSONString, result is JSON object. If param is not a JSONString, result is empty object.
         */
        Abstract.prototype.parseJSON = function (parseString) {
            return AweBuilder.parseJSON(parseString);
        };
        /**
         * convert data of model is nested object to string
         * @param  {any}    settings Data of an attribute what need to save in database
         * @return {string}          JSONString of settings
         */
        Abstract.prototype.prepareCompositionSettings = function (settings) {
            var out = '';
            switch (typeof settings) {
                case "string":
                    out = JSON.stringify(this.parseJSON(settings));
                    break;
                case "object":
                    out = JSON.stringify(settings);
                    break;
                default:
                    out = JSON.stringify({});
                    break;
            }
            return out;
        };
        return Abstract;
    }(Backbone.Model));
    AweBuilder.Abstract = Abstract;
    var AbstractView = (function (_super) {
        __extends(AbstractView, _super);
        function AbstractView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize() method
         */
        AbstractView.prototype.initialize = function (options) {
            // set jQuery in iframe
            this._$ = AweBuilder._jQuery;
            // implement render content for view
            this.render();
        };
        /**
         * translate english text to current language to support multilanguage
         * @param {string} text: Translation string in englist
         */
        AbstractView.prototype.translate = function (text) {
            return window.aweTranslate(text);
        };
        /**
         * prevent default event of action in jQuery
         * @param {any} event : parameter event what pass by jQuery action handle callback
         */
        AbstractView.prototype.preventDefaultEvent = function (event) {
            if (event !== undefined && event.preventDefault)
                event.preventDefault();
        };
        /**
         * destroy view object
         */
        AbstractView.prototype.destroy = function () {
            this.undelegateEvents();
            this.$el.unbind();
            this.remove();
            Backbone.View.prototype.remove.call(this);
        };
        return AbstractView;
    }(Backbone.View));
    AweBuilder.AbstractView = AbstractView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: awe-panel.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 03/15/2016
 */
/// <reference path="../../ts-libraries/jquery.ui.d.ts"/>
/// <reference path="../wp-builder.ts"/>
/// <reference path="./awe-abstract.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var Panel = (function (_super) {
        __extends(Panel, _super);
        /**
         * constructor function
         */
        function Panel(options) {
            if (options === undefined)
                options = {};
            if (options.content === undefined)
                options.content = null;
            // implements parent constructor
            _super.call(this, options);
        }
        /**
         * overrides init() method
         */
        Panel.prototype.init = function (options) {
            var defaultSettings = {
                enableResize: true,
                enableDrag: true,
                hideDefault: false,
                enableBackBtn: false,
                hasOverlay: false,
                position: ''
            };
            this.settings = jQuery.extend(true, {}, defaultSettings, options.settings);
        };
        /**
         * overrides createView method in parent class
         */
        Panel.prototype.createView = function () {
            this.view = new PanelView({ model: this });
        };
        /**
         * get settings property
         */
        Panel.prototype.getSettings = function () {
            return this.settings;
        };
        /**
         * set builder object
         */
        Panel.prototype.setBuilder = function (builder) {
            this.builder = builder;
        };
        /**
         * get builder object
         */
        Panel.prototype.getBuilder = function () {
            return this.builder;
        };
        return Panel;
    }(AweBuilder.Abstract));
    AweBuilder.Panel = Panel;
    /**
     * Define panel collection class
     */
    var Panels = (function (_super) {
        __extends(Panels, _super);
        /**
         * constructor function
         */
        function Panels(models, options) {
            switch (options) {
                case "object":
                    if (options.model === undefined)
                        options.model = Panel;
                    break;
                default:
                    options = { model: Panel };
                    break;
            }
            _super.call(this, models, options);
        }
        return Panels;
    }(Backbone.Collection));
    AweBuilder.Panels = Panels;
    /**
     * Define view class for panel collection
     */
    var PanelView = (function (_super) {
        __extends(PanelView, _super);
        function PanelView() {
            _super.apply(this, arguments);
        }
        /**
         * declare events on Panel view
         */
        PanelView.prototype.events = function () {
            return {
                'click a.js-ac-panel-close': 'close',
                'click span.js-panel-back': 'back'
            };
        };
        /**
         * init view
         */
        PanelView.prototype.initialize = function () {
            // init template function
            this.template = _.template("\n                <% if (hasOverlay) { %>\n                    <div class=\"ac_panel__overlay\"></div>\n                <% } %>\n                <div class=\"js-panel-inner ac_panel__inner\">\n                    <% if (backBtnText) { %>\n                    <span class=\"js-panel-back ac_panel__tab-item-expand-close\" title=\"<%= backBtnText %>\">                        <i class=\"acicon acicon-angle-left\"></i>\n                    </span>\n                    <% } %>\n                    <div class=\"js-ac-panel-header ac_panel__header\">\n                        <h2 class=\"ac_panel__title\"><%= title %></h2>\n                        <a href=\"#\" class=\"js-ac-panel-close ac_panel__close\"><i class=\"acicon acicon-close\"></i></a>                    </div>\n                    <div class=\"js-ac-panel-body ac_panel__body\"></div>\n\t\t\t    </div>");
            // listen change in attributes of model
            this.listenTo(this.model, 'change', this.applyModelChange);
            // implements parents initialize method
            _super.prototype.initialize.call(this);
        };
        /**
         * render panel view
         */
        PanelView.prototype.render = function () {
            // render panel wrapper
            var title = this.translate(this.model.get('title')), settings = this.model.getSettings(), backBtnText = settings.enableBackBtn ? this.translate('Back') : '';
            this.$el.addClass("ac_panel js-ac_panel js-panel-" + this.model.cid).append(this.template({
                title: title,
                hasOverlay: settings.hasOverlay,
                backBtnText: backBtnText
            }));
            // render content
            this.renderContent();
            // init resizable and draggable panel
            if (settings.enableResize)
                this.initResizable();
            if (settings.enableDrag)
                this.initDraggable();
            // show/hide panel by default
            if (settings.hideDefault) {
                this.close();
            }
            // handle mouse down on panel to set highest z-index
            jQuery(this.$el).mousedown(function (event) {
                jQuery('.js-ac_panel').css('z-index', '');
                _self.$el.css('z-index', 1000);
            });
            // update size for panel content
            var _self = this, waitAddedToDocument;
            waitAddedToDocument = setInterval(function () {
                if (jQuery(_self.$el.parents('body').length)) {
                    // stop wait
                    clearInterval(waitAddedToDocument);
                    // update content size for panel
                    var innerHeight_1 = jQuery('> .js-panel-inner', _self.$el).height(), headerHeight = jQuery('> .js-panel-inner > .js-ac-panel-header', _self.$el).height();
                    _self.updateContentSize(innerHeight_1 - headerHeight);
                    // init settings for panel
                    _self.initPosition();
                }
            }, 200);
            return this;
        };
        /**
         * render content of panel
         */
        PanelView.prototype.renderContent = function () {
            // render content view
            var content = this.model.get('content'), contentView = '';
            switch (typeof content) {
                case 'object':
                    if (content instanceof AweBuilder.Abstract) {
                        contentView = content.getView().$el;
                    }
                    break;
                case 'string':
                    contentView = content;
                    break;
            }
            if (contentView)
                jQuery('.js-ac-panel-body', this.$el).append(contentView);
        };
        /**
         * use jQueryUI.Resizable to allow panel resizable
         */
        PanelView.prototype.initResizable = function () {
            if (jQuery.fn.resizable) {
                var _self_1 = this;
                this.$el.resizable({
                    handles: 's',
                    resize: function (event, ui) {
                        var content = _self_1.model.get('content');
                        if (content instanceof AweBuilder.Abstract) {
                            var innerHeight_2 = jQuery('> .js-panel-inner', _self_1.$el).height(), headerHeight = jQuery('> .js-panel-inner > .js-ac-panel-header', _self_1.$el).height();
                            _self_1.updateContentSize(innerHeight_2 - headerHeight);
                        }
                    }
                });
            }
        };
        /**
         * use jQueryUI.draggable to allow drag panel
         */
        PanelView.prototype.initDraggable = function () {
            if (jQuery.fn.draggable) {
                var _self_2 = this;
                this.$el.draggable({
                    start: function (event, ui) {
                        _self_2.$el.css('right', '');
                    },
                    stop: function (event, ui) {
                        // reset panel postion if drag out view port
                        var top = _self_2.$el.position().top, headerHeight = jQuery('.js-ac-panel-header', _self_2.$el).height();
                        // process vertical position
                        if (top < 0)
                            top = 0;
                        else if (top > window.innerHeight - headerHeight)
                            top = window.innerHeight - headerHeight;
                        _self_2.$el.animate({ top: top }, 200);
                        // process horizontal position
                        var right = _self_2.$el.position().left + _self_2.$el.width(), windowRight = jQuery('body')[0].scrollWidth;
                        if (right > windowRight)
                            _self_2.$el.animate({ left: windowRight - _self_2.$el.width() - 10 }, 100);
                    }
                });
            }
        };
        /**
         * init settings for panel
         */
        PanelView.prototype.initPosition = function () {
            var _self = this, position = this.model.getSettings().position;
            switch (jQuery.type(position)) {
                case "string":
                    if (position === 'left') {
                        var top_3 = (jQuery(window).height() - _self.$el.height()) / 2;
                        _self.$el.css({
                            left: '30px',
                            top: top_3 + "px"
                        });
                    }
                    else if (position === 'right') {
                        var top_4 = (jQuery(window).height() - _self.$el.height()) / 2;
                        _self.$el.css({
                            left: (jQuery(window).width() - _self.$el.width() - 60) + "px",
                            top: top_4 + "px"
                        });
                    }
                    else if (position === 'center') {
                        var top_5 = (jQuery(window).height() - _self.$el.height()) / 2, left = (jQuery(window).width() - _self.$el.width()) / 2;
                        _self.$el.css({ 'left': left + "px", top: top_5 + "px" });
                    }
                    break;
            }
        };
        /**
         * implements show panel
         * @param {any} event: event when click on ui
         * @param {boolean} preventResetPosition: reset position of panel
         */
        PanelView.prototype.open = function (event, preventResetPosition) {
            if (event && event.preventDefault)
                event.preventDefault();
            // show panel
            this.$el.addClass('awe-panel-show').removeClass('ac_panel__hide').trigger('mousedown');
            // reset to default position if panel does not in viewport
            if (!preventResetPosition) {
                var windowRight = window.innerWidth, left = this.$el.position().left, right = left + this.$el.width();
                if (left > windowRight || right <= 0)
                    this.initPosition();
            }
        };
        /**
         * implements hide panel
         * @param {any} event: event when click on ui
         */
        PanelView.prototype.close = function (event) {
            if (event && event.preventDefault)
                event.preventDefault();
            this.$el.addClass('awe-panel-hide').addClass('ac_panel__hide');
        };
        /**
         * handle click to back button
         * @param {any} event jQuery event when click on element
         */
        PanelView.prototype.back = function (event) {
        };
        /**
         * Handle change model data
         */
        PanelView.prototype.applyModelChange = function (model, options) {
            var _self = this;
            jQuery.map(model.changedAttributes(), function (attrData, attrName) {
                switch (attrName) {
                    case "content":
                        _self.renderContent();
                        break;
                    case 'title':
                        jQuery('.js-ac-panel-header > h2', _self.$el).html(attrData);
                        break;
                }
            });
        };
        /**
         * update change for component in panel when after resize
         */
        PanelView.prototype.updateContentSize = function (size) {
        };
        /**
         * show back button on panel
         */
        PanelView.prototype.showBackBtn = function () {
            jQuery('.js-panel-back', this.$el).addClass('active');
        };
        /**
         * hide back button when all sub panel is closed
         */
        PanelView.prototype.hideBackBtn = function () {
            jQuery('.js-panel-back', this.$el).removeClass('active');
        };
        return PanelView;
    }(AweBuilder.AbstractView));
    AweBuilder.PanelView = PanelView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: awe-tabs.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 03/15/2016
 */
/// <reference path="../../ts-libraries/jquery.awe-tabs.d.ts"/>
/// <reference path="../../ts-libraries/jquery.perfect-scrollbar.d.ts"/>
/// <reference path="./awe-abstract.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var Tab = (function (_super) {
        __extends(Tab, _super);
        function Tab() {
            _super.apply(this, arguments);
        }
        Tab.prototype.init = function () {
            if (!this.get('headerHTML'))
                this.set('headerHTML', '', { silent: true });
            if (this.get('content') === undefined)
                this.set('content', null, { silent: true });
        };
        /**
         * overrides createView() method
         */
        Tab.prototype.createView = function () {
            this.view = new TabView({ model: this });
        };
        return Tab;
    }(AweBuilder.Abstract));
    AweBuilder.Tab = Tab;
    var TabView = (function (_super) {
        __extends(TabView, _super);
        function TabView(options) {
            if (options && options.className)
                options.className = "js-tab-panel ac_tabs-panel tabs-panel " + options.className;
            else
                options.className = "js-tab-panel ac_tabs-panel tabs-panel";
            _super.call(this, options);
        }
        /**
         * overrides initialize() method
         */
        TabView.prototype.initialize = function () {
            this.$scrollbar = this.$el;
            this.headerTemplate = _.template('<li data-cid="<%= id %>"><a href="#tab-<%= id %>" data-tooltip="<%= title %>"><%= header %></a></li>');
            _super.prototype.initialize.call(this);
        };
        /**
         * render header of tab
         * @return {string} html of tab's header
         */
        TabView.prototype.renderHeader = function () {
            var title = this.translate(this.model.get('title')), headerHTML = this.model.get('headerHTML'), header = {
                id: this.model.cid,
                title: title,
                header: headerHTML ? headerHTML : title
            };
            this.$header = jQuery(this.headerTemplate(header));
            return this.$header;
        };
        /**
         * render content of tab
         * @return {string} html content of tab
         */
        TabView.prototype.renderTabContent = function () {
            // render content view
            var content = this.model.get('content'), contentView = '';
            switch (typeof content) {
                case 'object':
                    if (content instanceof AweBuilder.Abstract)
                        contentView = content.getView().$el;
                    break;
                case 'string':
                    contentView = content;
                    break;
            }
            this.$el.append(contentView);
        };
        /**
         * render Tab content
         */
        TabView.prototype.renderContent = function () {
            this.$el.attr('id', "tab-" + this.model.cid);
            this.renderTabContent();
            return this.$el;
        };
        /**
         * get header jquery object
         */
        TabView.prototype.getHeader = function () {
            return this.$header;
        };
        /**
         * implements when tab activate
         */
        TabView.prototype.activate = function () { };
        return TabView;
    }(AweBuilder.AbstractView));
    AweBuilder.TabView = TabView;
    var TabCollection = (function (_super) {
        __extends(TabCollection, _super);
        /**
         * overrides constructor
         * @param {Tab[] | Object[]} models: models to will add to collection when initialize
         * @param {any} options: Backbone options for collection constructor
         */
        function TabCollection(models, options) {
            options = jQuery.extend(true, {}, options, { model: Tab });
            _super.call(this, models, options);
        }
        /**
         * set tabs which contains this collection as content
         */
        TabCollection.prototype.setContainer = function (tabs) {
            this.container = tabs;
        };
        /**
         * get tabs object which contains this collection
         */
        TabCollection.prototype.getContainer = function () {
            return this.container;
        };
        return TabCollection;
    }(Backbone.Collection));
    AweBuilder.TabCollection = TabCollection;
    var Tabs = (function (_super) {
        __extends(Tabs, _super);
        function Tabs(options) {
            if (options === undefined)
                options = {};
            if (options.content === undefined) {
                options.content = new TabCollection();
            }
            else {
                if (jQuery.type(options.content) === 'array' || options.content instanceof TabCollection) {
                    if (jQuery.type(options.content) === 'array') {
                        options.content = new TabCollection(options.content);
                    }
                }
                else
                    throw Error('Content of tabs only is array of tab or tab collection');
            }
            // get settings for tabs
            var settings = {};
            if (options.settings !== undefined) {
                settings = options.settings;
                delete options.settings;
            }
            // implements parent constructor
            _super.call(this, options);
            // save settings for this instance
            var defaultSettings = Tabs.defaultSettings;
            jQuery.map(defaultSettings, function (data, key) {
                settings[key] = jQuery.extend(true, {}, defaultSettings[key], settings[key]);
            });
            this.settings = settings;
            // create view instance
            this.createView();
        }
        Tabs.prototype.initialize = function () {
            // Add title attribute for object
            if (!this.get('title'))
                this.set('title', '');
            // set this model is container of content
            this.get('content').setContainer(this);
            // implement extra initialize for object
            this.init();
        };
        Tabs.prototype.createView = function () {
            this.view = new TabsView({ model: this });
        };
        Tabs.prototype.insertTab = function (models, options) {
            var content = this.get('content');
            content.add(models, options);
        };
        Tabs.prototype.getSettings = function () {
            return this.settings;
        };
        Tabs.defaultSettings = {
            plugin: {
                active: 0,
                event: 'click'
            },
            view: {
                headersPosition: 'bottom',
                hasWrapper: true,
                initScrollBar: true,
                navigatorClasses: 'ac_tabs-nav',
                contentWrapperClasses: 'ac_tab--style1'
            }
        };
        return Tabs;
    }(AweBuilder.Abstract));
    AweBuilder.Tabs = Tabs;
    var TabsView = (function (_super) {
        __extends(TabsView, _super);
        function TabsView() {
            _super.apply(this, arguments);
            this.activeTab = 0;
        }
        TabsView.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            this.listenTo(this.model.get('content'), 'add', this.insertTab);
            this.listenTo(this.model.get('content'), 'remove', this.removeTab);
        };
        TabsView.prototype.render = function () {
            var $contentWrap = this.$el, viewSettings = this.model.getSettings().view;
            this.$el.addClass('js-ac-tabs').addClass(viewSettings.contentWrapperClasses);
            if (viewSettings.hasWrapper) {
                this.$el.append('<div class="js-tabs-content ac_tabs-content"></div>');
                $contentWrap = jQuery('> .js-tabs-content', this.$el);
            }
            // add tabs
            var $navWrap = jQuery('<ul class="js-ac-tabs-nav ' + viewSettings.navigatorClasses + '"></ul>');
            this.model.get('content').each(function (tab, id) {
                if (tab instanceof Tab) {
                    var view = tab.getView();
                    if (view) {
                        // add content tab
                        $contentWrap.append(view.renderContent());
                        // add tab navigator
                        var $header = view.renderHeader();
                        // fix tooltip first tab
                        if (id === 0)
                            jQuery('a', $header).addClass('tooltip-align-left');
                        $navWrap.append($header);
                    }
                }
            });
            if (viewSettings.headersPosition === 'bottom')
                this.$el.append($navWrap);
            else
                this.$el.prepend($navWrap);
            // init aweTabs plugin
            this.initTabs();
            return this;
        };
        TabsView.prototype.initTabs = function () {
            if (jQuery.fn.aweTabs) {
                var settings = this.model.getSettings();
                // init tabs plugin
                this.$el.aweTabs(settings.plugin);
                // set activeTab
                if (settings.plugin.active !== false)
                    this.activeTab = settings.plugin.active;
            }
        };
        /**
         * add view of tab when add new tab
         */
        TabsView.prototype.insertTab = function (model, collection, options) {
            var view = model.getView(), header = view.renderHeader(), content = view.renderContent();
            // add header and content tab to tabs
            if (typeof options === 'object' && options.index !== undefined) {
                jQuery('> ul.js-ac-tabs-nav > li:eq(' + options.index + ')', this.$el).before(header);
            }
            else {
                jQuery('> ul.js-ac-tabs-nav', this.$el).append(header);
            }
            jQuery('> .js-tabs-content', this.$el).append(content);
            // update aweTabs plugin
            if (jQuery.fn.aweTabs)
                this.$el.aweTabs('update');
        };
        /**
         * remove view of tab when a tab is removed
         */
        TabsView.prototype.removeTab = function (model, collection, options) {
            if (typeof options === 'object' && options.index !== undefined) {
                var $header = jQuery('> ul.js-ac-tabs-nav > li:eq(' + options.index + ')', this.$el), contentID = jQuery('a', $header).attr('href');
                // remove header and content tab
                $header.remove();
                jQuery(contentID, this.$el).remove();
            }
        };
        /**
         * method to activate a tab by index
         */
        TabsView.prototype.activateTab = function (index) {
            if (jQuery.fn.aweTabs) {
                this.$el.aweTabs('option', 'active', index);
                this.activeTab = index;
                var tab = this.model.get('content').at(index);
                if (tab)
                    tab.getView().activate();
            }
        };
        return TabsView;
    }(AweBuilder.AbstractView));
    AweBuilder.TabsView = TabsView;
})(AweBuilder || (AweBuilder = {}));
/// <reference path="../../core/awe-panel.ts"/>
/// <reference path="../../core/awe-tabs.ts"/>
/// <reference path="../../core/awe-content-object.ts"/>
/// <reference path="media-panel.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var UploaderTab = (function (_super) {
        __extends(UploaderTab, _super);
        function UploaderTab() {
            _super.call(this, { title: 'Upload' });
        }
        UploaderTab.prototype.createView = function () {
            this.view = new UploaderTabView({ model: this });
        };
        UploaderTab.prototype.setMediaPanel = function (view) {
            this.mediaPanel = view;
        };
        UploaderTab.prototype.getMediaPanel = function () {
            return this.mediaPanel;
        };
        return UploaderTab;
    }(AweBuilder.Tab));
    AweBuilder.UploaderTab = UploaderTab;
    var UploaderTabView = (function (_super) {
        __extends(UploaderTabView, _super);
        function UploaderTabView() {
            _super.apply(this, arguments);
        }
        /**
         * initialize()
         */
        UploaderTabView.prototype.initialize = function () {
            var url = AweBuilder.prepareAjaxParamenters('fileUpload').url;
            this.uploadURL = url;
            this.uploadedFiles = this.uploadingFiles = 0;
            this.files = [];
            this.allowedFileExtensions = 'jpeg,jpg,png,gif';
            _super.prototype.initialize.call(this);
        };
        /*
         * render tab content
         */
        UploaderTabView.prototype.renderContent = function () {
            this.$el.addClass('tab-panel ac_tabs-panel').attr('id', "tab-" + this.model.cid);
            this.$el.append("\n                <div class=\"js-upload-photo ac_panel__upload\">\n                    <form class=\"js-form-upload-photo\"  method=\"post\" enctype=\"multipart/form-data\" action=\"\">\n                    <label class=\"js-upload-photo\">\n                        <i class=\"acicon acicon-upload\"></i>\n                        <h4>" + this.translate('To Upload Photos') + "</h4>\n                        <p>" + this.translate('Drag photos from computer') + "<br>" + this.translate('or just click here') + "</p>\n                        <input class=\"js-file-input\" type=\"file\">\n                    </label>\n                    </form>\n                </div>\n                <div class=\"js-upload-items\"></div>\n            ");
            this.initDragUpload();
            return this.$el;
        };
        /**
         * init upload by drop file to upload form
         */
        UploaderTabView.prototype.initDragUpload = function () {
            var _self = this, uploadForm = jQuery('.js-upload-photo', this.$el).get(0);
            // Check browser support get drag file
            if ('draggable' in document.createElement('span')) {
                uploadForm.ondragover = function (event) {
                    event.preventDefault();
                    // add awe-drag-over to notify for user can drop file
                    jQuery(this).addClass("awe-drag-over").css('border-color', '#ddd');
                };
                uploadForm.ondragleave = function (event) {
                    event.preventDefault();
                    jQuery(this).removeClass('awe-drag-over').css('border-color', '');
                };
                uploadForm.ondrop = function (event) {
                    event.preventDefault();
                    jQuery(this).removeClass("awe-drag-over").css('border-color', '');
                    // implements upload file to server
                    if (event.dataTransfer.files.length) {
                        var files = event.dataTransfer.files;
                        for (var i = 0; i < files.length; i++) {
                            if (_self.validateFile(files[i]))
                                _self.upload(files[i]);
                            if (!_self.multiUpload)
                                break;
                        }
                    }
                };
            }
        };
        /**
         * validate upload file type
         * @param file
         * @returns {boolean}
         */
        UploaderTabView.prototype.validateFile = function (file) {
            var fileType = file.type.split('/'), extension = fileType[1] ? fileType[1] : undefined;
            return (this.allowedFileExtensions.indexOf(extension) > -1);
        };
        /**
         * declare events on upload tab
         * @returns {}
         */
        UploaderTabView.prototype.events = function () {
            return {
                'change .js-file-input': 'onFileSelect'
            };
        };
        /**
         * handle event file upload selected
         * @param event
         */
        UploaderTabView.prototype.onFileSelect = function (event) {
            var _self = this, files = event.target.files;
            for (var i = 0; i < files.length; i++) {
                if (_self.validateFile(files[i]))
                    _self.upload(files[i]);
                if (!_self.multiUpload)
                    break;
            }
        };
        /**
         * create upload progress bar for upload file
         * @param file
         * @param id
         */
        UploaderTabView.prototype.createFileProgressBar = function (file, id) {
            var $uploading = jQuery("\n                <div class=\"js-upload-item ac_loader\">\n                    <div class=\"ac_tb\">\n                        <div class=\"ac_tb-cell\">\n                            <div class=\"js-upload-preview ac_loader__image\"></div>\n                            <div class=\"ac_progress\">\n                                <div class=\"js-file-title ac_loader__name\"></div>\n                                <div class=\"ac_progress-bar\">\n                                    <div class=\"js-progress-bar ac_progress-bar__loader\" style=\"width: 0\"></div>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                </div>").attr('id', id), reader = new FileReader();
            jQuery('.js-upload-items', this.$el);
            jQuery('.js-file-title', $uploading).text(file.name);
            this.$el.find('.js-upload-photo').hide();
            this.$el.find('.js-upload-items').append($uploading);
            reader.onload = function (event) {
                jQuery('.js-upload-preview', $uploading).append(jQuery('<img />').attr('src', event.target.result));
            };
            reader.readAsDataURL(file);
        };
        /**
         * callback when file uploading
         * @param event
         * @param id
         */
        UploaderTabView.prototype.onProgress = function (event, id) {
            if (event.lengthComputable) {
                var $uploading = jQuery("#" + id, this.$el), completed = (event.loaded / event.total) * 100 | 0;
                jQuery(".js-progress-bar", $uploading).css('width', completed + "%");
            }
        };
        /**
         * process when file upload successful
         * @param id
         *      ID of upload file element in list item
         * @param status
         *      upload status
         * @param file
         *      uploaded file info when status=true
         */
        UploaderTabView.prototype.uploadFinished = function (id, status, file) {
            var $uploading = jQuery("#" + id, this.$el);
            if (status && file) {
                // add baseURL to file url
                file.url = window.AweBuilderSettings.baseURL + file.url;
                // Change file uploaded info to uploading item info
                jQuery('.js-upload-preview img', $uploading).attr('src', file.url);
                jQuery('.js-file-title', $uploading).text(file.name);
                this.files.push(file);
            }
            else
                $uploading.addClass('fail');
            this.uploadedFiles++;
            if (this.uploadedFiles === this.uploadingFiles) {
                this.model.getMediaPanel().close(undefined, this.multiUpload ? this.files : this.files[0]);
            }
        };
        /**
         * upload file to server
         * @param file
         * @param extraData
         */
        UploaderTabView.prototype.upload = function (file, extraData) {
            if (window.FormData) {
                this.uploadingFiles++;
                var form_1 = new FormData(), request = new XMLHttpRequest(), id_1 = jQuery.now();
                form_1.append('awe_file', file);
                if (extraData) {
                    jQuery.map(extraData, function (value, name) {
                        form_1.append(name, value);
                    });
                }
                //add folder upload
                var folderUpload = window.AweBuilderSettings.URLs['folderUpload'] ? window.AweBuilderSettings.URLs['folderUpload'] : '';
                form_1.append('folderUpload', folderUpload);
                // create progress bar for this file
                this.createFileProgressBar(file, id_1);
                // create request to server
                var _self_3 = this;
                request.open('POST', this.uploadURL);
                request.upload.onprogress = function (event) {
                    _self_3.onProgress(event, id_1);
                };
                request.onreadystatechange = function (event) {
                    if (event.target.readyState === 4) {
                        var response = AweBuilder.parseJSON(this.responseText.trim());
                        if (event.target.status === 200 && response && response.status && response.file)
                            _self_3.uploadFinished(id_1, true, response.file);
                        else
                            _self_3.uploadFinished(id_1, false);
                    }
                };
                request.send(form_1);
            }
        };
        /**
         * overrides activate() method
         */
        UploaderTabView.prototype.activate = function () {
            this.uploadingFiles = 0;
            this.uploadedFiles = 0;
            this.files = [];
            jQuery('.js-upload-items', this.$el).empty().hide();
            jQuery('.js-upload-photo', this.$el).show();
            var mediaPanel = this.model.getMediaPanel().model;
            this.multiUpload = mediaPanel.getMultiple();
            if (this.multiUpload)
                jQuery('.js-file-input', this.$el).attr('multiple', 'true');
            else
                jQuery('.js-file-input', this.$el).removeAttr('multiple');
        };
        return UploaderTabView;
    }(AweBuilder.TabView));
})(AweBuilder || (AweBuilder = {}));
/// <reference path="../../core/awe-panel.ts"/>
/// <reference path="../../core/awe-tabs.ts"/>
/// <reference path="../../core/awe-content-object.ts"/>
/// <reference path="media-panel.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var LibraryPaginationTab = (function (_super) {
        __extends(LibraryPaginationTab, _super);
        function LibraryPaginationTab(libraryUrl, type, numberItemOnPage, pageNumber) {
            _super.call(this);
            this.libraryUrl = libraryUrl;
            this.type = type;
            this.pageNumber = pageNumber;
            this.numberItemOnPage = numberItemOnPage;
            this.set('title', pageNumber);
        }
        LibraryPaginationTab.prototype.createView = function () {
            this.view = new LibraryPaginationTabView({ model: this });
        };
        LibraryPaginationTab.prototype.getPageNumber = function () {
            return this.pageNumber;
        };
        LibraryPaginationTab.prototype.setMediaPanel = function (view) {
            this.mediaPanel = view;
        };
        LibraryPaginationTab.prototype.getLibraryUrl = function () {
            return this.libraryUrl;
        };
        LibraryPaginationTab.prototype.getNumberItemOnPage = function () {
            return this.numberItemOnPage;
        };
        LibraryPaginationTab.prototype.getType = function () {
            return this.type;
        };
        LibraryPaginationTab.prototype.getMediaPanel = function () {
            return this.mediaPanel;
        };
        return LibraryPaginationTab;
    }(AweBuilder.Tab));
    AweBuilder.LibraryPaginationTab = LibraryPaginationTab;
    var LibraryPaginationTabView = (function (_super) {
        __extends(LibraryPaginationTabView, _super);
        function LibraryPaginationTabView() {
            _super.apply(this, arguments);
            this.isRenderContent = false;
        }
        /*
         * overrides initialize() method
         */
        LibraryPaginationTabView.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            this.template = _.template("\n                <div class=\"ac_5-col plr-10\">\n                    <div class=\"ac_panel__image\">\n                        <label>\n                            <% if(!multiple){ %>\n                            <input  name=\"file_img\" class=\"js-check-file\" type=\"radio\" value='<%= data %>'>\n                            <% } else { %>\n                            <input class=\"js-check-file\" type=\"checkbox\" value='<%= data %>'>\n                            <% } %>\n                            <div class=\"ac_img\" style=\"background-image: url('<%= url %>')\">\n                                <i class=\"acicon acicon-check\"></i>\n                            </div>\n                            <div class=\"ac_panel__image__caption\">\n                                <span><%= name %></span>\n                            </div>\n                        </label>\n                    </div>\n                </div>\n            ");
        };
        /*
         * overrides renderContent() method
         */
        LibraryPaginationTabView.prototype.renderContent = function () {
            var model = this.model;
            this.$el.addClass('tab-panel ac_tabs-panel')
                .attr('id', "tab-" + this.model.cid)
                .append('<div class="js-row-files ac_row ac_librarycontent"></div>');
            return this.$el;
        };
        /*
         * add data to content
         */
        LibraryPaginationTabView.prototype.addContent = function () {
            var _self = this, model = this.model, multiple = model.getMediaPanel().model.getMultiple(), postParams = AweBuilder.prepareAjaxParamenters('library', {
                type: model.getType(),
                user_id: 2,
                numberItemOnPage: model.getNumberItemOnPage(),
                pageNumber: model.getPageNumber()
            });
            if (!this.isRenderContent && postParams) {
                jQuery.post(postParams.url, postParams.data, function (data) {
                    for (var i = 0; i < data.length; i++) {
                        // add base url to file url
                        data[i].url = window.AweBuilderSettings.baseURL + data[i].url;
                        // render html for file in list files
                        var file = _self.template({
                            url: data[i].url,
                            name: data[i].name,
                            data: JSON.stringify(data[i]),
                            multiple: multiple
                        });
                        _self.$el.find('> .js-row-files').append(file);
                    }
                    _self.isRenderContent = true;
                }, 'json').fail(function () {
                    alert("Read files on page " + model.getPageNumber() + " fail!");
                });
            }
        };
        return LibraryPaginationTabView;
    }(AweBuilder.TabView));
    AweBuilder.LibraryPaginationTabView = LibraryPaginationTabView;
})(AweBuilder || (AweBuilder = {}));
/// <reference path="../../core/awe-panel.ts"/>
/// <reference path="../../core/awe-tabs.ts"/>
/// <reference path="../../core/awe-content-object.ts"/>
/// <reference path="media-panel.ts"/>
/// <reference path="library-pagination-tab.ts"/>
var AweBuilder;
(function (AweBuilder) {
    AweBuilder.LIBRARY_ALL = 'all';
    AweBuilder.LIBRARY_OWNER = 'myfile';
    var LibraryTab = (function (_super) {
        __extends(LibraryTab, _super);
        function LibraryTab(type) {
            _super.call(this, { type: type });
            this.numberItemOnPage = 10;
        }
        /**
         * implements custom initialize
         */
        LibraryTab.prototype.init = function (options) {
            this.libraryURL = window.AweBuilderSettings.URLs.library;
            this.type = options.type;
            if (this.type === AweBuilder.LIBRARY_ALL)
                this.set('title', 'All');
            else
                this.set('title', 'My files');
            var tabCollection = new AweBuilder.TabCollection();
            this.setPaginationCollectionPagination(tabCollection);
            var settings = {
                plugin: {
                    event: 'click',
                    active: 0,
                    activate: function (event, data) {
                        var activeTab = data.newTab ? tabCollection.get(data.newTab.attr('data-cid')) : null;
                        // add tab to list open tabs
                        if (activeTab) {
                            activeTab.getView().addContent();
                        }
                    }
                },
                view: {
                    headersPosition: 'bottom'
                }
            };
            this.set('content', new AweBuilder.Tabs({ content: tabCollection, settings: settings, title: 'Tab content list page' }));
        };
        LibraryTab.prototype.createView = function () {
            this.view = new LibraryTabView({ model: this });
        };
        LibraryTab.prototype.setMediaPanel = function (view) {
            this.mediaPanel = view;
        };
        LibraryTab.prototype.getMediaPanel = function () {
            return this.mediaPanel;
        };
        /*
         * method to set lis pagination tab
         */
        LibraryTab.prototype.setPaginationCollectionPagination = function (tabCollection) {
            var _self = this, postParams = AweBuilder.prepareAjaxParamenters('library', {
                type: _self.type,
                user_id: 2,
                numberItemOnPage: _self.numberItemOnPage
            });
            if (postParams) {
                jQuery.post(postParams.url, postParams.data, function (data) {
                    // set total pages
                    _self.totalPages = data.totalPages;
                    // create tab pagination
                    if (_self.totalPages) {
                        for (var i = 1; i <= _self.totalPages; i++) {
                            var paginationTab = new AweBuilder.LibraryPaginationTab(_self.libraryURL, _self.type, _self.numberItemOnPage, i);
                            paginationTab.setMediaPanel(_self.getMediaPanel());
                            tabCollection.add(paginationTab);
                        }
                    }
                }, 'json').fail(function () {
                    console.log('Read files fail!');
                });
            }
        };
        LibraryTab.prototype.resetPaginationCollectionPagination = function () {
            var paginationTabs = this.get('content').get('content'), model;
            // delete pagination tab
            while (model = paginationTabs.first()) {
                model.destroy();
            }
            //add new pagination tab
            this.setPaginationCollectionPagination(paginationTabs);
        };
        return LibraryTab;
    }(AweBuilder.Tab));
    AweBuilder.LibraryTab = LibraryTab;
    var LibraryTabView = (function (_super) {
        __extends(LibraryTabView, _super);
        function LibraryTabView() {
            _super.apply(this, arguments);
        }
        /*
         * overrides initialize() method
         */
        LibraryTabView.prototype.initialize = function () {
            this.footerTemplate = _.template("\n                <div class=\"js-ac_panel__footer ac_panel__footer\">\n                    <div class=\"js-btn-group btn-group\">\n                        <a href=\"#\" class=\"ac_btn js-btn-cancel ac_btn--2\">" + this.translate('Cancel') + "</a>\n                        <a href=\"#\" class=\"ac_btn js-btn-choose ac_btn--1 ac_disable\">" + this.translate('Choose') + "</a>\n                    </div>\n                </div>\n            ");
            _super.prototype.initialize.call(this);
            this.setEnableButtonChoose();
        };
        LibraryTabView.prototype.events = function () {
            return {
                "click > .js-ac-tabs .js-tab-panel .js-check-file": "setEnableButtonChoose",
                "click > .js-ac_panel__footer .js-btn-group .js-btn-cancel": "cancel",
                "click > .js-ac_panel__footer .js-btn-group .js-btn-choose": "choose"
            };
        };
        /*
         * overrides renderContent() method
         */
        LibraryTabView.prototype.renderContent = function () {
            this.$el.addClass('tab-panel ac_tabs-panel').attr('id', "tab-" + this.model.cid).empty();
            // collection tabs
            var content = this.model.get('content'), contentView;
            if (content instanceof AweBuilder.Abstract) {
                contentView = content.getView().$el;
                // remove old class tabs
                contentView.find('.js-ac-tabs-nav').removeClass('ac_tabs-nav').addClass('ac_panel__pagination');
                this.$el.append(contentView);
                this.$el.append(this.footerTemplate());
            }
            return this.$el;
        };
        LibraryTabView.prototype.cancel = function (event) {
            if (event)
                event.preventDefault();
            var mediaPanel = this.model.getMediaPanel();
            mediaPanel.close(event, '');
        };
        LibraryTabView.prototype.choose = function (event) {
            if (event)
                event.preventDefault();
            var mediaPanel = this.model.getMediaPanel(), selectedFile = [], multiple = mediaPanel.model.getMultiple();
            if (multiple) {
                //selectedFile is array object
                this.$el.find('.js-check-file:checked').each(function () {
                    selectedFile.push(AweBuilder.parseJSON(jQuery(this).val()));
                });
            }
            else {
                //selectedFile is one object
                selectedFile = AweBuilder.parseJSON(this.$el.find('.js-check-file:checked').val());
            }
            mediaPanel.close(event, selectedFile);
        };
        LibraryTabView.prototype.setEnableButtonChoose = function () {
            var buttonChoose = this.$el.find('.js-btn-choose');
            if (this.$el.find('.js-check-file:checked').length)
                buttonChoose.removeClass('ac_disable');
            else
                buttonChoose.addClass('ac_disable');
        };
        return LibraryTabView;
    }(AweBuilder.TabView));
})(AweBuilder || (AweBuilder = {}));
/// <reference path="../../core/awe-panel.ts"/>
/// <reference path="../../core/awe-tabs.ts"/>
/// <reference path="../../core/awe-content-object.ts"/>
/// <reference path="../../core/awe-form-elements.ts"/>
/// <reference path="upload-tab.ts"/>
/// <reference path="library-tab.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var MediaPanel = (function (_super) {
        __extends(MediaPanel, _super);
        function MediaPanel() {
            var tabCollection = new AweBuilder.TabCollection();
            tabCollection.add(new AweBuilder.UploaderTab());
            tabCollection.add(new AweBuilder.LibraryTab(AweBuilder.LIBRARY_ALL));
            tabCollection.add(new AweBuilder.LibraryTab(AweBuilder.LIBRARY_OWNER));
            var settings = { hideDefault: true, position: 'center', hasOverlay: true, enableDrag: false }, styleItemsTabsSettings = {
                plugin: {
                    event: 'click',
                    active: 0,
                    activate: function (event, data) {
                        var activeTab = data.newTab ? tabCollection.get(data.newTab.attr('data-cid')) : null;
                        // add tab to list open tabs
                        if (activeTab) {
                            if (activeTab instanceof AweBuilder.LibraryTab) {
                                var tabPaginations = activeTab.get('content').get('content');
                                if (tabPaginations.length)
                                    tabPaginations.at(0).getView().addContent();
                            }
                        }
                    }
                },
                view: {
                    headersPosition: 'top'
                }
            };
            _super.call(this, {
                title: 'Media Manager',
                content: new AweBuilder.Tabs({
                    content: tabCollection,
                    title: 'Tab content',
                    settings: styleItemsTabsSettings
                }),
                settings: settings
            });
            this.multiple = false;
            this.allowClose = true;
            var view = this.view;
            tabCollection.each(function (tab, key) {
                tab.setMediaPanel(view);
            });
        }
        MediaPanel.prototype.createView = function () {
            this.view = new MediaPanelView({ model: this });
        };
        MediaPanel.prototype.setMultiple = function (value) {
            this.multiple = value;
        };
        MediaPanel.prototype.getMultiple = function () {
            return this.multiple;
        };
        MediaPanel.prototype.getAllowClose = function () {
            return this.allowClose;
        };
        MediaPanel.prototype.setAllowClose = function (value) {
            this.allowClose = value;
        };
        return MediaPanel;
    }(AweBuilder.Panel));
    AweBuilder.MediaPanel = MediaPanel;
    var MediaPanelView = (function (_super) {
        __extends(MediaPanelView, _super);
        function MediaPanelView() {
            _super.apply(this, arguments);
        }
        /**
        * init view
        */
        MediaPanelView.prototype.initialize = function () {
            this.template = _.template("\n                <div class=\"ac_panel__overlay\"></div>\n                <div class=\"js-panel-inner ac_panel__inner\">\n                    <div class=\"js-ac-panel-header ac_panel__header\">\n                        <h2 class=\"ac_panel__title\"><%= title %></h2>\n                        <a href=\"#\" class=\"js-ac-panel-close ac_panel__close\"><i class=\"acicon acicon-close\"></i></a>                    </div>\n                    <div class=\"js-ac-panel-body ac_panel__body\"><div class=\"js-body-panel-content pd20\"></div></div>                </div>");
            // implement render content for view
            this.render();
        };
        MediaPanelView.prototype.renderContent = function () {
            // render panel wrapper
            this.$el.addClass('ac_mediapanel').css({ 'width': '700px' });
            // render content view
            var content = this.model.get('content'), contentView = content.getView().$el;
            if (contentView) {
                //remove old class, add new class of tabs
                contentView.removeClass('ac_tabs').addClass('ac_tab-item ac_tab-item--2');
                contentView.find('> .tabs-nav').removeClass('ac_tabs-nav ').addClass('ac_tab-item__nav');
                contentView.find('> .js-tabs-content > .js-tab-panel').removeClass('ac_tabs-panel');
                jQuery('> .js-panel-inner > .js-ac-panel-body .js-body-panel-content', this.$el).append(contentView);
            }
        };
        MediaPanelView.prototype.open = function (controller) {
            _super.prototype.open.call(this);
            // set controller object
            this.controller = controller;
            // reset library tabs
            this.resetLibraryTab();
            // active first tab in media panel
            this.model.get('content').getView().activateTab(0);
            // set allow close panel flag
            this.model.setAllowClose(true);
        };
        MediaPanelView.prototype.close = function (event, selectedFile) {
            var allowClose = this.model.getAllowClose() === undefined || this.model.getAllowClose();
            if (allowClose) {
                _super.prototype.close.call(this, event);
                if (selectedFile) {
                    // return array of object file when media panel allow multiple files
                    if (jQuery.type(selectedFile) === 'object' && this.model.getMultiple())
                        selectedFile = [selectedFile];
                    this.controller.setValue(selectedFile);
                }
            }
        };
        /*
         * method to reset library tabs when user upload some images
         */
        MediaPanelView.prototype.resetLibraryTab = function () {
            var libraryTabs = this.model.get('content').get('content');
            libraryTabs.each(function (tab, key) {
                if (tab instanceof AweBuilder.LibraryTab)
                    tab.resetPaginationCollectionPagination();
            });
        };
        return MediaPanelView;
    }(AweBuilder.PanelView));
    AweBuilder.MediaPanelView = MediaPanelView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: abstract.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * created: 05/10/2016
 */
/// <reference path="../../ts-libraries/jquery.d.ts" />
/// <reference path="../../ts-libraries/spectrum.d.ts" />
/// <reference path="./awe-core.ts" />
/// <reference path="../panels/media/media-panel.ts" />
var AweBuilder;
(function (AweBuilder) {
    var elementNumber = 1;
    var ElAbstract = (function () {
        function ElAbstract(options) {
            if (options !== undefined) {
                if (options.el !== undefined && jQuery.type(options.el) === 'string')
                    this.$el = jQuery(options.el);
                else if (options.$el !== undefined && options.$el instanceof jQuery)
                    this.$el = options.$el;
            }
            if (this.$el === undefined)
                this.$el = jQuery('<div />');
            // set element id
            this.cid = elementNumber;
            this.id = "el-" + elementNumber;
            elementNumber++;
            this.$el.attr('id', this.id).addClass(this.id);
            // add custom classes
            if (options !== undefined && jQuery.type(options.className) === 'string')
                this.$el.addClass(options.className);
            // set mediaPanel property
            if (options !== undefined && options.mediaPanel instanceof AweBuilder.MediaPanelView) {
                this.mediaPanel = options.mediaPanel;
            }
        }
        /**
         * translate method
         */
        ElAbstract.prototype.translate = function (text) {
            return window.aweTranslate(text);
        };
        /**
         * set media panel view object
         */
        ElAbstract.prototype.setMediaPanel = function (mediaPanel) {
            this.mediaPanel = mediaPanel;
        };
        /**
         * get media panel view object
         */
        ElAbstract.prototype.getMediaPanel = function () {
            return this.mediaPanel;
        };
        return ElAbstract;
    }());
    /**
     * Define class form contains elements
     */
    var AweForm = (function (_super) {
        __extends(AweForm, _super);
        /**
         * constructor method
         * @param {Object}        elements: data of list element in form
         * @param {string}        selector: parent selector in settings of active model for element in form
         * @param {ElBaseOptions} options: options to render form
         */
        function AweForm(elements, selector, options) {
            _super.call(this, options);
            this.selector = selector;
            this.elements = {};
            this.render(elements);
        }
        /**
         * render form content
         */
        AweForm.prototype.render = function (elements) {
            var _self = this;
            // add ac_row wrapper
            this.$el.append('<div class="js-row ac_row"></div>');
            this.$wrapper = jQuery('> .js-row', _self.$el);
            jQuery.map(elements, function (elOpts, settingName) {
                // add selector for element options
                elOpts.selector = _self.selector + "." + settingName;
                elOpts.name = settingName;
                // add mediaPanel to element option
                elOpts.mediaPanel = _self.mediaPanel;
                // create element object
                var element = AweForm.createElement(elOpts, _self);
                if (element) {
                    // add html of element to form
                    if (elOpts.type !== 'storage')
                        _self.$wrapper.append(element.$el);
                    // add element object to list elements
                    _self.elements[settingName] = element;
                }
            });
            // stop mouse down event on span to implement content editable
            jQuery('span', this.$el).mousedown(function (event) {
                event.stopPropagation();
            });
            this.$el.addClass('elements-form').trigger('form-ready');
        };
        /**
         * set active model
         */
        AweForm.prototype.update = function (activeModel, responsiveMode, state, selector) {
            jQuery.map(this.elements, function (element, keyName) {
                element.update(activeModel, responsiveMode, state, selector);
            });
        };
        /**
         * get elements object in form
         */
        AweForm.prototype.getElements = function () {
            return this.elements;
        };
        /**
         * get element object
         */
        AweForm.prototype.getElement = function (elSelector) {
            if (jQuery.type(elSelector) === 'string') {
                var container_1 = this.elements, changeElement_1 = undefined;
                // process selector for change element
                jQuery.each(elSelector.split('.'), function (index, name) {
                    if (container_1 && container_1[name]) {
                        changeElement_1 = container_1[name];
                        if (container_1[name].elements)
                            container_1 = container_1[name].elements;
                        else
                            container_1 = undefined;
                    }
                    else {
                        container_1 = undefined;
                        changeElement_1 = undefined;
                    }
                });
                return changeElement_1;
            }
        };
        /**
         * create element object from meta data
         * @param  {ElementFormOpts} options: data to create new element form object
         * @param  {AweForm}         elForm: form object which contains this element
         * @return {ElementForm}
         */
        AweForm.createElement = function (options, elForm) {
            if (options.type && AweForm.elementsMap[options.type] !== undefined) {
                var elementClass = AweForm.elementsMap[options.type];
                return eval("new " + elementClass + "(options, elForm)");
            }
        };
        /**
         * get values of elements form
         */
        AweForm.prototype.getFormValues = function (elName) {
            var values = {};
            jQuery.map(this.elements, function (el, name) {
                var elValue = el.getValue();
                if (el instanceof AweGroup && el.getOptions().useParentKey)
                    values = jQuery.extend(true, {}, values, elValue);
                else
                    values[name] = el.getValue();
            });
            // get value of specify element
            if (elName !== undefined)
                return values[elName];
            return values;
        };
        /**
         * set value for elements form
         */
        AweForm.prototype.setFormValues = function (values) {
            if (jQuery.type(values) === 'object') {
                var _self_4 = this;
                jQuery.map(values, function (val, key) {
                    _self_4.elements[key].setValue(val);
                });
            }
        };
        /**
         * reset form element to default values
         */
        AweForm.prototype.reset = function () {
            jQuery.map(this.elements, function (el, name) {
                el.resetToDefault();
            });
        };
        /**
         * overrides setMediaPanel() method
         */
        AweForm.prototype.setMediaPanel = function (mediaPanel) {
            // implements parent method
            _super.prototype.setMediaPanel.call(this, mediaPanel);
            // set mediaPanel for element
            jQuery.map(this.elements, function (element, name) {
                element.setMediaPanel(mediaPanel);
            });
        };
        AweForm.elementsMap = {
            markup: 'AweMarkup',
            input: 'AweInput',
            textarea: 'AweTextarea',
            toggle: 'AweToggle',
            select: 'AweSelect',
            checklist: 'AweChecklist',
            checkboxes: 'AweCheckboxes',
            radios: 'AweRadios',
            group: 'AweGroup',
            icon: 'AweIcon',
            colorpicker: 'AweColor',
            ranger: 'AweRanger',
            borderbox: 'AweBorderbox',
            fileselector: 'AweFileSelector',
            constraint: 'AweConstraint',
            storage: 'AweStorage',
            order: 'AweOrder',
            attributes: 'AweAttributes'
        };
        return AweForm;
    }(ElAbstract));
    AweBuilder.AweForm = AweForm;
    var ElementForm = (function (_super) {
        __extends(ElementForm, _super);
        /**
         * constructor function
         */
        function ElementForm(options, elForm) {
            // implements parent constructor
            _super.call(this, options);
            // init default value for responsive mode
            this.responsiveMode = AweBuilder.RES_XL;
            // set elForm property
            this.elForm = elForm;
            if (options !== undefined) {
                // process settings
                this.validateOptions(options);
                // set options property
                this.options = options;
                // process class name
                this.classes = options.inlineTitle ? 'ac_panel-item-general ac_panel-item-general--2' : 'ac_panel-item-general';
                // implements initialize()
                this.initialize(options);
                // set current value is default value
                this.value = this.defaultValue;
                // add width number class
                var widthNumber = options.widthNumber !== undefined ? options.widthNumber : 1;
                if (widthNumber !== false)
                    this.$el.addClass("ac_" + widthNumber + "-col");
                this.$el.addClass("el-" + options.type);
                // add class define element name
                var selectorName = options.selector.split('.'), name_1 = selectorName.pop();
                this.$el.addClass("el-" + name_1);
                // implements render element
                this.render(options);
                // render custom styles
                this.renderCustomStyles(options);
                // implements init events in element
                this.initEvents();
            }
            else {
                throw Error('You could not create element with empty settings.');
            }
        }
        /**
         * validate settings for element
         */
        ElementForm.prototype.validateOptions = function (options) {
            if (options.changeTo !== undefined && jQuery.type(options.changeTo) !== 'string' && !(options.changeTo instanceof Array))
                throw Error('changeTo option only accept string or Array of string type.');
            if (options.listenChange && jQuery.type(options.listenChange) !== 'function')
                throw Error('listenChange only accept function type');
            else {
                this.listenChange = options.listenChange;
            }
        };
        /**
         * initialize()
         */
        ElementForm.prototype.initialize = function (options) {
            // set default value
            if (options.defaultValue !== undefined)
                this.defaultValue = options.defaultValue;
            // process title options
            if (options.title === undefined)
                options.title = '';
            // init default value for save data flag
            if (options.alwaysSave === undefined)
                options.alwaysSave = false;
            // save change to option property
            this.options = options;
        };
        /**
         * render element content
         */
        ElementForm.prototype.render = function (options) { };
        /**
         * render custom styles option
         */
        ElementForm.prototype.renderCustomStyles = function (options) {
            if (options.customStyles) {
                var _self_5 = this;
                jQuery.map(options.customStyles, function (styles, selector) {
                    jQuery(selector, _self_5.$el).css(styles);
                });
            }
        };
        /**
         * set active model
         */
        ElementForm.prototype.update = function (activeModel, responsiveMode, state, parentSelector) {
            // update selector
            this.updateSelector(parentSelector);
            this.state = state;
            // update responsive mode
            var machineName = activeModel ? activeModel.getMachineName() : '', defaultSettings = machineName ? AweBuilder.ContentObject.generateObjectSettings(machineName) : undefined, defaultValue = defaultSettings ? activeModel.getSettingsAttr(this.options.selector, defaultSettings) : undefined;
            this.responsiveMode = (jQuery.type(defaultValue) === 'object' && defaultValue[responsiveMode] !== undefined) ? responsiveMode : undefined;
            // update active model
            this.updateActiveModel(activeModel, (responsiveMode !== AweBuilder.RES_XL && this.responsiveMode === undefined));
        };
        /**
         * update selector option
         */
        ElementForm.prototype.updateSelector = function (parentSelector) {
            if (jQuery.type(parentSelector) === 'string') {
                var selector = this.options.selector.split('.'), name_2 = selector.pop();
                this.options.selector = parentSelector + "." + name_2;
            }
        };
        /**
         * update active model to element
         */
        ElementForm.prototype.updateActiveModel = function (activeModel, disableElement) {
            // disable element by default
            this.$el.addClass('ac_disable');
            // set active model
            this.activeModel = activeModel;
            // implements change value of element
            var selector = this.getSelector();
            if (activeModel && selector) {
                var modelType = activeModel.getMachineName(), defaultSettings = AweBuilder.ContentObject.generateObjectSettings(modelType), defaultValue = activeModel.getSettingsAttr(selector, defaultSettings), value = activeModel.getSettingsAttr(selector);
                // set state of element in this object type
                if (defaultValue !== undefined) {
                    value = (value !== undefined) ? value : this.getElementDefaultValue();
                    if (!disableElement)
                        this.$el.removeClass('ac_disable');
                    this.changeElementValue(value);
                    this.value = value;
                    this.$el.trigger('change', { current: value, updateModel: true });
                }
            }
        };
        /**
         * initialize event handle on element
         */
        ElementForm.prototype.initEvents = function () {
            var _self = this;
            // handle change event on this element
            this.$el.change(function (event, values) {
                event.stopPropagation();
                if (values !== undefined)
                    _self.execChangeCallback(values);
            });
            // implements others event handler
            this.events();
        };
        /**
         * implements events handler for element
         */
        ElementForm.prototype.events = function () {
        };
        /**
         * get selector of attribute setting
         */
        ElementForm.prototype.getSelector = function (withoutDisplayMode) {
            return this.responsiveMode && !withoutDisplayMode ? this.options.selector + "." + this.responsiveMode : this.options.selector;
        };
        /**
         * update active model settings
         */
        ElementForm.prototype.updateModelSetting = function (inlineCss) {
            var selector = this.getSelector();
            if (selector && this.activeModel) {
                var machineName = this.activeModel.getMachineName(), defaultSettings = AweBuilder.ContentObject.generateObjectSettings(machineName), defaultValue = this.activeModel.getSettingsAttr(selector, defaultSettings);
                if (defaultValue !== undefined) {
                    var dependenciesValue = this.getElementDefaultValue(), deleteDefault = this.options.alwaysSave ? false : (this.value === dependenciesValue);
                    this.activeModel.setSettingsAttr(selector, this.value, { delete: deleteDefault });
                }
            }
        };
        /**
         * get default value by state and responsive mode
         */
        ElementForm.prototype.getElementDefaultValue = function () {
            var responsiveModes = [AweBuilder.RES_XS, AweBuilder.RES_SM, AweBuilder.RES_MD, AweBuilder.RES_LG, AweBuilder.RES_XL], activeModel = this.activeModel, selector = this.getSelector(), defaultValue;
            if (selector && activeModel) {
                var machineName = activeModel.getMachineName(), state = this.state, resMode = this.responsiveMode, checkModes = resMode ? responsiveModes.slice(responsiveModes.indexOf(resMode) + 1) : undefined;
                if (this.options.compareWithDefault === false) {
                    // get default value base on mode
                    if (checkModes && checkModes.length > 0) {
                        var resModeValue = void 0;
                        for (var i = 0; i < checkModes.length; i++) {
                            resModeValue = activeModel.getSettingsAttr(selector.replace("." + resMode, "." + checkModes[i]));
                            if (resModeValue !== undefined) {
                                defaultValue = resModeValue;
                                break;
                            }
                        }
                    }
                    // get default value base on normal state
                    if (defaultValue === undefined && !(resMode === AweBuilder.RES_XL && state === AweBuilder.STYLE_NORMAL)) {
                        var defaultSelector = selector;
                        if (resMode)
                            defaultSelector = defaultSelector.replace("." + resMode, "." + AweBuilder.RES_XL);
                        if (state)
                            defaultSelector = defaultSelector.replace("." + state + ".", "." + AweBuilder.STYLE_NORMAL + ".");
                        defaultValue = activeModel.getSettingsAttr(defaultSelector);
                    }
                }
                // get default value in default settings
                if (defaultValue === undefined) {
                    var defaultSettings = AweBuilder.ContentObject.generateObjectSettings(machineName);
                    defaultValue = activeModel.getSettingsAttr(selector, defaultSettings);
                }
            }
            return defaultValue;
        };
        /**
         * set value for element
         */
        ElementForm.prototype.changeElementValue = function (value) {
        };
        /**
         * get current value of element
         */
        ElementForm.prototype.getValue = function () {
            return this.value;
        };
        /**
         * set value for element
         */
        ElementForm.prototype.setValue = function (value, extraData) {
            if (value !== undefined && this.execValidateCallback(value)) {
                var beforeValue = this.value, eventValue_1 = { current: value, prev: beforeValue };
                // update attribute setting for active model
                this.value = value;
                if (extraData && extraData.inlineCss !== undefined && typeof extraData.inlineCss === 'boolean') {
                    this.updateModelSetting(extraData.inlineCss);
                    delete extraData.inlineCss;
                }
                else
                    this.updateModelSetting();
                // update view
                if (extraData === undefined || (extraData && extraData.updateElement !== false)) {
                    this.changeElementValue(value);
                    if (extraData !== undefined)
                        delete extraData.updateElement;
                }
                // implement custom change callback
                eventValue_1 = jQuery.extend(true, eventValue_1, extraData);
                this.$el.trigger('change', eventValue_1);
                if (this.options.changeTo !== undefined) {
                    var _self_6 = this, changedElements = jQuery.type(this.options.changeTo) === 'array' ? this.options.changeTo : [this.options.changeTo];
                    jQuery.each(changedElements, function (id, elName) {
                        var changeElement = _self_6.elForm.getElement(elName);
                        if (changeElement && jQuery.type(changeElement.listenChange) === 'function') {
                            changeElement.listenChange(_self_6.options.name, eventValue_1, _self_6.elForm);
                        }
                    });
                }
            }
        };
        /**
         * implement change callback
         */
        ElementForm.prototype.execChangeCallback = function (values) {
            var view = this.activeModel ? this.activeModel.getView() : null, el = view ? view.el : undefined;
            if (jQuery.type(this.options.change) === 'function') {
                var $form = this.elForm ? this.elForm.$el : undefined;
                this.options.change($form, el, values, this.activeModel, this.elForm);
            }
        };
        /**
         * call validate option callback
         */
        ElementForm.prototype.execValidateCallback = function (value) {
            if (jQuery.type(this.options.validate) === 'function') {
                if (this.options.validate(value) === false) {
                    this.changeElementValue(this.value);
                    return false;
                }
            }
            return true;
        };
        /**
         * set Form property
         */
        ElementForm.prototype.setElForm = function (elForm) {
            this.elForm = elForm;
        };
        /**
         * get Form property
         */
        ElementForm.prototype.getElForm = function () {
            return this.elForm;
        };
        /**
         * reset element value to default value
         */
        ElementForm.prototype.resetToDefault = function () {
            this.setValue(this.defaultValue);
        };
        /**
         * get options of element
         */
        ElementForm.prototype.getOptions = function () {
            return this.options;
        };
        /**
         * get default value of element
         */
        ElementForm.getDefaultValue = function (options, parentData, name) {
            var output;
            if (options.devices === false) {
                output = options.defaultValue;
            }
            else {
                if (options.devices === undefined || options.devices === 'all') {
                    output = {};
                    output[AweBuilder.RES_XL] = options.defaultValue;
                    output[AweBuilder.RES_LG] = options.defaultValue;
                    output[AweBuilder.RES_MD] = options.defaultValue;
                    output[AweBuilder.RES_SM] = options.defaultValue;
                    output[AweBuilder.RES_XS] = options.defaultValue;
                }
                else if (jQuery.type(options.devices) === 'array') {
                    output = {};
                    jQuery.each(options.devices, function () {
                        output[this] = options.defaultValue;
                    });
                }
            }
            parentData[name] = output;
            return output;
        };
        return ElementForm;
    }(ElAbstract));
    AweBuilder.ElementForm = ElementForm;
    var AweMarkup = (function (_super) {
        __extends(AweMarkup, _super);
        function AweMarkup() {
            _super.apply(this, arguments);
        }
        /**
         * overrides validate method
         */
        AweMarkup.prototype.validateOptions = function (opts) {
            // implement parent method
            _super.prototype.validateOptions.call(this, opts);
            // validate markup value
            if (!opts.markup)
                throw Error('You must pass html string for markup element type.');
        };
        /**
         * overrides render() method
         */
        AweMarkup.prototype.render = function (opts) {
            // add markup string to element content
            this.$el.append(opts.markup);
            // implements custom init callback
            if (typeof opts.init)
                opts.init(this);
        };
        return AweMarkup;
    }(ElementForm));
    AweBuilder.AweMarkup = AweMarkup;
    var AweInput = (function (_super) {
        __extends(AweInput, _super);
        function AweInput() {
            _super.apply(this, arguments);
            this.defaultValue = '';
        }
        /**
         * implements initialize() method
         */
        AweInput.prototype.initialize = function (options) {
            _super.prototype.initialize.call(this, options);
            this.template = _.template("\n                <div class=\"<%= classes %>\">\n                    <label>\n                        <span class=\"ac_panel-item-general__title\"><%= title %></span>\n                        <div class=\"ac_panel-item-general__content ac_inputtext\">\n                            <input type=\"text\" value=\"<%= defaultValue %>\">\n                        </div>\n                    </label>\n                </div>");
        };
        /**
         * overrides render() method
         */
        AweInput.prototype.render = function (options) {
            this.$el.append(this.template({
                title: this.translate(options.title),
                defaultValue: options.defaultValue,
                classes: this.classes
            }));
        };
        /**
         * overrides changeElementValue() method
         */
        AweInput.prototype.changeElementValue = function (value) {
            this.$el.find('input').val(value);
        };
        /**
         * overrides initEvents() method
         */
        AweInput.prototype.events = function () {
            var _self = this, waitStopTyping = -1;
            // handle event on input tag
            jQuery('input', this.$el).change(function (event) {
                event.stopPropagation();
                _self.setValue(jQuery(this).val(), { updateElement: false });
            }).blur(function (event) {
                event.stopPropagation();
                var value = jQuery('input', _self.$el).val();
                if (value !== _self.value)
                    _self.setValue(value);
            }).keyup(function (event) {
                // clear wait stop type timer
                if (waitStopTyping > 0)
                    clearTimeout(waitStopTyping);
                // process key code
                var $input = jQuery(this), keycode = event.which || event.keyCode;
                if (keycode === 13)
                    $input.trigger('blur');
                else {
                    waitStopTyping = setTimeout(function () {
                        $input.trigger('change');
                    }, 200);
                }
            });
        };
        return AweInput;
    }(ElementForm));
    AweBuilder.AweInput = AweInput;
    var AweToggle = (function (_super) {
        __extends(AweToggle, _super);
        function AweToggle() {
            _super.apply(this, arguments);
            this.defaultValue = false;
        }
        /**
         * implements initialize() method
         */
        AweToggle.prototype.initialize = function (options) {
            _super.prototype.initialize.call(this, options);
            this.template = _.template("\n                <div class=\"ac_panel-item-general ac_panel-item-general--2\">\n                    <label>\n                        <span class=\"ac_panel-item-general__title\"><%= title %></span>\n                        <div class=\"ac_panel-item-general__content\">\n                            <div class=\"ac_panel-item-general__content-right\">\n                                <div class=\"radio-icon\">\n                                    <input type=\"checkbox\" checked=\"<%= checked %>\">\n                                    <span class=\"radio-style\"></span>\n                                </div>\n                            </div>\n                        </div>\n                    </label>\n                </div>");
        };
        /**
         * overrides render() method
         */
        AweToggle.prototype.render = function (options) {
            var elContent = this.template({
                title: this.translate(options.title),
                checked: options.defaultValue
            });
            if (options.withoutWrapper)
                this.$el.html(elContent);
            else
                this.$el.append(elContent);
        };
        /**
         * overrides changeElementValue() method
         */
        AweToggle.prototype.changeElementValue = function (value) {
            if (value == 1 || value == true) {
                jQuery("input[type=checkbox]", this.$el).prop("checked", true);
            }
            else {
                jQuery("input[type=checkbox]", this.$el).prop("checked", false);
            }
        };
        /**
         * overrides initEvents() method
         */
        AweToggle.prototype.events = function () {
            var _self = this;
            jQuery("input[type=checkbox]", _self.$el).change(function (event) {
                _self.setValue(this.checked);
            });
        };
        return AweToggle;
    }(ElementForm));
    AweBuilder.AweToggle = AweToggle;
    var AweTextarea = (function (_super) {
        __extends(AweTextarea, _super);
        function AweTextarea() {
            _super.apply(this, arguments);
            this.defaultValue = '';
        }
        /**
         * implements initialize() method
         */
        AweTextarea.prototype.initialize = function (options) {
            _super.prototype.initialize.call(this, options);
            this.fireEvent = options.fireEvent ? options.fireEvent : 'keyup';
            var sizeClass = "";
            if (options && options.size !== undefined)
                sizeClass = " ac_textarea--" + options.size;
            this.template = _.template("\n                <div class=\"ac_panel-item-general\">\n                    <label>\n                        <span class=\"ac_panel-item-general__title\"><%= title %></span>\n                        <div class=\"js-awe-textarea ac_panel-item-general__content ac_textarea" + sizeClass + "\">\n                            <textarea><%= defaultValue %></textarea>\n                        </div>\n                    </label>\n                </div>");
        };
        /**
         * overrides render() method
         */
        AweTextarea.prototype.render = function (options) {
            this.$el.append(this.template({
                title: this.translate(options.title),
                defaultValue: options.defaultValue
            }));
        };
        /**
         * overrides changeElementValue() method
         */
        AweTextarea.prototype.changeElementValue = function (value) {
            this.$el.find('.js-awe-textarea textarea').val(value);
        };
        /**
         * overrides initEvents() method
         */
        AweTextarea.prototype.events = function () {
            var _self = this, $el = this.$el;
            this.$el.delegate('.js-awe-textarea > textarea', this.fireEvent, function (event) {
                _self.setValue(jQuery(this).val());
            });
            jQuery(document).click(function (event) {
                if (jQuery(event.target).closest(jQuery('.js-awe-textarea > textarea', $el)).length === 0)
                    $el.trigger('blur');
            });
        };
        return AweTextarea;
    }(ElementForm));
    AweBuilder.AweTextarea = AweTextarea;
    var AweSelect = (function (_super) {
        __extends(AweSelect, _super);
        function AweSelect() {
            _super.apply(this, arguments);
        }
        /**
         * implements initialize() method
         */
        AweSelect.prototype.initialize = function (options) {
            // set default value
            if (options.defaultValue === undefined)
                options.defaultValue = Object.keys(options.options)[0];
            _super.prototype.initialize.call(this, options);
            this.template = _.template("\n                <div class=\"<%= classes %>\">\n                    <label>\n                        <span class=\"ac_panel-item-general__title\"><%= title %></span>\n                        <div class=\"ac_panel-item-general__content ac_select-list\">\n                            <span class=\"val\">\n                                <span><%= defaultText %></span>\n                                <i class=\"acicon acicon-triangle-down\"></i>\n                            </span>\n                            <ul class=\"option-list\"></ul>\n                        </div>\n                    </label>\n                </div>");
            this.opts = options.options !== undefined ? options.options : {};
        };
        /**
         * overrides validate options
         */
        AweSelect.prototype.validateOptions = function (options) {
            _super.prototype.validateOptions.call(this, options);
            if (options.options === undefined && options.ajax === undefined)
                throw Error("You must define options or ajax url to get options for select element.");
        };
        /**
         * overrides render() method
         */
        AweSelect.prototype.render = function (options) {
            var _self = this;
            // render element options
            var optsProperties = Object.keys(this.opts), defaultStringVal = this.opts[options.defaultValue] !== undefined ? this.opts[options.defaultValue] : (optsProperties.length ? this.opts[optsProperties[0]] : '');
            this.$el.append(this.template({
                title: options.title,
                defaultText: defaultStringVal,
                classes: this.classes
            }));
            // render select options
            this.renderElementFormOpts();
            // get ajax options
            if (options.ajax) {
                var ajaxURL = jQuery.type(options.ajax) === 'function' ? options.ajax() : options.ajax, extraData = { requestAction: 'getSelectAjaxOptions' };
                if (jQuery.type(ajaxURL) === 'object') {
                    if (ajaxURL.extraData !== undefined)
                        extraData = jQuery.extend(true, {}, extraData, ajaxURL.extraData);
                    if (ajaxURL.url !== undefined)
                        ajaxURL = ajaxURL.url;
                    else
                        ajaxURL = '';
                }
                if (ajaxURL) {
                    jQuery.post(ajaxURL, extraData, function (response) {
                        if (options.ajaxSuccess) {
                            options.ajaxSuccess(response, _self);
                        }
                    });
                }
            }
        };
        /**
         * render element options
         */
        AweSelect.prototype.renderElementFormOpts = function () {
            var _self = this;
            jQuery('ul.option-list', _self.$el).empty();
            jQuery.map(this.opts, function (title, value) {
                var $option = jQuery('<li></li>');
                $option.html(title);
                $option.attr('data-val', value);
                jQuery('ul.option-list', _self.$el).append($option);
            });
        };
        /**
         * overrides changeElementValue() method
         */
        AweSelect.prototype.changeElementValue = function (value) {
            var optsProperties = Object.keys(this.opts), displayText = optsProperties.length ? this.opts[optsProperties[0]] : '';
            if (jQuery.inArray(value, optsProperties) > -1) {
                displayText = this.opts[value];
            }
            jQuery('span.val > span', this.$el).text(displayText);
        };
        /**
         * overrides initEvents() method
         */
        AweSelect.prototype.events = function () {
            var _self = this;
            // init click to show options
            this.$el.click(function (event) {
                event.preventDefault();
                if (!jQuery(this).hasClass('ac_disable')) {
                    var $optionsList = jQuery('ul.option-list', _self.$el);
                    if ($optionsList.hasClass('js-active')) {
                        $optionsList.removeClass('js-active').hide();
                    }
                    else {
                        $optionsList.addClass('js-active').show();
                    }
                }
            });
            this.$el.delegate('ul.option-list > li', 'click', function (event) {
                event.preventDefault();
                // remove previous selected class
                jQuery('li.js-selected', jQuery(this).parent()).removeClass('js-selected');
                // set selected value
                var value = jQuery(this).addClass('js-selected').attr('data-val');
                jQuery('.ac_select-list > span > span', _self.$el).text(_self.opts[value]);
                _self.setValue(value);
            });
            jQuery(document).click(function (event) {
                if (jQuery(event.target).closest(_self.$el).length === 0) {
                    var $optionsList = jQuery('ul.option-list', _self.$el);
                    if ($optionsList.hasClass('js-active')) {
                        $optionsList.removeClass('js-active').hide();
                    }
                }
            });
        };
        /**
         * set options for elements
         */
        AweSelect.prototype.setOptions = function (options) {
            this.opts = options;
            this.renderElementFormOpts();
            // change default value is first value
            this.changeElementValue(Object.keys(options)[0]);
        };
        return AweSelect;
    }(ElementForm));
    AweBuilder.AweSelect = AweSelect;
    var AweCheckboxes = (function (_super) {
        __extends(AweCheckboxes, _super);
        function AweCheckboxes() {
            _super.apply(this, arguments);
            this.defaultValue = [];
        }
        /**
         * overrides validateOptions() method
         */
        AweCheckboxes.prototype.validateOptions = function (options) {
            // process title
            if (options.title === undefined)
                options.title = '';
            // implements parent method
            _super.prototype.validateOptions.call(this, options);
            // validate options of element
            if (jQuery.type(options.options) !== 'object')
                throw Error('You must define options for checkboxes element.');
        };
        /**
         * overrides initialize() method
         */
        AweCheckboxes.prototype.initialize = function (options) {
            // implements parent method
            _super.prototype.initialize.call(this, options);
            // set template
            this.template = _.template("\n                <div class=\"ac_panel-item-general-group\">\n                    <span class=\"ac_panel-item-general-group__title\">" + this.translate('<%= title %>') + "</span>\n                    <% _.map(options, function(opTitle, opName) { %>\n                    <div class=\"ac_panel-item-general ac_panel-item-general--2\">\n                        <label>\n                            <span class=\"ac_panel-item-general__title\">" + this.translate('<%= opTitle %>') + "</span>\n                            <div class=\"ac_panel-item-general__content\">\n                                <div class=\"ac_panel-item-general__content-right\">\n                                    <div class=\"checkbox-button\">\n                                        <input type=\"checkbox\" data-name=\"<%= opName %>\">\n                                        <span class=\"checkbox-style\"><i class=\"acicon acicon-check\"></i></span>\n                                    </div>\n                                </div>\n                            </div>\n                        </label>\n                    </div>\n                    <% }) %>\n                </div>\n            ");
            if (options.widget === 'button') {
                // set template
                this.template = _.template("\n                    <div class=\"ac_panel-item-general-group\">\n                        <span class=\"ac_panel-item-general-group__title\">" + this.translate('<%= title %>') + "</span>\n                        <% _.map(options, function(op, name) { %>\n                        <div class=\"ac_check-item\">\n                            <label>\n                                <input type=\"checkbox\" data-name=\"<%= name %>\">\n                                <span<% if(op.classes) { %> class=\"<%= op.classes %>\"<% } %><% if(op.title) { %> class=\"<%= op.title %>\"<% } %>><%= op.text %></span>\n                            </label>\n                        </div>\n                        <% }) %>\n                    </div>\n                ");
                // process option
                jQuery.map(options.options, function (opt, name) {
                    if (jQuery.type(opt) !== 'object')
                        options.options[name] = { text: opt };
                });
            }
        };
        /**
         * render element
         */
        AweCheckboxes.prototype.render = function (options) {
            this.$el.append(this.template(options));
        };
        /**
         * handle events on element
         */
        AweCheckboxes.prototype.events = function () {
            var _self = this;
            jQuery('input[type=checkbox]', this.$el).change(function (event) {
                var optName = jQuery(this).attr('data-name'), values = _self.getValue();
                if (jQuery(this).is(':checked')) {
                    values.push(optName);
                }
                else {
                    var removeIndex = jQuery.inArray(optName, values);
                    if (removeIndex !== -1)
                        values.splice(removeIndex, 1);
                }
                _self.setValue(values);
            });
        };
        /**
         * render view of element when change value
         */
        AweCheckboxes.prototype.changeElementValue = function (values) {
            jQuery('input[type=checkbox]', this.$el).each(function () {
                var name = jQuery(this).attr('data-name');
                if (jQuery.inArray(name, values) === -1)
                    jQuery(this).prop('checked', false);
                else
                    jQuery(this).prop('checked', true);
            });
        };
        return AweCheckboxes;
    }(ElementForm));
    AweBuilder.AweCheckboxes = AweCheckboxes;
    var AweRadios = (function (_super) {
        __extends(AweRadios, _super);
        function AweRadios() {
            _super.apply(this, arguments);
        }
        /**
         * overrides validateOptions() method
         */
        AweRadios.prototype.validateOptions = function (options) {
            // implements parent method
            _super.prototype.validateOptions.call(this, options);
            // check options of radios element
            if (options.options === undefined)
                throw Error('You must define list option for radio element.');
        };
        /**
         * overrides initialize() method
         */
        AweRadios.prototype.initialize = function (options) {
            // process default value
            if (options.defaultValue === undefined)
                options.defaultValue = Object.keys(options.options)[0];
            // init template function\
            this.template = _.template("\n                <div class=\"ac_panel-item-general-group\">\n                    <span class=\"ac_panel-item-general-group__title\">" + this.translate('<%= title %>') + "</span>\n                    <% _.map(options, function(optTitle, optName) { %>\n                    <div class=\"ac_panel-item-general ac_panel-item-general--2\">\n                        <label>\n                            <span class=\"ac_panel-item-general__title\">" + this.translate('<%= optTitle %>') + "</span>\n                            <div class=\"ac_panel-item-general__content\">\n                                <div class=\"ac_panel-item-general__content-right\">\n                                    <div class=\"radio-icon\">\n                                        <input type=\"radio\" name=\"<%= id %>\" data-name=\"<%= optName %>\">\n                                        <span class=\"radio-style\"></span>\n                                    </div>\n                                </div>\n                            </div>\n                        </label>\n                    </div>\n                    <% }) %>\n                </div>\n            ");
            // implements parent method
            _super.prototype.initialize.call(this, options);
        };
        /**
         * render element content
         */
        AweRadios.prototype.render = function (options) {
            var renderOpts = jQuery.extend({ id: this.id }, options);
            this.$el.append(this.template(renderOpts));
        };
        /**
         * handle events on element
         */
        AweRadios.prototype.events = function () {
            var _self = this;
            // handle when radio option is chose
            jQuery('input[type=radio]', this.$el).change(function (event) {
                event.preventDefault();
                _self.setValue(jQuery(this).attr('data-name'));
            });
        };
        /**
         * change element view when change value
         */
        AweRadios.prototype.changeElementValue = function (value) {
            // uncheck all options
            jQuery('input[type=radio]', this.$el).prop('checked', false);
            // validate value
            if (value !== undefined && jQuery.inArray(value, Object.keys(this.options.options)) !== -1) {
                // active option of value
                jQuery("input[data-name=" + value + "]", this.$el).prop('checked', true);
            }
        };
        return AweRadios;
    }(ElementForm));
    AweBuilder.AweRadios = AweRadios;
    var AweGroup = (function (_super) {
        __extends(AweGroup, _super);
        function AweGroup() {
            _super.apply(this, arguments);
        }
        AweGroup.prototype.initialize = function (options) {
            _super.prototype.initialize.call(this, options);
            this.elements = {};
            // do not add element number width class
            options.widthNumber = false;
            this.widget = options.widget !== undefined ? options.widget : 'default';
        };
        /**
         * validate options
         */
        AweGroup.prototype.validateOptions = function (options) {
            _super.prototype.validateOptions.call(this, options);
            if (options.elements === undefined)
                throw Error('You must define list properties element for compostion.');
            if (options.widget && options.widget === 'constraint') {
                var elementsName = Object.keys(options.elements), firstElement_1 = options.elements[elementsName[0]];
                jQuery.map(options.elements, function (element, name) {
                    if (element.type !== firstElement_1.type)
                        throw Error('AweCompostion Constraint: all elements in compostion must be same type.');
                });
            }
        };
        /**
         * render element content
         */
        AweGroup.prototype.render = function (options) {
            switch (this.widget) {
                case "constraint":
                    this.$el.addClass('ac_col-group').append('<span class="js-constraint trigger-uniform"><i class="acicon acicon-link"> </i></span>');
                    this.renderDefault(options);
                    if (options.primary && options.elements[options.primary] !== undefined)
                        this.primary = options.primary;
                    else {
                        this.primary = Object.keys(this.elements)[0];
                    }
                    this.elements[this.primary].$el.addClass('constraint-primary');
                    break;
                case 'tabs':
                    this.renderTabsWidget(options);
                    break;
                default:
                    this.renderDefault(options);
                    break;
            }
        };
        /**
         * render default widget
         */
        AweGroup.prototype.renderDefault = function (options) {
            var _self = this, selector = options.selector;
            // remove key of this element if use parent key to save value
            if (options.useParentKey) {
                var selectorComponents = selector.split('.');
                selectorComponents.pop();
                selector = selectorComponents.join('.');
            }
            // render title
            if (options.title) {
                this.$el.append('<div class="el-compoistion-title ac_1-col"><h4>' + options.title + '</h4></div>');
            }
            // render elements in composition
            jQuery.map(options.elements, function (elementOpts, property) {
                elementOpts.selector = selector + "." + property;
                elementOpts.name = property;
                // set mediaPanel option
                elementOpts.mediaPanel = options.mediaPanel;
                var element = AweForm.createElement(elementOpts, _self.elForm);
                if (element) {
                    _self.$el.append(element.$el);
                    _self.elements[property] = element;
                }
            });
        };
        /**
         * render tabs widget
         */
        AweGroup.prototype.renderTabsWidget = function (options) {
            // add tabs structure
            this.$el.append("\n                <ul class=\"js-tabs-nav ac_tab-item__nav tabs-nav tabs-top\"></ul>\n                <div class=\"js-tabs-content ac_tab-item__content\"></div>\n            ");
            var _self = this, $content = jQuery('.js-tabs-content', this.$el), $nav = jQuery('.js-tabs-nav', this.$el), elForm = this.getElForm();
            jQuery.map(options.elements, function (elementOpts, property) {
                // prepare to render element as tab content
                elementOpts.selector = options.selector + "." + property;
                elementOpts.name = property;
                // create element
                var title = elementOpts.title !== undefined ? elementOpts.title : property;
                delete elementOpts.title;
                var element = AweForm.createElement(elementOpts, elForm);
                // add element to tab
                if (element) {
                    $nav.append("<li class=\"awe-tab\"><a href=\"#" + element.id + "\">" + title + "</a>");
                    $content.append(element.$el);
                    _self.elements[property] = element;
                }
            });
        };
        /**
         * overrides update() method
         */
        AweGroup.prototype.update = function (activeModel, responsiveMode, state, parentSelector) {
            // update selector
            this.updateSelector(parentSelector);
            // update for elements
            var _self = this;
            jQuery.map(this.elements, function (element, propertyName) {
                element.update(activeModel, responsiveMode, state, _self.getSelector());
            });
            // process for constraint widget
            if (this.widget === 'constraint') {
                var enabledConstraint_1 = true, primaryValue_1 = this.getPrimaryValue(), _self_7 = this;
                if (jQuery.type(primaryValue_1) === 'object')
                    primaryValue_1 = JSON.stringify(primaryValue_1);
                jQuery.map(this.elements, function (element, name) {
                    var elementValue = element.getValue();
                    if (jQuery.type(elementValue) === 'object')
                        elementValue = JSON.stringify(elementValue);
                    if (name !== _self_7.primary && elementValue !== primaryValue_1) {
                        enabledConstraint_1 = false;
                    }
                });
                if (enabledConstraint_1)
                    this.$el.addClass('constraint');
                else
                    this.$el.removeClass('constraint');
            }
        };
        /**
         * get value of primary element
         */
        AweGroup.prototype.getPrimaryValue = function () {
            var primaryElement = this.elements[this.primary];
            return primaryElement.getValue();
        };
        /**
         * overrides update selector
         */
        AweGroup.prototype.updateSelector = function (parentSelector) {
            var options = this.options;
            if (options.useParentKey) {
                this.options.selector = parentSelector;
            }
            else {
                _super.prototype.updateSelector.call(this, parentSelector);
            }
        };
        /**
         * overrides getSelector() method
         */
        AweGroup.prototype.getSelector = function () {
            return this.options.selector;
        };
        /**
         * overrides getDefault value
         */
        AweGroup.getDefaultValue = function (options, parentData, key) {
            if (!options.useParentKey)
                parentData[key] = {};
            var output = options.useParentKey ? parentData : parentData[key];
            jQuery.map(options.elements, function (elOptions, name) {
                if (options.devices !== undefined)
                    elOptions.devices = options.devices;
                else
                    delete elOptions.devices;
                if (AweForm.elementsMap[elOptions.type])
                    eval(AweForm.elementsMap[elOptions.type] + ".getDefaultValue(elOptions, output, name)");
            });
            return output;
        };
        /**
         * overrides events method
         */
        AweGroup.prototype.events = function () {
            var _self = this, $el = this.$el;
            switch (this.widget) {
                case "constraint":
                    jQuery('.js-constraint', this.$el).click(function (event) {
                        event.stopPropagation();
                        $el.toggleClass('constraint');
                        if ($el.hasClass('constraint')) {
                            var primaryValue = _self.elements[_self.primary].getValue();
                            _self.setContraintValue(primaryValue);
                        }
                    });
                    this.elements[this.primary].$el.change(function (event, values) {
                        if ($el.hasClass('constraint') && typeof (values) === 'object' && !values.updateModel) {
                            _self.setContraintValue(values.current);
                        }
                    });
                    break;
                case 'tabs':
                    this.$el.aweTabs({
                        event: 'click',
                        active: 0
                    });
                    break;
            }
        };
        /**
         * set constraint elements value
         */
        AweGroup.prototype.setContraintValue = function (value, inlineCss) {
            var primary = this.primary;
            jQuery.map(this.elements, function (element, name) {
                if (name !== primary) {
                    element.setValue(value, { inlineCss: inlineCss });
                }
            });
        };
        /**
         * overrides getValues method
         */
        AweGroup.prototype.getValue = function () {
            var output = {};
            jQuery.map(this.elements, function (element, name) {
                output[name] = element.getValue();
            });
            return output;
        };
        /**
         * overrides setMediaPanel() method
         */
        AweGroup.prototype.setMediaPanel = function (mediaPanel) {
            // implements parent method
            _super.prototype.setMediaPanel.call(this, mediaPanel);
            // set media panel for sub elements
            jQuery.map(this.elements, function (element, name) {
                element.setMediaPanel(mediaPanel);
            });
        };
        return AweGroup;
    }(ElementForm));
    AweBuilder.AweGroup = AweGroup;
    var AweIcon = (function (_super) {
        __extends(AweIcon, _super);
        function AweIcon() {
            _super.apply(this, arguments);
            this.defaultValue = '';
        }
        /**
         * validate options
         */
        AweIcon.prototype.validateOptions = function (options) {
            _super.prototype.validateOptions.call(this, options);
        };
        /**
         * initialize()
         */
        AweIcon.prototype.initialize = function (options) {
            _super.prototype.initialize.call(this, options);
            this.template = _.template("\n                <div class=\"<%= classes %>\">\n                    <% if (!showTabsOnly) { %>\n                    <span class=\"ac_panel-item-general__title\"><%= title %></span>\n                    <div class=\"ac_panel-item-general__content ac_select-list\">\n                        <span class=\"val\">\n                            <span class=\"icon-selected\"><i class=\"\"></i></span>\n                            <span class=\"icon-name\"></span>\n                            <i class=\"acicon acicon-triangle-down\"></i>\n                        </span>\n                        <ul class=\"option-list\">\n                            <li>\n                    <% } %>\n                                <div class=\"js-icon-tabs ac_tab-item ac_tab-item--2 awe-tabs\">\n                                    <ul class=\"ac_tab-item__nav tabs-nav tabs-top\"></ul>\n                                    <div class=\"js-icon-libraries ac_tab-item__content\"></div>\n                                </div>\n                    <% if (!showTabsOnly) { %>\n                            </li>\n                        </ul>\n                    </div>\n                    <% } %>\n                </div>\n            ");
        };
        /**
         * render element content
         */
        AweIcon.prototype.render = function (options) {
            // add html for icon element
            var renderParams = {
                title: options.title,
                classes: this.classes,
                showTabsOnly: options.showTabsOnly
            };
            this.$el.append(this.template(renderParams));
            var _self = this, postParams = AweBuilder.prepareAjaxParamenters('icon', { _action: 'init' });
            if (window.AweBuilderSettings.libraries.fontIcons === undefined) {
                if (postParams) {
                    window.AweBuilderSettings.libraries.fontIcons = {
                        ready: false,
                        frontend: true,
                        backend: true,
                        data: {}
                    };
                    jQuery.post(postParams.url, postParams.data, function (response) {
                        var libraries = response;
                        if (libraries && jQuery.type(libraries) === 'array' && libraries.length) {
                            // create tabs for icon libraries
                            jQuery.each(libraries, function (index, library) {
                                _self.loadLibrary(library.name, function (icons, files) {
                                    library.icons = icons;
                                    library.files = files;
                                    window.AweBuilderSettings.libraries.fontIcons.data[library.name] = jQuery.extend(true, {}, library);
                                    _self.renderLibrary(library);
                                    if (Object.keys(window.AweBuilderSettings.libraries.fontIcons.data).length === libraries.length) {
                                        _self.$el.trigger('elIconReady');
                                        window.AweBuilderSettings.libraries.fontIcons.ready = true;
                                    }
                                });
                            });
                        }
                        else {
                            _self.$el.trigger('elIconReady');
                            window.AweBuilderSettings.libraries.fontIcons.ready = true;
                        }
                    }, 'json');
                }
            }
            else {
                var iconLibraryReady_1;
                iconLibraryReady_1 = setInterval(function () {
                    var fontIconsLibrary = window.AweBuilderSettings.libraries.fontIcons;
                    if (fontIconsLibrary.ready) {
                        clearInterval(iconLibraryReady_1);
                        jQuery.map(fontIconsLibrary.data, function (icons, name) {
                            _self.renderLibrary(icons);
                        });
                        _self.$el.trigger('elIconReady');
                    }
                }, 200);
            }
        };
        /**
         * render icon library
         */
        AweIcon.prototype.renderLibrary = function (library) {
            if (jQuery.type(library) === 'object' && jQuery.type(library.icons)) {
                jQuery('.js-icon-tabs > ul', this.$el).append("<li data-name=\"" + library.name + "\"><a href=\"#" + library.name + "-icon-library-" + this.cid + "\">" + library.title + "</a></li>");
                jQuery('.js-icon-libraries', this.$el).append("<div id=\"" + library.name + "-icon-library-" + this.cid + "\" class=\"js-icon-library\"><ul class=\"js-list-icon ac_list-icon\"></ul></div>");
                if (jQuery.type(library.icons) === 'array') {
                    var _self_8 = this;
                    jQuery.each(library.icons, function (index, icon) {
                        jQuery("#" + library.name + "-icon-library-" + _self_8.cid + " ul", _self_8.$el).append("<li class=\"js-icon-item\" title=\"" + icon.name + "\"><i class=\"" + icon.classes + "\"></i></li>");
                    });
                }
            }
        };
        /**
         * load icon library data
         */
        AweIcon.prototype.loadLibrary = function (libraryName, readyCallback) {
            var postParams = AweBuilder.prepareAjaxParamenters('icon', { _action: 'load', name: libraryName });
            if (postParams) {
                jQuery.post(postParams.url, postParams.data, function (response) {
                    var iconsData = response;
                    if (iconsData !== undefined && iconsData.icons !== undefined) {
                        // add css files
                        if (iconsData.files) {
                            var files_1 = {};
                            jQuery.each(iconsData.files, function () {
                                files_1[this] = {
                                    type: AweBuilder.CSS_FILE,
                                    destination: ['backend', 'frontend']
                                };
                            });
                            AweBuilder.addLibraries(files_1, function () {
                                readyCallback(iconsData.icons, iconsData.files);
                            });
                        }
                        else
                            readyCallback(iconsData.icons);
                    }
                    else {
                        readyCallback();
                    }
                }, 'json');
            }
        };
        /**
         * overrides changeElementValue() method
         */
        AweIcon.prototype.changeElementValue = function (value) {
            // reset element value
            jQuery('span.icon-name', this.$el).text('');
            jQuery('span.icon-selected > i', this.$el).attr('class', '');
            // get icon by value
            if (value) {
                var $icon = jQuery(".js-icon-libraries i[class=\"" + value + "\"]", this.$el), name_3 = $icon.parent().attr('title');
                // set value to element
                jQuery('span.icon-name', this.$el).text(name_3);
                jQuery('span.icon-selected > i', this.$el).addClass(value);
            }
        };
        /**
         * handler events on element
         */
        AweIcon.prototype.events = function () {
            var _self = this;
            // init click to show options
            this.$el.click(function (event) {
                event.preventDefault();
                var $optionsList = jQuery('ul.option-list', _self.$el);
                if (!jQuery(event.target).closest('ul.option-list').length)
                    $optionsList.toggleClass('js-active').toggle();
            });
            jQuery(document).click(function (event) {
                if (jQuery(event.target).closest(_self.$el).length === 0) {
                    var $optionsList = jQuery('ul.option-list', _self.$el);
                    if ($optionsList.hasClass('js-active')) {
                        $optionsList.removeClass('js-active').hide();
                    }
                }
            });
            // wait to init icon libraries is ready
            this.$el.bind('elIconReady', function () {
                jQuery('.js-icon-tabs', _self.$el).aweTabs({
                    event: 'click',
                    active: 0
                });
            });
            // handle event select icon
            this.$el.delegate('.js-icon-item', 'click', function (event) {
                event.stopPropagation();
                var iconClasses = jQuery('> i', this).attr('class'), iconName = jQuery(this).attr('title');
                // set chose icon
                jQuery('.js-icon-item.active', _self.$el).removeClass('active');
                jQuery(this).addClass('active');
                // set chose icon to display element
                jQuery('span.icon-name', _self.$el).text(iconName);
                jQuery('span.icon-selected > i', _self.$el).attr('class', iconClasses);
                // create event selected
                _self.setValue(iconClasses);
                jQuery('ul.option-list', _self.$el).removeClass('js-active').hide();
            });
        };
        return AweIcon;
    }(ElementForm));
    AweBuilder.AweIcon = AweIcon;
    /**
     * Define storage element
     */
    var AweStorage = (function (_super) {
        __extends(AweStorage, _super);
        function AweStorage() {
            _super.apply(this, arguments);
            this.defaultValue = '';
        }
        /**
         * overrides getDefaultValue() method
         */
        AweStorage.getDefaultValue = function (options, parentData, name) {
            parentData[name] = options.defaultValue ? options.defaultValue : '';
        };
        return AweStorage;
    }(ElementForm));
    AweBuilder.AweStorage = AweStorage;
    var AweColor = (function (_super) {
        __extends(AweColor, _super);
        function AweColor() {
            _super.apply(this, arguments);
            this.defaultValue = '';
        }
        /**
         * implements initialize() method
         */
        AweColor.prototype.initialize = function (options) {
            _super.prototype.initialize.call(this, options);
            this.template = _.template("\n                <div class=\"ac_panel-item-general ac_panel-item-general--2\">\n                    <span class=\"ac_panel-item-general__title\"><%= title %></span>\n                    <div class=\"ac_panel-item-general__content\">\n                        <div class=\"ac_panel-item-general__content-right\">\n                            <input type=\"text\" class=\"js-awe-colorpicker spectrum\">\n                        </div>\n                    </div>\n                </div>");
        };
        /**
         * overrides render() method
         */
        AweColor.prototype.render = function (options) {
            this.$el.append(this.template({
                title: options.title
            }));
        };
        /**
         * overrides changeElementValue() method
         */
        AweColor.prototype.changeElementValue = function (value) {
            jQuery('input.js-awe-colorpicker', this.$el).spectrum('set', value);
        };
        /**
         * overrides initEvents() method
         */
        AweColor.prototype.events = function () {
            var _self = this, opts = this.options, pluginOptions = opts.pluginOptions, options = {
                color: this.options.defaultValue,
                preferredFormat: "hex",
                showInput: true,
                showAlpha: true,
                alphaVertical: true,
                allowEmpty: true,
                showPalette: true,
                showSelectionPalette: false,
                palette: window.AweBuilderSettings.spectrumPalette,
                maxSelectionSize: 6,
                appendTo: '.js-ac-spcontainers'
            };
            options = jQuery.extend(true, {}, options, pluginOptions);
            // Call init spectrum on element
            var moveCallback = pluginOptions && pluginOptions.move ? pluginOptions.move : undefined, hideCallback = pluginOptions && pluginOptions.hide ? pluginOptions.hide : undefined;
            options.move = function (color) {
                if (moveCallback)
                    moveCallback(color);
                color = color ? color.toString() : '';
                _self.setValue(color);
            };
            options.hide = function (color) {
                if (typeof hideCallback === 'function')
                    hideCallback(color);
                color = color ? color.toString() : '';
                _self.setValue(color);
            };
            jQuery('input.js-awe-colorpicker', this.$el).spectrum(options).click(function (event) {
                event.preventDefault();
                jQuery(this).spectrum('toggle');
            });
        };
        return AweColor;
    }(ElementForm));
    AweBuilder.AweColor = AweColor;
    var AweRanger = (function (_super) {
        __extends(AweRanger, _super);
        function AweRanger() {
            _super.apply(this, arguments);
        }
        /**
         * implements initialize() method
         */
        AweRanger.prototype.initialize = function (options) {
            this.mouseDragging = false;
            if (options.defaultValue === undefined)
                options.defaultValue = options.min;
            _super.prototype.initialize.call(this, options);
            this.createTemplate();
            if (options.unit === undefined)
                options.unit = 'px';
            else if (options.unit === false)
                options.unit = '';
            if (options.allowChangeRange === undefined)
                options.allowChangeRange = true;
            this.options = options;
        };
        /**
         * overrides validate options
         */
        AweRanger.prototype.validateOptions = function (options) {
            _super.prototype.validateOptions.call(this, options);
            if (options.min === undefined)
                throw Error("You must define minimum value for slider element.");
            if (options.max === undefined)
                throw Error("You must define minimum value for slider element.");
        };
        /**
         * overrides render() method
         */
        AweRanger.prototype.render = function (options) {
            this.$el.append(this.template(this.options));
        };
        /**
         * create template
         */
        AweRanger.prototype.createTemplate = function () {
            var options = this.options;
            if (options.widget === 'button') {
                this.template = _.template("\n                    <div class=\"ac_box-item--range\">\n                        <span class=\"title js-title\"><%= title %></span>\n                        <div class=\"item-range js-item-range\">\n                            <div class=\"value\">\n                                <span class=\"number js-ranger-title\" contenteditable=\"true\"><%= defaultValue %></span>\n                                <sup><%= unit %></sup>\n                            </div>\n                            <div class=\"js-ac-number ac_number\" data-min=\"<%= min %>\" data-max=\"<%= max %>\">\n                                <span class=\"js-minus minus\"><i class=\"acicon acicon-minus\"></i></span>\n                                <span class=\"js-plus plus\"><i class=\"acicon acicon-plus\"></i></span>\n                            </div>\n                        </div>\n                    </div>");
            }
            else {
                this.template = _.template("\n                    <div class=\"ac_box-item--range\">\n                        <span class=\"title js-title\"><%= title %></span>\n                        <div class=\"item-range js-item-range\">\n                            <div class=\"js-value value\">\n                                <span class=\"js-ranger-title number\" contenteditable=\"true\"><%= defaultValue %></span>\n                                <sup><%= unit %></sup>\n                            </div>\n                            <div class=\"js-slider-range-min ac_slider-range-min\">\n                                <input type=\"range\" min=\"<%= min %>\" max=\"<%= max %>\" value=\"<%= defaultValue %>\">\n                            </div>\n                        </div>\n                    </div>");
            }
        };
        /**
         * overrides changeElementValue() method
         */
        AweRanger.prototype.changeElementValue = function (value) {
            var parseValue = parseInt(value);
            if (!isNaN(parseValue)) {
                value = parseValue;
                jQuery('.js-value > sup', this.$el).show();
                this.$el.find('.js-slider-range-min > input').val(value);
                var options = this.options;
                if (options.allowChangeRange) {
                    if (value > options.max) {
                        options.max = value;
                        this.$el.find('.js-slider-range-min > input').attr('max', value);
                        this.$el.find('.js-ac-number').attr('data-max', value);
                    }
                    else if (value < options.min) {
                        options.min = value;
                        this.$el.find('.js-slider-range-min > input').attr('min', value);
                        this.$el.find('.js-ac-number').attr('data-min', value);
                    }
                }
            }
            else
                jQuery('.js-value > sup', this.$el).hide();
            this.$el.find('.js-item-range span.js-ranger-title').text(value);
        };
        /**
         * overrides initEvents() method
         */
        AweRanger.prototype.events = function () {
            var _self = this, opts = this.options;
            if (opts.widget === 'button') {
                jQuery('.js-ac-number > span', this.$el).click(function (event) {
                    event.stopPropagation();
                    var value = parseInt(_self.value), updateText = false;
                    // prepare new value for border width
                    if (!isNaN(value)) {
                        if (jQuery(this).hasClass('js-minus')) {
                            if (value - 1 >= opts.min) {
                                updateText = true;
                                value = value - 1;
                            }
                        }
                        else {
                            if (value + 1 <= opts.max) {
                                updateText = true;
                                value = value + 1;
                            }
                        }
                    }
                    // change text value
                    if (updateText) {
                        jQuery('span.js-ranger-title', _self.$el).text(value);
                        _self.setValue(value);
                    }
                });
            }
            else {
                jQuery('.js-slider-range-min > input', _self.$el).change(function (event) {
                    event.stopPropagation();
                    var value = jQuery(this).val();
                    if (value !== _self.getValue()) {
                        _self.$el.find('.js-item-range span.js-ranger-title').text(value);
                        _self.setValue(value);
                    }
                }).mousemove(function () {
                    if (_self.mouseDragging)
                        jQuery(this).trigger('change');
                }).mousedown(function () {
                    _self.mouseDragging = true;
                }).mouseup(function () {
                    _self.mouseDragging = false;
                });
            }
            // init for type value to display text
            _self.$el.delegate('.js-item-range span.js-ranger-title[contenteditable="true"]', 'blur', function (event) {
                _self.setValue(jQuery(this).text());
            });
            _self.$el.delegate('.js-item-range span.js-ranger-title[contenteditable="true"]', 'keydown', function (event) {
                var keyCode = event.which | event.keyCode;
                if (keyCode === 13 || keyCode === 27) {
                    event.preventDefault();
                    if (keyCode === 27)
                        jQuery(this).text(_self.getValue());
                    jQuery(this).trigger('blur');
                }
            });
        };
        /**
         * overrides setValue() method
         * @param value
         */
        AweRanger.prototype.setValue = function (value) {
            if (jQuery.type(value) === "string") {
                value = parseInt(value);
                if (isNaN(value))
                    value = parseInt(this.getValue());
            }
            var unit = this.options.unit;
            if (unit !== '')
                value = "" + value + unit;
            _super.prototype.setValue.call(this, value);
        };
        return AweRanger;
    }(ElementForm));
    AweBuilder.AweRanger = AweRanger;
    var AweBorderbox = (function (_super) {
        __extends(AweBorderbox, _super);
        function AweBorderbox() {
            _super.apply(this, arguments);
            this.defaultValue = {
                color: '',
                width: '0',
                style: 'solid'
            };
        }
        /**
         * implements initialize() method
         */
        AweBorderbox.prototype.initialize = function (options) {
            _super.prototype.initialize.call(this, options);
            this.template = _.template("\n                <div class=\"ac_box-item--number\">\n                    <span class=\"title\"><%= title %></span>\n                    <div class=\"item-content\">\n                        <div class=\"number-wrapper\">\n                            <input type=\"text\" class=\"js-box-spectrum\">\n                            <div class=\"value\">\n                                <span class=\"js-box-number number\" contenteditable=\"true\"><%= defaultValue.width %></span>\n                                <sup><%= unit %></sup>\n                                <span class=\"style js-option-style\">\n                                <% _.map(listOption, function(optVal,optKey ){ %>\n                                    <% if (defaultValue.style == optVal) { %>\n                                       <span data-key=\"<%= optKey %>\" class=\"selected\"><%= optVal %></span>\n                                    <% } %>\n                                    <% if (defaultValue.style != optVal) { %>\n                                       <span data-key=\"<%= optKey %>\"><%= optVal %></span>\n                                    <% } %>\n                                <%})%>\n                                </span>\n                            </div>\n                        </div>\n                        <div class=\"js-ac-number ac_number\">\n                            <span class=\"js-minus minus\">\n                                <i class=\"acicon acicon-minus\"></i>\n                            </span>\n                            <span class=\"js-plus plus\">\n                                <i class=\"acicon acicon-plus\"></i>\n                            </span>\n                        </div>\n                    </div>\n                </div>");
            // set min and max width if not set
            if (options.minWidth === undefined)
                options.minWidth = 0;
            if (options.maxWidth === undefined)
                options.maxWidth = 100;
            this.options = options;
        };
        /**
         * overrides render() method
         */
        AweBorderbox.prototype.render = function (options) {
            var element = this.template({
                title: options.title,
                defaultValue: options.defaultValue,
                unit: options.unit,
                listOption: {
                    none: 'none',
                    solid: 'solid',
                    dashed: 'dashed',
                    dotted: 'dotted',
                    double: 'double'
                }
            });
            this.$el.append(element).addClass('ac_2-col');
        };
        /**
         * overrides changeElementValue() method
         */
        AweBorderbox.prototype.changeElementValue = function (value) {
            var arrValue = value.split(' ');
            jQuery(".js-box-number", this.$el).text(parseInt(arrValue[0]));
            jQuery('.js-option-style span', this.$el).each(function (index, el) {
                if (arrValue[1]) {
                    jQuery(this).removeClass('selected');
                    if (jQuery(this).attr('data-key') == arrValue[1]) {
                        jQuery(this).addClass('selected');
                    }
                }
                else {
                    if (index == 0)
                        jQuery(this).addClass('selected');
                }
            });
            jQuery('.js-box-spectrum', this.$el).spectrum('set', arrValue.splice(2).join(' '));
        };
        /**
         * get elements value
         */
        AweBorderbox.prototype.getElementsValue = function () {
            var value = {
                color: jQuery('.js-box-spectrum', this.$el).spectrum("get"),
                width: parseInt(jQuery(".js-box-number", this.$el).text()) + "px",
                style: jQuery('.selected', this.$el).attr('data-key')
            };
            value.color = value.color ? value.color.toString() : '';
            return value.width + " " + value.style + " " + value.color;
        };
        /**
         * overrides initEvents() method
         */
        AweBorderbox.prototype.events = function () {
            var _self = this, $el = this.$el, opts = this.options;
            /*----------  Chose color spectrum  ----------*/
            var options = {
                color: this.options.defaultValue.color,
                preferredFormat: 'hex',
                showInput: true,
                showAlpha: false,
                alphaVertical: true,
                allowEmpty: true,
                showPalette: true,
                showSelectionPalette: false,
                palette: window.AweBuilderSettings.spectrumPalette,
                maxSelectionSize: 6,
                appendTo: '.js-ac-spcontainers'
            };
            options = jQuery.extend(true, {}, options, opts.colorOptions);
            // Call init spectrum on element
            var colorOptions = opts.colorOptions, moveCallback = colorOptions && colorOptions.move ? colorOptions.move : undefined, hideCallback = colorOptions && colorOptions.hide ? colorOptions.hide : undefined;
            options.move = function (color) {
                if (moveCallback)
                    moveCallback.call(color);
                _self.setValue(_self.getElementsValue());
            };
            options.hide = function (color) {
                if (hideCallback)
                    hideCallback.call(color);
                _self.setValue(_self.getElementsValue());
            };
            jQuery('.js-box-spectrum', $el).spectrum(options).click(function (event) {
                event.preventDefault();
                jQuery(this).spectrum('toggle');
            });
            /*----------  Chose select list  ----------*/
            jQuery('.style', $el).on('click', function () {
                var el = jQuery(this);
                el.children('.selected').removeClass('selected')
                    .next().addClass('selected');
                if (el.children('.selected').length == 0) {
                    el.children().first().addClass('selected');
                }
                _self.setValue(_self.getElementsValue());
            });
            /*----------  Event on border width controllers  ----------*/
            jQuery(".js-ac-number > span", $el).click(function (event) {
                event.preventDefault();
                var $boxNumber = jQuery(".js-box-number", $el), width = parseInt($boxNumber.text()), updateText = false;
                // prepare new value for border width
                if (jQuery(this).hasClass('js-minus')) {
                    if (width - 1 >= opts.minWidth) {
                        updateText = true;
                        width = width - 1;
                    }
                }
                else {
                    if (width + 1 <= opts.maxWidth) {
                        updateText = true;
                        width = width + 1;
                    }
                }
                // change text value
                if (updateText) {
                    $boxNumber.text(width);
                    _self.setValue(_self.getElementsValue());
                }
            });
            jQuery('.js-box-number', this.$el).blur(function (event) {
                event.stopPropagation();
                var width = parseInt(jQuery(this).text()), value = _self.getValue();
                // check text type in border width is number
                if (isNaN(width))
                    width = value.width;
                if (width !== value.width) {
                    _self.setValue(_self.getElementsValue());
                }
            }).keydown(function (event) {
                var code = event.which | event.keyCode;
                if (code === 13 || code === 27) {
                    event.preventDefault();
                    if (code === 27)
                        jQuery(this).text(_self.getValue().width);
                    jQuery(this).trigger('blur');
                }
            });
        };
        return AweBorderbox;
    }(ElementForm));
    AweBuilder.AweBorderbox = AweBorderbox;
    var AweFileSelector = (function (_super) {
        __extends(AweFileSelector, _super);
        function AweFileSelector() {
            _super.apply(this, arguments);
            this.defaultValue = {
                fid: -1,
                url: ''
            };
        }
        /**
         * implements initialize() method
         */
        AweFileSelector.prototype.initialize = function (options) {
            // init default value base on widget
            if (options.widget === 'multi')
                this.defaultValue = [];
            // implements parent method
            _super.prototype.initialize.call(this, options);
            // declare template function
            this.template = _.template("\n                <div class=\"ac_panel-item-general ac_panel-item-general--2\">\n                    <span class=\"ac_panel-item-general__title\"><%= title %></span>\n                    <div class=\"ac_panel-item-general__content\">\n                        <div class=\"ac_panel-item-general__content-right\">\n                            <% if (widget === 'default') { %>\n                            <i class=\"js-delete acicon acicon-del\" title=\"" + this.translate('Remove') + "\" style=\"display: none;\"></i>\n                            <div class=\"js-bg-image bg-image\"></div>\n                            <% } else if (widget === 'multi') { %>\n                            <i class=\"js-add acicon acicon-plus\" title=\"" + this.translate('Add') + "\"></i>\n                            <% } %>\n                        </div>\n                    </div>\n                </div>\n                <% if (widget !== 'default') { %>\n                    <div class=\"ac_image-group\">\n                        <div class=\"js-images-wrapper ac_row\">\n                        <% if (widget === 'multi') { %>\n                            <% _.each(files, function(file) { %>\n                            <div class=\"js-image ac_3-col\">\n                                <div class=\"ac_panel__image-item\">\n                                    <img src=\"<%= file.url %>\" alt=\"\">\n                                    <div class=\"ac_panel__image-item\">\n                                        <ul>\n                                            <li title=\"" + this.translate('Move') + "\"><i class=\"acicon acicon-move\"></i></li>\n                                            <li title=\"" + this.translate('Edit') + "\"><i class=\"acicon acicon-pen\"></i></li>\n                                            <li title=\"" + this.translate('Delete') + "\"><i class=\"acicon acicon-del\"></i></li>\n                                        </ul>\n                                    </div>\n                                </div>\n                            </div>\n                            <% }) %>\n                        <% } else { %>\n                            <div class=\"ac_1-col\">\n                                <div class=\"ac_panel__image-item\">\n                                    <img src=\"<%= files.url %>\" alt=\"\">\n                                </div>\n                            </div>\n                        <% } %>\n                        </div>\n                    </div>\n                <% } %>\n            ");
            // set media panel
            this.mediaPanel = options.mediaPanel;
        };
        /**
         * overrides render() method
         */
        AweFileSelector.prototype.render = function (options) {
            this.$el.append(this.template({
                title: options.title,
                widget: options.widget ? options.widget : 'default',
                files: options.defaultValue
            }));
        };
        /**
         * overrides setValue() method
         */
        AweFileSelector.prototype.setValue = function (value, extraData) {
            if (this.actionData) {
                var files = this.getValue().slice(), eventValue = {
                    action: '',
                    index: -1
                };
                switch (this.actionData.action) {
                    case "edit":
                        // change value of file edit
                        var index = this.actionData.$image.index();
                        files[index] = value;
                        eventValue = {
                            action: 'edit',
                            index: index
                        };
                        break;
                    case "add":
                        Array.prototype.push.apply(files, value);
                        eventValue = {
                            action: 'add',
                            index: files.length - 1
                        };
                        break;
                    case "delete":
                        files.splice(this.actionData.$image.index(), 1);
                        eventValue = {
                            action: 'delete',
                            index: this.actionData.$image.index()
                        };
                        break;
                    case "sort":
                        var sortImage = files.splice(this.actionData.before, 1)[0];
                        if (this.actionData.after > 0) {
                            if (this.actionData.after >= files.length) {
                                files.push(sortImage);
                            }
                            else
                                files.splice(this.actionData.after, 0, sortImage);
                        }
                        else
                            files.unshift(sortImage);
                        eventValue = jQuery.extend(true, {}, this.actionData);
                        break;
                }
                // set change file to value
                _super.prototype.setValue.call(this, files, jQuery.extend({}, extraData, { eventValue: eventValue }));
                // reset actionData property
                this.actionData = undefined;
            }
            else
                _super.prototype.setValue.call(this, value, extraData);
        };
        /**
         * overrides changeElementValue() method
         */
        AweFileSelector.prototype.changeElementValue = function (value) {
            switch (this.options.widget) {
                case "multi":
                    // clear previous image
                    var $images_1 = jQuery('.js-images-wrapper', this.$el).html('');
                    if (jQuery.type(value) === 'array') {
                        var imageTemplate_1 = _.template("\n                            <div class=\"js-image  ac_3-col\">\n                                <div class=\"ac_panel__image-item\">\n                                    <img src=\"<%= file.url %>\" alt=\"\">\n                                    <div class=\"ac_panel__image-item-control\">\n                                        <ul>\n                                            <li class=\"js-move\" title=\"" + this.translate('Move') + "\"><i class=\"acicon acicon-move\"></i></li>\n                                            <li class=\"js-edit\" title=\"" + this.translate('Edit') + "\"><i class=\"acicon acicon-pen\"></i></li>\n                                            <li class=\"js-del\" title=\"" + this.translate('Delete') + "\"><i class=\"acicon acicon-del\"></i></li>\n                                        </ul>\n                                    </div>\n                                </div>\n                            </div>");
                        jQuery.each(value, function (index, file) {
                            if (file.url) {
                                $images_1.append(imageTemplate_1({ file: file }));
                            }
                        });
                    }
                    break;
                case 'single':
                    break;
                default:
                    jQuery('.js-bg-image', this.$el).css('background-image', "url(" + value.url + ")");
                    jQuery('.js-awe-image-url', this.$el).val(value.url);
                    jQuery('.js-awe-image-fid', this.$el).val(value.fid);
                    if (value && value.url.trim()) {
                        jQuery('.js-delete', this.$el).show();
                    }
                    else {
                        jQuery('.js-delete', this.$el).hide();
                    }
                    break;
            }
        };
        /**
         * overrides initEvents() method
         */
        AweFileSelector.prototype.events = function () {
            var _self = this, $el = this.$el;
            // process event for default widget
            switch (this.options.widget) {
                case "multi":
                    // handle click to add images button
                    jQuery('.js-add', this.$el).click(function (event) {
                        event.preventDefault();
                        _self.openMediaPanel(true);
                        _self.actionData = { action: 'add' };
                    });
                    // handle click to image controller
                    this.$el.delegate('.js-image li', 'click', function (event) {
                        event.preventDefault();
                        if (jQuery(this).hasClass('js-edit')) {
                            _self.openMediaPanel(false);
                            _self.actionData = {
                                action: 'edit',
                                $image: jQuery(this).parents('.js-image:first')
                            };
                        }
                        else if (jQuery(this).hasClass('js-del')) {
                            _self.actionData = {
                                action: 'delete',
                                $image: jQuery(this).parents('.js-image:first')
                            };
                            _self.setValue();
                        }
                    });
                    // sort images
                    jQuery('.js-images-wrapper', this.$el).sortable({
                        handle: '.js-move',
                        tolerance: 'pointer',
                        start: function (event, ui) {
                            _self.actionData = {
                                action: 'sort',
                                before: ui.item.index()
                            };
                        },
                        stop: function (event, ui) {
                            _self.actionData.after = ui.item.index();
                            _self.setValue();
                        }
                    });
                    break;
                case 'single':
                    break;
                default:
                    // handle click element to open media panel
                    jQuery(".js-bg-image", $el).click(function (event) {
                        event.preventDefault();
                        _self.openMediaPanel(false);
                    });
                    // handle click to delete button
                    jQuery(".js-delete", $el).click(function (event) {
                        event.preventDefault();
                        _self.setValue({ url: '', fid: -1 });
                    });
                    break;
            }
        };
        /**
         * open media panel
         */
        AweFileSelector.prototype.openMediaPanel = function (multi) {
            if (this.mediaPanel) {
                this.mediaPanel.model.setMultiple(multi);
                this.mediaPanel.open(this);
            }
        };
        /**
         * overrides getDefaultValue method
         */
        AweFileSelector.getDefaultValue = function (options, parentData, name) {
            // set options key is default values if did not set
            switch (options.widget) {
                case "multi":
                    if (jQuery.type(options.defaultValue) !== 'array')
                        options.defaultValue = [];
                    break;
                default:
                    if (jQuery.type(options.defaultValue) !== 'object' || options.defaultValue.url === undefined)
                        options.defaultValue = { fid: -1, url: '' };
                    break;
            }
            // implements parent method
            return ElementForm.getDefaultValue(options, parentData, name);
        };
        return AweFileSelector;
    }(ElementForm));
    AweBuilder.AweFileSelector = AweFileSelector;
    var AweOrder = (function (_super) {
        __extends(AweOrder, _super);
        function AweOrder() {
            _super.apply(this, arguments);
            this.defaultValue = [];
        }
        /**
         * overrides validate method
         */
        AweOrder.prototype.validateOptions = function (options) {
            _super.prototype.validateOptions.call(this, options);
            if (jQuery.type(options.options) !== 'object')
                throw Error('You must define list values to order for order element type.');
            if (options.defaultValue !== undefined && jQuery.type(options.defaultValue) !== 'array')
                throw Error('Default values of order element must be array.');
            if (jQuery.type(options.defaultValue) === 'array') {
                if (options.defaultValue.length !== Object.keys(options.options).length)
                    throw Error('Order element: Default values length must equal options length.');
                var optionsKey_1 = Object.keys(options.options);
                jQuery.each(options.defaultValue, function (index, key) {
                    if (jQuery.inArray(key, optionsKey_1) === -1)
                        throw Error("You must use options key to default value. Value '" + this + "' is not one of options.");
                });
            }
        };
        /**
         * overrides initialize() method
         */
        AweOrder.prototype.initialize = function (options) {
            // init template function
            this.template = _.template("\n                <div class=\"js-order-wrapper ac_panel-item-general-group\">\n                    <span class=\"ac_panel-item-general-group__title\"><%= title %></span>\n                    <% _.map(options, function(value, key) { %>\n                    <div class=\"js-order-item ac_panel-item-general ac_panel-item-general--2\" data-key=\"<%= key %>\">\n                        <span class=\"ac_panel-item-general__title\">\n                            <i class=\"js-order-move acicon acicon-move\"></i>\n                            <%= value %>\n                        </span>\n                        <div class=\"ac_panel-item-general__content\"></div>\n                    </div>\n                    <% }) %>\n                </div>\n            ");
            _super.prototype.initialize.call(this, options);
        };
        /**
         * render method
         */
        AweOrder.prototype.render = function (options) {
            this.$el.append(this.template(options));
        };
        /**
         * implements change view when change value
         */
        AweOrder.prototype.changeElementValue = function (values) {
            // remove all order item
            jQuery('.js-order-item', this.$el).remove();
            // render new order item
            var $wrapper = jQuery('.js-order-wrapper', this.$el), options = this.options.options;
            jQuery.each(values, function (index, key) {
                $wrapper.append("\n                    <div class=\"js-order-item ac_panel-item-general ac_panel-item-general--2\" data-key=\"" + key + "\">\n                        <span class=\"ac_panel-item-general__title\">\n                            <i class=\"js-order-move acicon acicon-move\"></i>\n                            " + options[key] + "\n                        </span>\n                        <div class=\"ac_panel-item-general__content\"></div>\n                    </div>");
            });
            jQuery('.js-order-wrapper', this.$el).sortable('refresh');
        };
        /**
         * overrides events method()
         */
        AweOrder.prototype.events = function () {
            var _self = this;
            jQuery('.js-order-wrapper', this.$el).sortable({
                items: '> .js-order-item',
                axis: 'y',
                stop: function (event, ui) {
                    var order = [];
                    jQuery('.js-order-item', _self.$el).each(function () {
                        order.push(jQuery(this).attr('data-key'));
                    });
                    _self.setValue(order);
                }
            });
        };
        /**
         * overrides getDefaultValue method
         */
        AweOrder.getDefaultValue = function (options, parentData, name) {
            // set options key is default values if did not set
            if (options.defaultValue === undefined)
                options.defaultValue = Object.keys(options.options);
            // implements parent method
            return ElementForm.getDefaultValue(options, parentData, name);
        };
        return AweOrder;
    }(ElementForm));
    AweBuilder.AweOrder = AweOrder;
    var AweAttributes = (function (_super) {
        __extends(AweAttributes, _super);
        function AweAttributes() {
            _super.apply(this, arguments);
            this.defaultValue = [];
            this.$editItem = null;
        }
        /**
         * overrides validateOptions() method
         */
        AweAttributes.prototype.validateOptions = function (options) {
            _super.prototype.validateOptions.call(this, options);
            // check list element of form
            if (options.formElements === undefined)
                throw Error('You must define elements for attribute form.');
        };
        /**
         * overrides initialize() method
         */
        AweAttributes.prototype.initialize = function (options) {
            // get primary element name
            var elementsKey = Object.keys(options.formElements);
            this.primaryEl = options.primaryEl ? [options.primaryEl] : [elementsKey[0]];
            if (options.primaryEl) {
                if (jQuery.type(options.primaryEl) === 'string') {
                    if (elementsKey[options.primaryEl] !== undefined)
                        this.primaryEl = [options.primaryEl];
                }
                else if (jQuery.type(options.primaryEl) === 'array') {
                    var keys_1 = [];
                    jQuery.each(options.primaryEl, function (index, key) {
                        if (jQuery.inArray(key, elementsKey) !== -1)
                            keys_1.push(key);
                    });
                    if (keys_1.length > 0)
                        this.primaryEl = keys_1;
                }
            }
            _super.prototype.initialize.call(this, options);
        };
        /**
         * render element html
         */
        AweAttributes.prototype.render = function (options) {
            // create attribute form
            this.attrForm = new AweForm(options.formElements, '', { mediaPanel: this.mediaPanel });
            // add content element to element
            this.$el.append("\n                <div class=\"ac_panel-item-general-group\">\n                    <span class=\"ac_panel-item-general-group__title\">" + this.translate(options.title) + "</span>\n                    <div class=\"ac_panel-item-general-group__content\">\n                        <div class=\"js-attr-form awe-attr-form\"></div>\n                        <div class=\"js-buttons awe-attr-buttons\">\n                            <a href=\"#\" class=\"js-attr-save-btn ac_btn ac_btn--1\">" + this.translate('Add') + "</a>\n                            <a href=\"#\" class=\"js-attr-cancel-btn ac_btn ac_btn--2\" style=\"display: none\">" + this.translate('Cancel') + "</a>\n                        </div>\n                        <div class=\"js-attr-list awe-attr-list\" style=\"margin-top: 10px\"></div>\n                    </div>\n                </div>\n            ");
            // init sort for attributes
            var _self = this;
            jQuery('.js-attr-list', this.$el).sortable({
                items: '.js-attr-item',
                axis: 'y',
                start: function (event, ui) {
                    ui.item.data("before-index", ui.item.index());
                },
                stop: function (event, ui) {
                    var values = [], beforeIndex = ui.item.data("before-index"), afterIndex = ui.item.index();
                    jQuery('.js-attr-item', _self.$el).each(function () {
                        var attributes = AweBuilder.parseJSON(jQuery('input[type=hidden]', this).val());
                        values.push(attributes);
                    });
                    _self.setValue(values, { action: 'sort', beforeIndex: beforeIndex, afterIndex: afterIndex });
                }
            });
            // render default values
            if (jQuery.type(options.defaultValue) === 'array') {
                this.changeElementValue(options.defaultValue);
            }
            // add form to content element
            jQuery('.js-attr-form', this.$el).append(this.attrForm.$el);
        };
        /**
         * init events on element
         */
        AweAttributes.prototype.events = function () {
            var _self = this;
            // handle click to button save attribute
            jQuery('.js-buttons > a', this.$el).click(function (event) {
                event.preventDefault();
                // get form value
                if (jQuery(this).hasClass('js-attr-save-btn')) {
                    var attributes = _self.attrForm.getFormValues(), validateCallback = _self.options.validateItem, validateResult = true;
                    if (jQuery.type(validateCallback) === 'function')
                        validateResult = validateCallback(attributes);
                    if (validateResult) {
                        var values = _self.getValue().slice(), extraData = {};
                        if (_self.$editItem) {
                            var index = _self.$editItem.index();
                            values[index] = attributes;
                            extraData = {
                                action: "update",
                                index: index
                            };
                        }
                        else {
                            values.push(attributes);
                            extraData = { action: 'add' };
                        }
                        _self.setValue(values, extraData);
                    }
                }
                // reset form
                _self.attrForm.reset();
                _self.$editItem = null;
                // hide cancel button
                jQuery('.js-attr-cancel-btn', _self.$el).hide();
                jQuery('.js-attr-save-btn', _self.$el).text(_self.translate('Add'));
            });
            // handle click delete
            this.$el.delegate('.js-attr-controllers > i', 'click', function (event) {
                event.preventDefault();
                var $attrItem = jQuery(this).parents('.js-attr-item:first'), values = _self.getValue();
                if (jQuery(this).hasClass('js-attr-del')) {
                    // remove attribute value from list
                    var index = $attrItem.index(), removeItem = values.splice(index, 1);
                    _self.setValue(values, { action: 'delete', index: index, deleteItem: removeItem });
                }
                else {
                    // edit added attribute
                    var attributes = AweBuilder.parseJSON(jQuery('input[type=hidden]', $attrItem).val());
                    _self.attrForm.setFormValues(attributes);
                    _self.$editItem = $attrItem;
                    jQuery('.js-attr-cancel-btn', _self.$el).show();
                    jQuery('.js-attr-save-btn', _self.$el).text(_self.translate('Save'));
                }
            });
        };
        /**
         * render view when change values
         */
        AweAttributes.prototype.changeElementValue = function (values) {
            var _self = this;
            // remove all attributes
            var $attrList = jQuery('.js-attr-list', this.$el).html('');
            // render list attributes
            jQuery.each(values, function (index, attributes) {
                var title = '';
                for (var i = 0; i < _self.primaryEl.length; i++) {
                    if (attributes[_self.primaryEl[i]]) {
                        title = attributes[_self.primaryEl[i]];
                        break;
                    }
                }
                $attrList.append("\n                    <div class=\"js-attr-item ac_panel-item-general ac_panel-item-general--2\">\n                        <span class=\"ac_panel-item-general__title\">\n                            <i class=\"js-attr-move acicon acicon-move\"></i>\n                            " + title + "\n                        </span>\n                        <input type=\"hidden\" value='" + JSON.stringify(attributes) + "'>\n                        <div class=\"ac_panel-item-general__content\">\n                            <div class=\"js-attr-controllers ac_panel-item-general__content-right\">\n                                <i class=\"js-attr-edit acicon acicon-pen\" title=\"" + _self.translate('Edit') + "\"></i>\n                                <i class=\"js-attr-del acicon acicon-del\" title=\"" + _self.translate('Remove') + "\"></i>\n                            </div>\n                        </div>\n                    </div>\n                ");
            });
            // update sort element
            if ($attrList.data('ui-sortable'))
                $attrList.sortable('refresh');
        };
        /**
         * overrides setMediaPanel() method
         */
        AweAttributes.prototype.setMediaPanel = function (mediaPanel) {
            // implements parent method
            _super.prototype.setMediaPanel.call(this, mediaPanel);
            // set media panel for attributes form
            this.attrForm.setMediaPanel(mediaPanel);
        };
        /**
         * overrides getDefaultValue method
         */
        AweAttributes.getDefaultValue = function (options, parentData, name) {
            // set options key is default values if did not set
            if (options.defaultValue === undefined)
                options.defaultValue = [];
            // implements parent method
            return ElementForm.getDefaultValue(options, parentData, name);
        };
        return AweAttributes;
    }(ElementForm));
    AweBuilder.AweAttributes = AweAttributes;
})(AweBuilder || (AweBuilder = {}));
/*
 * method constructor
 * @param <any> model
 * return object
 */
/// <reference path="../../ts-libraries/jquery.d.ts" />
/// <reference path="./awe-content-object.ts" />
var AweBuilder;
(function (AweBuilder) {
    /*
     * method constructor
     * @param <any> model
     * return object
     */
    function acRenderModelStyle(data, option) {
        var settings = {}, styleData = {
            styles: {},
            flags: {}
        };
        if (option)
            styleData.option = option;
        /*
         * method to render style of one part
         * @param <string> part
         * @param <object> partData
         * return void
         */
        function acRenderPartStyle(part, partData) {
            if (partData.style !== undefined) {
                var listStatus = [AweBuilder.STYLE_NORMAL, AweBuilder.STYLE_HOVER, AweBuilder.STYLE_ACTIVE], selector = void 0;
                for (var status_1 in partData.style) {
                    if (jQuery.inArray(status_1, listStatus) >= 0) {
                        selector = part + '.' + status_1;
                        acRenderStatusStyle(selector, partData.style[status_1]);
                    }
                }
            }
        }
        function acRenderStatusStyle(selector, statusData) {
            if (statusData.font !== undefined)
                acRenderStyleData(styleData, selector, 'font', statusData.font, settings, true);
            if (statusData.margin !== undefined)
                acRenderStyleData(styleData, selector, 'margin', statusData.margin, settings, true);
            if (statusData.padding !== undefined)
                acRenderStyleData(styleData, selector, 'padding', statusData.padding, settings, true);
            if (statusData.border !== undefined)
                acRenderStyleData(styleData, selector, 'border', statusData.border, settings, true);
            if (statusData.transform !== undefined)
                acRenderStyleData(styleData, selector, 'transform', statusData.transform, settings, true);
            if (statusData.shadow !== undefined)
                acRenderStyleData(styleData, selector, 'shadow', statusData.shadow, settings, true);
            if (statusData.sizePosition !== undefined)
                acRenderStyleData(styleData, selector, 'sizePosition', statusData.sizePosition, settings, true);
            if (statusData.background !== undefined)
                acRenderStyleData(styleData, selector, 'background', statusData.background, settings, true);
        }
        // main
        if (data !== undefined) {
            if (data instanceof AweBuilder.ContentObject)
                settings = data.get('settings');
            else if (typeof data == 'string')
                settings = jQuery.parseJSON(data);
            else
                settings = data;
        }
        if (Object.keys(settings).length) {
            for (var part in settings) {
                acRenderPartStyle(part, settings[part]);
            }
        }
        return styleData;
    }
    AweBuilder.acRenderModelStyle = acRenderModelStyle;
    /*
     * render style data
     *
     */
    function acRenderStyleData(renderedStyle, selector, brand, data, settings, firstCall) {
        function acGetValue(data) {
            var result = {}, selector_arr = selector.split('.'), selector_not_screen = selector_arr[0] + '.' + selector_arr[1];
            if (data != undefined) {
                if (typeof data == 'object' && !jQuery.isArray(data) && !(data.xl == undefined && data.lg == undefined && data.md == undefined && data.sm == undefined && data.xs == undefined)) {
                    for (var screen_1 in data) {
                        result[selector_not_screen + '.' + screen_1] = data[screen_1];
                    }
                }
                else {
                    result[selector_not_screen + '.xl'] = data;
                }
            }
            return result;
        }
        function getChildStyleData(selector) {
            if (renderedStyle.styles[selector] == undefined)
                renderedStyle.styles[selector] = {};
            return renderedStyle.styles[selector];
        }
        function setDataToChildStyle(childStyleData, key, css_key, data, default_data, firstCall, prefix, suffix, compare) {
            var checkCondition;
            if (prefix == undefined)
                prefix = '';
            if (suffix == undefined)
                suffix = '';
            if (compare !== undefined && compare) {
                checkCondition = eval('data ' + compare);
            }
            else
                checkCondition = data;
            if (checkCondition !== undefined) {
                if (checkCondition)
                    childStyleData[key] = css_key + ':' + prefix + data + suffix + ';';
                else
                    childStyleData[key] = css_key + ':' + default_data + ';';
            }
            else if (firstCall != true)
                delete childStyleData[key];
        }
        /*
         * method to render font
         * @param <object> data
         * @param <boolean> firstCall
         * return string
         */
        function acRenderFontStyle(data, firstCall) {
            var dataEnable = acGetValue(data.enable), deleteItems = ['family', 'weight', 'size', 'align', 'lineHeight', 'letterSpacing', 'font-color', 'font-style', 'text-decoration'];
            if (dataEnable === undefined || !Object.keys(dataEnable).length) {
                deleteAttributeCSS(selector, deleteItems);
            }
            else {
                var data_family = acGetValue(data.family), data_weight = acGetValue(data.weight), data_size = acGetValue(data.size), data_align = acGetValue(data.align), data_lineHeight = acGetValue(data.lineHeight), data_letterSpacing = acGetValue(data.letterSpacing), data_color = acGetValue(data.color), data_styles = acGetValue(data.styles), childStyleData = void 0;
                for (var selector_1 in dataEnable) {
                    childStyleData = getChildStyleData(selector_1);
                    if (dataEnable[selector_1]) {
                        var fontName = data_family[selector_1] ? "\"" + data_family[selector_1] + "\"" : data_family[selector_1], setItalicByFontweight = false;
                        setDataToChildStyle(childStyleData, 'family', 'font-family', fontName, 'inherit', firstCall);
                        if (data_weight[selector_1] && isNaN(data_weight[selector_1])) {
                            if (data_weight[selector_1].indexOf('i') !== -1) {
                                setItalicByFontweight = true;
                                childStyleData['font-style'] = 'font-style:italic;';
                            }
                            else {
                                delete childStyleData['font-style'];
                            }
                            data_weight[selector_1] = parseInt(data_weight[selector_1]);
                        }
                        setDataToChildStyle(childStyleData, 'weight', 'font-weight', data_weight[selector_1], 'inherit', firstCall);
                        setDataToChildStyle(childStyleData, 'size', 'font-size', data_size[selector_1], 'inherit', firstCall, '', '');
                        setDataToChildStyle(childStyleData, 'align', 'text-align', data_align[selector_1], 'inherit', firstCall);
                        setDataToChildStyle(childStyleData, 'lineHeight', 'line-height', data_lineHeight[selector_1], 'inherit', firstCall, '', '');
                        setDataToChildStyle(childStyleData, 'letterSpacing', 'letter-spacing', data_letterSpacing[selector_1], 'inherit', firstCall, '', '');
                        setDataToChildStyle(childStyleData, 'font-color', 'color', data_color[selector_1], 'inherit', firstCall);
                        if (data_styles[selector_1] !== undefined) {
                            if (data_styles[selector_1].length) {
                                // process italic font style
                                var italic = jQuery.inArray('italic', data_styles[selector_1]);
                                if (italic !== -1) {
                                    childStyleData['font-style'] = 'font-style:italic;';
                                    data_styles[selector_1].splice(italic, 1);
                                }
                                else if (!setItalicByFontweight) {
                                    delete childStyleData['font-style'];
                                }
                                // render uppercase text transform
                                var uppercase = jQuery.inArray('uppercase', data_styles[selector_1]);
                                if (uppercase !== -1) {
                                    childStyleData['text-transform'] = 'text-transform:uppercase;';
                                    data_styles[selector_1].splice(uppercase, 1);
                                }
                                else
                                    delete childStyleData['text-transform'];
                                // process text decoration
                                for (var key in data_styles[selector_1]) {
                                    if (data_styles[selector_1][key] == "none" || data_styles[selector_1][key] == 'normal') {
                                        delete data_styles[selector_1][key];
                                    }
                                }
                                // check when data_styles has length > 0 but value is empty
                                if (data_styles[selector_1].length && data_styles[selector_1].join(''))
                                    childStyleData['text-decoration'] = "text-decoration:" + data_styles[selector_1].join(' ') + ";";
                                else
                                    delete childStyleData['text-decoration'];
                            }
                            else {
                                delete childStyleData['text-decoration'];
                                delete childStyleData['text-transform'];
                                if (!setItalicByFontweight)
                                    delete childStyleData['font-style'];
                            }
                        }
                        else if (firstCall != true) {
                            deleteAttributeCSS(selector_1, ['text-decoration', 'text-transform']);
                            if (!setItalicByFontweight)
                                delete childStyleData['font-style'];
                        }
                    }
                    else {
                        deleteAttributeCSS(selector_1, deleteItems);
                    }
                }
            }
        }
        /*
         * method to render margin
         * @param <object> data
         * @param <boolean> firstCall
         * return string
         */
        function acRenderMarginStyle(data, firstCall) {
            var dataEnable = acGetValue(data.enable), deleteItems = ['margin', 'margin-top', 'margin-left', 'margin-right', 'margin-bottom'];
            if (dataEnable === undefined || !Object.keys(dataEnable).length) {
                deleteAttributeCSS(selector, deleteItems);
            }
            else {
                var dataTop = acGetValue(data.top), dataLeft = acGetValue(data.left), dataRight = acGetValue(data.right), dataBottom = acGetValue(data.bottom), childStyleData = void 0;
                for (var selector_2 in dataEnable) {
                    childStyleData = getChildStyleData(selector_2);
                    if (dataEnable[selector_2]) {
                        setDataToChildStyle(childStyleData, 'margin-top', 'margin-top', dataTop[selector_2], 0, firstCall, '', '');
                        setDataToChildStyle(childStyleData, 'margin-left', 'margin-left', dataLeft[selector_2], 0, firstCall, '', '');
                        setDataToChildStyle(childStyleData, 'margin-right', 'margin-right', dataRight[selector_2], 0, firstCall, '', '');
                        setDataToChildStyle(childStyleData, 'margin-bottom', 'margin-bottom', dataBottom[selector_2], 0, firstCall, '', '');
                    }
                    else {
                        deleteAttributeCSS(selector_2, deleteItems);
                    }
                }
            }
        }
        /*
         * method to padding font
         * @param <object> data
         * @param <boolean> firstCall
         * return string
         */
        function acRenderPaddingStyle(data, firstCall) {
            var dataEnable = acGetValue(data.enable), deleteItems = ['padding', 'padding-top', 'padding-left', 'padding-right', 'padding-bottom'];
            if (dataEnable === undefined || !Object.keys(dataEnable).length) {
                deleteAttributeCSS(selector, deleteItems);
            }
            else {
                var dataTop = acGetValue(data.top), dataLeft = acGetValue(data.left), dataRight = acGetValue(data.right), dataBottom = acGetValue(data.bottom), childStyleData = void 0;
                for (var selector_3 in dataEnable) {
                    childStyleData = getChildStyleData(selector_3);
                    if (dataEnable[selector_3]) {
                        setDataToChildStyle(childStyleData, 'padding-top', 'padding-top', dataTop[selector_3], 0, firstCall, '', '');
                        setDataToChildStyle(childStyleData, 'padding-left', 'padding-left', dataLeft[selector_3], 0, firstCall, '', '');
                        setDataToChildStyle(childStyleData, 'padding-right', 'padding-right', dataRight[selector_3], 0, firstCall, '', '');
                        setDataToChildStyle(childStyleData, 'padding-bottom', 'padding-bottom', dataBottom[selector_3], 0, firstCall, '', '');
                    }
                    else {
                        deleteAttributeCSS(selector_3, deleteItems);
                    }
                }
            }
        }
        /*
         * method to render border
         * @param <object> data
         * @param <boolean> firstCall
         * return string
         */
        function acRenderBorderStyle(data, firstCall) {
            var dataEnable = acGetValue(data.enable), dataEnableRadius = acGetValue(data.enableRadius), deleteBorderItems = ['border-top', 'border-left', 'border-right', 'border-bottom'];
            function acRenderBorderItem(childStyleData, key, css_key, data) {
                if (data != undefined) {
                    if (data)
                        childStyleData[key] = css_key + ": " + data + " !important;";
                    else
                        childStyleData[key] = css_key + ": :none;";
                }
                else if (firstCall != true)
                    delete childStyleData[key];
            }
            if (dataEnable === undefined || !Object.keys(dataEnable).length) {
                deleteAttributeCSS(selector, deleteBorderItems);
            }
            else {
                var dataTop = acGetValue(data.top), dataLeft = acGetValue(data.left), dataRight = acGetValue(data.right), dataBottom = acGetValue(data.bottom), childStyleData = void 0;
                for (var selector_4 in dataEnable) {
                    childStyleData = getChildStyleData(selector_4);
                    if (dataEnable[selector_4]) {
                        acRenderBorderItem(childStyleData, 'border-top', 'border-top', dataTop[selector_4]);
                        acRenderBorderItem(childStyleData, 'border-left', 'border-left', dataLeft[selector_4]);
                        acRenderBorderItem(childStyleData, 'border-right', 'border-right', dataRight[selector_4]);
                        acRenderBorderItem(childStyleData, 'border-bottom', 'border-bottom', dataBottom[selector_4]);
                    }
                    else {
                        deleteAttributeCSS(selector_4, deleteBorderItems);
                    }
                }
            }
            // render radius
            var deleteRadiusItems = ['topLeftRadius', 'bottomLeftRadius', 'topRightRadius', 'bottomRightRadius', '-moz-topLeftRadius', '-moz-bottomLeftRadius', '-moz-topRightRadius', '-moz-bottomRightRadius', '-webkit-topLeftRadius', '-webkit-bottomLeftRadius', '-webkit-topRightRadius', '-webkit-bottomRightRadius'];
            if (dataEnableRadius === undefined || !Object.keys(dataEnableRadius).length) {
                deleteAttributeCSS(selector, deleteRadiusItems);
            }
            else {
                var dataRadiusTop = acGetValue(data.topLeftRadius), dataRadiusLeft = acGetValue(data.bottomLeftRadius), dataRadiusRight = acGetValue(data.topRightRadius), dataRadiusBottom = acGetValue(data.bottomRightRadius), childStyleData = void 0;
                for (var selector_5 in dataEnableRadius) {
                    childStyleData = getChildStyleData(selector_5);
                    if (dataEnableRadius[selector_5]) {
                        setDataToChildStyle(childStyleData, 'topLeftRadius', 'border-top-left-radius', dataRadiusTop[selector_5], 0, firstCall, '', '');
                        setDataToChildStyle(childStyleData, '-moz-topLeftRadius', '-moz-border-top-left-radius', dataRadiusTop[selector_5], 0, firstCall, '', '');
                        setDataToChildStyle(childStyleData, '-webkit-topLeftRadius', '-webkit-border-top-left-radius', dataRadiusTop[selector_5], 0, firstCall, '', '');
                        setDataToChildStyle(childStyleData, 'bottomRightRadius', 'border-bottom-right-radius', dataRadiusBottom[selector_5], 0, firstCall, '', '');
                        setDataToChildStyle(childStyleData, '-moz-bottomRightRadius', '-moz-border-bottom-right-radius', dataRadiusBottom[selector_5], 0, firstCall, '', '');
                        setDataToChildStyle(childStyleData, '-webkit-bottomRightRadius', '-webkit-border-bottom-right-radius', dataRadiusBottom[selector_5], 0, firstCall, '', '');
                        setDataToChildStyle(childStyleData, 'topRightRadius', 'border-top-right-radius', dataRadiusRight[selector_5], 0, firstCall, '', '');
                        setDataToChildStyle(childStyleData, '-moz-topRightRadius', '-moz-border-top-right-radius', dataRadiusRight[selector_5], 0, firstCall, '', '');
                        setDataToChildStyle(childStyleData, '-webkit-topRightRadius', '-webkit-border-top-right-radius', dataRadiusRight[selector_5], 0, firstCall, '', '');
                        setDataToChildStyle(childStyleData, 'bottomLeftRadius', 'border-bottom-left-radius', dataRadiusLeft[selector_5], 0, firstCall, '', '');
                        setDataToChildStyle(childStyleData, '-moz-bottomLeftRadius', '-moz-border-bottom-left-radius', dataRadiusLeft[selector_5], 0, firstCall, '', '');
                        setDataToChildStyle(childStyleData, '-webkit-bottomLeftRadius', '-webkit-border-bottom-left-radius', dataRadiusLeft[selector_5], 0, firstCall, '', '');
                    }
                    else {
                        deleteAttributeCSS(selector_5, deleteRadiusItems);
                    }
                }
            }
        }
        /*
         * method to render transform
         * @param <object> data
         * @param <boolean> firstCall
         * return void
         */
        function acRenderTransformStyle(data, firstCall) {
            var dataEnable = acGetValue(data.enable);
            var deleteItems = ['transform', '-moz-transform', '-webkit-transform', 'perspective', '-moz-perspective', '-webkit-perspective'];
            function acSetTransformStyle(transformCSS, key, css_key, data, suffix) {
                if (suffix == undefined)
                    suffix = '';
                if (data) {
                    transformCSS.transform[("transform-" + key)] = css_key + "(" + data + suffix + ")";
                    transformCSS.moz_transform[("-moz-transform-" + key)] = css_key + "(" + data + suffix + ")";
                    transformCSS.webkit_transform[("-webkit-transform-" + key)] = css_key + "(" + data + suffix + ")";
                }
            }
            if (dataEnable === undefined || !Object.keys(dataEnable).length) {
                deleteAttributeCSS(selector, deleteItems);
            }
            else {
                var dataTranslateX = acGetValue(data.translateX), dataTranslateY = acGetValue(data.translateY), dataScaleX = acGetValue(data.scaleX), dataScaleY = acGetValue(data.scaleY), dataRotateX = acGetValue(data.rotateX), dataRotateY = acGetValue(data.rotateY), dataSkewX = acGetValue(data.skewX), dataSkewY = acGetValue(data.skewY), dataPerspective = acGetValue(data.perspective), childStyleData = void 0, transform = {}, moz_transform = {}, webkit_transform = {};
                for (var selector_6 in dataEnable) {
                    childStyleData = getChildStyleData(selector_6);
                    if (dataEnable[selector_6]) {
                        var transformCSS = { transform: {}, moz_transform: {}, webkit_transform: {} };
                        acSetTransformStyle(transformCSS, 'perspective', 'perspective', dataPerspective[selector_6], '');
                        acSetTransformStyle(transformCSS, 'translateX', 'translateX', dataTranslateX[selector_6], '');
                        acSetTransformStyle(transformCSS, 'translateY', 'translateY', dataTranslateY[selector_6], '');
                        acSetTransformStyle(transformCSS, 'scaleX', 'scaleX', dataScaleX[selector_6], '');
                        acSetTransformStyle(transformCSS, 'scaleY', 'scaleY', dataScaleY[selector_6], '');
                        acSetTransformStyle(transformCSS, 'rotateX', 'rotateX', dataRotateX[selector_6], '');
                        acSetTransformStyle(transformCSS, 'rotateY', 'rotateY', dataRotateY[selector_6], '');
                        acSetTransformStyle(transformCSS, 'skewX', 'skewX', dataSkewX[selector_6], '');
                        acSetTransformStyle(transformCSS, 'skewY', 'skewY', dataSkewY[selector_6], '');
                        var has_tranform = jQuery.isEmptyObject(transformCSS.transform) ? false : true;
                        if (has_tranform) {
                            transform = _.toArray(transformCSS.transform).join(' ');
                            moz_transform = _.toArray(transformCSS.moz_transform).join(' ');
                            webkit_transform = _.toArray(transformCSS.webkit_transform).join(' ');
                            if (jQuery.trim(transform) != '')
                                childStyleData['transform'] = 'transform:' + transform + ';';
                            if (jQuery.trim(moz_transform) != '')
                                childStyleData['-moz-transform'] = '-moz-transform:' + moz_transform + ';';
                            if (jQuery.trim(webkit_transform) != '')
                                childStyleData['-webkit-transform'] = '-webkit-transform:' + webkit_transform + ';';
                        }
                        else {
                            childStyleData['transform'] = 'transform:none;';
                            childStyleData['-moz-transform'] = '-moz-transform:none;';
                            childStyleData['-webkit-transform'] = '-webkit-transform:none;';
                        }
                    }
                    else {
                        deleteAttributeCSS(selector_6, deleteItems);
                    }
                }
            }
        }
        /*
         * method to render shadow
         * @param <object> data
         * @param <boolean> firstCall
         * return void
         */
        function acRenderShadowStyle(data, firstCall) {
            if (data.text !== undefined) {
                var dataEnable = acGetValue(data.text.enable);
                if (dataEnable === undefined || !Object.keys(dataEnable).length) {
                    deleteAttributeCSS(selector, ['text-shadow']);
                }
                else {
                    var dataHorizontal = acGetValue(data.text.horizontal), dataVertical = acGetValue(data.text.vertical), dataBlur = acGetValue(data.text.blur), dataColor = acGetValue(data.text.color), childStyleData = void 0, text_shadow = [];
                    for (var selector_7 in dataEnable) {
                        childStyleData = getChildStyleData(selector_7);
                        if (dataEnable[selector_7] !== undefined && dataEnable[selector_7]) {
                            var has_shadow = false;
                            if (dataHorizontal[selector_7] != undefined) {
                                text_shadow.push("" + dataHorizontal[selector_7]);
                                has_shadow = true;
                            }
                            else
                                text_shadow.push("0");
                            if (dataVertical[selector_7] != undefined) {
                                text_shadow.push("" + dataVertical[selector_7]);
                                has_shadow = true;
                            }
                            else
                                text_shadow.push("0");
                            if (dataBlur[selector_7] != undefined) {
                                text_shadow.push("" + dataBlur[selector_7]);
                                has_shadow = true;
                            }
                            if (dataColor[selector_7] != undefined && dataColor[selector_7]) {
                                text_shadow.push(dataColor[selector_7]);
                                has_shadow = true;
                            }
                            if (has_shadow)
                                childStyleData['text-shadow'] = "text-shadow:" + text_shadow.join(" ") + ";";
                        }
                        else
                            delete childStyleData['text-shadow'];
                    }
                }
            }
            else
                deleteAttributeCSS(selector, ['text-shadow']);
            if (data.box !== undefined) {
                var dataEnable = acGetValue(data.box.enable);
                if (dataEnable === undefined || !Object.keys(dataEnable).length) {
                    deleteAttributeCSS(selector, ['box-shadow']);
                }
                else {
                    var dataHorizontal = acGetValue(data.box.horizontal), dataVertical = acGetValue(data.box.vertical), dataBlur = acGetValue(data.box.blur), dataSpread = acGetValue(data.box.spread), dataColor = acGetValue(data.box.color), dataInset = acGetValue(data.box.inset), childStyleData = void 0, box_shadow = [];
                    for (var selector_8 in dataEnable) {
                        childStyleData = getChildStyleData(selector_8);
                        if (dataEnable[selector_8] !== undefined && dataEnable[selector_8]) {
                            var has_shadow = false;
                            if (dataHorizontal[selector_8] !== undefined) {
                                box_shadow.push("" + dataHorizontal[selector_8]);
                                has_shadow = true;
                            }
                            else
                                box_shadow.push("0");
                            if (dataVertical[selector_8] !== undefined) {
                                box_shadow.push("" + dataVertical[selector_8]);
                                has_shadow = true;
                            }
                            else
                                box_shadow.push("0");
                            if (dataBlur[selector_8] !== undefined) {
                                box_shadow.push("" + dataBlur[selector_8]);
                                has_shadow = true;
                            }
                            if (dataSpread[selector_8] !== undefined) {
                                box_shadow.push("" + dataSpread[selector_8]);
                                has_shadow = true;
                            }
                            if (dataColor[selector_8] !== undefined && dataColor[selector_8]) {
                                box_shadow.push(dataColor[selector_8]);
                                has_shadow = true;
                            }
                            if (dataInset[selector_8] !== undefined && dataInset[selector_8]) {
                                box_shadow.push("inset");
                                has_shadow = true;
                            }
                            if (has_shadow)
                                childStyleData['box-shadow'] = "box-shadow: " + box_shadow.join(" ") + ";";
                        }
                        else
                            delete childStyleData['box-shadow'];
                    }
                }
            }
            else
                deleteAttributeCSS(selector, ['box-shadow']);
        }
        /*
         * method to render layout
         * @param <object> data
         * return string
         */
        function acRenderLayoutStyle(data, firstCall) {
            var dataEnableSize = acGetValue(data.enableSize), dataEnablePosition = acGetValue(data.enablePosition);
            // render size
            if (dataEnableSize === undefined || !Object.keys(dataEnableSize).length) {
                deleteAttributeCSS(selector, ['width', 'height', "min-height"]);
            }
            else {
                var dataWidth = acGetValue(data.width), dataHeight = acGetValue(data.height), dataMinHeight = acGetValue(data.minHeight), childStyleData = void 0;
                for (var selector_9 in dataEnableSize) {
                    childStyleData = getChildStyleData(selector_9);
                    if (dataEnableSize[selector_9]) {
                        setDataToChildStyle(childStyleData, 'width', 'width', dataWidth[selector_9], '100%', firstCall, '', '');
                        setDataToChildStyle(childStyleData, 'height', 'height', dataHeight[selector_9], 'auto', firstCall, '', '');
                        setDataToChildStyle(childStyleData, 'min-height', 'min-height', dataMinHeight[selector_9], 'auto', firstCall, '', '');
                    }
                    else {
                        deleteAttributeCSS(selector_9, ['width', 'height', 'min-height']);
                    }
                }
            }
            // render position
            if (dataEnablePosition === undefined || !Object.keys(dataEnablePosition).length) {
                deleteAttributeCSS(selector, ['position', 'zIndex', 'top', 'left', 'right', 'bottom']);
            }
            else {
                var dataPosition = acGetValue(data.position), dataZindex = acGetValue(data.zIndex), dataSpecial = acGetValue(data.special), dataTop = acGetValue(data.top), dataRight = acGetValue(data.right), dataLeft = acGetValue(data.left), dataBottom = acGetValue(data.bottom), childStyleData = void 0;
                for (var selector_10 in dataEnablePosition) {
                    childStyleData = getChildStyleData(selector_10);
                    if (dataEnablePosition[selector_10]) {
                        setDataToChildStyle(childStyleData, 'position', 'position', dataPosition[selector_10], 'static', firstCall, '', '');
                        delete childStyleData['top'];
                        delete childStyleData['left'];
                        delete childStyleData['bottom'];
                        delete childStyleData['right'];
                        delete childStyleData['zIndex'];
                        delete childStyleData['transform'];
                        if (dataEnablePosition[selector_10] !== undefined && dataEnablePosition[selector_10] !== 'static') {
                            setDataToChildStyle(childStyleData, 'zIndex', 'z-index', dataZindex[selector_10], 'auto', firstCall, '', '');
                            switch (dataSpecial[selector_10]) {
                                case "center_center":
                                    setDataToChildStyle(childStyleData, 'left', 'left', '50%', 0, firstCall, '', '');
                                    setDataToChildStyle(childStyleData, 'top', 'top', '50%', 0, firstCall, '', '');
                                    setDataToChildStyle(childStyleData, 'transform', 'transform', 'translate(-50%, -50%)', '', firstCall, '', '');
                                    break;
                                case "center_top":
                                    setDataToChildStyle(childStyleData, 'left', 'left', '50%', 0, firstCall, '', '');
                                    setDataToChildStyle(childStyleData, 'top', 'top', dataTop[selector_10], 0, firstCall, '', '');
                                    setDataToChildStyle(childStyleData, 'transform', 'transform', 'translateX(-50%)', '', firstCall, '', '');
                                    break;
                                case 'center_bottom':
                                    setDataToChildStyle(childStyleData, 'left', 'left', '50%', 0, firstCall, '', '');
                                    setDataToChildStyle(childStyleData, 'bottom', 'bottom', dataBottom[selector_10], 0, firstCall, '', '');
                                    setDataToChildStyle(childStyleData, 'transform', 'transform', 'translateX(-50%)', '', firstCall, '', '');
                                    break;
                                case 'left_center':
                                    setDataToChildStyle(childStyleData, 'top', 'top', '50%', 0, firstCall, '', '');
                                    setDataToChildStyle(childStyleData, 'left', 'left', dataLeft[selector_10], 0, firstCall, '', '');
                                    setDataToChildStyle(childStyleData, 'transform', 'transform', 'translateY(-50%)', '', firstCall, '', '');
                                    break;
                                case 'right_center':
                                    setDataToChildStyle(childStyleData, 'top', 'top', '50%', 0, firstCall, '', '');
                                    setDataToChildStyle(childStyleData, 'right', 'right', dataRight[selector_10], 0, firstCall, '', '');
                                    setDataToChildStyle(childStyleData, 'transform', 'transform', 'translateY(-50%)', '', firstCall, '', '');
                                    break;
                                default:
                                    setDataToChildStyle(childStyleData, 'top', 'top', dataTop[selector_10], 0, firstCall, '', '');
                                    setDataToChildStyle(childStyleData, 'right', 'right', dataRight[selector_10], 0, firstCall, '', '');
                                    setDataToChildStyle(childStyleData, 'bottom', 'bottom', dataBottom[selector_10], 0, firstCall, '', '');
                                    setDataToChildStyle(childStyleData, 'left', 'left', dataLeft[selector_10], 0, firstCall, '', '');
                                    break;
                            }
                        }
                    }
                    else {
                        deleteAttributeCSS(selector_10, ['position', 'zIndex', 'top', 'left', 'right', 'bottom']);
                    }
                }
            }
        }
        /**
         * render style for background overlay
         * @param selector
         * @param color
         */
        function renderBackgroundOverlay(selector, color) {
            var selectorArr = selector.split("."), partName = selectorArr[0];
            if (selectorArr.length >= 3) {
                var styleSelector = partName + "| > .ac_bg__overlay|" + selectorArr[1] + "." + selectorArr[2], overlayStyle = color ? { 'background-color': "background-color:" + color + ";", 'display': "display: block;" } : { "display": "display: none;" };
                acSetDynamicPartStyle(renderedStyle, styleSelector, overlayStyle);
                // fix error not fond overlay div when part has been rendered after element has been rendered
                if (color && settings[partName] !== undefined && settings[partName].selector) {
                    var $elActive = AweBuilder._$(".js-content-object.js-active");
                    if ($elActive.length) {
                        if (!AweBuilder._$(settings[partName].selector + " > .ac_bg__overlay", $elActive).length) {
                            AweBuilder._$("" + settings[partName].selector, $elActive).prepend('<div class="ac_bg__overlay"></div>');
                        }
                    }
                }
            }
        }
        function removeCssFilter(selector, css_filter) {
            var selector_arr = selector.split('.');
            selector_arr[0] += '|' + css_filter + '|';
            selector = selector_arr[0] + selector_arr[1] + '.' + selector_arr[2];
            deleteAttributeCSS(selector, ['background-color']);
        }
        /*
         * method to render background
         * @param <string> selector
         * @param <object> data
         * return string
         */
        function acRenderBackgroundStyle(data, firstCall) {
            var dataEnable = acGetValue(data.enable), dataOverlay = acGetValue(data.overlay), deletedAllItems = ['background-color', 'background-image', 'background-size', 'background-repeat', 'background-position'];
            if (dataEnable === undefined || !Object.keys(dataEnable).length) {
                deleteAttributeCSS(selector, deletedAllItems);
                renderBackgroundOverlay(selector, "");
            }
            else {
                var dataColor = acGetValue(data.color), dataImageFile = {}, dataImageAttachment = {}, dataImageRepeat = {}, dataImagePosition = {}, childStyleData = void 0;
                if (data.image !== undefined) {
                    if (data.image.file !== undefined)
                        dataImageFile = acGetValue(data.image.file);
                    if (data.image.attachment !== undefined)
                        dataImageAttachment = acGetValue(data.image.attachment);
                    if (data.image.repeat !== undefined)
                        dataImageRepeat = acGetValue(data.image.repeat);
                    if (data.image.position !== undefined)
                        dataImagePosition = acGetValue(data.image.position);
                }
                else if (data.isDeleted)
                    deleteAttributeCSS(data.deleteSelector, ['background-image', 'background-size', 'background-repeat', 'background-position']);
                for (var selector_11 in dataEnable) {
                    childStyleData = getChildStyleData(selector_11);
                    if (dataEnable[selector_11]) {
                        // render background overlay
                        renderBackgroundOverlay(selector_11, dataOverlay[selector_11]);
                        if (dataColor[selector_11] != undefined) {
                            if (dataColor[selector_11])
                                childStyleData['background-color'] = 'background-color:' + dataColor[selector_11] + ';';
                            else
                                childStyleData['background-color'] = 'background-color:transparent;';
                        }
                        else if (firstCall != true)
                            delete childStyleData['background-color'];
                        if (dataImageFile[selector_11] !== undefined) {
                            if (dataImageFile[selector_11].fid !== undefined && dataImageFile[selector_11].fid > 0 && dataImageFile[selector_11].url !== undefined && dataImageFile[selector_11].url !== '') {
                                childStyleData['background-image'] = 'background-image:url(' + dataImageFile[selector_11].url + ');';
                                if (dataImageAttachment[selector_11] != undefined && dataImageAttachment[selector_11]) {
                                    if (dataImageAttachment[selector_11] == 'parallax')
                                        dataImageAttachment[selector_11] = 'fixed';
                                    childStyleData['background-attachment'] = 'background-attachment:' + dataImageAttachment[selector_11] + ';';
                                }
                                else if (firstCall != true)
                                    delete childStyleData['background-attachment'];
                                if (dataImageRepeat[selector_11] === undefined || dataImageRepeat[selector_11] == 'auto' || dataImageRepeat[selector_11] == 'cover') {
                                    var bgSize = dataImageRepeat[selector_11] ? dataImageRepeat[selector_11] : "cover";
                                    childStyleData['background-size'] = "background-size: " + bgSize + ";";
                                    delete childStyleData["background-repeat"];
                                }
                                else if (dataImageRepeat[selector_11]) {
                                    childStyleData['background-repeat'] = 'background-repeat:' + dataImageRepeat[selector_11] + ';';
                                    delete childStyleData['background-size'];
                                }
                                if (dataImagePosition[selector_11] != undefined && dataImagePosition[selector_11])
                                    childStyleData['background-position'] = 'background-position:' + dataImagePosition[selector_11] + ';';
                                else if (firstCall != true)
                                    delete childStyleData['background-position'];
                            }
                            else if (dataImageFile[selector_11].url == '' || (dataImageFile[selector_11].url == undefined && (dataImageAttachment[selector_11] !== undefined || dataImageRepeat[selector_11] !== undefined || dataImagePosition[selector_11] !== undefined)))
                                childStyleData['background-image'] = 'background-image:none;';
                        }
                        else if (firstCall != true) {
                            var deleteItems = ['background-image', 'background-size', 'background-repeat', 'background-position'];
                            deleteAttributeCSS(selector_11, deleteItems);
                        }
                    }
                    else {
                        deleteAttributeCSS(selector_11, deletedAllItems);
                        renderBackgroundOverlay(selector_11, "");
                    }
                }
            }
        }
        function deleteAttributeCSS(selector, deletedData) {
            var childStyleData = renderedStyle.styles[selector];
            if (childStyleData !== undefined) {
                jQuery(deletedData).each(function (key, value) {
                    delete childStyleData[value];
                });
            }
        }
        function deleteAllScreenAttributeCSS(deletedData) {
            for (var selector_12 in renderedStyle) {
                deleteAttributeCSS(selector_12, deletedData);
            }
        }
        // main
        switch (brand) {
            case 'font':
                acRenderFontStyle(data, firstCall);
                break;
            case 'background':
                acRenderBackgroundStyle(data, firstCall);
                break;
            case 'margin':
                acRenderMarginStyle(data, firstCall);
                break;
            case 'padding':
                acRenderPaddingStyle(data, firstCall);
                break;
            case 'border':
                acRenderBorderStyle(data, firstCall);
                break;
            case 'transform':
                acRenderTransformStyle(data, firstCall);
                break;
            case 'shadow':
                acRenderShadowStyle(data, firstCall);
                break;
            case 'sizePosition':
                acRenderLayoutStyle(data, firstCall);
                break;
        }
    }
    AweBuilder.acRenderStyleData = acRenderStyleData;
    /*
     * set data style
     */
    function acSetDataStyle(renderedStyle, selector, value, settings, flagInlineCSS) {
        acChangeNewRenderedStyle(renderedStyle);
        function getEnableAllFields(brand) {
            var fields;
            switch (brand) {
                case 'font':
                    fields = ['family', 'weight', 'size', 'align', 'lineHeight', 'letterSpacing', 'font-color', 'font-style', 'text-decoration'];
                    break;
                case 'background':
                    fields = ['background-color', 'background-image', 'background-size', 'background-repeat', 'background-position'];
                    break;
                case 'margin':
                    fields = ['margin-top', 'margin-left', 'margin-right', 'margin-bottom'];
                    break;
                case 'padding':
                    fields = ['padding-top', 'padding-left', 'padding-right', 'padding-bottom'];
                    break;
                case 'border':
                    fields = ['border-top', 'border-left', 'border-right', 'border-bottom', 'topLeftRadius', 'bottomRightRadius', 'topRightRadius', 'bottomRightRadius', '-moz-topLeftRadius', '-moz-bottomRightRadius', '-moz-topRightRadius', '-moz-bottomRightRadius', '-webkit-topLeftRadius', '-webkit-bottomRightRadius', '-webkit-topRightRadius', '-webkit-bottomRightRadius'];
                    break;
                case 'transform':
                    fields = ['transform', '-moz-transform', '-webkit-transform', 'perspective', '-moz-perspective', '-webkit-perspective'];
                    break;
                case 'shadow':
                    fields = ['box-shadow', 'text-shadow'];
                    break;
                case 'sizePosition':
                    fields = ['width', 'height', 'position', 'zIndex', 'top', 'left', 'right', 'bottom'];
                    break;
            }
            return fields;
        }
        function getInlineChangeCSS(renderedStyle, selector, brand, field, field_parent) {
            var fields = [field, brand + '-' + field, '-moz-' + field, '-webkit-' + field], css_inline = '';
            if (field !== 'enable' && field !== 'enableRadius') {
                if (brand == 'background') {
                    if (field == 'file')
                        fields.push('background-image');
                    else if (field == 'repeat')
                        fields.push('background-size');
                }
                else if (brand == 'transform' && field !== 'perspective') {
                    fields = _.union(fields, ['transform', '-moz-transform', '-webkit-transform']);
                }
                else if (brand == 'shadow') {
                    if (field_parent == 'text')
                        fields.push('text-shadow');
                    else
                        fields.push('box-shadow');
                }
                else if (brand == 'font' && field == 'styles') {
                    fields = _.union(fields, ['font-style', 'text-decoration']);
                }
            }
            else {
                fields = getEnableAllFields(brand);
            }
            jQuery(fields).each(function (key, data) {
                if (renderedStyle.styles[selector] !== undefined) {
                    if (renderedStyle[selector][data])
                        css_inline += renderedStyle.styles[selector][data];
                }
            });
            return css_inline;
        }
        //update css
        var selector_array = selector.split('.'), selector_length = selector_array.length, part = selector_array[0], status = selector_array[2], brand = selector_array[3], screen = selector_array[selector_length - 1], field = selector_array[selector_length - 2], field_parent = selector_array[selector_length - 3], data = {};
        if (jQuery.inArray(screen, ['xl', 'lg', 'md', 'sm', 'xs']) === -1)
            screen = 'xl';
        var selectorRender = part + '.' + status + '.' + screen;
        if (Object.keys(settings).length && eval('settings.' + part + '.style' + ' !== undefined && settings.' + part + '.style.' + status + ' !== undefined')) {
            data = eval('settings.' + part + '.style.' + status + '.' + brand);
            if (data == undefined)
                data = {};
            data['isDeleted'] = false;
        }
        else {
            data['isDeleted'] = true;
            data['deleteSelector'] = selectorRender;
        }
        acRenderStyleData(renderedStyle, selectorRender, brand, data, settings, false);
        // remove attribute
        delete data['isDeleted'];
        if (flagInlineCSS) {
            return getInlineChangeCSS(renderedStyle, selectorRender, brand, field, field_parent);
        }
    }
    AweBuilder.acSetDataStyle = acSetDataStyle;
    function acSetDynamicDataStyle(renderedStyle, selector, key, value) {
        acChangeNewRenderedStyle(renderedStyle);
        var selector_array = selector.split('.'), selector_length = selector_array.length;
        if (selector_length > 3) {
            var part = selector_array[0], status_2 = selector_array[2], screen_2 = selector_array[selector_length - 1];
            selector = part + '.' + status_2 + '.' + screen_2;
        }
        else if (selector_length == 2)
            selector += '.xl';
        if (renderedStyle.styles[selector] === undefined)
            renderedStyle.styles[selector] = {};
        // delete style
        if (renderedStyle.styles[selector][key] && value == '')
            delete renderedStyle.styles[selector][key];
        else {
            renderedStyle.styles[selector][key] = value;
        }
    }
    AweBuilder.acSetDynamicDataStyle = acSetDynamicDataStyle;
    /*
     * set part dynamic
     */
    function acSetDynamicPartStyle(renderedStyle, selector, data) {
        acChangeNewRenderedStyle(renderedStyle);
        if (renderedStyle.styles[selector] == undefined) {
            if (data && jQuery.type(data) == 'object')
                renderedStyle.styles[selector] = data;
            else
                renderedStyle.styles[selector] = {};
        }
        else if (data && jQuery.type(data) == 'object') {
            renderedStyle.styles[selector] = jQuery.extend(true, {}, renderedStyle[selector], data);
        }
    }
    AweBuilder.acSetDynamicPartStyle = acSetDynamicPartStyle;
    /*
     * get style data of one item
     * @param <object> renderedStyle
     * @param <string> cid
     * @param <object> settings
     */
    function acGetStringStyle(renderedStyle, cid, settings) {
        var fullcontent = '';
        var _loop_1 = function(selector) {
            var dataObj = renderedStyle.styles[selector], style_arr = void 0;
            style_arr = _.toArray(dataObj);
            if (style_arr.length && !jQuery.isEmptyObject(settings)) {
                var css_content = style_arr.length ? jQuery.trim(style_arr.join(' ')) : '';
                // create css selector
                var first_letter = selector.substring(0, 1), is_new_part = (first_letter == '.' || first_letter == '#') ? true : false, selector_array = selector.split('.'), selector_css_1 = [], hasFilter = (selector.indexOf('|') > -1), cssFilter_1 = '', idSelector_1 = ".js-content-object.js-el-" + cid, part = void 0, status_3, screen_3 = void 0;
                if (renderedStyle.option.machineName == 'menu') {
                    if (renderedStyle.option.level == 1)
                        idSelector_1 = '.js-content-object  ul.awemenu ' + idSelector_1;
                    else
                        idSelector_1 = '.js-content-object .awemenu-item ' + idSelector_1;
                }
                if (hasFilter)
                    selector_array = selector.split('|');
                if (selector_array.length >= 3) {
                    if (hasFilter) {
                        part = selector_array[0];
                        cssFilter_1 = selector_array[1];
                        selector_array = selector_array[2].split('.');
                        status_3 = selector_array[0];
                        screen_3 = selector_array[1];
                    }
                    else if (is_new_part) {
                        var selector_length = selector_array.length;
                        screen_3 = selector_array[selector_length - 1];
                        status_3 = selector_array[selector_length - 2];
                        if (selector_length == 3)
                            part = selector_array[0];
                        else {
                            part = '.' + selector_array[1];
                        }
                    }
                    else {
                        part = selector_array[0];
                        status_3 = selector_array[1];
                        screen_3 = selector_array[2];
                    }
                    var part_setting = !is_new_part ? settings[part] : {};
                    if (!is_new_part) {
                        if (part_setting !== undefined && part_setting.selector !== undefined && part_setting.selector) {
                            var partSelectorArr = jQuery.type(part_setting.selector) === 'array' ? part_setting.selector : part_setting.selector.split(',');
                            jQuery.each(partSelectorArr, function (index, partSelector) {
                                selector_css_1.push(idSelector_1 + " " + partSelector.trim() + cssFilter_1);
                            });
                        }
                        else {
                            if (part === 'main')
                                selector_css_1.push("" + idSelector_1 + cssFilter_1);
                            else
                                selector_css_1.push(idSelector_1 + " .not-child-selector");
                        }
                    }
                    else
                        selector_css_1.push(idSelector_1 + " " + part + cssFilter_1);
                    // process for status
                    if (status_3 !== 'normal') {
                        jQuery.each(selector_css_1, function (id, selectorCss) {
                            if (selectorCss.indexOf(':') > -1) {
                                var firstPos = selectorCss.indexOf(':');
                                selector_css_1[id] = selectorCss.substr(0, firstPos) + ".ac-" + status_3 + selectorCss.substr(firstPos) + ", " + selectorCss.substr(0, firstPos) + "." + status_3 + selectorCss.substr(firstPos) + ", " + selectorCss.substr(0, firstPos) + ":" + status_3 + selectorCss.substr(firstPos);
                            }
                            else
                                selector_css_1[id] = selectorCss + ".ac-" + status_3 + ", " + selectorCss + ":" + status_3;
                        });
                    }
                    var joinedSelectors = selector_css_1.join(', ');
                    if (css_content) {
                        switch (screen_3) {
                            case 'lg':
                                fullcontent += '@media(max-width:1199px){' + joinedSelectors + '{' + css_content + '}} ';
                                break;
                            case 'md':
                                fullcontent += '@media(max-width:991px){' + joinedSelectors + '{' + css_content + '}} ';
                                break;
                            case 'sm':
                                fullcontent += '@media(max-width:767px){' + joinedSelectors + '{' + css_content + '}} ';
                                break;
                            case 'xs':
                                fullcontent += '@media(max-width:575px){' + joinedSelectors + '{' + css_content + '}} ';
                                break;
                            default:
                                fullcontent += joinedSelectors + '{' + css_content + '} ';
                        }
                    }
                }
            }
        };
        for (var selector in renderedStyle.styles) {
            _loop_1(selector);
        }
        return fullcontent;
    }
    AweBuilder.acGetStringStyle = acGetStringStyle;
})(AweBuilder || (AweBuilder = {}));
function acChangeNewRenderedStyle(renderedStyle) {
    if (jQuery.isEmptyObject(renderedStyle)) {
        renderedStyle.styles = {};
    }
    else if (renderedStyle.styles === undefined) {
        renderedStyle.styles = renderedStyle;
    }
    renderedStyle.flags = {};
}
/**
 * File: awe-render-animation.ts
 * Author: CongNv
 * Website: http://megadrupal.com/
 * Created: 05/2016
 */
/// <reference path="../../ts-libraries/jquery.d.ts" />
/// <reference path="./awe-content-object.ts" />
var AweBuilder;
(function (AweBuilder) {
    /*
     * method constructor
     * @param <any> model
     * return object
     */
    function acRenderModelAnimation(data) {
        var settings = {}, styleData = {};
        // main
        if (data !== undefined) {
            if (data instanceof AweBuilder.ContentObject)
                settings = data.get('settings');
            else if (typeof data == 'string')
                settings = AweBuilder.parseJSON(data);
            else
                settings = data;
        }
        if (Object.keys(settings).length) {
            for (var part in settings) {
                if (settings[part].animation !== undefined) {
                    acRenderAnimationData(styleData, part, settings[part].animation, settings, true);
                }
            }
        }
        return styleData;
    }
    AweBuilder.acRenderModelAnimation = acRenderModelAnimation;
    /*
     * render animation data
     *
     */
    function acRenderAnimationData(renderedAnimation, part, data, settings, firstCall) {
        function acGetValue(data) {
            var result = {};
            if (data != undefined) {
                if (typeof data == 'object' && !jQuery.isArray(data) && !(data.xl == undefined && data.lg == undefined && data.md == undefined && data.sm == undefined && data.xs == undefined)) {
                    for (var screen_4 in data) {
                        result[part + '.' + screen_4] = data[screen_4];
                    }
                }
                else {
                    result[part + '.xl'] = data;
                }
            }
            return result;
        }
        function getChildStyleData(selector) {
            if (renderedAnimation[selector] == undefined)
                renderedAnimation[selector] = {};
            return renderedAnimation[selector];
        }
        // main
        var enable = acGetValue(data.enable), animation = acGetValue(data.animation), advance = acGetValue(data.advance), linear = acGetValue(data.linear), cubic = acGetValue(data.cubic), duration = acGetValue(data.duration), delay = acGetValue(data.delay), childAnimationData;
        if (!Object.keys(enable).length) {
            if (data.currentSelector !== undefined) {
                childAnimationData = getChildStyleData(data.currentSelector);
                childAnimationData.enable = false;
            }
        }
        else {
            for (var selector in enable) {
                var style = {};
                childAnimationData = getChildStyleData(selector);
                childAnimationData.enable = enable[selector];
                childAnimationData.defaultClass = 'animated';
                if (enable[selector] !== undefined) {
                    childAnimationData.prevClass = childAnimationData.class;
                    if (animation[selector] != undefined)
                        childAnimationData.class = animation[selector];
                    else
                        childAnimationData.class = 'fadeIn';
                    if (advance[selector] != undefined && advance[selector]) {
                        if (linear[selector] != undefined && linear[selector]) {
                            if (linear[selector] == 'cubic-bezier' && cubic[selector] != undefined && cubic[selector])
                                style['animation-timing-function'] = 'cubic-bezier(' + cubic[selector] + ')';
                            else
                                style['animation-timing-function'] = linear[selector];
                        }
                        if (duration[selector] != undefined && duration[selector])
                            style['animation-duration'] = duration[selector];
                        if (delay[selector] != undefined && delay[selector])
                            style['animation-delay'] = delay[selector];
                    }
                    else {
                        style = { 'animation-timing-function': 'ease', 'animation-duration': '300ms', 'animation-delay': '' };
                    }
                }
                childAnimationData.style = style;
            }
        }
    }
    AweBuilder.acRenderAnimationData = acRenderAnimationData;
    /*
     * set data animation
     */
    function acSetDataAnimation(renderedAnimation, selector, value, settings) {
        //update css
        var selector_array = selector.split('.'), part = selector_array[0], screen = selector_array[selector_array.length - 1], newSelector = part + '.' + screen, data = {};
        if (Object.keys(settings).length) {
            data = eval('settings.' + part + '.animation');
            if (data == undefined) {
                data = {};
            }
        }
        data['currentSelector'] = newSelector;
        acRenderAnimationData(renderedAnimation, part, data, settings, false);
    }
    AweBuilder.acSetDataAnimation = acSetDataAnimation;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: tab.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 04/15/2016
 */
/// <reference path="../../core/awe-tabs.ts"/>
/// <reference path="../../core/awe-content-object.ts"/>
/// <reference path="./navigator-panel.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var NavTab = (function (_super) {
        __extends(NavTab, _super);
        function NavTab() {
            _super.apply(this, arguments);
        }
        /**
         * implements init ()
         */
        NavTab.prototype.init = function () {
            this.openedTabs = [];
        };
        /**
         * get current responsive mode
         * @return string
         */
        NavTab.prototype.getResponsiveMode = function () {
            return this.responsiveMode;
        };
        /**
         * change responsive mode by responsive panel
         * @param mode: new responsive mode
         */
        NavTab.prototype.setResponsiveMode = function (mode) {
            // set value
            this.responsiveMode = mode;
            // update responsive mode change
            this.updateResponsiveModeChange();
        };
        /**
         * update change responsive mode to view
         */
        NavTab.prototype.updateResponsiveModeChange = function () {
            // implements change responsive mode in view
            if (this.view.$el.is(':visible'))
                this.view.updateTab();
        };
        /**
         * activate tab
         */
        NavTab.prototype.activate = function () {
            this.view.activateTab();
        };
        /**
         * change active model when select a model in navigator or click edit button on view
         */
        NavTab.prototype.setActiveModel = function (model) {
            // set new active model and update view of tab
            this.activeModel = model;
            this.updateResponsiveModeChange();
            // disable tab when active model is undefined
            this.view.updateHeaderDisplay((model !== undefined));
        };
        /**
         * get model is settings
         */
        NavTab.prototype.getActiveModel = function () {
            return this.activeModel;
        };
        /**
         * process when click to back button on panel header
         */
        NavTab.prototype.processBackBtnClicked = function () {
            // remove first tab
            if (this.openedTabs.length) {
                var removeTab = this.openedTabs.shift();
                removeTab.getView().hideTab();
                removeTab.getView().changeHeader();
            }
            // hide back button if number openedTab equal 0
            if (this.openedTabs.length === 0 && this.navigatorPanel)
                this.navigatorPanel.getView().hideBackBtn();
        };
        /**
         * close all opened sub tabs
         */
        NavTab.prototype.closeAllOpenTabs = function () {
            while (this.openedTabs.length > 0)
                this.processBackBtnClicked();
        };
        /**
         * overrides createView() method
         */
        NavTab.prototype.createView = function () {
            this.view = new NavTabView({ model: this });
        };
        /**
         * get navigator panel object
         */
        NavTab.prototype.getNavigatorPanel = function () {
            return this.navigatorPanel;
        };
        /**
         * set navigator panel object what contains this tab
         */
        NavTab.prototype.setNavigatorPanel = function (panel) {
            this.navigatorPanel = panel;
        };
        return NavTab;
    }(AweBuilder.Tab));
    AweBuilder.NavTab = NavTab;
    var NavTabView = (function (_super) {
        __extends(NavTabView, _super);
        function NavTabView() {
            _super.apply(this, arguments);
        }
        /**
         * process when tab is activated
         */
        NavTabView.prototype.activateTab = function () {
        };
        /**
         * update view for tab when change properties
         */
        NavTabView.prototype.updateTab = function () {
            this.activateTab();
        };
        /**
         * disable tab
         */
        NavTabView.prototype.updateHeaderDisplay = function (show) {
            if (show)
                this.$header.removeClass('ac_disable');
            else
                this.$header.addClass('ac_disable');
        };
        return NavTabView;
    }(AweBuilder.TabView));
    AweBuilder.NavTabView = NavTabView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: navigator-tab.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 04/12/2016
 */
/// <reference path="../../../ts-libraries/jquery.ui.d.ts"/>
/// <reference path="./tab.ts"/>
/// <reference path="./navigator-panel.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var NavigatorTab = (function (_super) {
        __extends(NavigatorTab, _super);
        function NavigatorTab(attributes) {
            if (attributes === undefined || attributes.content === undefined)
                throw Error('Data of navigator content must be is AweContentObject.Collection');
            _super.call(this, attributes);
        }
        /**
         * overrides init method
         */
        NavigatorTab.prototype.init = function () {
            _super.prototype.init.call(this);
            this.set('title', 'Navigator');
            this.set('headerHTML', '<i class="acicon acicon-bar"></i>');
            this.set('activeModel', null);
        };
        /**
         * overrides createView() method
         */
        NavigatorTab.prototype.createView = function () {
            this.view = new NavigatorTabView({ model: this });
        };
        /**
         * overrides setActiveMode()
         */
        NavigatorTab.prototype.setActiveModel = function (model) {
            // deactivate current active model
            var activeModel = this.getActiveModel();
            if (activeModel && model && model.cid !== activeModel.cid) {
                // deactivate current model
                if (activeModel)
                    activeModel.deactivate();
                // implements parent method
                _super.prototype.setActiveModel.call(this, model);
            }
        };
        /**
         * overrides update responsive mode method
         */
        NavigatorTab.prototype.updateResponsiveModeChange = function () {
            // implement parent method
            _super.prototype.updateResponsiveModeChange.call(this);
            // update responsive mode to content objects
            var content = this.get('content'), responsiveMode = this.getResponsiveMode();
            if (content instanceof AweBuilder.ContentObjects) {
                content.each(function (model, index) {
                    model.setResponsiveMode(responsiveMode);
                });
            }
            else
                content.setResponsiveMode(responsiveMode);
        };
        return NavigatorTab;
    }(AweBuilder.NavTab));
    AweBuilder.NavigatorTab = NavigatorTab;
    var NavigatorTabView = (function (_super) {
        __extends(NavigatorTabView, _super);
        function NavigatorTabView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize() method
         */
        NavigatorTabView.prototype.initialize = function () {
            this.listenTo(this.model, 'change', this.applyChange);
            // implements parent method
            _super.prototype.initialize.call(this);
        };
        /**
         * overrides renderContent() method
         */
        NavigatorTabView.prototype.renderTabContent = function () {
            var _self = this, content = this.model.get('content');
            // render view for elements in builder
            this.$el.append(content.getNavigatorView().$el);
            // handle click out navigator item
            this.$el.click(function (event) {
                if (jQuery(event.target).closest('.js-nav-item').length === 0) {
                    var navigatorPanel = _self.model.getNavigatorPanel();
                    if (navigatorPanel)
                        navigatorPanel.setActiveModel(undefined);
                }
            });
        };
        /**
         * apply model change
         */
        NavigatorTabView.prototype.applyChange = function () {
            var _self = this, changedAttributes = this.model.changedAttributes();
            jQuery.map(changedAttributes, function (value, name) {
                switch (name) {
                    case 'content':
                        var content = _self.model.get('content');
                        _self.$el.empty().append(content.getNavigatorView().$el);
                        break;
                }
            });
        };
        /**
         * overrides disable method
         */
        NavigatorTabView.prototype.updateHeaderDisplay = function () { };
        return NavigatorTabView;
    }(AweBuilder.NavTabView));
})(AweBuilder || (AweBuilder = {}));
/**
 * File: style-item-tab.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 04/16/2016
 */
/// <reference path="../../core/awe-tabs.ts"/>
/// <reference path="../../core/awe-form-elements.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var StyleItemTab = (function (_super) {
        __extends(StyleItemTab, _super);
        function StyleItemTab(mediaPanel, options) {
            _super.call(this, options);
            this.mediaPanel = mediaPanel;
        }
        /**
         * implements custom init
         */
        StyleItemTab.prototype.init = function () {
            this.selectedPart = 'main';
            this.selectedState = 'normal';
        };
        /**
         * overrides createView() method
         */
        StyleItemTab.prototype.createView = function () {
            this.view = new StyleItemTabView({ model: this });
        };
        StyleItemTab.prototype.setResponsiveMode = function (mode) {
            this.responsiveMode = mode;
            this.updateSelector();
        };
        StyleItemTab.prototype.getResponsiveMode = function () {
            return this.responsiveMode;
        };
        StyleItemTab.prototype.getActiveModel = function () {
            return this.activeModel;
        };
        StyleItemTab.prototype.setValues = function (activeModel, selectedPart, responsiveMode, selectedState, viewCallback) {
            this.activeModel = activeModel;
            this.selectedPart = selectedPart;
            this.responsiveMode = responsiveMode;
            this.selectedState = selectedState;
            this.updateSelector();
            if (viewCallback === undefined) {
                var view = this.view;
                // update header view
                view.changeHeader();
                // update visible form
                if (view.$el.hasClass('awe-tab-active')) {
                    view.updateSettingsForm();
                }
            }
            else {
                this.view[viewCallback]();
            }
        };
        StyleItemTab.prototype.getSelectedPart = function () {
            return this.selectedPart;
        };
        StyleItemTab.prototype.getSelectedState = function () {
            return this.selectedState;
        };
        StyleItemTab.prototype.updateSelector = function () {
            this.selector = this.selectedPart + ".style." + this.selectedState + "." + this.get('styleType');
        };
        StyleItemTab.prototype.getStyle = function (selector, responsiveMode) {
            if (this.activeModel) {
                // process selector
                if (selector === undefined)
                    selector = this.selector;
                // get elements in tab values
                return this.activeModel.getSettingsAttr(selector);
            }
        };
        /**
         * get settings data of active model type
         */
        StyleItemTab.prototype.getStyleForm = function () {
            if (this.activeModel) {
                var machineName = this.activeModel.getMachineName(), selectors = this.selector.split('.'), part = selectors.shift(), styleForm = window.AweBuilderSettings.styleForms[(machineName + "-" + part)];
                // get form elements
                if (styleForm !== undefined) {
                    // remove style key
                    selectors.shift();
                    // get form elements of tab key
                    var formElements = void 0;
                    try {
                        formElements = eval("styleForm." + selectors.join('.'));
                    }
                    catch (error) {
                        formElements = undefined;
                    }
                    return formElements;
                }
            }
        };
        /**
         * get selector value of this tab
         */
        StyleItemTab.prototype.getSelector = function () {
            return this.selector;
        };
        return StyleItemTab;
    }(AweBuilder.Tab));
    AweBuilder.StyleItemTab = StyleItemTab;
    var StyleItemTabView = (function (_super) {
        __extends(StyleItemTabView, _super);
        function StyleItemTabView() {
            _super.apply(this, arguments);
        }
        /*
         * overrides initialize() method
         */
        StyleItemTabView.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            this.headerTemplate = _.template("\n                <li class=\"js-disable\" data-cid=\"<%= id %>\">\n                    <a class=\"js-item-style\" href=\"#tab-<%= id %>\">\n                        <div class=\"js-style-item ac_style-item\">\n                            <span class=\"title\">" + this.translate('<%= title %>') + "</span>\n                            <span class=\"js-header-style ac_style-item__content\"></span>\n                        </div>\n                    </a>\n                </li>");
        };
        /*
        * overrides renderHeader() method
        */
        StyleItemTabView.prototype.renderHeader = function () {
            var headerHTML = this.model.get('headerHTML'), header = {
                id: this.model.cid,
                title: this.model.get('title'),
                header: headerHTML !== undefined ? headerHTML : ''
            };
            this.$header = jQuery(this.headerTemplate(header));
            return this.$header;
        };
        /*
         * overrides renderContent() method
         */
        StyleItemTabView.prototype.renderTabContent = function () {
            this.$el.addClass('tab-panel');
            this.$el.append('<div class="js-row-content pd15"></div>');
            var elements = this.model.get('content'), styleType = this.model.get('styleType');
            // create elements Form
            this.settingsForm = new AweBuilder.AweForm(elements, "style." + styleType, { mediaPanel: this.model.mediaPanel });
            this.$el.find('.js-row-content').append(this.settingsForm.$el);
        };
        /**
         * change header value base in active model value
         */
        StyleItemTabView.prototype.changeHeader = function () {
            var model = this.model, formElements = model.getStyleForm(), headerText = '';
            // remove changed form value flag
            jQuery('.js-style-item', this.$header).removeClass('value-change');
            // disable tab header
            this.$header.addClass('ac_disable');
            // process status for item tab
            if (formElements !== undefined) {
                var responsiveMode = model.getResponsiveMode(), headerCallback = this.model.get('renderHeader');
                // show header tab
                if (formElements.devices !== false || (formElements.devices === false && responsiveMode === AweBuilder.RES_XL)) {
                    // remove ac_disable class
                    this.$header.removeClass('ac_disable');
                    // render header text for item tab
                    if (jQuery.type(headerCallback) === 'function') {
                        this.updateSettingsForm();
                        var values = this.settingsForm.getFormValues(), headerRender = headerCallback(values);
                        // get text of header
                        headerText = headerRender.text;
                        // add class to define values is changed
                        if (headerRender.changed) {
                            jQuery('.js-style-item', this.$header).addClass('value-change');
                        }
                    }
                    else
                        throw Error("Header callback must be function.");
                }
            }
            jQuery('.js-header-style', this.$header).html(headerText);
        };
        /**
         * check tab's elements value in current mode
         */
        StyleItemTabView.prototype.tabChanged = function (formValues) {
            var output = false, model = this.model, activeModel = model.getActiveModel(), activeModelType = activeModel.getMachineName(), defaultSettings = AweBuilder.ContentObject.generateObjectSettings(activeModelType), defaultValues = activeModel.getSettingsAttr(model.getSelector(), defaultSettings), resMode = model.getResponsiveMode();
            if (typeof formValues === 'object' && resMode !== undefined) {
                var elements = Object.keys(formValues);
                for (var i = 0; i < elements.length; i++) {
                    var defaultValue = defaultValues[elements[i]][resMode], value = formValues[elements[i]];
                    if ((defaultValue === undefined && value !== undefined) || (defaultValue !== undefined && value[resMode] !== undefined)) {
                        output = true;
                        break;
                    }
                }
            }
            return output;
        };
        /**
         * update value in active model to elements form
         */
        StyleItemTabView.prototype.updateSettingsForm = function () {
            var model = this.model, activeModel = model.getActiveModel(), _self = this;
            if (activeModel) {
                var selectedPart = model.getSelectedPart(), selectedState = model.getSelectedState(), responsiveMode = model.getResponsiveMode(), selector = selectedPart + ".style." + selectedState + "." + this.model.get('styleType');
                this.settingsForm.update(activeModel, responsiveMode, selectedState, selector);
                // update font-weight by font-family when cahnge style by part, status
                if (this.model.get('styleType') == 'font') {
                    console.log('change font-weight');
                    var fontTab = activeModel.getSettingsAttr(selector);
                    if (fontTab && fontTab.enable && fontTab.enable[responsiveMode]) {
                        if (fontTab.family && fontTab.family[responsiveMode]) {
                            jQuery(".el-family ul.option-list li[data-val='" + fontTab.family[responsiveMode] + "']", this.settingsForm.$el).trigger('click');
                        }
                        if (fontTab.weight && fontTab.weight[responsiveMode]) {
                            jQuery(".el-weight ul.option-list li[data-val='" + fontTab.weight[responsiveMode] + "']", this.settingsForm.$el).trigger('click');
                        }
                        var $partList_1 = _self.settingsForm.$el.closest('.awe-tabs').find('> .js-part-status .el-part .option-list');
                        setTimeout(function () {
                            if ($partList_1.hasClass('js-active'))
                                $partList_1.removeClass('js-active').hide();
                        }, 50);
                    }
                    else {
                        // default                        
                        jQuery(".el-weight ul.option-list", this.settingsForm.$el).empty();
                        jQuery(".el-weight span.val > span", this.settingsForm.$el).text('Normal');
                    }
                }
            }
        };
        /**
         * hide tab when
         */
        StyleItemTabView.prototype.hideTab = function () {
            jQuery('a', this.$header).trigger('click');
        };
        return StyleItemTabView;
    }(AweBuilder.TabView));
    AweBuilder.StyleItemTabView = StyleItemTabView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: style-tab.ts
 * Author: CongNv
 * Website: http://megadrupal.com/
 * Created: 04/12/2016
 */
/// <reference path="../../core/awe-content-object.ts"/>
/// <reference path="./tab.ts"/>
/// <reference path="./navigator-panel.ts"/>
/// <reference path="./style-item-tab.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var NavStyleTab = (function (_super) {
        __extends(NavStyleTab, _super);
        /**
         * constructor function
         */
        function NavStyleTab(mediaPanel, options) {
            _super.call(this, options);
            this.mediaPanel = mediaPanel;
            _super.prototype.initialize.call(this);
        }
        /**
         * override default initialize follow
         */
        NavStyleTab.prototype.initialize = function () {
        };
        /*
         * overrides init() method
         */
        NavStyleTab.prototype.init = function () {
            var _self = this, tabCollection = new AweBuilder.TabCollection();
            // implements parent method
            _super.prototype.init.call(this);
            // set default attributes
            this.set('title', 'Style');
            this.set('headerHTML', '<i class="acicon acicon-style"></i>');
            this.set('activeModel', null);
            // render styles tabs
            var defaultStyles = jQuery.extend(true, {}, AweBuilder.STYLE_ELEMENTS);
            jQuery.map(defaultStyles, function (tab, name) {
                var options = jQuery.extend(true, {}, tab);
                options.content = options.elements;
                options.styleType = name;
                tabCollection.add(new AweBuilder.StyleItemTab(_self.mediaPanel, options));
            });
            // render tab content is tabs of style item tab
            var settings = {
                plugin: {
                    event: 'click',
                    active: false,
                    collapsible: true,
                    activate: function (event, data) {
                        // add tab to list open tabs
                        var activeTab = data.newTab ? tabCollection.get(data.newTab.attr('data-cid')) : null;
                        if (activeTab) {
                            _self.openedTabs.unshift(activeTab);
                            _self.navigatorPanel.getView().showBackBtn();
                            activeTab.getView().updateSettingsForm();
                        }
                    },
                    deactivate: function ($tab) {
                    }
                },
                view: {
                    hasWrapper: false,
                    initScrollBar: false,
                    contentWrapperClasses: "ac_tab--style2",
                    navigatorClasses: 'js-tab-style-list ac_tab-nav'
                }
            };
            this.set('content', new AweBuilder.Tabs({ content: tabCollection, settings: settings, title: 'Tab content style' }));
        };
        /*
         * overrides createView() method
         */
        NavStyleTab.prototype.createView = function () {
            this.view = new NavStyleTabView({ model: this });
        };
        /**
         * overrides setActiveModel() method
         */
        NavStyleTab.prototype.setActiveModel = function (model) {
            // set current model is previous model
            this.prevModel = this.getActiveModel();
            // set new active model
            _super.prototype.setActiveModel.call(this, model);
            // update view state class and status controller
            this.view.updateModelStateView();
            this.view.updateStatusController(model);
            // close all sub-tabs in this tab
            this.closeAllOpenTabs();
        };
        /**
         * get previous active model
         */
        NavStyleTab.prototype.getPrevModel = function () {
            return this.prevModel;
        };
        /**
         * overrides updateResponsiveModeChange() method
         */
        NavStyleTab.prototype.updateResponsiveModeChange = function (mode) {
            var styleItems = this.get('content').get('content'), responsiveMode = mode ? mode : this.getResponsiveMode();
            // update responsive mode value for each style item tab
            styleItems.each(function (tab, index) {
                tab.setResponsiveMode(responsiveMode);
            });
            // implements parent method
            _super.prototype.updateResponsiveModeChange.call(this);
        };
        return NavStyleTab;
    }(AweBuilder.NavTab));
    AweBuilder.NavStyleTab = NavStyleTab;
    var NavStyleTabView = (function (_super) {
        __extends(NavStyleTabView, _super);
        function NavStyleTabView() {
            _super.apply(this, arguments);
        }
        /*
         * overrides initialize() method
         */
        NavStyleTabView.prototype.initialize = function () {
            this.selectedPart = 'main';
            this.selectedState = 'normal';
            this.topContentTemplate = _.template("\n                <div class=\"js-part-status ac_panel__styles pd15 pb0\">\n                    <div class=\"js-ac-row ac_row\">\n                        <div class=\"ac_1-col js_select-list-item js-disable\"></div>\n                        <div class=\"ac_1-col\">\n                            <ul class=\"js-disable js-links-status links-states\">\n                            <span class=\"js-status-normal active\" data-value=\"normal\"><%= normalText %></span>\n                            <span  class=\"js-status-hover\" data-value=\"hover\"><%= hoverText %></span>\n                            <span  class=\"js-status-active\" data-value=\"active\"><%= activeText %></span>\n                            </ul>\n                        </div>\n                    </div>\n                </div>\n            ");
            _super.prototype.initialize.call(this);
        };
        /**
         * handle event in tab view
         * @return {any} [description]
         */
        NavStyleTabView.prototype.events = function () {
            return {
                "click > .js-ac-tabs .js-part-status .js-links-status span": "changeStyleState"
            };
        };
        /*
         * overrides renderContent() method
         */
        NavStyleTabView.prototype.renderTabContent = function () {
            // collection tabs
            var content = this.model.get('content');
            if (content instanceof AweBuilder.Abstract) {
                var $contentView = content.getView().$el;
                // add content view html
                this.$el.append($contentView);
                // add top content before content tabs navigator
                var _self_9 = this, topContent = this.topContentTemplate({
                    normalText: this.translate('Normal'),
                    hoverText: this.translate('Hover'),
                    activeText: this.translate('Active')
                });
                jQuery('> ul', $contentView).before(topContent);
                // initialize for part controller
                var options = {
                    type: 'select',
                    $el: jQuery('.js_select-list-item', this.$el),
                    options: {
                        'main': this.translate('Main')
                    },
                    title: this.translate('Part'),
                    defaultValue: 'main',
                    selector: 'style.part',
                    inlineTitle: true,
                    change: function () {
                        _self_9.changePart();
                    }
                };
                this.partController = new AweBuilder.AweSelect(options, undefined);
            }
        };
        /*
         * method to reset style item tab by status
         */
        NavStyleTabView.prototype.changeStyleState = function (event) {
            var $state = jQuery(event.target);
            if (!$state.hasClass('ac_disable')) {
                var $selected = jQuery(event.target);
                // set selected state
                this.selectedState = $selected.attr('data-value');
                // active selected state
                $selected.parent().find('.active').removeClass('active');
                $selected.addClass('active');
                // change style item header by state
                this.updateStyleItemTabs();
            }
        };
        /**
         * handle change part style settings
         */
        NavStyleTabView.prototype.changePart = function () {
            var activeModel = this.model.getActiveModel(), prevPart = this.selectedPart;
            // set new selected part
            this.selectedPart = this.partController.getValue();
            // reset selected state
            this.updateStatusController(activeModel);
            // change style item header by state
            this.updateStyleItemTabs();
            // implements change part callback
            var elSettings = activeModel ? window.AweBuilderSettings.elements[activeModel.getMachineName()] : undefined;
            if (elSettings && typeof elSettings.changePart === 'function')
                elSettings.changePart(this.selectedPart, prevPart, this.$el, activeModel.getView().$el);
        };
        /**
         * reset all data in tab content
         */
        NavStyleTabView.prototype.resetTabContent = function () {
            this.selectedPart = 'main';
            this.partController.setValue(this.selectedPart);
            this.selectedState = 'normal';
            jQuery('.js-links-status > span.active', this.$el).removeClass('active');
            jQuery("span.js-status-" + this.selectedState, this.$el).addClass('active');
        };
        /**
         * implements when tab is activated
         */
        NavStyleTabView.prototype.activateTab = function () {
            // implements parent method
            _super.prototype.activateTab.call(this);
            // update tab form
            var activeModel = this.model.getActiveModel();
            activeModel.getDefaultStyle();
            if (activeModel && (this.activeModel === undefined || this.activeModel.cid !== activeModel.cid)) {
                this.activeModel = activeModel;
                this.updateStatusController(activeModel);
                this.updatePartController(activeModel);
            }
        };
        /**
         * update view for part controller
         */
        NavStyleTabView.prototype.updatePartController = function (activeModel) {
            var partOptions = { main: this.translate('Main') };
            // reset form
            this.selectedPart = "main";
            jQuery('.js_select-list-item', this.$el).addClass('ac_disable');
            // process part controller based on active model
            if (activeModel) {
                var modelType = activeModel.getMachineName(), defaultSettings_1 = AweBuilder.ContentObject.generateObjectSettings(modelType), parts = Object.keys(defaultSettings_1);
                if (parts.length > 1) {
                    // allows change part
                    jQuery('.js_select-list-item', this.$el).removeClass('ac_disable');
                    // set new parts for activeModel
                    var _self_10 = this;
                    jQuery.each(parts, function (index, part) {
                        if (part !== 'main')
                            partOptions[part] = defaultSettings_1[part].title ? _self_10.translate(defaultSettings_1[part].title) : _self_10.translate(part);
                    });
                }
                // set default part for part controller
                var machineName = activeModel.getMachineName(), settings = window.AweBuilderSettings.elements[machineName];
                if (settings && settings.defaultPart !== undefined && partOptions[settings.defaultPart] !== undefined)
                    this.selectedPart = settings.defaultPart;
                // fix for menubox
                if (machineName === 'menubox' && activeModel.get('defaultPart'))
                    this.selectedPart = activeModel.get('defaultPart');
            }
            this.partController.setOptions(partOptions);
            this.partController.setValue(this.selectedPart);
        };
        /**
         * update for status controller in tab
         */
        NavStyleTabView.prototype.updateStatusController = function (activeModel) {
            // reset status controller
            jQuery('.js-links-status > span.active', this.$el).removeClass('active');
            jQuery('.js-links-status', this.$el).addClass('ac_disable');
            // init status controller base on active model
            if (activeModel) {
                var _self_11 = this, modelType = activeModel.getMachineName(), defaultSettings = AweBuilder.ContentObject.generateObjectSettings(modelType), selector = this.selectedPart + ".style", styles = activeModel.getSettingsAttr(selector, defaultSettings);
                if (styles !== undefined) {
                    // show status controller
                    jQuery('.js-links-status', this.$el).removeClass('ac_disable');
                    jQuery('.js-links-status > span', this.$el).addClass('ac_disable');
                    // enable status
                    var status_4 = styles ? Object.keys(styles) : [];
                    jQuery.each(status_4, function (index, state) {
                        var $state = jQuery(".js-links-status > span.js-status-" + state, _self_11.$el);
                        $state.removeClass('ac_disable');
                        if (index === 0) {
                            $state.addClass('active');
                            _self_11.selectedState = 'normal';
                        }
                    });
                }
            }
        };
        /*
         * update header style item tab after click back button
         */
        NavStyleTabView.prototype.updateHeaderStyleItemTab = function (model) {
            var content = this.model.get('content'), tabCollection = content.get('content'), tab_view;
            if (tabCollection && tabCollection instanceof Backbone.Collection) {
                for (var i = 0; i < tabCollection.length; i++) {
                    tab_view = tabCollection.at(i).getView();
                    tab_view.resetStyle({ activeModel: model });
                }
            }
        };
        /**
         * update state view for active model
         */
        NavStyleTabView.prototype.updateModelStateView = function () {
            // change state of new active model view
            var activeModel = this.model.getActiveModel(), $activeView = activeModel ? activeModel.getView().$el : null;
            if ($activeView)
                $activeView.removeClass('ac_normal ac_hover ac_active').addClass("ac_" + this.selectedState);
            // reset state of previous active model view
            var prevModel = this.model.getPrevModel(), $prevView = prevModel ? prevModel.getView().$el : null;
            if ($prevView)
                $prevView.removeClass('ac_normal ac_hover ac_active');
        };
        /**
         * update style item tabs when change activeModel, part, state
         */
        NavStyleTabView.prototype.updateStyleItemTabs = function () {
            var _self = this, activeModel = this.model.getActiveModel(), responsiveMode = this.model.getResponsiveMode(), content = this.model.get('content').get('content');
            // update state class for active
            this.updateModelStateView();
            // update active model to style item tabs
            content.each(function (styleItemTab, index) {
                styleItemTab.setValues(activeModel, _self.selectedPart, responsiveMode, _self.selectedState);
            });
        };
        /**
         * update view when change responsive mode
         */
        NavStyleTabView.prototype.updateTab = function () {
            // implements update style item tabs
            this.updateStyleItemTabs();
        };
        return NavStyleTabView;
    }(AweBuilder.NavTabView));
})(AweBuilder || (AweBuilder = {}));
/**
 * File: animation-tab.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 05/26/2016
 */
/// <reference path="tab.ts" />
var AweBuilder;
(function (AweBuilder) {
    var AnimationTab = (function (_super) {
        __extends(AnimationTab, _super);
        function AnimationTab() {
            var options = {
                title: 'Animation',
                headerHTML: '<i class="acicon acicon-animation"></i>'
            };
            _super.call(this, options);
        }
        /**
         * overrides createView() method
         */
        AnimationTab.prototype.createView = function () {
            this.view = new AnimationTabView({ model: this });
        };
        AnimationTab.prototype.setResponsiveMode = function (mode) {
            return _super.prototype.setResponsiveMode.call(this, mode);
        };
        return AnimationTab;
    }(AweBuilder.NavTab));
    AweBuilder.AnimationTab = AnimationTab;
    /**
     * Define view class for Animation tab
     */
    var AnimationTabView = (function (_super) {
        __extends(AnimationTabView, _super);
        function AnimationTabView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides renderTabContent()
         */
        AnimationTabView.prototype.renderTabContent = function () {
            var _self = this;
            // Render part controller
            this.partController = new AweBuilder.AweSelect({
                type: 'select',
                options: {
                    'main': this.translate('Main')
                },
                title: this.translate('Part'),
                defaultValue: 'main',
                selector: 'style.part',
                inlineTitle: true,
                change: function () {
                    var part = _self.partController.getValue(), activeModel = _self.model.getActiveModel(), modelType = activeModel ? activeModel.getMachineName() : '', elSettings = window.AweBuilderSettings.elements[modelType], prevPart = _self.selectedPart;
                    // update form with new part update
                    _self.selectedPart = part;
                    _self.updateForm();
                    // implements changePart callback in element settings
                    if (elSettings && typeof elSettings.changePart === 'function')
                        elSettings.changePart(part, prevPart, _self.form.$el, activeModel.getView().$el);
                }
            });
            // init form
            this.form = new AweBuilder.AweForm(AweBuilder.ANIMATION_ELEMENTS, 'main.animation', { className: 'pd15' });
            this.form.$wrapper.prepend(this.partController.$el);
            this.$el.append(this.form.$el);
        };
        /**
         * overrides activeTab() method
         */
        AnimationTabView.prototype.activateTab = function () {
            // implements parent method
            _super.prototype.activateTab.call(this);
            // implement update tab's form
            var activeModel = this.model.getActiveModel();
            if (activeModel) {
                this.activeModel = activeModel;
                // update part controller
                this.updatePartController();
                // update form elements(
                var responsiveMode = this.model.getResponsiveMode();
                this.form.update(activeModel, responsiveMode, undefined, this.selectedPart + ".animation");
            }
        };
        /**
         * update part controller when active tab
         */
        AnimationTabView.prototype.updatePartController = function () {
            var activeModel = this.activeModel, $partController = this.partController.$el, partOptions = {
                main: this.translate('Main')
            };
            // disable by default
            this.selectedPart = "main";
            $partController.addClass('ac_disable');
            // process part controller based on active model
            if (activeModel) {
                var settings_1 = activeModel.get('settings'), parts = Object.keys(settings_1);
                if (parts.length > 1) {
                    // allows change part
                    $partController.removeClass('ac_disable');
                    // set new parts for activeModel
                    var _self_12 = this;
                    jQuery.each(parts, function (index, part) {
                        if (part !== 'main')
                            partOptions[part] = settings_1[part].title ? _self_12.translate(settings_1[part].title) : _self_12.translate(part);
                    });
                }
            }
            this.partController.setOptions(partOptions);
            this.partController.setValue(this.selectedPart);
        };
        /**
         * update form element values
         */
        AnimationTabView.prototype.updateForm = function () {
            var activeModel = this.model.getActiveModel();
            this.form.update(activeModel, this.model.getResponsiveMode(), undefined, this.selectedPart + ".animation");
        };
        return AnimationTabView;
    }(AweBuilder.NavTabView));
    AweBuilder.AnimationTabView = AnimationTabView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: settings-tab.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 05/09/2016
 */
/// <reference path="tab.ts" />
/// <reference path="../../core/awe-form-elements.ts" />
var AweBuilder;
(function (AweBuilder) {
    var NavSettingsTab = (function (_super) {
        __extends(NavSettingsTab, _super);
        function NavSettingsTab(mediaPanel) {
            var options = {
                title: 'Settings',
                headerHTML: '<i class="acicon acicon-setting"></i>'
            };
            _super.call(this, options);
            this.mediaPanel = mediaPanel;
            _super.prototype.initialize.call(this);
        }
        /**
         * overrides initialize() method
         */
        NavSettingsTab.prototype.initialize = function () { };
        /**
         * overrides createView() method
         */
        NavSettingsTab.prototype.createView = function () {
            this.view = new NavSettingsTabView({ model: this });
        };
        /**
         * get mediaPanel view object
         */
        NavSettingsTab.prototype.getMediaPanel = function () {
            return this.mediaPanel;
        };
        return NavSettingsTab;
    }(AweBuilder.NavTab));
    AweBuilder.NavSettingsTab = NavSettingsTab;
    var NavSettingsTabView = (function (_super) {
        __extends(NavSettingsTabView, _super);
        function NavSettingsTabView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize() method
         */
        NavSettingsTabView.prototype.initialize = function () {
            this.settingsForms = {};
            this.selectedPart = 'main';
            // create part controller element
            var _self = this, options = {
                type: 'select',
                options: {
                    'main': this.translate('Main')
                },
                title: this.translate('Part'),
                defaultValue: 'main',
                selector: 'settings.part',
                inlineTitle: true,
                change: function ($panel, $el, values, element) {
                    if (_self.activeForm)
                        _self.activeForm.$el.hide();
                    var part = _self.partController.getValue(), activeModel = _self.model.getActiveModel(), modelType = activeModel.getMachineName(), formName = modelType + "-" + part, elSettings = window.AweBuilderSettings.elements[modelType], prevPart = _self.selectedPart;
                    // update part form
                    _self.selectedPart = part;
                    _self.activeForm = _self.settingsForms[formName];
                    _self.activeForm.$wrapper.prepend(_self.partController.$el);
                    _self.activeForm.$el.show();
                    _self.updateForm();
                    // implements change part callback
                    if (elSettings && typeof elSettings.changePart === 'function')
                        elSettings.changePart(part, prevPart, _self.activeForm.$el, activeModel.getView().$el);
                }
            };
            this.partController = new AweBuilder.AweSelect(options);
            _super.prototype.initialize.call(this);
        };
        /**
         * implements when tab activated
         */
        NavSettingsTabView.prototype.activateTab = function () {
            var activeModel = this.model.getActiveModel(), responsiveMode = this.model.getResponsiveMode();
            if (activeModel && (this.activeModel === undefined || this.activeModel.cid !== activeModel.cid)) {
                this.activeModel = activeModel;
                // disable previous active form
                if (this.activeForm)
                    this.activeForm.$el.hide();
                var machineName_1 = activeModel.getMachineName(), parts = this.getActiveModelParts(), formName = machineName_1 + "-" + parts[0];
                // get settings form
                this.activeForm = this.settingsForms[formName];
                if (this.activeForm === undefined) {
                    var _self_13 = this, mediaPanel_1 = this.model.getMediaPanel(), settingForms_1 = window.AweBuilderSettings.settingForms[machineName_1];
                    // create settings form base on parts of model
                    jQuery.each(parts, function (index, part) {
                        var partFormName = machineName_1 + "-" + part, partForm = settingForms_1[part];
                        // set mediaPanel for settings form
                        partForm.setMediaPanel(mediaPanel_1);
                        // add settings form to list form
                        _self_13.settingsForms[partFormName] = partForm;
                        _self_13.$el.append(partForm.$el.hide());
                    });
                    // set first form is default active form
                    this.activeForm = this.settingsForms[(machineName_1 + "-" + parts.shift())];
                }
                // update active model
                this.activeForm.update(activeModel, responsiveMode);
                this.activeForm.$el.show();
                // add part controller view to active form
                this.updatePartController();
                this.activeForm.$wrapper.prepend(this.partController.$el);
            }
            // implements parent method
            _super.prototype.activateTab.call(this);
        };
        /**
         * update status for part controller element base on active model
         */
        NavSettingsTabView.prototype.updatePartController = function () {
            var activeModel = this.model.getActiveModel(), partOptions = {};
            // reset part controller
            this.partController.$el.addClass('ac_disable');
            // process part controller based on active model
            if (activeModel) {
                var modelType = activeModel.getMachineName(), defaultSettings_2 = AweBuilder.ContentObject.generateObjectSettings(modelType), parts = this.getActiveModelParts();
                if (parts.length > 1)
                    this.partController.$el.removeClass('ac_disable');
                // set new parts for activeModel
                var _self_14 = this;
                jQuery.each(parts, function (index, part) {
                    if (part === 'main')
                        partOptions['main'] = _self_14.translate('Main');
                    else
                        partOptions[part] = defaultSettings_2[part].title ? _self_14.translate(defaultSettings_2[part].title) : _self_14.translate(part);
                });
                // set default part for part controller
                var machineName = activeModel.getMachineName(), settings = window.AweBuilderSettings.elements[machineName];
                if (settings && settings.defaultPart !== undefined && partOptions[settings.defaultPart] !== undefined)
                    this.selectedPart = settings.defaultPart;
                else
                    this.selectedPart = parts[0];
                // fix for menubox
                if (machineName === 'menubox' && activeModel.get('defaultPart'))
                    this.selectedPart = activeModel.get('defaultPart');
            }
            this.partController.setOptions(partOptions);
            this.partController.setValue(this.selectedPart);
        };
        /**
         * get parts of activeModel
         */
        NavSettingsTabView.prototype.getActiveModelParts = function () {
            var activeModel = this.model.getActiveModel(), parts = [];
            if (activeModel) {
                var modelType = activeModel.getMachineName(), defaultSettings = AweBuilder.ContentObject.generateObjectSettings(modelType), customSettings_1 = window.AweBuilderSettings.settingForms[modelType];
                jQuery.each(Object.keys(defaultSettings), function (index, partName) {
                    if (customSettings_1[partName] !== undefined)
                        parts.push(partName);
                });
            }
            return parts;
        };
        /**
         * update active form
         */
        NavSettingsTabView.prototype.updateForm = function () {
            var activeModel = this.model.getActiveModel(), responsiveMode = activeModel ? activeModel.getResponsiveMode() : '', part = this.selectedPart;
            if (this.activeForm)
                this.activeForm.update(activeModel, responsiveMode, undefined, part + ".settings");
        };
        return NavSettingsTabView;
    }(AweBuilder.NavTabView));
    AweBuilder.NavSettingsTabView = NavSettingsTabView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: css-tab.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 09/29/2016
 */
var AweBuilder;
(function (AweBuilder) {
    var CssTab = (function (_super) {
        __extends(CssTab, _super);
        function CssTab() {
            var options = {
                title: 'CSS',
                headerHTML: '<i class="acicon acicon-css"></i>'
            };
            _super.call(this, options);
        }
        /**
         * overrides createView()
         */
        CssTab.prototype.createView = function () {
            this.view = new CssTabView({ model: this });
        };
        return CssTab;
    }(AweBuilder.NavTab));
    AweBuilder.CssTab = CssTab;
    var CssTabView = (function (_super) {
        __extends(CssTabView, _super);
        function CssTabView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides renderTabContent()
         */
        CssTabView.prototype.renderTabContent = function () {
            var _self = this, formElements = {
                id: {
                    type: 'input',
                    title: "ID",
                    inlineTitle: true,
                    devices: false,
                    defaultValue: "",
                    change: function ($panel, el, values) {
                        _self.updateActiveModel(values.current, "id");
                    }
                },
                classes: {
                    type: "input",
                    title: "Classes",
                    devices: false,
                    inlineTitle: true,
                    defaultValue: "",
                    change: function ($panel, el, values) {
                        _self.updateActiveModel(values.current, "classes");
                    }
                },
                css: {
                    type: "textarea",
                    title: "Custom CSS",
                    devices: false,
                    size: "large",
                    defaultValue: "",
                    change: function ($panel, el, values) {
                        _self.updateActiveModel(values.current, "css");
                    }
                }
            };
            this.form = new AweBuilder.AweForm(formElements, "css", { className: "pd15" });
            this.$el.append(this.form.$el);
        };
        /**
         * overrides activateTab()
         */
        CssTabView.prototype.activateTab = function () {
            _super.prototype.activateTab.call(this);
            var activeModel = this.model.getActiveModel();
            if (activeModel) {
                this.form.$el.removeClass("ac_disable");
                this.form.setFormValues(activeModel.get("customStyles"));
            }
            else {
                this.form.$el.addClass("ac_disable");
            }
        };
        /**
         * update change value to activated model
         */
        CssTabView.prototype.updateActiveModel = function (value, name) {
            var activeModel = this.model.getActiveModel(), customStyle = activeModel.get("customStyles");
            customStyle[name] = value;
            activeModel.set("customStyles", customStyle);
        };
        return CssTabView;
    }(AweBuilder.NavTabView));
    AweBuilder.CssTabView = CssTabView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: navigator-panel.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 04/10/2016
 */
/// <reference path="../../core/awe-panel.ts"/>
/// <reference path="../../core/awe-content-object.ts"/>
/// <reference path="./navigator-tab.ts"/>
/// <reference path="./style-tab.ts"/>
/// <reference path="./animation-tab.ts"/>
/// <reference path="./settings-tab.ts"/>
/// <reference path="./css-tab.ts"/>
/// <reference path="../media/media-panel.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var NavigatorPanel = (function (_super) {
        __extends(NavigatorPanel, _super);
        /**
         * constructor function
         */
        function NavigatorPanel(builderObjects, mediaPanel) {
            var settings = {
                enableBackBtn: true,
                position: 'left',
                hideDefault: true
            };
            // implements parent constructor
            _super.call(this, { title: 'Navigator', content: '', settings: settings });
            // init content for panel
            var _self = this, navigatorTab = new AweBuilder.NavigatorTab({ content: builderObjects }), styleTab = new AweBuilder.NavStyleTab(mediaPanel), settingsTab = new AweBuilder.NavSettingsTab(mediaPanel), animationTab = new AweBuilder.AnimationTab(), cssTab = new AweBuilder.CssTab(), navigatorContent = new AweBuilder.Tabs({
                content: [navigatorTab, settingsTab, styleTab, animationTab, cssTab],
                title: 'Tab content',
                settings: {
                    plugin: {
                        active: 0,
                        activate: function (event, data) {
                            // save active tab
                            _self.activeTab = navigatorContent.get('content').get(data.newTab.attr('data-cid'));
                            _self.set('title', _self.activeTab.get('title'));
                            // update activeModel to active tab
                            if (_self.activeTab instanceof AweBuilder.NavTab)
                                _self.activeTab.activate();
                            // close all subtabs in closed tab
                            var prevTab = data.prevTab ? navigatorContent.get('content').get(data.prevTab.attr('data-cid')) : null;
                            if (prevTab)
                                prevTab.closeAllOpenTabs();
                        }
                    }
                }
            });
            // store navigator tab object
            this.navigatorTab = navigatorTab;
            // set navigator panel to tabs
            navigatorContent.get('content').each(function (tab) {
                tab.setNavigatorPanel(_self);
                tab.getView().updateHeaderDisplay(false);
            });
            // set tabs as content of panel
            this.set('content', navigatorContent);
            // set media panel property
            this.mediaPanel = mediaPanel;
            // set default responsive mode
            this.setResponsiveMode(AweBuilder.RES_XL);
        }
        /*
         * method to set active model from view
         */
        NavigatorPanel.prototype.setActiveModel = function (model) {
            var _self = this, view = this.view;
            // set model to tab
            this.activeModel = model;
            this.get('content').get('content').each(function (tab, index) {
                tab.setActiveModel(model);
            });
        };
        /**
         * set activate tab
         */
        NavigatorPanel.prototype.setActivateTab = function (tab) {
            // set activate tab object
            if (jQuery.type(tab) === 'number')
                this.activeTab = this.get('content').get('content').at(tab);
            else
                this.activeTab = tab;
            // activate tab in view
            this.getView().activateTab();
        };
        /**
         * change responsiveMode for settings
         */
        NavigatorPanel.prototype.setResponsiveMode = function (mode) {
            if (mode)
                this.responsiveMode = mode;
            else
                mode = this.responsiveMode;
            this.get('content').get('content').each(function (tab, index) {
                tab.setResponsiveMode(mode);
            });
        };
        /**
         * overrides createView()
         */
        NavigatorPanel.prototype.createView = function () {
            this.view = new NavigatorPanelView({ model: this });
        };
        /**
         * get active tab model
         */
        NavigatorPanel.prototype.getActiveTab = function (index) {
            if (index !== undefined)
                this.setActivateTab(index);
            return this.activeTab;
        };
        /**
         * delete active model
         */
        NavigatorPanel.prototype.deleteActiveModel = function (deleteModel) {
            if (this.activeModel && deleteModel && this.activeModel.cid === deleteModel.cid)
                this.setActiveModel(undefined);
        };
        /**
         * set elements of navigator
         */
        NavigatorPanel.prototype.setElements = function (elements) {
            this.navigatorTab.set('content', elements);
            this.setResponsiveMode();
            this.setActiveModel(undefined);
            this.view.close();
        };
        return NavigatorPanel;
    }(AweBuilder.Panel));
    AweBuilder.NavigatorPanel = NavigatorPanel;
    var NavigatorPanelView = (function (_super) {
        __extends(NavigatorPanelView, _super);
        function NavigatorPanelView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize() method
         */
        NavigatorPanelView.prototype.initialize = function () {
            // implements parent method
            _super.prototype.initialize.call(this);
            // create event handle when model edit
            var _self = this, model = this.model;
            this.$el.bind('activateModel', function (event, data) {
                // set activate model
                model.setActiveModel(data.model);
                // open panel & activate style tab
                if (data.showPanel) {
                    model.setActivateTab(1);
                    _self.open();
                }
            });
            // listen change in content attribute
            this.listenTo(this.model, 'change', this.renderChanges);
        };
        /**
         * overrides back event click
         */
        NavigatorPanelView.prototype.back = function (event) {
            var activeTab = this.model.getActiveTab();
            if (activeTab)
                activeTab.processBackBtnClicked();
        };
        /**
         * activate tab in navigator tabs
         */
        NavigatorPanelView.prototype.activateTab = function (tabId) {
            var activeTab = this.model.getActiveTab(tabId);
            if (activeTab) {
                // set panel title
                jQuery('.js-ac-panel-header > h2', this.$el).html(activeTab.get('title'));
                // show content of activated tab
                var $tabHeader = activeTab.getView().getHeader();
                jQuery('a', $tabHeader).trigger('click');
            }
        };
        /**
         * render changes of model
         */
        NavigatorPanelView.prototype.renderChanges = function () {
            var _self = this, changes = this.model.changedAttributes();
            jQuery.each(changes, function (index, attribute) {
                switch (attribute) {
                    case 'content':
                        _self.render();
                        break;
                }
            });
        };
        return NavigatorPanelView;
    }(AweBuilder.PanelView));
    AweBuilder.NavigatorPanelView = NavigatorPanelView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: awe-content-object.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 04/07/2016
 */
/// <reference path="../../ts-libraries/jquery.ui.d.ts"/>
/// <reference path="./awe-abstract.ts"/>
/// <reference path="./awe-form-elements.ts"/>
/// <reference path="./awe-render-style.ts"/>
/// <reference path="./awe-render-animation.ts"/>
/// <reference path="../panels/navigator/navigator-panel.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var ContentObject = (function (_super) {
        __extends(ContentObject, _super);
        /**
         * constructor function
         */
        function ContentObject(options) {
            if (options === undefined)
                options = {};
            // prepare settings attribute
            if (options.settings === undefined) {
                options.settings = {};
                // process selector for parts
                var defaultSettings = ContentObject.generateObjectSettings(options.machineName);
                jQuery.map(defaultSettings, function (partSettings, part) {
                    options.settings[part] = { selector: partSettings.selector ? partSettings.selector : '' };
                });
            }
            if (jQuery.type(options.settings) === 'object')
                options.settings = JSON.stringify(options.settings);
            // prepare for content attribute
            if (options.content) {
                if (options.contentType === undefined)
                    options.contentType = jQuery.type(options.content) === 'object' ? options.content.constructor.name : jQuery.type(options.content);
                else {
                    var contentClass = eval("AweBuilder." + options.contentType);
                    if (contentClass && !(options.content instanceof contentClass)) {
                        options.content = new contentClass(options.content);
                    }
                }
            }
            // prepare for custom style settings
            if (options.customStyles === undefined) {
                options.customStyles = JSON.stringify({
                    id: "",
                    classes: "",
                    css: ""
                });
            }
            // prepare renderedStyle and rendered animation
            var styleOptions = {};
            if (options.machineName == 'menu') {
                styleOptions.machineName = 'menu';
                styleOptions.level = options.level;
            }
            options.renderedStyle = AweBuilder.acRenderModelStyle(options.settings, styleOptions);
            options.renderedAnimation = AweBuilder.acRenderModelAnimation(options.settings);
            // implements parent constructor
            _super.call(this, options);
        }
        /**
         * implements extra initialize for object
         */
        ContentObject.prototype.initialize = function (options) {
            this.allowShowHideResponsive = true;
            // set cid as an attribute
            this.set("cid", this.cid);
            // init machineName property
            this.machineName = this.get('machineName');
            // call parent initialize method
            _super.prototype.initialize.call(this, options);
            // create navigator element view
            this.createNavigatorView();
        };
        /**
         * overrides createView() method
         */
        ContentObject.prototype.createView = function (newContentView) {
            // create view object
            this.view = new ContentObjectView({ model: this });
        };
        /**
         * create navigator view for this model
         */
        ContentObject.prototype.createNavigatorView = function () {
            this.navigatorView = new NavigatorView({ model: this });
        };
        /*
         * get navigator with new indent          *
         */
        ContentObject.prototype.getNavigatorViewByIndent = function (indent) {
            this.set('indent', indent);
            this.navigatorView = new NavigatorView({ model: this });
            return this.navigatorView;
        };
        /**
         * get navigator view of object
         */
        ContentObject.prototype.getNavigatorView = function () {
            return this.navigatorView;
        };
        /**
         * set machine name for object
         */
        ContentObject.prototype.setMachineName = function (machineName) {
            this.machineName = machineName;
        };
        /**
         * get machine name of object
         */
        ContentObject.prototype.getMachineName = function () {
            if (this.machineName === undefined)
                return this.get('machineName');
            return this.machineName;
        };
        /**
         * set navigator panel object
         */
        ContentObject.prototype.setNavigatorPanel = function (panel) {
            // set navigatorPanel property
            this.navigatorPanel = panel;
            // set navigatorPanel to content objects
            var content = this.get('content');
            if (content instanceof ContentObjects) {
                content.setNavigatorPanel(panel);
            }
        };
        /**
         * get navigator panel object
         */
        ContentObject.prototype.getNavigatorPanel = function () {
            return this.navigatorPanel;
        };
        /**
         * get builder object
         * @returns {Builder}
         */
        ContentObject.prototype.getBuilder = function () {
            return this.navigatorPanel ? this.navigatorPanel.getBuilder() : null;
        };
        /**
         * overrides get() method
         */
        ContentObject.prototype.get = function (attribute) {
            if (attribute === 'settings' || attribute === "customStyles") {
                return this.parseJSON(_super.prototype.get.call(this, attribute));
            }
            return _super.prototype.get.call(this, attribute);
        };
        /**
         * override set method
         */
        ContentObject.prototype.set = function (attribute, value, options) {
            if ((attribute === 'settings' || attribute === "customStyles") && jQuery.type(value) !== 'string') {
                value = JSON.stringify(value);
            }
            return _super.prototype.set.call(this, attribute, value, options);
        };
        /**
         * set value for an attribute of settings
         * @param selector: string contains key to select attribute in settings
         * @param value: new value for attribute
         * @param opts:
         */
        ContentObject.prototype.setSettingsAttr = function (selector, value, opts) {
            var settings = this.get('settings'), selectorValue = this.getSettingsAttr(selector);
            // set selector value
            if (opts && opts.delete) {
                if (selectorValue !== undefined) {
                    this.deleteSettingAttr(settings, selector);
                }
            }
            else {
                if (selectorValue !== undefined)
                    eval("settings." + selector + " = value");
                else {
                    this.setValue(settings, selector.split('.'), value);
                }
            }
            // update settings attribute of model
            this.set('settings', settings, { selector: selector, value: value });
        };
        /**
         * recursion to set value of settings
         * @param next: Object contains attribute of next step
         * @param keys: list key of next step
         * @param value: number execute this function
         * @returns {number}: number time execute this function
         */
        ContentObject.prototype.setValue = function (next, keys, value) {
            var key = keys.shift();
            if (next[key] === undefined)
                next[key] = {};
            if (keys.length > 0)
                this.setValue(next[key], keys, value);
            else
                next[key] = value;
        };
        /**
         * get value of attribute in settings
         * @param selector:  string contains key to select attribute in settings
         * @param settings:  object which will return value of selector
         * @returns {any}: value of attribute by selector
         */
        ContentObject.prototype.getSettingsAttr = function (selector, settings) {
            var output;
            // get current settings of this model if settings is not set
            if (settings === undefined)
                settings = this.get('settings');
            // get selector attribute in settings
            try {
                eval("output = settings." + selector);
            }
            catch (error) {
                output = undefined;
            }
            return output;
        };
        ContentObject.prototype.getValue = function (next, keys) {
            var key = keys.shift(), output;
            if (next[key] !== undefined) {
                if (keys.length > 0)
                    output = this.getValue(next[key], keys);
                else
                    output = next[key];
            }
            else
                output = undefined;
            return output;
        };
        /**
         * delete attribute in settings attribute by selector
         */
        ContentObject.prototype.deleteSettingAttr = function (settings, selector) {
            // implement delete selector value
            eval("delete settings." + selector);
            // delete parent key
            var selectorKeys = selector.split('.');
            selectorKeys.pop();
            if (selectorKeys.length > 0) {
                var parentSelector = selectorKeys.join('.'), parentSettings = eval("settings." + parentSelector);
                if (parentSettings === undefined || Object.keys(parentSettings).length === 0)
                    this.deleteSettingAttr(settings, parentSelector);
            }
        };
        /**
         * set indent of number in data builder collection
         * @param indent: indent value of model
         */
        ContentObject.prototype.setIndent = function (indent) {
            this.indent = indent;
            if (this.navigatorView)
                this.navigatorView.updateIndent(indent);
            if (this.view)
                this.view.updateIndent(indent);
        };
        /**
         * get indent of object in data builder collection
         */
        ContentObject.prototype.getIndent = function () {
            return this.indent;
        };
        /**
         * set responsive mode for object and content objects
         * @param mode: string for current responsive mode and is one of ['xl,'lg', 'md', 'sm', 'xs']
         */
        ContentObject.prototype.setResponsiveMode = function (mode) {
            // set responsive mode is set
            this.responsiveMode = mode;
            // update responsive mode to content objects in this object
            var content = this.get('content');
            if (content && content instanceof ContentObjects) {
                content.each(function (model, index) {
                    model.setResponsiveMode(mode);
                });
            }
            // update navigator view
            if (this.navigatorView)
                this.navigatorView.changeResponsiveDisplay();
        };
        /**
         * get current responsive mode in object
         */
        ContentObject.prototype.getResponsiveMode = function () {
            return this.responsiveMode;
        };
        /**
         * get collection which contains all content of builder
         */
        ContentObject.prototype.getRootCollection = function (depth) {
            var collection, object = this;
            for (var i = depth; i > 0; i--) {
                collection = object.getCollection();
                if (collection.getContainer())
                    object = collection.getContainer();
                else {
                    object = undefined;
                    break;
                }
            }
            return collection;
        };
        /**
         * overrides clone() method
         */
        ContentObject.prototype.clone = function () {
            var content = this.get('content'), defaultOptions = this.toJSON();
            delete defaultOptions.cid;
            if (content instanceof ContentObjects)
                defaultOptions.content = content.clone();
            return new this.collection.model(defaultOptions);
        };
        /**
         * get type of object
         */
        ContentObject.prototype.getType = function () {
            return 'ContentObject';
        };
        /**
         * set storage value
         */
        ContentObject.prototype.setStorageValue = function (name, value, part) {
            if (part === undefined)
                part = 'main';
            this.setSettingsAttr(part + ".settings." + name, value);
        };
        /**
         * remove class active in view and navigator view of this object
         */
        ContentObject.prototype.deactivate = function () {
            this.view.deactivate();
            this.navigatorView.deactivate();
        };
        /**
         * get current style of view in document
         */
        ContentObject.prototype.getDefaultStyle = function () {
            function updateStyle(name, value, style) {
                switch (typeof style[name]) {
                    case 'object':
                        if (style[name].xl !== undefined && value !== undefined)
                            style[name].xl = value;
                        break;
                    case 'undefined':
                        break;
                    default:
                        style[name] = value;
                        break;
                }
            }
            function processShadowValue(name, value) {
                var parsedValue = {
                    horizontal: '0',
                    vertical: '0',
                    blur: '0',
                    color: ''
                };
                if (name === "boxShadow")
                    parsedValue = jQuery.extend(parsedValue, { spread: 0, inset: false });
                if (value !== 'none') {
                    var arr_value = value.split(' ');
                    if (arr_value[0] !== undefined)
                        parsedValue.horizontal = arr_value[0];
                    if (arr_value[1] !== undefined)
                        parsedValue.vertical = arr_value[1];
                    if (arr_value[2] !== undefined)
                        parsedValue.blur = arr_value[2];
                    if (name === "boxShadow") {
                        if (arr_value[3] !== undefined)
                            parsedValue.spread = arr_value[3];
                        if (arr_value[4] !== undefined)
                            parsedValue.color = arr_value[4];
                        parsedValue.inset = (arr_value[5] !== undefined && arr_value[5] === 'inset');
                    }
                    else {
                        if (arr_value[3] !== undefined)
                            parsedValue.color = arr_value[3];
                    }
                }
                return parsedValue;
            }
            function updateStyles(styleName, defaultStyle, styles) {
                var mapping = {
                    font: {
                        "family": "fontFamily",
                        "weight": "fontWeight",
                        "styles": ["textDecoration", "textTransform", "fontStyle"],
                        "align": "textAlign",
                        "size": "fontSize",
                        "lineHeight": "lineHeight",
                        "letterSpacing": "letterSpacing",
                        "color": "color"
                    },
                    margin: {
                        top: "marginTop",
                        right: "marginRight",
                        bottom: "marginBottom",
                        left: "marginLeft"
                    },
                    padding: {
                        top: "paddingTop",
                        right: "paddingRight",
                        bottom: "paddingBottom",
                        left: "paddingLeft"
                    },
                    border: {
                        "top": "borderTop",
                        "right": "borderRight",
                        "bottom": "borderBottom",
                        "left": "borderLeft",
                        "topLeftRadius": "borderTopLeftRadius",
                        "topRightRadius": "borderTopRightRadius",
                        "bottomLeftRadius": "borderBottomLeftRadius",
                        "bottomRightRadius": "borderBottomRightRadius"
                    },
                    background: {
                        "color": "backgroundColor"
                    },
                    sizePosition: {
                        "width": "width",
                        "height": "height",
                        "minHeight": "minHeight",
                        "position": "position",
                        "top": "top",
                        "right": "right",
                        "bottom": "bottom",
                        "left": "left",
                        "zIndex": "zIndex"
                    },
                    shadow: {
                        "box": "boxShadow",
                        "text": "textShadow"
                    },
                    transform: {}
                };
                jQuery.map(defaultStyle, function (data, name) {
                    var defaultVal;
                    if (mapping[styleName][name] !== undefined) {
                        if (typeof mapping[styleName][name] !== "string") {
                            if (jQuery.type(mapping[styleName][name]) === 'array') {
                                defaultVal = [];
                                jQuery.each(mapping[styleName][name], function () {
                                    if (styles[this] !== undefined) {
                                        if (!(this == 'textDecoration' && styles[this].indexOf('none') != -1)) {
                                            defaultVal.push(styles[this]);
                                        }
                                    }
                                });
                            }
                        }
                        else {
                            if (styles[mapping[styleName][name]] !== undefined) {
                                switch (mapping[styleName][name]) {
                                    case "boxShadow":
                                    case "textShadow":
                                        defaultVal = processShadowValue(mapping[styleName][name], styles[mapping[styleName][name]]);
                                        break;
                                    case "lineHeight":
                                    case "letterSpacing":
                                        var parsedValue = parseInt(styles[mapping[styleName][name]]);
                                        if (!isNaN(parsedValue))
                                            defaultVal = styles[mapping[styleName][name]];
                                        break;
                                    default:
                                        defaultVal = styles[mapping[styleName][name]];
                                        break;
                                }
                                // fix color rgba(0,0,0,0)
                                if (name == 'color' && defaultVal == 'rgba(0, 0, 0, 0)')
                                    defaultVal = '';
                            }
                        }
                        updateStyle(name, defaultVal, defaultStyle);
                    }
                });
            }
            var view = this.view, defaultSettings = jQuery.extend(true, {}, ContentObject.generateObjectSettings(this.machineName));
            jQuery.map(defaultSettings, function (partData, partName) {
                var style = view.getDefaultStyle(partData.selector);
                if (partData.style && partData.style.normal !== undefined) {
                    jQuery.map(partData.style.normal, function (stylePart, styleName) {
                        updateStyles(styleName, stylePart, style);
                    });
                }
            });
            window.AweBuilderSettings.cachedSettings[this.machineName] = JSON.stringify(defaultSettings);
        };
        /**
         *
         * @param machineName
         * @param data
         * @returns {any}
         */
        ContentObject.generateObjectSettings = function (machineName, data) {
            // callback to process style settings
            function generateStyleElements(settings, styleElements, selector) {
                var defaultElements = jQuery.extend(true, {}, AweBuilder.STYLE_ELEMENTS);
                if (selector !== undefined) {
                    defaultElements = eval("defaultElements." + selector + ".elements");
                    if (defaultElements === undefined)
                        throw Error("'" + selector + "' is not a element's style");
                }
                // add group to styles tabs data
                if (styleElements === undefined) {
                    for (var tabName in defaultElements) {
                        defaultElements[tabName].type = 'group';
                    }
                    styleElements = {
                        normal: jQuery.extend(true, {}, defaultElements)
                    };
                }
                // process style settings for object
                if (settings !== undefined) {
                    var enabledStyles_1 = Object.keys(defaultElements);
                    if (typeof settings.enabled === 'object')
                        enabledStyles_1 = jQuery.type(settings.enabled) === 'object' ? Object.keys(settings.enabled) : settings.enabled;
                    // process for normal state
                    jQuery.map(defaultElements, function (styleSettings, styleName) {
                        var styleSelector = selector ? selector + ".elements." + styleName : styleName, devicesSettings = settings.devices, statusSetting = settings.status;
                        if (jQuery.inArray(styleName, enabledStyles_1) === -1)
                            eval("delete styleElements.normal." + styleSelector);
                        else {
                            // get devices settings
                            if (settings.enabled && jQuery.type(settings.enabled[styleName]) === 'object' && jQuery.type(settings.enabled[styleName].devices)) {
                                var type = jQuery.type(settings.enabled[styleName].devices);
                                switch (type) {
                                    case "string":
                                        devicesSettings = settings.enabled[styleName].devices.split(',');
                                        break;
                                    case 'array':
                                    case 'boolean':
                                        devicesSettings = settings.enabled[styleName].devices;
                                        break;
                                }
                            }
                            // process for devices setting for normal state
                            if (jQuery.type(devicesSettings) === 'array' || devicesSettings === false) {
                                eval("styleElements.normal." + styleSelector + ".devices = devicesSettings");
                            }
                            // process for status settings
                            if (settings.enabled && jQuery.type(settings.enabled[styleName]) === 'object' && jQuery.type(settings.enabled[styleName].status)) {
                                var type = jQuery.type(settings.enabled[styleName].status);
                                switch (type) {
                                    case "string":
                                        statusSetting = settings.enabled[styleName].status.split(',');
                                        break;
                                    case 'array':
                                        statusSetting = settings.enabled[styleName].status;
                                        break;
                                }
                            }
                            if (jQuery.type(statusSetting) === 'array' && statusSetting.length) {
                                jQuery.each(statusSetting, function () {
                                    if (styleElements[this] === undefined)
                                        styleElements[this] = {};
                                    var state = selector ? this + "." + selector : this;
                                    if (eval("styleElements." + state) === undefined) {
                                        var defaultStyles = jQuery.extend(true, {}, styleElements.normal);
                                        eval("styleElements." + state + " = defaultStyles." + selector);
                                    }
                                    if (devicesSettings !== undefined && selector) {
                                        eval("styleElements." + state + ".devices = devicesSettings;");
                                    }
                                });
                            }
                            // process for sub-elements
                            if (typeof defaultElements[styleName].elements === 'object') {
                                var subElSettings = {};
                                if (statusSetting !== undefined)
                                    subElSettings.status = statusSetting;
                                if (devicesSettings !== undefined)
                                    subElSettings.devices = devicesSettings;
                                if (jQuery.type(settings.enabled) === 'object' && settings.enabled[styleName].enabled !== undefined)
                                    subElSettings.enabled = settings.enabled[styleName].enabled;
                                if (Object.keys(subElSettings).length) {
                                    var subSelector = "" + styleName;
                                    if (selector)
                                        subSelector = selector + ".elements." + styleName;
                                    generateStyleElements(subElSettings, styleElements, subSelector);
                                }
                            }
                        }
                    });
                }
                return styleElements;
            }
            /**
             * generate style data structure
             */
            function generateStyleSettings(styleSettings, part) {
                var output = {}, styleForm = generateStyleElements(styleSettings);
                // set default part is main
                if (part === undefined)
                    part = 'main';
                // save style form element
                window.AweBuilderSettings.styleForms[(machineName + "-" + part)] = styleForm;
                // generate style settings structure
                jQuery.map(styleForm, function (stateElements, state) {
                    output[state] = generateSettings(stateElements);
                });
                return output;
            }
            // callback process animation settings for element
            function generateAnimationSettings(settings) {
                var animationElements = jQuery.extend(true, {}, AweBuilder.ANIMATION_ELEMENTS, settings);
                return generateSettings(animationElements);
            }
            // callback process animation settings
            function generateResponsiveSettings(settings) {
                return jQuery.extend(true, {}, AweBuilder.RESPONSIVE_SETTINGS, settings);
            }
            // callback generate custom settings
            function generateCustomSettings(settingElements, part) {
                // prepare form settings key for element
                if (window.AweBuilderSettings.settingForms[machineName] === undefined)
                    window.AweBuilderSettings.settingForms[machineName] = {};
                // create settings form for part
                if (part === undefined)
                    part = 'main';
                if (settingElements)
                    window.AweBuilderSettings.settingForms[machineName][part] = new AweBuilder.AweForm(settingElements, part + ".settings", { className: 'pd15' });
                // set devices in elements of custom setting is false
                (function generateDefaultSettings(elements) {
                    if (elements instanceof Object) {
                        jQuery.map(elements, function (element, name) {
                            // set always save value to model
                            element.alwaysSave = true;
                            // set devices default is false
                            if (element.devices === undefined)
                                element.devices = false;
                            // process for group element
                            if (jQuery.type(element.elements) === 'object')
                                generateDefaultSettings(element.elements);
                        });
                    }
                })(settingElements);
                return generateSettings(settingElements);
            }
            // callback process custom settings for element
            function generateSettings(settingsElements) {
                var output = {};
                if (settingsElements instanceof Object) {
                    for (var property in settingsElements) {
                        var element = settingsElements[property], elementsMap = AweBuilder.AweForm.elementsMap, className = elementsMap[element.type];
                        if (className !== undefined) {
                            eval("AweBuilder." + className + ".getDefaultValue(settingsElements[property], output, property)");
                        }
                    }
                }
                return output;
            }
            // callback process settings by part
            function generatePartSettings(settings, part) {
                var output = {};
                if (settings.style !== false)
                    output.style = generateStyleSettings(settings.style, part);
                if (settings.animation !== false)
                    output.animation = generateAnimationSettings(settings.animation);
                if (settings.settings !== false)
                    output.settings = generateCustomSettings(settings.settings, part);
                if (settings.responsive !== false)
                    output.responsive = generateResponsiveSettings(settings.responsive);
                return output;
            }
            // process to generate object settings
            var output = {};
            if (machineName) {
                if (window.AweBuilderSettings.cachedSettings[machineName] === undefined) {
                    if (typeof data === 'object') {
                        if (data.main !== undefined) {
                            // process for element allows settings multipart
                            jQuery.map(data, function (part, key) {
                                if (typeof key === 'string' && typeof part === 'object') {
                                    // create data structure for part
                                    var partSettings = jQuery.extend(true, {}, part);
                                    output[key] = generatePartSettings(partSettings, key);
                                    // save title and selector string for parts
                                    if (key === 'main') {
                                        // save default title for main part and not set selector string
                                        output[key].title = 'Main';
                                    }
                                    else {
                                        output[key].title = (part.title !== undefined) ? part.title : key;
                                        if (typeof part.selector === 'string')
                                            output[key].selector = part.selector;
                                    }
                                }
                            });
                        }
                        else {
                            // create style data structure
                            output.main = generatePartSettings(data);
                            output.main.title = 'Main';
                        }
                        window.AweBuilderSettings.cachedSettings[machineName] = JSON.stringify(output);
                    }
                    else {
                        throw Error('Data of element is declared invalid. You must use object to declare an element for AweBuilder.');
                    }
                }
                else
                    output = AweBuilder.parseJSON(window.AweBuilderSettings.cachedSettings[machineName]);
            }
            return output;
        };
        ContentObject.type = 'ContentObject';
        return ContentObject;
    }(AweBuilder.Abstract));
    AweBuilder.ContentObject = ContentObject;
    /**
     * Define View class for all elements on iframe
     */
    var ContentObjectView = (function (_super) {
        __extends(ContentObjectView, _super);
        function ContentObjectView() {
            _super.apply(this, arguments);
        }
        /**
         * return default text is translated for controllers in object
         * @returns {{title: any, editText: string, cloneText: string, deleteText: string}}
         */
        ContentObjectView.prototype.getRenderControllersData = function () {
            return [
                {
                    name: 'move',
                    title: this.model.get('title'),
                    content: "<span class=\"js-ac-control-title\">" + this.model.get('title') + "</span>"
                },
                {
                    name: 'edit',
                    title: this.translate('Edit'),
                    icon: 'pen'
                },
                {
                    name: 'clone',
                    title: this.translate('Clone'),
                    icon: 'clone'
                },
                {
                    name: 'delete',
                    icon: 'del',
                    title: this.translate('Delete')
                }
            ];
        };
        /**
         * controllers template function for elements
         * @returns JQuery
         */
        ContentObjectView.prototype.renderControllers = function () {
            var controllers = _.template("\n                 <div class=\"js-ac-control ac_control\">\n                     <ul>\n                         <% _.each(controllers, function(controller) { %>\n                         <li class=\"<% if (controller.classes) { %><%= controller.classes %> <% } else { %>js-ac-control-<%= controller.name %> ac_control__<%= controller.name %><% } %>\" title=\"" + this.translate('<%= controller.title %>') + "\">\n                             <% if (controller.icon) { %>\n                              <i class=\"acicon acicon-<%= controller.icon %>\"></i>\n                             <% } %>\n                             <% if (controller.content) { %>\n                             <%= controller.content %>\n                             <% } %>\n                         </li>\n                         <% }) %>\n                     </ul>\n                 </div>\n            ")({ controllers: this.getRenderControllersData() });
            return jQuery(controllers);
        };
        /**
         * Overrides initialize method
         */
        ContentObjectView.prototype.initialize = function () {
            this.$wrapper = this.$el;
            this.listenTo(this.model, 'change', this.listenModelChange);
            _super.prototype.initialize.call(this);
        };
        /**
         * render element
         */
        ContentObjectView.prototype.render = function () {
            //render css
            this.renderStyle();
            //render animation
            this.renderAnimation();
            // set indent && cid data
            this.$el.attr('data-indent', this.model.getIndent()).attr('data-cid', this.model.cid);
            // add classes
            var type = this.model.__proto__.constructor.type, currentClasses = this.$el.attr("class"), responsiveClasses = this.renderResponsiveClasses(), customStyle = this.model.get("customStyles"), customClasses = customStyle.classes ? " " + customStyle.classes : '';
            this.$el.attr("class", "js-content-object js-type-" + type + " js-el-" + this.model.cid + " " + currentClasses + " " + responsiveClasses + customClasses);
            if (customStyle.id)
                this.$el.attr('id', customStyle.id);
            // render controllers
            var $controllers = this.renderControllers();
            this.$el.prepend($controllers);
            // render content
            this.renderContent();
            // render overlay after render content
            this.renderBackgroundOverlay();
            return this;
        };
        /**
         * render background overlay tag
         */
        ContentObjectView.prototype.renderBackgroundOverlay = function () {
            // render background overlay tag
            this.$el.prepend('<div class="ac_bg__overlay"></div>');
            var machineName = this.model.getMachineName(), element = window.AweBuilderSettings.elements[machineName];
            if (element !== undefined && element.data !== undefined) {
                var _self_15 = this, loopNumber_1 = 0;
                // wait the parts have been rendered
                var loop_1 = setInterval(function () {
                    loopNumber_1++;
                    // set max loop when not found part
                    if (loopNumber_1 == 10) {
                        clearInterval(loop_1);
                    }
                    for (var part in element.data) {
                        if (part !== "main") {
                            var partSettings = element.data[part];
                            if (partSettings.selector !== undefined) {
                                var $partObj = jQuery(partSettings.selector, _self_15.$el);
                                if ($partObj.length) {
                                    clearInterval(loop_1);
                                    $partObj.prepend('<div class="ac_bg__overlay"></div>');
                                }
                            }
                        }
                    }
                }, 300);
            }
        };
        /**
         * render content for element
         */
        ContentObjectView.prototype.renderContent = function () {
            var content = this.model.get('content');
            if (content && content.getView)
                this.$wrapper.append(content.getView().$el);
        };
        /**
         * render default title for content object
         */
        ContentObjectView.prototype.renderTitle = function (title) {
            jQuery('> .js-ac-control .js-ac-control-move', this.$el).attr('title', title);
            jQuery('> .js-ac-control .js-ac-control-move > span', this.$el).text(title);
        };
        /**
         * render responsive class for object
         * @param settings: responsive settings
         * @returns {string}
         */
        ContentObjectView.prototype.renderResponsiveClasses = function (settings) {
            if (settings === undefined)
                settings = this.model.get('settings');
            var modelType = this.model.getMachineName(), defaultSettings = ContentObject.generateObjectSettings(modelType), responsive = jQuery.extend(true, {}, defaultSettings.main.responsive, (settings.main && settings.main.responsive ? settings.main.responsive : {})), classes = [];
            if (responsive.hidden) {
                jQuery.map(responsive.hidden, function (value, mode) {
                    if (value) {
                        classes.push("ac_hidden-" + mode);
                    }
                });
            }
            return classes.join(' ');
        };
        /*
         * render animation for content object
         */
        ContentObjectView.prototype.renderAnimation = function (selector, reset) {
            var renderedAnimation = this.model.get('renderedAnimation'), part_el = this.$el;
            if (!selector) {
                selector = 'main.xl';
            }
            else {
                var selector_arr = selector.split('.'), settings = this.model.get('settings'), part = selector_arr[0];
                if (selector_arr.length > 2)
                    selector = part + "." + selector_arr[selector_arr.length - 1];
                if (part !== 'main')
                    part_el = this.$el.find(settings[part].selector);
            }
            if (typeof renderedAnimation == 'string')
                renderedAnimation = AweBuilder.parseJSON(renderedAnimation);
            if (renderedAnimation !== undefined && renderedAnimation[selector] !== undefined) {
                var currentAnimation_1 = renderedAnimation[selector];
                if (currentAnimation_1.enable == true) {
                    part_el.css(currentAnimation_1.style);
                    part_el.removeClass(currentAnimation_1.prevClass + " animated");
                    setTimeout(function () {
                        part_el.addClass(currentAnimation_1.class + " animated");
                    }, 50);
                }
                else {
                    for (var style in currentAnimation_1.style) {
                        part_el.css(style, '');
                    }
                    part_el.removeClass(currentAnimation_1.class + " animated");
                }
            }
        };
        /*
         * render style for content object
         */
        ContentObjectView.prototype.renderStyle = function (reset) {
            var renderedStyle = this.model.get('renderedStyle'), $styleTag = jQuery('<style></style>'), settings = this.model.get('settings'), _self = this;
            // remove current style tag
            if (reset !== undefined && reset) {
                this.$el.find('> style').remove();
            }
            // render css
            var cssContent = "";
            if (renderedStyle !== undefined) {
                cssContent = AweBuilder.acGetStringStyle(renderedStyle, _self.model.cid, settings);
            }
            // render custom css
            var customStyles = this.model.get("customStyles");
            if (customStyles.css)
                cssContent += customStyles.css;
            $styleTag.html(cssContent);
            // add style tag for element
            this.$el.prepend($styleTag);
        };
        /**
         * defaults event in controller of content object
         * @returns {Object}
         */
        ContentObjectView.prototype.events = function () {
            return {
                "mousedown > .js-ac-control > ul > .js-ac-control-move": "onMoveMousedown",
                "click > .js-ac-control > ul > .js-ac-control-edit": "edit",
                "click > .js-ac-control > ul > .js-ac-control-clone": "clone",
                "click > .js-ac-control > ul > .js-ac-control-split": "split",
                "click > .js-ac-control > ul > .js-ac-control-delete": "delete"
            };
        };
        /**
         * handle mousedown on move icon
         */
        ContentObjectView.prototype.onMoveMousedown = function () {
            // set default width of element view
            var percent = this.$el.width() * 100 / this.$el.parent().width();
            this.$el.attr('defWidth', percent + "%");
            // activate this  model
            jQuery('> .js-ac-control > ul > .js-ac-control-edit', this.$el).trigger('click');
        };
        /**
         * Handle edit button click
         */
        ContentObjectView.prototype.edit = function (event) {
            // prevent default action
            this.preventDefaultEvent(event);
            // trigger click to navigator item
            var navigatorView = this.model.getNavigatorView();
            jQuery('> .js-nav-item-header > .js-navigator-item-title', navigatorView.$el).trigger('mousedown', (event !== undefined && event.isTrigger !== 3));
        };
        /**
         * Handle click to clone button
         */
        ContentObjectView.prototype.clone = function (event) {
            // prevent default action
            this.preventDefaultEvent(event);
            // implements clone object
            var cloneModel = this.model.clone(), collection = this.model.getCollection();
            if (collection !== undefined) {
                // set navigatorPanel
                cloneModel.setNavigatorPanel(this.model.getNavigatorPanel());
                // set current responsive mode of builder
                cloneModel.setResponsiveMode(this.model.responsiveMode);
                // add clone object after original object
                var index = collection.indexOf(this.model);
                collection.add(cloneModel, { at: index + 1 });
            }
        };
        /**
         * Handle click to delete button on view tools
         */
        ContentObjectView.prototype.delete = function (event) {
            this.preventDefaultEvent(event);
            if (!jQuery(event.target).hasClass('ac_disable')) {
                var collection = this.model.getCollection();
                if (collection !== undefined) {
                    collection.remove(this.model);
                    this.onMoveMousedown();
                    this.model.getNavigatorPanel().deleteActiveModel(this.model);
                }
            }
        };
        /**
         * change status of delete button when it is first object
         */
        ContentObjectView.prototype.updateDeleteBtn = function (allowDelete) {
            if (allowDelete)
                jQuery('> .js-ac-control li.js-ac-control-delete', this.$el).removeClass('ac_disable');
            else
                jQuery('> .js-ac-control li.js-ac-control-delete', this.$el).addClass('ac_disable');
        };
        /**
         * Listen attributes in model change
         */
        ContentObjectView.prototype.listenModelChange = function (model, options) {
            var _self = this;
            // callback to process for each attribute
            function applyChange(attribute, value) {
                switch (attribute) {
                    case 'title':
                        _self.renderTitle(value);
                        break;
                    case 'settings':
                        var prevSettings = model.parseJSON(model.previous('settings'));
                        _self.renderSettingsChange(options.selector, options.value, prevSettings, options.inlineCss);
                        break;
                    case "customStyles":
                        var prevStyles = AweBuilder.parseJSON(model.previous('customStyles')), currentStyles = AweBuilder.parseJSON(value);
                        if (currentStyles.id)
                            _self.$el.attr("id", currentStyles.id);
                        else
                            _self.$el.removeAttr("id");
                        _self.$el.removeClass(prevStyles.classes).addClass(currentStyles.classes);
                        _self.renderStyle(true);
                        break;
                }
            }
            jQuery.map(model.changed, function (value, attrName) {
                applyChange(attrName, value);
            });
        };
        /**
         * render settings changed
         */
        ContentObjectView.prototype.renderSettingsChange = function (selector, value, prevSettings, inlineCSS) {
            if (selector !== undefined) {
                var selectorArray = selector.split('.'), settings = this.model.get('settings'), machineName = this.model.getMachineName();
                switch (selectorArray[1]) {
                    case "responsive":
                        var currentClasses = this.renderResponsiveClasses(prevSettings), newClasses = this.renderResponsiveClasses();
                        this.$el.removeClass(currentClasses).addClass(newClasses);
                        break;
                    case "style":
                        //implements render style change
                        var defaultSettings = AweBuilder.parseJSON(window.AweBuilderSettings.cachedSettings[machineName]), partSelector = defaultSettings[selectorArray[0]].selector, $part = partSelector ? jQuery(partSelector, this.$el) : this.$el, renderedStyle = this.model.get('renderedStyle');
                        // render change style
                        var inlineStyle = AweBuilder.acSetDataStyle(renderedStyle, selector, value, settings, inlineCSS);
                        // save rendered style
                        this.model.set('renderedStyle', renderedStyle);
                        // process inlineStyle
                        if (!inlineCSS) {
                            // remove inline style if exist
                            //$part.removeAttr('style');
                            // render style tag content
                            this.renderStyle(true);
                        }
                        else if (inlineStyle) {
                            var matches = /(.*).*:[\s]*([^;]*)/.exec(inlineStyle);
                            $part.css(matches[1], matches[2].replace(' !important', ''));
                            console.log('render inline css after changing the style tab of machineName :' + machineName);
                        }
                        break;
                    case "animation":
                        //implements render animation change
                        var renderedAnimation = this.model.get('renderedAnimation');
                        if (typeof renderedAnimation == 'string')
                            renderedAnimation = JSON.parse(renderedAnimation);
                        AweBuilder.acSetDataAnimation(renderedAnimation, selector, value, settings);
                        this.model.set('renderedAnimation', renderedAnimation);
                        this.renderAnimation(selector, true);
                        break;
                }
                // enable message when reload page
                var builder = this.getBuilder();
                if (builder)
                    builder.enableReloadAlert();
            }
        };
        /**
         * update indent value to data-indent attribute
         */
        ContentObjectView.prototype.updateIndent = function (indent) {
            this.$el.attr('data-indent', indent);
        };
        /**
         * remove class active on element
         */
        ContentObjectView.prototype.deactivate = function () {
            this.$el.removeClass('js-active ac_highlight');
        };
        /**
         * implements process for view when new object is added to content
         * @param model: ContentObject object is added
         * @param collection: content attribute of this model
         * @param options: flags pass for add action
         */
        ContentObjectView.prototype.listenAddContent = function (model, collection, options) {
        };
        /**
         * implements process for view of object when a object in content is removed
         * @param model: removed object
         * @param collection: content of this object
         * @param options: remove flags actions
         */
        ContentObjectView.prototype.listenRemoveContent = function (model, collection, options) {
            // remove content view
            if (options.action !== 'sort')
                model.getView().$el.remove();
        };
        /**
         * update grid view if model is sorting model
         */
        ContentObjectView.prototype.updateGridView = function (enable) {
            var builder = this.getBuilder(), settings = builder ? builder.getSettings() : undefined;
            if (settings && !settings.showGrid) {
                if (enable)
                    this._$('.js-ac-page-wrapper').addClass('ac_guides');
                else
                    this._$('.js-ac-page-wrapper').removeClass('ac_guides');
            }
        };
        /**
         * get builder object
         */
        ContentObjectView.prototype.getBuilder = function () {
            var panel = this.model.getNavigatorPanel();
            return panel ? panel.getBuilder() : undefined;
        };
        /**
         * get default style of view in current state
         */
        ContentObjectView.prototype.getDefaultStyle = function (selector) {
            AweBuilder._jQuery('body').removeClass('ac_creating');
            var customStyle = this.model.get('customStyles'), $el = selector ? AweBuilder._jQuery(".js-el-" + this.model.cid + " " + selector) : AweBuilder._jQuery(".js-el-" + this.model.cid), inlineStyle = $el.attr('style'), style;
            $el.removeAttr('style');
            this.$el.removeClass("js-el-" + this.model.cid).removeClass('ac_highlight');
            if (customStyle && customStyle.classes)
                $el.removeClass(customStyle.classes);
            style = $el.length ? JSON.parse(JSON.stringify(window.getComputedStyle($el[0]))) : {};
            if (inlineStyle)
                $el.attr('style', inlineStyle);
            this.$el.addClass("js-el-" + this.model.cid).addClass('ac_highlight');
            if (customStyle && customStyle.classes)
                $el.addClass(customStyle.classes);
            AweBuilder._jQuery('body').addClass('ac_creating');
            return style;
        };
        return ContentObjectView;
    }(AweBuilder.AbstractView));
    AweBuilder.ContentObjectView = ContentObjectView;
    /**
     * Define class view for element in navigator
     */
    var NavigatorView = (function (_super) {
        __extends(NavigatorView, _super);
        function NavigatorView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize() method
         */
        NavigatorView.prototype.initialize = function () {
            this.expanded = false;
            this.sorting = false;
            this.template = _.template("\n                <div class=\"js-nav-item-header ac_navigator-item-header\">\n                    <a href=\"#\" class=\"js-show-hide ac_show-hide<%= disabled %>\" title=\"<%= actionTitle %>\">\n                        <i class=\"js-show acicon acicon-show\"></i>\n                    </a>\n                    <div class=\"js-navigator-item-title ac_navigator-item-title\">\n                         <i class=\"js-collapsed-sub acicon acicon-triangle-down\" style=\"visibility: hidden; opacity: 0;\"></i>\n                         <span contenteditable=\"true\"><%= title %></span>\n                    </div>\n                </div>\n            ");
            this.listenTo(this.model, 'change:title', this.changeTitle);
            // implements parent initialize
            _super.prototype.initialize.call(this);
        };
        /**
         * declare events on navigator view
         */
        NavigatorView.prototype.events = function () {
            return {
                "mousedown > .js-nav-item-header > .js-navigator-item-title": "onTitleMouseDown",
                "click > .js-nav-item-header > .js-show-hide": "hideViewInResponsiveMode",
                "click > .js-nav-item-header > .js-navigator-item-title > .js-collapsed-sub": "onCollapsedClick",
                "startSort": 'onStartSort',
                "stopSort": 'onStopSort'
            };
        };
        /**
         * overrides render() method
         */
        NavigatorView.prototype.render = function () {
            var title = this.translate(this.model.get('title')), content = this.model.get('content'), machineName = this.model.get('machineName');
            // render item navigator
            this.$el.addClass('js-nav-item js-nav-item-' + machineName + ' ac_navigator-item').attr('data-cid', this.model.cid);
            this.$el.append(this.template({
                title: title,
                actionTitle: this.translate('Show'),
                disabled: this.model.allowShowHideResponsive ? '' : ' ac_disable'
            }));
            // render navigator for content of item
            if (content) {
                this.$el.append(content.getNavigatorView().$el);
                this.updateCollapsedDisplay(content.length);
            }
            // init edit title
            this.initEditTitle();
            return this;
        };
        /**
         * update display status for collapsed button for content in element
         */
        NavigatorView.prototype.updateCollapsedDisplay = function (contentLength) {
            if (contentLength === 0)
                jQuery('> .js-nav-item-header > .js-navigator-item-title > .js-collapsed-sub', this.$el).css({
                    visibility: 'hidden',
                    opacity: 0
                });
            else {
                jQuery('> .js-nav-item-header > .js-navigator-item-title > .js-collapsed-sub', this.$el).css({
                    visibility: '',
                    opacity: ''
                });
            }
        };
        /**
         * init to allow edit title of object
         */
        NavigatorView.prototype.initEditTitle = function () {
            var _self = this;
            // init for allow edit title of item
            jQuery('> .js-nav-item-header span', this.$el).mousedown(function (event) {
                var $title = jQuery(this);
                $title.data('beforeChange', $title.text());
            }).bind('blur', function (event) {
                var $title = jQuery(this), prevText = $title.data('beforeChange'), afterText = $title.text();
                if (prevText !== afterText)
                    _self.model.set('title', afterText);
            }).bind('keydown', function (event) {
                var key = event.which | event.keyCode;
                if (key === 13 || key === 27) {
                    event.preventDefault();
                    // revert content if press esc key
                    if (key === 27) {
                        var $title = jQuery(this), beforeChangedText = $title.data('beforeChange');
                        $title.text(beforeChangedText);
                    }
                    jQuery(this).trigger('blur');
                }
            });
            // highlight view when hover navigator of object
            jQuery('> .js-nav-item-header > .js-navigator-item-title', this.$el).hover(function () {
                _self.model.getView().$el.addClass('ac_highlight');
            }, function () {
                var $view = _self.model.getView().$el;
                if (!$view.hasClass('js-active')) {
                    $view.removeClass('ac_highlight');
                }
            });
            // handle event click out title
            jQuery(document).click(function (event) {
                var $title = jQuery('.js-navigator-item-title > span', _self.$el);
                if ($title.is(':focus') && !jQuery(event.target).closest($title).length) {
                    $title.trigger('blur');
                }
            });
        };
        /**
         * handle startSort event
         */
        NavigatorView.prototype.onStartSort = function (event, sortItem) {
            // set is sorting flag
            this.sorting = true;
            // check when sort item over
            var checkTop = jQuery(sortItem).offset().top, isDown = false, _self = this, onTopCount = 0, checkInterval;
            checkInterval = setInterval(function () {
                if (!_self.sorting) {
                    clearInterval(checkInterval);
                    jQuery('> .js-nav-body', _self.$el).css('min-height', '');
                }
                else {
                    var top_6 = _self.$el.offset().top, bottom = top_6 + _self.$el.height(), sortTop = jQuery(sortItem).offset().top, sortBottom = sortTop + jQuery(sortItem).height();
                    // get move direction
                    if (sortTop < checkTop)
                        isDown = false;
                    else if (sortTop > checkTop)
                        isDown = true;
                    // set check top is current top
                    checkTop = sortTop;
                    if ((!isDown && sortTop >= top_6 && sortTop <= bottom) || (isDown && sortBottom >= top_6 && sortBottom <= bottom)) {
                        if (_self.isCollapsed()) {
                            if (onTopCount >= 20) {
                                _self.onCollapsedClick();
                                _self.expanded = true;
                            }
                            else {
                                onTopCount++;
                                return;
                            }
                        }
                        // set height for receive collection
                        jQuery('> .js-nav-body', _self.$el).css('min-height', jQuery(sortItem).height());
                        if (_self.model.get('content').allowSort)
                            jQuery('> .js-nav-body', _self.$el).sortable('refresh');
                    }
                    else {
                        // reset onTopCount
                        onTopCount = 0;
                        // reset receive collection height
                        jQuery('> .js-nav-body', _self.$el).css('min-height', '');
                    }
                }
            }, 50);
        };
        /**
         * Hanlde stopSort event
         */
        NavigatorView.prototype.onStopSort = function (event) {
            // set stop sorting flag
            this.sorting = false;
            // collapse item if expaned when sort
            if (this.expanded) {
                this.expanded = false;
                this.onCollapsedClick();
            }
        };
        /**
         * handle when click to select a object
         * @param event: jquery event
         * @param showPanel: boolean
         */
        NavigatorView.prototype.onTitleMouseDown = function (event, showPanel) {
            // stop fire event to parents if mousedown on span
            if (jQuery(event.target).prop('tagName').toLowerCase() === 'span')
                event.stopPropagation();
            // process to active selected item
            var navigatorPanel = this.model.getNavigatorPanel(), $selectItem = jQuery(event.target).closest('.js-nav-item');
            if (!$selectItem.hasClass('active')) {
                // save title if is editting
                var $activeItem = jQuery('.js-nav-item.active', navigatorPanel.getView().$el).removeClass('active');
                jQuery('> .js-nav-item-header span', $activeItem).blur();
                // active selected item
                $selectItem.addClass('active');
                // add highlight class to view
                this._$('.ac_highlight').removeClass('ac_highlight js-active');
                this.model.getView().$el.addClass('ac_highlight js-active');
                // scroll to select element view
                if (!event.isTrigger) {
                    this._$('body').stop().animate({ scrollTop: this.model.getView().$el.offset().top - 30 }, '500', 'swing');
                }
            }
            // create activeModel event to navigator panel
            this.$el.parents('.js-ac_panel:first').trigger('activateModel', { model: this.model, showPanel: showPanel });
        };
        /**
         * handle click to button hide element in screen mode
         * @param event
         */
        NavigatorView.prototype.hideViewInResponsiveMode = function (event) {
            this.preventDefaultEvent(event);
            if (this.model.allowShowHideResponsive) {
                var hidden = false, responsiveMode = this.model.getResponsiveMode(), $hidden = jQuery(event.currentTarget).find('> i');
                if ($hidden.hasClass('js-show')) {
                    $hidden.removeClass('js-show acicon acicon-show').attr('title', this.translate('Show'));
                    hidden = true;
                }
                else {
                    $hidden.addClass('js-show acicon acicon-show').attr('title', this.translate('Hide'));
                    hidden = false;
                }
                this.model.setSettingsAttr("main.responsive.hidden." + responsiveMode, hidden);
            }
        };
        /**
         * handle click to collapsed button
         */
        NavigatorView.prototype.onCollapsedClick = function (event) {
            // stop click to parent element
            if (event)
                event.stopPropagation();
            // process display for collapsed button
            var $collapsedBtn = jQuery('> .js-nav-item-header > .js-navigator-item-title > .js-collapsed-sub', this.$el), $navContent = jQuery('> .js-nav-body', this.$el);
            $collapsedBtn.toggleClass('js-collapsed');
            if ($collapsedBtn.hasClass('js-collapsed')) {
                $navContent.hide();
                $collapsedBtn.addClass('acicon-triangle-right').removeClass('acicon-triangle-down');
            }
            else {
                $collapsedBtn.addClass('acicon-triangle-down').removeClass('acicon-triangle-right');
                $navContent.show();
            }
        };
        /**
         * Handle event change when change responsive mode
         * @param event
         */
        NavigatorView.prototype.changeResponsiveDisplay = function () {
            var machineName = this.model.getMachineName(), defaultSettings = ContentObject.generateObjectSettings(machineName), $status = jQuery('> .js-nav-item-header > a.js-show-hide > i', this.$el), responsiveMode = this.model.getResponsiveMode(), selector = "main.responsive.hidden", defaultResponsive = defaultSettings.main.responsive.hidden, responsive = jQuery.extend(true, {}, defaultResponsive, this.model.getSettingsAttr(selector)), state = responsive[responsiveMode];
            if (!state)
                $status.addClass('acicon acicon-show').attr('title', this.translate('Hide'));
            else
                $status.removeClass('acicon acicon-show').attr('title', this.translate('Show'));
        };
        /**
         * update new indent for this model
         * @param indent: new indent value
         */
        NavigatorView.prototype.updateIndent = function (indent) {
            var $title = jQuery('> .js-nav-item-header > .js-navigator-item-title', this.$el);
            // remove current indent class and update indent attribute
            $title.removeClass('indent-' + this.indent).addClass('indent-' + indent);
            this.$el.attr('data-indent', indent);
            this.indent = indent;
            // set indent for content
            var content = this.model.get('content');
            if (content instanceof ContentObjects) {
                content.each(function (object, index) {
                    object.setIndent(indent + 1);
                });
            }
        };
        /**
         * remove class active element in navigator
         */
        NavigatorView.prototype.deactivate = function () {
            this.$el.removeClass('active');
        };
        /**
         * check element is collapsed
         */
        NavigatorView.prototype.isCollapsed = function () {
            var $collapsedBtn = jQuery('> .js-nav-item-header > .js-navigator-item-title > .js-collapsed-sub', this.$el);
            return $collapsedBtn.hasClass('js-collapsed');
        };
        /**
         * handle change title of model
         */
        NavigatorView.prototype.changeTitle = function (model, value, options) {
            jQuery('> .js-nav-item-header > .js-navigator-item-title > span', this.$el).text(value);
        };
        return NavigatorView;
    }(AweBuilder.AbstractView));
    AweBuilder.NavigatorView = NavigatorView;
    /**
     * Define collection class for content object
     */
    var ContentObjects = (function (_super) {
        __extends(ContentObjects, _super);
        /**
         * constructor function
         */
        function ContentObjects(models, options, className, navClassName) {
            // process options and implements parent constructor
            if (options === undefined || options.model === undefined)
                options = jQuery.extend(true, {}, options, { model: ContentObject });
            if (jQuery.type(models) === "array")
                jQuery.each(models, function (index, model) {
                    if (!(model instanceof ContentObject))
                        delete model.cid;
                });
            _super.call(this, models, options);
            // process classes data
            this.className = className;
            this.navClassName = navClassName !== undefined ? "js-nav-body ac_navigator-item-body " + navClassName : 'js-nav-body ac_navigator-item-body';
            // assign this is collection of model
            var _self = this;
            jQuery.each(this.models, function (index, model) {
                if (model) {
                    var undefinedElement = model.get('undefinedElement');
                    if (undefinedElement) {
                        _self.remove(model, { silent: true });
                    }
                    else {
                        model.collection = _self;
                    }
                }
            });
            // create view & navigator view for collection
            this.createView();
            this.createNavigatorViews();
        }
        /**
         * overrides initialize() method
         */
        ContentObjects.prototype.initialize = function (models, options) {
            this.allowSort = true;
            // implements custom init()
            this.init(models, options);
            // implements parent method
            _super.prototype.initialize.call(this, models, options);
        };
        /**
         * custom init method
         */
        ContentObjects.prototype.init = function (models, options) {
        };
        /**
         * get container which contains this collection in content
         * @returns {ContentObject}
         */
        ContentObjects.prototype.getContainer = function () {
            return this.container;
        };
        /**
         * get root container object of collection
         */
        ContentObjects.prototype.getChildObject = function (indexes) {
            var model, collection = this;
            for (var i = 0; i < indexes.length; i++) {
                var index = indexes[i];
                model = collection.at(index);
                if (model && model.get('content')) {
                    collection = model.get('content');
                }
                else {
                    model = undefined;
                    break;
                }
            }
            return model;
        };
        /**
         * set container object which contains this collection
         * @param model
         */
        ContentObjects.prototype.setContainer = function (model) {
            this.container = model;
        };
        /**
         * create view instance of this collection
         */
        ContentObjects.prototype.createView = function () {
            this.view = new ContentObjectsView({ collection: this, className: this.className });
        };
        /**
         * get view object of this collection
         */
        ContentObjects.prototype.getView = function () {
            return this.view;
        };
        /**
         * create navigator view for collection
         */
        ContentObjects.prototype.createNavigatorViews = function () {
            this.navigatorViews = new NavigatorViews({ collection: this, className: this.navClassName });
        };
        /**
         * get navigator view of collection
         */
        ContentObjects.prototype.getNavigatorView = function () {
            return this.navigatorViews;
        };
        /**
         * set navigator panel
         */
        ContentObjects.prototype.setNavigatorPanel = function (panel) {
            this.navigatorPanel = panel;
            this.each(function (object, index) {
                object.setNavigatorPanel(panel);
            });
        };
        /**
         * get navigator panel
         */
        ContentObjects.prototype.getNavigatorPanel = function () {
            return this.navigatorPanel;
        };
        /**
         * filter elements by attribute name
         */
        ContentObjects.prototype.getElementsByAttribute = function (attrName, value) {
            return this.filter(function (model) {
                return model.get(attrName) === value;
            });
        };
        return ContentObjects;
    }(Backbone.Collection));
    AweBuilder.ContentObjects = ContentObjects;
    /**
     * Define view class for content objects collection
     */
    var ContentObjectsView = (function (_super) {
        __extends(ContentObjectsView, _super);
        function ContentObjectsView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize method
         */
        ContentObjectsView.prototype.initialize = function (options) {
            this.allowUpdateDeleteBtn = false;
            // implements parent method
            _super.prototype.initialize.call(this, options);
            // listen add and remove object from collection
            this.listenTo(this.collection, 'add', this.listenAddObject);
            this.listenTo(this.collection, 'remove', this.listenRemoveObject);
            // update state of delete button
            this.updateDeleteButton();
        };
        /**
         * overrides render method
         */
        ContentObjectsView.prototype.render = function () {
            // render content
            this.renderContent();
            // init sort for element
            var _self = this, addToDocInterval;
            addToDocInterval = setInterval(function () {
                if (_self.$wrapper.parents('body').length) {
                    // clear wait element added to iframe
                    clearInterval(addToDocInterval);
                    // init sortable for elements
                    _self.initSort();
                    // init sortable to connect with element panel
                    _self.initSortableConnectWithElementPanel();
                    // implements collection ready callback
                    _self.collectionReady();
                }
            }, 100);
            return this;
        };
        /**
         * render content of collection
         */
        ContentObjectsView.prototype.renderContent = function () {
            var _self = this;
            // set wrapper element
            this.$wrapper = this.$el;
            // add view of objects in collection
            this.collection.each(function (object, index) {
                var view = object.getView();
                if (view)
                    _self.$wrapper.append(view.$el);
            });
        };
        /**
         * init sortable for object view in builder frame
         */
        ContentObjectsView.prototype.initSort = function (axis) {
            // function to get indexes of sorting object
            function getItemIndexes($item) {
                var indexes = [];
                if ($item) {
                    var $parents = $item.parents('.js-content-object:not(.js-type-menubox)');
                    $parents.each(function (index, el) {
                        var $obj = jQuery(el), index = $obj.index();
                        //fix error index tab
                        if ($obj.hasClass('ac-tab__panel') && index)
                            index--;
                        indexes.unshift(index);
                    });
                }
                return indexes;
            }
            // init sortable for content items
            var _self = this, collection = this.collection, sortTypeClass = "js-sort-" + this.collection.model.type;
            // add sort type class to wrapper
            this.$wrapper.addClass(sortTypeClass);
            // init sort for content objects
            this._$(this.el).sortable({
                items: '> .js-content-object',
                axis: axis ? axis : false,
                connectWith: "." + sortTypeClass,
                handle: ".js-ac-control-move",
                placeholder: 'ac_placeholder',
                helper: function () {
                    return jQuery("<div class=\"js-ac-helper ac_helper\"><span class=\"js-text-title text-title\"></span></div>");
                },
                cursor: "move",
                cursorAt: { left: 12, top: 12 },
                forcePlaceholderSize: true,
                appendTo: jQuery('iframe').contents().find('body'),
                tolerance: 'pointer',
                start: function (event, ui) {
                    // save prev position info
                    var index = ui.item.index(), sortObject = collection.at(index), rootCollectionDeep = ui.item.parents('.ui-sortable').length, rootCollection = sortObject.getRootCollection(rootCollectionDeep);
                    ui.item.data('sortObject', sortObject).data('rootCollection', rootCollection);
                    // call custom before sort
                    _self.beforeSort(event, ui);
                    // set width for placeholder
                    var itemWidth = ui.item.attr('defWidth');
                    if (itemWidth)
                        ui.placeholder.width(itemWidth);
                    // refresh sort items position
                    _self._$(_self.$wrapper).sortable('refreshPositions');
                    //set title of drag to helper
                    jQuery('.js-text-title', ui.helper).html(sortObject.get('title'));
                    ui.helper.addClass("ac_helper--" + sortObject.getType());
                    // show grid in layout builder if not show by default
                    sortObject.getView().updateGridView(true);
                },
                update: function (event, ui) {
                    if (!ui.sender) {
                        // remove sort-object from collection
                        var sortObject = ui.item.data('sortObject'), sentCollection = sortObject.getCollection();
                        sortObject = sentCollection.remove(sortObject, { action: 'sort' });
                        // add sort object to receive collection
                        var rootCollection = ui.item.data('rootCollection'), receiverIndexes = getItemIndexes(ui.item), receiverContainer = rootCollection.getChildObject(receiverIndexes), receiveCollection = receiverContainer ? receiverContainer.get('content') : rootCollection, index = ui.item.index();
                        receiveCollection.add(sortObject, {
                            at: index,
                            source: 'view',
                            changedCollection: !sentCollection.getView().$el.is(receiveCollection.getView().$el)
                        });
                    }
                },
                stop: function (event, ui) {
                    // remove inline style of sort element
                    ui.item.removeAttr('style');
                    // implements stop sort callback for each object type
                    _self.afterSort(event, ui);
                    // show grid in layout builder if not show by default
                    var sortObjectView = ui.item.data('sortObject').getView();
                    sortObjectView.updateGridView(false);
                }
            });
            if (!_self.collection.allowSort)
                this._$(this.el).sortable('disable');
        };
        /**
         * init sort to connect with element panel
         */
        ContentObjectsView.prototype.initSortableConnectWithElementPanel = function () {
            var _self = this, type = this.collection.model.type, typeClass = ".js-type-" + type, controllerClass = "js-controller-" + type;
            // init sort
            this.$wrapper.sortable({
                placeholder: 'ac_placeholder',
                handle: '.js-not-handle',
                items: typeClass,
                tolerance: 'pointer',
                start: function (event, ui) {
                    ui.placeholder.css({ width: '100%', height: 50 });
                },
                sort: function (event, ui) {
                    if (ui.helper.attr('stopSort'))
                        ui.placeholder.hide().removeAttr('addElement');
                    else if (ui.helper.attr('startSort'))
                        ui.placeholder.show().attr('addElement', "true");
                },
                update: function (event, ui) {
                    if (ui.placeholder.attr('addElement') && ui.item.hasClass(controllerClass)) {
                        var controllerObject = eval(ui.item.attr('data-tab') + ".createControllerObject(ui.item)"), receiveContainer = _self.collection.getContainer(), receivedCollection = receiveContainer ? receiveContainer.get('content') : _self.collection, responsiveMode = receiveContainer ? receiveContainer.getResponsiveMode() : receivedCollection.at(0).getResponsiveMode(), index = ui.item.index();
                        // add element object to column container
                        if (controllerObject) {
                            // set navigatorPanel
                            controllerObject.setNavigatorPanel(_self.collection.getNavigatorPanel());
                            // set current responsive mode setting to model
                            controllerObject.setResponsiveMode(responsiveMode);
                            // create new element object
                            receivedCollection.add(controllerObject, { at: index });
                            // set drag element is active model to edit
                            controllerObject.getView().edit();
                        }
                    }
                    // remove element controller
                    ui.item.remove();
                }
            });
        };
        /**
         * callback implements before start sort content object view
         * @param {any} event: event in start of jquery ui sortable
         * @param {any} ui: ui parameter in start of jquery ui sortable
         */
        ContentObjectsView.prototype.beforeSort = function (event, ui) {
            ui.placeholder.css('width', '100%');
        };
        /**
         * callback implements after sort content object view stop
         * @param {any} event: event in start of jquery ui sortable
         * @param {any} ui: ui parameter in start of jquery ui sortable
         */
        ContentObjectsView.prototype.afterSort = function (event, ui) {
            ui.item.removeAttr('style');
        };
        /**
         * callback implements view when object is added to collection
         */
        ContentObjectsView.prototype.listenAddObject = function (object, collection, options) {
            // add view for added object to collection view
            if (options.source !== 'view') {
                var _self = this, view = object.getView();
                switch (options.index) {
                    case 0:
                        _self.$wrapper.prepend(view.$el);
                        break;
                    case collection.length - 1:
                    case undefined:
                        _self.$wrapper.append(view.$el);
                        break;
                    default:
                        var type = object.__proto__.constructor.type, index = view.$el.index();
                        if (!options.changedCollection && index >= 0 && index <= options.index)
                            jQuery("> .js-type-" + type + ":eq(" + options.index + ")", _self.$wrapper).after(view.$el);
                        else
                            jQuery("> .js-type-" + type + ":eq(" + options.index + ")", _self.$wrapper).before(view.$el);
                        break;
                }
                // update state of delete button
                this.updateDeleteButton();
            }
            var indent = collection.getContainer() ? collection.getContainer().getIndent() + 1 : 1;
            object.setIndent(indent);
        };
        /**
         * callback implements view when object is removed to collection
         */
        ContentObjectsView.prototype.listenRemoveObject = function (object, collection, options) {
            // remove view of remove object
            if (options.action !== 'sort')
                object.getView().$el.remove();
            // update state of delete button
            this.updateDeleteButton();
        };
        /**
         * disable delete button in first section
         */
        ContentObjectsView.prototype.updateDeleteButton = function () {
            if (this.allowUpdateDeleteBtn && this.collection.length === 1) {
                this.firstView = this.collection.at(0).getView();
                this.firstView.updateDeleteBtn(false);
            }
            else {
                if (this.firstView)
                    this.firstView.updateDeleteBtn(true);
            }
        };
        /**
         * set allowUpdateDeleteBtn
         */
        ContentObjectsView.prototype.setAllowUpdateDeleteBtn = function (flag) {
            this.allowUpdateDeleteBtn = flag;
            this.updateDeleteButton();
        };
        /**
         * collection ready callback
         */
        ContentObjectsView.prototype.collectionReady = function () {
        };
        return ContentObjectsView;
    }(AweBuilder.AbstractView));
    AweBuilder.ContentObjectsView = ContentObjectsView;
    /**
     * Define navigator view for content objects collection
     */
    var NavigatorViews = (function (_super) {
        __extends(NavigatorViews, _super);
        function NavigatorViews() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize() method
         */
        NavigatorViews.prototype.initialize = function (options) {
            _super.prototype.initialize.call(this, options);
            this.listenTo(this.collection, 'add', this.listenAddObject);
            this.listenTo(this.collection, 'remove', this.listenRemoveObject);
        };
        /**
         * overrides render() method
         * @return {NavigatorViews}
         */
        NavigatorViews.prototype.render = function () {
            // render collection content
            this.renderContent();
            // init sortable content elements
            this.initSort();
            return this;
        };
        /**
         * render content view
         */
        NavigatorViews.prototype.renderContent = function () {
            // set wrapper of content
            this.$wrapper = this.$el;
            // render navigator view of content objects
            var _self = this, container = this.collection.getContainer(), indent = container ? container.getIndent() : 0;
            this.collection.each(function (object, index) {
                object.setIndent(indent + 1);
                if (object.getNavigatorView())
                    _self.$wrapper.append(object.getNavigatorView().$el);
            });
        };
        /**
         * init sortable for content elements
         */
        NavigatorViews.prototype.initSort = function () {
            // callback to get indexes of item in view
            function getItemIndexes($item) {
                var indexes = [], $parents = $item.parents('.js-nav-item:not(.js-nav-item-menubox)');
                // get index of navigator item of elements
                $parents.each(function () {
                    var index = jQuery('> .js-nav-item', jQuery(this).parent()).index(this);
                    indexes.unshift(index);
                });
                return indexes;
            }
            // init sort for navigator element
            var collection = this.collection, sortTypeClass = "js-sort-" + this.collection.model.type;
            this.$wrapper.addClass(sortTypeClass).sortable({
                items: '> .js-nav-item',
                connectWith: "." + sortTypeClass,
                cursorAt: { right: 100, top: 10 },
                axis: 'y',
                cursor: 'move',
                start: function (event, ui) {
                    var index = jQuery('> .js-nav-item', ui.item.parent()).index(ui.item), sortObject = collection.at(index), rootCollectionDeep = ui.item.parents('.ui-sortable').length, rootCollection = sortObject.getRootCollection(rootCollectionDeep), sortType = sortObject.getType();
                    // create start sort event and storage sorting element info
                    jQuery(".js-nav-body.js-sort-" + sortType).parent().trigger('startSort', ui.item);
                    ui.item.data('sortObject', sortObject).data('rootCollection', rootCollection);
                    // collapsed sorting item content
                    var $collapsedBtn = jQuery('> .js-nav-item-header .js-collapsed-sub', ui.item);
                    if (!$collapsedBtn.hasClass('js-collapsed')) {
                        $collapsedBtn.trigger('click');
                        ui.item.data('collapsed', true);
                    }
                },
                update: function (event, ui) {
                    if (!ui.sender) {
                        // remove sortObject from sent collection
                        var sortObject = ui.item.data('sortObject'), sentCollection = sortObject.getCollection();
                        sortObject = sentCollection.remove(sortObject, { action: 'sort' });
                        // Add sort object to receiveCollection
                        var rootCollection = ui.item.data('rootCollection'), receiverIndexes = getItemIndexes(ui.item), receiverContainer = rootCollection.getChildObject(receiverIndexes), receiverCollection = receiverContainer ? receiverContainer.get('content') : rootCollection, index = ui.item.index();
                        receiverCollection.add(sortObject, {
                            at: index,
                            source: 'navigator',
                            changedCollection: !sentCollection.getView().$el.is(receiverCollection.getView().$el)
                        });
                    }
                },
                stop: function (event, ui) {
                    // create event stop sort
                    var sortType = collection.model.type;
                    jQuery(".js-nav-body.js-sort-" + sortType).parent().trigger('stopSort');
                    // open sub element list if collapsed when start sort
                    if (ui.item.data('collapsed')) {
                        jQuery('> .js-nav-item-header .js-collapsed-sub', ui.item).trigger('click');
                        ui.item.data('collapsed', undefined);
                    }
                }
            });
            if (!this.collection.allowSort)
                this.$wrapper.sortable('disable');
        };
        /**
         * implements add view of object added to collection view
         */
        NavigatorViews.prototype.listenAddObject = function (object, collection, options) {
            var container = collection.getContainer(), indent = container ? container.getIndent() + 1 : 1;
            // set current indent
            object.setIndent(indent);
            if (options.source !== 'navigator') {
                var $wrapper = this.$wrapper, view = object.getNavigatorView();
                // process by added position to add view
                switch (options.index) {
                    case 0:
                        $wrapper.prepend(view.$el);
                        break;
                    case collection.length - 1:
                    case undefined:
                        $wrapper.append(view.$el);
                        break;
                    default:
                        var index = view.$el.index();
                        if (!options.changedCollection && index >= 0 && index <= options.index)
                            jQuery("> .js-nav-item:eq(" + options.index + ")", $wrapper).after(view.$el);
                        else
                            jQuery("> .js-nav-item:eq(" + options.index + ")", $wrapper).before(view.$el);
                        break;
                }
            }
            // update collapsed button view in container element
            if (container) {
                var navView = container.getNavigatorView();
                navView.updateCollapsedDisplay(1);
            }
            // enable reload alert message
            var builder = object.getBuilder();
            if (builder)
                builder.enableReloadAlert();
        };
        /**
         * implements remove view of object which is removed from collection
         */
        NavigatorViews.prototype.listenRemoveObject = function (object, collection, options) {
            // remove view of remove object
            if (options.action === undefined || options.action !== 'sort') {
                object.getNavigatorView().$el.remove();
            }
            // update collapsed button view in container element
            var container = collection.getContainer();
            if (container) {
                var navView = container.getNavigatorView();
                navView.updateCollapsedDisplay(collection.length);
            }
            //
            object.getView().edit();
            // enable reload alert message
            var builder = object.getBuilder();
            if (builder)
                builder.enableReloadAlert();
        };
        return NavigatorViews;
    }(AweBuilder.AbstractView));
    AweBuilder.NavigatorViews = NavigatorViews;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: tab.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 05/09/2016
 */
/// <reference path="../../core/awe-content-object.ts" />
/// <reference path="../../core/awe-tabs.ts" />
/// <reference path="../../../ts-libraries/jquery.ui.d.ts" />
var AweBuilder;
(function (AweBuilder) {
    var ElTab = (function (_super) {
        __extends(ElTab, _super);
        function ElTab() {
            _super.apply(this, arguments);
        }
        /**
         * overrides createView() method
         */
        ElTab.prototype.createView = function () {
            this.view = new ElTabView({ model: this, className: 'pd15' });
        };
        /**
         * set container panel object
         */
        ElTab.prototype.setContainerPanel = function (panel) {
            this.containerPanel = panel;
        };
        /**
         * get container panel object
         */
        ElTab.prototype.getContainerPanel = function () {
            return this.containerPanel;
        };
        /**
         * create model for controller's element
         */
        ElTab.createControllerObject = function ($controller) {
            return new AweBuilder.ContentObject();
        };
        return ElTab;
    }(AweBuilder.Tab));
    AweBuilder.ElTab = ElTab;
    var ElTabView = (function (_super) {
        __extends(ElTabView, _super);
        function ElTabView() {
            _super.apply(this, arguments);
            this.searchText = 'search element';
            this.dragging = false;
            this.mouseEnter = false;
        }
        /**
         * overrides initialize method()
         */
        ElTabView.prototype.initialize = function () {
            this.initializedDragElements = false;
            this.dragEl = ".js-controller-" + this.model.get('sortWithType');
            _super.prototype.initialize.call(this);
        };
        /**
         * declare events handler in tab view
         */
        ElTabView.prototype.events = function () {
            var events = {
                'keyup .js-search > input': 'search',
                'click .js-search > a': 'clearSearchText'
            };
            return events;
        };
        /**
         * overrides render method()
         */
        ElTabView.prototype.renderContent = function () {
            // add wrapper and search form
            this.$el.append("<div class=\"js-tab-header\">\n                    <div class=\"js-search ac_search\">\n                        <input type=\"text\" placeholder=\"" + this.translate(this.searchText) + "\">\n                        <i class=\"acicon acicon-search\"></i>\n                        <a href=\"#\" class=\"ac_search-remove\" style=\"display: none\">\n                            <i class=\"acicon acicon-close\"></i>\n                        </a>\n                    </div>\n                </div>\n                <div class=\"js-ac-row ac_row ac_row--scroll\"></div>").addClass('pd15');
            // set scrollbar element wrapper
            this.$scrollbar = jQuery('.js-ac-row', this.$el);
            // implements parent method
            _super.prototype.renderContent.call(this);
            // handle mouse down on elements controller
            var _self = this;
            this.$el.delegate(this.dragEl, 'mousedown', function () {
                // implements before drag element callback
                _self.beforeDragElement();
                // implements init options for draggable elements
                _self.initDragElements(jQuery(this).height());
            }).delegate(this.dragEl, 'mouseup', function () {
                jQuery('body > .js-draggable-helper').remove();
                _self.stopDragElement();
            });
            // handle mouseenter event
            this.$el.mouseenter(function (event) {
                // set flag mouse enter
                _self.mouseEnter = true;
                // change scrollbar from iframe to edit page
                var $iframe = _self.getBuilderIframeContents(true);
                if ($iframe && !_self.dragging) {
                    var $frameContents = _self.getBuilderIframeContents(), scrollTop = $frameContents.scrollTop();
                    $iframe.height($frameContents.height() + 150);
                    jQuery(window).scrollTop(scrollTop);
                }
                // init draggable for elements
                if (!_self.initializedDragElements)
                    _self.initDragElements();
            }).mouseleave(function (event) {
                // set flag mouse is leave
                _self.mouseEnter = false;
                // change scrollbar from edit page to iframe
                var $iframe = _self.getBuilderIframeContents(true);
                if ($iframe && !_self.dragging) {
                    var $frameContents = _self.getBuilderIframeContents(), scrollTop = jQuery(window).scrollTop();
                    $iframe.removeAttr('style');
                    $frameContents.scrollTop(scrollTop);
                }
            });
            return this.$el;
        };
        /**
         * init dragable for element controller
         */
        ElTabView.prototype.initDragElements = function (dragElementHeight) {
            // init drag for elements controller
            var _self = this, panel = _self.model.getContainerPanel(), settings = panel.getBuilder().getSettings();
            if (!this.initializedDragElements) {
                jQuery("" + this.dragEl, this.$el).draggable({
                    helper: 'clone',
                    revert: 'invalid',
                    iframeFix: true,
                    refreshPositions: true,
                    snapMode: 'inner',
                    snapTolerance: 10,
                    appendTo: 'body',
                    start: function (event, ui) {
                        // set flag is dragging
                        _self.dragging = true;
                        // get offset mouse in drag controller
                        var offsetX = event.pageX - ui.originalPosition.left, offsetY = event.pageY - ui.originalPosition.top;
                        // create fake helper
                        var $fakeHelper = ui.helper.clone().addClass('js-draggable-helper');
                        $fakeHelper.mouseup(function () {
                            jQuery(this).remove();
                        }).data('offsetX', offsetX).data('offsetY', offsetY)
                            .width(30).height(40);
                        jQuery('body').append($fakeHelper);
                        ui.helper.css('opacity', 0).width(30).height(40);
                        // implements callback before start drag element
                        _self.beforeStartDrag(event, ui);
                        // show grid in layout builder if not show by default
                        if (settings && !settings.showGrid)
                            _self._$('.js-ac-page-wrapper').addClass('ac_guides');
                    },
                    drag: function (event, ui) {
                        // update position for helper
                        var $helper = jQuery("body > .js-draggable-helper"), offsetX = $helper.data('offsetX'), offsetY = $helper.data('offsetY');
                        ui.helper.offset({ top: event.pageY - offsetY, left: event.pageX - offsetX });
                        // create fake helper for dragging helper
                        if (jQuery("body > .ui-draggable-dragging").length > 1) {
                            $helper.hide();
                            ui.helper.css('opacity', '');
                        }
                        else {
                            jQuery('body > .js-draggable-helper').show();
                            ui.helper.css('opacity', 0);
                        }
                        $helper.offset(ui.helper.offset());
                        // update builder height
                        var $frameContents = _self.getBuilderIframeContents();
                        if ($frameContents)
                            $frameContents.trigger('mouseover');
                        // check position of dragging helper
                        var $panel = jQuery('.js-panel-inner', panel.getView().$el), panelOffset = $panel.offset(), panelBottom = panelOffset.top + $panel.height(), panelRight = panelOffset.left + $panel.width();
                        if (event.pageY >= panelOffset.top && event.pageY <= panelBottom && event.pageX >= panelOffset.left && event.pageX <= panelRight) {
                            ui.helper.attr('stopSort', true).removeAttr('startSort');
                        }
                        else {
                            ui.helper.attr('startSort', true).removeAttr('stopSort');
                        }
                    },
                    stop: function (event, ui) {
                        // remove fake helper
                        jQuery('body > .js-draggable-helper').css('transition', 'none').remove();
                        // disable grid if not show by default
                        if (settings && !settings.showGrid)
                            _self._$('.js-ac-page-wrapper').removeClass('ac_guides');
                        // update iframe builder height
                        var updateTimer = setTimeout(function () {
                            // update builder height
                            var $frameContents = _self.getBuilderIframeContents();
                            if ($frameContents)
                                $frameContents.trigger('mouseover');
                            // implements stop drag element
                            _self.stopDragElement();
                        }, 200);
                    }
                });
                // set flag draggable is initialized
                this.initializedDragElements = true;
            }
            else {
                // set set receive elements for draggable element
                var $sortable = jQuery('iframe').contents().find(".js-sort-" + this.model.get('sortWithType'));
                jQuery("" + this.dragEl, this.$el).draggable('option', 'connectToSortable', $sortable);
            }
        };
        /**
         * before start drag element
         */
        ElTabView.prototype.beforeStartDrag = function (event, ui) { };
        /**
         * get builder iframe element
         */
        ElTabView.prototype.getBuilderIframeContents = function (getIframe) {
            var panel = this.model.getContainerPanel(), builder = panel.getBuilder(), $iframe = builder.getBuilderIframe();
            if (getIframe)
                return $iframe;
            return $iframe ? $iframe.contents() : undefined;
        };
        /**
         * process before start drag an element to builder
         */
        ElTabView.prototype.beforeDragElement = function () {
            var $frameContents = this.getBuilderIframeContents();
            // disable scrollbar in builder iframe
            if ($frameContents)
                $frameContents.find('html').css('overflow', 'hidden');
        };
        /**
         * process after stop drag element
         */
        ElTabView.prototype.stopDragElement = function (event) {
            var $frameContents = this.getBuilderIframeContents();
            // enable scrollbar in builder iframe
            if ($frameContents)
                $frameContents.find('html').removeAttr('style');
            // trigger mouseleave
            this.dragging = false;
            if (!this.mouseEnter)
                this.$el.trigger('mouseleave');
        };
        /**
         * destroy draggable controller's elements
         */
        ElTabView.prototype.destroyDragElements = function () {
            if (this.initializedDragElements) {
                this.initializedDragElements = false;
                jQuery(this.dragEl, this.$el).draggable('destroy');
            }
        };
        /**
         * handle keyup event on input search
         */
        ElTabView.prototype.search = function (event, category) {
            event.preventDefault();
            var typedString = jQuery('.js-search > input', this.$el).val().trim(), searchString = typedString.split('').join('.*'), regex = new RegExp(".*" + searchString + ".*", 'gi');
            // show clear button if has text
            if (typedString)
                jQuery('.js-search > a', this.$el).show();
            else
                jQuery('.js-search > a', this.$el).hide();
            // process search
            this.processSearch(regex);
        };
        /**
         * process search with regex expression
         */
        ElTabView.prototype.processSearch = function (regex) {
            jQuery(".js-ac-row .ui-draggable", this.$el).fadeOut(100).filter(function () {
                return jQuery(this).attr('data-title').match(regex);
            }).fadeIn(100);
        };
        /**
         * handle click on clear text button
         */
        ElTabView.prototype.clearSearchText = function (event) {
            if (event)
                event.preventDefault();
            jQuery('.js-search > input', this.$el).val('').trigger('keyup');
        };
        return ElTabView;
    }(AweBuilder.TabView));
    AweBuilder.ElTabView = ElTabView;
})(AweBuilder || (AweBuilder = {}));
/// <reference path="../../core/awe-abstract.ts"/>
var AweBuilder;
(function (AweBuilder) {
    /**
     * Define model class for template item
     */
    var TemplateItem = (function (_super) {
        __extends(TemplateItem, _super);
        function TemplateItem() {
            _super.apply(this, arguments);
        }
        /**
         * overrides createView() method
         */
        TemplateItem.prototype.createView = function () {
            this.view = new TemplateItemView({
                model: this,
                className: "js-section-template ac_section-template-item"
            });
        };
        return TemplateItem;
    }(AweBuilder.Abstract));
    AweBuilder.TemplateItem = TemplateItem;
    /**
     * Define view class for TemplateItem
     */
    var TemplateItemView = (function (_super) {
        __extends(TemplateItemView, _super);
        function TemplateItemView() {
            _super.apply(this, arguments);
        }
        /**
        * overrides initialize() method
        */
        TemplateItemView.prototype.initialize = function () {
            this.template = _.template("\n                <div class=\"js-controller-section ac_section-template-cover\">\n                    <img src=\"<%= thumbURL %>\" alt=\"<%= title %>\">\n                </div>\n                <div class=\"js-favorite ac_section-template-item-favorite\" title=\"" + this.translate('Favourite') + "\">\n                    <i class=\"acicon acicon-star\"></i>\n                </div>\n            ");
            _super.prototype.initialize.call(this);
        };
        /**
         * overrides render() method
         */
        TemplateItemView.prototype.render = function () {
            // render template view
            var template = this.model.toJSON(), category = template.category ? template.category.toLowerCase().replace(/[^a-z,]/, '_') : 'custom', $template = jQuery(this.template({
                title: template.title,
                thumbURL: template.cover.url,
                favorite: template.favorite
            }));
            this.$el.append($template).addClass(category.split(',').join(' '));
            // check favorite template class
            if (template.favorite) {
                this.$el.addClass('favorited');
                jQuery('.js-controller-section', this.$el).addClass('favorited');
                jQuery('.js-favorite > i', this.$el).removeClass('acicon-star').addClass('acicon-star-2');
            }
            // render template data
            jQuery('.js-controller-section', this.$el).addClass(category.split(',').join(' '))
                .attr('data-template', JSON.stringify(template))
                .attr('data-tab', 'AweBuilder.TemplatesTab')
                .attr('data-title', this.model.get('title'))
                .attr('data-tooltip', template.title)
                .attr('template-id', template.id);
            // handle click to favorite state
            var _self = this;
            jQuery('.js-favorite', this.$el).click(function (event) {
                event.preventDefault();
                var newState = !_self.$el.hasClass('favorited'), postParams = AweBuilder.prepareAjaxParamenters('templates', {
                    requestAction: 'setFavorite',
                    type: 'section',
                    state: newState,
                    id: template.id
                });
                jQuery.post(postParams.url, postParams.data, function (response) {
                    if (response.status) {
                        _self.$el.toggleClass('favorited');
                        if (_self.$el.hasClass('favorited'))
                            jQuery('.js-favorite > i', _self.$el).removeClass('acicon-star').addClass('acicon-star-2');
                        else
                            jQuery('.js-favorite > i', _self.$el).removeClass('acicon-star-2').addClass('acicon-star');
                    }
                }, 'json');
            });
            return this;
        };
        return TemplateItemView;
    }(AweBuilder.AbstractView));
    AweBuilder.TemplateItemView = TemplateItemView;
    /**
     * Define collection of template item
     */
    var TemplateItems = (function (_super) {
        __extends(TemplateItems, _super);
        /**
         * constructor function
         */
        function TemplateItems(models, options) {
            // set model of collection is TemplateItem;
            if (options === undefined)
                options = {};
            options.model = TemplateItem;
            // implements parent method
            _super.call(this, models, options);
            // create view object
            this.createView();
        }
        /**
         * overrides createView() method
         */
        TemplateItems.prototype.createView = function () {
            this.view = new TemplateItemsView({ collection: this });
        };
        /**
         * get view method
         */
        TemplateItems.prototype.getView = function () {
            return this.view;
        };
        return TemplateItems;
    }(Backbone.Collection));
    AweBuilder.TemplateItems = TemplateItems;
    /**
     * Define view class for collection of template
     */
    var TemplateItemsView = (function (_super) {
        __extends(TemplateItemsView, _super);
        function TemplateItemsView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize method
         */
        TemplateItemsView.prototype.initialize = function (options) {
            // create filter element
            this.filter = new AweBuilder.AweSelect({
                type: 'select',
                title: 'Categories',
                inlineTitle: true,
                options: {
                    '*': 'All',
                    '.favorited': 'Favourite'
                },
                selector: '',
                widthNumber: false,
                defaultValue: '*',
                customStyles: {
                    '.ac_select-list': {
                        'padding-left': '75px'
                    }
                },
                change: jQuery.proxy(this.filterTemplates, this)
            });
            // listen add new template event
            this.listenTo(this.collection, 'add', this.addTemplate);
            // implements parent method
            _super.prototype.initialize.call(this, options);
        };
        /**
         * overrides render method
         */
        TemplateItemsView.prototype.render = function () {
            var _self = this;
            this.collection.each(function (template, index) {
                _self.$el.prepend(template.getView().$el);
            });
            return this;
        };
        /**
         * add template view
         */
        TemplateItemsView.prototype.addTemplate = function (template, collection, options) {
            // add view of template
            if (options.index === 0) {
                this.$el.prepend(template.getView().$el);
                this.filter.$el.trigger('change');
            }
            else
                this.$el.append(template.getView().$el);
            // add category of filter
            var filterOpts = this.filter.getOptions().options, categories = Object.keys(filterOpts), changed = false, templateData = template.toJSON(), templateCategories = templateData.category ? templateData.category.split(',') : new Array();
            jQuery.each(templateCategories, function (index, category) {
                var categoryVal = category.toLowerCase().trim();
                if (jQuery.inArray(categoryVal, categories) === -1) {
                    filterOpts[("." + categoryVal)] = category.trim();
                    categories.push("." + categoryVal);
                    changed = true;
                }
            });
            if (changed)
                this.filter.setOptions(filterOpts);
        };
        /**
         * filter templates by category
         */
        TemplateItemsView.prototype.filterTemplates = function ($panel, $el, value, elementData, form) {
            // remove class first-item
            jQuery(".tooltip-first", this.$el).removeClass('tooltip-first');
            // show elements of category
            if (value === '*') {
                jQuery('.js-section-template', this.$el).show();
                jQuery('.js-section-template:first > div', this.$el).addClass('tooltip-first');
            }
            else {
                // add to change to 
                jQuery(".js-section-template" + value.current + ":first > div", this.$el).addClass('tooltip-first');
                jQuery(".js-section-template" + value.current, this.$el).show(100);
                jQuery(".js-section-template:not(" + value.current + ")", this.$el).hide(100);
            }
        };
        /**
         * get filter element
         */
        TemplateItemsView.prototype.getFilter = function () {
            return this.filter;
        };
        return TemplateItemsView;
    }(AweBuilder.AbstractView));
    AweBuilder.TemplateItemsView = TemplateItemsView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: template-tab.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 26/04/2016
 */
/// <reference path="../../core/awe-section.ts"/>
/// <reference path="tab.ts"/>
/// <reference path="template-item.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var TemplatesTab = (function (_super) {
        __extends(TemplatesTab, _super);
        /**
         * constructor function
         */
        function TemplatesTab() {
            // implements parent function
            var options = {
                title: 'Section Templates',
                headerHTML: '<i class="acicon acicon-section"></i>',
                content: new AweBuilder.TemplateItems(),
                sortWithType: 'section'
            };
            _super.call(this, options);
            // set loaded templates number and loadMore
            this.loadMore = true;
            this.numberTemplates = 0;
            // init to get templates from server
            this.getTemplates();
        }
        /**
         * overrides createView() method
         */
        TemplatesTab.prototype.createView = function () {
            this.view = new TemplatesTabView({ model: this });
        };
        /**
         * load templates info from server
         */
        TemplatesTab.prototype.getTemplates = function () {
            if (!this.loading && this.loadMore) {
                var _self_16 = this, view_1 = this.view, postParams = AweBuilder.prepareAjaxParamenters('templates', { requestAction: 'get', from: this.numberTemplates, length: 10, type: 'section' });
                // create request to load template from server
                if (postParams) {
                    // set flag is loading templates
                    this.loading = true;
                    // send request to get templates
                    jQuery.post(postParams.url, postParams.data, function (response) {
                        // unset loading flag
                        _self_16.loading = false;
                        // set load infinitive flag
                        _self_16.loadMore = response && response.loadMore !== undefined ? response.loadMore : false;
                        // add new loaded templates
                        if (response && response.templates !== undefined) {
                            // destroy drag elements
                            view_1.destroyDragElements();
                            // add templates to content
                            _self_16.get('content').unshift(response.templates);
                            _self_16.numberTemplates += response.templates.length;
                            // init drag elements
                            view_1.initDragElements();
                        }
                    }, 'json');
                }
            }
        };
        /**
         * add new template item
         */
        TemplatesTab.prototype.addTemplate = function (template) {
            var view = this.view;
            view.destroyDragElements();
            this.get('content').unshift(template);
            view.initDragElements();
        };
        /**
         * overrides createControllerObject() method
         */
        TemplatesTab.createControllerObject = function ($controller) {
            var sectionData = $controller.data('template');
            return new AweBuilder.Section(sectionData.data);
        };
        return TemplatesTab;
    }(AweBuilder.ElTab));
    AweBuilder.TemplatesTab = TemplatesTab;
    var TemplatesTabView = (function (_super) {
        __extends(TemplatesTabView, _super);
        function TemplatesTabView() {
            _super.apply(this, arguments);
            this.searchText = 'search template';
        }
        /**
         * render content
         */
        TemplatesTabView.prototype.renderTabContent = function () {
            // remove ac_row class in scrollbar wrapper
            // this.$scrollbar.removeClass('ac_row');
            this.$scrollbar.addClass('template_tab_row');
            // render view for content
            var templatesView = this.model.get('content').getView();
            this.$scrollbar.append(templatesView.$el);
            // add filter object
            this.filer = templatesView.getFilter();
            jQuery('.js-tab-header', this.$el).append(this.filer.$el.css('margin-top', '10px'));
            // handle scroll on scrollbar
            var _self = this;
            this.$scrollbar.scroll(function (event) {
                var $yScrollbar = jQuery(event.currentTarget);
                if (($yScrollbar.scrollTop() + $yScrollbar.innerHeight()) == $yScrollbar[0].scrollHeight) {
                    _self.model.getTemplates();
                }
                //     let $yScrollbar = jQuery('.ps-scrollbar-y', _self.$scrollbar),
                //         contentHeight = _self.$scrollbar.height(),
                //         scrollbarHeight = $yScrollbar.height(),
                //         scrollbarTop = parseInt(<string>$yScrollbar.css('top'));
                //     if (contentHeight - scrollbarHeight - scrollbarTop <= 5)
                //         (<TemplatesTab>_self.model).getTemplates();
            });
            // handle filter template change
            this.filer.$el.change(function () {
                jQuery('.js-search > input', _self.$el).trigger('keyup');
            });
        };
        /**
         * overrides processSearch() method
         */
        TemplatesTabView.prototype.processSearch = function (regex) {
            var category = this.filer.getValue();
            if (category === '*')
                category = '';
            jQuery(".js-ac-row .js-section-template" + category, this.$el).fadeOut(100).filter(function () {
                return jQuery('> div', this).attr('data-title').match(regex);
            }).fadeIn(100);
        };
        /**
         * overrides beforeStartDrag() method
         */
        TemplatesTabView.prototype.beforeStartDrag = function (event, ui) {
            ui.helper.addClass('ac_section-template-item');
        };
        return TemplatesTabView;
    }(AweBuilder.ElTabView));
    AweBuilder.TemplatesTabView = TemplatesTabView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: awe-element.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 05/2016
 */
/// <reference path="../../ts-libraries/jquery.medium-editor.d.ts"/>
/// <reference path="./awe-form-elements.ts"/>
/// <reference path="./awe-content-object.ts"/>
var AweBuilder;
(function (AweBuilder) {
    /**
     * Define model class for element in layout
     */
    var Element = (function (_super) {
        __extends(Element, _super);
        /**
         * constructor function
         */
        function Element(options) {
            if (options && typeof options.machineName === 'string') {
                var machineName = options.machineName, elSettings = window.AweBuilderSettings.elements[machineName];
                if (elSettings !== undefined) {
                    // init title for element
                    if (options.title === undefined)
                        options.title = elSettings.title ? elSettings.title : machineName;
                    // generate default settings data for element
                    var defaultSettings = AweBuilder.ContentObject.generateObjectSettings(machineName, elSettings.data);
                    if (options.settings === undefined)
                        options.settings = Element.generateDefaultCustomSettings(defaultSettings);
                }
                else {
                    options.undefinedElement = true;
                    console.log("Elemnt type '" + machineName + "' did not exist.");
                }
                // implements parent constructor
                _super.call(this, options);
            }
            else
                throw Error('Create element object failed. You must pass machineName of element in constructor options.');
        }
        /**
         * overrides init() method
         */
        Element.prototype.init = function (options) {
            if (!options.undefinedElement) {
                // set element machine name
                this.machineName = options.machineName;
                // get ready callback
                var elementSettings = window.AweBuilderSettings.elements[this.machineName];
                if (elementSettings.ready)
                    this.elementReady = elementSettings.ready;
            }
        };
        /**
         * overrides createView() method
         */
        Element.prototype.createView = function () {
            // create view for element
            var undefinedElement = this.get('undefinedElement');
            if (!undefinedElement)
                this.view = new ElementView({ model: this });
        };
        /**
         * overrides createNavigatorView()
         */
        Element.prototype.createNavigatorView = function () {
            var undefinedElement = this.get('undefinedElement');
            if (!undefinedElement)
                this.navigatorView = new AweBuilder.NavigatorView({ model: this });
        };
        /**
         * overrides getType() method
         */
        Element.prototype.getType = function () {
            return 'element';
        };
        /**
         * reload content of view
         */
        Element.prototype.reloadContent = function () {
            // (<ElementView>this.view).reloadContent()
            // create new view for element
            var newView = new ElementView({ model: this });
            this.view.$el.before(newView.$el);
            // remove current view
            this.view.$el.remove();
            // set view is new view
            this.view = newView;
        };
        /**
         * get settings of element object
         */
        Element.prototype.getElementSettings = function () {
            var machineName = this.getMachineName(), settings = machineName ? window.AweBuilderSettings.elements[machineName] : undefined;
            return settings;
        };
        /**
         * generate default custom settings
         */
        Element.generateDefaultCustomSettings = function (defaultSettings) {
            var output = {};
            jQuery.map(defaultSettings, function (part, partName) {
                output[partName] = AweBuilder.parseJSON(JSON.stringify(part));
                delete output[partName].style;
                delete output[partName].animation;
                delete output[partName].responsive;
            });
            return output;
        };
        /**
         * overrides clone method
         */
        Element.prototype.clone = function (attributes) {
            var machineName = this.get('machineName'), content = this.get('content'), defaultAttributes = this.toJSON(), className = window.AweBuilderSettings.elements[machineName].objClassName;
            if (content instanceof AweBuilder.ContentObjects)
                defaultAttributes.content = content.clone();
            if (className === undefined)
                className = 'Element';
            if (attributes !== undefined)
                defaultAttributes = jQuery.extend(true, {}, defaultAttributes, attributes);
            delete defaultAttributes.cid;
            var clone = eval("new AweBuilder." + className + "(defaultAttributes)");
            clone.setNavigatorPanel(this.getNavigatorPanel());
            clone.setResponsiveMode(this.getResponsiveMode());
            return clone;
        };
        Element.type = 'element';
        return Element;
    }(AweBuilder.ContentObject));
    AweBuilder.Element = Element;
    /**
     * Define view class for element in layout
     */
    var ElementView = (function (_super) {
        __extends(ElementView, _super);
        function ElementView(options) {
            if (options.className === undefined)
                options.className = 'js-ac-element ac_element';
            _super.call(this, options);
        }
        /**
         * overrides initialize() method
         */
        ElementView.prototype.initialize = function () {
            // init properties
            this.viewReady = false;
            this.librariesReady = false;
            // load libraries
            this.loadLibraries();
            // load element template
            this.getTemplate();
            // implements parent initialize
            _super.prototype.initialize.call(this);
        };
        /**
         * load libraries
         */
        ElementView.prototype.loadLibraries = function () {
            // handle event libraries is ready
            var _self = this, element = this.model;
            this.$el.bind('librariesReady', function () {
                _self.librariesReady = true;
                _self.execCustomReady();
            });
            // load libraries
            var machineName = element.getMachineName(), librariesInfo = jQuery.extend(true, {}, window.AweBuilderSettings.elements[machineName].libraries), libraries;
            if (librariesInfo) {
                libraries = {};
                jQuery.each(librariesInfo, function (name, destination) {
                    var library = window.AweBuilderSettings.libraries[name];
                    if (library) {
                        jQuery.each(destination, function (index, des) {
                            if (!library[des]) {
                                jQuery.each(library.files, function (path, options) {
                                    if (!libraries[path])
                                        libraries[path] = jQuery.extend({}, { destination: [des] }, options);
                                    else {
                                        libraries[path].destination.push(des);
                                    }
                                });
                                library[des] = 'loading';
                            }
                        });
                    }
                });
                if (libraries)
                    AweBuilder.addLibraries(libraries);
                var librariesReady_1;
                librariesReady_1 = setInterval(function () {
                    jQuery.each(librariesInfo, function (libName, destination) {
                        var callback = libName, reg = /\$\.|jQuery\.|jsClass\./g;
                        if (reg.test(callback)) {
                            jQuery.each(destination, function (index, des) {
                                if (callback.indexOf('jsClass') === -1) {
                                    callback = callback.replace('$', 'jQuery');
                                    if (des === 'frontend')
                                        callback = callback.replace('jQuery', 'AweBuilder._jQuery');
                                }
                                else {
                                    var win = (des === 'frontend') ? 'AweBuilder._window' : 'window';
                                    callback = callback.replace('jsClass', win);
                                }
                                if (eval(callback) !== undefined) {
                                    destination.splice(index, 1);
                                    window.AweBuilderSettings.libraries[libName][des] = true;
                                }
                            });
                            if (destination.length === 0)
                                delete librariesInfo[callback];
                        }
                        else
                            delete librariesInfo[callback];
                    });
                    if (Object.keys(librariesInfo).length === 0) {
                        clearInterval(librariesReady_1);
                        _self.$el.trigger('librariesReady');
                    }
                }, 100);
            }
            else
                this.$el.trigger('librariesReady');
        };
        /**
         * get cache template key
         */
        ElementView.prototype.getCacheTemplateKey = function () {
            var machineName = this.model.get('machineName'), extraData = this.model.get('extraData'), postData = jQuery.type(extraData) === 'object' ? jQuery.extend({ machineName: machineName }, extraData) : { machineName: machineName }, cachedKey = this.model.get('elTemplateKey');
            return (cachedKey !== undefined && postData[cachedKey] !== undefined) ? postData[cachedKey] : machineName;
        };
        /**
         * method get element template from server
         */
        ElementView.prototype.getTemplate = function () {
            var _self = this, machineName = this.model.get('machineName'), extraData = this.model.get('extraData'), defaultData = {
                machineName: machineName,
                task: 'getTemplate'
            }, postData = jQuery.type(extraData) === 'object' ? jQuery.extend(true, {}, defaultData, extraData) : defaultData, cachedKey = this.getCacheTemplateKey(), postParams = AweBuilder.prepareAjaxParamenters('element', postData);
            // load template from server
            if (window.AweBuilderSettings.elementsTemplate[cachedKey] === undefined && postParams) {
                jQuery.ajax({
                    type: 'POST',
                    url: postParams.url,
                    data: postParams.data,
                    success: function (data) {
                        if (typeof data === 'object' && data['template'] !== undefined) {
                            _self.template = _.template(data['template']);
                            _self.templateData = data;
                        }
                        else {
                            window.AweBuilderSettings.elementsTemplate[cachedKey] = data;
                            _self.template = _.template(data);
                        }
                        _self.$el.trigger('templateReady');
                    }
                });
            }
        };
        /**
         * overrides render() method
         */
        ElementView.prototype.render = function () {
            var undefinedElement = this.model.get('undefinedElement');
            if (undefinedElement)
                this.$el = undefined;
            return _super.prototype.render.call(this);
        };
        /**
         * overrides render content for element
         * @return {View}: Backbone view object of this element
         */
        ElementView.prototype.renderContent = function () {
            var _self = this, machineName = this.model.get('machineName'), cachedKey = this.getCacheTemplateKey();
            // callback to render content\
            function renderContent() {
                // wait to element added to builder
                var wait;
                wait = setInterval(function () {
                    if (_self.$el.parents('body').length) {
                        clearInterval(wait);
                        var elSettings = _self.model.get('settings'), settings_2 = {};
                        jQuery.map(elSettings, function (part, key) {
                            if (part && part.settings)
                                settings_2[key] = part.settings;
                        });
                        // add element content
                        var $mainContent = jQuery("<div class=\"js-el-content\">" + _self.template(settings_2) + "</div>");
                        _self.$el.append($mainContent);
                        _self.viewReady = true;
                        _self.execCustomReady();
                        // init editor for element
                        _self.initEditor();
                    }
                }, 50);
            }
            // wait to get element template to render element content
            var strTemplate = window.AweBuilderSettings.elementsTemplate[cachedKey];
            if (strTemplate) {
                this.template = _.template(strTemplate);
                renderContent();
            }
            else {
                this.$el.bind('templateReady', function (event) {
                    event.stopPropagation();
                    renderContent();
                });
            }
        };
        /**
         * implements custom ready callback
         */
        ElementView.prototype.execCustomReady = function () {
            var model = this.model;
            if (this.librariesReady && this.viewReady && jQuery.type(model.elementReady) === 'function')
                model.elementReady(this.el, model, this.templateData);
        };
        /**
         * init editor to edit content for element
         */
        ElementView.prototype.initEditor = function (selector) {
            /**
             * Callback to get element object in form
             */
            function getFormElement(saveElement) {
                var machineName = _self.model.getMachineName(), settingForms = window.AweBuilderSettings.settingForms[machineName], element, saveElementSelector;
                // process save data to get selector of
                if (saveElement && saveElement.name) {
                    var part = 'main.elements.';
                    if (saveElement.part !== undefined)
                        part = part + ".elements.";
                    saveElementSelector = part + saveElement.name.split('.').join('.elements.');
                }
                try {
                    element = eval("settingForms." + saveElementSelector);
                }
                catch (error) {
                }
                return element;
            }
            // init editor for elements
            var _self = this, elSettings = this.model.getElementSettings();
            if (elSettings && elSettings.enableEditor && _self._$.fn.mediumEditor) {
                var enableElements = jQuery.type(elSettings.enableEditor) === 'object' ? [elSettings.enableEditor] : elSettings.enableEditor, editorOpts = elSettings.editorOptions ? elSettings.editorOptions : {
                    toolbar: {
                        buttons: ['bold', 'italic', 'underline', 'anchor']
                    }
                };
                var _loop_2 = function(i) {
                    var element = enableElements[i], _$_1 = _self._$;
                    if (element.selector && (!selector || (selector && element.selector.indexOf(selector) !== -1))) {
                        _$_1(element.selector, _self.el).mediumEditor(editorOpts);
                        var editor = _$_1(element.selector, _self.el).data('mediumEditor');
                        if (editor) {
                            editor.subscribe('blur', function (event, editable) {
                                var hasPTag = jQuery(this).data('hasPTag');
                                if (!hasPTag) {
                                    jQuery('> p', editable).each(function () {
                                        jQuery(editable).append(jQuery(this).html());
                                        jQuery(this).remove();
                                    });
                                }
                                if (element.saveTo) {
                                    var elementForm = getFormElement(element.saveTo);
                                    if (elementForm) {
                                        elementForm.update(_self.model, _self.model.getResponsiveMode());
                                        elementForm.setValue(jQuery(this).html());
                                    }
                                }
                            });
                            editor.subscribe('editableInput', function (event, editable) {
                                var hasPTag = _self._$(editable).data('hasPTag');
                                if (!hasPTag && _$_1('> p', editable).length) {
                                    _$_1('> p', editable).css('display', 'inline');
                                }
                            });
                        }
                        if (selector)
                            return "break";
                    }
                };
                for (var i = 0; i < enableElements.length; i++) {
                    var state_2 = _loop_2(i);
                    if (state_2 === "break") break;
                }
            }
        };
        /**
         * Destroy editor
         */
        ElementView.prototype.reinitEditor = function (selector) {
            var elSettings = this.model.getElementSettings(), enableElements = jQuery.type(elSettings.enableEditor) === 'object' ? [elSettings.enableEditor] : elSettings.enableEditor;
            // destroy editor
            for (var i = 0; i < enableElements.length; i++) {
                if (selector) {
                    if (enableElements[i].selector.indexOf(selector) !== -1) {
                        var editor = this._$(selector, this.el).data('mediumEditor');
                        if (editor) {
                            editor.destroy();
                            break;
                        }
                    }
                }
                else {
                    var editor = this._$(enableElements[i].selector, this.el).data('mediumEditor');
                    if (editor) {
                        editor.destroy();
                        break;
                    }
                }
            }
            // re-init editor
            this.initEditor(selector);
        };
        /**
         * re-render element
         */
        ElementView.prototype.reloadContent = function () {
            if (this.viewReady) {
                this.model.createView();
                var view = this.model.getView();
                this.$el.before(view.$el).remove();
                this.destroy();
            }
        };
        return ElementView;
    }(AweBuilder.ContentObjectView));
    AweBuilder.ElementView = ElementView;
    /**
     * Define collection of element what is contained in a column
     */
    var Elements = (function (_super) {
        __extends(Elements, _super);
        function Elements(models, options) {
            if (options === undefined || options.model === undefined)
                options = jQuery.extend(true, {}, options, { model: Element });
            if (jQuery.type(models) === 'array') {
                for (var i = 0; i < models.length; i++) {
                    var model = models[i], machineName = model.machineName, elSettings = window.AweBuilderSettings.elements[machineName];
                    if (elSettings && elSettings.objClassName !== undefined && !(model instanceof Element)) {
                        models[i] = eval("new AweBuilder." + elSettings.objClassName + "(model)");
                    }
                }
            }
            _super.call(this, models, options, 'ac_elements-wrapper');
        }
        /**
         * overrides clone() method
         */
        Elements.prototype.clone = function () {
            var models = [];
            jQuery.each(this.models, function (index, model) {
                models.push(model.clone());
            });
            return new Elements(models);
        };
        /**
         * overrides createView()
         */
        Elements.prototype.createView = function () {
            // create view for Elements
            this.view = new ElementsView({ collection: this, className: this.className });
        };
        return Elements;
    }(AweBuilder.ContentObjects));
    AweBuilder.Elements = Elements;
    /**
     * Define view for element collection
     */
    var ElementsView = (function (_super) {
        __extends(ElementsView, _super);
        function ElementsView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides beforeSort() method
         */
        ElementsView.prototype.beforeSort = function (event, ui) {
            _super.prototype.beforeSort.call(this, event, ui);
            ui.helper.css('transition', 'none');
        };
        return ElementsView;
    }(AweBuilder.ContentObjectsView));
    AweBuilder.ElementsView = ElementsView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: awe-column.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 03/2016
 */
/// <reference path="../../ts-libraries/jquery.ui.d.ts"/>
/// <reference path="./awe-content-object.ts"/>
/// <reference path="./awe-element.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var COLUMN_RESPONSIVE = jQuery.extend(true, {}, AweBuilder.RESPONSIVE_SETTINGS, {
        classNumber: {
            xl: 12,
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
        }
    });
    var COLUMN_SETTINGS_ELEMENT = {
        tag: {
            type: 'select',
            title: 'Wrapper tag',
            inlineTitle: true,
            options: {
                'header': 'header',
                'footer': 'footer',
                'section': 'section',
                'div': 'div',
                'article': 'article',
                'aside': 'aside',
                'main': 'main'
            },
            customStyles: {
                '.ac_panel-item-general__content': { 'padding-left': '100px' }
            },
            defaultValue: 'div'
        },
        push: {
            type: 'ranger',
            title: 'Push',
            widget: 'button',
            allowChangeRange: false,
            min: 0,
            max: 12,
            unit: false,
            devices: 'all',
            widthNumber: 2,
            defaultValue: 0
        },
        pull: {
            type: 'ranger',
            title: 'Pull',
            widget: 'button',
            allowChangeRange: false,
            min: 0,
            max: 12,
            unit: false,
            devices: 'all',
            widthNumber: 2,
            defaultValue: 0
        },
        offset: {
            type: 'ranger',
            title: 'Offset',
            widget: 'button',
            allowChangeRange: false,
            min: 0,
            max: 12,
            unit: false,
            devices: 'all',
            widthNumber: 2,
            defaultValue: 0
        },
        breakNewLine: {
            type: 'toggle',
            title: 'Break new line',
            devices: 'all',
            defaultValue: false
        },
        customHTML: {
            type: 'textarea',
            fireEvent: 'blur',
            title: 'Custom HTML',
            size: "medium",
            defaultValue: ''
        },
        attributes: {
            type: 'attributes',
            title: 'Custom attribute',
            formElements: {
                name: {
                    type: 'input',
                    title: 'Name',
                    inlineTitle: true,
                    defaultValue: ''
                },
                value: {
                    type: 'input',
                    title: 'Value',
                    inlineTitle: true,
                    defaultValue: ''
                },
                validate: function (values) {
                    return (values.name.trim() !== '');
                }
            }
        }
    };
    var Column = (function (_super) {
        __extends(Column, _super);
        /**
         * Overrides constructor to define default attributes for column
         * @param options
         */
        function Column(options) {
            // generate default data structure for column object
            AweBuilder.ContentObject.generateObjectSettings('column', {
                style: {
                    status: [AweBuilder.STYLE_HOVER]
                },
                responsive: COLUMN_RESPONSIVE,
                settings: jQuery.extend(true, {}, COLUMN_SETTINGS_ELEMENT)
            });
            // prepare default option settings
            if (options === undefined)
                options = {};
            if (options.settings === undefined) {
                options.settings = {};
            }
            if (options.title === undefined
                || jQuery.type(options.title) !== 'string'
                || options.title.trim() === '') {
                options.title = "Column";
            }
            if (options.content === undefined
                || (!(options.content instanceof AweBuilder.Elements) && !(options.content instanceof Array))) {
                options.content = new AweBuilder.Elements();
            }
            // set machine name is column
            options.machineName = 'column';
            // implements parent constructor
            _super.call(this, options);
        }
        /**
         * implements custom init
         */
        Column.prototype.init = function () {
            // set this model is container for elements collection
            this.get('content').setContainer(this);
            // set machine name
            this.machineName = 'column';
        };
        /**
         * Add an element to column content
         * @param el: Element object need to add column
         * @param insertPost: position of element in column
         */
        Column.prototype.addElement = function (el, insertPost) {
            if (insertPost && insertPost < this.get('content').length) {
                this.get('content').add(el, { at: insertPost });
            }
            else
                this.get('content').add(el);
        };
        /**
         * implement remove element from position in column
         * @param index
         */
        Column.prototype.deleteElement = function (index) {
            if (index < this.get('content').length)
                this.get('content').remove(this.get('content').collection.at(index));
        };
        /**
         * overrides createView() method to create view instance object for this model
         */
        Column.prototype.createView = function () {
            var tagName = this.getSettingsAttr('main.settings.tag');
            // create view for column
            this.view = new ColumnView({
                model: this,
                tagName: tagName ? tagName : 'div'
            });
        };
        /**
         * overrides getType() method
         */
        Column.prototype.getType = function () {
            return 'column';
        };
        /**
         * overrides setResponsiveMode() method
         */
        Column.prototype.setResponsiveMode = function (mode) {
            _super.prototype.setResponsiveMode.call(this, mode);
            this.view.updateResizableGrid();
        };
        /**
         * overrides clone() method of backbone to clone elements collection
         * @returns {Column}
         */
        Column.prototype.clone = function () {
            var attr = this.toJSON();
            attr.content = this.get("content").clone();
            delete attr.cid;
            return new Column(attr);
        };
        Column.type = 'column';
        return Column;
    }(AweBuilder.ContentObject));
    AweBuilder.Column = Column;
    /**
     * Define class View for Column
     */
    var ColumnView = (function (_super) {
        __extends(ColumnView, _super);
        function ColumnView(attributes) {
            var customTag = attributes.model.getSettingsAttr('main.settings.tag');
            if (customTag !== undefined)
                attributes.tagName = customTag;
            _super.call(this, attributes);
        }
        /**
         * overrides getRenderControllersData() method
         */
        ColumnView.prototype.getRenderControllersData = function () {
            var controllers = _super.prototype.getRenderControllersData.call(this);
            controllers.splice(-1, 0, { name: 'split', title: this.translate('Split'), icon: 'split' });
            return controllers;
        };
        /**
         * render view for column
         * @returns {ColumnView}
         */
        ColumnView.prototype.render = function () {
            // implements parent render method
            _super.prototype.render.call(this);
            // add classes and set cid of model
            this.$el.addClass(this.renderResponsiveClasses());
            // render custom settings
            this.renderCustomSettings();
            // init resizable
            this.initResizable();
            return this;
        };
        /**
         * render custom settings for column
         */
        ColumnView.prototype.renderCustomSettings = function () {
            var _self = this, settings = this.model.getSettingsAttr('main.settings');
            if (settings) {
                jQuery.map(settings, function (setting, name) {
                    switch (name) {
                        case "offset":
                            jQuery.map(setting, function (value, responsiveMode) {
                                _self.$el.addClass("ac_offset-" + responsiveMode + "-" + value);
                            });
                            break;
                        case "pull":
                            jQuery.map(setting, function (value, responsiveMode) {
                                _self.$el.addClass("ac_pull-" + responsiveMode + "-" + value);
                            });
                            break;
                        case "push":
                            jQuery.map(setting, function (value, responsiveMode) {
                                _self.$el.addClass("ac_push-" + responsiveMode + "-" + value);
                            });
                            break;
                        case 'breakNewLine':
                            var collection = _self.model.getCollection(), collectionView = collection ? collection.getView() : undefined;
                            if (collectionView)
                                collectionView.renderRows();
                            break;
                        case 'customHTML':
                            _self.renderCustomHtmlSetting(setting);
                            break;
                        case 'classes':
                            if (setting)
                                _self.$el.addClass(setting);
                            break;
                        case 'id':
                            if (setting)
                                _self.$el.attr('id', setting);
                            break;
                        case 'attributes':
                            jQuery.each(setting, function (index, attribute) {
                                // create attribute in element
                                _self.$el.attr(attribute.name, attribute.value);
                            });
                            break;
                    }
                });
            }
        };
        /**
         * render custom html wrapper
         */
        ColumnView.prototype.renderCustomHtmlSetting = function (customHtml) {
            var $contentView = this.model.get('content').getView().$el;
            // restore html by default
            this.$el.append($contentView);
            // remove previous custom wrap
            jQuery('.js-custom-wrap', this.$el).remove();
            // process custom html
            if (customHtml) {
                var _self = this, checkElement = document.createElement('div');
                // set value to innerHTML to validate html input
                checkElement.innerHTML = customHtml;
                // process custom html to view
                // validate html of custom
                var matches = /\[content\]/.exec(customHtml);
                if (matches && matches[0]) {
                    // replace [content] by div tag
                    customHtml = customHtml.replace('[content]', '<div class="js-col-content"></div>');
                    _self.$el.append(jQuery(customHtml).addClass('js-custom-wrap'));
                    // add column content
                    jQuery('.js-col-content', _self.$el).before($contentView).remove();
                }
                else {
                    $contentView.hide();
                    var newHtml = /<([a-z]+)[^<]*>/.test(customHtml) ? customHtml : checkElement;
                    _self.$el.append(jQuery(newHtml).addClass('js-custom-wrap'));
                    return;
                }
            }
            // show content view
            $contentView.show();
        };
        /**
         * overrides responsive classes
         */
        ColumnView.prototype.renderResponsiveClasses = function (settings) {
            if (settings === undefined)
                settings = this.model.get('settings');
            var layoutSettings = jQuery.extend(true, {}, COLUMN_RESPONSIVE.classNumber), hiddenClasses = _super.prototype.renderResponsiveClasses.call(this, settings), classes = [];
            if (settings.main && settings.main.responsive && settings.main.responsive.classNumber) {
                layoutSettings = jQuery.extend(true, {}, layoutSettings, settings.main.responsive.classNumber);
            }
            jQuery.map(layoutSettings, function (classNumber, mode) {
                if (mode == 'xs')
                    classes.push("ac_col-" + classNumber);
                else
                    classes.push("ac_col-" + mode + "-" + classNumber);
            });
            //fix for bootstrap 4, col- .. col-xl
            classes.reverse();
            if (hiddenClasses)
                classes.push(hiddenClasses);
            return classes.join(' ');
        };
        /**
         * init resizable for column
         */
        ColumnView.prototype.initResizable = function () {
            var _self = this, model = this.model;
            // wait column added to builder and update grid resize
            var waitInterval = setInterval(function () {
                if (_self.$el.parents('body').length) {
                    // stop interval
                    clearInterval(waitInterval);
                    // init resizable for column
                    _self._$(_self.el).resizable({
                        handles: 'e',
                        containment: 'parent',
                        start: function (event, ui) {
                            var responsiveMode = model.responsiveMode, selector = "main.responsive.classNumber." + responsiveMode;
                            _self.beforeResizeWidth = model.getSettingsAttr(selector);
                            jQuery('.js-content-object', _self.el).trigger('columnStartResize');
                        },
                        resize: function (event, ui) {
                            ui.element.width(ui.element.width() + 32);
                            // update width to model
                            _self.updateWidth(ui);
                            _self.$el.parent().css({ margin: '', width: '' });
                            _self.$el.removeAttr('style');
                        },
                        stop: function () {
                            jQuery('.js-content-object', _self.el).trigger('columnStopResize');
                        }
                    });
                    // process before resize column
                    _self._$('> .ui-resizable-handle', _self.el).mousedown(function () {
                        var parentWidth = _self.$el.parent().width();
                        _self.$el.parent().css('margin-right', 0).width(parentWidth);
                    }).mouseup(function () {
                        _self.$el.parent().css({ 'margin-right': '', width: '' });
                    });
                    // calculate grid size base on parent width
                    _self.updateResizableGrid();
                    // fix error ressize when section display none
                    _self.$el.on('resizeGrid', function () {
                        _self.updateResizableGrid();
                    });
                }
            });
        };
        /**
         * update width number to model when resize
         */
        ColumnView.prototype.updateWidth = function (ui) {
            var model = this.model, grid = ui.element.resizable('option', 'grid')[0], step = Math.round((ui.size.width - ui.originalSize.width) / grid), resizeNumber = this.beforeResizeWidth !== undefined ? this.beforeResizeWidth + step : 12 + step;
            // set max width number is 12
            if (resizeNumber > 12)
                resizeNumber = 12;
            else if (resizeNumber < 1)
                resizeNumber = 1;
            // update value to model
            model.setSettingsAttr("main.responsive.classNumber." + model.responsiveMode, resizeNumber);
        };
        /**
         * update resizable grid
         */
        ColumnView.prototype.updateResizableGrid = function () {
            if (this._$(this.el).data('ui-resizable')) {
                var gridSize = this.$el.parent().width() / 12;
                this._$(this.el).resizable('option', 'grid', [gridSize, 0]);
            }
        };
        /**
         * overrides split() method to process for click split button
         * @param {any} event [description]
         */
        ColumnView.prototype.split = function (event) {
            var screenNumber = this.model.getSettingsAttr("main.responsive.classNumber." + AweBuilder.RES_XL);
            if (screenNumber === undefined)
                screenNumber = 12;
            if (screenNumber > 1) {
                var column = this.model, index = this.$el.index(), newColNumber = Math.ceil(screenNumber / 2), splitNumber = screenNumber - newColNumber, childSettings = {
                    main: {
                        responsive: {
                            classNumber: {
                                xl: splitNumber,
                                lg: splitNumber
                            }
                        }
                    }
                }, childColumn = new Column({ settings: childSettings });
                // set responsive number for split column
                column.setSettingsAttr("main.responsive.classNumber." + AweBuilder.RES_XL, newColNumber);
                column.setSettingsAttr("main.responsive.classNumber." + AweBuilder.RES_LG, newColNumber);
                // set responsive number for child column
                childColumn.setResponsiveMode(column.responsiveMode);
                childColumn.setNavigatorPanel(column.getNavigatorPanel());
                childColumn.setIndent(column.getIndent());
                // Add column model to list column of row
                this.model.collection.add(childColumn, { at: index + 1 });
            }
        };
        /**
         * overrides listenAddContent to render view of new element added to column
         */
        ColumnView.prototype.listenAddContent = function (model, collection, options) {
            _super.prototype.listenAddContent.call(this, model, collection, options);
            if (model instanceof AweBuilder.Element) {
                var view = model.getView();
                if (options.index !== undefined && jQuery(".js-type-column > .js-ac-el:eq(" + options.index + ")", this.$el).length) {
                    jQuery(".js-type-column > .js-ac-el:eq(" + options.index + ")", this.$el).before(view.$el);
                }
                else {
                    jQuery('.js-type-column', this.$el).append(view.$el);
                }
            }
        };
        /**
         * render settings change for column
         */
        ColumnView.prototype.renderSettingsChange = function (selector, value, prevSettings, inlineCss) {
            // implements parent method
            _super.prototype.renderSettingsChange.call(this, selector, value, prevSettings, inlineCss);
            var collection = this.model.getCollection(), collectionView = collection ? collection.getView() : undefined, selectors = selector.split('.'), last = selectors.pop();
            // render rows class when resize column
            if (selector.indexOf('classNumber') > -1 && collectionView) {
                collectionView.renderRows(last);
            }
            else if (selector.indexOf('.settings') > -1) {
                var _self_17 = this, prevValue = this.model.getSettingsAttr(selector, prevSettings), settingName = jQuery.inArray(last, [AweBuilder.RES_XL, AweBuilder.RES_LG, AweBuilder.RES_MD, AweBuilder.RES_SM, AweBuilder.RES_XS]) === -1 ? last : selectors.pop();
                switch (settingName) {
                    case 'tag':
                        this.model.createView();
                        var view = this.model.getView();
                        this.$el.before(view.$el).remove();
                        view.$el.addClass('ac_highlight js-active');
                        this.destroy();
                        break;
                    case "breakNewLine":
                        if (collectionView)
                            collectionView.renderRows(last);
                        break;
                    case 'offset':
                        if (prevValue)
                            _self_17.$el.removeClass("ac_offset-" + last + "-" + prevValue);
                        if (value > 0)
                            _self_17.$el.addClass("ac_offset-" + last + "-" + value);
                        break;
                    case 'pull':
                        if (prevValue)
                            _self_17.$el.removeClass("ac_pull-" + last + "-" + prevValue);
                        if (value > 0)
                            _self_17.$el.addClass("ac_pull-" + last + "-" + value);
                        break;
                    case 'push':
                        if (prevValue)
                            _self_17.$el.removeClass("ac_push-" + last + "-" + prevValue);
                        if (value > 0)
                            _self_17.$el.addClass("ac_push-" + last + "-" + value);
                        break;
                    case 'customHTML':
                        this.renderCustomHtmlSetting(value);
                        break;
                    case 'classes':
                        var currentClasses = _self_17.model.getSettingsAttr(selector, prevSettings);
                        if (currentClasses !== undefined)
                            _self_17.$el.removeClass(currentClasses);
                        _self_17.$el.addClass(value);
                        break;
                    case 'id':
                        if (value)
                            _self_17.$el.attr('id', value);
                        else
                            _self_17.$el.removeAttr('id');
                        break;
                    case 'attributes':
                        if (jQuery.type(value) === 'array') {
                            var names_1 = [];
                            // process new attributes
                            jQuery.each(value, function (index, attribute) {
                                // create attribute in element
                                _self_17.$el.attr(attribute.name, attribute.value);
                                // push name to array name
                                names_1.push(attribute.name);
                            });
                            // remove previous attributes not exist
                            if (prevValue !== undefined) {
                                jQuery.each(prevValue, function (index, attribute) {
                                    if (jQuery.inArray(attribute.name, names_1) === -1)
                                        _self_17.$el.removeAttr(attribute.name);
                                });
                            }
                        }
                        break;
                }
            }
        };
        return ColumnView;
    }(AweBuilder.ContentObjectView));
    AweBuilder.ColumnView = ColumnView;
    /**
     * Define collection of column class
     */
    var Columns = (function (_super) {
        __extends(Columns, _super);
        /**
         * constructor to set default model is Column
         * @param models
         * @param options
         */
        function Columns(models, options) {
            // set default model type of collection is column
            if (options === undefined || options.model === undefined)
                options = jQuery.extend(true, {}, options, { model: Column });
            // init models default
            if (models === undefined) {
                var firstCol = new Column();
                firstCol.setSettingsAttr("main.responsive.classNumber." + AweBuilder.RES_XL, 12);
                firstCol.setSettingsAttr("main.responsive.classNumber." + AweBuilder.RES_LG, 12);
                firstCol.setSettingsAttr("main.responsive.classNumber." + AweBuilder.RES_MD, 12);
                firstCol.setSettingsAttr("main.responsive.classNumber." + AweBuilder.RES_SM, 12);
                firstCol.setSettingsAttr("main.responsive.classNumber." + AweBuilder.RES_XS, 12);
                models = [firstCol];
            }
            // implements parent method
            _super.call(this, models, options, 'js-ac-row ac_row');
        }
        /**
         * overrides createView() method
         */
        Columns.prototype.createView = function () {
            // create view for columns
            this.view = new ColumnsView({
                collection: this,
                className: this.className
            });
        };
        /**
         * overrides clone() method
         */
        Columns.prototype.clone = function () {
            var models = [];
            jQuery.each(this.models, function () {
                models.push(this.clone());
            });
            return new Columns(models);
        };
        return Columns;
    }(AweBuilder.ContentObjects));
    AweBuilder.Columns = Columns;
    /**
     * Define view class for column collection
     */
    var ColumnsView = (function (_super) {
        __extends(ColumnsView, _super);
        function ColumnsView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides renderContent() method
         */
        ColumnsView.prototype.renderContent = function () {
            var _self = this;
            // add view of objects in collection
            this.$wrapper = this.$el;
            this.collection.each(function (column, index) {
                var view = column.getView();
                _self.$wrapper.append(view.$el);
            });
            // render rows class for columns
            this.renderRows();
        };
        /**
         * render row for columns
         */
        ColumnsView.prototype.renderRows = function (mode) {
            var modes = mode !== undefined ? [mode] : [AweBuilder.RES_XL, AweBuilder.RES_LG, AweBuilder.RES_MD, AweBuilder.RES_SM, AweBuilder.RES_XS], widthNumber = {
                xl: 0,
                lg: 0,
                md: 0,
                sm: 0,
                xs: 0
            };
            this.collection.each(function (column, index) {
                jQuery.each(modes, function (index, responsiveMode) {
                    var $column = column.getView().$el.removeClass("ac_col-" + responsiveMode + "-breakline"), classNumber = column.getSettingsAttr("main.responsive.classNumber." + responsiveMode), breakLine = column.getSettingsAttr("main.settings.breakNewLine." + responsiveMode);
                    if (breakLine || classNumber === undefined || classNumber === 12) {
                        if (breakLine)
                            $column.addClass("ac_col-" + responsiveMode + "-breakline");
                        widthNumber[responsiveMode] = 0;
                    }
                    else {
                        if (widthNumber[responsiveMode] + classNumber > 12) {
                            $column.addClass("ac_col-" + responsiveMode + "-breakline");
                            widthNumber[responsiveMode] = classNumber;
                        }
                        else
                            widthNumber[responsiveMode] += classNumber;
                    }
                });
            });
        };
        /**
         * show elements what this column can drop
         */
        ColumnsView.prototype.beforeSort = function (event, ui) {
            this.$el.parents('.js-ac-page-wrapper').addClass('ac_col-sorting');
            ui.placeholder.css('width', ui.item.width());
        };
        /**
         * hide elements what this column can drop
         */
        ColumnsView.prototype.afterSort = function (event, ui) {
            _super.prototype.afterSort.call(this, event, ui);
            this.$el.parents('.js-ac-page-wrapper').removeClass('ac_col-sorting');
        };
        /**
         * overrides listenAddObject()
         */
        ColumnsView.prototype.listenAddObject = function (object, collection, options) {
            _super.prototype.listenAddObject.call(this, object, collection, options);
            this.renderRows();
        };
        /**
         * overrides listenRemoveObject()
         */
        ColumnsView.prototype.listenRemoveObject = function (object, collection, options) {
            _super.prototype.listenRemoveObject.call(this, object, collection, options);
            this.renderRows();
        };
        return ColumnsView;
    }(AweBuilder.ContentObjectsView));
    AweBuilder.ColumnsView = ColumnsView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: awe-layout.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 06/13/2016
 */
/// <reference path="../core/awe-column.ts"/>
/// <reference path="../core/awe-element.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var LayoutElement = (function (_super) {
        __extends(LayoutElement, _super);
        function LayoutElement(options) {
            if (options === undefined)
                options = {};
            else if (typeof options === 'string')
                options = { machineName: options };
            if (options.content === undefined)
                options.content = new AweBuilder.Columns();
            else
                options.content = new AweBuilder.Columns(options.content);
            options.content.getView().setAllowUpdateDeleteBtn(true);
            _super.call(this, options);
            // set this object is container object for content collection
            this.get('content').setContainer(this);
        }
        /**
         * overrides createView method()
         */
        LayoutElement.prototype.createView = function () {
            this.view = new LayoutElementView({ model: this });
        };
        return LayoutElement;
    }(AweBuilder.Element));
    AweBuilder.LayoutElement = LayoutElement;
    /**
     * Define view class for AweLayout element
     */
    var LayoutElementView = (function (_super) {
        __extends(LayoutElementView, _super);
        function LayoutElementView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides renderContent() method
         */
        LayoutElementView.prototype.renderContent = function () {
            var content = this.model.get('content');
            if (content && content.getView)
                this.$el.append(content.getView().$el);
        };
        return LayoutElementView;
    }(AweBuilder.ElementView));
    AweBuilder.LayoutElementView = LayoutElementView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: src/js/awe-builder/elements/el-tabs.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 08/30/2016
 */
/// <reference path="../core/awe-column.ts" />
/// <reference path="../core/awe-element.ts" />
var AweBuilder;
(function (AweBuilder) {
    var TabItem = (function (_super) {
        __extends(TabItem, _super);
        function TabItem(attributes) {
            if (attributes === undefined)
                attributes = {};
            if (!(attributes.content instanceof AweBuilder.Columns))
                attributes.content = new AweBuilder.Columns(attributes.content);
            attributes.machineName = 'el_tab_item';
            var elementData = {
                data: {
                    main: {
                        style: false,
                        animation: false,
                        settings: {
                            icon: {
                                type: 'storage',
                                defaultValue: 'acicon acicon-pen',
                                compareWidthDefault: false
                            }
                        }
                    }
                },
                objClassName: 'TabItem'
            }, tabsSettings;
            if (attributes.tabsSettings && jQuery.type(attributes.tabsSettings) === 'object')
                tabsSettings = jQuery.extend(true, {}, attributes.tabsSettings);
            delete attributes.tabsSettings;
            window.AweBuilderSettings.elements['el_tab_item'] = elementData;
            _super.call(this, attributes);
            this.tabsSettings = tabsSettings;
            this.get('content').setContainer(this);
            _super.prototype.initialize.call(this, attributes);
        }
        /**
         * overrides initialize() method
         */
        TabItem.prototype.initialize = function (options) { };
        /**
         * overrides createView() method
         */
        TabItem.prototype.createView = function () {
            this.view = new TabItemView({ model: this });
        };
        /**
         * overrides getType() method
         */
        TabItem.prototype.getType = function () {
            return 'el_tab_item';
        };
        /**
         * get tabs settings
         */
        TabItem.prototype.getTabsSettings = function () {
            return this.tabsSettings;
        };
        /**
         * set tabs settings
         */
        TabItem.prototype.setTabsSettings = function (tabsSettings, selector) {
            this.tabsSettings = tabsSettings;
        };
        /**
         * overrides createNavigatorView() method
         */
        TabItem.prototype.createNavigatorView = function () {
            this.navigatorView = new TabItemNavigatorView({ model: this });
        };
        /**
         * overrides clone method()
         */
        TabItem.prototype.clone = function () {
            var attributes = this.toJSON(), content = this.get('content').clone();
            attributes.tabsSettings = this.tabsSettings;
            attributes.content = content;
            return new TabItem(attributes);
        };
        TabItem.type = 'element_tab';
        return TabItem;
    }(AweBuilder.Element));
    AweBuilder.TabItem = TabItem;
    var TabItemView = (function (_super) {
        __extends(TabItemView, _super);
        function TabItemView(options) {
            if (options == undefined || options.model === undefined || !(options.model instanceof TabItem))
                throw Error('Model of thi view must be an instance of TabItem class.');
            var template = window.AweBuilderSettings.elementsTemplate.el_tabs;
            if (template && template.title) {
                var model = options.model, tabsSettings = model.getTabsSettings(), headerType = tabsSettings.title.settings.type, iconPosition = tabsSettings.title.settings.iconPosition, iconBlock = (iconPosition === "top" || iconPosition === "bottom") ? " ac-icon--block" : "", headerData = {
                    title: model.get('title'),
                    id: model.cid,
                    disableIcon: (headerType.indexOf('icon') === -1),
                    iconClasses: "" + model.getSettingsAttr('main.settings.icon') + iconBlock,
                    disableText: (headerType.indexOf('text') === -1),
                    iconPosition: iconPosition
                };
                options.el = jQuery(_.template(template.title)(headerData));
            }
            else
                throw Error('You must create template for tabs element');
            _super.call(this, options);
        }
        /**
         * overrides initialize() method
         */
        TabItemView.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            this.listenTo(this.model, 'change', this.applyChanged);
            var el = this.el, _$ = AweBuilder._jQuery;
            _$(AweBuilder._window.document).click(function (event) {
                var $title = jQuery('.js-ac-tab__item-title', el), _$title = _$('.js-ac-tab__item-title', el);
                if (_$(event.target).closest(_$title).length === 0 && $title.hasClass('js-editing-title')) {
                    $title.trigger('blur', $title.text());
                }
            });
        };
        /**
         * handle events on element view
         */
        TabItemView.prototype.events = function () {
            return jQuery.extend({}, _super.prototype.events.call(this), {
                'click .js-ac-tab__item-icon': 'onIconClick',
                'click .js-ac-tab__item-title': 'onTitleClick',
                'blur .js-ac-tab__item-title': 'onTitleBlur',
                'keydown .js-ac-tab__item-title': 'onTitleKeydown',
                'click .js-ac_inline-control li': 'onControllerClick'
            });
        };
        /**
         * handle click to tab title
         */
        TabItemView.prototype.onTitleClick = function (event) {
            event.preventDefault();
            jQuery(event.target).attr('contenteditable', 'true').addClass('js-editing-title').focus();
            var tabsView = this.model.getCollection().getContainer().getView();
            tabsView.disableSortTabs();
        };
        /**
         * handle keyup event on tab title
         */
        TabItemView.prototype.onTitleKeydown = function (event) {
            var key = event.which | event.keyCode, title = this.model.get('title');
            switch (key) {
                case 13:
                    event.preventDefault();
                    var newTitle = jQuery(event.target).text().trim();
                    if (newTitle != title)
                        jQuery(event.target).trigger('blur', newTitle);
                    break;
                case 27:
                    jQuery(event.target).text(title).blur();
                    break;
            }
        };
        /**
         * handle blur event on tab's title
         */
        TabItemView.prototype.onTitleBlur = function (event, title) {
            var tabsView = this.model.getCollection().getContainer().getView();
            tabsView.enableSortTabs();
            if (title !== undefined || event.isTrigger === undefined)
                this.model.set('title', jQuery(event.target).removeClass('js-editing-title').text().trim());
        };
        /**
         * handle click on icon's header
         */
        TabItemView.prototype.onIconClick = function () {
            var navigatorPanel = this.model.getNavigatorPanel(), builder = navigatorPanel ? navigatorPanel.getBuilder() : undefined, tabIconPanel = builder ? builder.getPanel('iconSetting') : undefined;
            if (tabIconPanel) {
                var offset = this.$el.offset(), position = jQuery.extend({}, offset, { bottom: offset.top + this.$el.height(), center: offset.left + this.$el.width() / 2 });
                tabIconPanel.setActiveModel(this.model, 'main.settings.icon', position);
            }
        };
        /**
         * handle click on item controller
         */
        TabItemView.prototype.onControllerClick = function (event) {
            event.preventDefault();
            event.stopPropagation();
            var model = this.model;
            if (/clone/.test(jQuery(event.target).attr('class'))) {
                var cloneTab = model.clone(), index = model.collection.indexOf(model);
                cloneTab.setNavigatorPanel(model.getNavigatorPanel());
                cloneTab.set('title', model.get('title') + "'clone");
                model.collection.add(cloneTab, { at: index + 1 });
            }
            else {
                model.collection.remove(model);
            }
        };
        /**
         * overrides renderContent() method
         */
        TabItemView.prototype.renderContent = function () {
            var template = window.AweBuilderSettings.elementsTemplate.el_tabs;
            if (template && template.content) {
                this.$content = jQuery(template.content).attr('id', "js-ac-tab__item-" + this.model.cid).hide();
                var $panel = jQuery('.js-ac-tab__panel', this.$content).length ? jQuery('.js-ac-tab__panel', this.$content) : this.$content, view = this.model.get('content').getView();
                view.setAllowUpdateDeleteBtn(true);
                $panel.append(view.$el).addClass('js-content-object');
            }
            else
                console.log(this.translate('You must define js template for tab\'s content of tabs element.'));
            // render controllers for header
            jQuery('a', this.getItemWrapper()).append("\n                <div class=\"js-ac_inline-control ac_inline-control\">\n                    <ul>\n                        <li title=\"" + this.translate('Clone') + "\" class=\"js-ac_inline-control-clone\"><i class=\"acicon acicon-clone\"></i></li>\n                        <li title=\"" + this.translate('Clone') + "\" class=\"js-ac_inline-control-del\"><i class=\"acicon acicon-del\"></i></li>\n                    </ul>\n                </div>");
        };
        /**
         * get wrapper of header item which contains .js-ac-tab__item class
         * @returns {JQuery}
         */
        TabItemView.prototype.getItemWrapper = function () {
            var $itemWrapper = jQuery('.js-ac-tab__item', this.$el);
            return $itemWrapper.length ? $itemWrapper : this.$el;
        };
        /**
         * get wrapper element which contains contents
         * @returns {JQuery}
         */
        TabItemView.prototype.getPanelWrapper = function () {
            var $panel = jQuery('.js-ac-tab__panel', this.$content);
            return $panel.length ? $panel : this.$content;
        };
        /**
         * apply change in model attributes
         */
        TabItemView.prototype.applyChanged = function (model, options) {
            var _self = this, changed = model.changedAttributes();
            jQuery.map(changed, function (value, attrName) {
                switch (attrName) {
                    case 'title':
                        jQuery('.js-ac-tab__item-title', _self.$el).html(value);
                        break;
                    case 'content':
                        _self.getPanelWrapper().empty().append(model.get('content').getView().$el);
                        break;
                }
            });
        };
        /**
         * overrides renderSettingsChange() method
         */
        TabItemView.prototype.renderSettingsChange = function (selector, value, prevSettings, inlineCss) {
            _super.prototype.renderSettingsChange.call(this, selector, value, prevSettings, inlineCss);
            var selectorArray = selector.split('.');
            if (selectorArray && selectorArray[1] && selectorArray[1] === 'settings') {
                if (selectorArray[2]) {
                    switch (selectorArray[2]) {
                        case 'icon':
                            var prevIcon = this.model.getSettingsAttr(selector, prevSettings);
                            jQuery('i.js-ac-tab__item-icon', this.el).removeClass('acicon acicon-clone').removeClass(prevIcon).addClass(value);
                            break;
                        default:
                            break;
                    }
                }
            }
        };
        return TabItemView;
    }(AweBuilder.ElementView));
    AweBuilder.TabItemView = TabItemView;
    var TabItemNavigatorView = (function (_super) {
        __extends(TabItemNavigatorView, _super);
        function TabItemNavigatorView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides onTitleMousedown() method
         */
        TabItemNavigatorView.prototype.onTitleMouseDown = function (event) {
            _super.prototype.onTitleMouseDown.call(this, event);
            if (!event.isTrigger)
                jQuery('> a', this.model.getView().$el).trigger('click');
        };
        return TabItemNavigatorView;
    }(AweBuilder.NavigatorView));
    AweBuilder.TabItemNavigatorView = TabItemNavigatorView;
    var TabItems = (function (_super) {
        __extends(TabItems, _super);
        function TabItems(models, options) {
            if (options === undefined)
                options = {};
            var tabsSettings;
            if (options.tabsSettings !== undefined) {
                if (jQuery.type(options.tabsSettings) !== 'object')
                    tabsSettings = AweBuilder.parseJSON(options.tabsSettings);
                else
                    tabsSettings = jQuery.extend(true, {}, options.tabsSettings);
            }
            if (jQuery.type(models) === 'array') {
                jQuery.each(models, function (index, object) {
                    if (!(object instanceof TabItem)) {
                        object.tabsSettings = tabsSettings;
                        models[index] = new TabItem(object);
                    }
                    else {
                        object.setTabsSettings(tabsSettings);
                    }
                });
            }
            _super.call(this, models, options);
        }
        /**
         * custom init method
         */
        TabItems.prototype.init = function (models, options) {
            if (options.tabsSettings !== undefined) {
                if (jQuery.type(options.tabsSettings) !== 'object')
                    this.tabsSettings = AweBuilder.parseJSON(options.tabsSettings);
                else
                    this.tabsSettings = jQuery.extend(true, {}, options.tabsSettings);
            }
        };
        /**
         * get tabs settings
         */
        TabItems.prototype.getTabsSettings = function () {
            return this.tabsSettings;
        };
        /**
         * set tabs settings
         */
        TabItems.prototype.setTabsSettings = function (tabsSettings, selector) {
            this.tabsSettings = tabsSettings;
            this.each(function () {
                this.setTabsSettings(tabsSettings, selector);
            });
        };
        /**
         * overrides createView() method
         */
        TabItems.prototype.createView = function () {
            this.view = new TabItemsView({ collection: this, className: 'js-ac-tab ac-tab' });
        };
        /**
         * overrides clone() method
         */
        TabItems.prototype.clone = function () {
            var models = [];
            jQuery.each(this.models, function (index, model) {
                models.push(model.clone());
            });
            return new TabItems(models, { tabsSettings: this.tabsSettings });
        };
        return TabItems;
    }(AweBuilder.ContentObjects));
    AweBuilder.TabItems = TabItems;
    var TabItemsView = (function (_super) {
        __extends(TabItemsView, _super);
        function TabItemsView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides render() method
         */
        TabItemsView.prototype.render = function () {
            var _self = this, template = window.AweBuilderSettings.elementsTemplate.el_tabs;
            if (template && template.elementWrapper)
                this.$el = jQuery(template.elementWrapper);
            if (template && template.titleWrapper && template.contentWrapper && template.title) {
                var $contentWrapper = jQuery('.js-ac-tab', this.$el);
                if ($contentWrapper.length === 0)
                    $contentWrapper = this.$el;
                // render header and content wrapper
                $contentWrapper.append(template.titleWrapper);
                var tabsSettings = this.collection.getTabsSettings(), headerPosition = tabsSettings.main.settings.navigatorPosition;
                if (headerPosition === 'bottom')
                    $contentWrapper.prepend(template.contentWrapper);
                else
                    $contentWrapper.append(template.contentWrapper);
                this.$headerWrapper = jQuery('.js-ac-tab__nav', this.$el).addClass("ac-tab__nav--" + headerPosition);
                this.$contentWrapper = jQuery('.js-ac-tab__content', this.$el).addClass("ui-sortable");
                // render tabs
                this.collection.each(function (tab, index) {
                    var view = tab.getView();
                    _self.$headerWrapper.append(view.$el);
                    _self.$contentWrapper.append(view.$content);
                });
                // render new tab button
                var $addBtn = jQuery(_.template(template.title)({
                    id: 1,
                    title: 'Add button',
                    iconClasses: 'acicon',
                    disableText: false,
                    disableIcon: false,
                    iconPosition: 'top'
                }));
                $addBtn.addClass('js-new-tab').removeClass('js-ac-tab__item ac-tab__item').html('<a href="#"><i class="acicon acicon-plus"></i></a>');
                this.$headerWrapper.append($addBtn);
            }
            else
                console.log('You must define js template for tabs element.');
            return this;
        };
        /**
         * overrides listenAddObject method
         */
        TabItemsView.prototype.listenAddObject = function (tab, collection, options) {
            if (options.source !== 'view') {
                var view = tab.getView();
                if (view) {
                    if (options && options.index !== undefined)
                        jQuery(".js-ac-tab__nav:first .js-ac-tab__item:eq(" + (options.index - 1) + ")", this.$el).after(view.$el);
                    else
                        jQuery(".js-ac-tab__nav:first .js-new-tab", this.$el).before(view.$el);
                    this._$('.js-ac-tab__nav', this.el).sortable('refresh');
                    this.$contentWrapper.append(view.$content);
                }
            }
        };
        /**
         * handle when tab is removed from collection
         */
        TabItemsView.prototype.listenRemoveObject = function (tab, collection, options) {
            if (options.action !== 'sort') {
                var view = tab.getView();
                if (view) {
                    view.$el.remove();
                    view.$content.remove();
                }
            }
        };
        return TabItemsView;
    }(AweBuilder.ContentObjectsView));
    AweBuilder.TabItemsView = TabItemsView;
    var TabsElement = (function (_super) {
        __extends(TabsElement, _super);
        function TabsElement(attributes) {
            if (attributes === undefined)
                attributes = {};
            else if (typeof attributes === 'string')
                attributes = { machineName: 'el_tabs' };
            // generate default settings data for element
            var elSettings = window.AweBuilderSettings.elements['el_tabs'], defaultSettings = AweBuilder.ContentObject.generateObjectSettings('el_tabs', elSettings.data);
            switch (jQuery.type(attributes.settings)) {
                case 'string':
                    attributes.settings = AweBuilder.parseJSON(attributes.settings);
                    break;
                case 'object':
                    break;
                default:
                    attributes.settings = {};
            }
            attributes.settings = jQuery.extend(true, AweBuilder.Element.generateDefaultCustomSettings(defaultSettings), attributes.settings);
            if (attributes.content === undefined) {
                attributes.content = [new TabItem({ title: 'Tab1', tabsSettings: attributes.settings })];
            }
            if (!(attributes.content instanceof TabItems))
                attributes.content = new TabItems(attributes.content, { tabsSettings: attributes.settings });
            _super.call(this, attributes);
        }
        /**
         * overrides initialize method
         */
        TabsElement.prototype.initialize = function (options) {
            this.get('content').setContainer(this);
            _super.prototype.initialize.call(this, options);
        };
        /**
         * overrides createView() method
         */
        TabsElement.prototype.createView = function () {
            this.view = new TabsElementView({ model: this });
        };
        return TabsElement;
    }(AweBuilder.Element));
    AweBuilder.TabsElement = TabsElement;
    var TabsElementView = (function (_super) {
        __extends(TabsElementView, _super);
        function TabsElementView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize() method
         */
        TabsElementView.prototype.initialize = function () {
            this.listenTo(this.model.get('content'), 'add', this.listenAddTab);
            _super.prototype.initialize.call(this);
        };
        /**
         * overrides renderContent() method
         */
        TabsElementView.prototype.renderContent = function () {
            var content = this.model.get('content');
            if (content && content.getView)
                this.$el.append(content.getView().$el);
            var _self = this, wait;
            wait = setInterval(function () {
                if (_self.$el.parents('body').length) {
                    clearInterval(wait);
                    jQuery('.js-ac-tab__item:first a', _self.$el).trigger('click');
                    _self.initSortTabs();
                }
            }, 100);
        };
        /**
         * handle events on Tabs element
         */
        TabsElementView.prototype.events = function () {
            return jQuery.extend({}, _super.prototype.events.call(this), {
                'click .js-new-tab:first > a': 'addNewTab',
                'click .js-ac-tab__item a': 'activateTab'
            });
        };
        /**
         * init sort for tab's headers
         */
        TabsElementView.prototype.initSortTabs = function () {
            var _self = this, navigatorPosition = _self.model.getSettingsAttr('main.settings.navigatorPosition');
            this._$('.js-ac-tab__nav', this.el).sortable({
                items: '.js-ac-tab__item',
                axis: navigatorPosition === 'top' || navigatorPosition === 'bottom' ? 'x' : 'y',
                start: function (event, ui) {
                    ui.item.data('prevPos', ui.item.index());
                },
                update: function (event, ui) {
                    var tabs = _self.model.get('content'), prevPos = ui.item.data('prevPos'), sortingTab = tabs.at(prevPos), newPos = ui.item.index();
                    sortingTab = tabs.remove(sortingTab, { action: 'sort' });
                    tabs.add(sortingTab, { at: newPos, source: 'view' });
                }
            });
        };
        /**
         * disable sort for tab's headers
         */
        TabsElementView.prototype.disableSortTabs = function () {
            this._$('.js-ac-tab__nav', this.el).sortable('disable');
        };
        /**
         * enable sort tab's headers
         */
        TabsElementView.prototype.enableSortTabs = function () {
            this._$('.js-ac-tab__nav', this.el).sortable('enable');
        };
        /**
         * handle click to add new tab button
         */
        TabsElementView.prototype.addNewTab = function (event) {
            event.preventDefault();
            var content = this.model.get('content'), newTab = new TabItem({ title: this.translate('Tab') + (content.length + 1), tabsSettings: this.model.get('settings') });
            newTab.setNavigatorPanel(this.model.getNavigatorPanel());
            content.add(newTab);
        };
        /**
         * handle click to tab header
         */
        TabsElementView.prototype.activateTab = function (event) {
            event.preventDefault();
            // activate tab view
            var $header = jQuery(event.target).parents('.js-ac-tab__item'), $aTag = jQuery('a', $header);
            if (!$aTag.hasClass('active')) {
                var $activatedTab = jQuery('.js-ac-tab__item .active', this.$el);
                $activatedTab.removeClass('active ac-active');
                jQuery($activatedTab.attr('href'), this.$el).hide();
                $aTag.addClass('active ac-active');
                jQuery($aTag.attr('href'), this.$el).show();
            }
            // activate navigator view
            var activatedTab = this.model.get('content').at($header.index()), activatedTabNavView = activatedTab ? activatedTab.getNavigatorView() : undefined;
            if (activatedTabNavView) {
                jQuery('> .js-nav-item-header > .js-navigator-item-title', activatedTabNavView.$el).trigger('mousedown');
            }
            // set responsive mode to set resize grid for columns in tab
            var model = this.model;
            model.setResponsiveMode(model.getResponsiveMode());
        };
        /**
         * handle event when new tab is added
         */
        TabsElementView.prototype.listenAddTab = function () {
            this._$('.js-ac-tab__nav', this.el).sortable('refresh');
        };
        /**
         * change tab header sort axis
         */
        TabsElementView.prototype.changeSortAxis = function (axis) {
            if (axis === 'x' || axis === 'y') {
                this._$('.js-ac-tab__nav', this.el).sortable('option', 'axis', axis);
            }
        };
        return TabsElementView;
    }(AweBuilder.ElementView));
    AweBuilder.TabsElementView = TabsElementView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: src/js/awe-builder/elements/el-accordion.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 09/15/2016
 */
/// <reference path="../core/awe-element.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var AccordionItem = (function (_super) {
        __extends(AccordionItem, _super);
        function AccordionItem(attributes) {
            if (attributes === undefined)
                attributes = {};
            if (!(attributes.content instanceof AweBuilder.Columns))
                attributes.content = new AweBuilder.Columns(attributes.content);
            attributes.machineName = 'el_accordion_item';
            var elementData = {
                data: {
                    main: {
                        style: false,
                        animation: false,
                        settings: {
                            icon: {
                                type: 'storage',
                                defaultValue: 'acicon acicon-pen',
                                compareWithDefault: false
                            }
                        }
                    }
                },
                objClassName: 'AccordionItem'
            }, accordionSettings;
            if (attributes.accordionSettings && jQuery.type(attributes.accordionSettings) === 'object')
                accordionSettings = jQuery.extend(true, {}, attributes.accordionSettings);
            // delete attributes.accordionSettings;
            window.AweBuilderSettings.elements['el_accordion_item'] = elementData;
            _super.call(this, attributes);
            this.accordionSettings = accordionSettings;
            this.get('content').setContainer(this);
            _super.prototype.initialize.call(this, attributes);
        }
        /**
         * overrides initialize() method
         */
        AccordionItem.prototype.initialize = function (attributes) {
        };
        /**
         * overrides getType() method
         */
        AccordionItem.prototype.getType = function () {
            return 'el_accordion_item';
        };
        /**
         * overrides createView() method
         */
        AccordionItem.prototype.createView = function () {
            this.view = new AccordionItemView({ model: this });
        };
        /**
         * get settings of accordion element
         */
        AccordionItem.prototype.getAccordionSettings = function () {
            return this.accordionSettings;
        };
        /**
         * set accordion element settings
         */
        AccordionItem.prototype.setAccordionSettings = function (settings) {
            this.accordionSettings = settings;
        };
        AccordionItem.type = 'el_accordion_item';
        return AccordionItem;
    }(AweBuilder.Element));
    AweBuilder.AccordionItem = AccordionItem;
    var AccordionItemView = (function (_super) {
        __extends(AccordionItemView, _super);
        function AccordionItemView(options) {
            if (options === undefined || options.model === undefined)
                throw Error('You must set model to render view');
            var template = window.AweBuilderSettings.elementsTemplate['el_accordion'];
            if (template === undefined || template.accordionItem === undefined)
                throw Error("You must define template js file and template for accordion's item element");
            var accordionSettings = options.model.getAccordionSettings(), mainSettings = accordionSettings.main.settings, titleSettings = accordionSettings.title.settings, iconBlock = (titleSettings.iconPosition === "top" || titleSettings.iconPosition === "bottom") ? " ac-icon--block" : "";
            options.el = jQuery(_.template(template.accordionItem)({
                enableTextTitle: /text/.test(titleSettings.type),
                title: options.model.get('title'),
                itemID: "#ac-accordion__header-" + options.model.cid,
                enableTitleIcon: /icon/.test(titleSettings.type),
                titleIconPosition: titleSettings.iconPosition,
                titleIconClasses: options.model.getSettingsAttr('main.settings.icon') + ("" + iconBlock),
                onOffIcon: mainSettings.onOffIcon
            }))[0];
            options.className = "js-ac-accordion__panel ac-accordion__panel";
            // options.$el.addClass('js-content-object');
            _super.call(this, options);
        }
        /**
         * overrides initialize() method
         */
        AccordionItemView.prototype.initialize = function () {
            this.listenTo(this.model, 'change:title', this.changeTitle);
            _super.prototype.initialize.call(this);
        };
        /**
         * overrides render() method
         */
        AccordionItemView.prototype.renderContent = function () {
            // render content
            var content = this.model.get('content');
            content.getView().setAllowUpdateDeleteBtn(true);
            jQuery('.js-ac-accordion__panel-body', this.$el).append(content.getView().$el).hide();
        };
        /**
         * render item controller
         */
        AccordionItemView.prototype.renderControllers = function () {
            jQuery('.js-ac-accordion__header a', this.$el).after("<div class=\"js-ac_inline-control ac_inline-control\">\n                    <ul>\n                        <li class=\"js-item-clone\" title=\"" + this.translate('Clone') + "\"><i class=\"acicon acicon-clone\"></i></li>\n                        <li class=\"js-item-del\" title=\"" + this.translate('Delete') + "\"><i class=\"acicon acicon-del\"></i></li>\n                    </ul>\n                </div>");
            var _self = this;
            jQuery('.js-ac_inline-control:first li', this.$el).click(function (event) {
                event.preventDefault();
                var collection = _self.model.collection, title = _self.model.get('title'), index = collection.indexOf(_self.model);
                if (jQuery(this).hasClass('js-item-clone')) {
                    var options = {
                        title: title + "'s clone",
                        accordionSettings: _self.model.getAccordionSettings()
                    };
                    collection.add(_self.model.clone(options), { at: index + 1 });
                }
                else {
                    collection.remove(_self.model);
                }
            });
            var _self = this;
            jQuery(document).click(function (event) {
                if (jQuery(event.target).closest(jQuery('.js-ac-accordion__header:first .js-ac-accordion__title', _self.$el)).length === 0) {
                    jQuery('.js-ac-accordion__header:first .js-ac-accordion__title', _self.$el).trigger('blur', jQuery('.js-ac-accordion__header:first .js-ac-accordion__title', _self.$el).text());
                }
            });
        };
        /**
         * handle event on accordion element
         */
        AccordionItemView.prototype.events = function () {
            return jQuery.extend({}, _super.prototype.events.call(this), {
                'click .js-ac-accordion__header:first .js-ac-accordion__title-icon': 'onChangeTitleIcon',
                'click .js-ac-accordion__header:first .js-ac-accordion__title': 'onFocusTitleText',
                'blur .js-ac-accordion__header:first .js-ac-accordion__title': 'onBlurTitleText',
                'keydown .js-ac-accordion__header:first .js-ac-accordion__title': 'onKeyDownTitleText'
            });
        };
        /**
         * handle when title attribute change
         */
        AccordionItemView.prototype.changeTitle = function () {
            var title = this.model.get('title');
            jQuery('.js-ac-accordion__title', this.$el).text(title);
        };
        /**
         * overrides renderSettingsChange() method
         */
        AccordionItemView.prototype.renderSettingsChange = function (selector, value, prevSettings, inlineCss) {
            _super.prototype.renderSettingsChange.call(this, selector, value, prevSettings, inlineCss);
            var selectorArray = selector.split('.');
            if (selectorArray && selectorArray[1] && selectorArray[1] === 'settings') {
                if (selectorArray[2]) {
                    switch (selectorArray[2]) {
                        case 'icon':
                            var prevIcon = this.model.getSettingsAttr(selector, prevSettings);
                            jQuery('.js-ac-accordion__header:first .js-ac-accordion__title-icon', this.el).removeClass('acicon acicon-pen').removeClass(prevIcon).addClass(value);
                            break;
                        default:
                            break;
                    }
                }
            }
        };
        /**
         * change title icon click event
         */
        AccordionItemView.prototype.onChangeTitleIcon = function (event) {
            event.preventDefault();
            var builder = this.getBuilder(), iconPanel = builder ? builder.getPanel('iconSetting') : null;
            if (iconPanel) {
                var $icon = jQuery(event.target), offset = $icon.offset(), position = jQuery.extend({}, offset, {
                    bottom: offset.top + $icon.height(),
                    center: offset.left + $icon.width() / 2
                });
                iconPanel.setActiveModel(this.model, 'main.settings.icon', position);
            }
        };
        /**
         * handle click to title text
         */
        AccordionItemView.prototype.onFocusTitleText = function (event) {
            event.preventDefault();
            event.stopPropagation();
            jQuery(event.target).attr('contenteditable', 'true').focus();
        };
        /**
         * handle blur event on text title
         */
        AccordionItemView.prototype.onBlurTitleText = function (event, text) {
            jQuery(event.target).attr('contentediable', 'false');
            if (!event.isTrigger || text !== undefined) {
                this.model.set('title', jQuery(event.target).text());
            }
            else {
                var title = this.model.get('title');
                jQuery(event.target).text(title);
            }
        };
        /**
         * handle keydown event on text title
         */
        AccordionItemView.prototype.onKeyDownTitleText = function (event) {
            var keyCode = event.which | event.keyCode;
            switch (keyCode) {
                case 13:
                    event.preventDefault();
                    jQuery(event.target).trigger('blur', jQuery(event.target).text());
                    break;
                case 27:
                    event.preventDefault();
                    jQuery(event.target).trigger('blur');
                    break;
            }
        };
        return AccordionItemView;
    }(AweBuilder.ElementView));
    AweBuilder.AccordionItemView = AccordionItemView;
    var AccordionItems = (function (_super) {
        __extends(AccordionItems, _super);
        function AccordionItems(models, options) {
            if (options === undefined)
                options = {};
            options.model = AccordionItem;
            var accordionSettings;
            if (options.accordionSettings !== undefined) {
                if (jQuery.type(options.accordionSettings) !== 'object')
                    accordionSettings = AweBuilder.parseJSON(options.accordionSettings);
                else
                    accordionSettings = jQuery.extend(true, {}, options.accordionSettings);
            }
            if (jQuery.type(models) === 'array') {
                jQuery.each(models, function (index, object) {
                    if (!(object instanceof AccordionItem)) {
                        object.accordionSettings = accordionSettings;
                        models[index] = new AccordionItem(object);
                    }
                    else
                        object.setAccordionSettings(accordionSettings);
                });
            }
            _super.call(this, models, options);
            this.accordionSettings = accordionSettings;
        }
        /**
         * overrides clone() method
         */
        AccordionItems.prototype.clone = function () {
            var models = [];
            jQuery.each(this.models, function (index, model) {
                models.push(model.clone());
            });
            return new AccordionItems(models, { accordionSettings: this.accordionSettings });
        };
        /**
         * overrides createView() method
         */
        AccordionItems.prototype.createView = function () {
            this.view = new AccordionItemsView({ collection: this });
        };
        return AccordionItems;
    }(AweBuilder.ContentObjects));
    AweBuilder.AccordionItems = AccordionItems;
    var AccordionItemsView = (function (_super) {
        __extends(AccordionItemsView, _super);
        function AccordionItemsView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides listenAddObject() method
         */
        AccordionItemsView.prototype.listenAddObject = function (item, collection, options) {
            if (options.source !== 'view') {
                var $view = item.getView().$el;
                switch (options.index) {
                    case 0:
                        this.$el.prepend($view);
                        break;
                    case undefined:
                    case collection.length - 1:
                        this.$el.append($view);
                        break;
                    default:
                        jQuery(".js-ac-accordion__panel:eq(" + (options.index - 1) + ")", this.$el).after($view);
                        break;
                }
            }
        };
        /**
         * overrides collectionReady()
         */
        AccordionItemsView.prototype.collectionReady = function () {
            this._$(this.el).sortable('option', 'handle', '.js-ac-accordion__header');
        };
        /**
         * overrides beforeSort()
         */
        AccordionItemsView.prototype.beforeSort = function (event, ui) {
            _super.prototype.beforeSort.call(this, event, ui);
            ui.helper.addClass('ac_helper--element');
            ui.placeholder.css('z-index', 9);
        };
        return AccordionItemsView;
    }(AweBuilder.ContentObjectsView));
    AweBuilder.AccordionItemsView = AccordionItemsView;
    var AccordionElement = (function (_super) {
        __extends(AccordionElement, _super);
        function AccordionElement(attributes) {
            if (attributes === undefined)
                attributes = {};
            else if (typeof attributes === 'string')
                attributes = { machineName: 'el_accordion' };
            // generate default settings data for element
            var elSettings = window.AweBuilderSettings.elements['el_accordion'], defaultSettings = AweBuilder.ContentObject.generateObjectSettings('el_accordion', elSettings.data);
            switch (jQuery.type(attributes.settings)) {
                case 'string':
                    attributes.settings = AweBuilder.parseJSON(attributes.settings);
                    break;
                case 'object':
                    break;
                default:
                    attributes.settings = {};
            }
            attributes.settings = jQuery.extend(true, AweBuilder.Element.generateDefaultCustomSettings(defaultSettings), attributes.settings);
            if (attributes.content === undefined) {
                var item1 = new AccordionItem({ title: 'Item 1', accordionSettings: attributes.settings }), item2 = new AccordionItem({ title: 'Item 2', accordionSettings: attributes.settings });
                attributes.content = [item1, item2];
            }
            if (!(attributes.content instanceof AccordionItems))
                attributes.content = new AccordionItems(attributes.content, { accordionSettings: attributes.settings });
            _super.call(this, attributes);
        }
        /**
         * overrides initialize method
         */
        AccordionElement.prototype.initialize = function (options) {
            this.get('content').setContainer(this);
            _super.prototype.initialize.call(this, options);
        };
        /**
         * overrides createView() method
         */
        AccordionElement.prototype.createView = function () {
            this.view = new AccordionElementView({ model: this });
        };
        return AccordionElement;
    }(AweBuilder.Element));
    AweBuilder.AccordionElement = AccordionElement;
    var AccordionElementView = (function (_super) {
        __extends(AccordionElementView, _super);
        function AccordionElementView(options) {
            var template = window.AweBuilderSettings.elementsTemplate['el_accordion'];
            if (template && template.elementWrapper) {
                options.el = jQuery(template.elementWrapper)[0];
            }
            _super.call(this, options);
        }
        /**
         * overrides initialize() method
         */
        AccordionElementView.prototype.initialize = function () {
            this.$panelWrapper = jQuery('.js-ac-accordion', this.$el).length ? jQuery('.js-ac-accordion', this.$el) : this.$el;
            _super.prototype.initialize.call(this);
        };
        /**
         * overrides renderContent() method
         */
        AccordionElementView.prototype.renderContent = function () {
            var content = this.model.get('content');
            if (content && content.getView)
                this.$el.append(content.getView().$el);
            // render add new accordion item button
            this.$panelWrapper.append("\n                <div class=\"js-new-btn ac-accordion__add-btn\">\n                    <a href=\"#\">+ " + this.translate('Add Accordion') + "</a>\n                </div>");
            this.$el.addClass('ac_element');
            // click to show first item
            jQuery('.js-ac-accordion__header:first a', this.$el).trigger('click');
        };
        /**
         * handle events on element
         */
        AccordionElementView.prototype.events = function () {
            return jQuery.extend({}, _super.prototype.events.call(this), {
                'click > .js-new-btn > a': 'addNewItem',
                'click .js-ac-accordion__header a': 'onItemHeadingClick'
            });
        };
        /**
         * handle click event on add new button
         */
        AccordionElementView.prototype.addNewItem = function (event) {
            event.preventDefault();
            var index = this.model.get('content').length + 1, item = new AccordionItem({ title: "Item " + index, accordionSettings: this.model.get('settings') });
            item.setNavigatorPanel(this.model.getNavigatorPanel());
            item.setResponsiveMode(this.model.getResponsiveMode());
            this.model.get('content').add(item);
        };
        /**
         * handle click on item heading
         */
        AccordionElementView.prototype.onItemHeadingClick = function (event) {
            event.preventDefault();
            var isToggle = this.model.getSettingsAttr('main.settings.collapsible'), $clickedPanel = jQuery(event.target).parents('.js-ac-accordion__panel:first'), $content = jQuery('.js-ac-accordion__panel-body:first', $clickedPanel), duration = this.model.getSettingsAttr('main.settings.duration');
            if (!duration)
                duration = 200;
            if (isToggle) {
                jQuery(event.target).toggleClass('active ac-active');
                var $activeStatusIcon = jQuery('.js-ac-accordion__header-icon', $clickedPanel);
                if (jQuery(event.target).hasClass('active')) {
                    $content.slideUp(duration);
                    $activeStatusIcon.removeClass($activeStatusIcon.data('collapse-icon')).addClass($activeStatusIcon.data('expand-icon'));
                }
                else {
                    $content.slideDown(duration);
                    $activeStatusIcon.removeClass($activeStatusIcon.data('expand-icon')).addClass($activeStatusIcon.data('collapse-icon'));
                }
            }
            else {
                if (!jQuery(event.target).hasClass('active')) {
                    var $active = jQuery('.js-ac-accordion__header a.active:first', this.$el).removeClass('active ac-active'), $activePanel = $active.parents('.js-ac-accordion__panel:first'), $activeStatusIcon = jQuery('.js-ac-accordion__header-icon', $activePanel);
                    $activeStatusIcon.removeClass($activeStatusIcon.attr('data-expand-icon')).addClass($activeStatusIcon.attr('data-collapse-icon'));
                    jQuery('.js-ac-accordion__panel-body:first', $activePanel).slideUp(duration);
                    jQuery(event.target).addClass('active ac-active');
                    $activeStatusIcon = jQuery('.js-ac-accordion__header-icon', $clickedPanel);
                    $activeStatusIcon.removeClass($activeStatusIcon.attr('data-collapse-icon')).addClass($activeStatusIcon.attr('data-expand-icon'));
                    $content.slideDown(duration);
                    var items = this.model.get('content'), activeModel = items.get($clickedPanel.data('cid'));
                    activeModel.setResponsiveMode(this.model.getResponsiveMode());
                }
            }
        };
        AccordionElementView.prototype.renderSettingsChange = function (selector, value, prevSettings, inlineCSS) {
            _super.prototype.renderSettingsChange.call(this, selector, value, prevSettings, inlineCSS);
            if (selector.indexOf("settings")) {
                var model_1 = this.model, content = this.model.get("content");
                content.each(function (item, index) {
                    item.setAccordionSettings(model_1.get("settings"));
                });
            }
        };
        return AccordionElementView;
    }(AweBuilder.ElementView));
    AweBuilder.AccordionElementView = AccordionElementView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: src/js/awe-builder/elements/el-hover-card.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 08/30/2016
 */
/// <reference path="../core/awe-column.ts" />
/// <reference path="../core/awe-element.ts" />
var AweBuilder;
(function (AweBuilder) {
    var CardItem = (function (_super) {
        __extends(CardItem, _super);
        function CardItem(attributes) {
            window.AweBuilderSettings.elements['el_hovercard_item'] = {
                data: {
                    main: {}
                },
                objClassName: 'CardItem'
            };
            if (attributes === undefined)
                attributes = {};
            if (attributes.content === undefined) {
                attributes.content = new AweBuilder.Columns();
            }
            attributes.machineName = 'el_hovercard_item';
            _super.call(this, attributes);
        }
        /**
         * overrides init method
         */
        CardItem.prototype.init = function (attributes) {
            this.get('content').setContainer(this);
            this.allowShowHideResponsive = false;
            _super.prototype.init.call(this, attributes);
        };
        /**
         * overrides createView() methd
         */
        CardItem.prototype.createView = function () {
            this.view = new CardItemView({ model: this });
        };
        CardItem.type = 'el_hovercard_item';
        return CardItem;
    }(AweBuilder.Element));
    AweBuilder.CardItem = CardItem;
    var CardItemView = (function (_super) {
        __extends(CardItemView, _super);
        function CardItemView() {
            _super.apply(this, arguments);
        }
        CardItemView.prototype.initialize = function () {
            return _super.prototype.initialize.call(this);
        };
        /**
         * overrides renderContent()
         */
        CardItemView.prototype.renderContent = function () {
            var content = this.model.get('content'), name = this.model.get('name');
            this.$el.addClass("ac-hovercard__item js-ac-hovercard__item--" + name + " ac-hovercard__item--" + name);
            if (content instanceof AweBuilder.ContentObject || content instanceof AweBuilder.ContentObjects)
                this.$el.append(content.getView().$el);
        };
        CardItemView.prototype.getRenderControllersData = function () {
            var controllers = _super.prototype.getRenderControllersData.call(this);
            return [controllers[0]];
        };
        return CardItemView;
    }(AweBuilder.ElementView));
    AweBuilder.CardItemView = CardItemView;
    var CardItems = (function (_super) {
        __extends(CardItems, _super);
        function CardItems(models, options) {
            if (options === undefined)
                options = {};
            options.model = CardItem;
            _super.call(this, models, options);
        }
        CardItems.prototype.init = function (models, options) {
            _super.prototype.init.call(this, models, options);
            this.allowSort = false;
        };
        return CardItems;
    }(AweBuilder.Elements));
    AweBuilder.CardItems = CardItems;
    var HoverCardElement = (function (_super) {
        __extends(HoverCardElement, _super);
        function HoverCardElement(options) {
            if (options === undefined)
                options = {};
            if (options.content === undefined) {
                var frontCard = new CardItem({ name: 'front', title: 'Front' }), backCard = new CardItem({ name: 'back', title: 'Back' });
                options.content = [frontCard, backCard];
            }
            if (!(options.content instanceof CardItems))
                options.content = new CardItems(options.content);
            _super.call(this, options);
        }
        /**
         * overrides initialize() method
         */
        HoverCardElement.prototype.initialize = function (attributes) {
            this.get('content').setContainer(this);
            _super.prototype.initialize.call(this, attributes);
        };
        /**
         * {@inheritdoc}
         */
        HoverCardElement.prototype.createView = function () {
            this.view = new HoverCardElementView({ model: this });
        };
        return HoverCardElement;
    }(AweBuilder.Element));
    AweBuilder.HoverCardElement = HoverCardElement;
    var HoverCardElementView = (function (_super) {
        __extends(HoverCardElementView, _super);
        function HoverCardElementView() {
            _super.apply(this, arguments);
        }
        /**
         * {@inheritdoc}
         */
        HoverCardElementView.prototype.initialize = function () {
            this.activeCard = this.model.get('content').getElementsByAttribute('name', 'front')[0];
            return _super.prototype.initialize.call(this);
        };
        /**
         * {@inheritdoc}
         */
        HoverCardElementView.prototype.getRenderControllersData = function () {
            var controllers = _super.prototype.getRenderControllersData.call(this);
            controllers.push({ name: 'rotate', title: this.translate('Rotate'), icon: 'rotate' });
            return controllers;
        };
        /**
         * {@inheritdoc}
         */
        HoverCardElementView.prototype.renderContent = function () {
            var template = window.AweBuilderSettings.elementsTemplate.el_hover_card;
            if (template && template.elementWrapper) {
                this.$el.append(template.elementWrapper);
                this.$cardWrapper = jQuery('.js-ac-hovercard:first', this.$el);
                this.$cardWrapper.append(this.model.get('content').getView().$el);
                // render settings
                this.renderCards();
            }
            else
                throw Error('You must define elementWrapper template for HoverCardElement.');
        };
        /**
         * render cards by settings
         */
        HoverCardElementView.prototype.renderCards = function () {
            var showBackCard = this.model.getSettingsAttr('main.settings.showBackCard');
            if (showBackCard) {
                jQuery('.js-ac-hovercard__item--back:first', this.$cardWrapper).show();
                jQuery('.js-ac-hovercard__item--front:first', this.$cardWrapper).hide();
            }
            else {
                console.log(jQuery('.js-ac-hovercard__item--back:first', this.$cardWrapper));
                jQuery('.js-ac-hovercard__item--back:first', this.$cardWrapper).hide();
                jQuery('.js-ac-hovercard__item--front:first', this.$cardWrapper).show();
            }
        };
        /**
         * {@inheritdoc}
         */
        HoverCardElementView.prototype.events = function () {
            return jQuery.extend({}, _super.prototype.events.call(this), {
                'click .js-ac-control-rotate': 'onRotationControllerClick'
            });
        };
        /**
         * handle click to rotate controller
         */
        HoverCardElementView.prototype.onRotationControllerClick = function (event) {
            event.preventDefault();
            var showName = this.activeCard.get('name') === 'front' ? 'back' : 'front';
            this.activeCard.getView().$el.hide().css('position', '');
            this.activeCard = this.model.get('content').getElementsByAttribute('name', showName)[0];
            this.activeCard.getView().$el.show().css('position', 'relative');
        };
        /**
         * {@inheritdoc}
         */
        HoverCardElementView.prototype.renderSettingsChange = function (selector, value, prevSettings, inlineCSS) {
            _super.prototype.renderSettingsChange.call(this, selector, value, prevSettings, inlineCSS);
            this.renderCards();
        };
        return HoverCardElementView;
    }(AweBuilder.ElementView));
    AweBuilder.HoverCardElementView = HoverCardElementView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: src/js/awe-builder/elements/el-carousel.ts
 * Author: congnv
 * Website: http://megadrupal.com/
 * Created: 11/15/2016
 */
/// <reference path="../core/awe-column.ts" />
/// <reference path="../core/awe-element.ts" />
var AweBuilder;
(function (AweBuilder) {
    var CarouselItem = (function (_super) {
        __extends(CarouselItem, _super);
        function CarouselItem(attributes) {
            window.AweBuilderSettings.elements['el_carousel_item'] = {
                defaultPart: "content",
                data: {
                    main: {
                        style: false,
                        animation: false,
                        settings: {}
                    },
                    content: {
                        title: 'Content',
                        selector: '.js-owl-item',
                        style: {
                            enabled: ['font', 'background', 'border', 'padding', 'margin', 'shadow'],
                            status: ['normal', 'hover']
                        },
                        animation: false,
                        settings: {}
                    }
                },
                objClassName: 'CarouselItem'
            };
            if (attributes === undefined)
                attributes = {};
            if (attributes.content === undefined) {
                attributes.content = new AweBuilder.Columns();
            }
            attributes.machineName = 'el_carousel_item';
            _super.call(this, attributes);
            this.get('content').setContainer(this);
        }
        /**
         * overrides init method
         */
        CarouselItem.prototype.init = function (attributes) {
            //this.get('content').setContainer(this);
            this.allowShowHideResponsive = false;
            _super.prototype.init.call(this, attributes);
        };
        /**
         * overrides createView() methd
         */
        CarouselItem.prototype.createView = function () {
            this.view = new CarouselItemView({ model: this });
        };
        /**
         * overrides createNavigatorView() method
         */
        CarouselItem.prototype.createNavigatorView = function () {
            this.navigatorView = new CarouselItemNavigatorView({ model: this });
        };
        /**
         * overrides clone method()
         */
        CarouselItem.prototype.clone = function () {
            var attributes = this.toJSON(), content = this.get('content').clone();
            attributes.content = content;
            return new CarouselItem(attributes);
        };
        CarouselItem.type = 'el_carousel_item';
        return CarouselItem;
    }(AweBuilder.Element));
    AweBuilder.CarouselItem = CarouselItem;
    var CarouselItemView = (function (_super) {
        __extends(CarouselItemView, _super);
        function CarouselItemView(options) {
            if (options == undefined || options.model === undefined || !(options.model instanceof CarouselItem))
                throw Error('Model of thi view must be an instance of CarouselItem class.');
            _super.call(this, options);
        }
        CarouselItemView.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            this.listenTo(this.model, 'change', this.applyChanged);
        };
        /**
         * overrides renderContent()
         */
        CarouselItemView.prototype.renderContent = function () {
            var view = this.model.get('content').getView();
            view.setAllowUpdateDeleteBtn(true);
            this.$el.addClass('item js-owl-item').append(view.$el);
        };
        /**
         * get wrapper element which contains contents
         * @returns {JQuery}
         */
        CarouselItemView.prototype.getPanelWrapper = function () {
            var $panel = jQuery('.js-owl-item', this.$el);
            return $panel.length ? $panel : this.$el;
        };
        /**
         * apply change in model attributes
         */
        CarouselItemView.prototype.applyChanged = function (model, options) {
            var _self = this, changed = model.changedAttributes();
            jQuery.map(changed, function (value, attrName) {
                switch (attrName) {
                    case 'content':
                        _self.getPanelWrapper().empty().append(model.get('content').getView().$el);
                        break;
                }
            });
        };
        return CarouselItemView;
    }(AweBuilder.ElementView));
    AweBuilder.CarouselItemView = CarouselItemView;
    var CarouselItemNavigatorView = (function (_super) {
        __extends(CarouselItemNavigatorView, _super);
        function CarouselItemNavigatorView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides onTitleMousedown() method
         */
        CarouselItemNavigatorView.prototype.onTitleMouseDown = function (event) {
            _super.prototype.onTitleMouseDown.call(this, event);
            if (!event.isTrigger)
                jQuery('> a', this.model.getView().$el).trigger('click');
        };
        return CarouselItemNavigatorView;
    }(AweBuilder.NavigatorView));
    AweBuilder.CarouselItemNavigatorView = CarouselItemNavigatorView;
    var CarouselItems = (function (_super) {
        __extends(CarouselItems, _super);
        function CarouselItems(models, options) {
            if (options === undefined)
                options = {};
            options.model = CarouselItem;
            _super.call(this, models, options);
        }
        CarouselItems.prototype.init = function (models, options) {
            _super.prototype.init.call(this, models, options);
            this.allowSort = false;
        };
        /**
         * overrides createView() method
         */
        CarouselItems.prototype.createView = function () {
            this.view = new CarouselItemsView({ collection: this, className: 'owl-carousel js-owl-carousel' });
        };
        /**
         * overrides clone() method
         */
        CarouselItems.prototype.clone = function () {
            var models = [];
            jQuery.each(this.models, function (index, model) {
                models.push(model.clone());
            });
            return new CarouselItems(models);
        };
        return CarouselItems;
    }(AweBuilder.Elements));
    AweBuilder.CarouselItems = CarouselItems;
    var CarouselItemsView = (function (_super) {
        __extends(CarouselItemsView, _super);
        function CarouselItemsView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides render() method
         */
        CarouselItemsView.prototype.render = function () {
            var _self = this, template = window.AweBuilderSettings.elementsTemplate.el_carousel;
            if (template && template.elementWrapper)
                this.$el = jQuery(template.elementWrapper);
            if (template && template.contentWrapper) {
                var $contentWrapper = jQuery('.js-owl-carousel', this.$el);
                if ($contentWrapper.length === 0)
                    $contentWrapper = this.$el;
                // render content wrapper
                $contentWrapper.append(template.contentWrapper).addClass("ui-sortable");
                this.$contentWrapper = jQuery('.js-owl-carousel', this.$el);
                // render tabs
                this.collection.each(function (carousel, index) {
                    var view = carousel.getView();
                    _self.$contentWrapper.append(view.$el);
                });
            }
            else
                console.log('You must define js template for tabs element.');
            return this;
        };
        /**
         * overrides listenAddObject method
         */
        CarouselItemsView.prototype.listenAddObject = function (item, collection, options) {
            var view = item.getView(), index = options.at ? options.at : options.index;
            if (view) {
                var width_owl_item = jQuery(".js-owl-carousel:first .owl-item:first", this.$el).width(), $content = jQuery("<div class=\"owl-item\" style=\"width:" + width_owl_item + "px;\"></div>").append(view.$el);
                if (index == undefined || index == collection.length - 1)
                    jQuery(".owl-stage", this.$el).append($content);
                else {
                    jQuery(".js-owl-carousel:first .owl-item:eq(" + index + ")", this.$el).before($content);
                }
            }
        };
        /**
         * handle when CarouselItem is removed from collection
         */
        CarouselItemsView.prototype.listenRemoveObject = function (item, collection, options) {
            var view = item.getView();
            if (view) {
                if (view.$el.parent().hasClass('owl-item'))
                    view.$el.parent().remove();
                else
                    view.$el.remove();
            }
        };
        return CarouselItemsView;
    }(AweBuilder.ContentObjectsView));
    AweBuilder.CarouselItemsView = CarouselItemsView;
    var CarouselElement = (function (_super) {
        __extends(CarouselElement, _super);
        function CarouselElement(options) {
            if (options === undefined)
                options = {};
            if (options.content === undefined) {
                var carouselItem = new CarouselItem({ name: 'carouselItem', title: 'Carousel Item' });
                options.content = [carouselItem];
            }
            if (!(options.content instanceof CarouselItems))
                options.content = new CarouselItems(options.content);
            _super.call(this, options);
        }
        /**
         * overrides initialize() method
         */
        CarouselElement.prototype.initialize = function (attributes) {
            this.get('content').setContainer(this);
            _super.prototype.initialize.call(this, attributes);
        };
        /**
         * {@inheritdoc}
         */
        CarouselElement.prototype.createView = function () {
            this.view = new CarouselElementView({ model: this });
        };
        return CarouselElement;
    }(AweBuilder.Element));
    AweBuilder.CarouselElement = CarouselElement;
    var CarouselElementView = (function (_super) {
        __extends(CarouselElementView, _super);
        function CarouselElementView() {
            _super.apply(this, arguments);
        }
        /**
         * {@inheritdoc}
         */
        CarouselElementView.prototype.initialize = function () {
            this.listenTo(this.model.get('content'), 'add', this.listenAddCarouselItem);
            this.listenTo(this.model.get('content'), 'remove', this.listenRemoveCarouselItem);
            this.listtenDragElementToCarousel();
            return _super.prototype.initialize.call(this);
        };
        /**
         * {@inheritdoc}
         */
        CarouselElementView.prototype.renderContent = function () {
            this.$el.append(this.model.get('content').getView().$el);
            var _self = this, _$ = AweBuilder._jQuery, wait;
            wait = setInterval(function () {
                if (_self.$el.parents('body').length) {
                    clearInterval(wait);
                    var settings = _self.model.get('settings');
                    _self.initCarousel(_self.el, { main: settings.main.settings });
                    _self.checkLastCarouselItem();
                }
            }, 100);
        };
        /*
         * handle event for carosel when init
         */
        CarouselElementView.prototype.listtenDragElementToCarousel = function () {
            var _self = this;
            jQuery.each(this.model.get('content').models, function () {
                jQuery.each(this.get('content').models, function () {
                    _self.listenTo(this.get('content'), 'add', _self.listenDragElementToColumn);
                });
            });
        };
        /*
         * check last carousel item , if it has some elements, create new carousel item
         */
        CarouselElementView.prototype.checkLastCarouselItem = function () {
            var carouselItemsLength = this.model.get('content').length, lastCarouselItem = this.model.get('content').models[carouselItemsLength - 1], isCreate = false;
            jQuery.each(lastCarouselItem.get('content').models, function () {
                if (this.get('content').length) {
                    isCreate = true;
                }
            });
            if (isCreate) {
                this.addNewCaroudelItem();
                AweBuilder._jQuery('.js-owl-carousel', this.el).trigger('to.owl.carousel', [0, 0, true]);
            }
        };
        /**
         * handle event when new tab is added
         */
        CarouselElementView.prototype.listenAddCarouselItem = function (object, collection, options) {
            var index = options.at ? options.at : options.index;
            this.newItemPosition = (index == undefined) ? collection.length : (index - 1);
            this.initCarousel(this.el, {});
            this.listenTo(object.get('content'), 'add', this.listentAddColumn);
        };
        CarouselElementView.prototype.listentAddColumn = function (object) {
            this.listenTo(object.get('content'), 'add', this.listenDragElementToColumn);
        };
        CarouselElementView.prototype.listenRemoveCarouselItem = function () {
            this.initCarousel(this.el, {});
        };
        CarouselElementView.prototype.listenDragElementToColumn = function (object, collection, options) {
            var currentCarouselItem = object.getView().$el.closest('.owl-item'), carouselItems = jQuery('.owl-item', this.$el);
            if (currentCarouselItem.index() == carouselItems.length - 1) {
                this.addNewCaroudelItem();
            }
        };
        CarouselElementView.prototype.addNewCaroudelItem = function () {
            var content = this.model.get('content'), _self = this, newCarouselItem = new CarouselItem({
                title: this.translate('Carousel Item ') + (content.length + 1),
                name: 'carouselItem'
            });
            newCarouselItem.setNavigatorPanel(this.model.getNavigatorPanel());
            jQuery.each(newCarouselItem.get('content').models, function () {
                _self.listenTo(this.get('content'), 'add', _self.listenDragElementToColumn);
            });
            _self.newItemPosition = content.length;
            // set responsive mode to set resize grid for columns in carousel
            var model = this.model;
            newCarouselItem.setResponsiveMode(model.getResponsiveMode());
            content.add(newCarouselItem);
        };
        CarouselElementView.prototype.initCarousel = function (el, option) {
            var default_option, _$ = AweBuilder._jQuery, _self = this;
            if (jQuery(el).data('carousel_option')) {
                default_option = jQuery(el).data('carousel_option');
            }
            else {
                default_option = {
                    main: {
                        view_items: 1,
                        effect: 'none',
                        show_control: true,
                        auto_play: false,
                        stop_hover: false,
                        speed: 4000,
                        transpeed: 400,
                        nav: 'none',
                        thumb_display: 5,
                        position: 'bottom',
                        mouse_drag: false,
                        touch_drag: true
                    }
                };
            }
            if (option.main) {
                default_option.main = jQuery.extend(default_option.main, option.main);
            }
            jQuery(el).data('carousel_option', default_option);
            var owl = _$('.js-owl-carousel', el);
            if (owl.hasClass('owl-loaded')) {
                _$(owl).trigger('destroy.owl.carousel');
            }
            if (_$.fn.owlCarousel) {
                this.startCarousel(el, owl, default_option);
            }
            else {
                var wait_carousel_1;
                wait_carousel_1 = setInterval(function () {
                    if (_$.fn.owlCarousel) {
                        clearInterval(wait_carousel_1);
                        _self.startCarousel(el, owl, default_option);
                    }
                }, 100);
            }
        };
        CarouselElementView.prototype.startCarousel = function (el, owl, option) {
            var _$ = AweBuilder._jQuery, _self = this, navTyle = (option.main.nav == 'none') ? false : true, slideEffect = (option.main.effect == 'none') ? '' : option.main.effect;
            var items_lg = option.main.lg.view_items ? option.main.lg.view_items : option.main.xl.view_items, item_md = option.main.md.view_items ? option.main.md.view_items : items_lg, responsive = {
                1200: { 'items': option.main.xl.view_items },
                992: { 'items': items_lg },
                768: { 'items': item_md },
                576: { 'items': option.main.sm.view_items ? option.main.sm.view_items : item_md },
                0: { 'items': option.main.xs.view_items ? option.main.xs.view_items : 1 }
            };
            _$(owl).owlCarousel({
                animateOut: slideEffect,
                //items: option.main.view_items ? option.main.view_items : 1,
                responsive: responsive,
                nav: option.main.show_control,
                dots: navTyle,
                autoplay: false,
                autoplayHoverPause: option.main.stop_hover,
                autoplayTimeout: option.main.speed,
                autoplaySpeed: option.main.transpeed,
                mouseDrag: false,
                touchDrag: option.main.touch_drag,
                loop: false,
                responsiveClass: true
            });
            // Nav Number
            if (option.main.nav == 'number') {
                var i_1 = 1;
                jQuery('.js-owl-carousel .owl-dot', el).each(function () {
                    jQuery(this).find('span').addClass('dot-number').append('' + i_1);
                    i_1++;
                });
            }
            _$(owl).on('changed.owl.carousel', function (e) {
                jQuery('.js-ac-carousel__item .active', _self.$el).removeClass('active');
                jQuery('.js-ac-carousel__item:eq(' + e.item.index + ') a', _self.$el).addClass('active');
            });
            if (this.newItemPosition > 0) {
                var duration = 0, item_index = (option.main.view_items > 1) ? this.newItemPosition : (this.newItemPosition - 2);
                owl.trigger('to.owl.carousel', [item_index, duration, true]);
                this.newItemPosition = 0;
            }
            // fix for sort
            jQuery('.js-owl-item', owl).each(function () {
                var $item = jQuery(this), model = _self.model.get('content').get($item.attr('data-cid')), classes = "js-content-object js-type-" + model.machineName + " js-el-" + model.cid;
                $item.removeClass(classes).parent().addClass(classes);
            });
        };
        return CarouselElementView;
    }(AweBuilder.ElementView));
    AweBuilder.CarouselElementView = CarouselElementView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: src/js/awe-builder/elements/el-swiper.ts
 * Author: congnv
 * Website: http://megadrupal.com/
 * Created: 11/15/2016
 */
/// <reference path="../core/awe-column.ts" />
/// <reference path="../core/awe-element.ts" />
var AweBuilder;
(function (AweBuilder) {
    var SwiperItem = (function (_super) {
        __extends(SwiperItem, _super);
        function SwiperItem(attributes) {
            window.AweBuilderSettings.elements['el_swiper_item'] = {
                defaultPart: "content",
                data: {
                    main: {
                        style: {
                            enabled: ['font', 'background', 'border', 'padding', 'margin', 'shadow'],
                            status: ['normal', 'hover']
                        },
                        animation: false,
                        settings: {}
                    }
                },
                objClassName: 'SwiperItem'
            };
            if (attributes === undefined)
                attributes = {};
            if (attributes.content === undefined) {
                attributes.content = new AweBuilder.Columns();
            }
            attributes.machineName = 'el_swiper_item';
            _super.call(this, attributes);
            this.get('content').setContainer(this);
        }
        /**
         * overrides init method
         */
        SwiperItem.prototype.init = function (attributes) {
            //this.get('content').setContainer(this);
            this.allowShowHideResponsive = false;
            _super.prototype.init.call(this, attributes);
        };
        /**
         * overrides createView() methd
         */
        SwiperItem.prototype.createView = function () {
            this.view = new SwiperItemView({ model: this });
        };
        /**
         * overrides createNavigatorView() method
         */
        SwiperItem.prototype.createNavigatorView = function () {
            this.navigatorView = new SwiperItemNavigatorView({ model: this });
        };
        /**
         * overrides clone method()
         */
        SwiperItem.prototype.clone = function () {
            var attributes = this.toJSON(), content = this.get('content').clone();
            attributes.content = content;
            return new SwiperItem(attributes);
        };
        SwiperItem.type = 'el_swiper_item';
        return SwiperItem;
    }(AweBuilder.Element));
    AweBuilder.SwiperItem = SwiperItem;
    var SwiperItemView = (function (_super) {
        __extends(SwiperItemView, _super);
        function SwiperItemView(options) {
            if (options == undefined || options.model === undefined || !(options.model instanceof SwiperItem))
                throw Error('Model of thi view must be an instance of SwiperItem class.');
            _super.call(this, options);
        }
        SwiperItemView.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            this.listenTo(this.model, 'change', this.applyChanged);
        };
        /**
         * overrides renderContent()
         */
        SwiperItemView.prototype.renderContent = function () {
            var view = this.model.get('content').getView();
            view.setAllowUpdateDeleteBtn(true);
            this.$el.addClass('swiper-slide js-swiper-slide').append(view.$el);
        };
        /**
         * get wrapper element which contains contents
         * @returns {JQuery}
         */
        SwiperItemView.prototype.getPanelWrapper = function () {
            var $panel = jQuery('.js-swiper-slide', this.$el);
            return $panel.length ? $panel : this.$el;
        };
        /**
         * apply change in model attributes
         */
        SwiperItemView.prototype.applyChanged = function (model, options) {
            var _self = this, changed = model.changedAttributes();
            jQuery.map(changed, function (value, attrName) {
                switch (attrName) {
                    case 'content':
                        _self.getPanelWrapper().empty().append(model.get('content').getView().$el);
                        break;
                }
            });
        };
        return SwiperItemView;
    }(AweBuilder.ElementView));
    AweBuilder.SwiperItemView = SwiperItemView;
    var SwiperItemNavigatorView = (function (_super) {
        __extends(SwiperItemNavigatorView, _super);
        function SwiperItemNavigatorView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides onTitleMousedown() method
         */
        SwiperItemNavigatorView.prototype.onTitleMouseDown = function (event) {
            _super.prototype.onTitleMouseDown.call(this, event);
            if (!event.isTrigger)
                jQuery('> a', this.model.getView().$el).trigger('click');
        };
        return SwiperItemNavigatorView;
    }(AweBuilder.NavigatorView));
    AweBuilder.SwiperItemNavigatorView = SwiperItemNavigatorView;
    var SwiperItems = (function (_super) {
        __extends(SwiperItems, _super);
        function SwiperItems(models, options) {
            if (options === undefined)
                options = {};
            options.model = SwiperItem;
            _super.call(this, models, options);
        }
        SwiperItems.prototype.init = function (models, options) {
            _super.prototype.init.call(this, models, options);
            this.allowSort = false;
        };
        /**
         * overrides createView() method
         */
        SwiperItems.prototype.createView = function () {
            this.view = new SwiperItemsView({ collection: this, className: 'swiper-wrapper js-swiper-wrapper' });
        };
        /**
         * overrides clone() method
         */
        SwiperItems.prototype.clone = function () {
            var models = [];
            jQuery.each(this.models, function (index, model) {
                models.push(model.clone());
            });
            return new SwiperItems(models);
        };
        return SwiperItems;
    }(AweBuilder.Elements));
    AweBuilder.SwiperItems = SwiperItems;
    var SwiperItemsView = (function (_super) {
        __extends(SwiperItemsView, _super);
        function SwiperItemsView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides render() method
         */
        SwiperItemsView.prototype.render = function () {
            var _self = this, template = window.AweBuilderSettings.elementsTemplate.el_swiper;
            if (template && template.elementWrapper)
                this.$el = jQuery(template.elementWrapper);
            if (template && template.contentWrapper) {
                var $contentWrapper = jQuery('.js-swiper-wrapper', this.$el);
                if ($contentWrapper.length === 0)
                    $contentWrapper = this.$el;
                // render content wrapper
                $contentWrapper.append(template.contentWrapper).append(template.contentNavigation).addClass("ui-sortable");
                this.$contentWrapper = jQuery('.js-swiper-wrapper', this.$el);
                // render tabs
                this.collection.each(function (swiper, index) {
                    var view = swiper.getView();
                    _self.$contentWrapper.append(view.$el);
                });
            }
            else
                console.log('You must define js template for tabs element.');
            return this;
        };
        /**
         * overrides listenAddObject method
         */
        SwiperItemsView.prototype.listenAddObject = function (item, collection, options) {
            var view = item.getView(), index = options.at ? options.at : options.index;
            if (view) {
                if (index == undefined || index == collection.length - 1)
                    jQuery(".js-swiper-wrapper:first", this.$el).append(view.$el);
                else {
                    jQuery(".js-swiper-wrapper:first .js-swiper-slide:eq(" + index + ")", this.$el).before(view.$el);
                }
            }
        };
        /**
         * handle when SwiperItem is removed from collection
         */
        SwiperItemsView.prototype.listenRemoveObject = function (item, collection, options) {
            var view = item.getView();
            if (view) {
                view.$el.remove();
            }
        };
        return SwiperItemsView;
    }(AweBuilder.ContentObjectsView));
    AweBuilder.SwiperItemsView = SwiperItemsView;
    var SwiperElement = (function (_super) {
        __extends(SwiperElement, _super);
        function SwiperElement(options) {
            if (options === undefined)
                options = {};
            options.machineName = 'el_swiper';
            // generate default settings data for element
            var elSettings = window.AweBuilderSettings.elements['el_swiper'], defaultSettings = AweBuilder.ContentObject.generateObjectSettings('el_swiper', elSettings.data);
            switch (jQuery.type(options.settings)) {
                case 'string':
                    options.settings = AweBuilder.parseJSON(options.settings);
                    break;
                case 'object':
                    break;
                default:
                    options.settings = {};
            }
            options.settings = jQuery.extend(true, AweBuilder.Element.generateDefaultCustomSettings(defaultSettings), options.settings);
            if (options.content === undefined) {
                var swiperItem = new SwiperItem({ name: 'swiperItem', title: 'Swiper Item 1' });
                options.content = [swiperItem];
            }
            if (!(options.content instanceof SwiperItems))
                options.content = new SwiperItems(options.content);
            _super.call(this, options);
        }
        /**
         * overrides initialize() method
         */
        SwiperElement.prototype.initialize = function (attributes) {
            this.get('content').setContainer(this);
            _super.prototype.initialize.call(this, attributes);
        };
        /**
         * {@inheritdoc}
         */
        SwiperElement.prototype.createView = function () {
            this.view = new SwiperElementView({ model: this });
        };
        return SwiperElement;
    }(AweBuilder.Element));
    AweBuilder.SwiperElement = SwiperElement;
    var SwiperElementView = (function (_super) {
        __extends(SwiperElementView, _super);
        function SwiperElementView() {
            _super.apply(this, arguments);
        }
        /**
         * {@inheritdoc}
         */
        SwiperElementView.prototype.initialize = function () {
            this.listenTo(this.model.get('content'), 'add', this.listenAddSwiperItem);
            this.listenTo(this.model.get('content'), 'remove', this.listenRemoveSwiperItem);
            this.listenDragElementToSwiper();
            return _super.prototype.initialize.call(this);
        };
        /**
         * {@inheritdoc}
         */
        SwiperElementView.prototype.renderContent = function () {
            this.$el.append(this.model.get('content').getView().$el);
            var _self = this, _$ = AweBuilder._jQuery, wait;
            wait = setInterval(function () {
                if (_self.$el.parents('body').length) {
                    clearInterval(wait);
                    var settings = _self.model.get('settings');
                    _self.initSwiper(_self.el, { main: settings.main.settings });
                    _self.checkLastSwiperItem();
                }
            }, 100);
        };
        /*
         * handle event for carosel when init
         */
        SwiperElementView.prototype.listenDragElementToSwiper = function () {
            var _self = this;
            jQuery.each(this.model.get('content').models, function () {
                jQuery.each(this.get('content').models, function () {
                    _self.listenTo(this.get('content'), 'add', _self.listenDragElementToColumn);
                });
            });
        };
        /*
         * check last swiper item , if it has some elements, create new swiper item
         */
        SwiperElementView.prototype.checkLastSwiperItem = function () {
            var swiperItemsLength = this.model.get('content').length, lastSwiperItem = this.model.get('content').models[swiperItemsLength - 1], isCreate = false;
            jQuery.each(lastSwiperItem.get('content').models, function () {
                if (this.get('content').length) {
                    isCreate = true;
                }
            });
            if (isCreate) {
                this.addNewSwiperItem();
            }
        };
        /**
         * handle event when new tab is added
         */
        SwiperElementView.prototype.listenAddSwiperItem = function (object, collection, options) {
            var index = options.at ? options.at : options.index;
            this.newItemPosition = (index == undefined) ? collection.length : (index - 1);
            this.initSwiper(this.el, {});
            this.listenTo(object.get('content'), 'add', this.listentAddColumn);
        };
        SwiperElementView.prototype.listentAddColumn = function (object) {
            this.listenTo(object.get('content'), 'add', this.listenDragElementToColumn);
        };
        SwiperElementView.prototype.listenRemoveSwiperItem = function () {
            this.initSwiper(this.el, {});
        };
        SwiperElementView.prototype.listenDragElementToColumn = function (object, collection, options) {
            var currentSwiperItem = object.getView().$el.closest('.js-swiper-slide'), swiperItems = jQuery('.js-swiper-slide', this.$el);
            if (currentSwiperItem.index() == swiperItems.length - 1) {
                this.addNewSwiperItem();
            }
        };
        SwiperElementView.prototype.addNewSwiperItem = function () {
            var content = this.model.get('content'), _self = this, newSwiperItem = new SwiperItem({
                title: this.translate('Swiper Item ') + (content.length + 1),
                name: 'swiperItem'
            });
            newSwiperItem.setNavigatorPanel(this.model.getNavigatorPanel());
            jQuery.each(newSwiperItem.get('content').models, function () {
                _self.listenTo(this.get('content'), 'add', _self.listenDragElementToColumn);
            });
            _self.newItemPosition = content.length;
            // set responsive mode to set resize grid for columns in swiper
            var model = this.model;
            newSwiperItem.setResponsiveMode(model.getResponsiveMode());
            content.add(newSwiperItem);
        };
        SwiperElementView.prototype.initSwiper = function (el, option) {
            var default_option, _$ = AweBuilder._jQuery, _self = this;
            if (jQuery(el).data('swiper_option')) {
                default_option = jQuery(el).data('swiper_option');
            }
            else {
                default_option = {
                    main: {
                        xl: { slidesPerView: 1, spaceBetween: 30 },
                        effect: 'slide',
                        direction: 'horizontal',
                        navigation: true,
                        autoplay: false,
                        delay: 3000,
                        speed: 200,
                        simulateTouch: false,
                        loop: false,
                        pagination: 1,
                        paginationType: 'bullets',
                        paginationClickable: true,
                        scrollbar: 0
                    }
                };
            }
            if (option.main) {
                default_option.main = jQuery.extend(default_option.main, option.main);
            }
            default_option.main.delay = parseInt(default_option.main.delay);
            if (default_option.main.breakpoints) {
                if (jQuery.type(default_option.main.breakpoints) == 'string') {
                    try {
                        default_option.main.breakpoints = jQuery.parseJSON(default_option.main.breakpoints);
                    }
                    catch (e) {
                        default_option.main.breakpoints = {};
                        console.log('Responsive Breakpoints swiper data is not json string');
                    }
                }
            }
            else {
                var breakpoints_1 = {}, res_data_1 = default_option.main, res_list = { lg: 1199, md: 991, sm: 767, xs: 575 };
                res_data_1.xl.spaceBetween = res_data_1.xl.spaceBetween ? res_data_1.xl.spaceBetween : 30;
                res_data_1.xl.slidesPerView = res_data_1.xl.slidesPerView ? res_data_1.xl.slidesPerView : 1;
                jQuery.each(res_list, function (key, value) {
                    if (res_data_1[key]) {
                        breakpoints_1[value] = {
                            slidesPerView: res_data_1[key].slidesPerView ? res_data_1[key].slidesPerView : res_data_1.xl.slidesPerView,
                            spaceBetween: res_data_1[key].spaceBetween ? res_data_1[key].spaceBetween : res_data_1.xl.spaceBetween
                        };
                    }
                });
                default_option.main.breakpoints = breakpoints_1;
            }
            jQuery(el).data('swiper_option', default_option);
            if (this.swiper)
                this.swiper.destroy(true, true);
            if (_$.fn.swiper) {
                this.startSwiper(el, default_option);
            }
            else {
                var wait_swiper_1;
                wait_swiper_1 = setInterval(function () {
                    if (_$.fn.swiper) {
                        clearInterval(wait_swiper_1);
                        _self.startSwiper(el, default_option);
                    }
                }, 100);
            }
        };
        SwiperElementView.prototype.startSwiper = function (el, option) {
            var _$ = AweBuilder._jQuery, iframeSwiper = AweBuilder._window.Swiper;
            //delete old data pagination
            _$('.swiper-pagination', el).attr('class', 'swiper-pagination').empty();
            // show/hide scrollbar
            if (!option.main.scrollbar)
                _$('.swiper-scrollbar', el).hide();
            else
                _$('.swiper-scrollbar', el).show().removeAttr('style');
            // show/hide navigation    
            if (!option.main.navigation)
                _$('.swiper-button-next, .swiper-button-prev', el).hide();
            else
                _$('.swiper-button-next, .swiper-button-prev', el).show();
            console.log({
                slidesPerView: option.main.xl.slidesPerView,
                spaceBetween: option.main.xl.spaceBetween,
                direction: 'horizontal',
                effect: option.main.effect,
                autoplay: 0,
                speed: option.main.speed,
                simulateTouch: option.main.simulateTouch,
                breakpoints: option.main.breakpoints ? option.main.breakpoints : {},
                loop: false,
                pagination: option.main.pagination ? '.swiper-pagination' : null,
                paginationType: option.main.paginationType,
                paginationClickable: true,
                nextButton: option.main.navigation ? '.swiper-button-next' : null,
                prevButton: option.main.navigation ? '.swiper-button-prev' : null,
                scrollbar: option.main.scrollbar ? '.swiper-scrollbar' : null
            });
            this.swiper = new iframeSwiper('.swiper-container', {
                slidesPerView: option.main.xl.slidesPerView,
                spaceBetween: option.main.xl.spaceBetween,
                direction: 'horizontal',
                effect: option.main.effect,
                autoplay: 0,
                speed: option.main.speed,
                simulateTouch: option.main.simulateTouch,
                breakpoints: option.main.breakpoints ? option.main.breakpoints : {},
                loop: false,
                pagination: option.main.pagination ? '.swiper-pagination' : null,
                paginationType: option.main.paginationType,
                paginationClickable: true,
                nextButton: option.main.navigation ? '.swiper-button-next' : null,
                prevButton: option.main.navigation ? '.swiper-button-prev' : null,
                scrollbar: option.main.scrollbar ? '.swiper-scrollbar' : null
            });
            if (this.newItemPosition > 0) {
                var duration = 0, item_index = (option.main.slidesPerView > 1) ? this.newItemPosition : (this.newItemPosition - 2);
                this.swiper.slideTo(item_index, duration);
                this.newItemPosition = 0;
            }
        };
        return SwiperElementView;
    }(AweBuilder.ElementView));
    AweBuilder.SwiperElementView = SwiperElementView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: src/js/awe-builder/elements/el-masonry.ts
 * Author: congnv
 * Website: http://megadrupal.com/
 * Created: 11/15/2016
 */
/// <reference path="../core/awe-column.ts" />
/// <reference path="../core/awe-element.ts" />
var AweBuilder;
(function (AweBuilder) {
    var MasonryItem = (function (_super) {
        __extends(MasonryItem, _super);
        function MasonryItem(attributes) {
            window.AweBuilderSettings.elements['el_masonry_item'] = {
                defaultPart: "content",
                data: {
                    main: {
                        style: {
                            enabled: ['font', 'background', 'border', 'padding', 'margin', 'shadow'],
                            status: ['normal', 'hover']
                        },
                        animation: false,
                        settings: {}
                    }
                },
                objClassName: 'MasonryItem'
            };
            if (attributes === undefined)
                attributes = {};
            if (attributes.content === undefined) {
                attributes.content = new AweBuilder.Columns();
            }
            attributes.machineName = 'el_masonry_item';
            _super.call(this, attributes);
            this.get('content').setContainer(this);
        }
        /**
         * overrides init method
         */
        MasonryItem.prototype.init = function (attributes) {
            //this.get('content').setContainer(this);
            this.allowShowHideResponsive = false;
            _super.prototype.init.call(this, attributes);
        };
        /**
         * overrides createView() methd
         */
        MasonryItem.prototype.createView = function () {
            this.view = new MasonryItemView({ model: this });
        };
        /**
         * overrides createNavigatorView() method
         */
        MasonryItem.prototype.createNavigatorView = function () {
            this.navigatorView = new MasonryItemNavigatorView({ model: this });
        };
        /**
         * overrides clone method()
         */
        MasonryItem.prototype.clone = function () {
            var attributes = this.toJSON(), content = this.get('content').clone();
            attributes.content = content;
            return new MasonryItem(attributes);
        };
        MasonryItem.type = 'el_masonry_item';
        return MasonryItem;
    }(AweBuilder.Element));
    AweBuilder.MasonryItem = MasonryItem;
    var MasonryItemView = (function (_super) {
        __extends(MasonryItemView, _super);
        function MasonryItemView(options) {
            if (options == undefined || options.model === undefined || !(options.model instanceof MasonryItem))
                throw Error('Model of thi view must be an instance of MasonryItem class.');
            _super.call(this, options);
        }
        MasonryItemView.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            this.listenTo(this.model, 'change', this.applyChanged);
        };
        /**
         * defaults event in controller of content object
         * @returns {Object}
         */
        MasonryItemView.prototype.events = function () {
            return jQuery.extend({}, _super.prototype.events.call(this), {
                "mouseout": "onMouseOut",
                "mouseover": "onMouseOver",
                "click .js-class-style li": "updateStyleMasonry"
            });
        };
        MasonryItemView.prototype.onMouseOut = function () {
            jQuery('li.js-settings-list', this.$el).hide();
        };
        MasonryItemView.prototype.onMouseOver = function () {
            jQuery('li.js-settings-list', this.$el).css('display', '');
        };
        MasonryItemView.prototype.updateStyleMasonry = function (event) {
            var $currentLi = jQuery(event.currentTarget);
            if (!$currentLi.hasClass('js-settings-list')) {
                var ul_parent = $currentLi.closest('ul'), class_style = $currentLi.attr('data-style-item');
                ul_parent.find('li').removeClass("active");
                $currentLi.addClass('active');
                this.model.setStorageValue('class_style', class_style, 'main');
                this.$el.removeClass('wide high large extra-large').addClass(class_style);
            }
        };
        /**
         * overrides renderContent()
         */
        MasonryItemView.prototype.renderContent = function () {
            var view = this.model.get('content').getView(), settings = this.model.getSettingsAttr('main.settings'), class_style = settings.class_style ? settings.class_style : '';
            view.setAllowUpdateDeleteBtn(true);
            this.$el.addClass('grid-item js-grid-item ' + class_style).append(this.templateItem()).find('.grid-item__content-wrapper').prepend(view.$el);
        };
        MasonryItemView.prototype.templateItem = function () {
            return _.template('<div class="grid-item__inner">\
                             <div class="grid-item__content-wrapper">\
                                 <div class="ac_inline-control" style="left:auto; right:0px; display:inline-block">\
                                    <ul class="js-class-style">\
                                        <li class="js-settings-list" style="display:none;" title="Settings" data-style-item="settings">\
                                            <i class="acicon acicon-setting"></i>\
                                        </li>\
                                        <li title="Normal" data-style-item="">\
                                            <i class="acicon acicon-img-normal"></i>\
                                        </li>\
                                        <li title="Wide" data-style-item="wide">\
                                            <i class="acicon acicon-img-wide"></i>\
                                        </li>\
                                        <li title="High" data-style-item="high">\
                                            <i class="acicon acicon-img-high"></i>\
                                        </li>\
                                        <li title="Large" data-style-item="large">\
                                            <i class="acicon acicon-img-large"></i>\
                                        </li>\
                                        <li title="Extra large" data-style-item="extra-large">\
                                            <i class="acicon acicon-img-extralarge"></i>\
                                        </li>\
                                    </ul>\
                                 </div>\
                             </div>\
                         </div>');
        };
        /**
         * get wrapper element which contains contents
         * @returns {JQuery}
         */
        MasonryItemView.prototype.getPanelWrapper = function () {
            var $panel = jQuery('.js-grid-item', this.$el);
            return $panel.length ? $panel : this.$el;
        };
        /**
         * apply change in model attributes
         */
        MasonryItemView.prototype.applyChanged = function (model, options) {
            var _self = this, changed = model.changedAttributes();
            jQuery.map(changed, function (value, attrName) {
                switch (attrName) {
                    case 'content':
                        _self.getPanelWrapper().empty().append(this.templateItem()).find('.grid-item__content-wrapper').prepend(model.get('content').getView().$el);
                        break;
                }
            });
        };
        return MasonryItemView;
    }(AweBuilder.ElementView));
    AweBuilder.MasonryItemView = MasonryItemView;
    var MasonryItemNavigatorView = (function (_super) {
        __extends(MasonryItemNavigatorView, _super);
        function MasonryItemNavigatorView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides onTitleMousedown() method
         */
        MasonryItemNavigatorView.prototype.onTitleMouseDown = function (event) {
            _super.prototype.onTitleMouseDown.call(this, event);
            if (!event.isTrigger)
                jQuery('> a', this.model.getView().$el).trigger('click');
        };
        return MasonryItemNavigatorView;
    }(AweBuilder.NavigatorView));
    AweBuilder.MasonryItemNavigatorView = MasonryItemNavigatorView;
    var MasonryItems = (function (_super) {
        __extends(MasonryItems, _super);
        function MasonryItems(models, options) {
            if (options === undefined)
                options = {};
            options.model = MasonryItem;
            _super.call(this, models, options);
        }
        MasonryItems.prototype.init = function (models, options) {
            _super.prototype.init.call(this, models, options);
            this.allowSort = false;
        };
        /**
         * overrides createView() method
         */
        MasonryItems.prototype.createView = function () {
            this.view = new MasonryItemsView({ collection: this });
        };
        /**
         * overrides clone() method
         */
        MasonryItems.prototype.clone = function () {
            var models = [];
            jQuery.each(this.models, function (index, model) {
                models.push(model.clone());
            });
            return new MasonryItems(models);
        };
        return MasonryItems;
    }(AweBuilder.Elements));
    AweBuilder.MasonryItems = MasonryItems;
    var MasonryItemsView = (function (_super) {
        __extends(MasonryItemsView, _super);
        function MasonryItemsView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides render() method
         */
        MasonryItemsView.prototype.render = function () {
            var _self = this, template = window.AweBuilderSettings.elementsTemplate.el_masonry_grid;
            if (template && template.elementWrapper)
                this.$el = jQuery(template.elementWrapper);
            if (template && template.contentWrapper) {
                var $contentWrapper = jQuery('.js-masonry-content', this.$el);
                if ($contentWrapper.length === 0)
                    $contentWrapper = this.$el;
                // render content wrapper
                $contentWrapper.append(template.contentWrapper).addClass("ui-sortable");
                this.$contentWrapper = jQuery('.js-masonry-content', this.$el);
                // render tabs
                this.collection.each(function (masonry, index) {
                    var view = masonry.getView();
                    _self.$contentWrapper.append(view.$el);
                });
            }
            else
                console.log('You must define js template for tabs element.');
            return this;
        };
        /**
         * overrides listenAddObject method
         */
        MasonryItemsView.prototype.listenAddObject = function (item, collection, options) {
            var view = item.getView(), index = options.at ? options.at : options.index;
            if (view) {
                var _$_2 = AweBuilder._jQuery, _self = this;
                if (index == undefined || index == collection.length - 1)
                    jQuery(".js-masonry-content:first", this.$el).append(view.$el);
                else {
                    jQuery(".js-masonry-content:first .js-grid-item:eq(" + index + ")", this.$el).before(view.$el);
                }
                if (!options.notCallAdd)
                    _$_2('.js-masonry-content:first', _self.$el[0]).masonry('appended', view.$el).masonry('layout');
            }
        };
        /**
         * handle when MasonryItem is removed from collection
         */
        MasonryItemsView.prototype.listenRemoveObject = function (item, collection, options) {
            var view = item.getView();
            if (view) {
                view.$el.remove();
            }
        };
        return MasonryItemsView;
    }(AweBuilder.ContentObjectsView));
    AweBuilder.MasonryItemsView = MasonryItemsView;
    var MasonryElement = (function (_super) {
        __extends(MasonryElement, _super);
        function MasonryElement(options) {
            if (options === undefined)
                options = {};
            options.machineName = 'el_masonry_grid';
            // generate default settings data for element
            var elSettings = window.AweBuilderSettings.elements['el_masonry_grid'], defaultSettings = AweBuilder.ContentObject.generateObjectSettings('el_masonry_grid', elSettings.data);
            switch (jQuery.type(options.settings)) {
                case 'string':
                    options.settings = AweBuilder.parseJSON(options.settings);
                    break;
                case 'object':
                    break;
                default:
                    options.settings = {};
            }
            options.settings = jQuery.extend(true, AweBuilder.Element.generateDefaultCustomSettings(defaultSettings), options.settings);
            if (options.content === undefined) {
                var masonryItem = new MasonryItem({ name: 'masonryItem', title: 'Masonry Item 1' });
                options.content = [masonryItem];
            }
            if (!(options.content instanceof MasonryItems))
                options.content = new MasonryItems(options.content);
            _super.call(this, options);
        }
        /**
         * overrides initialize() method
         */
        MasonryElement.prototype.initialize = function (attributes) {
            this.get('content').setContainer(this);
            _super.prototype.initialize.call(this, attributes);
        };
        /**
         * {@inheritdoc}
         */
        MasonryElement.prototype.createView = function () {
            this.view = new MasonryElementView({ model: this });
        };
        return MasonryElement;
    }(AweBuilder.Element));
    AweBuilder.MasonryElement = MasonryElement;
    var MasonryElementView = (function (_super) {
        __extends(MasonryElementView, _super);
        function MasonryElementView() {
            _super.apply(this, arguments);
        }
        /**
         * {@inheritdoc}
         */
        MasonryElementView.prototype.initialize = function () {
            this.listenTo(this.model.get('content'), 'add', this.listenAddMasonryItem);
            this.listenTo(this.model.get('content'), 'remove', this.listenRemoveMasonryItem);
            this.listenDragElementToMasonry();
            return _super.prototype.initialize.call(this);
        };
        MasonryElementView.prototype.events = function () {
            return jQuery.extend({}, _super.prototype.events.call(this), {
                "click .js-class-style li": "checkRefreshMasonry"
            });
        };
        MasonryElementView.prototype.checkRefreshMasonry = function (event) {
            var $currentLi = jQuery(event.currentTarget);
            if (!$currentLi.hasClass('js-settings-list')) {
                this.refreshMasonry();
            }
        };
        /**
         * {@inheritdoc}
         */
        MasonryElementView.prototype.renderContent = function () {
            this.$el.append(this.model.get('content').getView().$el).addClass('masonry-grid-element');
            var _self = this, _$ = AweBuilder._jQuery, wait, column = this.model.getSettingsAttr('main.settings.column');
            if (column)
                jQuery('.js-masonry-grid', this.$el).attr('data-col-lg', column);
            wait = setInterval(function () {
                if (_self.$el.parents('body').length) {
                    clearInterval(wait);
                    var settings = _self.model.get('settings');
                    _self.checkLastMasonryItem();
                    _self.initMasonry(_self.el, { main: settings.main.settings });
                }
            }, 100);
        };
        /*
         * handle event for carosel when init
         */
        MasonryElementView.prototype.listenDragElementToMasonry = function () {
            var _self = this;
            jQuery.each(this.model.get('content').models, function () {
                jQuery.each(this.get('content').models, function () {
                    _self.listenTo(this.get('content'), 'add', _self.listenDragElementToColumn);
                });
            });
        };
        MasonryElementView.prototype.listenDragElementToColumn = function (object, collection, options) {
            var currentMasonryItem = object.getView().$el.closest('.js-grid-item'), masonryItems = jQuery('.js-grid-item', this.$el);
            //index 0 is grid-sizer, index >= 1 is masonry item
            if (currentMasonryItem.index() == masonryItems.length) {
                this.addNewMasonryItem();
            }
        };
        MasonryElementView.prototype.addNewMasonryItem = function (notCallAdd) {
            var content = this.model.get('content'), _self = this, newMasonryItem = new MasonryItem({
                title: this.translate('Masonry Item ') + (content.length + 1),
                name: 'masonryItem'
            });
            newMasonryItem.setNavigatorPanel(this.model.getNavigatorPanel());
            jQuery.each(newMasonryItem.get('content').models, function () {
                _self.listenTo(this.get('content'), 'add', _self.listenDragElementToColumn);
            });
            _self.newItemPosition = content.length;
            // set responsive mode to set resize grid for columns in masonry
            var model = this.model;
            newMasonryItem.setResponsiveMode(model.getResponsiveMode());
            content.add(newMasonryItem, { notCallAdd: notCallAdd });
        };
        /*
         * check last masonry item , if it has some elements, create new masonry item
         */
        MasonryElementView.prototype.checkLastMasonryItem = function () {
            var masonryItemsLength = this.model.get('content').length, lastMasonryItem = this.model.get('content').models[masonryItemsLength - 1], isCreate = false;
            jQuery.each(lastMasonryItem.get('content').models, function () {
                if (this.get('content').length) {
                    isCreate = true;
                }
            });
            if (isCreate) {
                this.addNewMasonryItem(true);
            }
        };
        /**
         * handle event when new tab is added
         */
        MasonryElementView.prototype.listenAddMasonryItem = function (object, collection, options) {
            var index = options.at ? options.at : options.index;
            this.newItemPosition = (index == undefined) ? collection.length : (index - 1);
            //this.initMasonry(this.el, {});
            this.listenTo(object.get('content'), 'add', this.listentAddColumn);
        };
        MasonryElementView.prototype.listenRemoveMasonryItem = function (object, collection, options) {
            // update masonry style
            var class_style = [];
            jQuery('.js-class-style li.active', this.$el).each(function (key, item) {
                class_style[key] = jQuery(item).attr('data-style-item');
            });
            this.model.setStorageValue('class_style', class_style, 'main');
            this.refreshMasonry();
        };
        MasonryElementView.prototype.listentAddColumn = function (object) {
            this.listenTo(object.get('content'), 'add', this.listenDragElementToColumn);
        };
        MasonryElementView.prototype.initMasonry = function (el, option) {
            var default_option, _$ = AweBuilder._jQuery, _self = this;
            if (jQuery(el).data('masonry_option')) {
                default_option = jQuery(el).data('masonry_option');
            }
            else {
                default_option = {
                    column_responsive: false,
                    column: 4,
                    column_md: 4,
                    column_sm: 4,
                    column_xs: 4,
                    class_style: []
                };
            }
            if (option.main) {
                default_option = jQuery.extend(default_option, option.main);
            }
            jQuery(el).data('masonry_option', default_option);
            if (_$.fn.masonry) {
                this.startMasonry(el, default_option);
            }
            else {
                var wait_masonry_1;
                wait_masonry_1 = setInterval(function () {
                    if (_$.fn.masonry) {
                        clearInterval(wait_masonry_1);
                        _self.startMasonry(el, default_option);
                    }
                }, 100);
            }
        };
        MasonryElementView.prototype.startMasonry = function (el, option) {
            var _$ = AweBuilder._jQuery, $wrapper_grid = _$('.js-masonry-grid', el), $list_content = _$('.js-masonry-content', el);
            if (option.column_responsive) {
                $wrapper_grid.attr('data-col-md', option.column_md).attr('data-col-sm', option.column_sm).attr('data-col-xs', option.column_xs);
            }
            else {
                $wrapper_grid.removeAttr('data-col-md data-col-sm data-col-xs');
            }
            setTimeout(function () {
                if (_$.fn.masonry) {
                    $list_content.masonry({
                        columnWidth: '.grid-sizer',
                        itemSelector: '.grid-item'
                    });
                }
            }, 500);
        };
        MasonryElementView.prototype.refreshMasonry = function () {
            var _$ = AweBuilder._jQuery, _self = this;
            setTimeout(function () {
                _$('.js-masonry-content', _self.el).masonry('layout');
            }, 500);
        };
        return MasonryElementView;
    }(AweBuilder.ElementView));
    AweBuilder.MasonryElementView = MasonryElementView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: elements-tab.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 05/05/2016
 */
/// <reference path="../../../ts-libraries/jquery.ui.d.ts" />
/// <reference path="tab.ts" />
/// <reference path="../../core/awe-element.ts" />
/// <reference path="../../elements/el-layout.ts" />
/// <reference path="../../elements/el-tabs.ts" />
/// <reference path="../../elements/el-accordion.ts" />
/// <reference path="../../elements/el-hover-card.ts" />
/// <reference path="../../elements/el-carousel.ts" />
/// <reference path="../../elements/el-swiper.ts" />
/// <reference path="../../elements/el-masonry.ts" />
var AweBuilder;
(function (AweBuilder) {
    var ElementControllersTab = (function (_super) {
        __extends(ElementControllersTab, _super);
        function ElementControllersTab(elements) {
            var options = {
                title: 'Elements',
                headerHTML: '<i class="acicon acicon-element"></i>',
                content: elements !== undefined ? elements : [],
                sortWithType: 'element'
            };
            _super.call(this, options);
        }
        /**
         * overrides createView method
         */
        ElementControllersTab.prototype.createView = function () {
            this.view = new ElementControllersTabView({ model: this, className: 'js-el-tab-content' });
        };
        /**
         * add element to list elements in content
         * @param {any} elementData: data of element
         */
        ElementControllersTab.prototype.addElement = function (elName, elementData) {
            if (elementData !== undefined) {
                var content = this.get('content');
                elementData.machineName = elName;
                content.push(elementData);
                this.view.updateElement({ el: elementData, added: true });
            }
        };
        /**
         * overrides createControllerObject() method
         */
        ElementControllersTab.createControllerObject = function ($controller) {
            var elName = $controller.attr('data-name'), objClass = $controller.attr('data-class') ? $controller.attr('data-class') : 'Element';
            return eval("new AweBuilder." + objClass + "({machineName: elName})");
        };
        return ElementControllersTab;
    }(AweBuilder.ElTab));
    AweBuilder.ElementControllersTab = ElementControllersTab;
    var ElementControllersTabView = (function (_super) {
        __extends(ElementControllersTabView, _super);
        function ElementControllersTabView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize() method
         */
        ElementControllersTabView.prototype.initialize = function () {
            this.itemTemplate = _.template("\n                <div class=\"js-controller-element ac_element-item-wrapper ac_2-col\"\n                    data-tab=\"AweBuilder.ElementControllersTab\" data-name=\"<%= machineName %>\" data-title=\"" + this.translate('<%= title %>') + "\">\n                    <div class=\"ac_element-item\">\n                        <div class=\"ac_element-item-inner\">\n                            <% if (icon) { %>\n                            <i class=\"<%= icon %>\"></i>\n                            <% } %>\n                            <% if (image) { %>\n                            <img src=\"<%= image %>\" />\n                            <% } %>\n                            <span><%= title %></span>\n                        </div>\n                    </div>\n                </div>\n            ");
            _super.prototype.initialize.call(this);
        };
        /**
         * render draggable elements
         */
        ElementControllersTabView.prototype.renderTabContent = function () {
            var _self = this, content = this.model.get('content'), $contentWrap = jQuery('.js-ac-row', this.$el);
            jQuery.each(content, function () {
                var el = this;
                if (el.title) {
                    // process icon data
                    if (el.icon === undefined)
                        el.icon = '';
                    // process image data
                    if (el.image === undefined)
                        el.image = '';
                    // render controller element
                    var $elController = jQuery(_self.itemTemplate(el));
                    if (el.objClassName)
                        $elController.attr('data-class', el.objClassName);
                    // add element drag controller to tab
                    $contentWrap.append($elController);
                }
            });
        };
        /**
         * update view when change content elements
         */
        ElementControllersTabView.prototype.updateElement = function (changedInfo) {
            if (changedInfo !== undefined) {
                if (changedInfo.added) {
                    jQuery('.js-ac-row', this.$el).append(this.itemTemplate(changedInfo.el));
                }
            }
        };
        return ElementControllersTabView;
    }(AweBuilder.ElTabView));
    AweBuilder.ElementControllersTabView = ElementControllersTabView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: custom-elements-tab.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 07/04/2016
 */
/// <reference path="../../core/awe-element.ts" />
/// <reference path="./tab.ts" />
var AweBuilder;
(function (AweBuilder) {
    var CustomElementTab = (function (_super) {
        __extends(CustomElementTab, _super);
        /**
         * constructor function
         */
        function CustomElementTab(options) {
            var tabOptions = {
                title: options.title,
                machineName: options.machineName,
                headerHTML: options.icon ? "<i class=\"" + options.icon + "\"></i>" : options.title,
                content: options.elements !== undefined ? options.elements : {},
                sortWithType: options.type ? options.type : 'element'
            };
            // process cache key for elements template
            tabOptions.elTemplateKey = options.elTemplateKey !== undefined ? options.elTemplateKey : options.machineName;
            // implements parent constructor
            _super.call(this, tabOptions);
        }
        /**
         * overrides init() method
         */
        CustomElementTab.prototype.init = function () {
            // process when elements is ajax url
            var _self = this, elements = this.get('content');
            if (jQuery.type(elements) === 'string') {
                jQuery.post(elements, function (response) {
                    if (jQuery.type(response) === 'object')
                        elements = response;
                    else if (jQuery.type(response) === 'string')
                        elements = AweBuilder.parseJSON(response);
                    else
                        elements = {};
                    _self.set('content', elements);
                }, 'json').fail(function () {
                    throw Error("Could not get elements in '" + _self.get('title') + "' tab in element panel.");
                });
            }
            // implements parent method
            _super.prototype.init.call(this);
        };
        /**
         * overrides createView() method
         */
        CustomElementTab.prototype.createView = function () {
            this.view = new CustomElementTabView({ model: this });
        };
        /**
         * overrides createControllerObject() method
         */
        CustomElementTab.createControllerObject = function ($controller) {
            var elName = $controller.attr('data-name'), extraData = AweBuilder.parseJSON($controller.attr('data-extra')), elTemplateKey = $controller.attr('data-template-key'), objClass = $controller.attr('data-class') ? $controller.attr('data-class') : 'Element';
            return eval("new AweBuilder." + objClass + "({machineName: elName, extraData: extraData, elTemplateKey: elTemplateKey})");
        };
        return CustomElementTab;
    }(AweBuilder.ElTab));
    AweBuilder.CustomElementTab = CustomElementTab;
    /**
     * Define view class for CustomElementTab
     */
    var CustomElementTabView = (function (_super) {
        __extends(CustomElementTabView, _super);
        function CustomElementTabView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize() method
         */
        CustomElementTabView.prototype.initialize = function () {
            var type = this.model.get('sortWithType');
            this.itemTemplate = _.template("\n                <div class=\"js-controller-" + type + " ac_element-item-wrapper ac_2-col\"\n                    data-tab=\"AweBuilder.CustomElementTab\" data-name=\"" + this.model.get('machineName') + "\"\n                    data-extra='<%= extraData %>' data-template-key=\"" + this.model.get('elTemplateKey') + "\"\n                    data-title=\"" + this.translate('<%= title %>') + "\">\n                    <div class=\"ac_element-item\">\n                        <div class=\"ac_element-item-inner\">\n                            <% if (icon) { %>\n                            <i class=\"<%= icon %>\"></i>\n                            <% } %>\n                            <% if (image) { %>\n                            <img src=\"<%= image %>\" />\n                            <% } %>\n                            <span><%= title %></span>\n                        </div>\n                    </div>\n                </div>\n            ");
            _super.prototype.initialize.call(this);
        };
        /**
         * render draggable elements
         */
        CustomElementTabView.prototype.renderTabContent = function () {
            var _self = this, content = this.model.get('content'), $contentWrap = jQuery('.js-ac-row', this.$el);
            $contentWrap.addClass('ac_row--drupal');
            jQuery.each(content, function () {
                var el = this;
                // save element setting as extra data
                el.extraData = JSON.stringify(el);
                if (el.icon === undefined)
                    el.icon = '';
                if (el.image === undefined)
                    el.image = '';
                // render controller element
                $contentWrap.append(jQuery(_self.itemTemplate(el)));
            });
        };
        /**
         * overrides activate
         * @returns {any}
         */
        CustomElementTabView.prototype.activate = function () {
        };
        return CustomElementTabView;
    }(AweBuilder.ElTabView));
    AweBuilder.CustomElementTabView = CustomElementTabView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: element-panel.ts
 * Author: HaLT
 * Website: http://megadrupal.com/
 * Created: 26/04/2016
 */
/// <reference path="../../core/awe-panel.ts"/>
/// <reference path="../../core/awe-tabs.ts"/>
/// <reference path="template-tab.ts"/>
/// <reference path="elements-tab.ts"/>
/// <reference path="custom-elements-tab.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var ElementPanel = (function (_super) {
        __extends(ElementPanel, _super);
        /**
         * constructor function
         */
        function ElementPanel(elements, sectionTemplateMode) {
            // implements parent constructor
            _super.call(this, {
                title: 'Elements',
                content: '',
                settings: {
                    position: 'right'
                }
            });
            this.tabs = {};
            var _self = this, tabs = [];
            // create template and essential elements tab
            if (!sectionTemplateMode) {
                this.tabs.sectionTemplates = new AweBuilder.TemplatesTab();
                this.tabs.sectionTemplates.setContainerPanel(this);
                tabs.push(this.tabs.sectionTemplates);
            }
            this.tabs.elements = new AweBuilder.ElementControllersTab(elements);
            this.tabs.elements.setContainerPanel(this);
            tabs.push(this.tabs.elements);
            // create custom tabs
            if (window.AweBuilderSettings.elementTabs) {
                jQuery.map(window.AweBuilderSettings.elementTabs, function (settings, machineName) {
                    var tab, newMachineName = machineName;
                    if (_self.tabs[machineName] === undefined) {
                        tab = new AweBuilder.CustomElementTab(settings);
                    }
                    else {
                        // generate new machine name for tab
                        var i = 1;
                        while (true) {
                            newMachineName = machineName + "_" + i;
                            if (_self.tabs[newMachineName] === undefined) {
                                settings.machineName = newMachineName;
                                tab = new AweBuilder.CustomElementTab(settings);
                                break;
                            }
                            // increase suffix number
                            i++;
                        }
                    }
                    // set container panel for tab
                    tab.setContainerPanel(_self);
                    // add tab to list tabs of panel
                    tabs.push(tab);
                    _self.tabs[newMachineName] = tab;
                });
            }
            // init content for panel
            var navigatorContent = new AweBuilder.Tabs({
                content: tabs,
                title: 'Tab Elements',
                settings: {
                    plugin: {
                        active: sectionTemplateMode ? 0 : 1,
                        activate: function (event, data) {
                            _self.activeTab = navigatorContent.get('content').get(data.newTab.attr('data-cid'));
                            _self.set('title', _self.activeTab.get('title'));
                            if (_self.activeTab instanceof AweBuilder.ElTab) {
                                _self.activeTab.getView().initDragElements();
                                _self.activeTab.getView().activate();
                            }
                        }
                    }
                }
            });
            this.set('content', navigatorContent);
        }
        /**
         * add new element to element tab
         * @param {string} elName [description]
         * @param {any}    elData [description]
         */
        ElementPanel.prototype.addElement = function (elName, elData) {
            this.tabs.elements.addElement(elName, elData);
        };
        /**
         * add new section template to templatesTab
         */
        ElementPanel.prototype.addTemplate = function (template) {
            this.tabs.sectionTemplates.addTemplate(template);
        };
        /**
         * overrides createView()
         */
        ElementPanel.prototype.createView = function () {
            this.view = new ElementPanelView({ model: this });
        };
        /**
         * get tabs by index
         */
        ElementPanel.prototype.getTab = function (index) {
            if (index !== undefined)
                return this.get('content').get('content').at(index);
        };
        /**
         * update responsive mode
         */
        ElementPanel.prototype.setResponsiveMode = function (mode) {
            this.view.updateResponsiveMode(mode);
        };
        return ElementPanel;
    }(AweBuilder.Panel));
    AweBuilder.ElementPanel = ElementPanel;
    var ElementPanelView = (function (_super) {
        __extends(ElementPanelView, _super);
        function ElementPanelView() {
            _super.apply(this, arguments);
            this.responsiveMode = AweBuilder.RES_XL;
            this.closeWhenChangeResponsiveMode = false;
        }
        /**
         * activate tab in navigator tabs
         */
        ElementPanelView.prototype.activateTab = function (id) {
            var activeTab = typeof id === 'string' ? this.model.get('content').get('content').get(id) : this.model.getTab(id);
            if (activeTab) {
                // set panel title
                jQuery('.js-ac-panel-header > h2', this.$el).html(activeTab.get('title'));
                // show tab by index
                var index = this.model.get('content').get('content').indexOf(activeTab);
                this.model.get('content').getView().activateTab(index);
                // init drag element for activeTab
                activeTab.getView().initDragElements();
            }
        };
        /**
         * update view when change responsive mode
         */
        ElementPanelView.prototype.updateResponsiveMode = function (mode) {
            this.responsiveMode = mode;
            if (mode !== AweBuilder.RES_XL) {
                if (this.$el.is(':visible'))
                    this.closeWhenChangeResponsiveMode = true;
                this.close();
            }
            else {
                if (this.closeWhenChangeResponsiveMode)
                    this.open();
                this.closeWhenChangeResponsiveMode = false;
            }
        };
        /**
         * overrides open method
         */
        ElementPanelView.prototype.open = function (event) {
            // implements parent method
            if (this.responsiveMode === AweBuilder.RES_XL)
                _super.prototype.open.call(this, event);
        };
        return ElementPanelView;
    }(AweBuilder.PanelView));
    AweBuilder.ElementPanelView = ElementPanelView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: save-section-panel.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 06/15/2016
 */
/// <reference path="../../core/awe-panel.ts"/>
/// <reference path="../element/element-panel.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var SaveTemplatePanel = (function (_super) {
        __extends(SaveTemplatePanel, _super);
        function SaveTemplatePanel() {
            var options = {
                title: 'Save template',
                content: '',
                settings: {
                    enableResize: false,
                    enableDrag: false,
                    hideDefault: true,
                    position: 'center',
                    hasOverlay: true
                }
            };
            _super.call(this, options);
        }
        /**
         * overrides createView() method
         */
        SaveTemplatePanel.prototype.createView = function () {
            this.view = new SaveTemplatePanelView({ model: this });
        };
        return SaveTemplatePanel;
    }(AweBuilder.Panel));
    AweBuilder.SaveTemplatePanel = SaveTemplatePanel;
    var SaveTemplatePanelView = (function (_super) {
        __extends(SaveTemplatePanelView, _super);
        function SaveTemplatePanelView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize() method
         */
        SaveTemplatePanelView.prototype.initialize = function () {
            this.renderedCoverImage = null;
            _super.prototype.initialize.call(this);
            // init allow drag file to uploaded
            this.initDragFile();
        };
        /**
         * define events on panel
         */
        SaveTemplatePanelView.prototype.events = function () {
            return jQuery.extend(true, {}, _super.prototype.events.call(this), {
                'click a.js-save': 'onSave',
                'click a.js-cancel': 'close',
                'keyup .js-template-name input': 'changeName',
                'change .js-uploader input[type=file]': 'changeCoverImage',
                'click span.js-remove-cover': 'removeCoverImage'
            });
        };
        /**
         * overrides renderContent() method
         */
        SaveTemplatePanelView.prototype.renderContent = function () {
            var contentForm = "\n                <form class=\"js-save-template-form pd15\">\n                    <div class=\"ac_row\">\n                        <div class=\"ac_1_col\">\n                            <div class=\"js-template-name ac_panel-item-general\">\n                                <label>\n                                    <span class=\"ac_panel-item-general__title\">" + this.translate('Name') + "</span>\n                                    <div class=\"ac_panel-item-general__content ac_inputtext\">\n                                        <input type=\"text\" value=\"\">\n                                    </div>\n                                </label>\n                            </div>\n                        </div>\n                        <div class=\"ac_1_col\">\n                            <div class=\"js-uploader ac_panel__upload ac_panel-item-general\" style=\"max-height: 200px; overflow: hidden;\">\n                                <span class=\"ac_panel-item-general__title\">" + this.translate('Custom image') + "</span>\n                                <label style=\"padding: 15px\">\n                                    <i class=\"acicon acicon-upload\"></i>\n                                    <input type=\"file\" accept=\".jpg, .jpeg, .png\">\n                                </label>\n                                <div class=\"js-cover-preview\" style=\"display: none; position: relative; height: 68px\">\n                                    <span class=\"js-remove-cover\" style=\"position: absolute; top: 0; right: 0; background-color: #333; padding: 4px 7px\">x</span>\n                                </div>\n                            </div>\n                            <div class=\"ac_panel-desc\">\n                                <p>" + this.translate('Awecontent will generate image automatically. If you want to use custom image, drag it here.') + "</p>\n                            </div>\n                        </div>\n                    </div>\n                </form>\n            ";
            jQuery('.js-ac-panel-body', this.$el).append(contentForm).addClass('ac_panel__body--normal');
            jQuery('.js-ac-panel-body', this.$el).after("\n                <div class=\"ac_panel__footer--2 pd15\">\n                    <div class=\"ac_row\">\n                        <div class=\"ac_1_col\">\n                            <div class=\"btn-group\">\n                                <a href=\"#\" class=\"js-cancel ac_btn ac_btn--2\">" + this.translate('Cancel') + "</a>\n                                <a href=\"#\" class=\"js-save ac_btn ac_btn--1 ac_disable\">" + this.translate('Save') + "</a>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            ");
            // set panel height
            this.$el.css({
                minHeight: 389,
                height: 389
            });
        };
        /**
         * overrides open() method
         */
        SaveTemplatePanelView.prototype.saveTemplate = function (template, onClose) {
            // implements parent method
            this.open();
            // set onClose method
            this.onCloseCallback = onClose;
            // reset render cover image flag
            this.renderedCoverImage = null;
            // set save template property
            this.setSavedTemplate(template);
            // render section to canvas
            var _self = this, $contentView = template.data.getView().$el, backgroundColor = $contentView.css('background-color'), backgroundImage = $contentView.css('background-image'), setBackgroundDefault = (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') && backgroundImage === 'none';
            // set white background if background is not set
            if (setBackgroundDefault)
                $contentView.css('background-color', '#fff');
            // disable border and controller of element in template
            this._$('body').addClass('ac_disable-control');
            window.html2canvas($contentView[0], {
                height: $contentView.height(),
                onrendered: function (canvas) {
                    // set rendered cover image
                    var fileURL = canvas.toDataURL('image/jpeg', 'image/web');
                    _self.renderedCoverImage = SaveTemplatePanelView.dataURItoBlob(fileURL);
                    // enable save button
                    jQuery('.js-template-name input', _self.$el).trigger('keyup');
                    // remove default color
                    if (setBackgroundDefault)
                        $contentView.css('background-color', '');
                    // show border of elements by default
                    _self._$('body').removeClass('ac_disable-control');
                }
            });
            // convert data of template to string
            this.savedTemplate.data = jQuery('<textarea/>').val(JSON.stringify(this.savedTemplate.data)).val();
        };
        /**
         * overrides close() method
         */
        SaveTemplatePanelView.prototype.close = function (event, template) {
            // implements parent method
            _super.prototype.close.call(this, event);
            // reset form
            jQuery('input', this.$el).val('');
            jQuery('.js-upload-preview', this.$el).remove();
            jQuery('.js-uploader > label', this).show();
            this.renderedCoverImage = null;
            this.removeCoverImage();
            // call onclose callback
            if (this.onCloseCallback && event === undefined)
                this.onCloseCallback(template);
        };
        /**
         * implements init drag to upload images
         */
        SaveTemplatePanelView.prototype.initDragFile = function () {
            if ('draggable' in document.createElement('span')) {
                var _self_18 = this, uploader = jQuery('.js-uploader', this.$el).get(0);
                // handle dragover event
                uploader.ondragover = function (event) {
                    event.preventDefault();
                    jQuery('> label', this).css('color', '#fff');
                };
                // handle drag leave
                uploader.ondragleave = function (event) {
                    event.preventDefault();
                    jQuery('> label', this).css('color', '');
                };
                // handle drop file to uploader
                uploader.ondrop = function (event) {
                    event.preventDefault();
                    // remove active color to uploader
                    jQuery('> label', this).css('color', '');
                    // get first file what is dropped
                    if (event.dataTransfer.files.length) {
                        var file = event.dataTransfer.files[0];
                        if (/^image\/png|jpg|jpeg/.test(file.type)) {
                            _self_18.setCoverImage(file);
                        }
                    }
                };
            }
        };
        /**
         * set custom cover image
         */
        SaveTemplatePanelView.prototype.setCoverImage = function (file) {
            // save custom image file
            if (jQuery.type(file) !== 'string')
                this.customImage = file;
            // create preview image
            var imgSrc = jQuery.type(file) !== 'string' ? window.URL.createObjectURL(file) : file;
            if (imgSrc) {
                var previewImage = document.createElement('img');
                previewImage.className = 'js-upload-preview';
                previewImage.src = imgSrc;
                jQuery('.js-uploader > .js-cover-preview', this.$el).show().get(0).appendChild(previewImage);
                jQuery('.js-uploader > label', this.$el).hide();
            }
        };
        /**
         * handle change name of section
         */
        SaveTemplatePanelView.prototype.changeName = function () {
            this.savedTemplate.title = jQuery('.js-template-name input', this.$el).val().trim();
            if (this.savedTemplate.title && this.renderedCoverImage) {
                jQuery('a.js-save', this.$el).removeClass('ac_disable');
            }
            else
                jQuery('a.js-save', this.$el).addClass('ac_disable');
        };
        /**
         * handle event when change cover image
         */
        SaveTemplatePanelView.prototype.changeCoverImage = function (event) {
            event.preventDefault();
            // get files
            var files = jQuery('.js-uploader input', this.$el).get(0).files;
            if (files !== undefined && files.length) {
                var file = files[0];
                if (/^image\/png|jpg|jpeg/.test(file.type)) {
                    this.setCoverImage(file);
                }
            }
        };
        /**
         * remove cover image
         */
        SaveTemplatePanelView.prototype.removeCoverImage = function (event) {
            if (event)
                event.preventDefault();
            // remove custom image
            jQuery('.js-uploader > .js-cover-preview', this.$el).hide();
            jQuery('.js-uploader > .js-cover-preview img', this.$el).remove();
            this.customImage = this.renderedCoverImage;
            // show upload cover element
            jQuery('.js-uploader > label', this.$el).css('display', '');
            // remove cover image in template data
            if (this.savedTemplate)
                this.savedTemplate.cover = { url: '', fid: -1 };
        };
        /**
         * handle click to save section
         */
        SaveTemplatePanelView.prototype.onSave = function (event) {
            if (event)
                event.preventDefault();
            if (!jQuery('a.js-save').hasClass('ac_disable')) {
                // create form data
                var form_2 = new FormData();
                // process custom cover image and request action
                var cover = this.savedTemplate.cover;
                if (!cover || !cover.url) {
                    // remove cover data from template
                    delete this.savedTemplate.cover;
                    // get cover image
                    cover = this.customImage ? this.customImage : this.renderedCoverImage;
                    var sectionName = jQuery('.js-template-name input', this.$el).val(), extension = /^image\/([a-z]+)/.exec(cover.type)[1];
                    form_2.append('cover', cover, sectionName + "." + extension);
                }
                // add template data to upload form
                jQuery.map(this.savedTemplate, function (data, name) {
                    form_2.append(name, data);
                });
                // add request action parameter
                form_2.append('requestAction', 'save');
                // create request to send section template
                var _self_19 = this, request = new XMLHttpRequest(), urlParams = AweBuilder.prepareAjaxParamenters('templates');
                // add extra data to form
                jQuery.map(urlParams.data, function (value, name) {
                    form_2.append(name, value);
                });
                // process request data
                request.open('POST', urlParams.url);
                request.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        // get response of request
                        var template = void 0;
                        if (this.status === 200) {
                            var response = AweBuilder.parseJSON(this.responseText.trim());
                            if (response && response.status)
                                template = response.template;
                        }
                        else {
                            console.log('Create template failed!');
                        }
                        // close panel
                        _self_19.close(undefined, template);
                    }
                };
                // send form data
                request.send(form_2);
            }
        };
        /**
         * set save template
         */
        SaveTemplatePanelView.prototype.setSavedTemplate = function (template) {
            // set saved template property
            this.savedTemplate = template;
            // update form
            jQuery('.js-template-name input[type=text]', this.$el).val(template.title);
            this.setCoverImage(template.cover.url);
        };
        /**
         * convert image URL type to blob
         */
        SaveTemplatePanelView.dataURItoBlob = function (dataURI) {
            // convert base64 to raw binary data held in a string
            var byteString = atob(dataURI.split(',')[1]);
            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            // write the bytes of the string to an ArrayBuffer
            var arrayBuffer = new ArrayBuffer(byteString.length);
            var _ia = new Uint8Array(arrayBuffer);
            for (var i = 0; i < byteString.length; i++) {
                _ia[i] = byteString.charCodeAt(i);
            }
            var dataView = new DataView(arrayBuffer);
            return new Blob([dataView], { type: mimeString });
        };
        return SaveTemplatePanelView;
    }(AweBuilder.PanelView));
    AweBuilder.SaveTemplatePanelView = SaveTemplatePanelView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: awe-section.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 03/15/2016
 */
/// <reference path="../../ts-libraries/html2canvas.d.ts"/>
/// <reference path="../panels/save-template/save-template-panel.ts"/>
/// <reference path="./awe-content-object.ts"/>
/// <reference path="./awe-element.ts"/>
/// <reference path="./awe-column.ts"/>
var AweBuilder;
(function (AweBuilder) {
    /**
     * Model class of section
     */
    var Section = (function (_super) {
        __extends(Section, _super);
        /**
         * constructor function
         * @param options: default attributes for section
         */
        function Section(options) {
            AweBuilder.ContentObject.generateObjectSettings('section', {
                settings: {
                    tag: {
                        type: 'select',
                        title: 'Wrapper tag',
                        inlineTitle: true,
                        options: {
                            'header': 'header',
                            'footer': 'footer',
                            'section': 'section',
                            'div': 'div',
                            'article': 'article',
                            'aside': 'aside',
                            'main': 'main'
                        },
                        customStyles: {
                            '.ac_panel-item-general__content': { 'padding-left': '100px' }
                        },
                        defaultValue: 'section'
                    },
                    fluid: {
                        type: 'toggle',
                        title: 'Fluid section',
                        defaultValue: false
                    },
                    full: {
                        type: 'toggle',
                        title: 'Fullscreen section',
                        defaultValue: false
                    },
                    customHTML: {
                        type: 'textarea',
                        title: 'Custom HTML',
                        size: "medium",
                        defaultValue: '',
                        fireEvent: 'blur'
                    },
                    attributes: {
                        type: 'attributes',
                        title: 'Custom attribute',
                        formElements: {
                            name: {
                                type: 'input',
                                title: 'Name',
                                inlineTitle: true,
                                defaultValue: ''
                            },
                            value: {
                                type: 'input',
                                title: 'Value',
                                inlineTitle: true,
                                defaultValue: ''
                            },
                            validate: function (values) {
                                return (values.name.trim() !== '');
                            }
                        }
                    }
                }
            });
            // prepare default attributes
            if (options === undefined)
                options = {};
            // init title for section
            if (options.title === undefined || jQuery.type(options.title) !== 'string' || options.title.trim() === '') {
                options.title = "Section";
            }
            // set machine name is column
            options.machineName = 'section';
            // process options content
            if (options.content === undefined) {
                if (!options.empty) {
                    options.content = new AweBuilder.Columns();
                }
                else
                    options.content = new AweBuilder.Columns([]);
                options.contentType = options.content.constructor.name;
            }
            // implements parent constructor
            _super.call(this, options);
            // set this section is container of columns collection in content
            this.get('content').setContainer(this);
            this.machineName = 'section';
        }
        /**
         * overrides createView() method to initialize AweSection.View for this model
         */
        Section.prototype.createView = function () {
            // create view for section
            var tagName = this.getSettingsAttr('main.settings.tag');
            this.view = new SectionView({
                model: this,
                className: 'ac_section',
                tagName: tagName ? tagName : 'section'
            });
        };
        /**
         *
         * @param columns
         * @param insertPost
         */
        Section.prototype.addColumn = function (columns, insertPost) {
            var _self = this;
            // update current responsive mode for column
            if (jQuery.type(columns) === 'array') {
                jQuery.each(columns, function (index, column) {
                    column.setResponsiveMode(_self.responsiveMode);
                });
            }
            else
                columns.setResponsiveMode(this.responsiveMode);
            // add column to section content
            if (insertPost && insertPost < this.get('content').length)
                this.get('content').add(columns, { at: insertPost });
            else
                this.get('content').add(columns);
        };
        /**
         * process data to get layout number of column
         * @param layoutString
         */
        Section.prototype.addColumnsByStringLayout = function (layoutString) {
            var addedColumns;
            switch (layoutString) {
                case '1/2+1/2':
                    addedColumns = this.createColumnsByNumber([6, 6]);
                    break;
                case '1/3+2/3':
                    addedColumns = this.createColumnsByNumber([4, 8]);
                    break;
                case '2/3+1/3':
                    addedColumns = this.createColumnsByNumber([8, 4]);
                    break;
                case '1/3+1/3+1/3':
                    addedColumns = this.createColumnsByNumber([4, 4, 4]);
                    break;
                case '1/4+1/2+1/4':
                    addedColumns = this.createColumnsByNumber([3, 6, 3]);
                    break;
                case '1/2+1/4+1/4':
                    addedColumns = this.createColumnsByNumber([6, 3, 3]);
                    break;
                case '1/4+1/4+1/2':
                    addedColumns = this.createColumnsByNumber([3, 3, 6]);
                    break;
                case '1/4+1/4+1/4+1/4':
                    addedColumns = this.createColumnsByNumber([3, 3, 3, 3]);
                    break;
                case '1/6+1/6+1/6+1/6+1/6+1/6':
                    addedColumns = this.createColumnsByNumber([2, 2, 2, 2, 2, 2]);
                    break;
                default:
                    addedColumns = this.createColumnsByNumber([12]);
                    break;
            }
            this.addColumn(addedColumns);
        };
        /**
         * add column to content of section
         * @param numbers
         */
        Section.prototype.createColumnsByNumber = function (numbers) {
            var _self = this, addedColumns = [];
            jQuery.each(numbers, function (_, num) {
                var column = new AweBuilder.Column();
                // set navigator panel
                column.setNavigatorPanel(_self.navigatorPanel);
                // Set new column number
                column.setSettingsAttr("main.responsive.classNumber." + AweBuilder.RES_XL, num);
                column.setSettingsAttr("main.responsive.classNumber." + AweBuilder.RES_LG, num);
                column.setSettingsAttr("main.responsive.classNumber." + AweBuilder.RES_MD, 12);
                column.setSettingsAttr("main.responsive.classNumber." + AweBuilder.RES_SM, 12);
                column.setSettingsAttr("main.responsive.classNumber." + AweBuilder.RES_XS, 12);
                // Set new value column number model
                addedColumns.push(column);
            });
            return addedColumns;
        };
        /**
         * overrides getType() method
         */
        Section.prototype.getType = function () {
            return 'section';
        };
        /**
         * overrides set navigatorPanel method
         */
        Section.prototype.setNavigatorPanel = function (panel) {
            // implements parent method
            _super.prototype.setNavigatorPanel.call(this, panel);
            // disable save button if builder in build section template mode
            var builder = panel ? panel.getBuilder() : undefined, options = builder ? builder.getOptions() : undefined;
            if (options && options.templateMode && options.templateMode.type === 'section') {
                this.view.renderTemplateMode();
            }
        };
        Section.prototype.clone = function () {
            var attr = this.toJSON();
            attr.content = this.get("content").clone();
            delete attr.cid;
            return new Section(attr);
        };
        Section.type = 'section';
        return Section;
    }(AweBuilder.ContentObject));
    AweBuilder.Section = Section;
    /**
     * Section View class
     */
    var SectionView = (function (_super) {
        __extends(SectionView, _super);
        /**
         * constructor function
         */
        function SectionView(attributes) {
            // process initialize tagName
            if (attributes !== undefined && attributes.model !== undefined) {
                var customTag = attributes.model.getSettingsAttr('main.settings.tag');
                if (customTag)
                    attributes.tagName = customTag;
            }
            // implements parent constructor
            _super.call(this, attributes);
        }
        /**
         * create html for create column options
         * @return {string} [description]
         */
        SectionView.prototype.columnCreatorOptions = function () {
            return "\n                <i class=\"acicon acicon-plus\"> </i>\n                <ul>\n                    <li title=\"1/1\" data-column=\"1/1\">\n                        <i class=\"acicon acicon-col-1\"> </i>\n                    </li>\n                    <li title=\"1/2 + 1/2\" data-column=\"1/2+1/2\">\n                        <i class=\"acicon acicon-col-2\"> </i>\n                    </li>\n                    <li title=\"1/3 + 2/3\" data-column=\"1/3+2/3\">\n                        <i class=\"acicon acicon-col-3\"> </i>\n                    </li>\n                    <li title=\"2/3 + 1/3\" data-column=\"2/3+1/3\">\n                        <i class=\"acicon acicon-col-4\"> </i>\n                    </li>\n                    <li title=\"1/3 + 1/3 + 1/3\" data-column=\"1/3+1/3+1/3\">\n                        <i class=\"acicon acicon-col-5\"> </i>\n                    </li>\n                    <li title=\"1/4 + 1/2 + 1/4\" data-column=\"1/4+1/2+1/4\">\n                        <i class=\"acicon acicon-col-6\" > </i>\n                    </li>\n                    <li title=\"1/4 + 1/4 + 1/2\" data-column=\"1/4+1/4+1/2\">\n                        <i class=\"acicon acicon-col-7\"> </i>\n                    </li>\n                    <li title=\"1/2 + 1/4 + 1/4\" data-column=\"1/2+1/4+1/4\">\n                        <i class=\"acicon acicon-col-8\"> </i>\n                    </li>\n                    <li title=\"1/4 + 1/4 + 1/4 + 1/4\" data-column=\"1/4+1/4+1/4+1/4\">\n                        <i class=\"acicon acicon-col-9\"> </i>\n                    </li>\n                    <li title=\"1/6 + 1/6 + 1/6 + 1/6 + 1/6 + 1/6\" data-column=\"1/6+1/6+1/6+1/6+1/6+1/6\">\n                        <i class=\"acicon acicon-col-10\"> </i>\n                    </li>\n                </ul>\n            ";
        };
        /**
         * create controller template for section
         */
        SectionView.prototype.sectionControlTemplate = function () {
            return _.template("\n                <li class=\"js-add-new-col ac_control__column\" title= \"<%= addColText %>\">\n                    <%= creatorOptions %>\n                </li>\n                <li class=\"js-save-template\" title=\"<%= saveText %>\">\n                    <i class=\"acicon acicon-save\"></i>\n                </li>\n            ");
        };
        /**
         * template for insert section buttons
         */
        SectionView.prototype.sectionBottomControllersTemplate = function () {
            return _.template("\n                <div class=\"js-add-section ac_control ac_control-bottom\">\n                    <ul>\n                        <li class=\"js-add-section ac_control__column\" title=\"<%= addSectionText %>\">\n                            <%= creatorOptions %>\n                        </li>\n                    </ul>\n                </div>\n            ");
        };
        /**
         * overrides getRenderControllersData method
         */
        SectionView.prototype.getRenderControllersData = function () {
            var controllers = _super.prototype.getRenderControllersData.call(this);
            controllers.push({
                name: 'column',
                classes: 'js-add-new-col ac_control__column',
                title: this.translate('Add column'),
                content: this.columnCreatorOptions()
            });
            controllers.push({
                name: 'save',
                icon: 'save',
                classes: 'js-save-template',
                title: this.translate('Save as template')
            });
            return controllers;
        };
        /**
         * overrides initialize() method
         */
        SectionView.prototype.initialize = function () {
            // get template function for controllers of section
            this.renderSectionControllers = this.sectionControlTemplate();
            this.renderSectionBottomControllers = this.sectionBottomControllersTemplate();
            // implements parent method
            _super.prototype.initialize.call(this);
        };
        /**
         * overrides events to implements dom event for section
         * @return {any} [description]
         */
        SectionView.prototype.events = function () {
            return jQuery.extend(true, {}, _super.prototype.events.call(this), {
                "click .js-add-new-col": "appendColumn",
                "click .js-add-new-col > ul li": "appendColumn",
                "click .js-add-section .js-add-section": "appendSection",
                "click .js-add-section .js-add-section > ul li": "appendSectionColumn",
                "click .js-save-template": "saveAsTemplate"
            });
        };
        /**
         * overrides render method
         */
        SectionView.prototype.render = function () {
            // add container to content and se
            this.$el.append("<div class=\"js-container ac_container\"></div>");
            this.$wrapper = jQuery('> .js-container', this.$el);
            // implements parent render method
            _super.prototype.render.call(this);
            // render add section controller
            this.$el.append(this.renderSectionBottomControllers({
                addSectionText: this.translate('Add section'),
                creatorOptions: this.columnCreatorOptions()
            }));
            // render custom settings
            this.renderCustomSettings();
            return this;
        };
        /**
         * render custom settings
         */
        SectionView.prototype.renderCustomSettings = function () {
            var _self = this, settings = this.model.getSettingsAttr('main.settings');
            if (settings) {
                jQuery.map(settings, function (setting, name) {
                    switch (name) {
                        case "fluid":
                            if (setting)
                                _self.$wrapper.addClass('ac_container-fluid').removeClass('ac_container');
                            break;
                        case 'full':
                            if (setting) {
                                _self.$wrapper.addClass('js-container-fullscreen').css({
                                    height: jQuery(window).height() + "px"
                                });
                            }
                            break;
                        case 'customHTML':
                            _self.renderCustomHtmlSetting(setting);
                            break;
                        case 'classes':
                            if (setting)
                                _self.$el.addClass(setting);
                            break;
                        case 'id':
                            if (setting)
                                _self.$el.attr('id', setting);
                            break;
                        case 'attributes':
                            jQuery.each(setting, function (index, attribute) {
                                // create attribute in element
                                _self.$el.attr(attribute.name, attribute.value);
                            });
                            break;
                    }
                });
            }
        };
        /**
         * render custom html wrapper
         */
        SectionView.prototype.renderCustomHtmlSetting = function (customHtml) {
            // restore default custom html
            this.$el.append(this.$wrapper);
            jQuery('> .js-custom-wrap', this.$el).remove();
            // process custom html
            if (customHtml) {
                var _self = this, checkElement = document.createElement('div');
                // set value to innerHTML to validate html input
                checkElement.innerHTML = customHtml;
                // process custom html to view
                //                 
                // validate html of custom
                var matches = /\[content\]/.exec(customHtml);
                if (matches && matches[0]) {
                    // replace [content] by div tag
                    customHtml = customHtml.replace('[content]', '<div class="js-col-content"></div>');
                    _self.$el.append(jQuery(customHtml).addClass('js-custom-wrap'));
                    // add column content
                    jQuery('.js-col-content', _self.$el).before(this.$wrapper).remove();
                }
                else {
                    this.$wrapper.hide();
                    var newHtml = /<([a-z]+)[^<]*>/.test(customHtml) ? customHtml : checkElement;
                    _self.$el.append(jQuery(newHtml).addClass('js-custom-wrap'));
                    return;
                }
            }
            // show content wrapper by default
            this.$wrapper.show();
        };
        /**
         * handle click to button add section after this section
         * @param {any} event: contextual object in dom event
         */
        SectionView.prototype.appendSection = function (event) {
            this.preventDefaultEvent(event);
            jQuery('> ul li:first', jQuery(event.target).parents('.js-add-section:first')).trigger('click');
        };
        /**
         * handle click button add column to section
         * @param {any} event: contextual object in dom event
         */
        SectionView.prototype.appendSectionColumn = function (event) {
            // stop trigger to parent element
            if (event)
                event.stopPropagation();
            // render section by column layout string
            var layoutString = jQuery(event.currentTarget).attr('data-column'), newSection = new Section({ empty: true }), collection = this.model.getCollection(), index = collection.indexOf(this.model);
            // set navigator panel
            newSection.setNavigatorPanel(this.model.getNavigatorPanel());
            // set current responsive mode for new section
            newSection.setResponsiveMode(this.model.getResponsiveMode());
            // create list columns for new section by grid selected
            newSection.addColumnsByStringLayout(layoutString);
            // add new section after this section
            collection.add(newSection, { at: index + 1 });
        };
        /**
         * handle click button add column to section
         * @param {any} event : contextual object in dom event
         */
        SectionView.prototype.appendColumn = function (event) {
            // stop event to parent element
            if (event)
                event.stopPropagation();
            // create columns by options defined in button
            var columnType = jQuery(event.currentTarget).attr('data-column');
            this.model.addColumnsByStringLayout(columnType);
        };
        /**
         * Handle event save section as template
         */
        SectionView.prototype.saveAsTemplate = function (event) {
            event.preventDefault();
            var _self = this, builder = _self.getBuilder(), savePanel = builder ? builder.getPanel('save') : undefined, template = {
                type: 'section',
                id: -1,
                title: this.model.get('title'),
                data: this.model,
                cover: { url: '', fid: -1 }
            };
            // open save panel with template
            if (savePanel) {
                savePanel.getView().saveTemplate(template, function (template) {
                    var elementsPanel = builder ? builder.getPanel('elements') : undefined;
                    if (elementsPanel && template)
                        elementsPanel.addTemplate(template);
                });
            }
        };
        /**
         * overrides listenAddContent to render new column to section
         * @param model
         * @param collection
         * @param options
         */
        SectionView.prototype.listenAddContent = function (model, collection, options) {
            _super.prototype.listenAddContent.call(this, model, collection, options);
            var view = model.getView(), $row = jQuery('.js-ac-row', this.$el);
            switch (options.index) {
                case 0:
                    $row.prepend(view.$el);
                    break;
                case collection.length - 1:
                case undefined:
                    $row.append(view.$el);
                    break;
                default:
                    jQuery("> .js-ac-column:eq(" + options.index + ")", $row).before(view.$el);
                    break;
            }
        };
        /**
         * implements code before sort columns
         */
        SectionView.prototype.beforeSort = function (event, ui) {
            jQuery('.js-ac-page-wrapper', this.$el).addClass('ac_col-sorting');
            ui.placeholder.outerWidth(ui.item.outerWidth());
        };
        /**
         * implements after sort columns
         */
        SectionView.prototype.afterSort = function () {
            jQuery('.js-ac-page-wrapper', this.$el).removeClass('ac_col-sorting');
        };
        /**
         * overrides renderSettingsChange() method
         */
        SectionView.prototype.renderSettingsChange = function (selector, value, prevSettings, inlineCss) {
            // implements parent method
            _super.prototype.renderSettingsChange.call(this, selector, value, prevSettings, inlineCss);
            // render custom settings change
            if (selector.indexOf('.settings')) {
                var _self_20 = this, selectorArray = selector.split('.'), last = selectorArray.pop(), settingName = jQuery.inArray(last, [AweBuilder.RES_XS, AweBuilder.RES_SM, AweBuilder.RES_MD, AweBuilder.RES_LG, AweBuilder.RES_XL]) === -1 ? last : selectorArray.pop();
                switch (settingName) {
                    case 'tag':
                        this.model.createView();
                        var view = this.model.getView();
                        this.$el.before(view.$el).remove();
                        view.$el.addClass('ac_highlight js-active');
                        this.destroy();
                        break;
                    case "fluid":
                        if (value)
                            _self_20.$wrapper.addClass('ac_container-fluid').removeClass('ac_container');
                        else
                            _self_20.$wrapper.removeClass('ac_container-fluid').addClass('ac_container');
                        break;
                    case 'full':
                        if (value) {
                            _self_20.$wrapper.addClass('js-container-fullscreen');
                            // set section size
                            _self_20.$wrapper.css({
                                height: jQuery(window).height() + "px"
                            });
                        }
                        else {
                            _self_20.$wrapper.removeClass('js-container-fullscreen').removeAttr('style');
                        }
                        break;
                    case 'customHTML':
                        _self_20.renderCustomHtmlSetting(value);
                        break;
                    case 'classes':
                        var currentClasses = _self_20.model.getSettingsAttr(selector, prevSettings);
                        _self_20.$el.removeClass(currentClasses).addClass(value);
                        break;
                    case 'id':
                        if (value)
                            _self_20.$el.attr('id', value);
                        else
                            _self_20.$el.removeAttr('id');
                        break;
                    case 'attributes':
                        if (jQuery.type(value) === 'array') {
                            var prevAttributes = _self_20.model.getSettingsAttr(selector, prevSettings), names_2 = [];
                            // process new attributes
                            jQuery.each(value, function (index, attribute) {
                                // create attribute in element
                                _self_20.$el.attr(attribute.name, attribute.value);
                                // push name to array name
                                names_2.push(attribute.name);
                            });
                            // remove previous attributes not exist
                            if (prevAttributes !== undefined) {
                                jQuery.each(prevAttributes, function (index, attribute) {
                                    if (jQuery.inArray(attribute.name, names_2) === -1)
                                        _self_20.$el.removeAttr(attribute.name);
                                });
                            }
                        }
                        break;
                }
            }
        };
        /**
         * disable save section template button
         */
        SectionView.prototype.renderTemplateMode = function () {
            jQuery('> .js-ac-control .js-save-template', this.$el).remove();
            jQuery('> .js-ac-control .js-ac-control-clone', this.$el).remove();
            jQuery('> .js-ac-control .js-ac-control-delete', this.$el).remove();
            jQuery('.js-add-section', this.$el).remove();
        };
        return SectionView;
    }(AweBuilder.ContentObjectView));
    AweBuilder.SectionView = SectionView;
    /**
     * SectionCollection class
     */
    var Sections = (function (_super) {
        __extends(Sections, _super);
        /**
         * override constructor to set model type is Section
         * @param models
         * @param options
         */
        function Sections(models, options) {
            // set model of collection
            if (options === undefined || options.model === undefined)
                options = jQuery.extend(true, {}, options, { model: Section });
            // add default model when didn't pass list section
            if (models === undefined || models.length === 0)
                models = [new Section({ empty: false })];
            // implements parent constructor
            _super.call(this, models, options);
        }
        /**
         * overrides createView() method
         */
        Sections.prototype.createView = function () {
            // create view for this sections
            this.view = new SectionsView({ collection: this });
        };
        /**
         * overrides clone() method
         */
        Sections.prototype.clone = function () {
            var models = [];
            jQuery.each(this.models, function () {
                models.push(this.clone());
            });
            return new Sections(models);
        };
        return Sections;
    }(AweBuilder.ContentObjects));
    AweBuilder.Sections = Sections;
    /**
     * Define view class for SectionCollection
     */
    var SectionsView = (function (_super) {
        __extends(SectionsView, _super);
        function SectionsView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize() method
         */
        SectionsView.prototype.initialize = function (options) {
            // add min height is viewport height
            //this.$el.css('min-height', jQuery(window).height()-50);
            this.$el.css('min-height', 50);
            // implements parent method
            _super.prototype.initialize.call(this, options);
            this.setAllowUpdateDeleteBtn(true);
        };
        return SectionsView;
    }(AweBuilder.ContentObjectsView));
    AweBuilder.SectionsView = SectionsView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: src/js/awe-builder/core/awe-menu.ts
 * Author: congnv
 * Website: http://megadrupal.com/
 * Created: 11/15/2016
 */
/// <reference path="./awe-content-object.ts"/>
/// <reference path="./awe-section.ts" />
/// <reference path="./awe-element.ts"/>
/// <reference path="./awe-column.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var DEFAULT_SETTINGS_MENU = {
        'type': 'normal',
        item_position: 'auto',
        text_align: 'default',
        item_type: 'default',
        show_submenu_default: false,
        show_submenu_current: false,
        enable_override: false,
        submenu: {
            animation_type: 'default',
            animation_duration: 300,
            disable_width: false,
            submenu_fullwidth: false,
            mega_width: 600,
            dropdown_width: 250,
            disable_height: false,
            set_height: 'auto',
            mega_height: 400,
            horizontal_align: 'align-left',
            vertical_align: 'align-top',
            submenu_position: 'auto'
        }
    };
    var Menu = (function (_super) {
        __extends(Menu, _super);
        /**
         * Overrides constructor to define default attributes for menu
         * @param options
         */
        function Menu(options) {
            // generate default data structure for menu object
            AweBuilder.ContentObject.generateObjectSettings('menu', {
                main: {
                    animation: false,
                    selector: '> a',
                    style: {
                        enabled: ['font', 'background', 'border', 'padding', 'margin'],
                        status: ['normal', 'hover', 'active']
                    },
                    settings: {
                        'type': {
                            type: 'select',
                            title: 'Menu type',
                            inlineTitle: true,
                            options: {
                                'normal': 'Normal',
                                'mega': 'Mega',
                                'list': 'List'
                            },
                            customStyles: {
                                '.ac_panel-item-general__content': { 'padding-left': '100px' }
                            },
                            defaultValue: 'normal',
                            change: function ($panel, $el, value, elementData) {
                                if (elementData.get('level') == 1 && value.current !== 'normal') {
                                    jQuery('.el-show_submenu_default, .el-show_submenu_current', $panel).show();
                                }
                                else {
                                    jQuery('.el-show_submenu_default, .el-show_submenu_current', $panel).hide();
                                }
                                if (elementData.get('level') == 1) {
                                    var menubox = elementData.getBuilder().content, menuType = menubox.getSettingsAttr('main.settings.type') || 'standard';
                                    if (jQuery.inArray(menuType, ['top', 'standard', 'bottom']) !== -1)
                                        jQuery('.el-text_align', $panel).hide();
                                    else
                                        jQuery('.el-text_align', $panel).show();
                                }
                                else {
                                    jQuery('.el-text_align', $panel).show();
                                }
                            }
                        },
                        show_submenu_default: {
                            type: 'toggle',
                            title: 'Show submenu by default',
                            defaultValue: false,
                            devices: false,
                            inlineTitle: true
                        },
                        show_submenu_current: {
                            type: 'toggle',
                            title: 'Show submenu when current',
                            defaultValue: false,
                            devices: false,
                            inlineTitle: true
                        },
                        enable_override: {
                            type: 'toggle',
                            title: 'Enable Override default value',
                            defaultValue: false,
                            devices: false,
                            inlineTitle: true,
                            change: function ($panel, $el, value, elementData) {
                                if (value.current)
                                    jQuery('.el-override_region', $panel).show();
                                else
                                    jQuery('.el-override_region', $panel).hide();
                            }
                        },
                        override_region: {
                            type: 'group',
                            title: 'Override default value',
                            useParentKey: true,
                            elements: {
                                text_align: {
                                    type: 'select',
                                    title: 'Item text align',
                                    inlineTitle: true,
                                    options: {
                                        'default': 'Default',
                                        'left': 'Left',
                                        'center': 'Center',
                                        'right': 'Right'
                                    },
                                    customStyles: {
                                        '.ac_panel-item-general__content': { 'padding-left': '100px' }
                                    },
                                    defaultValue: 'default'
                                },
                                item_position: {
                                    type: 'select',
                                    title: 'Item position',
                                    inlineTitle: true,
                                    options: {
                                        '': 'Auto',
                                        'float-right': 'Right'
                                    },
                                    customStyles: {
                                        '.ac_panel-item-general__content': { 'padding-left': '100px' }
                                    },
                                    defaultValue: 'text-only'
                                },
                                item_type: {
                                    type: 'select',
                                    title: 'Item type',
                                    inlineTitle: true,
                                    options: {
                                        'default': 'Default',
                                        'text-only': 'Text only',
                                        'icon-only': 'Icon only',
                                        'icon-text': 'Icon + text'
                                    },
                                    customStyles: {
                                        '.ac_panel-item-general__content': { 'padding-left': '100px' }
                                    },
                                    defaultValue: 'default',
                                    change: function ($panel, $el, value, elementData) {
                                        var itemType = value.current, level = elementData.get('level');
                                        if (itemType === 'default') {
                                            var menubox = elementData.getBuilder().content, part = (level == 1) ? 'top_items' : 'flyout_submenu';
                                            itemType = menubox.getSettingsAttr(part + '.settings.item_type') || 'text-only';
                                        }
                                        if (itemType === 'text-only')
                                            jQuery('.el-icon', $panel).hide();
                                        else {
                                            jQuery('.el-icon', $panel).show();
                                        }
                                    }
                                },
                                icon: {
                                    type: 'icon',
                                    title: 'Chosse Icon',
                                    defaultValue: '',
                                    devices: false,
                                    change: function ($panel, $el, values, element) {
                                        if (values.prev !== undefined) {
                                        }
                                    }
                                },
                                submenu: {
                                    type: 'group',
                                    title: 'Submenu settings',
                                    elements: {
                                        animation_type: {
                                            type: 'select',
                                            title: 'Animation',
                                            inlineTitle: true,
                                            options: {
                                                'default': 'Default',
                                                'fade': 'Fade',
                                                'fadeup': 'Fade Up',
                                                'fadedown': 'Fade Down',
                                                'fadeleft': 'Fade Left',
                                                'faderight': 'Fade Right',
                                                'zoom': 'Zoom',
                                                'rotateupleft': 'Rotate Left',
                                                'flipx': 'FlipX',
                                                'flipy': 'FlipY',
                                                'flipyright': 'Flipy Right',
                                                'slideleft': 'Slide Left',
                                                'slideright': 'Slide Right'
                                            },
                                            customStyles: {
                                                '.ac_panel-item-general__content': { 'padding-left': '100px' }
                                            },
                                            defaultValue: 'default'
                                        },
                                        animation_duration: {
                                            type: 'ranger',
                                            title: 'Duration',
                                            min: 0,
                                            max: 2000,
                                            unit: 'ms',
                                            widthNumber: 2,
                                            defaultValue: 300,
                                            devices: false
                                        },
                                        disable_width: {
                                            type: 'toggle',
                                            title: 'Custom width',
                                            defaultValue: false,
                                            devices: false,
                                            inlineTitle: true,
                                            change: function ($panel, $el, value, elementData) {
                                                if (value.current) {
                                                    var type_menu = elementData.getSettingsAttr('main.settings.type');
                                                    if (type_menu == 'mega')
                                                        jQuery('.el-submenu_fullwidth, .el-mega_width', $panel).show();
                                                    else if (type_menu == 'list')
                                                        jQuery('.el-dropdown_width', $panel).show();
                                                }
                                                else
                                                    jQuery('.el-submenu_fullwidth, .el-mega_width, .el-dropdown_width', $panel).hide();
                                            }
                                        },
                                        submenu_fullwidth: {
                                            type: 'toggle',
                                            title: 'Full width',
                                            defaultValue: false,
                                            devices: false,
                                            inlineTitle: true,
                                            change: function ($panel, $el, value, elementData) {
                                                var disable_width = elementData.getSettingsAttr('main.settings.submenu.disable_width');
                                                if (!disable_width || value.current)
                                                    jQuery('.el-mega_width, .el-dropdown_width', $panel).hide();
                                                else {
                                                    jQuery('.el-mega_width', $panel).show();
                                                }
                                            }
                                        },
                                        mega_width: {
                                            type: 'ranger',
                                            title: 'Submenu width',
                                            min: 200,
                                            max: 1500,
                                            step: 10,
                                            unit: 'px',
                                            widthNumber: 2,
                                            defaultValue: 600,
                                            devices: false
                                        },
                                        dropdown_width: {
                                            type: 'ranger',
                                            title: 'Submenu width',
                                            min: 200,
                                            max: 1500,
                                            step: 10,
                                            unit: 'px',
                                            widthNumber: 2,
                                            defaultValue: 250,
                                            devices: false
                                        },
                                        disable_height: {
                                            type: 'toggle',
                                            title: 'Custom height',
                                            defaultValue: false,
                                            devices: false,
                                            inlineTitle: true,
                                            change: function ($panel, $el, value, elementData) {
                                                if (value.current) {
                                                    jQuery('.el-set_height', $panel).show();
                                                    var set_height = elementData.getSettingsAttr('main.submenu.set_height') || 'auto';
                                                    if (set_height === 'auto')
                                                        jQuery('.el-mega_height', $panel).hide();
                                                    else
                                                        jQuery('.el-mega_height', $panel).show();
                                                }
                                                else
                                                    jQuery('.el-set_height, .el-mega_height', $panel).hide();
                                            }
                                        },
                                        set_height: {
                                            type: 'select',
                                            title: 'Set max height',
                                            inlineTitle: true,
                                            options: {
                                                'auto': 'Auto',
                                                'fixed': 'Fixed',
                                                'max': 'Max height'
                                            },
                                            customStyles: {
                                                '.ac_panel-item-general__content': { 'padding-left': '100px' }
                                            },
                                            defaultValue: 'auto',
                                            change: function ($panel, $el, value, elementData) {
                                                if (value.current === 'auto')
                                                    jQuery('.el-mega_height', $panel).hide();
                                                else
                                                    jQuery('.el-mega_height', $panel).show();
                                            }
                                        },
                                        mega_height: {
                                            type: 'ranger',
                                            title: 'Height',
                                            min: 200,
                                            max: 1500,
                                            step: 10,
                                            unit: 'px',
                                            widthNumber: 2,
                                            defaultValue: 400,
                                            devices: false
                                        },
                                        horizontal_align: {
                                            type: 'select',
                                            title: 'Align',
                                            inlineTitle: true,
                                            options: {
                                                'auto': 'Auto',
                                                'align-left': 'Left',
                                                'align-center': 'Center',
                                                'align-right': 'Right'
                                            },
                                            customStyles: {
                                                '.ac_panel-item-general__content': { 'padding-left': '100px' }
                                            },
                                            defaultValue: 'align-left'
                                        },
                                        vertical_align: {
                                            type: 'select',
                                            title: 'Align',
                                            inlineTitle: true,
                                            options: {
                                                'auto': 'Auto',
                                                'align-top': 'Top',
                                                'align-middle': 'Middle',
                                                'align-bottom': 'Bottom'
                                            },
                                            customStyles: {
                                                '.ac_panel-item-general__content': { 'padding-left': '100px' }
                                            },
                                            defaultValue: 'align-top'
                                        },
                                        submenu_position: {
                                            type: 'select',
                                            title: 'Position',
                                            inlineTitle: true,
                                            options: {
                                                'auto': 'Auto',
                                                'left': 'Left',
                                                'right': 'Right'
                                            },
                                            customStyles: {
                                                '.ac_panel-item-general__content': { 'padding-left': '100px' }
                                            },
                                            defaultValue: 'auto'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            // prepare default option settings
            if (options === undefined)
                options = {};
            if (options.settings === undefined) {
                options.settings = {};
            }
            if (options.title === undefined
                || jQuery.type(options.title) !== 'string'
                || options.title.trim() === '') {
                options.title = "Menu item";
            }
            if (options.content === undefined) {
                options.content = false;
            }
            // set machine name is menu
            options.machineName = 'menu';
            // implements parent constructor
            _super.call(this, options);
            if (options.content)
                this.get('content').setContainer(this);
            /*
             * fix missing selector in part main although defined
             * menu is not element, one part, not have selector by default
             * use Element.generateDefaultCustomSettings to get selector and default field or add selector to part settings
             */
            this.addSelectorToPart();
        }
        /*
         * add selector to settings
         */
        Menu.prototype.addSelectorToPart = function () {
            var settings = this.get('settings');
            if (!settings.main)
                settings.main = {};
            settings.main.selector = '> a';
            this.set('settings', settings);
        };
        /**
        * implements custom init
        */
        Menu.prototype.init = function () {
            // set this model is container for elements collection
            if (this.get('content'))
                this.get('content').setContainer(this);
            // set machine name
            this.machineName = 'menu';
        };
        /**
        * overrides createView() method to create view instance object for this model
        */
        Menu.prototype.createView = function () {
            // create view for menu item
            this.view = new MenuView({
                model: this,
                tagName: 'li'
            });
        };
        /**
          * overrides getType() method
          */
        Menu.prototype.getType = function () {
            return 'menu';
        };
        /**
         * overrides createNavigatorView() method
         */
        Menu.prototype.createNavigatorView = function () {
            this.navigatorView = new MenuNavigatorView({ model: this });
        };
        /**
         * overrides clone() method of backbone to clone elements collection
         * @returns {Mwnu}
         */
        Menu.prototype.clone = function () {
            var attr = this.toJSON(), menu_type = this.getSettingsAttr('main.settings.type') || 'normal';
            if (menu_type !== 'normal') {
                attr.content = this.get("content").clone();
            }
            else
                attr.content = false;
            delete attr.cid;
            return new Menu(attr);
        };
        Menu.prototype.getRealSettings = function () {
            var mainSettings = this.getSettingsAttr('main.settings'), settings = { submenu: {} };
            jQuery.extend(true, settings, DEFAULT_SETTINGS_MENU, mainSettings);
            jQuery.extend(true, settings.submenu, DEFAULT_SETTINGS_MENU.submenu, mainSettings ? mainSettings.submenu : {});
            return settings;
        };
        Menu.type = 'menu';
        return Menu;
    }(AweBuilder.ContentObject));
    AweBuilder.Menu = Menu;
    /**
     * Define class View for Menu
     */
    var MenuView = (function (_super) {
        __extends(MenuView, _super);
        function MenuView(attributes) {
            if (attributes == undefined || attributes.tagName == undefined || attributes.tagName == '')
                attributes.tagName = 'li';
            _super.call(this, attributes);
        }
        /*
         * override method
         */
        MenuView.prototype.getRenderControllersData = function () {
            return [
                {
                    name: 'move',
                    title: this.model.get('title'),
                    content: "<span class=\"js-ac-control-title\">" + this.model.get('title') + "</span>"
                },
                {
                    name: 'edit',
                    title: this.translate('Edit'),
                    icon: 'pen'
                },
                {
                    name: 'delete',
                    icon: 'del',
                    title: this.translate('Delete')
                }
            ];
        };
        /*
         * override edit method
         */
        MenuView.prototype.edit = function (event) {
            AweBuilder.activeMenuModel = this.model;
            _super.prototype.edit.call(this, event);
            this.showSubmenu();
            // fix resize column
            if (this.model.getSettingsAttr('main.settings.type') === 'mega') {
                this.$el.find('.js-type-column').trigger('resizeGrid');
            }
        };
        MenuView.prototype.showSubmenu = function () {
            var $submenu = this.$el.find('> .awemenu-submenu'), model = this.model, _$ = AweBuilder._jQuery, isActive = (this.$el.hasClass('awemenu-active')) ? 1 : 0;
            // if not show submenu, show it
            if (!isActive) {
                // hide all submenu
                this.$el.parent().find('.awemenu-active').removeClass('awemenu-active');
                this.$el.addClass('awemenu-active');
                $submenu.find('canvas').each(function () {
                    if (!_$(this).height()) {
                        _$(this).closest('.js-type-column').trigger('resize');
                    }
                });
            }
            // show / hide settings
            this.showHideSettings();
        };
        MenuView.prototype.showHideSettings = function () {
            var model = this.model, level = model.get('level'), settings = model.getRealSettings(), menubox = model.getBuilder().content, menuType = menubox.getSettingsAttr('main.settings.type') || 'standard', settingsTabView = model.getNavigatorPanel().get('content').get('content').models[1].getView(), $settingsTab = jQuery('.elements-form:visible', settingsTabView.$el);
            if (settings.type == 'normal')
                jQuery('.el-submenu', $settingsTab).hide();
            else {
                jQuery('.el-submenu', $settingsTab).show();
                if (!settings.submenu.disable_width) {
                    jQuery('.elements-form:visible .el-mega_width, .elements-form:visible .el-dropdown_width', $settingsTab).hide();
                }
                else {
                    if (settings.type == 'mega') {
                        jQuery('.el-submenu_fullwidth', $settingsTab).show();
                        jQuery('.el-dropdown_width', $settingsTab).hide();
                        if (settings.submenu.submenu_fullwidth)
                            jQuery('.el-mega_width', $settingsTab).hide();
                        else
                            jQuery('.el-mega_width', $settingsTab).show();
                    }
                    else {
                        jQuery('.el-dropdown_width', $settingsTab).show();
                        jQuery('.el-mega_width, .el-submenu_fullwidth', $settingsTab).hide();
                    }
                }
                if (settings.type == 'mega') {
                    jQuery('.el-disable_height').show();
                    if (settings.submenu.disable_height)
                        jQuery('.el-set_height', $settingsTab).show();
                    else
                        jQuery('.el-set_height', $settingsTab).hide();
                    if (settings.submenu.set_height !== 'auto')
                        jQuery('.el-mega_height', $settingsTab).show();
                    else
                        jQuery('.el-mega_height', $settingsTab).hide();
                }
                else {
                    jQuery('.el-disable_height, .el-set_height, .el-mega_height', $settingsTab).hide();
                }
            }
            if (level == 1) {
                if (jQuery.inArray(menuType, ['standard', 'top', 'bottom']) >= 0) {
                    jQuery('.el-vertical_align, .el-submenu_position', $settingsTab).hide();
                    jQuery('.el-horizontal_align, .el-item_position', $settingsTab).show();
                }
                else {
                    jQuery('.el-item_position, .el-horizontal_align, .el-submenu_position', $settingsTab).hide();
                    jQuery('.el-vertical_align', $settingsTab).show();
                }
            }
            else {
                jQuery('.el-horizontal_align, .el-item_position', $settingsTab).hide();
                jQuery('.el-vertical_align', $settingsTab).show();
                if (jQuery.inArray(menuType, ['standard', 'top', 'bottom']) >= 0) {
                    jQuery('.el-submenu_position', $settingsTab).show();
                }
                else {
                    jQuery('.el-submenu_position', $settingsTab).hide();
                }
            }
        };
        /**
         * render content for menubox
         */
        MenuView.prototype.renderContent = function () {
            var model = this.model, level = model.get('level'), _self = this;
            settings = model.getRealSettings();
            // render tag <a>   
            var itemContent = this.renderItemContent(settings);
            this.$el.append(itemContent);
            // init edit title
            this.initEditTtitle();
            // render sub content
            this.renderSubContent(settings.type);
            this.$el.addClass('awemenu-item ac_menu-item awemenu-item-level-' + level);
            this.setDataMenuToView();
            //render settings            
            var time = setInterval(function () {
                var builder = _self.getBuilder();
                if (builder) {
                    clearInterval(time);
                    _self.listenTo(builder.content, 'change', _self.listenMenuBoxChange);
                    _self.renderSettingMenu(model.getRealSettings());
                }
            }, 150);
        };
        MenuView.prototype.setDataMenuToView = function () {
            var model = this.model, datamenu = model.toJSON();
            datamenu.realSettings = model.getRealSettings();
            this.$el.data('datamenu', JSON.stringify(datamenu));
        };
        MenuView.prototype.renderItemContent = function (settings) {
            var model = this.model, title = model.get('title'), $item = jQuery('<a class="awe-link" style="transition:all 0s;"><span class="awemenu-item-icon"></span><div class="awemenu-item-text" contenteditable="true">' + title + '</div></a>');
            if (settings.type != 'normal') {
                $item.append('<i class="awemenu-arrow amm-down"></i>');
            }
            return $item;
        };
        MenuView.prototype.renderSubContent = function (menuType, isChange) {
            var model = this.model, _self = this, content = model.get('content'), submenuClass = ['awemenu-submenu'];
            _self.$el.find('> ul').remove();
            switch (menuType) {
                case 'normal':
                    break;
                case 'mega':
                    submenuClass.push('awemenu-megamenu');
                    _self.$el.append('<ul class="awemenu-submenu submenu awemenu-megamenu"><li class="awemenu-item"></li></ul>');
                    var sectionsView = content.getView();
                    _self.$el.find('> .awemenu-megamenu .awemenu-item').append(sectionsView.$el);
                    break;
                case 'list':
                    submenuClass.push('awemenu-dropdown');
                    var menusView = content.getView();
                    _self.$el.append(menusView.$el);
            }
            _self.$el.find('> ul').addClass(submenuClass.join(' '));
            if (isChange)
                this.showSubmenu();
        };
        MenuView.prototype.renderSettingMenu = function (settings) {
            var _self = this, main = settings ? settings : DEFAULT_SETTINGS_MENU;
            for (var key in settings) {
                if (key != 'submenu') {
                    _self.renderOneSetting(key, settings[key]);
                }
                else {
                    for (var key2 in settings.submenu) {
                        _self.renderOneSetting(key2, settings.submenu[key2]);
                    }
                }
            }
            ;
        };
        MenuView.prototype.renderOneSetting = function (key, value, prevVal, isChange) {
            function setHeightSubmenu($submenu, set_height, mega_height) {
                switch (set_height) {
                    case 'auto':
                        $submenu.css({ 'height': '', 'max-height': '', 'overflow-y': '' });
                        break;
                    case 'fixed':
                        $submenu.css({ 'height': (mega_height + 'px'), 'max-height': '', 'overflow-y': '' });
                        break;
                    case 'max':
                        $submenu.css({ 'height': '', 'max-height': (mega_height + 'px'), 'overflow-y': 'auto' });
                        break;
                }
            }
            if (value == prevVal) {
                console.log('not render :' + value);
                return;
            }
            var model = this.model, level = model.get('level'), _self = this, settings = model.getRealSettings(), navSettings = model.getBuilder().content.getRealSettings(), $item = this.$el, $submenu = jQuery('> .awemenu-submenu', $item), _$ = AweBuilder._jQuery;
            switch (key) {
                case 'type':
                    if (isChange) {
                        //remove old content
                        var collection_1 = model.get('content');
                        if (collection_1) {
                            jQuery(collection_1.models).each(function (index, model) {
                                collection_1.remove(model);
                            });
                        }
                        var newContent = false;
                        switch (value) {
                            case 'mega':
                                newContent = new AweBuilder.Sections();
                                break;
                            case 'list':
                                newContent = new Menus();
                        }
                        model.set('content', newContent);
                        if (newContent) {
                            //add arrow 
                            if (!this.$el.find('> a .awemenu-arrow').length)
                                this.$el.find('> a').append('<i class="awemenu-arrow amm-down"></i>');
                            model.set('contentType', newContent.constructor.name);
                            model.get('content').setContainer(model);
                            // set navigatorPanel
                            model.setNavigatorPanel(model.getNavigatorPanel());
                            // set current responsive mode of builder
                            model.setResponsiveMode(model.responsiveMode);
                            // render content navigator view
                            model.get('content').createNavigatorViews();
                            var navigatorView = model.getNavigatorView(), contentNavigatorView = model.get('content').getNavigatorView();
                            navigatorView.$el.append(contentNavigatorView.$el);
                            navigatorView.updateCollapsedDisplay(newContent.length);
                        }
                        else {
                            //remove arrow
                            this.$el.find('.awemenu-arrow').remove();
                            if (model.get('contentType') !== undefined)
                                model.unset('contentType');
                        }
                        this.renderSubContent(value, true);
                        // rerender settings
                        _self.showHideSettings();
                        _self.renderSettingMenu(settings);
                    }
                    break;
                case 'item_type':
                    if (value == 'default') {
                        value = (level == 1) ? navSettings.top_items.item_type : navSettings.flyout_submenu.item_type;
                    }
                    var $icon = $item.find('> a .awemenu-item-icon i');
                    if (!$icon.length) {
                        $item.find('> a .awemenu-item-icon').append('<i></i>');
                    }
                    $item.find('> a').removeClass('awemenu-' + prevVal).addClass('awemenu-' + value);
                    break;
                case 'icon':
                    $item.find('> a .awemenu-item-icon i').attr('class', value);
                    break;
                case 'item_position':
                    $item.removeClass(prevVal).addClass(value);
                    if (value == 'float-right')
                        $item.addClass('awemenu-item-right');
                    else {
                        $item.removeClass('awemenu-item-right');
                    }
                    break;
                case 'text_align':
                    var parentValue = (level == 1) ? navSettings.top_items.text_align : navSettings.flyout_submenu.text_align;
                    if (value != 'default')
                        $item.find('> a').css('text-align', value);
                    else {
                        if (parentValue != 'default')
                            $item.find('> a').css('text-align', parentValue);
                        else
                            $item.find('> a').css('text-align', '');
                    }
                    break;
                case 'animation_type':
                    var parentValue = navSettings.main.animation_type;
                    if (parentValue !== 'none') {
                        if (value === 'default') {
                            value = parentValue;
                        }
                        _self.$el.removeClass('awemenu-' + prevVal).addClass('awemenu-' + value);
                        jQuery('> .awemenu-submenu', $item).attr('data-animation', value);
                    }
                    break;
                case 'animation_duration':
                    var animationType = navSettings.main.animation_type;
                    if (animationType !== 'none') {
                        var duration = value ? value : navSettings.main.animation_duration;
                        jQuery('> .awemenu-submenu', $item).css({ 'transition-duration': duration + 'ms' }).attr('data-duration', duration + 'ms');
                    }
                    else {
                        jQuery('> .awemenu-submenu', $item).css({ 'transition-duration': '' }).removeAttr('data-duration');
                    }
                    break;
                case 'disable_width':
                    if (settings.type !== 'normal') {
                        $submenu.initMegamenuPositionWidth(model);
                        if (level == 1 && (navSettings.main.type == 'standard' || navSettings.main.type == 'top' || navSettings.main.type == 'bottom')) {
                            $submenu.alignSubmenu(model, settings.submenu.horizontal_align);
                        }
                    }
                    break;
                case 'submenu_fullwidth':
                    if (settings.type === 'mega' && (value || isChange !== undefined)) {
                        if (settings.submenu.disable_width) {
                            submenuWidth = settings.submenu.mega_width;
                        }
                        else {
                            value = navSettings.mega_submenu.fullwidth;
                            submenuWidth = navSettings.mega_submenu.mega_width;
                        }
                        if (value) {
                            $submenu.initMegamenuPositionWidth(model, 'fullwidth');
                        }
                        else {
                            $submenu.initMegamenuPositionWidth(model, submenuWidth);
                            if (level == 1 && (navSettings.main.type == 'standard' || navSettings.main.type == 'top' || navSettings.main.type == 'bottom')) {
                                $submenu.alignSubmenu(model, settings.submenu.horizontal_align);
                            }
                        }
                    }
                    break;
                case 'mega_width':
                    if (settings.type === 'mega' && ((settings.submenu.disable_width && !settings.submenu.submenu_fullwidth) || (!settings.submenu.disable_width && !navSettings.mega_submenu.fullwidth))) {
                        var submenuWidth = value;
                        if (!settings.submenu.disable_width) {
                            submenuWidth = navSettings.mega_submenu.mega_width;
                        }
                        $submenu.initMegamenuPositionWidth(model, submenuWidth);
                        if (level == 1 && (navSettings.main.type == 'standard' || navSettings.main.type == 'top' || navSettings.main.type == 'bottom')) {
                            $submenu.alignSubmenu(model, settings.submenu.horizontal_align);
                        }
                        if ($submenu.find('.awemenu-submenu').length && isChange) {
                            $submenu.resetAllSubmenuPosition();
                        }
                    }
                    break;
                case 'dropdown_width':
                    if (settings.type === 'list') {
                        if (!settings.submenu.disable_width)
                            value = navSettings.flyout_submenu.dropdown_width;
                        $submenu.css('width', value);
                        if ($submenu.find('.awemenu-submenu').length && isChange) {
                            $submenu.resetAllSubmenuPosition();
                        }
                    }
                    break;
                case 'disable_height':
                    if (settings.type === 'mega') {
                        var set_height = void 0, mega_height = void 0;
                        if (value) {
                            set_height = settings.submenu.set_height;
                            mega_height = parseInt(settings.submenu.mega_height);
                        }
                        else {
                            set_height = navSettings.mega_submenu.set_height;
                            mega_height = parseInt(navSettings.mega_submenu.mega_height);
                        }
                        setHeightSubmenu($submenu, set_height, mega_height);
                    }
                    break;
                case 'set_height':
                    if (settings.type === 'mega' && settings.submenu.disable_height && (value !== 'auto' || isChange !== undefined)) {
                        var mega_height = parseInt(settings.submenu.mega_height);
                        setHeightSubmenu($submenu, value, mega_height);
                    }
                    break;
                case 'mega_height':
                    if (settings.type === 'mega' && settings.submenu.disable_height && isChange !== undefined) {
                        setHeightSubmenu($submenu, settings.submenu.set_height, parseInt(value));
                    }
                    break;
                case 'horizontal_align':
                    if (level == 1 && (navSettings.main.type == 'standard' || navSettings.main.type == 'top' || navSettings.main.type == 'bottom')) {
                        $submenu.removeClass(prevVal).addClass(value);
                        if (!value) {
                            var default_align = (navSettings.main.direction === 'ltr') ? 'align-left' : 'align-right';
                            $submenu.addClass(default_align);
                        }
                        $submenu.alignSubmenu(model, value);
                    }
                    break;
                case 'vertical_align':
                    if (level > 1 || !(navSettings.main.type == 'standard' || navSettings.main.type == 'top' || navSettings.main.type == 'bottom')) {
                        $submenu.removeClass(prevVal).addClass(value);
                        $submenu.alignVerticalSubmenu(value, level);
                        //if(!MDJsCore.isWriteSubmenuAll){                        
                        $submenu.alignVerticalSubmenuChildAll();
                    }
                    break;
                case 'submenu_position':
                    if (!(level == 1 || jQuery.inArray(navSettings.main.type, ['standard', 'top', 'bottom']) == -1)) {
                        var direction = navSettings.main.direction;
                        if ((value == 'left' && direction == 'ltr') || (value == 'right' && direction == 'rtl')) {
                            $item.addClass('awemenu-invert');
                        }
                        else {
                            $item.removeClass('awemenu-invert');
                        }
                        if (prevVal)
                            $submenu.removeClass('position-' + prevVal);
                        $submenu.addClass('position-' + value);
                        // events change submenu position
                        var datamenu = model.toJSON();
                        datamenu.realSettings = model.getRealSettings();
                        $submenu.resetArrowSubmenu(datamenu);
                        if ($submenu.find('.awemenu-submenu').length && isChange) {
                            $submenu.resetAllSubmenuPosition({ active: 1 });
                        }
                    }
                    break;
            }
        };
        /**
         * overrides renderSettingsChange() method
         */
        MenuView.prototype.renderSettingsChange = function (selector, value, prevSettings, inlineCss) {
            if (selector !== undefined) {
                // implements parent method
                _super.prototype.renderSettingsChange.call(this, selector, value, prevSettings, inlineCss);
                // render custom settings change
                if (selector.indexOf('.settings')) {
                    var _self = this, model = this.model, selectorArray = selector.split('.'), last = selectorArray.pop(), settingName = jQuery.inArray(last, [AweBuilder.RES_XS, AweBuilder.RES_SM, AweBuilder.RES_MD, AweBuilder.RES_LG, AweBuilder.RES_XL]) === -1 ? last : selectorArray.pop();
                    switch (settingName) {
                        case 'classes':
                            var currentClasses = _self.model.getSettingsAttr(selector, prevSettings);
                            _self.$el.removeClass(currentClasses).addClass(value);
                            break;
                        case 'id':
                            if (value)
                                _self.$el.attr('id', value);
                            else
                                _self.$el.removeAttr('id');
                            break;
                        default:
                            var defaultVal = (selector.indexOf('.submenu.') !== -1) ? DEFAULT_SETTINGS_MENU.submenu[settingName] : DEFAULT_SETTINGS_MENU[settingName], prevVal = model.getSettingsAttr(selector, prevSettings);
                            if (prevVal === undefined)
                                prevVal = defaultVal;
                            _self.setDataMenuToView();
                            _self.renderOneSetting(settingName, value, prevVal, true);
                    }
                }
            }
        };
        // listen menu box change settings
        MenuView.prototype.listenMenuBoxChange = function (model, options) {
            var _self = this;
            jQuery.map(model.changed, function (value, attrName) {
                if (attrName === 'settings') {
                    var prevSettings = model.parseJSON(model.previous('settings'));
                    _self.renderSettingsChangeByDefault(options.selector, options.value, prevSettings, options.inlineCss);
                }
            });
        };
        MenuView.prototype.renderSettingsChangeByDefault = function (selector, value, prevSettings, inlineCss) {
            function setHeightSubmenu($submenu, set_height, mega_height) {
                switch (set_height) {
                    case 'auto':
                        $submenu.css({ 'height': '', 'max-height': '', 'overflow-y': '' });
                        break;
                    case 'fixed':
                        $submenu.css({ 'height': (mega_height + 'px'), 'max-height': '', 'overflow-y': '' });
                        break;
                    case 'max':
                        $submenu.css({ 'height': '', 'max-height': (mega_height + 'px'), 'overflow-y': 'auto' });
                        break;
                }
            }
            if (selector !== undefined) {
                // render custom settings change
                if (selector.indexOf('.settings')) {
                    var _self = this, model = this.model, level = model.get('level'), settings = model.getRealSettings(), navSettings = model.getBuilder().content.getRealSettings(), $item = this.$el, $submenu = jQuery('> .awemenu-submenu', $item), selectorArray = selector.split('.'), last = selectorArray.pop(), settingName = jQuery.inArray(last, [AweBuilder.RES_XS, AweBuilder.RES_SM, AweBuilder.RES_MD, AweBuilder.RES_LG, AweBuilder.RES_XL]) === -1 ? last : selectorArray.pop();
                    var defaultVal = AweBuilder.DEFAULT_SETTINGS_MENU_BOX[selectorArray[0]][settingName], prevVal = model.getSettingsAttr(selector, prevSettings);
                    if (prevVal === undefined)
                        prevVal = defaultVal;
                    switch (settingName) {
                        case 'mega_width':
                        case 'fullwidth':
                            if (!settings.submenu.disable_width) {
                                $submenu.initMegamenuPositionWidth(model);
                                if (level == 1 && jQuery.inArray(navSettings.main.type, ['standard', 'top', 'bottom'])) {
                                    $submenu.alignSubmenu(model, settings.submenu.horizontal_align);
                                }
                                $submenu.resetAllSubmenuPosition();
                            }
                            break;
                        case 'dropdown_width':
                            if (!settings.submenu.disable_width) {
                                $submenu.css('width', value);
                            }
                            $submenu.resetAllSubmenuPosition();
                            break;
                        case 'text_align':
                            if (settings.text_align === 'default') {
                                if ((selectorArray[0] == 'top_items' && level == 1) || (selectorArray[0] === 'flyout_submenu' && level > 1)) {
                                    _self.renderOneSetting(settingName, value, prevVal, true);
                                }
                            }
                            break;
                        case 'item_type':
                            if (settings.item_type == 'default' || !settings.item_type) {
                                if ((selectorArray[0] === 'top_items' && level == 1) || (selectorArray[0] === 'flyout_submenu' && level > 1))
                                    $item.find('> a').removeClass('awemenu-' + prevVal).addClass('awemenu-' + value);
                            }
                            break;
                        case 'set_height':
                        case 'mega_height':
                            if (settings.type == 'mega' && !settings.submenu.disable_height) {
                                setHeightSubmenu($submenu, navSettings.mega_submenu.set_height, parseInt(navSettings.mega_submenu.mega_height));
                            }
                            break;
                        case 'animation_type':
                            if (settings.submenu.animation_type == 'default' && settings.type != 'normal') {
                                $item.removeClass('awemenu-' + prevVal).addClass('awemenu-' + value);
                                $submenu.attr('data-animation', value);
                            }
                            break;
                    }
                }
            }
        };
        MenuView.prototype.initEditTtitle = function () {
            var _self = this;
            jQuery('.awemenu-item-text', this.$el).mousedown(function (event) {
                var $title = jQuery(this);
                $title.data('beforeChange', $title.text());
            }).bind('blur', function (event) {
                var $title = jQuery(this), prevText = $title.data('beforeChange'), afterText = $title.text();
                if (prevText !== afterText)
                    _self.model.set('title', afterText);
            }).bind('keydown', function (event) {
                var key = event.which | event.keyCode;
                if (key === 13 || key === 27) {
                    event.preventDefault();
                    // revert content if press esc key
                    if (key === 27) {
                        var $title = jQuery(this), beforeChangedText = $title.data('beforeChange');
                        $title.text(beforeChangedText);
                    }
                    jQuery(this).trigger('blur');
                }
            });
        };
        return MenuView;
    }(AweBuilder.ContentObjectView));
    AweBuilder.MenuView = MenuView;
    var MenuNavigatorView = (function (_super) {
        __extends(MenuNavigatorView, _super);
        function MenuNavigatorView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides onTitleMousedown() method
         */
        MenuNavigatorView.prototype.onTitleMouseDown = function (event, showPanel) {
            _super.prototype.onTitleMouseDown.call(this, event, showPanel);
            if (!event.isTrigger) {
                this.model.getView().showSubmenu();
                AweBuilder.activeMenuModel = this.model;
            }
        };
        return MenuNavigatorView;
    }(AweBuilder.NavigatorView));
    AweBuilder.MenuNavigatorView = MenuNavigatorView;
    /**
     * Define collection of menu class
     */
    var Menus = (function (_super) {
        __extends(Menus, _super);
        /**
         * constructor to set default model is Menu
         * @param models
         * @param options
         */
        function Menus(models, options) {
            // set default model type of collection is menu
            if (options === undefined || options.model === undefined)
                options = jQuery.extend(true, {}, options, { model: Menu });
            // init models default
            if (models === undefined || models.length === 0) {
                //let firstMenu = new Menu();                            
                //models = [firstMenu];
                // not create any available  menu 
                models = [];
            }
            // implements parent method
            _super.call(this, models, options, '');
        }
        /**
         * overrides createView() method
         */
        Menus.prototype.createView = function () {
            // create view for menus
            this.view = new MenusView({
                collection: this,
                className: this.className,
                tagName: 'ul'
            });
        };
        /**
         * overrides clone() method
         */
        Menus.prototype.clone = function () {
            var models = [];
            jQuery.each(this.models, function () {
                models.push(this.clone());
            });
            return new Menus(models);
        };
        return Menus;
    }(AweBuilder.ContentObjects));
    AweBuilder.Menus = Menus;
    /**
     * Define view class for menu collection
     */
    var MenusView = (function (_super) {
        __extends(MenusView, _super);
        function MenusView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize() method
         */
        MenusView.prototype.initialize = function (options) {
            // implements parent method
            _super.prototype.initialize.call(this, options);
            this.setAllowUpdateDeleteBtn(true);
        };
        /**
         * init sortable for object view in builder frame
         */
        MenusView.prototype.initSort = function () {
            var level = 0, machineName = this.collection.getContainer().machineName, axis = false;
            if (this.collection.length)
                level = this.collection.models[0].get('level');
            if (machineName == 'menubox')
                level = 1;
            else
                level = 2;
            if (level > 1)
                axis = 'y';
            else {
                var menuType = this.collection.getContainer().getSettingsAttr('main.settings.type');
                if (level == 1 && jQuery.inArray(menuType, ['top', 'standard', 'bottom']) > -1)
                    axis = 'x';
                else
                    axis = 'y';
            }
            _super.prototype.initSort.call(this, axis);
        };
        MenusView.prototype.beforeSort = function (event, ui) {
            _super.prototype.beforeSort.call(this, event, ui);
            ui.placeholder.addClass('awemenu-item');
        };
        /**
        * override method
        */
        MenusView.prototype.listenRemoveObject = function (object, collection, options) {
            if (options.action !== 'sort') {
                var content = object.get('content');
                // get id of childrent first
                if (content instanceof Menus && content.length) {
                    this.getAllMenuAndChildren(object);
                }
                AweBuilderSettings.listDeletedMenus.push(object.get('mid'));
            }
            _super.prototype.listenRemoveObject.call(this, object, collection, options);
        };
        MenusView.prototype.getAllMenuAndChildren = function (object) {
            var content = object.get('content'), _self = this;
            jQuery(content.models).each(function (key, item) {
                var contentChild = item.get('content');
                if (contentChild instanceof Menus && contentChild.length)
                    _self.getAllMenuAndChildren(item);
                AweBuilderSettings.listDeletedMenus.push(item.get('mid'));
            });
        };
        return MenusView;
    }(AweBuilder.ContentObjectsView));
    AweBuilder.MenusView = MenusView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: src/js/awe-builder/core/awe-menu-box.ts
 * Author: congnv
 * Website: http://megadrupal.com/
 * Created: 11/15/2016
 */
/// <reference path="./awe-content-object.ts"/>
/// <reference path="./awe-menu.ts" />
var AweBuilder;
(function (AweBuilder) {
    AweBuilder.DEFAULT_SETTINGS_MENU_BOX = {
        main: {
            'type': 'standard',
            skin: 'default',
            skin_color: 'color-1',
            direction: 'ltr',
            trigger_override: 'hover',
            enable_sticky: false,
            sticky_offset: 0,
            show_scroll_up: false,
            hover_time: 0,
            animation_type: 'fadeup',
            animation_duration: 300,
            enable_arrow_desktop: true,
            enable_mobile: false,
            m_type: 'standard',
            mobile_animation_duration: 500,
            responsive_width: 768,
            enable_arrow_mobile: true,
            mobile_trigger: 'click'
        },
        menu_bar: {
            container: 'nav',
            fullwidth: false,
            menubar_width: 1170
        },
        top_items: {
            text_align: 'default',
            item_type: 'text-only'
        },
        mega_submenu: {
            fullwidth: true,
            mega_width: 600,
            set_height: 'auto',
            mega_height: 400
        },
        flyout_submenu: {
            dropdown_width: 250,
            text_align: 'default',
            item_type: 'text-only'
        }
    };
    var themes = {
        default: ['awemenu_standard', 'awemenu_left_right', 'awemenu_outleft_outright', 'awemenu-fullscreen'],
        classic: ['awemenu_standard', 'awemenu_left_right', 'awemenu_outleft_outright', 'awemenu-fullscreen']
    };
    /**
     * Define class to load library is used
     */
    var Frontend = {
        addCSSFiles: function (files) {
            jQuery.each(files, function () {
                var $link = jQuery('<link type="text/css" rel="stylesheet" href=""/>');
                $link.attr('href', this);
                AweBuilder._jQuery('head').append($link);
            });
        },
        addJSFiles: function (files, name, callback) {
            // add js file to iframe document
            jQuery.each(files, function () {
                var $script = jQuery('<script type="text/javascript" rel="stylesheet" src=""></script>');
                $script.attr('src', this);
                AweBuilder._jQuery('head').append($script);
            });
        }
    };
    var MenuBox = (function (_super) {
        __extends(MenuBox, _super);
        /**
         * Overrides constructor to define default attributes for menubox
         * @param options
         */
        function MenuBox(options) {
            this.listSkinFiles = {};
            this.listSkin = {
                'default': 'Default',
                'classic': 'Classic'
            };
            var skinURL = AweBuilderSettings.skinURL || 'libraries/awemenu/themes', megamenuSkin = AweBuilderSettings.megamenuSkin, _self = this;
            // add skin from theme
            if (megamenuSkin && megamenuSkin['data']) {
                for (var key in megamenuSkin['data']) {
                    this.listSkin[key] = megamenuSkin['data'][key]['name'];
                }
            }
            // add files to skin            
            var _loop_3 = function(key) {
                _self.listSkinFiles[key] = { 'skin': [], 'color': [] };
                if (jQuery.inArray(key, ['default', 'classic']) >= 0) {
                    // default skin
                    jQuery(themes[key]).each(function () {
                        _self.listSkinFiles[key]['skin'].push(skinURL + '/' + key + '/' + this + '.css');
                    });
                    for (var i = 1; i <= 8; i++) {
                        _self.listSkinFiles[key]['color'][i] = skinURL + '/' + key + '/colors/color-' + i + '.css';
                    }
                }
                else {
                    // skin from theme
                    jQuery(megamenuSkin['data'][key]['skin']).each(function () {
                        _self.listSkinFiles[key]['skin'].push('/' + megamenuSkin['skinURL'] + '/' + this);
                    });
                    if (megamenuSkin['data'][key]['color']) {
                        jQuery(megamenuSkin['data'][key]['color']).each(function (index, file) {
                            _self.listSkinFiles[key]['color'][index + 1] = '/' + megamenuSkin['skinURL'] + '/' + file;
                        });
                    }
                }
            };
            for (var key in this.listSkin) {
                _loop_3(key);
            }
            // generate default data structure for menubox object            
            var defaultSettings = AweBuilder.ContentObject.generateObjectSettings('menubox', {
                main: {
                    title: 'Menu settings',
                    animation: false,
                    style: false,
                    settings: {
                        'type': {
                            type: 'select',
                            title: 'Menu type',
                            inlineTitle: true,
                            options: {
                                'standard': 'Standard',
                                'top': 'Top',
                                'bottom': 'Bottom',
                                'left': 'Left',
                                'right': 'Right',
                                'outleft': 'Outleft',
                                'outright': 'Outright'
                            },
                            customStyles: {
                                '.ac_panel-item-general__content': { 'padding-left': '100px' }
                            },
                            defaultValue: 'standard'
                        },
                        skin: {
                            type: 'select',
                            title: 'Menu skin',
                            inlineTitle: true,
                            options: this.listSkin,
                            customStyles: {
                                '.ac_panel-item-general__content': { 'padding-left': '100px' }
                            },
                            defaultValue: 'default'
                        },
                        skin_color: {
                            type: 'select',
                            title: 'Skin color',
                            inlineTitle: true,
                            options: {
                                '1': 'Color 1',
                                '2': 'Color 2',
                                '3': 'Color 3',
                                '4': 'Color 4',
                                '5': 'Color 5',
                                '6': 'Color 6',
                                '7': 'Color 7',
                                '8': 'Color 8'
                            },
                            customStyles: {
                                '.ac_panel-item-general__content': { 'padding-left': '100px' }
                            },
                            defaultValue: 'color-1'
                        },
                        /* direction: {
                            type: 'select',
                            title: 'Direction',
                            inlineTitle: true,
                            options: {
                                'ltr': 'Left to Right',
                                'rtl': 'Right to Left'
                            },
                            customStyles: {
                                '.ac_panel-item-general__content': {'padding-left': '100px'}
                            },
                            defaultValue: 'ltr'
                        }, */
                        trigger_override: {
                            type: 'select',
                            title: 'Trigger',
                            inlineTitle: true,
                            options: {
                                'click': 'Click',
                                'hover': 'Hover',
                                'toggle': 'Toggle'
                            },
                            customStyles: {
                                '.ac_panel-item-general__content': { 'padding-left': '100px' }
                            },
                            defaultValue: 'hover',
                            change: function ($panel, $el, value, elementData) {
                                if (value.current == 'hover')
                                    jQuery('.el-hover_time', $panel).show();
                                else
                                    jQuery('.el-hover_time', $panel).hide();
                            }
                        },
                        hover_time: {
                            type: 'ranger',
                            title: 'Hover delay',
                            min: 0,
                            max: 2000,
                            unit: 'ms',
                            widthNumber: 2,
                            defaultValue: 0,
                            devices: false
                        },
                        enable_sticky: {
                            type: 'toggle',
                            title: 'Enable sticky',
                            defaultValue: false,
                            devices: false,
                            inlineTitle: true,
                            change: function ($panel, $el, value, elementData) {
                                if (value.current)
                                    jQuery('.el-sticky_offset, .el-show_scroll_up', $panel).show();
                                else
                                    jQuery('.el-sticky_offset, .el-show_scroll_up', $panel).hide();
                            }
                        },
                        sticky_offset: {
                            type: 'ranger',
                            title: 'Sticky offset',
                            min: 0,
                            max: 500,
                            step: 5,
                            unit: 'px',
                            widthNumber: 2,
                            defaultValue: 0,
                            devices: false
                        },
                        show_scroll_up: {
                            type: 'toggle',
                            title: 'Only show when scroll up',
                            defaultValue: false,
                            devices: false,
                            inlineTitle: true
                        },
                        enable_arrow_desktop: {
                            type: 'toggle',
                            title: 'Enable arrow for desktop',
                            defaultValue: true,
                            devices: false,
                            inlineTitle: true
                        },
                        animation_type: {
                            type: 'select',
                            title: 'Animation',
                            inlineTitle: true,
                            options: {
                                'none': 'None',
                                'fade': 'Fade',
                                'fadeup': 'Fade Up',
                                'fadedown': 'Fade Down',
                                'fadeleft': 'Fade Left',
                                'faderight': 'Fade Right',
                                'fadeskew': 'Fade skew',
                                'zoom': 'Zoom',
                                'rotateupleft': 'Rotate Left',
                                'rotateupright': 'Rotate Right',
                                'flipx': 'FlipX',
                                'flipy': 'FlipY',
                                'flipyright': 'FlipY Right',
                                'flipyleft': 'FlipY Left',
                                'slideleft': 'Slide Left',
                                'slideright': 'Slide Right',
                                'scaleup': 'Scale Up'
                            },
                            customStyles: {
                                '.ac_panel-item-general__content': { 'padding-left': '100px' }
                            },
                            defaultValue: 'fadeup'
                        },
                        animation_duration: {
                            type: 'ranger',
                            title: 'Duration',
                            min: 0,
                            max: 2000,
                            step: 10,
                            unit: 'ms',
                            widthNumber: 2,
                            defaultValue: 300,
                            devices: false
                        },
                        enable_mobile: {
                            type: 'toggle',
                            title: 'Enable mobile menu',
                            defaultValue: false,
                            devices: false,
                            inlineTitle: true,
                            change: function ($panel, $el, value, elementData) {
                                if (value.current)
                                    jQuery('.el-mobile_region', $panel).show();
                                else
                                    jQuery('.el-mobile_region', $panel).hide();
                            }
                        },
                        mobile_region: {
                            type: 'group',
                            title: 'Mobile settings',
                            useParentKey: true,
                            elements: {
                                m_type: {
                                    type: 'select',
                                    title: 'Mobile type',
                                    inlineTitle: true,
                                    options: {
                                        'standard': 'Standard',
                                        'top': 'Top',
                                        'bottom': 'Bottom'
                                    },
                                    customStyles: {
                                        '.ac_panel-item-general__content': { 'padding-left': '100px' }
                                    },
                                    defaultValue: 'standard'
                                },
                                responsive_width: {
                                    type: 'ranger',
                                    title: 'Responsive width',
                                    min: 200,
                                    max: 1500,
                                    step: 10,
                                    unit: 'px',
                                    widthNumber: 2,
                                    defaultValue: 768,
                                    devices: false
                                },
                                mobile_trigger: {
                                    type: 'select',
                                    title: 'Trigger',
                                    inlineTitle: true,
                                    options: {
                                        'click': 'Click',
                                        'hover': 'Hover',
                                        'toggle': 'Toggle'
                                    },
                                    customStyles: {
                                        '.ac_panel-item-general__content': { 'padding-left': '100px' }
                                    },
                                    defaultValue: 'click'
                                },
                                enable_arrow_mobile: {
                                    type: 'toggle',
                                    title: 'Enable arrow for mobile',
                                    defaultValue: true,
                                    devices: false,
                                    inlineTitle: true
                                },
                                mobile_animation_duration: {
                                    type: 'ranger',
                                    title: 'Effect duration',
                                    min: 0,
                                    max: 2000,
                                    step: 10,
                                    unit: 'ms',
                                    widthNumber: 2,
                                    defaultValue: 300,
                                    devices: false
                                }
                            }
                        }
                    }
                },
                menu_bar: {
                    title: 'Menu bar',
                    selector: '.awemenu-container',
                    animation: false,
                    style: {
                        enabled: ['font', 'background', 'border', 'padding', 'margin'],
                        status: ['normal']
                    },
                    settings: {
                        container: {
                            type: 'select',
                            title: 'Container tag',
                            inlineTitle: true,
                            options: {
                                'nav': 'nav',
                                'div': 'div'
                            },
                            customStyles: {
                                '.ac_panel-item-general__content': { 'padding-left': '100px' }
                            },
                            defaultValue: 'nav'
                        },
                        fullwidth: {
                            type: 'toggle',
                            title: 'Full width',
                            defaultValue: false,
                            devices: false,
                            inlineTitle: true,
                            change: function ($panel, $el, value, elementData) {
                                if (value.current)
                                    jQuery('.el-menubar_width', $panel).hide();
                                else
                                    jQuery('.el-menubar_width', $panel).show();
                            }
                        },
                        menubar_width: {
                            type: 'ranger',
                            title: 'Menubar width',
                            min: 200,
                            max: 1500,
                            step: 10,
                            unit: 'px',
                            widthNumber: 2,
                            defaultValue: 1170,
                            devices: false
                        }
                    }
                },
                top_items: {
                    title: 'Top items',
                    selector: 'ul.awemenu > .awemenu-item > a',
                    animation: false,
                    style: {
                        enabled: ['font', 'background', 'border', 'padding', 'margin'],
                        status: ['normal', 'hover', 'active']
                    },
                    settings: {
                        text_align: {
                            type: 'select',
                            title: 'Item text align',
                            inlineTitle: true,
                            options: {
                                'default': 'Default',
                                'left': 'Left',
                                'center': 'Center',
                                'right': 'Right'
                            },
                            customStyles: {
                                '.ac_panel-item-general__content': { 'padding-left': '100px' }
                            },
                            defaultValue: 'default'
                        },
                        item_type: {
                            type: 'select',
                            title: 'Item type',
                            inlineTitle: true,
                            options: {
                                'text-only': 'Text only',
                                'icon-only': 'Icon only',
                                'icon-text': 'Icon + text'
                            },
                            customStyles: {
                                '.ac_panel-item-general__content': { 'padding-left': '100px' }
                            },
                            defaultValue: 'text-only'
                        }
                    }
                },
                mega_submenu: {
                    title: 'Mega submenu',
                    selector: '.awemenu-megamenu',
                    animation: false,
                    style: {
                        enabled: ['font', 'background', 'border', 'padding', 'shadow'],
                        status: ['normal']
                    },
                    settings: {
                        fullwidth: {
                            type: 'toggle',
                            title: 'Full width',
                            defaultValue: true,
                            devices: false,
                            inlineTitle: true,
                            change: function ($panel, $el, value, elementData) {
                                if (value.current)
                                    jQuery('.el-mega_width', $panel).hide();
                                else
                                    jQuery('.el-mega_width', $panel).show();
                            }
                        },
                        mega_width: {
                            type: 'ranger',
                            title: 'Width',
                            min: 200,
                            max: 1500,
                            step: 10,
                            unit: 'px',
                            widthNumber: 2,
                            defaultValue: 600,
                            devices: false
                        },
                        set_height: {
                            type: 'select',
                            title: 'Set max height',
                            inlineTitle: true,
                            options: {
                                'auto': 'Auto',
                                'fixed': 'Fixed',
                                'max': 'Max height'
                            },
                            customStyles: {
                                '.ac_panel-item-general__content': { 'padding-left': '100px' }
                            },
                            defaultValue: 'auto',
                            change: function ($panel, $el, value, elementData) {
                                if (value.current === 'auto')
                                    jQuery('.el-mega_height', $panel).hide();
                                else
                                    jQuery('.el-mega_height', $panel).show();
                            }
                        },
                        mega_height: {
                            type: 'ranger',
                            title: 'Height',
                            min: 200,
                            max: 1500,
                            step: 10,
                            unit: 'px',
                            widthNumber: 2,
                            defaultValue: 400,
                            devices: false
                        }
                    }
                },
                flyout_submenu: {
                    title: 'Flyout submenu',
                    selector: '.awemenu-item .awemenu-item > a',
                    animation: false,
                    style: {
                        enabled: ['font', 'background', 'border', 'shadow'],
                        status: ['normal', 'hover', 'active']
                    },
                    settings: {
                        dropdown_width: {
                            type: 'ranger',
                            title: 'Width',
                            min: 200,
                            max: 1500,
                            step: 10,
                            unit: 'px',
                            widthNumber: 2,
                            defaultValue: 250,
                            devices: false
                        },
                        text_align: {
                            type: 'select',
                            title: 'Item text align',
                            inlineTitle: true,
                            options: {
                                'default': 'Default',
                                'left': 'Left',
                                'center': 'Center',
                                'right': 'Right'
                            },
                            customStyles: {
                                '.ac_panel-item-general__content': { 'padding-left': '100px' }
                            },
                            defaultValue: 'default'
                        },
                        item_type: {
                            type: 'select',
                            title: 'Item type',
                            inlineTitle: true,
                            options: {
                                'text-only': 'Text only',
                                'icon-only': 'Icon only',
                                'icon-text': 'Icon + text'
                            },
                            customStyles: {
                                '.ac_panel-item-general__content': { 'padding-left': '100px' }
                            },
                            defaultValue: 'text-only'
                        }
                    }
                }
            });
            // prepare default option settings
            if (options === undefined)
                options = {};
            if (options.settings === undefined) {
                options.settings = AweBuilder.Element.generateDefaultCustomSettings(defaultSettings);
            }
            if (options.title === undefined
                || jQuery.type(options.title) !== 'string'
                || options.title.trim() === '') {
                options.title = "Menu Box";
            }
            // only set indent  for menubox before create content
            this.indent = 1;
            if (options.content === undefined || (!(options.content instanceof AweBuilder.Menus) && !(options.content instanceof Array))) {
                options.content = new AweBuilder.Menus();
            }
            // set default part
            options.defaultPart = 'menu_bar';
            // set machine name is menubox
            options.machineName = 'menubox';
            // implements parent constructor
            _super.call(this, options);
            // set this menubox is container of menus collection in content
            this.get('content').setContainer(this);
        }
        /**
        * implements custom init
        */
        MenuBox.prototype.init = function () {
            AweBuilderSettings.listDeletedMenus = [];
        };
        /**
        * overrides createView() method to create view instance object for this model
        */
        MenuBox.prototype.createView = function () {
            // create view for menu item
            var tagName = this.getSettingsAttr('menu_bar.settings.container') || 'nav';
            this.view = new MenuBoxView({
                model: this,
                tagName: tagName
            });
        };
        /**
          * overrides getType() method
          */
        MenuBox.prototype.getType = function () {
            return 'menubox';
        };
        /**
         * overrides clone() method of backbone to clone elements collection
         * @returns {MenuBox}
         */
        MenuBox.prototype.clone = function () {
            var attr = this.toJSON();
            attr.content = this.get("content").clone();
            delete attr.cid;
            return new MenuBox(attr);
        };
        MenuBox.prototype.getRealSettings = function () {
            var main = this.getSettingsAttr('main.settings'), menu_bar = this.getSettingsAttr('menu_bar.settings'), top_items = this.getSettingsAttr('top_items.settings'), mega_submenu = this.getSettingsAttr('mega_submenu.settings'), flyout_submenu = this.getSettingsAttr('flyout_submenu.settings'), settings = { main: {}, menu_bar: {}, top_items: {}, mega_submenu: {}, flyout_submenu: {} };
            jQuery.extend(true, settings.main, AweBuilder.DEFAULT_SETTINGS_MENU_BOX.main, main);
            jQuery.extend(true, settings.menu_bar, AweBuilder.DEFAULT_SETTINGS_MENU_BOX.menu_bar, menu_bar);
            jQuery.extend(true, settings.top_items, AweBuilder.DEFAULT_SETTINGS_MENU_BOX.top_items, top_items);
            jQuery.extend(true, settings.mega_submenu, AweBuilder.DEFAULT_SETTINGS_MENU_BOX.mega_submenu, mega_submenu);
            jQuery.extend(true, settings.flyout_submenu, AweBuilder.DEFAULT_SETTINGS_MENU_BOX.flyout_submenu, flyout_submenu);
            return settings;
        };
        MenuBox.type = 'menubox';
        return MenuBox;
    }(AweBuilder.ContentObject));
    AweBuilder.MenuBox = MenuBox;
    /**
     * Define class View for MenuBox
     */
    var MenuBoxView = (function (_super) {
        __extends(MenuBoxView, _super);
        function MenuBoxView(attributes) {
            if (attributes == undefined || attributes.tagName == undefined || attributes.tagName == '')
                attributes.tagName = 'nav';
            _super.call(this, attributes);
        }
        /*
         * override method
         */
        MenuBoxView.prototype.getRenderControllersData = function () {
            return [
                {
                    name: 'edit',
                    title: this.translate('Edit'),
                    icon: 'pen'
                }
            ];
        };
        /* overrides events to implements dom event for menubox
        *
        */
        MenuBoxView.prototype.events = function () {
            return jQuery.extend(true, {}, _super.prototype.events.call(this), {
                'click .awemenu-bars': 'hideShowMenu'
            });
        };
        MenuBoxView.prototype.edit = function (event) {
            _super.prototype.edit.call(this, event);
            //this.$el.find('.awemenu-active').removeClass(awemenu-active);
        };
        /**
         * render view for menubox
         * @returns {MenuBoxView}
         */
        MenuBoxView.prototype.render = function () {
            // implements parent render method
            _super.prototype.render.call(this);
            var model = this.model, _self = this;
            settings = model.getRealSettings(),
                menusView = model.get('content').getView().$el,
                navClass = ['awemenu-nav', 'awemenu-' + settings.main.type, 'awemenu-' + settings.main.skin];
            var template = jQuery("<div class=\"awemenu-container js-awemenu-container\">\n                                        <div class=\"awemenu-bars\"><span class=\"amm-bar\"></span></div>\n                                    </div>");
            this.$el.addClass(navClass.join(' ')).append(template);
            this.$el.find('.js-awemenu-container').append(menusView).append('<div class="clear-both"></div>');
            this.$el.find('.js-awemenu-container > ul').addClass('awemenu');
            this.renderBoxAction();
            // render settings
            this.renderSettingBoxMenu(settings);
            //reset submenu
            setTimeout(function () {
                _self.$el.resetAllSubmenuPosition();
                // set position & width successfully, hide menu
                if (settings.main.type == 'outleft' || settings.main.type == 'outright')
                    _self.$el.removeClass('awemenu-active');
            }, 500);
            return this;
        };
        MenuBoxView.prototype.renderBoxAction = function () {
            var _self = this, _$ = AweBuilder._jQuery, template = jQuery("<div class=\"awemenu-box-action\">\n                                        <a class=\"ac-btn-action ac-btn-add js-btn-add-menu\" href=\"#\">Add menu</a>\n                                        <a class=\"ac-btn-action ac-btn-add js-btn-add-sub-menu\" href=\"#\">Add new submenu</a>\n                                        <a class=\"ac-btn-action ac-btn-add js-btn-add-sub-row\" href=\"#\">Add new row</a>\n                                    </div>");
            var time = setInterval(function () {
                if (_$('.awemenu-nav').length) {
                    clearInterval(time);
                    jQuery(template).insertBefore(_self.$el);
                    _$('.js-btn-add-menu').click(function () {
                        var menus = AweBuilderSettings.contentBuilder.get('content'), title = 'Menu item ' + (menus.length + 1), menuItem = new AweBuilder.Menu({ title: title, level: 1 });
                        menuItem.setNavigatorPanel(AweBuilderSettings.contentBuilder.getNavigatorPanel());
                        menuItem.setResponsiveMode(AweBuilderSettings.contentBuilder.responsiveMode);
                        menus.add(menuItem);
                    });
                    _$('.js-btn-add-sub-menu').click(function () {
                        if (AweBuilder.activeMenuModel) {
                            var model = AweBuilder.activeMenuModel, activeView = model.getView(), level = model.get('level');
                            if (activeView.$el.find('> .awemenu-dropdown:visible').length) {
                                var menus = model.get('content'), title = 'Menu item ' + (menus.length + 1), menuItem = new AweBuilder.Menu({ title: title, level: (level + 1) });
                                menuItem.setNavigatorPanel(model.getNavigatorPanel());
                                menuItem.setResponsiveMode(model.responsiveMode);
                                menus.add(menuItem);
                            }
                        }
                    });
                    _$('.js-btn-add-sub-row').click(function () {
                        if (AweBuilder.activeMenuModel) {
                            var model = AweBuilder.activeMenuModel, activeView = model.getView();
                            if (activeView.$el.find('> .awemenu-megamenu:visible').length) {
                                var sections = model.get('content'), title = 'Section ' + (sections.length + 1), section = new AweBuilder.Section({ title: title });
                                section.setNavigatorPanel(model.getNavigatorPanel());
                                section.setResponsiveMode(model.responsiveMode);
                                sections.add(section);
                            }
                        }
                    });
                }
            }, 500);
        };
        /**
         * override do nothing to prevent super class make default
         */
        MenuBoxView.prototype.renderContent = function () {
        };
        MenuBoxView.prototype.renderSettingBoxMenu = function (settings) {
            var _self = this, main = (settings.main ? settings.main : AweBuilder.DEFAULT_SETTINGS_MENU_BOX.main);
            for (var key in main) {
                _self.renderOneSetting(key, main[key]);
            }
            ;
        };
        MenuBoxView.prototype.renderOneSetting = function (key, value, prevVal, isChange) {
            if (value == prevVal) {
                return;
            }
            var model = this.model, _self = this, settings = model.getRealSettings(), _$ = AweBuilder._jQuery;
            switch (key) {
                case 'type':
                    if (prevVal) {
                        _self.$el.removeClass('awemenu-' + prevVal);
                    }
                    _self.$el.find('ul.awemenu').css('left', '');
                    _self.$el.addClass('awemenu-' + value);
                    if (isChange) {
                        //hide submenu
                        _self.$el.find('.awemenu-active').removeClass('awemenu-active');
                    }
                    // changge menu width
                    var menu_selector = _self.$el.find('.awemenu-container');
                    if (value === 'left' || value === 'right')
                        menu_selector.css('width', '');
                    else {
                        if (settings.menu_bar.fullwidth) {
                            menu_selector.outerWidth('100%');
                        }
                        else {
                            menu_selector.outerWidth(settings.menu_bar.menubar_width);
                            _self.renderFixStyleResponsive(settings.menu_bar.menubar_width);
                        }
                    }
                    // reset submenu                    
                    _self.$el.find('.awemenu-invert').removeClass('awemenu-invert');
                    // add class active to show menu to set position & width submenu
                    if (value == 'outleft' || value == 'outright')
                        this.$el.addClass('awemenu-active');
                    else
                        this.$el.removeClass('awemenu-active');
                    //self.setHeightTopItem(value);
                    if (isChange) {
                        _self.$el.resetAllSubmenuPosition({ active: 0 });
                    }
                    // show outleft/outright menu
                    //self.showOutMenu(value);
                    break;
                case 'skin':
                    var color = model.getSettingsAttr('main.settings.skin_color') || AweBuilder.DEFAULT_SETTINGS_MENU_BOX.main.skin_color;
                    //remove old skin
                    if (prevVal) {
                        jQuery(this.model.listSkinFiles[prevVal]['skin']).each(function () {
                            _$('link[href="' + this + '"]').remove();
                        });
                        if (this.model.listSkinFiles[prevVal]['color'][color])
                            _$('link[href="' + this.model.listSkinFiles[prevVal]['color'][color] + '"]').remove();
                    }
                    //add style
                    var listUrl_1 = [];
                    jQuery(this.model.listSkinFiles[value]['skin']).each(function () {
                        listUrl_1.push('[href="' + this + '"]');
                        Frontend.addCSSFiles([this]);
                    });
                    if (this.model.listSkinFiles[value]['color'][color])
                        Frontend.addCSSFiles([this.model.listSkinFiles[value]['color'][color]]);
                    _self.$el.removeClass('awemenu-' + prevVal + ' awemenu-' + prevVal + '-color-' + color).addClass('awemenu-' + value + ' awemenu-' + value + '-color' + color);
                    var countLoaded_1 = 0;
                    _$(listUrl_1.join(', ')).on('load', function () {
                        countLoaded_1++;
                        if (isChange && listUrl_1.length == countLoaded_1) {
                            _self.$el.resetAllSubmenuPosition();
                        }
                    }).on('error', function () {
                        countLoaded_1++;
                        if (isChange && listUrl_1.length == countLoaded_1) {
                            _self.$el.resetAllSubmenuPosition();
                        }
                    });
                    break;
                case 'skin_color':
                    var skin = settings.main.skin;
                    // remove old style
                    if (prevVal && this.model.listSkinFiles[skin]['color'][prevVal])
                        _$('link[href="' + this.model.listSkinFiles[skin]['color'][prevVal] + '"]').remove();
                    // add new style
                    if (value && this.model.listSkinFiles[skin]['color'][value]) {
                        Frontend.addCSSFiles([this.model.listSkinFiles[skin]['color'][value]]);
                        _self.$el.removeClass('awemenu-' + skin + '-color-' + prevVal).addClass('awemenu-' + skin + '-color-' + value);
                    }
                    break;
                case 'fullwidth':
                    if (settings.main.type === 'left' || settings.main.type === 'right')
                        _self.$el.find('> .awemenu-container ').css('width', '');
                    else {
                        if (value)
                            _self.$el.find('> .awemenu-container ').css('width', '100%');
                        else {
                            _self.$el.find('> .awemenu-container ').css('width', settings.menu_bar.menubar_width);
                            _self.renderFixStyleResponsive(settings.menu_bar.menubar_width);
                        }
                    }
                    break;
                case 'menubar_width':
                    if (settings.main.type === 'left' || settings.main.type === 'right')
                        _self.$el.find('> .awemenu-container ').css('width', '');
                    else if (!settings.menu_bar.fullwidth) {
                        _self.$el.find('> .awemenu-container ').css('width', value);
                        _self.renderFixStyleResponsive(value);
                    }
                    break;
                case 'direction':
                    if (value == 'rtl')
                        _$('body').attr('dir', value);
                    else
                        _$('body').removeAttr('dir', '');
                    _self.$el.removeClass('awemenu-' + prevVal).addClass('awemenu-' + value);
                    //_self.$el.resetAllSubmenuPosition();
                    break;
                case 'container':
                    if (isChange) {
                        _$('.awemenu-box-action').remove();
                        _self.model.createView();
                        var view = _self.model.getView();
                        _self.$el.before(view.$el).remove();
                        view.$el.addClass('ac_highlight js-active');
                        _self.destroy();
                    }
                    break;
                case 'enable_arrow_desktop':
                    if (value)
                        _self.$el.find('.awemenu-arrow').show();
                    else
                        _self.$el.find('.awemenu-arrow').hide();
                    if (isChange) {
                        _self.$el.resetAllSubmenuPosition();
                    }
                    break;
            }
        };
        MenuBoxView.prototype.renderFixStyleResponsive = function (width) {
            //remove old  style fix for responsive
            this.$el.find('.awemenu-container > style').remove();
            //add new style fix for responsive 
            var maxWidth = parseInt(width) + 'px';
            this.$el.find('.awemenu-container').append("<style>@media(max-width:" + maxWidth + "){.awemenu-standard .awemenu-container, .awemenu-top .awemenu-container, .awemenu-bottom .awemenu-container{width:100% !important;}}</style>");
        };
        /**
         * overrides renderSettingsChange() method
         */
        MenuBoxView.prototype.renderSettingsChange = function (selector, value, prevSettings, inlineCss) {
            if (selector !== undefined) {
                // implements parent method
                _super.prototype.renderSettingsChange.call(this, selector, value, prevSettings, inlineCss);
                // render custom settings change
                if (selector.indexOf('.settings')) {
                    var _self = this, model = this.model, selectorArray = selector.split('.'), last = selectorArray.pop(), settingName = jQuery.inArray(last, [AweBuilder.RES_XS, AweBuilder.RES_SM, AweBuilder.RES_MD, AweBuilder.RES_LG, AweBuilder.RES_XL]) === -1 ? last : selectorArray.pop(), _$_3 = AweBuilder._jQuery;
                    switch (settingName) {
                        case 'classes':
                            var currentClasses = _self.model.getSettingsAttr(selector, prevSettings);
                            _self.$el.removeClass(currentClasses).addClass(value);
                            break;
                        case 'id':
                            if (value)
                                _self.$el.attr('id', value);
                            else
                                _self.$el.removeAttr('id');
                            break;
                        default:
                            var defaultVal = AweBuilder.DEFAULT_SETTINGS_MENU_BOX[selectorArray[0]][settingName], prevVal = model.getSettingsAttr(selector, prevSettings);
                            if (prevVal === undefined)
                                prevVal = defaultVal;
                            _self.renderOneSetting(settingName, value, prevVal, true);
                    }
                }
            }
        };
        MenuBoxView.prototype.hideShowMenu = function () {
            if (this.$el.hasClass('awemenu-active'))
                this.$el.removeClass('awemenu-active');
            else
                this.$el.addClass('awemenu-active');
        };
        return MenuBoxView;
    }(AweBuilder.ContentObjectView));
    AweBuilder.MenuBoxView = MenuBoxView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: responsive-panel.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 05/31/2016
 */
/// <reference path="../../core/awe-panel.ts" />
/// <reference path="../../builder.ts" />
var AweBuilder;
(function (AweBuilder) {
    var ResponsivePanel = (function (_super) {
        __extends(ResponsivePanel, _super);
        /**
         * constructor()
         */
        function ResponsivePanel(builder) {
            var options = {
                settings: {
                    enableResize: false,
                    hideDefault: true
                }
            };
            _super.call(this, options);
            this.builder = builder;
        }
        /**
         * overrides createView() method
         */
        ResponsivePanel.prototype.createView = function () {
            this.view = new ResponsivePanelView({ model: this, className: 'ac_responsive-item' });
        };
        /**
         * reset panel
         */
        ResponsivePanel.prototype.reset = function () {
            this.view.close();
        };
        return ResponsivePanel;
    }(AweBuilder.Panel));
    AweBuilder.ResponsivePanel = ResponsivePanel;
    var ResponsivePanelView = (function (_super) {
        __extends(ResponsivePanelView, _super);
        function ResponsivePanelView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides renderContent() method
         */
        ResponsivePanelView.prototype.renderContent = function () {
            var contentTemplates = _.template("\n                <ul>\n                    <li class=\"js-device-mode active\" data-tooltip=\"" + this.translate('Extra Large') + "\" data-value=\"<%= exLargeValue %>\">\n                        <i class=\"acicon acicon-desktop\"></i>\n                    </li>\n                    <li class=\"js-device-mode\" data-tooltip=\"" + this.translate('Large') + "\" data-value=\"<%= largeValue %>\">\n                        <i class=\"acicon acicon-laptop\"></i>\n                    </li>\n                    <li class=\"js-device-mode\" data-tooltip=\"" + this.translate('Medium') + "\" data-value=\"<%= mediumValue %>\">\n                        <i class=\"acicon acicon-tablet ac-tablet-rotate\"></i>\n                    </li>\n                    <li class=\"js-device-mode\" data-tooltip=\"" + this.translate('Small') + "\" data-value=\"<%= smallValue %>\">\n                        <i class=\"acicon acicon-tablet\"></i>\n                    </li>\n                    <li class=\"js-device-mode\" data-tooltip=\"" + this.translate('Extra Small') + "\" data-value=\"<%= exSmallValue %>\">\n                        <i class=\"acicon acicon-phone\"></i>\n                    </li>\n                </ul>\n            "), translationTexts = {
                exLargeValue: AweBuilder.RES_XL,
                largeValue: AweBuilder.RES_LG,
                mediumValue: AweBuilder.RES_MD,
                smallValue: AweBuilder.RES_SM,
                exSmallValue: AweBuilder.RES_XS
            };
            jQuery('.js-ac-panel-body', this.$el).append(contentTemplates(translationTexts));
            // set width for panel
            this.$el.css({
                width: 80,
                minWidth: 0,
                height: 'auto',
                minHeight: 0
            });
        };
        /**
         * init events on panel
         */
        ResponsivePanelView.prototype.events = function () {
            return jQuery.extend(true, {}, _super.prototype.events.call(this), {
                'click li.js-device-mode': 'onSelectResponsiveMode'
            });
        };
        /**
         * handle select device mode
         */
        ResponsivePanelView.prototype.onSelectResponsiveMode = function (event) {
            event.preventDefault();
            event.stopPropagation();
            // call update responsive mode on builder object
            var $selected = jQuery(event.target).hasClass('js-device-mode') ? jQuery(event.target) : jQuery(event.target).parents('.js-device-mode'), $active = jQuery('.active.js-device-mode', this.$el), responsiveMode = $selected.attr('data-value');
            if (!$selected.is($active)) {
                this.model.builder.updateResponsiveMode(responsiveMode);
                $active.removeClass('active');
                $selected.addClass('active');
            }
        };
        /**
         * overrides close method
         */
        ResponsivePanelView.prototype.close = function (event) {
            // implements parent method
            _super.prototype.close.call(this, event);
            // set largest responsive mode
            jQuery('li.js-device-mode:first').trigger('click');
        };
        return ResponsivePanelView;
    }(AweBuilder.PanelView));
    AweBuilder.ResponsivePanelView = ResponsivePanelView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: src/js/awe-builder/panels/confirm/confirm-panel.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 07/12/2016
 */
/// <reference path="../../core/awe-panel.ts" />
var AweBuilder;
(function (AweBuilder) {
    var ConfirmPanel = (function (_super) {
        __extends(ConfirmPanel, _super);
        /**
         * constructor function
         */
        function ConfirmPanel(attributes) {
            if (attributes === undefined)
                attributes = {};
            attributes.settings = jQuery.extend(true, {}, attributes.settings, {
                enableResize: false,
                enableDrag: false,
                hideDefault: true,
                position: 'center',
                hasOverlay: true
            });
            _super.call(this, attributes);
        }
        /**
         * overrides createView() method
         */
        ConfirmPanel.prototype.createView = function () {
            this.view = new ConfirmPanelView({ model: this });
        };
        return ConfirmPanel;
    }(AweBuilder.Panel));
    AweBuilder.ConfirmPanel = ConfirmPanel;
    /**
     * Define view class for confirm panel
     */
    var ConfirmPanelView = (function (_super) {
        __extends(ConfirmPanelView, _super);
        function ConfirmPanelView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides renderContent() method
         */
        ConfirmPanelView.prototype.renderContent = function () {
            // implement parent method
            _super.prototype.renderContent.call(this);
            // render footer of panel with buttons
            var buttonsText = this.model.get('buttonsText'), cancelText = buttonsText && buttonsText.cancel ? buttonsText.cancel : 'Cancel', submitText = buttonsText && buttonsText.submit ? buttonsText.submit : 'OK';
            jQuery('.js-ac-panel-body', this.$el).after("\n                <div class=\"js-ac-panel-footer ac_panel__footer--2 pd15\">\n                    <div class=\"ac_row\">\n                        <div class=\"ac_1_col\">\n                            <div class=\"btn-group\">\n                                <a href=\"#\" class=\"js-cancel ac_btn ac_btn--2\">" + this.translate(cancelText) + "</a>\n                                <a href=\"#\" class=\"js-submit js-submit-not-save ac_btn ac_btn--1\">" + this.translate(submitText) + "</a>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            ").addClass('ac_panel__body--normal');
        };
        /**
         * overrides events() method
         */
        ConfirmPanelView.prototype.events = function () {
            return jQuery.extend(true, {}, _super.prototype.events.call(this), {
                'click a.js-cancel': 'onCancel',
                'click a.js-submit': 'onSubmit'
            });
        };
        /**
         * overrides close() method
         */
        ConfirmPanelView.prototype.close = function (event) {
            // implements parent method
            _super.prototype.close.call(this, event);
            // implements cancel callback
            var actions = this.model.get('actions');
            if (actions && actions.cancel && jQuery.type(actions.cancel) === 'function')
                actions.cancel();
        };
        /**
         * handle click to cancel button
         */
        ConfirmPanelView.prototype.onCancel = function (event) {
            if (event)
                event.preventDefault();
            // close panel
            this.close();
            // implements cancel callback
            var actions = this.model.get('actions');
            if (actions && actions.cancel && jQuery.type(actions.cancel) === 'function')
                actions.cancel();
        };
        /**
         * handle click to submit button
         */
        ConfirmPanelView.prototype.onSubmit = function (event) {
            if (event)
                event.preventDefault();
            // close panel
            this.close();
            // implements custom submit callback
            var actions = this.model.get('actions');
            if (actions && actions.submit && jQuery.type(actions.submit) === 'function')
                actions.submit();
        };
        /**
         * overrides updateContentSize() method
         */
        ConfirmPanelView.prototype.updateContentSize = function () {
            var headerHeight = jQuery('.js-ac-panel-header', this.$el).outerHeight(), bodyHeight = jQuery('.js-ac-panel-body', this.$el).outerHeight(), footerHeight = jQuery('.js-ac-panel-footer', this.$el).outerHeight(), height = headerHeight + bodyHeight + footerHeight + 16;
            this.$el.css({
                minHeight: height,
                height: height
            });
        };
        return ConfirmPanelView;
    }(AweBuilder.PanelView));
    AweBuilder.ConfirmPanelView = ConfirmPanelView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: src/js/awe-builder/panels/page-template/page-template.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 07/19/2016
 */
/// <reference path="../../core/awe-abstract.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var PageTemplate = (function (_super) {
        __extends(PageTemplate, _super);
        function PageTemplate() {
            _super.apply(this, arguments);
        }
        /**
         * overrides createView() method
         */
        PageTemplate.prototype.createView = function () {
            this.view = new PageTemplateView({ model: this });
        };
        return PageTemplate;
    }(AweBuilder.Abstract));
    AweBuilder.PageTemplate = PageTemplate;
    var PageTemplateView = (function (_super) {
        __extends(PageTemplateView, _super);
        function PageTemplateView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize method
         */
        PageTemplateView.prototype.initialize = function () {
            // render template
            this.render();
        };
        /**
         * overrides render() method
         */
        PageTemplateView.prototype.render = function () {
            var template = this.model.toJSON(), $template = jQuery("\n                    <div class=\"js-template-item item\">\n                        <a href=\"#\">\n                            <div class=\"img\">\n                                <img src=\"" + template.cover.url + "\" alt=\"\">\n                            </div>\n                            <div class=\"caption\">\n                                " + template.title + "\n                            </div>\n                            <textarea class=\"js-template-data\" style=\"display: none\"></textarea>\n                        </a>\n                    </div>\n                ");
            jQuery('textarea', $template).val(JSON.stringify(template.data));
            var filterClass = template.category ? " " + template.category.trim().toLowerCase().replace(/[^a-z0-9]/, '_') : 'custom';
            this.$el.append($template).addClass("grid-item " + filterClass);
            // handle hover template to process image size
            var _self = this;
            this.$el.mouseenter(function () {
                // process cover css
                var $cover = jQuery('img', this);
                if ($cover.height() / $cover.width() < 0.96)
                    $cover.css({ top: 0, transform: 'none' });
                // unbind event
                _self.$el.unbind('mouseenter');
            });
            return this;
        };
        return PageTemplateView;
    }(AweBuilder.AbstractView));
    AweBuilder.PageTemplateView = PageTemplateView;
    var PageTemplates = (function (_super) {
        __extends(PageTemplates, _super);
        /**
         * constructor function
         */
        function PageTemplates(models, options) {
            // prepare model type of collection is PageTemplate
            if (options === undefined)
                options = {};
            options.model = PageTemplate;
            // implements parent constructor
            _super.call(this, models, options);
        }
        /**
         * overrides initialize method
         */
        PageTemplates.prototype.initialize = function (models, options) {
            // init categories of templates
            this.categories = new Array();
            // implements parent method
            _super.prototype.initialize.call(this, models, options);
            // creat view for collection
            this.createView();
        };
        /**
         * overrides createView() method
         */
        PageTemplates.prototype.createView = function () {
            this.view = new PageTemplatesView({
                collection: this,
                className: 'ac_templates__grid-row'
            });
        };
        /**
         * get view object
         */
        PageTemplates.prototype.getView = function () {
            return this.view;
        };
        /**
         * add template categories
         */
        PageTemplates.prototype.addCategory = function (name) {
            if (jQuery.inArray(name, this.categories) === -1)
                this.categories.push(name);
        };
        /**
         * get categories of templates
         */
        PageTemplates.prototype.getCategories = function () {
            return this.categories;
        };
        return PageTemplates;
    }(Backbone.Collection));
    AweBuilder.PageTemplates = PageTemplates;
    var PageTemplatesView = (function (_super) {
        __extends(PageTemplatesView, _super);
        function PageTemplatesView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize() method
         */
        PageTemplatesView.prototype.initialize = function (options) {
            // init categories view object
            this.$categories = jQuery("\n                <ul class=\"js-page-templates-filter\">\n                    <li><a href=\"#\" data-filter=\"*\" class=\"current\">" + this.translate('Show all') + "</a></li>\n                </ul>");
            // listen change in collection
            this.listenTo(this.collection, 'add', this.listenAddTemplate);
            this.listenTo(this.collection, 'remove', this.listenRemoveTemplate);
            // implements render collection
            this.render();
            // set templates list in center of window
            var _self = this;
            jQuery(window).resize(function () {
                var windowWidth = jQuery(window).width(), templateWidth = jQuery('.grid-item:visible', _self.$el).outerWidth(true), itemsRow = Math.floor(windowWidth / templateWidth);
                if (windowWidth <= 1440)
                    jQuery('.js-page-templates', _self.$el).width(itemsRow * templateWidth).css('margin', '0 auto');
                else
                    jQuery('.js-page-templates', _self.$el).css({
                        width: '',
                        margin: ''
                    });
            }).trigger('resize');
        };
        /**
         * overrides render() method
         */
        PageTemplatesView.prototype.render = function () {
            var _self = this;
            // add wrapper 
            this.$el.append("<div class=\"js-page-templates ac_templates__grid\"></div>");
            // render templates item
            this.collection.each(function (template, index) {
                jQuery('.js-page-templates', _self.$el).append(template.getView().$el);
            });
            // init isotope plugin
            this.initIsotopePlugin();
            return this;
        };
        /**
         * init isotope plugin
         */
        PageTemplatesView.prototype.initIsotopePlugin = function (reload) {
            if (jQuery.fn.isotope) {
                if (!reload) {
                    jQuery('.js-page-templates', this.$el).isotope({
                        itemSelector: '.grid-item',
                        layoutMode: 'fitRows'
                    }).on('arrangeComplete', function () {
                        jQuery(window).trigger('resize');
                    });
                }
                else {
                    jQuery('.js-page-templates', this.$el).isotope('reloadItems').isotope({ sortBy: 'original-order' });
                }
            }
        };
        /**
         * implements change view when add new template
         */
        PageTemplatesView.prototype.listenAddTemplate = function (template, collection, options) {
            // add view of template
            jQuery('.js-page-templates', this.$el).append(template.getView().$el);
            // add new category view of template if not exist
            var category = template.get('category'), filter = category ? category.trim().toLowerCase().replace(/[^a-z0-9]/, '_') : 'custom';
            if (jQuery("li." + filter, this.$categories).length === 0) {
                this.$categories.append("<li class=\"" + filter + "\"><a href=\"#\" data-filter=\"." + filter + "\">" + this.translate(category) + "</a></li>");
            }
            // check to show added template by category
            if (options.activeFilter && options.activeFilter !== '*') {
                if (category !== options.activeFilter)
                    template.getView().$el.hide();
            }
            // reload isotope
            this.initIsotopePlugin(true);
        };
        /**
         * implements change view when template is removed from collection
         */
        PageTemplatesView.prototype.listenRemoveTemplate = function (template, collection, options) {
            // remove view of removed template
            template.getView().$el.remove();
            // reload isotope
            this.initIsotopePlugin(true);
        };
        /**
         * filter template
         */
        PageTemplatesView.prototype.filterTemplate = function (filter) {
            if (jQuery.fn.isotope)
                jQuery('.js-page-templates', this.$el).isotope({ filter: filter });
            else {
                if (filter === '*')
                    jQuery('.js-template-item', this.$el).fadeIn(300);
                else {
                    jQuery(".js-page-templatess > .grid-item" + filter, this.$el).fadeIn(300);
                    jQuery(".js-page-templates > .grid-item:not(" + filter + ")", this.$el).fadeOut(300);
                }
            }
        };
        return PageTemplatesView;
    }(AweBuilder.AbstractView));
    AweBuilder.PageTemplatesView = PageTemplatesView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: src/js/awe-builder/panels/page-template/page-template-panel.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 07/19/2016
 */
/// <reference path="./page-template.ts" />
var AweBuilder;
(function (AweBuilder) {
    var PageTemplatePanel = (function (_super) {
        __extends(PageTemplatePanel, _super);
        /**
         * constructor function
         */
        function PageTemplatePanel(closeCallback) {
            _super.call(this);
            this.closePanelCallback = closeCallback;
        }
        /**
         * implements init for panel object
         */
        PageTemplatePanel.prototype.init = function (options) {
            // init properties default value
            this.templates = new AweBuilder.PageTemplates();
            this.loading = false;
            this.loadMore = true;
            // load templates
            this.loadTemplates();
        };
        /**
         * load templates
         */
        PageTemplatePanel.prototype.loadTemplates = function (category, checkScroll) {
            if (!this.loading && this.loadMore) {
                // set loading flag
                this.loading = true;
                // request server to get templates 
                var _self_21 = this, extraData = {
                    requestAction: 'get',
                    from: this.templates.length,
                    length: 12,
                    type: 'page'
                }, postParams = AweBuilder.prepareAjaxParamenters('templates', extraData);
                jQuery.ajax({
                    url: postParams.url,
                    type: 'post',
                    data: postParams.data,
                    success: function (response) {
                        // reset loading flag
                        _self_21.loading = false;
                        // add templates to list templates
                        var data = typeof response === 'object' ? response : AweBuilder.parseJSON(response);
                        if (data && data.loadMore !== undefined && data.templates !== undefined) {
                            // set load infinitve flag
                            _self_21.loadMore = data.loadMore;
                            // add templates to content
                            _self_21.templates.add(data.templates, { activeFilter: category });
                        }
                        // check to load template to has scrollbar
                        if (checkScroll && jQuery(document).height() <= jQuery(window).height())
                            _self_21.loadTemplates();
                    }
                });
            }
        };
        /**
         * get templates in panel
         */
        PageTemplatePanel.prototype.getTemplates = function () {
            return this.templates;
        };
        /**
         * overrides createView() method
         */
        PageTemplatePanel.prototype.createView = function () {
            this.view = new PageTemplatePanelView({ model: this });
        };
        /**
         * implements close callback function
         */
        PageTemplatePanel.prototype.close = function (templateData) {
            this.closePanelCallback(templateData);
            this.view.hide();
        };
        /**
         * show view of panel
         */
        PageTemplatePanel.prototype.show = function () {
            // show view panel
            this.view.show();
        };
        /**
         * check all templates loaded
         */
        PageTemplatePanel.prototype.allTemplatesLoaded = function () {
            return !this.loadMore;
        };
        return PageTemplatePanel;
    }(AweBuilder.Abstract));
    AweBuilder.PageTemplatePanel = PageTemplatePanel;
    var PageTemplatePanelView = (function (_super) {
        __extends(PageTemplatePanelView, _super);
        function PageTemplatePanelView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize method
         */
        PageTemplatePanelView.prototype.initialize = function () {
            // implements render panel
            this.render();
        };
        /**
         * overrides render() method
         */
        PageTemplatePanelView.prototype.render = function () {
            // add html of panel
            this.$el.append("<div class=\"js-ptl-container ac_templates__container\">\n                    <div class=\"js-ptl-filters ac_templates__filters\">\n                        <h2 class=\"ac_templates__title\">" + this.translate('Pick a template') + "</h2>\n                    </div>\n                </div>")
                .addClass('js-page-template-panel ac_templates').css({
                display: 'none',
                zIndex: 999,
                minHeight: '100vh',
                position: 'relative'
            });
            // add list template
            var templates = this.model.getTemplates(), templatesView = templates.getView();
            jQuery('.js-ptl-filters', this.$el).append(templatesView.$categories);
            jQuery('.js-ptl-container', this.$el).append(templatesView.$el);
            return this;
        };
        /**
         * handle events in panel
         */
        PageTemplatePanelView.prototype.events = function () {
            return {
                'click .js-template-item > a': 'onClickTemplateItem',
                'click .js-page-templates-filter > li > a': 'filterByCategory'
            };
        };
        /**
         * handle click to template item
         */
        PageTemplatePanelView.prototype.onClickTemplateItem = function (event) {
            if (event)
                event.preventDefault();
            // implements close panel callback
            var data = AweBuilder.parseJSON(jQuery('.js-template-data', jQuery(event.target).parents('a:first')).val());
            this.model.close(data);
        };
        /**
         * handle click on filter category
         */
        PageTemplatePanelView.prototype.filterByCategory = function (event) {
            event.preventDefault();
            if (!jQuery(event.target).hasClass('current')) {
                // active selected filter
                jQuery('.js-page-templates-filter a.current').removeClass('current');
                jQuery(event.target).addClass('current');
                // show template item by filter
                var category = jQuery(event.target).attr('data-filter');
                // show template by filter
                var templates = this.model.getTemplates(), templatesView = templates.getView();
                templatesView.filterTemplate(category);
                if (category !== '*') {
                    // load template
                    this.model.loadTemplates(category, true);
                }
            }
        };
        /**
         * show template panel
         */
        PageTemplatePanelView.prototype.show = function () {
            // enable this element
            this.$el.show();
            // bind window scroll event to load templates
            jQuery(window).bind('scroll', jQuery.proxy(this.onWindowScroll, this));
            // get stickyPosition
            if (this.stickyPosition === undefined) {
                var _self_22 = this, waitPanelShow_1;
                waitPanelShow_1 = setInterval(function () {
                    if (_self_22.$el.is(':visible')) {
                        // stop interval
                        clearInterval(waitPanelShow_1);
                        // calculate sticky position
                        var $filterWrapper = jQuery('.js-page-templates-filter', _self_22.$el);
                        _self_22.stickyPosition = $filterWrapper.height() + $filterWrapper.offset().top;
                    }
                }, 100);
            }
        };
        /**
         * hide view of panel
         */
        PageTemplatePanelView.prototype.hide = function () {
            // disable view of pane;
            this.$el.hide();
            // unbind window scroll
            jQuery(window).unbind('scroll', jQuery.proxy(this.onWindowScroll, this));
        };
        /**
         * handle window scroll event to load infinitve templates
         */
        PageTemplatePanelView.prototype.onWindowScroll = function () {
            var scrollTop = jQuery(window).scrollTop(), windowHeight = jQuery(window).height(), docHeight = jQuery(document).height(), panel = this.model;
            // load new templates
            if (!panel.allTemplatesLoaded() && windowHeight + scrollTop > docHeight - 20) {
                panel.loadTemplates();
            }
            // process view of filter
            if (scrollTop >= this.stickyPosition)
                jQuery('.ac_templates__filters', this.$el).addClass('ac_templates__filters--sticky');
            else
                jQuery('.ac_templates__filters', this.$el).removeClass('ac_templates__filters--sticky');
        };
        return PageTemplatePanelView;
    }(AweBuilder.AbstractView));
    AweBuilder.PageTemplatePanelView = PageTemplatePanelView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: src/js/awe-builder/panels/icon-setting-panel.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 09/12/2016
 */
/// <reference path="../core/awe-panel.ts" />
var AweBuilder;
(function (AweBuilder) {
    var IconSettingPanel = (function (_super) {
        __extends(IconSettingPanel, _super);
        function IconSettingPanel() {
            var attributes = {
                title: 'Choose icon',
                settings: {
                    enableResize: false,
                    enableDrag: true,
                    hideDefault: true
                }
            };
            _super.call(this, attributes);
        }
        /**
         * overrides createView() method
         */
        IconSettingPanel.prototype.createView = function () {
            this.view = new IconSettingPanelView({ model: this });
        };
        /**
         * set active model
         */
        IconSettingPanel.prototype.setActiveModel = function (model, selector, position) {
            this.selector = selector;
            this.activeModel = model;
            this.view.open(undefined, position);
        };
        /**
         * get active model object
         */
        IconSettingPanel.prototype.getActiveModel = function () {
            return this.activeModel;
        };
        /**
         * set icon value to model
         */
        IconSettingPanel.prototype.setIcon = function (icon) {
            if (this.selector && this.activeModel)
                this.activeModel.setSettingsAttr(this.selector, icon);
        };
        /**
         * get icon in active model
         */
        IconSettingPanel.prototype.getIcon = function () {
            var icon = '';
            if (this.selector && this.activeModel)
                icon = this.activeModel.getSettingsAttr(this.selector);
            return icon;
        };
        return IconSettingPanel;
    }(AweBuilder.Panel));
    AweBuilder.IconSettingPanel = IconSettingPanel;
    var IconSettingPanelView = (function (_super) {
        __extends(IconSettingPanelView, _super);
        function IconSettingPanelView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize() method
         */
        IconSettingPanelView.prototype.initialize = function () {
            var _self = this, elements = {
                icon: {
                    type: 'icon',
                    title: 'Choose icon',
                    showTabsOnly: true,
                    defaultValue: '',
                    change: function ($panel, el, values) {
                        _self.onIconChange(values);
                    }
                }
            };
            this.form = new AweBuilder.AweForm(elements);
            _super.prototype.initialize.call(this);
        };
        /**
         * overrides renderContent() method
         */
        IconSettingPanelView.prototype.renderContent = function () {
            jQuery('.js-ac-panel-body', this.$el).append(this.form.$el.addClass('pd15'));
            jQuery('.js-panel-inner', this.$el).append("\n                <div class=\"js-ac_panel__footer ac_panel__footer\" style=\"margin-top: 0;\">\n                    <div class=\"js-btn-group btn-group\" style=\"width: 210px; float: none\">\n                        <a href=\"#\" class=\"ac_btn js-btn-cancel ac_btn--2\">" + this.translate('Cancel') + "</a>\n                        <a href=\"#\" class=\"ac_btn js-btn-choose ac_btn--1 ac_disable\">" + this.translate('Choose') + "</a>\n                    </div>\n                </div>\n            ");
            this.$el.height(330).css('min-height', 330);
            var _self = this;
            jQuery('.js-btn-group > a', this.el).click(function (event) {
                event.preventDefault();
                if (jQuery(this).hasClass('js-btn-cancel')) {
                    _self.model.setIcon(_self.beforeChangeIcon);
                }
                _self.close();
            });
        };
        /**
         * overrides open() method
         */
        IconSettingPanelView.prototype.open = function (event, position) {
            this.beforeChangeIcon = this.model.getIcon();
            jQuery('.js-icon-item.active', this.el).removeClass('active');
            jQuery(".js-icon-item > i." + this.beforeChangeIcon.split(' ').join('.') + ":first", this.el).parent().addClass('active');
            // let _self = this;
            // if (position) {
            //     let left = position.center - _self.$el.width()/2;
            //     _self.$el.css({
            //         top: position.bottom,
            //         left: left < 0 ? 0 : left
            //     });
            // }
            _super.prototype.open.call(this, event, true);
        };
        /**
         * overrides close() method
         */
        IconSettingPanelView.prototype.close = function (event) {
            if (event)
                this.model.setIcon(this.beforeChangeIcon);
            _super.prototype.close.call(this, event);
        };
        /**
         * handle when icon is selected
         */
        IconSettingPanelView.prototype.onIconChange = function (values) {
            jQuery('.js-btn-choose', this.$el).removeClass('ac_disable');
            this.model.setIcon(values.current);
        };
        return IconSettingPanelView;
    }(AweBuilder.PanelView));
    AweBuilder.IconSettingPanelView = IconSettingPanelView;
})(AweBuilder || (AweBuilder = {}));
/**
 * File: builder.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 05/05/2016
 */
/// <reference path="core/awe-menu-box.ts"/>
/// <reference path="core/awe-section.ts"/>
/// <reference path="panels/navigator/navigator-panel.ts"/>
/// <reference path="panels/element/element-panel.ts"/>
/// <reference path="panels/responsive/responsive-panel.ts"/>
/// <reference path="panels/media/media-panel.ts"/>
/// <reference path="panels/save-template/save-template-panel.ts"/>
/// <reference path="panels/confirm/confirm-panel.ts"/>
/// <reference path="panels/page-template/page-template-panel.ts"/>
/// <reference path="panels/icon-setting-panel.ts"/>
var AweBuilder;
(function (AweBuilder) {
    var Builder = (function () {
        /**
         * constructor function
         */
        function Builder(options) {
            this.panels = {};
            this.content = [];
            this.elementsLoaded = false;
            this.allowBuildFromTemplate = true;
            this.changed = false;
            var wHeight = jQuery(window).height(), wWidth = jQuery(window).width();
            if (wHeight < 570 || wWidth < 1200)
                alert(window.aweTranslate("Sorry, Your browser size is too small, please try to increase to make Awecontent work."));
            this.panels = {};
            // load global settings
            this.settings = window.AweBuilderSettings.settings;
            // process options
            this.prepareProperties(options);
        }
        /**
         * prepare properties
         */
        Builder.prototype.prepareProperties = function (options) {
            // init class name for content if not set default is Sections
            this.contentClass = options.contentClass ? options.contentClass : 'Sections';
            // init content for builder
            if (options.content) {
                switch (typeof options.content) {
                    case 'string':
                        this.content = AweBuilder.parseJSON(options.content);
                        break;
                    case 'object':
                        this.content = options.content;
                        break;
                    case 'undefined':
                        this.content = {};
                        break;
                    default:
                        throw Error("AweBuilder does not support content option with type '" + jQuery.type(options.content) + "'");
                }
                if ((jQuery.type(this.content) === 'array' && this.content.length > 0) || Object.keys(this.content).length > 0)
                    this.allowBuildFromTemplate = false;
            }
            if (options.templateMode && options.templateMode.data !== undefined)
                this.content = options.templateMode.data;
            // set builder wrapper
            this.$wrapper = jQuery.type(options.wrapper) === 'string' ? jQuery(options.wrapper) : options.wrapper;
            if (this.$wrapper.length === 0) {
                jQuery('body').append('<div class="js-awecontent-wrapper"/>');
                this.$wrapper = jQuery('.js-awecontent-wrapper');
            }
            this.$wrapper.addClass('awecontent-wrapper').hide();
            // process tooltip settings
            if (this.settings && this.settings.showTooltips)
                this.$wrapper.addClass('ac_enable-tooltip');
            // init close callback property
            if (options && typeof options.onClose === 'function')
                this.onClose = options.onClose;
            // set onReady callback
            if (options && typeof options.onReady === 'function')
                this.onReady = options.onReady;
            // set options property
            this.options = options;
            // render toolbar and init
            var buildButtons = options.buildButtons ? options.buildButtons : undefined;
            this.renderToolbar(buildButtons);
        };
        /**
         * init panels
         */
        Builder.prototype.initPanels = function () {
            if (Object.keys(this.panels).length === 0) {
                // add spectrum container element
                jQuery('body').append('<div class="js-ac-spcontainers"></div>');
                // init panels
                this.initMediaPanel();
                this.initResponsivePanel();
                this.initCloseConfirmPanel();
                this.initElementsPanel();
                this.initSaveTemplatePanel();
                this.initNavigatorPanel(this.content);
                this.initIconSettingPanel();
                this.initSettingsPanel();
                // add panel to document and set builder object to panels
                var _self_23 = this;
                jQuery.map(this.panels, function (panel, name) {
                    // set builder object to panel
                    panel.setBuilder(_self_23);
                    // add panel view to document
                    var view = panel.getView();
                    _self_23.$wrapper.append(view.$el);
                });
            }
            else {
                // re-init navigator tab
                this.panels.navigator.setElements(this.content);
                // reset Responsive panel
                this.panels.responsive.reset();
            }
        };
        /**
         * initialize media panel
         */
        Builder.prototype.initMediaPanel = function () {
            this.panels['media'] = new AweBuilder.MediaPanel();
        };
        /**
         * init responsive panel
         */
        Builder.prototype.initResponsivePanel = function () {
            this.panels['responsive'] = new AweBuilder.ResponsivePanel(this);
        };
        /**
         * init responsive panel
         */
        Builder.prototype.initElementsPanel = function () {
            var elements = [], sectionTemplateMode = this.options.templateMode && this.options.templateMode.type === 'section';
            jQuery.map(window.AweBuilderSettings.elements, function (element, machineName) {
                element.machineName = machineName;
                elements.push(element);
            });
            this.panels['elements'] = new AweBuilder.ElementPanel(elements, sectionTemplateMode);
        };
        /**
         * init responsive panel
         */
        Builder.prototype.initNavigatorPanel = function (content) {
            this.panels['navigator'] = new AweBuilder.NavigatorPanel(content, this.panels['media'].getView());
        };
        /**
         * init save section panel
         */
        Builder.prototype.initSaveTemplatePanel = function () {
            // create save panel
            this.panels['save'] = new AweBuilder.SaveTemplatePanel();
        };
        /**
         * init confirm close panel
         */
        Builder.prototype.initCloseConfirmPanel = function () {
            var _self = this;
            this.panels['close'] = new AweBuilder.ConfirmPanel({
                title: 'AweContent',
                content: "<div class=\"ac_row pd15 fz16\">" + window.aweTranslate('All changes will be lost. Are you sure?') + "</div>",
                actions: {
                    submit: function () {
                        _self.close();
                    }
                }
            });
        };
        /**
         * init icon setting panel
         */
        Builder.prototype.initIconSettingPanel = function () {
            this.panels['iconSetting'] = new AweBuilder.IconSettingPanel();
        };
        /**
         * init builder settings panel
         */
        Builder.prototype.initSettingsPanel = function () {
            if (jQuery('.js-builder-settings', this.$wrapper).length === 0) {
                var _self_24 = this, panelHtml = _.template("\n                    <!-- Builder settings -->\n                    <div class=\"js-builder-settings ac_panel--left\">\n                        <div class=\"js-ac-panel-header ac_panel__header\">\n                            <h2 class=\"ac_panel__title\">" + window.aweTranslate('Builder Config') + "</h2>\n                            <a href=\"#\" class=\"js-ac-panel-close ac_panel__close\"><i class=\"acicon acicon-close\"></i></a>\n                        </div>\n                        <div class=\"ac_row\">\n                            <div class=\"ac_1-col\">\n                                <div class=\"js-show-grid ac_panel-item-general ac_panel-item-general--2\">\n                                    <label>\n                                        <span class=\"ac_panel-item-general__title\">" + window.aweTranslate('Show border') + "</span>\n                                        <div class=\"ac_panel-item-general__content\">\n                                            <div class=\"ac_panel-item-general__content-right\">\n                                                <div class=\"radio-icon\">\n                                                    <input type=\"checkbox\"<%if (showGrid) { %> checked<% } %>>\n                                                    <span class=\"radio-style\"></span>\n                                                </div>\n                                            </div>\n                                        </div>\n                                    </label>\n                                </div>\n                            </div>\n                            <div class=\"ac_1-col\">\n                                <div class=\"js-show-tooltips ac_panel-item-general ac_panel-item-general--2\">\n                                    <label>\n                                        <span class=\"ac_panel-item-general__title\">" + window.aweTranslate('Show tooltips') + "</span>\n                                        <div class=\"ac_panel-item-general__content\">\n                                            <div class=\"ac_panel-item-general__content-right\">\n                                                <div class=\"radio-icon\">\n                                                    <input type=\"checkbox\"<%if (showTooltips) { %> checked<% } %>>\n                                                    <span class=\"radio-style\"></span>\n                                                </div>\n                                            </div>\n                                        </div>\n                                    </label>\n                                </div>\n                            </div>\n                            <div class=\"ac_1-col\" style=\"display:none;\">\n                                <div class=\"ac_panel-item-general ac_panel-item-general--2\">\n                                    <label>\n                                        <span class=\"ac_panel-item-general__title\">" + window.aweTranslate('Custom CSS') + "</span>\n                                        <div class=\"ac_panel-item-general__content\">\n                                            <div class=\"ac_panel-item-general__content-right\">\n                                                <i class=\"acicon acicon-pen\" title=\"edit\"></i>\n                                                <div class=\"radio-icon\">\n                                                    <input type=\"checkbox\"<%if (customCss.enable) { %> checked<% } %>>\n                                                    <span class=\"radio-style\"></span>\n                                                </div>\n                                                <textarea class=\"js-custom-css\" style=\"display: none\"><%= customCss.style %></textarea>\n                                            </div>\n                                        </div>\n                                    </label>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                    <!-- /Builder settings -->");
                // add panel to document
                this.$wrapper.prepend(panelHtml(this.settings));
                // handle events on panel
                jQuery('.js-config-btn', this.$wrapper).click(function (event) {
                    event.preventDefault();
                    jQuery('.js-builder-settings', this.$wrapper).toggleClass('active');
                });
                jQuery('.js-show-grid input', this.$wrapper).change(function (event) {
                    var $layoutWrapper = jQuery('iframe', _self_24.$wrapper).contents().find('.js-ac-page-wrapper');
                    // process view in layout
                    if (jQuery(this).is(':checked'))
                        $layoutWrapper.addClass('ac_guides');
                    else
                        $layoutWrapper.removeClass('ac_guides');
                    // save settings
                    if (!event.isTrigger)
                        _self_24.settings.showGrid = jQuery(this).is(':checked');
                });
                jQuery('.js-show-tooltips input', this.$wrapper).change(function (event) {
                    // process view by value
                    if (jQuery(this).is(':checked'))
                        _self_24.$wrapper.addClass('ac_enable-tooltip');
                    else
                        _self_24.$wrapper.removeClass('ac_enable-tooltip');
                    // save settings
                    if (!event.isTrigger)
                        _self_24.settings.showTooltips = jQuery(this).is(':checked');
                });
                jQuery('.js-builder-settings .js-ac-panel-close', this.$wrapper).click(function (event) {
                    event.preventDefault();
                    jQuery('.js-builder-settings', this.$wrapper).removeClass('active');
                });
            }
        };
        /**
         * init for build buttons
         */
        Builder.prototype.initBuildButtons = function (buildButtons) {
            var _self = this, addDefaultButtons = true;
            // process for default button
            if (buildButtons && buildButtons.defaultButton !== undefined) {
                this.$buildBtn = buildButtons.defaultButton;
                if (jQuery.type(buildButtons.defaultButton) === 'string') {
                    if (jQuery(buildButtons.defaultButton).length > 0) {
                        this.$buildBtn = jQuery(buildButtons.defaultButton);
                    }
                }
                // set flag to use custom buttons
                addDefaultButtons = false;
            }
            // process for default button
            if (buildButtons && buildButtons.fromTemplateButton !== undefined) {
                this.$buildFromTemplateBtn = buildButtons.fromTemplateButton;
                if (jQuery.type(buildButtons.fromTemplateButton) === 'string') {
                    if (jQuery(buildButtons.fromTemplateButton).length > 0) {
                        this.$buildFromTemplateBtn = jQuery(buildButtons.fromTemplateButton);
                    }
                }
                // set flag to use custom button
                addDefaultButtons = false;
            }
            // add default build buttons if not set
            if (addDefaultButtons) {
                this.renderDefaultEditButtons();
            }
            // handle click to edit button
            if (this.$buildBtn) {
                this.$buildBtn.click(function (event) {
                    event.preventDefault();
                    // implements custom callback
                    if (_self.options.buildButtons && typeof _self.options.buildButtons.defaultButtonClick === 'function')
                        _self.options.buildButtons.defaultButtonClick(_self);
                    if (_self.pageTemplatesPanel)
                        _self.pageTemplatesPanel.getView().$el.hide();
                    // open build page
                    _self.open();
                });
            }
            // handle click build from template
            if (this.$buildFromTemplateBtn) {
                if (this.allowBuildFromTemplate) {
                    this.$buildFromTemplateBtn.click(function (event) {
                        event.preventDefault();
                        // implements custom callback
                        if (_self.options.buildButtons && typeof _self.options.buildButtons.fromTemplateButtonClick === 'function')
                            _self.options.buildButtons.fromTemplateButtonClick(_self);
                        // create new template panel if not exist
                        if (!_self.pageTemplatesPanel) {
                            _self.pageTemplatesPanel = new AweBuilder.PageTemplatePanel(function (pageContent) {
                                if (pageContent)
                                    _self.content = pageContent;
                                // open build page
                                _self.open();
                            });
                            _self.$wrapper.append(_self.pageTemplatesPanel.getView().$el);
                        }
                        // show page template panel
                        _self.pageTemplatesPanel.show();
                        // show wrapper
                        _self.$wrapper.show();
                    });
                }
                else
                    this.hideBuildFromTemplateButton();
            }
        };
        /**
         * init builder layout
         */
        Builder.prototype.initBuilder = function () {
            // init panels
            this.initPanels();
            // render element toolbar
            this.renderElementToolbar();
            // set builder iframe property
            this.$iframe = jQuery('.js-ac-buildzone > iframe', this.$wrapper);
            // add content view to builder layout
            this.$iframe.contents().find('.js-ac-page-wrapper').append(this.content.getView().$el);
            // set iframe height
            var _self = this;
            this.$iframe.contents().click(function (event) {
                // trigger click when click to iframe
                jQuery(document).trigger('click');
            });
            // disable build buttons;
            if (this.$buildBtn)
                this.$buildBtn.hide();
            if (this.$buildFromTemplateBtn)
                this.$buildFromTemplateBtn.hide();
            if (this.$buildBtn && this.$buildFromTemplateBtn && this.$buildBtn.parent().is(this.$buildFromTemplateBtn))
                this.$buildFromTemplateBtn.parent().hide();
            // show toolbar buttons
            jQuery('.js-toolbar-buttons', this.$wrapper).show();
            // set navigatorPanel to content objects
            _self.content.setNavigatorPanel(_self.panels['navigator']);
            // open elementsPanel
            _self.panels['elements'].getView().open();
            // init builder settings
            this.initBuilderSettings();
            //disable loading screen
            setTimeout(function () {
                jQuery('.js-ac-preloader', this.$wrapper).fadeOut(500, function () {
                    jQuery(this).remove();
                });
            }, 2000);
        };
        /**
         * render edit default buttons
         */
        Builder.prototype.renderDefaultEditButtons = function () {
            var html = "\n                <div class=\"js-ac-build-toolbar ac_toolbar\">\n                    <div class=\"js-build-buttons ac_toolbar__group\">\n                        <a class=\"js-default-btn ac_toolbar__button\" href=\"#\" data-tooltip=\"" + window.aweTranslate('Edit') + "\">\n                            <i class=\"acicon acicon-pen\"></i>\n                        </a>\n                        <a class=\"js-from-template-btn ac_toolbar__button ac_toolbar__hover\" href=\"#\" data-tooltip=\"" + window.aweTranslate('Page templates') + "\">\n                            <i class=\"acicon acicon-template\"></i>\n                        </a>\n                    </div>\n                </div>\n                ";
            // add to toolbar
            if (jQuery('.js-build-buttons').length === 0)
                jQuery('body').append(html);
            // get build buttons
            this.$buildBtn = jQuery('.js-build-buttons > .js-default-btn');
            this.$buildFromTemplateBtn = jQuery('.js-build-buttons > .js-from-template-btn');
        };
        /**
         * render toolbar
         */
        Builder.prototype.renderToolbar = function (buildButtons) {
            if (!jQuery('.js-ac-toolbar', this.$wrapper).length) {
                var template = _.template("\n                    <!-- Awe toolbar -->\n                    <div class=\"js-ac-toolbar ac_toolbar\">\n                        <div class=\"js-toolbar-buttons ac_toolbar__group\" style=\"display: none\">\n                            <a class=\"js-elements-tab js-toolbar-btn ac_toolbar__button\" href=\"#\" data-action=\"elements.1\" data-tooltip=\"" + window.aweTranslate('Elements') + "\">\n                                <i class=\"acicon acicon-element\"></i>\n                            </a>\n                            <div class=\"ac_toolbar__group-button\">\n                                <a class=\"js-toolbar-btn ac_toolbar__button ac_toolbar__hover\" href=\"#\" data-tooltip=\"" + window.aweTranslate('Navigator') + "\" data-action=\"navigator.0\">\n                                    <i class=\"acicon acicon-bar\"></i>\n                                </a>\n                                <a class=\"js-toolbar-btn ac_toolbar__button ac_toolbar__hover\" href=\"#\" data-tooltip=\"" + window.aweTranslate('Responsive') + "\" data-action=\"responsive\">\n                                    <i class=\"acicon acicon-responsive\"></i>\n                                </a>\n                            </div>\n                            <div class=\"js-elements-tabs ac_toolbar__group-button\"></div>\n                            <div class=\"ac_toolbar__group-button\">\n                                <a class=\"js-save-btn ac_toolbar__button ac_toolbar__hover\" href=\"#\" data-tooltip=\"" + window.aweTranslate('Save') + "\" data-action=\"save\">\n                                    <i class=\"acicon acicon-save\"></i>\n                                </a>\n                                <% if (isBuildMode) { %>\n                                <a class=\"js-save-page-tpl-btn ac_toolbar__button ac_toolbar__hover\" href=\"#\" data-tooltip=\"" + window.aweTranslate('Save as page template') + "\" data-action=\"save-page-template\">\n                                    <i class=\"acicon acicon-template\"></i>\n                                </a>\n                                <% } %>\n                                <a class=\"js-close-btn ac_toolbar__button ac_toolbar__hover\" href=\"#\" data-tooltip=\"" + window.aweTranslate('Close without saving') + "\">\n                                    <i class=\"acicon acicon-close\"></i>\n                                </a>\n                                <a class=\"js-config-btn ac_toolbar__button ac_toolbar__hover\" href=\"#\" data-tooltip=\"" + window.aweTranslate('Builder settings') + "\" data-action=\"navigator.3\">\n                                    <i class=\"acicon acicon-tools\"></i>\n                                </a>\n                                <a class=\"js-help-btn ac_toolbar__button ac_toolbar__hover\" href=\"#\" data-tooltip=\"" + window.aweTranslate('Help') + "\">\n                                    <i class=\"acicon acicon-help\"></i>\n                                </a>\n                            </div>\n                        </div>\n                    </div>\n                    <!-- End / Awe toolbar -->\n                ");
                // add toolbar to builder wrapper
                this.$wrapper.prepend(template({ isBuildMode: !this.options.templateMode }));
                // init build buttons
                this.initBuildButtons(buildButtons);
            }
        };
        /**
         * render shortcut for element panel tabs
         */
        Builder.prototype.renderElementToolbar = function () {
            if (!jQuery('.js-elements-tabs', this.$wrapper).data('initialized')) {
                var _self_25 = this, elementTabButtonTemplate_1 = _.template("\n                        <a class=\"js-toolbar-btn ac_toolbar__button ac_toolbar__hover\"\n                         href=\"#\" data-tooltip=\"<%= title %>\" data-action=\"elements.<%= index %>\">\n                            <%= icon %>\n                        </a>"), elementTabs = this.panels['elements'].get('content').get('content');
                // render elements tab shortcut
                elementTabs.each(function (tab, index) {
                    var title = tab.get('title'), icon = tab.get('headerHTML');
                    jQuery('.js-elements-tabs', _self_25.$wrapper).append(elementTabButtonTemplate_1({
                        title: title,
                        icon: icon,
                        index: tab.cid
                    }));
                    // get cid for elements tab
                    if (tab instanceof AweBuilder.ElementControllersTab)
                        jQuery('a.js-elements-tab', _self_25.$wrapper).attr('data-action', "elements." + tab.cid);
                });
                // init toolbar events
                this.initToolbar();
                // set toolbar is initialized flag
                jQuery('.js-elements-tabs', _self_25.$wrapper).data('initialized', true);
            }
        };
        /**
         * implement init toolbar
         */
        Builder.prototype.initToolbar = function () {
            var _self = this;
            // handle click to panel tab buttons
            jQuery('.js-toolbar-btn', this.$wrapper).click(function (event) {
                event.preventDefault();
                var action = jQuery(this).attr('data-action'), actionArray = action.split('.'), activeTab = actionArray[1] !== undefined ? actionArray[1] : 0, panel = _self.panels[actionArray[0]];
                if (panel) {
                    var panelView = panel.getView();
                    if (panelView.activateTab) {
                        if (typeof activeTab === 'string' && !isNaN(parseInt(activeTab))) {
                            activeTab = parseInt(activeTab);
                        }
                        panelView.activateTab(activeTab);
                    }
                    panelView.open();
                }
            });
            // handle click to save button
            jQuery('.js-save-btn', this.$wrapper).click(function (event) {
                event.preventDefault();
                var builderData = JSON.stringify(_self.content);
                jQuery('<textarea class="js-store-builder" style="display: none" />').val(builderData);
                // post builder content to server
                if (_self.options.templateMode) {
                    var template = jQuery.extend(true, {}, _self.options.templateMode, { data: _self.content });
                    _self.panels['save'].getView().saveTemplate(template, function (template) {
                        _self.close(template);
                    });
                }
                else {
                    var postParams = AweBuilder.prepareAjaxParamenters('save', { data: builderData });
                    if (postParams)
                        jQuery.post(postParams.url, postParams.data);
                    // close builder
                    _self.close(builderData);
                    // disable build from template mode
                    _self.hideBuildFromTemplateButton();
                }
            });
            if (!_self.options.templateMode) {
                jQuery('.js-save-page-tpl-btn', this.$wrapper).click(function (event) {
                    event.preventDefault();
                    var template = {
                        type: 'page',
                        id: -1,
                        title: '',
                        data: _self.content,
                        cover: {
                            fid: -1,
                            url: ''
                        }
                    };
                    _self.panels['save'].getView().saveTemplate(template);
                });
            }
            // handle click to close button
            jQuery('.js-close-btn', this.$wrapper).click(function (event) {
                event.preventDefault();
                // open close panel
                _self.panels['close'].getView().open();
            });
        };
        /**
         * init builder settings
         */
        Builder.prototype.initBuilderSettings = function () {
            jQuery('.js-show-tooltips input, .js-show-grid input', this.$wrapper).trigger('change');
        };
        /**
         * update responsive mode when change responsive mode in responsive panel
         */
        Builder.prototype.updateResponsiveMode = function (mode) {
            // change iframe width
            jQuery('.js-ac-buildzone', this.$wrapper).width(AweBuilder.DEVICES_SIZE[mode]).attr('data-breakpoint-info', AweBuilder.DEVICES_SIZE[mode] + "px");
            // update responsive mode seclected to settings
            this.panels['navigator'].setResponsiveMode(mode);
            this.panels['elements'].setResponsiveMode(mode);
        };
        /**
         * enable alert message when reload page
         */
        Builder.prototype.enableReloadAlert = function () {
            // handle page reload
            if (window.onbeforeunload === null) {
                window.onbeforeunload = function (event) {
                    var text = window.aweTranslate('All changes in builder will be lost permanently. Do you really want to close?');
                    event.returnValue = text;
                    return text;
                };
            }
        };
        /**
         * open builder
         */
        Builder.prototype.open = function () {
            var _self = this;
            // enable loading screen
            _self.$wrapper.prepend("\n                <div class=\"js-ac-preloader ac_preloader\">\n                    <svg height=\"200\" width=\"200\" viewBox=\"0 0 400 400\">\n                        <defs>\n                            <circle id=\"circle-preload\" cx=\"30\" cy=\"30\" r=\"30\" fill=\"transparent\" />\n                        </defs>\n                        <use class=\"iconload\" xlink:href=\"#circle-preload\" x=\"170\" y=\"170\"></use>\n                    </svg>\n                </div>\n            ").removeAttr('style');
            // add build zone to edit page
            jQuery('.js-ac-buildzone', _self.$wrapper).remove();
            _self.$wrapper.append("\n                <div class=\"js-ac-buildzone awecontent-buildzone\">\n                    <iframe src=\"" + window.AweBuilderSettings.URLs.buildPage + "\" />\n                </div>\n            ");
            jQuery('.js-ac-buildzone > iframe', _self.$wrapper).on('load', function () {
                // set jQuery plugin in iframe
                AweBuilder._jQuery = AweBuilder._$ = this.contentWindow.jQuery;
                AweBuilder._window = this.contentWindow;
                // load elements
                _self.getElementsInfo();
                // load font icon libraries to iframe
                if (window.AweBuilderSettings.libraries.fontIcons !== undefined && window.AweBuilderSettings.libraries.fontIcons.ready) {
                    var fontIcons = window.AweBuilderSettings.libraries.fontIcons.data, iconFiles_1 = {};
                    jQuery.map(fontIcons, function (library, name) {
                        if (library && jQuery.isArray(library.files)) {
                            jQuery.each(library.files, function (index, filePath) {
                                iconFiles_1[filePath] = { type: AweBuilder.CSS_FILE, destination: ["frontend"] };
                            });
                        }
                    });
                    AweBuilder.addLibraries(iconFiles_1);
                }
            });
            // load elements info and wait to all elements info is loaded
            this.$wrapper.bind('elementsLoaded', function () {
                // create content of builder collection
                if (!(_self.content instanceof AweBuilder.ContentObject || _self.content instanceof AweBuilder.ContentObjects)) {
                    var contentClass = _self.options && _self.options.contentClass ? _self.options.contentClass : 'Sections';
                    try {
                        _self.content = eval("new AweBuilder." + contentClass + "(_self.content)");
                        //set content builder
                        AweBuilderSettings.contentBuilder = _self.content;
                    }
                    catch (error) {
                        throw error;
                    }
                }
                // init builder;
                _self.initBuilder();
                // call builder ready callback
                if (_self.onReady)
                    _self.onReady(_self.$iframe);
            });
        };
        /**
         * close builder
         */
        Builder.prototype.close = function (builderData) {
            AweBuilder._jQuery(AweBuilder._window.document).trigger('builderBeforeClose');
            // implements options close callback
            if (typeof this.onClose === 'function')
                this.onClose(builderData);
            // reset builder
            this.reset();
        };
        /**
         * reset builder
         */
        Builder.prototype.reset = function () {
            function resetElementSettings() {
                var tabsElements = jQuery.extend(true, {}, window.AweBuilderSettings.elementTabs);
                window.AweBuilderSettings.elementTabs = {};
                window.AweBuilderSettings.elements = {};
                jQuery.each(tabsElements, function () {
                    jQuery.aweBuilderTabElement(this);
                });
            }
            // remove js files
            jQuery.each(window.AweBuilderSettings.elementsScript, function () {
                jQuery(this).remove();
            });
            window.AweBuilderSettings.elementsScript = [];
            window.AweBuilderSettings.cachedSettings = {};
            window.AweBuilderSettings.settingForms = {};
            resetElementSettings();
            // revert content of builder
            this.content = AweBuilder.parseJSON(JSON.stringify(this.content));
            // hide wrapper
            this.$wrapper.hide();
            // disable reload alert
            window.onbeforeunload = null;
            // show build buttons
            if (this.$buildBtn)
                this.$buildBtn.removeAttr('style');
            if (this.$buildFromTemplateBtn && this.allowBuildFromTemplate)
                this.$buildFromTemplateBtn.removeAttr('style');
            // hide toolbar buttons
            jQuery('.js-toolbar-buttons', this.$wrapper).hide();
            // reset frontend libraries
            jQuery.map(window.AweBuilderSettings.libraries, function (options, name) {
                if (options.frontend)
                    options.frontend = false;
            });
        };
        /**
         * set options method
         */
        Builder.prototype.setOptions = function (options, reloadBuilder) {
            // save options
            this.options = jQuery.extend(true, {}, this.options, options);
            this.prepareProperties(this.options);
            // reload builder if required
            if (reloadBuilder) {
                this.close();
                this.open();
            }
        };
        /**
         * get builder options
         */
        Builder.prototype.getOptions = function () {
            return this.options;
        };
        /**
         * get builder settings value
         */
        Builder.prototype.getSettings = function () {
            return this.settings;
        };
        /**
         * get iframe of builder
         */
        Builder.prototype.getBuilderIframe = function () {
            return this.$iframe;
        };
        /**
         * get panel
         */
        Builder.prototype.getPanel = function (name) {
            if (name !== undefined)
                return this.panels[name];
            return this.panels;
        };
        /**
         * load build page
         */
        Builder.prototype.getElementsInfo = function () {
            var _self = this, postParams = AweBuilder.prepareAjaxParamenters('element', { task: 'getElementsInfo' });
            jQuery.post(postParams.url, postParams.data, function (response) {
                var elementsFiles = {}, elementsLibraries = {};
                if (response && response.elements) {
                    // save libraries info
                    window.AweBuilderSettings.libraries = jQuery.extend(true, {}, window.AweBuilderSettings.libraries, response.libraries);
                    // add elements js file
                    jQuery.each(response.elements, function () {
                        var elInfo = this;
                        elementsFiles[elInfo.jsFile] = { destination: ['backend'], type: AweBuilder.JS_FILE };
                        if (elInfo.jsTemplate)
                            elementsFiles[elInfo.jsTemplate] = {
                                destination: ['backend'],
                                type: AweBuilder.JS_FILE,
                                classes: 'element-js-file'
                            };
                        if (elInfo.libraries) {
                            var elLibraries_1 = {};
                            jQuery.each(elInfo.libraries, function (libName, options) {
                                elLibraries_1[libName] = options.destination;
                            });
                            elementsLibraries[elInfo.name] = { libraries: elLibraries_1 };
                        }
                    });
                    AweBuilder.addLibraries(elementsFiles, function (files) {
                        var elementsScript = [];
                        jQuery.each(files, function (index, file) {
                            if (file.type === AweBuilder.JS_FILE && file.el)
                                elementsScript.push(file.el);
                        });
                        window.AweBuilderSettings.elementsScript = elementsScript;
                        window.AweBuilderSettings.elements = jQuery.extend(true, window.AweBuilderSettings.elements, elementsLibraries);
                        _self.$wrapper.trigger('elementsLoaded');
                    });
                    _self.elementsLoaded = true;
                }
            }, 'json');
        };
        /**
         * hide build from template button
         */
        Builder.prototype.hideBuildFromTemplateButton = function () {
            this.allowBuildFromTemplate = false;
            if (this.$buildFromTemplateBtn) {
                this.$buildFromTemplateBtn.hide().css({
                    opacity: 0,
                    visible: 'hidden'
                });
            }
        };
        return Builder;
    }());
    AweBuilder.Builder = Builder;
})(AweBuilder || (AweBuilder = {}));
// write plugin
jQuery.fn.aweHtml = function () {
    var html = this.html().trim();
    if (html)
        html = html.replace(/<div class=\"ac_bg__overlay\"><\/div>/g, '');
    return html;
};
/**
 * File: wp-builder.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 07/01/2016
 */
/// <reference path="../ts-libraries/wp.d.ts" />
/// <reference path="./builder.ts" />
var AweBuilder;
(function (AweBuilder) {
    /**
     * Define class to call wordpress media
     */
    var WPMediaPanel = (function (_super) {
        __extends(WPMediaPanel, _super);
        function WPMediaPanel() {
            _super.apply(this, arguments);
        }
        /**
         * overrides createView() method
         */
        WPMediaPanel.prototype.createView = function () {
            this.view = new WPMediaPanelView({ model: this });
        };
        return WPMediaPanel;
    }(AweBuilder.MediaPanel));
    AweBuilder.WPMediaPanel = WPMediaPanel;
    /**
     * Define view class for WPMedia
     */
    var WPMediaPanelView = (function (_super) {
        __extends(WPMediaPanelView, _super);
        function WPMediaPanelView() {
            _super.apply(this, arguments);
        }
        /**
         * overrides initialize method
         */
        WPMediaPanelView.prototype.initialize = function () {
            // init media wordpress
            this.initMediaFrame();
            // implements parent constructor
            _super.prototype.initialize.call(this);
        };
        /**
         * init media frame
         */
        WPMediaPanelView.prototype.initMediaFrame = function () {
            var _self = this;
            this.wpMediaFrame = wp.media({
                title: 'Choose Image',
                button: {
                    text: 'Choose'
                },
                multiple: this.model.getMultiple()
            }).on('select', function () {
                var selected = _self.wpMediaFrame.state().get('selection').first().toJSON();
                if (_self.model.getMultiple() && jQuery.type(selected) === 'array') {
                    jQuery.each(selected, function (index, file) {
                        file.fid = file.id;
                    });
                }
                else
                    (jQuery.type(selected) === 'object');
                selected.fid = selected.id;
                // set selected files to controller
                _self.close(null, selected);
            });
        };
        /**
         * overrides open() method
         */
        WPMediaPanelView.prototype.open = function (controller) {
            // init media frame
            this.initMediaFrame();
            // set controller property
            this.controller = controller;
            // open wordpress media panel
            this.wpMediaFrame.open();
        };
        /**
         * overrides renderContent() method
         */
        WPMediaPanelView.prototype.renderContent = function () { };
        return WPMediaPanelView;
    }(AweBuilder.MediaPanelView));
    AweBuilder.WPMediaPanelView = WPMediaPanelView;
    var WPBuilder = (function (_super) {
        __extends(WPBuilder, _super);
        function WPBuilder() {
            _super.apply(this, arguments);
        }
        /**
         * initialize media panel
         */
        WPBuilder.prototype.initMediaPanel = function () {
            this.panels['media'] = new WPMediaPanel();
        };
        return WPBuilder;
    }(AweBuilder.Builder));
    AweBuilder.WPBuilder = WPBuilder;
})(AweBuilder || (AweBuilder = {}));
