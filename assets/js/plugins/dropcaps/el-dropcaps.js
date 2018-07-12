/**
 * File: el-dropcaps.js
 */
(function($, _$, _window) {

    function ready_config(el, model) {

        var edit_description = $('.description', el),
            $first_letter = $('.first-letter', el);
        edit_description.attr('contenteditable', 'true');
        $first_letter.attr('contenteditable', 'true');
        edit_description.blur(function(event) {
            var _text = $(this).aweHtml();
            _text = _text.replace(/(<p[^>]*>|<\/p>)/g, "");
            model.setStorageValue('description', _text, 'main');
        });
        $first_letter.blur(function(event) {
            var _text = $(this).text();
            model.setStorageValue('character', _text, 'main');
        });
    }
    function changeClass($selector, values) {
        $selector.removeClass(values['prev']).addClass(values['current']);
    }
	AweBuilder.elementInfo('el-dropcaps', {
		title: 'Dropcaps',
		icon: 'acicon acicon-elm-dropcaps',
        enableEditor: [{
                selector: '.description, .first-letter',
                saveTo: {}
            }],
        data: {
            main: {
                style: {
                    enabled: ['font','border','padding','margin','shadow'],
                    status: ['normal']
                },
                settings: {
                    style:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Style',
                        options: {
                            'dropcaps-normal': 'Normal',
                            'dropcaps-square': 'Square',
                            'dropcaps-rounded': 'Circle'
                        },
                        devices: false,
                        defaultValue: 'dropcaps-normal',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                changeClass($('.first-letter', el), values)
                        }
                    },
                    character: {
                        type: 'storage',
                        defaultValue: 'D',
                    },
                    description: {
                        type: 'storage',
                        defaultValue: 'escription this dropcaps',
                    }
                }
            },
            dropcaps: {
                title: 'Capital text',
                selector: '.first-letter',
                style: {
                    enabled: ['font','background','border','padding','margin', 'shadow'],
                    status: ['normal','hover']
                }
            },
            description: {
                title: 'Text',
                selector: '.description',
                style: {
                    enabled: ['font'],
                    status: ['normal','hover']
                }
            }
        },
		ready: ready_config
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
