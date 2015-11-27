/**
 * Created by askuznetsov on 11/5/2015.
 */

// TODO: prevent double loading - array of loaded files;

(function() {
    if(window.loadedHeader) return false;
    window.loadedHeader = true;
    //TODO: pretty check;

    // TOOLS
    var eventsHandlerElement = 'body';

    function monitorLocation() {
        var currentLocation = location.pathname;
        setInterval(function() {
            if(currentLocation != location.pathname) {
                //console.info('location change', currentLocation, location.pathname);
                $(eventsHandlerElement).trigger("locationChange", {
                    old: currentLocation,
                    new: location.pathname
                });
                currentLocation = location.pathname;
            }
        }, 15);
    }

    // UI

    function apendHeader() {
        $('body').prepend('<div id="cr-app-header"><h1>Carrentals App</h1></div>');
    }

    var makeChanges = function() {
        $(function() {
            $('#main-header, #suppliers, #confidence, #main-footer, #feedbackify').hide();
        });
    };

    $(eventsHandlerElement).on("locationChange", function(e, location) {
        switch (location.new) {
            case '/index':
                //TODO: add background;
            break;
            default :
                //TODO: remove bg
            break;
        }

        $('#cr-app-header').text(location.new);
        makeChanges();
    });

    // RUNNER

    var runInterval = setInterval(function(){
        if($('#main-header').length) {
            makeChanges();
            apendHeader();
            monitorLocation();
            clearInterval(runInterval);
        }
    }, 200);
})();