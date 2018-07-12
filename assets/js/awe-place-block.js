jQuery(document).ready(function ($) {
    if (AweBuilderSettings.elementTabs && drupalSettings.getPlaceBlock) {
        $.get(drupalSettings.getPlaceBlock, function (data) {
            var elements = [];
            $(data).each(function (key, item) {
                elements[key] = item;
                elements[key].icon = 'acicon acicon-elm-drupal';
            });
            var options = {
                title: 'Place Blocks',
                icon: 'acicon acicon-drupal',
                machineName: 'drupalPlaceBlocks',
                elTemplateKey: 'delta',
                elements: elements,
                elementSettings: {},
                elementReady: function (el, element, data) {
                    var extraData = {
                            'delta': data.delta,
                            'module': data.module,
                            'icon': 'acicon acicon-elm-drupal'
                        };
                    element.set('extraData', extraData);
                    element.set('machineName', 'drupalBlocks');
                    element.set('title', 'Drupal block');
                }
            };
            jQuery.aweBuilderTabElement(options);

        });
    }
});
