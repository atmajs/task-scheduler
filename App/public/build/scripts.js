!function(root, factory) {
    var _global, _exports, _document;
    if ("undefined" !== typeof exports && (root === exports || null == root)) _global = _exports = global;
    if (null == _global) _global = "undefined" === typeof window ? global : window;
    if (null == _exports) _exports = root || _global;
    _document = _global.document;
    factory(_global, _exports, _document);
}(this, function(global, exports, document) {
    var bin = {
        js: {},
        css: {},
        load: {}
    }, isWeb = !!(global.location && global.location.protocol && /^https?:/.test(global.location.protocol)), reg_subFolder = /([^\/]+\/)?\.\.\//, reg_hasProtocol = /^file:|https?:/i, cfg = {
        path: null,
        loader: null,
        version: null,
        lockedToFolder: null,
        sync: null,
        eval: null == document
    }, handler = {}, hasOwnProp = {}.hasOwnProperty, emptyResponse = {
        load: {}
    }, __array_slice = Array.prototype.slice, XMLHttpRequest = global.XMLHttpRequest;
    var Helper = {
        reportError: function(e) {
            console.error("IncludeJS Error:", e, e.message, e.url);
            "function" === typeof handler.onerror && handler.onerror(e);
        }
    }, XHR = function(resource, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            4 === xhr.readyState && callback && callback(resource, xhr.responseText);
        };
        xhr.open("GET", "object" === typeof resource ? resource.url : resource, true);
        xhr.send();
    };
    function fn_proxy(fn, ctx) {
        return function() {
            fn.apply(ctx, arguments);
        };
    }
    function fn_doNothing(fn) {
        "function" === typeof fn && fn();
    }
    var obj_inherit, obj_getProperty, obj_setProperty;
    !function() {
        obj_inherit = function(target) {
            if ("function" === typeof target) target = target.prototype;
            var i = 1, imax = arguments.length, source, key;
            for (;i < imax; i++) {
                source = "function" === typeof arguments[i] ? arguments[i].prototype : arguments[i];
                for (key in source) target[key] = source[key];
            }
            return target;
        };
        obj_getProperty = function(obj, property) {
            var chain = property.split("."), length = chain.length, i = 0;
            for (;i < length; i++) {
                if (null == obj) return null;
                obj = obj[chain[i]];
            }
            return obj;
        };
        obj_setProperty = function(obj, property, value) {
            var chain = property.split("."), imax = chain.length - 1, i = -1, key;
            while (++i < imax) {
                key = chain[i];
                if (null == obj[key]) obj[key] = {};
                obj = obj[key];
            }
            obj[chain[i]] = value;
        };
    }();
    function arr_invoke(arr, args, ctx) {
        if (null == arr || arr instanceof Array === false) return;
        for (var i = 0, length = arr.length; i < length; i++) {
            if ("function" !== typeof arr[i]) continue;
            if (null == args) arr[i].call(ctx); else arr[i].apply(ctx, args);
        }
    }
    function arr_ensure(obj, xpath) {
        if (!xpath) return obj;
        var arr = xpath.split("."), imax = arr.length - 1, i = 0, key;
        for (;i < imax; i++) {
            key = arr[i];
            obj = obj[key] || (obj[key] = {});
        }
        key = arr[imax];
        return obj[key] || (obj[key] = []);
    }
    var path_getDir, path_getFile, path_getExtension, path_resolveCurrent, path_normalize, path_win32Normalize, path_resolveUrl, path_combine, path_isRelative;
    !function() {
        path_getDir = function(path) {
            return path.substring(0, path.lastIndexOf("/") + 1);
        };
        path_getFile = function(path) {
            path = path.replace("file://", "").replace(/\\/g, "/").replace(/\?[^\n]+$/, "");
            if (/^\/\w+:\/[^\/]/i.test(path)) return path.substring(1);
            return path;
        };
        path_getExtension = function(path) {
            var query = path.indexOf("?");
            if (query === -1) return path.substring(path.lastIndexOf(".") + 1);
            return path.substring(path.lastIndexOf(".", query) + 1, query);
        };
        path_resolveCurrent = function() {
            if (null == document) return "undefined" === typeof module ? "" : path_win32Normalize(module.parent.filename);
            var scripts = document.getElementsByTagName("script"), last = scripts[scripts.length - 1], url = last && last.getAttribute("src") || "";
            if ("/" === url[0]) return url;
            var location = window.location.pathname.replace(/\/[^\/]+\.\w+$/, "");
            if ("/" !== location[location.length - 1]) location += "/";
            return location + url;
        };
        path_normalize = function(path) {
            return path.replace(/\\/g, "/").replace(/([^:\/])\/{2,}/g, "/");
        };
        path_win32Normalize = function(path) {
            path = path.replace(/\\/g, "/");
            if ("file:" === path.substring(0, 5)) return path;
            return "file:///" + path;
        };
        path_resolveUrl = function(url, parent) {
            if (reg_hasProtocol.test(url)) return path_collapse(url);
            if ("./" === url.substring(0, 2)) url = url.substring(2);
            if ("/" === url[0] && null != parent && null != parent.base) {
                url = path_combine(parent.base, url);
                if (reg_hasProtocol.test(url)) return path_collapse(url);
            }
            if ("/" === url[0] && cfg.path) {
                url = cfg.path + url.substring(1);
                if (reg_hasProtocol.test(url)) return path_collapse(url);
            }
            if ("/" === url[0]) {
                if (false === isWeb || true === cfg.lockedToFolder) url = url.substring(1);
            } else if (null != parent && null != parent.location) url = parent.location + url;
            return path_collapse(url);
        };
        path_isRelative = function(path) {
            var c = path.charCodeAt(0);
            switch (c) {
              case 47:
                return false;

              case 102:
              case 104:
                return false === reg_hasProtocol.test(path);
            }
            return true;
        };
        path_combine = function() {
            var out = "", imax = arguments.length, i = -1, x;
            while (++i < imax) {
                x = arguments[i];
                if (!x) continue;
                x = path_normalize(x);
                if ("" === out) {
                    out = x;
                    continue;
                }
                if ("/" !== out[out.length - 1]) out += "/";
                if ("/" === x[0]) x = x.substring(1);
                out += x;
            }
            return out;
        };
        function path_collapse(url) {
            while (url.indexOf("../") !== -1) url = url.replace(reg_subFolder, "");
            return url;
        }
    }();
    var tree_resolveUsage;
    !function() {
        tree_resolveUsage = function(resource, usage) {
            var use = [], imax = usage.length, i = -1, obj, path, name, index;
            while (++i < imax) {
                name = path = usage[i];
                index = path.indexOf(".");
                if (index !== -1) {
                    name = path.substring(0, index);
                    path = path.substring(index + 1);
                }
                obj = use_resolveExports(name, resource.parent);
                if (name !== path) obj = obj_getProperty(obj, path);
                "object" === typeof obj && null == obj && console.warn("<include:use> Used resource has no exports", name, resource.url);
                use[i] = obj;
            }
            return use;
        };
        function use_resolveExports(name, resource) {
            if (null == resource) {
                console.warn("<include:use> Not Found. Ensure to have it included before with correct alias", name);
                return;
            }
            var includes = resource.includes, i = -1, imax = includes.length, include, exports;
            while (++i < imax) {
                include = includes[i];
                if (include.route.alias === name) return include.resource.exports;
            }
            return use_resolveExports(name, resource.parent);
        }
    }();
    var RoutesLib = function() {
        var routes = {}, regexpAlias = /([^\\\/]+)\.\w+$/;
        return {
            register: function(namespace, route, currentInclude) {
                if ("string" === typeof route && path_isRelative(route)) {
                    var res = currentInclude || include, location = res.location || path_getDir(res.url || path_resolveCurrent());
                    if (path_isRelative(location)) location = "/" + location;
                    route = location + route;
                }
                routes[namespace] = route instanceof Array ? route : route.split(/[\{\}]/g);
            },
            resolve: function(namespace, template) {
                var questionMark = template.indexOf("?"), aliasIndex = template.indexOf("::"), alias, path, params, route, i, x, length, arr;
                if (aliasIndex !== -1) {
                    alias = template.substring(aliasIndex + 2);
                    template = template.substring(0, aliasIndex);
                }
                if (questionMark !== -1) {
                    arr = template.substring(questionMark + 1).split("&");
                    params = {};
                    for (i = 0, length = arr.length; i < length; i++) {
                        x = arr[i].split("=");
                        params[x[0]] = x[1];
                    }
                    template = template.substring(0, questionMark);
                }
                template = template.split("/");
                route = routes[namespace];
                if (null == route) return {
                    path: template.join("/"),
                    params: params,
                    alias: alias
                };
                path = route[0];
                for (i = 1; i < route.length; i++) if (i % 2 === 0) path += route[i]; else {
                    var index = route[i] << 0;
                    if (index > template.length - 1) index = template.length - 1;
                    path += template[index];
                    if (i === route.length - 2) for (index++; index < template.length; index++) path += "/" + template[index];
                }
                return {
                    path: path,
                    params: params,
                    alias: alias
                };
            },
            each: function(type, includeData, fn, namespace, xpath) {
                var key;
                if (null == includeData) return;
                if ("lazy" === type && null == xpath) {
                    for (key in includeData) this.each(type, includeData[key], fn, null, key);
                    return;
                }
                if (includeData instanceof Array) {
                    for (var i = 0; i < includeData.length; i++) this.each(type, includeData[i], fn, namespace, xpath);
                    return;
                }
                if ("object" === typeof includeData) {
                    for (key in includeData) if (hasOwnProp.call(includeData, key)) this.each(type, includeData[key], fn, key, xpath);
                    return;
                }
                if ("string" === typeof includeData) {
                    var x = this.resolve(namespace, includeData);
                    if (namespace) namespace += "." + includeData;
                    fn(namespace, x, xpath);
                    return;
                }
                console.error("Include Package is invalid", arguments);
            },
            getRoutes: function() {
                return routes;
            },
            parseAlias: function(route) {
                var path = route.path, result = regexpAlias.exec(path);
                return result && result[1];
            }
        };
    };
    var Routes = RoutesLib();
    var Events = function(document) {
        if (null == document) return {
            ready: fn_doNothing,
            load: fn_doNothing
        };
        var readycollection = [];
        function onReady() {
            Events.ready = fn_doNothing;
            if (null == readycollection) return;
            arr_invoke(readycollection);
            readycollection = null;
        }
        if ("onreadystatechange" in document) document.onreadystatechange = function() {
            if (false === /complete|interactive/g.test(document.readyState)) return;
            onReady();
        }; else if (document.addEventListener) document.addEventListener("DOMContentLoaded", onReady); else window.onload = onReady;
        return {
            ready: function(callback) {
                readycollection.unshift(callback);
            }
        };
    }(document);
    var ScriptStack = function() {
        var head, currentResource, stack = [], _cb_complete = [], _paused;
        function loadScript(url, callback) {
            var tag = document.createElement("script");
            tag.type = "text/javascript";
            tag.src = url;
            if ("onreadystatechange" in tag) tag.onreadystatechange = function() {
                ("complete" === this.readyState || "loaded" === this.readyState) && callback();
            }; else tag.onload = tag.onerror = callback;
            (head || (head = document.getElementsByTagName("head")[0])).appendChild(tag);
        }
        function loadByEmbedding() {
            if (_paused) return;
            if (0 === stack.length) {
                trigger_complete();
                return;
            }
            if (null != currentResource) return;
            var resource = currentResource = stack[0];
            if (1 === resource.state) return;
            resource.state = 1;
            global.include = resource;
            global.iparams = resource.route.params;
            function resourceLoaded(e) {
                if (e && "error" === e.type) console.log("Script Loaded Error", resource.url);
                var i = 0, length = stack.length;
                for (;i < length; i++) if (stack[i] === resource) {
                    stack.splice(i, 1);
                    break;
                }
                if (i === length) {
                    console.error("Loaded Resource not found in stack", resource);
                    return;
                }
                if (2.5 !== resource.state) resource.readystatechanged(3);
                currentResource = null;
                loadByEmbedding();
            }
            if (resource.source) {
                __eval(resource.source, resource);
                resourceLoaded();
                return;
            }
            loadScript(resource.url, resourceLoaded);
        }
        function processByEval() {
            if (_paused) return;
            if (0 === stack.length) {
                trigger_complete();
                return;
            }
            if (null != currentResource) return;
            var resource = stack[0];
            if (resource.state < 2) return;
            currentResource = resource;
            resource.state = 1;
            global.include = resource;
            __eval(resource.source, resource);
            for (var i = 0, x, length = stack.length; i < length; i++) {
                x = stack[i];
                if (x === resource) {
                    stack.splice(i, 1);
                    break;
                }
            }
            if (2.5 !== resource.state) resource.readystatechanged(3);
            currentResource = null;
            processByEval();
        }
        function trigger_complete() {
            var i = -1, imax = _cb_complete.length;
            while (++i < imax) _cb_complete[i]();
            _cb_complete.length = 0;
        }
        return {
            load: function(resource, parent, forceEmbed) {
                this.add(resource, parent);
                if (!cfg.eval || forceEmbed) {
                    loadByEmbedding();
                    return;
                }
                if (resource.source) {
                    resource.state = 2;
                    processByEval();
                    return;
                }
                XHR(resource, function(resource, response) {
                    if (!response) console.error("Not Loaded:", resource.url);
                    resource.source = response;
                    resource.state = 2;
                    processByEval();
                });
            },
            add: function(resource, parent) {
                if (1 === resource.priority) return stack.unshift(resource);
                if (null == parent) return stack.push(resource);
                var imax = stack.length, i = -1;
                while (++i < imax) if (stack[i] === parent) return stack.splice(i, 0, resource);
                stack.push(resource);
            },
            moveToParent: function(resource, parent) {
                var length = stack.length, parentIndex = -1, resourceIndex = -1, i;
                for (i = 0; i < length; i++) if (stack[i] === resource) {
                    resourceIndex = i;
                    break;
                }
                if (resourceIndex === -1) return;
                for (i = 0; i < length; i++) if (stack[i] === parent) {
                    parentIndex = i;
                    break;
                }
                if (parentIndex === -1) return;
                if (resourceIndex < parentIndex) return;
                stack.splice(resourceIndex, 1);
                stack.splice(parentIndex, 0, resource);
            },
            pause: function() {
                _paused = true;
            },
            resume: function() {
                _paused = false;
                if (null != currentResource) return;
                this.touch();
            },
            touch: function() {
                var fn = cfg.eval ? processByEval : loadByEmbedding;
                fn();
            },
            complete: function(callback) {
                if (true !== _paused && 0 === stack.length) {
                    callback();
                    return;
                }
                _cb_complete.push(callback);
            }
        };
    }();
    var IncludeDeferred = function() {
        this.callbacks = [];
        this.state = -1;
    };
    IncludeDeferred.prototype = {
        on: function(state, callback, sender, mutator) {
            if (this === sender && this.state === -1) {
                callback(this);
                return this;
            }
            if (null == mutator) mutator = this.state < 3 || this === sender ? "unshift" : "push";
            state <= this.state ? callback(this) : this.callbacks[mutator]({
                state: state,
                callback: callback
            });
            return this;
        },
        readystatechanged: function(state) {
            var i, length, x, currentInclude;
            if (state > this.state) this.state = state;
            if (3 === this.state) {
                var includes = this.includes;
                if (null != includes && includes.length) for (i = 0; i < includes.length; i++) if (4 !== includes[i].resource.state) return;
                this.state = 4;
            }
            i = 0;
            length = this.callbacks.length;
            if (0 === length) return;
            if ("js" === this.type && 4 === this.state) {
                currentInclude = global.include;
                global.include = this;
            }
            for (;i < length; i++) {
                x = this.callbacks[i];
                if (null == x || x.state > this.state) continue;
                this.callbacks.splice(i, 1);
                length--;
                i--;
                x.callback(this);
                if (this.state < 4) break;
            }
            if (null != currentInclude) global.include = currentInclude;
        },
        ready: function(callback) {
            var that = this;
            return this.on(4, function() {
                Events.ready(function() {
                    that.resolve(callback);
                });
            }, this);
        },
        done: function(callback) {
            var that = this;
            return this.on(4, function() {
                that.resolve(callback);
            }, this);
        },
        resolve: function(callback) {
            var includes = this.includes, length = null == includes ? 0 : includes.length;
            if (length > 0 && null == this.response) {
                this.response = {};
                var resource, route;
                for (var i = 0, x; i < length; i++) {
                    x = includes[i];
                    resource = x.resource;
                    route = x.route;
                    if ("undefined" === typeof resource.exports) continue;
                    var type = resource.type;
                    switch (type) {
                      case "js":
                      case "load":
                      case "ajax":
                        var alias = route.alias || Routes.parseAlias(route), obj = "js" === type ? this.response : this.response[type] || (this.response[type] = {});
                        if (null != alias) {
                            obj_setProperty(obj, alias, resource.exports);
                            break;
                        }
                        console.warn("<includejs> Alias is undefined", resource);
                    }
                }
            }
            var response = this.response || emptyResponse;
            if (this._use) return callback.apply(null, [ response ].concat(this._use));
            callback(response);
        }
    };
    var Include = function(IncludeDeferred) {
        function Include() {
            IncludeDeferred.call(this);
        }
        stub_release(Include.prototype);
        obj_inherit(Include, IncludeDeferred, {
            isBrowser: true,
            isNode: false,
            setCurrent: function(data) {
                var resource = new Resource("js", {
                    path: data.id
                }, data.namespace, null, null, data.id);
                if (resource.state < 3) console.error("<include> Resource should be loaded", data);
                resource.state = 3;
                global.include = resource;
            },
            cfg: function(arg) {
                switch (typeof arg) {
                  case "object":
                    var key, value;
                    for (key in arg) {
                        value = arg[key];
                        switch (key) {
                          case "loader":
                            for (var x in value) CustomLoader.register(x, value[x]);
                            break;

                          case "modules":
                            if (true === value) enableModules();
                            break;

                          default:
                            cfg[key] = value;
                        }
                    }
                    break;

                  case "string":
                    if (1 === arguments.length) return cfg[arg];
                    if (2 === arguments.length) cfg[arg] = arguments[1];
                    break;

                  case "undefined":
                    return cfg;
                }
                return this;
            },
            routes: function(mix) {
                if (null == mix) return Routes.getRoutes();
                if (2 === arguments.length) {
                    Routes.register(mix, arguments[1], this);
                    return this;
                }
                for (var key in mix) Routes.register(key, mix[key], this);
                return this;
            },
            promise: function(namespace) {
                var arr = namespace.split("."), obj = global;
                while (arr.length) {
                    var key = arr.shift();
                    obj = obj[key] || (obj[key] = {});
                }
                return obj;
            },
            register: function(_bin) {
                var key, info, infos, imax, i;
                for (key in _bin) {
                    infos = _bin[key];
                    imax = infos.length;
                    i = -1;
                    while (++i < imax) {
                        info = infos[i];
                        var id = info.id, url = info.url, namespace = info.namespace, parent = info.parent && incl_getResource(info.parent, "js"), resource = new Resource(), state = info.state;
                        if (!(id || url)) continue;
                        if (url) {
                            if ("/" === url[0]) url = url.substring(1);
                            resource.location = path_getDir(url);
                        }
                        resource.state = null == state ? "js" === key ? 3 : 4 : state;
                        resource.namespace = namespace;
                        resource.type = key;
                        resource.url = url || id;
                        resource.parent = parent;
                        switch (key) {
                          case "load":
                          case "lazy":
                            var container = document.querySelector("#includejs-" + id.replace(/\W/g, ""));
                            if (null == container) {
                                console.error('"%s" Data was not embedded into html', id);
                                break;
                            }
                            resource.exports = container.innerHTML;
                            if (CustomLoader.exists(resource)) {
                                resource.state = 3;
                                CustomLoader.load(resource, function(resource, response) {
                                    resource.exports = response;
                                    resource.readystatechanged(4);
                                });
                            }
                        }
                        (bin[key] || (bin[key] = {}))[id] = resource;
                    }
                }
            },
            instance: function(url) {
                var resource;
                if (null == url) {
                    resource = new Include();
                    resource.state = 4;
                    return resource;
                }
                resource = new Resource();
                resource.state = 4;
                resource.location = path_getDir(url);
                return resource;
            },
            getResource: incl_getResource,
            getResources: function() {
                return bin;
            },
            plugin: function(pckg, callback) {
                var urls = [], length = 0, j = 0, i = 0, onload = function(url, response) {
                    j++;
                    embedPlugin(response);
                    if (j === length - 1 && callback) {
                        callback();
                        callback = null;
                    }
                };
                Routes.each("", pckg, function(namespace, route) {
                    urls.push("/" === route.path[0] ? route.path.substring(1) : route.path);
                });
                length = urls.length;
                for (;i < length; i++) XHR(urls[i], onload);
                return this;
            },
            client: function() {
                if (true === cfg.server) stub_freeze(this);
                return this;
            },
            server: function() {
                if (true !== cfg.server) stub_freeze(this);
                return this;
            },
            use: function() {
                if (null == this.parent) {
                    console.error("<include.use> Parent resource is undefined");
                    return this;
                }
                this._use = tree_resolveUsage(this, arguments);
                return this;
            },
            pauseStack: fn_proxy(ScriptStack.pause, ScriptStack),
            resumeStack: fn_proxy(ScriptStack.resume, ScriptStack),
            allDone: function(callback) {
                ScriptStack.complete(function() {
                    var pending = include.getPending("js"), await = pending.length;
                    if (0 === await) {
                        callback();
                        return;
                    }
                    var i = -1, imax = await;
                    while (++i < imax) pending[i].on(4, check);
                    function check() {
                        if (--await < 1) callback();
                    }
                });
            },
            getPending: function(type) {
                var resources = [], res, key, id;
                for (key in bin) {
                    if (null != type && type != key) continue;
                    for (id in bin[key]) {
                        res = bin[key][id];
                        if (res.state < 4) resources.push(res);
                    }
                }
                return resources;
            }
        });
        return Include;
        function incl_getResource(url, type) {
            var id = url;
            if (47 !== url.charCodeAt(0)) id = "/" + id;
            if (null != type) return bin[type][id];
            for (var key in bin) if (bin[key].hasOwnProperty(id)) return bin[key][id];
            return null;
        }
        function embedPlugin(source) {
            eval(source);
        }
        function enableModules() {
            if ("undefined" === typeof Object.defineProperty) {
                console.warn("Browser do not support Object.defineProperty");
                return;
            }
            Object.defineProperty(global, "module", {
                get: function() {
                    return global.include;
                }
            });
            Object.defineProperty(global, "exports", {
                get: function() {
                    var current = global.include;
                    return current.exports || (current.exports = {});
                },
                set: function(exports) {
                    global.include.exports = exports;
                }
            });
        }
        function includePackage(resource, type, mix) {
            var pckg = 1 === mix.length ? mix[0] : __array_slice.call(mix);
            if (resource instanceof Resource) return resource.include(type, pckg);
            return new Resource("js").include(type, pckg);
        }
        function createIncluder(type) {
            return function() {
                return includePackage(this, type, arguments);
            };
        }
        function doNothing() {
            return this;
        }
        function stub_freeze(include) {
            include.js = include.css = include.load = include.ajax = include.embed = include.lazy = include.inject = doNothing;
        }
        function stub_release(proto) {
            var fns = [ "js", "css", "load", "ajax", "embed", "lazy" ], i = fns.length;
            while (--i !== -1) proto[fns[i]] = createIncluder(fns[i]);
            proto["inject"] = proto.js;
        }
    }(IncludeDeferred);
    var CustomLoader = function() {
        var JSONParser = {
            process: function(source, res) {
                try {
                    return JSON.parse(source);
                } catch (error) {
                    console.error(error, source);
                    return null;
                }
            }
        };
        cfg.loader = {
            json: JSONParser
        };
        function loader_isInstance(x) {
            if ("string" === typeof x) return false;
            return "function" === typeof x.ready || "function" === typeof x.process;
        }
        function createLoader(url) {
            var extension = path_getExtension(url), loader = cfg.loader[extension];
            if (loader_isInstance(loader)) return loader;
            var path = loader, namespace;
            if ("object" === typeof path) for (var key in path) {
                namespace = key;
                path = path[key];
                break;
            }
            return cfg.loader[extension] = new Resource("js", Routes.resolve(namespace, path), namespace, null, null, null, 1);
        }
        function loader_completeDelegate(callback, resource) {
            return function(response) {
                callback(resource, response);
            };
        }
        function loader_process(source, resource, loader, callback) {
            if (null == loader.process) {
                callback(resource, source);
                return;
            }
            var delegate = loader_completeDelegate(callback, resource), syncResponse = loader.process(source, resource, delegate);
            if ("undefined" !== typeof syncResponse) callback(resource, syncResponse);
        }
        function tryLoad(resource, loader, callback) {
            if ("string" === typeof resource.exports) {
                loader_process(resource.exports, resource, loader, callback);
                return;
            }
            function onLoad(resource, response) {
                loader_process(response, resource, loader, callback);
            }
            if (loader.load) return loader.load(resource, onLoad);
            XHR(resource, onLoad);
        }
        return {
            load: function(resource, callback) {
                var loader = createLoader(resource.url);
                if (loader.process) {
                    tryLoad(resource, loader, callback);
                    return;
                }
                loader.on(4, function() {
                    tryLoad(resource, loader.exports, callback);
                }, null, "push");
            },
            exists: function(resource) {
                if (!resource.url) return false;
                var ext = path_getExtension(resource.url);
                return cfg.loader.hasOwnProperty(ext);
            },
            register: function(extension, handler) {
                if ("string" === typeof handler) {
                    var resource = include;
                    if (null == resource.location) resource = {
                        location: path_getDir(path_resolveCurrent())
                    };
                    handler = path_resolveUrl(handler, resource);
                }
                cfg.loader[extension] = handler;
            }
        };
    }();
    var LazyModule = {
        create: function(xpath, code) {
            var arr = xpath.split("."), obj = global, module = arr[arr.length - 1];
            while (arr.length > 1) {
                var prop = arr.shift();
                obj = obj[prop] || (obj[prop] = {});
            }
            arr = null;
            Object.defineProperty(obj, module, {
                get: function() {
                    delete obj[module];
                    try {
                        var r = __eval(code, global.include);
                        if (!(null == r || r instanceof Resource)) obj[module] = r;
                    } catch (error) {
                        error.xpath = xpath;
                        Helper.reportError(error);
                    } finally {
                        code = null;
                        xpath = null;
                        return obj[module];
                    }
                }
            });
        }
    };
    var Resource;
    !function(Include, Routes, ScriptStack, CustomLoader) {
        Resource = function(type, route, namespace, xpath, parent, id, priority) {
            Include.call(this);
            this.childLoaded = fn_proxy(this.childLoaded, this);
            var url = route && route.path;
            if (null != url) this.url = url = path_resolveUrl(url, parent);
            this.type = type;
            this.xpath = xpath;
            this.route = route;
            this.parent = parent;
            this.priority = priority;
            this.namespace = namespace;
            this.base = parent && parent.base;
            if (null == id && url) id = ("/" === url[0] ? "" : "/") + url;
            var resource = bin[type] && bin[type][id];
            if (resource) {
                if (resource.state < 4 && "js" === type) ScriptStack.moveToParent(resource, parent);
                return resource;
            }
            if (null == url) {
                this.state = 3;
                this.location = path_getDir(path_resolveCurrent());
                return this;
            }
            this.state = 0;
            this.location = path_getDir(url);
            (bin[type] || (bin[type] = {}))[id] = this;
            if (cfg.version) this.url += (this.url.indexOf("?") === -1 ? "?" : "&") + "v=" + cfg.version;
            return process(this);
        };
        Resource.prototype = obj_inherit(Resource, Include, {
            state: null,
            location: null,
            includes: null,
            response: null,
            url: null,
            base: null,
            type: null,
            xpath: null,
            route: null,
            parent: null,
            priority: null,
            namespace: null,
            setBase: function(baseUrl) {
                this.base = baseUrl;
                return this;
            },
            childLoaded: function(child) {
                var resource = this, includes = resource.includes;
                if (includes && includes.length) {
                    if (resource.state < 3) return;
                    for (var i = 0; i < includes.length; i++) if (4 !== includes[i].resource.state) return;
                }
                resource.readystatechanged(4);
            },
            create: function(type, route, namespace, xpath, id) {
                var resource;
                this.state = this.state >= 3 ? 3 : 2;
                this.response = null;
                if (null == this.includes) this.includes = [];
                resource = new Resource(type, route, namespace, xpath, this, id);
                this.includes.push({
                    resource: resource,
                    route: route
                });
                return resource;
            },
            include: function(type, pckg) {
                var that = this;
                Routes.each(type, pckg, function(namespace, route, xpath) {
                    if (null != that.route && that.route.path === route.path) return;
                    that.create(type, route, namespace, xpath).on(4, that.childLoaded);
                });
                return this;
            },
            pause: function() {
                this.state = 2.5;
                var that = this;
                return function(exports) {
                    if (1 === arguments.length) that.exports = exports;
                    that.readystatechanged(3);
                };
            },
            getNestedOfType: function(type) {
                return resource_getChildren(this.includes, type);
            }
        });
        function process(resource) {
            var type = resource.type, parent = resource.parent, url = resource.url;
            if (null == document && "css" === type) {
                resource.state = 4;
                return resource;
            }
            if (false === CustomLoader.exists(resource)) switch (type) {
              case "js":
              case "embed":
                ScriptStack.load(resource, parent, "embed" === type);
                break;

              case "ajax":
              case "load":
              case "lazy":
                XHR(resource, onXHRCompleted);
                break;

              case "css":
                resource.state = 4;
                var tag = document.createElement("link");
                tag.href = url;
                tag.rel = "stylesheet";
                tag.type = "text/css";
                document.getElementsByTagName("head")[0].appendChild(tag);
            } else {
                if ("js" === type || "embed" === type) ScriptStack.add(resource, resource.parent);
                CustomLoader.load(resource, onXHRCompleted);
            }
            return resource;
        }
        function onXHRCompleted(resource, response) {
            if (!response) console.warn("Resource cannt be loaded", resource.url);
            switch (resource.type) {
              case "js":
              case "embed":
                resource.source = response;
                resource.state = 2;
                ScriptStack.touch();
                return;

              case "load":
              case "ajax":
                resource.exports = response;
                break;

              case "lazy":
                LazyModule.create(resource.xpath, response);
                break;

              case "css":
                var tag = document.createElement("style");
                tag.type = "text/css";
                tag.innerHTML = response;
                document.getElementsByTagName("head")[0].appendChild(tag);
            }
            resource.readystatechanged(4);
        }
        function resource_getChildren(includes, type, out) {
            if (null == includes) return null;
            if (null == out) out = [];
            var imax = includes.length, i = -1, x;
            while (++i < imax) {
                x = includes[i].resource;
                if (type === x.type) out.push(x);
                if (null != x.includes) resource_getChildren(x.includes, type, out);
            }
            return out;
        }
    }(Include, Routes, ScriptStack, CustomLoader);
    exports.include = new Include();
    exports.includeLib = {
        Routes: RoutesLib,
        Resource: Resource,
        ScriptStack: ScriptStack,
        registerLoader: CustomLoader.register
    };
});

function __eval(source, include) {
    var iparams = include && include.route.params;
    return eval.call(window, source);
}

include.pauseStack();

include.register({
    css: [ {
        id: "/.reference/atma/compos/prism/lib/prism.lib.css",
        url: "/.reference/atma/compos/prism/lib/prism.lib.css",
        parent: "/.reference/atma/compos/prism/lib/prism.js"
    }, {
        id: "/.reference/atma/compos/tabs/lib/tabs.css",
        url: "/.reference/atma/compos/tabs/lib/tabs.css",
        parent: "/.reference/atma/compos/tabs/lib/tabs.js"
    }, {
        id: "/public/control/ajax-loader/ajax-loader.less",
        url: "/public/control/ajax-loader/ajax-loader.less",
        parent: "/public/control/ajax-loader/ajax-loader.es6"
    }, {
        id: "/.reference/bootstrap/dist/css/bootstrap.min.css",
        url: "/.reference/bootstrap/dist/css/bootstrap.min.css"
    } ],
    js: [ {
        id: "/.reference/atma/include/lib/include.js",
        url: "/.reference/atma/include/lib/include.js",
        state: 4
    }, {
        url: ""
    }, {
        id: "/.reference/atma/ruqq/lib/dom/jquery.js",
        url: "/.reference/atma/ruqq/lib/dom/jquery.js"
    }, {
        id: "/.reference/atma/class/lib/class.js",
        url: "/.reference/atma/class/lib/class.js"
    }, {
        id: "/.reference/atma/mask/lib/mask.js",
        url: "/.reference/atma/mask/lib/mask.js"
    }, {
        id: "/.reference/atma/mask-node/lib/mask.bootstrap.js",
        url: "/.reference/atma/mask-node/lib/mask.bootstrap.js"
    }, {
        id: "/.reference/atma/ruta/lib/ruta.js",
        url: "/.reference/atma/ruta/lib/ruta.js"
    }, {
        id: "/.reference/atma/mask-animation/lib/mask.animation.js",
        url: "/.reference/atma/mask-animation/lib/mask.animation.js"
    }, {
        id: "/.reference/atma/compos/prism/lib/prism.js",
        url: "/.reference/atma/compos/prism/lib/prism.js"
    }, {
        id: "/.reference/atma/compos/prism/lib/prism.lib.js",
        url: "/.reference/atma/compos/prism/lib/prism.lib.js",
        parent: "/.reference/atma/compos/prism/lib/prism.js"
    }, {
        id: "/.reference/atma/compos/tabs/lib/tabs.js",
        url: "/.reference/atma/compos/tabs/lib/tabs.js"
    }, {
        id: "/public/control/ajax-loader/ajax-loader.es6",
        url: "/public/control/ajax-loader/ajax-loader.es6"
    } ]
});

include.routes({
    "public": "/public/script/{0}.js",
    public_compo: "/public/compo/{0}/{1}.js",
    atma: "/.reference/atma/{0}/lib/{1}.js",
    atma_compo: "/.reference/atma/compos/{0}/lib/{1}.js",
    view: "/public/view/{0}/{1}.js",
    public_model: "/public/model/{0}.js",
    public_script: "/public/script/{0}.js",
    public_control: "/public/control/{0}/{1}.js",
    public_attr: "/public/attr/{0}.js",
    control: "/public/control/{0}/{1}.es6"
});

include.cfg({}).routes({
    "public": "/public/script/{0}.js",
    public_compo: "/public/compo/{0}/{1}.js",
    atma: "/.reference/atma/{0}/lib/{1}.js",
    atma_compo: "/.reference/atma/compos/{0}/lib/{1}.js",
    view: "/public/view/{0}/{1}.js",
    public_model: "/public/model/{0}.js",
    public_script: "/public/script/{0}.js",
    public_control: "/public/control/{0}/{1}.js",
    public_attr: "/public/attr/{0}.js",
    control: "/public/control/{0}/{1}.es6"
});

include.setCurrent({
    id: "/.reference/atma/ruqq/lib/dom/jquery.js",
    namespace: "",
    url: "/.reference/atma/ruqq/lib/dom/jquery.js"
});

/*! jQuery v1.8.2 jquery.com | jquery.org/license */
!function(a, b) {
    function G(a) {
        var b = F[a] = {};
        return p.each(a.split(s), function(a, c) {
            b[c] = !0;
        }), b;
    }
    function J(a, c, d) {
        if (d === b && 1 === a.nodeType) {
            var e = "data-" + c.replace(I, "-$1").toLowerCase();
            d = a.getAttribute(e);
            if ("string" == typeof d) {
                try {
                    d = "true" === d ? !0 : "false" === d ? !1 : "null" === d ? null : +d + "" === d ? +d : H.test(d) ? p.parseJSON(d) : d;
                } catch (f) {}
                p.data(a, c, d);
            } else d = b;
        }
        return d;
    }
    function K(a) {
        var b;
        for (b in a) {
            if ("data" === b && p.isEmptyObject(a[b])) continue;
            if ("toJSON" !== b) return !1;
        }
        return !0;
    }
    function ba() {
        return !1;
    }
    function bb() {
        return !0;
    }
    function bh(a) {
        return !a || !a.parentNode || 11 === a.parentNode.nodeType;
    }
    function bi(a, b) {
        do a = a[b]; while (a && 1 !== a.nodeType);
        return a;
    }
    function bj(a, b, c) {
        b = b || 0;
        if (p.isFunction(b)) return p.grep(a, function(a, d) {
            var e = !!b.call(a, d, a);
            return e === c;
        });
        if (b.nodeType) return p.grep(a, function(a, d) {
            return a === b === c;
        });
        if ("string" == typeof b) {
            var d = p.grep(a, function(a) {
                return 1 === a.nodeType;
            });
            if (be.test(b)) return p.filter(b, d, !c);
            b = p.filter(b, d);
        }
        return p.grep(a, function(a, d) {
            return p.inArray(a, b) >= 0 === c;
        });
    }
    function bk(a) {
        var b = bl.split("|"), c = a.createDocumentFragment();
        if (c.createElement) while (b.length) c.createElement(b.pop());
        return c;
    }
    function bC(a, b) {
        return a.getElementsByTagName(b)[0] || a.appendChild(a.ownerDocument.createElement(b));
    }
    function bD(a, b) {
        if (1 !== b.nodeType || !p.hasData(a)) return;
        var c, d, e, f = p._data(a), g = p._data(b, f), h = f.events;
        if (h) {
            delete g.handle, g.events = {};
            for (c in h) for (d = 0, e = h[c].length; d < e; d++) p.event.add(b, c, h[c][d]);
        }
        g.data && (g.data = p.extend({}, g.data));
    }
    function bE(a, b) {
        var c;
        if (1 !== b.nodeType) return;
        b.clearAttributes && b.clearAttributes(), b.mergeAttributes && b.mergeAttributes(a), 
        c = b.nodeName.toLowerCase(), "object" === c ? (b.parentNode && (b.outerHTML = a.outerHTML), 
        p.support.html5Clone && a.innerHTML && !p.trim(b.innerHTML) && (b.innerHTML = a.innerHTML)) : "input" === c && bv.test(a.type) ? (b.defaultChecked = b.checked = a.checked, 
        b.value !== a.value && (b.value = a.value)) : "option" === c ? b.selected = a.defaultSelected : "input" === c || "textarea" === c ? b.defaultValue = a.defaultValue : "script" === c && b.text !== a.text && (b.text = a.text), 
        b.removeAttribute(p.expando);
    }
    function bF(a) {
        return "undefined" != typeof a.getElementsByTagName ? a.getElementsByTagName("*") : "undefined" != typeof a.querySelectorAll ? a.querySelectorAll("*") : [];
    }
    function bG(a) {
        bv.test(a.type) && (a.defaultChecked = a.checked);
    }
    function bY(a, b) {
        if (b in a) return b;
        var c = b.charAt(0).toUpperCase() + b.slice(1), d = b, e = bW.length;
        while (e--) {
            b = bW[e] + c;
            if (b in a) return b;
        }
        return d;
    }
    function bZ(a, b) {
        return a = b || a, "none" === p.css(a, "display") || !p.contains(a.ownerDocument, a);
    }
    function b$(a, b) {
        var c, d, e = [], f = 0, g = a.length;
        for (;f < g; f++) {
            c = a[f];
            if (!c.style) continue;
            e[f] = p._data(c, "olddisplay"), b ? (!e[f] && "none" === c.style.display && (c.style.display = ""), 
            "" === c.style.display && bZ(c) && (e[f] = p._data(c, "olddisplay", cc(c.nodeName)))) : (d = bH(c, "display"), 
            !e[f] && "none" !== d && p._data(c, "olddisplay", d));
        }
        for (f = 0; f < g; f++) {
            c = a[f];
            if (!c.style) continue;
            if (!b || "none" === c.style.display || "" === c.style.display) c.style.display = b ? e[f] || "" : "none";
        }
        return a;
    }
    function b_(a, b, c) {
        var d = bP.exec(b);
        return d ? Math.max(0, d[1] - (c || 0)) + (d[2] || "px") : b;
    }
    function ca(a, b, c, d) {
        var e = c === (d ? "border" : "content") ? 4 : "width" === b ? 1 : 0, f = 0;
        for (;e < 4; e += 2) "margin" === c && (f += p.css(a, c + bV[e], !0)), d ? ("content" === c && (f -= parseFloat(bH(a, "padding" + bV[e])) || 0), 
        "margin" !== c && (f -= parseFloat(bH(a, "border" + bV[e] + "Width")) || 0)) : (f += parseFloat(bH(a, "padding" + bV[e])) || 0, 
        "padding" !== c && (f += parseFloat(bH(a, "border" + bV[e] + "Width")) || 0));
        return f;
    }
    function cb(a, b, c) {
        var d = "width" === b ? a.offsetWidth : a.offsetHeight, e = !0, f = p.support.boxSizing && "border-box" === p.css(a, "boxSizing");
        if (d <= 0 || null == d) {
            d = bH(a, b);
            if (d < 0 || null == d) d = a.style[b];
            if (bQ.test(d)) return d;
            e = f && (p.support.boxSizingReliable || d === a.style[b]), d = parseFloat(d) || 0;
        }
        return d + ca(a, b, c || (f ? "border" : "content"), e) + "px";
    }
    function cc(a) {
        if (bS[a]) return bS[a];
        var b = p("<" + a + ">").appendTo(e.body), c = b.css("display");
        b.remove();
        if ("none" === c || "" === c) {
            bI = e.body.appendChild(bI || p.extend(e.createElement("iframe"), {
                frameBorder: 0,
                width: 0,
                height: 0
            }));
            if (!bJ || !bI.createElement) bJ = (bI.contentWindow || bI.contentDocument).document, 
            bJ.write("<!doctype html><html><body>"), bJ.close();
            b = bJ.body.appendChild(bJ.createElement(a)), c = bH(b, "display"), e.body.removeChild(bI);
        }
        return bS[a] = c, c;
    }
    function ci(a, b, c, d) {
        var e;
        if (p.isArray(b)) p.each(b, function(b, e) {
            c || ce.test(a) ? d(a, e) : ci(a + "[" + ("object" == typeof e ? b : "") + "]", e, c, d);
        }); else if (!c && "object" === p.type(b)) for (e in b) ci(a + "[" + e + "]", b[e], c, d); else d(a, b);
    }
    function cz(a) {
        return function(b, c) {
            "string" != typeof b && (c = b, b = "*");
            var d, e, f, g = b.toLowerCase().split(s), h = 0, i = g.length;
            if (p.isFunction(c)) for (;h < i; h++) d = g[h], f = /^\+/.test(d), f && (d = d.substr(1) || "*"), 
            e = a[d] = a[d] || [], e[f ? "unshift" : "push"](c);
        };
    }
    function cA(a, c, d, e, f, g) {
        f = f || c.dataTypes[0], g = g || {}, g[f] = !0;
        var h, i = a[f], j = 0, k = i ? i.length : 0, l = a === cv;
        for (;j < k && (l || !h); j++) h = i[j](c, d, e), "string" == typeof h && (!l || g[h] ? h = b : (c.dataTypes.unshift(h), 
        h = cA(a, c, d, e, h, g)));
        return (l || !h) && !g["*"] && (h = cA(a, c, d, e, "*", g)), h;
    }
    function cB(a, c) {
        var d, e, f = p.ajaxSettings.flatOptions || {};
        for (d in c) c[d] !== b && ((f[d] ? a : e || (e = {}))[d] = c[d]);
        e && p.extend(!0, a, e);
    }
    function cC(a, c, d) {
        var e, f, g, h, i = a.contents, j = a.dataTypes, k = a.responseFields;
        for (f in k) f in d && (c[k[f]] = d[f]);
        while ("*" === j[0]) j.shift(), e === b && (e = a.mimeType || c.getResponseHeader("content-type"));
        if (e) for (f in i) if (i[f] && i[f].test(e)) {
            j.unshift(f);
            break;
        }
        if (j[0] in d) g = j[0]; else {
            for (f in d) {
                if (!j[0] || a.converters[f + " " + j[0]]) {
                    g = f;
                    break;
                }
                h || (h = f);
            }
            g = g || h;
        }
        if (g) return g !== j[0] && j.unshift(g), d[g];
    }
    function cD(a, b) {
        var c, d, e, f, g = a.dataTypes.slice(), h = g[0], i = {}, j = 0;
        a.dataFilter && (b = a.dataFilter(b, a.dataType));
        if (g[1]) for (c in a.converters) i[c.toLowerCase()] = a.converters[c];
        for (;e = g[++j]; ) if ("*" !== e) {
            if ("*" !== h && h !== e) {
                c = i[h + " " + e] || i["* " + e];
                if (!c) for (d in i) {
                    f = d.split(" ");
                    if (f[1] === e) {
                        c = i[h + " " + f[0]] || i["* " + f[0]];
                        if (c) {
                            c === !0 ? c = i[d] : i[d] !== !0 && (e = f[0], g.splice(j--, 0, e));
                            break;
                        }
                    }
                }
                if (c !== !0) if (c && a["throws"]) b = c(b); else try {
                    b = c(b);
                } catch (k) {
                    return {
                        state: "parsererror",
                        error: c ? k : "No conversion from " + h + " to " + e
                    };
                }
            }
            h = e;
        }
        return {
            state: "success",
            data: b
        };
    }
    function cL() {
        try {
            return new a.XMLHttpRequest();
        } catch (b) {}
    }
    function cM() {
        try {
            return new a.ActiveXObject("Microsoft.XMLHTTP");
        } catch (b) {}
    }
    function cU() {
        return setTimeout(function() {
            cN = b;
        }, 0), cN = p.now();
    }
    function cV(a, b) {
        p.each(b, function(b, c) {
            var d = (cT[b] || []).concat(cT["*"]), e = 0, f = d.length;
            for (;e < f; e++) if (d[e].call(a, b, c)) return;
        });
    }
    function cW(a, b, c) {
        var d, e = 0, f = 0, g = cS.length, h = p.Deferred().always(function() {
            delete i.elem;
        }), i = function() {
            var b = cN || cU(), c = Math.max(0, j.startTime + j.duration - b), d = 1 - (c / j.duration || 0), e = 0, f = j.tweens.length;
            for (;e < f; e++) j.tweens[e].run(d);
            return h.notifyWith(a, [ j, d, c ]), d < 1 && f ? c : (h.resolveWith(a, [ j ]), 
            !1);
        }, j = h.promise({
            elem: a,
            props: p.extend({}, b),
            opts: p.extend(!0, {
                specialEasing: {}
            }, c),
            originalProperties: b,
            originalOptions: c,
            startTime: cN || cU(),
            duration: c.duration,
            tweens: [],
            createTween: function(b, c, d) {
                var e = p.Tween(a, j.opts, b, c, j.opts.specialEasing[b] || j.opts.easing);
                return j.tweens.push(e), e;
            },
            stop: function(b) {
                var c = 0, d = b ? j.tweens.length : 0;
                for (;c < d; c++) j.tweens[c].run(1);
                return b ? h.resolveWith(a, [ j, b ]) : h.rejectWith(a, [ j, b ]), this;
            }
        }), k = j.props;
        cX(k, j.opts.specialEasing);
        for (;e < g; e++) {
            d = cS[e].call(j, a, k, j.opts);
            if (d) return d;
        }
        return cV(j, k), p.isFunction(j.opts.start) && j.opts.start.call(a, j), p.fx.timer(p.extend(i, {
            anim: j,
            queue: j.opts.queue,
            elem: a
        })), j.progress(j.opts.progress).done(j.opts.done, j.opts.complete).fail(j.opts.fail).always(j.opts.always);
    }
    function cX(a, b) {
        var c, d, e, f, g;
        for (c in a) {
            d = p.camelCase(c), e = b[d], f = a[c], p.isArray(f) && (e = f[1], f = a[c] = f[0]), 
            c !== d && (a[d] = f, delete a[c]), g = p.cssHooks[d];
            if (g && "expand" in g) {
                f = g.expand(f), delete a[d];
                for (c in f) c in a || (a[c] = f[c], b[c] = e);
            } else b[d] = e;
        }
    }
    function cY(a, b, c) {
        var d, e, f, g, h, i, j, k, l = this, m = a.style, n = {}, o = [], q = a.nodeType && bZ(a);
        c.queue || (j = p._queueHooks(a, "fx"), null == j.unqueued && (j.unqueued = 0, k = j.empty.fire, 
        j.empty.fire = function() {
            j.unqueued || k();
        }), j.unqueued++, l.always(function() {
            l.always(function() {
                j.unqueued--, p.queue(a, "fx").length || j.empty.fire();
            });
        })), 1 === a.nodeType && ("height" in b || "width" in b) && (c.overflow = [ m.overflow, m.overflowX, m.overflowY ], 
        "inline" === p.css(a, "display") && "none" === p.css(a, "float") && (!p.support.inlineBlockNeedsLayout || "inline" === cc(a.nodeName) ? m.display = "inline-block" : m.zoom = 1)), 
        c.overflow && (m.overflow = "hidden", p.support.shrinkWrapBlocks || l.done(function() {
            m.overflow = c.overflow[0], m.overflowX = c.overflow[1], m.overflowY = c.overflow[2];
        }));
        for (d in b) {
            f = b[d];
            if (cP.exec(f)) {
                delete b[d];
                if (f === (q ? "hide" : "show")) continue;
                o.push(d);
            }
        }
        g = o.length;
        if (g) {
            h = p._data(a, "fxshow") || p._data(a, "fxshow", {}), q ? p(a).show() : l.done(function() {
                p(a).hide();
            }), l.done(function() {
                var b;
                p.removeData(a, "fxshow", !0);
                for (b in n) p.style(a, b, n[b]);
            });
            for (d = 0; d < g; d++) e = o[d], i = l.createTween(e, q ? h[e] : 0), n[e] = h[e] || p.style(a, e), 
            e in h || (h[e] = i.start, q && (i.end = i.start, i.start = "width" === e || "height" === e ? 1 : 0));
        }
    }
    function cZ(a, b, c, d, e) {
        return new cZ.prototype.init(a, b, c, d, e);
    }
    function c$(a, b) {
        var c, d = {
            height: a
        }, e = 0;
        b = b ? 1 : 0;
        for (;e < 4; e += 2 - b) c = bV[e], d["margin" + c] = d["padding" + c] = a;
        return b && (d.opacity = d.width = a), d;
    }
    function da(a) {
        return p.isWindow(a) ? a : 9 === a.nodeType ? a.defaultView || a.parentWindow : !1;
    }
    var c, d, e = a.document, f = a.location, g = a.navigator, h = a.jQuery, i = a.$, j = Array.prototype.push, k = Array.prototype.slice, l = Array.prototype.indexOf, m = Object.prototype.toString, n = Object.prototype.hasOwnProperty, o = String.prototype.trim, p = function(a, b) {
        return new p.fn.init(a, b, c);
    }, q = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source, r = /\S/, s = /\s+/, t = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, u = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/, v = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, w = /^[\],:{}\s]*$/, x = /(?:^|:|,)(?:\s*\[)+/g, y = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g, z = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g, A = /^-ms-/, B = /-([\da-z])/gi, C = function(a, b) {
        return (b + "").toUpperCase();
    }, D = function() {
        e.addEventListener ? (e.removeEventListener("DOMContentLoaded", D, !1), p.ready()) : "complete" === e.readyState && (e.detachEvent("onreadystatechange", D), 
        p.ready());
    }, E = {};
    p.fn = p.prototype = {
        constructor: p,
        init: function(a, c, d) {
            var f, g, h, i;
            if (!a) return this;
            if (a.nodeType) return this.context = this[0] = a, this.length = 1, this;
            if ("string" == typeof a) {
                "<" === a.charAt(0) && ">" === a.charAt(a.length - 1) && a.length >= 3 ? f = [ null, a, null ] : f = u.exec(a);
                if (f && (f[1] || !c)) {
                    if (f[1]) return c = c instanceof p ? c[0] : c, i = c && c.nodeType ? c.ownerDocument || c : e, 
                    a = p.parseHTML(f[1], i, !0), v.test(f[1]) && p.isPlainObject(c) && this.attr.call(a, c, !0), 
                    p.merge(this, a);
                    g = e.getElementById(f[2]);
                    if (g && g.parentNode) {
                        if (g.id !== f[2]) return d.find(a);
                        this.length = 1, this[0] = g;
                    }
                    return this.context = e, this.selector = a, this;
                }
                return !c || c.jquery ? (c || d).find(a) : this.constructor(c).find(a);
            }
            return p.isFunction(a) ? d.ready(a) : (a.selector !== b && (this.selector = a.selector, 
            this.context = a.context), p.makeArray(a, this));
        },
        selector: "",
        jquery: "1.8.2",
        length: 0,
        size: function() {
            return this.length;
        },
        toArray: function() {
            return k.call(this);
        },
        get: function(a) {
            return null == a ? this.toArray() : a < 0 ? this[this.length + a] : this[a];
        },
        pushStack: function(a, b, c) {
            var d = p.merge(this.constructor(), a);
            return d.prevObject = this, d.context = this.context, "find" === b ? d.selector = this.selector + (this.selector ? " " : "") + c : b && (d.selector = this.selector + "." + b + "(" + c + ")"), 
            d;
        },
        each: function(a, b) {
            return p.each(this, a, b);
        },
        ready: function(a) {
            return p.ready.promise().done(a), this;
        },
        eq: function(a) {
            return a = +a, a === -1 ? this.slice(a) : this.slice(a, a + 1);
        },
        first: function() {
            return this.eq(0);
        },
        last: function() {
            return this.eq(-1);
        },
        slice: function() {
            return this.pushStack(k.apply(this, arguments), "slice", k.call(arguments).join(","));
        },
        map: function(a) {
            return this.pushStack(p.map(this, function(b, c) {
                return a.call(b, c, b);
            }));
        },
        end: function() {
            return this.prevObject || this.constructor(null);
        },
        push: j,
        sort: [].sort,
        splice: [].splice
    }, p.fn.init.prototype = p.fn, p.extend = p.fn.extend = function() {
        var a, c, d, e, f, g, h = arguments[0] || {}, i = 1, j = arguments.length, k = !1;
        "boolean" == typeof h && (k = h, h = arguments[1] || {}, i = 2), "object" != typeof h && !p.isFunction(h) && (h = {}), 
        j === i && (h = this, --i);
        for (;i < j; i++) if (null != (a = arguments[i])) for (c in a) {
            d = h[c], e = a[c];
            if (h === e) continue;
            k && e && (p.isPlainObject(e) || (f = p.isArray(e))) ? (f ? (f = !1, g = d && p.isArray(d) ? d : []) : g = d && p.isPlainObject(d) ? d : {}, 
            h[c] = p.extend(k, g, e)) : e !== b && (h[c] = e);
        }
        return h;
    }, p.extend({
        noConflict: function(b) {
            return a.$ === p && (a.$ = i), b && a.jQuery === p && (a.jQuery = h), p;
        },
        isReady: !1,
        readyWait: 1,
        holdReady: function(a) {
            a ? p.readyWait++ : p.ready(!0);
        },
        ready: function(a) {
            if (a === !0 ? --p.readyWait : p.isReady) return;
            if (!e.body) return setTimeout(p.ready, 1);
            p.isReady = !0;
            if (a !== !0 && --p.readyWait > 0) return;
            d.resolveWith(e, [ p ]), p.fn.trigger && p(e).trigger("ready").off("ready");
        },
        isFunction: function(a) {
            return "function" === p.type(a);
        },
        isArray: Array.isArray || function(a) {
            return "array" === p.type(a);
        },
        isWindow: function(a) {
            return null != a && a == a.window;
        },
        isNumeric: function(a) {
            return !isNaN(parseFloat(a)) && isFinite(a);
        },
        type: function(a) {
            return null == a ? String(a) : E[m.call(a)] || "object";
        },
        isPlainObject: function(a) {
            if (!a || "object" !== p.type(a) || a.nodeType || p.isWindow(a)) return !1;
            try {
                if (a.constructor && !n.call(a, "constructor") && !n.call(a.constructor.prototype, "isPrototypeOf")) return !1;
            } catch (c) {
                return !1;
            }
            var d;
            for (d in a) ;
            return d === b || n.call(a, d);
        },
        isEmptyObject: function(a) {
            var b;
            for (b in a) return !1;
            return !0;
        },
        error: function(a) {
            throw new Error(a);
        },
        parseHTML: function(a, b, c) {
            var d;
            return !a || "string" != typeof a ? null : ("boolean" == typeof b && (c = b, b = 0), 
            b = b || e, (d = v.exec(a)) ? [ b.createElement(d[1]) ] : (d = p.buildFragment([ a ], b, c ? null : []), 
            p.merge([], (d.cacheable ? p.clone(d.fragment) : d.fragment).childNodes)));
        },
        parseJSON: function(b) {
            if (!b || "string" != typeof b) return null;
            b = p.trim(b);
            if (a.JSON && a.JSON.parse) return a.JSON.parse(b);
            if (w.test(b.replace(y, "@").replace(z, "]").replace(x, ""))) return new Function("return " + b)();
            p.error("Invalid JSON: " + b);
        },
        parseXML: function(c) {
            var d, e;
            if (!c || "string" != typeof c) return null;
            try {
                a.DOMParser ? (e = new DOMParser(), d = e.parseFromString(c, "text/xml")) : (d = new ActiveXObject("Microsoft.XMLDOM"), 
                d.async = "false", d.loadXML(c));
            } catch (f) {
                d = b;
            }
            return (!d || !d.documentElement || d.getElementsByTagName("parsererror").length) && p.error("Invalid XML: " + c), 
            d;
        },
        noop: function() {},
        globalEval: function(b) {
            b && r.test(b) && (a.execScript || function(b) {
                a.eval.call(a, b);
            })(b);
        },
        camelCase: function(a) {
            return a.replace(A, "ms-").replace(B, C);
        },
        nodeName: function(a, b) {
            return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase();
        },
        each: function(a, c, d) {
            var e, f = 0, g = a.length, h = g === b || p.isFunction(a);
            if (d) {
                if (h) {
                    for (e in a) if (c.apply(a[e], d) === !1) break;
                } else for (;f < g; ) if (c.apply(a[f++], d) === !1) break;
            } else if (h) {
                for (e in a) if (c.call(a[e], e, a[e]) === !1) break;
            } else for (;f < g; ) if (c.call(a[f], f, a[f++]) === !1) break;
            return a;
        },
        trim: o && !o.call(" ") ? function(a) {
            return null == a ? "" : o.call(a);
        } : function(a) {
            return null == a ? "" : (a + "").replace(t, "");
        },
        makeArray: function(a, b) {
            var c, d = b || [];
            return null != a && (c = p.type(a), null == a.length || "string" === c || "function" === c || "regexp" === c || p.isWindow(a) ? j.call(d, a) : p.merge(d, a)), 
            d;
        },
        inArray: function(a, b, c) {
            var d;
            if (b) {
                if (l) return l.call(b, a, c);
                d = b.length, c = c ? c < 0 ? Math.max(0, d + c) : c : 0;
                for (;c < d; c++) if (c in b && b[c] === a) return c;
            }
            return -1;
        },
        merge: function(a, c) {
            var d = c.length, e = a.length, f = 0;
            if ("number" == typeof d) for (;f < d; f++) a[e++] = c[f]; else while (c[f] !== b) a[e++] = c[f++];
            return a.length = e, a;
        },
        grep: function(a, b, c) {
            var d, e = [], f = 0, g = a.length;
            c = !!c;
            for (;f < g; f++) d = !!b(a[f], f), c !== d && e.push(a[f]);
            return e;
        },
        map: function(a, c, d) {
            var e, f, g = [], h = 0, i = a.length, j = a instanceof p || i !== b && "number" == typeof i && (i > 0 && a[0] && a[i - 1] || 0 === i || p.isArray(a));
            if (j) for (;h < i; h++) e = c(a[h], h, d), null != e && (g[g.length] = e); else for (f in a) e = c(a[f], f, d), 
            null != e && (g[g.length] = e);
            return g.concat.apply([], g);
        },
        guid: 1,
        proxy: function(a, c) {
            var d, e, f;
            return "string" == typeof c && (d = a[c], c = a, a = d), p.isFunction(a) ? (e = k.call(arguments, 2), 
            f = function() {
                return a.apply(c, e.concat(k.call(arguments)));
            }, f.guid = a.guid = a.guid || p.guid++, f) : b;
        },
        access: function(a, c, d, e, f, g, h) {
            var i, j = null == d, k = 0, l = a.length;
            if (d && "object" == typeof d) {
                for (k in d) p.access(a, c, k, d[k], 1, g, e);
                f = 1;
            } else if (e !== b) {
                i = h === b && p.isFunction(e), j && (i ? (i = c, c = function(a, b, c) {
                    return i.call(p(a), c);
                }) : (c.call(a, e), c = null));
                if (c) for (;k < l; k++) c(a[k], d, i ? e.call(a[k], k, c(a[k], d)) : e, h);
                f = 1;
            }
            return f ? a : j ? c.call(a) : l ? c(a[0], d) : g;
        },
        now: function() {
            return new Date().getTime();
        }
    }), p.ready.promise = function(b) {
        if (!d) {
            d = p.Deferred();
            if ("complete" === e.readyState) setTimeout(p.ready, 1); else if (e.addEventListener) e.addEventListener("DOMContentLoaded", D, !1), 
            a.addEventListener("load", p.ready, !1); else {
                e.attachEvent("onreadystatechange", D), a.attachEvent("onload", p.ready);
                var c = !1;
                try {
                    c = null == a.frameElement && e.documentElement;
                } catch (f) {}
                c && c.doScroll && function g() {
                    if (!p.isReady) {
                        try {
                            c.doScroll("left");
                        } catch (a) {
                            return setTimeout(g, 50);
                        }
                        p.ready();
                    }
                }();
            }
        }
        return d.promise(b);
    }, p.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(a, b) {
        E["[object " + b + "]"] = b.toLowerCase();
    }), c = p(e);
    var F = {};
    p.Callbacks = function(a) {
        a = "string" == typeof a ? F[a] || G(a) : p.extend({}, a);
        var c, d, e, f, g, h, i = [], j = !a.once && [], k = function(b) {
            c = a.memory && b, d = !0, h = f || 0, f = 0, g = i.length, e = !0;
            for (;i && h < g; h++) if (i[h].apply(b[0], b[1]) === !1 && a.stopOnFalse) {
                c = !1;
                break;
            }
            e = !1, i && (j ? j.length && k(j.shift()) : c ? i = [] : l.disable());
        }, l = {
            add: function() {
                if (i) {
                    var b = i.length;
                    !function d(b) {
                        p.each(b, function(b, c) {
                            var e = p.type(c);
                            "function" === e && (!a.unique || !l.has(c)) ? i.push(c) : c && c.length && "string" !== e && d(c);
                        });
                    }(arguments), e ? g = i.length : c && (f = b, k(c));
                }
                return this;
            },
            remove: function() {
                return i && p.each(arguments, function(a, b) {
                    var c;
                    while ((c = p.inArray(b, i, c)) > -1) i.splice(c, 1), e && (c <= g && g--, c <= h && h--);
                }), this;
            },
            has: function(a) {
                return p.inArray(a, i) > -1;
            },
            empty: function() {
                return i = [], this;
            },
            disable: function() {
                return i = j = c = b, this;
            },
            disabled: function() {
                return !i;
            },
            lock: function() {
                return j = b, c || l.disable(), this;
            },
            locked: function() {
                return !j;
            },
            fireWith: function(a, b) {
                return b = b || [], b = [ a, b.slice ? b.slice() : b ], i && (!d || j) && (e ? j.push(b) : k(b)), 
                this;
            },
            fire: function() {
                return l.fireWith(this, arguments), this;
            },
            fired: function() {
                return !!d;
            }
        };
        return l;
    }, p.extend({
        Deferred: function(a) {
            var b = [ [ "resolve", "done", p.Callbacks("once memory"), "resolved" ], [ "reject", "fail", p.Callbacks("once memory"), "rejected" ], [ "notify", "progress", p.Callbacks("memory") ] ], c = "pending", d = {
                state: function() {
                    return c;
                },
                always: function() {
                    return e.done(arguments).fail(arguments), this;
                },
                then: function() {
                    var a = arguments;
                    return p.Deferred(function(c) {
                        p.each(b, function(b, d) {
                            var f = d[0], g = a[b];
                            e[d[1]](p.isFunction(g) ? function() {
                                var a = g.apply(this, arguments);
                                a && p.isFunction(a.promise) ? a.promise().done(c.resolve).fail(c.reject).progress(c.notify) : c[f + "With"](this === e ? c : this, [ a ]);
                            } : c[f]);
                        }), a = null;
                    }).promise();
                },
                promise: function(a) {
                    return null != a ? p.extend(a, d) : d;
                }
            }, e = {};
            return d.pipe = d.then, p.each(b, function(a, f) {
                var g = f[2], h = f[3];
                d[f[1]] = g.add, h && g.add(function() {
                    c = h;
                }, b[1 ^ a][2].disable, b[2][2].lock), e[f[0]] = g.fire, e[f[0] + "With"] = g.fireWith;
            }), d.promise(e), a && a.call(e, e), e;
        },
        when: function(a) {
            var b = 0, c = k.call(arguments), d = c.length, e = 1 !== d || a && p.isFunction(a.promise) ? d : 0, f = 1 === e ? a : p.Deferred(), g = function(a, b, c) {
                return function(d) {
                    b[a] = this, c[a] = arguments.length > 1 ? k.call(arguments) : d, c === h ? f.notifyWith(b, c) : --e || f.resolveWith(b, c);
                };
            }, h, i, j;
            if (d > 1) {
                h = new Array(d), i = new Array(d), j = new Array(d);
                for (;b < d; b++) c[b] && p.isFunction(c[b].promise) ? c[b].promise().done(g(b, j, c)).fail(f.reject).progress(g(b, i, h)) : --e;
            }
            return e || f.resolveWith(j, c), f.promise();
        }
    }), p.support = function() {
        var b, c, d, f, g, h, i, j, k, l, m, n = e.createElement("div");
        n.setAttribute("className", "t"), n.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", 
        c = n.getElementsByTagName("*"), d = n.getElementsByTagName("a")[0], d.style.cssText = "top:1px;float:left;opacity:.5";
        if (!c || !c.length) return {};
        f = e.createElement("select"), g = f.appendChild(e.createElement("option")), h = n.getElementsByTagName("input")[0], 
        b = {
            leadingWhitespace: 3 === n.firstChild.nodeType,
            tbody: !n.getElementsByTagName("tbody").length,
            htmlSerialize: !!n.getElementsByTagName("link").length,
            style: /top/.test(d.getAttribute("style")),
            hrefNormalized: "/a" === d.getAttribute("href"),
            opacity: /^0.5/.test(d.style.opacity),
            cssFloat: !!d.style.cssFloat,
            checkOn: "on" === h.value,
            optSelected: g.selected,
            getSetAttribute: "t" !== n.className,
            enctype: !!e.createElement("form").enctype,
            html5Clone: "<:nav></:nav>" !== e.createElement("nav").cloneNode(!0).outerHTML,
            boxModel: "CSS1Compat" === e.compatMode,
            submitBubbles: !0,
            changeBubbles: !0,
            focusinBubbles: !1,
            deleteExpando: !0,
            noCloneEvent: !0,
            inlineBlockNeedsLayout: !1,
            shrinkWrapBlocks: !1,
            reliableMarginRight: !0,
            boxSizingReliable: !0,
            pixelPosition: !1
        }, h.checked = !0, b.noCloneChecked = h.cloneNode(!0).checked, f.disabled = !0, 
        b.optDisabled = !g.disabled;
        try {
            delete n.test;
        } catch (o) {
            b.deleteExpando = !1;
        }
        !n.addEventListener && n.attachEvent && n.fireEvent && (n.attachEvent("onclick", m = function() {
            b.noCloneEvent = !1;
        }), n.cloneNode(!0).fireEvent("onclick"), n.detachEvent("onclick", m)), h = e.createElement("input"), 
        h.value = "t", h.setAttribute("type", "radio"), b.radioValue = "t" === h.value, 
        h.setAttribute("checked", "checked"), h.setAttribute("name", "t"), n.appendChild(h), 
        i = e.createDocumentFragment(), i.appendChild(n.lastChild), b.checkClone = i.cloneNode(!0).cloneNode(!0).lastChild.checked, 
        b.appendChecked = h.checked, i.removeChild(h), i.appendChild(n);
        if (n.attachEvent) for (k in {
            submit: !0,
            change: !0,
            focusin: !0
        }) j = "on" + k, l = j in n, l || (n.setAttribute(j, "return;"), l = "function" == typeof n[j]), 
        b[k + "Bubbles"] = l;
        return p(function() {
            var c, d, f, g, h = "padding:0;margin:0;border:0;display:block;overflow:hidden;", i = e.getElementsByTagName("body")[0];
            if (!i) return;
            c = e.createElement("div"), c.style.cssText = "visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px", 
            i.insertBefore(c, i.firstChild), d = e.createElement("div"), c.appendChild(d), d.innerHTML = "<table><tr><td></td><td>t</td></tr></table>", 
            f = d.getElementsByTagName("td"), f[0].style.cssText = "padding:0;margin:0;border:0;display:none", 
            l = 0 === f[0].offsetHeight, f[0].style.display = "", f[1].style.display = "none", 
            b.reliableHiddenOffsets = l && 0 === f[0].offsetHeight, d.innerHTML = "", d.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;", 
            b.boxSizing = 4 === d.offsetWidth, b.doesNotIncludeMarginInBodyOffset = 1 !== i.offsetTop, 
            a.getComputedStyle && (b.pixelPosition = "1%" !== (a.getComputedStyle(d, null) || {}).top, 
            b.boxSizingReliable = "4px" === (a.getComputedStyle(d, null) || {
                width: "4px"
            }).width, g = e.createElement("div"), g.style.cssText = d.style.cssText = h, g.style.marginRight = g.style.width = "0", 
            d.style.width = "1px", d.appendChild(g), b.reliableMarginRight = !parseFloat((a.getComputedStyle(g, null) || {}).marginRight)), 
            "undefined" != typeof d.style.zoom && (d.innerHTML = "", d.style.cssText = h + "width:1px;padding:1px;display:inline;zoom:1", 
            b.inlineBlockNeedsLayout = 3 === d.offsetWidth, d.style.display = "block", d.style.overflow = "visible", 
            d.innerHTML = "<div></div>", d.firstChild.style.width = "5px", b.shrinkWrapBlocks = 3 !== d.offsetWidth, 
            c.style.zoom = 1), i.removeChild(c), c = d = f = g = null;
        }), i.removeChild(n), c = d = f = g = h = i = n = null, b;
    }();
    var H = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/, I = /([A-Z])/g;
    p.extend({
        cache: {},
        deletedIds: [],
        uuid: 0,
        expando: "jQuery" + (p.fn.jquery + Math.random()).replace(/\D/g, ""),
        noData: {
            embed: !0,
            object: "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
            applet: !0
        },
        hasData: function(a) {
            return a = a.nodeType ? p.cache[a[p.expando]] : a[p.expando], !!a && !K(a);
        },
        data: function(a, c, d, e) {
            if (!p.acceptData(a)) return;
            var f, g, h = p.expando, i = "string" == typeof c, j = a.nodeType, k = j ? p.cache : a, l = j ? a[h] : a[h] && h;
            if ((!l || !k[l] || !e && !k[l].data) && i && d === b) return;
            l || (j ? a[h] = l = p.deletedIds.pop() || p.guid++ : l = h), k[l] || (k[l] = {}, 
            j || (k[l].toJSON = p.noop));
            if ("object" == typeof c || "function" == typeof c) e ? k[l] = p.extend(k[l], c) : k[l].data = p.extend(k[l].data, c);
            return f = k[l], e || (f.data || (f.data = {}), f = f.data), d !== b && (f[p.camelCase(c)] = d), 
            i ? (g = f[c], null == g && (g = f[p.camelCase(c)])) : g = f, g;
        },
        removeData: function(a, b, c) {
            if (!p.acceptData(a)) return;
            var d, e, f, g = a.nodeType, h = g ? p.cache : a, i = g ? a[p.expando] : p.expando;
            if (!h[i]) return;
            if (b) {
                d = c ? h[i] : h[i].data;
                if (d) {
                    p.isArray(b) || (b in d ? b = [ b ] : (b = p.camelCase(b), b in d ? b = [ b ] : b = b.split(" ")));
                    for (e = 0, f = b.length; e < f; e++) delete d[b[e]];
                    if (!(c ? K : p.isEmptyObject)(d)) return;
                }
            }
            if (!c) {
                delete h[i].data;
                if (!K(h[i])) return;
            }
            g ? p.cleanData([ a ], !0) : p.support.deleteExpando || h != h.window ? delete h[i] : h[i] = null;
        },
        _data: function(a, b, c) {
            return p.data(a, b, c, !0);
        },
        acceptData: function(a) {
            var b = a.nodeName && p.noData[a.nodeName.toLowerCase()];
            return !b || b !== !0 && a.getAttribute("classid") === b;
        }
    }), p.fn.extend({
        data: function(a, c) {
            var d, e, f, g, h, i = this[0], j = 0, k = null;
            if (a === b) {
                if (this.length) {
                    k = p.data(i);
                    if (1 === i.nodeType && !p._data(i, "parsedAttrs")) {
                        f = i.attributes;
                        for (h = f.length; j < h; j++) g = f[j].name, g.indexOf("data-") || (g = p.camelCase(g.substring(5)), 
                        J(i, g, k[g]));
                        p._data(i, "parsedAttrs", !0);
                    }
                }
                return k;
            }
            return "object" == typeof a ? this.each(function() {
                p.data(this, a);
            }) : (d = a.split(".", 2), d[1] = d[1] ? "." + d[1] : "", e = d[1] + "!", p.access(this, function(c) {
                if (c === b) return k = this.triggerHandler("getData" + e, [ d[0] ]), k === b && i && (k = p.data(i, a), 
                k = J(i, a, k)), k === b && d[1] ? this.data(d[0]) : k;
                d[1] = c, this.each(function() {
                    var b = p(this);
                    b.triggerHandler("setData" + e, d), p.data(this, a, c), b.triggerHandler("changeData" + e, d);
                });
            }, null, c, arguments.length > 1, null, !1));
        },
        removeData: function(a) {
            return this.each(function() {
                p.removeData(this, a);
            });
        }
    }), p.extend({
        queue: function(a, b, c) {
            var d;
            if (a) return b = (b || "fx") + "queue", d = p._data(a, b), c && (!d || p.isArray(c) ? d = p._data(a, b, p.makeArray(c)) : d.push(c)), 
            d || [];
        },
        dequeue: function(a, b) {
            b = b || "fx";
            var c = p.queue(a, b), d = c.length, e = c.shift(), f = p._queueHooks(a, b), g = function() {
                p.dequeue(a, b);
            };
            "inprogress" === e && (e = c.shift(), d--), e && ("fx" === b && c.unshift("inprogress"), 
            delete f.stop, e.call(a, g, f)), !d && f && f.empty.fire();
        },
        _queueHooks: function(a, b) {
            var c = b + "queueHooks";
            return p._data(a, c) || p._data(a, c, {
                empty: p.Callbacks("once memory").add(function() {
                    p.removeData(a, b + "queue", !0), p.removeData(a, c, !0);
                })
            });
        }
    }), p.fn.extend({
        queue: function(a, c) {
            var d = 2;
            return "string" != typeof a && (c = a, a = "fx", d--), arguments.length < d ? p.queue(this[0], a) : c === b ? this : this.each(function() {
                var b = p.queue(this, a, c);
                p._queueHooks(this, a), "fx" === a && "inprogress" !== b[0] && p.dequeue(this, a);
            });
        },
        dequeue: function(a) {
            return this.each(function() {
                p.dequeue(this, a);
            });
        },
        delay: function(a, b) {
            return a = p.fx ? p.fx.speeds[a] || a : a, b = b || "fx", this.queue(b, function(b, c) {
                var d = setTimeout(b, a);
                c.stop = function() {
                    clearTimeout(d);
                };
            });
        },
        clearQueue: function(a) {
            return this.queue(a || "fx", []);
        },
        promise: function(a, c) {
            var d, e = 1, f = p.Deferred(), g = this, h = this.length, i = function() {
                --e || f.resolveWith(g, [ g ]);
            };
            "string" != typeof a && (c = a, a = b), a = a || "fx";
            while (h--) d = p._data(g[h], a + "queueHooks"), d && d.empty && (e++, d.empty.add(i));
            return i(), f.promise(c);
        }
    });
    var L, M, N, O = /[\t\r\n]/g, P = /\r/g, Q = /^(?:button|input)$/i, R = /^(?:button|input|object|select|textarea)$/i, S = /^a(?:rea|)$/i, T = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i, U = p.support.getSetAttribute;
    p.fn.extend({
        attr: function(a, b) {
            return p.access(this, p.attr, a, b, arguments.length > 1);
        },
        removeAttr: function(a) {
            return this.each(function() {
                p.removeAttr(this, a);
            });
        },
        prop: function(a, b) {
            return p.access(this, p.prop, a, b, arguments.length > 1);
        },
        removeProp: function(a) {
            return a = p.propFix[a] || a, this.each(function() {
                try {
                    this[a] = b, delete this[a];
                } catch (c) {}
            });
        },
        addClass: function(a) {
            var b, c, d, e, f, g, h;
            if (p.isFunction(a)) return this.each(function(b) {
                p(this).addClass(a.call(this, b, this.className));
            });
            if (a && "string" == typeof a) {
                b = a.split(s);
                for (c = 0, d = this.length; c < d; c++) {
                    e = this[c];
                    if (1 === e.nodeType) if (!e.className && 1 === b.length) e.className = a; else {
                        f = " " + e.className + " ";
                        for (g = 0, h = b.length; g < h; g++) f.indexOf(" " + b[g] + " ") < 0 && (f += b[g] + " ");
                        e.className = p.trim(f);
                    }
                }
            }
            return this;
        },
        removeClass: function(a) {
            var c, d, e, f, g, h, i;
            if (p.isFunction(a)) return this.each(function(b) {
                p(this).removeClass(a.call(this, b, this.className));
            });
            if (a && "string" == typeof a || a === b) {
                c = (a || "").split(s);
                for (h = 0, i = this.length; h < i; h++) {
                    e = this[h];
                    if (1 === e.nodeType && e.className) {
                        d = (" " + e.className + " ").replace(O, " ");
                        for (f = 0, g = c.length; f < g; f++) while (d.indexOf(" " + c[f] + " ") >= 0) d = d.replace(" " + c[f] + " ", " ");
                        e.className = a ? p.trim(d) : "";
                    }
                }
            }
            return this;
        },
        toggleClass: function(a, b) {
            var c = typeof a, d = "boolean" == typeof b;
            return p.isFunction(a) ? this.each(function(c) {
                p(this).toggleClass(a.call(this, c, this.className, b), b);
            }) : this.each(function() {
                if ("string" === c) {
                    var e, f = 0, g = p(this), h = b, i = a.split(s);
                    while (e = i[f++]) h = d ? h : !g.hasClass(e), g[h ? "addClass" : "removeClass"](e);
                } else if ("undefined" === c || "boolean" === c) this.className && p._data(this, "__className__", this.className), 
                this.className = this.className || a === !1 ? "" : p._data(this, "__className__") || "";
            });
        },
        hasClass: function(a) {
            var b = " " + a + " ", c = 0, d = this.length;
            for (;c < d; c++) if (1 === this[c].nodeType && (" " + this[c].className + " ").replace(O, " ").indexOf(b) >= 0) return !0;
            return !1;
        },
        val: function(a) {
            var c, d, e, f = this[0];
            if (!arguments.length) {
                if (f) return c = p.valHooks[f.type] || p.valHooks[f.nodeName.toLowerCase()], c && "get" in c && (d = c.get(f, "value")) !== b ? d : (d = f.value, 
                "string" == typeof d ? d.replace(P, "") : null == d ? "" : d);
                return;
            }
            return e = p.isFunction(a), this.each(function(d) {
                var f, g = p(this);
                if (1 !== this.nodeType) return;
                e ? f = a.call(this, d, g.val()) : f = a, null == f ? f = "" : "number" == typeof f ? f += "" : p.isArray(f) && (f = p.map(f, function(a) {
                    return null == a ? "" : a + "";
                })), c = p.valHooks[this.type] || p.valHooks[this.nodeName.toLowerCase()];
                if (!c || !("set" in c) || c.set(this, f, "value") === b) this.value = f;
            });
        }
    }), p.extend({
        valHooks: {
            option: {
                get: function(a) {
                    var b = a.attributes.value;
                    return !b || b.specified ? a.value : a.text;
                }
            },
            select: {
                get: function(a) {
                    var b, c, d, e, f = a.selectedIndex, g = [], h = a.options, i = "select-one" === a.type;
                    if (f < 0) return null;
                    c = i ? f : 0, d = i ? f + 1 : h.length;
                    for (;c < d; c++) {
                        e = h[c];
                        if (e.selected && (p.support.optDisabled ? !e.disabled : null === e.getAttribute("disabled")) && (!e.parentNode.disabled || !p.nodeName(e.parentNode, "optgroup"))) {
                            b = p(e).val();
                            if (i) return b;
                            g.push(b);
                        }
                    }
                    return i && !g.length && h.length ? p(h[f]).val() : g;
                },
                set: function(a, b) {
                    var c = p.makeArray(b);
                    return p(a).find("option").each(function() {
                        this.selected = p.inArray(p(this).val(), c) >= 0;
                    }), c.length || (a.selectedIndex = -1), c;
                }
            }
        },
        attrFn: {},
        attr: function(a, c, d, e) {
            var f, g, h, i = a.nodeType;
            if (!a || 3 === i || 8 === i || 2 === i) return;
            if (e && p.isFunction(p.fn[c])) return p(a)[c](d);
            if ("undefined" == typeof a.getAttribute) return p.prop(a, c, d);
            h = 1 !== i || !p.isXMLDoc(a), h && (c = c.toLowerCase(), g = p.attrHooks[c] || (T.test(c) ? M : L));
            if (d !== b) {
                if (null === d) {
                    p.removeAttr(a, c);
                    return;
                }
                return g && "set" in g && h && (f = g.set(a, d, c)) !== b ? f : (a.setAttribute(c, d + ""), 
                d);
            }
            return g && "get" in g && h && null !== (f = g.get(a, c)) ? f : (f = a.getAttribute(c), 
            null === f ? b : f);
        },
        removeAttr: function(a, b) {
            var c, d, e, f, g = 0;
            if (b && 1 === a.nodeType) {
                d = b.split(s);
                for (;g < d.length; g++) e = d[g], e && (c = p.propFix[e] || e, f = T.test(e), f || p.attr(a, e, ""), 
                a.removeAttribute(U ? e : c), f && c in a && (a[c] = !1));
            }
        },
        attrHooks: {
            type: {
                set: function(a, b) {
                    if (Q.test(a.nodeName) && a.parentNode) p.error("type property can't be changed"); else if (!p.support.radioValue && "radio" === b && p.nodeName(a, "input")) {
                        var c = a.value;
                        return a.setAttribute("type", b), c && (a.value = c), b;
                    }
                }
            },
            value: {
                get: function(a, b) {
                    return L && p.nodeName(a, "button") ? L.get(a, b) : b in a ? a.value : null;
                },
                set: function(a, b, c) {
                    if (L && p.nodeName(a, "button")) return L.set(a, b, c);
                    a.value = b;
                }
            }
        },
        propFix: {
            tabindex: "tabIndex",
            readonly: "readOnly",
            "for": "htmlFor",
            "class": "className",
            maxlength: "maxLength",
            cellspacing: "cellSpacing",
            cellpadding: "cellPadding",
            rowspan: "rowSpan",
            colspan: "colSpan",
            usemap: "useMap",
            frameborder: "frameBorder",
            contenteditable: "contentEditable"
        },
        prop: function(a, c, d) {
            var e, f, g, h = a.nodeType;
            if (!a || 3 === h || 8 === h || 2 === h) return;
            return g = 1 !== h || !p.isXMLDoc(a), g && (c = p.propFix[c] || c, f = p.propHooks[c]), 
            d !== b ? f && "set" in f && (e = f.set(a, d, c)) !== b ? e : a[c] = d : f && "get" in f && null !== (e = f.get(a, c)) ? e : a[c];
        },
        propHooks: {
            tabIndex: {
                get: function(a) {
                    var c = a.getAttributeNode("tabindex");
                    return c && c.specified ? parseInt(c.value, 10) : R.test(a.nodeName) || S.test(a.nodeName) && a.href ? 0 : b;
                }
            }
        }
    }), M = {
        get: function(a, c) {
            var d, e = p.prop(a, c);
            return e === !0 || "boolean" != typeof e && (d = a.getAttributeNode(c)) && d.nodeValue !== !1 ? c.toLowerCase() : b;
        },
        set: function(a, b, c) {
            var d;
            return b === !1 ? p.removeAttr(a, c) : (d = p.propFix[c] || c, d in a && (a[d] = !0), 
            a.setAttribute(c, c.toLowerCase())), c;
        }
    }, U || (N = {
        name: !0,
        id: !0,
        coords: !0
    }, L = p.valHooks.button = {
        get: function(a, c) {
            var d;
            return d = a.getAttributeNode(c), d && (N[c] ? "" !== d.value : d.specified) ? d.value : b;
        },
        set: function(a, b, c) {
            var d = a.getAttributeNode(c);
            return d || (d = e.createAttribute(c), a.setAttributeNode(d)), d.value = b + "";
        }
    }, p.each([ "width", "height" ], function(a, b) {
        p.attrHooks[b] = p.extend(p.attrHooks[b], {
            set: function(a, c) {
                if ("" === c) return a.setAttribute(b, "auto"), c;
            }
        });
    }), p.attrHooks.contenteditable = {
        get: L.get,
        set: function(a, b, c) {
            "" === b && (b = "false"), L.set(a, b, c);
        }
    }), p.support.hrefNormalized || p.each([ "href", "src", "width", "height" ], function(a, c) {
        p.attrHooks[c] = p.extend(p.attrHooks[c], {
            get: function(a) {
                var d = a.getAttribute(c, 2);
                return null === d ? b : d;
            }
        });
    }), p.support.style || (p.attrHooks.style = {
        get: function(a) {
            return a.style.cssText.toLowerCase() || b;
        },
        set: function(a, b) {
            return a.style.cssText = b + "";
        }
    }), p.support.optSelected || (p.propHooks.selected = p.extend(p.propHooks.selected, {
        get: function(a) {
            var b = a.parentNode;
            return b && (b.selectedIndex, b.parentNode && b.parentNode.selectedIndex), null;
        }
    })), p.support.enctype || (p.propFix.enctype = "encoding"), p.support.checkOn || p.each([ "radio", "checkbox" ], function() {
        p.valHooks[this] = {
            get: function(a) {
                return null === a.getAttribute("value") ? "on" : a.value;
            }
        };
    }), p.each([ "radio", "checkbox" ], function() {
        p.valHooks[this] = p.extend(p.valHooks[this], {
            set: function(a, b) {
                if (p.isArray(b)) return a.checked = p.inArray(p(a).val(), b) >= 0;
            }
        });
    });
    var V = /^(?:textarea|input|select)$/i, W = /^([^\.]*|)(?:\.(.+)|)$/, X = /(?:^|\s)hover(\.\S+|)\b/, Y = /^key/, Z = /^(?:mouse|contextmenu)|click/, $ = /^(?:focusinfocus|focusoutblur)$/, _ = function(a) {
        return p.event.special.hover ? a : a.replace(X, "mouseenter$1 mouseleave$1");
    };
    p.event = {
        add: function(a, c, d, e, f) {
            var g, h, i, j, k, l, m, n, o, q, r;
            if (3 === a.nodeType || 8 === a.nodeType || !c || !d || !(g = p._data(a))) return;
            d.handler && (o = d, d = o.handler, f = o.selector), d.guid || (d.guid = p.guid++), 
            i = g.events, i || (g.events = i = {}), h = g.handle, h || (g.handle = h = function(a) {
                return "undefined" != typeof p && (!a || p.event.triggered !== a.type) ? p.event.dispatch.apply(h.elem, arguments) : b;
            }, h.elem = a), c = p.trim(_(c)).split(" ");
            for (j = 0; j < c.length; j++) {
                k = W.exec(c[j]) || [], l = k[1], m = (k[2] || "").split(".").sort(), r = p.event.special[l] || {}, 
                l = (f ? r.delegateType : r.bindType) || l, r = p.event.special[l] || {}, n = p.extend({
                    type: l,
                    origType: k[1],
                    data: e,
                    handler: d,
                    guid: d.guid,
                    selector: f,
                    needsContext: f && p.expr.match.needsContext.test(f),
                    namespace: m.join(".")
                }, o), q = i[l];
                if (!q) {
                    q = i[l] = [], q.delegateCount = 0;
                    if (!r.setup || r.setup.call(a, e, m, h) === !1) a.addEventListener ? a.addEventListener(l, h, !1) : a.attachEvent && a.attachEvent("on" + l, h);
                }
                r.add && (r.add.call(a, n), n.handler.guid || (n.handler.guid = d.guid)), f ? q.splice(q.delegateCount++, 0, n) : q.push(n), 
                p.event.global[l] = !0;
            }
            a = null;
        },
        global: {},
        remove: function(a, b, c, d, e) {
            var f, g, h, i, j, k, l, m, n, o, q, r = p.hasData(a) && p._data(a);
            if (!r || !(m = r.events)) return;
            b = p.trim(_(b || "")).split(" ");
            for (f = 0; f < b.length; f++) {
                g = W.exec(b[f]) || [], h = i = g[1], j = g[2];
                if (!h) {
                    for (h in m) p.event.remove(a, h + b[f], c, d, !0);
                    continue;
                }
                n = p.event.special[h] || {}, h = (d ? n.delegateType : n.bindType) || h, o = m[h] || [], 
                k = o.length, j = j ? new RegExp("(^|\\.)" + j.split(".").sort().join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
                for (l = 0; l < o.length; l++) q = o[l], (e || i === q.origType) && (!c || c.guid === q.guid) && (!j || j.test(q.namespace)) && (!d || d === q.selector || "**" === d && q.selector) && (o.splice(l--, 1), 
                q.selector && o.delegateCount--, n.remove && n.remove.call(a, q));
                0 === o.length && k !== o.length && ((!n.teardown || n.teardown.call(a, j, r.handle) === !1) && p.removeEvent(a, h, r.handle), 
                delete m[h]);
            }
            p.isEmptyObject(m) && (delete r.handle, p.removeData(a, "events", !0));
        },
        customEvent: {
            getData: !0,
            setData: !0,
            changeData: !0
        },
        trigger: function(c, d, f, g) {
            if (!f || 3 !== f.nodeType && 8 !== f.nodeType) {
                var h, i, j, k, l, m, n, o, q, r, s = c.type || c, t = [];
                if ($.test(s + p.event.triggered)) return;
                s.indexOf("!") >= 0 && (s = s.slice(0, -1), i = !0), s.indexOf(".") >= 0 && (t = s.split("."), 
                s = t.shift(), t.sort());
                if ((!f || p.event.customEvent[s]) && !p.event.global[s]) return;
                c = "object" == typeof c ? c[p.expando] ? c : new p.Event(s, c) : new p.Event(s), 
                c.type = s, c.isTrigger = !0, c.exclusive = i, c.namespace = t.join("."), c.namespace_re = c.namespace ? new RegExp("(^|\\.)" + t.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, 
                m = s.indexOf(":") < 0 ? "on" + s : "";
                if (!f) {
                    h = p.cache;
                    for (j in h) h[j].events && h[j].events[s] && p.event.trigger(c, d, h[j].handle.elem, !0);
                    return;
                }
                c.result = b, c.target || (c.target = f), d = null != d ? p.makeArray(d) : [], d.unshift(c), 
                n = p.event.special[s] || {};
                if (n.trigger && n.trigger.apply(f, d) === !1) return;
                q = [ [ f, n.bindType || s ] ];
                if (!g && !n.noBubble && !p.isWindow(f)) {
                    r = n.delegateType || s, k = $.test(r + s) ? f : f.parentNode;
                    for (l = f; k; k = k.parentNode) q.push([ k, r ]), l = k;
                    l === (f.ownerDocument || e) && q.push([ l.defaultView || l.parentWindow || a, r ]);
                }
                for (j = 0; j < q.length && !c.isPropagationStopped(); j++) k = q[j][0], c.type = q[j][1], 
                o = (p._data(k, "events") || {})[c.type] && p._data(k, "handle"), o && o.apply(k, d), 
                o = m && k[m], o && p.acceptData(k) && o.apply && o.apply(k, d) === !1 && c.preventDefault();
                return c.type = s, !g && !c.isDefaultPrevented() && (!n._default || n._default.apply(f.ownerDocument, d) === !1) && ("click" !== s || !p.nodeName(f, "a")) && p.acceptData(f) && m && f[s] && ("focus" !== s && "blur" !== s || 0 !== c.target.offsetWidth) && !p.isWindow(f) && (l = f[m], 
                l && (f[m] = null), p.event.triggered = s, f[s](), p.event.triggered = b, l && (f[m] = l)), 
                c.result;
            }
            return;
        },
        dispatch: function(c) {
            c = p.event.fix(c || a.event);
            var d, e, f, g, h, i, j, l, m, n, o = (p._data(this, "events") || {})[c.type] || [], q = o.delegateCount, r = k.call(arguments), s = !c.exclusive && !c.namespace, t = p.event.special[c.type] || {}, u = [];
            r[0] = c, c.delegateTarget = this;
            if (t.preDispatch && t.preDispatch.call(this, c) === !1) return;
            if (q && (!c.button || "click" !== c.type)) for (f = c.target; f != this; f = f.parentNode || this) if (f.disabled !== !0 || "click" !== c.type) {
                h = {}, j = [];
                for (d = 0; d < q; d++) l = o[d], m = l.selector, h[m] === b && (h[m] = l.needsContext ? p(m, this).index(f) >= 0 : p.find(m, this, null, [ f ]).length), 
                h[m] && j.push(l);
                j.length && u.push({
                    elem: f,
                    matches: j
                });
            }
            o.length > q && u.push({
                elem: this,
                matches: o.slice(q)
            });
            for (d = 0; d < u.length && !c.isPropagationStopped(); d++) {
                i = u[d], c.currentTarget = i.elem;
                for (e = 0; e < i.matches.length && !c.isImmediatePropagationStopped(); e++) {
                    l = i.matches[e];
                    if (s || !c.namespace && !l.namespace || c.namespace_re && c.namespace_re.test(l.namespace)) c.data = l.data, 
                    c.handleObj = l, g = ((p.event.special[l.origType] || {}).handle || l.handler).apply(i.elem, r), 
                    g !== b && (c.result = g, g === !1 && (c.preventDefault(), c.stopPropagation()));
                }
            }
            return t.postDispatch && t.postDispatch.call(this, c), c.result;
        },
        props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        fixHooks: {},
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function(a, b) {
                return null == a.which && (a.which = null != b.charCode ? b.charCode : b.keyCode), 
                a;
            }
        },
        mouseHooks: {
            props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function(a, c) {
                var d, f, g, h = c.button, i = c.fromElement;
                return null == a.pageX && null != c.clientX && (d = a.target.ownerDocument || e, 
                f = d.documentElement, g = d.body, a.pageX = c.clientX + (f && f.scrollLeft || g && g.scrollLeft || 0) - (f && f.clientLeft || g && g.clientLeft || 0), 
                a.pageY = c.clientY + (f && f.scrollTop || g && g.scrollTop || 0) - (f && f.clientTop || g && g.clientTop || 0)), 
                !a.relatedTarget && i && (a.relatedTarget = i === a.target ? c.toElement : i), !a.which && h !== b && (a.which = 1 & h ? 1 : 2 & h ? 3 : 4 & h ? 2 : 0), 
                a;
            }
        },
        fix: function(a) {
            if (a[p.expando]) return a;
            var b, c, d = a, f = p.event.fixHooks[a.type] || {}, g = f.props ? this.props.concat(f.props) : this.props;
            a = p.Event(d);
            for (b = g.length; b; ) c = g[--b], a[c] = d[c];
            return a.target || (a.target = d.srcElement || e), 3 === a.target.nodeType && (a.target = a.target.parentNode), 
            a.metaKey = !!a.metaKey, f.filter ? f.filter(a, d) : a;
        },
        special: {
            load: {
                noBubble: !0
            },
            focus: {
                delegateType: "focusin"
            },
            blur: {
                delegateType: "focusout"
            },
            beforeunload: {
                setup: function(a, b, c) {
                    p.isWindow(this) && (this.onbeforeunload = c);
                },
                teardown: function(a, b) {
                    this.onbeforeunload === b && (this.onbeforeunload = null);
                }
            }
        },
        simulate: function(a, b, c, d) {
            var e = p.extend(new p.Event(), c, {
                type: a,
                isSimulated: !0,
                originalEvent: {}
            });
            d ? p.event.trigger(e, null, b) : p.event.dispatch.call(b, e), e.isDefaultPrevented() && c.preventDefault();
        }
    }, p.event.handle = p.event.dispatch, p.removeEvent = e.removeEventListener ? function(a, b, c) {
        a.removeEventListener && a.removeEventListener(b, c, !1);
    } : function(a, b, c) {
        var d = "on" + b;
        a.detachEvent && ("undefined" == typeof a[d] && (a[d] = null), a.detachEvent(d, c));
    }, p.Event = function(a, b) {
        if (this instanceof p.Event) a && a.type ? (this.originalEvent = a, this.type = a.type, 
        this.isDefaultPrevented = a.defaultPrevented || a.returnValue === !1 || a.getPreventDefault && a.getPreventDefault() ? bb : ba) : this.type = a, 
        b && p.extend(this, b), this.timeStamp = a && a.timeStamp || p.now(), this[p.expando] = !0; else return new p.Event(a, b);
    }, p.Event.prototype = {
        preventDefault: function() {
            this.isDefaultPrevented = bb;
            var a = this.originalEvent;
            if (!a) return;
            a.preventDefault ? a.preventDefault() : a.returnValue = !1;
        },
        stopPropagation: function() {
            this.isPropagationStopped = bb;
            var a = this.originalEvent;
            if (!a) return;
            a.stopPropagation && a.stopPropagation(), a.cancelBubble = !0;
        },
        stopImmediatePropagation: function() {
            this.isImmediatePropagationStopped = bb, this.stopPropagation();
        },
        isDefaultPrevented: ba,
        isPropagationStopped: ba,
        isImmediatePropagationStopped: ba
    }, p.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function(a, b) {
        p.event.special[a] = {
            delegateType: b,
            bindType: b,
            handle: function(a) {
                var c, d = this, e = a.relatedTarget, f = a.handleObj, g = f.selector;
                if (!e || e !== d && !p.contains(d, e)) a.type = f.origType, c = f.handler.apply(this, arguments), 
                a.type = b;
                return c;
            }
        };
    }), p.support.submitBubbles || (p.event.special.submit = {
        setup: function() {
            if (p.nodeName(this, "form")) return !1;
            p.event.add(this, "click._submit keypress._submit", function(a) {
                var c = a.target, d = p.nodeName(c, "input") || p.nodeName(c, "button") ? c.form : b;
                d && !p._data(d, "_submit_attached") && (p.event.add(d, "submit._submit", function(a) {
                    a._submit_bubble = !0;
                }), p._data(d, "_submit_attached", !0));
            });
        },
        postDispatch: function(a) {
            a._submit_bubble && (delete a._submit_bubble, this.parentNode && !a.isTrigger && p.event.simulate("submit", this.parentNode, a, !0));
        },
        teardown: function() {
            if (p.nodeName(this, "form")) return !1;
            p.event.remove(this, "._submit");
        }
    }), p.support.changeBubbles || (p.event.special.change = {
        setup: function() {
            if (V.test(this.nodeName)) {
                if ("checkbox" === this.type || "radio" === this.type) p.event.add(this, "propertychange._change", function(a) {
                    "checked" === a.originalEvent.propertyName && (this._just_changed = !0);
                }), p.event.add(this, "click._change", function(a) {
                    this._just_changed && !a.isTrigger && (this._just_changed = !1), p.event.simulate("change", this, a, !0);
                });
                return !1;
            }
            p.event.add(this, "beforeactivate._change", function(a) {
                var b = a.target;
                V.test(b.nodeName) && !p._data(b, "_change_attached") && (p.event.add(b, "change._change", function(a) {
                    this.parentNode && !a.isSimulated && !a.isTrigger && p.event.simulate("change", this.parentNode, a, !0);
                }), p._data(b, "_change_attached", !0));
            });
        },
        handle: function(a) {
            var b = a.target;
            if (this !== b || a.isSimulated || a.isTrigger || "radio" !== b.type && "checkbox" !== b.type) return a.handleObj.handler.apply(this, arguments);
        },
        teardown: function() {
            return p.event.remove(this, "._change"), !V.test(this.nodeName);
        }
    }), p.support.focusinBubbles || p.each({
        focus: "focusin",
        blur: "focusout"
    }, function(a, b) {
        var c = 0, d = function(a) {
            p.event.simulate(b, a.target, p.event.fix(a), !0);
        };
        p.event.special[b] = {
            setup: function() {
                0 === c++ && e.addEventListener(a, d, !0);
            },
            teardown: function() {
                0 === --c && e.removeEventListener(a, d, !0);
            }
        };
    }), p.fn.extend({
        on: function(a, c, d, e, f) {
            var g, h;
            if ("object" == typeof a) {
                "string" != typeof c && (d = d || c, c = b);
                for (h in a) this.on(h, c, d, a[h], f);
                return this;
            }
            null == d && null == e ? (e = c, d = c = b) : null == e && ("string" == typeof c ? (e = d, 
            d = b) : (e = d, d = c, c = b));
            if (e === !1) e = ba; else if (!e) return this;
            return 1 === f && (g = e, e = function(a) {
                return p().off(a), g.apply(this, arguments);
            }, e.guid = g.guid || (g.guid = p.guid++)), this.each(function() {
                p.event.add(this, a, e, d, c);
            });
        },
        one: function(a, b, c, d) {
            return this.on(a, b, c, d, 1);
        },
        off: function(a, c, d) {
            var e, f;
            if (a && a.preventDefault && a.handleObj) return e = a.handleObj, p(a.delegateTarget).off(e.namespace ? e.origType + "." + e.namespace : e.origType, e.selector, e.handler), 
            this;
            if ("object" == typeof a) {
                for (f in a) this.off(f, c, a[f]);
                return this;
            }
            if (c === !1 || "function" == typeof c) d = c, c = b;
            return d === !1 && (d = ba), this.each(function() {
                p.event.remove(this, a, d, c);
            });
        },
        bind: function(a, b, c) {
            return this.on(a, null, b, c);
        },
        unbind: function(a, b) {
            return this.off(a, null, b);
        },
        live: function(a, b, c) {
            return p(this.context).on(a, this.selector, b, c), this;
        },
        die: function(a, b) {
            return p(this.context).off(a, this.selector || "**", b), this;
        },
        delegate: function(a, b, c, d) {
            return this.on(b, a, c, d);
        },
        undelegate: function(a, b, c) {
            return 1 === arguments.length ? this.off(a, "**") : this.off(b, a || "**", c);
        },
        trigger: function(a, b) {
            return this.each(function() {
                p.event.trigger(a, b, this);
            });
        },
        triggerHandler: function(a, b) {
            if (this[0]) return p.event.trigger(a, b, this[0], !0);
        },
        toggle: function(a) {
            var b = arguments, c = a.guid || p.guid++, d = 0, e = function(c) {
                var e = (p._data(this, "lastToggle" + a.guid) || 0) % d;
                return p._data(this, "lastToggle" + a.guid, e + 1), c.preventDefault(), b[e].apply(this, arguments) || !1;
            };
            e.guid = c;
            while (d < b.length) b[d++].guid = c;
            return this.click(e);
        },
        hover: function(a, b) {
            return this.mouseenter(a).mouseleave(b || a);
        }
    }), p.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(a, b) {
        p.fn[b] = function(a, c) {
            return null == c && (c = a, a = null), arguments.length > 0 ? this.on(b, null, a, c) : this.trigger(b);
        }, Y.test(b) && (p.event.fixHooks[b] = p.event.keyHooks), Z.test(b) && (p.event.fixHooks[b] = p.event.mouseHooks);
    }), function(a, b) {
        function bc(a, b, c, d) {
            c = c || [], b = b || r;
            var e, f, i, j, k = b.nodeType;
            if (!a || "string" != typeof a) return c;
            if (1 !== k && 9 !== k) return [];
            i = g(b);
            if (!i && !d) if (e = P.exec(a)) if (j = e[1]) {
                if (9 === k) {
                    f = b.getElementById(j);
                    if (!f || !f.parentNode) return c;
                    if (f.id === j) return c.push(f), c;
                } else if (b.ownerDocument && (f = b.ownerDocument.getElementById(j)) && h(b, f) && f.id === j) return c.push(f), 
                c;
            } else {
                if (e[2]) return w.apply(c, x.call(b.getElementsByTagName(a), 0)), c;
                if ((j = e[3]) && _ && b.getElementsByClassName) return w.apply(c, x.call(b.getElementsByClassName(j), 0)), 
                c;
            }
            return bp(a.replace(L, "$1"), b, c, d, i);
        }
        function bd(a) {
            return function(b) {
                var c = b.nodeName.toLowerCase();
                return "input" === c && b.type === a;
            };
        }
        function be(a) {
            return function(b) {
                var c = b.nodeName.toLowerCase();
                return ("input" === c || "button" === c) && b.type === a;
            };
        }
        function bf(a) {
            return z(function(b) {
                return b = +b, z(function(c, d) {
                    var e, f = a([], c.length, b), g = f.length;
                    while (g--) c[e = f[g]] && (c[e] = !(d[e] = c[e]));
                });
            });
        }
        function bg(a, b, c) {
            if (a === b) return c;
            var d = a.nextSibling;
            while (d) {
                if (d === b) return -1;
                d = d.nextSibling;
            }
            return 1;
        }
        function bh(a, b) {
            var c, d, f, g, h, i, j, k = C[o][a];
            if (k) return b ? 0 : k.slice(0);
            h = a, i = [], j = e.preFilter;
            while (h) {
                if (!c || (d = M.exec(h))) d && (h = h.slice(d[0].length)), i.push(f = []);
                c = !1;
                if (d = N.exec(h)) f.push(c = new q(d.shift())), h = h.slice(c.length), c.type = d[0].replace(L, " ");
                for (g in e.filter) (d = W[g].exec(h)) && (!j[g] || (d = j[g](d, r, !0))) && (f.push(c = new q(d.shift())), 
                h = h.slice(c.length), c.type = g, c.matches = d);
                if (!c) break;
            }
            return b ? h.length : h ? bc.error(a) : C(a, i).slice(0);
        }
        function bi(a, b, d) {
            var e = b.dir, f = d && "parentNode" === b.dir, g = u++;
            return b.first ? function(b, c, d) {
                while (b = b[e]) if (f || 1 === b.nodeType) return a(b, c, d);
            } : function(b, d, h) {
                if (!h) {
                    var i, j = t + " " + g + " ", k = j + c;
                    while (b = b[e]) if (f || 1 === b.nodeType) {
                        if ((i = b[o]) === k) return b.sizset;
                        if ("string" == typeof i && 0 === i.indexOf(j)) {
                            if (b.sizset) return b;
                        } else {
                            b[o] = k;
                            if (a(b, d, h)) return b.sizset = !0, b;
                            b.sizset = !1;
                        }
                    }
                } else while (b = b[e]) if (f || 1 === b.nodeType) if (a(b, d, h)) return b;
            };
        }
        function bj(a) {
            return a.length > 1 ? function(b, c, d) {
                var e = a.length;
                while (e--) if (!a[e](b, c, d)) return !1;
                return !0;
            } : a[0];
        }
        function bk(a, b, c, d, e) {
            var f, g = [], h = 0, i = a.length, j = null != b;
            for (;h < i; h++) if (f = a[h]) if (!c || c(f, d, e)) g.push(f), j && b.push(h);
            return g;
        }
        function bl(a, b, c, d, e, f) {
            return d && !d[o] && (d = bl(d)), e && !e[o] && (e = bl(e, f)), z(function(f, g, h, i) {
                if (f && e) return;
                var j, k, l, m = [], n = [], o = g.length, p = f || bo(b || "*", h.nodeType ? [ h ] : h, [], f), q = a && (f || !b) ? bk(p, m, a, h, i) : p, r = c ? e || (f ? a : o || d) ? [] : g : q;
                c && c(q, r, h, i);
                if (d) {
                    l = bk(r, n), d(l, [], h, i), j = l.length;
                    while (j--) if (k = l[j]) r[n[j]] = !(q[n[j]] = k);
                }
                if (f) {
                    j = a && r.length;
                    while (j--) if (k = r[j]) f[m[j]] = !(g[m[j]] = k);
                } else r = bk(r === g ? r.splice(o, r.length) : r), e ? e(null, g, r, i) : w.apply(g, r);
            });
        }
        function bm(a) {
            var b, c, d, f = a.length, g = e.relative[a[0].type], h = g || e.relative[" "], i = g ? 1 : 0, j = bi(function(a) {
                return a === b;
            }, h, !0), k = bi(function(a) {
                return y.call(b, a) > -1;
            }, h, !0), m = [ function(a, c, d) {
                return !g && (d || c !== l) || ((b = c).nodeType ? j(a, c, d) : k(a, c, d));
            } ];
            for (;i < f; i++) if (c = e.relative[a[i].type]) m = [ bi(bj(m), c) ]; else {
                c = e.filter[a[i].type].apply(null, a[i].matches);
                if (c[o]) {
                    d = ++i;
                    for (;d < f; d++) if (e.relative[a[d].type]) break;
                    return bl(i > 1 && bj(m), i > 1 && a.slice(0, i - 1).join("").replace(L, "$1"), c, i < d && bm(a.slice(i, d)), d < f && bm(a = a.slice(d)), d < f && a.join(""));
                }
                m.push(c);
            }
            return bj(m);
        }
        function bn(a, b) {
            var d = b.length > 0, f = a.length > 0, g = function(h, i, j, k, m) {
                var n, o, p, q = [], s = 0, u = "0", x = h && [], y = null != m, z = l, A = h || f && e.find.TAG("*", m && i.parentNode || i), B = t += null == z ? 1 : Math.E;
                y && (l = i !== r && i, c = g.el);
                for (;null != (n = A[u]); u++) {
                    if (f && n) {
                        for (o = 0; p = a[o]; o++) if (p(n, i, j)) {
                            k.push(n);
                            break;
                        }
                        y && (t = B, c = ++g.el);
                    }
                    d && ((n = !p && n) && s--, h && x.push(n));
                }
                s += u;
                if (d && u !== s) {
                    for (o = 0; p = b[o]; o++) p(x, q, i, j);
                    if (h) {
                        if (s > 0) while (u--) !x[u] && !q[u] && (q[u] = v.call(k));
                        q = bk(q);
                    }
                    w.apply(k, q), y && !h && q.length > 0 && s + b.length > 1 && bc.uniqueSort(k);
                }
                return y && (t = B, l = z), x;
            };
            return g.el = 0, d ? z(g) : g;
        }
        function bo(a, b, c, d) {
            var e = 0, f = b.length;
            for (;e < f; e++) bc(a, b[e], c, d);
            return c;
        }
        function bp(a, b, c, d, f) {
            var g, h, j, k, l, m = bh(a), n = m.length;
            if (!d && 1 === m.length) {
                h = m[0] = m[0].slice(0);
                if (h.length > 2 && "ID" === (j = h[0]).type && 9 === b.nodeType && !f && e.relative[h[1].type]) {
                    b = e.find.ID(j.matches[0].replace(V, ""), b, f)[0];
                    if (!b) return c;
                    a = a.slice(h.shift().length);
                }
                for (g = W.POS.test(a) ? -1 : h.length - 1; g >= 0; g--) {
                    j = h[g];
                    if (e.relative[k = j.type]) break;
                    if (l = e.find[k]) if (d = l(j.matches[0].replace(V, ""), R.test(h[0].type) && b.parentNode || b, f)) {
                        h.splice(g, 1), a = d.length && h.join("");
                        if (!a) return w.apply(c, x.call(d, 0)), c;
                        break;
                    }
                }
            }
            return i(a, m)(d, b, f, c, R.test(a)), c;
        }
        function bq() {}
        var c, d, e, f, g, h, i, j, k, l, m = !0, n = "undefined", o = ("sizcache" + Math.random()).replace(".", ""), q = String, r = a.document, s = r.documentElement, t = 0, u = 0, v = [].pop, w = [].push, x = [].slice, y = [].indexOf || function(a) {
            var b = 0, c = this.length;
            for (;b < c; b++) if (this[b] === a) return b;
            return -1;
        }, z = function(a, b) {
            return a[o] = null == b || b, a;
        }, A = function() {
            var a = {}, b = [];
            return z(function(c, d) {
                return b.push(c) > e.cacheLength && delete a[b.shift()], a[c] = d;
            }, a);
        }, B = A(), C = A(), D = A(), E = "[\\x20\\t\\r\\n\\f]", F = "(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+", G = F.replace("w", "w#"), H = "([*^$|!~]?=)", I = "\\[" + E + "*(" + F + ")" + E + "*(?:" + H + E + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + G + ")|)|)" + E + "*\\]", J = ":(" + F + ")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:" + I + ")|[^:]|\\\\.)*|.*))\\)|)", K = ":(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + E + "*((?:-\\d)?\\d*)" + E + "*\\)|)(?=[^-]|$)", L = new RegExp("^" + E + "+|((?:^|[^\\\\])(?:\\\\.)*)" + E + "+$", "g"), M = new RegExp("^" + E + "*," + E + "*"), N = new RegExp("^" + E + "*([\\x20\\t\\r\\n\\f>+~])" + E + "*"), O = new RegExp(J), P = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/, Q = /^:not/, R = /[\x20\t\r\n\f]*[+~]/, S = /:not\($/, T = /h\d/i, U = /input|select|textarea|button/i, V = /\\(?!\\)/g, W = {
            ID: new RegExp("^#(" + F + ")"),
            CLASS: new RegExp("^\\.(" + F + ")"),
            NAME: new RegExp("^\\[name=['\"]?(" + F + ")['\"]?\\]"),
            TAG: new RegExp("^(" + F.replace("w", "w*") + ")"),
            ATTR: new RegExp("^" + I),
            PSEUDO: new RegExp("^" + J),
            POS: new RegExp(K, "i"),
            CHILD: new RegExp("^:(only|nth|first|last)-child(?:\\(" + E + "*(even|odd|(([+-]|)(\\d*)n|)" + E + "*(?:([+-]|)" + E + "*(\\d+)|))" + E + "*\\)|)", "i"),
            needsContext: new RegExp("^" + E + "*[>+~]|" + K, "i")
        }, X = function(a) {
            var b = r.createElement("div");
            try {
                return a(b);
            } catch (c) {
                return !1;
            } finally {
                b = null;
            }
        }, Y = X(function(a) {
            return a.appendChild(r.createComment("")), !a.getElementsByTagName("*").length;
        }), Z = X(function(a) {
            return a.innerHTML = "<a href='#'></a>", a.firstChild && typeof a.firstChild.getAttribute !== n && "#" === a.firstChild.getAttribute("href");
        }), $ = X(function(a) {
            a.innerHTML = "<select></select>";
            var b = typeof a.lastChild.getAttribute("multiple");
            return "boolean" !== b && "string" !== b;
        }), _ = X(function(a) {
            return a.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>", !a.getElementsByClassName || !a.getElementsByClassName("e").length ? !1 : (a.lastChild.className = "e", 
            2 === a.getElementsByClassName("e").length);
        }), ba = X(function(a) {
            a.id = o + 0, a.innerHTML = "<a name='" + o + "'></a><div name='" + o + "'></div>", 
            s.insertBefore(a, s.firstChild);
            var b = r.getElementsByName && r.getElementsByName(o).length === 2 + r.getElementsByName(o + 0).length;
            return d = !r.getElementById(o), s.removeChild(a), b;
        });
        try {
            x.call(s.childNodes, 0)[0].nodeType;
        } catch (bb) {
            x = function(a) {
                var b, c = [];
                for (;b = this[a]; a++) c.push(b);
                return c;
            };
        }
        bc.matches = function(a, b) {
            return bc(a, null, null, b);
        }, bc.matchesSelector = function(a, b) {
            return bc(b, null, null, [ a ]).length > 0;
        }, f = bc.getText = function(a) {
            var b, c = "", d = 0, e = a.nodeType;
            if (e) {
                if (1 === e || 9 === e || 11 === e) {
                    if ("string" == typeof a.textContent) return a.textContent;
                    for (a = a.firstChild; a; a = a.nextSibling) c += f(a);
                } else if (3 === e || 4 === e) return a.nodeValue;
            } else for (;b = a[d]; d++) c += f(b);
            return c;
        }, g = bc.isXML = function(a) {
            var b = a && (a.ownerDocument || a).documentElement;
            return b ? "HTML" !== b.nodeName : !1;
        }, h = bc.contains = s.contains ? function(a, b) {
            var c = 9 === a.nodeType ? a.documentElement : a, d = b && b.parentNode;
            return a === d || !!(d && 1 === d.nodeType && c.contains && c.contains(d));
        } : s.compareDocumentPosition ? function(a, b) {
            return b && !!(16 & a.compareDocumentPosition(b));
        } : function(a, b) {
            while (b = b.parentNode) if (b === a) return !0;
            return !1;
        }, bc.attr = function(a, b) {
            var c, d = g(a);
            return d || (b = b.toLowerCase()), (c = e.attrHandle[b]) ? c(a) : d || $ ? a.getAttribute(b) : (c = a.getAttributeNode(b), 
            c ? "boolean" == typeof a[b] ? a[b] ? b : null : c.specified ? c.value : null : null);
        }, e = bc.selectors = {
            cacheLength: 50,
            createPseudo: z,
            match: W,
            attrHandle: Z ? {} : {
                href: function(a) {
                    return a.getAttribute("href", 2);
                },
                type: function(a) {
                    return a.getAttribute("type");
                }
            },
            find: {
                ID: d ? function(a, b, c) {
                    if (typeof b.getElementById !== n && !c) {
                        var d = b.getElementById(a);
                        return d && d.parentNode ? [ d ] : [];
                    }
                } : function(a, c, d) {
                    if (typeof c.getElementById !== n && !d) {
                        var e = c.getElementById(a);
                        return e ? e.id === a || typeof e.getAttributeNode !== n && e.getAttributeNode("id").value === a ? [ e ] : b : [];
                    }
                },
                TAG: Y ? function(a, b) {
                    if (typeof b.getElementsByTagName !== n) return b.getElementsByTagName(a);
                } : function(a, b) {
                    var c = b.getElementsByTagName(a);
                    if ("*" === a) {
                        var d, e = [], f = 0;
                        for (;d = c[f]; f++) 1 === d.nodeType && e.push(d);
                        return e;
                    }
                    return c;
                },
                NAME: ba && function(a, b) {
                    if (typeof b.getElementsByName !== n) return b.getElementsByName(name);
                },
                CLASS: _ && function(a, b, c) {
                    if (typeof b.getElementsByClassName !== n && !c) return b.getElementsByClassName(a);
                }
            },
            relative: {
                ">": {
                    dir: "parentNode",
                    first: !0
                },
                " ": {
                    dir: "parentNode"
                },
                "+": {
                    dir: "previousSibling",
                    first: !0
                },
                "~": {
                    dir: "previousSibling"
                }
            },
            preFilter: {
                ATTR: function(a) {
                    return a[1] = a[1].replace(V, ""), a[3] = (a[4] || a[5] || "").replace(V, ""), "~=" === a[2] && (a[3] = " " + a[3] + " "), 
                    a.slice(0, 4);
                },
                CHILD: function(a) {
                    return a[1] = a[1].toLowerCase(), "nth" === a[1] ? (a[2] || bc.error(a[0]), a[3] = +(a[3] ? a[4] + (a[5] || 1) : 2 * ("even" === a[2] || "odd" === a[2])), 
                    a[4] = +(a[6] + a[7] || "odd" === a[2])) : a[2] && bc.error(a[0]), a;
                },
                PSEUDO: function(a) {
                    var b, c;
                    if (W.CHILD.test(a[0])) return null;
                    if (a[3]) a[2] = a[3]; else if (b = a[4]) O.test(b) && (c = bh(b, !0)) && (c = b.indexOf(")", b.length - c) - b.length) && (b = b.slice(0, c), 
                    a[0] = a[0].slice(0, c)), a[2] = b;
                    return a.slice(0, 3);
                }
            },
            filter: {
                ID: d ? function(a) {
                    return a = a.replace(V, ""), function(b) {
                        return b.getAttribute("id") === a;
                    };
                } : function(a) {
                    return a = a.replace(V, ""), function(b) {
                        var c = typeof b.getAttributeNode !== n && b.getAttributeNode("id");
                        return c && c.value === a;
                    };
                },
                TAG: function(a) {
                    return "*" === a ? function() {
                        return !0;
                    } : (a = a.replace(V, "").toLowerCase(), function(b) {
                        return b.nodeName && b.nodeName.toLowerCase() === a;
                    });
                },
                CLASS: function(a) {
                    var b = B[o][a];
                    return b || (b = B(a, new RegExp("(^|" + E + ")" + a + "(" + E + "|$)"))), function(a) {
                        return b.test(a.className || typeof a.getAttribute !== n && a.getAttribute("class") || "");
                    };
                },
                ATTR: function(a, b, c) {
                    return function(d, e) {
                        var f = bc.attr(d, a);
                        return null == f ? "!=" === b : b ? (f += "", "=" === b ? f === c : "!=" === b ? f !== c : "^=" === b ? c && 0 === f.indexOf(c) : "*=" === b ? c && f.indexOf(c) > -1 : "$=" === b ? c && f.substr(f.length - c.length) === c : "~=" === b ? (" " + f + " ").indexOf(c) > -1 : "|=" === b ? f === c || f.substr(0, c.length + 1) === c + "-" : !1) : !0;
                    };
                },
                CHILD: function(a, b, c, d) {
                    return "nth" === a ? function(a) {
                        var b, e, f = a.parentNode;
                        if (1 === c && 0 === d) return !0;
                        if (f) {
                            e = 0;
                            for (b = f.firstChild; b; b = b.nextSibling) if (1 === b.nodeType) {
                                e++;
                                if (a === b) break;
                            }
                        }
                        return e -= d, e === c || e % c === 0 && e / c >= 0;
                    } : function(b) {
                        var c = b;
                        switch (a) {
                          case "only":
                          case "first":
                            while (c = c.previousSibling) if (1 === c.nodeType) return !1;
                            if ("first" === a) return !0;
                            c = b;

                          case "last":
                            while (c = c.nextSibling) if (1 === c.nodeType) return !1;
                            return !0;
                        }
                    };
                },
                PSEUDO: function(a, b) {
                    var c, d = e.pseudos[a] || e.setFilters[a.toLowerCase()] || bc.error("unsupported pseudo: " + a);
                    return d[o] ? d(b) : d.length > 1 ? (c = [ a, a, "", b ], e.setFilters.hasOwnProperty(a.toLowerCase()) ? z(function(a, c) {
                        var e, f = d(a, b), g = f.length;
                        while (g--) e = y.call(a, f[g]), a[e] = !(c[e] = f[g]);
                    }) : function(a) {
                        return d(a, 0, c);
                    }) : d;
                }
            },
            pseudos: {
                not: z(function(a) {
                    var b = [], c = [], d = i(a.replace(L, "$1"));
                    return d[o] ? z(function(a, b, c, e) {
                        var f, g = d(a, null, e, []), h = a.length;
                        while (h--) if (f = g[h]) a[h] = !(b[h] = f);
                    }) : function(a, e, f) {
                        return b[0] = a, d(b, null, f, c), !c.pop();
                    };
                }),
                has: z(function(a) {
                    return function(b) {
                        return bc(a, b).length > 0;
                    };
                }),
                contains: z(function(a) {
                    return function(b) {
                        return (b.textContent || b.innerText || f(b)).indexOf(a) > -1;
                    };
                }),
                enabled: function(a) {
                    return a.disabled === !1;
                },
                disabled: function(a) {
                    return a.disabled === !0;
                },
                checked: function(a) {
                    var b = a.nodeName.toLowerCase();
                    return "input" === b && !!a.checked || "option" === b && !!a.selected;
                },
                selected: function(a) {
                    return a.parentNode && a.parentNode.selectedIndex, a.selected === !0;
                },
                parent: function(a) {
                    return !e.pseudos.empty(a);
                },
                empty: function(a) {
                    var b;
                    a = a.firstChild;
                    while (a) {
                        if (a.nodeName > "@" || 3 === (b = a.nodeType) || 4 === b) return !1;
                        a = a.nextSibling;
                    }
                    return !0;
                },
                header: function(a) {
                    return T.test(a.nodeName);
                },
                text: function(a) {
                    var b, c;
                    return "input" === a.nodeName.toLowerCase() && "text" === (b = a.type) && (null == (c = a.getAttribute("type")) || c.toLowerCase() === b);
                },
                radio: bd("radio"),
                checkbox: bd("checkbox"),
                file: bd("file"),
                password: bd("password"),
                image: bd("image"),
                submit: be("submit"),
                reset: be("reset"),
                button: function(a) {
                    var b = a.nodeName.toLowerCase();
                    return "input" === b && "button" === a.type || "button" === b;
                },
                input: function(a) {
                    return U.test(a.nodeName);
                },
                focus: function(a) {
                    var b = a.ownerDocument;
                    return a === b.activeElement && (!b.hasFocus || b.hasFocus()) && (!!a.type || !!a.href);
                },
                active: function(a) {
                    return a === a.ownerDocument.activeElement;
                },
                first: bf(function(a, b, c) {
                    return [ 0 ];
                }),
                last: bf(function(a, b, c) {
                    return [ b - 1 ];
                }),
                eq: bf(function(a, b, c) {
                    return [ c < 0 ? c + b : c ];
                }),
                even: bf(function(a, b, c) {
                    for (var d = 0; d < b; d += 2) a.push(d);
                    return a;
                }),
                odd: bf(function(a, b, c) {
                    for (var d = 1; d < b; d += 2) a.push(d);
                    return a;
                }),
                lt: bf(function(a, b, c) {
                    for (var d = c < 0 ? c + b : c; --d >= 0; ) a.push(d);
                    return a;
                }),
                gt: bf(function(a, b, c) {
                    for (var d = c < 0 ? c + b : c; ++d < b; ) a.push(d);
                    return a;
                })
            }
        }, j = s.compareDocumentPosition ? function(a, b) {
            return a === b ? (k = !0, 0) : (!a.compareDocumentPosition || !b.compareDocumentPosition ? a.compareDocumentPosition : 4 & a.compareDocumentPosition(b)) ? -1 : 1;
        } : function(a, b) {
            if (a === b) return k = !0, 0;
            if (a.sourceIndex && b.sourceIndex) return a.sourceIndex - b.sourceIndex;
            var c, d, e = [], f = [], g = a.parentNode, h = b.parentNode, i = g;
            if (g === h) return bg(a, b);
            if (!g) return -1;
            if (!h) return 1;
            while (i) e.unshift(i), i = i.parentNode;
            i = h;
            while (i) f.unshift(i), i = i.parentNode;
            c = e.length, d = f.length;
            for (var j = 0; j < c && j < d; j++) if (e[j] !== f[j]) return bg(e[j], f[j]);
            return j === c ? bg(a, f[j], -1) : bg(e[j], b, 1);
        }, [ 0, 0 ].sort(j), m = !k, bc.uniqueSort = function(a) {
            var b, c = 1;
            k = m, a.sort(j);
            if (k) for (;b = a[c]; c++) b === a[c - 1] && a.splice(c--, 1);
            return a;
        }, bc.error = function(a) {
            throw new Error("Syntax error, unrecognized expression: " + a);
        }, i = bc.compile = function(a, b) {
            var c, d = [], e = [], f = D[o][a];
            if (!f) {
                b || (b = bh(a)), c = b.length;
                while (c--) f = bm(b[c]), f[o] ? d.push(f) : e.push(f);
                f = D(a, bn(e, d));
            }
            return f;
        }, r.querySelectorAll && function() {
            var a, b = bp, c = /'|\\/g, d = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g, e = [ ":focus" ], f = [ ":active", ":focus" ], h = s.matchesSelector || s.mozMatchesSelector || s.webkitMatchesSelector || s.oMatchesSelector || s.msMatchesSelector;
            X(function(a) {
                a.innerHTML = "<select><option selected=''></option></select>", a.querySelectorAll("[selected]").length || e.push("\\[" + E + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)"), 
                a.querySelectorAll(":checked").length || e.push(":checked");
            }), X(function(a) {
                a.innerHTML = "<p test=''></p>", a.querySelectorAll("[test^='']").length && e.push("[*^$]=" + E + "*(?:\"\"|'')"), 
                a.innerHTML = "<input type='hidden'/>", a.querySelectorAll(":enabled").length || e.push(":enabled", ":disabled");
            }), e = new RegExp(e.join("|")), bp = function(a, d, f, g, h) {
                if (!g && !h && (!e || !e.test(a))) {
                    var i, j, k = !0, l = o, m = d, n = 9 === d.nodeType && a;
                    if (1 === d.nodeType && "object" !== d.nodeName.toLowerCase()) {
                        i = bh(a), (k = d.getAttribute("id")) ? l = k.replace(c, "\\$&") : d.setAttribute("id", l), 
                        l = "[id='" + l + "'] ", j = i.length;
                        while (j--) i[j] = l + i[j].join("");
                        m = R.test(a) && d.parentNode || d, n = i.join(",");
                    }
                    if (n) try {
                        return w.apply(f, x.call(m.querySelectorAll(n), 0)), f;
                    } catch (p) {} finally {
                        k || d.removeAttribute("id");
                    }
                }
                return b(a, d, f, g, h);
            }, h && (X(function(b) {
                a = h.call(b, "div");
                try {
                    h.call(b, "[test!='']:sizzle"), f.push("!=", J);
                } catch (c) {}
            }), f = new RegExp(f.join("|")), bc.matchesSelector = function(b, c) {
                c = c.replace(d, "='$1']");
                if (!g(b) && !f.test(c) && (!e || !e.test(c))) try {
                    var i = h.call(b, c);
                    if (i || a || b.document && 11 !== b.document.nodeType) return i;
                } catch (j) {}
                return bc(c, null, null, [ b ]).length > 0;
            });
        }(), e.pseudos.nth = e.pseudos.eq, e.filters = bq.prototype = e.pseudos, e.setFilters = new bq(), 
        bc.attr = p.attr, p.find = bc, p.expr = bc.selectors, p.expr[":"] = p.expr.pseudos, 
        p.unique = bc.uniqueSort, p.text = bc.getText, p.isXMLDoc = bc.isXML, p.contains = bc.contains;
    }(a);
    var bc = /Until$/, bd = /^(?:parents|prev(?:Until|All))/, be = /^.[^:#\[\.,]*$/, bf = p.expr.match.needsContext, bg = {
        children: !0,
        contents: !0,
        next: !0,
        prev: !0
    };
    p.fn.extend({
        find: function(a) {
            var b, c, d, e, f, g, h = this;
            if ("string" != typeof a) return p(a).filter(function() {
                for (b = 0, c = h.length; b < c; b++) if (p.contains(h[b], this)) return !0;
            });
            g = this.pushStack("", "find", a);
            for (b = 0, c = this.length; b < c; b++) {
                d = g.length, p.find(a, this[b], g);
                if (b > 0) for (e = d; e < g.length; e++) for (f = 0; f < d; f++) if (g[f] === g[e]) {
                    g.splice(e--, 1);
                    break;
                }
            }
            return g;
        },
        has: function(a) {
            var b, c = p(a, this), d = c.length;
            return this.filter(function() {
                for (b = 0; b < d; b++) if (p.contains(this, c[b])) return !0;
            });
        },
        not: function(a) {
            return this.pushStack(bj(this, a, !1), "not", a);
        },
        filter: function(a) {
            return this.pushStack(bj(this, a, !0), "filter", a);
        },
        is: function(a) {
            return !!a && ("string" == typeof a ? bf.test(a) ? p(a, this.context).index(this[0]) >= 0 : p.filter(a, this).length > 0 : this.filter(a).length > 0);
        },
        closest: function(a, b) {
            var c, d = 0, e = this.length, f = [], g = bf.test(a) || "string" != typeof a ? p(a, b || this.context) : 0;
            for (;d < e; d++) {
                c = this[d];
                while (c && c.ownerDocument && c !== b && 11 !== c.nodeType) {
                    if (g ? g.index(c) > -1 : p.find.matchesSelector(c, a)) {
                        f.push(c);
                        break;
                    }
                    c = c.parentNode;
                }
            }
            return f = f.length > 1 ? p.unique(f) : f, this.pushStack(f, "closest", a);
        },
        index: function(a) {
            return a ? "string" == typeof a ? p.inArray(this[0], p(a)) : p.inArray(a.jquery ? a[0] : a, this) : this[0] && this[0].parentNode ? this.prevAll().length : -1;
        },
        add: function(a, b) {
            var c = "string" == typeof a ? p(a, b) : p.makeArray(a && a.nodeType ? [ a ] : a), d = p.merge(this.get(), c);
            return this.pushStack(bh(c[0]) || bh(d[0]) ? d : p.unique(d));
        },
        addBack: function(a) {
            return this.add(null == a ? this.prevObject : this.prevObject.filter(a));
        }
    }), p.fn.andSelf = p.fn.addBack, p.each({
        parent: function(a) {
            var b = a.parentNode;
            return b && 11 !== b.nodeType ? b : null;
        },
        parents: function(a) {
            return p.dir(a, "parentNode");
        },
        parentsUntil: function(a, b, c) {
            return p.dir(a, "parentNode", c);
        },
        next: function(a) {
            return bi(a, "nextSibling");
        },
        prev: function(a) {
            return bi(a, "previousSibling");
        },
        nextAll: function(a) {
            return p.dir(a, "nextSibling");
        },
        prevAll: function(a) {
            return p.dir(a, "previousSibling");
        },
        nextUntil: function(a, b, c) {
            return p.dir(a, "nextSibling", c);
        },
        prevUntil: function(a, b, c) {
            return p.dir(a, "previousSibling", c);
        },
        siblings: function(a) {
            return p.sibling((a.parentNode || {}).firstChild, a);
        },
        children: function(a) {
            return p.sibling(a.firstChild);
        },
        contents: function(a) {
            return p.nodeName(a, "iframe") ? a.contentDocument || a.contentWindow.document : p.merge([], a.childNodes);
        }
    }, function(a, b) {
        p.fn[a] = function(c, d) {
            var e = p.map(this, b, c);
            return bc.test(a) || (d = c), d && "string" == typeof d && (e = p.filter(d, e)), 
            e = this.length > 1 && !bg[a] ? p.unique(e) : e, this.length > 1 && bd.test(a) && (e = e.reverse()), 
            this.pushStack(e, a, k.call(arguments).join(","));
        };
    }), p.extend({
        filter: function(a, b, c) {
            return c && (a = ":not(" + a + ")"), 1 === b.length ? p.find.matchesSelector(b[0], a) ? [ b[0] ] : [] : p.find.matches(a, b);
        },
        dir: function(a, c, d) {
            var e = [], f = a[c];
            while (f && 9 !== f.nodeType && (d === b || 1 !== f.nodeType || !p(f).is(d))) 1 === f.nodeType && e.push(f), 
            f = f[c];
            return e;
        },
        sibling: function(a, b) {
            var c = [];
            for (;a; a = a.nextSibling) 1 === a.nodeType && a !== b && c.push(a);
            return c;
        }
    });
    var bl = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video", bm = / jQuery\d+="(?:null|\d+)"/g, bn = /^\s+/, bo = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, bp = /<([\w:]+)/, bq = /<tbody/i, br = /<|&#?\w+;/, bs = /<(?:script|style|link)/i, bt = /<(?:script|object|embed|option|style)/i, bu = new RegExp("<(?:" + bl + ")[\\s/>]", "i"), bv = /^(?:checkbox|radio)$/, bw = /checked\s*(?:[^=]|=\s*.checked.)/i, bx = /\/(java|ecma)script/i, by = /^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g, bz = {
        option: [ 1, "<select multiple='multiple'>", "</select>" ],
        legend: [ 1, "<fieldset>", "</fieldset>" ],
        thead: [ 1, "<table>", "</table>" ],
        tr: [ 2, "<table><tbody>", "</tbody></table>" ],
        td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
        col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
        area: [ 1, "<map>", "</map>" ],
        _default: [ 0, "", "" ]
    }, bA = bk(e), bB = bA.appendChild(e.createElement("div"));
    bz.optgroup = bz.option, bz.tbody = bz.tfoot = bz.colgroup = bz.caption = bz.thead, 
    bz.th = bz.td, p.support.htmlSerialize || (bz._default = [ 1, "X<div>", "</div>" ]), 
    p.fn.extend({
        text: function(a) {
            return p.access(this, function(a) {
                return a === b ? p.text(this) : this.empty().append((this[0] && this[0].ownerDocument || e).createTextNode(a));
            }, null, a, arguments.length);
        },
        wrapAll: function(a) {
            if (p.isFunction(a)) return this.each(function(b) {
                p(this).wrapAll(a.call(this, b));
            });
            if (this[0]) {
                var b = p(a, this[0].ownerDocument).eq(0).clone(!0);
                this[0].parentNode && b.insertBefore(this[0]), b.map(function() {
                    var a = this;
                    while (a.firstChild && 1 === a.firstChild.nodeType) a = a.firstChild;
                    return a;
                }).append(this);
            }
            return this;
        },
        wrapInner: function(a) {
            return p.isFunction(a) ? this.each(function(b) {
                p(this).wrapInner(a.call(this, b));
            }) : this.each(function() {
                var b = p(this), c = b.contents();
                c.length ? c.wrapAll(a) : b.append(a);
            });
        },
        wrap: function(a) {
            var b = p.isFunction(a);
            return this.each(function(c) {
                p(this).wrapAll(b ? a.call(this, c) : a);
            });
        },
        unwrap: function() {
            return this.parent().each(function() {
                p.nodeName(this, "body") || p(this).replaceWith(this.childNodes);
            }).end();
        },
        append: function() {
            return this.domManip(arguments, !0, function(a) {
                (1 === this.nodeType || 11 === this.nodeType) && this.appendChild(a);
            });
        },
        prepend: function() {
            return this.domManip(arguments, !0, function(a) {
                (1 === this.nodeType || 11 === this.nodeType) && this.insertBefore(a, this.firstChild);
            });
        },
        before: function() {
            if (!bh(this[0])) return this.domManip(arguments, !1, function(a) {
                this.parentNode.insertBefore(a, this);
            });
            if (arguments.length) {
                var a = p.clean(arguments);
                return this.pushStack(p.merge(a, this), "before", this.selector);
            }
        },
        after: function() {
            if (!bh(this[0])) return this.domManip(arguments, !1, function(a) {
                this.parentNode.insertBefore(a, this.nextSibling);
            });
            if (arguments.length) {
                var a = p.clean(arguments);
                return this.pushStack(p.merge(this, a), "after", this.selector);
            }
        },
        remove: function(a, b) {
            var c, d = 0;
            for (;null != (c = this[d]); d++) if (!a || p.filter(a, [ c ]).length) !b && 1 === c.nodeType && (p.cleanData(c.getElementsByTagName("*")), 
            p.cleanData([ c ])), c.parentNode && c.parentNode.removeChild(c);
            return this;
        },
        empty: function() {
            var a, b = 0;
            for (;null != (a = this[b]); b++) {
                1 === a.nodeType && p.cleanData(a.getElementsByTagName("*"));
                while (a.firstChild) a.removeChild(a.firstChild);
            }
            return this;
        },
        clone: function(a, b) {
            return a = null == a ? !1 : a, b = null == b ? a : b, this.map(function() {
                return p.clone(this, a, b);
            });
        },
        html: function(a) {
            return p.access(this, function(a) {
                var c = this[0] || {}, d = 0, e = this.length;
                if (a === b) return 1 === c.nodeType ? c.innerHTML.replace(bm, "") : b;
                if ("string" == typeof a && !bs.test(a) && (p.support.htmlSerialize || !bu.test(a)) && (p.support.leadingWhitespace || !bn.test(a)) && !bz[(bp.exec(a) || [ "", "" ])[1].toLowerCase()]) {
                    a = a.replace(bo, "<$1></$2>");
                    try {
                        for (;d < e; d++) c = this[d] || {}, 1 === c.nodeType && (p.cleanData(c.getElementsByTagName("*")), 
                        c.innerHTML = a);
                        c = 0;
                    } catch (f) {}
                }
                c && this.empty().append(a);
            }, null, a, arguments.length);
        },
        replaceWith: function(a) {
            return bh(this[0]) ? this.length ? this.pushStack(p(p.isFunction(a) ? a() : a), "replaceWith", a) : this : p.isFunction(a) ? this.each(function(b) {
                var c = p(this), d = c.html();
                c.replaceWith(a.call(this, b, d));
            }) : ("string" != typeof a && (a = p(a).detach()), this.each(function() {
                var b = this.nextSibling, c = this.parentNode;
                p(this).remove(), b ? p(b).before(a) : p(c).append(a);
            }));
        },
        detach: function(a) {
            return this.remove(a, !0);
        },
        domManip: function(a, c, d) {
            a = [].concat.apply([], a);
            var e, f, g, h, i = 0, j = a[0], k = [], l = this.length;
            if (!p.support.checkClone && l > 1 && "string" == typeof j && bw.test(j)) return this.each(function() {
                p(this).domManip(a, c, d);
            });
            if (p.isFunction(j)) return this.each(function(e) {
                var f = p(this);
                a[0] = j.call(this, e, c ? f.html() : b), f.domManip(a, c, d);
            });
            if (this[0]) {
                e = p.buildFragment(a, this, k), g = e.fragment, f = g.firstChild, 1 === g.childNodes.length && (g = f);
                if (f) {
                    c = c && p.nodeName(f, "tr");
                    for (h = e.cacheable || l - 1; i < l; i++) d.call(c && p.nodeName(this[i], "table") ? bC(this[i], "tbody") : this[i], i === h ? g : p.clone(g, !0, !0));
                }
                g = f = null, k.length && p.each(k, function(a, b) {
                    b.src ? p.ajax ? p.ajax({
                        url: b.src,
                        type: "GET",
                        dataType: "script",
                        async: !1,
                        global: !1,
                        "throws": !0
                    }) : p.error("no ajax") : p.globalEval((b.text || b.textContent || b.innerHTML || "").replace(by, "")), 
                    b.parentNode && b.parentNode.removeChild(b);
                });
            }
            return this;
        }
    }), p.buildFragment = function(a, c, d) {
        var f, g, h, i = a[0];
        return c = c || e, c = !c.nodeType && c[0] || c, c = c.ownerDocument || c, 1 === a.length && "string" == typeof i && i.length < 512 && c === e && "<" === i.charAt(0) && !bt.test(i) && (p.support.checkClone || !bw.test(i)) && (p.support.html5Clone || !bu.test(i)) && (g = !0, 
        f = p.fragments[i], h = f !== b), f || (f = c.createDocumentFragment(), p.clean(a, c, f, d), 
        g && (p.fragments[i] = h && f)), {
            fragment: f,
            cacheable: g
        };
    }, p.fragments = {}, p.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function(a, b) {
        p.fn[a] = function(c) {
            var d, e = 0, f = [], g = p(c), h = g.length, i = 1 === this.length && this[0].parentNode;
            if ((null == i || i && 11 === i.nodeType && 1 === i.childNodes.length) && 1 === h) return g[b](this[0]), 
            this;
            for (;e < h; e++) d = (e > 0 ? this.clone(!0) : this).get(), p(g[e])[b](d), f = f.concat(d);
            return this.pushStack(f, a, g.selector);
        };
    }), p.extend({
        clone: function(a, b, c) {
            var d, e, f, g;
            p.support.html5Clone || p.isXMLDoc(a) || !bu.test("<" + a.nodeName + ">") ? g = a.cloneNode(!0) : (bB.innerHTML = a.outerHTML, 
            bB.removeChild(g = bB.firstChild));
            if ((!p.support.noCloneEvent || !p.support.noCloneChecked) && (1 === a.nodeType || 11 === a.nodeType) && !p.isXMLDoc(a)) {
                bE(a, g), d = bF(a), e = bF(g);
                for (f = 0; d[f]; ++f) e[f] && bE(d[f], e[f]);
            }
            if (b) {
                bD(a, g);
                if (c) {
                    d = bF(a), e = bF(g);
                    for (f = 0; d[f]; ++f) bD(d[f], e[f]);
                }
            }
            return d = e = null, g;
        },
        clean: function(a, b, c, d) {
            var f, g, h, i, j, k, l, m, n, o, q, r, s = b === e && bA, t = [];
            if (!b || "undefined" == typeof b.createDocumentFragment) b = e;
            for (f = 0; null != (h = a[f]); f++) {
                "number" == typeof h && (h += "");
                if (!h) continue;
                if ("string" == typeof h) if (!br.test(h)) h = b.createTextNode(h); else {
                    s = s || bk(b), l = b.createElement("div"), s.appendChild(l), h = h.replace(bo, "<$1></$2>"), 
                    i = (bp.exec(h) || [ "", "" ])[1].toLowerCase(), j = bz[i] || bz._default, k = j[0], 
                    l.innerHTML = j[1] + h + j[2];
                    while (k--) l = l.lastChild;
                    if (!p.support.tbody) {
                        m = bq.test(h), n = "table" === i && !m ? l.firstChild && l.firstChild.childNodes : "<table>" === j[1] && !m ? l.childNodes : [];
                        for (g = n.length - 1; g >= 0; --g) p.nodeName(n[g], "tbody") && !n[g].childNodes.length && n[g].parentNode.removeChild(n[g]);
                    }
                    !p.support.leadingWhitespace && bn.test(h) && l.insertBefore(b.createTextNode(bn.exec(h)[0]), l.firstChild), 
                    h = l.childNodes, l.parentNode.removeChild(l);
                }
                h.nodeType ? t.push(h) : p.merge(t, h);
            }
            l && (h = l = s = null);
            if (!p.support.appendChecked) for (f = 0; null != (h = t[f]); f++) p.nodeName(h, "input") ? bG(h) : "undefined" != typeof h.getElementsByTagName && p.grep(h.getElementsByTagName("input"), bG);
            if (c) {
                q = function(a) {
                    if (!a.type || bx.test(a.type)) return d ? d.push(a.parentNode ? a.parentNode.removeChild(a) : a) : c.appendChild(a);
                };
                for (f = 0; null != (h = t[f]); f++) if (!p.nodeName(h, "script") || !q(h)) c.appendChild(h), 
                "undefined" != typeof h.getElementsByTagName && (r = p.grep(p.merge([], h.getElementsByTagName("script")), q), 
                t.splice.apply(t, [ f + 1, 0 ].concat(r)), f += r.length);
            }
            return t;
        },
        cleanData: function(a, b) {
            var c, d, e, f, g = 0, h = p.expando, i = p.cache, j = p.support.deleteExpando, k = p.event.special;
            for (;null != (e = a[g]); g++) if (b || p.acceptData(e)) {
                d = e[h], c = d && i[d];
                if (c) {
                    if (c.events) for (f in c.events) k[f] ? p.event.remove(e, f) : p.removeEvent(e, f, c.handle);
                    i[d] && (delete i[d], j ? delete e[h] : e.removeAttribute ? e.removeAttribute(h) : e[h] = null, 
                    p.deletedIds.push(d));
                }
            }
        }
    }), function() {
        var a, b;
        p.uaMatch = function(a) {
            a = a.toLowerCase();
            var b = /(chrome)[ \/]([\w.]+)/.exec(a) || /(webkit)[ \/]([\w.]+)/.exec(a) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(a) || /(msie) ([\w.]+)/.exec(a) || a.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(a) || [];
            return {
                browser: b[1] || "",
                version: b[2] || "0"
            };
        }, a = p.uaMatch(g.userAgent), b = {}, a.browser && (b[a.browser] = !0, b.version = a.version), 
        b.chrome ? b.webkit = !0 : b.webkit && (b.safari = !0), p.browser = b, p.sub = function() {
            function a(b, c) {
                return new a.fn.init(b, c);
            }
            p.extend(!0, a, this), a.superclass = this, a.fn = a.prototype = this(), a.fn.constructor = a, 
            a.sub = this.sub, a.fn.init = function c(c, d) {
                return d && d instanceof p && !(d instanceof a) && (d = a(d)), p.fn.init.call(this, c, d, b);
            }, a.fn.init.prototype = a.fn;
            var b = a(e);
            return a;
        };
    }();
    var bH, bI, bJ, bK = /alpha\([^)]*\)/i, bL = /opacity=([^)]*)/, bM = /^(top|right|bottom|left)$/, bN = /^(none|table(?!-c[ea]).+)/, bO = /^margin/, bP = new RegExp("^(" + q + ")(.*)$", "i"), bQ = new RegExp("^(" + q + ")(?!px)[a-z%]+$", "i"), bR = new RegExp("^([-+])=(" + q + ")", "i"), bS = {}, bT = {
        position: "absolute",
        visibility: "hidden",
        display: "block"
    }, bU = {
        letterSpacing: 0,
        fontWeight: 400
    }, bV = [ "Top", "Right", "Bottom", "Left" ], bW = [ "Webkit", "O", "Moz", "ms" ], bX = p.fn.toggle;
    p.fn.extend({
        css: function(a, c) {
            return p.access(this, function(a, c, d) {
                return d !== b ? p.style(a, c, d) : p.css(a, c);
            }, a, c, arguments.length > 1);
        },
        show: function() {
            return b$(this, !0);
        },
        hide: function() {
            return b$(this);
        },
        toggle: function(a, b) {
            var c = "boolean" == typeof a;
            return p.isFunction(a) && p.isFunction(b) ? bX.apply(this, arguments) : this.each(function() {
                (c ? a : bZ(this)) ? p(this).show() : p(this).hide();
            });
        }
    }), p.extend({
        cssHooks: {
            opacity: {
                get: function(a, b) {
                    if (b) {
                        var c = bH(a, "opacity");
                        return "" === c ? "1" : c;
                    }
                }
            }
        },
        cssNumber: {
            fillOpacity: !0,
            fontWeight: !0,
            lineHeight: !0,
            opacity: !0,
            orphans: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0
        },
        cssProps: {
            "float": p.support.cssFloat ? "cssFloat" : "styleFloat"
        },
        style: function(a, c, d, e) {
            if (!a || 3 === a.nodeType || 8 === a.nodeType || !a.style) return;
            var f, g, h, i = p.camelCase(c), j = a.style;
            c = p.cssProps[i] || (p.cssProps[i] = bY(j, i)), h = p.cssHooks[c] || p.cssHooks[i];
            if (d === b) return h && "get" in h && (f = h.get(a, !1, e)) !== b ? f : j[c];
            g = typeof d, "string" === g && (f = bR.exec(d)) && (d = (f[1] + 1) * f[2] + parseFloat(p.css(a, c)), 
            g = "number");
            if (null == d || "number" === g && isNaN(d)) return;
            "number" === g && !p.cssNumber[i] && (d += "px");
            if (!h || !("set" in h) || (d = h.set(a, d, e)) !== b) try {
                j[c] = d;
            } catch (k) {}
        },
        css: function(a, c, d, e) {
            var f, g, h, i = p.camelCase(c);
            return c = p.cssProps[i] || (p.cssProps[i] = bY(a.style, i)), h = p.cssHooks[c] || p.cssHooks[i], 
            h && "get" in h && (f = h.get(a, !0, e)), f === b && (f = bH(a, c)), "normal" === f && c in bU && (f = bU[c]), 
            d || e !== b ? (g = parseFloat(f), d || p.isNumeric(g) ? g || 0 : f) : f;
        },
        swap: function(a, b, c) {
            var d, e, f = {};
            for (e in b) f[e] = a.style[e], a.style[e] = b[e];
            d = c.call(a);
            for (e in b) a.style[e] = f[e];
            return d;
        }
    }), a.getComputedStyle ? bH = function(b, c) {
        var d, e, f, g, h = a.getComputedStyle(b, null), i = b.style;
        return h && (d = h[c], "" === d && !p.contains(b.ownerDocument, b) && (d = p.style(b, c)), 
        bQ.test(d) && bO.test(c) && (e = i.width, f = i.minWidth, g = i.maxWidth, i.minWidth = i.maxWidth = i.width = d, 
        d = h.width, i.width = e, i.minWidth = f, i.maxWidth = g)), d;
    } : e.documentElement.currentStyle && (bH = function(a, b) {
        var c, d, e = a.currentStyle && a.currentStyle[b], f = a.style;
        return null == e && f && f[b] && (e = f[b]), bQ.test(e) && !bM.test(b) && (c = f.left, 
        d = a.runtimeStyle && a.runtimeStyle.left, d && (a.runtimeStyle.left = a.currentStyle.left), 
        f.left = "fontSize" === b ? "1em" : e, e = f.pixelLeft + "px", f.left = c, d && (a.runtimeStyle.left = d)), 
        "" === e ? "auto" : e;
    }), p.each([ "height", "width" ], function(a, b) {
        p.cssHooks[b] = {
            get: function(a, c, d) {
                if (c) return 0 === a.offsetWidth && bN.test(bH(a, "display")) ? p.swap(a, bT, function() {
                    return cb(a, b, d);
                }) : cb(a, b, d);
            },
            set: function(a, c, d) {
                return b_(a, c, d ? ca(a, b, d, p.support.boxSizing && "border-box" === p.css(a, "boxSizing")) : 0);
            }
        };
    }), p.support.opacity || (p.cssHooks.opacity = {
        get: function(a, b) {
            return bL.test((b && a.currentStyle ? a.currentStyle.filter : a.style.filter) || "") ? .01 * parseFloat(RegExp.$1) + "" : b ? "1" : "";
        },
        set: function(a, b) {
            var c = a.style, d = a.currentStyle, e = p.isNumeric(b) ? "alpha(opacity=" + 100 * b + ")" : "", f = d && d.filter || c.filter || "";
            c.zoom = 1;
            if (b >= 1 && "" === p.trim(f.replace(bK, "")) && c.removeAttribute) {
                c.removeAttribute("filter");
                if (d && !d.filter) return;
            }
            c.filter = bK.test(f) ? f.replace(bK, e) : f + " " + e;
        }
    }), p(function() {
        p.support.reliableMarginRight || (p.cssHooks.marginRight = {
            get: function(a, b) {
                return p.swap(a, {
                    display: "inline-block"
                }, function() {
                    if (b) return bH(a, "marginRight");
                });
            }
        }), !p.support.pixelPosition && p.fn.position && p.each([ "top", "left" ], function(a, b) {
            p.cssHooks[b] = {
                get: function(a, c) {
                    if (c) {
                        var d = bH(a, b);
                        return bQ.test(d) ? p(a).position()[b] + "px" : d;
                    }
                }
            };
        });
    }), p.expr && p.expr.filters && (p.expr.filters.hidden = function(a) {
        return 0 === a.offsetWidth && 0 === a.offsetHeight || !p.support.reliableHiddenOffsets && "none" === (a.style && a.style.display || bH(a, "display"));
    }, p.expr.filters.visible = function(a) {
        return !p.expr.filters.hidden(a);
    }), p.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function(a, b) {
        p.cssHooks[a + b] = {
            expand: function(c) {
                var d, e = "string" == typeof c ? c.split(" ") : [ c ], f = {};
                for (d = 0; d < 4; d++) f[a + bV[d] + b] = e[d] || e[d - 2] || e[0];
                return f;
            }
        }, bO.test(a) || (p.cssHooks[a + b].set = b_);
    });
    var cd = /%20/g, ce = /\[\]$/, cf = /\r?\n/g, cg = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i, ch = /^(?:select|textarea)/i;
    p.fn.extend({
        serialize: function() {
            return p.param(this.serializeArray());
        },
        serializeArray: function() {
            return this.map(function() {
                return this.elements ? p.makeArray(this.elements) : this;
            }).filter(function() {
                return this.name && !this.disabled && (this.checked || ch.test(this.nodeName) || cg.test(this.type));
            }).map(function(a, b) {
                var c = p(this).val();
                return null == c ? null : p.isArray(c) ? p.map(c, function(a, c) {
                    return {
                        name: b.name,
                        value: a.replace(cf, "\r\n")
                    };
                }) : {
                    name: b.name,
                    value: c.replace(cf, "\r\n")
                };
            }).get();
        }
    }), p.param = function(a, c) {
        var d, e = [], f = function(a, b) {
            b = p.isFunction(b) ? b() : null == b ? "" : b, e[e.length] = encodeURIComponent(a) + "=" + encodeURIComponent(b);
        };
        c === b && (c = p.ajaxSettings && p.ajaxSettings.traditional);
        if (p.isArray(a) || a.jquery && !p.isPlainObject(a)) p.each(a, function() {
            f(this.name, this.value);
        }); else for (d in a) ci(d, a[d], c, f);
        return e.join("&").replace(cd, "+");
    };
    var cj, ck, cl = /#.*$/, cm = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm, cn = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/, co = /^(?:GET|HEAD)$/, cp = /^\/\//, cq = /\?/, cr = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, cs = /([?&])_=[^&]*/, ct = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/, cu = p.fn.load, cv = {}, cw = {}, cx = [ "*/" ] + [ "*" ];
    try {
        ck = f.href;
    } catch (cy) {
        ck = e.createElement("a"), ck.href = "", ck = ck.href;
    }
    cj = ct.exec(ck.toLowerCase()) || [], p.fn.load = function(a, c, d) {
        if ("string" != typeof a && cu) return cu.apply(this, arguments);
        if (!this.length) return this;
        var e, f, g, h = this, i = a.indexOf(" ");
        return i >= 0 && (e = a.slice(i, a.length), a = a.slice(0, i)), p.isFunction(c) ? (d = c, 
        c = b) : c && "object" == typeof c && (f = "POST"), p.ajax({
            url: a,
            type: f,
            dataType: "html",
            data: c,
            complete: function(a, b) {
                d && h.each(d, g || [ a.responseText, b, a ]);
            }
        }).done(function(a) {
            g = arguments, h.html(e ? p("<div>").append(a.replace(cr, "")).find(e) : a);
        }), this;
    }, p.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function(a, b) {
        p.fn[b] = function(a) {
            return this.on(b, a);
        };
    }), p.each([ "get", "post" ], function(a, c) {
        p[c] = function(a, d, e, f) {
            return p.isFunction(d) && (f = f || e, e = d, d = b), p.ajax({
                type: c,
                url: a,
                data: d,
                success: e,
                dataType: f
            });
        };
    }), p.extend({
        getScript: function(a, c) {
            return p.get(a, b, c, "script");
        },
        getJSON: function(a, b, c) {
            return p.get(a, b, c, "json");
        },
        ajaxSetup: function(a, b) {
            return b ? cB(a, p.ajaxSettings) : (b = a, a = p.ajaxSettings), cB(a, b), a;
        },
        ajaxSettings: {
            url: ck,
            isLocal: cn.test(cj[1]),
            global: !0,
            type: "GET",
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            processData: !0,
            async: !0,
            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                text: "text/plain",
                json: "application/json, text/javascript",
                "*": cx
            },
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },
            responseFields: {
                xml: "responseXML",
                text: "responseText"
            },
            converters: {
                "* text": a.String,
                "text html": !0,
                "text json": p.parseJSON,
                "text xml": p.parseXML
            },
            flatOptions: {
                context: !0,
                url: !0
            }
        },
        ajaxPrefilter: cz(cv),
        ajaxTransport: cz(cw),
        ajax: function(a, c) {
            function y(a, c, f, i) {
                var k, s, t, u, w, y = c;
                if (2 === v) return;
                v = 2, h && clearTimeout(h), g = b, e = i || "", x.readyState = a > 0 ? 4 : 0, f && (u = cC(l, x, f));
                if (a >= 200 && a < 300 || 304 === a) l.ifModified && (w = x.getResponseHeader("Last-Modified"), 
                w && (p.lastModified[d] = w), w = x.getResponseHeader("Etag"), w && (p.etag[d] = w)), 
                304 === a ? (y = "notmodified", k = !0) : (k = cD(l, u), y = k.state, s = k.data, 
                t = k.error, k = !t); else {
                    t = y;
                    if (!y || a) y = "error", a < 0 && (a = 0);
                }
                x.status = a, x.statusText = (c || y) + "", k ? o.resolveWith(m, [ s, y, x ]) : o.rejectWith(m, [ x, y, t ]), 
                x.statusCode(r), r = b, j && n.trigger("ajax" + (k ? "Success" : "Error"), [ x, l, k ? s : t ]), 
                q.fireWith(m, [ x, y ]), j && (n.trigger("ajaxComplete", [ x, l ]), --p.active || p.event.trigger("ajaxStop"));
            }
            "object" == typeof a && (c = a, a = b), c = c || {};
            var d, e, f, g, h, i, j, k, l = p.ajaxSetup({}, c), m = l.context || l, n = m !== l && (m.nodeType || m instanceof p) ? p(m) : p.event, o = p.Deferred(), q = p.Callbacks("once memory"), r = l.statusCode || {}, t = {}, u = {}, v = 0, w = "canceled", x = {
                readyState: 0,
                setRequestHeader: function(a, b) {
                    if (!v) {
                        var c = a.toLowerCase();
                        a = u[c] = u[c] || a, t[a] = b;
                    }
                    return this;
                },
                getAllResponseHeaders: function() {
                    return 2 === v ? e : null;
                },
                getResponseHeader: function(a) {
                    var c;
                    if (2 === v) {
                        if (!f) {
                            f = {};
                            while (c = cm.exec(e)) f[c[1].toLowerCase()] = c[2];
                        }
                        c = f[a.toLowerCase()];
                    }
                    return c === b ? null : c;
                },
                overrideMimeType: function(a) {
                    return v || (l.mimeType = a), this;
                },
                abort: function(a) {
                    return a = a || w, g && g.abort(a), y(0, a), this;
                }
            };
            o.promise(x), x.success = x.done, x.error = x.fail, x.complete = q.add, x.statusCode = function(a) {
                if (a) {
                    var b;
                    if (v < 2) for (b in a) r[b] = [ r[b], a[b] ]; else b = a[x.status], x.always(b);
                }
                return this;
            }, l.url = ((a || l.url) + "").replace(cl, "").replace(cp, cj[1] + "//"), l.dataTypes = p.trim(l.dataType || "*").toLowerCase().split(s), 
            null == l.crossDomain && (i = ct.exec(l.url.toLowerCase()) || !1, l.crossDomain = i && i.join(":") + (i[3] ? "" : "http:" === i[1] ? 80 : 443) !== cj.join(":") + (cj[3] ? "" : "http:" === cj[1] ? 80 : 443)), 
            l.data && l.processData && "string" != typeof l.data && (l.data = p.param(l.data, l.traditional)), 
            cA(cv, l, c, x);
            if (2 === v) return x;
            j = l.global, l.type = l.type.toUpperCase(), l.hasContent = !co.test(l.type), j && 0 === p.active++ && p.event.trigger("ajaxStart");
            if (!l.hasContent) {
                l.data && (l.url += (cq.test(l.url) ? "&" : "?") + l.data, delete l.data), d = l.url;
                if (l.cache === !1) {
                    var z = p.now(), A = l.url.replace(cs, "$1_=" + z);
                    l.url = A + (A === l.url ? (cq.test(l.url) ? "&" : "?") + "_=" + z : "");
                }
            }
            (l.data && l.hasContent && l.contentType !== !1 || c.contentType) && x.setRequestHeader("Content-Type", l.contentType), 
            l.ifModified && (d = d || l.url, p.lastModified[d] && x.setRequestHeader("If-Modified-Since", p.lastModified[d]), 
            p.etag[d] && x.setRequestHeader("If-None-Match", p.etag[d])), x.setRequestHeader("Accept", l.dataTypes[0] && l.accepts[l.dataTypes[0]] ? l.accepts[l.dataTypes[0]] + ("*" !== l.dataTypes[0] ? ", " + cx + "; q=0.01" : "") : l.accepts["*"]);
            for (k in l.headers) x.setRequestHeader(k, l.headers[k]);
            if (!l.beforeSend || l.beforeSend.call(m, x, l) !== !1 && 2 !== v) {
                w = "abort";
                for (k in {
                    success: 1,
                    error: 1,
                    complete: 1
                }) x[k](l[k]);
                g = cA(cw, l, c, x);
                if (!g) y(-1, "No Transport"); else {
                    x.readyState = 1, j && n.trigger("ajaxSend", [ x, l ]), l.async && l.timeout > 0 && (h = setTimeout(function() {
                        x.abort("timeout");
                    }, l.timeout));
                    try {
                        v = 1, g.send(t, y);
                    } catch (B) {
                        if (v < 2) y(-1, B); else throw B;
                    }
                }
                return x;
            }
            return x.abort();
        },
        active: 0,
        lastModified: {},
        etag: {}
    });
    var cE = [], cF = /\?/, cG = /(=)\?(?=&|$)|\?\?/, cH = p.now();
    p.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
            var a = cE.pop() || p.expando + "_" + cH++;
            return this[a] = !0, a;
        }
    }), p.ajaxPrefilter("json jsonp", function(c, d, e) {
        var f, g, h, i = c.data, j = c.url, k = c.jsonp !== !1, l = k && cG.test(j), m = k && !l && "string" == typeof i && !(c.contentType || "").indexOf("application/x-www-form-urlencoded") && cG.test(i);
        if ("jsonp" === c.dataTypes[0] || l || m) return f = c.jsonpCallback = p.isFunction(c.jsonpCallback) ? c.jsonpCallback() : c.jsonpCallback, 
        g = a[f], l ? c.url = j.replace(cG, "$1" + f) : m ? c.data = i.replace(cG, "$1" + f) : k && (c.url += (cF.test(j) ? "&" : "?") + c.jsonp + "=" + f), 
        c.converters["script json"] = function() {
            return h || p.error(f + " was not called"), h[0];
        }, c.dataTypes[0] = "json", a[f] = function() {
            h = arguments;
        }, e.always(function() {
            a[f] = g, c[f] && (c.jsonpCallback = d.jsonpCallback, cE.push(f)), h && p.isFunction(g) && g(h[0]), 
            h = g = b;
        }), "script";
    }), p.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /javascript|ecmascript/
        },
        converters: {
            "text script": function(a) {
                return p.globalEval(a), a;
            }
        }
    }), p.ajaxPrefilter("script", function(a) {
        a.cache === b && (a.cache = !1), a.crossDomain && (a.type = "GET", a.global = !1);
    }), p.ajaxTransport("script", function(a) {
        if (a.crossDomain) {
            var c, d = e.head || e.getElementsByTagName("head")[0] || e.documentElement;
            return {
                send: function(f, g) {
                    c = e.createElement("script"), c.async = "async", a.scriptCharset && (c.charset = a.scriptCharset), 
                    c.src = a.url, c.onload = c.onreadystatechange = function(a, e) {
                        if (e || !c.readyState || /loaded|complete/.test(c.readyState)) c.onload = c.onreadystatechange = null, 
                        d && c.parentNode && d.removeChild(c), c = b, e || g(200, "success");
                    }, d.insertBefore(c, d.firstChild);
                },
                abort: function() {
                    c && c.onload(0, 1);
                }
            };
        }
    });
    var cI, cJ = a.ActiveXObject ? function() {
        for (var a in cI) cI[a](0, 1);
    } : !1, cK = 0;
    p.ajaxSettings.xhr = a.ActiveXObject ? function() {
        return !this.isLocal && cL() || cM();
    } : cL, function(a) {
        p.extend(p.support, {
            ajax: !!a,
            cors: !!a && "withCredentials" in a
        });
    }(p.ajaxSettings.xhr()), p.support.ajax && p.ajaxTransport(function(c) {
        if (!c.crossDomain || p.support.cors) {
            var d;
            return {
                send: function(e, f) {
                    var g, h, i = c.xhr();
                    c.username ? i.open(c.type, c.url, c.async, c.username, c.password) : i.open(c.type, c.url, c.async);
                    if (c.xhrFields) for (h in c.xhrFields) i[h] = c.xhrFields[h];
                    c.mimeType && i.overrideMimeType && i.overrideMimeType(c.mimeType), !c.crossDomain && !e["X-Requested-With"] && (e["X-Requested-With"] = "XMLHttpRequest");
                    try {
                        for (h in e) i.setRequestHeader(h, e[h]);
                    } catch (j) {}
                    i.send(c.hasContent && c.data || null), d = function(a, e) {
                        var h, j, k, l, m;
                        try {
                            if (d && (e || 4 === i.readyState)) {
                                d = b, g && (i.onreadystatechange = p.noop, cJ && delete cI[g]);
                                if (e) 4 !== i.readyState && i.abort(); else {
                                    h = i.status, k = i.getAllResponseHeaders(), l = {}, m = i.responseXML, m && m.documentElement && (l.xml = m);
                                    try {
                                        l.text = i.responseText;
                                    } catch (a) {}
                                    try {
                                        j = i.statusText;
                                    } catch (n) {
                                        j = "";
                                    }
                                    !h && c.isLocal && !c.crossDomain ? h = l.text ? 200 : 404 : 1223 === h && (h = 204);
                                }
                            }
                        } catch (o) {
                            e || f(-1, o);
                        }
                        l && f(h, j, l, k);
                    }, c.async ? 4 === i.readyState ? setTimeout(d, 0) : (g = ++cK, cJ && (cI || (cI = {}, 
                    p(a).unload(cJ)), cI[g] = d), i.onreadystatechange = d) : d();
                },
                abort: function() {
                    d && d(0, 1);
                }
            };
        }
    });
    var cN, cO, cP = /^(?:toggle|show|hide)$/, cQ = new RegExp("^(?:([-+])=|)(" + q + ")([a-z%]*)$", "i"), cR = /queueHooks$/, cS = [ cY ], cT = {
        "*": [ function(a, b) {
            var c, d, e = this.createTween(a, b), f = cQ.exec(b), g = e.cur(), h = +g || 0, i = 1, j = 20;
            if (f) {
                c = +f[2], d = f[3] || (p.cssNumber[a] ? "" : "px");
                if ("px" !== d && h) {
                    h = p.css(e.elem, a, !0) || c || 1;
                    do i = i || ".5", h /= i, p.style(e.elem, a, h + d); while (i !== (i = e.cur() / g) && 1 !== i && --j);
                }
                e.unit = d, e.start = h, e.end = f[1] ? h + (f[1] + 1) * c : c;
            }
            return e;
        } ]
    };
    p.Animation = p.extend(cW, {
        tweener: function(a, b) {
            p.isFunction(a) ? (b = a, a = [ "*" ]) : a = a.split(" ");
            var c, d = 0, e = a.length;
            for (;d < e; d++) c = a[d], cT[c] = cT[c] || [], cT[c].unshift(b);
        },
        prefilter: function(a, b) {
            b ? cS.unshift(a) : cS.push(a);
        }
    }), p.Tween = cZ, cZ.prototype = {
        constructor: cZ,
        init: function(a, b, c, d, e, f) {
            this.elem = a, this.prop = c, this.easing = e || "swing", this.options = b, this.start = this.now = this.cur(), 
            this.end = d, this.unit = f || (p.cssNumber[c] ? "" : "px");
        },
        cur: function() {
            var a = cZ.propHooks[this.prop];
            return a && a.get ? a.get(this) : cZ.propHooks._default.get(this);
        },
        run: function(a) {
            var b, c = cZ.propHooks[this.prop];
            return this.options.duration ? this.pos = b = p.easing[this.easing](a, this.options.duration * a, 0, 1, this.options.duration) : this.pos = b = a, 
            this.now = (this.end - this.start) * b + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), 
            c && c.set ? c.set(this) : cZ.propHooks._default.set(this), this;
        }
    }, cZ.prototype.init.prototype = cZ.prototype, cZ.propHooks = {
        _default: {
            get: function(a) {
                var b;
                return null == a.elem[a.prop] || !!a.elem.style && null != a.elem.style[a.prop] ? (b = p.css(a.elem, a.prop, !1, ""), 
                !b || "auto" === b ? 0 : b) : a.elem[a.prop];
            },
            set: function(a) {
                p.fx.step[a.prop] ? p.fx.step[a.prop](a) : a.elem.style && (null != a.elem.style[p.cssProps[a.prop]] || p.cssHooks[a.prop]) ? p.style(a.elem, a.prop, a.now + a.unit) : a.elem[a.prop] = a.now;
            }
        }
    }, cZ.propHooks.scrollTop = cZ.propHooks.scrollLeft = {
        set: function(a) {
            a.elem.nodeType && a.elem.parentNode && (a.elem[a.prop] = a.now);
        }
    }, p.each([ "toggle", "show", "hide" ], function(a, b) {
        var c = p.fn[b];
        p.fn[b] = function(d, e, f) {
            return null == d || "boolean" == typeof d || !a && p.isFunction(d) && p.isFunction(e) ? c.apply(this, arguments) : this.animate(c$(b, !0), d, e, f);
        };
    }), p.fn.extend({
        fadeTo: function(a, b, c, d) {
            return this.filter(bZ).css("opacity", 0).show().end().animate({
                opacity: b
            }, a, c, d);
        },
        animate: function(a, b, c, d) {
            var e = p.isEmptyObject(a), f = p.speed(b, c, d), g = function() {
                var b = cW(this, p.extend({}, a), f);
                e && b.stop(!0);
            };
            return e || f.queue === !1 ? this.each(g) : this.queue(f.queue, g);
        },
        stop: function(a, c, d) {
            var e = function(a) {
                var b = a.stop;
                delete a.stop, b(d);
            };
            return "string" != typeof a && (d = c, c = a, a = b), c && a !== !1 && this.queue(a || "fx", []), 
            this.each(function() {
                var b = !0, c = null != a && a + "queueHooks", f = p.timers, g = p._data(this);
                if (c) g[c] && g[c].stop && e(g[c]); else for (c in g) g[c] && g[c].stop && cR.test(c) && e(g[c]);
                for (c = f.length; c--; ) f[c].elem === this && (null == a || f[c].queue === a) && (f[c].anim.stop(d), 
                b = !1, f.splice(c, 1));
                (b || !d) && p.dequeue(this, a);
            });
        }
    }), p.each({
        slideDown: c$("show"),
        slideUp: c$("hide"),
        slideToggle: c$("toggle"),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        },
        fadeToggle: {
            opacity: "toggle"
        }
    }, function(a, b) {
        p.fn[a] = function(a, c, d) {
            return this.animate(b, a, c, d);
        };
    }), p.speed = function(a, b, c) {
        var d = a && "object" == typeof a ? p.extend({}, a) : {
            complete: c || !c && b || p.isFunction(a) && a,
            duration: a,
            easing: c && b || b && !p.isFunction(b) && b
        };
        d.duration = p.fx.off ? 0 : "number" == typeof d.duration ? d.duration : d.duration in p.fx.speeds ? p.fx.speeds[d.duration] : p.fx.speeds._default;
        if (null == d.queue || d.queue === !0) d.queue = "fx";
        return d.old = d.complete, d.complete = function() {
            p.isFunction(d.old) && d.old.call(this), d.queue && p.dequeue(this, d.queue);
        }, d;
    }, p.easing = {
        linear: function(a) {
            return a;
        },
        swing: function(a) {
            return .5 - Math.cos(a * Math.PI) / 2;
        }
    }, p.timers = [], p.fx = cZ.prototype.init, p.fx.tick = function() {
        var a, b = p.timers, c = 0;
        for (;c < b.length; c++) a = b[c], !a() && b[c] === a && b.splice(c--, 1);
        b.length || p.fx.stop();
    }, p.fx.timer = function(a) {
        a() && p.timers.push(a) && !cO && (cO = setInterval(p.fx.tick, p.fx.interval));
    }, p.fx.interval = 13, p.fx.stop = function() {
        clearInterval(cO), cO = null;
    }, p.fx.speeds = {
        slow: 600,
        fast: 200,
        _default: 400
    }, p.fx.step = {}, p.expr && p.expr.filters && (p.expr.filters.animated = function(a) {
        return p.grep(p.timers, function(b) {
            return a === b.elem;
        }).length;
    });
    var c_ = /^(?:body|html)$/i;
    p.fn.offset = function(a) {
        if (arguments.length) return a === b ? this : this.each(function(b) {
            p.offset.setOffset(this, a, b);
        });
        var c, d, e, f, g, h, i, j = {
            top: 0,
            left: 0
        }, k = this[0], l = k && k.ownerDocument;
        if (!l) return;
        return (d = l.body) === k ? p.offset.bodyOffset(k) : (c = l.documentElement, p.contains(c, k) ? ("undefined" != typeof k.getBoundingClientRect && (j = k.getBoundingClientRect()), 
        e = da(l), f = c.clientTop || d.clientTop || 0, g = c.clientLeft || d.clientLeft || 0, 
        h = e.pageYOffset || c.scrollTop, i = e.pageXOffset || c.scrollLeft, {
            top: j.top + h - f,
            left: j.left + i - g
        }) : j);
    }, p.offset = {
        bodyOffset: function(a) {
            var b = a.offsetTop, c = a.offsetLeft;
            return p.support.doesNotIncludeMarginInBodyOffset && (b += parseFloat(p.css(a, "marginTop")) || 0, 
            c += parseFloat(p.css(a, "marginLeft")) || 0), {
                top: b,
                left: c
            };
        },
        setOffset: function(a, b, c) {
            var d = p.css(a, "position");
            "static" === d && (a.style.position = "relative");
            var e = p(a), f = e.offset(), g = p.css(a, "top"), h = p.css(a, "left"), i = ("absolute" === d || "fixed" === d) && p.inArray("auto", [ g, h ]) > -1, j = {}, k = {}, l, m;
            i ? (k = e.position(), l = k.top, m = k.left) : (l = parseFloat(g) || 0, m = parseFloat(h) || 0), 
            p.isFunction(b) && (b = b.call(a, c, f)), null != b.top && (j.top = b.top - f.top + l), 
            null != b.left && (j.left = b.left - f.left + m), "using" in b ? b.using.call(a, j) : e.css(j);
        }
    }, p.fn.extend({
        position: function() {
            if (!this[0]) return;
            var a = this[0], b = this.offsetParent(), c = this.offset(), d = c_.test(b[0].nodeName) ? {
                top: 0,
                left: 0
            } : b.offset();
            return c.top -= parseFloat(p.css(a, "marginTop")) || 0, c.left -= parseFloat(p.css(a, "marginLeft")) || 0, 
            d.top += parseFloat(p.css(b[0], "borderTopWidth")) || 0, d.left += parseFloat(p.css(b[0], "borderLeftWidth")) || 0, 
            {
                top: c.top - d.top,
                left: c.left - d.left
            };
        },
        offsetParent: function() {
            return this.map(function() {
                var a = this.offsetParent || e.body;
                while (a && !c_.test(a.nodeName) && "static" === p.css(a, "position")) a = a.offsetParent;
                return a || e.body;
            });
        }
    }), p.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
    }, function(a, c) {
        var d = /Y/.test(c);
        p.fn[a] = function(e) {
            return p.access(this, function(a, e, f) {
                var g = da(a);
                if (f === b) return g ? c in g ? g[c] : g.document.documentElement[e] : a[e];
                g ? g.scrollTo(d ? p(g).scrollLeft() : f, d ? f : p(g).scrollTop()) : a[e] = f;
            }, a, e, arguments.length, null);
        };
    }), p.each({
        Height: "height",
        Width: "width"
    }, function(a, c) {
        p.each({
            padding: "inner" + a,
            content: c,
            "": "outer" + a
        }, function(d, e) {
            p.fn[e] = function(e, f) {
                var g = arguments.length && (d || "boolean" != typeof e), h = d || (e === !0 || f === !0 ? "margin" : "border");
                return p.access(this, function(c, d, e) {
                    var f;
                    return p.isWindow(c) ? c.document.documentElement["client" + a] : 9 === c.nodeType ? (f = c.documentElement, 
                    Math.max(c.body["scroll" + a], f["scroll" + a], c.body["offset" + a], f["offset" + a], f["client" + a])) : e === b ? p.css(c, d, e, h) : p.style(c, d, e, h);
                }, c, g ? e : b, g, null);
            };
        });
    }), a.jQuery = a.$ = p, "function" == typeof define && define.amd && define.amd.jQuery && define("jquery", [], function() {
        return p;
    });
}(window);

include.getResource("/.reference/atma/ruqq/lib/dom/jquery.js", "js").readystatechanged(3);

include.setCurrent({
    id: "/.reference/atma/class/lib/class.js",
    namespace: "",
    url: "/.reference/atma/class/lib/class.js"
});

/*!
 * ClassJS v1.0.64
 * Part of the Atma.js Project
 * http://atmajs.com/
 *
 * MIT license
 * http://opensource.org/licenses/MIT
 *
 * (c) 2012, 2014 Atma.js and other contributors
 */
!function(root, factory) {
    var _global = "undefined" === typeof window || null == window.navigator ? global : window, _exports;
    _exports = root || _global;
    function construct() {
        return factory(_global, _exports);
    }
    if ("function" === typeof define && define.amd) return define(construct);
    construct();
    if ("undefined" !== typeof module) module.exports = _exports.Class;
}(this, function(global, exports) {
    var _Array_slice = Array.prototype.slice, _Array_sort = Array.prototype.sort, _cfg = {
        ModelHost: null
    };
    var str_CLASS_IDENTITY = "__$class__";
    var is_Function, is_Object, is_Array, is_String, is_notEmptyString, is_rawObject, is_NullOrGlobal;
    !function() {
        is_Function = function(x) {
            return "function" === typeof x;
        };
        is_Object = function(x) {
            return null != x && "object" === typeof x;
        };
        is_Array = function(x) {
            return null != x && "number" === typeof x.length && "function" === typeof x.slice;
        };
        is_String = function(x) {
            return "string" === typeof x;
        };
        is_notEmptyString = function(x) {
            return "string" === typeof x && "" !== x;
        };
        is_rawObject = function(obj) {
            if (null == obj) return false;
            if ("object" !== typeof obj) return false;
            return obj.constructor === Object;
        };
        is_NullOrGlobal = function(ctx) {
            return ctx === void 0 || ctx === global;
        };
    }();
    var arr_each, arr_isArray, arr_remove;
    !function() {
        arr_each = function(array, callback) {
            if (arr_isArray(array)) {
                for (var i = 0, imax = array.length; i < imax; i++) callback(array[i], i);
                return;
            }
            callback(array);
        };
        arr_isArray = function(array) {
            return null != array && "object" === typeof array && "number" === typeof array.length && "function" === typeof array.splice;
        };
        arr_remove = function(array, fn) {
            var imax = array.length, i = -1;
            while (++i < imax) if (true === fn(array[i])) {
                array.splice(i, 1);
                i--;
                imax--;
            }
        };
        if ("function" !== typeof Array.isArray) Array.isArray = function(array) {
            if (array instanceof Array) return true;
            if (null == array || "object" !== typeof array) return false;
            return array.length !== void 0 && "function" === typeof array.slice;
        };
    }();
    var class_register, class_get, class_patch, class_stringify, class_parse, class_properties;
    !function() {
        class_register = function(namespace, class_) {
            obj_setProperty(_cfg.ModelHost || Class.Model, namespace, class_);
        };
        class_get = function(namespace) {
            return obj_getProperty(_cfg.ModelHost || Class.Model, namespace);
        };
        class_patch = function(mix, Proto) {
            var class_ = is_String(mix) ? class_get(mix) : mix;
            !is_Function(class_) && console.error("<class:patch> Not a Function", mix);
            Proto.Base = class_;
            class_ = Class(Proto);
            if (is_String(mix)) class_register(mix, class_);
            return class_;
        };
        class_stringify = function(class_) {
            return JSON.stringify(class_, stringify);
        };
        class_parse = function(str) {
            return JSON.parse(str, parse);
        };
        class_properties = function(Ctor) {
            return getProperties(Ctor);
        };
        function stringify(key, val) {
            if (null == val || "object" !== typeof val) return val;
            var current = this, obj = current[key];
            if (obj[str_CLASS_IDENTITY] && obj.toJSON) return stringifyMetaJSON(obj[str_CLASS_IDENTITY], val);
            return val;
        }
        function stringifyMetaJSON(className, json) {
            var out = {};
            out["json"] = json;
            out[str_CLASS_IDENTITY] = className;
            return out;
        }
        function parse(key, val) {
            var Ctor;
            if (null != val && "object" === typeof val && val[str_CLASS_IDENTITY]) {
                Ctor = Class(val[str_CLASS_IDENTITY]);
                if ("function" === typeof Ctor) val = new Ctor(val.json); else console.error("<class:parse> Class was not registered", val[str_CLASS_IDENTITY]);
            }
            return val;
        }
        function getProperties(proto, out) {
            if ("function" === typeof proto) proto = proto.prototype;
            if (null == out) out = {};
            var type, key, val;
            for (key in proto) {
                val = proto[key];
                type = null == val ? null : typeof val;
                if ("function" === type) continue;
                var c = key.charCodeAt(0);
                if (95 === c && "_id" !== key) continue;
                if (c >= 65 && c <= 90) continue;
                if ("object" === type) {
                    var ctor = val.constructor, ctor_name = ctor && ctor.name;
                    if ("Object" !== ctor_name && ctor_name && global[ctor_name] === ctor) {
                        out[key] = ctor_name;
                        continue;
                    }
                    out[key] = getProperties(val);
                    continue;
                }
                out[key] = type;
            }
            if (proto.__proto__) getProperties(proto.__proto__, out);
            return out;
        }
    }();
    var class_inherit, class_inheritStatics, class_extendProtoObjects;
    !function() {
        var PROTO = "__proto__";
        var _toString = Object.prototype.toString, _isArguments = function(args) {
            return "[object Arguments]" === _toString.call(args);
        };
        class_inherit = PROTO in Object.prototype ? inherit : inherit_protoLess;
        class_inheritStatics = function(_class, mix) {
            if (null == mix) return;
            if (is_Function(mix)) {
                for (var key in mix) if (mix.hasOwnProperty(key) && null == _class[key]) _class[key] = mix[key];
                return;
            }
            if (Array.isArray(mix)) {
                var imax = mix.length, i = -1;
                while (++i < imax) class_inheritStatics(_class, mix[i]);
                return;
            }
            if (mix.Static) {
                mix = mix.Static;
                for (var key in mix) if (mix.hasOwnProperty(key) && null == _class[key]) _class[key] = mix[key];
                return;
            }
        };
        class_extendProtoObjects = function(proto, _base, _extends) {
            var key, protoValue;
            for (key in proto) {
                protoValue = proto[key];
                if (!is_rawObject(protoValue)) continue;
                if (null != _base) if (is_rawObject(_base.prototype[key])) obj_defaults(protoValue, _base.prototype[key]);
                if (null != _extends) arr_each(_extends, function(x) {
                    x = proto_getProto(x);
                    if (is_rawObject(x[key])) obj_defaults(protoValue, x[key]);
                });
            }
        };
        function proto_extend(proto, source) {
            if (null == source) return;
            if ("function" === typeof proto) proto = proto.prototype;
            if ("function" === typeof source) source = source.prototype;
            var key, val;
            for (key in source) {
                val = source[key];
                if (null != val) proto[key] = val;
            }
        }
        function proto_override(super_, fn) {
            var proxy;
            if (super_) proxy = function(mix) {
                var args = 1 === arguments.length && _isArguments(mix) ? mix : arguments;
                return fn_apply(super_, this, args);
            }; else proxy = fn_doNothing;
            return function() {
                this["super"] = proxy;
                return fn_apply(fn, this, arguments);
            };
        }
        function inherit(_class, _base, _extends, original, _overrides, defaults) {
            var prototype = original, proto = original;
            prototype.constructor = _class.prototype.constructor;
            if (null != _extends) {
                proto[PROTO] = {};
                arr_each(_extends, function(x) {
                    proto_extend(proto[PROTO], x);
                });
                proto = proto[PROTO];
            }
            if (null != _base) proto[PROTO] = _base.prototype;
            for (var key in defaults) if (null == prototype[key]) prototype[key] = defaults[key];
            for (var key in _overrides) prototype[key] = proto_override(prototype[key], _overrides[key]);
            _class.prototype = prototype;
        }
        function inherit_protoLess(_class, _base, _extends, original, _overrides, defaults) {
            if (null != _base) {
                var tmp = function() {};
                tmp.prototype = _base.prototype;
                _class.prototype = new tmp();
                _class.prototype.constructor = _class;
            }
            if (null != _extends) arr_each(_extends, function(x) {
                delete x.constructor;
                proto_extend(_class, x);
            });
            var prototype = _class.prototype;
            obj_defaults(prototype, defaults);
            for (var key in _overrides) prototype[key] = proto_override(prototype[key], _overrides[key]);
            proto_extend(_class, original);
        }
        function proto_getProto(mix) {
            return is_Function(mix) ? mix.prototype : mix;
        }
    }();
    var json_key_SER = "__$serialization", json_proto_toJSON, json_proto_arrayToJSON;
    !function() {
        json_proto_toJSON = function(serialization) {
            var object = this, json = {}, key, val, s;
            if (null == serialization) serialization = object[json_key_SER];
            var asKey;
            for (key in object) {
                asKey = key;
                if (null != serialization && serialization.hasOwnProperty(key)) {
                    s = serialization[key];
                    if (null != s && "object" === typeof s) {
                        if (s.key) asKey = s.key;
                        if (s.hasOwnProperty("serialize")) {
                            if (null == s.serialize) continue;
                            json[asKey] = s.serialize(object[key]);
                            continue;
                        }
                    }
                }
                if (95 === key.charCodeAt(0)) continue;
                if ("Static" === key || "Validate" === key) continue;
                val = object[key];
                if (null == val) continue;
                if ("_id" === key) {
                    json[asKey] = val;
                    continue;
                }
                switch (typeof val) {
                  case "function":
                    continue;

                  case "object":
                    var toJSON = val.toJSON;
                    if (null == toJSON) break;
                    json[asKey] = val.toJSON();
                    continue;
                }
                json[asKey] = val;
            }
            if (null != object._id) json._id = object._id;
            return json;
        };
        json_proto_arrayToJSON = function() {
            var array = this, imax = array.length, i = 0, output = new Array(imax), x;
            for (;i < imax; i++) {
                x = array[i];
                if (null != x && "object" === typeof x) {
                    var toJSON = x.toJSON;
                    if (toJSON === json_proto_toJSON || toJSON === json_proto_arrayToJSON) {
                        output[i] = x.toJSON();
                        continue;
                    }
                    if (null == toJSON) {
                        output[i] = json_proto_toJSON.call(x);
                        continue;
                    }
                }
                output[i] = x;
            }
            return output;
        };
    }();
    var obj_inherit, obj_getProperty, obj_setProperty, obj_defaults, obj_extend, obj_validate;
    !function() {
        obj_inherit = function(target) {
            if (is_Function(target)) target = target.prototype;
            var i = 1, imax = arguments.length, source, key;
            for (;i < imax; i++) {
                source = is_Function(arguments[i]) ? arguments[i].prototype : arguments[i];
                for (key in source) {
                    if ("Static" === key) if (null != target.Static) {
                        for (key in source.Static) target.Static[key] = source.Static[key];
                        continue;
                    }
                    target[key] = source[key];
                }
            }
            return target;
        };
        obj_getProperty = function(obj, property) {
            var chain = property.split("."), imax = chain.length, i = -1;
            while (++i < imax) {
                if (null == obj) return null;
                obj = obj[chain[i]];
            }
            return obj;
        };
        obj_setProperty = function(obj, property, value) {
            var chain = property.split("."), imax = chain.length, i = -1, key;
            while (++i < imax - 1) {
                key = chain[i];
                if (null == obj[key]) obj[key] = {};
                obj = obj[key];
            }
            obj[chain[i]] = value;
        };
        obj_defaults = function(target, defaults) {
            for (var key in defaults) if (null == target[key]) target[key] = defaults[key];
            return target;
        };
        obj_extend = function(target, source) {
            if (null == target) target = {};
            if (null == source) return target;
            var val, key;
            for (key in source) {
                val = source[key];
                if (null != val) target[key] = val;
            }
            return target;
        };
        !function() {
            obj_validate = function(a) {
                if (null == a) return Err_Invalid("object");
                _props = null;
                _strict = false;
                var i = arguments.length, validator, x;
                while (--i > 0) {
                    x = arguments[i];
                    switch (typeof x) {
                      case "string":
                        if (null == _props) _props = {};
                        _props[x] = 1;
                        continue;

                      case "boolean":
                        _strict = x;
                        continue;

                      case "undefined":
                        continue;

                      default:
                        if (1 !== i) return Err_Invalid("validation argument at " + i);
                        validator = x;
                        continue;
                    }
                }
                if (null == validator) validator = a.Validate;
                if (null == validator) return null;
                return checkObject(a, validator, a);
            };
            var _strict = false, _props = null;
            function checkObject(a, b, ctx) {
                var error, optional, key, aVal, aKey;
                for (key in b) {
                    if (null != _props && a === ctx && false === _props.hasOwnProperty(key)) continue;
                    switch (key.charCodeAt(0)) {
                      case 63:
                        aKey = key.substring(1);
                        aVal = a[aKey];
                        //! accept falsy value
                        if (!aVal) continue;
                        error = checkProperty(aVal, b[key], ctx);
                        if (null != error) {
                            error.setInvalidProperty(aKey);
                            return error;
                        }
                        continue;

                      case 45:
                        aKey = key.substring(1);
                        if ("object" === typeof a && aKey in a) return Err_Unexpect(aKey);
                        continue;
                    }
                    aVal = a[key];
                    if (null == aVal) return Err_Expect(key);
                    error = checkProperty(aVal, b[key], ctx);
                    if (null != error) {
                        error.setInvalidProperty(key);
                        return error;
                    }
                }
                if (_strict) for (key in a) {
                    if (key in b || "?" + key in b) continue;
                    return Err_Unexpect(key);
                }
            }
            function checkProperty(aVal, bVal, ctx) {
                if (null == bVal) return null;
                if ("function" === typeof bVal) {
                    var error = bVal.call(ctx, aVal);
                    if (null == error || true === error) return null;
                    if (false === error) return Err_Invalid();
                    return Err_Custom(error);
                }
                if (null == aVal) return Err_Expect();
                if ("string" === typeof bVal) {
                    var str = "string", num = "number", bool = "boolean";
                    switch (bVal) {
                      case str:
                        return typeof aVal !== str || 0 === aVal.length ? Err_Type(str) : null;

                      case num:
                        return typeof aVal !== num ? Err_Type(num) : null;

                      case bool:
                        return typeof aVal !== bool ? Err_Type(bool) : null;
                    }
                }
                if (bVal instanceof RegExp) return false === bVal.test(aVal) ? Err_Invalid() : null;
                if (Array.isArray(bVal)) {
                    if (false === Array.isArray(aVal)) return Err_Type("array");
                    var i = -1, imax = aVal.length, error;
                    while (++i < imax) {
                        error = checkObject(aVal[i], bVal[0]);
                        if (error) {
                            error.setInvalidProperty(i);
                            return error;
                        }
                    }
                    return null;
                }
                if (typeof aVal !== typeof bVal) return Err_Type(typeof aVal);
                if ("object" === typeof aVal) return checkObject(aVal, bVal);
                return null;
            }
            var Err_Type, Err_Expect, Err_Unexpect, Err_Custom, Err_Invalid;
            !function() {
                Err_Type = create("type", function TypeErr(expect) {
                    this.expect = expect;
                }, {
                    toString: function() {
                        return "Invalid type." + (this.expect ? " Expect: " + this.expect : "") + (this.property ? " Property: " + this.property : "");
                    }
                });
                Err_Expect = create("expect", function ExpectErr(property) {
                    this.property = property;
                }, {
                    toString: function() {
                        return "Property expected." + (this.property ? "`" + this.property + "`" : "");
                    }
                });
                Err_Unexpect = create("unexpect", function UnexpectErr(property) {
                    this.property = property;
                }, {
                    toString: function() {
                        return "Unexpected property" + (this.property ? "`" + this.property + "`" : "");
                    }
                });
                Err_Custom = create("custom", function CustomErr(error) {
                    this.error = error;
                }, {
                    toString: function() {
                        return "Custom validation: " + this.error + (this.property ? " Property: " + this.property : "");
                    }
                });
                Err_Invalid = create("invalid", function InvalidErr(expect) {
                    this.expect = expect;
                }, {
                    toString: function() {
                        return "Invalid." + (this.expect ? " Expect: " + this.expect : "") + (this.property ? " Property: " + this.property : "");
                    }
                });
                function create(type, Ctor, proto) {
                    proto.type = type;
                    proto.property = null;
                    proto.setInvalidProperty = setInvalidProperty;
                    Ctor.prototype = proto;
                    return function(mix) {
                        return new Ctor(mix);
                    };
                }
                function setInvalidProperty(prop) {
                    if (null == this.property) {
                        this.property = prop;
                        return;
                    }
                    this.property = prop + "." + this.property;
                }
            }();
        }();
    }();
    var obj_patch, obj_patchValidate;
    !function() {
        obj_patch = function(obj, patch) {
            for (var key in patch) {
                var patcher = patches[key];
                if (patcher) patcher[fn_WALKER](obj, patch[key], patcher[fn_MODIFIER]); else console.error("Unknown or not implemented patcher", key);
            }
            return obj;
        };
        obj_patchValidate = function(patch) {
            if (null == patch) return "Undefined";
            var has = false;
            for (var key in patch) {
                has = true;
                if (null == patches[key]) return "Unsupported patcher: " + key;
            }
            if (false === has) return "No data";
            return null;
        };
        function walk_mutator(obj, data, fn) {
            for (var key in data) fn(obj_getProperty(obj, key), data[key], key);
        }
        function walk_modifier(obj, data, fn) {
            for (var key in data) obj_setProperty(obj, key, fn(obj_getProperty(obj, key), data[key], key));
        }
        function fn_IoC() {
            var fns = arguments;
            return function(val, mix, prop) {
                for (var i = 0, fn, imax = fns.length; i < imax; i++) {
                    fn = fns[i];
                    if (false === fn(val, mix, prop)) return;
                }
            };
        }
        function arr_checkArray(val, mix, prop) {
            if (false === arr_isArray(val)) {
                console.warn("<patch> property is not an array", prop);
                return false;
            }
        }
        function arr_push(val, mix, prop) {
            if (mix.hasOwnProperty("$each")) {
                for (var i = 0, imax = mix.$each.length; i < imax; i++) val.push(mix.$each[i]);
                return;
            }
            val.push(mix);
        }
        function arr_pop(val, mix, prop) {
            val[mix > 0 ? "pop" : "shift"]();
        }
        function arr_pull(val, mix, prop) {
            arr_remove(val, function(item) {
                return query_match(item, mix);
            });
        }
        function val_inc(val, mix, key) {
            return val + mix;
        }
        function val_set(val, mix, key) {
            return mix;
        }
        function val_unset() {
            return void 0;
        }
        function val_bit(val, mix) {
            if (mix.or) return val | mix.or;
            if (mix.and) return val & mix.and;
            return val;
        }
        var query_match;
        !function() {
            query_match = function(obj, mix) {
                for (var key in mix) if (obj[key] !== mix[key]) return false;
                return true;
            };
        }();
        var fn_WALKER = 0, fn_MODIFIER = 1;
        var patches = {
            $push: [ walk_mutator, fn_IoC(arr_checkArray, arr_push) ],
            $pop: [ walk_mutator, fn_IoC(arr_checkArray, arr_pop) ],
            $pull: [ walk_mutator, fn_IoC(arr_checkArray, arr_pull) ],
            $inc: [ walk_modifier, val_inc ],
            $set: [ walk_modifier, val_set ],
            $unset: [ walk_modifier, val_unset ],
            $bit: [ walk_modifier, val_unset ]
        };
    }();
    function fn_proxy(fn, ctx) {
        return function() {
            return fn_apply(fn, ctx, arguments);
        };
    }
    function fn_apply(fn, ctx, _arguments) {
        switch (_arguments.length) {
          case 0:
            return fn.call(ctx);

          case 1:
            return fn.call(ctx, _arguments[0]);

          case 2:
            return fn.call(ctx, _arguments[0], _arguments[1]);

          case 3:
            return fn.call(ctx, _arguments[0], _arguments[1], _arguments[2]);

          case 4:
            return fn.call(ctx, _arguments[0], _arguments[1], _arguments[2], _arguments[3]);

          case 5:
            return fn.call(ctx, _arguments[0], _arguments[1], _arguments[2], _arguments[3], _arguments[4]);
        }
        return fn.apply(ctx, _arguments);
    }
    function fn_isFunction(fn) {
        return "function" === typeof fn;
    }
    function fn_createDelegate(fn) {
        var args = _Array_slice.call(arguments, 1);
        return function() {
            if (arguments.length > 0) args = args.concat(_Array_slice.call(arguments));
            return fn_apply(fn, null, args);
        };
    }
    function fn_doNothing() {}
    var XHR = {};
    (function() {
        !function(exports) {
            var ct_URL_ENCODED = "application/x-www-form-urlencoded", ct_JSON = "application/json";
            var e_NO_XHR = 1, e_TIMEOUT = 2, e_PRAPAIR_DATA = 3;
            function Promise() {
                this._callbacks = [];
            }
            Promise.prototype.then = function(func, context) {
                var p;
                if (this._isdone) p = func.apply(context, this.result); else {
                    p = new Promise();
                    this._callbacks.push(function() {
                        var res = func.apply(context, arguments);
                        if (res && "function" === typeof res.then) res.then(p.done, p);
                    });
                }
                return p;
            };
            Promise.prototype.done = function() {
                this.result = arguments;
                this._isdone = true;
                for (var i = 0; i < this._callbacks.length; i++) this._callbacks[i].apply(null, arguments);
                this._callbacks = [];
            };
            function join(promises) {
                var p = new Promise();
                var results = [];
                if (!promises || !promises.length) {
                    p.done(results);
                    return p;
                }
                var numdone = 0;
                var total = promises.length;
                function notifier(i) {
                    return function() {
                        numdone += 1;
                        results[i] = Array.prototype.slice.call(arguments);
                        if (numdone === total) p.done(results);
                    };
                }
                for (var i = 0; i < total; i++) promises[i].then(notifier(i));
                return p;
            }
            function chain(funcs, args) {
                var p = new Promise();
                if (0 === funcs.length) p.done.apply(p, args); else funcs[0].apply(null, args).then(function() {
                    funcs.splice(0, 1);
                    chain(funcs, arguments).then(function() {
                        p.done.apply(p, arguments);
                    });
                });
                return p;
            }
            function _encode(data) {
                var result = "";
                if ("string" === typeof data) result = data; else {
                    var e = encodeURIComponent;
                    for (var k in data) if (data.hasOwnProperty(k)) result += "&" + e(k) + "=" + e(data[k]);
                }
                return result;
            }
            function new_xhr() {
                var xhr;
                if (window.XMLHttpRequest) xhr = new XMLHttpRequest(); else if (window.ActiveXObject) try {
                    xhr = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                }
                return xhr;
            }
            function ajax(method, url, data, headers) {
                var p = new Promise(), contentType = headers && headers["Content-Type"] || promise.contentType;
                var xhr, payload;
                try {
                    xhr = new_xhr();
                } catch (e) {
                    p.done(e_NO_XHR, "");
                    return p;
                }
                if (data) if ("GET" === method) {
                    url += "?" + _encode(data);
                    data = null;
                } else switch (contentType) {
                  case ct_URL_ENCODED:
                    data = _encode(data);
                    break;

                  case ct_JSON:
                    try {
                        data = JSON.stringify(data);
                    } catch (error) {
                        p.done(e_PRAPAIR_DATA, "");
                        return p;
                    }

                  default:
                    data = _encode(data);
                }
                xhr.open(method, url);
                if (data) xhr.setRequestHeader("Content-Type", contentType);
                for (var h in headers) if (headers.hasOwnProperty(h)) xhr.setRequestHeader(h, headers[h]);
                function onTimeout() {
                    xhr.abort();
                    p.done(e_TIMEOUT, "", xhr);
                }
                var timeout = promise.ajaxTimeout;
                if (timeout) var tid = setTimeout(onTimeout, timeout);
                xhr.onreadystatechange = function() {
                    if (timeout) clearTimeout(tid);
                    if (4 === xhr.readyState) {
                        var err = !xhr.status || (xhr.status < 200 || xhr.status >= 300) && 304 !== xhr.status;
                        p.done(err, xhr.responseText, xhr);
                    }
                };
                xhr.send(data);
                return p;
            }
            function _ajaxer(method) {
                return function(url, data, headers) {
                    return ajax(method, url, data, headers);
                };
            }
            var promise = {
                Promise: Promise,
                join: join,
                chain: chain,
                ajax: ajax,
                get: _ajaxer("GET"),
                post: _ajaxer("POST"),
                put: _ajaxer("PUT"),
                del: _ajaxer("DELETE"),
                patch: _ajaxer("PATCH"),
                ENOXHR: e_NO_XHR,
                ETIMEOUT: e_TIMEOUT,
                E_PREPAIR_DATA: e_PRAPAIR_DATA,
                ajaxTimeout: 0,
                contentType: ct_JSON
            };
            if ("function" === typeof define && define.amd) define(function() {
                return promise;
            }); else exports.promise = promise;
        }(this);
    }).call(XHR);
    arr_each([ "get" ], function(key) {
        XHR[key] = function(path, sender) {
            this.promise[key](path).then(function(errored, response, xhr) {
                if (errored) {
                    sender.onError(errored, response, xhr);
                    return;
                }
                sender.onSuccess(response);
            });
        };
    });
    arr_each([ "del", "post", "put", "patch" ], function(key) {
        XHR[key] = function(path, data, cb) {
            this.promise[key](path, data).then(function(error, response, xhr) {
                cb(error, response, xhr);
            });
        };
    });
    var Serializable;
    !function() {
        Serializable = function($serialization) {
            if (this === Class || null == this || this === global) {
                var Ctor = function(data) {
                    this[json_key_SER] = obj_extend(this[json_key_SER], $serialization);
                    Serializable.call(this, data);
                };
                return Ctor;
            }
            if (null != $serialization) if (this.deserialize) this.deserialize($serialization); else Serializable.deserialize(this, $serialization);
        };
        Serializable.serialize = function(instance) {
            if (is_Function(instance.toJSON)) return instance.toJSON();
            return json_proto_toJSON.call(instance, instance[json_key_SER]);
        };
        Serializable.deserialize = function(instance, json) {
            if (is_String(json)) try {
                json = JSON.parse(json);
            } catch (error) {
                console.error("<json:deserialize>", json);
                return instance;
            }
            if (is_Array(json) && is_Function(instance.push)) {
                instance.length = 0;
                for (var i = 0, imax = json.length; i < imax; i++) instance.push(json[i]);
                return instance;
            }
            var props = instance[json_key_SER], asKeys, asKey, key, val, Mix;
            if (null != props) {
                var pname = "__desAsKeys";
                asKeys = props[pname];
                if (null == asKeys) {
                    asKeys = props[pname] = {};
                    for (key in props) if ("__desAsKeys" !== key && true === props[key].hasOwnProperty("key")) asKeys[props[key].key] = key;
                }
            }
            for (key in json) {
                val = json[key];
                asKey = key;
                if (null != props) {
                    Mix = props.hasOwnProperty(key) ? props[key] : null;
                    if (asKeys[key]) asKey = asKeys[key];
                    if (null != Mix) {
                        if (is_Object(Mix)) Mix = Mix.deserialize;
                        if (is_String(Mix)) Mix = class_get(Mix);
                        if (is_Function(Mix)) {
                            instance[asKey] = val instanceof Mix ? val : new Mix(val);
                            continue;
                        }
                    }
                }
                instance[asKey] = val;
            }
            return instance;
        };
    }();
    var Route = function() {
        function Route(route) {
            this.route = route_parse(route);
        }
        Route.prototype = {
            constructor: Route,
            create: function(object) {
                var path, query;
                path = route_interpolate(this.route.path, object, "/");
                if (null == path) return null;
                if (this.route.query) {
                    query = route_interpolate(this.route.query, object, "&");
                    if (null == query) return null;
                }
                return path + (query ? "?" + query : "");
            },
            hasAliases: function(object) {
                var i = 0, imax = this.route.path.length, alias;
                for (;i < imax; i++) {
                    alias = this.route.path[i].parts[1];
                    if (alias && null == object[alias]) return false;
                }
                return true;
            }
        };
        var regexp_pathByColon = /^([^:\?]*)(\??):(\??)([\w]+)$/, regexp_pathByBraces = /^([^\{\?]*)(\{(\??)([\w]+)\})?([^\s]*)?$/;
        function parse_single(string) {
            var match = regexp_pathByColon.exec(string);
            if (match) return {
                optional: "?" === (match[2] || match[3]),
                parts: [ match[1], match[4] ]
            };
            match = regexp_pathByBraces.exec(string);
            if (match) return {
                optional: "?" === match[3],
                parts: [ match[1], match[4], match[5] ]
            };
            console.error("Paths breadcrumbs should be matched by regexps");
            return {
                parts: [ string ]
            };
        }
        function parse_path(path, delimiter) {
            var parts = path.split(delimiter);
            for (var i = 0, imax = parts.length; i < imax; i++) parts[i] = parse_single(parts[i]);
            return parts;
        }
        function route_parse(route) {
            var question = /[^\:\{]\?[^:]/.exec(route), query = null;
            if (question) {
                question = question.index + 1;
                query = route.substring(question + 1);
                route = route.substring(0, question);
            }
            return {
                path: parse_path(route, "/"),
                query: null == query ? null : parse_path(query, "&")
            };
        }
        function route_interpolate(breadcrumbs, object, delimiter) {
            var route = [], key, parts;
            for (var i = 0, x, imax = breadcrumbs.length; i < imax; i++) {
                x = breadcrumbs[i];
                parts = x.parts.slice(0);
                if (null == parts[1]) {
                    route.push(parts[0]);
                    continue;
                }
                key = parts[1];
                parts[1] = object[key];
                if (null == parts[1]) {
                    if (!x.optional) {
                        console.error("Object has no value, for not optional part - ", key);
                        return null;
                    }
                    continue;
                }
                route.push(parts.join(""));
            }
            return route.join(delimiter);
        }
        return Route;
    }();
    function Deferred() {}
    !function() {
        Deferred.prototype = {
            _isAsync: true,
            _done: null,
            _fail: null,
            _always: null,
            _resolved: null,
            _rejected: null,
            defer: function() {
                this._rejected = null;
                this._resolved = null;
            },
            isResolved: function() {
                return null != this._resolved;
            },
            isRejected: function() {
                return null != this._rejected;
            },
            isBusy: function() {
                return null == this._resolved && null == this._rejected;
            },
            resolve: function() {
                var done = this._done, always = this._always;
                this._resolved = arguments;
                dfr_clearListeners(this);
                arr_callOnce(done, this, arguments);
                arr_callOnce(always, this, [ this ]);
                return this;
            },
            reject: function() {
                var fail = this._fail, always = this._always;
                this._rejected = arguments;
                dfr_clearListeners(this);
                arr_callOnce(fail, this, arguments);
                arr_callOnce(always, this, [ this ]);
                return this;
            },
            resolveDelegate: function() {
                return fn_proxy(this.resolve, this);
            },
            rejectDelegate: function() {
                return fn_proxy(this.reject, this);
            },
            then: function(filterSuccess, filterError) {
                return this.pipe(filterSuccess, filterError);
            },
            done: function(callback) {
                if (null != this._rejected) return this;
                return dfr_bind(this, this._resolved, this._done || (this._done = []), callback);
            },
            fail: function(callback) {
                if (null != this._resolved) return this;
                return dfr_bind(this, this._rejected, this._fail || (this._fail = []), callback);
            },
            always: function(callback) {
                return dfr_bind(this, this._rejected || this._resolved, this._always || (this._always = []), callback);
            },
            pipe: function(mix) {
                var dfr;
                if ("function" === typeof mix) {
                    dfr = new Deferred();
                    var done_ = mix, fail_ = arguments.length > 1 ? arguments[1] : null;
                    this.done(delegate(dfr, "resolve", done_)).fail(delegate(dfr, "reject", fail_));
                    return dfr;
                }
                dfr = mix;
                var imax = arguments.length, done = 1 === imax, fail = 1 === imax, i = 0, x;
                while (++i < imax) {
                    x = arguments[i];
                    switch (x) {
                      case "done":
                        done = true;
                        break;

                      case "fail":
                        fail = true;
                        break;

                      default:
                        console.error("Unsupported pipe channel", arguments[i]);
                    }
                }
                done && this.done(dfr.resolveDelegate());
                fail && this.fail(dfr.rejectDelegate());
                function pipe(dfr, method) {
                    return function() {
                        dfr[method].apply(dfr, arguments);
                    };
                }
                function delegate(dfr, name, fn) {
                    return function() {
                        var override = fn.apply(this, arguments);
                        if (null != override) {
                            if (true === isDeferred(override)) {
                                override.pipe(dfr);
                                return;
                            }
                            dfr[name](override);
                            return;
                        }
                        dfr[name].apply(dfr, arguments);
                    };
                }
                return this;
            }
        };
        function dfr_bind(dfr, arguments_, listeners, callback) {
            if (null == callback) return dfr;
            if (null != arguments_) fn_apply(callback, dfr, arguments_); else listeners.push(callback);
            return dfr;
        }
        function dfr_clearListeners(dfr) {
            dfr._done = null;
            dfr._fail = null;
            dfr._always = null;
        }
        function arr_callOnce(arr, ctx, args) {
            if (null == arr) return;
            var imax = arr.length, i = -1, fn;
            while (++i < imax) {
                fn = arr[i];
                if (fn) fn_apply(fn, ctx, args);
            }
            arr.length = 0;
        }
        function isDeferred(x) {
            if (null == x || "object" !== typeof x) return false;
            if (x instanceof Deferred) return true;
            return "function" === typeof x.done && "function" === typeof x.fail;
        }
    }();
    var EventEmitter;
    !function() {
        EventEmitter = function() {
            this._listeners = {};
        };
        EventEmitter.prototype = {
            constructor: EventEmitter,
            on: function(event, callback) {
                if (null != callback) (this._listeners[event] || (this._listeners[event] = [])).push(callback);
                return this;
            },
            once: function(event, callback) {
                if (null != callback) {
                    callback._once = true;
                    (this._listeners[event] || (this._listeners[event] = [])).push(callback);
                }
                return this;
            },
            pipe: function(event) {
                var that = this, args;
                return function() {
                    args = _Array_slice.call(arguments);
                    args.unshift(event);
                    fn_apply(that.trigger, that, args);
                };
            },
            emit: event_trigger,
            trigger: event_trigger,
            off: function(event, callback) {
                var listeners = this._listeners[event];
                if (null == listeners) return this;
                if (1 === arguments.length) {
                    listeners.length = 0;
                    return this;
                }
                var imax = listeners.length, i = -1;
                while (++i < imax) if (listeners[i] === callback) {
                    listeners.splice(i, 1);
                    i--;
                    imax--;
                }
                return this;
            }
        };
        function event_trigger() {
            var args = _Array_slice.call(arguments), event = args.shift(), fns = this._listeners[event], fn, imax, i = 0;
            if (null == fns) return this;
            for (imax = fns.length; i < imax; i++) {
                fn = fns[i];
                fn_apply(fn, this, args);
                if (true === fn._once) {
                    fns.splice(i, 1);
                    i--;
                    imax--;
                }
            }
            return this;
        }
    }();
    var Class = function(mix) {
        var namespace, data;
        if (is_String(mix)) {
            namespace = mix;
            if (1 === arguments.length) return class_get(mix);
            data = arguments[1];
            data[str_CLASS_IDENTITY] = namespace;
        } else data = mix;
        var _base = data.Base, _extends = data.Extends, _static = data.Static, _construct = data.Construct, _class = null, _store = data.Store, _self = data.Self, _overrides = data.Override, key;
        if (null != _base) delete data.Base;
        if (null != _extends) delete data.Extends;
        if (null != _static) delete data.Static;
        if (null != _self) delete data.Self;
        if (null != _construct) delete data.Construct;
        if (null != _store) {
            if (null == _extends) _extends = _store; else if (is_Array(_extends)) _extends.unshift(_store); else _extends = [ _store, _extends ];
            delete data.Store;
        }
        if (null != _overrides) delete data.Override;
        if (null == _base && null == _extends && null == _self) {
            if (data.toJSON === void 0) data.toJSON = json_proto_toJSON;
            _class = null == _construct ? function() {} : _construct;
            data.constructor = _class.prototype.constructor;
            if (null != _static) for (key in _static) _class[key] = _static[key];
            _class.prototype = data;
            if (null != namespace) class_register(namespace, _class);
            return _class;
        }
        _class = function() {
            if (null != _extends) {
                var isarray = _extends instanceof Array, imax = isarray ? _extends.length : 1, i = 0, x = null;
                for (;i < imax; i++) {
                    x = isarray ? _extends[i] : _extends;
                    if ("function" === typeof x) fn_apply(x, this, arguments);
                }
            }
            if (null != _base) fn_apply(_base, this, arguments);
            if (null != _self && false === is_NullOrGlobal(this)) for (var key in _self) this[key] = fn_proxy(_self[key], this);
            if (null != _construct) {
                var r = fn_apply(_construct, this, arguments);
                if (null != r) return r;
            }
            this["super"] = null;
            return this;
        };
        if (null != namespace) class_register(namespace, _class);
        if (null != _static) for (key in _static) _class[key] = _static[key];
        if (null != _base) class_inheritStatics(_class, _base);
        if (null != _extends) class_inheritStatics(_class, _extends);
        class_extendProtoObjects(data, _base, _extends);
        class_inherit(_class, _base, _extends, data, _overrides, {
            toJSON: json_proto_toJSON
        });
        data = null;
        _static = null;
        return _class;
    };
    var Await = function() {
        return Class({
            Base: Deferred,
            _wait: 0,
            _timeout: null,
            _result: null,
            _resolved: [],
            Construct: function() {
                var imax = arguments.length, i = -1, dfr;
                while (++i < imax) {
                    dfr = arguments[i];
                    if (null != dfr && "function" === typeof dfr.done) await_deferredDelegate(this, null, dfr);
                }
            },
            delegate: function(name, errorable) {
                return await_createDelegate(this, name, errorable);
            },
            deferred: function(name) {
                return await_deferredDelegate(this, name, new Deferred());
            },
            Static: {
                TIMEOUT: 2e3
            }
        });
        function await_deferredDelegate(await, name, dfr) {
            var delegate = await_createDelegate(await, name, true), args;
            return dfr.done(function() {
                args = _Array_slice.call(arguments);
                args.unshift(null);
                delegate.apply(null, args);
            }).fail(function(error) {
                delegate(error);
            });
        }
        function await_createDelegate(await, name, errorable) {
            if (null == errorable) errorable = true;
            if (await._timeout) clearTimeout(await._timeout);
            await.defer();
            await._wait++;
            if (name) {
                if (!await._result) await._result = {};
                if (name in await._result) console.warn("<await>", name, "already awaiting");
                await._result[name] = null;
            }
            var delegate = fn_createDelegate(await_listener, await, name, errorable);
            await._timeout = setTimeout(delegate, Await.TIMEOUT);
            return delegate;
        }
        function await_listener(await, name, errorable) {
            if (0 === arguments.length) {
                await._wait = 0;
                await.reject("408: Timeout");
                return;
            }
            if (0 === await._wait) return;
            var result = await._result;
            if (name) {
                var args = _Array_slice.call(arguments, 3);
                result[name] = {
                    error: errorable ? args.shift() : null,
                    arguments: args
                };
            } else if (errorable && null != arguments[3]) {
                if (null == result) result = await._result = {};
                result.__error = arguments[3];
            }
            if (0 === --await._wait) {
                clearTimeout(await._timeout);
                var error = result && result.__error;
                var val, key;
                if (null == error) for (key in result) {
                    val = result[key];
                    error = val && val.error;
                    if (error) break;
                }
                if (error) {
                    await.reject(error, result);
                    return;
                }
                await.resolve(result);
            }
        }
    }();
    var StoreProto = {
        fetch: null,
        save: null,
        del: null,
        onSuccess: null,
        onError: null,
        Static: {
            fetch: function(data) {
                return new this().fetch(data);
            }
        }
    };
    var storageEvents_onBefore, storageEvents_onAfter, storageEvents_remove, storageEvents_overridenDefer;
    !function() {
        var event_START = "start", event_SUCCESS = "fulfilled", event_FAIL = "rejected";
        var events_ = new EventEmitter(), hasBeforeListeners_, hasAfterListeners_;
        storageEvents_onBefore = function(callback) {
            events_.on(event_START, callback);
            hasBeforeListeners_ = true;
        };
        storageEvents_onAfter = function(onSuccess, onFailure) {
            events_.on(event_SUCCESS, onSuccess).on(event_FAIL, onFailure);
            hasAfterListeners_ = true;
        };
        storageEvents_remove = function(callback) {
            events_.off(event_SUCCESS, callback).off(event_FAIL, callback).off(event_START, callback);
        };
        storageEvents_overridenDefer = function(type) {
            Deferred.prototype.defer.call(this);
            if (hasBeforeListeners_) emit([ event_START, this, type ]);
            if (hasAfterListeners_) this.always(listenerDelegate(this, type));
            return this;
        };
        function listenerDelegate(sender, type) {
            return function() {
                var isSuccess = null == sender._rejected, arguments_ = isSuccess ? sender._resolved : sender._rejected, event = isSuccess ? event_SUCCESS : event_FAIL;
                emit([ event, sender, type ].concat(arguments_));
            };
        }
        function emit(arguments_) {
            events_.trigger.apply(events_, arguments_);
        }
    }();
    Class.Remote = function() {
        var str_CONTENT_TYPE = "content-type", str_JSON = "json";
        var XHRRemote = function(route) {
            this._route = new Route(route);
        };
        obj_inherit(XHRRemote, StoreProto, Serializable, Deferred, {
            defer: storageEvents_overridenDefer,
            serialize: function() {
                return is_Array(this) ? json_proto_arrayToJSON.call(this) : json_proto_toJSON.call(this);
            },
            deserialize: function(json) {
                return Serializable.deserialize(this, json);
            },
            fetch: function(data) {
                this.defer("fetch");
                XHR.get(this._route.create(data || this), this);
                return this;
            },
            save: function(callback) {
                this.defer("save");
                var json = this.serialize(), path = this._route.create(this), method = this._route.hasAliases(this) ? "put" : "post";
                XHR[method](path, json, resolveDelegate(this, callback, "save"));
                return this;
            },
            patch: function(json) {
                this.defer("patch");
                obj_patch(this, json);
                XHR.patch(this._route.create(this), json, resolveDelegate(this));
                return this;
            },
            del: function(callback) {
                this.defer("del");
                var json = this.serialize(), path = this._route.create(this);
                XHR.del(path, json, resolveDelegate(this, callback));
                return this;
            },
            onSuccess: function(response) {
                parseFetched(this, response);
            },
            onError: function(errored, response, xhr) {
                reject(this, response, xhr);
            }
        });
        function parseFetched(self, response) {
            var json;
            try {
                json = JSON.parse(response);
            } catch (error) {
                reject(self, error);
                return;
            }
            self.deserialize(json);
            self.resolve(self);
        }
        function reject(self, response, xhr) {
            var obj;
            if ("string" === typeof response && is_JsonResponse(xhr)) try {
                obj = JSON.parse(response);
            } catch (error) {
                obj = error;
            }
            self.reject(obj || response);
        }
        function is_JsonResponse(xhr) {
            var header = xhr.getResponseHeader(str_CONTENT_TYPE);
            return null != header && header.toLowerCase().indexOf(str_JSON) !== -1;
        }
        function resolveDelegate(self, callback, action) {
            return function(error, response, xhr) {
                if (is_JsonResponse(xhr)) try {
                    response = JSON.parse(response);
                } catch (error) {
                    console.error("<XHR> invalid json response", response);
                    return reject(self, error, xhr);
                }
                if (callback) callback(error, response);
                if (error) return reject(self, response, xhr);
                if ("save" === action && is_Object(response)) {
                    if (is_Array(self)) {
                        var imax = self.length, jmax = response.length, i = -1;
                        while (++i < imax && i < jmax) Serializable.deserialize(self[i], response[i]);
                    } else self.deserialize(response);
                    return self.resolve(self);
                }
                self.resolve(response);
            };
        }
        function Remote(route) {
            return new XHRRemote(route);
        }
        Remote.onBefore = storageEvents_onBefore;
        Remote.onAfter = storageEvents_onAfter;
        arr_each([ "get", "post", "put", "delete" ], function(method) {
            Remote[method] = function(url, obj) {
                var json = obj;
                if (null != obj.serialize) json = obj.serialize();
                if (null == json && obj.toJSON) json = obj.toJSON();
                var dfr = new Deferred();
                XHR[method](url, json, resolveDelegate(dfr));
                return dfr;
            };
        });
        return Remote;
    }();
    Class.LocalStore = function() {
        var LocalStore = function(route) {
            this._route = new Route(route);
        };
        obj_inherit(LocalStore, StoreProto, Serializable, Deferred, {
            serialize: function() {
                var json = is_Array(this) ? json_proto_arrayToJSON.call(this) : json_proto_toJSON.call(this);
                return JSON.stringify(json);
            },
            deserialize: function(json) {
                return Serializable.deserialize(this, json);
            },
            fetch: function(data) {
                var path = this._route.create(data || this), object = localStorage.getItem(path);
                if (null == object) return this.resolve(this);
                if (is_String(object)) try {
                    object = JSON.parse(object);
                } catch (e) {
                    return this.reject(e);
                }
                this.deserialize(object);
                return this.resolve(this);
            },
            save: function(callback) {
                var path = this._route.create(this), store = this.serialize();
                localStorage.setItem(path, store);
                callback && callback();
                return this.resolve(this);
            },
            del: function(mix) {
                if (null == mix && 0 !== arguments.length) return this.reject("<localStore:del> - selector is specified, but is undefined");
                if (false === arr_isArray(this)) {
                    store_del(this._route, mix || this);
                    return this.resolve();
                }
                if (null == mix) {
                    for (var i = 0, imax = this.length; i < imax; i++) this[i] = null;
                    this.length = 0;
                    store_del(this._route, this);
                    return this.resolve();
                }
                var array = this.remove(mix);
                if (0 === array.length) return this.resolve();
                return this.save();
            },
            onError: function(error) {
                this.reject({
                    error: error
                });
            }
        });
        function store_del(route, data) {
            var path = route.create(data);
            localStorage.removeItem(path);
        }
        var Constructor = function(route) {
            return new LocalStore(route);
        };
        Constructor.prototype = LocalStore.prototype;
        return Constructor;
    }();
    Class.bind = function(cntx) {
        var arr = arguments, i = 1, length = arguments.length, key;
        for (;i < length; i++) {
            key = arr[i];
            cntx[key] = cntx[key].bind(cntx);
        }
        return cntx;
    };
    Class.cfg = function(mix, value) {
        if (is_String(mix)) {
            if (1 === arguments.length) return _cfg[mix];
            _cfg[mix] = value;
            return;
        }
        if (is_Object(mix)) for (var key in mix) Class.cfg(key, mix[key]);
    };
    Class.Model = {};
    Class.Serializable = Serializable;
    Class.Deferred = Deferred;
    Class.EventEmitter = EventEmitter;
    Class.Await = Await;
    Class.validate = obj_validate;
    Class.stringify = class_stringify;
    Class.parse = class_parse;
    Class.patch = class_patch;
    Class.properties = class_properties;
    Class.Collection = function() {
        var ArrayProto = function() {
            function check(x, mix) {
                if (null == mix) return false;
                if ("function" === typeof mix) return mix(x);
                if ("object" === typeof mix) {
                    if (x.constructor === mix.constructor && x.constructor !== Object) return x === mix;
                    var value, matcher;
                    for (var key in mix) {
                        value = x[key];
                        matcher = mix[key];
                        if ("string" === typeof matcher) {
                            var c = matcher[0], index = 1;
                            if ("<" === c || ">" === c) {
                                if ("=" === matcher[1]) {
                                    c += "=";
                                    index++;
                                }
                                matcher = matcher.substring(index);
                                switch (c) {
                                  case "<":
                                    if (value >= matcher) return false;
                                    continue;

                                  case "<=":
                                    if (value > matcher) return false;
                                    continue;

                                  case ">":
                                    if (value <= matcher) return false;
                                    continue;

                                  case ">=":
                                    if (value < matcher) return false;
                                    continue;
                                }
                            }
                        }
                        if (value != matcher) return false;
                    }
                    return true;
                }
                console.warn("No valid matcher", mix);
                return false;
            }
            var ArrayProto = {
                length: 0,
                push: function() {
                    var imax = arguments.length, i = -1;
                    while (++i < imax) this[this.length++] = create(this._ctor, arguments[i]);
                    return this;
                },
                pop: function() {
                    var instance = this[--this.length];
                    this[this.length] = null;
                    return instance;
                },
                shift: function() {
                    if (0 === this.length) return null;
                    var first = this[0], imax = this.length - 1, i = 0;
                    for (;i < imax; i++) this[i] = this[i + 1];
                    this[imax] = null;
                    this.length--;
                    return first;
                },
                unshift: function(mix) {
                    this.length++;
                    var imax = this.length;
                    while (--imax) this[imax] = this[imax - 1];
                    this[0] = create(this._ctor, mix);
                    return this;
                },
                splice: function(index, count) {
                    var length = this.length;
                    var i, imax, y;
                    if (index >= length) {
                        count = 0;
                        for (i = length, imax = index; i < imax; i++) this[i] = void 0;
                    }
                    var rm_count = count, rm_start = index, rm_end = index + rm_count, add_count = arguments.length - 2, new_length = length + add_count - rm_count;
                    var block_start = rm_end, block_end = length, block_shift = new_length - length;
                    if (0 < block_shift) {
                        i = block_end;
                        while (--i >= block_start) this[i + block_shift] = this[i];
                    }
                    if (0 > block_shift) {
                        i = block_start;
                        while (i < block_end) {
                            this[i + block_shift] = this[i];
                            i++;
                        }
                    }
                    i = rm_start;
                    y = 2;
                    for (;y < arguments.length; y) this[i++] = create(this._ctor, arguments[y++]);
                    this.length = new_length;
                    return this;
                },
                slice: function() {
                    return fn_apply(_Array_slice, this, arguments);
                },
                sort: function(fn) {
                    _Array_sort.call(this, fn);
                    return this;
                },
                reverse: function() {
                    var array = _Array_slice.call(this), imax = this.length, i = -1;
                    while (++i < imax) this[i] = array[imax - i - 1];
                    return this;
                },
                toString: function() {
                    return _Array_slice.call(this, 0).toString();
                },
                each: forEach,
                forEach: forEach,
                where: function(mix) {
                    var collection = new this.constructor();
                    for (var i = 0, x, imax = this.length; i < imax; i++) {
                        x = this[i];
                        if (check(x, mix)) collection[collection.length++] = x;
                    }
                    return collection;
                },
                remove: function(mix) {
                    var index = -1, array = [];
                    for (var i = 0, imax = this.length; i < imax; i++) {
                        if (check(this[i], mix)) {
                            array.push(this[i]);
                            continue;
                        }
                        this[++index] = this[i];
                    }
                    for (i = ++index; i < imax; i++) this[i] = null;
                    this.length = index;
                    return array;
                },
                first: function(mix) {
                    if (null == mix) return this[0];
                    var i = this.indexOf(mix);
                    return i !== -1 ? this[i] : null;
                },
                last: function(mix) {
                    if (null == mix) return this[this.length - 1];
                    var i = this.lastIndexOf(mix);
                    return i !== -1 ? this[i] : null;
                },
                indexOf: function(mix, index) {
                    if (null == mix) return -1;
                    if (null != index) {
                        if (index < 0) index = 0;
                        if (index >= this.length) return -1;
                    } else index = 0;
                    var imax = this.length;
                    for (;index < imax; index++) if (check(this[index], mix)) return index;
                    return -1;
                },
                lastIndexOf: function(mix, index) {
                    if (null == mix) return -1;
                    if (null != index) {
                        if (index >= this.length) index = this.length - 1;
                        if (index < 0) return -1;
                    } else index = this.length - 1;
                    for (;index > -1; index--) if (check(this[index], mix)) return index;
                    return -1;
                },
                map: function(fn) {
                    var arr = [], imax = this.length, i = -1;
                    while (++i < imax) arr[i] = fn(this[i]);
                    return arr;
                },
                filter: function(fn, ctx) {
                    var coll = new this.constructor(), imax = this.length, i = -1;
                    while (++i < imax) if (fn.call(ctx || this, this[i])) coll.push(this[i]);
                    return coll;
                }
            };
            if ("undefined" !== typeof Symbol && Symbol.iterator) ArrayProto[Symbol.iterator] = function() {
                var arr = this, i = -1;
                return {
                    next: function() {
                        return {
                            value: arr[++i],
                            done: i > arr.length - 1
                        };
                    },
                    hasNext: function() {
                        return i < arr.length;
                    }
                };
            };
            function forEach(fn, ctx) {
                var imax = this.length, i = -1;
                while (++i < imax) fn.call(ctx || this, this[i], i);
                return this;
            }
            return ArrayProto;
        }();
        function create(Constructor, mix) {
            if (mix instanceof Constructor) return mix;
            return new Constructor(mix);
        }
        var CollectionProto = {
            toArray: function() {
                var array = new Array(this.length);
                for (var i = 0, imax = this.length; i < imax; i++) array[i] = this[i];
                return array;
            },
            toJSON: json_proto_arrayToJSON
        };
        function Collection() {
            var length = arguments.length, Proto = arguments[length - 1], Child = arguments[length - 2], className;
            if (length > 2) className = arguments[0];
            Proto._ctor = Child;
            obj_inherit(Proto, CollectionProto, ArrayProto);
            return null == className ? Class(Proto) : Class(className, Proto);
        }
        return Collection;
    }();
    !function() {
        function args_match(a, b) {
            if (a.length !== b.length) return false;
            var imax = a.length, i = 0;
            for (;i < imax; i++) if (a[i] !== b[i]) return false;
            return true;
        }
        function args_id(store, args) {
            if (0 === args.length) return 0;
            for (var i = 0, imax = store.length; i < imax; i++) if (args_match(store[i], args)) return i + 1;
            store.push(args);
            return store.length;
        }
        function fn_memoize(fn) {
            var _cache = {}, _args = [];
            return function() {
                var id = args_id(_args, arguments);
                return null == _cache[id] ? _cache[id] = fn_apply(fn, this, arguments) : _cache[id];
            };
        }
        function fn_resolveDelegate(cache, cbs, id) {
            return function() {
                cache[id] = arguments;
                for (var i = 0, x, imax = cbs[id].length; i < imax; i++) {
                    x = cbs[id][i];
                    fn_apply(x, this, arguments);
                }
                cbs[i] = null;
                cache = null;
                cbs = null;
            };
        }
        function fn_memoizeAsync(fn) {
            var _cache = {}, _cacheCbs = {}, _args = [];
            return function() {
                var args = _Array_slice.call(arguments), callback = args.pop();
                var id = args_id(_args, args);
                if (_cache[id]) {
                    fn_apply(callback, this, _cache[id]);
                    return;
                }
                if (_cacheCbs[id]) {
                    _cacheCbs[id].push(callback);
                    return;
                }
                _cacheCbs[id] = [ callback ];
                args = _Array_slice.call(args);
                args.push(fn_resolveDelegate(_cache, _cacheCbs, id));
                fn_apply(fn, this, args);
            };
        }
        Class.Fn = {
            memoize: fn_memoize,
            memoizeAsync: fn_memoizeAsync
        };
    }();
    exports.Class = Class;
});

include.getResource("/.reference/atma/class/lib/class.js", "js").readystatechanged(3);

include.setCurrent({
    id: "/.reference/atma/mask/lib/mask.js",
    namespace: "",
    url: "/.reference/atma/mask/lib/mask.js"
});

/*!
 * MaskJS v0.8.12
 * Part of the Atma.js Project
 * http://atmajs.com/
 *
 * MIT license
 * http://opensource.org/licenses/MIT
 *
 * (c) 2012, 2014 Atma.js and other contributors
 */
!function(root, factory) {
    var _global = "undefined" === typeof window || null == window.navigator ? global : window, _exports, _document;
    if ("undefined" !== typeof exports && (null == root || root === exports || root === _global)) root = exports;
    _document = _global.document;
    _exports = root || _global;
    function construct() {
        return factory(_global, _exports, _document);
    }
    if ("function" === typeof define && define.amd) return define(construct);
    return construct();
}(this, function(global, exports, document) {
    var regexpWhitespace = /\s/g, regexpEscapedChar = {
        "'": /\\'/g,
        '"': /\\"/g,
        "{": /\\\{/g,
        ">": /\\>/g,
        ";": /\\>/g
    }, hasOwnProp = {}.hasOwnProperty, listeners = null, __cfg = {
        allowCache: true
    };
    var _Array_slice = Array.prototype.slice;
    var is_Function, is_Array;
    !function() {
        is_Function = function(x) {
            return "function" === typeof x;
        };
        is_Array = function(x) {
            return null != x && "object" === typeof x && "number" === typeof x.length && "function" === typeof x.splice;
        };
    }();
    function util_interpolate(arr, type, model, ctx, element, controller, name) {
        var imax = arr.length, i = -1, array = null, string = "", even = true, utility, value, index, key, handler;
        while (++i < imax) {
            if (true === even) if (null == array) string += arr[i]; else array.push(arr[i]); else {
                key = arr[i];
                value = null;
                index = key.indexOf(":");
                if (index === -1) value = obj_getPropertyEx(key, model, ctx, controller); else {
                    utility = index > 0 ? str_trim(key.substring(0, index)) : "";
                    if ("" === utility) utility = "expression";
                    key = key.substring(index + 1);
                    handler = custom_Utils[utility];
                    value = handler(key, model, ctx, element, controller, name, type);
                }
                if (null != value) {
                    if ("object" === typeof value && null == array) array = [ string ];
                    if (null == array) string += value; else array.push(value);
                }
            }
            even = !even;
        }
        return null == array ? string : array;
    }
    function attr_extend(target, source) {
        if (null == target) target = {};
        if (null == source) return target;
        for (var key in source) {
            if ("class" === key && "string" === typeof target[key]) {
                target[key] += " " + source[key];
                continue;
            }
            target[key] = source[key];
        }
        return target;
    }
    function Template(template) {
        this.template = template;
        this.index = 0;
        this.length = template.length;
    }
    Template.prototype = {
        skipWhitespace: function() {
            var template = this.template, index = this.index, length = this.length;
            for (;index < length; index++) if (template.charCodeAt(index) > 32) break;
            this.index = index;
            return this;
        },
        skipToAttributeBreak: function() {
            var template = this.template, index = this.index, length = this.length, c;
            do {
                c = template.charCodeAt(++index);
                if (35 === c && 123 === template.charCodeAt(index + 1)) {
                    this.index = index;
                    this.sliceToChar("}");
                    this.index++;
                    return;
                }
            } while (46 !== c && 35 !== c && 62 !== c && 123 !== c && 32 !== c && 59 !== c && index < length);
            this.index = index;
        },
        sliceToChar: function(c) {
            var template = this.template, index = this.index, start = index, isEscaped = false, value, nindex;
            while ((nindex = template.indexOf(c, index)) > -1) {
                index = nindex;
                if (92 !== template.charCodeAt(index - 1)) break;
                isEscaped = true;
                index++;
            }
            value = template.substring(start, index);
            this.index = index;
            return isEscaped ? value.replace(regexpEscapedChar[c], c) : value;
        }
    };
    var arr_pushMany;
    !function() {
        arr_pushMany = function(arr, arrSource) {
            if (null == arrSource || null == arr) return;
            var il = arr.length, jl = arrSource.length, j = -1;
            while (++j < jl) arr[il + j] = arrSource[j];
        };
    }();
    function str_trim(str) {
        var length = str.length, i = 0, j = length - 1, c;
        for (;i < length; i++) {
            c = str.charCodeAt(i);
            if (c < 33) continue;
            break;
        }
        for (;j >= i; j--) {
            c = str.charCodeAt(j);
            if (c < 33) continue;
            break;
        }
        return 0 === i && j === length - 1 ? str : str.substring(i, j + 1);
    }
    var obj_extend, obj_getProperty, obj_getPropertyEx, obj_toDictionary;
    !function() {
        obj_extend = function(target, source) {
            if (null == target) target = {};
            for (var key in source) target[key] = source[key];
            return target;
        };
        obj_getProperty = function(obj, path) {
            if ("." === path) return obj;
            var value = obj, props = path.split("."), i = -1, imax = props.length;
            while (null != value && ++i < imax) value = value[props[i]];
            return value;
        };
        obj_getPropertyEx = function(path, model, ctx, controller) {
            if ("." === path) return model;
            var props = path.split("."), value = model, i = -1, imax = props.length, key = props[0], start_i;
            if ("$c" === key) {
                value = controller;
                i++;
            } else if ("$a" === key) {
                value = controller && controller.attr;
                i++;
            } else if ("$u" === key) {
                value = customUtil_$utils;
                i++;
            } else if ("$ctx" === key) {
                value = ctx;
                i++;
            }
            start_i = i;
            while (null != value && ++i < imax) value = value[props[i]];
            if (null == value && start_i === -1) {
                var $scope;
                while (true) {
                    if (null == controller) break;
                    $scope = controller.scope;
                    if (null != $scope) {
                        value = getProperty($scope, props, 0, imax);
                        if (null != value) return value;
                    }
                    controller = controller.parent;
                }
            }
            return value;
        };
        obj_toDictionary = function(obj) {
            var array = [], i = 0, key;
            for (key in obj) array[i++] = {
                key: key,
                value: obj[key]
            };
            return array;
        };
        function getProperty(obj, props, i, imax) {
            var value = obj;
            while (i < imax && null != value) {
                value = value[props[i]];
                i++;
            }
            return value;
        }
    }();
    function fn_proxy(fn, ctx) {
        return function() {
            return fn_apply(fn, ctx, arguments);
        };
    }
    function fn_apply(fn, ctx, _arguments) {
        switch (_arguments.length) {
          case 0:
            return fn.call(ctx);

          case 1:
            return fn.call(ctx, _arguments[0]);

          case 2:
            return fn.call(ctx, _arguments[0], _arguments[1]);

          case 3:
            return fn.call(ctx, _arguments[0], _arguments[1], _arguments[2]);

          case 4:
            return fn.call(ctx, _arguments[0], _arguments[1], _arguments[2], _arguments[3]);
        }
        return fn.apply(ctx, _arguments);
    }
    function fn_doNothing() {}
    var custom_Utils, custom_Statements, custom_Attributes, custom_Tags, custom_Tags_defs, customUtil_get, customUtil_$utils, customUtil_register, customTag_register;
    !function() {
        initialize();
        !function(repository) {
            customTag_register = function(name, Handler) {
                if (null != Handler && "object" === typeof Handler) Handler.__Ctor = wrapStatic(Handler);
                repository[name] = Handler;
            };
            function wrapStatic(proto) {
                function Ctor(node, parent) {
                    this.tagName = node.tagName;
                    this.attr = node.attr;
                    this.expression = node.expression;
                    this.nodes = node.nodes;
                    this.nextSibling = node.nextSibling;
                    this.parent = parent;
                    this.components = null;
                }
                Ctor.prototype = proto;
                return Ctor;
            }
        }(custom_Tags);
        !function(repository) {
            customUtil_$utils = {};
            customUtil_register = function(name, mix) {
                if (is_Function(mix)) {
                    repository[name] = mix;
                    return;
                }
                repository[name] = createUtil(mix);
                if ("parsed" === mix.arguments) customUtil_$utils[name] = mix.process;
            };
            customUtil_get = function(name) {
                return null != name ? repository[name] : repository;
            };
            function createUtil(obj) {
                if ("parsed" !== obj.arguments) return fn_proxy(obj.process || processRawFn, obj);
                return processParsedDelegate(obj.process);
            }
            function processRawFn(expr, model, ctx, element, controller, attrName, type) {
                if ("node" === type) {
                    this.nodeRenderStart(expr, model, ctx, element, controller);
                    return this.node(expr, model, ctx, element, controller);
                }
                this.attrRenderStart(expr, model, ctx, element, controller, attrName);
                return this.attr(expr, model, ctx, element, controller, attrName);
            }
            function processParsedDelegate(fn) {
                return function(expr, model, ctx, element, controller) {
                    var args = ExpressionUtil.evalStatements(expr, model, ctx, controller);
                    return fn.apply(null, args);
                };
            }
        }(custom_Utils);
        function initialize() {
            custom_Utils = {
                expression: function(value, model, ctx, element, controller) {
                    return ExpressionUtil.eval(value, model, ctx, controller);
                }
            };
            custom_Statements = {};
            custom_Attributes = {
                "class": null,
                id: null,
                style: null,
                name: null,
                type: null
            };
            custom_Tags = {
                div: null,
                span: null,
                input: null,
                button: null,
                textarea: null,
                select: null,
                option: null,
                h1: null,
                h2: null,
                h3: null,
                h4: null,
                h5: null,
                h6: null,
                a: null,
                p: null,
                img: null,
                table: null,
                td: null,
                tr: null,
                pre: null,
                ul: null,
                li: null,
                ol: null,
                i: null,
                b: null,
                strong: null,
                form: null
            };
            custom_Tags_defs = {};
        }
    }();
    var ExpressionUtil = function() {
        var index = 0, length = 0, cache = {}, template, ast;
        var op_Minus = "-", op_Plus = "+", op_Divide = "/", op_Multip = "*", op_Modulo = "%", op_LogicalOr = "||", op_LogicalAnd = "&&", op_LogicalNot = "!", op_LogicalEqual = "==", op_LogicalEqual_Strict = "===", op_LogicalNotEqual = "!=", op_LogicalNotEqual_Strict = "!==", op_LogicalGreater = ">", op_LogicalGreaterEqual = ">=", op_LogicalLess = "<", op_LogicalLessEqual = "<=", op_Member = ".", punc_ParantheseOpen = 20, punc_ParantheseClose = 21, punc_Comma = 22, punc_Dot = 23, punc_Question = 24, punc_Colon = 25, go_ref = 30, go_string = 31, go_number = 32;
        var type_Body = 1, type_Statement = 2, type_SymbolRef = 3, type_FunctionRef = 4, type_Accessor = 5, type_Value = 6, type_Number = 7, type_String = 8, type_UnaryPrefix = 9, type_Ternary = 10;
        var state_body = 1, state_arguments = 2;
        var precedence = {};
        precedence[op_Member] = 1;
        precedence[op_Divide] = 2;
        precedence[op_Multip] = 2;
        precedence[op_Minus] = 3;
        precedence[op_Plus] = 3;
        precedence[op_LogicalGreater] = 4;
        precedence[op_LogicalGreaterEqual] = 4;
        precedence[op_LogicalLess] = 4;
        precedence[op_LogicalLessEqual] = 4;
        precedence[op_LogicalEqual] = 5;
        precedence[op_LogicalEqual_Strict] = 5;
        precedence[op_LogicalNotEqual] = 5;
        precedence[op_LogicalNotEqual_Strict] = 5;
        precedence[op_LogicalAnd] = 6;
        precedence[op_LogicalOr] = 6;
        var Ast_Body, Ast_Statement, Ast_Value, Ast_FunctionRef, Ast_SymbolRef, Ast_Accessor, Ast_UnaryPrefix, Ast_TernaryStatement;
        !function() {
            Ast_Body = function(parent) {
                this.parent = parent;
                this.type = type_Body;
                this.body = [];
                this.join = null;
            };
            Ast_Statement = function(parent) {
                this.parent = parent;
            };
            Ast_Statement.prototype = {
                constructor: Ast_Statement,
                type: type_Statement,
                join: null,
                body: null
            };
            Ast_Value = function(value) {
                this.type = type_Value;
                this.body = value;
                this.join = null;
            };
            Ast_FunctionRef = function(parent, ref) {
                this.parent = parent;
                this.type = type_FunctionRef;
                this.body = ref;
                this.arguments = [];
                this.next = null;
            };
            Ast_FunctionRef.prototype = {
                constructor: Ast_FunctionRef,
                newArgument: function() {
                    var body = new Ast_Body(this);
                    this.arguments.push(body);
                    return body;
                }
            };
            Ast_SymbolRef = function(parent, ref) {
                this.parent = parent;
                this.type = type_SymbolRef;
                this.body = ref;
                this.next = null;
            };
            Ast_Accessor = function(parent, astRef) {
                this.parent = parent;
                this.body = astRef;
                this.next = null;
            };
            Ast_UnaryPrefix = function(parent, prefix) {
                this.parent = parent;
                this.prefix = prefix;
            };
            Ast_UnaryPrefix.prototype = {
                constructor: Ast_UnaryPrefix,
                type: type_UnaryPrefix,
                body: null
            };
            Ast_TernaryStatement = function(assertions) {
                this.body = assertions;
                this.case1 = new Ast_Body(this);
                this.case2 = new Ast_Body(this);
            };
            Ast_TernaryStatement.prototype = {
                constructor: Ast_TernaryStatement,
                type: type_Ternary,
                case1: null,
                case2: null
            };
        }();
        var ast_handlePrecedence, ast_append;
        !function() {
            ast_append = function(current, next) {
                if (null == current) console.error("<Mask:Ast> Current undefined", next);
                var type = current.type;
                if (type_Body === type) {
                    current.body.push(next);
                    return next;
                }
                if (type_Statement === type || type_UnaryPrefix === type) return current.body = next;
                if (type_SymbolRef === type || type_FunctionRef === type) return current.next = next;
                console.error("Unsupported - append:", current, next);
                return next;
            };
            ast_handlePrecedence = function(ast) {
                if (ast.type !== type_Body) {
                    if (null != ast.body && "object" === typeof ast.body) ast_handlePrecedence(ast.body);
                    return;
                }
                var body = ast.body, i = 0, length = body.length, x, prev, array;
                for (;i < length; i++) ast_handlePrecedence(body[i]);
                for (i = 1; i < length; i++) {
                    x = body[i];
                    prev = body[i - 1];
                    if (precedence[prev.join] > precedence[x.join]) break;
                }
                if (i === length) return;
                array = [ body[0] ];
                for (i = 1; i < length; i++) {
                    x = body[i];
                    prev = body[i - 1];
                    var prec_Prev = precedence[prev.join];
                    if (prec_Prev > precedence[x.join] && i < length - 1) {
                        var start = i, nextJoin, arr;
                        while (++i < length) {
                            nextJoin = body[i].join;
                            if (null == nextJoin) break;
                            if (prec_Prev <= precedence[nextJoin]) break;
                        }
                        arr = body.slice(start, i + 1);
                        x = ast_join(arr);
                        ast_handlePrecedence(x);
                    }
                    array.push(x);
                }
                ast.body = array;
            };
            function ast_join(bodyArr) {
                if (0 === bodyArr.length) return null;
                var body = new Ast_Body(bodyArr[0].parent);
                body.join = bodyArr[bodyArr.length - 1].join;
                body.body = bodyArr;
                return body;
            }
        }();
        var _throw, util_resolveRef;
        !function() {
            util_resolveRef = function(astRef, model, ctx, controller) {
                var current = astRef, key = astRef.body, object, value, args, i, imax;
                if ("$c" === key) {
                    value = controller;
                    var next = current.next, nextBody = null != next && next.body;
                    if (null != nextBody && null == value[nextBody]) if (next.type === type_FunctionRef && "function" === typeof Compo.prototype[nextBody]) {
                        object = controller;
                        value = Compo.prototype[nextBody];
                        current = next;
                    } else while (true) {
                        value = value.parent;
                        if (null == value) break;
                        if (null == value[nextBody]) continue;
                        object = value;
                        value = value[nextBody];
                        current = next;
                        break;
                    }
                } else if ("$a" === key) value = controller && controller.attr; else if ("$u" === key) value = customUtil_$utils; else if ("$ctx" === key) value = ctx; else {
                    if (null != model) {
                        object = model;
                        value = model[key];
                    }
                    if (null == value) while (null != controller) {
                        object = controller.scope;
                        if (null != object) value = object[key];
                        if (null != value) break;
                        controller = controller.parent;
                    }
                }
                if (null != value) do {
                    if (current.type === type_FunctionRef) {
                        args = [];
                        i = -1;
                        imax = current.arguments.length;
                        while (++i < imax) args[i] = expression_evaluate(current.arguments[i], model, ctx, controller);
                        value = value.apply(object, args);
                    }
                    if (null == value || null == current.next) break;
                    current = current.next;
                    key = current.body;
                    object = value;
                    value = value[key];
                    if (null == value) break;
                } while (true);
                if (null == value) if (null == current || null != current.next) _throw("Mask - Accessor error - ", key);
                return value;
            };
            _throw = function(message, token) {
                console.error("Expression parser:", message, token, template.substring(index));
            };
        }();
        function parser_skipWhitespace() {
            var c;
            while (index < length) {
                c = template.charCodeAt(index);
                if (c > 32) return c;
                index++;
            }
            return null;
        }
        function parser_getString(c) {
            var isEscaped = false, _char = 39 === c ? "'" : '"', start = index, nindex, string;
            while ((nindex = template.indexOf(_char, index)) > -1) {
                index = nindex;
                if (92 !== template.charCodeAt(nindex - 1)) break;
                isEscaped = true;
                index++;
            }
            string = template.substring(start, index);
            if (true === isEscaped) string = string.replace(regexpEscapedChar[_char], _char);
            return string;
        }
        function parser_getNumber() {
            var start = index, code, isDouble;
            while (true) {
                code = template.charCodeAt(index);
                if (46 === code) {
                    if (true === isDouble) {
                        _throw("Unexpected punc");
                        return null;
                    }
                    isDouble = true;
                }
                if ((code >= 48 && code <= 57 || 46 === code) && index < length) {
                    index++;
                    continue;
                }
                break;
            }
            return +template.substring(start, index);
        }
        function parser_getRef() {
            var start = index, c = template.charCodeAt(index), ref;
            if (34 === c || 39 === c) {
                index++;
                ref = parser_getString(c);
                index++;
                return ref;
            }
            while (true) {
                if (index === length) break;
                c = template.charCodeAt(index);
                if (36 === c) {
                    index++;
                    continue;
                }
                if (c > 47 && 58 !== c && 60 !== c && 61 !== c && 62 !== c && 63 !== c && 124 !== c) {
                    index++;
                    continue;
                }
                break;
            }
            return template.substring(start, index);
        }
        function parser_getDirective(code) {
            if (null == code && index === length) return null;
            switch (code) {
              case 40:
                return punc_ParantheseOpen;

              case 41:
                return punc_ParantheseClose;

              case 44:
                return punc_Comma;

              case 46:
                return punc_Dot;

              case 43:
                return op_Plus;

              case 45:
                return op_Minus;

              case 42:
                return op_Multip;

              case 47:
                return op_Divide;

              case 37:
                return op_Modulo;

              case 61:
                if (template.charCodeAt(++index) !== code) {
                    _throw("Not supported (Apply directive) - view can only access model/controllers");
                    return null;
                }
                if (template.charCodeAt(index + 1) === code) {
                    index++;
                    return op_LogicalEqual_Strict;
                }
                return op_LogicalEqual;

              case 33:
                if (61 === template.charCodeAt(index + 1)) {
                    index++;
                    if (61 === template.charCodeAt(index + 1)) {
                        index++;
                        return op_LogicalNotEqual_Strict;
                    }
                    return op_LogicalNotEqual;
                }
                return op_LogicalNot;

              case 62:
                if (61 === template.charCodeAt(index + 1)) {
                    index++;
                    return op_LogicalGreaterEqual;
                }
                return op_LogicalGreater;

              case 60:
                if (61 === template.charCodeAt(index + 1)) {
                    index++;
                    return op_LogicalLessEqual;
                }
                return op_LogicalLess;

              case 38:
                if (template.charCodeAt(++index) !== code) {
                    _throw("Single Binary Operator AND");
                    return null;
                }
                return op_LogicalAnd;

              case 124:
                if (template.charCodeAt(++index) !== code) {
                    _throw("Single Binary Operator OR");
                    return null;
                }
                return op_LogicalOr;

              case 63:
                return punc_Question;

              case 58:
                return punc_Colon;
            }
            if (code >= 65 && code <= 90 || code >= 97 && code <= 122 || 95 === code || 36 === code) return go_ref;
            if (code >= 48 && code <= 57) return go_number;
            if (34 === code || 39 === code) return go_string;
            _throw("Unexpected / Unsupported directive");
            return null;
        }
        function expression_parse(expr) {
            template = expr;
            index = 0;
            length = expr.length;
            ast = new Ast_Body();
            var current = ast, state = state_body, c, next, directive;
            outer: while (true) {
                if (index < length && (c = template.charCodeAt(index)) < 33) {
                    index++;
                    continue;
                }
                if (index >= length) break;
                directive = parser_getDirective(c);
                if (null == directive && index < length) break;
                switch (directive) {
                  case punc_ParantheseOpen:
                    current = ast_append(current, new Ast_Statement(current));
                    current = ast_append(current, new Ast_Body(current));
                    index++;
                    continue;

                  case punc_ParantheseClose:
                    var closest = type_Body;
                    if (state === state_arguments) {
                        state = state_body;
                        closest = type_FunctionRef;
                    }
                    do current = current.parent; while (null != current && current.type !== closest);
                    if (closest === type_Body) current = current.parent;
                    if (null == current) {
                        _throw("OutOfAst Exception - body closed");
                        break outer;
                    }
                    index++;
                    continue;

                  case punc_Comma:
                    if (state !== state_arguments) {
                        state = state_body;
                        do current = current.parent; while (null != current && current.type !== type_Body);
                        index++;
                        if (null == current) {
                            _throw("Unexpected punctuation, comma");
                            break outer;
                        }
                        continue;
                    }
                    do current = current.parent; while (null != current && current.type !== type_FunctionRef);
                    if (null == current) {
                        _throw("OutOfAst Exception - next argument");
                        break outer;
                    }
                    current = current.newArgument();
                    index++;
                    continue;

                  case punc_Question:
                    ast = new Ast_TernaryStatement(ast);
                    current = ast.case1;
                    index++;
                    continue;

                  case punc_Colon:
                    current = ast.case2;
                    index++;
                    continue;

                  case punc_Dot:
                    c = template.charCodeAt(index + 1);
                    if (c >= 48 && c <= 57) directive = go_number; else {
                        directive = go_ref;
                        index++;
                    }
                }
                if (current.type === type_Body) current = ast_append(current, new Ast_Statement(current));
                if ((op_Minus === directive || op_LogicalNot === directive) && null == current.body) {
                    current = ast_append(current, new Ast_UnaryPrefix(current, directive));
                    index++;
                    continue;
                }
                switch (directive) {
                  case op_Minus:
                  case op_Plus:
                  case op_Multip:
                  case op_Divide:
                  case op_Modulo:
                  case op_LogicalAnd:
                  case op_LogicalOr:
                  case op_LogicalEqual:
                  case op_LogicalEqual_Strict:
                  case op_LogicalNotEqual:
                  case op_LogicalNotEqual_Strict:
                  case op_LogicalGreater:
                  case op_LogicalGreaterEqual:
                  case op_LogicalLess:
                  case op_LogicalLessEqual:
                    while (current && current.type !== type_Statement) current = current.parent;
                    if (null == current.body) {
                        _throw("Unexpected operator", current);
                        break outer;
                    }
                    current.join = directive;
                    do current = current.parent; while (null != current && current.type !== type_Body);
                    if (null == current) console.error("Unexpected parent", current);
                    index++;
                    continue;

                  case go_string:
                  case go_number:
                    if (null != current.body && null == current.join) {
                        _throw("Directive Expected");
                        break outer;
                    }
                    if (go_string === directive) {
                        index++;
                        ast_append(current, new Ast_Value(parser_getString(c)));
                        index++;
                    }
                    if (go_number === directive) ast_append(current, new Ast_Value(parser_getNumber(c)));
                    continue;

                  case go_ref:
                    var ref = parser_getRef();
                    if ("null" === ref) ref = null;
                    if ("false" === ref) ref = false;
                    if ("true" === ref) ref = true;
                    if ("string" !== typeof ref) {
                        ast_append(current, new Ast_Value(ref));
                        continue;
                    }
                    while (index < length) {
                        c = template.charCodeAt(index);
                        if (c < 33) {
                            index++;
                            continue;
                        }
                        break;
                    }
                    if (40 === c) {
                        state = state_arguments;
                        index++;
                        var fn = ast_append(current, new Ast_FunctionRef(current, ref));
                        current = fn.newArgument();
                        continue;
                    }
                    current = ast_append(current, new Ast_SymbolRef(current, ref));
                }
            }
            if (null == current.body && current.type === type_Statement) _throw("Unexpected end of expression");
            ast_handlePrecedence(ast);
            return ast;
        }
        function expression_evaluate(mix, model, ctx, controller) {
            var result, ast;
            if (null == mix) return null;
            if ("." === mix) return model;
            if ("string" === typeof mix) ast = true === cache.hasOwnProperty(mix) ? cache[mix] : cache[mix] = expression_parse(mix); else ast = mix;
            var type = ast.type, i, x, length;
            if (type_Body === type) {
                var value, prev;
                outer: for (i = 0, length = ast.body.length; i < length; i++) {
                    x = ast.body[i];
                    value = expression_evaluate(x, model, ctx, controller);
                    if (null == prev || null == prev.join) {
                        prev = x;
                        result = value;
                        continue;
                    }
                    if (prev.join === op_LogicalAnd) if (!result) {
                        for (;i < length; i++) if (ast.body[i].join === op_LogicalOr) break;
                    } else result = value;
                    if (prev.join === op_LogicalOr) {
                        if (result) break outer;
                        if (value) {
                            result = value;
                            break outer;
                        }
                    }
                    switch (prev.join) {
                      case op_Minus:
                        result -= value;
                        break;

                      case op_Plus:
                        result += value;
                        break;

                      case op_Divide:
                        result /= value;
                        break;

                      case op_Multip:
                        result *= value;
                        break;

                      case op_Modulo:
                        result %= value;
                        break;

                      case op_LogicalNotEqual:
                        result = result != value;
                        break;

                      case op_LogicalNotEqual_Strict:
                        result = result !== value;
                        break;

                      case op_LogicalEqual:
                        result = result == value;
                        break;

                      case op_LogicalEqual_Strict:
                        result = result === value;
                        break;

                      case op_LogicalGreater:
                        result = result > value;
                        break;

                      case op_LogicalGreaterEqual:
                        result = result >= value;
                        break;

                      case op_LogicalLess:
                        result = result < value;
                        break;

                      case op_LogicalLessEqual:
                        result = result <= value;
                    }
                    prev = x;
                }
            }
            if (type_Statement === type) return expression_evaluate(ast.body, model, ctx, controller);
            if (type_Value === type) return ast.body;
            if (type_SymbolRef === type || type_FunctionRef === type) return util_resolveRef(ast, model, ctx, controller);
            if (type_UnaryPrefix === type) {
                result = expression_evaluate(ast.body, model, ctx, controller);
                switch (ast.prefix) {
                  case op_Minus:
                    result = -result;
                    break;

                  case op_LogicalNot:
                    result = !result;
                }
            }
            if (type_Ternary === type) {
                result = expression_evaluate(ast.body, model, ctx, controller);
                result = expression_evaluate(result ? ast.case1 : ast.case2, model, ctx, controller);
            }
            return result;
        }
        var refs_extractVars = function() {
            return function(expr) {
                if ("string" === typeof expr) expr = expression_parse(expr);
                return _extractVars(expr);
            };
            function _extractVars(expr) {
                if (null == expr) return null;
                var refs, x;
                if (type_Body === expr.type) for (var i = 0, length = expr.body.length; i < length; i++) {
                    x = _extractVars(expr.body[i]);
                    refs = _append(refs, x);
                }
                if (type_SymbolRef === expr.type) {
                    var path = expr.body, next = expr.next;
                    while (null != next) {
                        if (type_FunctionRef === next.type) return _extractVars(next);
                        if (type_SymbolRef !== next.type) {
                            console.error("Ast Exception: next should be a symbol/function ref");
                            return null;
                        }
                        path += "." + next.body;
                        next = next.next;
                    }
                    return path;
                }
                switch (expr.type) {
                  case type_Statement:
                  case type_UnaryPrefix:
                  case type_Ternary:
                    x = _extractVars(expr.body);
                    refs = _append(refs, x);
                }
                if (type_Ternary === expr.type) {
                    x = _extractVars(ast.case1);
                    refs = _append(refs, x);
                    x = _extractVars(ast.case2);
                    refs = _append(refs, x);
                }
                if (type_FunctionRef === expr.type) {
                    for (var i = 0, length = expr.arguments.length; i < length; i++) {
                        x = _extractVars(expr.arguments[i]);
                        refs = _append(refs, x);
                    }
                    x = null;
                    var parent = expr;
                    outer: while (parent = parent.parent) switch (parent.type) {
                      case type_SymbolRef:
                        x = parent.body + (null == x ? "" : "." + x);
                        break;

                      case type_Body:
                      case type_Statement:
                        break outer;

                      default:
                        x = null;
                        break outer;
                    }
                    if (null != x) refs = _append(refs, x);
                    if (expr.next) {
                        x = _extractVars(expr.next);
                        refs = _append(refs, {
                            accessor: _getAccessor(expr),
                            ref: x
                        });
                    }
                }
                return refs;
            }
            function _append(current, x) {
                if (null == current) return x;
                if (null == x) return current;
                if (!("object" === typeof current && null != current.length)) current = [ current ];
                if (!("object" === typeof x && null != x.length)) {
                    if (current.indexOf(x) === -1) current.push(x);
                    return current;
                }
                for (var i = 0, imax = x.length; i < imax; i++) if (current.indexOf(x[i]) === -1) current.push(x[i]);
                return current;
            }
            function _getAccessor(current) {
                var parent = current;
                outer: while (parent.parent) {
                    switch (parent.parent.type) {
                      case type_Body:
                      case type_Statement:
                        break outer;
                    }
                    parent = parent.parent;
                }
                return _copy(parent, current.next);
            }
            function _copy(ast, stop) {
                if (ast === stop || null == ast) return null;
                if ("object" !== typeof ast) return ast;
                if (null != ast.length && "function" === typeof ast.splice) {
                    var arr = [];
                    for (var i = 0, imax = ast.length; i < imax; i++) arr[i] = _copy(ast[i], stop);
                    return arr;
                }
                var clone = {};
                for (var key in ast) {
                    if (null == ast[key] || "parent" === key) continue;
                    clone[key] = _copy(ast[key], stop);
                }
                return clone;
            }
        }();
        return {
            parse: expression_parse,
            eval: expression_evaluate,
            varRefs: refs_extractVars,
            evalStatements: function(expr, model, ctx, controller) {
                var body = expression_parse(expr).body, args = [], imax = body.length, i = -1;
                while (++i < imax) args[i] = expression_evaluate(body[i], model, ctx, controller);
                return args;
            }
        };
    }();
    !function() {
        function getNodes(node, model, ctx, controller) {
            function evaluate(expr) {
                return ExpressionUtil.eval(expr, model, ctx, controller);
            }
            if (evaluate(node.expression)) return node.nodes;
            while (true) {
                node = node.nextSibling;
                if (null == node || "else" !== node.tagName) break;
                var expr = node.expression;
                if (null == expr || "" === expr || evaluate(expr)) return node.nodes;
            }
            return null;
        }
        custom_Statements["if"] = {
            getNodes: getNodes,
            render: function(node, model, ctx, container, controller, childs) {
                var nodes = getNodes(node, model, ctx, controller);
                if (null == nodes) return;
                builder_build(nodes, model, ctx, container, controller, childs);
            }
        };
    }();
    !function() {
        custom_Statements["for"] = {
            render: function(node, model, ctx, container, controller, childs) {
                parse_For(node.expression);
                var value = ExpressionUtil.eval(__ForDirective[3], model, ctx, controller);
                if (null == value) return;
                build(value, __ForDirective, node.nodes, model, ctx, container, controller, childs);
            },
            build: build,
            parseFor: parse_For,
            createForItem: createForItem,
            getNodes: getNodes,
            getHandler: function(compoName, model) {
                return createHandler(compoName, model);
            }
        };
        function build(value, For, nodes, model, ctx, container, ctr, childs) {
            builder_build(getNodes(nodes, value, For[0], For[1], For[2]), model, ctx, container, ctr, childs);
        }
        function getNodes(nodes, value, prop1, prop2, type) {
            if ("of" === type) {
                if (false === is_Array(value)) {
                    console.warn("<ForStatement> Value is not enumerable", value);
                    return null;
                }
                return loop_Array(nodes, value, prop1, prop2);
            }
            if ("in" === type) {
                if ("object" !== typeof value) {
                    console.warn("<ForStatement> Value is not an object", value);
                    return null;
                }
                if (is_Array(value)) console.log("<mask:for> Consider to use `for..of` for Arrays");
                return loop_Object(nodes, value, prop1, prop2);
            }
        }
        function loop_Array(template, arr, prop1, prop2) {
            var i = -1, imax = arr.length, nodes = new Array(imax), scope;
            while (++i < imax) {
                scope = {};
                scope[prop1] = arr[i];
                if (prop2) scope[prop2] = i;
                nodes[i] = createForItem("for..of/item", template, scope);
            }
            return nodes;
        }
        function loop_Object(template, obj, prop1, prop2) {
            var nodes = [], i = 0, scope, key, value;
            for (key in obj) {
                value = obj[key];
                scope = {};
                scope[prop1] = key;
                if (prop2) scope[prop2] = value;
                nodes[i++] = createForItem("for..in/item", template, scope);
            }
            return nodes;
        }
        function createForItem(name, nodes, scope) {
            return {
                type: Dom.COMPONENT,
                tagName: name,
                nodes: nodes,
                controller: {
                    compoName: name,
                    scope: scope,
                    renderEnd: handler_proto_renderEnd
                }
            };
        }
        function createHandler(name, scope) {
            return {
                compoName: name,
                scope: scope,
                renderEnd: handler_proto_renderEnd
            };
        }
        function handler_proto_renderEnd(elements) {
            this.elements = elements;
        }
        var __ForDirective = [ "prop1", "prop2", "in|of", "expression" ], state_prop = 1, state_multiprop = 2, state_loopType = 3;
        var template, index, length;
        function parse_For(expr) {
            template = expr;
            length = expr.length;
            index = 0;
            var prop1, prop2, loopType, hasBrackets, c;
            c = parser_skipWhitespace();
            if (40 === c) {
                hasBrackets = true;
                index++;
                parser_skipWhitespace();
            }
            prop1 = parser_getVarDeclaration();
            c = parser_skipWhitespace();
            if (44 === c) {
                if (true !== hasBrackets) return throw_("Parenthese must be used in multiple var declarion");
                index++;
                parser_skipWhitespace();
                prop2 = parser_getVarDeclaration();
            }
            if (hasBrackets) {
                c = parser_skipWhitespace();
                if (41 !== c) return throw_("Closing parenthese expected");
                index++;
            }
            c = parser_skipWhitespace();
            var loopType;
            if (105 === c && 110 === template.charCodeAt(++index)) loopType = "in";
            if (111 === c && 102 === template.charCodeAt(++index)) loopType = "of";
            if (null == loopType) return throw_("Invalid FOR statement. (in|of) expected");
            __ForDirective[0] = prop1;
            __ForDirective[1] = prop2;
            __ForDirective[2] = loopType;
            __ForDirective[3] = template.substring(++index);
            return __ForDirective;
        }
        function parser_skipWhitespace() {
            var c;
            for (;index < length; index++) {
                c = template.charCodeAt(index);
                if (c < 33) continue;
                return c;
            }
            return -1;
        }
        function parser_getVarDeclaration() {
            var start = index, var_, c;
            for (;index < length; index++) {
                c = template.charCodeAt(index);
                if (c > 48 && c < 57) {
                    if (start === index) return throw_("Variable name begins with a digit");
                    continue;
                }
                if (36 === c || 95 === c || c >= 97 && c <= 122 || c >= 65 && c <= 90) continue;
                break;
            }
            if (start === index) return throw_("Variable declaration expected");
            return template.substring(start, index);
        }
        function throw_(message) {
            throw new Error("<ForStatement parser> " + message + " `" + template.substring(index, 20) + "`");
        }
    }();
    !function() {
        custom_Statements["each"] = {
            render: function(node, model, ctx, container, controller, children) {
                var array = ExpressionUtil.eval(node.expression, model, ctx, controller);
                if (null == array) return;
                build(node.nodes, array, ctx, container, controller, children);
            },
            createItem: createEachItem,
            build: build
        };
        function build(template, array, ctx, container, controller, children) {
            var imax = array.length, i = -1, nodes = template, itemCtr;
            while (++i < imax) {
                itemCtr = createEachItem(i, nodes, controller);
                builder_build(nodes, array[i], ctx, container, itemCtr, children);
                if (null != itemCtr.components) arr_pushMany(controller.components, itemCtr.components);
            }
        }
        function createEachItem(index, nodes, parent) {
            return {
                type: Dom.COMPONENT,
                compoName: "each::item",
                scope: {
                    index: index
                },
                parent: parent,
                nodes: nodes,
                model: null,
                attr: null,
                components: null,
                elements: null,
                ID: null
            };
        }
    }();
    custom_Statements["with"] = {
        render: function(node, model, ctx, container, controller, childs) {
            var obj = ExpressionUtil.eval(node.expression, model, ctx, controller);
            builder_build(node.nodes, obj, ctx, container, controller, childs);
        }
    };
    !function() {
        var eval_ = ExpressionUtil.eval;
        custom_Statements["switch"] = {
            render: function(node, model, ctx, container, controller, childs) {
                var value = eval_(node.expression, model, ctx, controller), nodes = getNodes(value, node.nodes, model, ctx, controller);
                if (null == nodes) return;
                builder_build(nodes, model, ctx, container, controller, childs);
            },
            getNodes: getNodes
        };
        function getNodes(value, nodes, model, ctx, controller) {
            if (null == nodes) return null;
            var imax = nodes.length, i = -1, child, expr, case_, default_;
            while (++i < imax) {
                child = nodes[i];
                if ("default" === child.tagName) {
                    default_ = child;
                    continue;
                }
                if ("case" !== child.tagName) {
                    console.warn("<mask:switch> Case expected", child.tagName);
                    continue;
                }
                expr = child.expression;
                if (!expr) {
                    console.warn("<mask:switch:case> Expression expected");
                    continue;
                }
                if (eval_(expr, model, ctx, controller) == value) {
                    //! `==` comparison
                    case_ = child;
                    break;
                }
            }
            if (null == case_) case_ = default_;
            return null != case_ ? case_.nodes : null;
        }
    }();
    !function() {
        custom_Statements["include"] = {
            render: function(node, model, ctx, container, controller, childs) {
                var arguments_ = ExpressionUtil.evalStatements(node.expression);
                var resource;
                while (null != controller) {
                    resource = controller.resource;
                    if (null != resource) break;
                    controller = controller.parent;
                }
                var ctr = new IncludeController(controller), resume = Compo.pause(ctr, ctx);
                include.instance(resource && resource.url).load.apply(resource, arguments_).done(function(resp) {
                    ctr.templates = resp.load;
                    builder_build(node.nodes, model, ctx, container, ctr, childs);
                    resume();
                });
            }
        };
        function IncludeController(parent) {
            this.parent = parent;
            this.compoName = "include";
            this.components = [];
            this.templates = null;
        }
    }();
    custom_Statements["import"] = {
        render: function(node, model, ctx, container, controller, childs) {
            var expr = node.expression, args = ExpressionUtil.evalStatements(expr, model, ctx, controller), name = args[0];
            if ("string" !== typeof name) {
                console.error("<mask:import> Invalid argument", expr);
                return;
            }
            while (true) {
                if ("include" == controller.compoName) break;
                controller = controller.parent;
                if (null == controller) break;
            }
            if (null == controller) return;
            var nodes = controller.templates[name];
            if (null == nodes) return;
            builder_build(Parser.parse(nodes), model, ctx, container, controller, childs);
        }
    };
    var Dom;
    !function() {
        var dom_NODE = 1, dom_TEXTNODE = 2, dom_FRAGMENT = 3, dom_COMPONENT = 4, dom_CONTROLLER = 9, dom_SET = 10, dom_STATEMENT = 15;
        function _appendChild(el) {
            if (null == this.nodes) {
                this.nodes = [ el ];
                return;
            }
            this.nodes.push(el);
            var prev = this.nodes[this.nodes.length - 2];
            prev.nextSibling = el;
        }
        function Node(tagName, parent) {
            this.type = Dom.NODE;
            this.tagName = tagName;
            this.parent = parent;
            this.attr = {};
        }
        Node.prototype = {
            constructor: Node,
            type: dom_NODE,
            tagName: null,
            parent: null,
            attr: null,
            nodes: null,
            expression: null,
            appendChild: _appendChild,
            __single: null
        };
        function TextNode(text, parent) {
            this.content = text;
            this.parent = parent;
        }
        TextNode.prototype = {
            type: dom_TEXTNODE,
            content: null,
            parent: null
        };
        function Component(compoName, parent, controller) {
            this.tagName = compoName;
            this.parent = parent;
            this.controller = controller;
            this.attr = {};
        }
        Component.prototype = {
            constructor: Component,
            type: dom_COMPONENT,
            parent: null,
            attr: null,
            controller: null,
            nodes: null,
            components: null,
            model: null,
            modelRef: null
        };
        function Fragment() {}
        Fragment.prototype = {
            constructor: Fragment,
            type: dom_FRAGMENT,
            nodes: null,
            appendChild: _appendChild
        };
        Dom = {
            NODE: dom_NODE,
            TEXTNODE: dom_TEXTNODE,
            FRAGMENT: dom_FRAGMENT,
            COMPONENT: dom_COMPONENT,
            CONTROLLER: dom_CONTROLLER,
            SET: dom_SET,
            STATEMENT: dom_STATEMENT,
            Node: Node,
            TextNode: TextNode,
            Fragment: Fragment,
            Component: Component
        };
    }();
    var parser_parse, parser_ensureTemplateFunction, parser_setInterpolationQuotes, parser_cleanObject, Parser;
    !function(Node, TextNode, Fragment, Component) {
        var interp_START = "~", interp_OPEN = "[", interp_CLOSE = "]", interp_code_START = 126, interp_code_OPEN = 91, interp_code_CLOSE = 93, _serialize;
        var cursor_bracketsEnd, cursor_quotesEnd;
        !function() {
            cursor_bracketsEnd = function(template, index, length, startCode, endCode) {
                var c, count = 0;
                for (;index < length; index++) {
                    c = template.charCodeAt(index);
                    if (34 === c) {
                        index = cursor_quotesEnd(template, index + 1, length, '"');
                        continue;
                    }
                    if (c === startCode) {
                        count++;
                        continue;
                    }
                    if (c === endCode) if (--count === -1) return index;
                }
                _throw(template, index, null, "Not closed brackets `" + String.fromCharCode(startCode) + "`");
                return index;
            };
            cursor_quotesEnd = function(template, index, length, char_) {
                var nindex;
                while ((nindex = template.indexOf(char_, index)) !== -1) {
                    index = nindex;
                    if (92 !== template.charCodeAt(nindex - 1)) break;
                    index++;
                }
                return index;
            };
        }();
        function ensureTemplateFunction(template) {
            var index = -1;
            while ((index = template.indexOf(interp_START, index)) !== -1) {
                if (template.charCodeAt(index + 1) === interp_code_OPEN) break;
                index++;
            }
            if (index === -1) return template;
            var array = [], lastIndex = 0, i = 0, end;
            while (true) {
                end = template.indexOf(interp_CLOSE, index + 2);
                if (end === -1) break;
                array[i++] = lastIndex === index ? "" : template.substring(lastIndex, index);
                array[i++] = template.substring(index + 2, end);
                lastIndex = index = end + 1;
                while ((index = template.indexOf(interp_START, index)) !== -1) {
                    if (template.charCodeAt(index + 1) === interp_code_OPEN) break;
                    index++;
                }
                if (index === -1) break;
            }
            if (lastIndex < template.length) array[i] = template.substring(lastIndex);
            template = null;
            return function(type, model, ctx, element, controller, name) {
                if (null == type) {
                    var string = "", imax = array.length, i = -1, x;
                    while (++i < imax) {
                        x = array[i];
                        string += i % 2 === 1 ? interp_START + interp_OPEN + x + interp_CLOSE : x;
                    }
                    return string;
                }
                return util_interpolate(array, type, model, ctx, element, controller, name);
            };
        }
        function _throw(template, index, state, token) {
            var parsing = {
                2: "tag",
                3: "tag",
                5: "attribute key",
                6: "attribute value",
                8: "literal"
            }[state], lines = template.substring(0, index).split("\n"), line = lines.length, row = lines[line - 1].length, message = [ "Mask - Unexpected:", token, "at(", line, ":", row, ") [ in", parsing, "]" ];
            console.error(message.join(" "), {
                stopped: template.substring(index),
                template: template
            });
        }
        var go_tag = 2, state_tag = 3, state_attr = 5, go_attrVal = 6, go_attrHeadVal = 7, state_literal = 8, go_up = 9;
        Parser = {
            parse: function(template) {
                var current = new Fragment(), fragment = current, state = go_tag, last = state_tag, index = 0, length = template.length, classNames, token, key, value, next, c, start, nextC;
                while (true) {
                    if (index < length && (c = template.charCodeAt(index)) < 33) {
                        index++;
                        continue;
                    }
                    if (47 === c) {
                        nextC = template.charCodeAt(index + 1);
                        if (47 === nextC) {
                            index++;
                            while (10 !== c && 13 !== c && index < length) c = template.charCodeAt(++index);
                            continue;
                        }
                        if (42 === nextC) {
                            index = template.indexOf("*/", index + 2) + 2;
                            if (1 === index) {
                                console.warn("<mask:parse> block comment has no end");
                                index = length;
                            }
                            continue;
                        }
                    }
                    if (last === state_attr) {
                        if (null != classNames) {
                            current.attr["class"] = ensureTemplateFunction(classNames);
                            classNames = null;
                        }
                        if (null != key) {
                            current.attr[key] = key;
                            key = null;
                            token = null;
                        }
                    }
                    if (null != token) {
                        if (state === state_attr) {
                            if (null == key) key = token; else value = token;
                            if (null != key && null != value) {
                                if ("class" !== key) current.attr[key] = value; else classNames = null == classNames ? value : classNames + " " + value;
                                key = null;
                                value = null;
                            }
                        } else if (last === state_tag) {
                            next = new Node(token, current);
                            current.appendChild(next);
                            current = next;
                            state = state_attr;
                        } else if (last === state_literal) {
                            next = new TextNode(token, current);
                            current.appendChild(next);
                            if (true === current.__single) do current = current.parent; while (null != current && null != current.__single);
                            state = go_tag;
                        }
                        token = null;
                    }
                    if (index >= length) {
                        if (state === state_attr) {
                            if (null != classNames) current.attr["class"] = ensureTemplateFunction(classNames);
                            if (null != key) current.attr[key] = key;
                        }
                        break;
                    }
                    if (state === go_up) {
                        current = current.parent;
                        while (null != current && null != current.__single) current = current.parent;
                        state = go_tag;
                    }
                    switch (c) {
                      case 123:
                        last = state;
                        state = go_tag;
                        index++;
                        continue;

                      case 62:
                        last = state;
                        state = go_tag;
                        index++;
                        current.__single = true;
                        continue;

                      case 59:
                        if (null != current.nodes) {
                            index++;
                            continue;
                        }

                      case 125:
                        index++;
                        last = state;
                        state = go_up;
                        continue;

                      case 39:
                      case 34:
                        if (state === go_attrVal) state = state_attr; else last = state = state_literal;
                        index++;
                        var isEscaped = false, isUnescapedBlock = false, nindex, _char = 39 === c ? "'" : '"';
                        start = index;
                        while ((nindex = template.indexOf(_char, index)) > -1) {
                            index = nindex;
                            if (92 !== template.charCodeAt(nindex - 1)) break;
                            isEscaped = true;
                            index++;
                        }
                        if (start === index) {
                            nextC = template.charCodeAt(index + 1);
                            if (124 === nextC || nextC === c) {
                                isUnescapedBlock = true;
                                start = index + 2;
                                index = nindex = template.indexOf((124 === nextC ? "|" : _char) + _char + _char, start);
                                if (index === -1) index = length;
                            }
                        }
                        token = template.substring(start, index);
                        if (true === isEscaped) token = token.replace(regexpEscapedChar[_char], _char);
                        token = ensureTemplateFunction(token);
                        index += isUnescapedBlock ? 3 : 1;
                        continue;
                    }
                    if (state === go_tag) {
                        last = state_tag;
                        state = state_tag;
                        if (46 === c || 35 === c) {
                            token = "div";
                            continue;
                        }
                    } else if (state === state_attr) if (46 === c) {
                        index++;
                        key = "class";
                        state = go_attrHeadVal;
                    } else if (35 === c) {
                        index++;
                        key = "id";
                        state = go_attrHeadVal;
                    } else if (61 === c) {
                        index++;
                        state = go_attrVal;
                        continue;
                    } else if (40 === c) {
                        start = 1 + index;
                        index = 1 + cursor_bracketsEnd(template, start, length, c, 41);
                        current.expression = template.substring(start, index - 1);
                        current.type = Dom.STATEMENT;
                        continue;
                    } else if (null != key) {
                        token = key;
                        continue;
                    }
                    if (state === go_attrVal || state === go_attrHeadVal) {
                        last = state;
                        state = state_attr;
                    }
                    var isInterpolated = null;
                    start = index;
                    while (index < length) {
                        c = template.charCodeAt(index);
                        if (c === interp_code_START && template.charCodeAt(index + 1) === interp_code_OPEN) {
                            isInterpolated = true;
                            ++index;
                            do c = template.charCodeAt(++index); while (c !== interp_code_CLOSE && index < length);
                        }
                        if (39 === c || 34 === c || 47 === c || 60 === c || 44 === c) {
                            _throw(template, index, state, String.fromCharCode(c));
                            break;
                        }
                        if (last !== go_attrVal && (46 === c || 35 === c)) break;
                        if (c < 33 || 61 === c || 62 === c || 59 === c || 40 === c || 123 === c || 125 === c) break;
                        index++;
                    }
                    token = template.substring(start, index);
                    if (!token) {
                        _throw(template, index, state, "<empty token>");
                        break;
                    }
                    if (true === isInterpolated && state === state_tag) {
                        _throw(template, index, state, "Tag Names cannt be interpolated (in dev)");
                        break;
                    }
                    if (true === isInterpolated && false === (state === state_attr && "class" === key)) token = ensureTemplateFunction(token);
                }
                if (null != current.parent && current.parent !== fragment && true !== current.parent.__single && null != current.nodes) console.warn("Mask - ", current.parent.tagName, JSON.stringify(current.parent.attr), "was not proper closed.");
                return null != fragment.nodes && 1 === fragment.nodes.length ? fragment.nodes[0] : fragment;
            },
            cleanObject: function(obj) {
                if (obj instanceof Array) {
                    for (var i = 0; i < obj.length; i++) this.cleanObject(obj[i]);
                    return obj;
                }
                delete obj.parent;
                delete obj.__single;
                if (null != obj.nodes) this.cleanObject(obj.nodes);
                return obj;
            },
            setInterpolationQuotes: function(start, end) {
                if (!start || 2 !== start.length) {
                    console.error("Interpolation Start must contain 2 Characters");
                    return;
                }
                if (!end || 1 !== end.length) {
                    console.error("Interpolation End must be of 1 Character");
                    return;
                }
                interp_code_START = start.charCodeAt(0);
                interp_code_OPEN = start.charCodeAt(1);
                interp_code_CLOSE = end.charCodeAt(0);
                interp_START = start[0];
                interp_OPEN = start[1];
                interp_CLOSE = end;
            },
            ensureTemplateFunction: ensureTemplateFunction
        };
        parser_parse = Parser.parse;
        parser_ensureTemplateFunction = Parser.ensureTemplateFunction;
        parser_cleanObject = Parser.cleanObject;
        parser_setInterpolationQuotes = Parser.setInterpolationQuotes;
    }(Dom.Node, Dom.TextNode, Dom.Fragment, Dom.Component);
    var builder_componentID = 0, builder_build;
    !function(custom_Attributes, custom_Tags, Component) {
        function listeners_emit(name) {
            if (null == listeners || null == listeners[name]) return;
            var fns = listeners.compoCreated, imax = fns.length, i = -1, args = _Array_slice.call(arguments, 1);
            while (++i < imax) fns[i].apply(null, args);
        }
        function build_resumeDelegate(controller, model, cntx, container, childs) {
            var anchor = container.appendChild(document.createComment(""));
            return function() {
                return build_resumeController(controller, model, cntx, anchor, childs);
            };
        }
        function build_resumeController(controller, model, cntx, anchor, childs) {
            if (null != controller.tagName && controller.tagName !== controller.compoName) controller.nodes = {
                tagName: controller.tagName,
                attr: controller.attr,
                nodes: controller.nodes,
                type: 1
            };
            if (null != controller.model) model = controller.model;
            var nodes = controller.nodes, elements = [];
            if (null != nodes) {
                var isarray = nodes instanceof Array, length = true === isarray ? nodes.length : 1, i = 0, childNode = null, fragment = document.createDocumentFragment();
                for (;i < length; i++) {
                    childNode = true === isarray ? nodes[i] : nodes;
                    builder_build(childNode, model, cntx, fragment, controller, elements);
                }
                anchor.parentNode.insertBefore(fragment, anchor);
            }
            if (null == controller.tagName) {
                var attrHandlers = controller.handlers && controller.handlers.attr, attrFn, key;
                for (key in controller.attr) {
                    attrFn = null;
                    if (attrHandlers && is_Function(attrHandlers[key])) attrFn = attrHandlers[key];
                    if (null == attrFn && is_Function(custom_Attributes[key])) attrFn = custom_Attributes[key];
                    if (null != attrFn) attrFn(node, controller.attr[key], model, cntx, elements[0], controller);
                }
            }
            if (is_Function(controller.renderEnd)) controller.renderEnd(elements, model, cntx, anchor.parentNode);
            if (null != childs && childs !== elements) {
                var il = childs.length, jl = elements.length;
                j = -1;
                while (++j < jl) childs[il + j] = elements[j];
            }
        }
        function controller_pushCompo(controller, compo) {
            if (null == controller.components) {
                controller.components = [ compo ];
                return;
            }
            controller.components.push(compo);
        }
        var build_textNode = function() {
            var append_textNode = function(document) {
                return function(element, text) {
                    element.appendChild(document.createTextNode(text));
                };
            }(document);
            return function build_textNode(node, model, ctx, container, controller) {
                var content = node.content;
                if (is_Function(content)) {
                    var result = content("node", model, ctx, container, controller);
                    if ("string" === typeof result) {
                        append_textNode(container, result);
                        return;
                    }
                    var text = "", jmax = result.length, j = 0, x;
                    for (;j < jmax; j++) {
                        x = result[j];
                        if ("object" === typeof x) {
                            if ("" !== text) {
                                append_textNode(container, text);
                                text = "";
                            }
                            if (null == x.nodeType) {
                                text += x.toString();
                                continue;
                            }
                            container.appendChild(x);
                            continue;
                        }
                        text += x;
                    }
                    if ("" !== text) append_textNode(container, text);
                    return;
                }
                append_textNode(container, content);
            };
        }();
        var build_node = function() {
            var el_create = function(doc) {
                return function(name) {
                    try {
                        return doc.createElement(name);
                    } catch (error) {
                        console.error(name, "element cannot be created. If this should be a custom handler tag, then controller is not defined");
                        return null;
                    }
                };
            }(document);
            return function build_node(node, model, ctx, container, controller, childs) {
                var tagName = node.tagName, attr = node.attr;
                var tag = el_create(tagName);
                if (null == tag) return;
                if (null != childs) {
                    childs.push(tag);
                    attr["x-compo-id"] = controller.ID;
                }
                if (null != container) container.appendChild(tag);
                var key, value;
                for (key in attr) {
                    if (is_Function(attr[key])) {
                        value = attr[key]("attr", model, ctx, tag, controller, key);
                        if (value instanceof Array) value = value.join("");
                    } else value = attr[key];
                    if (value) if (is_Function(custom_Attributes[key])) custom_Attributes[key](node, value, model, ctx, tag, controller, container); else tag.setAttribute(key, value);
                }
                return tag;
            };
        }();
        var build_compo;
        !function() {
            build_compo = function(node, model, ctx, container, controller, childs) {
                var compoName = node.tagName, Handler;
                if (null != node.controller) Handler = node.controller;
                if (null == Handler) Handler = custom_Tags[compoName];
                if (null == Handler) return build_NodeAsCompo(node, model, ctx, container, controller, childs);
                var isStatic = false, handler, attr, key;
                if ("function" === typeof Handler) handler = new Handler(model); else {
                    handler = Handler;
                    isStatic = true;
                }
                var fn = isStatic ? build_Static : build_Component;
                return fn(handler, node, model, ctx, container, controller, childs);
            };
            function build_Component(compo, node, model, ctx, container, controller, childs) {
                var attr, key;
                compo.compoName = node.tagName;
                compo.attr = attr = attr_extend(compo.attr, node.attr);
                compo.parent = controller;
                compo.ID = ++builder_componentID;
                if (null == compo.model) compo.model = model;
                if (null == compo.nodes) compo.nodes = node.nodes;
                for (key in attr) if ("function" === typeof attr[key]) attr[key] = attr[key]("attr", model, ctx, container, controller, key);
                if (null != listeners) listeners_emit("compoCreated", compo, model, ctx, container);
                if ("function" === typeof compo.renderStart) compo.renderStart(model, ctx, container);
                controller_pushCompo(controller, compo);
                if (true === compo.async) {
                    compo.await(build_resumeDelegate(compo, model, ctx, container, childs));
                    return null;
                }
                if (null != compo.tagName) compo.nodes = {
                    tagName: compo.tagName,
                    attr: compo.attr,
                    nodes: compo.nodes,
                    type: 1
                };
                if ("function" === typeof compo.render) {
                    compo.render(compo.model, ctx, container);
                    return null;
                }
                return compo;
            }
            function build_Static(static_, node, model, ctx, container, controller, childs) {
                var Ctor = static_.__Ctor, wasRendered = false, elements, compo, clone;
                if (Ctor) clone = new Ctor(node, controller); else {
                    clone = static_;
                    for (var key in node) clone[key] = node[key];
                    clone.parent = controller;
                }
                var attr = clone.attr;
                if (null != attr) for (var key in attr) if ("function" === typeof attr[key]) attr[key] = attr[key]("attr", model, ctx, container, controller, key);
                if (is_Function(clone.renderStart)) clone.renderStart(model, ctx, container, controller, childs);
                if (is_Function(clone.render)) {
                    wasRendered = true;
                    elements = clone.render(model, ctx, container, controller, childs);
                    arr_pushMany(childs, elements);
                    if (is_Function(clone.renderEnd)) compo = clone.renderEnd(elements, model, ctx, container, controller);
                }
                controller_pushCompo(controller, compo || clone);
                return wasRendered ? null : clone;
            }
            function build_NodeAsCompo(node, model, ctx, container, controller, childs) {
                node.ID = ++builder_componentID;
                controller_pushCompo(controller, node);
                if (null == node.model) node.model = model;
                var els = node.elements = [];
                builder_build(node.nodes, node.model, ctx, container, node, els);
                if (null != childs && 0 !== els.length) arr_pushMany(childs, els);
                return null;
            }
        }();
        builder_build = function(node, model, ctx, container, controller, childs) {
            if (null == node) return container;
            var type = node.type, elements, key, value, j, jmax;
            if (null == controller) controller = new Component();
            if (null == type) if (node instanceof Array) type = 10; else if (null != node.tagName) type = 1; else if (null != node.content) type = 2;
            if (1 == type && null != custom_Tags[node.tagName]) type = 4;
            if (null == container && 1 !== type) container = document.createDocumentFragment();
            if (10 === type) {
                j = 0;
                jmax = node.length;
                for (;j < jmax; j++) builder_build(node[j], model, ctx, container, controller, childs);
                return container;
            }
            if (15 === type) {
                var Handler = custom_Statements[node.tagName];
                if (null == Handler) if (null != custom_Tags[node.tagName]) type = 4; else {
                    console.error("<mask: statement is undefined", node.tagName);
                    return container;
                }
                if (15 === type) {
                    Handler.render(node, model, ctx, container, controller, childs);
                    return container;
                }
            }
            if (1 === type) {
                if ("else" === node.tagName) return container;
                container = build_node(node, model, ctx, container, controller, childs);
                childs = null;
            }
            if (2 === type) {
                build_textNode(node, model, ctx, container, controller);
                return container;
            }
            if (4 === type) {
                controller = build_compo(node, model, ctx, container, controller, childs);
                if (null == controller) return container;
                elements = [];
                node = controller;
                if (controller.model !== model && null != controller.model) model = controller.model;
            }
            var nodes = node.nodes;
            if (null != nodes) {
                if (null != childs && null == elements) elements = childs;
                var isarray = nodes instanceof Array, length = true === isarray ? nodes.length : 1, i = 0, childNode = null;
                for (;i < length; i++) {
                    childNode = true === isarray ? nodes[i] : nodes;
                    builder_build(childNode, model, ctx, container, controller, elements);
                }
            }
            if (4 === type) {
                if (null == node.tagName && "%" !== node.compoName) {
                    var attrHandlers = node.handlers && node.handlers.attr, attrFn, val, key;
                    for (key in node.attr) {
                        val = node.attr[key];
                        if (null == val) continue;
                        attrFn = null;
                        if (null != attrHandlers && is_Function(attrHandlers[key])) attrFn = attrHandlers[key];
                        if (null == attrFn && null != custom_Attributes[key]) attrFn = custom_Attributes[key];
                        if (null != attrFn) attrFn(node, val, model, ctx, elements[0], controller);
                    }
                }
                if (is_Function(node.renderEnd)) node.renderEnd(elements, model, ctx, container);
            }
            if (null != childs && null != elements && childs !== elements) arr_pushMany(childs, elements);
            return container;
        };
    }(custom_Attributes, custom_Tags, Dom.Component);
    var cache = {}, Mask = {
        render: function(template, model, ctx, container, controller) {
            if (null != container && "function" !== typeof container.appendChild) {
                console.error(".render(template[, model, ctx, container, controller]", "Container should implement .appendChild method");
                console.warn("Args:", arguments);
            }
            if ("string" === typeof template) if (hasOwnProp.call(cache, template)) template = cache[template]; else template = cache[template] = parser_parse(template);
            if (null == ctx) ctx = {};
            return builder_build(template, model, ctx, container, controller);
        },
        compile: parser_parse,
        parse: parser_parse,
        build: builder_build,
        registerHandler: customTag_register,
        getHandler: function(tagName) {
            return null != tagName ? custom_Tags[tagName] : custom_Tags;
        },
        registerStatement: function(name, handler) {
            custom_Statements[name] = is_Function(handler) ? {
                render: handler
            } : handler;
        },
        getStatement: function(name) {
            return null != name ? custom_Statements[name] : custom_Statements;
        },
        registerAttrHandler: function(attrName, mix, Handler) {
            if (is_Function(mix)) Handler = mix;
            custom_Attributes[attrName] = Handler;
        },
        getAttrHandler: function(attrName) {
            return null != attrName ? custom_Attributes[attrName] : custom_Attributes;
        },
        registerUtil: customUtil_register,
        getUtil: customUtil_get,
        $utils: customUtil_$utils,
        registerUtility: function(utilityName, fn) {
            console.warn("@registerUtility - deprecated - use registerUtil(utilName, mix)", utilityName);
            this.registerUtility = this.registerUtil;
            this.registerUtility(utilityName, fn);
        },
        getUtility: function(util) {
            console.warn("@getUtility - deprecated - use getUtil(utilName)", util);
            this.getUtility = this.getUtil;
            return this.getUtility();
        },
        clearCache: function(key) {
            if ("string" === typeof key) delete cache[key]; else cache = {};
        },
        Utils: {
            Expression: ExpressionUtil,
            getProperty: obj_getProperty,
            ensureTmplFn: Parser.ensureTemplateFunction
        },
        Dom: Dom,
        plugin: function(source) {
            eval(source);
        },
        on: function(event, fn) {
            if (null == listeners) listeners = {};
            (listeners[event] || (listeners[event] = [])).push(fn);
        },
        delegateReload: function() {},
        setInterpolationQuotes: Parser.setInterpolationQuotes,
        setCompoIndex: function(index) {
            builder_componentID = index;
        },
        cfg: function() {
            var args = arguments;
            if (0 === args.length) return __cfg;
            var key, value;
            if (2 === args.length) {
                key = args[0];
                __cfg[key] = args[1];
                return;
            }
            var obj = args[0];
            if ("object" === typeof obj) for (key in obj) __cfg[key] = obj[key];
        }
    };
    Mask.renderDom = Mask.render;
    !function(mask) {
        var mask_stringify;
        !function() {
            mask_stringify = function(input, settings) {
                if (null == input) return "";
                if ("string" === typeof input) input = mask.parse(input);
                if (null == settings) {
                    _indent = 0;
                    _minimize = true;
                } else if ("number" === typeof settings) {
                    _indent = settings;
                    _minimize = 0 === _indent;
                } else {
                    _indent = settings && settings.indent || 4;
                    _minimize = 0 === _indent || settings && settings.minimizeAttributes;
                }
                return run(input);
            };
            var _minimize, _indent, Dom = mask.Dom;
            function doindent(count) {
                var output = "";
                while (count--) output += " ";
                return output;
            }
            function run(node, indent, output) {
                var outer, i;
                if (null == indent) indent = 0;
                if (null == output) {
                    outer = true;
                    output = [];
                }
                var index = output.length;
                if (node.type === Dom.FRAGMENT) node = node.nodes;
                if (node instanceof Array) for (i = 0; i < node.length; i++) processNode(node[i], indent, output); else processNode(node, indent, output);
                var spaces = doindent(indent);
                for (i = index; i < output.length; i++) output[i] = spaces + output[i];
                if (outer) return output.join(0 === _indent ? "" : "\n");
            }
            function processNode(node, currentIndent, output) {
                if ("string" === typeof node.content) {
                    output.push(wrapString(node.content));
                    return;
                }
                if ("function" === typeof node.content) {
                    output.push(wrapString(node.content()));
                    return;
                }
                if (isEmpty(node)) {
                    output.push(processNodeHead(node) + ";");
                    return;
                }
                if (isSingle(node)) {
                    var next = _minimize ? ">" : " > ";
                    output.push(processNodeHead(node) + next);
                    run(getSingle(node), _indent, output);
                    return;
                }
                output.push(processNodeHead(node) + "{");
                run(node.nodes, _indent, output);
                output.push("}");
                return;
            }
            function processNodeHead(node) {
                var tagName = node.tagName, _id = node.attr.id || "", _class = node.attr["class"] || "";
                if ("function" === typeof _id) _id = _id();
                if ("function" === typeof _class) _class = _class();
                if (_id) _id = _id.indexOf(" ") !== -1 ? "" : "#" + _id;
                if (_class) _class = "." + _class.split(" ").join(".");
                var attr = "";
                for (var key in node.attr) {
                    if ("id" === key || "class" === key) continue;
                    var value = node.attr[key];
                    if ("function" === typeof value) value = value();
                    if (false === _minimize || /[^\w_$\-\.]/.test(value)) value = wrapString(value);
                    attr += " " + key;
                    if (key !== value) attr += "=" + value;
                }
                if ("div" === tagName && (_id || _class)) tagName = "";
                var expr = "";
                if (node.expression) expr = "(" + node.expression + ")";
                return tagName + _id + _class + attr + expr;
            }
            function isEmpty(node) {
                return null == node.nodes || node.nodes instanceof Array && 0 === node.nodes.length;
            }
            function isSingle(node) {
                return node.nodes && (node.nodes instanceof Array === false || 1 === node.nodes.length);
            }
            function getSingle(node) {
                if (node.nodes instanceof Array) return node.nodes[0];
                return node.nodes;
            }
            function wrapString(str) {
                if (str.indexOf("'") === -1) return "'" + str.trim() + "'";
                if (str.indexOf('"') === -1) return '"' + str.trim() + '"';
                return '"' + str.replace(/"/g, '\\"').trim() + '"';
            }
        }();
        mask.stringify = mask_stringify;
    }(Mask);
    !function(mask) {
        function Sys() {
            this.attr = {
                "debugger": null,
                use: null,
                repeat: null,
                "if": null,
                "else": null,
                each: null,
                log: null,
                visible: null,
                model: null
            };
            this.model = null;
            this.modelRef = null;
            this.nodes = null;
            this.parent = null;
            this.container = null;
            this.template = null;
        }
        mask.registerHandler("%", Sys);
        Sys.prototype = {
            renderStart: function(model, ctx, container) {
                var attr = this.attr;
                if (null != attr["each"] || null != attr["foreach"]) {
                    each(this, model, ctx, container);
                    return;
                }
                if (null != attr["if"]) {
                    this.state = ExpressionUtil.eval(attr["if"], model, ctx, this.parent);
                    if (!this.state) this.nodes = null;
                    return;
                }
                if (null != attr["else"]) {
                    var compos = this.parent.components, prev = compos && compos[compos.length - 1];
                    if (null != prev && "%" === prev.compoName && null != prev.attr["if"]) {
                        if (prev.state) this.nodes = null;
                        return;
                    }
                    console.error("Previous Node should be \"% if='condition'\"", prev, this.parent);
                    return;
                }
                if (null != attr["use"]) {
                    var use = attr["use"];
                    this.model = obj_getProperty(model, use);
                    this.modelRef = use;
                    return;
                }
                if (null != attr["debugger"]) {
                    debugger;
                    return;
                }
                if (null != attr["visible"]) {
                    var state = ExpressionUtil.eval(attr.visible, model, ctx, this.parent);
                    if (!state) this.nodes = null;
                    return;
                }
                if (null != attr["log"]) {
                    var key = attr.log, value = obj_getProperty(model, key);
                    console.log("Key: %s, Value: %s", key, value);
                    return;
                }
                if (null != attr["repeat"]) repeat(this, model, ctx, container);
            },
            render: null,
            renderEnd: null,
            append: null
        };
        function each(compo, model, ctx, container) {
            if (null == compo.nodes) Compo.ensureTemplate(compo);
            var prop = compo.attr.each || compo.attr.foreach, array = ExpressionUtil.eval(prop, model, ctx, compo), nodes = compo.nodes;
            compo.nodes = null;
            if (null == array) return;
            if ("number" !== typeof array.length) array = obj_toDictionary(array);
            compo.nodes = [];
            compo.model = array;
            compo.modelRef = prop;
            compo.template = nodes;
            compo.container = container;
            var imax = array.length, i = -1;
            if (null == imax) return;
            while (++i < imax) compo.nodes[i] = compo_init("%.each.item", nodes, array[i], i, container, compo);
            compo.append = ListProto.append;
        }
        function repeat(compo, model, cntx, container) {
            var repeat = compo.attr.repeat.split(".."), index = +repeat[0], length = +repeat[1], nodes = compo.nodes, x;
            (isNaN(index) || isNaN(length)) && console.error("Repeat attribute(from..to) invalid", compo.attr.repeat);
            compo.nodes = [];
            var i = -1;
            while (++i < length) compo.nodes[i] = compo_init("%.repeat.item", nodes, model, i, container, compo);
        }
        function compo_init(name, nodes, model, index, container, parent) {
            return {
                type: Dom.COMPONENT,
                compoName: name,
                attr: {},
                nodes: nodes,
                model: model,
                container: container,
                parent: parent,
                index: index
            };
        }
        var ListProto = {
            append: function(model) {
                var item = new Component();
                item.nodes = this.template;
                item.model = model;
                mask.render(item, model, null, this.container, this);
            }
        };
    }(Mask);
    !function(mask) {
        var TemplateCollection = {};
        mask.templates = TemplateCollection;
        mask.registerHandler(":template", TemplateHandler);
        function TemplateHandler() {}
        TemplateHandler.prototype.render = function() {
            if (null == this.attr.id) {
                console.warn("Template Should be defined with ID attribute for future lookup");
                return;
            }
            TemplateCollection[this.attr.id] = this.nodes;
        };
        mask.registerHandler(":import", ImportHandler);
        function ImportHandler() {}
        ImportHandler.prototype = {
            constructor: ImportHandler,
            attr: null,
            template: null,
            renderStart: function() {
                if (this.attr.id) {
                    this.nodes = this.template;
                    if (null == this.nodes) this.nodes = TemplateCollection[this.attr.id];
                    if (null == this.nodes) {
                        var parent = this, template, selector = ":template[id=" + this.attr.id + "]";
                        while (null == template && null != (parent = parent.parent)) if (null != parent.nodes) template = jmask(parent.nodes).filter(selector).get(0);
                        if (null != template) this.nodes = template.nodes;
                    }
                    if (null == this.nodes) console.warn("Template could be not imported", this.attr.id);
                }
            }
        };
        mask.registerHandler(":html", HTMLHandler);
        function HTMLHandler() {}
        HTMLHandler.prototype = {
            mode: "server:all",
            render: function(model, cntx, container) {
                var html = jmask(this.nodes).text(model, cntx, this);
                if (!html) {
                    console.warn("No HTML for node", this);
                    return;
                }
                if (container.insertAdjacentHTML) {
                    container.insertAdjacentHTML("beforeend", html);
                    return;
                }
                this.toHtml = function() {
                    return html;
                };
            }
        };
    }(Mask);
    var Compo = exports.Compo = function(mask) {
        var Dom = mask.Dom, _array_slice = Array.prototype.slice, _Array_splice = Array.prototype.splice, _Array_indexOf = Array.prototype.indexOf, _mask_ensureTmplFnOrig = mask.Utils.ensureTmplFn, domLib, Class;
        !function() {
            var scope = [ global.atma, exports, global ];
            function resolve() {
                var args = arguments, j = scope.length, obj, r, i;
                while (--j > -1) {
                    obj = scope[j];
                    if (null == obj) continue;
                    i = args.length;
                    while (--i > -1) {
                        r = obj[args[i]];
                        if (null != r) return r;
                    }
                }
            }
            domLib = resolve("jQuery", "Zepto", "$");
            Class = resolve("Class");
        }();
        if (null != global.document && null == domLib) console.warn("jQuery-Zepto-Kimbo etc. was not loaded before MaskJS:Compo, please use Compo.config.setDOMLibrary to define dom engine");
        function _mask_ensureTmplFn(value) {
            return "string" !== typeof value ? value : _mask_ensureTmplFnOrig(value);
        }
        function is_Function(x) {
            return "function" === typeof x;
        }
        function is_Object(x) {
            return null != x && "object" === typeof x;
        }
        function is_Array(arr) {
            return null != arr && "object" === typeof arr && "number" === typeof arr.length && "function" === typeof arr.splice;
        }
        function is_String(x) {
            return "string" === typeof x;
        }
        function is_notEmptyString(x) {
            return "string" === typeof x && "" !== x;
        }
        function is_rawObject(obj) {
            if (null == obj) return false;
            if ("object" !== typeof obj) return false;
            return obj.constructor === Object;
        }
        if (!Array.prototype.indexOf) Array.prototype.indexOf = function(x) {
            for (var i = 0, imax = this.length; i < imax; i++) if (this[i] === x) return i;
            return -1;
        };
        var obj_extend, obj_copy;
        !function() {
            obj_extend = function(target, source) {
                if (null == target) target = {};
                if (null == source) return target;
                for (var key in source) target[key] = source[key];
                return target;
            };
            obj_copy = function(object) {
                var copy = {}, key;
                for (key in object) copy[key] = object[key];
                return copy;
            };
        }();
        var arr_each, arr_remove;
        !function() {
            arr_each = function(array, fn) {
                var imax = array.length, i = -1;
                while (++i < imax) fn(array[i], i);
            };
            arr_remove = function(array, child) {
                if (null == array) {
                    console.error("Can not remove myself from parent", child);
                    return;
                }
                var index = array.indexOf(child);
                if (index === -1) {
                    console.error("Can not remove myself from parent", child, index);
                    return;
                }
                array.splice(index, 1);
            };
        }();
        var fn_proxy, fn_apply;
        !function() {
            fn_proxy = function(fn, ctx) {
                return function() {
                    return fn_apply(fn, ctx, arguments);
                };
            };
            fn_apply = function(fn, ctx, arguments_) {
                switch (arguments_.length) {
                  case 0:
                    return fn.call(ctx);

                  case 1:
                    return fn.call(ctx, arguments_[0]);

                  case 2:
                    return fn.call(ctx, arguments_[0], arguments_[1]);

                  case 3:
                    return fn.call(ctx, arguments_[0], arguments_[1], arguments_[2]);

                  case 4:
                    return fn.call(ctx, arguments_[0], arguments_[1], arguments_[2], arguments_[3]);
                }
                return fn.apply(ctx, arguments_);
            };
        }();
        var selector_parse, selector_match;
        !function() {
            selector_parse = function(selector, type, direction) {
                if (null == selector) console.error("<compo>selector is undefined", type);
                if ("object" === typeof selector) return selector;
                var key, prop, nextKey;
                if (null == key) switch (selector[0]) {
                  case "#":
                    key = "id";
                    selector = selector.substring(1);
                    prop = "attr";
                    break;

                  case ".":
                    key = "class";
                    selector = sel_hasClassDelegate(selector.substring(1));
                    prop = "attr";
                    break;

                  default:
                    key = type === Dom.SET ? "tagName" : "compoName";
                }
                if ("up" === direction) nextKey = "parent"; else nextKey = type === Dom.SET ? "nodes" : "components";
                return {
                    key: key,
                    prop: prop,
                    selector: selector,
                    nextKey: nextKey
                };
            };
            selector_match = function(node, selector, type) {
                if (is_String(selector)) {
                    if (null == type) type = Dom[node.compoName ? "CONTROLLER" : "SET"];
                    selector = selector_parse(selector, type);
                }
                var obj = selector.prop ? node[selector.prop] : node;
                if (null == obj) return false;
                if (is_Function(selector.selector)) return selector.selector(obj[selector.key]);
                if (null != selector.selector.test) return selector.selector.test(obj[selector.key]);
                //! == - to match int and string
                return obj[selector.key] == selector.selector;
            };
            function sel_hasClassDelegate(matchClass) {
                return function(className) {
                    return sel_hasClass(className, matchClass);
                };
            }
            function sel_hasClass(className, matchClass, index) {
                if ("string" !== typeof className) return false;
                if (null == index) index = 0;
                index = className.indexOf(matchClass, index);
                if (index === -1) return false;
                if (index > 0 && className.charCodeAt(index - 1) > 32) return sel_hasClass(className, matchClass, index + 1);
                var class_Length = className.length, match_Length = matchClass.length;
                if (index < class_Length - match_Length && className.charCodeAt(index + match_Length) > 32) return sel_hasClass(className, matchClass, index + 1);
                return true;
            }
        }();
        var find_findSingle;
        !function() {
            find_findSingle = function(node, matcher) {
                if (is_Array(node)) {
                    var imax = node.length, i = -1, result;
                    while (++i < imax) {
                        result = find_findSingle(node[i], matcher);
                        if (null != result) return result;
                    }
                    return null;
                }
                if (selector_match(node, matcher)) return node;
                node = node[matcher.nextKey];
                return null == node ? null : find_findSingle(node, matcher);
            };
        }();
        var dom_addEventListener, node_tryDispose, node_tryDisposeChildren;
        !function() {
            dom_addEventListener = function(element, event, listener) {
                if (null != EventDecorator) event = EventDecorator(event);
                if (null != domLib) return domLib(element).on(event, listener);
                if (null != element.addEventListener) return element.addEventListener(event, listener, false);
                if (element.attachEvent) element.attachEvent("on" + event, listener);
            };
            node_tryDispose = function(node) {
                if (node.hasAttribute("x-compo-id")) {
                    var id = node.getAttribute("x-compo-id"), compo = Anchor.getByID(id);
                    if (compo) {
                        if (null == compo.$ || 1 === compo.$.length) {
                            compo_dispose(compo);
                            compo_detachChild(compo);
                            return;
                        }
                        var i = _Array_indexOf.call(compo.$, node);
                        if (i !== -1) _Array_splice.call(compo.$, i, 1);
                    }
                }
                node_tryDisposeChildren(node);
            };
            node_tryDisposeChildren = function(node) {
                var child = node.firstChild;
                while (null != child) {
                    if (1 === child.nodeType) node_tryDispose(child);
                    child = child.nextSibling;
                }
            };
        }();
        var domLib_find, domLib_on;
        !function() {
            domLib_find = function($set, selector) {
                return $set.filter(selector).add($set.find(selector));
            };
            domLib_on = function($set, type, selector, fn) {
                if (null == selector) return $set.on(type, fn);
                $set.on(type, selector, fn).filter(selector).on(type, fn);
                return $set;
            };
        }();
        var Children_ = {
            select: function(component, compos) {
                for (var name in compos) {
                    var data = compos[name], events = null, selector = null;
                    if (data instanceof Array) {
                        selector = data[0];
                        events = data.splice(1);
                    }
                    if ("string" === typeof data) selector = data;
                    if (null == data || null == selector) {
                        console.error("Unknown component child", name, compos[name]);
                        console.warn("Is this object shared within multiple compo classes? Define it in constructor!");
                        return;
                    }
                    var index = selector.indexOf(":"), engine = selector.substring(0, index);
                    engine = Compo.config.selectors[engine];
                    if (null == engine) component.compos[name] = component.$[0].querySelector(selector); else {
                        selector = selector.substring(++index).trim();
                        component.compos[name] = engine(component, selector);
                    }
                    var element = component.compos[name];
                    if (null != events) {
                        if (null != element.$) element = element.$;
                        Events_.on(component, events, element);
                    }
                }
            }
        };
        var Events_ = {
            on: function(component, events, $element) {
                if (null == $element) $element = component.$;
                var isarray = events instanceof Array, length = isarray ? events.length : 1;
                for (var i = 0, x; isarray ? i < length : i < 1; i++) {
                    x = isarray ? events[i] : events;
                    if (x instanceof Array) {
                        if (null != EventDecorator) x[0] = EventDecorator(x[0]);
                        $element.on.apply($element, x);
                        continue;
                    }
                    for (var key in x) {
                        var fn = "string" === typeof x[key] ? component[x[key]] : x[key], semicolon = key.indexOf(":"), type, selector;
                        if (semicolon !== -1) {
                            type = key.substring(0, semicolon);
                            selector = key.substring(semicolon + 1).trim();
                        } else type = key;
                        if (null != EventDecorator) type = EventDecorator(type);
                        domLib_on($element, type, selector, fn_proxy(fn, component));
                    }
                }
            }
        }, EventDecorator = null;
        var EventDecos = function() {
            var hasTouch = function() {
                if (null == document) return false;
                if ("createTouch" in document) return true;
                try {
                    return !!document.createEvent("TouchEvent").initTouchEvent;
                } catch (error) {
                    return false;
                }
            }();
            return {
                touch: function(type) {
                    if (false === hasTouch) return type;
                    if ("click" === type) return "touchend";
                    if ("mousedown" === type) return "touchstart";
                    if ("mouseup" === type) return "touchend";
                    if ("mousemove" === type) return "touchmove";
                    return type;
                }
            };
        }();
        var Pipes = function() {
            var _collection = {};
            mask.registerAttrHandler("x-pipe-signal", "client", function(node, attrValue, model, cntx, element, controller) {
                var arr = attrValue.split(";"), imax = arr.length, i = -1, x;
                while (++i < imax) {
                    x = arr[i].trim();
                    if ("" === x) continue;
                    var i_colon = x.indexOf(":"), event = x.substring(0, i_colon), handler = x.substring(i_colon + 1).trim(), dot = handler.indexOf("."), pipe, signal;
                    if (dot === -1) {
                        console.error('define pipeName "click: pipeName.pipeSignal"');
                        return;
                    }
                    pipe = handler.substring(0, dot);
                    signal = handler.substring(++dot);
                    var Handler = _handler(pipe, signal);
                    !event && console.error("Signal: event type is not set", attrValue);
                    dom_addEventListener(element, event, Handler);
                }
            });
            function _handler(pipe, signal) {
                return function(event) {
                    new Pipe(pipe).emit(signal, event);
                };
            }
            function pipe_attach(pipeName, controller) {
                if (null == controller.pipes[pipeName]) {
                    console.error("Controller has no pipes to be added to collection", pipeName, controller);
                    return;
                }
                if (null == _collection[pipeName]) _collection[pipeName] = [];
                _collection[pipeName].push(controller);
            }
            function pipe_detach(pipeName, controller) {
                var pipe = _collection[pipeName], i = pipe.length;
                while (--i > -1) if (pipe[i] === controller) pipe.splice(i, 1);
            }
            function controller_remove() {
                var controller = this, pipes = controller.pipes;
                for (var key in pipes) pipe_detach(key, controller);
            }
            function controller_add(controller) {
                var pipes = controller.pipes;
                if (null == pipes) {
                    console.error("Controller has no pipes", controller);
                    return;
                }
                for (var key in pipes) pipe_attach(key, controller);
                Compo.attachDisposer(controller, controller_remove.bind(controller));
            }
            function Pipe(pipeName) {
                if (this instanceof Pipe === false) return new Pipe(pipeName);
                this.pipeName = pipeName;
                return this;
            }
            Pipe.prototype = {
                constructor: Pipe,
                emit: function(signal) {
                    var controllers = _collection[this.pipeName], pipeName = this.pipeName, args;
                    if (null == controllers) {
                        console.warn("Pipe.emit: No signals were bound to:", pipeName);
                        return;
                    }
                    if (2 === arguments.length && is_Array(arguments[1])) args = arguments[1]; else if (arguments.length > 1) args = _array_slice.call(arguments, 1);
                    var i = controllers.length, controller, slots, slot, called;
                    while (--i !== -1) {
                        controller = controllers[i];
                        slots = controller.pipes[pipeName];
                        if (null == slots) continue;
                        slot = slots[signal];
                        if (is_Function(slot)) {
                            slot.apply(controller, args);
                            called = true;
                        }
                    }
                    if (!called) console.warn("Pipe `%s` has not slots for `%s`", pipeName, signal);
                }
            };
            Pipe.addController = controller_add;
            Pipe.removeController = controller_remove;
            return {
                addController: controller_add,
                removeController: controller_remove,
                pipe: Pipe
            };
        }();
        var Anchor = function() {
            var _cache = {};
            return {
                create: function(compo) {
                    if (null == compo.ID) {
                        console.warn("Component should have an ID");
                        return;
                    }
                    _cache[compo.ID] = compo;
                },
                resolveCompo: function(element) {
                    if (null == element) return null;
                    var findID, currentID, compo;
                    do {
                        currentID = element.getAttribute("x-compo-id");
                        if (currentID) {
                            if (null == findID) findID = currentID;
                            compo = _cache[currentID];
                            if (null != compo) {
                                compo = Compo.find(compo, {
                                    key: "ID",
                                    selector: findID,
                                    nextKey: "components"
                                });
                                if (null != compo) return compo;
                            }
                        }
                        element = element.parentNode;
                    } while (element && 1 === element.nodeType);
                    findID && console.warn("No controller for ID", findID);
                    return null;
                },
                removeCompo: function(compo) {
                    if (null == compo.ID) return;
                    delete _cache[compo.ID];
                },
                getByID: function(id) {
                    return _cache[id];
                }
            };
        }();
        var Compo = function() {
            var hasInclude = !!(global.include || "undefined" !== typeof global.atma && global.atma.include || "undefined" !== typeof exports && exports.include);
            function Compo(controller) {
                if (this instanceof Compo) return null;
                var klass;
                if (null == controller) controller = {};
                if (hasInclude && global.include) controller.__resource = global.include.url;
                if (null != controller.attr) for (var key in controller.attr) controller.attr[key] = _mask_ensureTmplFn(controller.attr[key]);
                var slots = controller.slots;
                if (null != slots) for (var key in slots) if ("string" === typeof slots[key]) {
                    "function" !== typeof controller[slots[key]] && console.error("Not a Function @Slot.", slots[key]);
                    slots[key] = controller[slots[key]];
                }
                if (controller.hasOwnProperty("constructor")) klass = controller.constructor;
                klass = compo_createConstructor(klass, controller);
                if (null == klass) klass = function CompoBase() {};
                for (var key in Proto) if (null == controller[key]) controller[key] = Proto[key];
                klass.prototype = controller;
                controller = null;
                return klass;
            }
            var compo_dispose, compo_detachChild, compo_ensureTemplate, compo_attachDisposer, compo_createConstructor, compo_removeElements;
            !function() {
                compo_dispose = function(compo) {
                    if (null != compo.dispose) compo.dispose();
                    Anchor.removeCompo(compo);
                    var compos = compo.components, i = compos && compos.length || 0;
                    while (--i > -1) compo_dispose(compos[i]);
                };
                compo_detachChild = function(childCompo) {
                    var parent = childCompo.parent;
                    if (null == parent) return;
                    var arr = childCompo.$, elements = parent.$ || parent.elements, i;
                    if (elements && arr) {
                        var jmax = arr.length, el, j;
                        i = elements.length;
                        while (--i > -1) {
                            el = elements[i];
                            j = jmax;
                            while (--j > -1) if (el === arr[j]) {
                                elements.splice(i, 1);
                                break;
                            }
                        }
                    }
                    var compos = parent.components;
                    if (null != compos) {
                        i = compos.length;
                        while (--i > -1) if (compos[i] === childCompo) {
                            compos.splice(i, 1);
                            break;
                        }
                        if (i === -1) console.warn("<compo:remove> - i`m not in parents collection", childCompo);
                    }
                };
                compo_ensureTemplate = function(compo) {
                    if (null != compo.nodes) return;
                    if (null != compo.attr.template) {
                        compo.template = compo.attr.template;
                        delete compo.attr.template;
                    }
                    var template = compo.template;
                    if (null == template) return;
                    if (is_String(template)) {
                        if (35 === template.charCodeAt(0) && /^#[\w\d_-]+$/.test(template)) {
                            var node = document.getElementById(template.substring(1));
                            if (null == node) {
                                console.error("<compo> Template holder not found by id:", template);
                                return;
                            }
                            template = node.innerHTML;
                        }
                        template = mask.parse(template);
                    }
                    if ("object" === typeof template) compo.nodes = template;
                };
                compo_attachDisposer = function(compo, disposer) {
                    if (null == compo.dispose) {
                        compo.dispose = disposer;
                        return;
                    }
                    var prev = compo.dispose;
                    compo.dispose = function() {
                        disposer.call(this);
                        prev.call(this);
                    };
                };
                compo_createConstructor = function(Ctor, proto) {
                    var compos = proto.compos, pipes = proto.pipes, attr = proto.attr;
                    if (null == compos && null == pipes && null == proto.attr) return Ctor;
                    return function CompoBase() {
                        if (null != compos) this.compos = obj_copy(this.compos);
                        if (null != pipes) Pipes.addController(this);
                        if (null != attr) this.attr = obj_copy(this.attr);
                        if (is_Function(Ctor)) Ctor.call(this);
                    };
                };
                compo_removeElements = function(compo) {
                    if (compo.$) {
                        compo.$.remove();
                        return;
                    }
                    var els = compo.elements;
                    if (els) {
                        var i = -1, imax = els.length;
                        while (++i < imax) if (els[i].parentNode) els[i].parentNode.removeChild(els[i]);
                        return;
                    }
                    var compos = compo.components;
                    if (compos) {
                        var i = -1, imax = compos.length;
                        while (++i < imax) compo_removeElements(compos[i]);
                    }
                };
            }();
            obj_extend(Compo, {
                create: function(proto) {
                    var klass;
                    if (null == proto) proto = {};
                    if (proto.hasOwnProperty("constructor")) klass = proto.constructor;
                    if (null == klass) klass = function CompoBase() {};
                    for (var key in Proto) if (null == proto[key]) proto[key] = Proto[key];
                    klass.prototype = proto;
                    return klass;
                },
                createClass: function(classProto) {
                    if (null != classProto.attr) for (var key in classProto.attr) classProto.attr[key] = _mask_ensureTmplFn(classProto.attr[key]);
                    if (hasInclude && global.include) classProto.__resource = global.include.url;
                    var slots = classProto.slots;
                    if (null != slots) for (var key in slots) if ("string" === typeof slots[key]) {
                        "function" !== typeof classProto[slots[key]] && console.error("Not a Function @Slot.", slots[key]);
                        slots[key] = classProto[slots[key]];
                    }
                    var ctor;
                    if (classProto.hasOwnProperty("constructor")) ctor = classProto.constructor;
                    if (null == ctor) ctor = classProto.Construct;
                    classProto.Construct = compo_createConstructor(ctor, classProto);
                    var Ext = classProto.Extends;
                    if (null == Ext) classProto.Extends = Proto; else if (is_Array(Ext)) Ext.unshift(Proto); else classProto.Extends = [ Proto, Ext ];
                    return Class(classProto);
                },
                render: function(compo, model, ctx, container) {
                    compo_ensureTemplate(compo);
                    var elements = [];
                    mask.render(null == compo.tagName ? compo.nodes : compo, model, ctx, container, compo, elements);
                    compo.$ = domLib(elements);
                    if (null != compo.events) Events_.on(compo, compo.events);
                    if (null != compo.compos) Children_.select(compo, compo.compos);
                    return compo;
                },
                initialize: function(compo, model, ctx, container, parent) {
                    var compoName;
                    if (null == container) if (ctx && null != ctx.nodeType) {
                        container = ctx;
                        ctx = null;
                    } else if (model && null != model.nodeType) {
                        container = model;
                        model = null;
                    }
                    if ("string" === typeof compo) {
                        compoName = compo;
                        compo = mask.getHandler(compoName);
                        if (!compo) console.error("Compo not found:", compo);
                    }
                    var node = {
                        controller: compo,
                        type: Dom.COMPONENT,
                        tagName: compoName
                    };
                    if (null == parent && null != container) parent = Anchor.resolveCompo(container);
                    if (null == parent) parent = new Dom.Component();
                    var dom = mask.render(node, model, ctx, null, parent), instance = parent.components[parent.components.length - 1];
                    if (null != container) {
                        container.appendChild(dom);
                        Compo.signal.emitIn(instance, "domInsert");
                    }
                    return instance;
                },
                find: function(compo, selector) {
                    return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, "down"));
                },
                closest: function(compo, selector) {
                    return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, "up"));
                },
                dispose: compo_dispose,
                ensureTemplate: compo_ensureTemplate,
                attachDisposer: compo_attachDisposer,
                config: {
                    selectors: {
                        $: function(compo, selector) {
                            var r = domLib_find(compo.$, selector);
                            if (0 === r.length) console.error("<compo-selector> - element not found -", selector, compo);
                            return r;
                        },
                        compo: function(compo, selector) {
                            var r = Compo.find(compo, selector);
                            if (null == r) console.error("<compo-selector> - component not found -", selector, compo);
                            return r;
                        }
                    },
                    setDOMLibrary: function(lib) {
                        if (domLib === lib) return;
                        domLib = lib;
                        domLib_initialize();
                    },
                    eventDecorator: function(mix) {
                        if ("function" === typeof mix) {
                            EventDecorator = mix;
                            return;
                        }
                        if ("string" === typeof mix) {
                            EventDecorator = EventDecos[mix];
                            return;
                        }
                        if ("boolean" === typeof mix && false === mix) {
                            EventDecorator = null;
                            return;
                        }
                    }
                },
                pipe: Pipes.pipe,
                resource: function(compo) {
                    var owner = compo;
                    while (null != owner) {
                        if (owner.resource) return owner.resource;
                        owner = owner.parent;
                    }
                    return include.instance();
                },
                plugin: function(source) {
                    eval(source);
                },
                Dom: {
                    addEventListener: dom_addEventListener
                }
            });
            !function() {
                function _on(ctx, type, callback) {
                    if (null == ctx[type]) ctx[type] = [];
                    ctx[type].push(callback);
                    return ctx;
                }
                function _call(ctx, type, _arguments) {
                    var cbs = ctx[type];
                    if (null == cbs) return;
                    for (var i = 0, x, imax = cbs.length; i < imax; i++) {
                        x = cbs[i];
                        if (null == x) continue;
                        cbs[i] = null;
                        if (null == _arguments) {
                            x();
                            continue;
                        }
                        x.apply(this, _arguments);
                    }
                }
                var DeferProto = {
                    done: function(callback) {
                        return _on(this, "_cbs_done", callback);
                    },
                    fail: function(callback) {
                        return _on(this, "_cbs_fail", callback);
                    },
                    always: function(callback) {
                        return _on(this, "_cbs_always", callback);
                    },
                    resolve: function() {
                        this.async = false;
                        _call(this, "_cbs_done", arguments);
                        _call(this, "_cbs_always", arguments);
                    },
                    reject: function() {
                        this.async = false;
                        _call(this, "_cbs_fail", arguments);
                        _call(this, "_cbs_always");
                    }
                };
                var CompoProto = {
                    async: true,
                    await: function(resume) {
                        this.resume = resume;
                    }
                };
                Compo.pause = function(compo, ctx) {
                    if (null == ctx.async) {
                        ctx.defers = [];
                        ctx._cbs_done = null;
                        ctx._cbs_fail = null;
                        ctx._cbs_always = null;
                        for (var key in DeferProto) ctx[key] = DeferProto[key];
                    }
                    ctx.async = true;
                    for (var key in CompoProto) compo[key] = CompoProto[key];
                    ctx.defers.push(compo);
                    return function() {
                        Compo.resume(compo, ctx);
                    };
                };
                Compo.resume = function(compo, ctx) {
                    if (compo.resume) compo.resume();
                    compo.async = false;
                    var busy = false;
                    for (var i = 0, x, imax = ctx.defers.length; i < imax; i++) {
                        x = ctx.defers[i];
                        if (x === compo) {
                            ctx.defers[i] = null;
                            continue;
                        }
                        if (false === busy) busy = null != x;
                    }
                    if (false === busy) ctx.resolve();
                };
            }();
            var Proto = {
                type: Dom.CONTROLLER,
                tagName: null,
                compoName: null,
                nodes: null,
                attr: null,
                model: null,
                slots: null,
                pipes: null,
                compos: null,
                events: null,
                async: false,
                onRenderStart: null,
                onRenderEnd: null,
                render: null,
                renderStart: function(model, ctx, container) {
                    if (1 === arguments.length && null != model && model instanceof Array === false && null != model[0]) {
                        var args = arguments[0];
                        model = args[0];
                        ctx = args[1];
                        container = args[2];
                    }
                    if (null == this.nodes) compo_ensureTemplate(this);
                    if (is_Function(this.onRenderStart)) this.onRenderStart(model, ctx, container);
                },
                renderEnd: function(elements, model, ctx, container) {
                    if (1 === arguments.length && elements instanceof Array === false) {
                        var args = arguments[0];
                        elements = args[0];
                        model = args[1];
                        ctx = args[2];
                        container = args[3];
                    }
                    Anchor.create(this, elements);
                    this.$ = domLib(elements);
                    if (null != this.events) Events_.on(this, this.events);
                    if (null != this.compos) Children_.select(this, this.compos);
                    if (is_Function(this.onRenderEnd)) this.onRenderEnd(elements, model, ctx, container);
                },
                appendTo: function(mix) {
                    var element = "string" === typeof mix ? document.querySelector(mix) : mix;
                    if (null == element) {
                        console.warn("Compo.appendTo: parent is undefined. Args:", arguments);
                        return this;
                    }
                    var els = this.$, i = 0, imax = els.length;
                    for (;i < imax; i++) element.appendChild(els[i]);
                    this.emitIn("domInsert");
                    return this;
                },
                append: function(template, model, selector) {
                    var parent;
                    if (null == this.$) {
                        var dom = "string" === typeof template ? mask.compile(template) : template;
                        parent = selector ? find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, "down")) : this;
                        if (null == parent.nodes) {
                            this.nodes = dom;
                            return this;
                        }
                        parent.nodes = [ this.nodes, dom ];
                        return this;
                    }
                    var fragment = mask.render(template, model, null, null, this);
                    parent = selector ? this.$.find(selector) : this.$;
                    parent.append(fragment);
                    this.emitIn("domInsert");
                    return this;
                },
                find: function(selector) {
                    return find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, "down"));
                },
                closest: function(selector) {
                    return find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, "up"));
                },
                on: function() {
                    var x = _array_slice.call(arguments);
                    if (arguments.length < 3) {
                        console.error("Invalid Arguments Exception @use .on(type,selector,fn)");
                        return this;
                    }
                    if (null != this.$) Events_.on(this, [ x ]);
                    if (null == this.events) this.events = [ x ]; else if (is_Array(this.events)) this.events.push(x); else this.events = [ x, this.events ];
                    return this;
                },
                remove: function() {
                    compo_removeElements(this);
                    compo_detachChild(this);
                    compo_dispose(this);
                    this.$ = null;
                    return this;
                },
                slotState: function(slotName, isActive) {
                    Compo.slot.toggle(this, slotName, isActive);
                    return this;
                },
                signalState: function(signalName, isActive) {
                    Compo.signal.toggle(this, signalName, isActive);
                    return this;
                },
                emitOut: function(signalName) {
                    Compo.signal.emitOut(this, signalName, this, arguments.length > 1 ? _array_slice.call(arguments, 1) : null);
                    return this;
                },
                emitIn: function(signalName) {
                    Compo.signal.emitIn(this, signalName, this, arguments.length > 1 ? _array_slice.call(arguments, 1) : null);
                    return this;
                }
            };
            Compo.prototype = Proto;
            return Compo;
        }();
        !function() {
            mask.registerAttrHandler("x-signal", "client", function(node, attrValue, model, ctx, element, controller) {
                var arr = attrValue.split(";"), signals = "", imax = arr.length, i = -1, x;
                while (++i < imax) {
                    x = arr[i].trim();
                    if ("" === x) continue;
                    var i_colon = x.indexOf(":"), event = x.substring(0, i_colon), handler = x.substring(i_colon + 1).trim(), Handler = _createListener(controller, handler);
                    !event && console.error("Signal: event type is not set", attrValue);
                    if (Handler) {
                        signals += "," + handler + ",";
                        dom_addEventListener(element, event, Handler);
                    }
                    !Handler && console.warn("No slot found for signal", handler, controller);
                }
                if ("" !== signals) element.setAttribute("data-signals", signals);
            });
            function _fire(controller, slot, sender, args, direction) {
                if (null == controller) return false;
                var found = false, fn = null != controller.slots && controller.slots[slot];
                if ("string" === typeof fn) fn = controller[fn];
                if ("function" === typeof fn) {
                    found = true;
                    var isDisabled = null != controller.slots.__disabled && controller.slots.__disabled[slot];
                    if (true !== isDisabled) {
                        var result = null == args ? fn.call(controller, sender) : fn.apply(controller, [ sender ].concat(args));
                        if (false === result) return true;
                        if (null != result && "object" === typeof result && null != result.length) args = result;
                    }
                }
                if (direction === -1 && null != controller.parent) return _fire(controller.parent, slot, sender, args, direction) || found;
                if (1 === direction && null != controller.components) {
                    var compos = controller.components, imax = compos.length, i = 0, r;
                    for (;i < imax; i++) {
                        r = _fire(compos[i], slot, sender, args, direction);
                        !found && (found = r);
                    }
                }
                return found;
            }
            function _hasSlot(controller, slot, direction, isActive) {
                if (null == controller) return false;
                var slots = controller.slots;
                if (null != slots && null != slots[slot]) {
                    if ("string" === typeof slots[slot]) slots[slot] = controller[slots[slot]];
                    if ("function" === typeof slots[slot]) if (true === isActive) {
                        if (null == slots.__disabled || true !== slots.__disabled[slot]) return true;
                    } else return true;
                }
                if (direction === -1 && null != controller.parent) return _hasSlot(controller.parent, slot, direction);
                if (1 === direction && null != controller.components) for (var i = 0, length = controller.components.length; i < length; i++) if (_hasSlot(controller.components[i], slot, direction)) return true;
                return false;
            }
            function _createListener(controller, slot) {
                if (false === _hasSlot(controller, slot, -1)) return null;
                return function(event) {
                    var args = arguments.length > 1 ? _array_slice.call(arguments, 1) : null;
                    _fire(controller, slot, event, args, -1);
                };
            }
            function __toggle_slotState(controller, slot, isActive) {
                var slots = controller.slots;
                if (null == slots || false === slots.hasOwnProperty(slot)) return;
                if (null == slots.__disabled) slots.__disabled = {};
                slots.__disabled[slot] = false === isActive;
            }
            function __toggle_slotStateWithChilds(controller, slot, isActive) {
                __toggle_slotState(controller, slot, isActive);
                if (null != controller.components) for (var i = 0, length = controller.components.length; i < length; i++) __toggle_slotStateWithChilds(controller.components[i], slot, isActive);
            }
            function __toggle_elementsState(controller, slot, isActive) {
                if (null == controller.$) {
                    console.warn("Controller has no elements to toggle state");
                    return;
                }
                domLib().add(controller.$.filter("[data-signals]")).add(controller.$.find("[data-signals]")).each(function(index, node) {
                    var signals = node.getAttribute("data-signals");
                    if (null != signals && signals.indexOf(slot) !== -1) node[true === isActive ? "removeAttribute" : "setAttribute"]("disabled", "disabled");
                });
            }
            function _toggle_all(controller, slot, isActive) {
                var parent = controller, previous = controller;
                while (null != (parent = parent.parent)) {
                    __toggle_slotState(parent, slot, isActive);
                    if (null == parent.$ || 0 === parent.$.length) continue;
                    previous = parent;
                }
                __toggle_slotStateWithChilds(controller, slot, isActive);
                __toggle_elementsState(previous, slot, isActive);
            }
            function _toggle_single(controller, slot, isActive) {
                __toggle_slotState(controller, slot, isActive);
                if (!isActive && (_hasSlot(controller, slot, -1, true) || _hasSlot(controller, slot, 1, true))) return;
                __toggle_elementsState(controller, slot, isActive);
            }
            obj_extend(Compo, {
                signal: {
                    toggle: _toggle_all,
                    emitOut: function(controller, slot, sender, args) {
                        var captured = _fire(controller, slot, sender, args, -1);
                        !captured && console.warn("Signal %c%s", "font-weight:bold;", slot, "was not captured");
                    },
                    emitIn: function(controller, slot, sender, args) {
                        _fire(controller, slot, sender, args, 1);
                    },
                    enable: function(controller, slot) {
                        _toggle_all(controller, slot, true);
                    },
                    disable: function(controller, slot) {
                        _toggle_all(controller, slot, false);
                    }
                },
                slot: {
                    toggle: _toggle_single,
                    enable: function(controller, slot) {
                        _toggle_single(controller, slot, true);
                    },
                    disable: function(controller, slot) {
                        _toggle_single(controller, slot, false);
                    },
                    invoke: function(controller, slot, event, args) {
                        var slots = controller.slots;
                        if (null == slots || "function" !== typeof slots[slot]) {
                            console.error("Slot not found", slot, controller);
                            return null;
                        }
                        if (null == args) return slots[slot].call(controller, event);
                        return slots[slot].apply(controller, [ event ].concat(args));
                    }
                }
            });
        }();
        domLib_initialize();
        function domLib_initialize() {
            if (null == domLib || null == domLib.fn) return;
            domLib.fn.compo = function(selector) {
                if (0 === this.length) return null;
                var compo = Anchor.resolveCompo(this[0]);
                return null == selector ? compo : find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, "up"));
            };
            domLib.fn.model = function(selector) {
                var compo = this.compo(selector);
                if (null == compo) return null;
                var model = compo.model;
                while (null == model && compo.parent) {
                    compo = compo.parent;
                    model = compo.model;
                }
                return model;
            };
            !function() {
                var jQ_Methods = [ "append", "prepend", "before", "after" ];
                arr_each([ "appendMask", "prependMask", "beforeMask", "afterMask" ], function(method, index) {
                    domLib.fn[method] = function(template, model, controller, ctx) {
                        if (0 === this.length) {
                            console.warn("<jcompo> $.", method, "- no element was selected(found)");
                            return this;
                        }
                        if (this.length > 1) console.warn("<jcompo> $.", method, " can insert only to one element. Fix is comming ...");
                        if (null == controller) controller = index < 2 ? this.compo() : this.parent().compo();
                        if (null == controller) {
                            controller = {};
                            console.warn("$.***Mask - controller not found, this can lead to memory leaks if template contains compos");
                        }
                        if (null == controller.components) controller.components = [];
                        var components = controller.components, i = components.length, fragment = mask.render(template, model, ctx, null, controller);
                        var self = this[jQ_Methods[index]](fragment), imax = components.length;
                        for (;i < imax; i++) Compo.signal.emitIn(components[i], "domInsert");
                        return self;
                    };
                });
            }();
            !function() {
                var jq_remove = domLib.fn.remove, jq_empty = domLib.fn.empty;
                domLib.fn.removeAndDispose = function() {
                    this.each(each_tryDispose);
                    return jq_remove.call(this);
                };
                domLib.fn.emptyAndDispose = function() {
                    this.each(each_tryDisposeChildren);
                    return jq_empty.call(this);
                };
                function each_tryDispose(index, node) {
                    node_tryDispose(node);
                }
                function each_tryDisposeChildren(index, node) {
                    node_tryDisposeChildren(node);
                }
            }();
        }
        function SlotHandler() {}
        mask.registerHandler(":slot", SlotHandler);
        SlotHandler.prototype = {
            constructor: SlotHandler,
            renderEnd: function(element, model, cntx, container) {
                this.slots = {};
                this.expression = this.attr.on;
                this.slots[this.attr.signal] = this.handle;
            },
            handle: function() {
                var expr = this.expression;
                mask.Utils.Expression.eval(expr, this.model, global, this);
            }
        };
        return Compo;
    }(Mask);
    var jmask = exports.jmask = function(mask) {
        var Dom = mask.Dom, _mask_render = mask.render, _mask_parse = mask.parse, _mask_ensureTmplFnOrig = mask.Utils.ensureTmplFn, _signal_emitIn = (global.Compo || mask.Compo || Compo).signal.emitIn;
        function _mask_ensureTmplFn(value) {
            if ("string" !== typeof value) return value;
            return _mask_ensureTmplFnOrig(value);
        }
        function util_extend(target, source) {
            if (null == target) target = {};
            if (null == source) return target;
            for (var key in source) target[key] = source[key];
            return target;
        }
        function arr_each(any, fn) {
            var isarray = any instanceof Array, i = -1, imax = isarray ? any.length : 1;
            var x;
            while (++i < imax) {
                x = isarray ? any[i] : any;
                fn(x, i);
            }
        }
        function arr_remove(array, child) {
            if (null == array) {
                console.error("Can not remove myself from parent", child);
                return;
            }
            var index = array.indexOf(child);
            if (index === -1) {
                console.error("Can not remove myself from parent", child, index);
                return;
            }
            array.splice(index, 1);
        }
        function arr_isArray(x) {
            return null != x && "object" === typeof x && null != x.length && "function" === typeof x.slice;
        }
        var arr_unique = function() {
            var hasDuplicates = false;
            function sort(a, b) {
                if (a === b) {
                    hasDuplicates = true;
                    return 0;
                }
                return 1;
            }
            return function(array) {
                var duplicates, i, j, imax;
                hasDuplicates = false;
                array.sort(sort);
                if (false === hasDuplicates) return array;
                duplicates = [];
                i = 0;
                j = 0;
                imax = array.length - 1;
                while (i < imax) if (array[i++] === array[i]) duplicates[j++] = i;
                while (j--) array.splice(duplicates[j], 1);
                return array;
            };
        }();
        var sel_key_UP = "parent", sel_key_MASK = "nodes", sel_key_COMPOS = "components", sel_key_ATTR = "attr";
        function selector_parse(selector, type, direction) {
            if (null == selector) console.warn("selector is null for type", type);
            if ("object" === typeof selector) return selector;
            var key, prop, nextKey, filters, _key, _prop, _selector;
            var index = 0, length = selector.length, c, end, matcher, eq, slicer;
            if ("up" === direction) nextKey = sel_key_UP; else nextKey = type === Dom.SET ? sel_key_MASK : sel_key_COMPOS;
            while (index < length) {
                c = selector.charCodeAt(index);
                if (c < 33) continue;
                end = selector_moveToBreak(selector, index + 1, length);
                if (46 === c) {
                    _key = "class";
                    _prop = sel_key_ATTR;
                    _selector = sel_hasClassDelegate(selector.substring(index + 1, end));
                } else if (35 === c) {
                    _key = "id";
                    _prop = sel_key_ATTR;
                    _selector = selector.substring(index + 1, end);
                } else if (91 === c) {
                    eq = selector.indexOf("=", index);
                    eq === -1 && console.error('Attribute Selector: should contain "="');
                    _prop = sel_key_ATTR;
                    _key = selector.substring(index + 1, eq);
                    c = selector.charCodeAt(eq + 1);
                    slicer = 34 === c || 39 === c ? 2 : 1;
                    _selector = selector.substring(eq + slicer, end - slicer + 1);
                    end++;
                } else {
                    _prop = null;
                    _key = type === Dom.SET ? "tagName" : "compoName";
                    _selector = selector.substring(index, end);
                }
                index = end;
                if (null == matcher) {
                    matcher = {
                        key: _key,
                        prop: _prop,
                        selector: _selector,
                        nextKey: nextKey,
                        filters: null
                    };
                    continue;
                }
                if (null == matcher.filters) matcher.filters = [];
                matcher.filters.push({
                    key: _key,
                    selector: _selector,
                    prop: _prop
                });
            }
            return matcher;
        }
        function sel_hasClassDelegate(matchClass) {
            return function(className) {
                return sel_hasClass(className, matchClass);
            };
        }
        function sel_hasClass(className, matchClass, index) {
            if ("string" !== typeof className) return false;
            if (null == index) index = 0;
            index = className.indexOf(matchClass, index);
            if (index === -1) return false;
            if (index > 0 && className.charCodeAt(index - 1) > 32) return sel_hasClass(className, matchClass, index + 1);
            var class_Length = className.length, match_Length = matchClass.length;
            if (index < class_Length - match_Length && className.charCodeAt(index + match_Length) > 32) return sel_hasClass(className, matchClass, index + 1);
            return true;
        }
        function selector_moveToBreak(selector, index, length) {
            var c, isInQuote = false, isEscaped = false;
            while (index < length) {
                c = selector.charCodeAt(index);
                if (34 === c || 39 === c) isInQuote = !isInQuote;
                if (92 === c) isEscaped = !isEscaped;
                if (46 === c || 35 === c || 91 === c || 93 === c || c < 33) if (true !== isInQuote && true !== isEscaped) break;
                index++;
            }
            return index;
        }
        function selector_match(node, selector, type) {
            if ("string" === typeof selector) {
                if (null == type) type = Dom[node.compoName ? "CONTROLLER" : "SET"];
                selector = selector_parse(selector, type);
            }
            var obj = selector.prop ? node[selector.prop] : node, matched = false;
            if (null == obj) return false;
            if ("function" === typeof selector.selector) matched = selector.selector(obj[selector.key]); else if (null != selector.selector.test) {
                if (selector.selector.test(obj[selector.key])) matched = true;
            } else if (obj[selector.key] === selector.selector) matched = true;
            if (true === matched && null != selector.filters) for (var i = 0, x, imax = selector.filters.length; i < imax; i++) {
                x = selector.filters[i];
                if (false === selector_match(node, x, type)) return false;
            }
            return matched;
        }
        var jmask_filter, jmask_find, jmask_clone, jmask_deepest, jmask_getText;
        !function() {
            jmask_filter = function(mix, matcher) {
                if (null == matcher) return mix;
                var result = [];
                arr_each(mix, function(node) {
                    if (selector_match(node, matcher)) result.push(node);
                });
                return result;
            };
            jmask_find = function(mix, matcher, output) {
                if (null == mix) return output;
                if (null == output) output = [];
                if (mix instanceof Array) {
                    for (var i = 0, length = mix.length; i < length; i++) jmask_find(mix[i], matcher, output);
                    return output;
                }
                if (selector_match(mix, matcher)) output.push(mix);
                var next = mix[matcher.nextKey];
                if (null != next) jmask_find(next, matcher, output);
                return output;
            };
            jmask_clone = function(node, parent) {
                var copy = {
                    type: 1,
                    tagName: 1,
                    compoName: 1,
                    controller: 1
                };
                var clone = {
                    parent: parent
                };
                for (var key in node) if (1 === copy[key]) clone[key] = node[key];
                if (node.attr) clone.attr = util_extend({}, node.attr);
                var nodes = node.nodes;
                if (null != nodes && nodes.length > 0) {
                    clone.nodes = [];
                    var isarray = nodes instanceof Array, length = true === isarray ? nodes.length : 1, i = 0;
                    for (;i < length; i++) clone.nodes[i] = jmask_clone(true === isarray ? nodes[i] : nodes, clone);
                }
                return clone;
            };
            jmask_deepest = function(node) {
                var current = node, prev;
                while (null != current) {
                    prev = current;
                    current = current.nodes && current.nodes[0];
                }
                return prev;
            };
            jmask_getText = function(node, model, cntx, controller) {
                if (Dom.TEXTNODE === node.type) {
                    if ("function" === typeof node.content) return node.content("node", model, cntx, null, controller);
                    return node.content;
                }
                var output = "";
                if (null != node.nodes) for (var i = 0, x, imax = node.nodes.length; i < imax; i++) {
                    x = node.nodes[i];
                    output += jmask_getText(x, model, cntx, controller);
                }
                return output;
            };
        }();
        function jMask(mix) {
            if (this instanceof jMask === false) return new jMask(mix);
            if (null == mix) return this;
            if (mix.type === Dom.SET) return mix;
            return this.add(mix);
        }
        jMask.prototype = {
            constructor: jMask,
            type: Dom.SET,
            length: 0,
            components: null,
            add: function(mix) {
                var i, length;
                if ("string" === typeof mix) mix = _mask_parse(mix);
                if (arr_isArray(mix)) {
                    for (i = 0, length = mix.length; i < length; i++) this.add(mix[i]);
                    return this;
                }
                if ("function" === typeof mix && null != mix.prototype.type) mix = {
                    controller: mix,
                    type: Dom.COMPONENT
                };
                var type = mix.type;
                if (!type) {
                    console.error("Only Mask Node/Component/NodeText/Fragment can be added to jmask set", mix);
                    return this;
                }
                if (type === Dom.FRAGMENT) {
                    var nodes = mix.nodes;
                    for (i = 0, length = nodes.length; i < length; ) this[this.length++] = nodes[i++];
                    return this;
                }
                if (type === Dom.CONTROLLER) {
                    if (null != mix.nodes && mix.nodes.length) for (i = mix.nodes.length; 0 !== i; ) mix.nodes[--i].parent = mix;
                    if (null != mix.$) this.type = Dom.CONTROLLER;
                }
                this[this.length++] = mix;
                return this;
            },
            toArray: function() {
                return Array.prototype.slice.call(this);
            },
            render: function(model, cntx, container, controller) {
                this.components = [];
                if (1 === this.length) return _mask_render(this[0], model, cntx, container, controller || this);
                if (null == container) container = document.createDocumentFragment();
                for (var i = 0, length = this.length; i < length; i++) _mask_render(this[i], model, cntx, container, controller || this);
                return container;
            },
            prevObject: null,
            end: function() {
                return this.prevObject || this;
            },
            pushStack: function(nodes) {
                var next;
                next = jMask(nodes);
                next.prevObject = this;
                return next;
            },
            controllers: function() {
                if (null == this.components) console.warn("Set was not rendered");
                return this.pushStack(this.components || []);
            },
            mask: function(template) {
                var node;
                if (null != template) return this.empty().append(template);
                if (arguments.length) return this;
                if (0 === this.length) node = new Dom.Node(); else if (1 === this.length) node = this[0]; else {
                    node = new Dom.Fragment();
                    node.nodes = [];
                    var i = -1;
                    while (++i < this.length) node.nodes[i] = this[i];
                }
                return mask.stringify(node);
            },
            text: function(mix, cntx, controller) {
                if ("string" === typeof mix && 1 === arguments.length) {
                    var node = [ new Dom.TextNode(mix) ];
                    for (var i = 0, x, imax = this.length; i < imax; i++) {
                        x = this[i];
                        x.nodes = node;
                    }
                    return this;
                }
                var string = "";
                for (var i = 0, x, imax = this.length; i < imax; i++) {
                    x = this[i];
                    string += jmask_getText(x, mix, cntx, controller);
                }
                return string;
            }
        };
        arr_each([ "append", "prepend" ], function(method) {
            jMask.prototype[method] = function(mix) {
                var $mix = jMask(mix), i = 0, length = this.length, arr, node;
                for (;i < length; i++) {
                    node = this[i];
                    arr = $mix.toArray();
                    for (var j = 0, jmax = arr.length; j < jmax; j++) arr[j].parent = node;
                    if (null == node.nodes) {
                        node.nodes = arr;
                        continue;
                    }
                    node.nodes = "append" === method ? node.nodes.concat(arr) : arr.concat(node.nodes);
                }
                return this;
            };
        });
        arr_each([ "appendTo" ], function(method) {
            jMask.prototype[method] = function(mix, model, cntx, controller) {
                if (null == controller) controller = this;
                if (null != mix.nodeType && "function" === typeof mix.appendChild) {
                    mix.appendChild(this.render(model, cntx, null, controller));
                    _signal_emitIn(controller, "domInsert");
                    return this;
                }
                jMask(mix).append(this);
                return this;
            };
        });
        !function() {
            arr_each([ "add", "remove", "toggle", "has" ], function(method) {
                jMask.prototype[method + "Class"] = function(klass) {
                    var length = this.length, i = 0, classNames, j, jmax, node, current;
                    if ("string" !== typeof klass) {
                        if ("remove" === method) for (;i < length; i++) this[0].attr["class"] = null;
                        return this;
                    }
                    for (;i < length; i++) {
                        node = this[i];
                        if (null == node.attr) continue;
                        current = node.attr["class"];
                        if (null == current) current = klass; else {
                            current = " " + current + " ";
                            if (null == classNames) {
                                classNames = klass.split(" ");
                                jmax = classNames.length;
                            }
                            for (j = 0; j < jmax; j++) {
                                if (!classNames[j]) continue;
                                var hasClass = current.indexOf(" " + classNames[j] + " ") > -1;
                                if ("has" === method) if (hasClass) return true; else continue;
                                if (false === hasClass && ("add" === method || "toggle" === method)) current += classNames[j] + " "; else if (true === hasClass && ("remove" === method || "toggle" === method)) current = current.replace(" " + classNames[j] + " ", " ");
                            }
                            current = current.trim();
                        }
                        if ("has" !== method) node.attr["class"] = current;
                    }
                    if ("has" === method) return false;
                    return this;
                };
            });
            arr_each([ "attr", "removeAttr", "prop", "removeProp" ], function(method) {
                jMask.prototype[method] = function(key, value) {
                    if (!key) return this;
                    var length = this.length, i = 0, args = arguments.length, node;
                    for (;i < length; i++) {
                        node = this[i];
                        switch (method) {
                          case "attr":
                          case "prop":
                            if (1 === args) {
                                if ("string" === typeof key) return node.attr[key];
                                for (var x in key) node.attr[x] = _mask_ensureTmplFn(key[x]);
                            } else if (2 === args) node.attr[key] = _mask_ensureTmplFn(value);
                            break;

                          case "removeAttr":
                          case "removeProp":
                            node.attr[key] = null;
                        }
                    }
                    return this;
                };
            });
            util_extend(jMask.prototype, {
                tag: function(arg) {
                    if ("string" === typeof arg) {
                        for (var i = 0, length = this.length; i < length; i++) this[i].tagName = arg;
                        return this;
                    }
                    return this[0] && this[0].tagName;
                },
                css: function(mix, value) {
                    var args = arguments.length, length = this.length, i = 0, css, key, style;
                    if (1 === args && "string" === typeof mix) {
                        if (0 === length) return null;
                        if ("string" === typeof this[0].attr.style) return css_toObject(this[0].attr.style)[mix]; else return null;
                    }
                    for (;i < length; i++) {
                        style = this[i].attr.style;
                        if ("function" === typeof style) continue;
                        if (1 === args && "object" === typeof mix) {
                            if (null == style) {
                                this[i].attr.style = css_toString(mix);
                                continue;
                            }
                            css = css_toObject(style);
                            for (key in mix) css[key] = mix[key];
                            this[i].attr.style = css_toString(css);
                        }
                        if (2 === args) {
                            if (null == style) {
                                this[i].attr.style = mix + ":" + value;
                                continue;
                            }
                            css = css_toObject(style);
                            css[mix] = value;
                            this[i].attr.style = css_toString(css);
                        }
                    }
                    return this;
                }
            });
            function css_toObject(style) {
                var arr = style.split(";"), obj = {}, index;
                for (var i = 0, x, length = arr.length; i < length; i++) {
                    x = arr[i];
                    index = x.indexOf(":");
                    obj[x.substring(0, index).trim()] = x.substring(index + 1).trim();
                }
                return obj;
            }
            function css_toString(css) {
                var output = [], i = 0;
                for (var key in css) output[i++] = key + ":" + css[key];
                return output.join(";");
            }
        }();
        util_extend(jMask.prototype, {
            clone: function() {
                var result = [];
                for (var i = 0, length = this.length; i < length; i++) result[i] = jmask_clone(this[0]);
                return jMask(result);
            },
            wrap: function(wrapper) {
                var $mask = jMask(wrapper), result = [], $wrapper;
                if (0 === $mask.length) {
                    console.log("Not valid wrapper", wrapper);
                    return this;
                }
                for (var i = 0, length = this.length; i < length; i++) {
                    $wrapper = length > 0 ? $mask.clone() : $mask;
                    jmask_deepest($wrapper[0]).nodes = [ this[i] ];
                    result[i] = $wrapper[0];
                    var parentNodes = this[i].parent && this[i].parent.nodes;
                    if (null != parentNodes) for (var j = 0, jmax = parentNodes.length; j < jmax; j++) if (parentNodes[j] === this[i]) {
                        parentNodes.splice(j, 1, result[i]);
                        break;
                    }
                }
                return jMask(result);
            },
            wrapAll: function(wrapper) {
                var $wrapper = jMask(wrapper);
                if (0 === $wrapper.length) {
                    console.error("Not valid wrapper", wrapper);
                    return this;
                }
                this.parent().mask($wrapper);
                jmask_deepest($wrapper[0]).nodes = this.toArray();
                return this.pushStack($wrapper);
            }
        });
        arr_each([ "empty", "remove" ], function(method) {
            jMask.prototype[method] = function() {
                var i = 0, length = this.length, node;
                for (;i < length; i++) {
                    node = this[i];
                    if ("empty" === method) {
                        node.nodes = null;
                        continue;
                    }
                    if ("remove" === method) {
                        if (null != node.parent) arr_remove(node.parent.nodes, node);
                        continue;
                    }
                }
                return this;
            };
        });
        util_extend(jMask.prototype, {
            each: function(fn, cntx) {
                for (var i = 0; i < this.length; i++) fn.call(cntx || this, this[i], i);
                return this;
            },
            eq: function(i) {
                return i === -1 ? this.slice(i) : this.slice(i, i + 1);
            },
            get: function(i) {
                return i < 0 ? this[this.length - i] : this[i];
            },
            slice: function() {
                return this.pushStack(Array.prototype.slice.apply(this, arguments));
            }
        });
        arr_each([ "filter", "children", "closest", "parent", "find", "first", "last" ], function(method) {
            jMask.prototype[method] = function(selector) {
                var result = [], matcher = null == selector ? null : selector_parse(selector, this.type, "closest" === method ? "up" : "down"), i, x;
                switch (method) {
                  case "filter":
                    return jMask(jmask_filter(this, matcher));

                  case "children":
                    for (i = 0; i < this.length; i++) {
                        x = this[i];
                        if (null == x.nodes) continue;
                        result = result.concat(null == matcher ? x.nodes : jmask_filter(x.nodes, matcher));
                    }
                    break;

                  case "parent":
                    for (i = 0; i < this.length; i++) {
                        x = this[i].parent;
                        if (!x || x.type === Dom.FRAGMENT || matcher && selector_match(x, matcher)) continue;
                        result.push(x);
                    }
                    arr_unique(result);
                    break;

                  case "closest":
                  case "find":
                    if (null == matcher) break;
                    for (i = 0; i < this.length; i++) jmask_find(this[i][matcher.nextKey], matcher, result);
                    break;

                  case "first":
                  case "last":
                    var index;
                    for (i = 0; i < this.length; i++) {
                        index = "first" === method ? i : this.length - i - 1;
                        x = this[index];
                        if (null == matcher || selector_match(x, matcher)) {
                            result[0] = x;
                            break;
                        }
                    }
                }
                return this.pushStack(result);
            };
        });
        return jMask;
    }(Mask);
    !function(mask, Compo) {
        var domLib = global.jQuery || global.Zepto || global.$, __Compo = "undefined" !== typeof Compo ? Compo : mask.Compo || global.Compo, __dom_addEventListener = __Compo.Dom.addEventListener, __mask_registerHandler = mask.registerHandler, __mask_registerAttrHandler = mask.registerAttrHandler, __mask_registerUtil = mask.registerUtil, _Array_slice = Array.prototype.slice;
        function fn_proxy(fn, ctx) {
            return function() {
                return fn.apply(ctx, arguments);
            };
        }
        var obj_getProperty, obj_setProperty, obj_addObserver, obj_hasObserver, obj_removeObserver, obj_lockObservers, obj_unlockObservers, obj_extend, obj_isDefined;
        !function() {
            obj_getProperty = function(obj, property) {
                var chain = property.split("."), imax = chain.length, i = -1;
                while (++i < imax) {
                    if (null == obj) return null;
                    obj = obj[chain[i]];
                }
                return obj;
            };
            obj_setProperty = function(obj, property, value) {
                var chain = property.split("."), imax = chain.length - 1, i = -1, key;
                while (++i < imax) {
                    key = chain[i];
                    if (null == obj[key]) obj[key] = {};
                    obj = obj[key];
                }
                obj[chain[i]] = value;
            };
            obj_addObserver = function(obj, property, callback) {
                var parts = property.split("."), imax = parts.length, i = -1, x = obj;
                while (++i < imax) {
                    x = x[parts[i]];
                    if (null == x) break;
                    if (null != x.__observers) {
                        var prop = parts.slice(i + 1).join(".");
                        if (x.__observers[prop]) {
                            listener_push(x, prop, callback);
                            var listeners = listener_push(obj, property, callback);
                            if (1 === listeners.length) {
                                var arr = parts.splice(0, i);
                                if (0 !== arr.length) obj_attachProxy(obj, property, listeners, arr, true);
                            }
                            return;
                        }
                    }
                }
                var listeners = listener_push(obj, property, callback);
                if (1 === listeners.length) obj_attachProxy(obj, property, listeners, parts, true);
                var val = obj_getProperty(obj, property);
                if (arr_isArray(val)) arr_addObserver(val, callback);
            };
            obj_hasObserver = function(obj, property, callback) {
                var parts = property.split("."), imax = parts.length, i = -1, x = obj;
                while (++i < imax) {
                    x = x[parts[i]];
                    if (null == x) break;
                    if (null != x.__observers) {
                        if (obj_hasObserver(x, parts.slice(i).join("."), callback)) return true;
                        break;
                    }
                }
                var obs = obj.__observers;
                if (null == obs || null == obs[property]) return false;
                return arr_indexOf(obs[property], callback) !== -1;
            };
            obj_removeObserver = function(obj, property, callback) {
                var parts = property.split("."), imax = parts.length, i = -1, x = obj;
                while (++i < imax) {
                    x = x[parts[i]];
                    if (null == x) break;
                    if (null != x.__observers) {
                        obj_removeObserver(x, parts.slice(i).join("."), callback);
                        break;
                    }
                }
                var obs = obj.__observers;
                if (null == obs || null == obs[property]) return;
                var currentValue = obj_getProperty(obj, property);
                if (2 === arguments.length) {
                    obs[property].length = 0;
                    return;
                }
                arr_remove(obs[property], callback);
                if (arr_isArray(currentValue)) arr_removeObserver(currentValue, callback);
            };
            obj_lockObservers = function(obj) {
                if (arr_isArray(obj)) {
                    arr_lockObservers(obj);
                    return;
                }
                var obs = obj.__observers;
                if (null != obs) obs.__dirties = {};
            };
            obj_unlockObservers = function(obj) {
                if (arr_isArray(obj)) {
                    arr_unlockObservers(obj);
                    return;
                }
                var obs = obj.__observers, dirties = null == obs ? null : obs.__dirties;
                if (null != dirties) {
                    for (var prop in dirties) {
                        var callbacks = obj.__observers[prop], value = obj_getProperty(obj, prop);
                        if (null != callbacks) for (var i = 0, imax = callbacks.length; i < imax; i++) callbacks[i](value);
                    }
                    obs.__dirties = null;
                }
            };
            obj_extend = function(obj, source) {
                if (null == source) return obj;
                if (null == obj) obj = {};
                for (var key in source) obj[key] = source[key];
                return obj;
            };
            obj_isDefined = function(obj, path) {
                if (null == obj) return false;
                var parts = path.split("."), imax = parts.length, i = -1;
                while (++i < imax) if (null == (obj = obj[parts[i]])) return false;
                return true;
            };
            function obj_ensure(obj, chain) {
                var i = -1, imax = chain.length - 1, key;
                while (++i < imax) {
                    key = chain[i];
                    if (null == obj[key]) obj[key] = {};
                    obj = obj[key];
                }
                return obj;
            }
            function obj_attachProxy(obj, property, listeners, chain) {
                var length = chain.length, parent = length > 1 ? obj_ensure(obj, chain) : obj, key = chain[length - 1], currentValue = parent[key];
                if (length > 1) obj_defineCrumbs(obj, chain);
                if ("length" === key && arr_isArray(parent)) {
                    arr_addObserver(parent, function(array, method, args, result) {
                        var imax = listeners.length, i = -1;
                        while (++i < imax) listeners[i](array, method, args, result);
                    });
                    return currentValue;
                }
                Object.defineProperty(parent, key, {
                    get: function() {
                        return currentValue;
                    },
                    set: function(x) {
                        var i = 0, imax = listeners.length;
                        if (x === currentValue) return;
                        currentValue = x;
                        if (arr_isArray(x)) for (i = 0; i < imax; i++) arr_addObserver(x, listeners[i]);
                        if (null != listeners.__dirties) {
                            listeners.__dirties[property] = 1;
                            return;
                        }
                        for (i = 0; i < imax; i++) listeners[i](x);
                    },
                    configurable: true
                });
                return currentValue;
            }
            function obj_defineCrumbs(obj, chain) {
                var rebinder = obj_crumbRebindDelegate(obj), path = "", key;
                for (var i = 0, imax = chain.length - 1; i < imax; i++) {
                    key = chain[i];
                    path += key + ".";
                    obj_defineCrumb(path, obj, key, rebinder);
                    obj = obj[key];
                }
            }
            function obj_defineCrumb(path, obj, key, rebinder) {
                var value = obj[key], old;
                Object.defineProperty(obj, key, {
                    get: function() {
                        return value;
                    },
                    set: function(x) {
                        if (x === value) return;
                        old = value;
                        value = x;
                        rebinder(path, old);
                    },
                    configurable: true
                });
            }
            function obj_crumbRebindDelegate(obj) {
                return function(path, oldValue) {
                    var observers = obj.__observers;
                    if (null == observers) return;
                    for (var property in observers) {
                        if (0 !== property.indexOf(path)) continue;
                        var listeners = observers[property].slice(0), imax = listeners.length, i = 0;
                        if (0 === imax) continue;
                        var val = obj_getProperty(obj, property), cb, oldProp;
                        for (i = 0; i < imax; i++) {
                            cb = listeners[i];
                            obj_removeObserver(obj, property, cb);
                            oldProp = property.substring(path.length);
                            obj_removeObserver(oldValue, oldProp, cb);
                        }
                        for (i = 0; i < imax; i++) listeners[i](val);
                        for (i = 0; i < imax; i++) obj_addObserver(obj, property, listeners[i]);
                    }
                };
            }
            function listener_push(obj, property, callback) {
                if (null == obj.__observers) Object.defineProperty(obj, "__observers", {
                    value: {
                        __dirty: null
                    },
                    enumerable: false
                });
                var obs = obj.__observers;
                if (null != obs[property]) {
                    if (arr_indexOf(obs[property], callback) === -1) obs[property].push(callback);
                } else obs[property] = [ callback ];
                return obs[property];
            }
        }();
        var arr_isArray, arr_remove, arr_each, arr_indexOf, arr_addObserver, arr_removeObserver, arr_lockObservers, arr_unlockObservers;
        !function() {
            arr_isArray = function(x) {
                return null != x && "object" === typeof x && null != x.length && "function" === typeof x.splice;
            };
            arr_remove = function(array) {
                if (null == array) return false;
                var i = 0, length = array.length, x, j = 1, jmax = arguments.length, removed = 0;
                for (;i < length; i++) {
                    x = array[i];
                    for (j = 1; j < jmax; j++) if (arguments[j] === x) {
                        array.splice(i, 1);
                        i--;
                        length--;
                        removed++;
                        break;
                    }
                }
                return removed + 1 === jmax;
            };
            arr_addObserver = function(arr, callback) {
                if (null == arr.__observers) Object.defineProperty(arr, "__observers", {
                    value: {
                        __dirty: null
                    },
                    enumerable: false
                });
                var observers = arr.__observers.__array;
                if (null == observers) observers = arr.__observers.__array = [];
                if (0 === observers.length) {
                    var i = 0, fns = [ "push", "unshift", "splice", "pop", "shift", "reverse", "sort", "remove" ], length = fns.length, fn, method;
                    for (;i < length; i++) {
                        method = fns[i];
                        fn = arr[method];
                        if (null != fn) arr[method] = _array_createWrapper(arr, fn, method);
                    }
                }
                observers[observers.length++] = callback;
            };
            arr_removeObserver = function(arr, callback) {
                var obs = arr.__observers && arr.__observers.__array;
                if (null != obs) for (var i = 0, imax = obs.length; i < imax; i++) if (obs[i] === callback) {
                    obs[i] = null;
                    for (var j = i; j < imax; j++) obs[j] = obs[j + 1];
                    imax--;
                    obs.length--;
                }
            };
            arr_lockObservers = function(arr) {
                if (null != arr.__observers) arr.__observers.__dirty = false;
            };
            arr_unlockObservers = function(arr) {
                var list = arr.__observers, obs = list && list.__array;
                if (null != obs) if (true === list.__dirty) {
                    for (var i = 0, x, imax = obs.length; i < imax; i++) {
                        x = obs[i];
                        if ("function" === typeof x) x(arr);
                    }
                    list.__dirty = null;
                }
            };
            arr_each = function(array, fn) {
                for (var i = 0, length = array.length; i < length; i++) fn(array[i]);
            };
            arr_indexOf = function(arr, x) {
                return arr.indexOf(x);
            };
            function _array_createWrapper(array, originalFn, overridenFn) {
                return function() {
                    return _array_methodWrapper(array, originalFn, overridenFn, _Array_slice.call(arguments));
                };
            }
            function _array_methodWrapper(array, original, method, args) {
                var callbacks = array.__observers && array.__observers.__array, result = original.apply(array, args);
                if (null == callbacks || 0 === callbacks.length) return result;
                if (null != array.__observers.__dirty) {
                    array.__observers.__dirty = true;
                    return result;
                }
                var i = 0, imax = callbacks.length, x;
                for (;i < imax; i++) {
                    x = callbacks[i];
                    if ("function" === typeof x) x(array, method, args, result);
                }
                return result;
            }
        }();
        function dom_removeElement(node) {
            return node.parentNode.removeChild(node);
        }
        function dom_removeAll(array) {
            if (null == array) return;
            var imax = array.length, i = -1;
            while (++i < imax) dom_removeElement(array[i]);
        }
        function dom_insertAfter(element, anchor) {
            return anchor.parentNode.insertBefore(element, anchor.nextSibling);
        }
        function dom_insertBefore(element, anchor) {
            return anchor.parentNode.insertBefore(element, anchor);
        }
        function compo_fragmentInsert(compo, index, fragment, placeholder) {
            if (null == compo.components) return dom_insertAfter(fragment, placeholder || compo.placeholder);
            var compos = compo.components, anchor = null, insertBefore = true, imax = compos.length, i = index - 1, elements;
            if (null == anchor) while (++i < imax) {
                elements = compos[i].elements;
                if (elements && elements.length) {
                    anchor = elements[0];
                    break;
                }
            }
            if (null == anchor) {
                insertBefore = false;
                i = index < imax ? index : imax;
                while (--i > -1) {
                    elements = compos[i].elements;
                    if (elements && elements.length) {
                        anchor = elements[elements.length - 1];
                        break;
                    }
                }
            }
            if (null == anchor) anchor = placeholder || compo.placeholder;
            if (insertBefore) return dom_insertBefore(fragment, anchor);
            return dom_insertAfter(fragment, anchor);
        }
        function compo_render(parentController, template, model, cntx, container) {
            return mask.render(template, model, cntx, container, parentController);
        }
        function compo_dispose(compo, parent) {
            if (null == compo) return false;
            if (null != compo.elements) {
                dom_removeAll(compo.elements);
                compo.elements = null;
            }
            __Compo.dispose(compo);
            var components = parent && parent.components || compo.parent && compo.parent.components;
            if (null == components) {
                console.error("Parent Components Collection is undefined");
                return false;
            }
            return arr_remove(components, compo);
        }
        function compo_inserted(compo) {
            __Compo.signal.emitIn(compo, "domInsert");
        }
        function compo_attachDisposer(controller, disposer) {
            if ("function" === typeof controller.dispose) {
                var previous = controller.dispose;
                controller.dispose = function() {
                    disposer.call(this);
                    previous.call(this);
                };
                return;
            }
            controller.dispose = disposer;
        }
        var expression_eval, expression_bind, expression_unbind, expression_createBinder, expression_createListener, expression_parse, expression_varRefs;
        !function() {
            var Expression = mask.Utils.Expression, expression_eval_origin = Expression.eval;
            expression_parse = Expression.parse;
            expression_varRefs = Expression.varRefs;
            expression_eval = function(expr, model, cntx, controller) {
                if ("." === expr) return model;
                var value = expression_eval_origin(expr, model, cntx, controller);
                return null == value ? "" : value;
            };
            expression_bind = function(expr, model, cntx, controller, callback) {
                if ("." === expr) {
                    if (arr_isArray(model)) arr_addObserver(model, callback);
                    return;
                }
                var ast = expression_parse(expr), vars = expression_varRefs(ast), obj, ref;
                if (null == vars) return;
                if ("string" === typeof vars) {
                    if (obj_isDefined(model, vars)) obj = model;
                    if (null == obj && obj_isDefined(controller, vars)) obj = controller;
                    if (null == obj) obj = model;
                    obj_addObserver(obj, vars, callback);
                    return;
                }
                var isArray = null != vars.length && "function" === typeof vars.splice, imax = true === isArray ? vars.length : 1, i = 0, x;
                for (;i < imax; i++) {
                    x = isArray ? vars[i] : vars;
                    if (null == x) continue;
                    if ("object" === typeof x) {
                        obj = expression_eval_origin(x.accessor, model, cntx, controller);
                        if (null == obj || "object" !== typeof obj) {
                            console.error("Binding failed to an object over accessor", x);
                            continue;
                        }
                        x = x.ref;
                    } else if (obj_isDefined(model, x)) obj = model; else if (obj_isDefined(controller, x)) obj = controller; else obj = model;
                    if (null == x || "$c" === x) continue;
                    obj_addObserver(obj, x, callback);
                }
                return;
            };
            expression_unbind = function(expr, model, controller, callback) {
                if ("function" === typeof controller) console.warn("[mask.binding] - expression unbind(expr, model, controller, callback)");
                if ("." === expr) {
                    arr_removeObserver(model, callback);
                    return;
                }
                var vars = expression_varRefs(expr), x, ref;
                if (null == vars) return;
                if ("string" === typeof vars) {
                    if (obj_isDefined(model, vars)) obj_removeObserver(model, vars, callback);
                    if (obj_isDefined(controller, vars)) obj_removeObserver(controller, vars, callback);
                    return;
                }
                var isArray = null != vars.length && "function" === typeof vars.splice, imax = true === isArray ? vars.length : 1, i = 0, x;
                for (;i < imax; i++) {
                    x = isArray ? vars[i] : vars;
                    if (null == x) continue;
                    if ("object" === typeof x) {
                        var obj = expression_eval_origin(x.accessor, model, null, controller);
                        if (obj) obj_removeObserver(obj, x.ref, callback);
                        continue;
                    }
                    if (obj_isDefined(model, x)) obj_removeObserver(model, x, callback);
                    if (obj_isDefined(controller, x)) obj_removeObserver(controller, x, callback);
                }
            };
            expression_createBinder = function(expr, model, cntx, controller, callback) {
                var locks = 0;
                return function binder() {
                    if (++locks > 1) {
                        locks = 0;
                        console.warn("<mask:bind:expression> Concurent binder detected", expr);
                        return;
                    }
                    var value = expression_eval(expr, model, cntx, controller);
                    if (arguments.length > 1) {
                        var args = _Array_slice.call(arguments);
                        args[0] = value;
                        callback.apply(this, args);
                    } else callback(value);
                    locks--;
                };
            };
            expression_createListener = function(callback) {
                var locks = 0;
                return function() {
                    if (++locks > 1) {
                        locks = 0;
                        console.warn("<mask:listener:expression> concurent binder");
                        return;
                    }
                    callback();
                    locks--;
                };
            };
        }();
        var signal_parse, signal_create;
        !function() {
            signal_parse = function(str, isPiped, defaultType) {
                var signals = str.split(";"), set = [], i = 0, imax = signals.length, x, signalName, type, signal;
                for (;i < imax; i++) {
                    x = signals[i].split(":");
                    if (1 !== x.length && 2 !== x.length) {
                        console.error('Too much ":" in a signal def.', signals[i]);
                        continue;
                    }
                    type = 2 == x.length ? x[0] : defaultType;
                    signalName = x[2 == x.length ? 1 : 0];
                    signal = signal_create(signalName.trim(), type, isPiped);
                    if (null != signal) set.push(signal);
                }
                return set;
            };
            signal_create = function(signal, type, isPiped) {
                if (true !== isPiped) return {
                    signal: signal,
                    type: type
                };
                var index = signal.indexOf(".");
                if (index === -1) {
                    console.error("No pipe name in a signal", signal);
                    return null;
                }
                return {
                    signal: signal.substring(index + 1),
                    pipe: signal.substring(0, index),
                    type: type
                };
            };
        }();
        var BindingProvider = function() {
            var Providers = {};
            mask.registerBinding = function(type, binding) {
                Providers[type] = binding;
            };
            mask.BindingProvider = BindingProvider;
            function BindingProvider(model, element, controller, bindingType) {
                if (null == bindingType) bindingType = ":bind" === controller.compoName ? "single" : "dual";
                var attr = controller.attr, type;
                this.node = controller;
                this.controller = controller;
                this.model = model;
                this.element = element;
                this.value = attr.value;
                this.property = attr.property;
                this.setter = attr.setter;
                this.getter = attr.getter;
                this.dismiss = 0;
                this.bindingType = bindingType;
                this.log = false;
                this.signal_domChanged = null;
                this.signal_objectChanged = null;
                this.locked = false;
                if (null == this.property && null == this.getter) switch (element.tagName) {
                  case "INPUT":
                    type = element.getAttribute("type");
                    if ("checkbox" === type) {
                        this.property = "element.checked";
                        break;
                    }
                    this.property = "element.value";
                    break;

                  case "TEXTAREA":
                    this.property = "element.value";
                    break;

                  case "SELECT":
                    this.domWay = DomWaysProto.SELECT;
                    break;

                  default:
                    this.property = "element.innerHTML";
                }
                if (attr["log"]) {
                    this.log = true;
                    if ("log" !== attr.log) this.logExpression = attr.log;
                }
                if (attr["x-signal"]) {
                    var signal = signal_parse(attr["x-signal"], null, "dom")[0], signalType = signal && signal.type;
                    switch (signalType) {
                      case "dom":
                      case "object":
                        this["signal_" + signalType + "Changed"] = signal.signal;
                        break;

                      default:
                        console.error("Signal typs is not supported", signal);
                    }
                }
                if (attr["x-pipe-signal"]) {
                    var signal = signal_parse(attr["x-pipe-signal"], true, "dom")[0], signalType = signal && signal.type;
                    switch (signalType) {
                      case "dom":
                      case "object":
                        this["pipe_" + signalType + "Changed"] = signal;
                        break;

                      default:
                        console.error("Pipe type is not supported");
                    }
                }
                if (attr["dom-slot"]) {
                    this.slots = {};
                    var parent = controller.parent, newparent = parent.parent;
                    parent.parent = this;
                    this.parent = newparent;
                    this.slots[attr["dom-slot"]] = function(sender, value) {
                        this.domChanged(sender, value);
                    };
                }
                var pipeSlot = attr["object-pipe-slot"] || attr["x-pipe-slot"];
                if (pipeSlot) {
                    var str = pipeSlot, index = str.indexOf("."), pipeName = str.substring(0, index), signal = str.substring(index + 1);
                    this.pipes = {};
                    this.pipes[pipeName] = {};
                    this.pipes[pipeName][signal] = function() {
                        this.objectChanged();
                    };
                    __Compo.pipe.addController(this);
                }
                if (attr.expression) {
                    this.expression = attr.expression;
                    if (null == this.value && "single" !== bindingType) {
                        var refs = expression_varRefs(this.expression);
                        if ("string" === typeof refs) this.value = refs; else console.warn("Please set value attribute in DualBind Control.");
                    }
                    return;
                }
                this.expression = this.value;
            }
            BindingProvider.create = function(model, element, controller, bindingType) {
                var type = controller.attr.bindingProvider, CustomProvider = null == type ? null : Providers[type], provider;
                if ("function" === typeof CustomProvider) return new CustomProvider(model, element, controller, bindingType);
                provider = new BindingProvider(model, element, controller, bindingType);
                if (null != CustomProvider) obj_extend(provider, CustomProvider);
                return provider;
            };
            BindingProvider.bind = function(provider) {
                return apply_bind(provider);
            };
            BindingProvider.prototype = {
                constructor: BindingProvider,
                dispose: function() {
                    expression_unbind(this.expression, this.model, this.controller, this.binder);
                },
                objectChanged: function(x) {
                    if (this.dismiss-- > 0) return;
                    if (true === this.locked) {
                        console.warn("Concurance change detected", this);
                        return;
                    }
                    this.locked = true;
                    if (null == x) x = this.objectWay.get(this, this.expression);
                    this.domWay.set(this, x);
                    if (this.log) console.log("[BindingProvider] objectChanged -", x);
                    if (this.signal_objectChanged) signal_emitOut(this.node, this.signal_objectChanged, [ x ]);
                    if (this.pipe_objectChanged) {
                        var pipe = this.pipe_objectChanged;
                        __Compo.pipe(pipe.pipe).emit(pipe.signal);
                    }
                    this.locked = false;
                },
                domChanged: function(event, value) {
                    if (true === this.locked) {
                        console.warn("Concurance change detected", this);
                        return;
                    }
                    this.locked = true;
                    var x = value || this.domWay.get(this), valid = true;
                    if (this.node.validations) for (var i = 0, validation, length = this.node.validations.length; i < length; i++) {
                        validation = this.node.validations[i];
                        if (false === validation.validate(x, this.element, this.objectChanged.bind(this))) {
                            valid = false;
                            break;
                        }
                    }
                    if (valid) {
                        this.dismiss = 1;
                        this.objectWay.set(this.model, this.value, x);
                        this.dismiss = 0;
                        if (this.log) console.log("[BindingProvider] domChanged -", x);
                        if (this.signal_domChanged) signal_emitOut(this.node, this.signal_domChanged, [ x ]);
                        if (this.pipe_domChanged) {
                            var pipe = this.pipe_domChanged;
                            __Compo.pipe(pipe.pipe).emit(pipe.signal);
                        }
                    }
                    this.locked = false;
                },
                objectWay: {
                    get: function(provider, expression) {
                        return expression_eval(expression, provider.model, provider.cntx, provider.controller);
                    },
                    set: function(obj, property, value) {
                        obj_setProperty(obj, property, value);
                    }
                },
                domWay: {
                    get: function(provider) {
                        if (provider.getter) {
                            var controller = provider.node.parent;
                            if (null == controller || "function" !== typeof controller[provider.getter]) {
                                console.error("Mask.bindings: Getter should be a function", provider.getter, provider);
                                return null;
                            }
                            return controller[provider.getter]();
                        }
                        return obj_getProperty(provider, provider.property);
                    },
                    set: function(provider, value) {
                        if (provider.setter) {
                            var controller = provider.node.parent;
                            if (null == controller || "function" !== typeof controller[provider.setter]) {
                                console.error("Mask.bindings: Setter should be a function", provider.setter, provider);
                                return;
                            }
                            controller[provider.setter](value);
                        } else obj_setProperty(provider, provider.property, value);
                    }
                }
            };
            var DomWaysProto = {
                SELECT: {
                    get: function(provider) {
                        var element = provider.element;
                        if (element.selectedIndex === -1) return "";
                        return element.options[element.selectedIndex].getAttribute("name");
                    },
                    set: function(provider, value) {
                        var element = provider.element;
                        for (var i = 0, x, imax = element.options.length; i < imax; i++) {
                            x = element.options[i];
                            if (x.getAttribute("name") == value) {
                                element.selectedIndex = i;
                                return;
                            }
                        }
                    }
                }
            };
            function apply_bind(provider) {
                var expr = provider.expression, model = provider.model, onObjChanged = provider.objectChanged = provider.objectChanged.bind(provider);
                provider.binder = expression_createBinder(expr, model, provider.cntx, provider.node, onObjChanged);
                expression_bind(expr, model, provider.cntx, provider.node, provider.binder);
                if ("dual" === provider.bindingType) {
                    var attr = provider.node.attr;
                    if (!attr["change-slot"] && !attr["change-pipe-event"]) {
                        var element = provider.element, eventType = attr["change-event"] || attr.changeEvent || "change", onDomChange = provider.domChanged.bind(provider);
                        __dom_addEventListener(element, eventType, onDomChange);
                    }
                    if (!provider.objectWay.get(provider, provider.expression)) {
                        setTimeout(function() {
                            if (provider.domWay.get(provider)) provider.domChanged();
                        });
                        return provider;
                    }
                }
                provider.objectChanged();
                return provider;
            }
            function signal_emitOut(controller, signal, args) {
                var slots = controller.slots;
                if (null != slots && "function" === typeof slots[signal]) if (false === slots[signal].apply(controller, args)) return;
                if (null != controller.parent) signal_emitOut(controller.parent, signal, args);
            }
            obj_extend(BindingProvider, {
                addObserver: obj_addObserver,
                removeObserver: obj_removeObserver
            });
            return BindingProvider;
        }();
        function VisibleHandler() {}
        __mask_registerHandler(":visible", VisibleHandler);
        VisibleHandler.prototype = {
            constructor: VisibleHandler,
            refresh: function(model, container) {
                container.style.display = expression_eval(this.attr.check, model) ? "" : "none";
            },
            renderStart: function(model, cntx, container) {
                this.refresh(model, container);
                if (this.attr.bind) obj_addObserver(model, this.attr.bind, this.refresh.bind(this, model, container));
            }
        };
        !function() {
            function Bind() {}
            __mask_registerHandler(":bind", Bind);
            Bind.prototype = {
                constructor: Bind,
                renderEnd: function(els, model, cntx, container) {
                    this.provider = BindingProvider.create(model, container, this, "single");
                    BindingProvider.bind(this.provider);
                },
                dispose: function() {
                    if (this.provider && "function" === typeof this.provider.dispose) this.provider.dispose();
                }
            };
        }();
        function DualbindHandler() {}
        __mask_registerHandler(":dualbind", DualbindHandler);
        DualbindHandler.prototype = {
            constructor: DualbindHandler,
            renderEnd: function(elements, model, cntx, container) {
                this.provider = BindingProvider.create(model, container, this);
                if (this.components) for (var i = 0, x, length = this.components.length; i < length; i++) {
                    x = this.components[i];
                    if (":validate" === x.compoName) (this.validations || (this.validations = [])).push(x);
                }
                if (!this.attr["no-validation"] && !this.validations) {
                    var Validate = model.Validate, prop = this.provider.value;
                    if (null == Validate && prop.indexOf(".") !== -1) {
                        var parts = prop.split("."), i = 0, imax = parts.length, obj = model[parts[0]];
                        while (null == Validate && ++i < imax && obj) {
                            Validate = obj.Validate;
                            obj = obj[parts[i]];
                        }
                        prop = parts.slice(i).join(".");
                    }
                    var validator = Validate && Validate[prop];
                    if ("function" === typeof validator) {
                        validator = mask.getHandler(":validate").createCustom(container, validator);
                        (this.validations || (this.validations = [])).push(validator);
                    }
                }
                BindingProvider.bind(this.provider);
            },
            dispose: function() {
                if (this.provider && "function" === typeof this.provider.dispose) this.provider.dispose();
            },
            handlers: {
                attr: {
                    "x-signal": function() {}
                }
            }
        };
        !function() {
            var class_INVALID = "-validate-invalid";
            mask.registerValidator = function(type, validator) {
                Validators[type] = validator;
            };
            function Validate() {}
            __mask_registerHandler(":validate", Validate);
            Validate.prototype = {
                constructor: Validate,
                attr: {},
                renderStart: function(model, cntx, container) {
                    this.element = container;
                    if (this.attr.value) {
                        var validatorFn = Validate.resolveFromModel(model, this.attr.value);
                        if (validatorFn) this.validators = [ new Validator(validatorFn) ];
                    }
                },
                validate: function(input, element, oncancel) {
                    if (null == element) element = this.element;
                    if (this.attr) {
                        if (null == input && this.attr.getter) input = obj_getProperty({
                            node: this,
                            element: element
                        }, this.attr.getter);
                        if (null == input && this.attr.value) input = obj_getProperty(this.model, this.attr.value);
                    }
                    if (null == this.validators) this.initValidators();
                    for (var i = 0, x, imax = this.validators.length; i < imax; i++) {
                        x = this.validators[i].validate(input);
                        if (x && !this.attr.silent) {
                            this.notifyInvalid(element, x, oncancel);
                            return false;
                        }
                    }
                    this.makeValid(element);
                    return true;
                },
                notifyInvalid: function(element, message, oncancel) {
                    return notifyInvalid(element, message, oncancel);
                },
                makeValid: function(element) {
                    return makeValid(element);
                },
                initValidators: function() {
                    this.validators = [];
                    for (var key in this.attr) {
                        switch (key) {
                          case "message":
                          case "value":
                          case "getter":
                            continue;
                        }
                        if (key in Validators === false) {
                            console.error("Unknown Validator:", key, this);
                            continue;
                        }
                        var x = Validators[key];
                        this.validators.push(new Validator(x(this.attr[key], this), this.attr.message));
                    }
                }
            };
            Validate.resolveFromModel = function(model, property) {
                return obj_getProperty(model.Validate, property);
            };
            Validate.createCustom = function(element, validator) {
                var validate = new Validate();
                validate.element = element;
                validate.validators = [ new Validator(validator) ];
                return validate;
            };
            function Validator(fn, defaultMessage) {
                this.fn = fn;
                this.message = defaultMessage;
            }
            Validator.prototype.validate = function(value) {
                var result = this.fn(value);
                if (false === result) return this.message || "Invalid - " + value;
                return result;
            };
            function notifyInvalid(element, message, oncancel) {
                console.warn("Validate Notification:", element, message);
                var next = domLib(element).next("." + class_INVALID);
                if (0 === next.length) next = domLib("<div>").addClass(class_INVALID).html("<span></span><button>cancel</button>").insertAfter(element);
                return next.children("button").off().on("click", function() {
                    next.hide();
                    oncancel && oncancel();
                }).end().children("span").text(message).end().show();
            }
            function makeValid(element) {
                return domLib(element).next("." + class_INVALID).hide();
            }
            __mask_registerHandler(":validate:message", Compo({
                template: "div." + class_INVALID + ' { span > "~[bind:message]" button > "~[cancel]" }',
                onRenderStart: function(model) {
                    if ("string" === typeof model) model = {
                        message: model
                    };
                    if (!model.cancel) model.cancel = "cancel";
                    this.model = model;
                },
                compos: {
                    button: "$: button"
                },
                show: function(message, oncancel) {
                    var that = this;
                    this.model.message = message;
                    this.compos.button.off().on(function() {
                        that.hide();
                        oncancel && oncancel();
                    });
                    this.$.show();
                },
                hide: function() {
                    this.$.hide();
                }
            }));
            var Validators = {
                match: function(match) {
                    return function(str) {
                        return new RegExp(match).test(str);
                    };
                },
                unmatch: function(unmatch) {
                    return function(str) {
                        return !new RegExp(unmatch).test(str);
                    };
                },
                minLength: function(min) {
                    return function(str) {
                        return str.length >= parseInt(min, 10);
                    };
                },
                maxLength: function(max) {
                    return function(str) {
                        return str.length <= parseInt(max, 10);
                    };
                },
                check: function(condition, node) {
                    return function(str) {
                        return expression_eval("x" + condition, node.model, {
                            x: str
                        }, node);
                    };
                }
            };
        }();
        function ValidateGroup() {}
        __mask_registerHandler(":validate:group", ValidateGroup);
        ValidateGroup.prototype = {
            constructor: ValidateGroup,
            validate: function() {
                var validations = getValidations(this);
                for (var i = 0, x, length = validations.length; i < length; i++) {
                    x = validations[i];
                    if (!x.validate()) return false;
                }
                return true;
            }
        };
        function getValidations(component, out) {
            if (null == out) out = [];
            if (null == component.components) return out;
            var compos = component.components;
            for (var i = 0, x, length = compos.length; i < length; i++) {
                x = compos[i];
                if ("validate" === x.compoName) {
                    out.push(x);
                    continue;
                }
                getValidations(x);
            }
            return out;
        }
        !function() {
            function attr_strReplace(attrValue, currentValue, newValue) {
                if (!attrValue) return newValue;
                if (null == currentValue || "" === currentValue) return attrValue + " " + newValue;
                return attrValue.replace(currentValue, newValue);
            }
            function create_refresher(type, expr, element, currentValue, attrName) {
                return function(value) {
                    switch (type) {
                      case "node":
                        element.textContent = value;
                        break;

                      case "attr":
                        var _typeof = typeof element[attrName], currentAttr, attr;
                        if ("boolean" === _typeof) {
                            currentValue = element[attrName] = !!value;
                            return;
                        }
                        if ("string" === _typeof) {
                            currentValue = element[attrName] = attr_strReplace(element[attrName], currentValue, value);
                            return;
                        }
                        currentAttr = element.getAttribute(attrName);
                        attr = attr_strReplace(currentAttr, currentValue, value);
                        element.setAttribute(attrName, attr);
                        currentValue = value;
                    }
                };
            }
            function bind(current, expr, model, ctx, element, controller, attrName, type) {
                var refresher = create_refresher(type, expr, element, current, attrName), binder = expression_createBinder(expr, model, ctx, controller, refresher);
                expression_bind(expr, model, ctx, controller, binder);
                compo_attachDisposer(controller, function() {
                    expression_unbind(expr, model, controller, binder);
                });
            }
            __mask_registerUtil("bind", {
                mode: "partial",
                current: null,
                element: null,
                nodeRenderStart: function(expr, model, ctx, element, controller) {
                    var current = expression_eval(expr, model, ctx, controller);
                    this.element = document.createTextNode(current);
                    return this.current = current;
                },
                node: function(expr, model, ctx, element, controller) {
                    bind(this.current, expr, model, ctx, this.element, controller, null, "node");
                    return this.element;
                },
                attrRenderStart: function(expr, model, ctx, element, controller) {
                    return this.current = expression_eval(expr, model, ctx, controller);
                },
                attr: function(expr, model, ctx, element, controller, attrName) {
                    bind(this.current, expr, model, ctx, element, controller, attrName, "attr");
                    return this.current;
                }
            });
        }();
        __mask_registerAttrHandler("xx-visible", function(node, attrValue, model, cntx, element, controller) {
            var binder = expression_createBinder(attrValue, model, cntx, controller, function(value) {
                element.style.display = value ? "" : "none";
            });
            expression_bind(attrValue, model, cntx, controller, binder);
            compo_attachDisposer(controller, function() {
                expression_unbind(attrValue, model, controller, binder);
            });
            if (!expression_eval(attrValue, model, cntx, controller)) element.style.display = "none";
        });
        __mask_registerAttrHandler("x-toggle", "client", function(node, attrValue, model, ctx, element, controller) {
            var event = attrValue.substring(0, attrValue.indexOf(":")), expression = attrValue.substring(event.length + 1), ref = expression_varRefs(expression);
            if ("string" !== typeof ref) ref = ref[0];
            __dom_addEventListener(element, event, function() {
                var value = expression_eval(expression, model, ctx, controller);
                obj_setProperty(model, ref, value);
            });
        });
        __mask_registerAttrHandler("x-class-toggle", "client", function(node, attrValue, model, ctx, element, controller) {
            var event = attrValue.substring(0, attrValue.indexOf(":")), $class = attrValue.substring(event.length + 1).trim();
            __dom_addEventListener(element, event, function() {
                domLib(element).toggleClass($class);
            });
        });
        !function(mask) {
            function Sys() {
                this.attr = {
                    "debugger": null,
                    use: null,
                    log: null,
                    "if": null,
                    each: null,
                    visible: null
                };
            }
            mask.registerHandler("%%", Sys);
            var attr_use = function() {
                var UseProto = {
                    refresh: function(value) {
                        this.model = value;
                        if (this.elements) {
                            dom_removeAll(this.elements);
                            this.elements = [];
                        }
                        if (null != __Compo) __Compo.dispose(this);
                        dom_insertBefore(compo_render(this, this.nodes, this.model, this.cntx), this.placeholder);
                    },
                    dispose: function() {
                        expression_unbind(this.expr, this.originalModel, this, this.binder);
                    }
                };
                return function attr_use(self, model, cntx, container) {
                    var expr = self.attr["use"];
                    obj_extend(self, {
                        expr: expr,
                        placeholder: document.createComment(""),
                        binder: expression_createBinder(expr, model, cntx, self, UseProto.refresh.bind(self)),
                        originalModel: model,
                        model: expression_eval(expr, model, cntx, self),
                        dispose: UseProto.dispose
                    });
                    expression_bind(expr, model, cntx, self, self.binder);
                    container.appendChild(self.placeholder);
                };
            }();
            var attr_log = function() {
                return function attr_log(self, model, cntx) {
                    function log(value) {
                        console.log("Logger > Key: %s, Value: %s", expr, value);
                    }
                    var expr = self.attr["log"], binder = expression_createBinder(expr, model, cntx, self, log), value = expression_eval(expr, model, cntx, self);
                    expression_bind(expr, model, cntx, self, binder);
                    compo_attachDisposer(self, function() {
                        expression_unbind(expr, model, self, binder);
                    });
                    log(value);
                };
            }();
            var attr_if = function() {
                var IfProto = {
                    refresh: function(value) {
                        if (null == this.elements && !value) return;
                        if (null == this.elements) {
                            dom_insertBefore(compo_render(this, this.template, this.model, this.cntx), this.placeholder);
                            this.$ = domLib(this.elements);
                        } else {
                            if (null == this.$) this.$ = domLib(this.elements);
                            this.$[value ? "show" : "hide"]();
                        }
                        if (this.onchange) this.onchange(value);
                    },
                    dispose: function() {
                        expression_unbind(this.expr, this.model, this, this.binder);
                        this.onchange = null;
                        this.elements = null;
                    }
                };
                function bind(fn, compo) {
                    return function() {
                        return fn.apply(compo, arguments);
                    };
                }
                return function(self, model, cntx, container) {
                    var expr = self.attr["if"];
                    obj_extend(self, {
                        expr: expr,
                        template: self.nodes,
                        placeholder: document.createComment(""),
                        binder: expression_createBinder(expr, model, cntx, self, bind(IfProto.refresh, self)),
                        state: !!expression_eval(expr, model, cntx, self)
                    });
                    if (!self.state) self.nodes = null;
                    expression_bind(expr, model, cntx, self, self.binder);
                    container.appendChild(self.placeholder);
                };
            }();
            var attr_else = function() {
                var ElseProto = {
                    refresh: function(value) {
                        if (null == this.elements && value) return;
                        if (null == this.elements) {
                            dom_insertBefore(compo_render(this, this.template, this.model, this.cntx));
                            this.$ = domLib(this.elements);
                            return;
                        }
                        if (null == this.$) this.$ = domLib(this.elements);
                        this.$[value ? "hide" : "show"]();
                    }
                };
                return function(self, model, cntx, container) {
                    var compos = self.parent.components, prev = compos && compos[compos.length - 1];
                    self.template = self.nodes;
                    self.placeholder = document.createComment("");
                    if (null == prev || "%%" !== prev.compoName || null == prev.attr["if"]) {
                        console.error('Mask.Binding: Binded ELSE should be after binded IF - %% if="expression" { ...');
                        return;
                    }
                    prev.onchange = ElseProto.refresh.bind(self);
                    if (prev.state) self.nodes = null;
                    container.appendChild(self.placeholder);
                };
            }();
            var attr_each = function() {
                function list_prepairNodes(compo, arrayModel) {
                    var nodes = [];
                    if (null == arrayModel || "object" !== typeof arrayModel || null == arrayModel.length) return nodes;
                    var i = 0, length = arrayModel.length, model;
                    for (;i < length; i++) {
                        model = arrayModel[i];
                        switch (typeof model) {
                          case "string":
                          case "number":
                          case "boolean":
                            model = arrayModel[i] = Object(model);
                        }
                        nodes[i] = new ListItem(compo.template, model, compo);
                    }
                    return nodes;
                }
                function list_sort(self, array) {
                    var compos = self.components, i = 0, imax = compos.length, j = 0, jmax = null, element = null, compo = null, fragment = document.createDocumentFragment(), sorted = [];
                    for (;i < imax; i++) {
                        compo = compos[i];
                        if (null == compo.elements || 0 === compo.elements.length) continue;
                        for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
                            element = compo.elements[j];
                            element.parentNode.removeChild(element);
                        }
                    }
                    outer: for (j = 0, jmax = array.length; j < jmax; j++) {
                        for (i = 0; i < imax; i++) if (array[j] === compos[i].model) {
                            sorted[j] = compos[i];
                            continue outer;
                        }
                        console.warn("No Model Found for", array[j]);
                    }
                    for (i = 0, imax = sorted.length; i < imax; i++) {
                        compo = sorted[i];
                        if (null == compo.elements || 0 === compo.elements.length) continue;
                        for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
                            element = compo.elements[j];
                            fragment.appendChild(element);
                        }
                    }
                    self.components = sorted;
                    dom_insertBefore(fragment, self.placeholder);
                }
                function list_update(self, deleteIndex, deleteCount, insertIndex, rangeModel) {
                    if (null != deleteIndex && null != deleteCount) {
                        var i = deleteIndex, length = deleteIndex + deleteCount;
                        if (length > self.components.length) length = self.components.length;
                        for (;i < length; i++) if (compo_dispose(self.components[i], self)) {
                            i--;
                            length--;
                        }
                    }
                    if (null != insertIndex && rangeModel && rangeModel.length) {
                        var component = new Component(), nodes = list_prepairNodes(self, rangeModel), fragment = compo_render(component, nodes), compos = component.components;
                        compo_fragmentInsert(self, insertIndex, fragment);
                        compo_inserted(component);
                        if (null == self.components) self.components = [];
                        self.components.splice.apply(self.components, [ insertIndex, 0 ].concat(compos));
                    }
                }
                function list_remove(self, removed) {
                    var compos = self.components, i = compos.length, x;
                    while (--i > -1) {
                        x = compos[i];
                        if (removed.indexOf(x.model) === -1) continue;
                        compo_dispose(x, self);
                    }
                }
                var Component = mask.Dom.Component, ListItem = function() {
                    var Proto = Component.prototype;
                    function ListItem(template, model, parent) {
                        this.nodes = template;
                        this.model = model;
                        this.parent = parent;
                    }
                    ListItem.prototype = {
                        compoName: "%%.each.item",
                        constructor: ListProto,
                        renderEnd: function(elements) {
                            this.elements = elements;
                        }
                    };
                    for (var key in Proto) ListItem.prototype[key] = Proto[key];
                    return ListItem;
                }();
                var ListProto = {
                    append: function(model) {
                        var item = new ListItem(this.template, model, this);
                        mask.render(item, model, null, this.container, this);
                    }
                };
                var EachProto = {
                    refresh: function(array, method, args, result) {
                        var i = 0, x, imax;
                        if (null == method) {
                            if (null != this.components) for (i = 0, imax = this.components.length; i < imax; i++) {
                                x = this.components[i];
                                if (compo_dispose(x, this)) {
                                    i--;
                                    imax--;
                                }
                            }
                            this.components = [];
                            this.nodes = list_prepairNodes(this, array);
                            dom_insertBefore(compo_render(this, this.nodes), this.placeholder);
                            arr_each(this.components, compo_inserted);
                            return;
                        }
                        for (imax = array.length; i < imax; i++) {
                            x = array[i];
                            switch (typeof x) {
                              case "string":
                              case "number":
                              case "boolean":
                                array[i] = Object(x);
                            }
                        }
                        switch (method) {
                          case "push":
                            list_update(this, null, null, array.length, array.slice(array.length - 1));
                            break;

                          case "pop":
                            list_update(this, array.length, 1);
                            break;

                          case "unshift":
                            list_update(this, null, null, 0, array.slice(0, 1));
                            break;

                          case "shift":
                            list_update(this, 0, 1);
                            break;

                          case "splice":
                            var sliceStart = args[0], sliceRemove = 1 === args.length ? this.components.length : args[1], sliceAdded = args.length > 2 ? array.slice(args[0], args.length - 2 + args[0]) : null;
                            list_update(this, sliceStart, sliceRemove, sliceStart, sliceAdded);
                            break;

                          case "sort":
                          case "reverse":
                            list_sort(this, array);
                            break;

                          case "remove":
                            if (null != result && result.length) list_remove(this, result);
                        }
                    },
                    dispose: function() {
                        expression_unbind(this.expr, this.model, this, this.refresh);
                    }
                };
                return function attr_each(self, model, cntx, container) {
                    if (null == self.nodes && "undefined" !== typeof Compo) Compo.ensureTemplate(self);
                    var expr = self.attr.each || self.attr.foreach, current = expression_eval(expr, model, cntx, self);
                    obj_extend(self, {
                        expr: expr,
                        binder: expression_createBinder(expr, model, cntx, self, EachProto.refresh.bind(self)),
                        template: self.nodes,
                        container: container,
                        placeholder: document.createComment(""),
                        dispose: EachProto.dispose
                    });
                    container.appendChild(self.placeholder);
                    expression_bind(self.expr, model, cntx, self, self.binder);
                    for (var method in ListProto) self[method] = ListProto[method];
                    self.nodes = list_prepairNodes(self, current);
                };
            }();
            var attr_visible = function() {
                var VisibleProto = {
                    refresh: function() {
                        if (true === this.refreshing) return;
                        this.refreshing = true;
                        var visible = expression_eval(this.expr, this.model, this.cntx, this);
                        for (var i = 0, imax = this.elements.length; i < imax; i++) this.elements[i].style.display = visible ? "" : "none";
                        this.refreshing = false;
                    },
                    dispose: function() {
                        expression_unbind(this.expr, this.model, this, this.binder);
                    }
                };
                return function(self, model, cntx) {
                    var expr = self.attr.visible;
                    obj_extend(self, {
                        expr: expr,
                        binder: expression_createBinder(expr, model, cntx, self, VisibleProto.refresh.bind(self)),
                        dispose: VisibleProto.dispose
                    });
                    expression_bind(expr, model, cntx, self, self.binder);
                    VisibleProto.refresh.call(self);
                };
            }();
            Sys.prototype = {
                constructor: Sys,
                elements: null,
                renderStart: function(model, cntx, container) {
                    var attr = this.attr;
                    if (null != attr["debugger"]) {
                        debugger;
                        return;
                    }
                    if (null != attr["use"]) {
                        attr_use(this, model, cntx, container);
                        return;
                    }
                    if (null != attr["log"]) {
                        attr_log(this, model, cntx, container);
                        return;
                    }
                    this.model = model;
                    if (null != attr["if"]) {
                        attr_if(this, model, cntx, container);
                        return;
                    }
                    if (null != attr["else"]) {
                        attr_else(this, model, cntx, container);
                        return;
                    }
                    if (null != attr["each"] || null != attr["foreach"]) attr_each(this, model, cntx, container);
                },
                render: null,
                renderEnd: function(elements) {
                    this.elements = elements;
                    if (null != this.attr["visible"]) attr_visible(this, this.model, this.cntx);
                }
            };
        }(mask);
        !function() {
            var custom_Statements = mask.getStatement();
            var _getNodes, _renderElements, _renderPlaceholder, _compo_initAndBind, els_toggle;
            !function() {
                _getNodes = function(name, node, model, ctx, controller) {
                    return custom_Statements[name].getNodes(node, model, ctx, controller);
                };
                _renderElements = function(nodes, model, ctx, container, controller, children) {
                    if (null == nodes) return null;
                    var elements = [];
                    builder_build(nodes, model, ctx, container, controller, elements);
                    if (null == children) return elements;
                    arr_pushMany(children, elements);
                    return elements;
                };
                _renderPlaceholder = function(compo, container) {
                    compo.placeholder = document.createComment("");
                    container.appendChild(compo.placeholder);
                };
                _compo_initAndBind = function(compo, node, model, ctx, container, controller) {
                    compo.parent = controller;
                    compo.model = model;
                    compo.refresh = fn_proxy(compo.refresh, compo);
                    compo.binder = expression_createBinder(compo.expr, model, ctx, controller, compo.refresh);
                    expression_bind(compo.expr, model, ctx, controller, compo.binder);
                };
                els_toggle = function(els, state) {
                    if (null == els) return;
                    var isArray = "function" === typeof els.splice, imax = isArray ? els.length : 1, i = -1, x;
                    while (++i < imax) {
                        x = isArray ? els[i] : els;
                        x.style.display = state ? "" : "none";
                    }
                };
            }();
            !function() {
                mask.registerHandler("+if", {
                    $meta: {
                        serializeNodes: true
                    },
                    render: function(model, ctx, container, controller, children) {
                        var node = this, nodes = _getNodes("if", node, model, ctx, controller), index = 0;
                        var next = node;
                        while (true) {
                            if (next.nodes === nodes) break;
                            index++;
                            next = node.nextSibling;
                            if (null == next || "else" !== next.tagName) {
                                index = null;
                                break;
                            }
                        }
                        this.attr["switch-index"] = index;
                        return _renderElements(nodes, model, ctx, container, controller, children);
                    },
                    renderEnd: function(els, model, ctx, container, controller) {
                        var compo = new IFStatement(), index = this.attr["switch-index"];
                        compo.placeholder = document.createComment("");
                        container.appendChild(compo.placeholder);
                        initialize(compo, this, index, els, model, ctx, container, controller);
                        return compo;
                    },
                    serializeNodes: function(current) {
                        var nodes = [ current ];
                        while (true) {
                            current = current.nextSibling;
                            if (null == current || "else" !== current.tagName) break;
                            nodes.push(current);
                        }
                        return mask.stringify(nodes);
                    }
                });
                function IFStatement() {}
                IFStatement.prototype = {
                    compoName: "+if",
                    ctx: null,
                    model: null,
                    controller: null,
                    index: null,
                    Switch: null,
                    binder: null,
                    refresh: function() {
                        var compo = this, switch_ = compo.Switch, imax = switch_.length, i = -1, expr, item, index = 0;
                        var currentIndex = compo.index, model = compo.model, ctx = compo.ctx, ctr = compo.controller;
                        while (++i < imax) {
                            expr = switch_[i].node.expression;
                            if (null == expr) break;
                            if (expression_eval(expr, model, ctx, ctr)) break;
                        }
                        if (currentIndex === i) return;
                        if (null != currentIndex) els_toggle(switch_[currentIndex].elements, false);
                        if (i === imax) {
                            compo.index = null;
                            return;
                        }
                        this.index = i;
                        var current = switch_[i];
                        if (null != current.elements) {
                            els_toggle(current.elements, true);
                            return;
                        }
                        var frag = mask.render(current.node.nodes, model, ctx, null, ctr);
                        var els = frag.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? _Array_slice.call(frag.childNodes) : frag;
                        dom_insertBefore(frag, compo.placeholder);
                        current.elements = els;
                    },
                    dispose: function() {
                        var switch_ = this.Switch, imax = switch_.length, i = -1, x, expr;
                        while (++i < imax) {
                            x = switch_[i];
                            expr = x.node.expression;
                            if (expr) expression_unbind(expr, this.model, this.controller, this.binder);
                            x.node = null;
                            x.elements = null;
                        }
                        this.controller = null;
                        this.model = null;
                        this.ctx = null;
                    }
                };
                function initialize(compo, node, index, elements, model, ctx, container, controller) {
                    compo.model = model;
                    compo.ctx = ctx;
                    compo.controller = controller;
                    compo.refresh = fn_proxy(compo.refresh, compo);
                    compo.binder = expression_createListener(compo.refresh);
                    compo.index = index;
                    compo.Switch = [ {
                        node: node,
                        elements: null
                    } ];
                    expression_bind(node.expression, model, ctx, controller, compo.binder);
                    while (true) {
                        node = node.nextSibling;
                        if (null == node || "else" !== node.tagName) break;
                        compo.Switch.push({
                            node: node,
                            elements: null
                        });
                        if (node.expression) expression_bind(node.expression, model, ctx, controller, compo.binder);
                    }
                    if (null != index) compo.Switch[index].elements = elements;
                }
            }();
            !function() {
                var $Switch = custom_Statements["switch"], attr_SWITCH = "switch-index";
                var _nodes, _index;
                mask.registerHandler("+switch", {
                    $meta: {
                        serializeNodes: true
                    },
                    serializeNodes: function(current) {
                        return mask.stringify(current);
                    },
                    render: function(model, ctx, container, ctr, children) {
                        var value = expression_eval(this.expression, model, ctx, ctr);
                        resolveNodes(value, this.nodes, model, ctx, ctr);
                        if (null == _nodes) return null;
                        this.attr[attr_SWITCH] = _index;
                        return _renderElements(_nodes, model, ctx, container, ctr, children);
                    },
                    renderEnd: function(els, model, ctx, container, ctr) {
                        var compo = new SwitchStatement(), index = this.attr[attr_SWITCH];
                        _renderPlaceholder(compo, container);
                        initialize(compo, this, index, els, model, ctx, container, ctr);
                        return compo;
                    }
                });
                function SwitchStatement() {}
                SwitchStatement.prototype = {
                    compoName: "+switch",
                    ctx: null,
                    model: null,
                    controller: null,
                    index: null,
                    nodes: null,
                    Switch: null,
                    binder: null,
                    refresh: function(value) {
                        var compo = this, switch_ = compo.Switch, imax = switch_.length, i = -1, expr, item, index = 0;
                        var currentIndex = compo.index, model = compo.model, ctx = compo.ctx, ctr = compo.controller;
                        resolveNodes(value, compo.nodes, model, ctx, ctr);
                        if (_index === currentIndex) return;
                        if (null != currentIndex) els_toggle(switch_[currentIndex], false);
                        if (null == _index) {
                            compo.index = null;
                            return;
                        }
                        this.index = _index;
                        var elements = switch_[_index];
                        if (null != elements) {
                            els_toggle(elements, true);
                            return;
                        }
                        var frag = mask.render(_nodes, model, ctx, null, ctr);
                        var els = frag.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? _Array_slice.call(frag.childNodes) : frag;
                        dom_insertBefore(frag, compo.placeholder);
                        switch_[_index] = els;
                    },
                    dispose: function() {
                        expression_unbind(this.expr, this.model, this.controller, this.binder);
                        this.controller = null;
                        this.model = null;
                        this.ctx = null;
                        var switch_ = this.Switch, key, els, i, imax;
                        for (key in switch_) {
                            els = switch_[key];
                            if (null == els) continue;
                            imax = els.length;
                            i = -1;
                            while (++i < imax) if (null != els[i].parentNode) els[i].parentNode.removeChild(els[i]);
                        }
                    }
                };
                function resolveNodes(val, nodes, model, ctx, ctr) {
                    _nodes = $Switch.getNodes(val, nodes, model, ctx, ctr);
                    _index = null;
                    if (null == _nodes) return;
                    var imax = nodes.length, i = -1;
                    while (++i < imax) if (nodes[i].nodes === _nodes) break;
                    _index = i === imax ? null : i;
                }
                function initialize(compo, node, index, elements, model, ctx, container, ctr) {
                    compo.ctx = ctx;
                    compo.expr = node.expression;
                    compo.model = model;
                    compo.controller = ctr;
                    compo.index = index;
                    compo.nodes = node.nodes;
                    compo.refresh = fn_proxy(compo.refresh, compo);
                    compo.binder = expression_createBinder(compo.expr, model, ctx, ctr, compo.refresh);
                    compo.Switch = new Array(node.nodes.length);
                    if (null != index) compo.Switch[index] = elements;
                    expression_bind(node.expression, model, ctx, ctr, compo.binder);
                }
            }();
            !function() {
                var $With = custom_Statements["with"];
                mask.registerHandler("+with", {
                    $meta: {
                        serializeNodes: true
                    },
                    render: function(model, ctx, container, ctr, childs) {
                        var val = expression_eval(this.expression, model, ctx, ctr);
                        return build(this.nodes, val, ctx, container, ctr);
                    },
                    renderEnd: function(els, model, ctx, container, ctr) {
                        var compo = new WithStatement(this);
                        compo.elements = els;
                        compo.model = model;
                        compo.parent = ctr;
                        compo.refresh = fn_proxy(compo.refresh, compo);
                        compo.binder = expression_createBinder(compo.expr, model, ctx, ctr, compo.refresh);
                        expression_bind(compo.expr, model, ctx, ctr, compo.binder);
                        _renderPlaceholder(compo, container);
                        return compo;
                    }
                });
                function WithStatement(node) {
                    this.expr = node.expression;
                    this.nodes = node.nodes;
                }
                WithStatement.prototype = {
                    compoName: "+with",
                    elements: null,
                    binder: null,
                    model: null,
                    parent: null,
                    refresh: function(val) {
                        dom_removeAll(this.elements);
                        if (this.components) {
                            var imax = this.components.length, i = -1;
                            while (++i < imax) Compo.dispose(this.components[i]);
                            this.components.length = 0;
                        }
                        var fragment = document.createDocumentFragment();
                        this.elements = build(this.nodes, val, null, fragment, this);
                        dom_insertBefore(fragment, this.placeholder);
                        compo_inserted(this);
                    },
                    dispose: function() {
                        expression_unbind(this.expr, this.model, this.parent, this.binder);
                        this.parent = null;
                        this.model = null;
                        this.ctx = null;
                    }
                };
                function build(nodes, model, ctx, container, controller) {
                    var els = [];
                    builder_build(nodes, model, ctx, container, controller, els);
                    return els;
                }
            }();
            !function() {
                function arr_createRefs(array) {
                    var imax = array.length, i = -1, x;
                    while (++i < imax) {
                        x = array[i];
                        switch (typeof x) {
                          case "string":
                          case "number":
                          case "boolean":
                            array[i] = Object(x);
                        }
                    }
                }
                function list_sort(self, array) {
                    var compos = self.node.components, i = 0, imax = compos.length, j = 0, jmax = null, element = null, compo = null, fragment = document.createDocumentFragment(), sorted = [];
                    for (;i < imax; i++) {
                        compo = compos[i];
                        if (null == compo.elements || 0 === compo.elements.length) continue;
                        for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
                            element = compo.elements[j];
                            element.parentNode.removeChild(element);
                        }
                    }
                    outer: for (j = 0, jmax = array.length; j < jmax; j++) {
                        for (i = 0; i < imax; i++) if (array[j] === self._getModel(compos[i])) {
                            sorted[j] = compos[i];
                            continue outer;
                        }
                        console.warn("No Model Found for", array[j]);
                    }
                    for (i = 0, imax = sorted.length; i < imax; i++) {
                        compo = sorted[i];
                        if (null == compo.elements || 0 === compo.elements.length) continue;
                        for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
                            element = compo.elements[j];
                            fragment.appendChild(element);
                        }
                    }
                    self.components = self.node.components = sorted;
                    dom_insertBefore(fragment, self.placeholder);
                }
                function list_update(self, deleteIndex, deleteCount, insertIndex, rangeModel) {
                    var node = self.node, compos = node.components;
                    if (null == compos) compos = node.components = [];
                    var prop1 = self.prop1, prop2 = self.prop2, type = self.type, ctx = self.ctx, ctr = self.node;
                    if (null != deleteIndex && null != deleteCount) {
                        var i = deleteIndex, length = deleteIndex + deleteCount;
                        if (length > compos.length) length = compos.length;
                        for (;i < length; i++) if (compo_dispose(compos[i], node)) {
                            i--;
                            length--;
                        }
                    }
                    if (null != insertIndex && rangeModel && rangeModel.length) {
                        var i = compos.length, imax, fragment = self._build(node, rangeModel, ctx, ctr), new_ = compos.splice(i);
                        compo_fragmentInsert(node, insertIndex, fragment, self.placeholder);
                        compos.splice.apply(compos, [ insertIndex, 0 ].concat(new_));
                        i = 0;
                        imax = new_.length;
                        for (;i < imax; i++) __Compo.signal.emitIn(new_[i], "domInsert");
                    }
                }
                function list_remove(self, removed) {
                    var compos = self.components, i = compos.length, x;
                    while (--i > -1) {
                        x = compos[i];
                        if (removed.indexOf(x.model) === -1) continue;
                        compo_dispose(x, self.node);
                    }
                }
                var LoopStatementProto = {
                    model: null,
                    parent: null,
                    refresh: function(value, method, args, result) {
                        var i = 0, x, imax;
                        var node = this.node, model = this.model, ctx = this.ctx, ctr = this.node;
                        if (null == method) {
                            var compos = node.components;
                            if (null != compos) {
                                var imax = compos.length, i = -1;
                                while (++i < imax) if (compo_dispose(compos[i], node)) {
                                    i--;
                                    imax--;
                                }
                                compos.length = 0;
                            }
                            var frag = this._build(node, value, ctx, ctr);
                            dom_insertBefore(frag, this.placeholder);
                            arr_each(node.components, compo_inserted);
                            return;
                        }
                        var array = value;
                        arr_createRefs(value);
                        switch (method) {
                          case "push":
                            list_update(this, null, null, array.length - 1, array.slice(array.length - 1));
                            break;

                          case "pop":
                            list_update(this, array.length, 1);
                            break;

                          case "unshift":
                            list_update(this, null, null, 0, array.slice(0, 1));
                            break;

                          case "shift":
                            list_update(this, 0, 1);
                            break;

                          case "splice":
                            var sliceStart = args[0], sliceRemove = 1 === args.length ? this.components.length : args[1], sliceAdded = args.length > 2 ? array.slice(args[0], args.length - 2 + args[0]) : null;
                            list_update(this, sliceStart, sliceRemove, sliceStart, sliceAdded);
                            break;

                          case "sort":
                          case "reverse":
                            list_sort(this, array);
                            break;

                          case "remove":
                            if (null != result && result.length) list_remove(this, result);
                        }
                    },
                    dispose: function() {
                        expression_unbind(this.expr, this.model, this.parent, this.binder);
                    }
                };
                !function() {
                    var For = custom_Statements["for"], attr_PROP_1 = "for-prop-1", attr_PROP_2 = "for-prop-2", attr_TYPE = "for-type", attr_EXPR = "for-expr";
                    mask.registerHandler("+for", {
                        $meta: {
                            serializeNodes: true
                        },
                        serializeNodes: function(node) {
                            return mask.stringify(node);
                        },
                        render: function(model, ctx, container, controller, childs) {
                            var directive = For.parseFor(this.expression), attr = this.attr;
                            attr[attr_PROP_1] = directive[0];
                            attr[attr_PROP_2] = directive[1];
                            attr[attr_TYPE] = directive[2];
                            attr[attr_EXPR] = directive[3];
                            var value = expression_eval(directive[3], model, ctx, controller);
                            if (null == value) return;
                            if (arr_isArray(value)) arr_createRefs(value);
                            For.build(value, directive, this.nodes, model, ctx, container, this, childs);
                        },
                        renderEnd: function(els, model, ctx, container, controller) {
                            var compo = new ForStatement(this, this.attr);
                            compo.placeholder = document.createComment("");
                            container.appendChild(compo.placeholder);
                            _compo_initAndBind(compo, this, model, ctx, container, controller);
                            return compo;
                        },
                        getHandler: function(name, model) {
                            return For.getHandler(name, model);
                        }
                    });
                    function initialize(compo, node, els, model, ctx, container, controller) {
                        compo.parent = controller;
                        compo.model = model;
                        compo.refresh = fn_proxy(compo.refresh, compo);
                        compo.binder = expression_createBinder(compo.expr, model, ctx, controller, compo.refresh);
                        expression_bind(compo.expr, model, ctx, controller, compo.binder);
                    }
                    function ForStatement(node, attr) {
                        this.prop1 = attr[attr_PROP_1];
                        this.prop2 = attr[attr_PROP_2];
                        this.type = attr[attr_TYPE];
                        this.expr = attr[attr_EXPR];
                        if (null == node.components) node.components = [];
                        this.node = node;
                        this.components = node.components;
                    }
                    ForStatement.prototype = {
                        compoName: "+for",
                        model: null,
                        parent: null,
                        refresh: LoopStatementProto.refresh,
                        dispose: LoopStatementProto.dispose,
                        _getModel: function(compo) {
                            return compo.scope[this.prop1];
                        },
                        _build: function(node, model, ctx, component) {
                            var nodes = For.getNodes(node.nodes, model, this.prop1, this.prop2, this.type);
                            return builder_build(nodes, model, ctx, null, component);
                        }
                    };
                }();
                !function() {
                    var Each = custom_Statements["each"];
                    mask.registerHandler("+each", {
                        render: function(model, ctx, container, controller, children) {
                            var node = this;
                            var array = expression_eval(node.expression, model, ctx, controller);
                            if (null == array) return;
                            arr_createRefs(array);
                            build(node.nodes, array, ctx, container, node, children);
                        },
                        renderEnd: function(els, model, ctx, container, controller) {
                            var compo = new EachStatement(this, this.attr);
                            compo.placeholder = document.createComment("");
                            container.appendChild(compo.placeholder);
                            _compo_initAndBind(compo, this, model, ctx, container, controller);
                            return compo;
                        }
                    });
                    function build(nodes, array, ctx, container, controller, elements) {
                        var imax = array.length, i = -1, itemCtr;
                        while (++i < imax) {
                            itemCtr = Each.createItem(i, nodes, controller);
                            builder_build(itemCtr, array[i], ctx, container, controller, elements);
                        }
                    }
                    function EachStatement(node, attr) {
                        this.expr = node.expression;
                        this.nodes = node.nodes;
                        if (null == node.components) node.components = [];
                        this.node = node;
                        this.components = node.components;
                    }
                    EachStatement.prototype = {
                        compoName: "+each",
                        refresh: LoopStatementProto.refresh,
                        dispose: LoopStatementProto.dispose,
                        _getModel: function(compo) {
                            return compo.model;
                        },
                        _build: function(node, model, ctx, component) {
                            var fragment = document.createDocumentFragment();
                            build(node.nodes, model, ctx, fragment, component);
                            return fragment;
                        }
                    };
                }();
            }();
        }();
    }(Mask, Compo);
    Mask.Compo = Compo;
    Mask.jmask = jmask;
    return exports.mask = Mask;
});

include.getResource("/.reference/atma/mask/lib/mask.js", "js").readystatechanged(3);

include.setCurrent({
    id: "/.reference/atma/mask-node/lib/mask.bootstrap.js",
    namespace: "",
    url: "/.reference/atma/mask-node/lib/mask.bootstrap.js"
});

!function() {
    var atma = "undefined" === typeof atma ? window : atma;
    var mask = atma.mask, Compo = mask.Compo;
    Dom = mask.Dom;
    var custom_Attributes = mask.getAttrHandler(), custom_Tags = mask.getHandler(), custom_Utils = mask.getUtil();
    var __models, __ID = 0;
    function fn_isFunction(fn) {
        return "function" === typeof fn;
    }
    function fn_empty() {
        return false;
    }
    function arr_isArray(array) {
        return null != array && "number" === typeof array.length && "function" === typeof array.splice;
    }
    Meta = function() {
        var seperator_CODE = 30, seperator_CHAR = String.fromCharCode(seperator_CODE);
        function val_stringify(mix) {
            if ("string" !== typeof mix) return val_stringify(JSON.stringify(mix));
            return mix;
        }
        var parser_Index, parser_Length, parser_String;
        var tag_OPEN = "<!--", tag_CLOSE = "-->";
        function parse_ID(json) {
            if ("#" !== parser_String[parser_Index]) return;
            parser_Index++;
            var end = parser_String.indexOf(seperator_CHAR);
            if (end === -1) end = parser_String.length;
            json.ID = parseInt(parser_String.substring(parser_Index, end), 10);
            parser_Index = end;
        }
        function parse_property(json) {
            if (parser_Index > parser_Length - 5) return false;
            if (parser_String[parser_Index++] !== seperator_CHAR || " " !== parser_String[parser_Index++]) {
                parser_Index = -1;
                return false;
            }
            var index = parser_Index, str = parser_String;
            var colon = str.indexOf(":", index), key = str.substring(index, colon);
            var end = str.indexOf(seperator_CHAR + " ", colon), value = str.substring(colon + 1, end);
            if ("attr" === key) value = JSON.parse(value);
            json[key] = value;
            parser_Index = end;
            return true;
        }
        return {
            stringify: function(json, info) {
                switch (info.mode) {
                  case "server":
                  case "server:all":
                    return "";
                }
                var type = info.type, isSingle = info.single, string = tag_OPEN + type;
                if (json.ID) string += "#" + json.ID;
                string += seperator_CHAR + " ";
                for (var key in json) {
                    if ("ID" === key) continue;
                    if (null == json[key]) continue;
                    string += key + ":" + val_stringify(json[key]) + seperator_CHAR + " ";
                }
                if (isSingle) string += "/";
                string += tag_CLOSE;
                return string;
            },
            close: function(json, info) {
                switch (info.mode) {
                  case "server":
                  case "server:all":
                    return "";
                }
                return tag_OPEN + "/" + info.type + (json.ID ? "#" + json.ID : "") + tag_CLOSE;
            },
            parse: function(string) {
                parser_Index = 0;
                parser_String = string;
                parser_Length = string.length;
                var json = {}, c = string[parser_Index];
                if ("/" === c) {
                    json.end = true;
                    parser_Index++;
                }
                json.type = string[parser_Index++];
                parse_ID(json);
                while (parse_property(json)) ;
                if (parser_Index === -1) return {};
                if ("/" === string[parser_Length - 1]) json.single = true;
                return json;
            }
        };
    }();
    var model_parse;
    !function() {
        model_parse = function(str) {
            return Class.parse(str);
        };
    }();
    function mock_appendChild(container) {
        return function(element) {
            return container.appendChild(element);
        };
    }
    function mock_Container(container, elements) {
        this.container = container;
        this.elements = elements;
    }
    mock_Container.prototype = {
        _after: function() {
            return this.elements[this.elements.length - 1] || this.container;
        },
        _before: function() {
            return this.elements[0] || this.container;
        },
        appendChild: function(child) {
            var last = this._after();
            if (last.nextSibling) {
                last.parentNode.insertBefore(child, last.nextSibling);
                return;
            }
            last.parentNode.appendChild(child);
        }
    };
    function trav_getElements(meta) {
        if (meta.isDocument) return Array.prototype.slice.call(document.body.childNodes);
        var id = "mask-htmltemplate-" + meta.ID, startNode = document.getElementById(id), endNode = document.getElementsByName(id)[0];
        if (null == startNode || null == endNode) {
            console.error("Invalid node range to initialize mask components");
            return null;
        }
        var array = [], node = startNode.nextSibling;
        while (null != node && node != endNode) {
            array.push(node);
            node = node.nextSibling;
        }
        return array;
    }
    function trav_getElement(node) {
        var next = node.nextSibling;
        while (next && next.nodeType !== Node.ELEMENT_NODE) next = next.nextSibling;
        return next;
    }
    function trav_getMeta(node) {
        while (node && node.nodeType !== Node.COMMENT_NODE) node = node.nextSibling;
        return node;
    }
    function setup(node, model, cntx, container, controller, childs) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            if (null != childs) childs.push(node);
            if (node.firstChild) setup(node.firstChild, model, cntx, node, controller);
            if (null == childs && node.nextSibling) setup(node.nextSibling, model, cntx, container, controller);
            return node;
        }
        if (node.nodeType !== Node.COMMENT_NODE) {
            if (null == childs && node.nextSibling) setup(node.nextSibling, model, cntx, container, controller);
            return node;
        }
        var metaContent = node.textContent;
        if ("/m" === metaContent) return;
        if ("~" === metaContent) {
            setup(node.nextSibling, model, cntx, node.previousSibling, controller);
            return;
        }
        if ("/~" === metaContent) {
            setup(node.nextSibling, model, cntx, node.parentNode, controller);
            return;
        }
        var meta = Meta.parse(metaContent);
        if (meta.modelID) model = __models[meta.modelID];
        if ("a" === meta.type) {
            var handler = custom_Attributes[meta.name], element = trav_getElement(node);
            if (null == handler) {
                console.warn("Custom Attribute Handler was not defined", meta.name);
                return;
            }
            if (null == element) {
                console.error("Browser has cut off nested tag for the comment", node);
                return;
            }
            handler(null, meta.value, model, cntx, element, controller, container);
        }
        if ("u" === meta.type) {
            var handler = custom_Utils[meta.utilName];
            var element = trav_getElement(node);
            if (null == handler) {
                console.log("Custom Utility Handler was not defined", meta.name);
                return;
            }
            if ("function" === typeof handler) handler(meta.value, model, cntx, element, controller, meta.attrName, meta.utilType); else if (handler.process) if ("partial" === handler.mode) {
                var fnStart = meta.utilType + "RenderStart";
                fn = meta.utilType;
                handler[fnStart](meta.value, model, cntx, element, controller);
                handler.element = element;
                handler[fn](meta.value, model, cntx, element, controller, meta.attrName);
            } else handler.process(meta.value, model, cntx, element, controller, meta.attrName, meta.utilType);
        }
        if ("t" === meta.type) {
            if (__ID < meta.ID) __ID = meta.ID;
            var compoName = meta.compoName, Handler = compoName ? custom_Tags[meta.compoName] : {};
            var maskNode;
            if (meta.nodes) {
                maskNode = mask.parse(meta.nodes);
                if (maskNode.type === mask.Dom.FRAGMENT) maskNode = maskNode.nodes[0];
            }
            if (null == Handler) {
                if (controller.getHandler) Handler = controller.getHandler(compoName);
                if (null == Handler) {
                    console.error("Component is not loaded for client reder - ", compoName);
                    Handler = function() {};
                }
            }
            if (null != meta.mask) {
                var _node = {
                    type: Dom.COMPONENT,
                    tagName: compoName,
                    attr: meta.attr,
                    nodes: meta.mask ? mask.parse(meta.mask) : null,
                    controller: Handler,
                    expression: meta.expression
                };
                var fragment = document.createDocumentFragment(), container = node.parentNode, originalAppender = container.appendChild;
                container.appendChild = mock_appendChild(fragment);
                mask.render(_node, model, cntx, container, controller);
                container.insertBefore(fragment, node);
                container.appendChild = originalAppender;
            } else {
                var compo, isStatic;
                if ("function" === typeof Handler) compo = new Handler(model);
                if (null == compo && Handler.__Ctor) {
                    compo = new Handler.__Ctor(maskNode, controller);
                    isStatic = true;
                }
                if (null == compo) compo = Handler;
                compo.compoName = compoName;
                compo.attr = meta.attr;
                compo.parent = controller;
                compo.ID = meta.ID;
                compo.expression = meta.expression;
                compo.model = model;
                if (null == controller.components) controller.components = [];
                if (true !== isStatic) controller.components.push(compo);
                if (compo.onRenderStartClient) {
                    compo.onRenderStartClient(model, cntx, container, controller);
                    model = compo.model;
                }
                if (false !== meta.single) {
                    var elements = [], textContent;
                    node = node.nextSibling;
                    while (null != node) {
                        if (node.nodeType === Node.COMMENT_NODE) {
                            textContent = node.textContent;
                            if (textContent === "/t#" + meta.ID) break;
                            if ("~" === textContent) {
                                container = node.previousSibling;
                                node = node.nextSibling;
                                continue;
                            }
                            if ("/~" === textContent) {
                                container = container.parentNode;
                                node = node.nextSibling;
                                continue;
                            }
                        }
                        var endRef = setup(node, model, cntx, container, compo, elements);
                        if (null == endRef) throw new Error("Unexpected end of the reference");
                        node = endRef.nextSibling;
                    }
                }
                if (fn_isFunction(compo.renderEnd)) {
                    var _container = container;
                    if (isStatic) _container = new mock_Container(container, elements);
                    compo = compo.renderEnd(elements, model, cntx, _container, controller);
                    if (isStatic && null != compo) controller.components.push(compo);
                }
                if (null != childs && childs !== elements) {
                    var il = childs.length, jl = elements.length;
                    j = -1;
                    while (++j < jl) childs[il + j] = elements[j];
                }
            }
            if (null != childs) return node;
        }
        if (node && node.nextSibling) setup(node.nextSibling, model, cntx, container, controller);
        return node;
    }
    function bootstrap(container, compo) {
        if (null == container) container = document.body;
        if (null == compo) compo = {};
        var metaNode = trav_getMeta(container.firstChild), metaContent = metaNode && metaNode.textContent, meta = metaContent && Meta.parse(metaContent);
        if (null == meta || "m" !== meta.type) {
            console.error("Meta Inforamtion not defined", container);
            return;
        }
        if (null != meta.ID) mask.setCompoIndex(__ID = meta.ID);
        __models = model_parse(meta.model);
        var model = compo.model = __models.m1, el = metaNode.nextSibling;
        setup(el, model, {}, el.parentNode, compo);
        Compo.signal.emitIn(compo, "domInsert");
    }
    mask.Compo.bootstrap = bootstrap;
}();

include.getResource("/.reference/atma/mask-node/lib/mask.bootstrap.js", "js").readystatechanged(3);

include.setCurrent({
    id: "/.reference/atma/ruta/lib/ruta.js",
    namespace: "",
    url: "/.reference/atma/ruta/lib/ruta.js"
});

!function(root, factory) {
    if (null == root) root = "undefined" !== typeof window && "undefined" !== typeof document ? window : global;
    root.ruta = factory(root);
}(this, function(global) {
    var mask = global.mask || Mask;
    var _cfg_isStrict = true, _Array_slice = Array.prototype.slice;
    var log_error;
    !function() {
        log_error = function() {
            var args = _Array_slice.call(arguments);
            console.error.apply(console, [ "Ruta" ].concat(args));
        };
    }();
    var path_normalize, path_split, path_join, path_fromCLI;
    !function() {
        path_normalize = function(str) {
            var length = str.length, i = 0, j = length - 1;
            for (;i < length; i++) {
                if ("/" === str[i]) continue;
                break;
            }
            for (;j > i; j--) {
                if ("/" === str[j]) continue;
                break;
            }
            return str.substring(i, j + 1);
        };
        path_split = function(path) {
            path = path_normalize(path);
            return "" === path ? [] : path.split("/");
        };
        path_join = function(pathParts) {
            return "/" + pathParts.join("/");
        };
        path_fromCLI = function(commands) {
            if ("string" === typeof commands) commands = cli_split(commands);
            var parts = cli_parseArguments(commands);
            return parts_serialize(parts);
        };
        function cli_split(string) {
            var args = string.trim().split(/\s+/);
            var imax = args.length, i = -1, c, arg;
            while (++i < imax) {
                arg = args[i];
                if (0 === arg.length) continue;
                c = arg[0];
                if ('"' !== c && "'" !== c) continue;
                var start = i;
                for (;i < imax; i++) {
                    arg = args[i];
                    if (arg[arg.length - 1] === c) {
                        var str = args.splice(start, i - start + 1).join(" ").slice(1, -1);
                        args.splice(start, 0, str);
                        imax = args.length;
                        break;
                    }
                }
            }
            return args;
        }
        function cli_parseArguments(argv) {
            var imax = argv.length, i = 0, params = {}, args = [], key, val, x;
            for (;i < imax; i++) {
                x = argv[i];
                if ("-" === x[0]) {
                    key = x.replace(/^[\-]+/, "");
                    if (i < imax - 1 && "-" !== argv[i + 1][0]) {
                        val = argv[i + 1];
                        i++;
                    } else val = true;
                    params[key] = val;
                    continue;
                }
                args.push(x);
            }
            return {
                path: args,
                query: params
            };
        }
    }();
    var query_deserialize, query_serialize;
    !function() {
        query_deserialize = function(query, delimiter) {
            null == delimiter && (delimiter = "/");
            var obj = {}, parts = query.split(delimiter), i = 0, imax = parts.length, x, val;
            for (;i < imax; i++) {
                x = parts[i].split("=");
                val = null == x[1] ? "" : decode(x[1]);
                obj_setProperty(obj, x[0], val);
            }
            return obj;
        };
        query_serialize = function(params, delimiter) {
            null == delimiter && (delimiter = "/");
            var query = "", key, val;
            for (key in params) {
                val = params[key];
                if (null == val) continue;
                if ("boolean" === typeof val) val = null;
                query = query + (query ? delimiter : "") + key;
                if (null != val) query += "=" + encode(val);
            }
            return query;
        };
        function obj_setProperty(obj, property, value) {
            var chain = property.split("."), imax = chain.length, i = -1, key;
            while (++i < imax - 1) {
                key = chain[i];
                if (null == obj[key]) obj[key] = {};
                obj = obj[key];
            }
            obj[chain[i]] = value;
        }
        function decode(str) {
            try {
                return decodeURIComponent(str);
            } catch (error) {
                log_error("decode:URI malformed");
                return "";
            }
        }
        function encode(str) {
            try {
                return encodeURIComponent(str);
            } catch (error) {
                log_error("encode:URI malformed");
                return "";
            }
        }
    }();
    var rgx_fromString, rgx_aliasMatcher, rgx_parsePartWithRegExpAlias;
    !function() {
        rgx_fromString = function(str, flags) {
            return new RegExp(str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), flags);
        };
        rgx_aliasMatcher = function(str) {
            if ("^" === str[0]) return new RegExp(str);
            var groups = str.split("|");
            for (var i = 0, imax = groups.length; i < imax; i++) groups[i] = "^" + groups[i] + "$";
            return new RegExp(groups.join("|"));
        };
        rgx_parsePartWithRegExpAlias = function(str) {
            var pStart = str.indexOf("("), pEnd = str.lastIndexOf(")");
            if (pStart === -1 || pEnd === -1) {
                log_error("Expected alias part with regexp", str);
                return null;
            }
            var rgx = str.substring(pStart + 1, pEnd);
            return {
                alias: str.substring(1, pStart),
                matcher: rgx_aliasMatcher(rgx)
            };
        };
    }();
    var parts_serialize, parts_deserialize;
    !function() {
        parts_serialize = function(parts) {
            var path = path_join(parts.path);
            if (null == parts.query) return path;
            return path + "?" + query_serialize(parts.query, "&");
        };
        parts_deserialize = function(url) {
            var query = url.indexOf("?"), path = query === -1 ? url : url.substring(0, query);
            return {
                path: path_split(path),
                query: query === -1 ? null : query_deserialize(url.substring(query + 1), "&")
            };
        };
    }();
    var Routes = function() {
        var route_parseDefinition, route_parsePath;
        !function() {
            route_parseDefinition = function(route, definition) {
                var c = definition.charCodeAt(0);
                switch (c) {
                  case 33:
                    route.strict = true;
                    definition = definition.substring(1);
                    break;

                  case 94:
                    route.strict = false;
                    definition = definition.substring(1);
                    break;

                  case 40:
                    var start = 1, end = definition.length - 1;
                    if (41 !== definition.charCodeAt(definition.length - 1)) {
                        log_error("parser - expect group closing");
                        end++;
                    }
                    route.match = new RegExp(definition.substring(start, end));
                    return;
                }
                var parts = definition.split("/"), search, searchIndex, i = 0, imax = parts.length, x, c0, index, c1;
                var last = parts[imax - 1];
                searchIndex = last.indexOf("?");
                if (searchIndex > (1 === imax ? -1 : 0)) {
                    search = last.substring(searchIndex + 1);
                    parts[imax - 1] = last.substring(0, searchIndex);
                }
                var matcher = "", alias = null, strictCount = 0;
                var gettingMatcher = true, isOptional, isAlias, rgx;
                var array = route.path = [];
                for (;i < imax; i++) {
                    x = parts[i];
                    if ("" === x) continue;
                    c0 = x.charCodeAt(0);
                    c1 = x.charCodeAt(1);
                    isOptional = 63 === c0;
                    isAlias = 58 === (isOptional ? c1 : c0);
                    index = 0;
                    if (isOptional) index++;
                    if (isAlias) index++;
                    if (0 !== index) x = x.substring(index);
                    !isOptional && !gettingMatcher && console.log("<ruta> strict part found after optional", definition);
                    if (isOptional) gettingMatcher = false;
                    var bracketIndex = x.indexOf("(");
                    if (isAlias && bracketIndex !== -1) {
                        var end = x.length - 1;
                        if (")" !== x[end]) end += 1;
                        rgx = new RegExp(rgx_aliasMatcher(x.substring(bracketIndex + 1, end)));
                        x = x.substring(0, bracketIndex);
                    }
                    if (!isOptional && !isAlias) {
                        array.push(x);
                        continue;
                    }
                    if (isAlias) array.push({
                        alias: x,
                        matcher: rgx,
                        optional: isOptional
                    });
                }
                if (search) {
                    var query = route.query = {};
                    parts = search.split("&");
                    i = -1;
                    imax = parts.length;
                    var key, value, str, eqIndex;
                    while (++i < imax) {
                        str = parts[i];
                        eqIndex = str.indexOf("=");
                        if (eqIndex === -1) {
                            query[str] = "";
                            continue;
                        }
                        key = str.substring(0, eqIndex);
                        value = str.substring(eqIndex + 1);
                        if (40 === value.charCodeAt(0)) value = new RegExp(rgx_aliasMatcher(value));
                        query[key] = value;
                    }
                    if (0 === route.path.length) route.strict = false;
                }
            };
            route_parsePath = function(route, path) {
                var queryIndex = path.indexOf("?"), query = queryIndex === -1 ? null : path.substring(queryIndex + 1), current = {
                    path: path,
                    params: null == query ? {} : query_deserialize(query, "&")
                };
                if (route.query) for (var key in route.query) {
                    if ("?" === key[0]) key = key.substring(1);
                    if (":" === key[0]) {
                        var alias = rgx_parsePartWithRegExpAlias(key), name = alias.alias;
                        current.params[name] = getAliasedValue(current.params, alias.matcher);
                    }
                }
                if (queryIndex !== -1) path = path.substring(0, queryIndex);
                if (null != route.path) {
                    var pathArr = path_split(path), routePath = route.path, routeLength = routePath.length, imax = pathArr.length, i = 0, part, x;
                    for (;i < imax; i++) {
                        part = pathArr[i];
                        x = i < routeLength ? routePath[i] : null;
                        if (x) {
                            if ("string" === typeof x) continue;
                            if (x.alias) {
                                current.params[x.alias] = part;
                                continue;
                            }
                        }
                    }
                }
                return current;
            };
            function getAliasedValue(obj, matcher) {
                for (var key in obj) if (matcher.test(key)) return obj[key];
            }
        }();
        var route_match, route_isMatch;
        !function() {
            route_match = function(url, routes, currentMethod) {
                var parts = parts_deserialize(url);
                for (var i = 0, route, imax = routes.length; i < imax; i++) {
                    route = routes[i];
                    if (route_isMatch(parts, route, currentMethod)) {
                        route.current = route_parsePath(route, url);
                        return route;
                    }
                }
                return null;
            };
            route_isMatch = function(parts, route, currentMethod) {
                if (null != currentMethod && null != route.method && route.method !== currentMethod) return false;
                if (route.match) return route.match.test("string" === typeof parts ? parts : parts_serialize(parts));
                if ("string" === typeof parts) parts = parts_deserialize(parts);
                if (route.query) {
                    var query = parts.query, key, value;
                    if (null == query) return false;
                    for (key in route.query) {
                        value = route.query[key];
                        var c = key[0];
                        if (":" === c) {
                            var alias = rgx_parsePartWithRegExpAlias(key);
                            if (null == alias || false === hasKey(query, alias.matcher)) return false;
                            continue;
                        }
                        if ("?" === c) continue;
                        if ("string" === typeof value) {
                            if (null == query[key]) return false;
                            if (value && query[key] !== value) return false;
                            continue;
                        }
                        if (value.test && !value.test(query[key])) return false;
                    }
                }
                var routePath = route.path, routeLength = routePath.length;
                if (0 === routeLength) {
                    if (route.strict) return 0 === parts.path.length;
                    return true;
                }
                for (var i = 0, x, imax = parts.path.length; i < imax; i++) {
                    x = routePath[i];
                    if (i >= routeLength) return true !== route.strict;
                    if ("string" === typeof x) {
                        if (parts.path[i] === x) continue;
                        return false;
                    }
                    if (x.matcher && false === x.matcher.test(parts.path[i])) return false;
                    if (x.optional) return true;
                    if (x.alias) continue;
                    return false;
                }
                if (i < routeLength) return true === routePath[i].optional;
                return true;
            };
            function hasKey(obj, rgx) {
                for (var key in obj) if (rgx.test(key)) return true;
                return false;
            }
        }();
        var regexp_var = "([^\\\\]+)";
        function Route(definition, value) {
            this.method = 36 === definition.charCodeAt(0) ? definition.substring(1, definition.indexOf(" ")).toUpperCase() : null;
            if (null != this.method) definition = definition.substring(this.method.length + 2);
            this.strict = _cfg_isStrict;
            this.value = value;
            this.definition = definition;
            route_parseDefinition(this, definition);
        }
        Route.prototype = {
            path: null,
            query: null,
            value: null,
            current: null
        };
        function RouteCollection() {
            this.routes = [];
        }
        RouteCollection.prototype = {
            add: function(regpath, value) {
                this.routes.push(new Route(regpath, value));
                return this;
            },
            get: function(path, currentMethod) {
                return route_match(path, this.routes, currentMethod);
            },
            clear: function() {
                this.routes.length = 0;
                return this;
            }
        };
        RouteCollection.parse = function(definition, path) {
            var route = {};
            route_parseDefinition(route, definition);
            return route_parsePath(route, path);
        };
        return RouteCollection;
    }();
    var Location = function() {
        if ("undefined" === typeof window) return function() {};
        function HashEmitter(listener) {
            if ("undefined" === typeof window || "onhashchange" in window === false) return null;
            var that = this;
            that.listener = listener;
            window.onhashchange = function() {
                that.changed(location.hash);
            };
            return that;
        }
        !function() {
            function hash_normalize(hash) {
                return hash.replace(/^[!#/]+/, "/");
            }
            HashEmitter.prototype = {
                navigate: function(hash) {
                    if (null == hash) {
                        this.changed(location.hash);
                        return;
                    }
                    location.hash = hash;
                },
                changed: function(hash) {
                    this.listener.changed(hash_normalize(hash));
                },
                current: function() {
                    return hash_normalize(location.hash);
                }
            };
        }();
        function HistoryEmitter(listener) {
            if ("undefined" === typeof window) return null;
            if (!(window.history && window.history.pushState)) return null;
            var that = this;
            that.listener = listener;
            that.initial = location.pathname;
            window.onpopstate = function() {
                if (that.initial === location.pathname) {
                    that.initial = null;
                    return;
                }
                that.changed();
            };
            return that;
        }
        !function() {
            HistoryEmitter.prototype = {
                navigate: function(url) {
                    if (null == url) {
                        this.changed();
                        return;
                    }
                    history.pushState({}, null, url);
                    this.changed();
                },
                changed: function() {
                    this.listener.changed(location.pathname + location.search);
                },
                current: function() {
                    return location.pathname + location.search;
                }
            };
        }();
        function Location(collection, type) {
            this.collection = collection || new Routes();
            if (type) {
                var Constructor = "hash" === type ? HashEmitter : HistoryEmitter;
                this.emitter = new Constructor(this);
            }
            if (null == this.emitter) this.emitter = new HistoryEmitter(this);
            if (null == this.emitter) this.emitter = new HashEmitter(this);
            if (null == this.emitter) log_error("Router can not be initialized - (nor HistoryAPI / nor hashchange");
        }
        Location.prototype = {
            changed: function(path) {
                var item = this.collection.get(path);
                if (item) this.action(item);
            },
            action: function(route) {
                if ("function" === typeof route.value) route.value(route);
            },
            navigate: function(url) {
                this.emitter.navigate(url);
            },
            current: function() {
                var path = this.emitter.current();
                return this.collection.get(path);
            }
        };
        return Location;
    }();
    var routes = new Routes(), router;
    function router_ensure() {
        if (null == router) router = new Location(routes);
        return router;
    }
    var Ruta = {
        Collection: Routes,
        setRouterType: function(type) {
            if (null == router) router = new Location(routes, type);
            return this;
        },
        setStrictBehaviour: function(isStrict) {
            _cfg_isStrict = isStrict;
        },
        add: function(regpath, mix) {
            router_ensure();
            return routes.add(regpath, mix);
        },
        get: function(path) {
            return routes.get(path);
        },
        navigate: function(path) {
            router_ensure().navigate(path);
        },
        current: function() {
            return router_ensure().current();
        },
        parse: Routes.parse,
        $utils: {
            pathFromCLI: path_fromCLI
        }
    };
    !function() {
        mask.registerAttrHandler("x-dynamic", function(node, value, model, cntx, tag) {
            tag.onclick = navigate;
        }, "client");
        function navigate(event) {
            event.preventDefault();
            event.stopPropagation();
            Ruta.navigate(this.href);
        }
    }();
    return Ruta;
});

include.getResource("/.reference/atma/ruta/lib/ruta.js", "js").readystatechanged(3);

include.setCurrent({
    id: "/.reference/atma/mask-animation/lib/mask.animation.js",
    namespace: "",
    url: "/.reference/atma/mask-animation/lib/mask.animation.js"
});

!function(root, factory) {
    if (null == root && "undefined" !== typeof global) root = global;
    var construct = function() {
        return factory(root, root.mask);
    };
    if ("object" === typeof exports) module.exports = construct(); else if ("function" === typeof define && define.amd) define(construct); else {
        var Lib = construct();
        for (var key in Lib) root.mask[key] = Lib[key];
    }
}(this, function(global, mask) {
    var style = document.createElement("div").style, prfx = function() {
        if ("transform" in style) return "";
        if ("webkitTransform" in style) return "webkit";
        if ("MozTransform" in style) return "Moz";
        if ("OTransform" in style) return "O";
        if ("msTransform" in style) return "ms";
        return "";
    }(), supportTransitions = function() {
        var array = [ "transition", "webkitTransition", "MozTransition", "OTransition", "msTransition" ];
        for (var i = 0, x, imax = array.length; i < imax; i++) if (array[i] in style) return true;
        return false;
    }(), vendorPrfx = prfx ? "-" + prfx.toLowerCase() + "-" : "", getTransitionEndEvent = function() {
        var el = document.createElement("div"), transitions = {
            transition: "transitionend",
            OTransition: "oTransitionEnd",
            msTransition: "msTransitionEnd",
            MozTransition: "transitionend",
            WebkitTransition: "webkitTransitionEnd"
        }, event = null;
        for (var t in transitions) if (void 0 !== style[t]) {
            event = transitions[t];
            break;
        }
        getTransitionEndEvent = function() {
            return event;
        };
        return getTransitionEndEvent();
    }, I = {
        prop: vendorPrfx + "transition-property",
        duration: vendorPrfx + "transition-duration",
        timing: vendorPrfx + "transition-timing-function",
        delay: vendorPrfx + "transition-delay"
    };
    var env_isMoz = "MozTransition" in style, env_isMs = "msTransition" in style;
    function arr_isArray(arr) {
        return arr instanceof Array;
    }
    function fn_isFunction(fn) {
        return "function" === typeof fn;
    }
    function fn_proxy(ctx, fn) {
        return function() {
            switch (arguments.length) {
              case 0:
                return fn.call(ctx);

              case 1:
                return fn.call(ctx, arguments[0]);

              case 2:
                return fn.call(ctx, arguments[1]);

              default:
                return fn.apply(ctx, arguments);
            }
        };
    }
    var TransformModel = function() {
        var regexp = /([\w]+)\([^\)]+\)/g;
        function extract(str) {
            var props = null;
            regexp.lastIndex = 0;
            while (1) {
                var match = regexp.exec(str);
                if (!match) return props;
                (props || (props = {}))[match[1]] = match[0];
            }
        }
        function stringify(props) {
            var keys = Object.keys(props).sort().reverse();
            for (var i = 0; i < keys.length; i++) keys[i] = props[keys[i]];
            return keys.join(" ");
        }
        function TransformModel() {
            this.transforms = {};
        }
        TransformModel.prototype = {
            constructor: TransformModel,
            handle: function(data) {
                var start = extract(data.from), end = extract(data.to), prop = null;
                if (start) {
                    for (prop in this.transforms) if (prop in start === false) start[prop] = this.transforms[prop];
                    data.from = stringify(start);
                    for (prop in start) this.transforms[prop] = start[prop];
                }
                for (prop in this.transforms) if (prop in end === false) end[prop] = this.transforms[prop];
                data.to = stringify(end);
                for (prop in end) this.transforms[prop] = end[prop];
            }
        };
        return TransformModel;
    }();
    var ModelData = function() {
        var vendorProperties = {
            transform: null
        };
        function parse(model) {
            var arr = model.split(/ *\| */g), data = {}, length = arr.length;
            data.prop = arr[0] in vendorProperties ? vendorPrfx + arr[0] : arr[0];
            var vals = arr[1].split(/ *> */);
            if (vals[0]) data.from = vals[0];
            data.to = vals[vals.length - 1];
            if (length > 2) {
                var info = /(\d+m?s)?\s*([a-z]+[^\s]*)?\s*(\d+m?s)?/.exec(arr[2]);
                if (null != info) {
                    data.duration = info[1] || "200ms";
                    data.timing = info[2] || "linear";
                    data.delay = info[3] || "0";
                    return data;
                }
            }
            data.duration = "200ms";
            data.timing = "linear";
            data.delay = "0";
            return data;
        }
        function ModelData(data, parent) {
            this.parent = parent;
            this.transformModel = parent && parent.transformModel || new TransformModel();
            var model = data.model || data;
            if (arr_isArray(model)) {
                this.model = [];
                for (var i = 0, length = model.length; i < length; i++) this.model.push(new ModelData(model[i], this));
            } else if (model instanceof Object) {
                if (model === data) {
                    console.error('Animation Object Model has no "model" property', data);
                    this.modelCount = this.nextCount = this.state = 0;
                    return;
                }
                this.model = [ new ModelData(model, this) ];
            } else if ("string" === typeof model) {
                this.model = parse(model);
                if (~this.model.prop.indexOf("transform")) this.transformModel.handle(this.model);
            }
            if (null != data.next) this.next = new ModelData(data.next, this);
            this.state = 0;
            this.nextCount = 0;
            this.modelCount = arr_isArray(this.model) ? this.model.length : 1;
            if (null != this.next) this.nextCount = arr_isArray(this.next) ? this.next.length : 1;
        }
        function model_resetMany(model) {
            var isarray = arr_isArray(model), length = isarray ? model.length : 1, x = null, i = 0;
            for (;isarray ? i < length : i < 1; i++) {
                x = isarray ? model[i] : model;
                x.reset && x.reset();
            }
        }
        function time_fromString(str) {
            if (!str) return 0;
            if (str.indexOf("ms") !== -1) return parseInt(str);
            if (str.indexOf("s")) return 1e3 * parseFloat(str);
            console.warn("<mask:animation> parsing time", str);
            return 0;
        }
        function model_getDuration(model) {
            var isarray = arr_isArray(model), length = isarray ? model.length : 1, x = null, i = 0, max = 0;
            for (;isarray ? i < length : i < 1; i++) {
                x = isarray ? model[i] : model;
                var ms;
                if (fn_isFunction(x.getDuration)) ms = x.getDuration(); else ms = time_fromString(model.duration) + time_fromString(model.delay);
                if (ms > max) max = ms;
            }
            return max;
        }
        function model_getFinalCss(model, css) {
            if (null == model) return;
            var isarray = arr_isArray(model), length = isarray ? model.length : 1, x = null, i = 0;
            for (;isarray ? i < length : i < 1; i++) {
                x = isarray ? model[i] : model;
                if (fn_isFunction(x.getFinalCss)) {
                    x.getFinalCss(css);
                    continue;
                }
                css[x.prop] = x.to;
            }
        }
        ModelData.prototype = {
            constructor: ModelData,
            reset: function() {
                this.state = 0;
                this.nextCount = 0;
                this.modelCount = arr_isArray(this.model) ? this.model.length : 1;
                if (null != this.next) this.nextCount = arr_isArray(this.next) ? this.next.length : 1;
                this.model && model_resetMany(this.model);
                this.next && model_resetMany(this.next);
            },
            getNext: function() {
                if (0 === this.state) {
                    this.state = 1;
                    return this;
                }
                if (1 === this.state && this.modelCount > 0) --this.modelCount;
                if (1 === this.state && 0 === this.modelCount) {
                    this.state = 2;
                    if (this.next) return this.next;
                }
                if (2 === this.state && this.nextCount > 0) --this.nextCount;
                if (2 === this.state && 0 === this.nextCount && this.parent) return this.parent.getNext && this.parent.getNext();
                return null;
            },
            getDuration: function() {
                var ms = 0;
                if (this.model) ms += model_getDuration(this.model);
                if (this.next) ms += model_getDuration(this.next);
                return ms;
            },
            getFinalCss: function(css) {
                if (null == css) css = {};
                model_getFinalCss(this.model, css);
                model_getFinalCss(this.next, css);
                return css;
            }
        };
        return ModelData;
    }();
    var Stack = function() {
        function Stack() {
            this.arr = [];
        }
        Stack.prototype = {
            constructor: Stack,
            put: function(modelData) {
                if (null == modelData) return false;
                var next = modelData.getNext(), result = false, length, i;
                if (null == next) return false;
                if (arr_isArray(next)) {
                    for (i = 0, length = next.length; i < length; i++) if (true === this.put(next[i])) result = true;
                    return result;
                }
                if (0 === next.state) next.state = 1;
                if (next.model instanceof Array) {
                    result = false;
                    for (i = 0, length = next.model.length; i < length; i++) if (true === this.put(next.model[i])) result = true;
                    return result;
                }
                this.resolve(next.model.prop);
                this.arr.push(next);
                return true;
            },
            resolve: function(prop) {
                for (var i = 0, x, length = this.arr.length; i < length; i++) {
                    x = this.arr[i];
                    if (x.model.prop === prop) {
                        this.arr.splice(i, 1);
                        return this.put(x);
                    }
                }
                return false;
            },
            getCss: function(startCss, css) {
                var i, length, key, x;
                for (i = 0, length = this.arr.length; i < length; i++) {
                    x = this.arr[i];
                    if ("from" in x.model) startCss[x.model.prop] = x.model.from;
                    css[x.model.prop] = x.model.to;
                    for (key in I) (css[I[key]] || (css[I[key]] = [])).push(x.model[key]);
                }
                for (key in I) css[I[key]] = css[I[key]].join(",");
            },
            clear: function() {
                this.arr.length = 0;
            }
        };
        return Stack;
    }();
    var Model = function() {
        var transitionNames = [ "WebKitTransitionEvent", "mozTransitionEvent", "oTransitionEvent", "TransitionEvent" ];
        var TransitionEvent, TransitionEventName;
        for (var i = 0; i < transitionNames.length; i++) if (transitionNames[i] in window) {
            TransitionEventName = transitionNames[i];
            TransitionEvent = window[TransitionEventName];
            break;
        }
        if (null == TransitionEventName) TransitionEventName = "TransitionEvent";
        var ImmediateCss = {
            display: 1,
            "font-family": 1,
            visibility: 1
        };
        try {
            new TransitionEvent(getTransitionEndEvent(), {
                propertyName: "opacity",
                bubbles: true,
                cancelable: true
            });
        } catch (e) {
            TransitionEvent = function(eventName, data) {
                var event = document.createEvent(TransitionEventName), fn = "init" + TransitionEventName[0].toUpperCase() + TransitionEventName.substring(1);
                event[fn](getTransitionEndEvent(), true, true, data.propertyName, 0);
                return event;
            };
        }
        function Model(models) {
            this.stack = new Stack();
            this.model = new ModelData(models);
            this.duration = this.model.getDuration();
            this.transitionEnd = fn_proxy(this, this.transitionEnd);
            this.finish = fn_proxy(this, this.finish);
            this.finishTimeout = null;
        }
        Model.prototype = {
            constructor: Model,
            start: function(element, onComplete) {
                this.element = element;
                if (false === supportTransitions) {
                    this.apply(this.model.getFinalCss());
                    onComplete && onComplete();
                    return;
                }
                element.addEventListener(getTransitionEndEvent(), this.transitionEnd, false);
                var startCss = {}, css = {};
                this.onComplete = onComplete;
                this.model.reset();
                this.stack.clear();
                this.stack.put(this.model);
                this.stack.getCss(startCss, css);
                this.apply(startCss, css);
                this.finishTimeout = setTimeout(this.finish, this.duration);
            },
            pause: function() {
                this.element.style.setProperty(vendorPrfx + "transition", "none");
                this.element.removeEventListener(getTransitionEndEvent(), this.transitionEnd, false);
                if (this.finishTimeout) clearTimeout(this.finishTimeout);
            },
            finish: function() {
                this.element.removeEventListener(getTransitionEndEvent(), this.transitionEnd, false);
                if (fn_isFunction(this.onComplete)) this.onComplete();
            },
            transitionEnd: function(event) {
                if (event.target !== event.currentTarget) return;
                if (true === this.stack.resolve(event.propertyName)) {
                    var startCss = {}, css = {};
                    this.stack.getCss(startCss, css);
                    this.apply(startCss, css);
                    return;
                }
            },
            apply: function(startCss, css) {
                startCss[vendorPrfx + "transition"] = "none";
                var style = this.element.style, element = this.element;
                if (null != startCss) for (var key in startCss) style.setProperty(key, startCss[key], "");
                if (env_isMoz || env_isMs) getComputedStyle(element).width;
                setTimeout(function() {
                    var fire;
                    for (var key in css) {
                        style.setProperty(key, css[key], "");
                        if (ImmediateCss.hasOwnProperty(key)) (fire || (fire = [])).push(key);
                    }
                    if (null == fire || null == TransitionEvent) return;
                    var eventName = getTransitionEndEvent();
                    for (var i = 0; i < fire.length; i++) {
                        var event = new TransitionEvent(eventName, {
                            propertyName: fire[i],
                            bubbles: true,
                            cancelable: true
                        });
                        element.dispatchEvent(event);
                    }
                }, 0);
            }
        };
        return Model;
    }();
    var Sprite = function() {
        var keyframes = {}, vendor = null, initVendorStrings = function() {
            vendor = {
                keyframes: "@" + vendorPrfx + "keyframes",
                AnimationIterationCount: prfx + "AnimationIterationCount",
                AnimationDuration: prfx + "AnimationDuration",
                AnimationTimingFunction: prfx + "AnimationTimingFunction",
                AnimationFillMode: prfx + "AnimationFillMode",
                AnimationName: prfx + "AnimationName"
            };
        };
        return {
            create: function(data) {
                if (null == vendor) initVendorStrings();
                if (null == keyframes[data.id]) {
                    var pos = document.styleSheets[0].insertRule(vendor.keyframes + " " + data.id + " {}", 0), keyFrameAnimation = document.styleSheets[0].cssRules[pos], frames = data.frames - (data.frameStart || 0), step = 100 / frames, property = data.property || "background-position-x";
                    for (var i = 0; i < frames; i++) {
                        var rule = step * (i + 1) + "% { " + property + ": " + -data.frameWidth * (i + (data.frameStart || 0)) + "px}";
                        keyFrameAnimation.insertRule(rule);
                    }
                    keyFrameAnimation.iterationCount = data.iterationCount;
                    keyFrameAnimation.frameToStop = data.frameToStop;
                    keyframes[data.id] = keyFrameAnimation;
                }
            },
            start: function(element, animationId, msperframe) {
                var style = element.style;
                style[vendor.AnimationName] = "none";
                setTimeout(function() {
                    var keyframe = keyframes[animationId];
                    if ("forwards" === style[vendor.AnimationFillMode]) {
                        Sprite.stop(element);
                        return;
                    }
                    element.addEventListener(vendor + "AnimationEnd", function() {
                        var css;
                        if (keyframe.frameToStop) {
                            var styles = keyframe.cssRules[keyframe.cssRules.length - 1].style;
                            css = {};
                            for (var i = 0; i < styles.length; i++) css[styles[i]] = styles[styles[i]];
                        }
                        Sprite.stop(element, css);
                    }, false);
                    style[vendor.AnimationIterationCount] = keyframe.iterationCount || 1;
                    style[vendor.AnimationDuration] = keyframe.cssRules.length * msperframe + "ms";
                    style[vendor.AnimationTimingFunction] = "step-start";
                    style[vendor.AnimationFillMode] = keyframe.frameToStop ? "forwards" : "none";
                    style[vendor.AnimationName] = animationId;
                }, 0);
            },
            stop: function(element, css) {
                var style = element.style;
                style[vendor.AnimationFillMode] = "none";
                style[vendor.AnimationName] = "";
                if (null != css) $(element).css(css);
            }
        };
    }();
    !function() {
        var Compo = global.Compo;
        if (null == Compo) {
            console.warn("To use :animation component, Compo should be defined");
            return;
        }
        function mask_toJSON(node) {
            if (null == node) return null;
            if (node instanceof Array) {
                if (1 === node.length) return mask_toJSON(node[0]);
                var nodes = node, Type = mask_getType(nodes), json = new Type();
                for (var i = 0, x, length = nodes.length; i < length; i++) {
                    x = nodes[i];
                    if (Type === Array) {
                        json.push(mask_toJSON(x));
                        continue;
                    }
                    if (Type === Object) json[mask_getTagName(x)] = mask_toJSON(x.nodes);
                }
                return json;
            }
            if (mask.Dom.TEXTNODE === node.type) return node.content;
            if (mask.Dom.FRAGMENT === node.type) return mask_toJSON(node.nodes);
            if (mask.Dom.NODE) {
                var result = {};
                result[mask_getTagName(node)] = mask_toJSON(node.nodes);
                return result;
            }
            return null;
        }
        function mask_getTagName(node) {
            var tagName = node.tagName;
            return 64 === tagName.charCodeAt(0) ? tagName.substring(1) : tagName;
        }
        function mask_getType(nodes) {
            var keys = {};
            for (var i = 0, x, length = nodes.length; i < length; i++) {
                x = nodes[i];
                switch (x.type) {
                  case mask.Dom.TEXTNODE:
                  case mask.Dom.FRAGMENT:
                    return Array;

                  case mask.Dom.NODE:
                    if (1 === keys[x.tagName]) return Array;
                    keys[x.tagName] = 1;
                }
            }
            return Object;
        }
        var state_READY = 1, state_ANIMATE = 2;
        function AnimationCompo() {}
        AnimationCompo.prototype = {
            constructor: AnimationCompo,
            state: state_READY,
            repeat: 1,
            step: 1,
            render: function(model, ctx, container) {
                if (null == this.nodes) {
                    console.warn("No Animation Model");
                    return;
                }
                var slots = this.attr["x-slots"], i, imax, x;
                if (null != slots) {
                    slots = slots.split(";");
                    this.slots = {};
                    for (i = 0, imax = slots.length; i < imax; i++) {
                        x = slots[i].trim();
                        this.slots[x] = this.start;
                    }
                }
                var pipes = this.attr["x-pipes"], dot, name;
                if (null != pipes) {
                    pipes = pipes.split(";");
                    this.pipes = {};
                    for (i = 0, imax = pipes.length; i < imax; i++) {
                        x = pipes[i].trim();
                        dot = x.indexOf(".");
                        if (dot === -1) {
                            console.error(":animation - pipeName.slotName : dot not found");
                            continue;
                        }
                        name = x.substring(0, dot);
                        (this.pipes[name] || (this.pipes[name] = {}))[x.substring(++dot)] = this.start;
                    }
                    Compo.pipe.addController(this);
                }
                this.model = new Model(mask_toJSON(this.nodes));
                this.container = container;
                if (this.attr["x-repeat"]) this.repeat = this.attr["x-repeat"] << 0 || 1/0;
            },
            start: function(callback, element) {
                if (this.state === state_ANIMATE) this.stop();
                this.element = element || this.container;
                this.state = state_ANIMATE;
                this.callback = callback;
                this.step = 1;
                this.model.start(this.element, fn_proxy(this, this.nextStep));
                return this;
            },
            stop: function() {
                if (this.callback) this.callback(this);
                this.model.pause();
                this.element = null;
                this.callback = null;
                this.state = state_READY;
            },
            nextStep: function() {
                if (++this.step > this.repeat) return this.stop();
                this.model.start(this.element, fn_proxy(this, this.nextStep));
            }
        };
        mask.registerHandler(":animation", AnimationCompo);
        Compo.prototype.animate = function(id, callback, element) {
            var animation = this.find("#" + id);
            if (null == animation) {
                console.warn("Animation is not found", id);
                callback && callback();
                return;
            }
            return animation.start(callback, element);
        };
    }();
    !function() {
        function SpriteHandler() {}
        mask.registerHandler(":animation:sprite", SpriteHandler);
        SpriteHandler.prototype = {
            constructor: SpriteHandler,
            render: function(model, cntx, element) {
                var attr = this.attr, src = attr.src, id = attr.id, frames = attr.frames, property = attr.property, width = attr.frameWidth, height = attr.frameHeight, iterationCount = attr.iterationCount, msperframe = attr.msperframe, delay = attr.delay;
                var style = (element.getAttribute("style") || "") + ";background: url(" + src + ") 0 0 no-repeat; width:" + width + "px; height:" + height + "px;";
                element.setAttribute("style", style);
                Sprite.create({
                    id: id,
                    frameWidth: width,
                    frames: frames,
                    property: property,
                    iterationCount: iterationCount,
                    delay: delay
                });
                if (attr.autostart) Sprite.start(element, id, msperframe);
            }
        };
    }();
    return {
        animate: function(element, model, onend) {
            new Model(model).start(element, onend);
        },
        sprite: Sprite
    };
});

include.getResource("/.reference/atma/mask-animation/lib/mask.animation.js", "js").readystatechanged(3);

include.setCurrent({
    id: "/.reference/atma/compos/prism/lib/prism.js",
    namespace: "",
    url: "/.reference/atma/compos/prism/lib/prism.js"
});

include.js("prism.lib.js::Prism").css("prism.lib.css").done(function(resp) {
    var Prism = resp.Prism || window.Prism;
    if ("undefined" !== typeof global) global.Prism = Prism;
    var PrismCompo = Compo({
        mode: "server:all",
        attr: {
            language: "javascript"
        },
        renderStart: function(model, ctx) {
            var _lang = this.attr.language, _class = "language-" + _lang, _code;
            if (null != this.attr.src) {
                var that = this;
                this.nodes = jmask("pre." + _class + " > code." + _class);
                _code = this.nodes.find("code");
                Compo.pause(this, ctx);
                var name = this.attr.src;
                Compo.resource(this).ajax(this.attr.src + "::" + name).done(function(resp) {
                    highlight(_code, resp.ajax[name], _lang);
                    Compo.resume(that, ctx);
                });
                return;
            }
            _code = jmask("pre." + _class + " > code." + _class).children().mask(this.nodes);
            this.nodes = _code.end();
            highlight(_code, str_trimTrailings(_code.text(model, ctx, this)), _lang);
        }
    });
    mask.registerHandler("prism", PrismCompo);
    mask.registerHandler(":prism", PrismCompo);
    function highlight($code, str, lang) {
        var langs = Prism.languages, grammar = langs[lang] || langs.javascript;
        str = str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        str = Prism.highlight(str, grammar);
        var $html = jmask(":html").text(str);
        $code.mask($html);
    }
    var _cache_Regexp = {};
    function str_trimTrailings(string) {
        var regexp_trailing = /^[\t ]*(?=[^\r\n\t ]+)/m, count, match;
        match = regexp_trailing.exec(string);
        if (!match) return string;
        count = match[0].length;
        if (0 === count) return string;
        if (null == _cache_Regexp[count]) _cache_Regexp[count] = new RegExp("^[\\t ]{1," + count + "}", "gm");
        return string.replace(_cache_Regexp[count], "");
    }
});

include.getResource("/.reference/atma/compos/prism/lib/prism.js", "js").readystatechanged(3);

include.setCurrent({
    id: "/.reference/atma/compos/prism/lib/prism.lib.js",
    namespace: "",
    url: "/.reference/atma/compos/prism/lib/prism.lib.js"
});

!function(root, factory) {
    var doc = "undefined" === typeof document ? null : document, construct = function() {
        return factory(root, doc);
    };
    if ("object" === typeof exports) module.exports = construct(); else if ("function" === typeof define && define.amd) define(construct); else root.Prism = construct();
}(this, function(self, document) {
    var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i, Prism, _;
    _ = Prism = {
        util: {
            type: function(o) {
                return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
            },
            clone: function(o) {
                var type = _.util.type(o);
                switch (type) {
                  case "Object":
                    var clone = {};
                    for (var key in o) if (o.hasOwnProperty(key)) clone[key] = _.util.clone(o[key]);
                    return clone;

                  case "Array":
                    return o.slice();
                }
                return o;
            }
        },
        languages: {
            extend: function(id, redef) {
                var lang = _.util.clone(_.languages[id]);
                for (var key in redef) lang[key] = redef[key];
                return lang;
            },
            insertBefore: function(inside, before, insert, root) {
                root = root || _.languages;
                var grammar = root[inside];
                var ret = {};
                for (var token in grammar) if (grammar.hasOwnProperty(token)) {
                    if (token == before) for (var newToken in insert) if (insert.hasOwnProperty(newToken)) ret[newToken] = insert[newToken];
                    ret[token] = grammar[token];
                }
                return root[inside] = ret;
            },
            DFS: function(o, callback) {
                for (var i in o) {
                    callback.call(o, i, o[i]);
                    if ("Object" === _.util.type(o)) _.languages.DFS(o[i], callback);
                }
            }
        },
        highlightAll: function(async, callback) {
            var elements = document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code');
            for (var i = 0, element; element = elements[i++]; ) _.highlightElement(element, true === async, callback);
        },
        highlightElement: function(element, async, callback) {
            var language, grammar, parent = element;
            while (parent && !lang.test(parent.className)) parent = parent.parentNode;
            if (parent) {
                language = (parent.className.match(lang) || [ , "" ])[1];
                grammar = _.languages[language];
            }
            if (!grammar) return;
            element.className = element.className.replace(lang, "").replace(/\s+/g, " ") + " language-" + language;
            parent = element.parentNode;
            if (/pre/i.test(parent.nodeName)) parent.className = parent.className.replace(lang, "").replace(/\s+/g, " ") + " language-" + language;
            var code = element.textContent;
            if (!code) return;
            code = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\u00a0/g, " ");
            var env = {
                element: element,
                language: language,
                grammar: grammar,
                code: code
            };
            _.hooks.run("before-highlight", env);
            if (async && self && self.Worker) {
                var worker = new Worker(_.filename);
                worker.onmessage = function(evt) {
                    env.highlightedCode = Token.stringify(JSON.parse(evt.data));
                    env.element.innerHTML = env.highlightedCode;
                    callback && callback.call(env.element);
                    _.hooks.run("after-highlight", env);
                };
                worker.postMessage(JSON.stringify({
                    language: env.language,
                    code: env.code
                }));
            } else {
                env.highlightedCode = _.highlight(env.code, env.grammar);
                env.element.innerHTML = env.highlightedCode;
                callback && callback.call(element);
                _.hooks.run("after-highlight", env);
            }
        },
        highlight: function(text, grammar) {
            return Token.stringify(_.tokenize(text, grammar));
        },
        tokenize: function(text, grammar) {
            var Token = _.Token;
            var strarr = [ text ];
            var rest = grammar.rest;
            if (rest) {
                for (var token in rest) grammar[token] = rest[token];
                delete grammar.rest;
            }
            tokenloop: for (var token in grammar) {
                if (!grammar.hasOwnProperty(token) || !grammar[token]) continue;
                var pattern = grammar[token], inside = pattern.inside, lookbehind = !!pattern.lookbehind || 0;
                pattern = pattern.pattern || pattern;
                for (var i = 0; i < strarr.length; i++) {
                    var str = strarr[i];
                    if (strarr.length > text.length) break tokenloop;
                    if (str instanceof Token) continue;
                    pattern.lastIndex = 0;
                    var match = pattern.exec(str);
                    if (match) {
                        if (lookbehind) lookbehind = match[1].length;
                        var from = match.index - 1 + lookbehind, match = match[0].slice(lookbehind), len = match.length, to = from + len, before = str.slice(0, from + 1), after = str.slice(to + 1);
                        var args = [ i, 1 ];
                        if (before) args.push(before);
                        var wrapped = new Token(token, inside ? _.tokenize(match, inside) : match);
                        args.push(wrapped);
                        if (after) args.push(after);
                        Array.prototype.splice.apply(strarr, args);
                    }
                }
            }
            return strarr;
        },
        hooks: {
            all: {},
            add: function(name, callback) {
                var hooks = _.hooks.all;
                hooks[name] = hooks[name] || [];
                hooks[name].push(callback);
            },
            run: function(name, env) {
                var callbacks = _.hooks.all[name];
                if (!callbacks || !callbacks.length) return;
                for (var i = 0, callback; callback = callbacks[i++]; ) callback(env);
            }
        }
    };
    var Token = _.Token = function(type, content) {
        this.type = type;
        this.content = content;
    };
    Token.stringify = function(o) {
        if ("string" == typeof o) return o;
        if ("[object Array]" == Object.prototype.toString.call(o)) return o.map(Token.stringify).join("");
        var env = {
            type: o.type,
            content: Token.stringify(o.content),
            tag: "span",
            classes: [ "token", o.type ],
            attributes: {}
        };
        if ("comment" == env.type) env.attributes["spellcheck"] = "true";
        _.hooks.run("wrap", env);
        var attributes = "";
        for (var name in env.attributes) attributes += name + '="' + (env.attributes[name] || "") + '"';
        return "<" + env.tag + ' class="' + env.classes.join(" ") + '" ' + attributes + ">" + env.content + "</" + env.tag + ">";
    };
    if (self && !self.document && self.addEventListener) {
        self.addEventListener("message", function(evt) {
            var message = JSON.parse(evt.data), lang = message.language, code = message.code;
            self.postMessage(JSON.stringify(_.tokenize(code, _.languages[lang])));
            self.close();
        }, false);
        return;
    }
    var script = document && document.getElementsByTagName("script") || [];
    script = script[script.length - 1];
    if (script) {
        _.filename = script.src;
        if (document.addEventListener && !script.hasAttribute("data-manual")) document.addEventListener("DOMContentLoaded", _.highlightAll);
    }
    Prism.languages.markup = {
        comment: /&lt;!--[\w\W]*?--(&gt;|&gt;)/g,
        prolog: /&lt;\?.+?\?&gt;/,
        doctype: /&lt;!DOCTYPE.+?&gt;/,
        cdata: /&lt;!\[CDATA\[[\w\W]*?]]&gt;/i,
        tag: {
            pattern: /&lt;\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|\w+))?\s*)*\/?&gt;/gi,
            inside: {
                tag: {
                    pattern: /^&lt;\/?[\w:-]+/i,
                    inside: {
                        punctuation: /^&lt;\/?/,
                        namespace: /^[\w-]+?:/
                    }
                },
                "attr-value": {
                    pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/gi,
                    inside: {
                        punctuation: /=|&gt;|"/g
                    }
                },
                punctuation: /\/?&gt;/g,
                "attr-name": {
                    pattern: /[\w:-]+/g,
                    inside: {
                        namespace: /^[\w-]+?:/
                    }
                }
            }
        },
        entity: /&amp;#?[\da-z]{1,8};/gi
    };
    Prism.hooks.add("wrap", function(env) {
        if ("entity" === env.type) env.attributes["title"] = env.content.replace(/&amp;/, "&");
    });
    Prism.languages.css = {
        comment: /\/\*[\w\W]*?\*\//g,
        atrule: /@[\w-]+?(\s+[^'\{]+)?(?=\s*{|\s*')/gi,
        url: /url\((["']?).*?\1\)/gi,
        selector: /[^\{\}\s][^\{\}]*(?=\s*\{)/g,
        property: /(\b|\B)[a-z-]+(?=\s*:)/gi,
        string: /("|')(\\?.)*?\1/g,
        important: /\B!important\b/gi,
        ignore: /&(lt|gt|amp);/gi,
        punctuation: /[\{\};:]/g
    };
    if (Prism.languages.markup) Prism.languages.insertBefore("markup", "tag", {
        style: {
            pattern: /(&lt;|<)style[\w\W]*?(>|&gt;)[\w\W]*?(&lt;|<)\/style(>|&gt;)/gi,
            inside: {
                tag: {
                    pattern: /(&lt;|<)style[\w\W]*?(>|&gt;)|(&lt;|<)\/style(>|&gt;)/gi,
                    inside: Prism.languages.markup.tag.inside
                },
                rest: Prism.languages.css
            }
        }
    });
    Prism.languages.clike = {
        comment: {
            pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|\/\/.*?(\r?\n|$))/g,
            lookbehind: true
        },
        string: /("|')(\\?.)*?\1/g,
        keyword: /\b(if|else|while|do|for|return|in|instanceof|function|new|try|catch|finally|null|break|continue)\b/g,
        "boolean": /\b(true|false)\b/g,
        number: /\b-?(0x)?\d*\.?[\da-f]+\b/g,
        operator: /[-+]{1,2}|!|=?&lt;|=?&gt;|={1,2}|(&amp;){1,2}|\|?\||\?|\*|\//g,
        ignore: /&(lt|gt|amp);/gi,
        punctuation: /[{}[\];(),.:]/g
    };
    Prism.languages.javascript = Prism.languages.extend("clike", {
        keyword: /\b(var|let|if|else|while|do|for|return|in|instanceof|function|new|with|typeof|try|catch|finally|null|break|continue)\b/g,
        number: /\b(-?(0x)?\d*\.?[\da-f]+|NaN|-?Infinity)\b/g
    });
    Prism.languages.insertBefore("javascript", "keyword", {
        regex: {
            pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,
            lookbehind: true
        }
    });
    if (Prism.languages.markup) Prism.languages.insertBefore("markup", "tag", {
        script: {
            pattern: /(&lt;|<)script[\w\W]*?(>|&gt;)[\w\W]*?(&lt;|<)\/script(>|&gt;)/gi,
            inside: {
                tag: {
                    pattern: /(&lt;|<)script[\w\W]*?(>|&gt;)|(&lt;|<)\/script(>|&gt;)/gi,
                    inside: Prism.languages.markup.tag.inside
                },
                rest: Prism.languages.javascript
            }
        }
    });
    Prism.languages.mask = {
        comment: {
            pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|\/\/.*?(\r?\n|$))/g,
            lookbehind: true
        },
        string: {
            pattern: /(^\s*|[>;{}'"]\s*)("|')(\\?.)*?\2/g,
            lookbehind: true,
            inside: {
                interpolation: {
                    pattern: /~\[[^\]]+\]/g,
                    inside: {
                        expression: {
                            pattern: /(~\[\w*:)([^\]]+)/i,
                            lookbehind: true,
                            inside: {
                                rest: Prism.languages.javascript
                            }
                        }
                    }
                }
            }
        },
        punctuation: /[\{\};>]|(&gt;)/g,
        node: {
            pattern: /[^\s][^{;>]+/gi,
            inside: {
                interpolation: {
                    pattern: /~\[[^\]]+\]/g,
                    inside: {
                        expression: {
                            pattern: /(~\[\w*:)([^\]]+)/i,
                            lookbehind: true,
                            inside: {
                                rest: Prism.languages.javascript
                            }
                        }
                    }
                },
                compo: {
                    pattern: /^[^\s\w\.#][\w\d:-]*/i
                },
                tag: {
                    pattern: /^[\w\d:-]+/i
                },
                "attr-value": {
                    pattern: /(=\s*\w+)|(("|')(\\?.)*?\3)/gi,
                    inside: {
                        punctuation: /=|&gt;|"/g
                    }
                },
                "class": {
                    pattern: /\.[\w\d-_]+/gi
                },
                id: {
                    pattern: /#[\w\d-_]+/gi
                },
                punctuation: /=/g,
                "attr-name": {
                    pattern: /[\w:-]+/g,
                    inside: {
                        namespace: /^[\w-]+?:/
                    }
                }
            }
        },
        ignore: /&(lt|gt|amp);/gi
    };
    if (Prism.languages.markup) Prism.languages.insertBefore("markup", "script", {
        mask: {
            pattern: /(&lt;|<)script type='text\/mask'[\w\W]*?(>|&gt;)[\w\W]*?(&lt;|<)\/script(>|&gt;)/gi,
            inside: {
                tag: {
                    pattern: /(&lt;|<)script[\w\W]*?(>|&gt;)|(&lt;|<)\/script(>|&gt;)/gi,
                    inside: Prism.languages.markup.tag.inside
                },
                rest: Prism.languages.mask
            }
        }
    });
    !function() {
        var url = /\b([a-z]{3,7}:\/\/|tel:)[\w-+%~/.]+/, email = /\b\S+@[\w.]+[a-z]{2}/, linkMd = /\[([^\]]+)]\(([^)]+)\)/, candidates = [ "comment", "url", "attr-value", "string" ];
        for (var language in Prism.languages) {
            var tokens = Prism.languages[language];
            Prism.languages.DFS(tokens, function(type, def) {
                if (candidates.indexOf(type) > -1) {
                    if (!def.pattern) def = this[type] = {
                        pattern: def
                    };
                    def.inside = def.inside || {};
                    if ("comment" == type) def.inside["md-link"] = linkMd;
                    def.inside["url-link"] = url;
                    def.inside["email-link"] = email;
                }
            });
            tokens["url-link"] = url;
            tokens["email-link"] = email;
        }
        Prism.hooks.add("wrap", function(env) {
            if (/-link$/.test(env.type)) {
                env.tag = "a";
                var href = env.content;
                if ("email-link" == env.type) href = "mailto:" + href; else if ("md-link" == env.type) {
                    var match = env.content.match(linkMd);
                    href = match[2];
                    env.content = match[1];
                }
                var attr = "href";
                if (0 == href.indexOf("name=")) {
                    attr = "name";
                    href = href.substring("name=".length);
                }
                env.attributes[attr] = href;
            }
        });
    }();
    return Prism;
});

include.getResource("/.reference/atma/compos/prism/lib/prism.lib.js", "js").readystatechanged(3);

include.setCurrent({
    id: "/.reference/atma/compos/tabs/lib/tabs.js",
    namespace: "",
    url: "/.reference/atma/compos/tabs/lib/tabs.js"
});

include.css("tabs.css");

!function() {
    function child_resolve(child) {
        if (child.type === mask.Dom.NODE) return child;
        if (child.controller && child.controller.prototype.tagName) return child;
        var $col = jmask(), $children = jmask(child).children(), imax = $children.length, i = 0;
        for (;i < imax; i++) $col.add(child_resolve($children[i]));
        return $col;
    }
    function route_current(route, path) {
        var query = path.indexOf("?");
        if (query !== -1) path = path.substring(0, query);
        var _parts = route.split("/"), _length = _parts.length, _default = _parts[_length - 1], _path = path.split("/");
        if (_length > _path.length) return "-" !== _default ? _default : null;
        var i = _length - 1;
        while (--i > -1) {
            if ("-" === _parts[i]) break;
            if (_parts[i] !== _path[i]) return null;
        }
        return _path[_length - 1];
    }
    mask.registerHandler(":tabs", mask.Compo({
        tagName: "div",
        attr: {
            "class": "-tabs"
        },
        _children: function($children) {
            var $coll = jmask();
            if (0 === $children.length) return $coll;
            for (var i = 0, x, imax = $children.length; i < imax; i++) $coll.add(child_resolve($children[i]));
            return $coll;
        },
        _items: function(type) {
            var klass = ".-tab-" + type;
            if (null == this.$) {
                var $children = jmask(this).children(klass).children();
                return this._children($children);
            }
            if (this.attr.anchors) return this.$.find(".-tab-panels:eq(0)").find("a[name]");
            return this.$.find(".-tab-" + type + "s:eq(0)").children(klass);
        },
        _getHeaders: function() {},
        slots: {
            domInsert: function() {
                if (!this.attr.scrollbar) return;
                if (!this.attr.visible) return;
                this.setActive(this.attr.visible);
            }
        },
        renderStart: function(model, cntx) {
            if (this.attr.anchors) this.attr.scrollbar = true;
            if (this.attr.scrollbar) this.attr["class"] += " scrollbar";
            if (this.attr["x-route"]) {
                var path = cntx.req && cntx.req.url;
                if (null == path && "undefined" !== typeof location) path = location.pathname;
                this.visible = route_current(this.attr["x-route"], path);
                this.attr["x-route"] = null;
                this.attr.visible = this.visible;
            }
            var $this = jmask(this), $panels = $this.children("@panels"), $header = $this.children("@header");
            $panels.tag("div").addClass("-tab-panels");
            $header.tag("div").addClass("-tab-headers");
            if (null == this.attr.anchors) {
                var x = this._children($panels.children());
                if (0 === x.length) {
                    console.error("[:tabs] > has no els in @panels tag");
                    return;
                }
                x.addClass("-tab-panel -hidden");
            }
            this._children($header.children()).addClass("-tab-header -hidden");
        },
        onRenderEndServer: function(elements, model, cntx) {
            if (this.visible && !this.attr.scrollbar) {
                var sel = '[name="' + this.visible + '"].-tab-panel';
                var pane = elements[0].querySelector(sel);
                if (pane) pane.classList.add("-show");
                if (!pane) debugger;
            }
        },
        onRenderEnd: function() {
            if (this.attr.scrollbar) {
                this.scroller = this.closest(":scroller");
                this.scroller.on("scroll", "", this._scrolled.bind(this));
            }
            var $headers = this.$.find(".-tab-header");
            if (0 === $headers.length) return;
            var that = this;
            $headers.on("click", function(event) {
                var $this = $(event.currentTarget);
                if ($this.hasClass("active")) return;
                var name = $this.attr("name");
                that.setActive(name);
                that.$.trigger("change", event.currentTarget);
            });
        },
        animate: function(type, panel, callback) {
            if (null == panel) return;
            var animation = this._getAnimation(type);
            if (null == animation) return;
            animation.start(callback, panel);
        },
        _getAnimation: function(ani) {
            if (null == this.components) return null;
            var animation;
            for (var i = 0, x, imax = this.components.length; i < imax; i++) {
                x = this.components[i];
                if (":animation" === x.compoName && ani === x.attr.id) {
                    animation = x;
                    break;
                }
            }
            return animation;
        },
        _hide: function($el) {
            if (!$el.length) return;
            if (!this._getAnimation("hide")) {
                $el.removeClass("-show");
                return;
            }
            this.animate("hide", $el[0], function() {
                $el.removeClass("-show");
            });
        },
        _show: function($el) {
            if (!$el.length) {
                this._activeName = "";
                return;
            }
            $el.addClass("-show");
            this.animate("show", $el[0]);
        },
        _scrolled: function(top, left) {
            var scrollTop = this.scroller.$[0].scrollTop + (this.attr.dtop << 0);
            var $panels = this._items("panel"), min = null, $el = null;
            for (var i = 0, x, imax = $panels.length; i < imax; i++) {
                x = $panels[i];
                if (null == min) {
                    min = scrollTop - x.offsetTop;
                    $el = x;
                    continue;
                }
                if (Math.abs(x.offsetTop - scrollTop) < min) {
                    min = scrollTop - x.offsetTop;
                    $el = x;
                }
            }
            var name = $el.getAttribute("name");
            if (name && this._activeName !== name) {
                this._activeName = name;
                this.emitOut("-tabChanged", name);
            }
        },
        _scrollInto: function($el) {
            this.scroller.scroller.scrollToElement($el[0]);
        },
        _activeName: null,
        setActive: function(name) {
            if (this._activeName === name) return;
            this._activeName = name;
            var $panels = this._items("panel"), $headers = this._items("header");
            var $panel = $panels.filter('[name="' + name + '"]');
            if (this.attr.scrollbar) {
                if (0 == $panel.length) {
                    console.error("[:tabs] panel not found", name);
                    return;
                }
                this._scrollInto($panel);
            } else {
                if ($panel.hasClass("-show")) return;
                this._hide($panels.filter(".-show"));
                this._show($panel);
            }
            $headers.removeClass("-show").children('[name="' + name + '"]').addClass("active");
        },
        has: function(name) {
            return 0 !== this._items("panel").filter('[name="' + name + '"]').length;
        },
        getActiveName: function() {
            return this._activeName;
        },
        getList: function() {
            var array = [], $panels = this._items("panel"), name;
            for (var i = 0, $x, imax = $panels.length; i < imax; i++) {
                $x = $panels[i];
                name = null;
                if ($x.getAttribute) name = $x.getAttribute("name");
                if (!name) name = $x.attr && $x.attr.name;
                if (!name) debugger;
                array.push(name);
            }
            return array;
        }
    }));
}();

include.getResource("/.reference/atma/compos/tabs/lib/tabs.js", "js").readystatechanged(3);

include.setCurrent({
    id: "/public/control/ajax-loader/ajax-loader.es6",
    namespace: "",
    url: "/public/control/ajax-loader/ajax-loader.es6"
});

"use strict";

include.css("ajax-loader.less").done(function(resp) {
    mask.registerHandler(":ajax-loader", Compo.createClass({
        tagName: "div",
        attr: {
            "class": "-ajax-loader"
        },
        slots: {
            domInsert: function() {
                Class.Remote.onBefore(this.defer);
                Class.Remote.onAfter(this.resolve, this.error);
            }
        },
        count: 0,
        Self: {
            defer: function() {
                if (1 !== ++this.count) return;
                this.$.toggle(true);
            },
            resolve: function() {
                if (--this.count > 0) return;
                this.count = 0;
                this.$.toggle(false);
            },
            error: function(sender, type, error) {
                this.resolve();
            }
        }
    }));
});

include.getResource("/public/control/ajax-loader/ajax-loader.es6", "js").readystatechanged(3);

include.resumeStack();