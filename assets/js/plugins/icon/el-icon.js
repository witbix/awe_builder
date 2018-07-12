/**
 * File: el-icon.js
 */
(function($, _$, _window) {
    function ready(el, model) {
        //save data
        $('.ac-icon',el).blur(function(event) {
            var _text = $(this).aweHtml();
            model.setStorageValue('content', _text);
        })
    }

    function changeClass(el, value, elementData) {
        $('.ac-icon', el).removeClass(value['prev']).addClass(value['current']);
    }

    AweBuilder.elementInfo('el-icon', {
        title: 'Icon',
        icon: 'acicon acicon-elm-icon',
        defaultPart: 'icon',
        data: {
            main: {
                style: {
                    enabled:['background', 'border', 'padding', 'margin', 'transform'],
                    status: ['normal', 'hover']
                }
            },
            icon: {
                title: 'Icon',
                selector: '.ac-icon',
                style: {
                    enabled:['font', 'background', 'border', 'padding', 'margin', 'transform'],
                    status: ['normal', 'hover']
                },
                settings: {
                    icon: {
                        type: 'icon',
                        title: 'Chosse Icon',
                        defaultValue: '',
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(typeof values.prev != 'undefined' ){
                                $('.ac-icon > i', el).attr('class', '');
                                $('.ac-icon > i', el).addClass(values.current);
                            }
                        }
                    },
                    style:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Style',
                        options: {
                            'plain': 'Plain',
                            'ac-icon--style-1':'Square',
                            'ac-icon--style-2':'Parallel',
                            'ac-icon--style-3':'Circle',
                            'ac-icon--style-4':'Square corner',
                            'ac-icon--style-6':'Parallel corner'
                        },
                        devices: false,
                        defaultValue: 'plain',
                        change: function($panel, el, values, elementData) {
                            if(typeof values.prev != 'undefined' ){
                                $('.ac-icon', el).removeClass(values.prev).addClass(values.current);
                                if(values.current == 'ac-icon--style-4' || values.current == 'ac-icon--style-6'){
                                    $('.ac-icon ac-icon__style-border', el).remove();
                                }
                                if(values.current == 'ac-icon--style-4' || values.current == 'ac-icon--style-6'){
                                    $('.ac-icon', el).append('<span class="ac-icon__style-border"><span></span><span></span><span></span><span></span></span>');
                                }
                            }
                        }
                    }
                }
            }
        },
        ready: ready
    });
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
