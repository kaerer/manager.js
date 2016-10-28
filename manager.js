/**
 * v.2.9.2
 *
 * Requirements jQuery, Yii2 js lib
 * Created by erce on 21/07/15.
 *
 * @author erce.erozbek@gmail.com
 *
 * https://github.com/kaerer/manager.js
 */


self.console = self.console || {
        info: function () {
        }, log: function () {
        }, debug: function () {
        }, warn: function () {
        }, error: function () {
        }
    };

var cssSelector = jQuery;

if (typeof cssSelector === 'undefined') {
    console.log('jQuery not found!');
}

var manager = (function (window, document, jQuery) {
    "use strict";

    return {
        'debug': true,
        'cache': {},
        'config': {},
        'facebook_app_id': '',
        'getCache': function (key, default_value, set_cache) {
            if (manager.isSet(manager.cache[key])) {
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
        'log': function (msg, name, type) {
            if (!manager.isSet(name)) {
                name = 'Log: ';
            }
            if (!manager.isSet(type)) {
                type = 'log';
            }
            if (manager.debug && manager.isSet(window.console)) {
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
            if (manager.isSet(obj1) && manager.isObject(obj1)) {
                for (var attribute1 in obj1) {
                    obj3[attribute1] = obj1[attribute1];
                }
            }
            if (manager.isSet(obj2) && manager.isObject(obj2)) {
                for (var attribute2 in obj2) {
                    obj3[attribute2] = obj2[attribute2];
                }
            }
            return obj3;
        },
        'cloneObjects': function clone(obj) {
            var copy;

            // Handle the 3 simple types, and null or undefined
            if (null === obj || !manager.isObject(obj)) {
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
            if (!manager.isSet(jQuery) && obj instanceof Object) {
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
        'sortObject': function sortProperties(obj, isNumericSort) {
            isNumericSort = isNumericSort || false; // by default text sort
            var sortable = [];
            for (var key in obj)
                if (obj.hasOwnProperty(key))
                    sortable.push([key, obj[key]]);
            if (isNumericSort)
                sortable.sort(function (a, b) {
                    return a[1] - b[1];
                });
            else
                sortable.sort(function (a, b) {
                    var x = a[1].toLowerCase(),
                        y = b[1].toLowerCase();
                    return x < y ? -1 : x > y ? 1 : 0;
                });
            return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
        },
        'getAllConfig': function () {
            return manager.config;
        },
        'setAllConfig': function (config) {
            manager.config = config;
        },
        'getConfig': function (key) {
            if (manager.isSet(manager.config[key])) {
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
            if (manager.isObject(config)) {
                manager.setAllConfig(manager.mergeObjects(manager.config, config));
            }
        },
        'getLast': function (arr) {
            return arr[Object.keys(arr)[Object.keys(arr).length - 1]];
        },
        'getFirst': function (arr) {
            return arr[Object.keys(arr)[0]];
        },
        'isSet': function (value) {
            return (typeof value !== "undefined");
        },
        'isArray': function (value) {
            return "[object Array]" === Object.prototype.toString.call(value)
        },
        'isObject': function (value) {
            return (typeof value === "object");
        },
        'isFunction': function (obj) {
            return !!(obj && obj.constructor && obj.call && obj.apply);
        },
        'getRandomNumber': function (max, min, returnInt) {
            if (!manager.isSet(returnInt)) {
                returnInt = true;
            }
            if (!manager.isSet(max)) {
                max = 1;
            }
            if (!manager.isSet(min)) {
                if (max === 1) {
                    min = 0;
                } else {
                    min = 1;
                }
            }

            var result = min + Math.random() * (max - min);
            return returnInt ? parseInt(result, 10) : result;
        },
        'getLocation': function (path, get_params, only_path, other_url) {
            var url = (other_url ? other_url : (window.location.protocol + '//' + window.location.host).replace(/[\/]+$/, '')) + '/' + (path ? path : window.location.pathname).replace(/^[\/]+/, '');
            var c = 0;
            get_params = manager.mergeObjects(manager.getLocationParams(), get_params);
            if (!(!!only_path) && get_params && (c = Object.keys(get_params).length)) {
                url += ((url.indexOf("?") === -1) ? "?" : "&");
                var i = 1;
                jQuery.each(get_params, function (k, v) {
                    if (!!v) {
                        url += k + '=' + v + ((i++) < c ? '&' : '');
                    }
                    //manager.log([k, v, c, get_params, i]);
                });
                //url = url.substring(0, url.length - 1);
                url = url + window.location.hash;
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
            //TODO: hash ve params boş iken hata var gibi kontrol edilmeli
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
                        } else {
                            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
                        }
                    }
                    return b;
                })(parser.search.substr(1).split('&'));
            }

            return {
                'protocol': parser.protocol, // => "http:"
                'host': parser.host, // => "example.com:3000"
                'hostname': parser.hostname, // => "example.com"
                'port': parser.port, // => "3000"
                'pathname': parser.pathname, // => "/pathname/"
                'hash': parser.hash, // => "#hash"
                'search': parser.search, // => "?search=test"
                'params': params // => "{search=test}"
            };
        },
        'getTimezone': function () {
            /**
             * http://www.onlineaspect.com/2007/06/08/auto-detect-a-time-zone-with-javascript/
             * more accurate https://bitbucket.org/pellepim/jstimezonedetect ?
             */
            /*
             var rightNow = new Date();
             var jan1 = new Date(rightNow.getFullYear(), 0, 1, 0, 0, 0, 0);
             var temp = jan1.toGMTString();
             var jan2 = new Date(temp.substring(0, temp.lastIndexOf(" ") - 1));
             var std_time_offset = (jan1 - jan2) / (1000 * 60 * 60);

             var june1 = new Date(rightNow.getFullYear(), 6, 1, 0, 0, 0, 0);
             temp = june1.toGMTString();
             var june2 = new Date(temp.substring(0, temp.lastIndexOf(" ") - 1));
             var daylight_time_offset = (june1 - june2) / (1000 * 60 * 60);
             var dst;
             if (std_time_offset == daylight_time_offset) {
             dst = "0"; // daylight savings time is NOT observed
             } else {
             dst = "1"; // daylight savings time is observed
             }

             return {
             'time_offset': std_time_offset,
             'dst': dst
             }
             */

            var now = new Date();
            return {
                'hour': now.getTimezoneOffset(),
                'seconds': now.getTimezoneOffset() * 60
            };
        },
        'createDateAsUTC': function (date) {
            return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
        },
        'convertDateToUTC': function (date) {
            return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        },
        'cookie': {
            'set': function (cname, cvalue, days) {
                var d = new Date();
                d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
                var expires = "expires=" + d.toUTCString();
                document.cookie = cname + "=" + cvalue + "; " + expires;
            },
            'get': function (cname, cvalue_default) {
                var name = cname + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) === ' ') c = c.substring(1);
                    if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
                }
                return cvalue_default ? cvalue_default : "";
            },
            'delete': function (cname) {
                manager.cookie.set(cname, null, 0);
            }
        },
        'redirectUrl': function (url) {
            window.location.href = url;
        },
        'reload': function () {
            manager.redirectUrl(window.location.href);
        },
        'openPopup': function (window_url, window_width, window_height, window_name) {
            var width = window_width,
                height = window_height,
                left = parseInt((jQuery(window).width() - width) / 2, 10),
                top = parseInt((jQuery(window).height() - height) / 2, 10),
                url = window_url,
                opts = "width=" + width + ", height=" + height + ", top=" + top + ", left=" + left;

            window_name = (manager.isSet(window_name) ? window_name : "_blank");
            window.open(url, window_name, opts);
        },
        'openPage': function (window_url, window_name) {
            if (!window_name) {
                window_name = '_blank';
            }
            window.open(window_url, window_name);
        },
        'scrollTo': function (target, offset, animation_time) {
            offset = offset || 0;
            animation_time = animation_time || 1000;
            jQuery('html, body').animate({
                'scrollTop': (target.offset().top - offset)
            }, animation_time);
        },
        'getCsrfCode': function () {
            return jQuery('meta[name=csrf-token]').prop('content');
            //return yii.getCsrfToken();
        },
        'putTemplateVariables': function (template, variable) {
            if (!manager.isObject(variable) || variable.length) {
                return template;
            }
            jQuery.each(variable, function (k, v) {
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
        'loading': function (open, selector) {
            selector = selector ? selector : 'loading';
            var body = jQuery('body');
            var box_loading = manager.getBox('.' + selector, true);
            if (box_loading.length === 0) {
                box_loading = jQuery('<div>').addClass(selector);
                body.append(box_loading);
            }
            var key = 'body_overflow-y';
            if (open) {
                manager.setCache(key, body.css('overflow-y'));
                body.css('overflow-y', 'hidden');
                box_loading.fadeIn('slow');
            } else {
                body.css('overflow-y', manager.getCache(key));
                box_loading.fadeOut('slow');
            }
        },
        'google': {
            'plus': {
                'init': function () {
                    manager.add.js('//apis.google.com/js/platform.js');
                },
                'render': function (type, box_id) {
                    //switch (type){
                    //case 'follow':
                    //    gapi.follow.render(box_id);
                    //    gapi.follow.go(box_id);
                    //    break;
                    //case 'badge_person':
                    //    gapi.person.render(box_id);
                    //    gapi.person.go(box_id);
                    //    break;
                    //case 'badge_page':
                    //    gapi.page.render(box_id);
                    //    gapi.page.go(box_id);
                    //    break;
                    //default:
                    window.gapi.plusone.render(box_id);
                    window.gapi.plusone.go(box_id);
                    //        break;
                    //}
                },
                'addButton': {
                    "button_generator": function (type, selector, page_id, params, render) {
                        render = manager.isSet(render) ? render : true;

                        var btn_class;
                        switch (type) {
                            case 'follow':
                                btn_class = 'g-follow';
                                break;
                            case 'badge_person':
                                btn_class = 'g-person';
                                break;
                            default:
                            case 'badge_page':
                                btn_class = 'g-page';
                                break;
                        }

                        if (page_id.indexOf('http') === -1) {
                            page_id = 'https://plus.google.com/' + page_id;
                        }
                        var default_params = {
                            'href': page_id
                        };

                        params = manager.mergeObjects(default_params, (params ? params : []));
                        var btn = jQuery('<div>').addClass(btn_class);

                        jQuery.each(params, function (k, v) {
                            btn.attr('data-' + k, v);
                        });

                        if (selector) {
                            var a = manager.getBox(selector).html(btn);

                            if (render) {
                                var box_id = selector.attr('id');
                                if (!box_id) {
                                    box_id = 'btn_google_r' + manager.getRandomNumber(100, 999);
                                    selector.attr('id', box_id);
                                }

                                manager.google.plus.render(type, box_id);
                            }
                        } else {
                            return btn;
                        }
                    },
                    'follow': function (selector, page_id, params, render) {
                        /*
                         <div class="g-follow" data-annotation="bubble" data-height="24" data-href="//plus.google.com/u/0/108093612240772468124" data-rel="author"></div>
                         https://developers.google.com/+/web/follow/
                         */
                        var default_params = {
                            'rel': 'publisher',
                            'height': '24',
                            'annotation': 'bubble'
                        };

                        params = manager.mergeObjects(default_params, (params ? params : []));
                        return manager.google.plus.addButton.button_generator('follow', selector, page_id, params, render);
                    },
                    'badge_person': function (selector, page_id, params, render) {
                        /*
                         <div class="g-person" data-href="https://plus.google.com/{profileId}"></div>
                         https://developers.google.com/+/web/badge/
                         */
                        var default_params = {
                            'theme': 'dark',
                            'width': '240',
                            'showcoverphoto': 'true',
                            'showtagline': 'true',
                            'layout': 'landscape'
                        };

                        params = manager.mergeObjects(default_params, (params ? params : []));
                        return manager.google.plus.addButton.button_generator('badge_person', selector, page_id, params, render);
                    },
                    'badge_page': function (selector, page_id, params, render) {
                        /*
                         <div class="g-person" data-href="https://plus.google.com/{profileId}"></div>
                         https://developers.google.com/+/web/badge/
                         */
                        var default_params = {
                            'theme': 'light',
                            'width': '240',
                            'showcoverphoto': 'true',
                            'showtagline': 'true',
                            'layout': 'landscape'
                        };

                        params = manager.mergeObjects(default_params, (params ? params : []));
                        return manager.google.plus.addButton.button_generator('badge_page', selector, page_id, params, render);
                    }
                }

            },
            'analytics': {
                'init': function (id) {
                    (function (i, s, o, g, r, a, m) {
                        i.GoogleAnalyticsObject = r;
                        i[r] = i[r] || function () {
                                (i[r].q = i[r].q || []).push(arguments);
                            };
                        i[r].l = 1 * new Date();
                        a = s.createElement(o);
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
                    //TODO
                    window.ga.apply(null, arguments);
                }
            },
            'adsense': {
                'init': function () {
                    manager.add.js('//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
                },
                'reload': function () {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                }
            }
            //'adwords': manager.google.adsense
        },
        'twitter': {
            'init': function () {
                /*var obj = */
                !(function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0],
                        p = /^http:/.test(d.location) ? 'http' : 'https';
                    if (!d.getElementById(id)) {
                        js = d.createElement(s);
                        js.id = id;
                        js.src = p + "://platform.twitter.com/widgets.js";
                        fjs.parentNode.insertBefore(js, fjs);
                    }
                })(document, "script", "twitter-wjs");
                //manager.setCache('twitter_init', obj);
            },
            'share': function (url, text, hashtags) {
                if (!manager.isSet(url)) {
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

                if (manager.isSet(hashtags) && manager.isArray(hashtags)) {
                    hashtags = hashtags.join(',');
                }

                url = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) +
                    (manager.isSet(text) ? ('&text=' + encodeURIComponent(text)) : '') +
                    (manager.isSet(hashtags) ? ('&hashtags=' + encodeURIComponent(hashtags)) : '')
                ;
                manager.openPopup(url, 500, 300);
            }
        },
        'facebook': {
            'init': function (lang, app_id) {
                window.fbAsyncInit = function () {
                    var init_obj = {
                        xfbml: false,
                        version: 'v2.4',
                        status: true,
                        cookie: true
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
                if (!manager.isSet(url)) {
                    return;
                }
                if (url.search('http') === -1) {
                    url = 'http:' + url;
                }
                window.FB.ui({
                    method: 'share',
                    href: url
                }, function (response) {
                });
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

})(window, document, cssSelector);