/**
 * File: src/elements/accordion/el_accordion.tpl.js
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 09/19/2016
 */

(function($, _$, _window) {
    $.aweBuilderTemplate('el_accordion', {
        elementWrapper: '<div class="js-ac-accordion ac-accordion"></div>',
        accordionItem: '\
            <div class="js-ac-accordion__panel ac-accordion__panel">\
                <div class="js-ac-accordion__header ac-accordion__header ac-accordion__header--icon-<%= onOffIcon.position %><% if (titleIconPosition) { %> ac_icon--<%= titleIconPosition %><% } %>">\
                    <% if (onOffIcon.position == "left") { %>\
                    <i class="js-ac-accordion__header-icon ac-accordion__header-icon <%= onOffIcon.collapseIcon %>"\
                     data-expand-icon="<%= onOffIcon.expandIcon %>" \
                     data-collapse-icon="<%= onOffIcon.collapseIcon %>"\
                     <% if (!onOffIcon.enable) { %> style="display: none"<% } %>">\
                     </i>\
                    <% } %>\
                    <a href="<%= itemID %>">\
                        <% if (titleIconPosition == "left" || titleIconPosition == "top") { %>\
                        <i class="js-ac-accordion__title-icon <%= titleIconClasses %>"<% if (!enableTitleIcon) { %> style="display: none"<% } %>></i>\
                        <% } %>\
                        <span class="js-ac-accordion__title"<% if (!enableTextTitle) { %> style="display: none"<% } %>><%= title %></span>\
                        <% if (titleIconPosition == "bottom" || titleIconPosition == "right") { %>\
                        <i class="js-ac-accordion__title-icon <%= titleIconClasses %>"<% if (!enableTitleIcon) { %> style="display: none"<% } %>></i>\
                        <% } %>\
                    </a>\
                    <% if (onOffIcon.position == "right") { %>\
                    <i class="js-ac-accordion__header-icon ac-accordion__header-icon <%= onOffIcon.collapseIcon %>"\
                     data-expand-icon="<%= onOffIcon.expandIcon %>" \
                     data-collapse-icon="<%= onOffIcon.collapseIcon %>"\
                     <% if (!onOffIcon.enable) { %> style="display: none"<% } %>">\
                     </i>\
                    <% } %>\
                </div>\
                <div class="js-ac-accordion__panel-body ac-accordion__body"></div>\
            </div>'
    });
})(jQuery, AweBuilder._jQuery, AweBuilder._window);
