/**
 * File: el-text.js
 */
(function($,_$, _window) {
    function initImage(el, option){
        var default_option;
        if(_$(el).data('image_option'))
            default_option = _$(el).data('image_option')
        else
            default_option = {
                image:{
                   file:{fid: -1,url: ''},
                   enable_lightbox:false
                },
                caption:{
                    content:'Caption text here',
                    enable:true,
                    position:'bottom',
                    on_lightbox:false
                }
            };
        var default_image = 'elements/image/assets/blank.jpg';
        if(option.main)
            default_option.main = $.extend(default_option.main, option.main);
        if(option.image)
            default_option.image = $.extend(default_option.image, option.image);
        if(option.caption)
            default_option.caption = $.extend(default_option.caption, option.caption);

        var $image_wrapper = _$(el).find('.js-ac-image'),
            $image_link_tag = $image_wrapper.find('.js-ac-image_content a'),
            image_src = (!default_option.image.file.url)? default_image : default_option.image.file.url,
            $part_image = $image_wrapper.find('.js-ac-image_content'),
            $part_caption = $image_wrapper.find('.js-ac-image__caption');

        $image_wrapper.find('img').attr('src', image_src);
        if(default_option.image.enable_lightbox){
            if(!$image_link_tag.length){
                var link_image = $('<a href="' + image_src + '">'+ $image_wrapper.find('.js-ac-image_content').aweHtml() +'</a>');
                $image_wrapper.find('.js-ac-image_content').html(link_image);
            }else{
                $image_link_tag.attr('href', image_src);
            }
            initLightBox(el);
        } else {
            if($image_link_tag.length){
                var $image_tag = $image_link_tag.find('img');
                $image_wrapper.find('.js-ac-image_content').html($image_tag);
            }
        }
        if(default_option.caption.on_lightbox)
            $part_caption.attr('data-on-lightbox', true);
        else
            $part_caption.attr('data-on-lightbox', false);

        if(default_option.caption.enable){
            $part_caption.show();
            var part_image_index = $part_image.index(),
                part_caption_index = $part_caption.index(),
                position = default_option.caption.position;
            if(position == 'top' && part_image_index < part_caption_index){
                $image_wrapper.prepend($part_caption);
            } else if((position == 'bottom' || position == 'over') && part_image_index > part_caption_index){
                $image_wrapper.append($part_caption);
            }
            if(position == 'over')
                $image_wrapper.addClass('ac-image--hover');
            else
                $image_wrapper.removeClass('ac-image--hover');
            if(position == 'over-top')
                $image_wrapper.addClass('ac-image--hover-top');
            else
                $image_wrapper.removeClass('ac-image--hover-top');
            if(position == 'over-bottom')
                $image_wrapper.addClass('ac-image--hover-bottom');
            else
                $image_wrapper.removeClass('ac-image--hover-bottom');
        }
        else
            $part_caption.hide();

        _$(el).data('image_option', default_option);
    }

    function initLightBox(el){
        if(_$.fn.magnificPopup){
            _$(el).find('.js-ac-image_content a').magnificPopup({
                type: 'image',
                removalDelay: 300,
                mainClass: 'mfp-fade',
                zoom: {
                    enabled: true,
                },
                callbacks: {
                    markupParse: function (template, values, item) {
                        var $caption = item.el.closest('.js-ac-image').find('.js-ac-image__caption');
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
        $('.js-ac-image__caption', el).attr('contenteditable', 'true');
        //save data
        $('.js-ac-image__caption',el).blur(function(event) {
            var _text = $(this).aweHtml();
            model.setStorageValue('content', _text,'caption');
        });
        var settings = model.get('settings');
        var option = {
            main:settings.main.settings ? settings.main.settings : {},
            caption:settings.caption.settings ? settings.caption.settings : {},
            image:settings.image.settings ? settings.image.settings : {}
        };
        initImage(el, option);
    }

    function changeClass(el, value) {
        $('.js-ac-image', el).removeClass(value['prev']).addClass(value['current']);
    }


    AweBuilder.elementInfo('el-image', {
        title: 'Single image',
        icon: 'acicon acicon-elm-image',
        enableEditor: {
            selector: '.js-ac-image__caption',
            saveTo: {}
        },
        defaultPart:'image',
        data: {
            main: {
                style: {
                    enabled:['background', 'border', 'padding', 'margin', 'shadow'],
                    status: ['normal', 'hover']
                }
            },
            image: {
                title: 'Image',
                selector: '.ac-image-thumb',
                style: {
                    enabled:['background', 'border', 'padding', 'margin'],
                    status: ['normal', 'hover']
                },
                settings: {
                    file: {
                        type: 'fileselector',
                        title: 'Image',
                        defaultValue: {
                            fid: -1,
                            url: ''
                        },
                        devices: false,
                        change: function($panel, el, values, element) {
                            initImage(el, {image:{file:values.current}});
                        }
                    },
                    enable_lightbox: {
                        type: 'toggle',
                        title: 'Enable Lightbox',
                        defaultValue: false,
                        devices: false,
                        change: function($panel, el, values, element) {
                            initImage(el, {image:{enable_lightbox:values.current}});
                        }
                    }
                }
            },
            caption:{
                title: 'Caption',
                selector: '.js-ac-image__caption',
                style: {
                    enabled:['font','background', 'border', 'padding', 'margin', 'shadow'],
                    status: ['normal', 'hover']
                },
                settings: {
                    enable: {
                        type: 'toggle',
                        title: 'Enable Caption',
                        defaultValue: false,
                        devices: false,
                        change: function($panel, el, values, element) {
                            initImage(el, {caption:{enable:values.current}});
                            if(values.current)
                                $panel.find('.el-position, .el-on_lightbox').show();
                            else
                                $panel.find('.el-position, .el-on_lightbox').hide();
                        }
                    },
                    content: {
                        type: 'storage',
                        defaultValue: 'Caption text here'
                    },
                    position:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Position',
                        options: {
                            "top": "Top",
                            "bottom": "Bottom",
                            "over":"Over",
                            "over-top": "Over Top",
                            "over-bottom": "Over Bottom"
                        },
                        devices: false,
                        defaultValue: 'bottom',
                        change: function($panel, el, values, elementData) {
                            initImage(el, {caption:{position:values.current}});
                        }
                    },
                    on_lightbox: {
                        type: 'toggle',
                        title: 'Caption on lightbox',
                        defaultValue: false,
                        devices: false,
                        change: function($panel, el, values, element) {
                            initImage(el, {caption:{on_lightbox:values.current}});
                        }
                    }
                }
            }
        },
        ready: ready
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
