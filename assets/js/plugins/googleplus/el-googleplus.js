/**
 * https://developers.google.com/+/web/badge/#badge-types
 */
(function($, _$, _window) {
    function ready(el, model) {
        iframeGoogleplus(el, model);
    }

    function iframeGoogleplus(el, element) {
        var SelectorID = _$(el).find('.iframe-googleplus')[0],
            googleType = element.getSettingsAttr("main.settings.google_type"),
            googleId = element.getSettingsAttr("main.settings.google_id"),
            GoogleWidth = element.getSettingsAttr("main.settings.google_width"),
            GoogleTheme = element.getSettingsAttr("main.settings.google_theme"),
            GoogleLayout = element.getSettingsAttr("main.settings.google_layout"),
            GoogleEnablePhoto = element.getSettingsAttr("main.settings.google_enable_photo"),
            GoogleEnagleTag = element.getSettingsAttr("main.settings.google_enable_tag_line"),
            GoogleEnableAuthor = element.getSettingsAttr("main.settings.google_enable_author_community");

            if(GoogleTheme == undefined)
                GoogleTheme = 'dark';
            var isGapi = setInterval(function(){
                // var IframeGapi = $('.js-ac-buildzone iframe')[0].contentWindow.gapi;
                var IframeGapi = _window.gapi;
                if(IframeGapi){
                    clearInterval(isGapi);
                    var googlePlusUrl = 'https://plus.google.com/' + ((googleType === 'g-community')?'communities/':'') + googleId,
                        plusOption = {
                            "class":googleType,
                            "width": GoogleWidth,
                            "theme": GoogleTheme,
                            "layout": GoogleLayout,
                            "href": googlePlusUrl,
                            "showtagline": GoogleEnagleTag ? 'true':'false'
                        };

                    if(googleType == 'g-community'){
                        plusOption.showphoto = GoogleEnablePhoto ? 'true':'false';
                        plusOption.showowners = GoogleEnableAuthor ? 'true':'false';
                        IframeGapi.community.render(SelectorID, plusOption);
                    }else {
                        plusOption.showcoverphoto = GoogleEnablePhoto ? 'true':'false';
                        if(googleType == "g-page") {
                            IframeGapi.page.render(SelectorID, plusOption);
                        }else{
                            IframeGapi.person.render(SelectorID, plusOption);
                        }
                    }
                    element.setStorageValue('google_link', googlePlusUrl, 'main');
                }
            }, 100);


    }
    function changeClass($selector, values) {
        $selector.removeClass(values['prev']).addClass(values['current']);
    }


	AweBuilder.elementInfo('el-googleplus', {
		title: 'GooglePlus',
		icon: 'acicon acicon-elm-gplus',
        data: {
            main: {
                style: {
                    enabled: ['background','border','padding','margin'],
                    status: ['normal','hover']
                },
                settings: {
                    google_id: {
                        type: "input",
                        title: "ID",
                        inlineTitle: true,
                        defaultValue: "116577497551812504866",
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeGoogleplus(el, element)
                        }
                    },
                    google_width: {
                        type: "ranger",
                        title: "Board Width",
                        widthNumber: 2,
                        unit: 'px',
                        min: 200,
                        max: 1000,
                        defaultValue: 250,
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                element.setStorageValue('google_width', parseInt(values.current), 'main');
                                iframeGoogleplus(el, element)
                            }
                        }
                    },
                    google_type:{
                        title: 'Type',
                        type: 'select',
                        className: 'type-badge',
                        inlineTitle: true,
                        options: {
                            "g-community":  "Community",
                            "g-person":  "Person",
                            "g-page":  "Page"
                        },
                        devices: false,
                        defaultValue: 'g-person',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                iframeGoogleplus(el, element)
                            }

                            if(values.current == 'g-community'){
                                $('.enable-photo, .tag-line, .author-community',$panel).show();
                            }else{
                                $('.enable-photo, .tag-line, .author-community',$panel).hide();
                            }
                        }
                    },
                    google_align:{
                        title: 'Align',
                        type: 'select',
                        inlineTitle: true,
                        options: {
                            "ac-align-left":  "Left",
                            "ac-align-right":  "Right",
                            "ac-align-center":  "Center"
                        },
                        devices: false,
                        defaultValue: 'ac-align-center',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                changeClass($('.ac-googleplus' , el), values);
                        }
                    },
                    google_theme: {
                        type: "select",
                        title: "Theme",
                        inlineTitle: true,
                        options: {
                            "dark": "Dark",
                            "light": "Light",
                        },
                        defaultValue: "dark",
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeGoogleplus(el, element)
                        }
                    },
                    google_layout: {
                        type: "select",
                        title: "Layout",
                        inlineTitle: true,
                        options: {
                            "portrait": "Portrait",
                            "landscape": "Landscape",
                        },
                        defaultValue: "portrait",
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeGoogleplus(el, element)
                        }
                    },
                    google_enable_photo: {
                        type: 'toggle',
                        title: 'Enable Photo',
                        className: 'enable-photo',
                        defaultValue: false,
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeGoogleplus(el, element)
                        }
                    },
                    google_enable_tag_line: {
                        type: 'toggle',
                        title: 'Enable Tag Line',
                        className: 'tag-line',
                        defaultValue: false,
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeGoogleplus(el, element)
                        }
                    },
                    google_enable_author_community: {
                        type: 'toggle',
                        title: 'Enable Author Community',
                        className: 'author-community',
                        defaultValue: false,
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeGoogleplus(el, element)
                        }
                    }
                }
            }
        },
        ready: ready
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
