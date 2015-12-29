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
                //return console.warn(jsFileName, 'already loaded');
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
        webAppInstances : {},
        getWebAppInstance: function(link) {
            return app.webAppInstances[link];
        },
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
        bindWebAppEvents: function(webApp, execParams) {
            webApp.addEventListener('loadstart', function(event) {
                console.info('WebView #2 loadstart event', event);
                if (event.url.match(config.CLOSE_EMB_VIEW_URL)) {
                    webApp.close();
                }
            });

            webApp.addEventListener("loadstop", function(e) {
                console.info('WebView #2 loadstop', e);
                exec.css(webApp, execParams.file.css);
                exec.js(webApp, execParams.file.js);
            });

            webApp.addEventListener('exit', function() {
                console.info('WebView #2 closed');
                exec.flush();
                //TODO: create new instance;
                setTimeout(function() {
                    app.preload();
                }, 500);

            });
        },
        createWebAppInstance: function(link, injects) {
            // TODO: fix booking page;
            var target = target||'_blank';

            app.webAppInstances[link] = cordova.InAppBrowser.open(
                link, target, 'location=no,toolbar=no,hidden=yes'
            );
            app.bindWebAppEvents(app.webAppInstances[link], injects);
        },
        preload: function() {
            // Load all web pages before open
            app.webAppInstances = {};
            //app.createWebAppInstance(config.WEB_BOOKING_URL, homePageInjects);
            app.createWebAppInstance(config.WEB_HOME_URL, homePageInjects);
        },
        onDeviceReady: function() {
            //TODO: move to isOnline
            app.preload();

            $(function() {
                function launchInAppBrowser(evt) {
                    app.openWebApp(evt.data, homePageInjects, '_blank');
                }
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
            console.log('Device online!!!');
            app.checkAppUpdates();
        },
        onDeviceOffline: function() {
            app.showMessage('Your device is offline :(');
            console.log('Device offline!!!');
        },
        showMessage: function(msg) {
            // TODO: nice UI;
            alert(msg);
        },
        checkAppUpdates: function() {
            //TODO: check app update
            console.info('Checking updates...', config.APP_VERSION);
        },
        openWebApp: function(link) {
            if(!CONNECTION_STATUS) return app.onDeviceOffline();
            console.log('Open webApp', link, 'from', app.webAppInstances);
            var webApp = app.getWebAppInstance(link);
            console.log('Web app', webApp);
            webApp.show();
        }
    }
})(CONFIG, $);

app.initialize();