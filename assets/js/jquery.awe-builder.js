/**
 * File: jquery.awebuilder.ts
 * Author: DuyNg
 * Created: 10/14/2016
 */
/// <reference path="../ts-libraries/jquery.d.ts" />
var ABPlugin = (function () {
    function ABPlugin(el, options) {
        this.el = el;
        this.$el = jQuery(el);
        this.options = jQuery.extend(true, {}, ABPlugin.defaultOpts, options);
        this.currentScreen = ABPlugin.getScreenName();
        this.onResize();
        this.initOverlay();
        this.initAnimation();
    }
    ABPlugin.prototype.initAnimation_old = function () {
        var _self = this;
        jQuery('[data-animation]').abInViewPort({
            inCallback: _self.playAnimation.bind(this)
        });
    };
    ABPlugin.prototype.initAnimation = function () {
        var window_width = jQuery(window).width();
        jQuery("[data-animation]:not(.awemenu-submenu)").each(function () {
            var $item = jQuery(this), animation = $item.attr("data-animation");
            if (animation !== "") {
                animation = jQuery.parseJSON(animation);
                for (var selector in animation) {
                    var selector_arr = selector.split('.'), screen_1 = selector_arr[1], value = animation[selector], $part = void 0;
                    if (value['enable']) {
                        if (value["selector"] !== "" && selector_arr[0] != 'main') {
                            $part = $item.find(value["selector"]);
                        }
                        else {
                            $part = $item;
                        }
                        switch (screen_1) {
                            case "lg":
                                if (window_width <= 1199 && window_width > 991) {
                                    $part.addClass(value["defaultClass"] + " wow " + value["class"]);
                                }
                                else {
                                    $part.removeClass(value["defaultClass"] + " wow " + value["class"]);
                                }
                                break;
                            case "md":
                                if (window_width <= 991 && window_width > 767) {
                                    $part.addClass(value["defaultClass"] + " wow " + value["class"]);
                                }
                                else {
                                    $part.removeClass(value["defaultClass"] + " wow " + value["class"]);
                                }
                                break;
                            case "sm":
                                if (window_width <= 767 && window_width > 575) {
                                    $part.addClass(value["defaultClass"] + " wow " + value["class"]);
                                }
                                else {
                                    $part.removeClass(value["defaultClass"] + " wow " + value["class"]);
                                }
                                break;
                            case "xs":
                                if (window_width <= 575) {
                                    $part.addClass(value["defaultClass"] + " wow " + value["class"]);
                                }
                                else {
                                    $part.removeClass(value["defaultClass"] + " wow " + value["class"]);
                                }
                                break;
                            default:
                                if (window_width >= 1200) {
                                    $part.addClass(value["defaultClass"] + " wow " + value["class"]);
                                }
                                else {
                                    $part.removeClass(value["defaultClass"] + " wow " + value["class"]);
                                }
                        }
                    }
                }
            }
        });
    };
    ABPlugin.prototype.onResize = function () {
        var _self = this;
        jQuery(window).resize(function () {
            var screenName = ABPlugin.getScreenName();
            if (_self.currentScreen !== screenName) {
                _self.prevScreen = _self.currentScreen;
                _self.currentScreen = screenName;
                //                jQuery('[data-animation]').each((index: number, el: HTMLElement) => {
                //                    if (jQuery(el).data('inViewPort'))
                //                        _self.playAnimation(jQuery(el));
                //                });
                _self.initAnimation();
            }
        });
    };
    ABPlugin.prototype.initOverlay = function () {
        jQuery('[data-overlay]').each(function (index, el) {
            var $el = jQuery(el), overlay;
            try {
                overlay = JSON.parse($el.attr('data-overlay'));
            }
            catch (error) {
                overlay = null;
            }
            if (overlay) {
                var i = 0;
                jQuery.map(overlay, function (data, key) {
                    if (i === 0) {
                        var $partEl = data.selector ? jQuery(data.selector, $el) : $el;
                        $partEl.prepend('<div class="ac_bg__overlay"/>');
                        i++;
                    }
                });
            }
        });
    };
    ABPlugin.prototype.playAnimation = function ($element) {
        var _self = this, animation;
        try {
            animation = JSON.parse($element.attr('data-animation'));
        }
        catch (error) {
            animation = null;
        }
        if (animation) {
            jQuery.map(animation, function (data, key) {
                if (data.enable) {
                    var selector_array = key.split('.'), screen_2 = selector_array.length >= 2 ? selector_array[1] : 'xl', $playedEl = data.selector ? jQuery(data.selector, $element) : $element;
                    if (screen_2 === _self.currentScreen || _self.options.loopAnimation) {
                        selector_array[1] = _self.prevScreen;
                        if (animation[selector_array.join('.')] !== undefined) {
                            var prevAnimation = animation[selector_array.join('.')];
                            if (prevAnimation.enable)
                                $playedEl.removeClass([prevAnimation.defaultClass, prevAnimation.class].join(' '));
                        }
                        $playedEl.addClass([data.defaultClass, data.class].join(' '));
                    }
                }
            });
        }
    };
    ABPlugin.getScreenName = function () {
        var ww = window.innerWidth;
        if (991 < ww && ww < 1200)
            return 'lg';
        else if (767 < ww && ww < 992)
            return 'md';
        else if (ww < 768 && ww > 575)
            return 'sm';
        else if (ww < 576)
            return 'xs';
        return 'xl';
    };
    ABPlugin.defaultOpts = {
        loopAnimation: false
    };
    return ABPlugin;
}());
jQuery.fn.abPlugin = function (options) {
    return this.each(function (index, el) {
        var builder = new ABPlugin(el, options);
        jQuery(this).data('awb-plugin', builder);
    });
};
jQuery.fn.abInViewPort = function (options) {
    function getOffset($el) {
        var height = $el.height(), offset = 0.5 * height;
        if (options) {
            if (typeof options.offset === 'string' && options.offset.indexOf('%') !== -1) {
                offset = height * parseInt(options.offset) / 100;
            }
            else if (typeof options.offset === 'number')
                offset = options.offset;
        }
        return offset;
    }
    function checkInViewPort(el) {
        var $el = jQuery(el), elTop = $el.offset().top, elBottom = elTop + $el.height(), prevScroll = jQuery(window).scrollTop(), isScrollDowned = true, inViewPort = false;
        jQuery(window).scroll(function () {
            var scrollTop = jQuery(window).scrollTop(), offset = getOffset($el);
            isScrollDowned = (scrollTop >= prevScroll);
            prevScroll = scrollTop;
            var checkPosition = isScrollDowned ? elTop + offset : elBottom - offset;
            if (scrollTop <= checkPosition && checkPosition <= scrollTop + window.innerHeight) {
                if (!inViewPort) {
                    $el.trigger('abInViewPort').data('inViewPort', true);
                    inViewPort = true;
                    if (options && typeof options.inCallback === 'function')
                        options.inCallback($el);
                }
            }
            else {
                if (inViewPort) {
                    $el.trigger('abOutViewPort').data('inViewPort', false);
                    inViewPort = false;
                    if (options && typeof options.outCallback === 'function')
                        options.outCallback($el);
                }
            }
        });
    }
    return this.each(function (index, el) {
        checkInViewPort(el);
    });
};
