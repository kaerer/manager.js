/**
 * v.2.9.1
 *
 * Requirements jQuery, Yii2 js lib
 * Created by erce on 21/07/15.
 *
 * @author erce.erozbek@gmail.com
 *
 * https://github.com/kaerer/manager.js
 */


var adsbygoogle;
if (!window.console) {
    window.console = {
        log: function () {
        },
        warn: function () {
        },
        error: function () {
        },
        debug: function () {
        },
        info: function () {
        }
    };
}

var $ = $ || {},
    jQuery = jQuery || {};

var manager = (function (window, document, jQuery) {
    "use strict";

    return {
        'debug': true,
        'cache': {},
        'config': {},
        'facebook_app_id': '',
        'getCache': function (key, default_value, set_cache) {
            if (manager.isset(manager.cache[key])) {
                return manager.cache[key];
            } else {
                return !!set_cache ? manager.setCache(key, default_value) : default_value;
            }
        },
        'setCache': function (key, value) {
            value = value ? value : false;
            manager.cache[key] = value;
            return value;
        },
        'getBox': function (selector, refresh) {
            var box = refresh ? false : manager.getCache(selector);
            if (!box) {
                box = jQuery(selector);
                manager.setCache(selector, box);
            }
            return box;
        },
        'loading': function (open) {
            var box_loading = manager.getBox('.loading');
            var key = 'body_overflow-y';
            var body = jQuery('body');
            if (open) {
                manager.setCache(key, body.css('overflow-y'));
                body.css('overflow-y', 'hidden');
                box_loading.fadeIn('slow');
            } else {
                body.css('overflow-y', manager.getCache(key));
                box_loading.fadeOut('slow');
            }
        },
        'log': function (msg, name, type) {
            if (!manager.isset(name)) {
                name = 'Log: ';
            }
            if (!manager.isset(type)) {
                type = 'log';
            }
            if (manager.debug && manager.isset(window.console)) {
                window.console[type](name, msg);
            }
        },
        'handleError': function (errorMsg, url, lineNumber, column, errorObj) {
            manager.log(errorMsg + '\n' + url + ':' + lineNumber + '-' + column, 'Error');
            //manager.log(errorObj);
            return true;
        },
        'countObject': function (obj) {
            var count = 0;
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    count = count + 1;
                }
            }
            return count;

            //return Object.keys(obj).length;
        },
        'mergeObjects': function (obj1, obj2) {
            var obj3 = {};
            if (obj1 && (obj1 !== null && typeof obj1 === 'object')) {
                for (var attribute1 in obj1) {
                    obj3[attribute1] = obj1[attribute1];
                }
            }
            if (obj2 && (obj2 !== null && typeof obj2 === 'object')) {
                for (var attribute2 in obj2) {
                    obj3[attribute2] = obj2[attribute2];
                }
            }
            return obj3;
        },
        'cloneObjects': function clone(obj) {
            var copy;

            // Handle the 3 simple types, and null or undefined
            if (null === obj || "object" !== typeof obj) {
                return obj;
            }

            // Handle Date
            if (obj instanceof Date) {
                copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }

            // Handle Array
            if (obj instanceof Array) {
                copy = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    copy[i] = clone(obj[i]);
                }
                return copy;
            }

            // Handle Object
            if (!manager.isset(jQuery) && obj instanceof Object) {
                copy = {};
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) {
                        copy[attr] = clone(obj[attr]);
                    }
                }
                return copy;
            } else {
                // Shallow copy
                copy = jQuery.extend({}, obj);
                // Deep copy
                //copy = jQuery.extend(true, {}, obj);
                return copy;
            }

            throw new Error("Unable to copy obj! Its type isn't supported.");
        },
        'getAllConfig': function () {
            return manager.config;
        },
        'setAllConfig': function (config) {
            manager.config = config;
        },
        'getConfig': function (key) {
            if (manager.isset(manager.config[key])) {
                return manager.config[key];
            } else {
                manager.log('config key not found(' + key + ')', 'Error');
                return false;
            }
        },
        'setConfig': function (key, value) {
            manager.config[key] = value;
        },
        'mergeConfig': function (config) {
            if (typeof config === "object") {
                manager.setAllConfig(manager.mergeObjects(manager.config, config));
            }
        },
        'getLast': function (arr) {
            return arr[Object.keys(arr)[Object.keys(arr).length - 1]];
        },
        'getFirst': function (arr) {
            return arr[Object.keys(arr)[0]];
        },
        'isset': function (value) {
            return (typeof value !== "undefined");
        },
        'isFunction': function (obj) {
            return !!(obj && obj.constructor && obj.call && obj.apply);
        },
        'google': {
            'analytics': {
                'init': function (id) {
                    (function (i, s, o, g, r, a, m) {
                        i['GoogleAnalyticsObject'] = r;
                        i[r] = i[r] || function () {
                                (i[r].q = i[r].q || []).push(arguments);
                            }, i[r].l = 1 * new Date(),
                            a = s.createElement(o),
                            m = s.getElementsByTagName(o)[0];
                        a.async = 1;
                        a.src = g;
                        m.parentNode.insertBefore(a, m);
                    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
                    if (id) {
                        manager.google.analytics.use('create', id, 'auto');
                        manager.google.analytics.use('send', 'pageview');
                    }
                },
                'use': function () {
                    window['ga'].apply(null, arguments);
                }
            },
            'adsense': {
                'init': function () {
                    manager.add.js('//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
                },
                'reload': function () {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                }
            }//,
            //'adwords': manager.google.adsense

        },
        'twitter': {
            'init': function () {
                var obj = !(function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
                    if (!d.getElementById(id)) {
                        js = d.createElement(s);
                        js.id = id;
                        js.src = p + "://platform.twitter.com/widgets.js";
                        fjs.parentNode.insertBefore(js, fjs);
                    }
                })(document, "script", "twitter-wjs");
                manager.setCache('twitter_init', obj);
            },
            'share': function (url, text, hashtags) {
                if (typeof url === "undefined") {
                    return;
                }
                if (url.search('http') === -1) {
                    url = 'http:' + url;
                }
                //"https://twitter.com/intent/tweet?text=asdf&via=Hotbird&hashtags=hashtag1,hashtag2,hashtag3"
                //https://dev.twitter.com/web/tweet-button

                if (text) {
                    text = (text.length + url.length > 140 - 4) ? (text.substr(0, (140 - url.length - 4)) + '...') : text;
                }

                url = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + (manager.isset(text) ? ('&text=' + encodeURIComponent(text)) : '');
                manager.openPopup(url, 500, 300);
            }
        },
        'facebook': {
            'init': function (lang, app_id) {
                window.fbAsyncInit = function () {
                    var init_obj = {
                        xfbml: false,
                        version: 'v2.4', status: true, cookie: true
                    };
                    app_id = app_id ? app_id : manager.facebook_app_id;
                    if (app_id) {
                        init_obj.appId = app_id;
                    }
                    window.FB.init(init_obj);
                };
                lang = lang ? lang : 'en_US';
                (function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) {
                        return;
                    }
                    js = d.createElement(s);
                    js.id = id;
                    js.src = "//connect.facebook.net/" + lang + "/sdk.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));
            },
            'run_fbml': function (element) {
                window.FB.XFBML.parse(element);
            },
            'sizeChangeCallback': function () {
                window.FB.Canvas.setSize();
            },
            'share': function (url) {
                if (typeof url === "undefined") {
                    return;
                }
                if (url.search('http') === -1) {
                    url = 'http:' + url;
                }
                window.FB.ui(
                    {
                        method: 'share',
                        href: url
                    }, function (response) {
                    });
            }
        },
        'getLocation': function (path, get_params, only_path, other_url) {
            var url = (other_url ? other_url : (location.protocol + '//' + location.host).replace(/[\/]+$/, '')) + '/' + (path ? path : location.pathname).replace(/^[\/]+/, '');
            var c = 0;
            get_params = manager.mergeObjects(manager.getLocationParams(), get_params);
            if (!(!!only_path) && get_params && (c = Object.keys(get_params).length)) {
                url += ((url.indexOf("?") === -1) ? "?" : "&");
                var i = 1;
                $.each(get_params, function (k, v) {
                    if (!!v) {
                        url += k + '=' + v + ((i++) < c ? '&' : '');
                    }
                    //manager.log([k, v, c, get_params, i]);
                });
                //url = url.substring(0, url.length - 1);
                url = url + location.hash;
            }
            return url;
        },
        'getLocationParams': function () {
            var a = window.location.search.substr(1).split('&');
            if (a === "") {
                return {};
            }
            var b = {};
            for (var i = 0; i < a.length; ++i) {
                var p = a[i].split('=');
                if (p.length !== 2) {
                    continue;
                }
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
            }
            return b;
        },
        'getUrl': function (path, url) {
            return manager.getLocation(path, false, true, url);
        },
        'getUrlDetails': function (href) {
            var parser = document.createElement("a");
            parser.href = href;
            var params = {};
            if (parser.search) {
                params = (function (a) {
                    var b = {};
                    for (var i = 0; i < a.length; ++i) {
                        var p = a[i].split('=', 2);
                        if (p.length === 1) {
                            b[p[0]] = "";
                        }
                        else {
                            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
                        }
                    }
                    return b;
                })(parser.search.substr(1).split('&'));
            }

            return {
                'protocol': parser.protocol, // => "http:"
                'host': parser.host,     // => "example.com:3000"
                'hostname': parser.hostname, // => "example.com"
                'port': parser.port,     // => "3000"
                'pathname': parser.pathname, // => "/pathname/"
                'hash': parser.hash,     // => "#hash"
                'search': parser.search,   // => "?search=test"
                'params': params   // => "{search=test}"
            };
        },
        'redirectUrl': function (url) {
            window.location.href = url;
        },
        'getRandomNumber': function (max) {
            return Math.floor(Math.random() * max);
        },
        'getCsrfCode': function () {
            if (!manager.csrf) {
                manager.csrf = jQuery('meta[name=csrf-token]').prop('content');
            }

            return manager.csrf;
            //return yii.getCsrfToken();
        },
        'scrollTo': function (target, offset, animation_time) {
            offset = offset || 0;
            animation_time = animation_time || 1000;
            jQuery('html, body').animate({
                'scrollTop': (target.offset().top - offset)
            }, animation_time);
        },
        'openPopup': function (window_url, window_width, window_height, window_name) {
            var width = window_width,
                height = window_height,
                left = parseInt((jQuery(window).width() - width) / 2, 10),
                top = parseInt((jQuery(window).height() - height) / 2, 10),
                url = window_url,
                opts = "width=" + width + ", height=" + height + ", top=" + top + ", left=" + left;

            window_name = (typeof window_name !== "undefined" ? window_name : "_blank");
            window.open(url, window_name, opts);
        },
        'putTemplateVariables': function (template, variable) {
            if (typeof variable !== "object" || variable.length) {
                return template;
            }
            $.each(variable, function (k, v) {
                var re = new RegExp('{{@(' + k + ')}}', 'gi');
                var match;
                while ((match = template.match(re))) {
                    template = template.replace(match[0], v);
                }
            });
            return template;
        },
        'loader': function (show, selector) {
            selector = selector ? selector : '.preload';
            var loader = manager.getBox(selector, true);
            var body_overflow = manager.getCache('body_overflow');
            if (!body_overflow) {
                body_overflow = manager.getBox('body', true).css('overflow');
                manager.setCache('body_overflow', body_overflow);
            }
            if (show) {
                loader.show();
                manager.getBox('body', true).css('overflow', 'hidden');
            } else {
                loader.hide();
                manager.getBox('body', true).css('overflow', body_overflow);
            }
        },
        'add': {
            'js': function (js_file) {
                var scr = document.createElement("script");
                scr.type = "text/javascript";
                scr.async = true;
                scr.src = js_file;
                var s = document.getElementsByTagName("head")[0];
                s.parentNode.appendChild(scr);
            }
        }
    };

})(window, document, jQuery);
