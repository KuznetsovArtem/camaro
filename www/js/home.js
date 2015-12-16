var crApp = function() {
    var PATH_PREFIX = '';
    var eventsHandlerElement = 'body';
    var monitorLocation = function() {
        var currentLocation = location.hash;
        setInterval(function() {
            if(currentLocation != location.hash) {
                console.info('location change', currentLocation, location.hash);
                $(eventsHandlerElement).trigger("locationChange", {
                    old: currentLocation,
                    new: location.hash
                });
                currentLocation = location.hash;
            }
        }, 15);
    };

    var loadPartialContent = function(partialPath, desc) {
        var partials = $('body').find('#cr-content'),
            isHomeScreen = false;
        partialPath = partialPath.replace('#', '');
        if (partialPath.length === 0) {
            partialPath = partials.attr('cr-html');
            isHomeScreen = true;
        }
        $('#cr-header').find('.cr-logo-secondary').html(desc);
        if(isHomeScreen) {
            $('#cr-header').find('.cr-navbar').addClass('cr-navbar-home');
            $('body').addClass('cr-content-home');
        } else {
            $('#cr-header').find('.cr-navbar').removeClass('cr-navbar-home');
            $('body').removeClass('cr-content-home');
        }
        partials.load(partialPath + '.html', null, function() {
            $('#app-links-btn').removeClass('expanded');
        });
    };

    $(eventsHandlerElement).on("locationChange", function(e, location) {
        switch (location.new) {
            case '/index':
                loadPartialContent(location.new, '');
                break;
            case '#partials/policy':
                loadPartialContent(location.new, 'Privacy Policy');
                break;
            case '#partials/terms':
                loadPartialContent(location.new, 'Terms Of Use');
                break;
            case '#partials/faq':
                loadPartialContent(location.new, 'FAQ');
                break;
            default :
                loadPartialContent(location.new, '');
                break;
        }

    });
    return {
        init: function(elm, path) {
            $(window).on('load', function() {
                var partials = $('body').find('div[cr-html]');
                crApp.loadContent(partials);

                var windowHeight = $(document).height();
                var interval = setInterval(function(){
                    var menuBtn = $('#app-links-btn'),
                        crCover = $('#cr-cover');
                    if (menuBtn) {
                        crCover.css('height', windowHeight - $('#cr-header').height());
                        menuBtn.on('click', function() {
                            menuBtn.toggleClass('expanded');
                            crCover.toggle();
                        });
                        crCover.find('li').on('click', function() {
                            crCover.toggle();
                        });

                        var crBackBtn = $('#cr-back-btn');
                        crBackBtn.on('click', function() {
                            crCover.hide();
                            menuBtn.removeClass('expanded');
                            window.history.back();
                        });

                        clearInterval(interval);
                    }
                }, 1000);
                monitorLocation();
            });
        },
        loadContent : function(partials) {
            if (!partials.length) {
                var crContent = $('#cr-content');
                partials = $(partials);
            }

            partials.each(function() {
                var partialElm = crContent || $(this),
                    partialPath = (!crContent) ? partialElm.attr('cr-html') : $(this).attr('cr-html');
                partialElm.load(partialPath + '.html', function() {
                    crApp.loadContent(partialElm.find('div[cr-html]'));
                });
            })
        }
    }
}();

crApp.init();

