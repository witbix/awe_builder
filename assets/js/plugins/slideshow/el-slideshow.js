/**
 * File: el-slideshow.js
 */
(function($, _$, _window) {
    function initSlideshow(el, option){
        var default_option;
        if($(el).data('slideshow_option')){
            default_option = $(el).data('slideshow_option')
        }else{
            default_option = {
                main:{
                    images: [],
                    effect: 'none',
                    show_control: false,
                    auto_play: false,
                    stop_hover: false,
                    speed: 4000,
                    transpeed: 400,
                    nav: 'none',
                    thumb_display: 5,
                    position: 'bottom',
                    captions: [],
                    loop:false
                },
                caption:{
                    content:'Caption text here',
                    enable:false,
                    position:'bottom',
                }
            }
        };
        if(option.main){ default_option.main = $.extend(default_option.main, option.main); }
        if(option.caption){ default_option.caption = $.extend(default_option.caption, option.caption); }
        $(el).data('slideshow_option', default_option);

        if(default_option.main.images.length > 0){
            var owl = $('.ac-slideshow.owl-carousel', el);
            getCaption(el, default_option, owl);

            // Add Caption Text
            if(default_option.main.captions.length > 0){
                $('.ac-slideshow .item .caption_con', el).each(function(index, val) {
                    $(this).html(default_option.main.captions[index]);
                });
            }

            //Nav Thumb
            navThumb(el, default_option, owl);
        }
    }

    function initCarousel(el, option, owl){
        if(owl.hasClass('owl-loaded')){
            _$(owl).trigger('destroy.owl.carousel');
        }
        if(option.main.nav == 'none'){
            var navTyle = false;
        }else{
            var navTyle = true;
        }
        var slideEffect = (option.main.effect == 'none') ? '' : option.main.effect;        
        _$(owl).owlCarousel({
            animateOut: slideEffect,
            items : 1,
            nav: option.main.show_control,
            dots: navTyle,
            autoplay: option.main.auto_play,
            autoplayHoverPause: option.main.stop_hover,
            autoplayTimeout: option.main.speed,
            autoplaySpeed: option.main.transpeed,
            loop:option.main.loop
        });
    }

    function getCaption(el, option, owl){
        var listSlide = '';
        for (var i = 0; i < option.main.images.length; i++) {
            var class_caption_hover = '',
                position = '';
            if(option.caption.enable){
                position = option.caption.position;
                if(position == 'over')
                    class_caption_hover = ' ac-image--hover';
                else if(position == 'over-top')
                        class_caption_hover = ' ac-image--hover-top';
                    else if(position == 'over-bottom')
                        class_caption_hover = ' ac-image--hover-bottom';
            }
            
            listSlide   += '<div class="item ac-image js-ac-image' + class_caption_hover + '">';
            if(option.caption.enable){
                var caption = (option.main.captions[i] == undefined) ? option.caption.content : option.main.captions[i],
                    caption_class = "ac-image__caption js-ac-image__caption caption_con";                    
                if(position == 'top'){
                    listSlide   += '<div class="' + caption_class + '" contenteditable= "true">'+ caption +'</div>';
                }                
                listSlide   += '<img src="'+option.main.images[i]['url']+'" alt="">';                
                if(position != 'top'){                    
                    listSlide   += '<div class="' + caption_class + '" contenteditable= "true">'+ caption +'</div>';
                }              
            }else{
                listSlide += '<img src="'+option.main.images[i]['url']+'" alt="">';
            }
            listSlide   += '</div>'; 
        }
        owl.html(listSlide);
        initCarousel(el, option, owl);
        if(option.caption.position == 'over'){
            _$('.caption_con', el).addClass('overbox');
        }else{
            _$('.caption_con', el).removeClass('overbox');
        }

        // Edit caption
        if(option.caption.enable == true){
                var indexSlide;
                function mousedown(){
                    _$('.caption_con', el).on('mousedown', function(event) {
                        _$('.ac-slideshow .item', el).removeClass('display-img');
                        $(this).parent().addClass('display-img');
                        if(owl.hasClass('owl-loaded')){
                            _$(owl).trigger('destroy.owl.carousel');
                        }
                        indexSlide = _$(this).parents('.item').index();
                        return indexSlide;
                    });
                }
                mousedown();
               
                $(window).not('.medium-editor-toolbar .medium-editor-action, .caption_con', el).click(function(event) {
                    if(_$('.ac-slideshow.owl-carousel.owl-loaded', el).length == 0){
                        mousedown();
                        initCarousel(el, option, owl);
                        _$(owl).trigger('to.owl.carousel', [indexSlide, 0, true]);
                        $(this).parent().removeClass('display-img');
                    }
                });
        }
    }

    function navThumb(el, option, owl){
        var listThumb = '';
        if(option.main.nav == 'thumbnail'){
            owl.addClass('thumb-nav');
            $('.dotsCont.owl-carousel', el).remove();
            for (var i = 0; i < option.main.images.length; i++) {
                listThumb += '<div class="item"><img src="'+option.main.images[i]['url']+'" alt=""></div>';
            }
            (option.main.position == 'bottom')?owl.after('<div class="dotsCont owl-carousel">'+listThumb+'</div>'):owl.before('<div class="dotsCont owl-carousel">'+listThumb+'</div>');
            var dotsOwl = $('.dotsCont.owl-carousel', el);

            var isImgDots = setInterval(function(){
                if($('.dotsCont img', el).length){
                    clearInterval(isImgDots);
                    //var widthImg = ($('.dotsCont img:first', el).width())*(option.main.thumb_display);
                    var widthImg = 150*(option.main.thumb_display);
                    dotsOwl.css('width', widthImg);

                    var flag = false;
                    initCarousel(el, option, owl);
                    var owlNavigation = _$(owl).data('owl.carousel')._plugins.navigation;
                    _$(owl).on('changed.owl.carousel', function (e) {                        
                        var thumbIndex = e.item.index; 
                        if(option.main.loop){
                            thumbIndex = $.inArray(owlNavigation.current(), owlNavigation._pages);
                        }
                        if (!flag) {
                            flag = true;
                            _$(dotsOwl).trigger('to.owl.carousel', [thumbIndex, 300, true]);
                            flag = false;
                        }
                        var current = thumbIndex;
                        _$(dotsOwl).find(".owl-item").removeClass("current").eq(current).addClass("current");
                    });
                    _$(dotsOwl).on('initialized.owl.carousel', function () {
                        _$(dotsOwl).find(".owl-item").eq(0).addClass("current");
                    }).owlCarousel({
                        items: option.main.thumb_display,
                        nav: false,
                        dots: false
                    }).on('click', '.owl-item', function () {
                        _$(owl).trigger('to.owl.carousel', [$(this).index(), 300, true]);
                    }).on('changed.owl.carousel', function (e) {
                        if (!flag) {
                            flag = true;
                            _$(owl).trigger('to.owl.carousel', [e.item.index, 300, true]);
                            flag = false;
                        }
                    });

                }
            },100);
        }else{
            owl.removeClass('thumb-nav');
            $('.dotsCont.owl-carousel', el).remove();
            if(_$.fn.owlCarousel){
                initCarousel(el, option, owl);
            }
        }

        // Nav Number
        if(option.main.nav == 'number'){
            var i = 1;
            $('.ac-slideshow .owl-dot', el).each(function(){
                $(this).find('span').addClass('dot-number').append(i);
                i++;
            });
        }
    }

    function renderCarousel(el, values, elem, part, func){
        var owl = $('.ac-slideshow.owl-carousel', el);
        var slideshow_option = (typeof ($(el).data('slideshow_option')) != 'undefined')? $(el).data('slideshow_option') : _$(el).data('slideshow_option');
        if(slideshow_option != undefined){
            slideshow_option[part][elem] = values.current;
            switch(func) {
                case 'initCarousel':
                    initCarousel(el, slideshow_option, owl);
                    break;
                case 'navThumb':
                    navThumb(el, slideshow_option, owl);
                    break;
                case 'getCaption':
                    getCaption(el, slideshow_option, owl);
                    break;
            }
            $(el).data('slideshow_option', slideshow_option);
        }
    }

    function saveCaption(el, model){
        var _content = [];
        $('.ac-slideshow .item .caption_con', el).each(function(index, val) {
            _content[index] = $(this).aweHtml();
        });
        //save to model
        model.setStorageValue('captions', _content);
        //save to dedault option
        if($(el).data('slideshow_option')){
            var default_option = $(el).data('slideshow_option')
            default_option.main.captions = _content;
            $(el).data('slideshow_option', default_option);
        }
    }

    function changeClass(el, value) {
        $('.ac-slideshow', el).removeClass(value['prev']).addClass(value['current']);
    }

    function enable_elem($panel, el, values, element, option, select) {
        if (values.current == option) {
            $(select, $panel).show();
        } else {
            $(select, $panel).hide();
        }
        $(select, $panel).trigger('change');
    }

    function ready(el, model) {
        var settings = model.get('settings');
        var option = {
            main:settings.main.settings ? settings.main.settings : {},
            caption:settings.caption.settings ? settings.caption.settings : {},
        };
        initSlideshow(el, option);
        
        _$('.caption_con', el).click(function(e){
            e.stopPropagation();
        });

        //save caption
        $('.js-ac-toolbar .js-elements-tab').mouseleave(function(){
            saveCaption(el, model);
        });
        
        _$(el).closest('.js-type-column').resize(function(){
            setTimeout(function(){
                initSlideshow(el, {});
            }, 300)            
        });
    }

    AweBuilder.elementInfo('el-slideshow', {
        title: 'Slideshow',
        icon: 'acicon acicon-slideshow',
        enableEditor: {
            selector: '.caption_con',
            saveTo: {}
        },
        data: {
            main:{
                style: {
                    enabled: ['background','border', 'padding', 'margin', 'shadow'],
                    status: ['normal', 'hover']
                },
                settings: {
                    captions: {
                        type: 'storage',
                        defaultValue: []
                    },
                    images: {
                        type: 'fileselector',
                        title: 'Image',
                        defaultValue: [],
                        devices: false,
                        widget: 'multi',
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                                initSlideshow(el, {main:{images: values.current}});
                            }
                        }
                    },
                    effect:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Effect',
                        options: {
                            none: 'None',
                            fadeOut: 'FadeOut',
                            bounceOut: 'BounceOut',
                            flipOutX: 'FlipOutX',
                            lightSpeedOut: 'LightSpeedOut',
                            rotateOut: 'RotateOut',
                            slideOutUp: 'SlideOutUp',
                            zoomOut: 'ZoomOut',
                            rollOut: 'RollOut',
                        },
                        devices: false,
                        defaultValue: 'none',
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                                renderCarousel(el, values, 'effect', 'main', 'initCarousel');
                            }
                        }
                    },
                    nav:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Nav',
                        options: {
                            none: 'None',
                            button: 'Button',
                            thumbnail: 'Thumbnail',
                            number: 'Number',
                        },
                        devices: false,
                        defaultValue: 'none',
                        change: function($panel, el, values, element) {
                            enable_elem($panel, el, values, element, 'thumbnail', '.el-position, .el-thumb_display');
                            if(values.prev != undefined){
                                renderCarousel(el, values, 'nav', 'main', 'navThumb');
                            }
                        }
                    },
                    thumb_display: {
                        type: 'ranger',
                        title: 'Thumbs Display',
                        widget: 'button',
                        allowChangeRange: false,
                        min: 1,
                        max: 10,
                        devices: false,
                        widthNumber: 2,
                        defaultValue: 3,
                        unit: '',
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                                renderCarousel(el, values, 'thumb_display', 'main', 'navThumb');
                            }
                        }
                    },
                    position:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Position',
                        options: {
                            bottom: 'Bottom',
                            top: 'Top',
                        },
                        devices: false,
                        defaultValue: 'bottom',
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                                renderCarousel(el, values, 'position', 'main', 'navThumb');
                            }
                        }
                    },
                    show_control: {
                        type: 'toggle',
                        title: 'Show Control',
                        defaultValue: false,
                        devices: false,
                        inlineTitle: true,
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                                renderCarousel(el, values, 'show_control', 'main', 'initCarousel');
                            }
                        }
                    },
                    auto_play: {
                        type: 'toggle',
                        title: 'AutoPlay',
                        defaultValue: false,
                        devices: false,
                        inlineTitle: true,
                        change: function($panel, el, values, element) {
                            enable_elem($panel, el, values, element, true, '.el-stop_hover, .el-speed, .el-transpeed');
                            if(values.prev != undefined){
                                renderCarousel(el, values, 'auto_play', 'main', 'initCarousel');
                            }
                        }
                    },
                    stop_hover: {
                        type: 'toggle',
                        title: 'Stop On Hover',
                        defaultValue: false,
                        devices: false,
                        inlineTitle: true,
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                                renderCarousel(el, values, 'stop_hover', 'main', 'initCarousel');
                            }
                        }
                    },
                    speed: {
                        type: 'ranger',
                        widthNumber: 2,
                        title: 'Speed',
                        min: 2000,
                        max: 10000,
                        defaultValue: 4000,
                        unit: 'ms',
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                                renderCarousel(el, values, 'speed', 'main', 'initCarousel');
                            }
                        }
                    },
                    transpeed: {
                        type: 'ranger',
                        widthNumber: 2,
                        title: 'TranSpeed',
                        min: 0,
                        max: 10000,
                        defaultValue: 400,
                        unit: 'ms',
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                                renderCarousel(el, values, 'transpeed', 'main', 'initCarousel');
                            }
                        }
                    }
                }
            },
            caption:{
                title: 'Caption',
                selector: '.ac-slideshow .caption_con',
                style: {
                    enabled: ['font', 'background', 'border', 'padding', 'margin', 'shadow'],
                    status: ['normal', 'hover']
                },
                settings: {
                    enable: {
                        type: 'toggle',
                        title: 'Enable Caption',
                        defaultValue: false,
                        devices: false,
                        inlineTitle: true,
                        change: function($panel, el, values, element) {
                            enable_elem($panel, el, values, element, true, '.el-position');
                            if(values.prev != undefined){
                                renderCarousel(el, values, 'enable', 'caption', 'getCaption');
                            }
                            if(values.current == true){
                                element.getView().reinitEditor('.caption_con');
                            }
                        }
                    },
                    position:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Position',
                        options: {
                            bottom: 'Bottom',
                            top: 'Top',
                            over: 'Over',
                            'over-top': 'Over Top',
                            'over-bottom': 'Over Bottom'
                        },
                        devices: false,
                        defaultValue: 'bottom',
                        change: function($panel, el, values, element) {
                            if(values.prev != undefined){
                                renderCarousel(el, values, 'position', 'caption', 'getCaption');
                                element.getView().reinitEditor('.caption_con');
                                _$('.caption_con', el).click(function(e){
                                    e.stopPropagation();
                                });
                            }
                        }
                    },
                }
            }
        },
        ready: ready
    });
})(jQuery, AweBuilder._jQuery, AweBuilder._window);