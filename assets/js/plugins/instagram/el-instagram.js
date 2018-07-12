/**
 * File: el-text.js
 */
(function($, _$, _window) {
    function _get_list_instagram(el, option){
        var $link = 'https://api.instagram.com/v1/users/',
            url = $link + option.instagram_id + '/media/recent/?access_token=' +  option.instagram_acess_token +'&callback=?';

        option['instagram_items'] = {};
        jQuery.getJSON(url,function(response){
            $.each(response.data, function(index, element) {
                var temp = {},
                    imagetype = option.size_image;
                temp.type = element.type;
                temp.link =  element.link;
                temp.caption =  (element.caption!=null && element.caption.text!=null)? element.caption.text :"picture";
                temp.likes =  element.likes.count;
                temp.comments =  element.comments.count;
                temp.location =  element.location;
                temp.width =  element.images[imagetype].width;
                temp.height = element.images[imagetype].height;
                temp.image = element.images[imagetype].url;
                temp.image_lightbox = element.images.standard_resolution.url;

                option['instagram_items'][index] = temp;
            });

            _renderInstagram(el, option);
        });
    }

    function _renderInstagram(el, option){
        function templating(data) {
            if(option.preview == 'lightbox'){
                var temp = '<a target="_blank" href="{{image_lightbox}}"><img src="{{image}}" alt="{{caption}}" class="img-responsive"/></a>';
            }else{
                var temp = '<a target="_blank" href="{{link}}"><img src="{{image}}" alt="{{caption}}" class="img-responsive"/></a>';
            }
            //var temp = option.template,
            var temp_variables = ['type', 'width', 'height', 'link', 'image', 'id', 'caption', 'likes', 'comments', 'location', 'image_lightbox'];
            var len = temp_variables.length;

            for (var i = 0; i < len; i++) {
                temp = temp.replace(new RegExp('{{' + temp_variables[i] + '}}', 'gi'), data[temp_variables[i]]);
            }
            return temp;
        };
        var listInstagramr = [];
        var datajson = option.instagram_items;
        $.each(datajson, function(index, instagram_element) {
            listInstagramr.push('<div class="awe-item-instagram">' + templating(instagram_element) + '</div>')
        });
        $('.awe-instagram-list', el).empty();
        for ( var i =0; i< option.instagram_number; i ++) {
            $('.awe-instagram-list', el).append(listInstagramr[i]);
        }
        $(el).find('.awe-item-instagram').css('padding',option.margin_image);
        $(el).find('.awe-item-instagram').parent().css('margin',-option.margin_image);

        if(_$.fn.magnificPopup){
            if(option.preview == 'lightbox'){
                _$($('.awe-instagram-list', el)).find('a').magnificPopup({
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

    function initInstagram(el, $option){
        var default_option;
        if($(el).data('instagram_option'))
            default_option = $(el).data('instagram_option')
        else
            default_option = {
                instagram_id:4290225294,
                instagram_number:12,
                column:4,
                column_responsive:false,
                column_md:4,
                column_sm:4,
                column_xs:4,
                instagram_acess_token:'4290225294.09f8dc2.c5f88481b2304da79b3a34dcf761daee',
                instagram_client_id:'09f8dc2e6a8547d89650d4997a8f7704',
                margin_image:'3px',
                preview: 'lightbox',
                size_image:'low_resolution',
                template:'<a target="_blank" href="{{link}}"><img src="{{image}}" alt="{{caption}}" class="img-responsive"/></a>'
            };

        default_option = $.extend(default_option, $option);

        if(default_option.reset !== undefined && default_option.reset === false){
            delete default_option.reset;
            return false;
        }

        var $instagram_wrapper = $(el).find('.awe-instagram');
        // add class column
        $instagram_wrapper.addClass('type-column-' + default_option.column).find('.awe-instagram-list').empty();
        _get_list_instagram(el, default_option);
        $(el).data('instagram_option', default_option);
    }

    function render_no_load($panel, el, values, elementData, elem){
        var instagram_option = (typeof ($(el).data('instagram_option')) != 'undefined')? $(el).data('instagram_option') : _$(el).data('instagram_option');
        if(instagram_option != undefined){
            instagram_option[elem] = values.current;
            _renderInstagram(el, instagram_option);
            _$(el).data('instagram_option', instagram_option);
        }
    }

    function ready(el, model) {
        var settings = model.get('settings');
        var option = settings.main.settings ? settings.main.settings : {};
        initInstagram(el, option);
    }

    function changeClass(el, value) {
        $('.ac-text', el).removeClass(value['prev']).addClass(value['current']);
    }


    AweBuilder.elementInfo('el-instagram', {
        title: 'Instagram',
        icon: 'acicon acicon-elm-instagram',
        data: {
            style: {
                enabled: ['background', 'border', 'padding', 'margin'],
                status: ['normal', 'hover']
            },
            settings: {
                content: {
                    type: 'storage',
                    defaultValue: 'Text here'
                },
                instagram_id: {
                    type: 'input',
                    title: 'ID',
                    defaultValue: '4290225294',
                    devices: false,
                    inlineTitle: true,
                    change: function($panel, el, values, elementData) {
                        if(values.prev != undefined){
                            initInstagram(el, {instagram_id:values.current});
                        }
                    }
                },
                instagram_acess_token: {
                    type: 'input',
                    title: 'Access token',
                    defaultValue: '4290225294.09f8dc2.c5f88481b2304da79b3a34dcf761daee',
                    devices: false,
                    inlineTitle: false,
                    change: function($panel, el, values, elementData) {
                        if(values.prev != undefined){
                            initInstagram(el, {instagram_acess_token:values.current});
                        }
                    }
                },
                instagram_client_id: {
                    type: 'input',
                    title: 'Client ID',
                    defaultValue: '09f8dc2e6a8547d89650d4997a8f7704',
                    devices: false,
                    inlineTitle: false,
                    change: function($panel, el, values, elementData) {
                        if(values.prev != undefined){
                            initInstagram(el, {instagram_client_id:values.current});
                        }
                    }
                },
                instagram_number: {
                    type: 'ranger',
                    title: 'Number',
                    widget: 'button',
                    allowChangeRange: false,
                    min: 1,
                    max: 20,
                    devices: false,
                    widthNumber: 2,
                    defaultValue: 12,
                    unit: '',
                    change: function($panel, el, values, elementData) {
                        render_no_load($panel, el, values, elementData, 'instagram_number');
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
                    change: function($panel, el, values, elementData) {
                        if(values.prev != undefined)
                        _$(el).find('.awe-instagram').removeClass('type-column-' + values.prev);
                        _$(el).find('.awe-instagram').addClass('type-column-' + values.current);
                        // do not reload instagram;
                        initInstagram(el, {column:values.current, reset:false});
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
                            initInstagram(el, {column_responsive:values.current, reset:false});
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
                            initInstagram(el, {column_md:values.current, reset:false});
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
                            initInstagram(el, {column_sm:values.current, reset:false});
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
                            initInstagram(el, {column_xs:values.current, reset:false});
                        }
                    }
                },
                margin_image: {
                    type: 'ranger',
                    widthNumber: 2,
                    title: 'Image margin',
                    min: 0,
                    max: 20,
                    defaultValue: '3px',
                    unit: 'px',
                    change: function($panel, el, values, elementData) {
                        _$(el).find('.awe-item-instagram').css('padding',values.current);
                        _$(el).find('.awe-item-instagram').parent().css('margin',-values.current);
                        initInstagram(el, {margin_image:values.current, reset:false});
                    }
                },
                preview:{
                    type: 'select',
                    inlineTitle: true,
                    title: 'Preview',
                    options: {
                        lightbox: 'Lightbox',
                        link: 'Link to Instagram',
                    },
                    devices: false,
                    defaultValue: 'lightbox',
                    change: function($panel, el, values, elementData) {
                        render_no_load($panel, el, values, elementData, 'preview');
                    }
                },
                size_image:{
                    type: 'select',
                    inlineTitle: false,
                    title: 'Size image',
                    options: {
                        thumbnail: 'Thumbnail',
                        low_resolution: 'Medium',
                        standard_resolution: 'Standard',
                    },
                    devices: false,
                    defaultValue: 'thumbnail',
                    change: function($panel, el, values, elementData) {
                        if(values.prev != undefined){
                            initInstagram(el, {size_image:values.current});
                        }
                    }
                }
            }
        },
        ready: ready
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
