/**
 * File: el-counter.js
 */
(function($, _$, _window) {
    function ready_config(el, model) {
        changeText(el, model);
    }
    function changeClass($selector, values) {
        $selector.removeClass(values['prev']).addClass(values['current']);
    }
    function changeText(el, model) {
        var edit_number = $('.counter-value span', el);
        edit_number.attr('contenteditable', 'true');
        edit_number.blur(function(event) {
            var _text = $(this).text();
            model.setStorageValue('counter_number', _text, 'main');
        });

        var edit_title = $('.counter-title', el);
        edit_title.attr('contenteditable', 'true');
        edit_title.blur(function(event) {
            var _text = $(this).text();
            model.setStorageValue('counter_title', _text, 'main');
        });

        var edit_description = $('.counter-description', el);
        edit_description.attr('contenteditable', 'true');
        edit_description.blur(function(event) {
            var _text = $(this).text();
            model.setStorageValue('counter_description', _text, 'main');
        });
    }
    function initCounter(el, element) {
        var contentTemplate = _.template(
                        '<div class="ac-counter">\
                            <% _.each(main_order_counter, function (value, key){ %>\
                                <% if(value == "order_icon" && main_icon_enable) { %>\
                                    <i class="ac-icon <%= main_choose_icon %>"></i>\
                                <% } %>\
                                <% if(value == "order_number") { %>\
                                    <div class="counter-value" data-from="0" data-to="<%= main_counter_number %>" data-speed="1000">\
                                        <span><%= main_counter_number %></span>\
                                    </div>\
                                <% } %>\
                                <% if(value == "order_title" && main_enable_title) { %>\
                                    <div class="counter-title"><%= main_counter_title %></div>\
                                <% } %>\
                                <% if(value == "order_description" && main_enable_description) { %>\
                                    <div class="counter-description"><%= main_counter_description %></div>\
                                <% } %>\
                            <% }); %>\
                        </div>'
                        ),
            options = {
                            main_counter_number: element.getSettingsAttr("main.settings.counter_number"),
                            main_icon_enable: element.getSettingsAttr("main.settings.icon_enable"),
                            main_choose_icon: element.getSettingsAttr("main.settings.icon_option.choose_icon"),                           
                            main_enable_title: element.getSettingsAttr("main.settings.enable_title"),
                            main_counter_title: element.getSettingsAttr("main.settings.counter_title"),
                            main_enable_description: element.getSettingsAttr("main.settings.enable_description"),
                            main_counter_description: element.getSettingsAttr("main.settings.counter_description"),
                            main_order_counter: element.getSettingsAttr("main.settings.order_counter"),
                        };

            _$('.js-el-content',el).html(contentTemplate(options));

            changeText(el, element);
            element.getView().reinitEditor('.counter-value span');
            element.getView().reinitEditor('.counter-title');
            element.getView().reinitEditor('.counter-description');
    }

	AweBuilder.elementInfo('el-counter', {
		title: 'Counter',
		icon: 'acicon acicon-counter',
        enableEditor: [{
                selector: '.counter-value span',
                saveTo: {}
            },{
                selector: '.counter-title',
                saveTo: {}
            },{
            selector: '.counter-description',
            saveTo: {}
        }],
        data: {
            main: {
                style: {
                    enabled: ['border','padding','margin'],
                    status: ['normal'],
                },
                settings: {
                    order_counter: {
                        type: 'order',
                        title: "Order",
                        options: {
                            'order_icon': 'Icon',
                            'order_number': 'Number',
                            'order_title': 'Title',
                            'order_description': 'Description',
                        },
                        defaultValue: ["order_icon", "order_number", "order_title", "order_description"],
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                initCounter(el, element);
                        }
                    },
                    counter_number: {
                        type: 'storage',
                        defaultValue: '752',
                    },
                    icon_enable: {
                        type: 'toggle',
                        title: 'Enable Icon',
                        inlineTitle: true,
                        className: 'enable-icon',
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                initCounter(el, element);

                            if (values.current) {
                                $('.icon-option', $panel).show();
                            } else {
                                $('.icon-option', $panel).hide();
                            }
                        }
                    },
                    icon_option: {
                        type: 'group',
                        className: 'icon-option',
                        elements: {
                            choose_icon: {
                                type: 'icon',
                                inlineTitle: false,
                                title: 'Choose Icon',
                                className: 'choose-icon',
                                devices: false,
                                defaultValue: '',
                                change: function($panel, el, values, element) {
                                    if(!values.updateModel)
                                        changeClass($('.ac-counter i', el), values);
                                }
                            }
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
                                if(!values.updateModel)
                                    initCounter(el, element);
                        }
                    },
                    counter_title: {
                        type: 'storage',
                        defaultValue: 'Counter Title',
                    },
                    enable_description: {
                        type: 'toggle',
                        title: 'Enable Description',
                        inlineTitle: true,
                        className: 'enable-description',
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {                                
                                if(!values.updateModel)
                                    initCounter(el, element);
                        }
                    },
                    counter_description: {
                        type: 'storage',
                        defaultValue: 'Counter Description',
                    }
                }
            },
            number: {
                title: 'Number',
                selector: '.counter-value',
                style: {
                    enabled: ['font','padding','margin'],
                    status: ['normal','hover'],
                },
            },
            icon: {
                title: 'Icon',
                selector: '.ac-icon',
                style: {
                    enabled: ['font'],
                    status: ['normal','hover'],
                },
            },
            text: {
                title: 'Title',
                selector: '.counter-title',
                style: {
                    enabled: ['font','padding','margin'],
                    status: ['normal','hover'],
                },
            },
            description: {
                title: 'Description',
                selector: '.counter-description',
                style: {
                    enabled: ['font','padding','margin'],
                    status: ['normal','hover'],
                },
            },
        },
		ready: ready_config
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);