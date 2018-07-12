/**
 * File: jquery.medium-editor.js
 * Author: DuyNg
 * Website: http://megadrupal.com/
 * Created: 07/07/2016
 */
(function($) {
    $.fn.mediumEditor = function(options) {
        $.each(this, function() {
            var editor = new MediumEditor(this, options),
                hasPtag = $('> p', this).length;
            $(this).data('mediumEditor', editor).data('hasPTag', hasPtag);
        });

        return this;
    }
})(jQuery);
