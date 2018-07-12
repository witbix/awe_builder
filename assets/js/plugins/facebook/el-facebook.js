/**
 * File: el-facebook.js
 * https://developers.facebook.com/docs/plugins/page-plugin
 */
(function($, _$, _window) {


    function ready_config(el, model) {}

    function iframeFacebook(el, element) {

        // set link for iframe
        var linkFacebook = element.getSettingsAttr("main.settings.facebook_link"),
            friendface = element.getSettingsAttr("main.settings.facebook_friends_face"),
            headerface = element.getSettingsAttr("main.settings.facebook_header"),
            // fluidface = model.getSettingsAttr("main.settings.facebook_full"),
            coverface = element.getSettingsAttr("main.settings.facebook_cover"),
            tabface = element.getSettingsAttr("main.settings.facebook_tab"),
            widthface = element.getSettingsAttr("main.settings.facebook_width"),
            heightface = element.getSettingsAttr("main.settings.facebook_height");


            var srcIframe = '//www.facebook.com/plugins/likebox.php?href=';
                srcIframe += linkFacebook;
                srcIframe += friendface ? '&show_facepile=true' : '&show_facepile=false';
                srcIframe += headerface ? '&small_header=true' : '&small_header=false';
                // srcIframe += fluidface ? '&adapt_container_width=true' : '&adapt_container_width=false';
                srcIframe += coverface ? '&hide_cover=false' : '&hide_cover=true';
                srcIframe += tabface ? '&tabs='+tabface : '';
                srcIframe += widthface!= 180 ? '&width=' + parseInt(widthface) : '';
                srcIframe += heightface!= 70 ? '&height=' + parseInt(heightface) : '';


            $('iframe' , el).attr('src', srcIframe).css({
                    width: widthface == 180 ? '' : (widthface),
                    height: heightface == 70 ? '' : (heightface)
                });

        element.setStorageValue('ember_url', srcIframe, 'main');
    }
    function changeClass($selector, values) {
        $selector.removeClass(values['prev']).addClass(values['current']);
    }


	AweBuilder.elementInfo('el-facebook', {
		title: 'Facebook',
		icon: 'acicon acicon-elm-facebook',
        data: {
            main: {
                style: {
                    enabled: ['background','border','padding','margin'],
                    status: ['normal','hover'],
                },
                settings: {
                    ember_url: {
                        type: 'storage',
                        defaultValue: 'http://www.facebook.com/plugins/likebox.php?href=https://www.facebook.com/megadrupal&tabs=timeline&width=310&height=310',
                        title: 'Content'
                    },
                    facebook_link: {
                        type: "input",
                        title: "Link",
                        inlineTitle: true,
                        devices: false,
                        defaultValue: "https://www.facebook.com/megadrupal",
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeFacebook(el, element)
                        }
                    },
                    facebook_width: {
                        type: "ranger",
                        title: 'Width',
                        widthNumber: 2,
                        min: 180,
                        max: 500,
                        devices: false,
                        defaultValue: 310,
                        unit: 'px',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeFacebook(el, element)
                        }
                    },
                    facebook_height: {
                        type: "ranger",
                        title: 'Height',
                        widthNumber: 2,
                        min: 70,
                        max: 1000,
                        devices: false,
                        defaultValue: 310,
                        unit: 'px',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeFacebook(el, element)
                        }
                    },
                    facebook_align:{
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
                            changeClass($('.ac-facebook' , el), values);
                        }
                    },
                    // facebook_full: {
                    //     type: 'toggle',
                    //     title: 'Width Fluid',
                    //     devices: false,
                    //     defaultValue: false,
                    //     change: function($panel, el, values, element) {
                    //         iframeFacebook(el, element)
                    //     }
                    // },
                    facebook_cover: {
                        type: 'toggle',
                        title: 'Show cover photo',
                        devices: false,
                        defaultValue: true,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeFacebook(el, element)
                        }
                    },
                    facebook_friends_face: {
                        type: 'toggle',
                        title: 'Show Friends\' Faces',
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeFacebook(el, element)
                        }
                    },
                    facebook_header: {
                        type: 'toggle',
                        title: 'Small Header',
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeFacebook(el, element)
                        }
                    },
                    facebook_tab: {
                        type: 'checkboxes',
                        title: 'Tabs',
                        options: {
                            'timeline': 'Timeline',
                            'events': 'Events',
                            'messages': 'Messages',
                        },
                        defaultValue: ["timeline"],
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeFacebook(el, element)
                        }
                    }
                }
            }
        },
        ready: ready_config
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
