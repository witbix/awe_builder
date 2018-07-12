/// <reference path="../../../ts-libraries/jquery.d.ts" />
var AweAccordion = (function () {
    function AweAccordion(el, options) {
        this.$el = (el instanceof HTMLElement) ? jQuery(el) : el;
        this.options = jQuery.extend(true, {}, AweAccordion.defaultOptions, options);
        this.validate();
        this.initialize();
        this.events();
        // activate default active item
        if (this.options.active !== false) {
            var fireEvent = this.options.activeEvent === 'hover' ? 'mouseenter' : "click";
            jQuery(".ac-accordion__header:eq(" + this.options.active + ") a", this.$el).trigger(fireEvent);
        }
    }
    AweAccordion.prototype.validate = function () {
        jQuery('> .ac-accordion__panel', this.$el).each(function (index, item) {
            if (jQuery('.ac-accordion__header', item).length === 0 || jQuery('.ac-accordion__header a', item).length === 0)
                throw Error("Could not find heading element in " + index + " item.");
            if (jQuery('.ac-accordion__body', item).length === 0)
                throw Error("Could not find body element in " + index + " item.");
        });
    };
    AweAccordion.prototype.initialize = function () {
        var $headers = jQuery('.ac-accordion__header a:not(.ac-accordion__body .ac-accordion__header a)', this.$el).removeClass("active");
        var onOffIcon = this.options.onOffIcon;
        if (onOffIcon.enable) {
            var $onOffIcon = jQuery('<i class="ac-accordion__header-icon"></i>').addClass(onOffIcon.collapseIcon);
            if (onOffIcon.position === 'left') {
                // $headers.parent().addClass('ac-accordion__header--icon-left');
                $headers.before($onOffIcon);
            }
            else {
                $headers.after($onOffIcon);
            }
            jQuery('.ac-accordion__header', this.$el).addClass('ac-accordion__header--icon-' + onOffIcon.position);
        }
        jQuery('.ac-accordion__body:not(.ac-accordion__body .ac-accordion__body)', this.$el).hide();
    };
    AweAccordion.prototype.events = function () {
        var _self = this, options = this.options, fireEvent = options.activeEvent === 'hover' ? 'mouseenter' : "click";
        this.$el.delegate(".ac-accordion__header a:not(.ac-accordion__content .ac-accordion__header a)", fireEvent, function (event) {
            event.preventDefault();
            var $panel = jQuery(this).parents(".ac-accordion__panel:first");
            if (options.collapsible) {
                var $statusIcon = jQuery('> .ac-accordion__header-icon', jQuery(this).parent());
                jQuery(this).toggleClass("active ac-active");
                if (jQuery(this).hasClass("active")) {
                    $statusIcon.removeClass(options.onOffIcon.collapseIcon).addClass(options.onOffIcon.expandIcon);
                    jQuery(".ac-accordion__body:first", $panel).stop().slideDown(options.duration, function () {
                        jQuery(this).css({ height: "", "margin-top": "", "margin-bottom": "", "padding-top": "", "padding-bottom": "" });
                    });
                }
                else {
                    $statusIcon.removeClass(options.onOffIcon.expandIcon).addClass(options.onOffIcon.collapseIcon);
                    jQuery(".ac-accordion__body:first", $panel).stop().slideUp(options.duration);
                }
            }
            else if (!jQuery(this).hasClass("active")) {
                var $activatedItem = jQuery(".ac-accordion__header a.active:not(.ac-accordion__content .ac-accordion__header a)", _self.$el);
                $activatedItem.removeClass("active  ac-active");
                jQuery(".ac-accordion__body:first", $activatedItem.parents(".ac-accordion__panel:first")).stop().slideUp(options.duration);
                jQuery('> .ac-accordion__header-icon', $activatedItem.parent()).removeClass(options.onOffIcon.expandIcon).addClass(options.onOffIcon.collapseIcon);
                jQuery(this).addClass("active  ac-active");
                jQuery(".ac-accordion__body:first", jQuery(this).parents(".ac-accordion__panel:first")).stop()
                    .slideDown(options.duration, function () {
                    jQuery(this).css({ height: "", "margin-top": "", "margin-bottom": "", "padding-top": "", "padding-bottom": "" });
                });
                jQuery('> .ac-accordion__header-icon', jQuery(this).parent()).removeClass(options.onOffIcon.collapseIcon).addClass(options.onOffIcon.expandIcon);
            }
        });
    };
    AweAccordion.defaultOptions = {
        active: 0,
        collapsible: false,
        activeEvent: 'click',
        heightStyle: 'content',
        duration: 200,
        onOffIcon: {
            enable: true,
            expandIcon: "acicon acicon-minus",
            collapseIcon: "acicon acicon-plus",
            position: "right"
        }
    };
    return AweAccordion;
}());
jQuery.fn.aweAccordion = function (options) {
    jQuery.each(this, function () {
        if (options == undefined) {
            options = JSON.parse(jQuery(this).attr('data-accordion'));
        }
        var accordion = new AweAccordion(this, options);
        jQuery(this).data("awe-accordion", accordion);
        //refresh options in loop when length > 1
        options = undefined;
    });
    return this;
};
jQuery(document).ready(function ($) {
    $('.js-accordion').aweAccordion();
});
