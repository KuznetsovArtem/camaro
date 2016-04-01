var CONFIG = {
    WEB_HOME_URL: 'https://www2.carrentals.com',
    WEB_BOOKING_URL: 'https://book.carrentals.com/bookings',
    //TODO: fix android analytic
    //ANDROID_DEVICE_PARAM: 'TMMID=BRA%3A1326&Chnl=Brand&utm_source=Android+App&utm_medium=App&utm_content=&utm_campaign=Android+App',
    ANDROID_DEVICE_PARAM: 'androidapp',
    IOS_DEVICE_PARAM: 'TMMID=BRA%3A1325&Chnl=Brand&utm_source=iOS+App&utm_medium=App&utm_content=&utm_campaign=iOS+App',
    CLOSE_EMB_VIEW_URL: 'closewebview',
    APP_VERSION: '11'
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
        webAppInstance: {},
        getWebAppInstance: function() {
            return app.webAppInstance;
        },
        // Application Constructor
        initialize: function() {
            this.bindEvents();
        },
        bindEvents: function() {
            document.addEventListener('deviceready', this.onDeviceReady, false);
            // show offline status only on btns click;
            //document.addEventListener('offline', this.onDeviceOffline, false);
            document.addEventListener('online', this.onDeviceOnline, false);
            // document.addEventListener('load', this.onDeviceOffline, false);
            // TODO: native buttons behaviour;
        },
        bindWebAppEvents: function(webApp, execParams, showOnLoad) {
            var currentLocation = location.pathname;
            var loadFlag = false;
            var interval = setInterval(function() {
                if(currentLocation.indexOf('goto') !== -1 /*|| currentLocation === '/'*/) {
                    exec.css(webApp, execParams.file.css);
                    exec.js(webApp, execParams.file.js);
                    loadFlag = true;
                    clearInterval(interval);
                }
            }, 15);
            /* -- */
            webApp.addEventListener('loadstart', function(event) {
                console.info('WebView #2 loadstart event', event);
                if (event.url.match(config.CLOSE_EMB_VIEW_URL)) {
                    webApp.close();
                }
                exec.js(webApp, 'js/hide.js');
            });

            webApp.addEventListener("loadstop", function(e) {
                // Toggle loading;
                $('.spin-progress').not('.hide').parent().find('span').toggleClass('hide');

                console.info('WebView #2 loadstop', e);
                if (!loadFlag) {
                    exec.css(webApp, execParams.file.css);
                    exec.js(webApp, execParams.file.js);
                }
                if (loadFlag) {
                    loadFlag = false;
                }
                if(showOnLoad) {
                    webApp.show();
                }
            });

            webApp.addEventListener('exit', function() {
                console.info('WebView #2 closed');

                if(app.hardClose) {
                    console.info('hard close, no preload!!');
                    app.hardClose = false;
                    app.openReservation();
                    return false;
                }

                exec.flush();
                setTimeout(function() {
                    app.preloadHomePage();
                }, 500);
            });
        },
        openReservation: function() {
            return app.createWebAppInstance(config.WEB_BOOKING_URL, homePageInjects, true); // showOn load - true;
        },
        closeWebApp: function() {
            app.hardClose = true;
            console.info('close webapp #', app.webAppInstance);
            app.webAppInstance.close&&app.webAppInstance.close();
        },
        createWebAppInstance: function(link, injects, showOnLoad) {
            var target = target||'_blank';
            app.webAppInstance = cordova.InAppBrowser.open(
                link, target, 'location=no,toolbar=no,hidden=yes'
            );
            app.bindWebAppEvents(app.webAppInstance, injects, showOnLoad);
            return app.webAppInstance;
        },
        updateUrls: function(param) {
            // Swap URLs when www version will be set to 100%
            // this URL check should be removed after that ASAP
            $.get(config.WEB_HOME_URL + '/page/rss').always(function(xhr) {
                if(xhr.readyState === 4 && xhr.status !== 404) {
                    config.WEB_HOME_URL.replace('www2', 'www');
                    // todo: emit event and refresh all urls
                }
            });

            if (config.WEB_HOME_URL.indexOf('?') !== -1) {
                return;
            }
            config.WEB_HOME_URL = [
                config.WEB_HOME_URL,
                param
            ].join('?');
            config.WEB_BOOKING_URL = [
                config.WEB_BOOKING_URL,
                param
            ].join('?');
        },
        preloadHomePage: function() {
            // Load all web pages before open
            app.webAppInstance = {};

            // Identify device
            var devicePlatform = device.platform;
            if (devicePlatform.toLowerCase().indexOf('android') !== -1) {
                app.updateUrls(config.ANDROID_DEVICE_PARAM);
            }
            else if (devicePlatform.toLowerCase().indexOf('ios') !== -1) {
                app.updateUrls(config.IOS_DEVICE_PARAM);
            }
            else {
                app.showMessage('We are sorry but we don\'t support your device on ' + devicePlatform);
                return;
            }
            //app.createWebAppInstance(config.WEB_BOOKING_URL, homePageInjects);
            app.createWebAppInstance(config.WEB_HOME_URL, homePageInjects);
        },
        onDeviceReady: function() {
            app.preloadHomePage();

            $(function() {
                var bodyElm = $('body');
                bodyElm.on("click", '#gotoweb', [config.WEB_HOME_URL, '#gotoweb'], launchInAppBrowser);
                bodyElm.on("click", '#gotobooking, #myBookingsMenu', [config.WEB_BOOKING_URL, '#gotobooking'], launchInAppBrowser);
            });

            function launchInAppBrowser(evt) {
                var btnWrapper = evt.data[1];

                if (btnWrapper === '#gotobooking') {
                    if(evt.currentTarget.id === 'myBookingsMenu') {

                        // Wait for btn render
                        var checkBtn = setInterval(function() {
                            if($('#gotobooking').length) {
                                $(btnWrapper).find('span').toggleClass('hide');
                                clearInterval(checkBtn);
                            }
                        }, 100);
                    } else {
                        $(btnWrapper).find('span').toggleClass('hide');
                    }
                }
                var link ;
                if(btnWrapper === '#gotoweb') {
                    link = config.WEB_HOME_URL
                } else if (btnWrapper === '#gotobooking') {
                    link = config.WEB_BOOKING_URL
                } else {
                    link = evt.data[0];
                }

                // Open app;
                app.openWebApp(link, homePageInjects, '_blank');
            }
        },
        onDeviceOnline: function() {
            CONNECTION_STATUS = true;
            console.log('Device online!!!');
            //app.preloadHomePage();
            //app.checkAppUpdates();
        },
        onDeviceOffline: function() {
            app.showMessage("Cannot connect to the internet.\nCheck your settings and try again.");
            console.log('Device offline!!!');
        },
        showMessage: function(msg) {
            navigator.notification.alert(msg, null, 'CarRentals.com');
        },
        checkAppUpdates: function() {
            //TODO: check app update
            navigator.notification.confirm(
                'There is a newer version of app \n available. Update now?',
                'Update Available',
                ['Not Now', 'Not Now']);
            console.info('Checking updates...', config.APP_VERSION);
        },
        openWebApp: function(link) {
            if(!CONNECTION_STATUS) return app.onDeviceOffline();

            if(link === config.WEB_BOOKING_URL) {
                console.info('user select reservations page...');
                app.closeWebApp();
                return true;
            }

            var webApp = app.getWebAppInstance(link);
            console.log('Web app', webApp);
            webApp.show();
        }
    }
})(CONFIG, $);

app.initialize();