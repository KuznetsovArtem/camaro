/**
 * Created by askuznetsov on 11/5/2015.
 */

// TODO: prevent double loading - array of loaded files;

(function() {
    if(window.loadedHeader) return false;
    window.loadedHeader = true;
    //TODO: pretty check;

    // TOOLS
    var eventsHandlerElement = 'body',
        CR_BACK_BTN_ID = 'cr-back-btn';

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
        var elm = $('#logo');
        elm.before('<a id="' + CR_BACK_BTN_ID + '" class="' + CR_BACK_BTN_ID + '" onclick="history.back();" style="display: none;"></a>');
        elm.parent().css('height', '40px');
    }

    var makeChanges = function() {
        $(function() {
            $('#suppliers, #confidence, #main-footer, #feedbackify').hide();
        });
    };

    $(eventsHandlerElement).on("locationChange", function(e, location) {
        var crHeaderBackBtn = $('#' + CR_BACK_BTN_ID);
        switch (location.new) {
            case '/':
                if (crHeaderBackBtn.length !== 0) {
                    crHeaderBackBtn.hide();
                } else {
                    apendHeader();
                }
            break;
            default :
                if (crHeaderBackBtn.length !== 0) {
                    crHeaderBackBtn.show();
                } else {
                    apendHeader();
                    crHeaderBackBtn.toggle();
                }
                break;
        }

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