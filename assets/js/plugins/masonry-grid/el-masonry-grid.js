(function ($, _$, _window) {
    AweBuilder.elementInfo('el_masonry_grid', {
        title: 'Masonry Grid',
        icon: 'acicon acicon-gallery',
        objClassName: 'MasonryElement',
        data: {
            main: {
                style: {
                    enabled: ['font', 'background','border', 'padding', 'margin', 'shadow'],
                    status: ['normal', 'hover']
                },
                animation:false,
                settings: {                
                    column: {
                        type: 'ranger',
                        title: 'Column',
                        widget: 'button',
                        allowChangeRange: false,
                        min: 1,
                        max: 12,
                        devices: false,
                        widthNumber: 2,
                        defaultValue: 4,
                        unit: '',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){                                
                                $('.js-masonry-grid', el).attr('data-col-lg', values.current);
                                element.getView().refreshMasonry();
                            }
                        }
                    },
                    column_responsive: {
                        type: 'toggle',
                        title: 'Enable Column Responsive',
                        defaultValue: false,
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(values.current){
                                $('.el-column_md, .el-column_sm, .el-column_xs', $panel).show();
                                var settings = element.getSettingsAttr('main.settings');
                                $('.js-masonry-grid', el).attr('data-col-md', settings.column_md).attr('data-col-sm', settings.column_sm).attr('data-col-xs', settings.column_xs);
                            }else {
                                 $('.el-column_md, .el-column_sm, .el-column_xs', $panel).hide();
                                 $('.js-masonry-grid', el).removeAttr('data-col-md data-col-sm data-col-xs');
                            }
                            if(!values.updateModel){
                                element.getView().refreshMasonry();
                            }
                        }
                    },                    
                    column_md: {
                        type: 'ranger',
                        title: 'Desktop Small',
                        widget: 'button',
                        allowChangeRange: false,
                        min: 1,
                        max: 10,
                        devices: false,
                        widthNumber: 2,
                        defaultValue: 4,
                        unit: '',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                $('.js-masonry-grid', el).attr('data-col-md', values.current);
                                element.getView().refreshMasonry();
                            }
                        }
                    },
                    column_sm: {
                        type: 'ranger',
                        title: 'Tablet',
                        widget: 'button',
                        allowChangeRange: false,
                        min: 1,
                        max: 8,
                        devices: false,
                        widthNumber: 2,
                        defaultValue: 4,
                        unit: '',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                $('.js-masonry-grid', el).attr('data-col-sm', values.current);
                                element.getView().refreshMasonry();
                            }
                        }
                    },
                    column_xs: {
                        type: 'ranger',
                        title: 'Mobile',
                        widget: 'button',
                        allowChangeRange: false,
                        min: 1,
                        max: 8,
                        devices: false,
                        widthNumber: 2,
                        defaultValue: 4,
                        unit: '',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                $('.js-masonry-grid', el).attr('data-col-xs', values.current);
                                element.getView().refreshMasonry();
                            }
                        }
                    }              
                    
                }
            }
        }
    });
})(jQuery, AweBuilder._jQuery, AweBuilder._window);