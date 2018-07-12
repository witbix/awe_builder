(function ($, _$, _window) {
    AweBuilder.elementInfo('el_carousel', {
        title: 'Carousel',
        icon: 'acicon acicon-hovercard',
        objClassName: 'CarouselElement',
        data: {
            main: {
                style: {
                    enabled: ['font', 'background','border', 'padding', 'margin', 'shadow'],
                    status: ['normal', 'hover']
                },
                animation:false,
                settings: {
                    responsive:{
                        type: 'group',
                        widget: 'tabs',
                        useParentKey: true,
                        elements: {
                            xl: {
                                type: 'group',
                                title: 'Xl',
                                elements:{
                                    view_items: {
                                        type: 'ranger',
                                        title: 'Items',
                                        widget: 'button',
                                        allowChangeRange: false,
                                        min: 1,
                                        max: 30,
                                        devices: false,
                                        widthNumber: 2,
                                        defaultValue: 1,
                                        unit: '',
                                        change: function($panel, el, values, element) {
                                           if(values.prev != undefined){
                                                element.getView().initCarousel(el, {main:{xl:{view_items:values.current}}});
                                            }
                                        }
                                    }
                                }
                            },
                            lg: {
                                type: 'group',
                                title: 'LG',
                                elements:{
                                    view_items: {
                                        type: 'ranger',
                                        title: 'Items',
                                        widget: 'button',
                                        allowChangeRange: false,
                                        min: 0,
                                        max: 30,
                                        devices: false,
                                        widthNumber: 2,
                                        defaultValue: 0,
                                        unit: '',
                                        change: function($panel, el, values, element) {
                                           if(values.prev != undefined){
                                                element.getView().initCarousel(el, {main:{lg:{view_items:values.current}}});
                                            }
                                        }
                                    }
                                }
                            },
                            md: {
                                type: 'group',
                                title: 'MD',
                                elements:{
                                    view_items: {
                                        type: 'ranger',
                                        title: 'Items',
                                        widget: 'button',
                                        allowChangeRange: false,
                                        min: 0,
                                        max: 30,
                                        devices: false,
                                        widthNumber: 2,
                                        defaultValue: 0,
                                        unit: '',
                                        change: function($panel, el, values, element) {
                                           if(values.prev != undefined){
                                                element.getView().initCarousel(el, {main:{md:{view_items:values.current}}});
                                            }
                                        }
                                    }
                                }
                            },
                            sm: {
                                type: 'group',
                                title: 'SM',
                                elements:{
                                    view_items: {
                                        type: 'ranger',
                                        title: 'Items',
                                        widget: 'button',
                                        allowChangeRange: false,
                                        min: 0,
                                        max: 30,
                                        devices: false,
                                        widthNumber: 2,
                                        defaultValue: 0,
                                        unit: '',
                                        change: function($panel, el, values, element) {
                                           if(values.prev != undefined){
                                                element.getView().initCarousel(el, {main:{sm:{view_items:values.current}}});
                                            }
                                        }
                                    }
                                }
                            },
                            xs: {
                                type: 'group',
                                title: 'XS',
                                elements:{
                                    view_items: {
                                        type: 'ranger',
                                        title: 'Items',
                                        widget: 'button',
                                        allowChangeRange: false,
                                        min: 0,
                                        max: 30,
                                        devices: false,
                                        widthNumber: 2,
                                        defaultValue: 1,
                                        unit: '',
                                        change: function($panel, el, values, element) {
                                           if(values.prev != undefined){
                                                element.getView().initCarousel(el, {main:{xs:{view_items:values.current}}});
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },                    
                    effect:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Effect',
                        options: {
                            none: 'None',
                            fadeOut: 'FadeOut',
                            bounceOut: 'BounceOut',
                            flipOutX: 'FlipOutX',
                            lightSpeedOut: 'LightSpeedOut',
                            rotateOut: 'RotateOut',
                            slideOutUp: 'SlideOutUp',
                            zoomOut: 'ZoomOut',
                            rollOut: 'RollOut',
                        },
                        devices: false,
                        defaultValue: 'none',
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                                element.getView().initCarousel(el, {main:{effect:values.current}});
                            }
                        }
                    },
                    nav:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Pagination',
                        options: {
                            none: 'None',
                            button: 'Button',
                            number: 'Number'
                        },
                        devices: false,
                        defaultValue: 'none',
                        customStyles: {
                            '.ac_panel-item-general__content': {
                                'padding-left': '100px'
                            }
                        },
                        change: function($panel, el, values, element) {                            
                            if(values.prev != undefined){
                                element.getView().initCarousel(el, {main:{nav:values.current}});
                            }
                        }
                    },
                    show_control: {
                        type: 'toggle',
                        title: 'Navigation',
                        defaultValue: true,
                        devices: false,
                        inlineTitle: true,
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                               element.getView().initCarousel(el, {main:{show_control:values.current}});
                            }
                        }
                    },
                    loop: {
                        type: 'toggle',
                        title: 'Loop',
                        defaultValue: false,
                        devices: false,
                        inlineTitle: true,
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                               element.getView().initCarousel(el, {main:{loop:values.current}});
                            }
                        }
                    },
                    mouse_drag: {
                        type: 'toggle',
                        title: 'Mouse Drag',
                        defaultValue: true,
                        devices: false,
                        inlineTitle: true,
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                               element.getView().initCarousel(el, {main:{mouse_drag:values.current}});
                            }
                        }
                    },
                    touch_drag: {
                        type: 'toggle',
                        title: 'Touch Drag',
                        defaultValue: true,
                        devices: false,
                        inlineTitle: true,
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                               element.getView().initCarousel(el, {main:{touch_drag:values.current}});
                            }
                        }
                    },
                    auto_play: {
                        type: 'toggle',
                        title: 'AutoPlay',
                        defaultValue: false,
                        devices: false,
                        inlineTitle: true,
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                                element.getView().initCarousel(el, {main:{auto_play:values.current}});
                            }
                        }
                    },
                    stop_hover: {
                        type: 'toggle',
                        title: 'Stop On Hover',
                        defaultValue: false,
                        devices: false,
                        inlineTitle: true,
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                                element.getView().initCarousel(el, {main:{stop_hover:values.current}});
                            }
                        }
                    },
                    speed: {
                        type: 'ranger',
                        widthNumber: 2,
                        title: 'Speed',
                        min: 2000,
                        max: 10000,
                        defaultValue: 4000,
                        unit: 'ms',
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                                element.getView().initCarousel(el, {main:{speed:values.current}});
                            }
                        }
                    },
                    transpeed: {
                        type: 'ranger',
                        widthNumber: 2,
                        title: 'TranSpeed',
                        min: 0,
                        max: 10000,
                        defaultValue: 400,
                        unit: 'ms',
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                                element.getView().initCarousel(el, {main:{transpeed:values.current}});
                            }
                        }
                    }
                }
            }
        }
    });
})(jQuery, AweBuilder._jQuery, AweBuilder._window);