/**
 * File: el-text.js
 */
(function($, _$, _window) {
    function _get_list_twitter(el, option){
        var params = 'consumer_key='+option.consumer_key + '&consumer_secret='+option.consumer_secret + '&access_token='+option.access_token + '&access_secret='+option.access_secret + '&twitter_user=' + option.twitter_user,
            url = 'elements/twitter/assets/ajax_load_twitter.php?' + params;

        option['twitter_items'] = {};
        jQuery.getJSON(url,function(response){
            $.each(response, function(index, twt) {
                var temp = {};
                temp.date = dating(twt.created_at);
                temp.user_name =  twt.user.name;
                temp.retweeted = twt.retweeted;
                temp.avatar = '<img src="'+ twt.user.profile_image_url +'" />';
                temp.url =  'https://twitter.com/' + twt.user.screen_name + '/status/' + twt.id_str;

                temp.tweet = (twt.retweeted) ? linking('RT @'+ twt.user.screen_name +': '+ twt.retweeted_status.text) : linking(twt.text);
                temp.screen_name = linking('@'+ twt.user.screen_name);
                option['twitter_items'][index] = temp;
            });
            _renderTwitter(el, option);
        });

        function dating(twt_date){
            var time = twt_date.split(' ');
            twt_date = new Date(Date.parse(time[1] + ' ' + time[2] + ', ' + time[5] + ' ' + time[3] + ' UTC'));
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            var _date = {
                '%d': twt_date.getDate(),
                '%m': twt_date.getMonth()+1,
                '%b': months[twt_date.getMonth()].substr(0, 3),
                '%B': months[twt_date.getMonth()],
                '%y': String(twt_date.getFullYear()).slice(-2),
                '%Y': twt_date.getFullYear()
            };

            var date = option.format_date;
            var format = date.match(/%[dmbByY]/g);

            for (var i = 0, len = format.length; i < len; i++) {
                date = date.replace(format[i], _date[format[i]]);
            }
            return date;
        };
        function linking(tweet) {
            var twit = tweet.replace(/(https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w\/_\.]*(\?\S+)?)?)?)/ig,'<a href="$1" target="_blank" title="Visit this link">$1</a>')
                .replace(/#([a-zA-Z0-9_]+)/g,'<a href="https://twitter.com/search?q=%23$1&amp;src=hash" target="_blank" title="Search for #$1">#$1</a>')
                .replace(/@([a-zA-Z0-9_]+)/g,'<a href="https://twitter.com/$1" target="_blank" title="$1 on Twitter">@$1</a>');

            return twit;
        };
    }

    function _renderTwitter(el, option){
            function templating(data) {
                var temp = option.template,
                    temp_variables = ['date', 'tweet', 'avatar', 'url', 'retweeted', 'screen_name', 'user_name'];

                for (var i = 0, len
                    = temp_variables.length; i < len; i++) {
                    temp = temp.replace(new RegExp('{{' + temp_variables[i] + '}}', 'gi'), data[temp_variables[i]]);
                }
                return temp;
            };

            var listTwitter = [],
                tweetie = option.twitter_items;

            $.each(tweetie, function(index, twitter) {
                listTwitter.push('<li>' + templating(twitter) + '</li>')
            });
            $(el).find('.awe-list-twitter').empty().append('<ul class="awe-twitter-list-item"></ul>').data('listTwitter', listTwitter);

            for ( var i =0; i< option.number_twitter; i ++) {
                $('.awe-twitter-list-item', el).append(listTwitter[i]);
            }

            var item = option.number_twitter;
            var wrapElem = $('.awe-list-twitter', _$(el));
            if(option.enable_slide == true ){
                wrapElem.vTicker('init', {
                    speed: 1000,
                    pause: 4000,
                    margin: 15,
                    showItems: item,
                });
                wrapElem.removeClass('un-slide');
            }
            if( option.enable_slide == false && option.enable_slide_prev == true ){
                wrapElem.vTicker('pause', true);
                wrapElem.addClass('un-slide');
            }
        }

    function initTwitter(el, option){
        var default_option;
        if($(el).data('twitter_option'))
            default_option = $(el).data('twitter_option');
        else
            default_option = {
                twitter_user:'fifacom',
                number_twitter:5,
                enable_slide:false,
                format_date:'%b/%d/%Y',
                consumer_key:'j8kVnnnHFqPD4J24nOXuW4BiN',
                consumer_secret:'vurIlwKpXtceYHD0LHevEEwYzCKQjorw5NMiXTuranD5D6udvQ',
                access_token:'709944559212453888-c6qMpjZzvSRnwBdHgun3ruvrKV1rWmG',
                access_secret:'MGJj3tjAmd18XVsdNqglqG1XyVHuu0It3wkyRrYuoGAtK',
                template:'<div class="avatar">{{avatar}}</div><div class="tweet"><p class="screen_name">{{screen_name}}</p><a class="date">{{date}}</a><p class="content-tweet">{{tweet}}</p></div>'
            };

        default_option = $.extend(default_option, option);

        if(default_option.reset !== undefined && default_option.reset === false){
            delete default_option.reset;
            return false;
        }

        _get_list_twitter(el, default_option);
        $(el).data('twitter_option', default_option);
    }

    function changeClass(el, value) {
        $('.ac-text', el).removeClass(value['prev']).addClass(value['current']);
    }

    function render_no_load($panel, el, values, elementData, elem){
        if(typeof elem == 'object'){
            var twitter_option = (typeof ($(el).data('twitter_option')) != 'undefined')? $(el).data('twitter_option') : _$(el).data('twitter_option');
            if(twitter_option != undefined){
                var ind;
                for (ind in elem) {
                    twitter_option[ind] = values[elem[ind]];
                }
                _renderTwitter(el, twitter_option);
                $(el).data('twitter_option', twitter_option);
            }
        }else{
            var twitter_option = (typeof ($(el).data('twitter_option')) != 'undefined')? $(el).data('twitter_option') : _$(el).data('twitter_option');
            if(twitter_option != undefined){
                twitter_option[elem] = values.current;
                _renderTwitter(el, twitter_option);
                $(el).data('twitter_option', twitter_option);
            }
        }
    }

    function ready(el, model) {
        var settings = model.get('settings');
        var option = settings.main.settings ? settings.main.settings : {};
        initTwitter(el, option);
    }

    AweBuilder.elementInfo('el-twitter', {
        title: 'Twitter',
        icon: 'acicon acicon-elm-twitter',
        data: {
            style: {
                //status: ['normal'],
                enabled: ['font', 'background', 'border', 'padding', 'margin', 'shadow', 'transform'],
                status: ['normal', 'hover']
            },
            settings: {
                content: {
                    type: 'storage',
                    defaultValue: 'Text here'
                },
                twitter_user: {
                    type: 'input',
                    title: 'User',
                    defaultValue: 'fifacom',
                    devices: false,
                    inlineTitle: true,
                    change: function($panel, el, values, elementData) {
                        if(values.prev != undefined){
                            initTwitter(el,{twitter_user:values.current});
                        }
                    }
                },
                consumer_key: {
                    type: 'input',
                    title: 'Consumer key',
                    defaultValue: 'j8kVnnnHFqPD4J24nOXuW4BiN',
                    devices: false,
                    inlineTitle: false,
                    change: function($panel, el, values, elementData) {
                        if(values.prev != undefined){
                            initTwitter(el,{consumer_key:values.current});
                        }
                    }
                },
                consumer_secret: {
                    type: 'input',
                    title: 'Consumer secret',
                    defaultValue: 'vurIlwKpXtceYHD0LHevEEwYzCKQjorw5NMiXTuranD5D6udvQ',
                    devices: false,
                    inlineTitle: false,
                    change: function($panel, el, values, elementData) {
                        if(values.prev != undefined){
                            initTwitter(el,{consumer_secret:values.current});
                        }
                    }
                },
                access_token: {
                    type: 'input',
                    title: 'Access token',
                    defaultValue: '709944559212453888-c6qMpjZzvSRnwBdHgun3ruvrKV1rWmG',
                    devices: false,
                    inlineTitle: false,
                    change: function($panel, el, values, elementData) {
                        if(values.prev != undefined){
                            initTwitter(el,{access_token:values.current});
                        }
                    }
                },
                access_secret: {
                    type: 'input',
                    title: 'Access secret',
                    defaultValue: 'MGJj3tjAmd18XVsdNqglqG1XyVHuu0It3wkyRrYuoGAtK',
                    devices: false,
                    inlineTitle: false,
                    change: function($panel, el, values, elementData) {
                        if(values.prev != undefined){
                            initTwitter(el,{access_secret:values.current});
                        }
                    }
                },
                number_twitter: {
                    type: 'ranger',
                    title: 'No of tweet',
                    widget: 'button',
                    allowChangeRange: false,
                    min: 1,
                    max: 20,
                    devices: false,
                    widthNumber: 2,
                    defaultValue: 5,
                    unit: '',
                    change: function($panel, el, values, elementData) {
                        if(values.prev != undefined){
                            render_no_load($panel, el, values, elementData, 'number_twitter');
                        }
                    }
                },
                enable_slide: {
                    type: 'toggle',
                    title: 'Enable Slide Tweet',
                    defaultValue: false,
                    devices: false,
                    inlineTitle: true,
                    change: function($panel, el, values, elementData) {
                        if(values.prev != undefined){
                            var elem = {'enable_slide':'current', 'enable_slide_prev':'prev'};
                            render_no_load($panel, el, values, elementData, elem);
                        }
                    }
                },
                format_date: {
                    type: 'input',
                    title: 'Date Format',
                    defaultValue: '%b/%d/%Y',
                    devices: false,
                    inlineTitle: false,
                    change: function($panel, el, values, elementData) {
                        if(values.prev != undefined){
                            initTwitter(el,{format_date:values.current});
                        }
                    }
                },
                format_date_description: {
                    type: "markup",
                    devices: false,
                    markup: "<table class='option-tiwtter'><thead><tr><th>Format<\/th><th>Description<\/th><\/tr><\/thead><tbody><tr><td><code>%d<\/code><\/td><td>Date, 1,2,3...<\/td><\/tr><tr><td><code>%m<\/code><\/td><td>Month number 1,2,3...<\/td><\/tr><tr><td><code>%b<\/code><\/td><td>Abbreviated month Jan, Feb, Mar...<\/td><\/tr><tr><td><code>%B<\/code><\/td><td>Full month January, February, March...<\/td><\/tr><tr><td><code>%y<\/code><\/td><td>Last two digits of year, 11,12,13...<\/td><\/tr><tr><td><code>%Y<\/code><\/td><td>Full year 2011, 2012, 2013...<\/td><\/tr><\/tbody><\/table>",
                    init:function(element){

                    }
                },
                template: {
                    type: 'textarea',
                    title: 'Template content',
                    devices: false,
                    defaultValue: '<div class="avatar">{{avatar}}</div>'
                    +'<div class="tweet">'
                        +'<p class="screen_name">{{screen_name}}</p>'
                        +'<a class="date">{{date}}</a>'
                        +'<p class="content-tweet">{{tweet}}</p>'
                    +'</div>',
                    change: function($panel, el, values, elementData) {
                        if(values.prev != undefined){
                            initTwitter(el,{template:values.current});
                        }
                    }
                },
                template_description: {
                    type: "markup",
                    devices: false,
                    markup: "<table class='option-tiwtter'> <thead> <tr> <th>Template<\/th> <th>Description<\/th> <\/tr><\/thead> <tbody> <tr> <td><code>{{tweet}}<\/code> <\/td><td>Tweet content<\/td><\/tr><tr> <td><code>{{date}}<\/code> <\/td><td>Formatted tweet date<\/td><\/tr><tr> <td><code>{{avatar}}<\/code> <\/td><td>User's Avatar Image<\/td><\/tr><tr> <td><code>{{url}}<\/code> <\/td><td>Direct URL to the tweet<\/td><\/tr><tr> <td><code>{{retweeted}}<\/code> <\/td><td>Returns <code>true<\/code> or <code>false<\/code> if tweet is retweeted<\/td><\/tr><tr> <td><code>{{screen_name}}<\/code> <\/td><td>Screen name of person who posted the tweet<\/td><\/tr><tr> <td><code>{{user_name}}<\/code> <\/td><td>Username of person who posted the tweet<\/td><\/tr><\/tbody><\/table>",
                    init:function(element){

                    }
                }
            }
        },
        ready: ready
	});
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
