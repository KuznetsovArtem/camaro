var CONFIG = {
    WEB_HOME_URL: 'https://www2.carrentals.com',
    WEB_BOOKING_URL: 'https://book.carrentals.com/bookings',
    ANDROID_DEVICE_PARAM: 'androidapp',
    IOS_DEVICE_PARAM: 'iosapp',
    CLOSE_EMB_VIEW_URL: 'closewebview',
    APP_VERSION: '0.0.7'
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
            // show offline status only on btns click;
            //document.addEventListener('offline', this.onDeviceOffline, false);
            document.addEventListener('online', this.onDeviceOnline, false);
            // document.addEventListener('load', this.onDeviceOffline, false);
            // TODO: native buttons behaviour;
        },
        bindWebAppEvents: function(webApp, execParams, showOnLoad) {
            /* TODO: trying to apply smooth page switching */
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
                    return false;
                }
                exec.flush();
                setTimeout(function() {
                    app.preloadHomePage();
                }, 500);
            });
        },
        closeWebAppInstances: function() {
            app.hardClose = true;
            for(var key in app.webAppInstances) {
                console.info('close webapp #', app.webAppInstances[key]);
                app.webAppInstances[key].close&&app.webAppInstances[key].close();
            }
        },
        createWebAppInstance: function(link, injects, showOnLoad) {
            var target = target||'_blank';
            app.webAppInstances[link] = cordova.InAppBrowser.open(
                link, target, 'location=no,toolbar=no,hidden=yes'
            );
            app.bindWebAppEvents(app.webAppInstances[link], injects, showOnLoad);
            return app.webAppInstances[link];
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
            app.webAppInstances = {};

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
                function launchInAppBrowser(evt) {
                    var btnWrapper = evt.data[1];
                    if (btnWrapper !== null) {
                        $(btnWrapper).find('span').each(function() {
                            $(this).toggleClass('hide');
                        });
                    }
                    var link ;
                    if(btnWrapper === '#gotoweb') {
                        link = config.WEB_HOME_URL
                    } else if (btnWrapper === '#gotobooking') {
                        link = config.WEB_BOOKING_URL
                    } else {
                        link = evt.data[0];
                    }
                    $('body').fadeOut('fast', function() {
                        app.openWebApp(link, homePageInjects, '_blank');
                        $('body').show();
                        if (btnWrapper !== null) {
                            var interval = setInterval(function() {
                                $(btnWrapper).find('span').each(function() {
                                    $(this).toggleClass('hide');
                                });
                                clearInterval(interval);
                            }, 200);
                        }
                    })
                }
                var bodyElm = $('body');
                bodyElm.on("click", '#gotoweb', [config.WEB_HOME_URL, '#gotoweb'], launchInAppBrowser);
                bodyElm.on("click", '#gotobooking', [config.WEB_BOOKING_URL, '#gotobooking'], launchInAppBrowser);

                var interval = setInterval(function() {
                    var crHeaderBookings = $('#myBookingsMenu');
                    if (crHeaderBookings.length > 0) {
                        crHeaderBookings.on('click', null, [config.WEB_BOOKING_URL, null], launchInAppBrowser);
                        clearInterval(interval);
                    }
                }, 200);
            });
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

            console.info('Debug: link', link)
            if(!CONNECTION_STATUS) return app.onDeviceOffline();
            console.log('Open webApp', link, 'from', app.webAppInstances);

            if(link === config.WEB_BOOKING_URL) {
                console.info('user select reservations page...');
                app.closeWebAppInstances();
                // TODO: loading layer/button;
                var webApp = app.createWebAppInstance(config.WEB_BOOKING_URL, homePageInjects, true); // showOn load - true;
                console.log('Web app', webApp);
                return true;
            }

            var webApp = app.getWebAppInstance(link);
            console.log('Web app', webApp);
            webApp.show();
        }
    }
})(CONFIG, $);

app.initialize();