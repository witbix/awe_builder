/**
 * File: el-text.js
 */
(function($,_$, _window) { 
    function initJustifiedGrid(el, option, element){
        var default_option;
        if(_$(el).data('gallery_option'))
            default_option = _$(el).data('gallery_option')
        else
            default_option = {
                main:{
                    enable_lightbox:false,
                    gap:10,
                    row_height:200,
                    images:[],
                    captions:[]
                },
                caption:{
                    enable:true,
                    on_lightbox:false
                }
            }; 
        var default_image = 'elements/justified-grid/assets/blank.jpg';
        
        if(option.main)
            default_option.main = $.extend(default_option.main, option.main);
        if(option.caption)
            default_option.caption = $.extend(default_option.caption, option.caption);
        _$(el).data('gallery_option', default_option);
        
       
        
        var $list_wrapper = _$(el).find('.js-ac_el-justified'),
            $wrapper_grid = _$('.js-ac_el-justified-wrapper',el);
    
        // render row height and gap
        $wrapper_grid.data('row-height',default_option.main.row_height).data('gallery-gap',default_option.main.gap);
        
        // render images item
        var _template = _.template('<div class="grid-item"><i class="acicon acicon-move js-item-move"></i>\
                                    <img src="<%= url %>" alt="">\
                                    <div class="js-caption caption"><%= caption %></div>\
                                </div>');
        
        if(option.reset === undefined || option.reset === true){
             if(!(option.ready === true && !default_option.main.images.length)){                
                $list_wrapper.find('.grid-item').remove();
            }
            $(default_option.main.images).each(function(key, image){
                var $item = _$(_template({
                        url:image.url,
                        caption: default_option.main.captions[key] ? default_option.main.captions[key] : 'Caption here'
                    }));

                // enable lightbox
                if(default_option.main.enable_lightbox){
                    $item.find('img').wrap('<a href="'+image.url+'" class="mgf-md-popup js-lightbox"></a>')
                }
                $list_wrapper.append($item);
            });
            
            // create editor
            $('.js-caption', el).attr('contenteditable', 'true');
            element.getView().reinitEditor('.js-caption');
            //save data caption
            $('.js-caption',el).blur(function(event) {
                var default_option = _$(el).data('gallery_option')
                $('.js-caption',el).each(function(key, item){
                    default_option.main.captions[key] =  $(item).aweHtml();
                });            
                element.setStorageValue('captions', default_option.main.captions,'main');
                _$(el).data('gallery_option', default_option);
            });            
        }
        //console.log(default_option);
        // create layout
        initGrid(el, default_option);
        // create light box
        if(default_option.main.enable_lightbox)
            initLightBox(el);
        // show/hide caption
        if(default_option.caption.enable)
            $('.js-caption', el).show();
        else {
            $('.js-caption', el).hide();
        }
        if(default_option.caption.enable && default_option.caption.on_lightbox)
            $('.js-caption', el).attr('data-on-lightbox', true);
        else
            $('.js-caption', el).attr('data-on-lightbox', false);
    }
    
    function initGrid(el, option){
        var $list_wrapper = _$(el).find('.js-ac_el-justified-wrapper');
        
        if(_$.fn.imagesLoaded && _$.fn.justifiedGallery){
            $list_wrapper.imagesLoaded(function() {
                var $justified = _$('.ac_el-justified', el),
                    setRowHeight = $list_wrapper.data('row-height'),
                    setmargins = $list_wrapper.data('gallery-gap');
                $list_wrapper.css('margin', -setmargins);
                $justified.justifiedGallery({
                    rowHeight: setRowHeight,
                    lastRow : 'justify',
                    margins: setmargins
                });
                
                //fix error show caption where mouse hover
                if(!option.caption.enable){
                    setTimeout(function(){
                        $('.js-caption, .caption', el).remove();
                    },400);                    
                }
            });
        }    
    }
    
    function initLightBox(el){   
        if(_$.fn.magnificPopup){
             _$(el).find('.js-lightbox').magnificPopup({
                type: 'image',
                removalDelay: 300,
                mainClass: 'mfp-fade',
                gallery:{
                    enabled:true,
                    preload: [0, 2],
                    navigateByImgClick: true
                },
                zoom: {
                    enabled: true,
                },
                callbacks: {
                    markupParse: function (template, values, item) {
                        var $caption = item.el.closest('.grid-item').find('.js-caption');
                        if ($caption.attr('data-on-lightbox') == 'true')
                            values.title = $('<div />').html($caption.text()).css('color', '#fff');
                        else
                            values.title = '';
                    }
                }
            });
        }
    }
    
    function ready(el, model) {
        var settings = model.get('settings');
        var option = {
            main:settings.main.settings ? settings.main.settings : {},
            caption:settings.caption.settings ? settings.caption.settings : {},
            ready:true
        };        
        initJustifiedGrid(el, option, model);    
    }

    function changeClass(el, value) {
        $('.js-ac_image', el).removeClass(value['prev']).addClass(value['current']);
    }


    AweBuilder.elementInfo('el-justified-grid', {
        title: 'Justified grid',
        icon: 'acicon acicon-gallery',
        enableEditor: {
            selector: '.js-caption',
            saveTo: {}
        },
        data: {
            main: {
                style: {
                    enabled: ['background','border', 'padding', 'margin', 'shadow'],
                    status: ['normal', 'hover']
                },
                settings: {                                        
                    images: {
                        type: 'fileselector',
                        title: 'Image',
                        defaultValue: [],
                        devices: false,
                        widget: 'multi',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                var option = {main:{images:values.current}};
                                if(values.eventValue){
                                    if(values.eventValue.action == 'delete'){
                                        _$('.grid-item:eq('+ values.index +')').remove();
                                        option.reset = false;
                                    } else if(values.eventValue.action == 'sort'){
                                        var default_option = _$(el).data('gallery_option');
                                        if(default_option){
                                            var captions = default_option.main.captions,
                                                caption_sort = captions[values.eventValue.before];
                                            captions[values.eventValue.before] = captions[values.eventValue.after];
                                            captions[values.eventValue.after] = caption_sort;
                                            option.main.captions = captions;
                                            element.setStorageValue('captions', captions,'main');
                                        }
                                    }
                                }
                                initJustifiedGrid(el, option, element);
                            }
                        }
                    },                   
                    gap: {
                        type: 'ranger',
                        title: 'Images gap',
                        allowChangeRange: false,
                        min: 0,
                        max: 200,
                        devices: false,
                        widthNumber: 2,
                        defaultValue: 10,
                        unit: '',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                initJustifiedGrid(el, {main:{gap:values.current}, reset:false}, element);
                            }
                        }
                    },
                   row_height: {
                        type: 'ranger',
                        title: 'Row height',
                        allowChangeRange: false,
                        min: 0,
                        max: 500,
                        devices: false,
                        widthNumber: 2,
                        defaultValue: 200,
                        unit: '',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                initJustifiedGrid(el, {main:{row_height:values.current}, reset:false}, element);
                            }
                        }
                    },
                    enable_lightbox: {
                        type: 'toggle',
                        title: 'Enable Lightbox',
                        defaultValue: false,
                        devices: false,
                        change: function($panel, el, values, element) { 
                            if(!values.updateModel)
                                initJustifiedGrid(el, {main:{enable_lightbox:values.current}}, element);
                        }
                    }
                }
            },
            caption:{
                title: 'Caption',
                selector: '.js-caption',
                style: {
                    enabled: ['font', 'background', 'border', 'padding', 'margin', 'shadow'],
                    status: ['normal', 'hover']
                },
                settings: {
                    enable: {
                        type: 'toggle',
                        title: 'Enable caption',
                        defaultValue: true,
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                initJustifiedGrid(el, {caption:{enable:values.current}}, element);
                            }
                        }
                    },
                    on_lightbox: {
                        type: 'toggle',
                        title: 'Caption on lightbox',
                        defaultValue: false,
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                initJustifiedGrid(el, {caption:{on_lightbox:values.current}, reset:false}, element);
                            }
                        }
                    }
                }
            }
        },
        ready: ready
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);