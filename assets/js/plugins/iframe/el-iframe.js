/**
 * File: el-text.js
 */
(function($, _$, _window) {
    function ready_config(el, model) {}
	AweBuilder.elementInfo('el-iframe', {
		title: 'Iframe',
		icon: 'acicon acicon-elm-iframe',
        data: {
            main: {
                style: {
                    enabled: ['background','border','padding','margin'],
                    status: ['normal'],
                }
            },
            iframe: {
                title: 'Iframe',
                selector: '.ac-iframe',
                style: {
                    enabled: ['background','border','padding','margin'],
                    status: ['normal'],
                },
                settings: {
                    iframe_link: {
                        type: "input",
                        title: "Link",
                        inlineTitle: true,
                        devices: false,
                        defaultValue: "http://megadrupal.com/",
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                $('.ac-iframe' , el).attr('src',values.current);
                        }
                    },
                    iframe_height: {
                        type: "ranger",
                        title: 'Height',
                        widthNumber: 2,
                        min: 0,
                        max: 1000,
                        devices: false,
                        defaultValue: 500,
                        unit: 'px',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                if(values.current!=0)
                                    $('.ac-iframe' , el).css("height",values.current);
                            }

                        }
                    }
                }
            }
        },
		ready: ready_config
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
