/**
 * File: el-pinterest.js
 * https://developers.pinterest.com/tools/widget-builder/
 */
(function($, _$, _window) {
    function ready(el, model) {
        if(_window.PinUtils)
            _window.PinUtils.build();
    }

    function iframePinterset(el, element) {
        var pinterestUrl = element.getSettingsAttr("main.settings.pinterest_link"),
            PinWidth = element.getSettingsAttr("main.settings.pinterest_width"),
            Follow = element.getSettingsAttr("main.settings.pinterest_follow"),
            BoadWidth = element.getSettingsAttr("main.settings.pinterest_boad_width"),
            ScaleHeight = element.getSettingsAttr("main.settings.pinterest_scale_height"),
            ScaleWidth = element.getSettingsAttr("main.settings.pinterest_scale_width");

        if(pinterestUrl.indexOf('/pin/') != -1){
              $('.ac-pinterest', el).html('<a data-pin-do="embedPin" data-pin-width="'+PinWidth+'" href="'+pinterestUrl+'">Pinterest</a>');
        }else if(pinterestUrl.indexOf('/pinterest/') != -1){
            if (Follow=='embed') {
              $('.ac-pinterest', el).html('<a data-pin-do="embedBoard" data-pin-board-width="'+BoadWidth+'" data-pin-scale-height="'+ScaleHeight+'" data-pin-scale-width="'+ScaleWidth+'" href="'+pinterestUrl+'">Pinterest</a>');
            }else{
              $('.ac-pinterest', el).html('<a data-pin-do="buttonFollow" href="'+pinterestUrl+'">Pinterest</a>');
            }
        }else{
            if (Follow=='embed') {
              $('.ac-pinterest', el).html('<a data-pin-do="embedUser" data-pin-board-width="'+BoadWidth+'" data-pin-scale-height="'+ScaleHeight+'" data-pin-scale-width="'+ScaleWidth+'" href="'+pinterestUrl+'">Pinterest</a>');
            }else{
              $('.ac-pinterest', el).html('<a data-pin-do="buttonFollow" href="'+pinterestUrl+'">Pinterest</a>');
            }
        }
        // document.getElementsByTagName("iframe")[0].contentWindow.PinUtils.build();
        _window.PinUtils.build();

    }
    function changeClass($selector, values) {
        $selector.removeClass(values['prev']).addClass(values['current']);
    }


	AweBuilder.elementInfo('el-pinterest', {
		title: 'Pinterest',
		icon: 'acicon acicon-elm-pinterest',
        data: {
            main: {
                style: {
                    enabled: ['background','border','padding','margin'],
                    status: ['normal','hover']
                },
                settings: {
                    pinterest_link: {
                        type: "input",
                        title: "Link",
                        inlineTitle: true,
                        devices: false,
                        defaultValue: "https://www.pinterest.com/pinterest/summer-fun/",
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                iframePinterset(el, element);
                            }

                            // view panel
                            if(values.current.indexOf('/pin/') != -1){
                              $('.pinterest-width', $panel).show();
                              $('.pinterest-follow, .boad-width, .scale-height, .scale-width', $panel).hide();
                            }else{
                              $('.pinterest-width').hide();
                              $('.pinterest-follow').show();
                                if (element.getSettingsAttr("main.settings.pinterest_follow") == 'embed') {
                                    $('.boad-width, .scale-height, .scale-width', $panel).show()
                                }
                            }
                        }
                    },
                    pinterest_align:{
                        title: 'Align',
                        type: 'select',
                        inlineTitle: true,
                        options: {
                            "ac-align-left":  "Left",
                            "ac-align-right":  "Right",
                            "ac-align-center":  "Center",
                        },
                        devices: false,
                        defaultValue: 'ac-align-center',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                changeClass($('.ac-pinterest' , el), values);
                        }
                    },
                    pinterest_width: {
                        type: "select",
                        className: 'pinterest-width',
                        title: "Size",
                        inlineTitle: true,
                        options: {
                            "small":"Small",
                            "medium": "Medium",
                            "large": "Large",
                        },
                        defaultValue: "small",
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                iframePinterset(el, element);
                            }
                        }
                    },
                    pinterest_follow: {
                        type: "select",
                        className: 'pinterest-follow',
                        title: "Follow",
                        inlineTitle: true,
                        options: {
                            "embed": "Embed",
                            "button": "Button",
                        },
                        defaultValue: "embed",
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                iframePinterset(el, element);
                            }

                            // view panel
                            if (element.getSettingsAttr("main.settings.pinterest_link").indexOf('/pin/') == -1) {
                                if (values.current == 'embed') {
                                    $('.boad-width, .scale-height, .scale-width', $panel).show()
                                } else {
                                    $('.boad-width, .scale-height, .scale-width', $panel).hide()
                                }
                            }
                        }
                    },
                    pinterest_boad_width: {
                        type: "ranger",
                        className: 'boad-width',
                        title: "Board width",
                        widthNumber: 2,
                        unit: 'px',
                        min: 130,
                        max: 1000,
                        defaultValue: 400,
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                iframePinterset(el, element);
                            }
                        }
                    },
                    pinterest_scale_height: {
                        type: "ranger",
                        className: 'scale-height',
                        title: "Scale Height",
                        widthNumber: 2,
                        unit: 'px',
                        min: 60,
                        max: 1000,
                        defaultValue: 240,
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                iframePinterset(el, element);
                            }
                        }
                    },
                    pinterest_scale_width: {
                        type: "ranger",
                        className: 'scale-width',
                        title: "Scale Width",
                        widthNumber: 2,
                        unit: 'px',
                        min: 60,
                        max: 1000,
                        defaultValue: 80,
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                iframePinterset(el, element);
                            }
                        }
                    }
                }
            }
        },
        ready: ready
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
