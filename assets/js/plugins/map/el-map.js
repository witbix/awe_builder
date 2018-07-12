/**
 * File: el-map.js
 */
(function($, _$, _window) {
    // callback implement change map options
    function changeMapOption(el, optionName, value) {
        _$('.ac_element-map', el).aweMap('setOption', optionName, value);
    }

    // callback to validate position value
    function validatePosition(value) {
        if (typeof value === "string" || jQuery.type(value) === "array") {
            var center_arr = jQuery.type(value) === "array"? value : value.split(',');
            if (center_arr.length === 2)
                return true;
            else
                return "Position must be have 2 components and separated by ',' character. Example: '21.001763,105.820591'"
        }
       return "Position value must have string or array";
    }

    AweBuilder.elementInfo('el_map', {
        title: 'Google Map',
        icon: 'acicon acicon-elm-gmap',
        data: {
            style: {
                enabled: ['font', 'background', 'border', 'padding', 'margin', 'shadow', 'transform'],
                status: ['normal', 'hover']
            },
            settings: {
                center: {
                    type: 'input',
                    title: "Center position",
                    defaultValue: '21.001763,105.820591',
                    change: function ($panel, el, values) {
                        if (!values.updateModel)
                            changeMapOption(el, "center", values.current);
                    }
                },
                mapTypeId:{
                    type: 'select',
                    inlineTitle: true,
                    title: 'Map Type',
                    options: {
                        'roadmap': 'Roadmap',
                        'satellite': 'Satellite',
                        'hybrid': 'Hybrid',
                        'terrain': 'Terrain'
                    },
                    defaultValue: 'roadmap',
                    change: function($panel, el, values) {
                        if (!values.updateModel)
                            changeMapOption(el, "mapTypeId", values.current);
                    }
                },
                zoom: {
                    type: 'ranger',
                    title: 'Zoom',
                    widget: 'button',
                    allowChangeRange: false,
                    min: 1,
                    max: 21,
                    widthNumber: 2,
                    defaultValue: 14,
                    unit: false,
                    change: function($panel, el, values, element) {
                        if (!values.updateModel)
                            changeMapOption(element.getView().el, "zoom", values.current);
                    }
                },
                height: {
                    type: 'ranger',
                    widthNumber: 2,
                    title: 'Height',
                    min: 0,
                    max: 999,
                    defaultValue: 400,
                    unit: 'px',
                    change: function($panel, el, values) {
                        if (!values.updateModel)
                            changeMapOption(el, "height", values.current);
                    }
                },
                scrollwheel: {
                    type: 'toggle',
                    title: 'Enable scroll to zoom',
                    defaultValue: false,
                    inlineTitle: true,
                    change: function($panel, el, values) {
                        if (!values.updateModel)
                            changeMapOption(el, "scrollwheel", values.current);
                    }
                },
                disableDefaultUI: {
                    type: 'toggle',
                    title: "Disable controls",
                    inlineTitle: true,
                    defaultValue: true,
                    change: function ($panel, el, values) {
                        if (!values.updateModel)
                            changeMapOption(el, "disableDefaultUI", values.current);
                    }
                },
                markers: {
                    type: "group",
                    elements: {
                        enable: {
                            type: "toggle",
                            title: "Show markers",
                            defaultValue: false,
                            change: function ($panel, el, values) {
                                if (!values.updateModel) {
                                    changeMapOption(el, "markers", {enable: values.current, action: 'enableMarkers'});
                                }
                                if (values.current)
                                    $('.el-data.el-attributes', $panel).show();
                                else
                                    $('.el-data.el-attributes', $panel).hide();
                            }
                        },
                        data: {
                            type: 'attributes',
                            primaryEl: ['title', 'position'],
                            formElements: {
                                position: {
                                    type: 'input',
                                    title: 'Position',
                                    inlineTitle: true,
                                    defaultValue: ''
                                },
                                title: {
                                    type: 'input',
                                    title: 'Title',
                                    inlineTitle: true,
                                    defaultValue: ''
                                },
                                animation: {
                                    type: 'select',
                                    inlineTitle: true,
                                    title: 'Animation',
                                    options: {
                                        none: 'None',
                                        DROP: 'Drop',
                                        BOUNCE: 'Bounce'
                                    },
                                    devices: false,
                                    defaultValue: 'none'
                                },
                                icon: {
                                    title: 'Icon',
                                    type: 'fileselector',
                                    defaultValue: {fid: -1, url: ''}
                                },
                                description: {
                                    type: 'textarea',
                                    title: "Description",
                                    defaultValue: ''
                                }
                            },
                            validateItem: function (item) {
                                var output = validatePosition(item.position);
                                if (output !== true) {
                                    alert(output);
                                    return false;
                                }
                                return true;
                            },
                            change: function ($panel, el, values) {
                                if (!values.updateModel)
                                    changeMapOption(el, "markers", values);
                            }
                        }
                    }
                }
            }
        },
        ready: function (el, element) {
            var settings = element.getSettingsAttr("main.settings");
            _$('.ac_element-map', element.getView().el).aweMap(settings);
        }
    });
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
