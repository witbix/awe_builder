/**
 * File: el-text.js
 */
(function($,_$, _window) {
    function getIndexSelectedStyle(style){
        var list_style = ['','wide', 'high', 'large', 'extra-large'];
        for(var i=0; i<5; i++){
            if(list_style[i] == style)
                return i;
        }
    }
    function initMasonryGrid(el, option, element){
        var default_option;
        if(_$(el).data('gallery_option'))
            default_option = _$(el).data('gallery_option')
        else
            default_option = {
                main:{
                    enable_lightbox:false,
                    column:4,
                    column_responsive:false,
                    column_md:4,
                    column_sm:4,
                    column_xs:4,
                    images:[],
                    class_style:[],
                    margin_image:'5px'
                }
            };
        var default_image = 'elements/masonry-grid/assets/blank.jpg';

        if(option.main)
            default_option.main = $.extend(default_option.main, option.main);
        _$(el).data('gallery_option', default_option);



        var $list_wrapper = _$(el).find('.js-ac_masonry'),
            $wrapper_grid = _$('.js-masonry-grid',el);

        // render column
        $wrapper_grid.attr('data-col-lg',default_option.main.column);
        if(default_option.main.column_responsive){
            $wrapper_grid.attr('data-col-md',default_option.main.column_md).attr('data-col-sm',default_option.main.column_sm).attr('data-col-xs',default_option.main.column_xs);
        } else {
            $wrapper_grid.removeAttr('data-col-md data-col-sm data-col-xs');
        }

        // render images item
        var _template = _.template('<div class="grid-item js-grid-item <%= class_style %>">\
                         <div class="grid-item__inner">\
                             <div class="grid-item__content-wrapper">\
                                 <div class="image-cover" style="background-image: url(\'<%= url %>\');">\
                                    <img src="<%= url %>" alt="">\
                                 </div>\
                                 <div class="ac_inline-control" style="left:12px; display:inline-block">\
                                    <ul class="js-class-style">\
                                        <li class="js-settings-list" style="display:none;" title="Settings" data-style-item="settings">\
                                            <i class="acicon acicon-setting"></i>\
                                        </li>\
                                        <li title="Normal" data-style-item="">\
                                            <i class="acicon acicon-img-normal"></i>\
                                        </li>\
                                        <li title="Wide" data-style-item="wide">\
                                            <i class="acicon acicon-img-wide"></i>\
                                        </li>\
                                        <li title="High" data-style-item="high">\
                                            <i class="acicon acicon-img-high"></i>\
                                        </li>\
                                        <li title="Large" data-style-item="large">\
                                            <i class="acicon acicon-img-large"></i>\
                                        </li>\
                                        <li title="Extra large" data-style-item="extra-large">\
                                            <i class="acicon acicon-img-extralarge"></i>\
                                        </li>\
                                    </ul>\
                                 </div>\
                             </div>\
                         </div>\
                     </div>');

        if(option.reset === undefined || option.reset === true){
            if(!(option.ready === true && !default_option.main.images.length)){
                if(option.ready === undefined){
                    $list_wrapper.find('.grid-item').each(function(){
                         $list_wrapper.masonry('remove', this).masonry('layout');
                    });
                }else {
                    $list_wrapper.find('.grid-item').remove();
                }
            }
            $(default_option.main.images).each(function(key, image){
                var class_style = default_option.main.class_style[key] ? default_option.main.class_style[key] : '',
                    $item = _$(_template({
                        url:image.url,
                        class_style:class_style
                    }));

                // enable lightbox
                if(default_option.main.enable_lightbox){
                    $item.find('img').wrap('<a href="'+image.url+'" class="mgf-md-popup js-lightbox"></a>')
                }
                $list_wrapper.append($item);
                if(option.ready === undefined)
                    $list_wrapper.masonry( 'appended', $item );
                // set selected class
                $item.find(".js-class-style li[data-style-item = '" + class_style+ "']").addClass('active');
            });

            // save class style
             $('.js-class-style li:not(.js-settings-list)',el).click(function() {
                var ul_parent = $(this).closest('ul');
                ul_parent.find('li').removeClass("active");
                $(this).addClass('active');
                $('.js-class-style li.active',el).each(function(key, item){
                    default_option.main.class_style[key] =  $(item).attr('data-style-item');
                });
                element.setStorageValue('class_style', default_option.main.class_style,'main');
                var selected_style = $(this).attr('data-style-item');
                $(this).closest('.grid-item').removeClass('wide high large extra-large').addClass(selected_style);
                //$list_wrapper.masonry('layout');
                initGrid(el, default_option);
            });

            $('.js-grid-item', el).mouseout(function(){
                $(this).find('li.js-settings-list').hide();
            });
            $('.js-grid-item', el).mouseover(function(){
                $(this).find('li.js-settings-list').css('display', '');
            });
        }
        //console.log(default_option);
        // create layout
        initGrid(el, default_option);
        // create light box
        if(default_option.main.enable_lightbox)
            initLightBox(el);
    }

    function initGrid(el, option){
        var $list_wrapper = _$(el).find('.js-ac_masonry'),
            margin_image = (parseInt(option.main.margin_image)/2) + 'px';
        if(_$.fn.imagesLoaded && _$.fn.masonry){
            // fix margin image before init masonry
            $list_wrapper.closest('.js-masonry-grid').css('margin','-'+margin_image);
            $list_wrapper.imagesLoaded(function() {
                $list_wrapper.masonry({
                    columnWidth: '.grid-sizer',
                    itemSelector: '.grid-item'
                });
                // render image margin
                $('.grid-item .grid-item__content-wrapper', $list_wrapper).css({top:margin_image,left:margin_image, right:margin_image, bottom:margin_image});
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
            ready:true
        };
        initMasonryGrid(el, option, model);

        _$(el).closest('.js-type-column').resize(function(){
            initMasonryGrid(el, {}, model);
        });
    }

    function changeClass(el, value) {
        $('.js-ac_image', el).removeClass(value['prev']).addClass(value['current']);
    }


    AweBuilder.elementInfo('el-masonry-grid-images', {
        title: 'Masonry images',
        icon: 'acicon acicon-elm-imagegallery',
        enableEditor: {
            selector: '.js-caption',
            saveTo: {}
        },
        data: {
            main: {
                style: {
                    enabled: ['background','border', 'padding', 'margin', 'shadow', 'transform'],
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
                                var options = {main:{images:values.current}};
                                if(values.eventValue){
                                    if(values.eventValue.action == 'delete'){
                                    _$('.grid-item:eq('+ values.index +')').remove();
                                        options.reset = false;
                                    } else if(values.eventValue.action == 'sort'){
                                        var default_option = _$(el).data('gallery_option');
                                        if(default_option){
                                            var class_style = default_option.main.class_style,
                                                class_style_sort = class_style[values.eventValue.before];
                                            class_style[values.eventValue.before] = class_style[values.eventValue.after];
                                            class_style[values.eventValue.after] = class_style_sort;
                                            options.main.class_style = class_style;
                                            element.setStorageValue('class_style', class_style,'main');
                                        }
                                    }
                                }
                                initMasonryGrid(el, options, element);
                            }
                        }
                    },
                    margin_image: {
                        type: 'ranger',
                        widthNumber: 2,
                        title: 'Image margin',
                        min: 0,
                        max: 20,
                        defaultValue: '5px',
                        unit: 'px',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                initMasonryGrid(el, {main:{margin_image:values.current}}, element);
                            }
                        }
                    },
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
                                initMasonryGrid(el, {main:{column:values.current}, reset:false}, element);
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
                            }else {
                                 $('.el-column_md, .el-column_sm, .el-column_xs', $panel).hide();
                            }
                            if(!values.updateModel){
                                initMasonryGrid(el, {main:{column_responsive:values.current}, reset:false}, element);
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
                                initMasonryGrid(el, {main:{column_md:values.current}, reset:false}, element);
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
                                initMasonryGrid(el, {main:{column_sm:values.current}, reset:false}, element);
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
                                initMasonryGrid(el, {main:{column_xs:values.current}, reset:false}, element);
                            }
                        }
                    },
                    enable_lightbox: {
                        type: 'toggle',
                        title: 'Enable Lightbox',
                        defaultValue: false,
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                initMasonryGrid(el, {main:{enable_lightbox:values.current}}, element);
                            }
                        }
                    }
                }
            }
        },
        ready: ready
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
