/**
 * File: el-flickr.js
 */
(function($, _$, _window) {
    function _get_list_flick(el, option){
        var link = (option.stream == "user") ? 'https://api.flickr.com/services/feeds/photos_public.gne' : 'https://api.flickr.com/services/feeds/groups_pool.gne',
            url = (option.stream == "user")? (link + '?id=' + option.flickr_id + "&format=json&jsoncallback=?") : (link + '?id=' + option.flickr_group_id + "&format=json&jsoncallback=?");

        option['flick_items'] = {};
        jQuery.getJSON(url,function(response){
            option['flick_items'] = response.items;
            _renderFlick(el, option);
        });
    };

    function _renderFlick(el, option){
        var numberPhoto = option.no_img - 1,
            numberColum = option.column,
            lightbox = option.preview,
            listFlickr = '',
            template = _.template(
                '<li class="ac-item-flickr">\
                    <a target="_blank" href="<%= href %>" data-group="example-set" title="Title: <%= title %>" class="<%= lightbox %>">\
                    <img src="<%= src %>" alt="<%= title %>"></a>\
                </li>'
            );

            $.each(option.flick_items, function (index, flick) {
                var image = flick.media.m.replace('_m.jpg', ''),
                    small_image = image + '_q.jpg',
                    larger_image = image + '_c.jpg',
                    link = flick.link,
                    href = lightbox == 'lightbox' ? larger_image : link,
                    title = flick.title;
                    listFlickr += template({
                        href: href,
                        src: small_image,
                        title: title,
                        lightbox: lightbox,
                    });
            });

            $('.jflickr', el).html(listFlickr);
            $('.jflickr li:gt(' + numberPhoto + ')', el).hide().find('a').removeClass('lightbox');

            $(el).find('.ac-item-flickr').css('padding',option.img_margin);
            $(el).find('.jflickr').css('margin',-option.img_margin);
            $(el).find('.ac-flickr').addClass('type-column-' + option.column);

            //responsive
            if(option.column_responsive){
//                var $parentFlickr = $(el).find('.ac-flickr'),
//                    resonsive = {lg:option.column, md: option.column_md, sm: option.column_md, xs: option.column_xs};
//                $parentFlickr.removeClass('type-column-' + option.column);
//                $parentFlickr.addClass('type-column-' + resonsive[option.responsiveMode]);
//
//                $('.js-ac-buildzone > iframe').resize(function(){
//                    initFlickrResponsive($parentFlickr, option);
//                });
            }

            if(_$.fn.magnificPopup){

                if(option.preview == 'lightbox'){

                    _$($('.jflickr', el)).find('a.lightbox').magnificPopup({
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
                    });
                };
            }
    }

    function initFlickrResponsive($selector, options){
        var window_width = $(window).width(),
            prefixClass = 'type-column-';
        console.log(window_width);
        $selector.removeClass(prefixClass + options.column).removeClass(prefixClass + options.column_md).removeClass(prefixClass + options.column_sm).removeClass(prefixClass + options.column_xs);

        if(window_width >= 1200){
            $selector.addClass(prefixClass + options.column);
        } else if(window_width <= 1199 && window_width > 991){
            $selector.addClass(prefixClass + options.column_md);
        } else if(window_width <= 991 && window_width > 767){
            $selector.addClass(prefixClass + options.column_sm);
        } else if(window_width <= 767){
            $selector.addClass(prefixClass + options.column_xs);
        }
    }

    function changeFlickr(el, option){
        var default_option;
        if($(el).data('flickr_option'))
            default_option = $(el).data('flickr_option')
        else
            default_option = {
                flickr_id: '145957177@N03',
                flickr_group_id: '3161579@N23',
                no_img: 12,
                stream: 'user',
                column: 4,
                column_responsive:false,
                column_md:4,
                column_sm:4,
                column_xs:4,
                img_margin: '3px',
                preview: 'lightbox',
            };

        var $flickrDiv = $('.jflickr', el);

        default_option = $.extend(default_option, option);

        if(default_option.reset !== undefined && default_option.reset === false){
            delete default_option.reset;
            return false;
        }

        _get_list_flick(el, default_option);
        $(el).data('flickr_option', default_option);

    }

    function changeClass(el, value, elementData) {
        $('.ac-flickr', el).removeClass(value['prev']).addClass(value['current']);
    }

    function enable_flickr_id($panel, el, values, elementData) {
        if (values.current == 'user') {
            $('.el-flickr_id', $panel).show();
            $('.el-flickr_group_id', $panel).hide();
        } else {
            $('.el-flickr_group_id', $panel).show();
            $('.el-flickr_id', $panel).hide();
        }
        $('.el-flickr_id, .el-flickr_group_id', $panel).trigger('change');
    }

    function render_no_load($panel, el, values, elementData, elem){
        var flickr_option = (typeof ($(el).data('flickr_option')) != 'undefined')? $(el).data('flickr_option') : _$(el).data('flickr_option');
        if(flickr_option != undefined){
            flickr_option[elem] = values.current;
            _renderFlick(el, flickr_option);
            $(el).data('flickr_option', flickr_option);
        }
    }

    function ready(el, model) {
        //save data
        $('.ac-flickr', el).blur(function(event) {
            var _text = $(this).aweHtml();
            model.setStorageValue('content', _text);
        })

        var settings = model.get('settings');
        var option = settings.main.settings ? settings.main.settings : {};
        option.responsiveMode = model.getResponsiveMode();
        changeFlickr(el, option);
    }

    AweBuilder.elementInfo('el-flickr', {
        title: 'Flickr',
        icon: 'acicon acicon-elm-flickr',
        data: {
            style: {
                enabled: ['background', 'border', 'padding', 'margin'],
                status: ['normal', 'hover']
            },
            settings: {
                content: {
                    type: 'storage',
                    defaultValue: '113963751@N02'
                },
                stream:{
                    type: 'select',
                    inlineTitle: true,
                    title: 'Stream',
                    options: {
                        user: 'User',
                        group: 'Group',
                    },
                    devices: false,
                    defaultValue: 'user',
                    change: function($panel, el, values, element) {
                        if(values.prev != undefined){
                            changeFlickr(el,{stream:values.current});
                        }
                        enable_flickr_id($panel, el, values, element);
                    }
                },
                flickr_id: {
                    type: 'input',
                    title: 'Flickr User ID',
                    defaultValue: '145957177@N03',
                    devices: false,
                    inlineTitle: false,
                    change: function($panel, el, values, element) {
                        if(values.prev != undefined){
                            changeFlickr(el,{flickr_id:values.current});
                        }
                    }
                },
                flickr_group_id: {
                    type: 'input',
                    title: 'Flickr Group ID',
                    defaultValue: '3161579@N23',
                    devices: false,
                    inlineTitle: false,
                    change: function($panel, el, values, element) {
                        if(values.prev != undefined){
                            changeFlickr(el,{flickr_group_id:values.current});
                        }
                    }
                },
                no_img: {
                    type: 'ranger',
                    title: 'No of img',
                    widget: 'button',
                    allowChangeRange: false,
                    min: 1,
                    max: 20,
                    devices: false,
                    widthNumber: 2,
                    defaultValue: 12,
                    unit: '',
                    change: function($panel, el, values, elementData) {
                        render_no_load($panel, el, values, elementData, 'no_img');
                    }
                },
                column: {
                    type: 'ranger',
                    title: 'Column',
                    widget: 'button',
                    allowChangeRange: false,
                    min: 1,
                    max: 6,
                    devices: false,
                    widthNumber: 2,
                    defaultValue: 4,
                    unit: '',
                    change: function($panel, el, values, element) {
                        if(values != 'undefined'){
                            var current_class = 'type-column-'+values.current;
                            var prev_class = 'type-column-'+values.prev;
                            $('.ac-flickr', el).removeClass(prev_class);
                            $('.ac-flickr', el).addClass(current_class);
                        }
                        changeFlickr(el,{column:values.current, reset:false});
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
                            changeFlickr(el,{column_responsive:values.current, reset:false});
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
                            changeFlickr(el,{column_md:values.current, reset:false});
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
                            changeFlickr(el,{column_sm:values.current, reset:false});
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
                            changeFlickr(el,{column_xs:values.current, reset:false});
                        }
                    }
                },
                img_margin: {
                    type: 'ranger',
                    widthNumber: 2,
                    title: 'Image Margin',
                    min: 0,
                    max: 20,
                    defaultValue: '3px',
                    devices: false,
                    unit: 'px',
                    change: function($panel, el, values, element) {
                        $('.ac-flickr ul', el).css('margin', 0-values.current);
                        $('.ac-flickr ul li', el).css('padding', values.current);

                        changeFlickr(el,{img_margin:values.current, reset:false});
                    }
                },
                preview:{
                    type: 'select',
                    inlineTitle: true,
                    title: 'Preview',
                    options: {
                        lightbox: 'Lightbox',
                        link: 'Link to Flickr',
                    },
                    devices: false,
                    defaultValue: 'lightbox',
                    change: function($panel, el, values, elementData) {
                        render_no_load($panel, el, values, elementData, 'preview');
                    }
                },

            }
        },
        ready: ready
    });
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
