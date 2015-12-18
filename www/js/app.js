var CONFIG = {
    WEB_HOME_URL: 'https://dev.carrentals.com',
    WEB_BOOKING_URL: 'https://book.carrentals.com/bookings',
    CLOSE_EMB_VIEW_URL: 'closewebview',
    APP_VERSION: '0.0.5'
};

var app = (function(config, $) {

    var CONNECTION_STATUS = false;

    var exec = {
        loadedFiles:[],
        flush: function() {
          this.loadedFiles = [];
        },
        all  : function(injects) {}, // TODO;
        code : function(app, execFx, callback) {
            app.executeScript(
                {code: '('+ execFx.toString() +')()'},
                callback
            );
        },
        js : function(app, jsFileName, callack) {
            if($.inArray(jsFileName, exec.loadedFiles) !== -1) {
                return console.warn(jsFileName, 'already loaded');
            }
            $.get(jsFileName)
                .done(function(data) {
                    app.executeScript({code: data}, function() {
                        exec.loadedFiles.push(jsFileName);
                        callack&&callack();
                    });
                })
                .fail(function() {
                   console.warn('Js file not loaded:', jsFileName);
                });
        },
        inlineCss: function(app, style, callback) {
            app.insertCSS({code: style}, callback);
        },
        css  : function(app, cssFileName, callback) {
            $.get(cssFileName)
                .done(function(data) {
                    app.insertCSS({code: data}, callback);
                })
                .fail(function() {
                    console.warn('Css file not loaded:', cssFileName);
                });
        }
    };

    var homePageInjects = {
        js: function() {

        },
        file : {
            js: 'js/header.js', // TODO: []
            css: 'css/header.css' // TODO: []
        }
    };

    return {
        // Application Constructor
        initialize: function() {
            this.bindEvents();
        },
        bindEvents: function() {
            document.addEventListener('deviceready', this.onDeviceReady, false);
            // TODO: connection status;
            document.addEventListener('offline', this.onDeviceOffline, false);
            document.addEventListener('online', this.onDeviceOnline, false);
            //document.addEventListener('load', this.onDeviceOffline, false);
            // TODO: native buttons behaviour;
        },
        onDeviceReady: function() {
            $(function() {
                function launchInAppBrowser(evt) {
                    app.openWebApp(evt.data, homePageInjects, '_blank');
                }
                //$('#content').load('tpls/static.html');
                var bodyElm = $('body');
                bodyElm.on("click", '#gotoweb', config.WEB_HOME_URL, launchInAppBrowser);
                bodyElm.on("click", '#gotobooking', config.WEB_BOOKING_URL, launchInAppBrowser);

                var interval = setInterval(function() {
                    var crHeaderBookings = $('#myBookingsMenu');
                    if (crHeaderBookings.length > 0) {
                        crHeaderBookings.on('click', null, config.WEB_BOOKING_URL, launchInAppBrowser);
                        clearInterval(interval);
                    }
                }, 2000);
            });
        },
        onDeviceOnline: function() {
            CONNECTION_STATUS = true;
            this.checkAppUpdates();
        },
        onDeviceOffline: function() {
            this.showMessage('Offline (')
        },
        showMessage: function(msg) {
            alert(msg);
        },
        checkAppUpdates: function() {
            //TODO: check app update
            console.info('Checking updates...', config.APP_VERSION);
        },
        openWebApp: function(link, execParams, target) {

            //if(!CONNECTION_STATUS) return this.onDeviceOffline();

            var target = target||'_blank';

            var webApp = cordova.InAppBrowser.open(
                link, target, 'location=no,toolbar=no'
            );

            webApp.addEventListener('loadstart', function(event) {
                console.info('WebView #2 loadstart event', event);
                exec.inlineCss(webApp, 'body {display: none;}', function() {
                    console.info('Hide body. Start loading', event);
                });
                if (event.url.match(config.CLOSE_EMB_VIEW_URL)) {
                    webApp.close();
                }
            });

            webApp.addEventListener( "loadstop", function(event) {
                console.info('WebView #2 loadstop');
                exec.inlineCss(webApp, 'body {display: initial;}', function() {
                    console.info('Show body. Stop loading', event);
                });
                exec.js(webApp, execParams.file.js);
                exec.css(webApp, execParams.file.css);
            });

            webApp.addEventListener('exit', function() {
                console.info('WebView #2 closed');
                exec.flush();
            });
        }
    }
})(CONFIG, $);

app.initialize();