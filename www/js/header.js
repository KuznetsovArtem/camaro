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
        CR_BACK_BTN_ID = 'cr-back-btn',
        CR_ClOSE_EMBEDED_VIEW = 'cr-close-web-btn',
        WEB_HOME_URL = 'https://dev.carrentals.com';

    function monitorLocation() {
        var currentLocation = location.pathname;
        setInterval(function() {
            if(currentLocation != location.pathname) {
                $(eventsHandlerElement).trigger("locationChange", {
                    old: currentLocation,
                    new: location.pathname
                });
                currentLocation = location.pathname;
            }
        }, 15);
    }

    window.closeEmbededView = function() {
        if(window.location.pathname === '/') {
            window.location.pathname = '/closewebview';
        }
        else {
            history.back();
        }
    };

    // UI
    function apendHeader() {
        var crHeaderBackBtn = $('#' + CR_BACK_BTN_ID),
            elm = $('#logo'),
            menuElm;
        menuElm = $('#main-header');

        // TODO: Trigger back buttons on location change;
        elm.before('<a id="' + CR_ClOSE_EMBEDED_VIEW + '" class="' + CR_BACK_BTN_ID + '" onclick="closeEmbededView();"></a>');
        elm.parent().css('height', '46px');
        menuElm.find('nav').find('ul').before('<ul class="nav navbar-nav">' +
                '<li class="dropdown" id="myBookingsMenu"><a href="' + WEB_HOME_URL + '/bookings">Reservations</a></li>' +
                '<li class="dropdown" cr-html="partials/policy"><a href="' + WEB_HOME_URL + '/privacy-policy">Privacy Policy</a></li>' +
                '<li class="dropdown" cr-html="partials/terms"><a href="' + WEB_HOME_URL + '/terms">Terms of Use</a></li>' +
                '<li class="dropdown" cr-html="partials/faq"><a href="' + WEB_HOME_URL + '/faq">FAQ</a></li>' +
                '<li class="dropdown" id="contactUsMenu"><a href="mailto:support@carRentals.com">Contact Us</a></li>' +
                '</ul>');
    }

    var makeChanges = function() {
        $(function() {
            $('#suppliers, #confidence, #main-footer, #feedbackify').hide();
        });
    };

    $(eventsHandlerElement).on("locationChange", function(e, location) {
        apendHeader();
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