/**
 * File: src/elements/tabs/el-tabs.tpl.js
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 09/15/2016
 */
(function($) {
    var titleTemplate = '\
        <li class="js-ac-tab__item ac-tab__item">\
            <a href="#js-ac-tab__item-<%= id %>" class="js-ac-tab__item-link">\
                <% if ( iconPosition === "top" || iconPosition === "left")  { %>\
                    <i class="js-ac-tab__item-icon ac-tab__item-icon <%= iconClasses %>"<% if (disableIcon) {%> style="display: none"<% } %>></i>\
                    <span class="js-ac-tab__item-title ac-tab__item-title"<% if (disableText) {%> style="display: none"<% } %>><%= title %></span>\
                <% } else { %>\
                    <span class="js-ac-tab__item-title ac-tab__item-title"<% if (disableText) {%> style="display: none"<% } %>><%= title %></span>\
                    <i class="js-ac-tab__item-icon ac-tab__item-icon <%= iconClasses %>"<% if (disableIcon) {%> style="display: none"<% } %>></i>\
                <% } %>\
            </a>\
        </li>';
    $.aweBuilderTemplate('el_tabs', {
        elementWrapper: '<div class="js-ac-tab ac-tab"></div>',
        titleWrapper: '<ul class="js-ac-tab__nav ac-tab__nav"></ul>',
        title: titleTemplate,
        contentWrapper: '<div class="js-ac-tab__content ac-tab__content"></div>',
        content:'<div class="js-ac-tab__panel ac-tab__panel"></div>'
    });
})(jQuery);
