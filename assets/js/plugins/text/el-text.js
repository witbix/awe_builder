/**
 * File: el-text.js
 */
(function($, _$, _window) {
    function ready(el, model) {
        $('.ac-text', el).attr('contenteditable', 'true');
        //save data
        $('.ac-text', el).blur(function(event) {
            var _text = $(this).aweHtml();
            model.setStorageValue('content', _text, 'text');
        });
    }

    function changeClass(el, value) {
        $('.ac-text', el).removeClass(value['prev']).addClass(value['current']);
    }


	AweBuilder.elementInfo('el-text', {
		title: 'Text',
		icon: 'acicon acicon-elm-text',
        enableEditor: {
            selector: '.ac-text',
            saveTo: {}
        },
        defaultPart: 'text',
        data: {
            main: {
                style: {
                    enabled: ['background', 'border', 'padding', 'margin']
                }
            },
            text: {
                title: 'Text',
                selector: '.ac-text',
                style: {
                    enabled: ['font', 'background', 'border', 'padding', 'margin', 'shadow', 'transform'],
                    status: ['normal', 'hover']
                },
                settings: {
                    content: {
                        type: 'storage',
                        defaultValue: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.'
                    }
                }
            }
        },
            ready: ready
    });
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
