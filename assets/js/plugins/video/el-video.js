/**
 * File: el-video.js
 */
(function($, _$, _window) {


    /* Regex ID Youtube & Vimeo */
    $.processVideo = function (url) {
        function vimeoID(url) {
            var vimeo_Reg = /https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
            var match = url.match(vimeo_Reg);
            if (match) {
                return match[3];
            } else {
                return "";
            }
        }
        function youtubeID(url) {
            var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/,
                match = url.match(regExp);
            return (match[7] != undefined) ? match[7] : '';
        }
        if (url.indexOf('youtu') != -1) {
            var idYt = youtubeID(url);
            return {
                id: idYt,
                attrVideo: '//www.youtube.com/embed/' + idYt + '?autoplay=0&showinfo=0&rel=0&controls=0',
                typeVideo: 'youtube'
            };
        }
        if (url.indexOf('vimeo') != -1) {
            var vmID = vimeoID(url);
            return {
                id: vmID,
                attrVideo: '//player.vimeo.com/video/' + vmID + '?autoplay=0&title=0&loop=0&byline=0&portrait=0',
                typeVideo: 'vimeo'
            };
        }
        return {
            id: '',
            attrVideo: '//www.youtube.com/embed/',
            typeVideo: ''
        };
    };


    function setMagnificPopup($selector) {
       _$($selector).magnificPopup({
            disableOn: 700,
            //prependTo: '.ac_page-wrapper',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: false,
            fixedContentPos: false,

            type: 'iframe',
            iframe: {
              markup: '<div class="mfp-iframe-scaler">'+
                        '<div class="mfp-close"></div>'+
                        '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>'+
                      '</div>',
              patterns: {
                youtube: {
                  index: 'youtube.com/',

                  id: '',
                  src: '%id%'
                },
                vimeo: {
                  index: 'vimeo.com/',
                  id: '',
                  src: '%id%'
                },
                gmaps: {
                  index: '//maps.google.',
                  src: '%id%&output=embed'
                }
              },
              srcAction: 'iframe_src',
            }

        });
        _$($selector).trigger('click');
    }


    function ready_config(el, model) {

        if(model.getSettingsAttr("main.settings.video_play") == "lightbox"){
            link_lightbox = model.getSettingsAttr("main.settings.ember_url").replace('autoplay=0', 'autoplay=1');
            $('.mfp-md-video' , el).attr('href', link_lightbox);
        }

        $('.thumb-video', el).click(function(){
            var resultVideo = model.getSettingsAttr("main.settings.ember_url");

            linkProcessed = resultVideo.replace('autoplay=0', 'autoplay=1');

            if(model.getSettingsAttr("main.settings.video_play") == "inline"){
                $('iframe' , el).attr('src', linkProcessed);
                $('.thumb-video', el).hide();
            }else{
                $('iframe' , el).attr('src', '');
                setMagnificPopup($('.mfp-md-video', el));
            }

        });
    }

    function iframeVideo(el, element) {

        // set link for iframe
        var resultVideo = $.processVideo(element.getSettingsAttr("main.settings.video_link")),
            typeVideo = resultVideo.typeVideo,
            linkProcessed = resultVideo.attrVideo;

        var auto_play = element.getSettingsAttr("main.settings.video_auto_play"),
            show_title = element.getSettingsAttr("main.settings.video_show_title"),
            youtube_refrences = element.getSettingsAttr("main.settings.video_youtube_refrences"),
            youtube_control = element.getSettingsAttr("main.settings.video_youtube_control"),
            vimeo_loop = element.getSettingsAttr("main.settings.video_vimeo_loop"),
            video_play = element.getSettingsAttr("main.settings.video_play"),
            video_enable = element.getSettingsAttr("main.settings.video_enable"),
            video_thumb = element.getSettingsAttr("main.settings.video_thumb");

            if(auto_play){
                linkProcessed = linkProcessed.replace('autoplay=0', 'autoplay=1');
            }
            if(video_play == undefined)
                video_play = 'inline';

            if (typeVideo == 'youtube') {
                if(show_title)
                    linkProcessed = linkProcessed.replace('showinfo=0', 'showinfo=1');
                if(youtube_refrences)
                    linkProcessed = linkProcessed.replace('rel=0', 'rel=1');
                if(youtube_control)
                    linkProcessed = linkProcessed.replace('controls=0', 'controls=1');

            }else if (typeVideo == 'vimeo'){
                if(show_title)
                    linkProcessed = linkProcessed.replace('title=0', 'title=1');
                if(vimeo_loop)
                    linkProcessed = linkProcessed.replace('loop=0', 'loop=1');
            }

            if(video_play == "inline"){
                $('iframe' , el).attr('src', linkProcessed);
                $('.thumb-video', el).show();
                // picture thumb
                if(!video_enable || auto_play)
                    $('.thumb-video', el).hide();
            }else{

                if(video_thumb == "" || element.resetThumb){
                    autoPicture($('.ac-video .image-content img', el), element);
                    element.resetThumb = false;
                }

                $('.thumb-video', el).show();
                $('iframe' , el).attr('src', '');
                link_lightbox = linkProcessed.replace('autoplay=0', 'autoplay=1');
                $('.mfp-md-video' , el).attr('href', link_lightbox);
            }

        element.setStorageValue('ember_url', linkProcessed, 'main');
    }

    function autoPicture($selector, element) {
            var resultVideo = $.processVideo(element.getSettingsAttr("main.settings.video_link")),
                typeVideo = resultVideo.typeVideo,
                id = resultVideo.id.trim();

            if (typeVideo == 'youtube') {
                var thumbnail_src = 'http://img.youtube.com/vi/'+id +'/' + '0.jpg';
                // $('.video-thumb-upload .bg-image', $panel).css('background-image',"url("+thumbnail_src+")");
                element.setStorageValue('video_thumb', thumbnail_src, 'main');

                $selector.attr('src',thumbnail_src);
            }else if (typeVideo == 'vimeo'){
                $.ajax({
                    type:'GET',
                    url: 'http://vimeo.com/api/v2/video/' + id + '.json',
                    jsonp: 'callback',
                    dataType: 'jsonp',
                    success: function(data){
                        var thumbnail_src = data[0].thumbnail_large;
                        // $('.video-thumb-upload .bg-image', $panel).css('background-image',thumbnail_src);
                        element.setStorageValue('video_thumb', thumbnail_src, 'main');

                        $selector.attr('src',thumbnail_src);
                    }
                });
            }
    }

    function changeClass($selector, values) {
        $selector.removeClass(values['prev']).addClass(values['current']);
    }


	AweBuilder.elementInfo('el-video', {
		title: 'Video',
		icon: 'acicon acicon-elm-video',
        data: {
            main: {
                style: {
                    enabled: ['font', 'background', 'border', 'padding','margin'],
                    status: ['normal','hover'],
                },
                settings: {
                    ember_url: {
                        type: 'storage',
                        defaultValue: 'https://www.youtube.com/embed/GMa1jzIlgT8?autoplay=0&showinfo=0&rel=0&controls=0',
                        title: 'Content'
                    },
                    video_link: {
                        type: "input",
                        title: "Link",
                        inlineTitle: true,
                        devices: false,
                        defaultValue: "https://www.youtube.com/watch?v=GMa1jzIlgT8",
                        change: function($panel, el, values, element) {
                            var resultVideo = $.processVideo(values.current),
                                typeVideo = resultVideo.typeVideo;

                            if (typeVideo == 'youtube') {
                                $('.video-youtube-refrences, .video-youtube-control', $panel).show();
                                $('.video-vimeo-loop', $panel).hide();
                            }else if (typeVideo == 'vimeo'){
                                $('.video-youtube-refrences, .video-youtube-control', $panel).hide();
                                $('.video-vimeo-loop', $panel).show();
                            }

                            element.resetThumb = true;
                            if(!values.updateModel)
                                iframeVideo(el, element);
                        }
                    },
                    video_info: {
                        type: "markup",
                        devices: false,
                        markup: "<p>Support for Youtube & Vimeo</p>",
                        init:function(element){}
                    },
                    video_show_title: {
                        type: 'toggle',
                        title: 'Enable Title',
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeVideo(el, element);
                        }
                    },
                    // Option for Youtube
                    video_youtube_refrences: {
                        type: 'toggle',
                        className: 'video-youtube-refrences',
                        title: 'Enable Refrences',
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeVideo(el, element);
                        }
                    },
                    video_youtube_control: {
                        type: 'toggle',
                        className: 'video-youtube-control',
                        title: 'Enable Control',
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeVideo(el, element);
                        }
                    },
                    // Option for Vimeo
                    video_vimeo_loop: {
                        type: 'toggle',
                        className: 'video-vimeo-loop',
                        title: 'Enable Loop',
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeVideo(el, element);
                        }
                    },


                    // Thumb
                    video_play:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Play In',
                        options: {
                            "inline" : "Inline",
                            'lightbox' : "Lightbox"
                        },
                        devices: false,
                        defaultValue: 'inline',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeVideo(el, element);

                            if(values.current != "inline"){
                                $('.video-auto-play, .video-enable-thumb', $panel).hide();
                                $('.video-thumb-choose', $panel).show();
                                    if(element.getSettingsAttr("main.settings.video_thumb_choose") != 'auto')
                                        $('.video-thumb-upload' , $panel).show();
                            }else{
                                $('.video-auto-play, .video-enable-thumb', $panel).show();
                                if(element.getSettingsAttr("main.settings.video_enable")){
                                    $('.video-thumb-choose', $panel).show();
                                    if(element.getSettingsAttr("main.settings.video_thumb_choose") != 'auto')
                                        $('.video-thumb-upload' , $panel).show();
                                }else{
                                    $('.video-thumb-choose, .video-thumb-upload', $panel).hide();
                                }
                            }
                        }
                    },
                    video_auto_play: {
                        type: 'toggle',
                        title: 'Enable Autoplay',
                        className: 'video-auto-play',
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                iframeVideo(el, element);
                        }
                    },
                    video_enable: {
                        type: 'toggle',
                        title: 'Enable Thumb',
                        className: 'video-enable-thumb',
                        devices: false,
                        defaultValue: false,
                        change: function($panel, el, values, element) {
                            if(element.getSettingsAttr("main.settings.video_play") != 'lightbox'){
                                if(values.current){
                                    $('.video-thumb-choose', $panel).show();
                                    if(element.getSettingsAttr("main.settings.video_thumb_choose") != 'auto')
                                        $('.video-thumb-upload' , $panel).show();

                                    if(!values.updateModel)
                                        $('.ac-video .thumb-video', el).show();
                                }else{
                                    $('.video-thumb-choose, .video-thumb-upload', $panel).hide();
                                    if(!values.updateModel)
                                        $('.ac-video .thumb-video', el).hide();
                                }
                            }
                        }
                    },
                    video_thumb: {
                        type: 'storage',
                        defaultValue: '',
                        title: 'Content'
                    },
                    video_thumb_choose:{
                        type: 'select',
                        className: 'video-thumb-choose',
                        inlineTitle: true,
                        title: 'Thumb',
                        options: {
                            "auto" : "Auto",
                            "custom" : "Custom"
                        },
                        devices: false,
                        defaultValue: 'auto',
                        change: function($panel, el, values, element) {

                            if(values.current !== 'auto' && (element.getSettingsAttr("main.settings.video_play") == 'lightbox' || (element.getSettingsAttr("main.settings.video_play") != 'lightbox' && element.getSettingsAttr("main.settings.video_enable")))){
                                $('.video-thumb-upload' , $panel).show();

                                // set thumb
                                if(element.getSettingsAttr("main.settings.video_thumb") == '')
                                    autoPicture($('.ac-video .image-content img', el), element);

                                // set src
                                var thumbnail_src = element.getSettingsAttr("main.settings.video_thumb");
                                if(element.getSettingsAttr("main.settings.video_thumb_upload").url != ''){
                                    thumbnail_src = element.getSettingsAttr("main.settings.video_thumb_upload");
                                    element.setStorageValue('video_thumb', thumbnail_src.url, 'main');
                                }

                                $('.video-thumb-upload .bg-image', $panel).css('background-image',"url("+thumbnail_src.url+")");

                                if(!values.updateModel)
                                    $('.ac-video .image-content img', el).attr('src',thumbnail_src.url);

                            }else{
                                $('.video-thumb-upload' , $panel).hide();

                                if(!values.updateModel)
                                    autoPicture($('.ac-video .image-content img', el), element);
                            }
                        }
                    },
                    video_thumb_upload: {
                        title: 'Picture Upload',
                        className: 'video-thumb-upload',
                        type: 'fileselector',
                        defaultValue: {
                            fid: -1,
                            url: ''
                        },
                        devices: false,
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                if(element.getSettingsAttr("main.settings.video_thumb_choose") == 'custom'){
                                    $('.ac-video img' , el).attr('src', values.current.url);
                                    element.setStorageValue('video_thumb', values.current.url, 'main');
                                }
                            }
                        }
                    },
                    video_responsive:{
                        type: 'select',
                        inlineTitle: true,
                        title: 'Type Responsive',
                        customStyles: {
                            '.ac_panel-item-general__content': {
                                'padding-left': '100px'
                            }
                        },
                        options: {
                            'embed-responsive-custom' : "Custom Responsive",
                            "embed-responsive-16by9" : "16:9 Responsive",
                            'embed-responsive-4by3' : "4:3 Responsive",
                        },
                        devices: false,
                        defaultValue: 'embed-responsive-16by9',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel)
                                changeClass($('.ac-video .embed-responsive', el), values);

                            if(values.current != "embed-responsive-custom"){
                                $('.custom-height', $panel).hide();
                                if(!values.updateModel)
                                    $('.ac-video' , el).css("height","auto");
                            }else{
                                $('.custom-height', $panel).show();
                                if(!values.updateModel)
                                    $('.ac-video' , el).css("height", element.getSettingsAttr("main.settings.video_height"));
                            }
                        }
                    },
                    video_height: {
                        type: "ranger",
                        title: 'Height',
                        className: 'custom-height',
                        widthNumber: 2,
                        min: 0,
                        max: 1000,
                        devices: false,
                        defaultValue: 310,
                        unit: 'px',
                        change: function($panel, el, values, element) {
                            if(!values.updateModel){
                                if(values.current!=0 && element.getSettingsAttr("main.settings.video_responsive") == 'embed-responsive-custom')
                                $('.ac-video' , el).css("height",values.current);
                            }
                        }
                    }
                },
            },
        },
		ready: ready_config
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
