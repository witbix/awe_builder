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
        var ItemData    = element.getSettingsAttr("main.settings.chart_element_value"),
            Itemlabel   = element.getSettingsAttr("main.settings.list_label"),
            ChartsType  = element.getSettingsAttr("main.settings.chart_type"),
            Animation   = element.getSettingsAttr("main.settings.chart_animation"),
            EnTooltips  = element.getSettingsAttr("main.settings.enable_tooltip"),
            EnResponsive= element.getSettingsAttr("main.settings.enable_responsive");
        
        // Draw pie chart
        var label_array = JSON.parse(Itemlabel);

        var isChart = setInterval(function(){
            var IframeChart = _window.Chart;
                if(IframeChart){
                    clearInterval(isChart);
                    //remove old canvas and create new
                    _$(el).find('canvas').remove();
                    _$(el).find('.chart-canvas').append('<canvas height="1" width="1"></canvas>');
                    
                    var selectCanvas=   _$(el).find('canvas'),                        
                        ctx         =   selectCanvas[0].getContext('2d'),
                        CharData    =   {"labels":label_array, "datasets":ItemData},
                        options     =   {
                                            showTooltips: EnTooltips,
                                            animationEasing: Animation,
                                            responsive: EnResponsive ? true : false,
                                        };

                        ctx.canvas.width = selectCanvas.parent().width();
                        ctx.canvas.height = selectCanvas.parent().width();

                        if (ChartsType=='line') {
                            new IframeChart(ctx).Line(CharData, options);
                        } else if(ChartsType=='radar') {
                            new IframeChart(ctx).Radar(CharData, options);
                        } else if(ChartsType=='bar') {
                            new IframeChart(ctx).Bar(CharData, options);
                        }
            }
        }, 100);

        // Description pie
        var list_detail = _.template(
                                '<% _.each(ListItem, function (ItemInfo){ %>\
                                   <li><span style="background-color:<%= ItemInfo.fillColor %>"></span><%= ItemInfo.label %></li>\
                                <% }); %>'
                            );
        _$('.js-el-content .chart-detail',el).html(list_detail({ListItem: ItemData}));
    }

    AweBuilder.elementInfo('el_chart', {
        title: 'Chart',
        icon: 'acicon acicon-chart',
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
                            "radar": "Radar",
                            "line": "Line",
                            "bar": "Bar",
                        },
                        defaultValue: "bar",
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                canvasChart(el, element)
                        }
                    },
                    chart_elemet_label: {
                        type: 'attributes',
                        title: 'Add Label',
                        formElements: {
                            item_name: {
                                type: 'input',
                                title: 'Label',
                                inlineTitle: true,
                                defaultValue: ''
                            },
                        },
                        primaryEl: 'item_name',
                        defaultValue: [{"item_name":"Eating"},{"item_name":"Drinking"},{"item_name":"Sleeping"},{"item_name":"Designing"},{"item_name":"Coding"},{"item_name":"Cycling"}],
                        validate: function(values) {
                            if (values.item_name === ''){
                                alert('Please input label');
                                return false;
                            }else return true;
                        },
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                var label_array = [];
                                        $.each(values.current, function(item, obj){
                                            $.each(obj,function(key,value){
                                                label_array.push(value);
                                            });
                                        });

                                element.setStorageValue('list_label', JSON.stringify(label_array), 'main');
                                canvasChart(el, element);
                            }
                        },
                    },
                    list_label: {
                        type: 'storage',
                        defaultValue: '["Eating","Drinking","Sleeping","Designing","Coding","Cycling"]',
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
                            data: {
                                type: 'input',
                                className: 'value-number',
                                title: 'Value',
                                inlineTitle: true,
                                devices: false,
                                defaultValue: '',
                            },
                            info: {
                                type: "markup",
                                devices: false,
                                markup: "<small>eg: 65,59,80,81,56,55</small>",
                                init:function(element){}
                            },
                            fillColor: {
                                type: 'colorpicker',
                                title: 'Fill Color',
                                defaultValue: ''
                            },
                            strokeColor: {
                                type: 'colorpicker',
                                title: 'Stroke Color',
                                defaultValue: ''
                            },
                            pointColor: {
                                type: 'colorpicker',
                                title: 'Point Color',
                                defaultValue: ''
                            },
                            pointStrokeColor: {
                                type: 'colorpicker',
                                title: 'Point Stroke Color',
                                defaultValue: ''
                            },
                            pointHighlightFill: {
                                type: 'colorpicker',
                                title: 'Point Highlight Fill Color',
                                defaultValue: ''
                            },
                            pointHighlightStroke: {
                                type: 'colorpicker',
                                title: 'Point Highlight Stroke Color',
                                defaultValue: ''
                            },
                        },
                        primaryEl: 'label',
                        defaultValue: [{"label":"My First dataset","data":["65","59","80","81","56","55"],"fillColor":"#898991","strokeColor":"#97bbcd","pointColor":"#97bbcd","pointStrokeColor":"#ffffff","pointHighlightFill":"#ffffff","pointHighlightStroke":"#97bbcd"},{"label":"My Second dataset","data":["28","48","40","19","86","27","90"],"fillColor":"#e14040","strokeColor":"#f5f613","pointColor":"#25df15","pointStrokeColor":"#18cbce","pointHighlightFill":"#4424d3","pointHighlightStroke":"#c224d6"}],
                        validate: function(values) {                            
                            if($.type(values) == 'array'){
                                var new_item = values[values.length - 1];
                                if (new_item.label === ''){
                                    alert('Please input Text');
                                    return false;
                                } else {
                                    if(typeof(new_item.data) != 'object'){
                                        var attributes_value = new_item.data.replace(/\s/g, '');
                                        new_item.data = attributes_value.split(",");
                                    }
                                    return true;
                                }
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
                        defaultValue: '[{"label":"My First dataset","data":["65","59","80","81","56","55"],"fillColor":"#898991","strokeColor":"#97bbcd","pointColor":"#97bbcd","pointStrokeColor":"#ffffff","pointHighlightFill":"#ffffff","pointHighlightStroke":"#97bbcd"},{"label":"My Second dataset","data":["28","48","40","19","86","27","90"],"fillColor":"#e14040","strokeColor":"#f5f613","pointColor":"#25df15","pointStrokeColor":"#18cbce","pointHighlightFill":"#4424d3","pointHighlightStroke":"#c224d6"}]',
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
                }
            }
        },
        ready: ready_config
    });
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
