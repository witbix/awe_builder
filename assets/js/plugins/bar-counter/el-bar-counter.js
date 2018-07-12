/**
 * http://www.minddust.com/project/bootstrap-progressbar/demo/bootstrap-3-3-4/
 */
(function ($, _$, _window) {
    function ready_config(el, model) {
        initProgress(el);
        changeText(el, model);
        
        // fix style inline of progress bar has been deleted
        model.on('change',function(){
            var percent = model.getSettingsAttr("main.settings.percent");
            // fix error: somtime unit not be %
            if(percent)
                percent = parseInt(percent)+'%';
            
            if(_$('.ac-progress-line', el).hasClass('progress-vertical')){
                _$('.progress-value', el).css({height:percent});
                var text_width = $('.progressbar-back-text', el).width(),
                    el_width = $(el).width(),
                    text_left = (el_width - text_width)/2;
                $('.progressbar-back-text', el).css({width:'auto', left:text_left+'px'});
                    
            }
            else
                _$('.progress-value', el).css({width:percent});
        });
    }

    function changeText(el, model) {
        var progress_text = $('.progress-name', el);
        progress_text.attr('contenteditable', 'true');

        progress_text.blur(function (event) {
            var _text = $(this).text();
            model.setStorageValue('text_content', _text, 'main');
        })
    }

    function initProgress(el) {
        _$(el).find(".progress-value").progressbar({display_text: 'center'});
    }

    function changeClass($selector, values) {
        $selector.removeClass(values['prev']).addClass(values['current']);
    }


	AweBuilder.elementInfo('el-bar-counter', {
		title: 'Bar Counter',
		icon: 'acicon acicon-progress',
        enableEditor: {
            selector: '.progress-name',
            saveTo: {}
        },
        data: {
            main: {
                style: {
                    enabled: ['font', 'background', 'border', 'padding', 'margin'],
                    status: ['normal']
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
                        unit: '%',
                        change: function ($panel, el, values, element) {
                            _$(el).find(".progress-value").attr('data-transitiongoal', values.current);

                            if (!values.updateModel)
                                initProgress(el);
                        }
                    },
                    style: {
                        type: "select",
                        title: "Style",
                        inlineTitle: true,
                        devices: false,
                        options: {
                            "1": "Default",
                            "2": "Normal",
                            "3": "Vertical"
                        },
                        defaultValue: "1",
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                var arrayTemplate = {
                                            '1': _.template(
                                                '<div class="ac-progress-line progress-fill-text">\
                                                    <div class="progress-value" data-transitiongoal="<%= main_percent %>" role="progressbar">\
                                                      <div class="progress-name"><%= main_text_content %></div>\
                                                    </div>\
                                                </div>'
                                            ),
                                            '2': _.template(
                                                '<div class="ac-progress-line <%= main_progress_interfaces %>">\
                                                    <div class="progress-name"><%= main_text_content %></div>\
                                                    <div class="progress-value" data-transitiongoal="<%= main_percent %>" role="progressbar"></div>\
                                                </div>'
                                            ),
                                            '3': _.template(
                                                '<div class="ac-progress-line progress-vertical vertical">\
                                                    <div class="progress-value" data-transitiongoal="<%= main_percent %>" role="progressbar"></div>\
                                                    <div class="progress-name"><%= main_text_content %></div>\
                                                </div>'
                                            )
                                        },
                                    options = {
                                            main_percent: element.getSettingsAttr("main.settings.percent"),
                                            main_text_content: element.getSettingsAttr("main.settings.text_content"),
                                            main_progress_interfaces: element.getSettingsAttr("main.settings.progress_interfaces"),
                                        },
                                    style_number = element.getSettingsAttr("main.settings.style");
                                if(style_number == undefined)
                                    style_number = 1;
                                var template = arrayTemplate[style_number];

                                _$('.js-el-content', el).html(template(options));


                                initProgress(el);
                                changeText(el, element);
                                element.getView().reinitEditor('.progress-name');
                            }

                            if (values.current == "2") {
                                $('.progress-interfaces', $panel).show();
                            } else {
                                $('.progress-interfaces', $panel).hide();
                            }
                        }
                    },
                    progress_interfaces: {
                        type: "select",
                        title: "Type",
                        inlineTitle: true,
                        className: 'progress-interfaces',
                        devices: false,
                        options: {
                            "progress-style-classic": "Classic",
                            "progress-style-tooltip": "Tooltip"
                        },
                        defaultValue: "progress-style-classic",
                        change: function ($panel, el, values) {
                            if (!values.updateModel)
                                changeClass($('.ac-progress-line', el), values);
                        }
                    },
                    text_content: {
                        type: 'storage',
                        defaultValue: 'Bar Counter Title'
                    }
                }
            },
            style_progress: {
                title: 'Progress',
                selector: '.progress-fill-text, .progress-fill-text .progressbar-back-text, .progress-style-classic .progress-value:before, .progress-style-tooltip .progressbar-back-text, .progress-vertical',
                style: {
                    enabled: ['background'],
                    status: ['normal', 'hover']
                    }
            },
            style_percent: {
                title: 'Percent',
                selector: '.progress-vertical .progressbar-back-text, .progress-fill-text .progressbar-back-text, .progress-style-classic .progressbar-back-text, .progress-style-tooltip .progressbar-front-text',
                style: {
                    enabled: ['font'],
                    status: ['normal', 'hover']
                }
            },
            style_progress_bar: {
                title: 'Progress Bar',
                selector: '.progress-value',
                style: {
                    enabled: ['background'],
                    status: ['normal', 'hover']
                }
            },
            style_progress_name: {
                title: 'Progress Name',
                selector: '.ac-progress-line .progress-name',
                style: {
                    enabled: ['font'],
                    status: ['normal', 'hover']
                }
            }
        },
		ready: ready_config
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);