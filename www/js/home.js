var crApp = function() {
    var PATH_PREFIX = '';
    var loadContent = function(partials) {
        partials.each(function() {
            var partialElm = $(this),
                partialPath = partialElm.attr('cr-html');
            partialElm.load(partialPath + '.html', function() {
                loadContent(partialElm.find('div[cr-html]'));
            });
        })
    };
    return {
        init: function(elm, path) {
            $(window).on('load', function() {
                var partials = $('body').find('div[cr-html]');
                loadContent(partials);

                $('#app-links-btn').on('click', function() {
                    $('#cr-cover').toggle();
                });
            });
        }
    }
}();

crApp.init();

