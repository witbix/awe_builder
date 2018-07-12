jQuery(document).ready(function($){
    if(AweBuilderSettings.elementTabs && drupalSettings.getListBlock){
        $.get(drupalSettings.getListBlock, function(data){
            var elements = [];
            $(data).each(function(key, item){
                elements[key] = item;
                elements[key].icon = 'acicon acicon-elm-drupal';
            });
            var options = {
                title: 'Drupal block',
                icon: 'acicon acicon-drupal',
                machineName: 'drupalBlocks',
                elTemplateKey: 'delta',
                elements: elements,
                elementSettings: {
                    settings: {}
                },
                renderElementContent:function(){
                }
            };
            jQuery.aweBuilderTabElement(options);
          
        });
    }
});
