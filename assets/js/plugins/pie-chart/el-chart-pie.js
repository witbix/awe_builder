/**
 * File: el-chart.js
 * http://chartjs.org/
 * Version: 1.0.2
 */
(function($, _$, _window) {
    function ready_config(el, model) {
        canvasChart(el, model);       
        _$(el).closest('.js-type-column').resize(function(){
            canvasChart(el, model);
        });
    }

    function canvasChart(el, element) {
        var CharData    = element.getSettingsAttr("main.settings.chart_element_value"),
            ChartsType  = element.getSettingsAttr("main.settings.chart_type"),
            EnStroke  = element.getSettingsAttr("main.settings.enable_stroke"),
            EnStrokeColor  = element.getSettingsAttr("main.settings.stroke_color"),
            EnStrokeWidth  = element.getSettingsAttr("main.settings.stroke_width"),
            Animation   = element.getSettingsAttr("main.settings.chart_animation"),
            EnTooltips  = element.getSettingsAttr("main.settings.enable_tooltip"),
            EnResponsive= element.getSettingsAttr("main.settings.enable_responsive");
            
        if(EnStrokeWidth)
            EnStrokeWidth = parseInt(EnStrokeWidth);
            
        // Draw pie chart
        var isChart = setInterval(function(){
            var IframeChart = _window.Chart;
                if(IframeChart){
                    clearInterval(isChart);
                    //remove old canvas and create new
                    _$(el).find('canvas').remove();
                    _$(el).find('.chart-canvas').append('<canvas height="1" width="1"></canvas>');
                    
                    var selectCanvas=   _$(el).find('canvas'),
                        ctx         =   selectCanvas[0].getContext('2d'),
                        options     =   {
                                            showTooltips: EnTooltips,
                                            animationEasing: Animation,
                                            responsive: EnResponsive ? true : false,
                                        };
                        options.segmentShowStroke   = EnStroke ? true : false;
                        options.segmentStrokeWidth  = EnStrokeWidth;
                        options.segmentStrokeColor  = EnStrokeColor;

                        ctx.canvas.width = selectCanvas.parent().width();
                        ctx.canvas.height = selectCanvas.parent().width();

                        if (ChartsType=='doughnut') {
                            new IframeChart(ctx).Doughnut(CharData, options);
                        } else if(ChartsType=='pie') {
                            new IframeChart(ctx).Pie(CharData, options);
                        } else {
                            new IframeChart(ctx).PolarArea(CharData, options);
                        }
            }
        }, 100);
        
        // Description pie
        var list_detail = _.template(
                                '<% _.each(ListItem, function (ItemInfo){ %>\
                                   <li><span style="background-color:<%= ItemInfo.color %>"></span><%= ItemInfo.label %></li>\
                                <% }); %>'
                            );
        _$('.js-el-content .chart-detail',el).html(list_detail({ListItem: CharData}));
    }

    AweBuilder.elementInfo('el_pie_chart', {
        title: 'Pie Chart',
        icon: 'acicon acicon-piechart',
        data: {
            main: {
                style: {
                    enabled: ['border','padding','margin'],
                    status: ['normal']
                },
                settings: {
                    chart_type: {
                        type: "select",
                        title: "Theme",
                        inlineTitle: true,
                        devices: false,
                        options: {
                            "doughnut": "Doughnut",
                            "pie": "Pie",
                            "polararea": "Polar Area"
                        },
                        defaultValue: "doughnut",
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                canvasChart(el, element)
                        }
                    },
                    enable_stroke: {
                        type: 'toggle',
                        title: "Enable Stroke",
                        inlineTitle: true,
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                            if(values.current == true){
                                $('.stroke-color, .stroke-width',$panel).show();
                            }else{
                                $('.stroke-color, .stroke-width',$panel).hide();
                            }

                            if(!values.updateModel)
                                canvasChart(el, element)
                        }
                    },
                    stroke_color: {
                        type: 'colorpicker',
                        title: 'Stroke Color',
                        className: 'stroke-color',
                        defaultValue: '',
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(values != null && !values.updateModel)
                                canvasChart(el, element)
                        }
                    },
                    stroke_width: {
                        type: 'ranger',
                        title: 'Stroke Width',
                        className: 'stroke-width',
                        min: 1,
                        max: 10,
                        widthNumber: 2,
                        defaultValue: 2,
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                canvasChart(el, element)
                        }
                    },
                    chart_element_value: {
                        type: 'attributes',
                        title: 'Add Element',
                        devices: false,
                        formElements: {
                            label: {
                                type: 'input',
                                title: 'Text',
                                inlineTitle: true,
                                defaultValue: ''
                            },
                            value: {
                                type: 'input',
                                className: 'value-number',
                                title: 'Value Number',
                                inlineTitle: true,
                                devices: false,
                                defaultValue: '',
                                customStyles: {
                                    '.ac_panel-item-general__content': {
                                        'padding-left': '100px'
                                    }
                                },
                                validate: function(values) {
                                    if (values.trim() === '' || !$.isNumeric(values)) {
                                        return false;
                                    } else {
                                        return true;
                                    }
                                },
                            },
                            color: {
                                type: 'colorpicker',
                                title: 'Background Color',
                                defaultValue: ''
                            },
                            highlight: {
                                type: 'colorpicker',
                                title: 'Background Color Hover',
                                defaultValue: ''
                            }
                        },
                        primaryEl: 'label',
                        defaultValue: [{"label":"Drink","value":"350","color":"#6e0404","highlight":"#103ce7"},{"label":"Eat","value":"67","color":"#1e385d","highlight":"#f24838"},{"label":"Sleep","value":"145","color":"#deca14","highlight":"#3687e9"}],
                        validate: function(values) {
                            if (values.label === ''){
                                alert('Please input Text');
                                return false;
                            } else {
                                return true;
                            }
                        },
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                element.setStorageValue('list_data', JSON.stringify(values.current), 'main');
                                canvasChart(el, element);                                
                            }
                        }
                    },
                    list_data: {
                        type: 'storage',
                        defaultValue: '[{"label":"Drink","value":"350","color":"#6e0404","highlight":"#103ce7"},{"label":"Eat","value":"67","color":"#1e385d","highlight":"#f24838"},{"label":"Sleep","value":"145","color":"#deca14","highlight":"#3687e9"}]',
                    },
                    chart_animation: {
                        type: "select",
                        title: "Animation",
                        inlineTitle: true,
                        devices: false,
                        customStyles: {
                            '.ac_panel-item-general__content': {
                                'padding-left': '100px'
                            }
                        },
                        options: {
                            "easeInOutCubic": "easeInOutCubic",
                            "easeOutBounce": "easeOutBounce",
                            "easeOutQuart": "easeOutQuart",
                            "easeInOutBounce": "easeInOutBounce",
                            "easeOutElastic": "easeOutElastic",
                            "easeInCubic": "easeInCubic",
                            "easeInOutSine": "easeInOutSine",
                            "easeInExpo": "easeInExpo",
                            "easeOutBack": "easeOutBack",
                            "easeInOutExpo": "easeInOutExpo",
                            "easeOutQuint": "easeOutQuint",
                            "easeInOutCirc": "easeInOutCirc",
                            "easeOutExpo": "easeOutExpo",
                            "easeOutCirc": "easeOutCirc",
                            "easeInQuint": "easeInQuint",

                        },
                        defaultValue: "easeInOutCubic",
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                canvasChart(el, element)
                        }
                    },
                    enable_tooltip: {
                        type: 'toggle',
                        title: "Enable Tooltip",
                        inlineTitle: true,
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                canvasChart(el, element)
                        }
                    },
                    enable_responsive: {
                        type: "toggle",
                        title: "Enable Responsive",
                        inlineTitle: true,
                        devices: false,                       
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                canvasChart(el, element)
                        }
                    }
                },
            },
        },
        ready: ready_config
    });
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
