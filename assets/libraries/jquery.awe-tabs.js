/**
 * File: jquery.awe-tabs.js
 * Author: MegaDrupal
 * Website: http://megadrupal.com/
 */
(function($) {
    'use strict';

    var AweTabs = function($el, options) {
        var defaultOpts = {
            active: false,
            event: 'hover',
            position: null,
            textAlign: null,
            collapsible: false,
            heightStyle: 'content',
            beforeActivate: function(event, tabs){},
            activate: function(event, tabs){},
            beforeDeactivate: function($tab){},
            deactivate: function($tab){}
        }

        this.options = $.extend(defaultOpts, options);
        this.$el = $el;
        this.resizeTimeout = false;
        this.initialize();
    }
    AweTabs.prototype = {
        constructor: AweTabs,
        initialize: function() {
            // add class awe-tabs
            this.$el.addClass('awe-tabs');

            // get tabs controller
            var _self = this,
                opts = this.options,
                positionClass = opts.position ? 'tabs-' + opts.position : 'tabs-top',
                alignClass = opts.textAlign ? 'tabs-' + opts.textAlign : '',
                $controller = $('> ul', this.$el).addClass('tabs-nav').addClass(positionClass).addClass(alignClass);

            // init for tabs
            $('> li', $controller).each(function() {
                var href = $('> a', this).attr('href'),
                    $tabContent = $(href, _self.$el);

                $(this).addClass('awe-tab').removeClass('active');
                $tabContent.addClass('awe-tabs-panel tabs-panel').hide();
            });

            // handle resize window to calculate tabs height
            if (opts.heightStyle === 'auto') {
                $(window).resize(function () {
                    $('.awe-tabs-panel', this.$el).css('height', '');
                    if (_self.resizeTimeout)
                        clearTimeout(_self.resizeTimeout);
                    _self.resizeTimeout = setTimeout(function () {
                        _self.initTabsHeight();
                        _self.resizeTimeout = 0;
                    }, 100);
                });
            }

            // initialize for event active tab
            var activeEvent = $.inArray(opts.event, ['click', 'hover']) ? opts.event : 'click';
            if (activeEvent === 'hover') {
                activeEvent = 'mouseover';
                $('a', $controller).bind('click', function(event) {
                    event.preventDefault();
                });
            }

            // handle event active on a tag of tab controller
            $('a', $controller).bind(activeEvent, function(event) {
                var $activeTab = $('li.active', $controller),
                    $currentTab = $(this).parents('li:first');

                // Call custom activate function
                _self.options.beforeActivate(event, {prevTab: $activeTab, newTab: $currentTab})

                event.preventDefault();

                if (!$currentTab.is($activeTab)) {
                    _self.deactivateTab($activeTab);
                    _self.activateTab($currentTab);
                    _self.options.activate(event, {prevTab: $activeTab, newTab: $currentTab})
                }
                else if (opts.collapsible) {
                    _self.deactivateTab($currentTab);
                    _self.options.activate(event, {prevTab: $currentTab, newTab: null})
                }
            });

            // active default tab
            if (opts.active !== false) {
                var $defTab = $('li:eq(' + opts.active + ')', $controller);
                if ($defTab.length)
                    _self.activateTab($defTab);
            }
        },
        initTabsHeight: function() {
            var maxHeight = 0;

            $('.awe-tabs-panel', this.$el).each(function() {
                var $tab = $(this),
                    display = $tab.css('display');

                if (display === 'none')
                    $tab.css({opacity: 0, display: 'block', position: 'absolute'});

                if ($tab.height() > maxHeight)
                    maxHeight = $tab.height();

                $tab.css({opacity: '', display: display, position: ''});
            }).height(maxHeight);
        },
        activateTab: function ($tab) {
            var href = $('a', $tab).attr('href');
            $tab.addClass('active');
            $(href, this.$el).addClass('awe-tab-active').show();
        },
        deactivateTab: function ($tab) {
            this.options.beforeActivate($tab);
            var href = $('a', $tab).attr('href');
            $tab.removeClass('active');
            $(href, this.$el).removeClass('awe-tab-active').hide();
            this.options.deactivate($tab);
        },
        setOption: function(options) {
            this.options = $.extend(this.options, options);
            this.update();
        },
        destroy: function(isUpdate) {
             $('> ul a', this.$el).unbind('click').unbind('mouseover');
             if (!isUpdate)
                this.$el.data('awe-tabs', false)
        },
        update: function() {
            this.destroy(true);
            this.initialize();
        }
    }
    $.fn.aweTabs = function(options) {
        var args = Array.prototype.slice.call(arguments, 1),
            returnValue = this;

        this.each(function() {
            var $el = $(this),
                tabs = $el.data('awe-tabs');

            switch ($.type(options)) {
                case 'string':
                    var methods = ['option'];

                    if (tabs) {
                        switch (options) {
                            case 'option':
                                var opts = {};

                                if ($.type(args[0]) == 'object') {
                                    opts = args[0];
                                    tabs.setOption(opts);
                                }
                                else if ($.type(args[0]) == 'string') {
                                    if (args[1] !== undefined) {
                                        opts[args[0]] = args[1];
                                        tabs.setOption(opts);
                                    }
                                    else
                                        returnValue = tabs.getOption(args[0]);
                                }
                                break;

                            case 'destroy':
                                tabs.destroy();
                                break;

                            case 'update':
                                tabs.update();
                                break;

                            default:
                                throw Error('Error: method "'+ options +'" does not exist on aweTabs');
                                break;
                        }
                    }
                    else
                        throw Error('Error: cannot call methods on aweTabs prior to initialization;');
                    break;

                case 'object':
                    if (tabs)
                        tabs.setOption(options);
                    else {
                        tabs = new AweTabs($el, options);
                        $el.data('awe-tabs', tabs);
                    }
                    break;
                default:
                    if (!tabs) {
                        tabs = new AweTabs($el, {});
                        $el.data('awe-tabs', tabs);
                    }
                    break;
            }
        });
        return returnValue;
    }
})(jQuery);
