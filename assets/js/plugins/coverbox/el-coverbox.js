/**
 * File: el-coverbox.js
 */
(function($, _$, _window) {  

    function initConverBox($selector, element) {
        $children = $selector.children('.cover-box');
        $children.css({'clear': '', 'min-height':''});
        var oldCol = 0;
        
        $(window).on('resize load', function () {
            var numCol = returnNumcol();

            if (numCol === 0) {
                $children.removeClass('active').addClass('normal-style').css({
                    'width': '100%',
                    'margin-right': '0%'
                });
                oldCol = numCol;
            }else if (!(numCol === oldCol)) {
                
                if (numCol === 1) {
                    $children.elinitBox(numCol);
                    $children.elactiveBox(numCol);
                }
                else {
                    $children.elinitBox(numCol);
                    $children.filter(function (index) {
                        return index % numCol === 0;
                    }).elactiveBox(numCol).css('clear', 'left');

                }
                oldCol = numCol;
            }
            
            // set min height fix for small image
            var maxHeight = 0;
            $children.each(function(){
                if(($(this).hasClass('active') || $(this).hasClass('normal-style')) && numCol > 1){
                    var item_height = $(this).height(), item_content_height = $(this).find('.cover-box-content').height(),
                        maxH = (item_height >= item_content_height) ? item_height:item_content_height;
                    if(maxHeight < maxH)
                        maxHeight = maxH;
                }
            });
            $children.css('min-height',maxHeight + 'px');
        });
        
        $children.on('mouseover', function () {
            var numCol = returnNumcol();
            if (numCol > 0 && !($(this).hasClass('active'))) {
                var From = parseInt($(this).index() / numCol, 10) * numCol;
                $children.slice(From, From + numCol).eldeactiveBox();
                $(this).elactiveBox(numCol);
            }
        });

        function returnNumcol() {
            var desktops_large    = element.getSettingsAttr("main.settings.desktops_large"),
                desktops_medium  = element.getSettingsAttr("main.settings.desktops_medium"),
                tablets  = element.getSettingsAttr("main.settings.tablets"),
                phones  = element.getSettingsAttr("main.settings.phones");
            
            var WW = window.innerWidth;
            var numCol = 0;
            if (WW >= 480) {
                numCol = phones || numCol;
            }
            if (WW >= 768) {
                numCol = tablets || numCol;
            }
            if (WW >= 1020) {
                numCol = desktops_medium || numCol;
            }
            if (WW >= 1230) {
                numCol = desktops_large || numCol;
            }
            return numCol;
        }

        $.fn.elinitBox = function (numCol) {
            $(this).removeClass('active normal-style');
            $(this).css({
                'width': 100 / (numCol + 1) + '%',
                'margin-right': '0%'
            });
        };
        $.fn.elactiveBox = function (numCol) {
            $(this).addClass('active');
            $(this).css('margin-right', 100 / (numCol + 1) + '%');
            return this;
        };
        $.fn.eldeactiveBox = function () {
            $(this).removeClass('active');
            $(this).css('margin-right', '0');
            return this;
        }
    }

    function renderConverBox(el, model) {
        $(".cover-box-wrapper",el).each(function(){
            initConverBox($(this), model);
            $(window).trigger('resize');
        });
    }

    function ready_config(el, model) {
        renderConverBox(el, model)
    }
    
    function changeClass($selector, values) {
        $selector.removeClass(values['prev']).addClass(values['current']);
    }

	AweBuilder.elementInfo('el-coverbox', {
		title: 'CoverBox',
		icon: 'acicon acicon-coverbox',
        data: {
            main: {
                style: {
                    enabled: ['background','border','padding','margin'],
                    status: ['normal'],
                },
                settings: {
                    desktops_large: {
                        type: "ranger",
                        title: 'Desktops Large',
                        widthNumber: 2,
                        min: 1,
                        max: 6,
                        devices: false,
                        defaultValue: 2,
                        unit: '',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                renderConverBox(el, element)
                        }
                    },
                    desktops_medium: {
                        type: "ranger",
                        title: 'Desktops Medium',
                        widthNumber: 2,
                        min: 1,
                        max: 6,
                        devices: false,
                        defaultValue: 2,
                        unit: '',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                renderConverBox(el, element)
                        }
                    },
                    tablets: {
                        type: "ranger",
                        title: 'Tablets',
                        widthNumber: 2,
                        min: 1,
                        max: 6,
                        devices: false,
                        defaultValue: 2,
                        unit: '',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                renderConverBox(el, element)
                        }
                    },
                    phones: {
                        type: "ranger",
                        title: 'Phones',
                        widthNumber: 2,
                        min: 1,
                        max: 6,
                        devices: false,
                        defaultValue: 1,
                        unit: '',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                renderConverBox(el, element)
                        }
                    },
                    
                    element_value: {
                        type: 'attributes',
                        title: 'Add Element',
                        devices: false,
                        formElements: {
                            thumb_upload: {
                                title: 'Picture',
                                type: 'fileselector',
                                defaultValue: {
                                    fid: -1,
                                    url: ''
                                },
                                devices: false,
                            },
                            choose_icon: {
                                type: 'icon',
                                inlineTitle: true,
                                title: 'Choose Icon',
                                devices: false,
                                defaultValue: '',
                            },
                            title: {
                                type: 'input',
                                title: 'Title',
                                inlineTitle: true,
                                defaultValue: ''
                            },
                            subtitle: {
                                type: 'input',
                                title: 'Subtitle',
                                inlineTitle: true,
                                defaultValue: '',
                            },
                            description: {
                                type: 'textarea',
                                title: "Description",
                                inlineTitle: true,
                                devices: false,
                                defaultValue: ''
                            },
                            button_text: {
                                type: 'input',
                                title: 'Button Text',
                                inlineTitle: true,
                                devices: false,
                                customStyles: {
                                    '.ac_panel-item-general__content': {
                                        'padding-left': '100px'
                                    }
                                },
                                defaultValue: 'Read more',
                            },
                            button_link: {
                                type: 'input',
                                inlineTitle: true,
                                devices: false,
                                title: 'Button Link',
                                customStyles: {
                                    '.ac_panel-item-general__content': {
                                        'padding-left': '100px'
                                    }
                                },
                                defaultValue: '#',
                            },
                            button_target:{
                                type: 'select',
                                inlineTitle: true,
                                devices: false,
                                title: 'Button Target',
                                customStyles: {
                                    '.ac_panel-item-general__content': {
                                        'padding-left': '100px'
                                    }
                                },
                                options: {
                                    '_self': 'Self',
                                    '_parent': 'Parent',
                                    '_top': 'Top',
                                    '_blank': 'Blank',
                                },
                                defaultValue: '_self',
                            },
                        },
                        primaryEl: 'thumb_upload',
                        defaultValue: [],
                        validate: function(values) {
                            if (values.choose_icon === '' || values.title === '' || values.subtitle === '' || values.description === '' || values.button_text === '' || values.button_link === ''){
                                alert('Please complete "picture, Icon, Title, Subtitle, Description, Button Text, Button Link"');
                                return false;
                            }else if(values.thumb_upload != undefined) {
                                if(values.thumb_upload.url === '') {
                                    alert('Please choose picture');
                                    return false;
                                } else {
                                    return true;
                                }
                            }else return true;
                        },
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                // List Coverbox
                                var list_detail = _.template(
                                                        '<% _.each(ListItem, function (ItemInfo){ %>\
                                                           <div class="cover-box">\
                                                                <div class="cover-box-image">\
                                                                    <a href="<%= ItemInfo.button_link %>" target="<%= ItemInfo.button_target %>">\
                                                                        <img src="<%= ItemInfo.thumb_upload.url %>" alt="banner image">\
                                                                        <div class="cover-box-overlay">\
                                                                            <div class="cell-vertical">\
                                                                                <div class="cell-middle">\
                                                                                    <i class="ac-icon <%= ItemInfo.choose_icon %>"></i>\
                                                                                </div>\
                                                                            </div>\
                                                                        </div>\
                                                                    </a>\
                                                                </div>\
                                                                <div class="cover-box-content">\
                                                                    <h4 class="title"><%= ItemInfo.title %></h4>\
                                                                    <div class="subtitle"><%= ItemInfo.subtitle %></div>\
                                                                    <div class="description"><%= ItemInfo.description %></div>\
                                                                    <a class="ac-btn btn" href="<%= ItemInfo.button_link %>" target="<%= ItemInfo.button_target %>"><%= ItemInfo.button_text %></a>\
                                                                </div>\
                                                            </div>\
                                                        <% }); %>'
                                                    );

                                _$('.cover-box-wrapper',el).html(list_detail({ListItem: values.current}));
                                renderConverBox(el, element)
                            }
                        }
                    },
                    enable_subtitle: {
                        type: 'toggle',
                        title: 'Enable Subtitle',
                        inlineTitle: true,
                        devices: false,
                        defaultValue: true,
                        change: function($panel, el, values, element) {
                                if(!values.updateModel){
                                    if (values.current) {
                                            $('.subtitle' , el).show();
                                    } else {
                                            $('.subtitle' , el).hide();
                                    }
                                }
                        }
                    },
                    enable_description: {
                        type: 'toggle',
                        title: 'Enable Description',
                        inlineTitle: true,
                        devices: false,
                        defaultValue: true,
                        change: function($panel, el, values, element) {
                                if(!values.updateModel){
                                    if (values.current) {
                                            $('.description' , el).show();
                                    } else {
                                            $('.description' , el).hide();
                                    }
                                }
                        }
                    },
                    enable_button: {
                        type: 'toggle',
                        title: 'Enable Button',
                        inlineTitle: true,
                        devices: false,
                        defaultValue: true,
                        change: function($panel, el, values, element) {
                                if(!values.updateModel){
                                    if (values.current) {
                                            $('.ac-btn' , el).show();
                                    } else {
                                            $('.ac-btn' , el).hide();
                                    }
                                }
                        }
                    }
                },
            },
            icon: {
                title: 'Icon',
                selector: '.cover-box i',
                style: {
                    enabled: ['font','padding','margin'],
                    status: ['normal','hover'],
                },
            },
            title: {
                title: 'Title',
                selector: '.title',
                style: {
                    enabled: ['font','padding','margin'],
                    status: ['normal','hover'],
                },
            },
            subtitle: {
                title: 'Subtitle',
                selector: '.subtitle',
                style: {
                    enabled: ['font','padding','margin'],
                    status: ['normal','hover'],
                },
            },
            description: {
                title: 'Description',
                selector: '.cover-box .description',
                style: {
                    enabled: ['font','padding','margin'],
                    status: ['normal','hover'],
                },
            },
            button: {
                title: 'Button',
                selector: '.ac-btn',
                style: {
                    enabled: ['font','background','border','padding','margin'],
                    status: ['normal','hover'],
                },
            },
        },
		ready: ready_config
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);