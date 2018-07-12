jQuery(document).ready(function ($) {
    var template_type = drupalSettings.aweBuilderTemplateType;

    // callback to show node form
    function showNodeForm() {
        jQuery('body').removeClass('awecontent-active').find('.js-awecontent-wrapper').removeClass('awecontent-wrapper');
        jQuery('.awecontent-body-wrapper').children().show();
        // fix for toolbar
        jQuery('#toolbar, #admin-menu').show();
    }

    // callback to hide node form
    function disableNodeForm() {
        jQuery('body').addClass('awecontent-active').find('.js-awecontent-wrapper').addClass('awecontent-wrapper');
        jQuery('.awecontent-body-wrapper').children().hide();
        // fix for toolbar
        jQuery('#toolbar, #admin-menu').hide();
    }
    
    //not allow  edit, delete template theme
    function notAllowEditDeleteTemplateTheme(){
        $('.js-template-item').each(function(){
            if(!parseInt($(this).attr('template-id')))
                $('.ac_control__edit, .ac_control__delete', this).hide();
        });
    }

    // main
    jQuery.extend(AweBuilderSettings.URLs, drupalSettings.aweBuilderTemplateSettings);

    // Move all body children in to wrapper
    jQuery('body').append('<div class="awecontent-body-wrapper"></div>');
    jQuery('.awecontent-body-wrapper').append(jQuery('body').children(':not(.awecontent-body-wrapper, .sp-container)'));
    jQuery('body').prepend('<div class="awecontent-wrapper"></div>');
    // sap xep templates
    jQuery('.js-ac-templates').acManageTemplate({
        templateType: template_type,
        onBuilderClose: function(template){
            showNodeForm();
        },
        onBuilderReady:function(template){
            // remove button save template in toolbar botttom
            $('.js-save-page-tpl-btn').remove();
        }
    });

    // Handle click button to open page builder
    jQuery('.js-new-template-btn').click(function(event) {
        event.preventDefault();
        jQuery('body').addClass('awecontent-active');
        disableNodeForm();
    });

    // handle events on templates controller
    jQuery('.ac_templates__grid').delegate('.grid-item .ac_control li', 'click', function (event) {
        event.preventDefault();
        if (jQuery(this).hasClass('ac_control__edit')){
            jQuery('body').addClass('awecontent-active');
            disableNodeForm();
        }
    });
    
    //not allow  edit, delete template theme
    notAllowEditDeleteTemplateTheme();

    jQuery('.js-load-more-templates').click(function(event) {
        event.preventDefault();
        var currentTemplates = jQuery('.ac_templates__grid .grid-item').length,
            _self = $(this);
        $.post(drupalSettings.aweBuilderTemplateLoadMore, {act:'loadTemplates',currentTemplates:currentTemplates}, function(data){
            if($.type(data) == 'string')
                data = $.parseJSON(data);
            
            $(data.templates).each(function(){
                var template = this;
                var $template = jQuery("\n            <div class=\"js-template-item grid-item\" template-id=\"" + template.tid + "\">\n                <div class=\"item\">\n                    <div class=\"ac_control\">\n                        <ul>\n                            <li class=\"js-edit-btn ac_control__edit\" title=\"" + window.aweTranslate('Edit') + "\">\n                                <i class=\"acicon acicon-pen\"></i>\n                            </li>\n                            <li class=\"ac_control__clone\" title=\"" + window.aweTranslate('Clone') + "\">\n                                <i class=\"acicon acicon-clone\"></i>\n                            </li>\n                            <li class=\"ac_control__delete\" title=\"" + window.aweTranslate('Delete') + "\">\n                                <i class=\"acicon acicon-del\"></i>\n                            </li>\n                        </ul>\n                    </div>\n                    <a href=\"#\">\n                        <div class=\"img\">\n                            <img src=\"" + template.thumbnail + "\" alt=\"\">\n                            <input type=\"hidden\" value='" + template.cover + "'>\n                        </div>\n                        <div class=\"caption\">" + template.title + "</div>\n                        <textarea class=\"template-data\" style=\"display: none\"></textarea>\n                    </a>\n                </div>\n            </div>");
                // set template data
                jQuery('textarea', $template).val(template.data);
                // add category classes
                $template.addClass(template.category.toLowerCase());
                if(template.classes)
                    $template.addClass(template.classes);
                $template.hide();
                // add template to begin of list template
                jQuery('.js-templates').append($template);
            });
            // show template by filter
            jQuery('.ac_templates__filters .current').removeClass('current').trigger('click');
            // reload isotope items
            if (jQuery.fn.isotope) {
                jQuery('.js-templates').isotope('reloadItems').isotope({ sortBy: 'original-order' });
            }
            //not allow  edit, delete template theme
            notAllowEditDeleteTemplateTheme();
            if(!data.load_more){
                _self.parent().hide();
            }
        });
        return false;
    });

});