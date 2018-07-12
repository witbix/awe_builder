/**
 * File: el-round-counter.js
 */
(function($, _$, _window) {
    function ready_config(el, model) {
        initRoundProgress(el, model);
        changeText(el, model);
    }
    function changeClass($selector, values) {
        $selector.removeClass(values['prev']).addClass(values['current']);
    }
    function changeText(el, model) {
        var progress_text = $('.round-title', el);
        progress_text.attr('contenteditable', 'true');
        progress_text.blur(function(event) {
            var _text = $(this).text();
            model.setStorageValue('title', _text, 'main');
        })

        var edit_description = $('.round-description', el);
        edit_description.attr('contenteditable', 'true');
        edit_description.blur(function(event) {
            var _text = $(this).text();
            model.setStorageValue('description', _text, 'main');
        })
    }
    function initRoundProgress(el, element) {
        var NumberPercent   = element.getSettingsAttr("main.settings.percent"),
            style           = element.getSettingsAttr("main.settings.style"),
            strokecolor     = element.getSettingsAttr("main.settings.stroke_color") ? element.getSettingsAttr("main.settings.stroke_color") : '',
            trailcolor      = element.getSettingsAttr("main.settings.trail_color") ? element.getSettingsAttr("main.settings.trail_color") : '',
            fillcolor       = element.getSettingsAttr("main.settings.fill_color") ? element.getSettingsAttr("main.settings.fill_color") : '';

        var percentvalue = Number(NumberPercent) / 100,
            $options = {
                        strokeWidth: element.getSettingsAttr("main.settings.stroke_width"),
                        trailWidth: element.getSettingsAttr("main.settings.trail_width"),
                        duration: 1500,
                        easing: element.getSettingsAttr("main.settings.easing"),
                    };
            if($options.strokeWidth)
                $options.strokeWidth = parseInt($options.strokeWidth);
            if($options.trailWidth)
                $options.trailWidth = parseInt($options.trailWidth);

                    if(strokecolor !=''){
                      $options.color = strokecolor;
                    }
                    if(trailcolor !=''){
                      $options.trailColor = trailcolor;
                    }
                    if(fillcolor !=''){
                      $options.fill = fillcolor;
                    }
                    
        var isProgressBar = setInterval(function(){
            
            var svgProgressBar = _window.ProgressBar,
                select =   _$(el).find('.round-value');
                    select.find('svg, p').remove();

            if(svgProgressBar){
                    clearInterval(isProgressBar);

                    if(style === undefined || style == 1){
                      $options.text = {value: '0%'};
                      $options.step = function (state, bar) {
                        bar.setText((bar.value() * 100).toFixed(0) + "%")
                      };
                    }

                    var circle = new svgProgressBar.Circle(select[0], $options);
                        circle.animate(percentvalue);
            }
        }, 100);
        
    }

	AweBuilder.elementInfo('el-round-counter', {
		title: 'Round Counter',
		icon: 'acicon acicon-progress',
        enableEditor: [{
                selector: '.round-title',
                saveTo: {}
            },{
            selector: '.round-description',
            saveTo: {}
        }],
        data: {
            main: {
                style: {
                    enabled: ['border','padding','margin'],
                    status: ['normal'],
                },
                settings: {
                    percent: {
                        type: "ranger",
                        title: 'Percent',
                        widthNumber: 2,
                        min: 0,
                        max: 100,
                        devices: false,
                        defaultValue: 60,
                        unit: '',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                initRoundProgress(el, element);
                        }
                    },
                    style: {
                        type: "select",
                        title: "Style",
                        inlineTitle: true,
                        devices: false,
                        options: {
                            "1": "Style 1",
                            "2": "Style 2",
                        },
                        defaultValue: "1",
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){

                                var arrayTemplate = {
                                            '1': _.template(
                                                '<div class="ac-progress-round">\
                                                    <div class="round-value"></div>\
                                                    <div class="round-title" <% if(!main_enable_title) { print(\'style="display:none"\')} %>><%= main_title %></div>\
                                                    <div class="round-description" <% if(!main_enable_description) { print(\'style="display:none"\')} %>><%= main_description %></div>\
                                                </div>'
                                                ),
                                            '2': _.template(
                                                '<div class="ac-progress-round">\
                                                    <div class="round-value round-icon">\
                                                        <i class="ac-icon <%= main_choose_icon %>"></i>\
                                                    </div>\
                                                    <div class="round-title" <% if(!main_enable_title) { print(\'style="display:none"\')} %>><%= main_title %></div>\
                                                    <div class="round-description" <% if(!main_enable_description) { print(\'style="display:none"\')} %>><%= main_description %></div>\
                                                </div>'
                                                ),
                                        },
                                    options = {
                                            main_percent: element.getSettingsAttr("main.settings.percent"),
                                            main_stroke_width: element.getSettingsAttr("main.settings.stroke_width"),
                                            main_trail_width: element.getSettingsAttr("main.settings.trail_width"),
                                            main_trail_color: element.getSettingsAttr("main.settings.trail_color"),
                                            main_stroke_color: element.getSettingsAttr("main.settings.stroke_color"),
                                            main_fill_color: element.getSettingsAttr("main.settings.fill_color"),
                                            main_choose_icon: element.getSettingsAttr("main.settings.choose_icon"),
                                            main_title: element.getSettingsAttr("main.settings.title"),
                                            main_enable_title: element.getSettingsAttr("main.settings.enable_title"),
                                            main_description: element.getSettingsAttr("main.settings.description"),
                                            main_enable_description: element.getSettingsAttr("main.settings.enable_description"),
                                        },
                                    style_number = element.getSettingsAttr("main.settings.style");
                            
                                    if(style_number === undefined)
                                        style_number = 1;
                                    var template = arrayTemplate[style_number];

                                    _$('.js-el-content',el).html(template(options));

                                    
                                    initRoundProgress(el, element);

                                    changeText(el, element);
                                    element.getView().reinitEditor('.round-title');
                                    element.getView().reinitEditor('.round-description');
                            }

                            if (values.current == "2") {
                                    $('.choose-icon', $panel).show();
                            } else {
                                    $('.choose-icon', $panel).hide();
                            }
                        }
                    },
                    choose_icon: {
                        type: 'icon',
                        inlineTitle: true,
                        title: 'Choose Icon',
                        className: 'choose-icon',
                        devices: false,
                        defaultValue: '',
                        customStyles: {
                            '.ac_panel-item-general__content': {
                                'padding-left': '75px'
                            }
                        },
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                changeClass($('.round-icon i', el), values);
                        }
                    },
                    enable_title: {
                        type: 'toggle',
                        title: 'Enable Title',
                        inlineTitle: true,
                        className: 'enable-title',
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                                if(!values.updateModel){
                                    if (values.current) {
                                        $('.round-title', el).show();
                                    } else {
                                        $('.round-title', el).hide();
                                    }
                                }
                        }
                    },
                    title: {
                        type: 'storage',
                        defaultValue: 'Round Counter Title',
                    },
                    enable_description: {
                        type: 'toggle',
                        title: 'Enable Description',
                        inlineTitle: true,
                        className: 'enable-description',
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                                if(!values.updateModel){
                                    if (values.current) {
                                        $('.round-description', el).show();
                                    } else {
                                        $('.round-description', el).hide();
                                    }
                                }
                        }
                    },
                    description: {
                        type: 'storage',
                        defaultValue: 'Round Counter Description',
                    },
                    easing:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Easing',
                        options: {
                            'bounce':           'bounce',
                            'swingFromTo':      'swingFromTo',
                            'swingFrom':        'swingFrom',
                            'swingTo':          'swingTo',
                            'bouncePast':       'bouncePast',
                            'easeFromTo':       'easeFromTo',
                            'easeFrom':         'easeFrom',
                            'easeTo':           'easeTo',
                            'easeIn':           'easeIn',
                            'easeOut':          'easeOut',
                            'easeInOut':        'easeInOut',
                            'easeInQuad':       'easeInQuad',
                            'easeOutQuad':      'easeOutQuad',
                            'easeInOutQuad':    'easeInOutQuad',
                            'easeInCubic':      'easeInCubic',
                            'easeOutCubic':     'easeOutCubic',
                            'easeInOutCubic':   'easeInOutCubic',
                            'easeInQuart':      'easeInQuart',
                            'easeOutQuart':     'easeOutQuart',
                            'easeInOutQuart':   'easeInOutQuart',
                            'easeInQuint':      'easeInQuint',
                            'easeOutQuint':     'easeOutQuint',
                            'easeInOutQuint':   'easeInOutQuint',
                            'easeInSine':       'easeInSine',
                            'easeOutSine':      'easeOutSine',
                            'easeInOutSine':    'easeInOutSine',
                            'easeInExpo':       'easeInExpo',
                            'easeOutExpo':      'easeOutExpo',
                            'easeInOutExpo':    'easeInOutExpo',
                            'easeInCirc':       'easeInCirc',
                            'easeOutCirc':      'easeOutCirc',
                            'easeInOutCirc':    'easeInOutCirc',
                            'easeOutBounce':    'easeOutBounce',
                            'easeInBack':       'easeInBack',
                            'easeOutBack':      'easeOutBack',
                            'easeInOutBack':    'easeInOutBack',
                            'elastic':          'elastic',
                        },
                        devices: false,
                        defaultValue: 'bounce',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                initRoundProgress(el, element);
                        }
                    },
                    stroke_width: {
                        type: "ranger",
                        title: 'Stroke Width',
                        widthNumber: 2,
                        min: 0,
                        max: 99,
                        devices: false,
                        defaultValue: 5,
                        unit: 'px',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                initRoundProgress(el, element);
                        }
                    },
                    trail_width: {
                        type: "ranger",
                        title: 'Trail Width',
                        widthNumber: 2,
                        min: 0,
                        max: 99,
                        devices: false,
                        defaultValue: 5,
                        unit: 'px',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                initRoundProgress(el, element);
                        }
                    },
                    stroke_color: {
                        type: 'colorpicker',
                        title: 'Stroke Color',
                        defaultValue: '',
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(values != null && !values.updateModel)
                                initRoundProgress(el, element);
                        }
                    },
                    trail_color: {
                        type: 'colorpicker',
                        title: 'Trail Color',
                        defaultValue: '',
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(values != null && !values.updateModel)
                                initRoundProgress(el, element);
                        }
                    },
                    fill_color: {
                        type: 'colorpicker',
                        title: 'Fill Color',
                        defaultValue: '',
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(values != null && !values.updateModel)
                                initRoundProgress(el, element);
                        }
                    }
                },
            },
            style_icon: {
                title: 'Icon',
                selector: '.ac-progress-round i',
                style: {
                    enabled: ['font','background','border','padding'],
                    status: ['normal','hover'],
                },
            },
        },
		ready: ready_config
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);