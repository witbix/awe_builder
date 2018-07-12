/**
 * File: el-text.js
 */
(function($, _$, _window) {
	AweBuilder.elementInfo('el-html', {
		title: 'Html',
		icon: 'acicon acicon-elm-html',
        data: {
            main: {
                style: {
                    enabled: ['background','border','padding','margin'],
                    status: ['normal','hover'],
                },
                settings: {
                    custom_html: {
                        type: 'textarea',
                        fireEvent: 'blur',
                        title: "HTML Custom",
                        inlineTitle: true,
                        devices: false,
                        customStyles: {
                            '.ac_textarea textarea': {
                                'height': '320px'
                            }
                        },
                        defaultValue: '<b>Custom Code HTML</b>',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                $('.ac-html' , el).html(values.current);
                        }
                    },
                },
            },
        }
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
