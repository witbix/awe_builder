/**
 * File: el-header.js
 */
(function($, _$, _window) {

    function ready(el, model) {
        $('.ac-header', el).attr('contenteditable', 'true');

        $('.ac-header', el).blur(function(event) {
            var _text = $(this).aweHtml();
            model.setStorageValue('content', _text, 'header');
        })

    }

    function changeClass(el, value) {
        $('.ac-header', el).removeClass(value['prev']).addClass(value['current']);
    }

    AweBuilder.elementInfo('el-header', {
        title: 'Header',
        icon: 'acicon acicon-elm-header',
        enableEditor: {
            selector: '.ac-header',
            saveTo: {}
        },
        defaultPart: 'header',
        data: {
            main: {
            style: {
                    enabled: ['background', 'border', 'padding', 'margin']
                }
            },
            header: {
                title: 'Header',
                selector: '.ac-header',
                style: {
                enabled: ['font', 'background', 'border', 'padding', 'margin', 'shadow', 'transform'],
                    status: ['normal']
            },
            settings: {
                content: {
                    type: 'storage',
                    defaultValue: 'Your header goes here',
                },
                tag:{
                    type: 'select',
                    inlineTitle: true,
                    title: 'Tag',
                    options: {
                        h1: 'H1',
                        h2: 'H2',
                        h3: 'H3',
                        h4: 'H4',
                        h5: 'H5',
                        h6: 'H6',
                    },
                    devices: false,
                    defaultValue: 'h2',
                    change: function($panel, el, values, element) {
                        if(values.prev != undefined){
                            var _self = $('.ac-header', el),
                            elementData = element.getSettingsAttr('main.settings');
                            elementData.content = $('.ac-header', el).aweHtml();
                            _self.replaceWith( "<"+values.current+" class=\"ac-header\" contenteditable=\"true\">" + elementData.content + "</"+values.current+">" );
                            element.getView().reinitEditor('.ac-header');

                        }
                    }
                    }
                }
            }
        },
        ready: ready
    });
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
