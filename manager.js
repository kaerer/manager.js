/**
 * v.2.5 ~ ...
 *
 * Created by erce on 21/07/15.
 * @author erce.erozbek@gmail.com
 */

if(!$){
    var $ = require('jquery');
}

jQuery(window).load(function ($) {

});

jQuery(document).ready(function ($) {

});

var adsbygoogle;

var manager = {
    'debug': false,
    'csrf': false,
    'cache': {},
    'getCache': function (key, default_value, set_cache) {
        set_cache = set_cache ? set_cache : false;
        if (this.isset(this.cache[key])) {
            return this.cache[key];
        } else return set_cache ? this.setCache(key, default_value) : default_value;
    },
    'setCache': function (key, value) {
        value = value ? value : false;
        this.cache[key] = value;
        return value;
    },
    'getBox': function (selector, refresh) {
        var box = refresh ? false : this.getCache(selector);
        if (!box) {
            box = $(selector);
            this.setCache(selector, box);
        }
        return box;
    },
    'loading': function (open) {
        var box_loading = this.getBox('.loading');
        var key = 'body_overflow-y';
        var body = $('body');
        if (open) {
            this.setCache(key, body.css('overflow-y'));
            body.css('overflow-y', 'hidden');
            box_loading.fadeIn('slow');
        } else {
            body.css('overflow-y', this.getCache(key));
            box_loading.fadeOut('slow');
        }
    },
    'log': function (msg, name) {
        var name = name || 'Log: ';
        if (this.debug && typeof console != "undefined") {
            console.log(name, msg);
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
            if (obj.hasOwnProperty(prop))
                count = count + 1;
        }
        return count;
    },
    'mergeObjects': function (obj1, obj2) {
        var obj3 = {};
        if (obj1 && (obj1 !== null && typeof obj1 === 'object')) {
            for (var attribute1 in obj1) obj3[attribute1] = obj1[attribute1];
        }
        if (obj2 && (obj2 !== null && typeof obj2 === 'object')) {
            for (var attribute2 in obj2) obj3[attribute2] = obj2[attribute2];
        }
        return obj3;
    },
    'cloneObjects': function clone(obj) {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;

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
        if (!this.isset(jQuery) && obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
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
    'getLast': function (arr) {
        return arr[Object.keys(arr)[Object.keys(arr).length - 1]];
    },
    'getFirst': function (arr) {
        return arr[Object.keys(arr)[0]];
    },
    'isset': function (value) {
        return (typeof value != "undefined");
    },
    'google': {
        'analytics': {
            'init': function (id) {
                (function (i, s, o, g, r, a, m) {
                    i['GoogleAnalyticsObject'] = r;
                    i[r] = i[r] || function () {
                            (i[r].q = i[r].q || []).push(arguments)
                        }, i[r].l = 1 * new Date();
                    a = s.createElement(o),
                        m = s.getElementsByTagName(o)[0];
                    a.async = 1;
                    a.src = g;
                    m.parentNode.insertBefore(a, m)
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
        'adwords': {
            'init': function () {
                //manager.add.js('//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
            },
            'reload': function () {
                (adsbygoogle = window.adsbygoogle || []).push({});
            }
        }
    },
    'facebook': {
        'init': function (lang) {
            window.fbAsyncInit = function () {
                FB.init({
                    appId: manager.facebook_app_id,
                    xfbml: true,
                    version: 'v2.3'
                });
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
        }
    },
    'getLocation': function (path, get_params, add_hash) {
        var url = location.protocol + '//' + location.host + +(path ? path : location.pathname) + location.search;
        add_hash = add_hash ? true : false;
        if (get_params) {
            url += ((url.indexOf("?") == -1) ? "?" : "&");
            var c = manager.countObject(get_params);
            var i = 1;
            $.each(get_params, function (k, v) {
                url += k + '=' + v + (i++ < c ? '&' : '');
                manager.log([k, v, c, get_params, i]);
            });
        }
        if (add_hash) {
            url = url + location.hash;
        }
        return url;
    },
    'getUrl': function (type, params) {
        //var default_params = {
        //    'page_id': this.getCache('page_id'),
        //    //'category_id': this.getCache('category_id'),
        //    'access_token': this.getCache('access_token'),
        //};
        //var url;
        //params = this.mergeObjects(default_params, params);
        //switch (type) {
        //    case 'index':
        //    case 'categories':
        //        url = manager.getLocation('index', params);
        //        break;
        //    case 'records':
        //        url = manager.getLocation('records', params);
        //        break;
        //    case 'search':
        //        url = manager.getLocation('search', params);
        //        break;
        //    case 'details':
        //        url = manager.getLocation('details', params);
        //        break;
        //    case 'add':
        //        url = manager.getLocation('add', params);
        //        break;
        //    case 'signin':
        //        url = 'http://www.hotbird.com/signin';
        //        break;
        //    case 'emergency':
        //        url = manager.getLocation('emergency', params);
        //        break;
        //}
        return url;
    },
    'redirectUrl': function (url) {
        window.location.href = url;
    },
    'getRandomNumber': function (max) {
        return Math.floor(Math.random() * max);
    },
    'getCsrfCode': function () {
        if (!this.csrf) {
            this.csrf = $('meta[name=csrf-token]').prop('content');
        }

        return this.csrf;
        //return yii.getCsrfToken();
    },
    'scrollTo': function (target, offset, animation_time) {
        offset = offset || 0;
        animation_time = animation_time || 1000;
        $('html, body').animate({
            'scrollTop': (target.offset().top - offset)
        }, animation_time);
    },
    'openPopup': function (window_url, window_width, window_height, window_name) {
        var width = window_width,
            height = window_height,
            left = parseInt(($(window).width() - width) / 2),
            top = parseInt(($(window).height() - height) / 2),
            url = window_url,
            opts = "width=" + width + ", height=" + height + ", top=" + top + ", left=" + left;

        window_name = (typeof window_name != "undefined" ? window_name : "_blank");
        window.open(url, window_name, opts);
    },
    'putTemplateVariables': function (template, variable) {
        if (typeof variable !== "object" || variable.length) {
            return template;
        }
        $.each(variable, function (k, v) {
            var re = new RegExp('{{@(' + k + ')}}', 'gi');
            var match;
            while (match = template.match(re)) {
                template = template.replace(match[0], v);
            }
        });
        return template;
    },
    'loader': function (show, selector) {
        selector = selector ? selector : '.preload';
        var loader = this.getBox(selector, true);
        var body_overflow = this.getCache('body_overflow');
        if (!body_overflow) {
            body_overflow = this.getBox('body', true).css('overflow');
            this.setCache('body_overflow', body_overflow);
        }
        if (show) {
            loader.show();
            this.getBox('body', true).css('overflow', 'hidden')
        } else {
            loader.hide();
            this.getBox('body', true).css('overflow', body_overflow)
        }
    }
};

//window.onerror = manager.handleError;