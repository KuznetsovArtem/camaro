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
        WEB_HOME_URL = 'https://www2.carrentals.com';
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
        if(pathname === '/offers' || pathname === '/goto') {
            window.location = WEB_HOME_URL;
        }
        else if(pathname === '/' || pathname === '/bookings') {
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
        var pathname = window.location.pathname;

        menuElm = $('#main-header');

        if ($('#' + CR_ClOSE_EMBEDED_VIEW).length > 0) {
            return;
        }
        elm.on('click', function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            return false;
        });
        //// TODO: Trigger back buttons on location change;
        elm.before('<a id="' + CR_ClOSE_EMBEDED_VIEW + '" class="' + CR_BACK_BTN_ID + '" onclick="closeEmbededView();"></a>');

        //==========
        //elm.before('<div id="closeIcon" class="hamburger-icon open" style="display: none !important; float: left !important;">' +
        //    '<span></span>' +
        //    '<span></span>' +
        //    '<span></span>' +
        //    '</div>');

        elm.parent().css('height', '46px');
        var navItems = menuElm.find('nav').find('ul').find('li');

        navItems.last().after('<li id="contactUsMenu"><a href="mailto:support@carRentals.com; return false;">Contact Us</a></li>');
        // Close nav menu after clicking on menu item
        navItems.on('click', function() {
            $('.hamburger-icon').click();
        })
        //==========
        if(pathname === '/') {
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

            //if(window.location.pathname == '/') {
            //    $('body').addClass('page-background')
            //}

            $('body').show(0);
        });
    };

    $(eventsHandlerElement).on("locationChange", function(e, location) {
        //makeChanges();
        apendHeader();
        makeChanges();
    });

    // RUNNER
    monitorLocation();
    var runInterval = setInterval(function(){
        if($('#main-header').length) {
            //makeChanges();
            apendHeader();
//            monitorLocation();
            makeChanges();
            clearInterval(runInterval);
        }
    }, 10);
})();