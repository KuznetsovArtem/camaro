var CONFIG = {
    WEB_HOME_URL: 'https://dev.carrentals.com',
    WEB_BOOKING_URL: 'https://book.carrentals.com/bookings',
    APP_VERSION: '0.0.3'
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
            this.domReadyTests();
        },
        domReadyTests: function() {
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
        bindEvents: function() {
            document.addEventListener('deviceready', this.onDeviceReady, false);
            document.addEventListener('offline', this.onDeviceOffline, false);
            document.addEventListener('online', this.onDeviceOnline, false);
            //document.addEventListener('load', this.onDeviceOffline, false);
            // TODO: native buttons behaviour;
        },
        onDeviceReady: function() {
            //document.getElementById('gotoweb').onclick = function() {
            //    app.openWebApp(config.WEB_HOME_URL, homePageInjects, '_blank');
            //};
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

            webApp.addEventListener('loadstart', function(data) {
                console.info('WebView #2 loadstart event', data);
            });

            webApp.addEventListener( "loadstop", function() {
                console.info('WebView #2 loadstop');
                exec.js(webApp, execParams.file.js);
                exec.css(webApp, execParams.file.css);
            });

            webApp.addEventListener('exit', function() {
                console.info('WebView #2 closed');
                exec.flush();
            });
            // TODO: back to cordova APP;
        }
    }
})(CONFIG, $);

app.initialize();