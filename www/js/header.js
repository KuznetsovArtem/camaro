/**
 * Created by askuznetsov on 11/5/2015.
 */

(function() {
    if(window.loadedHeader) return false;
    window.loadedHeader = true;
    //TODO: pretty check;

    // TOOLS
    var eventsHandlerElement = 'body',
        CR_BACK_BTN_ID = 'cr-back-btn',
        CR_ClOSE_EMBEDED_VIEW = 'cr-close-web-btn',
        WEB_HOME_PATH = '/apphome',
        WEB_BOOKING_PATH = '/bookings',
        WEB_HOME_URL = 'https://www2.carrentals.com/apphome',
        WEB_CLOSE_VIEW = '/closewebview';
        // TODO: update this url;

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
        var pathname = window.location.pathname;
        if(pathname === '/' || pathname === WEB_BOOKING_PATH || pathname === WEB_HOME_PATH || window.location.hash === '#contactus') {
            window.location.pathname = WEB_CLOSE_VIEW;
        }
        else if(pathname === '/offers' || pathname === '/goto') {
            window.location = WEB_HOME_URL;
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
        var pathname = window.location.pathname;

        menuElm = $('#main-header');
        menuElm.show();

        if ($('#' + CR_ClOSE_EMBEDED_VIEW).length > 0) {
            return;
        }
        elm.on('click', function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            return false;
        });

        elm.before('<a id="' + CR_ClOSE_EMBEDED_VIEW + '" class="' + CR_BACK_BTN_ID + '" onclick="closeEmbededView();"></a>');
        elm.parent().css('height', '46px');
        var navItems = menuElm.find('nav').find('ul').find('li');
        var reservationLink = navItems.first().find('a');
        var reservationLinkUrl = reservationLink.attr('href');
        var reservationLinkUrlSuf = (reservationLinkUrl.indexOf('?') !== -1) ? '&' : '?';

        reservationLink.attr('href', reservationLinkUrl + reservationLinkUrlSuf + 'is_mobile_app=true');

        navItems.last().after('<li id="contactUsMenu"><a>Contact Us</a></li>');
        // Since 'mailto:' ref doesn't work properly inside inAppBrowser we need to close current window and call email
        // client from native app
        $('#contactUsMenu').on('click', function() {
            window.location.hash = '#contactus';
            closeEmbededView();
        });
        // Close nav menu after clicking on menu item
        navItems.on('click', function() {
            $('.hamburger-icon').trigger('click');
        });
        //==========
        if(pathname === '/' || pathname === WEB_HOME_PATH || pathname === '/offers') {
            function runOpenListener() {
                var runInterval = setInterval(function () {
                    $('.pika-single').each(function () {
                        if (!$(this).hasClass('is-hidden')) {
                            $('#' + CR_ClOSE_EMBEDED_VIEW).toggle();
                            $('#closeIcon').toggle();
                            clearInterval(runInterval);
                            runCloseListener($(this));
                        }
                    });
                }, 10);
            }

            function runCloseListener(elm) {
                var runInterval = setInterval(function () {
                    if (elm.hasClass('is-hidden')) {
                        $('#' + CR_ClOSE_EMBEDED_VIEW).toggle();
                        $('#closeIcon').toggle();
                        clearInterval(runInterval);
                        runOpenListener();
                    }
                }, 10);
            }

            runOpenListener();
        }
    }

    var makeChanges = function() {
        $(function() {
            $('#suppliers, #confidence, #main-footer, #feedbackify a, .getstarted-message').hide();
            if($('.js-login-button').length) {
                $('.js-login-button').parent().find('p').css('visibility', 'hidden');
            }
            $('body').show(0);
        });
    };

    $(eventsHandlerElement).on("locationChange", function() {
        apendHeader();
        makeChanges();
    });

    // RUNNER
    monitorLocation();
    var runInterval = setInterval(function(){
        if($('#main-header').length) {
            $('#main-header').show();
            apendHeader();
            makeChanges();
            clearInterval(runInterval);
        }
    }, 10);
})();