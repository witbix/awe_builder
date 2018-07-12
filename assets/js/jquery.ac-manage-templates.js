/**
 * File: src/js/jquery-mange-templates/jquery.ac-manage-templates.ts
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 07/24/2016
 */
/// <reference path="../ts-libraries/jquery.d.ts"/>
/// <reference path="./awe-builder.d.ts"/>
/**
 * AweMangeTemplates
 */
var AweMangeTemplates = (function () {
    /**
     * constructor function
     */
    function AweMangeTemplates(el, options) {
        // set wrapper element
        this.$el = (el instanceof HTMLElement) ? jQuery(el) : el;
        // set options
        this.options = jQuery.extend(true, {}, AweMangeTemplates.defaultOptions, options);
        // implements init
        this.init();
    }
    /**
     * init for templates manage
     */
    AweMangeTemplates.prototype.init = function () {
        var _self = this, contentClass = this.options.templateType === 'page' ? 'Sections' : 'Section';
        // get stickyPosition
        var $filterWrapper = jQuery('.ac_templates__filters > ul');
        this.stickyPosition = $filterWrapper.offset().top + $filterWrapper.height();
        // process view for template cover image
        this.$el.delegate('.grid-item', 'mouseenter', function () {
            var $img = jQuery('img', this), ratio = $img.height() / $img.width();
            if (ratio <= 0.96)
                $img.css({ top: 0, transform: 'none' });
        });
        // create builder
        this.builder = eval("new AweBuilder." + this.options.builderClass + "({\n            contentClass: '" + contentClass + "',\n            wrapper: '.awecontent-wrapper',\n            buildButtons: {\n                defaultButton: '',\n                fromTemplateButton: ''\n            },\n            onClose: jQuery.proxy(_self.onBuilderClose, _self),\n            onReady: jQuery.proxy(_self.onBuilderReady, _self)\n        })");
        // handle click to template item
        this.$el.delegate('.grid-item > .item > a', 'click', function (event) {
            event.preventDefault();
        });
        // handle events on templates controller
        jQuery('.ac_templates__grid', this.$el).delegate('.grid-item .ac_control li', 'click', function (event) {
            event.preventDefault();
            var $controller = jQuery(this), $template = jQuery(this).parents('.grid-item:first');
            if ($controller.hasClass('ac_control__edit'))
                _self.editTemplate($template);
            else if ($controller.hasClass('ac_control__clone'))
                _self.cloneTemplate($template);
            else
                _self.deleteTemplate($template);
        });
        // init isotope plugins
        if (jQuery.fn.isotope) {
            // init isotope
            jQuery('.js-templates', this.$el).isotope({
                itemSelector: '.grid-item',
                layoutMode: 'masonry'
            }).on('arrangeComplete', function () {
                jQuery(window).trigger('resize');
            });
        }
        // init filters
        jQuery('.ac_templates__filters li > a', this.$el).click(function (event) {
            event.preventDefault();
            if (!jQuery(this).hasClass('current')) {
                // remove current activated filter
                jQuery('.ac_templates__filters li > a.current', this.$el).removeClass('current');
                // set selected filter active
                jQuery(this).addClass('current');
                // filter templates
                var filter = jQuery(this).attr('data-filter');
                if (jQuery.fn.isotope) {
                    jQuery('.js-templates', _self.$el).isotope({ filter: filter });
                }
                else {
                    jQuery(".js-templates > .grid-item" + filter, _self.$el).fadeIn(300);
                    jQuery(".js-templates > .grid-item:not(" + filter + ")", _self.$el).fadeOut(300);
                }
            }
        });
        // handle click add new template button
        $newTemplate = jQuery('.js-new-template-btn', this.$el);
        if (!$newTemplate.length)
            $newTemplate = jQuery('.js-new-template-btn');
        $newTemplate.click(function (event) {
            event.preventDefault();
            // hide templates list
            _self.$el.hide();
            // open builder
            var template = {
                type: _self.options.templateType,
                title: '',
                id: -1,
                data: {},
                cover: { url: '', 'fid': -1 }
            };
            _self.builder.setOptions({ templateMode: template });
            _self.builder.open();
        });
        // handle window resize to calculate size and position of templates container
        jQuery(window).resize(function () {
            var windowWidth = jQuery(window).width(), templateWidth = jQuery('.js-templates > .grid-item:visible', _self.$el).outerWidth(true), itemsRow = Math.floor(windowWidth / templateWidth);
            if (windowWidth < 1440)
                jQuery('.js-templates', _self.$el).width(itemsRow * templateWidth).css('margin', '0 auto');
            else
                jQuery('.js-templates', _self.$el).css({ width: '', margin: '' });
        }).trigger('resize').scroll(function () {
            var scrollTop = jQuery(window).scrollTop();
            if (scrollTop >= _self.stickyPosition)
                jQuery('.ac_templates__filters', _self.$el).addClass('ac_templates__filters--sticky');
            else
                jQuery('.ac_templates__filters', _self.$el).removeClass('ac_templates__filters--sticky');
        });
    };
    /**
     * callback when builder close
     */
    AweMangeTemplates.prototype.onBuilderClose = function (template) {
        // implements custom callback when builder close
        if (typeof this.options.onBuilderClose === 'function')
            this.options.onBuilderClose(template);
        // show list templates
        this.$el.show();
        // process template data
        if (template) {
            var $editingTemplate = jQuery(".js-template-item[template-id=" + template.id + "]");
            if ($editingTemplate.length === 0) {
                // add new template
                $editingTemplate = this.addTemplate(template);
            }
            else {
                // change data of edit template
                jQuery('img', $editingTemplate).attr('src', template.cover.url);
                jQuery('.img > input', $editingTemplate).val(JSON.stringify(template.cover));
                jQuery('.caption', $editingTemplate).html(template.title);
                jQuery('textarea', $editingTemplate).val(JSON.stringify(template.data));
            }
        }
    };
    /*
     * callback when builder ready
     */
    AweMangeTemplates.prototype.onBuilderReady = function (template) {
        // implements custom callback when builder close
        if (typeof this.options.onBuilderReady === 'function')
            this.options.onBuilderReady(template);
    };
    /**
     * get template data from template element
     */
    AweMangeTemplates.prototype.getTemplateData = function ($template, extractData) {
        var template = {};
        if ($template.length == 1) {
            template.id = $template.attr('template-id');
            template.type = this.options.templateType;
            template.title = jQuery('.caption', $template).html().trim();
            template.cover = AweBuilder.parseJSON(jQuery('.img > input[type=hidden]', $template).val());
            template.data = extractData !== false ? JSON.parse(jQuery('textarea', $template).val()) : jQuery('textarea', $template).val();
        }
        return template;
    };
    /**
     * open builder to edit template
     */
    AweMangeTemplates.prototype.editTemplate = function ($template) {
        // get template data
        var template = this.getTemplateData($template);
        this.builder.setOptions({
            templateMode: template
        });
        this.builder.open();
        // hide list templates
        this.$el.hide();
    };
    /**
     * clone template
     */
    AweMangeTemplates.prototype.cloneTemplate = function ($template) {
        var template = this.getTemplateData($template, false);
        if (template) {
            // reset template id as new template
            template.id = -1;
            // set action is save
            template.requestAction = 'save';
            // create request to save template
            var _self_1 = this, postParams = AweBuilder.prepareAjaxParamenters('templates', template);
            if (postParams) {
                jQuery.post(postParams.url, postParams.data, function (response) {
                    if (response.status)
                        _self_1.addTemplate(response.template);
                }, 'json');
            }
        }
    };
    /**
     * delete template
     */
    AweMangeTemplates.prototype.deleteTemplate = function ($template) {
        var template = this.getTemplateData($template);
        if (template && template.id >= 0) {
            var _self_2 = this, postParams = AweBuilder.prepareAjaxParamenters('templates', { id: template.id, requestAction: 'delete', type: this.options.templateType });
            if (postParams) {
                jQuery.post(postParams.url, postParams.data, function (response) {
                    if (response.status) {
                        // remove template view
                        $template.remove();
                        // reload isotope items
                        if (jQuery.fn.isotope) {
                            jQuery('.js-templates', _self_2.$el).isotope('reloadItems').isotope({ sortBy: 'original-order' });
                        }
                    }
                }, 'json');
            }
        }
    };
    /**
     * render template
     */
    AweMangeTemplates.prototype.addTemplate = function (template) {
        var $template = jQuery("\n            <div class=\"js-template-item grid-item\" template-id=\"" + template.id + "\">\n                <div class=\"item\">\n                    <div class=\"ac_control\">\n                        <ul>\n                            <li class=\"js-edit-btn ac_control__edit\" title=\"" + window.aweTranslate('Edit') + "\">\n                                <i class=\"acicon acicon-pen\"></i>\n                            </li>\n                            <li class=\"ac_control__clone\" title=\"" + window.aweTranslate('Clone') + "\">\n                                <i class=\"acicon acicon-clone\"></i>\n                            </li>\n                            <li class=\"ac_control__delete\" title=\"" + window.aweTranslate('Delete') + "\">\n                                <i class=\"acicon acicon-del\"></i>\n                            </li>\n                        </ul>\n                    </div>\n                    <a href=\"#\">\n                        <div class=\"img\">\n                            <img src=\"" + template.cover.url + "\" alt=\"\">\n                            <input type=\"hidden\" value='" + JSON.stringify(template.cover) + "'>\n                        </div>\n                        <div class=\"caption\">" + template.title + "</div>\n                        <textarea class=\"template-data\" style=\"display: none\"></textarea>\n                    </a>\n                </div>\n            </div>");
        // set template data
        jQuery('textarea', $template).val(JSON.stringify(template.data));
        // add category classes
        $template.addClass(template.category.toLowerCase());
        // add template to begin of list template
        jQuery('.js-templates', this.$el).prepend($template);
        // reload isotope items
        if (jQuery.fn.isotope) {
            jQuery('.js-templates', this.$el).isotope('reloadItems').isotope({ sortBy: 'original-order' });
        }
        return $template;
    };
    /**
     * default options
     */
    AweMangeTemplates.defaultOptions = {
        builderClass: 'Builder',
        templateType: 'page'
    };
    return AweMangeTemplates;
}());
jQuery.fn.acManageTemplate = function (options) {
    return this.each(function () {
        jQuery(this).data('ac-manage-templates', new AweMangeTemplates(this, options));
    });
};
