(function () {
    'use strict';

    var _stores = {};
    var _storesData = {};
    var prefix = '_MC_';

    var quit = function (e) {
        localStorage.setItem(prefix + this.__name__, JSON.stringify(this));
    };

    var saveNow = function (obj, name, cb) {
        var data;
        try {
            data = JSON.stringify(obj);
        } catch(e) {
            console.warn('Error mirroring object ' + name, e);
            return
        }

        localStorage.setItem(prefix + name, data);
        cb && cb();
    };

    var addProp = function (store, key, initialValue) {
        Object.defineProperty(store, key, {
            enumerable: true,
            configurable: true,
            get: function() {
                return initialValue;
            },
            set: function(value) {
                initialValue = value;
                this.save();
            }
        });
    };

    var addMethod = function (obj, key, value) {
        Object.defineProperty(obj.prototype, key, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: value
        });
    };

    /**
     *
     * @param {string} name store name to be the key in localStorage
     * @constructor
     */
    var MirrorStore = function (name) {
        Object.defineProperty(this, '__name__',
            {
                value: name,
                writable: false,
                configurable: false,
                enumerable: false
            });
    };

    /**
     * set item value
     *
     * @param {string} key
     * @param {*} value
     * @param {function} [cb] callback to invoke when the item was actually saved
     */
    addMethod(MirrorStore, 'setItem', function (key, value, cb) {
        if (!this[key]) {
            addProp(this, key, value);
        }
        this[key] = value;
    });
    addMethod(MirrorStore, 'getItem', function (key) {
        if (!this[key]) {
            addProp(this, key);
        }
        return this[key];
    });
    addMethod(MirrorStore, 'removeItem', function (key) {
        delete this[key];
        this.save()
    });
    addMethod(MirrorStore, 'destroy', function () {
        for (var p in this) {
            if (!this.hasOwnProperty(p)) continue;
            delete this[p];
        }
        window.removeEventListener('onbeforeunload', quit);
        delete _stores[this.__name__];
        localStorage.removeItem(this.__name__);
    });
    addMethod(MirrorStore, 'clear', function () {
        for (var p in this) {
            if (!this.hasOwnProperty(p)) continue;
            delete this[p];
        }
        localStorage.removeItem(this.__name__);
    });
    addMethod(MirrorStore, 'save', function (cb) {
        var _this = this;
        clearTimeout(_storesData[this.__name__]);

        // debounce update to avoid performance hit on multiple updates
        _storesData[this.__name__] = setTimeout(function () {saveNow(_this, _this.__name__, cb);}, 50)
    });


    /**
     * Create new MirrorStore instance or return existing one
     *
     * @param {string} [name] Store lifecycle unique name (default: 'Default')
     * @param {object} [opt] Optional options object
     * @param {boolean} [opt.freshStart] Don't load  saved data from storage (effective only if store is yet to be created)
     * @returns {Object} MirrorStore instance
     */
    window.getMirror = function (name, opt) {
        name = name || 'Default';
        opt = opt || {};

        if (_stores[name]) {
            return _stores[name]
        }

        _stores[name] = new MirrorStore(name);

        window.addEventListener('onbeforeunload', quit.bind(_stores[name]));

        if (opt.freshStart) {
            localStorage.removeItem(prefix + name);
        }
        else {
            var data = JSON.parse(localStorage.getItem(prefix + name));
            if (data) {
                for (var p in data) {
                    if (!data.hasOwnProperty(p)) continue;
                    if (/^(setItem|getItem|removeItem|destroy|clear|save)$/.test(p)) continue; // skip reserved property names to avoid continues bugs

                    addProp(_stores[name], p, data[p]);
                }
            }
        }

        _stores[name].save();
        return _stores[name];
    };


    /**
     * Removes all saved but not provisioned stores
     *
     */
    window.clearMirrors = function () {
        for (var key in localStorage) {
            if (!_stores[key] && /^_MC_\w+/.test(key)) {
                localStorage.removeItem(key);
            }
        }
    }
}());