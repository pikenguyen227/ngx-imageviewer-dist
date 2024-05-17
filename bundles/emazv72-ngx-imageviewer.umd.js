(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/platform-browser'), require('rxjs'), require('fs'), require('canvas'), require('zlib'), require('http'), require('https'), require('url')) :
    typeof define === 'function' && define.amd ? define('@emazv72/ngx-imageviewer', ['exports', '@angular/core', '@angular/platform-browser', 'rxjs', 'fs', 'canvas', 'zlib', 'http', 'https', 'url'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.emazv72 = global.emazv72 || {}, global.emazv72["ngx-imageviewer"] = {}), global.ng.core, global.ng.platformBrowser, global.rxjs, global.require$$0, global.require$$1, global.require$$2, global.require$$3, global.require$$4, global.require$$5));
})(this, (function (exports, i0, platformBrowser, rxjs, require$$0, require$$1, require$$2, require$$3, require$$4, require$$5) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n["default"] = e;
        return Object.freeze(n);
    }

    var i0__namespace = /*#__PURE__*/_interopNamespace(i0);
    var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
    var require$$1__default = /*#__PURE__*/_interopDefaultLegacy(require$$1);
    var require$$2__default = /*#__PURE__*/_interopDefaultLegacy(require$$2);
    var require$$3__default = /*#__PURE__*/_interopDefaultLegacy(require$$3);
    var require$$4__default = /*#__PURE__*/_interopDefaultLegacy(require$$4);
    var require$$5__default = /*#__PURE__*/_interopDefaultLegacy(require$$5);

    var ImageViewerConfig = /** @class */ (function () {
        function ImageViewerConfig() {
        }
        return ImageViewerConfig;
    }());
    function createButtonConfig(icon, tooltip, sortId, show) {
        if (sortId === void 0) { sortId = 0; }
        if (show === void 0) { show = true; }
        return { icon: icon, tooltip: tooltip, sortId: sortId, show: show };
    }
    var IMAGEVIEWER_CONFIG = new i0.InjectionToken('imageviewer.config');
    var IMAGEVIEWER_CONFIG_DEFAULT = {
        width: 800,
        height: 600,
        bgStyle: '#ECEFF1',
        scaleStep: 0.1,
        rotateStepper: false,
        loadingMessage: 'Loading...',
        buttonStyle: {
            iconFontFamily: 'Material Icons',
            alpha: 0.5,
            hoverAlpha: 0.7,
            bgStyle: '#000000',
            iconStyle: '#ffffff',
            borderStyle: '#000000',
            borderWidth: 0 // buttons' border width (0 == disabled)
        },
        tooltips: {
            enabled: true,
            bgStyle: '#000000',
            bgAlpha: 0.5,
            textStyle: '#ffffff',
            textAlpha: 0.9,
            padding: 15,
            radius: 20 // tooltip border radius
        },
        nextPageButton: createButtonConfig(String.fromCharCode(0xE409), 'Next page', 0),
        beforePageButton: createButtonConfig(String.fromCharCode(0xE408), 'Previous page', 1),
        zoomOutButton: createButtonConfig(String.fromCharCode(0xE900), 'Zoom out', 0),
        zoomInButton: createButtonConfig(String.fromCharCode(0xE8FF), 'Zoom in', 1),
        rotateLeftButton: createButtonConfig(String.fromCharCode(0xE419), 'Rotate left', 2),
        rotateRightButton: createButtonConfig(String.fromCharCode(0xE41A), 'Rotate right', 3),
        resetButton: createButtonConfig(String.fromCharCode(0xE863), 'Reset', 4)
    };

    var Button = /** @class */ (function () {
        //#endregion
        //#region Lifecycle events
        function Button(config, style) {
            this.style = style;
            //#region Properties
            this.sortId = 0;
            // hover state
            this.hover = false;
            // show/hide button
            this.display = true;
            // drawn on position
            this.drawPosition = null;
            this.drawRadius = 0;
            this.sortId = config.sortId;
            this.display = config.show;
            this.icon = config.icon;
            this.tooltip = config.tooltip;
        }
        //#endregion
        //#region Events
        // click action
        Button.prototype.onClick = function (evt) { alert('no click action set!'); return true; };
        // mouse down action
        Button.prototype.onMouseDown = function (evt) { return false; };
        //#endregion
        //#region Draw Button
        Button.prototype.draw = function (ctx, x, y, radius) {
            this.drawPosition = { x: x, y: y };
            this.drawRadius = radius;
            // preserve context
            ctx.save();
            // drawing settings
            var isHover = (typeof this.hover === 'function') ? this.hover() : this.hover;
            ctx.globalAlpha = (isHover) ? this.style.hoverAlpha : this.style.alpha;
            ctx.fillStyle = this.style.bgStyle;
            ctx.lineWidth = 0;
            // draw circle
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            if (this.style.borderWidth > 0) {
                ctx.lineWidth = this.style.borderWidth;
                ctx.strokeStyle = this.style.borderStyle;
                ctx.stroke();
            }
            // draw icon
            if (this.icon !== null) {
                ctx.save();
                // ctx.globalCompositeOperation = 'destination-out';
                this.drawIconFont(ctx, x, y, radius);
                ctx.restore();
            }
            // restore context
            ctx.restore();
        };
        Button.prototype.drawIconFont = function (ctx, centreX, centreY, size) {
            // font settings
            ctx.font = size + 'px ' + this.style.iconFontFamily;
            ctx.fillStyle = this.style.iconStyle;
            // calculate position
            var textSize = ctx.measureText(this.icon);
            var x = centreX - textSize.width / 2;
            var y = centreY + size / 2;
            // draw it
            ctx.fillText(this.icon, x, y);
        };
        //#endregion
        //#region Utils
        Button.prototype.isWithinBounds = function (x, y) {
            if (this.drawPosition === null) {
                return false;
            }
            var dx = Math.abs(this.drawPosition.x - x), dy = Math.abs(this.drawPosition.y - y);
            return dx * dx + dy * dy <= this.drawRadius * this.drawRadius;
        };
        return Button;
    }());
    var Viewport = /** @class */ (function () {
        function Viewport(width, height, scale, rotation, x, y) {
            this.width = width;
            this.height = height;
            this.scale = scale;
            this.rotation = rotation;
            this.x = x;
            this.y = y;
        }
        return Viewport;
    }());
    var ResourceLoader = /** @class */ (function () {
        function ResourceLoader() {
            this.viewport = { width: 0, height: 0, scale: 1, rotation: 0, x: 0, y: 0 };
            this.minScale = 0;
            this.maxScale = 4;
            this.currentItem = 1;
            this.totalItem = 1;
            this.showItemsQuantity = false;
            this.loaded = false;
            this.loading = false;
            this.rendering = false;
            this.resourceChange = new rxjs.Subject();
        }
        ResourceLoader.prototype.resetViewport = function (canvasDim) {
            if (!this.loaded || !canvasDim) {
                return;
            }
            var rotation = this.viewport ? this.viewport.rotation : 0;
            var inverted = toSquareAngle(rotation) / 90 % 2 !== 0;
            var canvas = {
                width: !inverted ? canvasDim.width : canvasDim.height,
                height: !inverted ? canvasDim.height : canvasDim.width
            };
            if (((canvas.height / this._image.height) * this._image.width) <= canvas.width) {
                this.viewport.scale = canvas.height / this._image.height;
            }
            else {
                this.viewport.scale = canvas.width / this._image.width;
            }
            this.minScale = this.viewport.scale / 4;
            this.maxScale = this.viewport.scale * 4;
            // start point to draw image
            this.viewport.width = this._image.width * this.viewport.scale;
            this.viewport.height = this._image.height * this.viewport.scale;
            this.viewport.x = (canvasDim.width - this.viewport.width) / 2;
            this.viewport.y = (canvasDim.height - this.viewport.height) / 2;
        };
        ResourceLoader.prototype.draw = function (ctx, config, canvasDim, onFinish) {
            // clear canvas
            ctx.clearRect(0, 0, canvasDim.width, canvasDim.height);
            // Draw background color;
            ctx.fillStyle = config.bgStyle;
            ctx.fillRect(0, 0, canvasDim.width, canvasDim.height);
            // draw image (transformed, rotate and scaled)
            if (!this.loading && this.loaded) {
                ctx.translate(this.viewport.x + this.viewport.width / 2, this.viewport.y + this.viewport.height / 2);
                ctx.rotate(this.viewport.rotation * Math.PI / 180);
                ctx.scale(this.viewport.scale, this.viewport.scale);
                ctx.drawImage(this._image, -this._image.width / 2, -this._image.height / 2);
            }
            else {
                ctx.fillStyle = '#333';
                ctx.font = '25px Verdana';
                ctx.textAlign = 'center';
                ctx.fillText(config.loadingMessage || 'Loading...', canvasDim.width / 2, canvasDim.height / 2);
            }
            onFinish(ctx, config, canvasDim);
        };
        ResourceLoader.prototype.onResourceChange = function () { return this.resourceChange.asObservable(); };
        return ResourceLoader;
    }());
    function toSquareAngle(angle) {
        return 90 * ((Math.trunc(angle / 90) + (Math.trunc(angle % 90) > 45 ? 1 : 0)) % 4);
    }

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
        function accept(f) { if (f !== void 0 && typeof f !== "function")
            throw new TypeError("Function expected"); return f; }
        var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
        var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
        var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
        var _, done = false;
        for (var i = decorators.length - 1; i >= 0; i--) {
            var context = {};
            for (var p in contextIn)
                context[p] = p === "access" ? {} : contextIn[p];
            for (var p in contextIn.access)
                context.access[p] = contextIn.access[p];
            context.addInitializer = function (f) { if (done)
                throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
            var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
            if (kind === "accessor") {
                if (result === void 0)
                    continue;
                if (result === null || typeof result !== "object")
                    throw new TypeError("Object expected");
                if (_ = accept(result.get))
                    descriptor.get = _;
                if (_ = accept(result.set))
                    descriptor.set = _;
                if (_ = accept(result.init))
                    initializers.unshift(_);
            }
            else if (_ = accept(result)) {
                if (kind === "field")
                    initializers.unshift(_);
                else
                    descriptor[key] = _;
            }
        }
        if (target)
            Object.defineProperty(target, contextIn.name, descriptor);
        done = true;
    }
    ;
    function __runInitializers(thisArg, initializers, value) {
        var useValue = arguments.length > 2;
        for (var i = 0; i < initializers.length; i++) {
            value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
        }
        return useValue ? value : void 0;
    }
    ;
    function __propKey(x) {
        return typeof x === "symbol" ? x : "".concat(x);
    }
    ;
    function __setFunctionName(f, name, prefix) {
        if (typeof name === "symbol")
            name = name.description ? "[".concat(name.description, "]") : "";
        return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
    }
    ;
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (g && (g = 0, op[0] && (_ = 0)), _)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
            desc = { enumerable: true, get: function () { return m[k]; } };
        }
        Object.defineProperty(o, k2, desc);
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    /** @deprecated */
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    /** @deprecated */
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2)
            for (var i = 0, l = from.length, ar; i < l; i++) {
                if (ar || !(i in from)) {
                    if (!ar)
                        ar = Array.prototype.slice.call(from, 0, i);
                    ar[i] = from[i];
                }
            }
        return to.concat(ar || Array.prototype.slice.call(from));
    }
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }
    function __classPrivateFieldSet(receiver, state, value, kind, f) {
        if (kind === "m")
            throw new TypeError("Private method is not writable");
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    }
    function __classPrivateFieldIn(state, receiver) {
        if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function"))
            throw new TypeError("Cannot use 'in' operator on non-object");
        return typeof state === "function" ? receiver === state : state.has(receiver);
    }
    function __addDisposableResource(env, value, async) {
        if (value !== null && value !== void 0) {
            if (typeof value !== "object" && typeof value !== "function")
                throw new TypeError("Object expected.");
            var dispose;
            if (async) {
                if (!Symbol.asyncDispose)
                    throw new TypeError("Symbol.asyncDispose is not defined.");
                dispose = value[Symbol.asyncDispose];
            }
            if (dispose === void 0) {
                if (!Symbol.dispose)
                    throw new TypeError("Symbol.dispose is not defined.");
                dispose = value[Symbol.dispose];
            }
            if (typeof dispose !== "function")
                throw new TypeError("Object not disposable.");
            env.stack.push({ value: value, dispose: dispose, async: async });
        }
        else if (async) {
            env.stack.push({ async: true });
        }
        return value;
    }
    var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };
    function __disposeResources(env) {
        function fail(e) {
            env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        function next() {
            while (env.stack.length) {
                var rec = env.stack.pop();
                try {
                    var result = rec.dispose && rec.dispose.call(rec.value);
                    if (rec.async)
                        return Promise.resolve(result).then(next, function (e) { fail(e); return next(); });
                }
                catch (e) {
                    fail(e);
                }
            }
            if (env.hasError)
                throw env.error;
        }
        return next();
    }
    var tslib_es6 = {
        __extends: __extends,
        __assign: __assign,
        __rest: __rest,
        __decorate: __decorate,
        __param: __param,
        __metadata: __metadata,
        __awaiter: __awaiter,
        __generator: __generator,
        __createBinding: __createBinding,
        __exportStar: __exportStar,
        __values: __values,
        __read: __read,
        __spread: __spread,
        __spreadArrays: __spreadArrays,
        __spreadArray: __spreadArray,
        __await: __await,
        __asyncGenerator: __asyncGenerator,
        __asyncDelegator: __asyncDelegator,
        __asyncValues: __asyncValues,
        __makeTemplateObject: __makeTemplateObject,
        __importStar: __importStar,
        __importDefault: __importDefault,
        __classPrivateFieldGet: __classPrivateFieldGet,
        __classPrivateFieldSet: __classPrivateFieldSet,
        __classPrivateFieldIn: __classPrivateFieldIn,
        __addDisposableResource: __addDisposableResource,
        __disposeResources: __disposeResources,
    };

    var ImageResourceLoader = /** @class */ (function (_super) {
        __extends(ImageResourceLoader, _super);
        function ImageResourceLoader() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ImageResourceLoader.prototype.setUp = function () {
            this.loadResource();
        };
        ImageResourceLoader.prototype.loadResource = function () {
            var _this = this;
            this.loading = true;
            this._image = new Image();
            this._image.addEventListener('load', function (evt) {
                _this.loaded = true;
                _this.loading = false;
                _this.resourceChange.next();
            }, false);
            this._image.src = this.src;
        };
        return ImageResourceLoader;
    }(ResourceLoader));

    var ImageCacheService = /** @class */ (function () {
        function ImageCacheService() {
            this._cache = [];
        }
        Object.defineProperty(ImageCacheService.prototype, "cache", {
            get: function () {
                return this._cache;
            },
            enumerable: false,
            configurable: true
        });
        ImageCacheService.prototype.getCache = function (url, page) {
            return this.cache.find(function (i) { return i.url === url && i.page === page; });
        };
        ImageCacheService.prototype.getImage = function (url, page) {
            var c = this.getCache(url, page);
            return c ? c.image : null;
        };
        ImageCacheService.prototype.saveImage = function (url, page, image) {
            var cache = this.getCache(url, page);
            if (cache) {
                cache.image = image;
            }
            else {
                this.cache.push({ url: url, page: page, image: image });
            }
        };
        ImageCacheService.prototype.disposeCache = function () {
            this.cache.forEach(function (i) { return URL.revokeObjectURL(i.image.src); });
            this._cache = [];
        };
        return ImageCacheService;
    }());
    ImageCacheService.ɵprov = i0__namespace.ɵɵdefineInjectable({ factory: function ImageCacheService_Factory() { return new ImageCacheService(); }, token: ImageCacheService, providedIn: "root" });
    ImageCacheService.decorators = [
        { type: i0.Injectable, args: [{ providedIn: 'root' },] }
    ];
    ImageCacheService.ctorParameters = function () { return []; };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};
    function getDefaultExportFromCjs(x) {
        return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }
    function getDefaultExportFromNamespaceIfPresent(n) {
        return n && Object.prototype.hasOwnProperty.call(n, 'default') ? n['default'] : n;
    }
    function getDefaultExportFromNamespaceIfNotNamed(n) {
        return n && Object.prototype.hasOwnProperty.call(n, 'default') && Object.keys(n).length === 1 ? n['default'] : n;
    }
    function getAugmentedNamespace(n) {
        if (n.__esModule)
            return n;
        var a = Object.defineProperty({}, '__esModule', { value: true });
        Object.keys(n).forEach(function (k) {
            var d = Object.getOwnPropertyDescriptor(n, k);
            Object.defineProperty(a, k, d.get ? d : {
                enumerable: true,
                get: function () {
                    return n[k];
                }
            });
        });
        return a;
    }
    function commonjsRequire(path) {
        throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
    }

    var pdf_min$1 = { exports: {} };

    (function (module, exports) {
        !function webpackUniversalModuleDefinition(e, t) { "object" == 'object' && "object" == 'object' ? module.exports = t() : "function" == typeof undefined && undefined.amd ? undefined("pdfjs-dist/build/pdf", [], t) : "object" == 'object' ? exports["pdfjs-dist/build/pdf"] = t() : e["pdfjs-dist/build/pdf"] = e.pdfjsLib = t(); }(commonjsGlobal, (function () { return (function () {
            "use strict";
            var __webpack_modules__ = [, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.addLinkAttributes = function addLinkAttributes(e, _a) {
                    var _b = _a === void 0 ? {} : _a, t = _b.url, r = _b.target, n = _b.rel, _c = _b.enabled, o = _c === void 0 ? !0 : _c;
                    (0, s.assert)(t && "string" == typeof t, 'addLinkAttributes: A valid "url" parameter must provided.');
                    var l = (0, s.removeNullCharacters)(t);
                    if (o)
                        e.href = e.title = l;
                    else {
                        e.href = "";
                        e.title = "Disabled: " + l;
                        e.onclick = function () { return !1; };
                    }
                    var c = "";
                    switch (r) {
                        case i.NONE: break;
                        case i.SELF:
                            c = "_self";
                            break;
                        case i.BLANK:
                            c = "_blank";
                            break;
                        case i.PARENT:
                            c = "_parent";
                            break;
                        case i.TOP: c = "_top";
                    }
                    e.target = c;
                    e.rel = "string" == typeof n ? n : a;
                }; t.deprecated = function deprecated(e) { console.log("Deprecated API usage: " + e); }; t.getFilenameFromUrl = function getFilenameFromUrl(e) { var t = e.indexOf("#"), r = e.indexOf("?"), s = Math.min(t > 0 ? t : e.length, r > 0 ? r : e.length); return e.substring(e.lastIndexOf("/", s) + 1, s); }; t.getPdfFilenameFromUrl = function getPdfFilenameFromUrl(e, t) {
                    if (t === void 0) { t = "document.pdf"; }
                    if ("string" != typeof e)
                        return t;
                    if (isDataScheme(e)) {
                        (0, s.warn)('getPdfFilenameFromUrl: ignore "data:"-URL for performance reasons.');
                        return t;
                    }
                    var r = /[^/?#=]+\.pdf\b(?!.*\.pdf\b)/i, n = /^(?:(?:[^:]+:)?\/\/[^/]+)?([^?#]*)(\?[^#]*)?(#.*)?$/.exec(e);
                    var a = r.exec(n[1]) || r.exec(n[2]) || r.exec(n[3]);
                    if (a) {
                        a = a[0];
                        if (a.includes("%"))
                            try {
                                a = r.exec(decodeURIComponent(a))[0];
                            }
                            catch (e) { }
                    }
                    return a || t;
                }; t.getXfaPageViewport = function getXfaPageViewport(e, _a) {
                    var _b = _a.scale, t = _b === void 0 ? 1 : _b, _c = _a.rotation, r = _c === void 0 ? 0 : _c;
                    var _d = e.attributes.style, s = _d.width, n = _d.height, a = [0, 0, parseInt(s), parseInt(n)];
                    return new PageViewport({ viewBox: a, scale: t, rotation: r });
                }; t.isDataScheme = isDataScheme; t.isPdfFile = function isPdfFile(e) { return "string" == typeof e && /\.pdf$/i.test(e); }; t.isValidFetchUrl = isValidFetchUrl; t.loadScript = function loadScript(e, t) {
                    if (t === void 0) { t = !1; }
                    return new Promise((function (r, s) { var n = document.createElement("script"); n.src = e; n.onload = function (e) { t && n.remove(); r(e); }; n.onerror = function () { s(new Error("Cannot load script at: " + n.src)); }; (document.head || document.documentElement).appendChild(n); }));
                }; t.StatTimer = t.RenderingCancelledException = t.PDFDateString = t.PageViewport = t.LinkTarget = t.DOMSVGFactory = t.DOMStandardFontDataFactory = t.DOMCMapReaderFactory = t.DOMCanvasFactory = t.DEFAULT_LINK_REL = void 0; var s = r(2), n = r(5); var a = "noopener noreferrer nofollow"; t.DEFAULT_LINK_REL = a;
                    var DOMCanvasFactory = /** @class */ (function (_super) {
                        __extends(DOMCanvasFactory, _super);
                        function DOMCanvasFactory(_a) {
                            var _b = _a === void 0 ? {} : _a, _c = _b.ownerDocument, e = _c === void 0 ? globalThis.document : _c;
                            var _this = _super.call(this) || this;
                            _this._document = e;
                            return _this;
                        }
                        DOMCanvasFactory.prototype._createCanvas = function (e, t) { var r = this._document.createElement("canvas"); r.width = e; r.height = t; return r; };
                        return DOMCanvasFactory;
                    }(n.BaseCanvasFactory));  t.DOMCanvasFactory = DOMCanvasFactory; function fetchData(e, t) {
                    if (t === void 0) { t = !1; }
                    return __awaiter(this, void 0, void 0, function () { var r_1, _a, _b, _c; return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                if (!isValidFetchUrl(e, document.baseURI)) return [3 /*break*/, 6];
                                return [4 /*yield*/, fetch(e)];
                            case 1:
                                r_1 = _d.sent();
                                if (!r_1.ok)
                                    throw new Error(r_1.statusText);
                                if (!t) return [3 /*break*/, 3];
                                _b = Uint8Array.bind;
                                return [4 /*yield*/, r_1.arrayBuffer()];
                            case 2:
                                _a = new (_b.apply(Uint8Array, [void 0, _d.sent()]))();
                                return [3 /*break*/, 5];
                            case 3:
                                _c = (0, s.stringToBytes);
                                return [4 /*yield*/, r_1.text()];
                            case 4:
                                _a = _c.apply(void 0, [_d.sent()]);
                                _d.label = 5;
                            case 5: return [2 /*return*/, _a];
                            case 6: return [2 /*return*/, new Promise((function (r, n) { var a = new XMLHttpRequest; a.open("GET", e, !0); t && (a.responseType = "arraybuffer"); a.onreadystatechange = function () { if (a.readyState === XMLHttpRequest.DONE) {
                                    if (200 === a.status || 0 === a.status) {
                                        var e_1;
                                        t && a.response ? e_1 = new Uint8Array(a.response) : !t && a.responseText && (e_1 = (0, s.stringToBytes)(a.responseText));
                                        if (e_1) {
                                            r(e_1);
                                            return;
                                        }
                                    }
                                    n(new Error(a.statusText));
                                } }; a.send(null); }))];
                        }
                    }); });
                }
                    var DOMCMapReaderFactory = /** @class */ (function (_super) {
                        __extends(DOMCMapReaderFactory, _super);
                        function DOMCMapReaderFactory() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        DOMCMapReaderFactory.prototype._fetchData = function (e, t) { return fetchData(e, this.isCompressed).then((function (e) { return ({ cMapData: e, compressionType: t }); })); };
                        return DOMCMapReaderFactory;
                    }(n.BaseCMapReaderFactory));  t.DOMCMapReaderFactory = DOMCMapReaderFactory;
                    var DOMStandardFontDataFactory = /** @class */ (function (_super) {
                        __extends(DOMStandardFontDataFactory, _super);
                        function DOMStandardFontDataFactory() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        DOMStandardFontDataFactory.prototype._fetchData = function (e) { return fetchData(e, !0); };
                        return DOMStandardFontDataFactory;
                    }(n.BaseStandardFontDataFactory));  t.DOMStandardFontDataFactory = DOMStandardFontDataFactory;
                    var DOMSVGFactory = /** @class */ (function (_super) {
                        __extends(DOMSVGFactory, _super);
                        function DOMSVGFactory() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        DOMSVGFactory.prototype._createSVG = function (e) { return document.createElementNS("http://www.w3.org/2000/svg", e); };
                        return DOMSVGFactory;
                    }(n.BaseSVGFactory));  t.DOMSVGFactory = DOMSVGFactory;
                    var PageViewport = /** @class */ (function () {
                        function PageViewport(_a) {
                            var e = _a.viewBox, t = _a.scale, r = _a.rotation, _b = _a.offsetX, s = _b === void 0 ? 0 : _b, _c = _a.offsetY, n = _c === void 0 ? 0 : _c, _d = _a.dontFlip, a = _d === void 0 ? !1 : _d;
                            this.viewBox = e;
                            this.scale = t;
                            this.rotation = r;
                            this.offsetX = s;
                            this.offsetY = n;
                            var i = (e[2] + e[0]) / 2, o = (e[3] + e[1]) / 2;
                            var l, c, h, d, u, p, g, f;
                            (r %= 360) < 0 && (r += 360);
                            switch (r) {
                                case 180:
                                    l = -1;
                                    c = 0;
                                    h = 0;
                                    d = 1;
                                    break;
                                case 90:
                                    l = 0;
                                    c = 1;
                                    h = 1;
                                    d = 0;
                                    break;
                                case 270:
                                    l = 0;
                                    c = -1;
                                    h = -1;
                                    d = 0;
                                    break;
                                case 0:
                                    l = 1;
                                    c = 0;
                                    h = 0;
                                    d = -1;
                                    break;
                                default: throw new Error("PageViewport: Invalid rotation, must be a multiple of 90 degrees.");
                            }
                            if (a) {
                                h = -h;
                                d = -d;
                            }
                            if (0 === l) {
                                u = Math.abs(o - e[1]) * t + s;
                                p = Math.abs(i - e[0]) * t + n;
                                g = Math.abs(e[3] - e[1]) * t;
                                f = Math.abs(e[2] - e[0]) * t;
                            }
                            else {
                                u = Math.abs(i - e[0]) * t + s;
                                p = Math.abs(o - e[1]) * t + n;
                                g = Math.abs(e[2] - e[0]) * t;
                                f = Math.abs(e[3] - e[1]) * t;
                            }
                            this.transform = [l * t, c * t, h * t, d * t, u - l * t * i - h * t * o, p - c * t * i - d * t * o];
                            this.width = g;
                            this.height = f;
                        }
                        PageViewport.prototype.clone = function (_a) {
                            var _b = _a === void 0 ? {} : _a, _c = _b.scale, e = _c === void 0 ? this.scale : _c, _d = _b.rotation, t = _d === void 0 ? this.rotation : _d, _e = _b.offsetX, r = _e === void 0 ? this.offsetX : _e, _f = _b.offsetY, s = _f === void 0 ? this.offsetY : _f, _g = _b.dontFlip, n = _g === void 0 ? !1 : _g;
                            return new PageViewport({ viewBox: this.viewBox.slice(), scale: e, rotation: t, offsetX: r, offsetY: s, dontFlip: n });
                        };
                        PageViewport.prototype.convertToViewportPoint = function (e, t) { return s.Util.applyTransform([e, t], this.transform); };
                        PageViewport.prototype.convertToViewportRectangle = function (e) { var t = s.Util.applyTransform([e[0], e[1]], this.transform), r = s.Util.applyTransform([e[2], e[3]], this.transform); return [t[0], t[1], r[0], r[1]]; };
                        PageViewport.prototype.convertToPdfPoint = function (e, t) { return s.Util.applyInverseTransform([e, t], this.transform); };
                        return PageViewport;
                    }());  t.PageViewport = PageViewport;
                    var RenderingCancelledException = /** @class */ (function (_super) {
                        __extends(RenderingCancelledException, _super);
                        function RenderingCancelledException(e, t) {
                            var _this = _super.call(this, e) || this;
                            _this.type = t;
                            return _this;
                        }
                        return RenderingCancelledException;
                    }(s.BaseException));  t.RenderingCancelledException = RenderingCancelledException; var i = { NONE: 0, SELF: 1, BLANK: 2, PARENT: 3, TOP: 4 }; t.LinkTarget = i; function isDataScheme(e) { var t = e.length; var r = 0; for (; r < t && "" === e[r].trim();)
                    r++; return "data:" === e.substring(r, r + 5).toLowerCase(); } t.StatTimer = /** @class */ (function () {
                    function StatTimer() {
                        this.started = Object.create(null);
                        this.times = [];
                    }
                    StatTimer.prototype.time = function (e) { e in this.started && (0, s.warn)("Timer is already running for " + e); this.started[e] = Date.now(); };
                    StatTimer.prototype.timeEnd = function (e) { e in this.started || (0, s.warn)("Timer has not been started for " + e); this.times.push({ name: e, start: this.started[e], end: Date.now() }); delete this.started[e]; };
                    StatTimer.prototype.toString = function () {
                        var e_2, _a, e_3, _b;
                        var e = [];
                        var t = 0;
                        try {
                            for (var _c = __values(this.times), _d = _c.next(); !_d.done; _d = _c.next()) {
                                var e_4 = _d.value;
                                var r_2 = e_4.name;
                                r_2.length > t && (t = r_2.length);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        try {
                            for (var _e = __values(this.times), _f = _e.next(); !_f.done; _f = _e.next()) {
                                var r_3 = _f.value;
                                var s_1 = r_3.end - r_3.start;
                                e.push(r_3.name.padEnd(t) + " " + s_1 + "ms\n");
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                        return e.join("");
                    };
                    return StatTimer;
                }()); function isValidFetchUrl(e, t) { try {
                    var r_4 = (t ? new URL(e, t) : new URL(e)).protocol;
                    return "http:" === r_4 || "https:" === r_4;
                }
                catch (e) {
                    return !1;
                } } var o; t.PDFDateString = /** @class */ (function () {
                    function PDFDateString() {
                    }
                    PDFDateString.toDateObject = function (e) { if (!e || !(0, s.isString)(e))
                        return null; o || (o = new RegExp("^D:(\\d{4})(\\d{2})?(\\d{2})?(\\d{2})?(\\d{2})?(\\d{2})?([Z|+|-])?(\\d{2})?'?(\\d{2})?'?")); var t = o.exec(e); if (!t)
                        return null; var r = parseInt(t[1], 10); var n = parseInt(t[2], 10); n = n >= 1 && n <= 12 ? n - 1 : 0; var a = parseInt(t[3], 10); a = a >= 1 && a <= 31 ? a : 1; var i = parseInt(t[4], 10); i = i >= 0 && i <= 23 ? i : 0; var l = parseInt(t[5], 10); l = l >= 0 && l <= 59 ? l : 0; var c = parseInt(t[6], 10); c = c >= 0 && c <= 59 ? c : 0; var h = t[7] || "Z"; var d = parseInt(t[8], 10); d = d >= 0 && d <= 23 ? d : 0; var u = parseInt(t[9], 10) || 0; u = u >= 0 && u <= 59 ? u : 0; if ("-" === h) {
                        i += d;
                        l += u;
                    }
                    else if ("+" === h) {
                        i -= d;
                        l -= u;
                    } return new Date(Date.UTC(r, n, a, i, l, c)); };
                    return PDFDateString;
                }()); }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.arrayByteLength = arrayByteLength; t.arraysToBytes = function arraysToBytes(e) { var t = e.length; if (1 === t && e[0] instanceof Uint8Array)
                    return e[0]; var r = 0; for (var s_2 = 0; s_2 < t; s_2++)
                    r += arrayByteLength(e[s_2]); var s = 0; var n = new Uint8Array(r); for (var r_5 = 0; r_5 < t; r_5++) {
                    var t_1 = e[r_5];
                    t_1 instanceof Uint8Array || (t_1 = "string" == typeof t_1 ? stringToBytes(t_1) : new Uint8Array(t_1));
                    var a_1 = t_1.byteLength;
                    n.set(t_1, s);
                    s += a_1;
                } return n; }; t.assert = assert; t.bytesToString = function bytesToString(e) { assert(null !== e && "object" == typeof e && void 0 !== e.length, "Invalid argument for bytesToString"); var t = e.length, r = 8192; if (t < r)
                    return String.fromCharCode.apply(null, e); var s = []; for (var n_1 = 0; n_1 < t; n_1 += r) {
                    var a_2 = Math.min(n_1 + r, t), i_1 = e.subarray(n_1, a_2);
                    s.push(String.fromCharCode.apply(null, i_1));
                } return s.join(""); }; t.createObjectURL = function createObjectURL(e, t, r) {
                    if (t === void 0) { t = ""; }
                    if (r === void 0) { r = !1; }
                    if (URL.createObjectURL && !r)
                        return URL.createObjectURL(new Blob([e], { type: t }));
                    var s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
                    var n = "data:" + t + ";base64,";
                    for (var t_2 = 0, r_6 = e.length; t_2 < r_6; t_2 += 3) {
                        var a_3 = 255 & e[t_2], i_2 = 255 & e[t_2 + 1], o_1 = 255 & e[t_2 + 2];
                        n += s[a_3 >> 2] + s[(3 & a_3) << 4 | i_2 >> 4] + s[t_2 + 1 < r_6 ? (15 & i_2) << 2 | o_1 >> 6 : 64] + s[t_2 + 2 < r_6 ? 63 & o_1 : 64];
                    }
                    return n;
                }; t.createPromiseCapability = function createPromiseCapability() { var e = Object.create(null); var t = !1; Object.defineProperty(e, "settled", { get: function () { return t; } }); e.promise = new Promise((function (r, s) { e.resolve = function (e) { t = !0; r(e); }; e.reject = function (e) { t = !0; s(e); }; })); return e; }; t.createValidAbsoluteUrl = function createValidAbsoluteUrl(e, t) { if (!e)
                    return null; try {
                    var r_7 = t ? new URL(e, t) : new URL(e);
                    if (function _isValidProtocol(e) { if (!e)
                        return !1; switch (e.protocol) {
                        case "http:":
                        case "https:":
                        case "ftp:":
                        case "mailto:":
                        case "tel:": return !0;
                        default: return !1;
                    } }(r_7))
                        return r_7;
                }
                catch (e) { } return null; }; t.escapeString = function escapeString(e) { return e.replace(/([()\\\n\r])/g, (function (e) { return "\n" === e ? "\\n" : "\r" === e ? "\\r" : "\\" + e; })); }; t.getModificationDate = function getModificationDate(e) {
                    if (e === void 0) { e = new Date; }
                    return [e.getUTCFullYear().toString(), (e.getUTCMonth() + 1).toString().padStart(2, "0"), e.getUTCDate().toString().padStart(2, "0"), e.getUTCHours().toString().padStart(2, "0"), e.getUTCMinutes().toString().padStart(2, "0"), e.getUTCSeconds().toString().padStart(2, "0")].join("");
                }; t.getVerbosityLevel = function getVerbosityLevel() { return n; }; t.info = function info(e) { n >= s.INFOS && console.log("Info: " + e); }; t.isArrayBuffer = function isArrayBuffer(e) { return "object" == typeof e && null !== e && void 0 !== e.byteLength; }; t.isArrayEqual = function isArrayEqual(e, t) { if (e.length !== t.length)
                    return !1; for (var r_8 = 0, s_3 = e.length; r_8 < s_3; r_8++)
                    if (e[r_8] !== t[r_8])
                        return !1; return !0; }; t.isAscii = function isAscii(e) { return /^[\x00-\x7F]*$/.test(e); }; t.isBool = function isBool(e) { return "boolean" == typeof e; }; t.isNum = function isNum(e) { return "number" == typeof e; }; t.isSameOrigin = function isSameOrigin(e, t) { var r; try {
                    r = new URL(e);
                    if (!r.origin || "null" === r.origin)
                        return !1;
                }
                catch (e) {
                    return !1;
                } var s = new URL(t, r); return r.origin === s.origin; }; t.isString = function isString(e) { return "string" == typeof e; }; t.objectFromMap = function objectFromMap(e) {
                    var e_5, _a;
                    var t = Object.create(null);
                    try {
                        for (var e_6 = __values(e), e_6_1 = e_6.next(); !e_6_1.done; e_6_1 = e_6.next()) {
                            var _b = __read(e_6_1.value, 2), r_9 = _b[0], s_4 = _b[1];
                            t[r_9] = s_4;
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (e_6_1 && !e_6_1.done && (_a = e_6.return)) _a.call(e_6);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                    return t;
                }; t.objectSize = function objectSize(e) { return Object.keys(e).length; }; t.removeNullCharacters = function removeNullCharacters(e) { if ("string" != typeof e) {
                    warn("The argument for removeNullCharacters must be a string.");
                    return e;
                } return e.replace(i, ""); }; t.setVerbosityLevel = function setVerbosityLevel(e) { Number.isInteger(e) && (n = e); }; t.shadow = shadow; t.string32 = function string32(e) { return String.fromCharCode(e >> 24 & 255, e >> 16 & 255, e >> 8 & 255, 255 & e); }; t.stringToBytes = stringToBytes; t.stringToPDFString = function stringToPDFString(e) { var t = e.length, r = []; if ("þ" === e[0] && "ÿ" === e[1])
                    for (var s_5 = 2; s_5 < t; s_5 += 2)
                        r.push(String.fromCharCode(e.charCodeAt(s_5) << 8 | e.charCodeAt(s_5 + 1)));
                else if ("ÿ" === e[0] && "þ" === e[1])
                    for (var s_6 = 2; s_6 < t; s_6 += 2)
                        r.push(String.fromCharCode(e.charCodeAt(s_6 + 1) << 8 | e.charCodeAt(s_6)));
                else
                    for (var s_7 = 0; s_7 < t; ++s_7) {
                        var t_3 = h[e.charCodeAt(s_7)];
                        r.push(t_3 ? String.fromCharCode(t_3) : e.charAt(s_7));
                    } return r.join(""); }; t.stringToUTF16BEString = function stringToUTF16BEString(e) { var t = ["þÿ"]; for (var r_10 = 0, s_8 = e.length; r_10 < s_8; r_10++) {
                    var s_9 = e.charCodeAt(r_10);
                    t.push(String.fromCharCode(s_9 >> 8 & 255), String.fromCharCode(255 & s_9));
                } return t.join(""); }; t.stringToUTF8String = function stringToUTF8String(e) { return decodeURIComponent(escape(e)); }; t.unreachable = unreachable; t.utf8StringToString = function utf8StringToString(e) { return unescape(encodeURIComponent(e)); }; t.warn = warn; t.VerbosityLevel = t.Util = t.UNSUPPORTED_FEATURES = t.UnknownErrorException = t.UnexpectedResponseException = t.TextRenderingMode = t.StreamType = t.PermissionFlag = t.PasswordResponses = t.PasswordException = t.PageActionEventType = t.OPS = t.MissingPDFException = t.IsLittleEndianCached = t.IsEvalSupportedCached = t.InvalidPDFException = t.ImageKind = t.IDENTITY_MATRIX = t.FormatError = t.FontType = t.FONT_IDENTITY_MATRIX = t.DocumentActionEventType = t.CMapCompressionType = t.BaseException = t.AnnotationType = t.AnnotationStateModelType = t.AnnotationReviewState = t.AnnotationReplyType = t.AnnotationMarkedState = t.AnnotationFlag = t.AnnotationFieldFlag = t.AnnotationBorderStyleType = t.AnnotationActionEventType = t.AbortException = void 0; r(3); t.IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0]; t.FONT_IDENTITY_MATRIX = [.001, 0, 0, .001, 0, 0]; t.PermissionFlag = { PRINT: 4, MODIFY_CONTENTS: 8, COPY: 16, MODIFY_ANNOTATIONS: 32, FILL_INTERACTIVE_FORMS: 256, COPY_FOR_ACCESSIBILITY: 512, ASSEMBLE: 1024, PRINT_HIGH_QUALITY: 2048 }; t.TextRenderingMode = { FILL: 0, STROKE: 1, FILL_STROKE: 2, INVISIBLE: 3, FILL_ADD_TO_PATH: 4, STROKE_ADD_TO_PATH: 5, FILL_STROKE_ADD_TO_PATH: 6, ADD_TO_PATH: 7, FILL_STROKE_MASK: 3, ADD_TO_PATH_FLAG: 4 }; t.ImageKind = { GRAYSCALE_1BPP: 1, RGB_24BPP: 2, RGBA_32BPP: 3 }; t.AnnotationType = { TEXT: 1, LINK: 2, FREETEXT: 3, LINE: 4, SQUARE: 5, CIRCLE: 6, POLYGON: 7, POLYLINE: 8, HIGHLIGHT: 9, UNDERLINE: 10, SQUIGGLY: 11, STRIKEOUT: 12, STAMP: 13, CARET: 14, INK: 15, POPUP: 16, FILEATTACHMENT: 17, SOUND: 18, MOVIE: 19, WIDGET: 20, SCREEN: 21, PRINTERMARK: 22, TRAPNET: 23, WATERMARK: 24, THREED: 25, REDACT: 26 }; t.AnnotationStateModelType = { MARKED: "Marked", REVIEW: "Review" }; t.AnnotationMarkedState = { MARKED: "Marked", UNMARKED: "Unmarked" }; t.AnnotationReviewState = { ACCEPTED: "Accepted", REJECTED: "Rejected", CANCELLED: "Cancelled", COMPLETED: "Completed", NONE: "None" }; t.AnnotationReplyType = { GROUP: "Group", REPLY: "R" }; t.AnnotationFlag = { INVISIBLE: 1, HIDDEN: 2, PRINT: 4, NOZOOM: 8, NOROTATE: 16, NOVIEW: 32, READONLY: 64, LOCKED: 128, TOGGLENOVIEW: 256, LOCKEDCONTENTS: 512 }; t.AnnotationFieldFlag = { READONLY: 1, REQUIRED: 2, NOEXPORT: 4, MULTILINE: 4096, PASSWORD: 8192, NOTOGGLETOOFF: 16384, RADIO: 32768, PUSHBUTTON: 65536, COMBO: 131072, EDIT: 262144, SORT: 524288, FILESELECT: 1048576, MULTISELECT: 2097152, DONOTSPELLCHECK: 4194304, DONOTSCROLL: 8388608, COMB: 16777216, RICHTEXT: 33554432, RADIOSINUNISON: 33554432, COMMITONSELCHANGE: 67108864 }; t.AnnotationBorderStyleType = { SOLID: 1, DASHED: 2, BEVELED: 3, INSET: 4, UNDERLINE: 5 }; t.AnnotationActionEventType = { E: "Mouse Enter", X: "Mouse Exit", D: "Mouse Down", U: "Mouse Up", Fo: "Focus", Bl: "Blur", PO: "PageOpen", PC: "PageClose", PV: "PageVisible", PI: "PageInvisible", K: "Keystroke", F: "Format", V: "Validate", C: "Calculate" }; t.DocumentActionEventType = { WC: "WillClose", WS: "WillSave", DS: "DidSave", WP: "WillPrint", DP: "DidPrint" }; t.PageActionEventType = { O: "PageOpen", C: "PageClose" }; t.StreamType = { UNKNOWN: "UNKNOWN", FLATE: "FLATE", LZW: "LZW", DCT: "DCT", JPX: "JPX", JBIG: "JBIG", A85: "A85", AHX: "AHX", CCF: "CCF", RLX: "RLX" }; t.FontType = { UNKNOWN: "UNKNOWN", TYPE1: "TYPE1", TYPE1STANDARD: "TYPE1STANDARD", TYPE1C: "TYPE1C", CIDFONTTYPE0: "CIDFONTTYPE0", CIDFONTTYPE0C: "CIDFONTTYPE0C", TRUETYPE: "TRUETYPE", CIDFONTTYPE2: "CIDFONTTYPE2", TYPE3: "TYPE3", OPENTYPE: "OPENTYPE", TYPE0: "TYPE0", MMTYPE1: "MMTYPE1" }; var s = { ERRORS: 0, WARNINGS: 1, INFOS: 5 }; t.VerbosityLevel = s; t.CMapCompressionType = { NONE: 0, BINARY: 1, STREAM: 2 }; t.OPS = { dependency: 1, setLineWidth: 2, setLineCap: 3, setLineJoin: 4, setMiterLimit: 5, setDash: 6, setRenderingIntent: 7, setFlatness: 8, setGState: 9, save: 10, restore: 11, transform: 12, moveTo: 13, lineTo: 14, curveTo: 15, curveTo2: 16, curveTo3: 17, closePath: 18, rectangle: 19, stroke: 20, closeStroke: 21, fill: 22, eoFill: 23, fillStroke: 24, eoFillStroke: 25, closeFillStroke: 26, closeEOFillStroke: 27, endPath: 28, clip: 29, eoClip: 30, beginText: 31, endText: 32, setCharSpacing: 33, setWordSpacing: 34, setHScale: 35, setLeading: 36, setFont: 37, setTextRenderingMode: 38, setTextRise: 39, moveText: 40, setLeadingMoveText: 41, setTextMatrix: 42, nextLine: 43, showText: 44, showSpacedText: 45, nextLineShowText: 46, nextLineSetSpacingShowText: 47, setCharWidth: 48, setCharWidthAndBounds: 49, setStrokeColorSpace: 50, setFillColorSpace: 51, setStrokeColor: 52, setStrokeColorN: 53, setFillColor: 54, setFillColorN: 55, setStrokeGray: 56, setFillGray: 57, setStrokeRGBColor: 58, setFillRGBColor: 59, setStrokeCMYKColor: 60, setFillCMYKColor: 61, shadingFill: 62, beginInlineImage: 63, beginImageData: 64, endInlineImage: 65, paintXObject: 66, markPoint: 67, markPointProps: 68, beginMarkedContent: 69, beginMarkedContentProps: 70, endMarkedContent: 71, beginCompat: 72, endCompat: 73, paintFormXObjectBegin: 74, paintFormXObjectEnd: 75, beginGroup: 76, endGroup: 77, beginAnnotations: 78, endAnnotations: 79, beginAnnotation: 80, endAnnotation: 81, paintJpegXObject: 82, paintImageMaskXObject: 83, paintImageMaskXObjectGroup: 84, paintImageXObject: 85, paintInlineImageXObject: 86, paintInlineImageXObjectGroup: 87, paintImageXObjectRepeat: 88, paintImageMaskXObjectRepeat: 89, paintSolidColorImageMask: 90, constructPath: 91 }; t.UNSUPPORTED_FEATURES = { unknown: "unknown", forms: "forms", javaScript: "javaScript", signatures: "signatures", smask: "smask", shadingPattern: "shadingPattern", font: "font", errorTilingPattern: "errorTilingPattern", errorExtGState: "errorExtGState", errorXObject: "errorXObject", errorFontLoadType3: "errorFontLoadType3", errorFontState: "errorFontState", errorFontMissing: "errorFontMissing", errorFontTranslate: "errorFontTranslate", errorColorSpace: "errorColorSpace", errorOperatorList: "errorOperatorList", errorFontToUnicode: "errorFontToUnicode", errorFontLoadNative: "errorFontLoadNative", errorFontBuildPath: "errorFontBuildPath", errorFontGetPath: "errorFontGetPath", errorMarkedContent: "errorMarkedContent" }; t.PasswordResponses = { NEED_PASSWORD: 1, INCORRECT_PASSWORD: 2 }; var n = s.WARNINGS; function warn(e) { n >= s.WARNINGS && console.log("Warning: " + e); } function unreachable(e) { throw new Error(e); } function assert(e, t) { e || unreachable(t); } function shadow(e, t, r) { Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !1 }); return r; } var a = function BaseExceptionClosure() { function BaseException(e) { this.constructor === BaseException && unreachable("Cannot initialize BaseException."); this.message = e; this.name = this.constructor.name; } BaseException.prototype = new Error; BaseException.constructor = BaseException; return BaseException; }(); t.BaseException = a; t.PasswordException = /** @class */ (function (_super) {
                    __extends(PasswordException, _super);
                    function PasswordException(e, t) {
                        var _this = _super.call(this, e) || this;
                        _this.code = t;
                        return _this;
                    }
                    return PasswordException;
                }(a)); t.UnknownErrorException = /** @class */ (function (_super) {
                    __extends(UnknownErrorException, _super);
                    function UnknownErrorException(e, t) {
                        var _this = _super.call(this, e) || this;
                        _this.details = t;
                        return _this;
                    }
                    return UnknownErrorException;
                }(a)); t.InvalidPDFException = /** @class */ (function (_super) {
                    __extends(InvalidPDFException, _super);
                    function InvalidPDFException() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    return InvalidPDFException;
                }(a)); t.MissingPDFException = /** @class */ (function (_super) {
                    __extends(MissingPDFException, _super);
                    function MissingPDFException() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    return MissingPDFException;
                }(a)); t.UnexpectedResponseException = /** @class */ (function (_super) {
                    __extends(UnexpectedResponseException, _super);
                    function UnexpectedResponseException(e, t) {
                        var _this = _super.call(this, e) || this;
                        _this.status = t;
                        return _this;
                    }
                    return UnexpectedResponseException;
                }(a)); t.FormatError = /** @class */ (function (_super) {
                    __extends(FormatError, _super);
                    function FormatError() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    return FormatError;
                }(a)); t.AbortException = /** @class */ (function (_super) {
                    __extends(AbortException, _super);
                    function AbortException() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    return AbortException;
                }(a)); var i = /\x00/g; function stringToBytes(e) { assert("string" == typeof e, "Invalid argument for stringToBytes"); var t = e.length, r = new Uint8Array(t); for (var s_10 = 0; s_10 < t; ++s_10)
                    r[s_10] = 255 & e.charCodeAt(s_10); return r; } function arrayByteLength(e) { if (void 0 !== e.length)
                    return e.length; assert(void 0 !== e.byteLength, "arrayByteLength - invalid argument."); return e.byteLength; } var o = { get value() { return shadow(this, "value", function isLittleEndian() { var e = new Uint8Array(4); e[0] = 1; return 1 === new Uint32Array(e.buffer, 0, 1)[0]; }()); } }; t.IsLittleEndianCached = o; var l = { get value() { return shadow(this, "value", function isEvalSupported() { try {
                        new Function("");
                        return !0;
                    }
                    catch (e) {
                        return !1;
                    } }()); } }; t.IsEvalSupportedCached = l; var c = __spreadArray([], __read(Array(256).keys())).map((function (e) { return e.toString(16).padStart(2, "0"); }));
                    var Util = /** @class */ (function () {
                        function Util() {
                        }
                        Util.makeHexColor = function (e, t, r) { return "#" + c[e] + c[t] + c[r]; };
                        Util.transform = function (e, t) { return [e[0] * t[0] + e[2] * t[1], e[1] * t[0] + e[3] * t[1], e[0] * t[2] + e[2] * t[3], e[1] * t[2] + e[3] * t[3], e[0] * t[4] + e[2] * t[5] + e[4], e[1] * t[4] + e[3] * t[5] + e[5]]; };
                        Util.applyTransform = function (e, t) { return [e[0] * t[0] + e[1] * t[2] + t[4], e[0] * t[1] + e[1] * t[3] + t[5]]; };
                        Util.applyInverseTransform = function (e, t) { var r = t[0] * t[3] - t[1] * t[2]; return [(e[0] * t[3] - e[1] * t[2] + t[2] * t[5] - t[4] * t[3]) / r, (-e[0] * t[1] + e[1] * t[0] + t[4] * t[1] - t[5] * t[0]) / r]; };
                        Util.getAxialAlignedBoundingBox = function (e, t) { var r = Util.applyTransform(e, t), s = Util.applyTransform(e.slice(2, 4), t), n = Util.applyTransform([e[0], e[3]], t), a = Util.applyTransform([e[2], e[1]], t); return [Math.min(r[0], s[0], n[0], a[0]), Math.min(r[1], s[1], n[1], a[1]), Math.max(r[0], s[0], n[0], a[0]), Math.max(r[1], s[1], n[1], a[1])]; };
                        Util.inverseTransform = function (e) { var t = e[0] * e[3] - e[1] * e[2]; return [e[3] / t, -e[1] / t, -e[2] / t, e[0] / t, (e[2] * e[5] - e[4] * e[3]) / t, (e[4] * e[1] - e[5] * e[0]) / t]; };
                        Util.apply3dTransform = function (e, t) { return [e[0] * t[0] + e[1] * t[1] + e[2] * t[2], e[3] * t[0] + e[4] * t[1] + e[5] * t[2], e[6] * t[0] + e[7] * t[1] + e[8] * t[2]]; };
                        Util.singularValueDecompose2dScale = function (e) { var t = [e[0], e[2], e[1], e[3]], r = e[0] * t[0] + e[1] * t[2], s = e[0] * t[1] + e[1] * t[3], n = e[2] * t[0] + e[3] * t[2], a = e[2] * t[1] + e[3] * t[3], i = (r + a) / 2, o = Math.sqrt(Math.pow((r + a), 2) - 4 * (r * a - n * s)) / 2, l = i + o || 1, c = i - o || 1; return [Math.sqrt(l), Math.sqrt(c)]; };
                        Util.normalizeRect = function (e) { var t = e.slice(0); if (e[0] > e[2]) {
                            t[0] = e[2];
                            t[2] = e[0];
                        } if (e[1] > e[3]) {
                            t[1] = e[3];
                            t[3] = e[1];
                        } return t; };
                        Util.intersect = function (e, t) { function compare(e, t) { return e - t; } var r = [e[0], e[2], t[0], t[2]].sort(compare), s = [e[1], e[3], t[1], t[3]].sort(compare), n = []; e = Util.normalizeRect(e); t = Util.normalizeRect(t); if (!(r[0] === e[0] && r[1] === t[0] || r[0] === t[0] && r[1] === e[0]))
                            return null; n[0] = r[1]; n[2] = r[2]; if (!(s[0] === e[1] && s[1] === t[1] || s[0] === t[1] && s[1] === e[1]))
                            return null; n[1] = s[1]; n[3] = s[2]; return n; };
                        return Util;
                    }());  t.Util = Util; var h = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 728, 711, 710, 729, 733, 731, 730, 732, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8226, 8224, 8225, 8230, 8212, 8211, 402, 8260, 8249, 8250, 8722, 8240, 8222, 8220, 8221, 8216, 8217, 8218, 8482, 64257, 64258, 321, 338, 352, 376, 381, 305, 322, 339, 353, 382, 0, 8364]; }, function (e, t, r) { r(4); }, function (e, t) { Object.defineProperty(t, "__esModule", { value: !0 }); t.isNodeJS = void 0; var r = !("object" != typeof process || process + "" != "[object process]" || process.versions.nw || process.versions.electron && process.type && "browser" !== process.type); t.isNodeJS = r; }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.BaseSVGFactory = t.BaseStandardFontDataFactory = t.BaseCMapReaderFactory = t.BaseCanvasFactory = void 0; var s = r(2);
                    var BaseCanvasFactory = /** @class */ (function () {
                        function BaseCanvasFactory() {
                            this.constructor === BaseCanvasFactory && (0, s.unreachable)("Cannot initialize BaseCanvasFactory.");
                        }
                        BaseCanvasFactory.prototype.create = function (e, t) { if (e <= 0 || t <= 0)
                            throw new Error("Invalid canvas size"); var r = this._createCanvas(e, t); return { canvas: r, context: r.getContext("2d") }; };
                        BaseCanvasFactory.prototype.reset = function (e, t, r) { if (!e.canvas)
                            throw new Error("Canvas is not specified"); if (t <= 0 || r <= 0)
                            throw new Error("Invalid canvas size"); e.canvas.width = t; e.canvas.height = r; };
                        BaseCanvasFactory.prototype.destroy = function (e) { if (!e.canvas)
                            throw new Error("Canvas is not specified"); e.canvas.width = 0; e.canvas.height = 0; e.canvas = null; e.context = null; };
                        BaseCanvasFactory.prototype._createCanvas = function (e, t) { (0, s.unreachable)("Abstract method `_createCanvas` called."); };
                        return BaseCanvasFactory;
                    }());  t.BaseCanvasFactory = BaseCanvasFactory;
                    var BaseCMapReaderFactory = /** @class */ (function () {
                        function BaseCMapReaderFactory(_a) {
                            var _b = _a.baseUrl, e = _b === void 0 ? null : _b, _c = _a.isCompressed, t = _c === void 0 ? !1 : _c;
                            this.constructor === BaseCMapReaderFactory && (0, s.unreachable)("Cannot initialize BaseCMapReaderFactory.");
                            this.baseUrl = e;
                            this.isCompressed = t;
                        }
                        BaseCMapReaderFactory.prototype.fetch = function (_a) {
                            var e = _a.name;
                            return __awaiter(this, void 0, void 0, function () {
                                var t, r;
                                var _this = this;
                                return __generator(this, function (_b) {
                                    if (!this.baseUrl)
                                        throw new Error('The CMap "baseUrl" parameter must be specified, ensure that the "cMapUrl" and "cMapPacked" API parameters are provided.');
                                    if (!e)
                                        throw new Error("CMap name must be specified.");
                                    t = this.baseUrl + e + (this.isCompressed ? ".bcmap" : ""), r = this.isCompressed ? s.CMapCompressionType.BINARY : s.CMapCompressionType.NONE;
                                    return [2 /*return*/, this._fetchData(t, r).catch((function (e) { throw new Error("Unable to load " + (_this.isCompressed ? "binary " : "") + "CMap at: " + t); }))];
                                });
                            });
                        };
                        BaseCMapReaderFactory.prototype._fetchData = function (e, t) { (0, s.unreachable)("Abstract method `_fetchData` called."); };
                        return BaseCMapReaderFactory;
                    }());  t.BaseCMapReaderFactory = BaseCMapReaderFactory;
                    var BaseStandardFontDataFactory = /** @class */ (function () {
                        function BaseStandardFontDataFactory(_a) {
                            var _b = _a.baseUrl, e = _b === void 0 ? null : _b;
                            this.constructor === BaseStandardFontDataFactory && (0, s.unreachable)("Cannot initialize BaseStandardFontDataFactory.");
                            this.baseUrl = e;
                        }
                        BaseStandardFontDataFactory.prototype.fetch = function (_a) {
                            var e = _a.filename;
                            return __awaiter(this, void 0, void 0, function () { var t; return __generator(this, function (_b) {
                                if (!this.baseUrl)
                                    throw new Error('The standard font "baseUrl" parameter must be specified, ensure that the "standardFontDataUrl" API parameter is provided.');
                                if (!e)
                                    throw new Error("Font filename must be specified.");
                                t = "" + this.baseUrl + e;
                                return [2 /*return*/, this._fetchData(t).catch((function (e) { throw new Error("Unable to load font data at: " + t); }))];
                            }); });
                        };
                        BaseStandardFontDataFactory.prototype._fetchData = function (e) { (0, s.unreachable)("Abstract method `_fetchData` called."); };
                        return BaseStandardFontDataFactory;
                    }());  t.BaseStandardFontDataFactory = BaseStandardFontDataFactory;
                    var BaseSVGFactory = /** @class */ (function () {
                        function BaseSVGFactory() {
                            this.constructor === BaseSVGFactory && (0, s.unreachable)("Cannot initialize BaseSVGFactory.");
                        }
                        BaseSVGFactory.prototype.create = function (e, t) { if (e <= 0 || t <= 0)
                            throw new Error("Invalid SVG dimensions"); var r = this._createSVG("svg:svg"); r.setAttribute("version", "1.1"); r.setAttribute("width", e + "px"); r.setAttribute("height", t + "px"); r.setAttribute("preserveAspectRatio", "none"); r.setAttribute("viewBox", "0 0 " + e + " " + t); return r; };
                        BaseSVGFactory.prototype.createElement = function (e) { if ("string" != typeof e)
                            throw new Error("Invalid SVG element type"); return this._createSVG(e); };
                        BaseSVGFactory.prototype._createSVG = function (e) { (0, s.unreachable)("Abstract method `_createSVG` called."); };
                        return BaseSVGFactory;
                    }());  t.BaseSVGFactory = BaseSVGFactory; }, function (__unused_webpack_module, exports, __w_pdfjs_require__) { Object.defineProperty(exports, "__esModule", { value: !0 }); exports.getDocument = getDocument; exports.setPDFNetworkStreamFactory = setPDFNetworkStreamFactory; exports.version = exports.PDFWorker = exports.PDFPageProxy = exports.PDFDocumentProxy = exports.PDFDataRangeTransport = exports.LoopbackPort = exports.DefaultStandardFontDataFactory = exports.DefaultCMapReaderFactory = exports.DefaultCanvasFactory = exports.build = void 0; var _util = __w_pdfjs_require__(2), _display_utils = __w_pdfjs_require__(1), _font_loader = __w_pdfjs_require__(7), _node_utils = __w_pdfjs_require__(8), _annotation_storage = __w_pdfjs_require__(9), _canvas = __w_pdfjs_require__(10), _worker_options = __w_pdfjs_require__(12), _is_node = __w_pdfjs_require__(4), _message_handler = __w_pdfjs_require__(13), _metadata = __w_pdfjs_require__(14), _optional_content_config = __w_pdfjs_require__(15), _transport_stream = __w_pdfjs_require__(16); var DEFAULT_RANGE_CHUNK_SIZE = 65536, RENDERING_CANCELLED_TIMEOUT = 100, DefaultCanvasFactory = _is_node.isNodeJS ? _node_utils.NodeCanvasFactory : _display_utils.DOMCanvasFactory; exports.DefaultCanvasFactory = DefaultCanvasFactory; var DefaultCMapReaderFactory = _is_node.isNodeJS ? _node_utils.NodeCMapReaderFactory : _display_utils.DOMCMapReaderFactory; exports.DefaultCMapReaderFactory = DefaultCMapReaderFactory; var DefaultStandardFontDataFactory = _is_node.isNodeJS ? _node_utils.NodeStandardFontDataFactory : _display_utils.DOMStandardFontDataFactory; exports.DefaultStandardFontDataFactory = DefaultStandardFontDataFactory; var createPDFNetworkStream; function setPDFNetworkStreamFactory(e) { createPDFNetworkStream = e; } function getDocument(e) { var t = new PDFDocumentLoadingTask; var r; if ("string" == typeof e || e instanceof URL)
                    r = { url: e };
                else if ((0, _util.isArrayBuffer)(e))
                    r = { data: e };
                else if (e instanceof PDFDataRangeTransport)
                    r = { range: e };
                else {
                    if ("object" != typeof e)
                        throw new Error("Invalid parameter in getDocument, need either string, URL, Uint8Array, or parameter object.");
                    if (!e.url && !e.data && !e.range)
                        throw new Error("Invalid parameter object: need either .data, .range or .url");
                    r = e;
                } var s = Object.create(null); var n = null, a = null; for (var e_7 in r) {
                    var t_4 = r[e_7];
                    switch (e_7) {
                        case "url":
                            if ("undefined" != typeof window)
                                try {
                                    s[e_7] = new URL(t_4, window.location).href;
                                    continue;
                                }
                                catch (e) {
                                    (0, _util.warn)("Cannot create valid URL: \"" + e + "\".");
                                }
                            else if ("string" == typeof t_4 || t_4 instanceof URL) {
                                s[e_7] = t_4.toString();
                                continue;
                            }
                            throw new Error("Invalid PDF url data: either string or URL-object is expected in the url property.");
                        case "range":
                            n = t_4;
                            continue;
                        case "worker":
                            a = t_4;
                            continue;
                        case "data":
                            if (_is_node.isNodeJS && "undefined" != typeof Buffer && t_4 instanceof Buffer)
                                s[e_7] = new Uint8Array(t_4);
                            else {
                                if (t_4 instanceof Uint8Array)
                                    break;
                                if ("string" == typeof t_4)
                                    s[e_7] = (0, _util.stringToBytes)(t_4);
                                else if ("object" != typeof t_4 || null === t_4 || isNaN(t_4.length)) {
                                    if (!(0, _util.isArrayBuffer)(t_4))
                                        throw new Error("Invalid PDF binary data: either typed array, string, or array-like object is expected in the data property.");
                                    s[e_7] = new Uint8Array(t_4);
                                }
                                else
                                    s[e_7] = new Uint8Array(t_4);
                            }
                            continue;
                    }
                    s[e_7] = t_4;
                } s.rangeChunkSize = s.rangeChunkSize || DEFAULT_RANGE_CHUNK_SIZE; s.CMapReaderFactory = s.CMapReaderFactory || DefaultCMapReaderFactory; s.StandardFontDataFactory = s.StandardFontDataFactory || DefaultStandardFontDataFactory; s.ignoreErrors = !0 !== s.stopAtErrors; s.fontExtraProperties = !0 === s.fontExtraProperties; s.pdfBug = !0 === s.pdfBug; s.enableXfa = !0 === s.enableXfa; ("string" != typeof s.docBaseUrl || (0, _display_utils.isDataScheme)(s.docBaseUrl)) && (s.docBaseUrl = null); Number.isInteger(s.maxImageSize) || (s.maxImageSize = -1); "boolean" != typeof s.useWorkerFetch && (s.useWorkerFetch = s.CMapReaderFactory === _display_utils.DOMCMapReaderFactory && s.StandardFontDataFactory === _display_utils.DOMStandardFontDataFactory); "boolean" != typeof s.isEvalSupported && (s.isEvalSupported = !0); "boolean" != typeof s.disableFontFace && (s.disableFontFace = _is_node.isNodeJS); "boolean" != typeof s.useSystemFonts && (s.useSystemFonts = !_is_node.isNodeJS && !s.disableFontFace); void 0 === s.ownerDocument && (s.ownerDocument = globalThis.document); "boolean" != typeof s.disableRange && (s.disableRange = !1); "boolean" != typeof s.disableStream && (s.disableStream = !1); "boolean" != typeof s.disableAutoFetch && (s.disableAutoFetch = !1); (0, _util.setVerbosityLevel)(s.verbosity); if (!a) {
                    var e_8 = { verbosity: s.verbosity, port: _worker_options.GlobalWorkerOptions.workerPort };
                    a = e_8.port ? PDFWorker.fromPort(e_8) : new PDFWorker(e_8);
                    t._worker = a;
                } var i = t.docId; a.promise.then((function () { if (t.destroyed)
                    throw new Error("Loading aborted"); var e = _fetchDocument(a, s, n, i), r = new Promise((function (e) { var t; n ? t = new _transport_stream.PDFDataTransportStream({ length: s.length, initialData: s.initialData, progressiveDone: s.progressiveDone, contentDispositionFilename: s.contentDispositionFilename, disableRange: s.disableRange, disableStream: s.disableStream }, n) : s.data || (t = createPDFNetworkStream({ url: s.url, length: s.length, httpHeaders: s.httpHeaders, withCredentials: s.withCredentials, rangeChunkSize: s.rangeChunkSize, disableRange: s.disableRange, disableStream: s.disableStream })); e(t); })); return Promise.all([e, r]).then((function (_a) {
                    var _b = __read(_a, 2), e = _b[0], r = _b[1];
                    if (t.destroyed)
                        throw new Error("Loading aborted");
                    var n = new _message_handler.MessageHandler(i, e, a.port);
                    n.postMessageTransfers = a.postMessageTransfers;
                    var o = new WorkerTransport(n, t, r, s);
                    t._transport = o;
                    n.send("Ready", null);
                })); })).catch(t._capability.reject); return t; } function _fetchDocument(e, t, r, s) { if (e.destroyed)
                    return Promise.reject(new Error("Worker was destroyed")); if (r) {
                    t.length = r.length;
                    t.initialData = r.initialData;
                    t.progressiveDone = r.progressiveDone;
                    t.contentDispositionFilename = r.contentDispositionFilename;
                } return e.messageHandler.sendWithPromise("GetDocRequest", { docId: s, apiVersion: "2.10.377", source: { data: t.data, url: t.url, password: t.password, disableAutoFetch: t.disableAutoFetch, rangeChunkSize: t.rangeChunkSize, length: t.length }, maxImageSize: t.maxImageSize, disableFontFace: t.disableFontFace, postMessageTransfers: e.postMessageTransfers, docBaseUrl: t.docBaseUrl, ignoreErrors: t.ignoreErrors, isEvalSupported: t.isEvalSupported, fontExtraProperties: t.fontExtraProperties, enableXfa: t.enableXfa, useSystemFonts: t.useSystemFonts, cMapUrl: t.useWorkerFetch ? t.cMapUrl : null, standardFontDataUrl: t.useWorkerFetch ? t.standardFontDataUrl : null }).then((function (t) { if (e.destroyed)
                    throw new Error("Worker was destroyed"); return t; })); } var PDFDocumentLoadingTask = function PDFDocumentLoadingTaskClosure() { var e = 0; return /** @class */ (function () {
                    function PDFDocumentLoadingTask() {
                        this._capability = (0, _util.createPromiseCapability)();
                        this._transport = null;
                        this._worker = null;
                        this.docId = "d" + e++;
                        this.destroyed = !1;
                        this.onPassword = null;
                        this.onProgress = null;
                        this.onUnsupportedFeature = null;
                    }
                    Object.defineProperty(PDFDocumentLoadingTask.prototype, "promise", {
                        get: function () { return this._capability.promise; },
                        enumerable: false,
                        configurable: true
                    });
                    PDFDocumentLoadingTask.prototype.destroy = function () {
                        var _this = this;
                        this.destroyed = !0;
                        return (this._transport ? this._transport.destroy() : Promise.resolve()).then((function () { _this._transport = null; if (_this._worker) {
                            _this._worker.destroy();
                            _this._worker = null;
                        } }));
                    };
                    return PDFDocumentLoadingTask;
                }()); }();
                    var PDFDataRangeTransport = /** @class */ (function () {
                        function PDFDataRangeTransport(e, t, r, s) {
                            if (r === void 0) { r = !1; }
                            if (s === void 0) { s = null; }
                            this.length = e;
                            this.initialData = t;
                            this.progressiveDone = r;
                            this.contentDispositionFilename = s;
                            this._rangeListeners = [];
                            this._progressListeners = [];
                            this._progressiveReadListeners = [];
                            this._progressiveDoneListeners = [];
                            this._readyCapability = (0, _util.createPromiseCapability)();
                        }
                        PDFDataRangeTransport.prototype.addRangeListener = function (e) { this._rangeListeners.push(e); };
                        PDFDataRangeTransport.prototype.addProgressListener = function (e) { this._progressListeners.push(e); };
                        PDFDataRangeTransport.prototype.addProgressiveReadListener = function (e) { this._progressiveReadListeners.push(e); };
                        PDFDataRangeTransport.prototype.addProgressiveDoneListener = function (e) { this._progressiveDoneListeners.push(e); };
                        PDFDataRangeTransport.prototype.onDataRange = function (e, t) {
                            var e_9, _a;
                            try {
                                for (var _b = __values(this._rangeListeners), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var r = _c.value;
                                    r(e, t);
                                }
                            }
                            catch (e_9_1) { e_9 = { error: e_9_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_9) throw e_9.error; }
                            }
                        };
                        PDFDataRangeTransport.prototype.onDataProgress = function (e, t) {
                            var _this = this;
                            this._readyCapability.promise.then((function () {
                                var e_10, _a;
                                try {
                                    for (var _b = __values(_this._progressListeners), _c = _b.next(); !_c.done; _c = _b.next()) {
                                        var r = _c.value;
                                        r(e, t);
                                    }
                                }
                                catch (e_10_1) { e_10 = { error: e_10_1 }; }
                                finally {
                                    try {
                                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                    }
                                    finally { if (e_10) throw e_10.error; }
                                }
                            }));
                        };
                        PDFDataRangeTransport.prototype.onDataProgressiveRead = function (e) {
                            var _this = this;
                            this._readyCapability.promise.then((function () {
                                var e_11, _a;
                                try {
                                    for (var _b = __values(_this._progressiveReadListeners), _c = _b.next(); !_c.done; _c = _b.next()) {
                                        var t = _c.value;
                                        t(e);
                                    }
                                }
                                catch (e_11_1) { e_11 = { error: e_11_1 }; }
                                finally {
                                    try {
                                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                    }
                                    finally { if (e_11) throw e_11.error; }
                                }
                            }));
                        };
                        PDFDataRangeTransport.prototype.onDataProgressiveDone = function () {
                            var _this = this;
                            this._readyCapability.promise.then((function () {
                                var e_12, _a;
                                try {
                                    for (var _b = __values(_this._progressiveDoneListeners), _c = _b.next(); !_c.done; _c = _b.next()) {
                                        var e = _c.value;
                                        e();
                                    }
                                }
                                catch (e_12_1) { e_12 = { error: e_12_1 }; }
                                finally {
                                    try {
                                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                    }
                                    finally { if (e_12) throw e_12.error; }
                                }
                            }));
                        };
                        PDFDataRangeTransport.prototype.transportReady = function () { this._readyCapability.resolve(); };
                        PDFDataRangeTransport.prototype.requestDataRange = function (e, t) { (0, _util.unreachable)("Abstract method PDFDataRangeTransport.requestDataRange"); };
                        PDFDataRangeTransport.prototype.abort = function () { };
                        return PDFDataRangeTransport;
                    }());  exports.PDFDataRangeTransport = PDFDataRangeTransport;
                    var PDFDocumentProxy = /** @class */ (function () {
                        function PDFDocumentProxy(e, t) {
                            this._pdfInfo = e;
                            this._transport = t;
                            Object.defineProperty(this, "fingerprint", { get: function () { (0, _display_utils.deprecated)("`PDFDocumentProxy.fingerprint`, please use `PDFDocumentProxy.fingerprints` instead."); return this.fingerprints[0]; } });
                        }
                        Object.defineProperty(PDFDocumentProxy.prototype, "annotationStorage", {
                            get: function () { return this._transport.annotationStorage; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFDocumentProxy.prototype, "numPages", {
                            get: function () { return this._pdfInfo.numPages; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFDocumentProxy.prototype, "fingerprints", {
                            get: function () { return this._pdfInfo.fingerprints; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFDocumentProxy.prototype, "isPureXfa", {
                            get: function () { return !!this._transport._htmlForXfa; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFDocumentProxy.prototype, "allXfaHtml", {
                            get: function () { return this._transport._htmlForXfa; },
                            enumerable: false,
                            configurable: true
                        });
                        PDFDocumentProxy.prototype.getPage = function (e) { return this._transport.getPage(e); };
                        PDFDocumentProxy.prototype.getPageIndex = function (e) { return this._transport.getPageIndex(e); };
                        PDFDocumentProxy.prototype.getDestinations = function () { return this._transport.getDestinations(); };
                        PDFDocumentProxy.prototype.getDestination = function (e) { return this._transport.getDestination(e); };
                        PDFDocumentProxy.prototype.getPageLabels = function () { return this._transport.getPageLabels(); };
                        PDFDocumentProxy.prototype.getPageLayout = function () { return this._transport.getPageLayout(); };
                        PDFDocumentProxy.prototype.getPageMode = function () { return this._transport.getPageMode(); };
                        PDFDocumentProxy.prototype.getViewerPreferences = function () { return this._transport.getViewerPreferences(); };
                        PDFDocumentProxy.prototype.getOpenAction = function () { return this._transport.getOpenAction(); };
                        PDFDocumentProxy.prototype.getAttachments = function () { return this._transport.getAttachments(); };
                        PDFDocumentProxy.prototype.getJavaScript = function () { return this._transport.getJavaScript(); };
                        PDFDocumentProxy.prototype.getJSActions = function () { return this._transport.getDocJSActions(); };
                        PDFDocumentProxy.prototype.getOutline = function () { return this._transport.getOutline(); };
                        PDFDocumentProxy.prototype.getOptionalContentConfig = function () { return this._transport.getOptionalContentConfig(); };
                        PDFDocumentProxy.prototype.getPermissions = function () { return this._transport.getPermissions(); };
                        PDFDocumentProxy.prototype.getMetadata = function () { return this._transport.getMetadata(); };
                        PDFDocumentProxy.prototype.getMarkInfo = function () { return this._transport.getMarkInfo(); };
                        PDFDocumentProxy.prototype.getData = function () { return this._transport.getData(); };
                        PDFDocumentProxy.prototype.getDownloadInfo = function () { return this._transport.downloadInfoCapability.promise; };
                        PDFDocumentProxy.prototype.getStats = function () { return this._transport.getStats(); };
                        PDFDocumentProxy.prototype.cleanup = function (e) {
                            if (e === void 0) { e = !1; }
                            return this._transport.startCleanup(e || this.isPureXfa);
                        };
                        PDFDocumentProxy.prototype.destroy = function () { return this.loadingTask.destroy(); };
                        Object.defineProperty(PDFDocumentProxy.prototype, "loadingParams", {
                            get: function () { return this._transport.loadingParams; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFDocumentProxy.prototype, "loadingTask", {
                            get: function () { return this._transport.loadingTask; },
                            enumerable: false,
                            configurable: true
                        });
                        PDFDocumentProxy.prototype.saveDocument = function () { this._transport.annotationStorage.size <= 0 && (0, _display_utils.deprecated)("saveDocument called while `annotationStorage` is empty, please use the getData-method instead."); return this._transport.saveDocument(); };
                        PDFDocumentProxy.prototype.getFieldObjects = function () { return this._transport.getFieldObjects(); };
                        PDFDocumentProxy.prototype.hasJSActions = function () { return this._transport.hasJSActions(); };
                        PDFDocumentProxy.prototype.getCalculationOrderIds = function () { return this._transport.getCalculationOrderIds(); };
                        return PDFDocumentProxy;
                    }());  exports.PDFDocumentProxy = PDFDocumentProxy;
                    var PDFPageProxy = /** @class */ (function () {
                        function PDFPageProxy(e, t, r, s, n) {
                            if (n === void 0) { n = !1; }
                            this._pageIndex = e;
                            this._pageInfo = t;
                            this._ownerDocument = s;
                            this._transport = r;
                            this._stats = n ? new _display_utils.StatTimer : null;
                            this._pdfBug = n;
                            this.commonObjs = r.commonObjs;
                            this.objs = new PDFObjects;
                            this.cleanupAfterRender = !1;
                            this.pendingCleanup = !1;
                            this._intentStates = new Map;
                            this.destroyed = !1;
                        }
                        Object.defineProperty(PDFPageProxy.prototype, "pageNumber", {
                            get: function () { return this._pageIndex + 1; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFPageProxy.prototype, "rotate", {
                            get: function () { return this._pageInfo.rotate; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFPageProxy.prototype, "ref", {
                            get: function () { return this._pageInfo.ref; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFPageProxy.prototype, "userUnit", {
                            get: function () { return this._pageInfo.userUnit; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFPageProxy.prototype, "view", {
                            get: function () { return this._pageInfo.view; },
                            enumerable: false,
                            configurable: true
                        });
                        PDFPageProxy.prototype.getViewport = function (_a) {
                            var _b = _a === void 0 ? {} : _a, e = _b.scale, _c = _b.rotation, t = _c === void 0 ? this.rotate : _c, _d = _b.offsetX, r = _d === void 0 ? 0 : _d, _e = _b.offsetY, s = _e === void 0 ? 0 : _e, _f = _b.dontFlip, n = _f === void 0 ? !1 : _f;
                            return new _display_utils.PageViewport({ viewBox: this.view, scale: e, rotation: t, offsetX: r, offsetY: s, dontFlip: n });
                        };
                        PDFPageProxy.prototype.getAnnotations = function (_a) {
                            var _b = _a === void 0 ? {} : _a, _c = _b.intent, e = _c === void 0 ? null : _c;
                            var t = "display" === e || "print" === e ? e : null;
                            if (!this._annotationsPromise || this._annotationsIntent !== t) {
                                this._annotationsPromise = this._transport.getAnnotations(this._pageIndex, t);
                                this._annotationsIntent = t;
                            }
                            return this._annotationsPromise;
                        };
                        PDFPageProxy.prototype.getJSActions = function () { return this._jsActionsPromise || (this._jsActionsPromise = this._transport.getPageJSActions(this._pageIndex)); };
                        PDFPageProxy.prototype.getXfa = function () {
                            var _a;
                            return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
                                return [2 /*return*/, ((_a = this._transport._htmlForXfa) === null || _a === void 0 ? void 0 : _a.children[this._pageIndex]) || null];
                            }); });
                        };
                        PDFPageProxy.prototype.render = function (_a) {
                            var _this = this;
                            var e = _a.canvasContext, t = _a.viewport, _b = _a.intent, r = _b === void 0 ? "display" : _b, _c = _a.renderInteractiveForms, s = _c === void 0 ? !1 : _c, _d = _a.transform, n = _d === void 0 ? null : _d, _e = _a.imageLayer, a = _e === void 0 ? null : _e, _f = _a.canvasFactory, i = _f === void 0 ? null : _f, _g = _a.background, o = _g === void 0 ? null : _g, _h = _a.includeAnnotationStorage, l = _h === void 0 ? !1 : _h, _j = _a.optionalContentConfigPromise, c = _j === void 0 ? null : _j;
                            var h;
                            this._stats && this._stats.time("Overall");
                            var d = "print" === r ? "print" : "display";
                            this.pendingCleanup = !1;
                            c || (c = this._transport.getOptionalContentConfig());
                            var u = this._intentStates.get(d);
                            if (!u) {
                                u = Object.create(null);
                                this._intentStates.set(d, u);
                            }
                            if (u.streamReaderCancelTimeout) {
                                clearTimeout(u.streamReaderCancelTimeout);
                                u.streamReaderCancelTimeout = null;
                            }
                            var p = i || new DefaultCanvasFactory({ ownerDocument: this._ownerDocument }), g = l ? this._transport.annotationStorage.serializable : null;
                            if (!u.displayReadyCapability) {
                                u.displayReadyCapability = (0, _util.createPromiseCapability)();
                                u.operatorList = { fnArray: [], argsArray: [], lastChunk: !1 };
                                this._stats && this._stats.time("Page Request");
                                this._pumpOperatorList({ pageIndex: this._pageIndex, intent: d, renderInteractiveForms: !0 === s, annotationStorage: g });
                            }
                            var complete = function (e) { u.renderTasks.delete(f); (_this.cleanupAfterRender || "print" === d) && (_this.pendingCleanup = !0); _this._tryCleanup(); if (e) {
                                f.capability.reject(e);
                                _this._abortOperatorList({ intentState: u, reason: e });
                            }
                            else
                                f.capability.resolve(); if (_this._stats) {
                                _this._stats.timeEnd("Rendering");
                                _this._stats.timeEnd("Overall");
                            } }, f = new InternalRenderTask({ callback: complete, params: { canvasContext: e, viewport: t, transform: n, imageLayer: a, background: o }, objs: this.objs, commonObjs: this.commonObjs, operatorList: u.operatorList, pageIndex: this._pageIndex, canvasFactory: p, useRequestAnimationFrame: "print" !== d, pdfBug: this._pdfBug });
                            ((h = u).renderTasks || (h.renderTasks = new Set)).add(f);
                            var m = f.task;
                            Promise.all([u.displayReadyCapability.promise, c]).then((function (_a) {
                                var _b = __read(_a, 2), e = _b[0], t = _b[1];
                                if (_this.pendingCleanup)
                                    complete();
                                else {
                                    _this._stats && _this._stats.time("Rendering");
                                    f.initializeGraphics({ transparency: e, optionalContentConfig: t });
                                    f.operatorListChanged();
                                }
                            })).catch(complete);
                            return m;
                        };
                        PDFPageProxy.prototype.getOperatorList = function (_a) {
                            var _b = _a === void 0 ? {} : _a, _c = _b.intent, e = _c === void 0 ? "display" : _c;
                            var t = "oplist-" + ("print" === e ? "print" : "display");
                            var r, s = this._intentStates.get(t);
                            if (!s) {
                                s = Object.create(null);
                                this._intentStates.set(t, s);
                            }
                            if (!s.opListReadCapability) {
                                var n;
                                r = Object.create(null);
                                r.operatorListChanged = function operatorListChanged() { if (s.operatorList.lastChunk) {
                                    s.opListReadCapability.resolve(s.operatorList);
                                    s.renderTasks.delete(r);
                                } };
                                s.opListReadCapability = (0, _util.createPromiseCapability)();
                                ((n = s).renderTasks || (n.renderTasks = new Set)).add(r);
                                s.operatorList = { fnArray: [], argsArray: [], lastChunk: !1 };
                                this._stats && this._stats.time("Page Request");
                                this._pumpOperatorList({ pageIndex: this._pageIndex, intent: t });
                            }
                            return s.opListReadCapability.promise;
                        };
                        PDFPageProxy.prototype.streamTextContent = function (_a) {
                            var _b = _a === void 0 ? {} : _a, _c = _b.normalizeWhitespace, e = _c === void 0 ? !1 : _c, _d = _b.disableCombineTextItems, t = _d === void 0 ? !1 : _d, _e = _b.includeMarkedContent, r = _e === void 0 ? !1 : _e;
                            return this._transport.messageHandler.sendWithStream("GetTextContent", { pageIndex: this._pageIndex, normalizeWhitespace: !0 === e, combineTextItems: !0 !== t, includeMarkedContent: !0 === r }, { highWaterMark: 100, size: function (e) { return e.items.length; } });
                        };
                        PDFPageProxy.prototype.getTextContent = function (e) {
                            if (e === void 0) { e = {}; }
                            var t = this.streamTextContent(e);
                            return new Promise((function (e, r) { var s = t.getReader(), n = { items: [], styles: Object.create(null) }; !function pump() { s.read().then((function (_a) {
                                var _b;
                                var t = _a.value, r = _a.done;
                                if (r)
                                    e(n);
                                else {
                                    Object.assign(n.styles, t.styles);
                                    (_b = n.items).push.apply(_b, __spreadArray([], __read(t.items)));
                                    pump();
                                }
                            }), r); }(); }));
                        };
                        PDFPageProxy.prototype.getStructTree = function () { return this._structTreePromise || (this._structTreePromise = this._transport.getStructTree(this._pageIndex)); };
                        PDFPageProxy.prototype._destroy = function () {
                            var e_13, _a, e_14, _b;
                            this.destroyed = !0;
                            this._transport.pageCache[this._pageIndex] = null;
                            var e = [];
                            try {
                                for (var _c = __values(this._intentStates), _d = _c.next(); !_d.done; _d = _c.next()) {
                                    var _e = __read(_d.value, 2), t = _e[0], r = _e[1];
                                    this._abortOperatorList({ intentState: r, reason: new Error("Page was destroyed."), force: !0 });
                                    if (!t.startsWith("oplist-"))
                                        try {
                                            for (var _f = (e_14 = void 0, __values(r.renderTasks)), _g = _f.next(); !_g.done; _g = _f.next()) {
                                                var t_5 = _g.value;
                                                e.push(t_5.completed);
                                                t_5.cancel();
                                            }
                                        }
                                        catch (e_14_1) { e_14 = { error: e_14_1 }; }
                                        finally {
                                            try {
                                                if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                                            }
                                            finally { if (e_14) throw e_14.error; }
                                        }
                                }
                            }
                            catch (e_13_1) { e_13 = { error: e_13_1 }; }
                            finally {
                                try {
                                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                                }
                                finally { if (e_13) throw e_13.error; }
                            }
                            this.objs.clear();
                            this._annotationsPromise = null;
                            this._jsActionsPromise = null;
                            this._structTreePromise = null;
                            this.pendingCleanup = !1;
                            return Promise.all(e);
                        };
                        PDFPageProxy.prototype.cleanup = function (e) {
                            if (e === void 0) { e = !1; }
                            this.pendingCleanup = !0;
                            return this._tryCleanup(e);
                        };
                        PDFPageProxy.prototype._tryCleanup = function (e) {
                            var e_15, _a;
                            if (e === void 0) { e = !1; }
                            if (!this.pendingCleanup)
                                return !1;
                            try {
                                for (var _b = __values(this._intentStates.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var _d = _c.value, e_16 = _d.renderTasks, t = _d.operatorList;
                                    if (e_16.size > 0 || !t.lastChunk)
                                        return !1;
                                }
                            }
                            catch (e_15_1) { e_15 = { error: e_15_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_15) throw e_15.error; }
                            }
                            this._intentStates.clear();
                            this.objs.clear();
                            this._annotationsPromise = null;
                            this._jsActionsPromise = null;
                            this._structTreePromise = null;
                            e && this._stats && (this._stats = new _display_utils.StatTimer);
                            this.pendingCleanup = !1;
                            return !0;
                        };
                        PDFPageProxy.prototype._startRenderPage = function (e, t) { var r = this._intentStates.get(t); if (r) {
                            this._stats && this._stats.timeEnd("Page Request");
                            r.displayReadyCapability && r.displayReadyCapability.resolve(e);
                        } };
                        PDFPageProxy.prototype._renderPageChunk = function (e, t) {
                            var e_17, _a;
                            for (var r = 0, s = e.length; r < s; r++) {
                                t.operatorList.fnArray.push(e.fnArray[r]);
                                t.operatorList.argsArray.push(e.argsArray[r]);
                            }
                            t.operatorList.lastChunk = e.lastChunk;
                            try {
                                for (var _b = __values(t.renderTasks), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var e_18 = _c.value;
                                    e_18.operatorListChanged();
                                }
                            }
                            catch (e_17_1) { e_17 = { error: e_17_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_17) throw e_17.error; }
                            }
                            e.lastChunk && this._tryCleanup();
                        };
                        PDFPageProxy.prototype._pumpOperatorList = function (e) {
                            var _this = this;
                            (0, _util.assert)(e.intent, 'PDFPageProxy._pumpOperatorList: Expected "intent" argument.');
                            var t = this._transport.messageHandler.sendWithStream("GetOperatorList", e).getReader(), r = this._intentStates.get(e.intent);
                            r.streamReader = t;
                            var pump = function () { t.read().then((function (_a) {
                                var e = _a.value, t = _a.done;
                                if (t)
                                    r.streamReader = null;
                                else if (!_this._transport.destroyed) {
                                    _this._renderPageChunk(e, r);
                                    pump();
                                }
                            }), (function (e) {
                                var e_19, _a;
                                r.streamReader = null;
                                if (!_this._transport.destroyed) {
                                    if (r.operatorList) {
                                        r.operatorList.lastChunk = !0;
                                        try {
                                            for (var _b = __values(r.renderTasks), _c = _b.next(); !_c.done; _c = _b.next()) {
                                                var e_20 = _c.value;
                                                e_20.operatorListChanged();
                                            }
                                        }
                                        catch (e_19_1) { e_19 = { error: e_19_1 }; }
                                        finally {
                                            try {
                                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                            }
                                            finally { if (e_19) throw e_19.error; }
                                        }
                                        _this._tryCleanup();
                                    }
                                    if (r.displayReadyCapability)
                                        r.displayReadyCapability.reject(e);
                                    else {
                                        if (!r.opListReadCapability)
                                            throw e;
                                        r.opListReadCapability.reject(e);
                                    }
                                }
                            })); };
                            pump();
                        };
                        PDFPageProxy.prototype._abortOperatorList = function (_a) {
                            var e_21, _b;
                            var _this = this;
                            var e = _a.intentState, t = _a.reason, _c = _a.force, r = _c === void 0 ? !1 : _c;
                            (0, _util.assert)(t instanceof Error || "object" == typeof t && null !== t, 'PDFPageProxy._abortOperatorList: Expected "reason" argument.');
                            if (e.streamReader) {
                                if (!r) {
                                    if (e.renderTasks.size > 0)
                                        return;
                                    if (t instanceof _display_utils.RenderingCancelledException) {
                                        e.streamReaderCancelTimeout = setTimeout((function () { _this._abortOperatorList({ intentState: e, reason: t, force: !0 }); e.streamReaderCancelTimeout = null; }), RENDERING_CANCELLED_TIMEOUT);
                                        return;
                                    }
                                }
                                e.streamReader.cancel(new _util.AbortException(t === null || t === void 0 ? void 0 : t.message));
                                e.streamReader = null;
                                if (!this._transport.destroyed) {
                                    try {
                                        for (var _d = __values(this._intentStates), _e = _d.next(); !_e.done; _e = _d.next()) {
                                            var _f = __read(_e.value, 2), t_6 = _f[0], r_11 = _f[1];
                                            if (r_11 === e) {
                                                this._intentStates.delete(t_6);
                                                break;
                                            }
                                        }
                                    }
                                    catch (e_21_1) { e_21 = { error: e_21_1 }; }
                                    finally {
                                        try {
                                            if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                                        }
                                        finally { if (e_21) throw e_21.error; }
                                    }
                                    this.cleanup();
                                }
                            }
                        };
                        Object.defineProperty(PDFPageProxy.prototype, "stats", {
                            get: function () { return this._stats; },
                            enumerable: false,
                            configurable: true
                        });
                        return PDFPageProxy;
                    }());  exports.PDFPageProxy = PDFPageProxy;
                    var LoopbackPort = /** @class */ (function () {
                        function LoopbackPort() {
                            this._listeners = [];
                            this._deferred = Promise.resolve(void 0);
                        }
                        LoopbackPort.prototype.postMessage = function (e, t) {
                            var _this = this;
                            var r = new WeakMap, s = { data: function cloneValue(e) {
                                    var e_22, _a, e_23, _b;
                                    var _c;
                                    if ("function" == typeof e || "symbol" == typeof e || e instanceof URL)
                                        throw new Error("LoopbackPort.postMessage - cannot clone: " + (e === null || e === void 0 ? void 0 : e.toString()));
                                    if ("object" != typeof e || null === e)
                                        return e;
                                    if (r.has(e))
                                        return r.get(e);
                                    var s, n;
                                    if ((s = e.buffer) && (0, _util.isArrayBuffer)(s)) {
                                        n = (t === null || t === void 0 ? void 0 : t.includes(s)) ? new e.constructor(s, e.byteOffset, e.byteLength) : new e.constructor(e);
                                        r.set(e, n);
                                        return n;
                                    }
                                    if (e instanceof Map) {
                                        n = new Map;
                                        r.set(e, n);
                                        try {
                                            for (var e_24 = __values(e), e_24_1 = e_24.next(); !e_24_1.done; e_24_1 = e_24.next()) {
                                                var _d = __read(e_24_1.value, 2), t_7 = _d[0], r_12 = _d[1];
                                                n.set(t_7, cloneValue(r_12));
                                            }
                                        }
                                        catch (e_22_1) { e_22 = { error: e_22_1 }; }
                                        finally {
                                            try {
                                                if (e_24_1 && !e_24_1.done && (_a = e_24.return)) _a.call(e_24);
                                            }
                                            finally { if (e_22) throw e_22.error; }
                                        }
                                        return n;
                                    }
                                    if (e instanceof Set) {
                                        n = new Set;
                                        r.set(e, n);
                                        try {
                                            for (var e_25 = __values(e), e_25_1 = e_25.next(); !e_25_1.done; e_25_1 = e_25.next()) {
                                                var t_8 = e_25_1.value;
                                                n.add(cloneValue(t_8));
                                            }
                                        }
                                        catch (e_23_1) { e_23 = { error: e_23_1 }; }
                                        finally {
                                            try {
                                                if (e_25_1 && !e_25_1.done && (_b = e_25.return)) _b.call(e_25);
                                            }
                                            finally { if (e_23) throw e_23.error; }
                                        }
                                        return n;
                                    }
                                    n = Array.isArray(e) ? [] : Object.create(null);
                                    r.set(e, n);
                                    for (var t_9 in e) {
                                        var r_13 = void 0, s_11 = e;
                                        for (; !(r_13 = Object.getOwnPropertyDescriptor(s_11, t_9));)
                                            s_11 = Object.getPrototypeOf(s_11);
                                        void 0 !== r_13.value && (("function" != typeof r_13.value || ((_c = e.hasOwnProperty) === null || _c === void 0 ? void 0 : _c.call(e, t_9))) && (n[t_9] = cloneValue(r_13.value)));
                                    }
                                    return n;
                                }(e) };
                            this._deferred.then((function () {
                                var e_26, _a;
                                try {
                                    for (var _b = __values(_this._listeners), _c = _b.next(); !_c.done; _c = _b.next()) {
                                        var e_27 = _c.value;
                                        e_27.call(_this, s);
                                    }
                                }
                                catch (e_26_1) { e_26 = { error: e_26_1 }; }
                                finally {
                                    try {
                                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                    }
                                    finally { if (e_26) throw e_26.error; }
                                }
                            }));
                        };
                        LoopbackPort.prototype.addEventListener = function (e, t) { this._listeners.push(t); };
                        LoopbackPort.prototype.removeEventListener = function (e, t) { var r = this._listeners.indexOf(t); this._listeners.splice(r, 1); };
                        LoopbackPort.prototype.terminate = function () { this._listeners.length = 0; };
                        return LoopbackPort;
                    }());  exports.LoopbackPort = LoopbackPort; var PDFWorker = function PDFWorkerClosure() { var _a; var pdfWorkerPorts = new WeakMap; var isWorkerDisabled = !1, fallbackWorkerSrc, nextFakeWorkerId = 0, fakeWorkerCapability; if (_is_node.isNodeJS && "function" == typeof commonjsRequire) {
                    isWorkerDisabled = !0;
                    fallbackWorkerSrc = "./pdf.worker.js";
                }
                else if ("object" == typeof document && "currentScript" in document) {
                    var e = (_a = document.currentScript) === null || _a === void 0 ? void 0 : _a.src;
                    e && (fallbackWorkerSrc = e.replace(/(\.(?:min\.)?js)(\?.*)?$/i, ".worker$1$2"));
                } function getWorkerSrc() { if (_worker_options.GlobalWorkerOptions.workerSrc)
                    return _worker_options.GlobalWorkerOptions.workerSrc; if (void 0 !== fallbackWorkerSrc) {
                    _is_node.isNodeJS || (0, _display_utils.deprecated)('No "GlobalWorkerOptions.workerSrc" specified.');
                    return fallbackWorkerSrc;
                } throw new Error('No "GlobalWorkerOptions.workerSrc" specified.'); } function getMainThreadWorkerMessageHandler() { var _a; var e; try {
                    e = (_a = globalThis.pdfjsWorker) === null || _a === void 0 ? void 0 : _a.WorkerMessageHandler;
                }
                catch (e) { } return e || null; } function setupFakeWorkerGlobal() { if (fakeWorkerCapability)
                    return fakeWorkerCapability.promise; fakeWorkerCapability = (0, _util.createPromiseCapability)(); var loader = function () {
                    return __awaiter(this, void 0, void 0, function () { var mainWorkerMessageHandler, worker; return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                mainWorkerMessageHandler = getMainThreadWorkerMessageHandler();
                                if (mainWorkerMessageHandler)
                                    return [2 /*return*/, mainWorkerMessageHandler];
                                if (_is_node.isNodeJS && "function" == typeof commonjsRequire) {
                                    worker = eval("require")(getWorkerSrc());
                                    return [2 /*return*/, worker.WorkerMessageHandler];
                                }
                                return [4 /*yield*/, (0, _display_utils.loadScript)(getWorkerSrc())];
                            case 1:
                                _a.sent();
                                return [2 /*return*/, window.pdfjsWorker.WorkerMessageHandler];
                        }
                    }); });
                }; loader().then(fakeWorkerCapability.resolve, fakeWorkerCapability.reject); return fakeWorkerCapability.promise; } function createCDNWrapper(e) { var t = "importScripts('" + e + "');"; return URL.createObjectURL(new Blob([t])); }
                    var PDFWorker = /** @class */ (function () {
                        function PDFWorker(_a) {
                            var _b = _a === void 0 ? {} : _a, _c = _b.name, e = _c === void 0 ? null : _c, _d = _b.port, t = _d === void 0 ? null : _d, _e = _b.verbosity, r = _e === void 0 ? (0, _util.getVerbosityLevel)() : _e;
                            if (t && pdfWorkerPorts.has(t))
                                throw new Error("Cannot use more than one PDFWorker per port");
                            this.name = e;
                            this.destroyed = !1;
                            this.postMessageTransfers = !0;
                            this.verbosity = r;
                            this._readyCapability = (0, _util.createPromiseCapability)();
                            this._port = null;
                            this._webWorker = null;
                            this._messageHandler = null;
                            if (t) {
                                pdfWorkerPorts.set(t, this);
                                this._initializeFromPort(t);
                            }
                            else
                                this._initialize();
                        }
                        Object.defineProperty(PDFWorker.prototype, "promise", {
                            get: function () { return this._readyCapability.promise; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFWorker.prototype, "port", {
                            get: function () { return this._port; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFWorker.prototype, "messageHandler", {
                            get: function () { return this._messageHandler; },
                            enumerable: false,
                            configurable: true
                        });
                        PDFWorker.prototype._initializeFromPort = function (e) { this._port = e; this._messageHandler = new _message_handler.MessageHandler("main", "worker", e); this._messageHandler.on("ready", (function () { })); this._readyCapability.resolve(); };
                        PDFWorker.prototype._initialize = function () {
                            var _this = this;
                            if ("undefined" != typeof Worker && !isWorkerDisabled && !getMainThreadWorkerMessageHandler()) {
                                var e = getWorkerSrc();
                                try {
                                    (0, _util.isSameOrigin)(window.location.href, e) || (e = createCDNWrapper(new URL(e, window.location).href));
                                    var t_10 = new Worker(e), r_14 = new _message_handler.MessageHandler("main", "worker", t_10), terminateEarly_1 = function () { t_10.removeEventListener("error", onWorkerError_1); r_14.destroy(); t_10.terminate(); _this.destroyed ? _this._readyCapability.reject(new Error("Worker was destroyed")) : _this._setupFakeWorker(); }, onWorkerError_1 = function () { _this._webWorker || terminateEarly_1(); };
                                    t_10.addEventListener("error", onWorkerError_1);
                                    r_14.on("test", (function (e) { t_10.removeEventListener("error", onWorkerError_1); if (_this.destroyed)
                                        terminateEarly_1();
                                    else if (e) {
                                        _this._messageHandler = r_14;
                                        _this._port = t_10;
                                        _this._webWorker = t_10;
                                        e.supportTransfers || (_this.postMessageTransfers = !1);
                                        _this._readyCapability.resolve();
                                        r_14.send("configure", { verbosity: _this.verbosity });
                                    }
                                    else {
                                        _this._setupFakeWorker();
                                        r_14.destroy();
                                        t_10.terminate();
                                    } }));
                                    r_14.on("ready", (function (e) { t_10.removeEventListener("error", onWorkerError_1); if (_this.destroyed)
                                        terminateEarly_1();
                                    else
                                        try {
                                            sendTest_1();
                                        }
                                        catch (e) {
                                            _this._setupFakeWorker();
                                        } }));
                                    var sendTest_1 = function () { var e = new Uint8Array([_this.postMessageTransfers ? 255 : 0]); try {
                                        r_14.send("test", e, [e.buffer]);
                                    }
                                    catch (t) {
                                        (0, _util.warn)("Cannot use postMessage transfers.");
                                        e[0] = 0;
                                        r_14.send("test", e);
                                    } };
                                    sendTest_1();
                                    return;
                                }
                                catch (e) {
                                    (0, _util.info)("The worker has been disabled.");
                                }
                            }
                            this._setupFakeWorker();
                        };
                        PDFWorker.prototype._setupFakeWorker = function () {
                            var _this = this;
                            if (!isWorkerDisabled) {
                                (0, _util.warn)("Setting up fake worker.");
                                isWorkerDisabled = !0;
                            }
                            setupFakeWorkerGlobal().then((function (e) { if (_this.destroyed) {
                                _this._readyCapability.reject(new Error("Worker was destroyed"));
                                return;
                            } var t = new LoopbackPort; _this._port = t; var r = "fake" + nextFakeWorkerId++, s = new _message_handler.MessageHandler(r + "_worker", r, t); e.setup(s, t); var n = new _message_handler.MessageHandler(r, r + "_worker", t); _this._messageHandler = n; _this._readyCapability.resolve(); n.send("configure", { verbosity: _this.verbosity }); })).catch((function (e) { _this._readyCapability.reject(new Error("Setting up fake worker failed: \"" + e.message + "\".")); }));
                        };
                        PDFWorker.prototype.destroy = function () { this.destroyed = !0; if (this._webWorker) {
                            this._webWorker.terminate();
                            this._webWorker = null;
                        } pdfWorkerPorts.delete(this._port); this._port = null; if (this._messageHandler) {
                            this._messageHandler.destroy();
                            this._messageHandler = null;
                        } };
                        PDFWorker.fromPort = function (e) { if (!e || !e.port)
                            throw new Error("PDFWorker.fromPort - invalid method signature."); return pdfWorkerPorts.has(e.port) ? pdfWorkerPorts.get(e.port) : new PDFWorker(e); };
                        PDFWorker.getWorkerSrc = function () { return getWorkerSrc(); };
                        return PDFWorker;
                    }());  return PDFWorker; }(); exports.PDFWorker = PDFWorker;
                    var WorkerTransport = /** @class */ (function () {
                        function WorkerTransport(e, t, r, s) {
                            this.messageHandler = e;
                            this.loadingTask = t;
                            this.commonObjs = new PDFObjects;
                            this.fontLoader = new _font_loader.FontLoader({ docId: t.docId, onUnsupportedFeature: this._onUnsupportedFeature.bind(this), ownerDocument: s.ownerDocument, styleElement: s.styleElement });
                            this._params = s;
                            if (!s.useWorkerFetch) {
                                this.CMapReaderFactory = new s.CMapReaderFactory({ baseUrl: s.cMapUrl, isCompressed: s.cMapPacked });
                                this.StandardFontDataFactory = new s.StandardFontDataFactory({ baseUrl: s.standardFontDataUrl });
                            }
                            this.destroyed = !1;
                            this.destroyCapability = null;
                            this._passwordCapability = null;
                            this._networkStream = r;
                            this._fullReader = null;
                            this._lastProgress = null;
                            this.pageCache = [];
                            this.pagePromises = [];
                            this.downloadInfoCapability = (0, _util.createPromiseCapability)();
                            this.setupMessageHandler();
                        }
                        Object.defineProperty(WorkerTransport.prototype, "annotationStorage", {
                            get: function () { return (0, _util.shadow)(this, "annotationStorage", new _annotation_storage.AnnotationStorage); },
                            enumerable: false,
                            configurable: true
                        });
                        WorkerTransport.prototype.destroy = function () {
                            var e_28, _a;
                            var _this = this;
                            if (this.destroyCapability)
                                return this.destroyCapability.promise;
                            this.destroyed = !0;
                            this.destroyCapability = (0, _util.createPromiseCapability)();
                            this._passwordCapability && this._passwordCapability.reject(new Error("Worker was destroyed during onPassword callback"));
                            var e = [];
                            try {
                                for (var _b = __values(this.pageCache), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var t_11 = _c.value;
                                    t_11 && e.push(t_11._destroy());
                                }
                            }
                            catch (e_28_1) { e_28 = { error: e_28_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_28) throw e_28.error; }
                            }
                            this.pageCache.length = 0;
                            this.pagePromises.length = 0;
                            this.hasOwnProperty("annotationStorage") && this.annotationStorage.resetModified();
                            var t = this.messageHandler.sendWithPromise("Terminate", null);
                            e.push(t);
                            Promise.all(e).then((function () { _this.commonObjs.clear(); _this.fontLoader.clear(); _this._hasJSActionsPromise = null; _this._networkStream && _this._networkStream.cancelAllRequests(new _util.AbortException("Worker was terminated.")); if (_this.messageHandler) {
                                _this.messageHandler.destroy();
                                _this.messageHandler = null;
                            } _this.destroyCapability.resolve(); }), this.destroyCapability.reject);
                            return this.destroyCapability.promise;
                        };
                        WorkerTransport.prototype.setupMessageHandler = function () {
                            var _this = this;
                            var _a = this, e = _a.messageHandler, t = _a.loadingTask;
                            e.on("GetReader", (function (e, t) { (0, _util.assert)(_this._networkStream, "GetReader - no `IPDFStream` instance available."); _this._fullReader = _this._networkStream.getFullReader(); _this._fullReader.onProgress = function (e) { _this._lastProgress = { loaded: e.loaded, total: e.total }; }; t.onPull = function () { _this._fullReader.read().then((function (_a) {
                                var e = _a.value, r = _a.done;
                                if (r)
                                    t.close();
                                else {
                                    (0, _util.assert)((0, _util.isArrayBuffer)(e), "GetReader - expected an ArrayBuffer.");
                                    t.enqueue(new Uint8Array(e), 1, [e]);
                                }
                            })).catch((function (e) { t.error(e); })); }; t.onCancel = function (e) { _this._fullReader.cancel(e); t.ready.catch((function (e) { if (!_this.destroyed)
                                throw e; })); }; }));
                            e.on("ReaderHeadersReady", (function (e) { var r = (0, _util.createPromiseCapability)(), s = _this._fullReader; s.headersReady.then((function () { if (!s.isStreamingSupported || !s.isRangeSupported) {
                                _this._lastProgress && t.onProgress && t.onProgress(_this._lastProgress);
                                s.onProgress = function (e) { t.onProgress && t.onProgress({ loaded: e.loaded, total: e.total }); };
                            } r.resolve({ isStreamingSupported: s.isStreamingSupported, isRangeSupported: s.isRangeSupported, contentLength: s.contentLength }); }), r.reject); return r.promise; }));
                            e.on("GetRangeReader", (function (e, t) { (0, _util.assert)(_this._networkStream, "GetRangeReader - no `IPDFStream` instance available."); var r = _this._networkStream.getRangeReader(e.begin, e.end); if (r) {
                                t.onPull = function () { r.read().then((function (_a) {
                                    var e = _a.value, r = _a.done;
                                    if (r)
                                        t.close();
                                    else {
                                        (0, _util.assert)((0, _util.isArrayBuffer)(e), "GetRangeReader - expected an ArrayBuffer.");
                                        t.enqueue(new Uint8Array(e), 1, [e]);
                                    }
                                })).catch((function (e) { t.error(e); })); };
                                t.onCancel = function (e) { r.cancel(e); t.ready.catch((function (e) { if (!_this.destroyed)
                                    throw e; })); };
                            }
                            else
                                t.close(); }));
                            e.on("GetDoc", (function (_a) {
                                var e = _a.pdfInfo;
                                _this._numPages = e.numPages;
                                _this._htmlForXfa = e.htmlForXfa;
                                delete e.htmlForXfa;
                                t._capability.resolve(new PDFDocumentProxy(e, _this));
                            }));
                            e.on("DocException", (function (e) { var r; switch (e.name) {
                                case "PasswordException":
                                    r = new _util.PasswordException(e.message, e.code);
                                    break;
                                case "InvalidPDFException":
                                    r = new _util.InvalidPDFException(e.message);
                                    break;
                                case "MissingPDFException":
                                    r = new _util.MissingPDFException(e.message);
                                    break;
                                case "UnexpectedResponseException":
                                    r = new _util.UnexpectedResponseException(e.message, e.status);
                                    break;
                                case "UnknownErrorException": r = new _util.UnknownErrorException(e.message, e.details);
                            } if (!(r instanceof Error)) {
                                var e_29 = "DocException - expected a valid Error.";
                                (0, _util.warn)(e_29);
                            } t._capability.reject(r); }));
                            e.on("PasswordRequest", (function (e) { _this._passwordCapability = (0, _util.createPromiseCapability)(); if (t.onPassword) {
                                var updatePassword = function (e) { _this._passwordCapability.resolve({ password: e }); };
                                try {
                                    t.onPassword(updatePassword, e.code);
                                }
                                catch (e) {
                                    _this._passwordCapability.reject(e);
                                }
                            }
                            else
                                _this._passwordCapability.reject(new _util.PasswordException(e.message, e.code)); return _this._passwordCapability.promise; }));
                            e.on("DataLoaded", (function (e) { t.onProgress && t.onProgress({ loaded: e.length, total: e.length }); _this.downloadInfoCapability.resolve(e); }));
                            e.on("StartRenderPage", (function (e) { if (_this.destroyed)
                                return; _this.pageCache[e.pageIndex]._startRenderPage(e.transparency, e.intent); }));
                            e.on("commonobj", (function (t) { var _a; if (_this.destroyed)
                                return; var _b = __read(t, 3), r = _b[0], s = _b[1], n = _b[2]; if (!_this.commonObjs.has(r))
                                switch (s) {
                                    case "Font":
                                        var t_12 = _this._params;
                                        if ("error" in n) {
                                            var e_30 = n.error;
                                            (0, _util.warn)("Error during font loading: " + e_30);
                                            _this.commonObjs.resolve(r, e_30);
                                            break;
                                        }
                                        var a = null;
                                        t_12.pdfBug && ((_a = globalThis.FontInspector) === null || _a === void 0 ? void 0 : _a.enabled) && (a = { registerFont: function (e, t) { globalThis.FontInspector.fontAdded(e, t); } });
                                        var i_3 = new _font_loader.FontFaceObject(n, { isEvalSupported: t_12.isEvalSupported, disableFontFace: t_12.disableFontFace, ignoreErrors: t_12.ignoreErrors, onUnsupportedFeature: _this._onUnsupportedFeature.bind(_this), fontRegistry: a });
                                        _this.fontLoader.bind(i_3).catch((function (t) { return e.sendWithPromise("FontFallback", { id: r }); })).finally((function () { !t_12.fontExtraProperties && i_3.data && (i_3.data = null); _this.commonObjs.resolve(r, i_3); }));
                                        break;
                                    case "FontPath":
                                    case "Image":
                                        _this.commonObjs.resolve(r, n);
                                        break;
                                    default: throw new Error("Got unknown common object type " + s);
                                } }));
                            e.on("obj", (function (e) { var _a; if (_this.destroyed)
                                return; var _b = __read(e, 4), t = _b[0], r = _b[1], s = _b[2], n = _b[3], a = _this.pageCache[r]; if (!a.objs.has(t))
                                switch (s) {
                                    case "Image":
                                        a.objs.resolve(t, n);
                                        var e_31 = 8e6;
                                        ((_a = n === null || n === void 0 ? void 0 : n.data) === null || _a === void 0 ? void 0 : _a.length) > e_31 && (a.cleanupAfterRender = !0);
                                        break;
                                    case "Pattern":
                                        a.objs.resolve(t, n);
                                        break;
                                    default: throw new Error("Got unknown object type " + s);
                                } }));
                            e.on("DocProgress", (function (e) { _this.destroyed || t.onProgress && t.onProgress({ loaded: e.loaded, total: e.total }); }));
                            e.on("UnsupportedFeature", this._onUnsupportedFeature.bind(this));
                            e.on("FetchBuiltInCMap", (function (e) { return _this.destroyed ? Promise.reject(new Error("Worker was destroyed.")) : _this.CMapReaderFactory ? _this.CMapReaderFactory.fetch(e) : Promise.reject(new Error("CMapReaderFactory not initialized, see the `useWorkerFetch` parameter.")); }));
                            e.on("FetchStandardFontData", (function (e) { return _this.destroyed ? Promise.reject(new Error("Worker was destroyed.")) : _this.StandardFontDataFactory ? _this.StandardFontDataFactory.fetch(e) : Promise.reject(new Error("StandardFontDataFactory not initialized, see the `useWorkerFetch` parameter.")); }));
                        };
                        WorkerTransport.prototype._onUnsupportedFeature = function (_a) {
                            var e = _a.featureId;
                            this.destroyed || this.loadingTask.onUnsupportedFeature && this.loadingTask.onUnsupportedFeature(e);
                        };
                        WorkerTransport.prototype.getData = function () { return this.messageHandler.sendWithPromise("GetData", null); };
                        WorkerTransport.prototype.getPage = function (e) {
                            var _this = this;
                            if (!Number.isInteger(e) || e <= 0 || e > this._numPages)
                                return Promise.reject(new Error("Invalid page request"));
                            var t = e - 1;
                            if (t in this.pagePromises)
                                return this.pagePromises[t];
                            var r = this.messageHandler.sendWithPromise("GetPage", { pageIndex: t }).then((function (e) { if (_this.destroyed)
                                throw new Error("Transport destroyed"); var r = new PDFPageProxy(t, e, _this, _this._params.ownerDocument, _this._params.pdfBug); _this.pageCache[t] = r; return r; }));
                            this.pagePromises[t] = r;
                            return r;
                        };
                        WorkerTransport.prototype.getPageIndex = function (e) { return this.messageHandler.sendWithPromise("GetPageIndex", { ref: e }).catch((function (e) { return Promise.reject(new Error(e)); })); };
                        WorkerTransport.prototype.getAnnotations = function (e, t) { return this.messageHandler.sendWithPromise("GetAnnotations", { pageIndex: e, intent: t }); };
                        WorkerTransport.prototype.saveDocument = function () {
                            var _this = this;
                            var _a, _b;
                            return this.messageHandler.sendWithPromise("SaveDocument", { isPureXfa: !!this._htmlForXfa, numPages: this._numPages, annotationStorage: this.annotationStorage.serializable, filename: (_b = (_a = this._fullReader) === null || _a === void 0 ? void 0 : _a.filename) !== null && _b !== void 0 ? _b : null }).finally((function () { _this.annotationStorage.resetModified(); }));
                        };
                        WorkerTransport.prototype.getFieldObjects = function () { return this.messageHandler.sendWithPromise("GetFieldObjects", null); };
                        WorkerTransport.prototype.hasJSActions = function () { return this._hasJSActionsPromise || (this._hasJSActionsPromise = this.messageHandler.sendWithPromise("HasJSActions", null)); };
                        WorkerTransport.prototype.getCalculationOrderIds = function () { return this.messageHandler.sendWithPromise("GetCalculationOrderIds", null); };
                        WorkerTransport.prototype.getDestinations = function () { return this.messageHandler.sendWithPromise("GetDestinations", null); };
                        WorkerTransport.prototype.getDestination = function (e) { return "string" != typeof e ? Promise.reject(new Error("Invalid destination request.")) : this.messageHandler.sendWithPromise("GetDestination", { id: e }); };
                        WorkerTransport.prototype.getPageLabels = function () { return this.messageHandler.sendWithPromise("GetPageLabels", null); };
                        WorkerTransport.prototype.getPageLayout = function () { return this.messageHandler.sendWithPromise("GetPageLayout", null); };
                        WorkerTransport.prototype.getPageMode = function () { return this.messageHandler.sendWithPromise("GetPageMode", null); };
                        WorkerTransport.prototype.getViewerPreferences = function () { return this.messageHandler.sendWithPromise("GetViewerPreferences", null); };
                        WorkerTransport.prototype.getOpenAction = function () { return this.messageHandler.sendWithPromise("GetOpenAction", null); };
                        WorkerTransport.prototype.getAttachments = function () { return this.messageHandler.sendWithPromise("GetAttachments", null); };
                        WorkerTransport.prototype.getJavaScript = function () { return this.messageHandler.sendWithPromise("GetJavaScript", null); };
                        WorkerTransport.prototype.getDocJSActions = function () { return this.messageHandler.sendWithPromise("GetDocJSActions", null); };
                        WorkerTransport.prototype.getPageJSActions = function (e) { return this.messageHandler.sendWithPromise("GetPageJSActions", { pageIndex: e }); };
                        WorkerTransport.prototype.getStructTree = function (e) { return this.messageHandler.sendWithPromise("GetStructTree", { pageIndex: e }); };
                        WorkerTransport.prototype.getOutline = function () { return this.messageHandler.sendWithPromise("GetOutline", null); };
                        WorkerTransport.prototype.getOptionalContentConfig = function () { return this.messageHandler.sendWithPromise("GetOptionalContentConfig", null).then((function (e) { return new _optional_content_config.OptionalContentConfig(e); })); };
                        WorkerTransport.prototype.getPermissions = function () { return this.messageHandler.sendWithPromise("GetPermissions", null); };
                        WorkerTransport.prototype.getMetadata = function () {
                            var _this = this;
                            return this.messageHandler.sendWithPromise("GetMetadata", null).then((function (e) { var _a, _b, _c, _d; return ({ info: e[0], metadata: e[1] ? new _metadata.Metadata(e[1]) : null, contentDispositionFilename: (_b = (_a = _this._fullReader) === null || _a === void 0 ? void 0 : _a.filename) !== null && _b !== void 0 ? _b : null, contentLength: (_d = (_c = _this._fullReader) === null || _c === void 0 ? void 0 : _c.contentLength) !== null && _d !== void 0 ? _d : null }); }));
                        };
                        WorkerTransport.prototype.getMarkInfo = function () { return this.messageHandler.sendWithPromise("GetMarkInfo", null); };
                        WorkerTransport.prototype.getStats = function () { return this.messageHandler.sendWithPromise("GetStats", null); };
                        WorkerTransport.prototype.startCleanup = function (e) {
                            if (e === void 0) { e = !1; }
                            return __awaiter(this, void 0, void 0, function () { var e_32, t, t_13; return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.messageHandler.sendWithPromise("Cleanup", null)];
                                    case 1:
                                        _a.sent();
                                        if (!this.destroyed) {
                                            for (e_32 = 0, t = this.pageCache.length; e_32 < t; e_32++) {
                                                t_13 = this.pageCache[e_32];
                                                if (!t_13)
                                                    continue;
                                                if (!t_13.cleanup())
                                                    throw new Error("startCleanup: Page " + (e_32 + 1) + " is currently rendering.");
                                            }
                                            this.commonObjs.clear();
                                            e || this.fontLoader.clear();
                                            this._hasJSActionsPromise = null;
                                        }
                                        return [2 /*return*/];
                                }
                            }); });
                        };
                        Object.defineProperty(WorkerTransport.prototype, "loadingParams", {
                            get: function () { var e = this._params; return (0, _util.shadow)(this, "loadingParams", { disableAutoFetch: e.disableAutoFetch }); },
                            enumerable: false,
                            configurable: true
                        });
                        return WorkerTransport;
                    }()); 
                    var PDFObjects = /** @class */ (function () {
                        function PDFObjects() {
                            this._objs = Object.create(null);
                        }
                        PDFObjects.prototype._ensureObj = function (e) { return this._objs[e] ? this._objs[e] : this._objs[e] = { capability: (0, _util.createPromiseCapability)(), data: null, resolved: !1 }; };
                        PDFObjects.prototype.get = function (e, t) {
                            if (t === void 0) { t = null; }
                            if (t) {
                                this._ensureObj(e).capability.promise.then(t);
                                return null;
                            }
                            var r = this._objs[e];
                            if (!r || !r.resolved)
                                throw new Error("Requesting object that isn't resolved yet " + e + ".");
                            return r.data;
                        };
                        PDFObjects.prototype.has = function (e) { var _a; return ((_a = this._objs[e]) === null || _a === void 0 ? void 0 : _a.resolved) || !1; };
                        PDFObjects.prototype.resolve = function (e, t) { var r = this._ensureObj(e); r.resolved = !0; r.data = t; r.capability.resolve(t); };
                        PDFObjects.prototype.clear = function () { this._objs = Object.create(null); };
                        return PDFObjects;
                    }()); 
                    var RenderTask = /** @class */ (function () {
                        function RenderTask(e) {
                            this._internalRenderTask = e;
                            this.onContinue = null;
                        }
                        Object.defineProperty(RenderTask.prototype, "promise", {
                            get: function () { return this._internalRenderTask.capability.promise; },
                            enumerable: false,
                            configurable: true
                        });
                        RenderTask.prototype.cancel = function () { this._internalRenderTask.cancel(); };
                        return RenderTask;
                    }());  var InternalRenderTask = function InternalRenderTaskClosure() { var e = new WeakSet; return /** @class */ (function () {
                    function InternalRenderTask(_a) {
                        var e = _a.callback, t = _a.params, r = _a.objs, s = _a.commonObjs, n = _a.operatorList, a = _a.pageIndex, i = _a.canvasFactory, _b = _a.useRequestAnimationFrame, o = _b === void 0 ? !1 : _b, _c = _a.pdfBug, l = _c === void 0 ? !1 : _c;
                        this.callback = e;
                        this.params = t;
                        this.objs = r;
                        this.commonObjs = s;
                        this.operatorListIdx = null;
                        this.operatorList = n;
                        this._pageIndex = a;
                        this.canvasFactory = i;
                        this._pdfBug = l;
                        this.running = !1;
                        this.graphicsReadyCallback = null;
                        this.graphicsReady = !1;
                        this._useRequestAnimationFrame = !0 === o && "undefined" != typeof window;
                        this.cancelled = !1;
                        this.capability = (0, _util.createPromiseCapability)();
                        this.task = new RenderTask(this);
                        this._cancelBound = this.cancel.bind(this);
                        this._continueBound = this._continue.bind(this);
                        this._scheduleNextBound = this._scheduleNext.bind(this);
                        this._nextBound = this._next.bind(this);
                        this._canvas = t.canvasContext.canvas;
                    }
                    Object.defineProperty(InternalRenderTask.prototype, "completed", {
                        get: function () { return this.capability.promise.catch((function () { })); },
                        enumerable: false,
                        configurable: true
                    });
                    InternalRenderTask.prototype.initializeGraphics = function (_a) {
                        var _b;
                        var _c = _a.transparency, t = _c === void 0 ? !1 : _c, r = _a.optionalContentConfig;
                        if (this.cancelled)
                            return;
                        if (this._canvas) {
                            if (e.has(this._canvas))
                                throw new Error("Cannot use the same canvas during multiple render() operations. Use different canvas or ensure previous operations were cancelled or completed.");
                            e.add(this._canvas);
                        }
                        if (this._pdfBug && ((_b = globalThis.StepperManager) === null || _b === void 0 ? void 0 : _b.enabled)) {
                            this.stepper = globalThis.StepperManager.create(this._pageIndex);
                            this.stepper.init(this.operatorList);
                            this.stepper.nextBreakPoint = this.stepper.getNextBreakPoint();
                        }
                        var _d = this.params, s = _d.canvasContext, n = _d.viewport, a = _d.transform, i = _d.imageLayer, o = _d.background;
                        this.gfx = new _canvas.CanvasGraphics(s, this.commonObjs, this.objs, this.canvasFactory, i, r);
                        this.gfx.beginDrawing({ transform: a, viewport: n, transparency: t, background: o });
                        this.operatorListIdx = 0;
                        this.graphicsReady = !0;
                        this.graphicsReadyCallback && this.graphicsReadyCallback();
                    };
                    InternalRenderTask.prototype.cancel = function (t) {
                        if (t === void 0) { t = null; }
                        this.running = !1;
                        this.cancelled = !0;
                        this.gfx && this.gfx.endDrawing();
                        this._canvas && e.delete(this._canvas);
                        this.callback(t || new _display_utils.RenderingCancelledException("Rendering cancelled, page " + (this._pageIndex + 1), "canvas"));
                    };
                    InternalRenderTask.prototype.operatorListChanged = function () { if (this.graphicsReady) {
                        this.stepper && this.stepper.updateOperatorList(this.operatorList);
                        this.running || this._continue();
                    }
                    else
                        this.graphicsReadyCallback || (this.graphicsReadyCallback = this._continueBound); };
                    InternalRenderTask.prototype._continue = function () { this.running = !0; this.cancelled || (this.task.onContinue ? this.task.onContinue(this._scheduleNextBound) : this._scheduleNext()); };
                    InternalRenderTask.prototype._scheduleNext = function () {
                        var _this = this;
                        this._useRequestAnimationFrame ? window.requestAnimationFrame((function () { _this._nextBound().catch(_this._cancelBound); })) : Promise.resolve().then(this._nextBound).catch(this._cancelBound);
                    };
                    InternalRenderTask.prototype._next = function () {
                        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
                            if (!this.cancelled) {
                                this.operatorListIdx = this.gfx.executeOperatorList(this.operatorList, this.operatorListIdx, this._continueBound, this.stepper);
                                if (this.operatorListIdx === this.operatorList.argsArray.length) {
                                    this.running = !1;
                                    if (this.operatorList.lastChunk) {
                                        this.gfx.endDrawing();
                                        this._canvas && e.delete(this._canvas);
                                        this.callback();
                                    }
                                }
                            }
                            return [2 /*return*/];
                        }); });
                    };
                    return InternalRenderTask;
                }()); }(), version = "2.10.377"; exports.version = version; var build = "156762c48"; exports.build = build; }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.FontLoader = t.FontFaceObject = void 0; var s = r(2);
                    var BaseFontLoader = /** @class */ (function () {
                        function BaseFontLoader(_a) {
                            var e = _a.docId, t = _a.onUnsupportedFeature, _b = _a.ownerDocument, r = _b === void 0 ? globalThis.document : _b, _c = _a.styleElement, n = _c === void 0 ? null : _c;
                            this.constructor === BaseFontLoader && (0, s.unreachable)("Cannot initialize BaseFontLoader.");
                            this.docId = e;
                            this._onUnsupportedFeature = t;
                            this._document = r;
                            this.nativeFontFaces = [];
                            this.styleElement = null;
                        }
                        BaseFontLoader.prototype.addNativeFontFace = function (e) { this.nativeFontFaces.push(e); this._document.fonts.add(e); };
                        BaseFontLoader.prototype.insertRule = function (e) { var t = this.styleElement; if (!t) {
                            t = this.styleElement = this._document.createElement("style");
                            t.id = "PDFJS_FONT_STYLE_TAG_" + this.docId;
                            this._document.documentElement.getElementsByTagName("head")[0].appendChild(t);
                        } var r = t.sheet; r.insertRule(e, r.cssRules.length); };
                        BaseFontLoader.prototype.clear = function () {
                            var e_33, _a;
                            try {
                                for (var _b = __values(this.nativeFontFaces), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var e_34 = _c.value;
                                    this._document.fonts.delete(e_34);
                                }
                            }
                            catch (e_33_1) { e_33 = { error: e_33_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_33) throw e_33.error; }
                            }
                            this.nativeFontFaces.length = 0;
                            if (this.styleElement) {
                                this.styleElement.remove();
                                this.styleElement = null;
                            }
                        };
                        BaseFontLoader.prototype.bind = function (e) {
                            return __awaiter(this, void 0, void 0, function () {
                                var t_14, r_15, t;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (e.attached || e.missingFile)
                                                return [2 /*return*/];
                                            e.attached = !0;
                                            if (!this.isFontLoadingAPISupported) return [3 /*break*/, 5];
                                            t_14 = e.createNativeFontFace();
                                            if (!t_14) return [3 /*break*/, 4];
                                            this.addNativeFontFace(t_14);
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, t_14.loaded];
                                        case 2:
                                            _a.sent();
                                            return [3 /*break*/, 4];
                                        case 3:
                                            r_15 = _a.sent();
                                            this._onUnsupportedFeature({ featureId: s.UNSUPPORTED_FEATURES.errorFontLoadNative });
                                            (0, s.warn)("Failed to load font '" + t_14.family + "': '" + r_15 + "'.");
                                            e.disableFontFace = !0;
                                            throw r_15;
                                        case 4: return [2 /*return*/];
                                        case 5:
                                            t = e.createFontFaceRule();
                                            if (!t) return [3 /*break*/, 7];
                                            this.insertRule(t);
                                            if (this.isSyncFontLoadingSupported)
                                                return [2 /*return*/];
                                            return [4 /*yield*/, new Promise((function (r) { var s = _this._queueLoadingCallback(r); _this._prepareFontLoadEvent([t], [e], s); }))];
                                        case 6:
                                            _a.sent();
                                            _a.label = 7;
                                        case 7: return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        BaseFontLoader.prototype._queueLoadingCallback = function (e) { (0, s.unreachable)("Abstract method `_queueLoadingCallback`."); };
                        Object.defineProperty(BaseFontLoader.prototype, "isFontLoadingAPISupported", {
                            get: function () { var _a; var e = !!((_a = this._document) === null || _a === void 0 ? void 0 : _a.fonts); return (0, s.shadow)(this, "isFontLoadingAPISupported", e); },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(BaseFontLoader.prototype, "isSyncFontLoadingSupported", {
                            get: function () { (0, s.unreachable)("Abstract method `isSyncFontLoadingSupported`."); },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(BaseFontLoader.prototype, "_loadTestFont", {
                            get: function () { (0, s.unreachable)("Abstract method `_loadTestFont`."); },
                            enumerable: false,
                            configurable: true
                        });
                        BaseFontLoader.prototype._prepareFontLoadEvent = function (e, t, r) { (0, s.unreachable)("Abstract method `_prepareFontLoadEvent`."); };
                        return BaseFontLoader;
                    }());  var n; t.FontLoader = n; t.FontLoader = n = /** @class */ (function (_super) {
                    __extends(GenericFontLoader, _super);
                    function GenericFontLoader(e) {
                        var _this = _super.call(this, e) || this;
                        _this.loadingContext = { requests: [], nextRequestId: 0 };
                        _this.loadTestFontId = 0;
                        return _this;
                    }
                    Object.defineProperty(GenericFontLoader.prototype, "isSyncFontLoadingSupported", {
                        get: function () { var _a; var e = !1; if ("undefined" == typeof navigator)
                            e = !0;
                        else {
                            ((_a = /Mozilla\/5.0.*?rv:(\d+).*? Gecko/.exec(navigator.userAgent)) === null || _a === void 0 ? void 0 : _a[1]) >= 14 && (e = !0);
                        } return (0, s.shadow)(this, "isSyncFontLoadingSupported", e); },
                        enumerable: false,
                        configurable: true
                    });
                    GenericFontLoader.prototype._queueLoadingCallback = function (e) { var t = this.loadingContext, r = { id: "pdfjs-font-loading-" + t.nextRequestId++, done: !1, complete: function completeRequest() { (0, s.assert)(!r.done, "completeRequest() cannot be called twice."); r.done = !0; for (; t.requests.length > 0 && t.requests[0].done;) {
                            var e_35 = t.requests.shift();
                            setTimeout(e_35.callback, 0);
                        } }, callback: e }; t.requests.push(r); return r; };
                    Object.defineProperty(GenericFontLoader.prototype, "_loadTestFont", {
                        get: function () { return (0, s.shadow)(this, "_loadTestFont", atob("T1RUTwALAIAAAwAwQ0ZGIDHtZg4AAAOYAAAAgUZGVE1lkzZwAAAEHAAAABxHREVGABQAFQAABDgAAAAeT1MvMlYNYwkAAAEgAAAAYGNtYXABDQLUAAACNAAAAUJoZWFk/xVFDQAAALwAAAA2aGhlYQdkA+oAAAD0AAAAJGhtdHgD6AAAAAAEWAAAAAZtYXhwAAJQAAAAARgAAAAGbmFtZVjmdH4AAAGAAAAAsXBvc3T/hgAzAAADeAAAACAAAQAAAAEAALZRFsRfDzz1AAsD6AAAAADOBOTLAAAAAM4KHDwAAAAAA+gDIQAAAAgAAgAAAAAAAAABAAADIQAAAFoD6AAAAAAD6AABAAAAAAAAAAAAAAAAAAAAAQAAUAAAAgAAAAQD6AH0AAUAAAKKArwAAACMAooCvAAAAeAAMQECAAACAAYJAAAAAAAAAAAAAQAAAAAAAAAAAAAAAFBmRWQAwAAuAC4DIP84AFoDIQAAAAAAAQAAAAAAAAAAACAAIAABAAAADgCuAAEAAAAAAAAAAQAAAAEAAAAAAAEAAQAAAAEAAAAAAAIAAQAAAAEAAAAAAAMAAQAAAAEAAAAAAAQAAQAAAAEAAAAAAAUAAQAAAAEAAAAAAAYAAQAAAAMAAQQJAAAAAgABAAMAAQQJAAEAAgABAAMAAQQJAAIAAgABAAMAAQQJAAMAAgABAAMAAQQJAAQAAgABAAMAAQQJAAUAAgABAAMAAQQJAAYAAgABWABYAAAAAAAAAwAAAAMAAAAcAAEAAAAAADwAAwABAAAAHAAEACAAAAAEAAQAAQAAAC7//wAAAC7////TAAEAAAAAAAABBgAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAD/gwAyAAAAAQAAAAAAAAAAAAAAAAAAAAABAAQEAAEBAQJYAAEBASH4DwD4GwHEAvgcA/gXBIwMAYuL+nz5tQXkD5j3CBLnEQACAQEBIVhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYAAABAQAADwACAQEEE/t3Dov6fAH6fAT+fPp8+nwHDosMCvm1Cvm1DAz6fBQAAAAAAAABAAAAAMmJbzEAAAAAzgTjFQAAAADOBOQpAAEAAAAAAAAADAAUAAQAAAABAAAAAgABAAAAAAAAAAAD6AAAAAAAAA==")); },
                        enumerable: false,
                        configurable: true
                    });
                    GenericFontLoader.prototype._prepareFontLoadEvent = function (e, t, r) {
                        var e_36, _a, e_37, _b;
                        var _this = this;
                        function int32(e, t) { return e.charCodeAt(t) << 24 | e.charCodeAt(t + 1) << 16 | e.charCodeAt(t + 2) << 8 | 255 & e.charCodeAt(t + 3); }
                        function spliceString(e, t, r, s) { return e.substring(0, t) + s + e.substring(t + r); }
                        var n, a;
                        var i = this._document.createElement("canvas");
                        i.width = 1;
                        i.height = 1;
                        var o = i.getContext("2d");
                        var l = 0;
                        var c = "lt" + Date.now() + this.loadTestFontId++;
                        var h = this._loadTestFont;
                        h = spliceString(h, 976, c.length, c);
                        var d = 1482184792;
                        var u = int32(h, 16);
                        for (n = 0, a = c.length - 3; n < a; n += 4)
                            u = u - d + int32(c, n) | 0;
                        n < c.length && (u = u - d + int32(c + "XXX", n) | 0);
                        h = spliceString(h, 16, 4, (0, s.string32)(u));
                        var p = "@font-face {font-family:\"" + c + "\";src:" + ("url(data:font/opentype;base64," + btoa(h) + ");") + "}";
                        this.insertRule(p);
                        var g = [];
                        try {
                            for (var t_15 = __values(t), t_15_1 = t_15.next(); !t_15_1.done; t_15_1 = t_15.next()) {
                                var e_38 = t_15_1.value;
                                g.push(e_38.loadedName);
                            }
                        }
                        catch (e_36_1) { e_36 = { error: e_36_1 }; }
                        finally {
                            try {
                                if (t_15_1 && !t_15_1.done && (_a = t_15.return)) _a.call(t_15);
                            }
                            finally { if (e_36) throw e_36.error; }
                        }
                        g.push(c);
                        var f = this._document.createElement("div");
                        f.style.visibility = "hidden";
                        f.style.width = f.style.height = "10px";
                        f.style.position = "absolute";
                        f.style.top = f.style.left = "0px";
                        try {
                            for (var g_1 = __values(g), g_1_1 = g_1.next(); !g_1_1.done; g_1_1 = g_1.next()) {
                                var e_39 = g_1_1.value;
                                var t_16 = this._document.createElement("span");
                                t_16.textContent = "Hi";
                                t_16.style.fontFamily = e_39;
                                f.appendChild(t_16);
                            }
                        }
                        catch (e_37_1) { e_37 = { error: e_37_1 }; }
                        finally {
                            try {
                                if (g_1_1 && !g_1_1.done && (_b = g_1.return)) _b.call(g_1);
                            }
                            finally { if (e_37) throw e_37.error; }
                        }
                        this._document.body.appendChild(f);
                        !function isFontReady(e, t) { l++; if (l > 30) {
                            (0, s.warn)("Load test font never loaded.");
                            t();
                            return;
                        } o.font = "30px " + e; o.fillText(".", 0, 20); o.getImageData(0, 0, 1, 1).data[3] > 0 ? t() : setTimeout(isFontReady.bind(null, e, t)); }(c, (function () { _this._document.body.removeChild(f); r.complete(); }));
                    };
                    return GenericFontLoader;
                }(BaseFontLoader)); t.FontFaceObject = /** @class */ (function () {
                    function FontFaceObject(e, _a) {
                        var _b = _a.isEvalSupported, t = _b === void 0 ? !0 : _b, _c = _a.disableFontFace, r = _c === void 0 ? !1 : _c, _d = _a.ignoreErrors, s = _d === void 0 ? !1 : _d, n = _a.onUnsupportedFeature, _e = _a.fontRegistry, a = _e === void 0 ? null : _e;
                        this.compiledGlyphs = Object.create(null);
                        for (var t_17 in e)
                            this[t_17] = e[t_17];
                        this.isEvalSupported = !1 !== t;
                        this.disableFontFace = !0 === r;
                        this.ignoreErrors = !0 === s;
                        this._onUnsupportedFeature = n;
                        this.fontRegistry = a;
                    }
                    FontFaceObject.prototype.createNativeFontFace = function () { if (!this.data || this.disableFontFace)
                        return null; var e; if (this.cssFontInfo) {
                        var t_18 = { weight: this.cssFontInfo.fontWeight };
                        this.cssFontInfo.italicAngle && (t_18.style = "oblique " + this.cssFontInfo.italicAngle + "deg");
                        e = new FontFace(this.cssFontInfo.fontFamily, this.data, t_18);
                    }
                    else
                        e = new FontFace(this.loadedName, this.data, {}); this.fontRegistry && this.fontRegistry.registerFont(this); return e; };
                    FontFaceObject.prototype.createFontFaceRule = function () { if (!this.data || this.disableFontFace)
                        return null; var e = (0, s.bytesToString)(this.data), t = "url(data:" + this.mimetype + ";base64," + btoa(e) + ");"; var r; if (this.cssFontInfo) {
                        var e_40 = "font-weight: " + this.cssFontInfo.fontWeight + ";";
                        this.cssFontInfo.italicAngle && (e_40 += "font-style: oblique " + this.cssFontInfo.italicAngle + "deg;");
                        r = "@font-face {font-family:\"" + this.cssFontInfo.fontFamily + "\";" + e_40 + "src:" + t + "}";
                    }
                    else
                        r = "@font-face {font-family:\"" + this.loadedName + "\";src:" + t + "}"; this.fontRegistry && this.fontRegistry.registerFont(this, t); return r; };
                    FontFaceObject.prototype.getPathGenerator = function (e, t) {
                        var e_41, _a;
                        if (void 0 !== this.compiledGlyphs[t])
                            return this.compiledGlyphs[t];
                        var r;
                        try {
                            r = e.get(this.loadedName + "_path_" + t);
                        }
                        catch (e) {
                            if (!this.ignoreErrors)
                                throw e;
                            this._onUnsupportedFeature({ featureId: s.UNSUPPORTED_FEATURES.errorFontGetPath });
                            (0, s.warn)("getPathGenerator - ignoring character: \"" + e + "\".");
                            return this.compiledGlyphs[t] = function (e, t) { };
                        }
                        if (this.isEvalSupported && s.IsEvalSupportedCached.value) {
                            var e_42 = [];
                            try {
                                for (var r_16 = __values(r), r_16_1 = r_16.next(); !r_16_1.done; r_16_1 = r_16.next()) {
                                    var t_19 = r_16_1.value;
                                    var r_17 = void 0 !== t_19.args ? t_19.args.join(",") : "";
                                    e_42.push("c.", t_19.cmd, "(", r_17, ");\n");
                                }
                            }
                            catch (e_41_1) { e_41 = { error: e_41_1 }; }
                            finally {
                                try {
                                    if (r_16_1 && !r_16_1.done && (_a = r_16.return)) _a.call(r_16);
                                }
                                finally { if (e_41) throw e_41.error; }
                            }
                            return this.compiledGlyphs[t] = new Function("c", "size", e_42.join(""));
                        }
                        return this.compiledGlyphs[t] = function (e, t) {
                            var e_43, _a;
                            try {
                                for (var r_18 = __values(r), r_18_1 = r_18.next(); !r_18_1.done; r_18_1 = r_18.next()) {
                                    var s_12 = r_18_1.value;
                                    "scale" === s_12.cmd && (s_12.args = [t, -t]);
                                    e[s_12.cmd].apply(e, s_12.args);
                                }
                            }
                            catch (e_43_1) { e_43 = { error: e_43_1 }; }
                            finally {
                                try {
                                    if (r_18_1 && !r_18_1.done && (_a = r_18.return)) _a.call(r_18);
                                }
                                finally { if (e_43) throw e_43.error; }
                            }
                        };
                    };
                    return FontFaceObject;
                }()); }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.NodeStandardFontDataFactory = t.NodeCMapReaderFactory = t.NodeCanvasFactory = void 0; var s = r(5), n = r(4), a = r(2); var i = /** @class */ (function () {
                    function i() {
                        (0, a.unreachable)("Not implemented: NodeCanvasFactory");
                    }
                    return i;
                }()); t.NodeCanvasFactory = i; var o = /** @class */ (function () {
                    function o() {
                        (0, a.unreachable)("Not implemented: NodeCMapReaderFactory");
                    }
                    return o;
                }()); t.NodeCMapReaderFactory = o; var l = /** @class */ (function () {
                    function l() {
                        (0, a.unreachable)("Not implemented: NodeStandardFontDataFactory");
                    }
                    return l;
                }()); t.NodeStandardFontDataFactory = l; if (n.isNodeJS) {
                    var fetchData_1 = function (e) { return new Promise((function (t, r) { require$$0__default["default"].readFile(e, (function (e, s) { !e && s ? t(new Uint8Array(s)) : r(new Error(e)); })); })); };
                    t.NodeCanvasFactory = i = /** @class */ (function (_super) {
                        __extends(i, _super);
                        function i() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        i.prototype._createCanvas = function (e, t) { return require$$1__default["default"].createCanvas(e, t); };
                        return i;
                    }(s.BaseCanvasFactory));
                    t.NodeCMapReaderFactory = o = /** @class */ (function (_super) {
                        __extends(o, _super);
                        function o() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        o.prototype._fetchData = function (e, t) { return fetchData_1(e).then((function (e) { return ({ cMapData: e, compressionType: t }); })); };
                        return o;
                    }(s.BaseCMapReaderFactory));
                    t.NodeStandardFontDataFactory = l = /** @class */ (function (_super) {
                        __extends(l, _super);
                        function l() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        l.prototype._fetchData = function (e) { return fetchData_1(e); };
                        return l;
                    }(s.BaseStandardFontDataFactory));
                } }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.AnnotationStorage = void 0; var s = r(2); t.AnnotationStorage = /** @class */ (function () {
                    function AnnotationStorage() {
                        this._storage = new Map;
                        this._modified = !1;
                        this.onSetModified = null;
                        this.onResetModified = null;
                    }
                    AnnotationStorage.prototype.getValue = function (e, t) { var r = this._storage.get(e); return void 0 !== r ? r : t; };
                    AnnotationStorage.prototype.setValue = function (e, t) {
                        var e_44, _a;
                        var r = this._storage.get(e);
                        var s = !1;
                        if (void 0 !== r) {
                            try {
                                for (var _b = __values(Object.entries(t)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var _d = __read(_c.value, 2), e_45 = _d[0], n = _d[1];
                                    if (r[e_45] !== n) {
                                        s = !0;
                                        r[e_45] = n;
                                    }
                                }
                            }
                            catch (e_44_1) { e_44 = { error: e_44_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_44) throw e_44.error; }
                            }
                        }
                        else {
                            this._storage.set(e, t);
                            s = !0;
                        }
                        s && this._setModified();
                    };
                    AnnotationStorage.prototype.getAll = function () { return this._storage.size > 0 ? (0, s.objectFromMap)(this._storage) : null; };
                    Object.defineProperty(AnnotationStorage.prototype, "size", {
                        get: function () { return this._storage.size; },
                        enumerable: false,
                        configurable: true
                    });
                    AnnotationStorage.prototype._setModified = function () { if (!this._modified) {
                        this._modified = !0;
                        "function" == typeof this.onSetModified && this.onSetModified();
                    } };
                    AnnotationStorage.prototype.resetModified = function () { if (this._modified) {
                        this._modified = !1;
                        "function" == typeof this.onResetModified && this.onResetModified();
                    } };
                    Object.defineProperty(AnnotationStorage.prototype, "serializable", {
                        get: function () { return this._storage.size > 0 ? this._storage : null; },
                        enumerable: false,
                        configurable: true
                    });
                    return AnnotationStorage;
                }()); }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.CanvasGraphics = void 0; var s = r(2), n = r(11); var a = 4096, i = 16; function addContextCurrentTransform(e) { if (!e.mozCurrentTransform) {
                    e._originalSave = e.save;
                    e._originalRestore = e.restore;
                    e._originalRotate = e.rotate;
                    e._originalScale = e.scale;
                    e._originalTranslate = e.translate;
                    e._originalTransform = e.transform;
                    e._originalSetTransform = e.setTransform;
                    e._originalResetTransform = e.resetTransform;
                    e._transformMatrix = e._transformMatrix || [1, 0, 0, 1, 0, 0];
                    e._transformStack = [];
                    try {
                        var t_20 = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), "lineWidth");
                        e._setLineWidth = t_20.set;
                        e._getLineWidth = t_20.get;
                        Object.defineProperty(e, "lineWidth", { set: function setLineWidth(e) { this._setLineWidth(1.000001 * e); }, get: function getLineWidth() { return this._getLineWidth(); } });
                    }
                    catch (e) { }
                    Object.defineProperty(e, "mozCurrentTransform", { get: function getCurrentTransform() { return this._transformMatrix; } });
                    Object.defineProperty(e, "mozCurrentTransformInverse", { get: function getCurrentTransformInverse() { var _a = __read(this._transformMatrix, 6), e = _a[0], t = _a[1], r = _a[2], s = _a[3], n = _a[4], a = _a[5], i = e * s - t * r, o = t * r - e * s; return [s / i, t / o, r / o, e / i, (s * n - r * a) / o, (t * n - e * a) / i]; } });
                    e.save = function ctxSave() { var e = this._transformMatrix; this._transformStack.push(e); this._transformMatrix = e.slice(0, 6); this._originalSave(); };
                    e.restore = function ctxRestore() { var e = this._transformStack.pop(); if (e) {
                        this._transformMatrix = e;
                        this._originalRestore();
                    } };
                    e.translate = function ctxTranslate(e, t) { var r = this._transformMatrix; r[4] = r[0] * e + r[2] * t + r[4]; r[5] = r[1] * e + r[3] * t + r[5]; this._originalTranslate(e, t); };
                    e.scale = function ctxScale(e, t) { var r = this._transformMatrix; r[0] *= e; r[1] *= e; r[2] *= t; r[3] *= t; this._originalScale(e, t); };
                    e.transform = function ctxTransform(t, r, s, n, a, i) { var o = this._transformMatrix; this._transformMatrix = [o[0] * t + o[2] * r, o[1] * t + o[3] * r, o[0] * s + o[2] * n, o[1] * s + o[3] * n, o[0] * a + o[2] * i + o[4], o[1] * a + o[3] * i + o[5]]; e._originalTransform(t, r, s, n, a, i); };
                    e.setTransform = function ctxSetTransform(t, r, s, n, a, i) { this._transformMatrix = [t, r, s, n, a, i]; e._originalSetTransform(t, r, s, n, a, i); };
                    e.resetTransform = function ctxResetTransform() { this._transformMatrix = [1, 0, 0, 1, 0, 0]; e._originalResetTransform(); };
                    e.rotate = function ctxRotate(e) { var t = Math.cos(e), r = Math.sin(e), s = this._transformMatrix; this._transformMatrix = [s[0] * t + s[2] * r, s[1] * t + s[3] * r, s[0] * -r + s[2] * t, s[1] * -r + s[3] * t, s[4], s[5]]; this._originalRotate(e); };
                } }
                    var CachedCanvases = /** @class */ (function () {
                        function CachedCanvases(e) {
                            this.canvasFactory = e;
                            this.cache = Object.create(null);
                        }
                        CachedCanvases.prototype.getCanvas = function (e, t, r, s) { var n; if (void 0 !== this.cache[e]) {
                            n = this.cache[e];
                            this.canvasFactory.reset(n, t, r);
                            n.context.setTransform(1, 0, 0, 1, 0, 0);
                        }
                        else {
                            n = this.canvasFactory.create(t, r);
                            this.cache[e] = n;
                        } s && addContextCurrentTransform(n.context); return n; };
                        CachedCanvases.prototype.clear = function () { for (var e_46 in this.cache) {
                            var t_21 = this.cache[e_46];
                            this.canvasFactory.destroy(t_21);
                            delete this.cache[e_46];
                        } };
                        return CachedCanvases;
                    }()); 
                    var CanvasExtraState = /** @class */ (function () {
                        function CanvasExtraState() {
                            this.alphaIsShape = !1;
                            this.fontSize = 0;
                            this.fontSizeScale = 1;
                            this.textMatrix = s.IDENTITY_MATRIX;
                            this.textMatrixScale = 1;
                            this.fontMatrix = s.FONT_IDENTITY_MATRIX;
                            this.leading = 0;
                            this.x = 0;
                            this.y = 0;
                            this.lineX = 0;
                            this.lineY = 0;
                            this.charSpacing = 0;
                            this.wordSpacing = 0;
                            this.textHScale = 1;
                            this.textRenderingMode = s.TextRenderingMode.FILL;
                            this.textRise = 0;
                            this.fillColor = "#000000";
                            this.strokeColor = "#000000";
                            this.patternFill = !1;
                            this.fillAlpha = 1;
                            this.strokeAlpha = 1;
                            this.lineWidth = 1;
                            this.activeSMask = null;
                            this.resumeSMaskCtx = null;
                            this.transferMaps = null;
                        }
                        CanvasExtraState.prototype.clone = function () { return Object.create(this); };
                        CanvasExtraState.prototype.setCurrentPoint = function (e, t) { this.x = e; this.y = t; };
                        return CanvasExtraState;
                    }());  var o = function CanvasGraphicsClosure() { function putBinaryImageData(e, t, r) {
                    var _a, _b;
                    if (r === void 0) { r = null; }
                    if ("undefined" != typeof ImageData && t instanceof ImageData) {
                        e.putImageData(t, 0, 0);
                        return;
                    }
                    var n = t.height, a = t.width, o = n % i, l = (n - o) / i, c = 0 === o ? l : l + 1, h = e.createImageData(a, i);
                    var d, u = 0;
                    var p = t.data, g = h.data;
                    var f, m, A, _, b, y, S, v;
                    if (r)
                        switch (r.length) {
                            case 1:
                                b = r[0];
                                y = r[0];
                                S = r[0];
                                v = r[0];
                                break;
                            case 4:
                                b = r[0];
                                y = r[1];
                                S = r[2];
                                v = r[3];
                        }
                    if (t.kind === s.ImageKind.GRAYSCALE_1BPP) {
                        var t_22 = p.byteLength, r_19 = new Uint32Array(g.buffer, 0, g.byteLength >> 2), n_2 = r_19.length, _1 = a + 7 >> 3;
                        var b_1 = 4294967295, y_1 = s.IsLittleEndianCached.value ? 4278190080 : 255;
                        v && 255 === v[0] && 0 === v[255] && (_a = [y_1, b_1], _b = __read(_a, 2), b_1 = _b[0], y_1 = _b[1], _a);
                        for (f = 0; f < c; f++) {
                            A = f < l ? i : o;
                            d = 0;
                            for (m = 0; m < A; m++) {
                                var e_47 = t_22 - u;
                                var s_13 = 0;
                                var n_3 = e_47 > _1 ? a : 8 * e_47 - 7, i_4 = -8 & n_3;
                                var o_2 = 0, l_1 = 0;
                                for (; s_13 < i_4; s_13 += 8) {
                                    l_1 = p[u++];
                                    r_19[d++] = 128 & l_1 ? b_1 : y_1;
                                    r_19[d++] = 64 & l_1 ? b_1 : y_1;
                                    r_19[d++] = 32 & l_1 ? b_1 : y_1;
                                    r_19[d++] = 16 & l_1 ? b_1 : y_1;
                                    r_19[d++] = 8 & l_1 ? b_1 : y_1;
                                    r_19[d++] = 4 & l_1 ? b_1 : y_1;
                                    r_19[d++] = 2 & l_1 ? b_1 : y_1;
                                    r_19[d++] = 1 & l_1 ? b_1 : y_1;
                                }
                                for (; s_13 < n_3; s_13++) {
                                    if (0 === o_2) {
                                        l_1 = p[u++];
                                        o_2 = 128;
                                    }
                                    r_19[d++] = l_1 & o_2 ? b_1 : y_1;
                                    o_2 >>= 1;
                                }
                            }
                            for (; d < n_2;)
                                r_19[d++] = 0;
                            e.putImageData(h, 0, f * i);
                        }
                    }
                    else if (t.kind === s.ImageKind.RGBA_32BPP) {
                        var t_23 = !!(b || y || S);
                        m = 0;
                        _ = a * i * 4;
                        for (f = 0; f < l; f++) {
                            g.set(p.subarray(u, u + _));
                            u += _;
                            if (t_23)
                                for (var e_48 = 0; e_48 < _; e_48 += 4) {
                                    b && (g[e_48 + 0] = b[g[e_48 + 0]]);
                                    y && (g[e_48 + 1] = y[g[e_48 + 1]]);
                                    S && (g[e_48 + 2] = S[g[e_48 + 2]]);
                                }
                            e.putImageData(h, 0, m);
                            m += i;
                        }
                        if (f < c) {
                            _ = a * o * 4;
                            g.set(p.subarray(u, u + _));
                            if (t_23)
                                for (var e_49 = 0; e_49 < _; e_49 += 4) {
                                    b && (g[e_49 + 0] = b[g[e_49 + 0]]);
                                    y && (g[e_49 + 1] = y[g[e_49 + 1]]);
                                    S && (g[e_49 + 2] = S[g[e_49 + 2]]);
                                }
                            e.putImageData(h, 0, m);
                        }
                    }
                    else {
                        if (t.kind !== s.ImageKind.RGB_24BPP)
                            throw new Error("bad image kind: " + t.kind);
                        {
                            var t_24 = !!(b || y || S);
                            A = i;
                            _ = a * A;
                            for (f = 0; f < c; f++) {
                                if (f >= l) {
                                    A = o;
                                    _ = a * A;
                                }
                                d = 0;
                                for (m = _; m--;) {
                                    g[d++] = p[u++];
                                    g[d++] = p[u++];
                                    g[d++] = p[u++];
                                    g[d++] = 255;
                                }
                                if (t_24)
                                    for (var e_50 = 0; e_50 < d; e_50 += 4) {
                                        b && (g[e_50 + 0] = b[g[e_50 + 0]]);
                                        y && (g[e_50 + 1] = y[g[e_50 + 1]]);
                                        S && (g[e_50 + 2] = S[g[e_50 + 2]]);
                                    }
                                e.putImageData(h, 0, f * i);
                            }
                        }
                    }
                } function putBinaryImageMask(e, t) { var r = t.height, s = t.width, n = r % i, a = (r - n) / i, o = 0 === n ? a : a + 1, l = e.createImageData(s, i); var c = 0; var h = t.data, d = l.data; for (var t_25 = 0; t_25 < o; t_25++) {
                    var r_20 = t_25 < a ? i : n;
                    var o_3 = 3;
                    for (var e_51 = 0; e_51 < r_20; e_51++) {
                        var e_52 = void 0, t_26 = 0;
                        for (var r_21 = 0; r_21 < s; r_21++) {
                            if (!t_26) {
                                e_52 = h[c++];
                                t_26 = 128;
                            }
                            d[o_3] = e_52 & t_26 ? 0 : 255;
                            o_3 += 4;
                            t_26 >>= 1;
                        }
                    }
                    e.putImageData(l, 0, t_25 * i);
                } } function copyCtxState(e, t) { var r = ["strokeStyle", "fillStyle", "fillRule", "globalAlpha", "lineWidth", "lineCap", "lineJoin", "miterLimit", "globalCompositeOperation", "font"]; for (var s_14 = 0, n_4 = r.length; s_14 < n_4; s_14++) {
                    var n_5 = r[s_14];
                    void 0 !== e[n_5] && (t[n_5] = e[n_5]);
                } if (void 0 !== e.setLineDash) {
                    t.setLineDash(e.getLineDash());
                    t.lineDashOffset = e.lineDashOffset;
                } } function resetCtxToDefault(e) { e.strokeStyle = "#000000"; e.fillStyle = "#000000"; e.fillRule = "nonzero"; e.globalAlpha = 1; e.lineWidth = 1; e.lineCap = "butt"; e.lineJoin = "miter"; e.miterLimit = 10; e.globalCompositeOperation = "source-over"; e.font = "10px sans-serif"; if (void 0 !== e.setLineDash) {
                    e.setLineDash([]);
                    e.lineDashOffset = 0;
                } } function composeSMaskBackdrop(e, t, r, s) { var n = e.length; for (var a_4 = 3; a_4 < n; a_4 += 4) {
                    var n_6 = e[a_4];
                    if (0 === n_6) {
                        e[a_4 - 3] = t;
                        e[a_4 - 2] = r;
                        e[a_4 - 1] = s;
                    }
                    else if (n_6 < 255) {
                        var i_5 = 255 - n_6;
                        e[a_4 - 3] = e[a_4 - 3] * n_6 + t * i_5 >> 8;
                        e[a_4 - 2] = e[a_4 - 2] * n_6 + r * i_5 >> 8;
                        e[a_4 - 1] = e[a_4 - 1] * n_6 + s * i_5 >> 8;
                    }
                } } function composeSMaskAlpha(e, t, r) { var s = e.length; for (var n_7 = 3; n_7 < s; n_7 += 4) {
                    var s_15 = r ? r[e[n_7]] : e[n_7];
                    t[n_7] = t[n_7] * s_15 * .00392156862745098 | 0;
                } } function composeSMaskLuminosity(e, t, r) { var s = e.length; for (var n_8 = 3; n_8 < s; n_8 += 4) {
                    var s_16 = 77 * e[n_8 - 3] + 152 * e[n_8 - 2] + 28 * e[n_8 - 1];
                    t[n_8] = r ? t[n_8] * r[s_16 >> 8] >> 8 : t[n_8] * s_16 >> 16;
                } } function composeSMask(e, t, r) { var s = t.canvas, n = t.context; e.setTransform(t.scaleX, 0, 0, t.scaleY, t.offsetX, t.offsetY); !function genericComposeSMask(e, t, r, s, n, a, i) { var o = !!a, l = o ? a[0] : 0, c = o ? a[1] : 0, h = o ? a[2] : 0; var d; d = "Luminosity" === n ? composeSMaskLuminosity : composeSMaskAlpha; var u = Math.min(s, Math.ceil(1048576 / r)); for (var n_9 = 0; n_9 < s; n_9 += u) {
                    var a_5 = Math.min(u, s - n_9), p = e.getImageData(0, n_9, r, a_5), g = t.getImageData(0, n_9, r, a_5);
                    o && composeSMaskBackdrop(p.data, l, c, h);
                    d(p.data, g.data, i);
                    e.putImageData(g, 0, n_9);
                } }(n, r, s.width, s.height, t.subtype, t.backdrop, t.transferMap); e.drawImage(s, 0, 0); } var e = ["butt", "round", "square"], t = ["miter", "round", "bevel"], r = {}, o = {};
                    var CanvasGraphics = /** @class */ (function () {
                        function CanvasGraphics(e, t, r, s, n, a) {
                            this.ctx = e;
                            this.current = new CanvasExtraState;
                            this.stateStack = [];
                            this.pendingClip = null;
                            this.pendingEOFill = !1;
                            this.res = null;
                            this.xobjs = null;
                            this.commonObjs = t;
                            this.objs = r;
                            this.canvasFactory = s;
                            this.imageLayer = n;
                            this.groupStack = [];
                            this.processingType3 = null;
                            this.baseTransform = null;
                            this.baseTransformStack = [];
                            this.groupLevel = 0;
                            this.smaskStack = [];
                            this.smaskCounter = 0;
                            this.tempSMask = null;
                            this.contentVisible = !0;
                            this.markedContentStack = [];
                            this.optionalContentConfig = a;
                            this.cachedCanvases = new CachedCanvases(this.canvasFactory);
                            this.cachedPatterns = new Map;
                            e && addContextCurrentTransform(e);
                            this._cachedGetSinglePixelWidth = null;
                        }
                        CanvasGraphics.prototype.beginDrawing = function (_a) {
                            var e = _a.transform, t = _a.viewport, _b = _a.transparency, r = _b === void 0 ? !1 : _b, _c = _a.background, s = _c === void 0 ? null : _c;
                            var n = this.ctx.canvas.width, a = this.ctx.canvas.height;
                            this.ctx.save();
                            this.ctx.fillStyle = s || "rgb(255, 255, 255)";
                            this.ctx.fillRect(0, 0, n, a);
                            this.ctx.restore();
                            if (r) {
                                var e_53 = this.cachedCanvases.getCanvas("transparent", n, a, !0);
                                this.compositeCtx = this.ctx;
                                this.transparentCanvas = e_53.canvas;
                                this.ctx = e_53.context;
                                this.ctx.save();
                                this.ctx.transform.apply(this.ctx, this.compositeCtx.mozCurrentTransform);
                            }
                            this.ctx.save();
                            resetCtxToDefault(this.ctx);
                            e && this.ctx.transform.apply(this.ctx, e);
                            this.ctx.transform.apply(this.ctx, t.transform);
                            this.baseTransform = this.ctx.mozCurrentTransform.slice();
                            this._combinedScaleFactor = Math.hypot(this.baseTransform[0], this.baseTransform[2]);
                            this.imageLayer && this.imageLayer.beginLayout();
                        };
                        CanvasGraphics.prototype.executeOperatorList = function (e, t, r, n) {
                            var e_54, _a;
                            var a = e.argsArray, i = e.fnArray;
                            var o = t || 0;
                            var l = a.length;
                            if (l === o)
                                return o;
                            var c = l - o > 10 && "function" == typeof r, h = c ? Date.now() + 15 : 0;
                            var d = 0;
                            var u = this.commonObjs, p = this.objs;
                            var g;
                            for (;;) {
                                if (void 0 !== n && o === n.nextBreakPoint) {
                                    n.breakIt(o, r);
                                    return o;
                                }
                                g = i[o];
                                if (g !== s.OPS.dependency)
                                    this[g].apply(this, a[o]);
                                else
                                    try {
                                        for (var _b = (e_54 = void 0, __values(a[o])), _c = _b.next(); !_c.done; _c = _b.next()) {
                                            var e_55 = _c.value;
                                            var t_27 = e_55.startsWith("g_") ? u : p;
                                            if (!t_27.has(e_55)) {
                                                t_27.get(e_55, r);
                                                return o;
                                            }
                                        }
                                    }
                                    catch (e_54_1) { e_54 = { error: e_54_1 }; }
                                    finally {
                                        try {
                                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                        }
                                        finally { if (e_54) throw e_54.error; }
                                    }
                                o++;
                                if (o === l)
                                    return o;
                                if (c && ++d > 10) {
                                    if (Date.now() > h) {
                                        r();
                                        return o;
                                    }
                                    d = 0;
                                }
                            }
                        };
                        CanvasGraphics.prototype.endDrawing = function () { for (; this.stateStack.length || null !== this.current.activeSMask;)
                            this.restore(); this.ctx.restore(); if (this.transparentCanvas) {
                            this.ctx = this.compositeCtx;
                            this.ctx.save();
                            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                            this.ctx.drawImage(this.transparentCanvas, 0, 0);
                            this.ctx.restore();
                            this.transparentCanvas = null;
                        } this.cachedCanvases.clear(); this.cachedPatterns.clear(); this.imageLayer && this.imageLayer.endLayout(); };
                        CanvasGraphics.prototype._scaleImage = function (e, t) { var r = e.width, s = e.height; var n, a, i = Math.max(Math.hypot(t[0], t[1]), 1), o = Math.max(Math.hypot(t[2], t[3]), 1), l = r, c = s, h = "prescale1"; for (; i > 2 && l > 1 || o > 2 && c > 1;) {
                            var t_28 = l, r_22 = c;
                            if (i > 2 && l > 1) {
                                t_28 = Math.ceil(l / 2);
                                i /= l / t_28;
                            }
                            if (o > 2 && c > 1) {
                                r_22 = Math.ceil(c / 2);
                                o /= c / r_22;
                            }
                            n = this.cachedCanvases.getCanvas(h, t_28, r_22);
                            a = n.context;
                            a.clearRect(0, 0, t_28, r_22);
                            a.drawImage(e, 0, 0, l, c, 0, 0, t_28, r_22);
                            e = n.canvas;
                            l = t_28;
                            c = r_22;
                            h = "prescale1" === h ? "prescale2" : "prescale1";
                        } return { img: e, paintWidth: l, paintHeight: c }; };
                        CanvasGraphics.prototype._createMaskCanvas = function (e) { var t = this.ctx, r = e.width, n = e.height, a = this.current.fillColor, i = this.current.patternFill, o = this.cachedCanvases.getCanvas("maskCanvas", r, n); putBinaryImageMask(o.context, e); var l = t.mozCurrentTransform; var c = s.Util.transform(l, [1 / r, 0, 0, -1 / n, 0, 0]); c = s.Util.transform(c, [1, 0, 0, 1, 0, -n]); var h = s.Util.applyTransform([0, 0], c), d = s.Util.applyTransform([r, n], c), u = s.Util.normalizeRect([h[0], h[1], d[0], d[1]]), p = Math.ceil(u[2] - u[0]), g = Math.ceil(u[3] - u[1]), f = this.cachedCanvases.getCanvas("fillCanvas", p, g, !0), m = f.context, A = Math.min(h[0], d[0]), _ = Math.min(h[1], d[1]); m.translate(-A, -_); m.transform.apply(m, c); var b = this._scaleImage(o.canvas, m.mozCurrentTransformInverse); m.drawImage(b.img, 0, 0, b.img.width, b.img.height, 0, 0, r, n); m.globalCompositeOperation = "source-in"; var y = s.Util.transform(m.mozCurrentTransformInverse, [1, 0, 0, 1, -A, -_]); m.fillStyle = i ? a.getPattern(t, this, y, !1) : a; m.fillRect(0, 0, r, n); return { canvas: f.canvas, offsetX: Math.round(A), offsetY: Math.round(_) }; };
                        CanvasGraphics.prototype.setLineWidth = function (e) { this.current.lineWidth = e; this.ctx.lineWidth = e; };
                        CanvasGraphics.prototype.setLineCap = function (t) { this.ctx.lineCap = e[t]; };
                        CanvasGraphics.prototype.setLineJoin = function (e) { this.ctx.lineJoin = t[e]; };
                        CanvasGraphics.prototype.setMiterLimit = function (e) { this.ctx.miterLimit = e; };
                        CanvasGraphics.prototype.setDash = function (e, t) { var r = this.ctx; if (void 0 !== r.setLineDash) {
                            r.setLineDash(e);
                            r.lineDashOffset = t;
                        } };
                        CanvasGraphics.prototype.setRenderingIntent = function (e) { };
                        CanvasGraphics.prototype.setFlatness = function (e) { };
                        CanvasGraphics.prototype.setGState = function (e) { for (var t_29 = 0, r_23 = e.length; t_29 < r_23; t_29++) {
                            var r_24 = e[t_29], s_17 = r_24[0], n_10 = r_24[1];
                            switch (s_17) {
                                case "LW":
                                    this.setLineWidth(n_10);
                                    break;
                                case "LC":
                                    this.setLineCap(n_10);
                                    break;
                                case "LJ":
                                    this.setLineJoin(n_10);
                                    break;
                                case "ML":
                                    this.setMiterLimit(n_10);
                                    break;
                                case "D":
                                    this.setDash(n_10[0], n_10[1]);
                                    break;
                                case "RI":
                                    this.setRenderingIntent(n_10);
                                    break;
                                case "FL":
                                    this.setFlatness(n_10);
                                    break;
                                case "Font":
                                    this.setFont(n_10[0], n_10[1]);
                                    break;
                                case "CA":
                                    this.current.strokeAlpha = r_24[1];
                                    break;
                                case "ca":
                                    this.current.fillAlpha = r_24[1];
                                    this.ctx.globalAlpha = r_24[1];
                                    break;
                                case "BM":
                                    this.ctx.globalCompositeOperation = n_10;
                                    break;
                                case "SMask":
                                    this.current.activeSMask && (this.stateStack.length > 0 && this.stateStack[this.stateStack.length - 1].activeSMask === this.current.activeSMask ? this.suspendSMaskGroup() : this.endSMaskGroup());
                                    this.current.activeSMask = n_10 ? this.tempSMask : null;
                                    this.current.activeSMask && this.beginSMaskGroup();
                                    this.tempSMask = null;
                                    break;
                                case "TR": this.current.transferMaps = n_10;
                            }
                        } };
                        CanvasGraphics.prototype.beginSMaskGroup = function () { var e = this.current.activeSMask, t = e.canvas.width, r = e.canvas.height, s = "smaskGroupAt" + this.groupLevel, n = this.cachedCanvases.getCanvas(s, t, r, !0), a = this.ctx, i = a.mozCurrentTransform; this.ctx.save(); var o = n.context; o.scale(1 / e.scaleX, 1 / e.scaleY); o.translate(-e.offsetX, -e.offsetY); o.transform.apply(o, i); e.startTransformInverse = o.mozCurrentTransformInverse; copyCtxState(a, o); this.ctx = o; this.setGState([["BM", "source-over"], ["ca", 1], ["CA", 1]]); this.groupStack.push(a); this.groupLevel++; };
                        CanvasGraphics.prototype.suspendSMaskGroup = function () { var e = this.ctx; this.groupLevel--; this.ctx = this.groupStack.pop(); composeSMask(this.ctx, this.current.activeSMask, e); this.ctx.restore(); this.ctx.save(); copyCtxState(e, this.ctx); this.current.resumeSMaskCtx = e; var t = s.Util.transform(this.current.activeSMask.startTransformInverse, e.mozCurrentTransform); this.ctx.transform.apply(this.ctx, t); e.save(); e.setTransform(1, 0, 0, 1, 0, 0); e.clearRect(0, 0, e.canvas.width, e.canvas.height); e.restore(); };
                        CanvasGraphics.prototype.resumeSMaskGroup = function () { var e = this.current.resumeSMaskCtx, t = this.ctx; this.ctx = e; this.groupStack.push(t); this.groupLevel++; };
                        CanvasGraphics.prototype.endSMaskGroup = function () { var e = this.ctx; this.groupLevel--; this.ctx = this.groupStack.pop(); composeSMask(this.ctx, this.current.activeSMask, e); this.ctx.restore(); copyCtxState(e, this.ctx); var t = s.Util.transform(this.current.activeSMask.startTransformInverse, e.mozCurrentTransform); this.ctx.transform.apply(this.ctx, t); };
                        CanvasGraphics.prototype.save = function () { this.ctx.save(); var e = this.current; this.stateStack.push(e); this.current = e.clone(); this.current.resumeSMaskCtx = null; };
                        CanvasGraphics.prototype.restore = function () { this.current.resumeSMaskCtx && this.resumeSMaskGroup(); null === this.current.activeSMask || 0 !== this.stateStack.length && this.stateStack[this.stateStack.length - 1].activeSMask === this.current.activeSMask || this.endSMaskGroup(); if (0 !== this.stateStack.length) {
                            this.current = this.stateStack.pop();
                            this.ctx.restore();
                            this.pendingClip = null;
                            this._cachedGetSinglePixelWidth = null;
                        }
                        else
                            this.current.activeSMask = null; };
                        CanvasGraphics.prototype.transform = function (e, t, r, s, n, a) { this.ctx.transform(e, t, r, s, n, a); this._cachedGetSinglePixelWidth = null; };
                        CanvasGraphics.prototype.constructPath = function (e, t) { var r = this.ctx, n = this.current; var a = n.x, i = n.y; for (var n_11 = 0, o_4 = 0, l = e.length; n_11 < l; n_11++)
                            switch (0 | e[n_11]) {
                                case s.OPS.rectangle:
                                    a = t[o_4++];
                                    i = t[o_4++];
                                    var e_56 = t[o_4++], n_12 = t[o_4++], l_2 = a + e_56, c = i + n_12;
                                    r.moveTo(a, i);
                                    if (0 === e_56 || 0 === n_12)
                                        r.lineTo(l_2, c);
                                    else {
                                        r.lineTo(l_2, i);
                                        r.lineTo(l_2, c);
                                        r.lineTo(a, c);
                                    }
                                    r.closePath();
                                    break;
                                case s.OPS.moveTo:
                                    a = t[o_4++];
                                    i = t[o_4++];
                                    r.moveTo(a, i);
                                    break;
                                case s.OPS.lineTo:
                                    a = t[o_4++];
                                    i = t[o_4++];
                                    r.lineTo(a, i);
                                    break;
                                case s.OPS.curveTo:
                                    a = t[o_4 + 4];
                                    i = t[o_4 + 5];
                                    r.bezierCurveTo(t[o_4], t[o_4 + 1], t[o_4 + 2], t[o_4 + 3], a, i);
                                    o_4 += 6;
                                    break;
                                case s.OPS.curveTo2:
                                    r.bezierCurveTo(a, i, t[o_4], t[o_4 + 1], t[o_4 + 2], t[o_4 + 3]);
                                    a = t[o_4 + 2];
                                    i = t[o_4 + 3];
                                    o_4 += 4;
                                    break;
                                case s.OPS.curveTo3:
                                    a = t[o_4 + 2];
                                    i = t[o_4 + 3];
                                    r.bezierCurveTo(t[o_4], t[o_4 + 1], a, i, a, i);
                                    o_4 += 4;
                                    break;
                                case s.OPS.closePath: r.closePath();
                            } n.setCurrentPoint(a, i); };
                        CanvasGraphics.prototype.closePath = function () { this.ctx.closePath(); };
                        CanvasGraphics.prototype.stroke = function (e) { e = void 0 === e || e; var t = this.ctx, r = this.current.strokeColor; t.globalAlpha = this.current.strokeAlpha; if (this.contentVisible)
                            if ("object" == typeof r && (r === null || r === void 0 ? void 0 : r.getPattern)) {
                                var e_57 = this.getSinglePixelWidth();
                                t.save();
                                t.strokeStyle = r.getPattern(t, this, t.mozCurrentTransformInverse);
                                t.lineWidth = Math.max(e_57, this.current.lineWidth);
                                t.stroke();
                                t.restore();
                            }
                            else {
                                var e_58 = this.getSinglePixelWidth();
                                if (e_58 < 0 && -e_58 >= this.current.lineWidth) {
                                    t.save();
                                    t.resetTransform();
                                    t.lineWidth = Math.round(this._combinedScaleFactor);
                                    t.stroke();
                                    t.restore();
                                }
                                else {
                                    t.lineWidth = Math.max(e_58, this.current.lineWidth);
                                    t.stroke();
                                }
                            } e && this.consumePath(); t.globalAlpha = this.current.fillAlpha; };
                        CanvasGraphics.prototype.closeStroke = function () { this.closePath(); this.stroke(); };
                        CanvasGraphics.prototype.fill = function (e) { e = void 0 === e || e; var t = this.ctx, r = this.current.fillColor; var s = !1; if (this.current.patternFill) {
                            t.save();
                            t.fillStyle = r.getPattern(t, this, t.mozCurrentTransformInverse);
                            s = !0;
                        } if (this.contentVisible)
                            if (this.pendingEOFill) {
                                t.fill("evenodd");
                                this.pendingEOFill = !1;
                            }
                            else
                                t.fill(); s && t.restore(); e && this.consumePath(); };
                        CanvasGraphics.prototype.eoFill = function () { this.pendingEOFill = !0; this.fill(); };
                        CanvasGraphics.prototype.fillStroke = function () { this.fill(!1); this.stroke(!1); this.consumePath(); };
                        CanvasGraphics.prototype.eoFillStroke = function () { this.pendingEOFill = !0; this.fillStroke(); };
                        CanvasGraphics.prototype.closeFillStroke = function () { this.closePath(); this.fillStroke(); };
                        CanvasGraphics.prototype.closeEOFillStroke = function () { this.pendingEOFill = !0; this.closePath(); this.fillStroke(); };
                        CanvasGraphics.prototype.endPath = function () { this.consumePath(); };
                        CanvasGraphics.prototype.clip = function () { this.pendingClip = r; };
                        CanvasGraphics.prototype.eoClip = function () { this.pendingClip = o; };
                        CanvasGraphics.prototype.beginText = function () { this.current.textMatrix = s.IDENTITY_MATRIX; this.current.textMatrixScale = 1; this.current.x = this.current.lineX = 0; this.current.y = this.current.lineY = 0; };
                        CanvasGraphics.prototype.endText = function () { var e = this.pendingTextPaths, t = this.ctx; if (void 0 !== e) {
                            t.save();
                            t.beginPath();
                            for (var r_25 = 0; r_25 < e.length; r_25++) {
                                var s_18 = e[r_25];
                                t.setTransform.apply(t, s_18.transform);
                                t.translate(s_18.x, s_18.y);
                                s_18.addToPath(t, s_18.fontSize);
                            }
                            t.restore();
                            t.clip();
                            t.beginPath();
                            delete this.pendingTextPaths;
                        }
                        else
                            t.beginPath(); };
                        CanvasGraphics.prototype.setCharSpacing = function (e) { this.current.charSpacing = e; };
                        CanvasGraphics.prototype.setWordSpacing = function (e) { this.current.wordSpacing = e; };
                        CanvasGraphics.prototype.setHScale = function (e) { this.current.textHScale = e / 100; };
                        CanvasGraphics.prototype.setLeading = function (e) { this.current.leading = -e; };
                        CanvasGraphics.prototype.setFont = function (e, t) { var r = this.commonObjs.get(e), n = this.current; if (!r)
                            throw new Error("Can't find font for " + e); n.fontMatrix = r.fontMatrix || s.FONT_IDENTITY_MATRIX; 0 !== n.fontMatrix[0] && 0 !== n.fontMatrix[3] || (0, s.warn)("Invalid font matrix for font " + e); if (t < 0) {
                            t = -t;
                            n.fontDirection = -1;
                        }
                        else
                            n.fontDirection = 1; this.current.font = r; this.current.fontSize = t; if (r.isType3Font)
                            return; var a = r.loadedName || "sans-serif"; var i = "normal"; r.black ? i = "900" : r.bold && (i = "bold"); var o = r.italic ? "italic" : "normal", l = "\"" + a + "\", " + r.fallbackName; var c = t; t < 16 ? c = 16 : t > 100 && (c = 100); this.current.fontSizeScale = t / c; this.ctx.font = o + " " + i + " " + c + "px " + l; };
                        CanvasGraphics.prototype.setTextRenderingMode = function (e) { this.current.textRenderingMode = e; };
                        CanvasGraphics.prototype.setTextRise = function (e) { this.current.textRise = e; };
                        CanvasGraphics.prototype.moveText = function (e, t) { this.current.x = this.current.lineX += e; this.current.y = this.current.lineY += t; };
                        CanvasGraphics.prototype.setLeadingMoveText = function (e, t) { this.setLeading(-t); this.moveText(e, t); };
                        CanvasGraphics.prototype.setTextMatrix = function (e, t, r, s, n, a) { this.current.textMatrix = [e, t, r, s, n, a]; this.current.textMatrixScale = Math.hypot(e, t); this.current.x = this.current.lineX = 0; this.current.y = this.current.lineY = 0; };
                        CanvasGraphics.prototype.nextLine = function () { this.moveText(0, this.current.leading); };
                        CanvasGraphics.prototype.paintChar = function (e, t, r, n, a) { var i = this.ctx, o = this.current, l = o.font, c = o.textRenderingMode, h = o.fontSize / o.fontSizeScale, d = c & s.TextRenderingMode.FILL_STROKE_MASK, u = !!(c & s.TextRenderingMode.ADD_TO_PATH_FLAG), p = o.patternFill && !l.missingFile; var g; (l.disableFontFace || u || p) && (g = l.getPathGenerator(this.commonObjs, e)); if (l.disableFontFace || p) {
                            i.save();
                            i.translate(t, r);
                            i.beginPath();
                            g(i, h);
                            n && i.setTransform.apply(i, n);
                            d !== s.TextRenderingMode.FILL && d !== s.TextRenderingMode.FILL_STROKE || i.fill();
                            if (d === s.TextRenderingMode.STROKE || d === s.TextRenderingMode.FILL_STROKE) {
                                if (a) {
                                    i.resetTransform();
                                    i.lineWidth = Math.round(this._combinedScaleFactor);
                                }
                                i.stroke();
                            }
                            i.restore();
                        }
                        else {
                            d !== s.TextRenderingMode.FILL && d !== s.TextRenderingMode.FILL_STROKE || i.fillText(e, t, r);
                            if (d === s.TextRenderingMode.STROKE || d === s.TextRenderingMode.FILL_STROKE)
                                if (a) {
                                    i.save();
                                    i.moveTo(t, r);
                                    i.resetTransform();
                                    i.lineWidth = Math.round(this._combinedScaleFactor);
                                    i.strokeText(e, 0, 0);
                                    i.restore();
                                }
                                else
                                    i.strokeText(e, t, r);
                        } if (u) {
                            (this.pendingTextPaths || (this.pendingTextPaths = [])).push({ transform: i.mozCurrentTransform, x: t, y: r, fontSize: h, addToPath: g });
                        } };
                        Object.defineProperty(CanvasGraphics.prototype, "isFontSubpixelAAEnabled", {
                            get: function () { var e = this.cachedCanvases.getCanvas("isFontSubpixelAAEnabled", 10, 10).context; e.scale(1.5, 1); e.fillText("I", 0, 10); var t = e.getImageData(0, 0, 10, 10).data; var r = !1; for (var e_59 = 3; e_59 < t.length; e_59 += 4)
                                if (t[e_59] > 0 && t[e_59] < 255) {
                                    r = !0;
                                    break;
                                } return (0, s.shadow)(this, "isFontSubpixelAAEnabled", r); },
                            enumerable: false,
                            configurable: true
                        });
                        CanvasGraphics.prototype.showText = function (e) { var t = this.current, r = t.font; if (r.isType3Font)
                            return this.showType3Text(e); var n = t.fontSize; if (0 === n)
                            return; var a = this.ctx, i = t.fontSizeScale, o = t.charSpacing, l = t.wordSpacing, c = t.fontDirection, h = t.textHScale * c, d = e.length, u = r.vertical, p = u ? 1 : -1, g = r.defaultVMetrics, f = n * t.fontMatrix[0], m = t.textRenderingMode === s.TextRenderingMode.FILL && !r.disableFontFace && !t.patternFill; a.save(); var A; if (t.patternFill) {
                            a.save();
                            var e_60 = t.fillColor.getPattern(a, this, a.mozCurrentTransformInverse);
                            A = a.mozCurrentTransform;
                            a.restore();
                            a.fillStyle = e_60;
                        } a.transform.apply(a, t.textMatrix); a.translate(t.x, t.y + t.textRise); c > 0 ? a.scale(h, -1) : a.scale(h, 1); var _ = t.lineWidth, b = !1; var y = t.textMatrixScale; if (0 === y || 0 === _) {
                            var e_61 = t.textRenderingMode & s.TextRenderingMode.FILL_STROKE_MASK;
                            if (e_61 === s.TextRenderingMode.STROKE || e_61 === s.TextRenderingMode.FILL_STROKE) {
                                this._cachedGetSinglePixelWidth = null;
                                _ = this.getSinglePixelWidth();
                                b = _ < 0;
                            }
                        }
                        else
                            _ /= y; if (1 !== i) {
                            a.scale(i, i);
                            _ /= i;
                        } a.lineWidth = _; var S, v = 0; for (S = 0; S < d; ++S) {
                            var t_30 = e[S];
                            if ((0, s.isNum)(t_30)) {
                                v += p * t_30 * n / 1e3;
                                continue;
                            }
                            var h_1 = !1;
                            var d_1 = (t_30.isSpace ? l : 0) + o, _2 = t_30.fontChar, y_2 = t_30.accent;
                            var x = void 0, C = void 0, P = void 0, k = t_30.width;
                            if (u) {
                                var e_62 = t_30.vmetric || g, r_26 = -(t_30.vmetric ? e_62[1] : .5 * k) * f, s_19 = e_62[2] * f;
                                k = e_62 ? -e_62[0] : k;
                                x = r_26 / i;
                                C = (v + s_19) / i;
                            }
                            else {
                                x = v / i;
                                C = 0;
                            }
                            if (r.remeasure && k > 0) {
                                var e_63 = 1e3 * a.measureText(_2).width / n * i;
                                if (k < e_63 && this.isFontSubpixelAAEnabled) {
                                    var t_31 = k / e_63;
                                    h_1 = !0;
                                    a.save();
                                    a.scale(t_31, 1);
                                    x /= t_31;
                                }
                                else
                                    k !== e_63 && (x += (k - e_63) / 2e3 * n / i);
                            }
                            if (this.contentVisible && (t_30.isInFont || r.missingFile))
                                if (m && !y_2)
                                    a.fillText(_2, x, C);
                                else {
                                    this.paintChar(_2, x, C, A, b);
                                    if (y_2) {
                                        var e_64 = x + n * y_2.offset.x / i, t_32 = C - n * y_2.offset.y / i;
                                        this.paintChar(y_2.fontChar, e_64, t_32, A, b);
                                    }
                                }
                            P = u ? k * f - d_1 * c : k * f + d_1 * c;
                            v += P;
                            h_1 && a.restore();
                        } u ? t.y -= v : t.x += v * h; a.restore(); };
                        CanvasGraphics.prototype.showType3Text = function (e) { var t = this.ctx, r = this.current, n = r.font, a = r.fontSize, i = r.fontDirection, o = n.vertical ? 1 : -1, l = r.charSpacing, c = r.wordSpacing, h = r.textHScale * i, d = r.fontMatrix || s.FONT_IDENTITY_MATRIX, u = e.length; var p, g, f, m; if (!(r.textRenderingMode === s.TextRenderingMode.INVISIBLE) && 0 !== a) {
                            this._cachedGetSinglePixelWidth = null;
                            t.save();
                            t.transform.apply(t, r.textMatrix);
                            t.translate(r.x, r.y);
                            t.scale(h, i);
                            for (p = 0; p < u; ++p) {
                                g = e[p];
                                if ((0, s.isNum)(g)) {
                                    m = o * g * a / 1e3;
                                    this.ctx.translate(m, 0);
                                    r.x += m * h;
                                    continue;
                                }
                                var i_6 = (g.isSpace ? c : 0) + l, u_1 = n.charProcOperatorList[g.operatorListId];
                                if (!u_1) {
                                    (0, s.warn)("Type3 character \"" + g.operatorListId + "\" is not available.");
                                    continue;
                                }
                                if (this.contentVisible) {
                                    this.processingType3 = g;
                                    this.save();
                                    t.scale(a, a);
                                    t.transform.apply(t, d);
                                    this.executeOperatorList(u_1);
                                    this.restore();
                                }
                                f = s.Util.applyTransform([g.width, 0], d)[0] * a + i_6;
                                t.translate(f, 0);
                                r.x += f * h;
                            }
                            t.restore();
                            this.processingType3 = null;
                        } };
                        CanvasGraphics.prototype.setCharWidth = function (e, t) { };
                        CanvasGraphics.prototype.setCharWidthAndBounds = function (e, t, r, s, n, a) { this.ctx.rect(r, s, n - r, a - s); this.clip(); this.endPath(); };
                        CanvasGraphics.prototype.getColorN_Pattern = function (e) {
                            var _this = this;
                            var t;
                            if ("TilingPattern" === e[0]) {
                                var r_27 = e[1], s_20 = this.baseTransform || this.ctx.mozCurrentTransform.slice(), a_6 = { createCanvasGraphics: function (e) { return new CanvasGraphics(e, _this.commonObjs, _this.objs, _this.canvasFactory); } };
                                t = new n.TilingPattern(e, r_27, this.ctx, a_6, s_20);
                            }
                            else
                                t = this._getPattern(e[1]);
                            return t;
                        };
                        CanvasGraphics.prototype.setStrokeColorN = function () { this.current.strokeColor = this.getColorN_Pattern(arguments); };
                        CanvasGraphics.prototype.setFillColorN = function () { this.current.fillColor = this.getColorN_Pattern(arguments); this.current.patternFill = !0; };
                        CanvasGraphics.prototype.setStrokeRGBColor = function (e, t, r) { var n = s.Util.makeHexColor(e, t, r); this.ctx.strokeStyle = n; this.current.strokeColor = n; };
                        CanvasGraphics.prototype.setFillRGBColor = function (e, t, r) { var n = s.Util.makeHexColor(e, t, r); this.ctx.fillStyle = n; this.current.fillColor = n; this.current.patternFill = !1; };
                        CanvasGraphics.prototype._getPattern = function (e) { if (this.cachedPatterns.has(e))
                            return this.cachedPatterns.get(e); var t = (0, n.getShadingPattern)(this.objs.get(e)); this.cachedPatterns.set(e, t); return t; };
                        CanvasGraphics.prototype.shadingFill = function (e) { if (!this.contentVisible)
                            return; var t = this.ctx; this.save(); var r = this._getPattern(e); t.fillStyle = r.getPattern(t, this, t.mozCurrentTransformInverse, !0); var n = t.mozCurrentTransformInverse; if (n) {
                            var e_65 = t.canvas, r_28 = e_65.width, a_7 = e_65.height, i_7 = s.Util.applyTransform([0, 0], n), o_5 = s.Util.applyTransform([0, a_7], n), l = s.Util.applyTransform([r_28, 0], n), c = s.Util.applyTransform([r_28, a_7], n), h = Math.min(i_7[0], o_5[0], l[0], c[0]), d = Math.min(i_7[1], o_5[1], l[1], c[1]), u = Math.max(i_7[0], o_5[0], l[0], c[0]), p = Math.max(i_7[1], o_5[1], l[1], c[1]);
                            this.ctx.fillRect(h, d, u - h, p - d);
                        }
                        else
                            this.ctx.fillRect(-1e10, -1e10, 2e10, 2e10); this.restore(); };
                        CanvasGraphics.prototype.beginInlineImage = function () { (0, s.unreachable)("Should not call beginInlineImage"); };
                        CanvasGraphics.prototype.beginImageData = function () { (0, s.unreachable)("Should not call beginImageData"); };
                        CanvasGraphics.prototype.paintFormXObjectBegin = function (e, t) { if (this.contentVisible) {
                            this.save();
                            this.baseTransformStack.push(this.baseTransform);
                            Array.isArray(e) && 6 === e.length && this.transform.apply(this, e);
                            this.baseTransform = this.ctx.mozCurrentTransform;
                            if (t) {
                                var e_66 = t[2] - t[0], r_29 = t[3] - t[1];
                                this.ctx.rect(t[0], t[1], e_66, r_29);
                                this.clip();
                                this.endPath();
                            }
                        } };
                        CanvasGraphics.prototype.paintFormXObjectEnd = function () { if (this.contentVisible) {
                            this.restore();
                            this.baseTransform = this.baseTransformStack.pop();
                        } };
                        CanvasGraphics.prototype.beginGroup = function (e) { if (!this.contentVisible)
                            return; this.save(); var t = this.ctx; e.isolated || (0, s.info)("TODO: Support non-isolated groups."); e.knockout && (0, s.warn)("Knockout groups not supported."); var r = t.mozCurrentTransform; e.matrix && t.transform.apply(t, e.matrix); if (!e.bbox)
                            throw new Error("Bounding box is required."); var n = s.Util.getAxialAlignedBoundingBox(e.bbox, t.mozCurrentTransform); var i = [0, 0, t.canvas.width, t.canvas.height]; n = s.Util.intersect(n, i) || [0, 0, 0, 0]; var o = Math.floor(n[0]), l = Math.floor(n[1]); var c = Math.max(Math.ceil(n[2]) - o, 1), h = Math.max(Math.ceil(n[3]) - l, 1), d = 1, u = 1; if (c > a) {
                            d = c / a;
                            c = a;
                        } if (h > a) {
                            u = h / a;
                            h = a;
                        } var p = "groupAt" + this.groupLevel; e.smask && (p += "_smask_" + this.smaskCounter++ % 2); var g = this.cachedCanvases.getCanvas(p, c, h, !0), f = g.context; f.scale(1 / d, 1 / u); f.translate(-o, -l); f.transform.apply(f, r); if (e.smask)
                            this.smaskStack.push({ canvas: g.canvas, context: f, offsetX: o, offsetY: l, scaleX: d, scaleY: u, subtype: e.smask.subtype, backdrop: e.smask.backdrop, transferMap: e.smask.transferMap || null, startTransformInverse: null });
                        else {
                            t.setTransform(1, 0, 0, 1, 0, 0);
                            t.translate(o, l);
                            t.scale(d, u);
                        } copyCtxState(t, f); this.ctx = f; this.setGState([["BM", "source-over"], ["ca", 1], ["CA", 1]]); this.groupStack.push(t); this.groupLevel++; this.current.activeSMask = null; };
                        CanvasGraphics.prototype.endGroup = function (e) { if (!this.contentVisible)
                            return; this.groupLevel--; var t = this.ctx; this.ctx = this.groupStack.pop(); void 0 !== this.ctx.imageSmoothingEnabled ? this.ctx.imageSmoothingEnabled = !1 : this.ctx.mozImageSmoothingEnabled = !1; e.smask ? this.tempSMask = this.smaskStack.pop() : this.ctx.drawImage(t.canvas, 0, 0); this.restore(); };
                        CanvasGraphics.prototype.beginAnnotations = function () { this.save(); this.baseTransform && this.ctx.setTransform.apply(this.ctx, this.baseTransform); };
                        CanvasGraphics.prototype.endAnnotations = function () { this.restore(); };
                        CanvasGraphics.prototype.beginAnnotation = function (e, t, r, s) { this.save(); resetCtxToDefault(this.ctx); this.current = new CanvasExtraState; if (Array.isArray(t) && 4 === t.length) {
                            var e_67 = t[2] - t[0], r_30 = t[3] - t[1];
                            this.ctx.rect(t[0], t[1], e_67, r_30);
                            this.clip();
                            this.endPath();
                        } this.transform.apply(this, r); this.transform.apply(this, s); };
                        CanvasGraphics.prototype.endAnnotation = function () { this.restore(); };
                        CanvasGraphics.prototype.paintImageMaskXObject = function (e) { if (!this.contentVisible)
                            return; var t = this.ctx, r = e.width, s = e.height, n = this.processingType3; n && void 0 === n.compiled && (n.compiled = r <= 1e3 && s <= 1e3 ? function compileType3Glyph(e) { var t = new Uint8Array([0, 2, 4, 0, 1, 0, 5, 4, 8, 10, 0, 8, 0, 2, 1, 0]), r = e.width, s = e.height, n = r + 1; var a, i, o, l; var c = new Uint8Array(n * (s + 1)), h = r + 7 & -8, d = e.data, u = new Uint8Array(h * s); var p = 0; for (a = 0, i = d.length; a < i; a++) {
                            var e_68 = d[a];
                            var t_33 = 128;
                            for (; t_33 > 0;) {
                                u[p++] = e_68 & t_33 ? 0 : 255;
                                t_33 >>= 1;
                            }
                        } var g = 0; p = 0; if (0 !== u[p]) {
                            c[0] = 1;
                            ++g;
                        } for (o = 1; o < r; o++) {
                            if (u[p] !== u[p + 1]) {
                                c[o] = u[p] ? 2 : 1;
                                ++g;
                            }
                            p++;
                        } if (0 !== u[p]) {
                            c[o] = 2;
                            ++g;
                        } for (a = 1; a < s; a++) {
                            p = a * h;
                            l = a * n;
                            if (u[p - h] !== u[p]) {
                                c[l] = u[p] ? 1 : 8;
                                ++g;
                            }
                            var e_69 = (u[p] ? 4 : 0) + (u[p - h] ? 8 : 0);
                            for (o = 1; o < r; o++) {
                                e_69 = (e_69 >> 2) + (u[p + 1] ? 4 : 0) + (u[p - h + 1] ? 8 : 0);
                                if (t[e_69]) {
                                    c[l + o] = t[e_69];
                                    ++g;
                                }
                                p++;
                            }
                            if (u[p - h] !== u[p]) {
                                c[l + o] = u[p] ? 2 : 4;
                                ++g;
                            }
                            if (g > 1e3)
                                return null;
                        } p = h * (s - 1); l = a * n; if (0 !== u[p]) {
                            c[l] = 8;
                            ++g;
                        } for (o = 1; o < r; o++) {
                            if (u[p] !== u[p + 1]) {
                                c[l + o] = u[p] ? 4 : 8;
                                ++g;
                            }
                            p++;
                        } if (0 !== u[p]) {
                            c[l + o] = 4;
                            ++g;
                        } if (g > 1e3)
                            return null; var f = new Int32Array([0, n, -1, 0, -n, 0, 0, 0, 1]), m = []; for (a = 0; g && a <= s; a++) {
                            var e_70 = a * n;
                            var t_34 = e_70 + r;
                            for (; e_70 < t_34 && !c[e_70];)
                                e_70++;
                            if (e_70 === t_34)
                                continue;
                            var s_21 = [e_70 % n, a], i_8 = e_70;
                            var o_6 = c[e_70];
                            do {
                                var t_35 = f[o_6];
                                do {
                                    e_70 += t_35;
                                } while (!c[e_70]);
                                var r_31 = c[e_70];
                                if (5 !== r_31 && 10 !== r_31) {
                                    o_6 = r_31;
                                    c[e_70] = 0;
                                }
                                else {
                                    o_6 = r_31 & 51 * o_6 >> 4;
                                    c[e_70] &= o_6 >> 2 | o_6 << 2;
                                }
                                s_21.push(e_70 % n, e_70 / n | 0);
                                c[e_70] || --g;
                            } while (i_8 !== e_70);
                            m.push(s_21);
                            --a;
                        } return function (e) { e.save(); e.scale(1 / r, -1 / s); e.translate(0, -s); e.beginPath(); for (var t_36 = 0, r_32 = m.length; t_36 < r_32; t_36++) {
                            var r_33 = m[t_36];
                            e.moveTo(r_33[0], r_33[1]);
                            for (var t_37 = 2, s_22 = r_33.length; t_37 < s_22; t_37 += 2)
                                e.lineTo(r_33[t_37], r_33[t_37 + 1]);
                        } e.fill(); e.beginPath(); e.restore(); }; }({ data: e.data, width: r, height: s }) : null); if (n === null || n === void 0 ? void 0 : n.compiled) {
                            n.compiled(t);
                            return;
                        } var a = this._createMaskCanvas(e), i = a.canvas; t.save(); t.setTransform(1, 0, 0, 1, 0, 0); t.drawImage(i, a.offsetX, a.offsetY); t.restore(); };
                        CanvasGraphics.prototype.paintImageMaskXObjectRepeat = function (e, t, r, n, a, i) {
                            if (r === void 0) { r = 0; }
                            if (n === void 0) { n = 0; }
                            if (!this.contentVisible)
                                return;
                            var o = this.ctx;
                            o.save();
                            var l = o.mozCurrentTransform;
                            o.transform(t, r, n, a, 0, 0);
                            var c = this._createMaskCanvas(e);
                            o.setTransform(1, 0, 0, 1, 0, 0);
                            for (var e_71 = 0, h = i.length; e_71 < h; e_71 += 2) {
                                var h_2 = s.Util.transform(l, [t, r, n, a, i[e_71], i[e_71 + 1]]), _a = __read(s.Util.applyTransform([0, 0], h_2), 2), d = _a[0], u = _a[1];
                                o.drawImage(c.canvas, d, u);
                            }
                            o.restore();
                        };
                        CanvasGraphics.prototype.paintImageMaskXObjectGroup = function (e) { if (!this.contentVisible)
                            return; var t = this.ctx, r = this.current.fillColor, s = this.current.patternFill; for (var n_13 = 0, a_8 = e.length; n_13 < a_8; n_13++) {
                            var a_9 = e[n_13], i_9 = a_9.width, o_7 = a_9.height, l = this.cachedCanvases.getCanvas("maskCanvas", i_9, o_7), c = l.context;
                            c.save();
                            putBinaryImageMask(c, a_9);
                            c.globalCompositeOperation = "source-in";
                            c.fillStyle = s ? r.getPattern(c, this, t.mozCurrentTransformInverse, !1) : r;
                            c.fillRect(0, 0, i_9, o_7);
                            c.restore();
                            t.save();
                            t.transform.apply(t, a_9.transform);
                            t.scale(1, -1);
                            t.drawImage(l.canvas, 0, 0, i_9, o_7, 0, -1, 1, 1);
                            t.restore();
                        } };
                        CanvasGraphics.prototype.paintImageXObject = function (e) { if (!this.contentVisible)
                            return; var t = e.startsWith("g_") ? this.commonObjs.get(e) : this.objs.get(e); t ? this.paintInlineImageXObject(t) : (0, s.warn)("Dependent image isn't ready yet"); };
                        CanvasGraphics.prototype.paintImageXObjectRepeat = function (e, t, r, n) { if (!this.contentVisible)
                            return; var a = e.startsWith("g_") ? this.commonObjs.get(e) : this.objs.get(e); if (!a) {
                            (0, s.warn)("Dependent image isn't ready yet");
                            return;
                        } var i = a.width, o = a.height, l = []; for (var e_72 = 0, s_23 = n.length; e_72 < s_23; e_72 += 2)
                            l.push({ transform: [t, 0, 0, r, n[e_72], n[e_72 + 1]], x: 0, y: 0, w: i, h: o }); this.paintInlineImageXObjectGroup(a, l); };
                        CanvasGraphics.prototype.paintInlineImageXObject = function (e) { if (!this.contentVisible)
                            return; var t = e.width, r = e.height, s = this.ctx; this.save(); s.scale(1 / t, -1 / r); var n; if ("function" == typeof HTMLElement && e instanceof HTMLElement || !e.data)
                            n = e;
                        else {
                            var s_24 = this.cachedCanvases.getCanvas("inlineImage", t, r);
                            putBinaryImageData(s_24.context, e, this.current.transferMaps);
                            n = s_24.canvas;
                        } var a = this._scaleImage(n, s.mozCurrentTransformInverse); s.drawImage(a.img, 0, 0, a.paintWidth, a.paintHeight, 0, -r, t, r); if (this.imageLayer) {
                            var n_14 = this.getCanvasPosition(0, -r);
                            this.imageLayer.appendImage({ imgData: e, left: n_14[0], top: n_14[1], width: t / s.mozCurrentTransformInverse[0], height: r / s.mozCurrentTransformInverse[3] });
                        } this.restore(); };
                        CanvasGraphics.prototype.paintInlineImageXObjectGroup = function (e, t) { if (!this.contentVisible)
                            return; var r = this.ctx, s = e.width, n = e.height, a = this.cachedCanvases.getCanvas("inlineImage", s, n); putBinaryImageData(a.context, e, this.current.transferMaps); for (var i_10 = 0, o_8 = t.length; i_10 < o_8; i_10++) {
                            var o_9 = t[i_10];
                            r.save();
                            r.transform.apply(r, o_9.transform);
                            r.scale(1, -1);
                            r.drawImage(a.canvas, o_9.x, o_9.y, o_9.w, o_9.h, 0, -1, 1, 1);
                            if (this.imageLayer) {
                                var t_38 = this.getCanvasPosition(o_9.x, o_9.y);
                                this.imageLayer.appendImage({ imgData: e, left: t_38[0], top: t_38[1], width: s, height: n });
                            }
                            r.restore();
                        } };
                        CanvasGraphics.prototype.paintSolidColorImageMask = function () { this.contentVisible && this.ctx.fillRect(0, 0, 1, 1); };
                        CanvasGraphics.prototype.markPoint = function (e) { };
                        CanvasGraphics.prototype.markPointProps = function (e, t) { };
                        CanvasGraphics.prototype.beginMarkedContent = function (e) { this.markedContentStack.push({ visible: !0 }); };
                        CanvasGraphics.prototype.beginMarkedContentProps = function (e, t) { "OC" === e ? this.markedContentStack.push({ visible: this.optionalContentConfig.isVisible(t) }) : this.markedContentStack.push({ visible: !0 }); this.contentVisible = this.isContentVisible(); };
                        CanvasGraphics.prototype.endMarkedContent = function () { this.markedContentStack.pop(); this.contentVisible = this.isContentVisible(); };
                        CanvasGraphics.prototype.beginCompat = function () { };
                        CanvasGraphics.prototype.endCompat = function () { };
                        CanvasGraphics.prototype.consumePath = function () { var e = this.ctx; if (this.pendingClip) {
                            this.pendingClip === o ? e.clip("evenodd") : e.clip();
                            this.pendingClip = null;
                        } e.beginPath(); };
                        CanvasGraphics.prototype.getSinglePixelWidth = function () { if (null === this._cachedGetSinglePixelWidth) {
                            var e_73 = this.ctx.mozCurrentTransform, t_39 = Math.abs(e_73[0] * e_73[3] - e_73[2] * e_73[1]), r_34 = Math.pow(e_73[0], 2) + Math.pow(e_73[2], 2), s_25 = Math.pow(e_73[1], 2) + Math.pow(e_73[3], 2), n_15 = Math.sqrt(Math.max(r_34, s_25)) / t_39;
                            r_34 !== s_25 && this._combinedScaleFactor * n_15 > 1 ? this._cachedGetSinglePixelWidth = -this._combinedScaleFactor * n_15 : t_39 > Number.EPSILON ? this._cachedGetSinglePixelWidth = n_15 : this._cachedGetSinglePixelWidth = 1;
                        } return this._cachedGetSinglePixelWidth; };
                        CanvasGraphics.prototype.getCanvasPosition = function (e, t) { var r = this.ctx.mozCurrentTransform; return [r[0] * e + r[2] * t + r[4], r[1] * e + r[3] * t + r[5]]; };
                        CanvasGraphics.prototype.isContentVisible = function () { for (var e_74 = this.markedContentStack.length - 1; e_74 >= 0; e_74--)
                            if (!this.markedContentStack[e_74].visible)
                                return !1; return !0; };
                        return CanvasGraphics;
                    }());  for (var e_75 in s.OPS)
                    CanvasGraphics.prototype[s.OPS[e_75]] = CanvasGraphics.prototype[e_75]; return CanvasGraphics; }(); t.CanvasGraphics = o; }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.getShadingPattern = function getShadingPattern(e) { switch (e[0]) {
                    case "RadialAxial": return new RadialAxialShadingPattern(e);
                    case "Mesh": return new MeshShadingPattern(e);
                    case "Dummy": return new DummyShadingPattern;
                } throw new Error("Unknown IR type: " + e[0]); }; t.TilingPattern = void 0; var s = r(2); function applyBoundingBox(e, t) { if (!t || "undefined" == typeof Path2D)
                    return; var r = t[2] - t[0], s = t[3] - t[1], n = new Path2D; n.rect(t[0], t[1], r, s); e.clip(n); }
                    var BaseShadingPattern = /** @class */ (function () {
                        function BaseShadingPattern() {
                            this.constructor === BaseShadingPattern && (0, s.unreachable)("Cannot initialize BaseShadingPattern.");
                        }
                        BaseShadingPattern.prototype.getPattern = function () { (0, s.unreachable)("Abstract method `getPattern` called."); };
                        return BaseShadingPattern;
                    }()); 
                    var RadialAxialShadingPattern = /** @class */ (function (_super) {
                        __extends(RadialAxialShadingPattern, _super);
                        function RadialAxialShadingPattern(e) {
                            var _this = _super.call(this) || this;
                            _this._type = e[1];
                            _this._bbox = e[2];
                            _this._colorStops = e[3];
                            _this._p0 = e[4];
                            _this._p1 = e[5];
                            _this._r0 = e[6];
                            _this._r1 = e[7];
                            _this._matrix = e[8];
                            _this._patternCache = null;
                            return _this;
                        }
                        RadialAxialShadingPattern.prototype._createGradient = function (e) {
                            var e_76, _a;
                            var t;
                            "axial" === this._type ? t = e.createLinearGradient(this._p0[0], this._p0[1], this._p1[0], this._p1[1]) : "radial" === this._type && (t = e.createRadialGradient(this._p0[0], this._p0[1], this._r0, this._p1[0], this._p1[1], this._r1));
                            try {
                                for (var _b = __values(this._colorStops), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var e_77 = _c.value;
                                    t.addColorStop(e_77[0], e_77[1]);
                                }
                            }
                            catch (e_76_1) { e_76 = { error: e_76_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_76) throw e_76.error; }
                            }
                            return t;
                        };
                        RadialAxialShadingPattern.prototype.getPattern = function (e, t, r, n) {
                            if (n === void 0) { n = !1; }
                            var a;
                            if (this._patternCache)
                                a = this._patternCache;
                            else {
                                if (n) {
                                    applyBoundingBox(e, this._bbox);
                                    a = this._createGradient(e);
                                }
                                else {
                                    var r_35 = t.cachedCanvases.getCanvas("pattern", t.ctx.canvas.width, t.ctx.canvas.height, !0), s_26 = r_35.context;
                                    s_26.clearRect(0, 0, s_26.canvas.width, s_26.canvas.height);
                                    s_26.beginPath();
                                    s_26.rect(0, 0, s_26.canvas.width, s_26.canvas.height);
                                    s_26.setTransform.apply(s_26, t.baseTransform);
                                    this._matrix && s_26.transform.apply(s_26, this._matrix);
                                    applyBoundingBox(s_26, this._bbox);
                                    s_26.fillStyle = this._createGradient(s_26);
                                    s_26.fill();
                                    a = e.createPattern(r_35.canvas, "repeat");
                                }
                                this._patternCache = a;
                            }
                            if (!n) {
                                var e_78 = new DOMMatrix(r);
                                try {
                                    a.setTransform(e_78);
                                }
                                catch (e) {
                                    (0, s.warn)("RadialAxialShadingPattern.getPattern: \"" + (e === null || e === void 0 ? void 0 : e.message) + "\".");
                                }
                            }
                            return a;
                        };
                        return RadialAxialShadingPattern;
                    }(BaseShadingPattern));  function drawTriangle(e, t, r, s, n, a, i, o) { var l = t.coords, c = t.colors, h = e.data, d = 4 * e.width; var u; if (l[r + 1] > l[s + 1]) {
                    u = r;
                    r = s;
                    s = u;
                    u = a;
                    a = i;
                    i = u;
                } if (l[s + 1] > l[n + 1]) {
                    u = s;
                    s = n;
                    n = u;
                    u = i;
                    i = o;
                    o = u;
                } if (l[r + 1] > l[s + 1]) {
                    u = r;
                    r = s;
                    s = u;
                    u = a;
                    a = i;
                    i = u;
                } var p = (l[r] + t.offsetX) * t.scaleX, g = (l[r + 1] + t.offsetY) * t.scaleY, f = (l[s] + t.offsetX) * t.scaleX, m = (l[s + 1] + t.offsetY) * t.scaleY, A = (l[n] + t.offsetX) * t.scaleX, _ = (l[n + 1] + t.offsetY) * t.scaleY; if (g >= _)
                    return; var b = c[a], y = c[a + 1], S = c[a + 2], v = c[i], x = c[i + 1], C = c[i + 2], P = c[o], k = c[o + 1], w = c[o + 2], R = Math.round(g), F = Math.round(_); var T, E, M, D, L, I, O, N; for (var e_79 = R; e_79 <= F; e_79++) {
                    if (e_79 < m) {
                        var t_40 = void 0;
                        t_40 = e_79 < g ? 0 : (g - e_79) / (g - m);
                        T = p - (p - f) * t_40;
                        E = b - (b - v) * t_40;
                        M = y - (y - x) * t_40;
                        D = S - (S - C) * t_40;
                    }
                    else {
                        var t_41 = void 0;
                        t_41 = e_79 > _ ? 1 : m === _ ? 0 : (m - e_79) / (m - _);
                        T = f - (f - A) * t_41;
                        E = v - (v - P) * t_41;
                        M = x - (x - k) * t_41;
                        D = C - (C - w) * t_41;
                    }
                    var t_42 = void 0;
                    t_42 = e_79 < g ? 0 : e_79 > _ ? 1 : (g - e_79) / (g - _);
                    L = p - (p - A) * t_42;
                    I = b - (b - P) * t_42;
                    O = y - (y - k) * t_42;
                    N = S - (S - w) * t_42;
                    var r_36 = Math.round(Math.min(T, L)), s_27 = Math.round(Math.max(T, L));
                    var n_16 = d * e_79 + 4 * r_36;
                    for (var e_80 = r_36; e_80 <= s_27; e_80++) {
                        t_42 = (T - e_80) / (T - L);
                        t_42 < 0 ? t_42 = 0 : t_42 > 1 && (t_42 = 1);
                        h[n_16++] = E - (E - I) * t_42 | 0;
                        h[n_16++] = M - (M - O) * t_42 | 0;
                        h[n_16++] = D - (D - N) * t_42 | 0;
                        h[n_16++] = 255;
                    }
                } } function drawFigure(e, t, r) { var s = t.coords, n = t.colors; var a, i; switch (t.type) {
                    case "lattice":
                        var o = t.verticesPerRow, l = Math.floor(s.length / o) - 1, c = o - 1;
                        for (a = 0; a < l; a++) {
                            var t_43 = a * o;
                            for (var a_10 = 0; a_10 < c; a_10++, t_43++) {
                                drawTriangle(e, r, s[t_43], s[t_43 + 1], s[t_43 + o], n[t_43], n[t_43 + 1], n[t_43 + o]);
                                drawTriangle(e, r, s[t_43 + o + 1], s[t_43 + 1], s[t_43 + o], n[t_43 + o + 1], n[t_43 + 1], n[t_43 + o]);
                            }
                        }
                        break;
                    case "triangles":
                        for (a = 0, i = s.length; a < i; a += 3)
                            drawTriangle(e, r, s[a], s[a + 1], s[a + 2], n[a], n[a + 1], n[a + 2]);
                        break;
                    default: throw new Error("illegal figure");
                } }
                    var MeshShadingPattern = /** @class */ (function (_super) {
                        __extends(MeshShadingPattern, _super);
                        function MeshShadingPattern(e) {
                            var _this = _super.call(this) || this;
                            _this._coords = e[2];
                            _this._colors = e[3];
                            _this._figures = e[4];
                            _this._bounds = e[5];
                            _this._matrix = e[6];
                            _this._bbox = e[7];
                            _this._background = e[8];
                            return _this;
                        }
                        MeshShadingPattern.prototype._createMeshCanvas = function (e, t, r) {
                            var e_81, _a;
                            var s = Math.floor(this._bounds[0]), n = Math.floor(this._bounds[1]), a = Math.ceil(this._bounds[2]) - s, i = Math.ceil(this._bounds[3]) - n, o = Math.min(Math.ceil(Math.abs(a * e[0] * 1.1)), 3e3), l = Math.min(Math.ceil(Math.abs(i * e[1] * 1.1)), 3e3), c = a / o, h = i / l, d = { coords: this._coords, colors: this._colors, offsetX: -s, offsetY: -n, scaleX: 1 / c, scaleY: 1 / h }, u = o + 4, p = l + 4, g = r.getCanvas("mesh", u, p, !1), f = g.context, m = f.createImageData(o, l);
                            if (t) {
                                var e_82 = m.data;
                                for (var r_37 = 0, s_28 = e_82.length; r_37 < s_28; r_37 += 4) {
                                    e_82[r_37] = t[0];
                                    e_82[r_37 + 1] = t[1];
                                    e_82[r_37 + 2] = t[2];
                                    e_82[r_37 + 3] = 255;
                                }
                            }
                            try {
                                for (var _b = __values(this._figures), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var e_83 = _c.value;
                                    drawFigure(m, e_83, d);
                                }
                            }
                            catch (e_81_1) { e_81 = { error: e_81_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_81) throw e_81.error; }
                            }
                            f.putImageData(m, 2, 2);
                            return { canvas: g.canvas, offsetX: s - 2 * c, offsetY: n - 2 * h, scaleX: c, scaleY: h };
                        };
                        MeshShadingPattern.prototype.getPattern = function (e, t, r, n) {
                            if (n === void 0) { n = !1; }
                            applyBoundingBox(e, this._bbox);
                            var a;
                            if (n)
                                a = s.Util.singularValueDecompose2dScale(e.mozCurrentTransform);
                            else {
                                a = s.Util.singularValueDecompose2dScale(t.baseTransform);
                                if (this._matrix) {
                                    var e_84 = s.Util.singularValueDecompose2dScale(this._matrix);
                                    a = [a[0] * e_84[0], a[1] * e_84[1]];
                                }
                            }
                            var i = this._createMeshCanvas(a, n ? null : this._background, t.cachedCanvases);
                            if (!n) {
                                e.setTransform.apply(e, t.baseTransform);
                                this._matrix && e.transform.apply(e, this._matrix);
                            }
                            e.translate(i.offsetX, i.offsetY);
                            e.scale(i.scaleX, i.scaleY);
                            return e.createPattern(i.canvas, "no-repeat");
                        };
                        return MeshShadingPattern;
                    }(BaseShadingPattern)); 
                    var DummyShadingPattern = /** @class */ (function (_super) {
                        __extends(DummyShadingPattern, _super);
                        function DummyShadingPattern() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        DummyShadingPattern.prototype.getPattern = function () { return "hotpink"; };
                        return DummyShadingPattern;
                    }(BaseShadingPattern));  var n = 1, a = 2;
                    var TilingPattern = /** @class */ (function () {
                        function TilingPattern(e, t, r, s, n) {
                            this.operatorList = e[2];
                            this.matrix = e[3] || [1, 0, 0, 1, 0, 0];
                            this.bbox = e[4];
                            this.xstep = e[5];
                            this.ystep = e[6];
                            this.paintType = e[7];
                            this.tilingType = e[8];
                            this.color = t;
                            this.ctx = r;
                            this.canvasGraphicsFactory = s;
                            this.baseTransform = n;
                        }
                        Object.defineProperty(TilingPattern, "MAX_PATTERN_SIZE", {
                            get: function () { return (0, s.shadow)(this, "MAX_PATTERN_SIZE", 3e3); },
                            enumerable: false,
                            configurable: true
                        });
                        TilingPattern.prototype.createPatternCanvas = function (e) { var t = this.operatorList, r = this.bbox, n = this.xstep, a = this.ystep, i = this.paintType, o = this.tilingType, l = this.color, c = this.canvasGraphicsFactory; (0, s.info)("TilingType: " + o); var h = r[0], d = r[1], u = r[2], p = r[3], g = s.Util.singularValueDecompose2dScale(this.matrix), f = s.Util.singularValueDecompose2dScale(this.baseTransform), m = [g[0] * f[0], g[1] * f[1]], A = this.getSizeAndScale(n, this.ctx.canvas.width, m[0]), _ = this.getSizeAndScale(a, this.ctx.canvas.height, m[1]), b = e.cachedCanvases.getCanvas("pattern", A.size, _.size, !0), y = b.context, S = c.createCanvasGraphics(y); S.groupLevel = e.groupLevel; this.setFillAndStrokeStyleToContext(S, i, l); var v = h, x = d, C = u, P = p; if (h < 0) {
                            v = 0;
                            C += Math.abs(h);
                        } if (d < 0) {
                            x = 0;
                            P += Math.abs(d);
                        } y.translate(-A.scale * v, -_.scale * x); S.transform(A.scale, 0, 0, _.scale, 0, 0); this.clipBbox(S, v, x, C, P); S.baseTransform = S.ctx.mozCurrentTransform.slice(); S.executeOperatorList(t); S.endDrawing(); return { canvas: b.canvas, scaleX: A.scale, scaleY: _.scale, offsetX: v, offsetY: x }; };
                        TilingPattern.prototype.getSizeAndScale = function (e, t, r) { e = Math.abs(e); var s = Math.max(TilingPattern.MAX_PATTERN_SIZE, t); var n = Math.ceil(e * r); n >= s ? n = s : r = n / e; return { scale: r, size: n }; };
                        TilingPattern.prototype.clipBbox = function (e, t, r, s, n) { var a = s - t, i = n - r; e.ctx.rect(t, r, a, i); e.clip(); e.endPath(); };
                        TilingPattern.prototype.setFillAndStrokeStyleToContext = function (e, t, r) { var i = e.ctx, o = e.current; switch (t) {
                            case n:
                                var e_85 = this.ctx;
                                i.fillStyle = e_85.fillStyle;
                                i.strokeStyle = e_85.strokeStyle;
                                o.fillColor = e_85.fillStyle;
                                o.strokeColor = e_85.strokeStyle;
                                break;
                            case a:
                                var l = s.Util.makeHexColor(r[0], r[1], r[2]);
                                i.fillStyle = l;
                                i.strokeStyle = l;
                                o.fillColor = l;
                                o.strokeColor = l;
                                break;
                            default: throw new s.FormatError("Unsupported paint type: " + t);
                        } };
                        TilingPattern.prototype.getPattern = function (e, t, r, n) {
                            if (n === void 0) { n = !1; }
                            var a = r;
                            if (!n) {
                                a = s.Util.transform(a, t.baseTransform);
                                this.matrix && (a = s.Util.transform(a, this.matrix));
                            }
                            var i = this.createPatternCanvas(t);
                            var o = new DOMMatrix(a);
                            o = o.translate(i.offsetX, i.offsetY);
                            o = o.scale(1 / i.scaleX, 1 / i.scaleY);
                            var l = e.createPattern(i.canvas, "repeat");
                            try {
                                l.setTransform(o);
                            }
                            catch (e) {
                                (0, s.warn)("TilingPattern.getPattern: \"" + (e === null || e === void 0 ? void 0 : e.message) + "\".");
                            }
                            return l;
                        };
                        return TilingPattern;
                    }());  t.TilingPattern = TilingPattern; }, function (e, t) { Object.defineProperty(t, "__esModule", { value: !0 }); t.GlobalWorkerOptions = void 0; var r = Object.create(null); t.GlobalWorkerOptions = r; r.workerPort = void 0 === r.workerPort ? null : r.workerPort; r.workerSrc = void 0 === r.workerSrc ? "" : r.workerSrc; }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.MessageHandler = void 0; var s = r(2); var n = 1, a = 2, i = 1, o = 2, l = 3, c = 4, h = 5, d = 6, u = 7, p = 8; function wrapReason(e) { if ("object" != typeof e || null === e)
                    return e; switch (e.name) {
                    case "AbortException": return new s.AbortException(e.message);
                    case "MissingPDFException": return new s.MissingPDFException(e.message);
                    case "UnexpectedResponseException": return new s.UnexpectedResponseException(e.message, e.status);
                    case "UnknownErrorException": return new s.UnknownErrorException(e.message, e.details);
                    default: return new s.UnknownErrorException(e.message, e.toString());
                } } t.MessageHandler = /** @class */ (function () {
                    function MessageHandler(e, t, r) {
                        var _this = this;
                        this.sourceName = e;
                        this.targetName = t;
                        this.comObj = r;
                        this.callbackId = 1;
                        this.streamId = 1;
                        this.postMessageTransfers = !0;
                        this.streamSinks = Object.create(null);
                        this.streamControllers = Object.create(null);
                        this.callbackCapabilities = Object.create(null);
                        this.actionHandler = Object.create(null);
                        this._onComObjOnMessage = function (e) { var t = e.data; if (t.targetName !== _this.sourceName)
                            return; if (t.stream) {
                            _this._processStreamMessage(t);
                            return;
                        } if (t.callback) {
                            var e_86 = t.callbackId, r_38 = _this.callbackCapabilities[e_86];
                            if (!r_38)
                                throw new Error("Cannot resolve callback " + e_86);
                            delete _this.callbackCapabilities[e_86];
                            if (t.callback === n)
                                r_38.resolve(t.data);
                            else {
                                if (t.callback !== a)
                                    throw new Error("Unexpected callback case");
                                r_38.reject(wrapReason(t.reason));
                            }
                            return;
                        } var s = _this.actionHandler[t.action]; if (!s)
                            throw new Error("Unknown action from worker: " + t.action); if (t.callbackId) {
                            var e_87 = _this.sourceName, i_11 = t.sourceName;
                            new Promise((function (e) { e(s(t.data)); })).then((function (s) { r.postMessage({ sourceName: e_87, targetName: i_11, callback: n, callbackId: t.callbackId, data: s }); }), (function (s) { r.postMessage({ sourceName: e_87, targetName: i_11, callback: a, callbackId: t.callbackId, reason: wrapReason(s) }); }));
                        }
                        else
                            t.streamId ? _this._createStreamSink(t) : s(t.data); };
                        r.addEventListener("message", this._onComObjOnMessage);
                    }
                    MessageHandler.prototype.on = function (e, t) { var r = this.actionHandler; if (r[e])
                        throw new Error("There is already an actionName called \"" + e + "\""); r[e] = t; };
                    MessageHandler.prototype.send = function (e, t, r) { this._postMessage({ sourceName: this.sourceName, targetName: this.targetName, action: e, data: t }, r); };
                    MessageHandler.prototype.sendWithPromise = function (e, t, r) { var n = this.callbackId++, a = (0, s.createPromiseCapability)(); this.callbackCapabilities[n] = a; try {
                        this._postMessage({ sourceName: this.sourceName, targetName: this.targetName, action: e, callbackId: n, data: t }, r);
                    }
                    catch (e) {
                        a.reject(e);
                    } return a.promise; };
                    MessageHandler.prototype.sendWithStream = function (e, t, r, n) {
                        var _this = this;
                        var a = this.streamId++, o = this.sourceName, l = this.targetName, c = this.comObj;
                        return new ReadableStream({ start: function (r) { var i = (0, s.createPromiseCapability)(); _this.streamControllers[a] = { controller: r, startCall: i, pullCall: null, cancelCall: null, isClosed: !1 }; _this._postMessage({ sourceName: o, targetName: l, action: e, streamId: a, data: t, desiredSize: r.desiredSize }, n); return i.promise; }, pull: function (e) { var t = (0, s.createPromiseCapability)(); _this.streamControllers[a].pullCall = t; c.postMessage({ sourceName: o, targetName: l, stream: d, streamId: a, desiredSize: e.desiredSize }); return t.promise; }, cancel: function (e) { (0, s.assert)(e instanceof Error, "cancel must have a valid reason"); var t = (0, s.createPromiseCapability)(); _this.streamControllers[a].cancelCall = t; _this.streamControllers[a].isClosed = !0; c.postMessage({ sourceName: o, targetName: l, stream: i, streamId: a, reason: wrapReason(e) }); return t.promise; } }, r);
                    };
                    MessageHandler.prototype._createStreamSink = function (e) { var t = this, r = this.actionHandler[e.action], n = e.streamId, a = this.sourceName, i = e.sourceName, o = this.comObj, d = { enqueue: function (e, r, o) {
                            if (r === void 0) { r = 1; }
                            if (this.isCancelled)
                                return;
                            var l = this.desiredSize;
                            this.desiredSize -= r;
                            if (l > 0 && this.desiredSize <= 0) {
                                this.sinkCapability = (0, s.createPromiseCapability)();
                                this.ready = this.sinkCapability.promise;
                            }
                            t._postMessage({ sourceName: a, targetName: i, stream: c, streamId: n, chunk: e }, o);
                        }, close: function () { if (!this.isCancelled) {
                            this.isCancelled = !0;
                            o.postMessage({ sourceName: a, targetName: i, stream: l, streamId: n });
                            delete t.streamSinks[n];
                        } }, error: function (e) { (0, s.assert)(e instanceof Error, "error must have a valid reason"); if (!this.isCancelled) {
                            this.isCancelled = !0;
                            o.postMessage({ sourceName: a, targetName: i, stream: h, streamId: n, reason: wrapReason(e) });
                        } }, sinkCapability: (0, s.createPromiseCapability)(), onPull: null, onCancel: null, isCancelled: !1, desiredSize: e.desiredSize, ready: null }; d.sinkCapability.resolve(); d.ready = d.sinkCapability.promise; this.streamSinks[n] = d; new Promise((function (t) { t(r(e.data, d)); })).then((function () { o.postMessage({ sourceName: a, targetName: i, stream: p, streamId: n, success: !0 }); }), (function (e) { o.postMessage({ sourceName: a, targetName: i, stream: p, streamId: n, reason: wrapReason(e) }); })); };
                    MessageHandler.prototype._processStreamMessage = function (e) { var t = e.streamId, r = this.sourceName, n = e.sourceName, a = this.comObj; switch (e.stream) {
                        case p:
                            e.success ? this.streamControllers[t].startCall.resolve() : this.streamControllers[t].startCall.reject(wrapReason(e.reason));
                            break;
                        case u:
                            e.success ? this.streamControllers[t].pullCall.resolve() : this.streamControllers[t].pullCall.reject(wrapReason(e.reason));
                            break;
                        case d:
                            if (!this.streamSinks[t]) {
                                a.postMessage({ sourceName: r, targetName: n, stream: u, streamId: t, success: !0 });
                                break;
                            }
                            this.streamSinks[t].desiredSize <= 0 && e.desiredSize > 0 && this.streamSinks[t].sinkCapability.resolve();
                            this.streamSinks[t].desiredSize = e.desiredSize;
                            var g_2 = this.streamSinks[e.streamId].onPull;
                            new Promise((function (e) { e(g_2 && g_2()); })).then((function () { a.postMessage({ sourceName: r, targetName: n, stream: u, streamId: t, success: !0 }); }), (function (e) { a.postMessage({ sourceName: r, targetName: n, stream: u, streamId: t, reason: wrapReason(e) }); }));
                            break;
                        case c:
                            (0, s.assert)(this.streamControllers[t], "enqueue should have stream controller");
                            if (this.streamControllers[t].isClosed)
                                break;
                            this.streamControllers[t].controller.enqueue(e.chunk);
                            break;
                        case l:
                            (0, s.assert)(this.streamControllers[t], "close should have stream controller");
                            if (this.streamControllers[t].isClosed)
                                break;
                            this.streamControllers[t].isClosed = !0;
                            this.streamControllers[t].controller.close();
                            this._deleteStreamController(t);
                            break;
                        case h:
                            (0, s.assert)(this.streamControllers[t], "error should have stream controller");
                            this.streamControllers[t].controller.error(wrapReason(e.reason));
                            this._deleteStreamController(t);
                            break;
                        case o:
                            e.success ? this.streamControllers[t].cancelCall.resolve() : this.streamControllers[t].cancelCall.reject(wrapReason(e.reason));
                            this._deleteStreamController(t);
                            break;
                        case i:
                            if (!this.streamSinks[t])
                                break;
                            var f_1 = this.streamSinks[e.streamId].onCancel;
                            new Promise((function (t) { t(f_1 && f_1(wrapReason(e.reason))); })).then((function () { a.postMessage({ sourceName: r, targetName: n, stream: o, streamId: t, success: !0 }); }), (function (e) { a.postMessage({ sourceName: r, targetName: n, stream: o, streamId: t, reason: wrapReason(e) }); }));
                            this.streamSinks[t].sinkCapability.reject(wrapReason(e.reason));
                            this.streamSinks[t].isCancelled = !0;
                            delete this.streamSinks[t];
                            break;
                        default: throw new Error("Unexpected stream case");
                    } };
                    MessageHandler.prototype._deleteStreamController = function (e) {
                        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, Promise.allSettled([this.streamControllers[e].startCall, this.streamControllers[e].pullCall, this.streamControllers[e].cancelCall].map((function (e) { return e && e.promise; })))];
                                case 1:
                                    _a.sent();
                                    delete this.streamControllers[e];
                                    return [2 /*return*/];
                            }
                        }); });
                    };
                    MessageHandler.prototype._postMessage = function (e, t) { t && this.postMessageTransfers ? this.comObj.postMessage(e, t) : this.comObj.postMessage(e); };
                    MessageHandler.prototype.destroy = function () { this.comObj.removeEventListener("message", this._onComObjOnMessage); };
                    return MessageHandler;
                }()); }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.Metadata = void 0; var s = r(2); t.Metadata = /** @class */ (function () {
                    function Metadata(_a) {
                        var e = _a.parsedData, t = _a.rawData;
                        this._metadataMap = e;
                        this._data = t;
                    }
                    Metadata.prototype.getRaw = function () { return this._data; };
                    Metadata.prototype.get = function (e) { var _a; return (_a = this._metadataMap.get(e)) !== null && _a !== void 0 ? _a : null; };
                    Metadata.prototype.getAll = function () { return (0, s.objectFromMap)(this._metadataMap); };
                    Metadata.prototype.has = function (e) { return this._metadataMap.has(e); };
                    return Metadata;
                }()); }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.OptionalContentConfig = void 0; var s = r(2);
                    var OptionalContentGroup = /** @class */ (function () {
                        function OptionalContentGroup(e, t) {
                            this.visible = !0;
                            this.name = e;
                            this.intent = t;
                        }
                        return OptionalContentGroup;
                    }());  t.OptionalContentConfig = /** @class */ (function () {
                    function OptionalContentConfig(e) {
                        var e_88, _a, e_89, _b, e_90, _c, e_91, _d;
                        this.name = null;
                        this.creator = null;
                        this._order = null;
                        this._groups = new Map;
                        if (null !== e) {
                            this.name = e.name;
                            this.creator = e.creator;
                            this._order = e.order;
                            try {
                                for (var _e = __values(e.groups), _f = _e.next(); !_f.done; _f = _e.next()) {
                                    var t_44 = _f.value;
                                    this._groups.set(t_44.id, new OptionalContentGroup(t_44.name, t_44.intent));
                                }
                            }
                            catch (e_88_1) { e_88 = { error: e_88_1 }; }
                            finally {
                                try {
                                    if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                                }
                                finally { if (e_88) throw e_88.error; }
                            }
                            if ("OFF" === e.baseState)
                                try {
                                    for (var _g = __values(this._groups), _h = _g.next(); !_h.done; _h = _g.next()) {
                                        var e_92 = _h.value;
                                        e_92.visible = !1;
                                    }
                                }
                                catch (e_89_1) { e_89 = { error: e_89_1 }; }
                                finally {
                                    try {
                                        if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
                                    }
                                    finally { if (e_89) throw e_89.error; }
                                }
                            try {
                                for (var _j = __values(e.on), _k = _j.next(); !_k.done; _k = _j.next()) {
                                    var t_45 = _k.value;
                                    this._groups.get(t_45).visible = !0;
                                }
                            }
                            catch (e_90_1) { e_90 = { error: e_90_1 }; }
                            finally {
                                try {
                                    if (_k && !_k.done && (_c = _j.return)) _c.call(_j);
                                }
                                finally { if (e_90) throw e_90.error; }
                            }
                            try {
                                for (var _l = __values(e.off), _m = _l.next(); !_m.done; _m = _l.next()) {
                                    var t_46 = _m.value;
                                    this._groups.get(t_46).visible = !1;
                                }
                            }
                            catch (e_91_1) { e_91 = { error: e_91_1 }; }
                            finally {
                                try {
                                    if (_m && !_m.done && (_d = _l.return)) _d.call(_l);
                                }
                                finally { if (e_91) throw e_91.error; }
                            }
                        }
                    }
                    OptionalContentConfig.prototype._evaluateVisibilityExpression = function (e) { var t = e.length; if (t < 2)
                        return !0; var r = e[0]; for (var n = 1; n < t; n++) {
                        var t_47 = e[n];
                        var a = void 0;
                        if (Array.isArray(t_47))
                            a = this._evaluateVisibilityExpression(t_47);
                        else {
                            if (!this._groups.has(t_47)) {
                                (0, s.warn)("Optional content group not found: " + t_47);
                                return !0;
                            }
                            a = this._groups.get(t_47).visible;
                        }
                        switch (r) {
                            case "And":
                                if (!a)
                                    return !1;
                                break;
                            case "Or":
                                if (a)
                                    return !0;
                                break;
                            case "Not": return !a;
                            default: return !0;
                        }
                    } return "And" === r; };
                    OptionalContentConfig.prototype.isVisible = function (e) {
                        var e_93, _a, e_94, _b, e_95, _c, e_96, _d;
                        if ("OCG" === e.type) {
                            if (!this._groups.has(e.id)) {
                                (0, s.warn)("Optional content group not found: " + e.id);
                                return !0;
                            }
                            return this._groups.get(e.id).visible;
                        }
                        if ("OCMD" === e.type) {
                            if (e.expression)
                                return this._evaluateVisibilityExpression(e.expression);
                            if (!e.policy || "AnyOn" === e.policy) {
                                try {
                                    for (var _e = __values(e.ids), _f = _e.next(); !_f.done; _f = _e.next()) {
                                        var t_48 = _f.value;
                                        if (!this._groups.has(t_48)) {
                                            (0, s.warn)("Optional content group not found: " + t_48);
                                            return !0;
                                        }
                                        if (this._groups.get(t_48).visible)
                                            return !0;
                                    }
                                }
                                catch (e_93_1) { e_93 = { error: e_93_1 }; }
                                finally {
                                    try {
                                        if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                                    }
                                    finally { if (e_93) throw e_93.error; }
                                }
                                return !1;
                            }
                            if ("AllOn" === e.policy) {
                                try {
                                    for (var _g = __values(e.ids), _h = _g.next(); !_h.done; _h = _g.next()) {
                                        var t_49 = _h.value;
                                        if (!this._groups.has(t_49)) {
                                            (0, s.warn)("Optional content group not found: " + t_49);
                                            return !0;
                                        }
                                        if (!this._groups.get(t_49).visible)
                                            return !1;
                                    }
                                }
                                catch (e_94_1) { e_94 = { error: e_94_1 }; }
                                finally {
                                    try {
                                        if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
                                    }
                                    finally { if (e_94) throw e_94.error; }
                                }
                                return !0;
                            }
                            if ("AnyOff" === e.policy) {
                                try {
                                    for (var _j = __values(e.ids), _k = _j.next(); !_k.done; _k = _j.next()) {
                                        var t_50 = _k.value;
                                        if (!this._groups.has(t_50)) {
                                            (0, s.warn)("Optional content group not found: " + t_50);
                                            return !0;
                                        }
                                        if (!this._groups.get(t_50).visible)
                                            return !0;
                                    }
                                }
                                catch (e_95_1) { e_95 = { error: e_95_1 }; }
                                finally {
                                    try {
                                        if (_k && !_k.done && (_c = _j.return)) _c.call(_j);
                                    }
                                    finally { if (e_95) throw e_95.error; }
                                }
                                return !1;
                            }
                            if ("AllOff" === e.policy) {
                                try {
                                    for (var _l = __values(e.ids), _m = _l.next(); !_m.done; _m = _l.next()) {
                                        var t_51 = _m.value;
                                        if (!this._groups.has(t_51)) {
                                            (0, s.warn)("Optional content group not found: " + t_51);
                                            return !0;
                                        }
                                        if (this._groups.get(t_51).visible)
                                            return !1;
                                    }
                                }
                                catch (e_96_1) { e_96 = { error: e_96_1 }; }
                                finally {
                                    try {
                                        if (_m && !_m.done && (_d = _l.return)) _d.call(_l);
                                    }
                                    finally { if (e_96) throw e_96.error; }
                                }
                                return !0;
                            }
                            (0, s.warn)("Unknown optional content policy " + e.policy + ".");
                            return !0;
                        }
                        (0, s.warn)("Unknown group type " + e.type + ".");
                        return !0;
                    };
                    OptionalContentConfig.prototype.setVisibility = function (e, t) {
                        if (t === void 0) { t = !0; }
                        this._groups.has(e) ? this._groups.get(e).visible = !!t : (0, s.warn)("Optional content group not found: " + e);
                    };
                    OptionalContentConfig.prototype.getOrder = function () { return this._groups.size ? this._order ? this._order.slice() : Array.from(this._groups.keys()) : null; };
                    OptionalContentConfig.prototype.getGroups = function () { return this._groups.size > 0 ? (0, s.objectFromMap)(this._groups) : null; };
                    OptionalContentConfig.prototype.getGroup = function (e) { return this._groups.get(e) || null; };
                    return OptionalContentConfig;
                }()); }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.PDFDataTransportStream = void 0; var s = r(2), n = r(1); t.PDFDataTransportStream = /** @class */ (function () {
                    function PDFDataTransportStream(e, t) {
                        var _this = this;
                        (0, s.assert)(t, 'PDFDataTransportStream - missing required "pdfDataRangeTransport" argument.');
                        this._queuedChunks = [];
                        this._progressiveDone = e.progressiveDone || !1;
                        this._contentDispositionFilename = e.contentDispositionFilename || null;
                        var r = e.initialData;
                        if ((r === null || r === void 0 ? void 0 : r.length) > 0) {
                            var e_97 = new Uint8Array(r).buffer;
                            this._queuedChunks.push(e_97);
                        }
                        this._pdfDataRangeTransport = t;
                        this._isStreamingSupported = !e.disableStream;
                        this._isRangeSupported = !e.disableRange;
                        this._contentLength = e.length;
                        this._fullRequestReader = null;
                        this._rangeReaders = [];
                        this._pdfDataRangeTransport.addRangeListener((function (e, t) { _this._onReceiveData({ begin: e, chunk: t }); }));
                        this._pdfDataRangeTransport.addProgressListener((function (e, t) { _this._onProgress({ loaded: e, total: t }); }));
                        this._pdfDataRangeTransport.addProgressiveReadListener((function (e) { _this._onReceiveData({ chunk: e }); }));
                        this._pdfDataRangeTransport.addProgressiveDoneListener((function () { _this._onProgressiveDone(); }));
                        this._pdfDataRangeTransport.transportReady();
                    }
                    PDFDataTransportStream.prototype._onReceiveData = function (e) { var t = new Uint8Array(e.chunk).buffer; if (void 0 === e.begin)
                        this._fullRequestReader ? this._fullRequestReader._enqueue(t) : this._queuedChunks.push(t);
                    else {
                        var r_39 = this._rangeReaders.some((function (r) { if (r._begin !== e.begin)
                            return !1; r._enqueue(t); return !0; }));
                        (0, s.assert)(r_39, "_onReceiveData - no `PDFDataTransportStreamRangeReader` instance found.");
                    } };
                    Object.defineProperty(PDFDataTransportStream.prototype, "_progressiveDataLength", {
                        get: function () { var _a, _b; return (_b = (_a = this._fullRequestReader) === null || _a === void 0 ? void 0 : _a._loaded) !== null && _b !== void 0 ? _b : 0; },
                        enumerable: false,
                        configurable: true
                    });
                    PDFDataTransportStream.prototype._onProgress = function (e) { if (void 0 === e.total) {
                        var t_52 = this._rangeReaders[0];
                        (t_52 === null || t_52 === void 0 ? void 0 : t_52.onProgress) && t_52.onProgress({ loaded: e.loaded });
                    }
                    else {
                        var t_53 = this._fullRequestReader;
                        (t_53 === null || t_53 === void 0 ? void 0 : t_53.onProgress) && t_53.onProgress({ loaded: e.loaded, total: e.total });
                    } };
                    PDFDataTransportStream.prototype._onProgressiveDone = function () { this._fullRequestReader && this._fullRequestReader.progressiveDone(); this._progressiveDone = !0; };
                    PDFDataTransportStream.prototype._removeRangeReader = function (e) { var t = this._rangeReaders.indexOf(e); t >= 0 && this._rangeReaders.splice(t, 1); };
                    PDFDataTransportStream.prototype.getFullReader = function () { (0, s.assert)(!this._fullRequestReader, "PDFDataTransportStream.getFullReader can only be called once."); var e = this._queuedChunks; this._queuedChunks = null; return new PDFDataTransportStreamReader(this, e, this._progressiveDone, this._contentDispositionFilename); };
                    PDFDataTransportStream.prototype.getRangeReader = function (e, t) { if (t <= this._progressiveDataLength)
                        return null; var r = new PDFDataTransportStreamRangeReader(this, e, t); this._pdfDataRangeTransport.requestDataRange(e, t); this._rangeReaders.push(r); return r; };
                    PDFDataTransportStream.prototype.cancelAllRequests = function (e) {
                        var e_98, _a;
                        this._fullRequestReader && this._fullRequestReader.cancel(e);
                        try {
                            for (var _b = __values(this._rangeReaders.slice(0)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var t_54 = _c.value;
                                t_54.cancel(e);
                            }
                        }
                        catch (e_98_1) { e_98 = { error: e_98_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_98) throw e_98.error; }
                        }
                        this._pdfDataRangeTransport.abort();
                    };
                    return PDFDataTransportStream;
                }());
                    var PDFDataTransportStreamReader = /** @class */ (function () {
                        function PDFDataTransportStreamReader(e, t, r, s) {
                            var e_99, _a;
                            if (r === void 0) { r = !1; }
                            if (s === void 0) { s = null; }
                            this._stream = e;
                            this._done = r || !1;
                            this._filename = (0, n.isPdfFile)(s) ? s : null;
                            this._queuedChunks = t || [];
                            this._loaded = 0;
                            try {
                                for (var _b = __values(this._queuedChunks), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var e_100 = _c.value;
                                    this._loaded += e_100.byteLength;
                                }
                            }
                            catch (e_99_1) { e_99 = { error: e_99_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_99) throw e_99.error; }
                            }
                            this._requests = [];
                            this._headersReady = Promise.resolve();
                            e._fullRequestReader = this;
                            this.onProgress = null;
                        }
                        PDFDataTransportStreamReader.prototype._enqueue = function (e) { if (!this._done) {
                            if (this._requests.length > 0) {
                                this._requests.shift().resolve({ value: e, done: !1 });
                            }
                            else
                                this._queuedChunks.push(e);
                            this._loaded += e.byteLength;
                        } };
                        Object.defineProperty(PDFDataTransportStreamReader.prototype, "headersReady", {
                            get: function () { return this._headersReady; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFDataTransportStreamReader.prototype, "filename", {
                            get: function () { return this._filename; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFDataTransportStreamReader.prototype, "isRangeSupported", {
                            get: function () { return this._stream._isRangeSupported; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFDataTransportStreamReader.prototype, "isStreamingSupported", {
                            get: function () { return this._stream._isStreamingSupported; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFDataTransportStreamReader.prototype, "contentLength", {
                            get: function () { return this._stream._contentLength; },
                            enumerable: false,
                            configurable: true
                        });
                        PDFDataTransportStreamReader.prototype.read = function () {
                            return __awaiter(this, void 0, void 0, function () { var e; return __generator(this, function (_a) {
                                if (this._queuedChunks.length > 0) {
                                    return [2 /*return*/, { value: this._queuedChunks.shift(), done: !1 }];
                                }
                                if (this._done)
                                    return [2 /*return*/, { value: void 0, done: !0 }];
                                e = (0, s.createPromiseCapability)();
                                this._requests.push(e);
                                return [2 /*return*/, e.promise];
                            }); });
                        };
                        PDFDataTransportStreamReader.prototype.cancel = function (e) {
                            var e_101, _a;
                            this._done = !0;
                            try {
                                for (var _b = __values(this._requests), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var e_102 = _c.value;
                                    e_102.resolve({ value: void 0, done: !0 });
                                }
                            }
                            catch (e_101_1) { e_101 = { error: e_101_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_101) throw e_101.error; }
                            }
                            this._requests.length = 0;
                        };
                        PDFDataTransportStreamReader.prototype.progressiveDone = function () { this._done || (this._done = !0); };
                        return PDFDataTransportStreamReader;
                    }()); 
                    var PDFDataTransportStreamRangeReader = /** @class */ (function () {
                        function PDFDataTransportStreamRangeReader(e, t, r) {
                            this._stream = e;
                            this._begin = t;
                            this._end = r;
                            this._queuedChunk = null;
                            this._requests = [];
                            this._done = !1;
                            this.onProgress = null;
                        }
                        PDFDataTransportStreamRangeReader.prototype._enqueue = function (e) {
                            var e_103, _a;
                            if (!this._done) {
                                if (0 === this._requests.length)
                                    this._queuedChunk = e;
                                else {
                                    this._requests.shift().resolve({ value: e, done: !1 });
                                    try {
                                        for (var _b = __values(this._requests), _c = _b.next(); !_c.done; _c = _b.next()) {
                                            var e_104 = _c.value;
                                            e_104.resolve({ value: void 0, done: !0 });
                                        }
                                    }
                                    catch (e_103_1) { e_103 = { error: e_103_1 }; }
                                    finally {
                                        try {
                                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                        }
                                        finally { if (e_103) throw e_103.error; }
                                    }
                                    this._requests.length = 0;
                                }
                                this._done = !0;
                                this._stream._removeRangeReader(this);
                            }
                        };
                        Object.defineProperty(PDFDataTransportStreamRangeReader.prototype, "isStreamingSupported", {
                            get: function () { return !1; },
                            enumerable: false,
                            configurable: true
                        });
                        PDFDataTransportStreamRangeReader.prototype.read = function () {
                            return __awaiter(this, void 0, void 0, function () { var e_105, e; return __generator(this, function (_a) {
                                if (this._queuedChunk) {
                                    e_105 = this._queuedChunk;
                                    this._queuedChunk = null;
                                    return [2 /*return*/, { value: e_105, done: !1 }];
                                }
                                if (this._done)
                                    return [2 /*return*/, { value: void 0, done: !0 }];
                                e = (0, s.createPromiseCapability)();
                                this._requests.push(e);
                                return [2 /*return*/, e.promise];
                            }); });
                        };
                        PDFDataTransportStreamRangeReader.prototype.cancel = function (e) {
                            var e_106, _a;
                            this._done = !0;
                            try {
                                for (var _b = __values(this._requests), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var e_107 = _c.value;
                                    e_107.resolve({ value: void 0, done: !0 });
                                }
                            }
                            catch (e_106_1) { e_106 = { error: e_106_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_106) throw e_106.error; }
                            }
                            this._requests.length = 0;
                            this._stream._removeRangeReader(this);
                        };
                        return PDFDataTransportStreamRangeReader;
                    }());  }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.AnnotationLayer = void 0; var s = r(1), n = r(2), a = r(9), i = r(18);
                    var AnnotationElementFactory = /** @class */ (function () {
                        function AnnotationElementFactory() {
                        }
                        AnnotationElementFactory.create = function (e) { switch (e.data.annotationType) {
                            case n.AnnotationType.LINK: return new LinkAnnotationElement(e);
                            case n.AnnotationType.TEXT: return new TextAnnotationElement(e);
                            case n.AnnotationType.WIDGET:
                                switch (e.data.fieldType) {
                                    case "Tx": return new TextWidgetAnnotationElement(e);
                                    case "Btn": return e.data.radioButton ? new RadioButtonWidgetAnnotationElement(e) : e.data.checkBox ? new CheckboxWidgetAnnotationElement(e) : new PushButtonWidgetAnnotationElement(e);
                                    case "Ch": return new ChoiceWidgetAnnotationElement(e);
                                }
                                return new WidgetAnnotationElement(e);
                            case n.AnnotationType.POPUP: return new PopupAnnotationElement(e);
                            case n.AnnotationType.FREETEXT: return new FreeTextAnnotationElement(e);
                            case n.AnnotationType.LINE: return new LineAnnotationElement(e);
                            case n.AnnotationType.SQUARE: return new SquareAnnotationElement(e);
                            case n.AnnotationType.CIRCLE: return new CircleAnnotationElement(e);
                            case n.AnnotationType.POLYLINE: return new PolylineAnnotationElement(e);
                            case n.AnnotationType.CARET: return new CaretAnnotationElement(e);
                            case n.AnnotationType.INK: return new InkAnnotationElement(e);
                            case n.AnnotationType.POLYGON: return new PolygonAnnotationElement(e);
                            case n.AnnotationType.HIGHLIGHT: return new HighlightAnnotationElement(e);
                            case n.AnnotationType.UNDERLINE: return new UnderlineAnnotationElement(e);
                            case n.AnnotationType.SQUIGGLY: return new SquigglyAnnotationElement(e);
                            case n.AnnotationType.STRIKEOUT: return new StrikeOutAnnotationElement(e);
                            case n.AnnotationType.STAMP: return new StampAnnotationElement(e);
                            case n.AnnotationType.FILEATTACHMENT: return new FileAttachmentAnnotationElement(e);
                            default: return new AnnotationElement(e);
                        } };
                        return AnnotationElementFactory;
                    }()); 
                    var AnnotationElement = /** @class */ (function () {
                        function AnnotationElement(e, _a) {
                            var _b = _a === void 0 ? {} : _a, _c = _b.isRenderable, t = _c === void 0 ? !1 : _c, _d = _b.ignoreBorder, r = _d === void 0 ? !1 : _d, _e = _b.createQuadrilaterals, s = _e === void 0 ? !1 : _e;
                            this.isRenderable = t;
                            this.data = e.data;
                            this.layer = e.layer;
                            this.page = e.page;
                            this.viewport = e.viewport;
                            this.linkService = e.linkService;
                            this.downloadManager = e.downloadManager;
                            this.imageResourcesPath = e.imageResourcesPath;
                            this.renderInteractiveForms = e.renderInteractiveForms;
                            this.svgFactory = e.svgFactory;
                            this.annotationStorage = e.annotationStorage;
                            this.enableScripting = e.enableScripting;
                            this.hasJSActions = e.hasJSActions;
                            this._mouseState = e.mouseState;
                            t && (this.container = this._createContainer(r));
                            s && (this.quadrilaterals = this._createQuadrilaterals(r));
                        }
                        AnnotationElement.prototype._createContainer = function (e) {
                            if (e === void 0) { e = !1; }
                            var t = this.data, r = this.page, s = this.viewport, a = document.createElement("section");
                            var i = t.rect[2] - t.rect[0], o = t.rect[3] - t.rect[1];
                            a.setAttribute("data-annotation-id", t.id);
                            var l = n.Util.normalizeRect([t.rect[0], r.view[3] - t.rect[1] + r.view[1], t.rect[2], r.view[3] - t.rect[3] + r.view[1]]);
                            a.style.transform = "matrix(" + s.transform.join(",") + ")";
                            a.style.transformOrigin = -l[0] + "px " + -l[1] + "px";
                            if (!e && t.borderStyle.width > 0) {
                                a.style.borderWidth = t.borderStyle.width + "px";
                                if (t.borderStyle.style !== n.AnnotationBorderStyleType.UNDERLINE) {
                                    i -= 2 * t.borderStyle.width;
                                    o -= 2 * t.borderStyle.width;
                                }
                                var e_108 = t.borderStyle.horizontalCornerRadius, r_40 = t.borderStyle.verticalCornerRadius;
                                if (e_108 > 0 || r_40 > 0) {
                                    var t_55 = e_108 + "px / " + r_40 + "px";
                                    a.style.borderRadius = t_55;
                                }
                                switch (t.borderStyle.style) {
                                    case n.AnnotationBorderStyleType.SOLID:
                                        a.style.borderStyle = "solid";
                                        break;
                                    case n.AnnotationBorderStyleType.DASHED:
                                        a.style.borderStyle = "dashed";
                                        break;
                                    case n.AnnotationBorderStyleType.BEVELED:
                                        (0, n.warn)("Unimplemented border style: beveled");
                                        break;
                                    case n.AnnotationBorderStyleType.INSET:
                                        (0, n.warn)("Unimplemented border style: inset");
                                        break;
                                    case n.AnnotationBorderStyleType.UNDERLINE: a.style.borderBottomStyle = "solid";
                                }
                                t.color ? a.style.borderColor = n.Util.makeHexColor(0 | t.color[0], 0 | t.color[1], 0 | t.color[2]) : a.style.borderWidth = 0;
                            }
                            a.style.left = l[0] + "px";
                            a.style.top = l[1] + "px";
                            a.style.width = i + "px";
                            a.style.height = o + "px";
                            return a;
                        };
                        AnnotationElement.prototype._createQuadrilaterals = function (e) {
                            var e_109, _a;
                            if (e === void 0) { e = !1; }
                            if (!this.data.quadPoints)
                                return null;
                            var t = [], r = this.data.rect;
                            try {
                                for (var _b = __values(this.data.quadPoints), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var r_41 = _c.value;
                                    this.data.rect = [r_41[2].x, r_41[2].y, r_41[1].x, r_41[1].y];
                                    t.push(this._createContainer(e));
                                }
                            }
                            catch (e_109_1) { e_109 = { error: e_109_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_109) throw e_109.error; }
                            }
                            this.data.rect = r;
                            return t;
                        };
                        AnnotationElement.prototype._createPopup = function (e, t) { var r = this.container; if (this.quadrilaterals) {
                            e = e || this.quadrilaterals;
                            r = this.quadrilaterals[0];
                        } if (!e) {
                            (e = document.createElement("div")).style.height = r.style.height;
                            e.style.width = r.style.width;
                            r.appendChild(e);
                        } var s = new PopupElement({ container: r, trigger: e, color: t.color, title: t.title, modificationDate: t.modificationDate, contents: t.contents, hideWrapper: !0 }).render(); s.style.left = r.style.width; r.appendChild(s); };
                        AnnotationElement.prototype._renderQuadrilaterals = function (e) {
                            var e_110, _a;
                            try {
                                for (var _b = __values(this.quadrilaterals), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var t_56 = _c.value;
                                    t_56.className = e;
                                }
                            }
                            catch (e_110_1) { e_110 = { error: e_110_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_110) throw e_110.error; }
                            }
                            return this.quadrilaterals;
                        };
                        AnnotationElement.prototype.render = function () { (0, n.unreachable)("Abstract method `AnnotationElement.render` called"); };
                        return AnnotationElement;
                    }()); 
                    var LinkAnnotationElement = /** @class */ (function (_super) {
                        __extends(LinkAnnotationElement, _super);
                        function LinkAnnotationElement(e) {
                            return _super.call(this, e, { isRenderable: !!(e.data.url || e.data.dest || e.data.action || e.data.isTooltipOnly || e.data.actions && (e.data.actions.Action || e.data.actions["Mouse Up"] || e.data.actions["Mouse Down"])), createQuadrilaterals: !0 }) || this;
                        }
                        LinkAnnotationElement.prototype.render = function () { var _a = this, e = _a.data, t = _a.linkService, r = document.createElement("a"); e.url ? (0, s.addLinkAttributes)(r, { url: e.url, target: e.newWindow ? s.LinkTarget.BLANK : t.externalLinkTarget, rel: t.externalLinkRel, enabled: t.externalLinkEnabled }) : e.action ? this._bindNamedAction(r, e.action) : e.dest ? this._bindLink(r, e.dest) : e.actions && (e.actions.Action || e.actions["Mouse Up"] || e.actions["Mouse Down"]) && this.enableScripting && this.hasJSActions ? this._bindJSAction(r, e) : this._bindLink(r, ""); if (this.quadrilaterals)
                            return this._renderQuadrilaterals("linkAnnotation").map((function (e, t) { var s = 0 === t ? r : r.cloneNode(); e.appendChild(s); return e; })); this.container.className = "linkAnnotation"; this.container.appendChild(r); return this.container; };
                        LinkAnnotationElement.prototype._bindLink = function (e, t) {
                            var _this = this;
                            e.href = this.linkService.getDestinationHash(t);
                            e.onclick = function () { t && _this.linkService.goToDestination(t); return !1; };
                            (t || "" === t) && (e.className = "internalLink");
                        };
                        LinkAnnotationElement.prototype._bindNamedAction = function (e, t) {
                            var _this = this;
                            e.href = this.linkService.getAnchorUrl("");
                            e.onclick = function () { _this.linkService.executeNamedAction(t); return !1; };
                            e.className = "internalLink";
                        };
                        LinkAnnotationElement.prototype._bindJSAction = function (e, t) {
                            var e_111, _a;
                            var _this = this;
                            e.href = this.linkService.getAnchorUrl("");
                            var r = new Map([["Action", "onclick"], ["Mouse Up", "onmouseup"], ["Mouse Down", "onmousedown"]]);
                            var _loop_1 = function (s_29) {
                                var n_17 = r.get(s_29);
                                n_17 && (e[n_17] = function () { var _a; (_a = _this.linkService.eventBus) === null || _a === void 0 ? void 0 : _a.dispatch("dispatcheventinsandbox", { source: _this, detail: { id: t.id, name: s_29 } }); return !1; });
                            };
                            try {
                                for (var _b = __values(Object.keys(t.actions)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var s_29 = _c.value;
                                    _loop_1(s_29);
                                }
                            }
                            catch (e_111_1) { e_111 = { error: e_111_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_111) throw e_111.error; }
                            }
                            e.className = "internalLink";
                        };
                        return LinkAnnotationElement;
                    }(AnnotationElement)); 
                    var TextAnnotationElement = /** @class */ (function (_super) {
                        __extends(TextAnnotationElement, _super);
                        function TextAnnotationElement(e) {
                            return _super.call(this, e, { isRenderable: !!(e.data.hasPopup || e.data.title || e.data.contents) }) || this;
                        }
                        TextAnnotationElement.prototype.render = function () { this.container.className = "textAnnotation"; var e = document.createElement("img"); e.style.height = this.container.style.height; e.style.width = this.container.style.width; e.src = this.imageResourcesPath + "annotation-" + this.data.name.toLowerCase() + ".svg"; e.alt = "[{{type}} Annotation]"; e.dataset.l10nId = "text_annotation_type"; e.dataset.l10nArgs = JSON.stringify({ type: this.data.name }); this.data.hasPopup || this._createPopup(e, this.data); this.container.appendChild(e); return this.container; };
                        return TextAnnotationElement;
                    }(AnnotationElement)); 
                    var WidgetAnnotationElement = /** @class */ (function (_super) {
                        __extends(WidgetAnnotationElement, _super);
                        function WidgetAnnotationElement() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        WidgetAnnotationElement.prototype.render = function () { this.data.alternativeText && (this.container.title = this.data.alternativeText); return this.container; };
                        WidgetAnnotationElement.prototype._getKeyModifier = function (e) { return navigator.platform.includes("Win") && e.ctrlKey || navigator.platform.includes("Mac") && e.metaKey; };
                        WidgetAnnotationElement.prototype._setEventListener = function (e, t, r, s) {
                            var _this = this;
                            t.includes("mouse") ? e.addEventListener(t, (function (e) { var _a; (_a = _this.linkService.eventBus) === null || _a === void 0 ? void 0 : _a.dispatch("dispatcheventinsandbox", { source: _this, detail: { id: _this.data.id, name: r, value: s(e), shift: e.shiftKey, modifier: _this._getKeyModifier(e) } }); })) : e.addEventListener(t, (function (e) { var _a; (_a = _this.linkService.eventBus) === null || _a === void 0 ? void 0 : _a.dispatch("dispatcheventinsandbox", { source: _this, detail: { id: _this.data.id, name: r, value: e.target.checked } }); }));
                        };
                        WidgetAnnotationElement.prototype._setEventListeners = function (e, t, r) {
                            var e_112, _a;
                            var _b;
                            try {
                                for (var t_57 = __values(t), t_57_1 = t_57.next(); !t_57_1.done; t_57_1 = t_57.next()) {
                                    var _c = __read(t_57_1.value, 2), s_30 = _c[0], n_18 = _c[1];
                                    ("Action" === n_18 || ((_b = this.data.actions) === null || _b === void 0 ? void 0 : _b[n_18])) && this._setEventListener(e, s_30, n_18, r);
                                }
                            }
                            catch (e_112_1) { e_112 = { error: e_112_1 }; }
                            finally {
                                try {
                                    if (t_57_1 && !t_57_1.done && (_a = t_57.return)) _a.call(t_57);
                                }
                                finally { if (e_112) throw e_112.error; }
                            }
                        };
                        WidgetAnnotationElement.prototype._dispatchEventFromSandbox = function (e, t) {
                            var e_113, _a;
                            var _this = this;
                            var setColor = function (e, t, r) { var s = r.detail[e]; r.target.style[t] = i.ColorConverters[s[0] + "_HTML"](s.slice(1)); }, r = { display: function (e) { var t = e.detail.display % 2 == 1; e.target.style.visibility = t ? "hidden" : "visible"; _this.annotationStorage.setValue(_this.data.id, { hidden: t, print: 0 === e.detail.display || 3 === e.detail.display }); }, print: function (e) { _this.annotationStorage.setValue(_this.data.id, { print: e.detail.print }); }, hidden: function (e) { e.target.style.visibility = e.detail.hidden ? "hidden" : "visible"; _this.annotationStorage.setValue(_this.data.id, { hidden: e.detail.hidden }); }, focus: function (e) { setTimeout((function () { return e.target.focus({ preventScroll: !1 }); }), 0); }, userName: function (e) { e.target.title = e.detail.userName; }, readonly: function (e) { e.detail.readonly ? e.target.setAttribute("readonly", "") : e.target.removeAttribute("readonly"); }, required: function (e) { e.detail.required ? e.target.setAttribute("required", "") : e.target.removeAttribute("required"); }, bgColor: function (e) { setColor("bgColor", "backgroundColor", e); }, fillColor: function (e) { setColor("fillColor", "backgroundColor", e); }, fgColor: function (e) { setColor("fgColor", "color", e); }, textColor: function (e) { setColor("textColor", "color", e); }, borderColor: function (e) { setColor("borderColor", "borderColor", e); }, strokeColor: function (e) { setColor("strokeColor", "borderColor", e); } };
                            try {
                                for (var _b = __values(Object.keys(t.detail)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var s_31 = _c.value;
                                    var n_19 = e[s_31] || r[s_31];
                                    n_19 && n_19(t);
                                }
                            }
                            catch (e_113_1) { e_113 = { error: e_113_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_113) throw e_113.error; }
                            }
                        };
                        return WidgetAnnotationElement;
                    }(AnnotationElement)); 
                    var TextWidgetAnnotationElement = /** @class */ (function (_super) {
                        __extends(TextWidgetAnnotationElement, _super);
                        function TextWidgetAnnotationElement(e) {
                            return _super.call(this, e, { isRenderable: e.renderInteractiveForms || !e.data.hasAppearance && !!e.data.fieldValue }) || this;
                        }
                        TextWidgetAnnotationElement.prototype.setPropertyOnSiblings = function (e, t, r, s) {
                            var e_114, _a;
                            var n = this.annotationStorage;
                            try {
                                for (var _b = __values(document.getElementsByName(e.name)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var a_11 = _c.value;
                                    if (a_11 !== e) {
                                        a_11[t] = r;
                                        var e_115 = Object.create(null);
                                        e_115[s] = r;
                                        n.setValue(a_11.getAttribute("id"), e_115);
                                    }
                                }
                            }
                            catch (e_114_1) { e_114 = { error: e_114_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_114) throw e_114.error; }
                            }
                        };
                        TextWidgetAnnotationElement.prototype.render = function () {
                            var _this = this;
                            var _a;
                            var e = this.annotationStorage, t = this.data.id;
                            this.container.className = "textWidgetAnnotation";
                            var r = null;
                            if (this.renderInteractiveForms) {
                                var s_32 = e.getValue(t, { value: this.data.fieldValue, valueAsString: this.data.fieldValue }), n_20 = s_32.valueAsString || s_32.value || "", a_12 = { userValue: null, formattedValue: null, beforeInputSelectionRange: null, beforeInputValue: null };
                                if (this.data.multiLine) {
                                    r = document.createElement("textarea");
                                    r.textContent = n_20;
                                }
                                else {
                                    r = document.createElement("input");
                                    r.type = "text";
                                    r.setAttribute("value", n_20);
                                }
                                a_12.userValue = n_20;
                                r.setAttribute("id", t);
                                r.addEventListener("input", (function (s) { e.setValue(t, { value: s.target.value }); _this.setPropertyOnSiblings(r, "value", s.target.value, "value"); }));
                                var blurListener = function (e) { a_12.formattedValue && (e.target.value = a_12.formattedValue); e.target.scrollLeft = 0; a_12.beforeInputSelectionRange = null; };
                                if (this.enableScripting && this.hasJSActions) {
                                    r.addEventListener("focus", (function (e) { a_12.userValue && (e.target.value = a_12.userValue); }));
                                    r.addEventListener("updatefromsandbox", (function (r) { var s = { value: function (r) { a_12.userValue = r.detail.value || ""; e.setValue(t, { value: a_12.userValue.toString() }); a_12.formattedValue || (r.target.value = a_12.userValue); }, valueAsString: function (r) { a_12.formattedValue = r.detail.valueAsString || ""; r.target !== document.activeElement && (r.target.value = a_12.formattedValue); e.setValue(t, { formattedValue: a_12.formattedValue }); }, selRange: function (e) { var _a = __read(e.detail.selRange, 2), t = _a[0], r = _a[1]; t >= 0 && r < e.target.value.length && e.target.setSelectionRange(t, r); } }; _this._dispatchEventFromSandbox(s, r); }));
                                    r.addEventListener("keydown", (function (e) { var _a; a_12.beforeInputValue = e.target.value; var r = -1; "Escape" === e.key ? r = 0 : "Enter" === e.key ? r = 2 : "Tab" === e.key && (r = 3); if (-1 !== r) {
                                        a_12.userValue = e.target.value;
                                        (_a = _this.linkService.eventBus) === null || _a === void 0 ? void 0 : _a.dispatch("dispatcheventinsandbox", { source: _this, detail: { id: t, name: "Keystroke", value: e.target.value, willCommit: !0, commitKey: r, selStart: e.target.selectionStart, selEnd: e.target.selectionEnd } });
                                    } }));
                                    var s_33 = blurListener;
                                    blurListener = null;
                                    r.addEventListener("blur", (function (e) { var _a; if (_this._mouseState.isDown) {
                                        a_12.userValue = e.target.value;
                                        (_a = _this.linkService.eventBus) === null || _a === void 0 ? void 0 : _a.dispatch("dispatcheventinsandbox", { source: _this, detail: { id: t, name: "Keystroke", value: e.target.value, willCommit: !0, commitKey: 1, selStart: e.target.selectionStart, selEnd: e.target.selectionEnd } });
                                    } s_33(e); }));
                                    r.addEventListener("mousedown", (function (e) { a_12.beforeInputValue = e.target.value; a_12.beforeInputSelectionRange = null; }));
                                    r.addEventListener("keyup", (function (e) { e.target.selectionStart === e.target.selectionEnd && (a_12.beforeInputSelectionRange = null); }));
                                    r.addEventListener("select", (function (e) { a_12.beforeInputSelectionRange = [e.target.selectionStart, e.target.selectionEnd]; }));
                                    ((_a = this.data.actions) === null || _a === void 0 ? void 0 : _a.Keystroke) && r.addEventListener("input", (function (e) {
                                        var _a, _b;
                                        var _c;
                                        var r = -1, s = -1;
                                        a_12.beforeInputSelectionRange && (_a = a_12.beforeInputSelectionRange, _b = __read(_a, 2), r = _b[0], s = _b[1], _a);
                                        (_c = _this.linkService.eventBus) === null || _c === void 0 ? void 0 : _c.dispatch("dispatcheventinsandbox", { source: _this, detail: { id: t, name: "Keystroke", value: a_12.beforeInputValue, change: e.data, willCommit: !1, selStart: r, selEnd: s } });
                                    }));
                                    this._setEventListeners(r, [["focus", "Focus"], ["blur", "Blur"], ["mousedown", "Mouse Down"], ["mouseenter", "Mouse Enter"], ["mouseleave", "Mouse Exit"], ["mouseup", "Mouse Up"]], (function (e) { return e.target.value; }));
                                }
                                blurListener && r.addEventListener("blur", blurListener);
                                r.disabled = this.data.readOnly;
                                r.name = this.data.fieldName;
                                null !== this.data.maxLen && (r.maxLength = this.data.maxLen);
                                if (this.data.comb) {
                                    var e_116 = (this.data.rect[2] - this.data.rect[0]) / this.data.maxLen;
                                    r.classList.add("comb");
                                    r.style.letterSpacing = "calc(" + e_116 + "px - 1ch)";
                                }
                            }
                            else {
                                r = document.createElement("div");
                                r.textContent = this.data.fieldValue;
                                r.style.verticalAlign = "middle";
                                r.style.display = "table-cell";
                            }
                            this._setTextStyle(r);
                            this.container.appendChild(r);
                            return this.container;
                        };
                        TextWidgetAnnotationElement.prototype._setTextStyle = function (e) { var t = ["left", "center", "right"], _a = this.data.defaultAppearanceData, r = _a.fontSize, s = _a.fontColor, a = e.style; r && (a.fontSize = r + "px"); a.color = n.Util.makeHexColor(s[0], s[1], s[2]); null !== this.data.textAlignment && (a.textAlign = t[this.data.textAlignment]); };
                        return TextWidgetAnnotationElement;
                    }(WidgetAnnotationElement)); 
                    var CheckboxWidgetAnnotationElement = /** @class */ (function (_super) {
                        __extends(CheckboxWidgetAnnotationElement, _super);
                        function CheckboxWidgetAnnotationElement(e) {
                            return _super.call(this, e, { isRenderable: e.renderInteractiveForms }) || this;
                        }
                        CheckboxWidgetAnnotationElement.prototype.render = function () {
                            var _this = this;
                            var e = this.annotationStorage, t = this.data, r = t.id;
                            var s = e.getValue(r, { value: t.fieldValue && (t.exportValue && t.exportValue === t.fieldValue || !t.exportValue && "Off" !== t.fieldValue) }).value;
                            if ("string" == typeof s) {
                                s = "Off" !== s;
                                e.setValue(r, { value: s });
                            }
                            this.container.className = "buttonWidgetAnnotation checkBox";
                            var n = document.createElement("input");
                            n.disabled = t.readOnly;
                            n.type = "checkbox";
                            n.name = this.data.fieldName;
                            s && n.setAttribute("checked", !0);
                            n.setAttribute("id", r);
                            n.addEventListener("change", (function (t) {
                                var e_117, _a;
                                var s = t.target.name;
                                try {
                                    for (var _b = __values(document.getElementsByName(s)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                        var r_42 = _c.value;
                                        if (r_42 !== t.target) {
                                            r_42.checked = !1;
                                            e.setValue(r_42.parentNode.getAttribute("data-annotation-id"), { value: !1 });
                                        }
                                    }
                                }
                                catch (e_117_1) { e_117 = { error: e_117_1 }; }
                                finally {
                                    try {
                                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                    }
                                    finally { if (e_117) throw e_117.error; }
                                }
                                e.setValue(r, { value: t.target.checked });
                            }));
                            if (this.enableScripting && this.hasJSActions) {
                                n.addEventListener("updatefromsandbox", (function (t) { var s = { value: function (t) { t.target.checked = "Off" !== t.detail.value; e.setValue(r, { value: t.target.checked }); } }; _this._dispatchEventFromSandbox(s, t); }));
                                this._setEventListeners(n, [["change", "Validate"], ["change", "Action"], ["focus", "Focus"], ["blur", "Blur"], ["mousedown", "Mouse Down"], ["mouseenter", "Mouse Enter"], ["mouseleave", "Mouse Exit"], ["mouseup", "Mouse Up"]], (function (e) { return e.target.checked; }));
                            }
                            this.container.appendChild(n);
                            return this.container;
                        };
                        return CheckboxWidgetAnnotationElement;
                    }(WidgetAnnotationElement)); 
                    var RadioButtonWidgetAnnotationElement = /** @class */ (function (_super) {
                        __extends(RadioButtonWidgetAnnotationElement, _super);
                        function RadioButtonWidgetAnnotationElement(e) {
                            return _super.call(this, e, { isRenderable: e.renderInteractiveForms }) || this;
                        }
                        RadioButtonWidgetAnnotationElement.prototype.render = function () {
                            var _this = this;
                            this.container.className = "buttonWidgetAnnotation radioButton";
                            var e = this.annotationStorage, t = this.data, r = t.id;
                            var s = e.getValue(r, { value: t.fieldValue === t.buttonValue }).value;
                            if ("string" == typeof s) {
                                s = s !== t.buttonValue;
                                e.setValue(r, { value: s });
                            }
                            var n = document.createElement("input");
                            n.disabled = t.readOnly;
                            n.type = "radio";
                            n.name = t.fieldName;
                            s && n.setAttribute("checked", !0);
                            n.setAttribute("id", r);
                            n.addEventListener("change", (function (t) {
                                var e_118, _a;
                                var s = t.target;
                                try {
                                    for (var _b = __values(document.getElementsByName(s.name)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                        var t_58 = _c.value;
                                        t_58 !== s && e.setValue(t_58.getAttribute("id"), { value: !1 });
                                    }
                                }
                                catch (e_118_1) { e_118 = { error: e_118_1 }; }
                                finally {
                                    try {
                                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                    }
                                    finally { if (e_118) throw e_118.error; }
                                }
                                e.setValue(r, { value: s.checked });
                            }));
                            if (this.enableScripting && this.hasJSActions) {
                                var s_34 = t.buttonValue;
                                n.addEventListener("updatefromsandbox", (function (t) { var n = { value: function (t) {
                                        var e_119, _a;
                                        var n = s_34 === t.detail.value;
                                        try {
                                            for (var _b = __values(document.getElementsByName(t.target.name)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                                var s_35 = _c.value;
                                                var t_59 = s_35.getAttribute("id");
                                                s_35.checked = t_59 === r && n;
                                                e.setValue(t_59, { value: s_35.checked });
                                            }
                                        }
                                        catch (e_119_1) { e_119 = { error: e_119_1 }; }
                                        finally {
                                            try {
                                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                            }
                                            finally { if (e_119) throw e_119.error; }
                                        }
                                    } }; _this._dispatchEventFromSandbox(n, t); }));
                                this._setEventListeners(n, [["change", "Validate"], ["change", "Action"], ["focus", "Focus"], ["blur", "Blur"], ["mousedown", "Mouse Down"], ["mouseenter", "Mouse Enter"], ["mouseleave", "Mouse Exit"], ["mouseup", "Mouse Up"]], (function (e) { return e.target.checked; }));
                            }
                            this.container.appendChild(n);
                            return this.container;
                        };
                        return RadioButtonWidgetAnnotationElement;
                    }(WidgetAnnotationElement)); 
                    var PushButtonWidgetAnnotationElement = /** @class */ (function (_super) {
                        __extends(PushButtonWidgetAnnotationElement, _super);
                        function PushButtonWidgetAnnotationElement() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        PushButtonWidgetAnnotationElement.prototype.render = function () { var e = _super.prototype.render.call(this); e.className = "buttonWidgetAnnotation pushButton"; this.data.alternativeText && (e.title = this.data.alternativeText); return e; };
                        return PushButtonWidgetAnnotationElement;
                    }(LinkAnnotationElement)); 
                    var ChoiceWidgetAnnotationElement = /** @class */ (function (_super) {
                        __extends(ChoiceWidgetAnnotationElement, _super);
                        function ChoiceWidgetAnnotationElement(e) {
                            return _super.call(this, e, { isRenderable: e.renderInteractiveForms }) || this;
                        }
                        ChoiceWidgetAnnotationElement.prototype.render = function () {
                            var e_120, _a;
                            var _this = this;
                            this.container.className = "choiceWidgetAnnotation";
                            var e = this.annotationStorage, t = this.data.id;
                            e.getValue(t, { value: this.data.fieldValue.length > 0 ? this.data.fieldValue[0] : void 0 });
                            var r = document.createElement("select");
                            r.disabled = this.data.readOnly;
                            r.name = this.data.fieldName;
                            r.setAttribute("id", t);
                            if (!this.data.combo) {
                                r.size = this.data.options.length;
                                this.data.multiSelect && (r.multiple = !0);
                            }
                            try {
                                for (var _b = __values(this.data.options), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var e_121 = _c.value;
                                    var t_60 = document.createElement("option");
                                    t_60.textContent = e_121.displayValue;
                                    t_60.value = e_121.exportValue;
                                    this.data.fieldValue.includes(e_121.exportValue) && t_60.setAttribute("selected", !0);
                                    r.appendChild(t_60);
                                }
                            }
                            catch (e_120_1) { e_120 = { error: e_120_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_120) throw e_120.error; }
                            }
                            var getValue = function (e, t) { var r = t ? "value" : "textContent", s = e.target.options; return e.target.multiple ? Array.prototype.filter.call(s, (function (e) { return e.selected; })).map((function (e) { return e[r]; })) : -1 === s.selectedIndex ? null : s[s.selectedIndex][r]; }, getItems = function (e) { var t = e.target.options; return Array.prototype.map.call(t, (function (e) { return ({ displayValue: e.textContent, exportValue: e.value }); })); };
                            if (this.enableScripting && this.hasJSActions) {
                                r.addEventListener("updatefromsandbox", (function (s) { var n = { value: function (s) { var n = r.options, a = s.detail.value, i = new Set(Array.isArray(a) ? a : [a]); Array.prototype.forEach.call(n, (function (e) { e.selected = i.has(e.value); })); e.setValue(t, { value: getValue(s, !0) }); }, multipleSelection: function (e) { r.multiple = !0; }, remove: function (s) { var n = r.options, a = s.detail.remove; n[a].selected = !1; r.remove(a); if (n.length > 0) {
                                        -1 === Array.prototype.findIndex.call(n, (function (e) { return e.selected; })) && (n[0].selected = !0);
                                    } e.setValue(t, { value: getValue(s, !0), items: getItems(s) }); }, clear: function (s) { for (; 0 !== r.length;)
                                        r.remove(0); e.setValue(t, { value: null, items: [] }); }, insert: function (s) { var _a = s.detail.insert, n = _a.index, a = _a.displayValue, i = _a.exportValue, o = document.createElement("option"); o.textContent = a; o.value = i; r.insertBefore(o, r.children[n]); e.setValue(t, { value: getValue(s, !0), items: getItems(s) }); }, items: function (s) {
                                        var e_122, _a;
                                        var n = s.detail.items;
                                        for (; 0 !== r.length;)
                                            r.remove(0);
                                        try {
                                            for (var n_21 = __values(n), n_21_1 = n_21.next(); !n_21_1.done; n_21_1 = n_21.next()) {
                                                var e_123 = n_21_1.value;
                                                var t_61 = e_123.displayValue, s_36 = e_123.exportValue, n_22 = document.createElement("option");
                                                n_22.textContent = t_61;
                                                n_22.value = s_36;
                                                r.appendChild(n_22);
                                            }
                                        }
                                        catch (e_122_1) { e_122 = { error: e_122_1 }; }
                                        finally {
                                            try {
                                                if (n_21_1 && !n_21_1.done && (_a = n_21.return)) _a.call(n_21);
                                            }
                                            finally { if (e_122) throw e_122.error; }
                                        }
                                        r.options.length > 0 && (r.options[0].selected = !0);
                                        e.setValue(t, { value: getValue(s, !0), items: getItems(s) });
                                    }, indices: function (r) { var s = new Set(r.detail.indices), n = r.target.options; Array.prototype.forEach.call(n, (function (e, t) { e.selected = s.has(t); })); e.setValue(t, { value: getValue(r, !0) }); }, editable: function (e) { e.target.disabled = !e.detail.editable; } }; _this._dispatchEventFromSandbox(n, s); }));
                                r.addEventListener("input", (function (r) { var _a; var s = getValue(r, !0), n = getValue(r, !1); e.setValue(t, { value: s }); (_a = _this.linkService.eventBus) === null || _a === void 0 ? void 0 : _a.dispatch("dispatcheventinsandbox", { source: _this, detail: { id: t, name: "Keystroke", value: n, changeEx: s, willCommit: !0, commitKey: 1, keyDown: !1 } }); }));
                                this._setEventListeners(r, [["focus", "Focus"], ["blur", "Blur"], ["mousedown", "Mouse Down"], ["mouseenter", "Mouse Enter"], ["mouseleave", "Mouse Exit"], ["mouseup", "Mouse Up"], ["input", "Action"]], (function (e) { return e.target.checked; }));
                            }
                            else
                                r.addEventListener("input", (function (r) { e.setValue(t, { value: getValue(r) }); }));
                            this.container.appendChild(r);
                            return this.container;
                        };
                        return ChoiceWidgetAnnotationElement;
                    }(WidgetAnnotationElement)); 
                    var PopupAnnotationElement = /** @class */ (function (_super) {
                        __extends(PopupAnnotationElement, _super);
                        function PopupAnnotationElement(e) {
                            return _super.call(this, e, { isRenderable: !(!e.data.title && !e.data.contents) }) || this;
                        }
                        PopupAnnotationElement.prototype.render = function () { this.container.className = "popupAnnotation"; if (["Line", "Square", "Circle", "PolyLine", "Polygon", "Ink"].includes(this.data.parentType))
                            return this.container; var e = "[data-annotation-id=\"" + this.data.parentId + "\"]", t = this.layer.querySelectorAll(e); if (0 === t.length)
                            return this.container; var r = new PopupElement({ container: this.container, trigger: Array.from(t), color: this.data.color, title: this.data.title, modificationDate: this.data.modificationDate, contents: this.data.contents }), s = this.page, a = n.Util.normalizeRect([this.data.parentRect[0], s.view[3] - this.data.parentRect[1] + s.view[1], this.data.parentRect[2], s.view[3] - this.data.parentRect[3] + s.view[1]]), i = a[0] + this.data.parentRect[2] - this.data.parentRect[0], o = a[1]; this.container.style.transformOrigin = -i + "px " + -o + "px"; this.container.style.left = i + "px"; this.container.style.top = o + "px"; this.container.appendChild(r.render()); return this.container; };
                        return PopupAnnotationElement;
                    }(AnnotationElement)); 
                    var PopupElement = /** @class */ (function () {
                        function PopupElement(e) {
                            this.container = e.container;
                            this.trigger = e.trigger;
                            this.color = e.color;
                            this.title = e.title;
                            this.modificationDate = e.modificationDate;
                            this.contents = e.contents;
                            this.hideWrapper = e.hideWrapper || !1;
                            this.pinned = !1;
                        }
                        PopupElement.prototype.render = function () {
                            var e_124, _a;
                            var e = document.createElement("div");
                            e.className = "popupWrapper";
                            this.hideElement = this.hideWrapper ? e : this.container;
                            this.hideElement.hidden = !0;
                            var t = document.createElement("div");
                            t.className = "popup";
                            var r = this.color;
                            if (r) {
                                var e_125 = .7 * (255 - r[0]) + r[0], s_37 = .7 * (255 - r[1]) + r[1], a_13 = .7 * (255 - r[2]) + r[2];
                                t.style.backgroundColor = n.Util.makeHexColor(0 | e_125, 0 | s_37, 0 | a_13);
                            }
                            var a = document.createElement("h1");
                            a.textContent = this.title;
                            t.appendChild(a);
                            var i = s.PDFDateString.toDateObject(this.modificationDate);
                            if (i) {
                                var e_126 = document.createElement("span");
                                e_126.textContent = "{{date}}, {{time}}";
                                e_126.dataset.l10nId = "annotation_date_string";
                                e_126.dataset.l10nArgs = JSON.stringify({ date: i.toLocaleDateString(), time: i.toLocaleTimeString() });
                                t.appendChild(e_126);
                            }
                            var o = this._formatContents(this.contents);
                            t.appendChild(o);
                            Array.isArray(this.trigger) || (this.trigger = [this.trigger]);
                            try {
                                for (var _b = __values(this.trigger), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var e_127 = _c.value;
                                    e_127.addEventListener("click", this._toggle.bind(this));
                                    e_127.addEventListener("mouseover", this._show.bind(this, !1));
                                    e_127.addEventListener("mouseout", this._hide.bind(this, !1));
                                }
                            }
                            catch (e_124_1) { e_124 = { error: e_124_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_124) throw e_124.error; }
                            }
                            t.addEventListener("click", this._hide.bind(this, !0));
                            e.appendChild(t);
                            return e;
                        };
                        PopupElement.prototype._formatContents = function (e) { var t = document.createElement("p"), r = e.split(/(?:\r\n?|\n)/); for (var e_128 = 0, s_38 = r.length; e_128 < s_38; ++e_128) {
                            var n_23 = r[e_128];
                            t.appendChild(document.createTextNode(n_23));
                            e_128 < s_38 - 1 && t.appendChild(document.createElement("br"));
                        } return t; };
                        PopupElement.prototype._toggle = function () { this.pinned ? this._hide(!0) : this._show(!0); };
                        PopupElement.prototype._show = function (e) {
                            if (e === void 0) { e = !1; }
                            e && (this.pinned = !0);
                            if (this.hideElement.hidden) {
                                this.hideElement.hidden = !1;
                                this.container.style.zIndex += 1;
                            }
                        };
                        PopupElement.prototype._hide = function (e) {
                            if (e === void 0) { e = !0; }
                            e && (this.pinned = !1);
                            if (!this.hideElement.hidden && !this.pinned) {
                                this.hideElement.hidden = !0;
                                this.container.style.zIndex -= 1;
                            }
                        };
                        return PopupElement;
                    }()); 
                    var FreeTextAnnotationElement = /** @class */ (function (_super) {
                        __extends(FreeTextAnnotationElement, _super);
                        function FreeTextAnnotationElement(e) {
                            return _super.call(this, e, { isRenderable: !!(e.data.hasPopup || e.data.title || e.data.contents), ignoreBorder: !0 }) || this;
                        }
                        FreeTextAnnotationElement.prototype.render = function () { this.container.className = "freeTextAnnotation"; this.data.hasPopup || this._createPopup(null, this.data); return this.container; };
                        return FreeTextAnnotationElement;
                    }(AnnotationElement)); 
                    var LineAnnotationElement = /** @class */ (function (_super) {
                        __extends(LineAnnotationElement, _super);
                        function LineAnnotationElement(e) {
                            return _super.call(this, e, { isRenderable: !!(e.data.hasPopup || e.data.title || e.data.contents), ignoreBorder: !0 }) || this;
                        }
                        LineAnnotationElement.prototype.render = function () { this.container.className = "lineAnnotation"; var e = this.data, t = e.rect[2] - e.rect[0], r = e.rect[3] - e.rect[1], s = this.svgFactory.create(t, r), n = this.svgFactory.createElement("svg:line"); n.setAttribute("x1", e.rect[2] - e.lineCoordinates[0]); n.setAttribute("y1", e.rect[3] - e.lineCoordinates[1]); n.setAttribute("x2", e.rect[2] - e.lineCoordinates[2]); n.setAttribute("y2", e.rect[3] - e.lineCoordinates[3]); n.setAttribute("stroke-width", e.borderStyle.width || 1); n.setAttribute("stroke", "transparent"); s.appendChild(n); this.container.append(s); this._createPopup(n, e); return this.container; };
                        return LineAnnotationElement;
                    }(AnnotationElement)); 
                    var SquareAnnotationElement = /** @class */ (function (_super) {
                        __extends(SquareAnnotationElement, _super);
                        function SquareAnnotationElement(e) {
                            return _super.call(this, e, { isRenderable: !!(e.data.hasPopup || e.data.title || e.data.contents), ignoreBorder: !0 }) || this;
                        }
                        SquareAnnotationElement.prototype.render = function () { this.container.className = "squareAnnotation"; var e = this.data, t = e.rect[2] - e.rect[0], r = e.rect[3] - e.rect[1], s = this.svgFactory.create(t, r), n = e.borderStyle.width, a = this.svgFactory.createElement("svg:rect"); a.setAttribute("x", n / 2); a.setAttribute("y", n / 2); a.setAttribute("width", t - n); a.setAttribute("height", r - n); a.setAttribute("stroke-width", n || 1); a.setAttribute("stroke", "transparent"); a.setAttribute("fill", "none"); s.appendChild(a); this.container.append(s); this._createPopup(a, e); return this.container; };
                        return SquareAnnotationElement;
                    }(AnnotationElement)); 
                    var CircleAnnotationElement = /** @class */ (function (_super) {
                        __extends(CircleAnnotationElement, _super);
                        function CircleAnnotationElement(e) {
                            return _super.call(this, e, { isRenderable: !!(e.data.hasPopup || e.data.title || e.data.contents), ignoreBorder: !0 }) || this;
                        }
                        CircleAnnotationElement.prototype.render = function () { this.container.className = "circleAnnotation"; var e = this.data, t = e.rect[2] - e.rect[0], r = e.rect[3] - e.rect[1], s = this.svgFactory.create(t, r), n = e.borderStyle.width, a = this.svgFactory.createElement("svg:ellipse"); a.setAttribute("cx", t / 2); a.setAttribute("cy", r / 2); a.setAttribute("rx", t / 2 - n / 2); a.setAttribute("ry", r / 2 - n / 2); a.setAttribute("stroke-width", n || 1); a.setAttribute("stroke", "transparent"); a.setAttribute("fill", "none"); s.appendChild(a); this.container.append(s); this._createPopup(a, e); return this.container; };
                        return CircleAnnotationElement;
                    }(AnnotationElement)); 
                    var PolylineAnnotationElement = /** @class */ (function (_super) {
                        __extends(PolylineAnnotationElement, _super);
                        function PolylineAnnotationElement(e) {
                            var _this = _super.call(this, e, { isRenderable: !!(e.data.hasPopup || e.data.title || e.data.contents), ignoreBorder: !0 }) || this;
                            _this.containerClassName = "polylineAnnotation";
                            _this.svgElementName = "svg:polyline";
                            return _this;
                        }
                        PolylineAnnotationElement.prototype.render = function () {
                            var e_129, _a;
                            this.container.className = this.containerClassName;
                            var e = this.data, t = e.rect[2] - e.rect[0], r = e.rect[3] - e.rect[1], s = this.svgFactory.create(t, r);
                            var n = [];
                            try {
                                for (var _b = __values(e.vertices), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var t_62 = _c.value;
                                    var r_43 = t_62.x - e.rect[0], s_39 = e.rect[3] - t_62.y;
                                    n.push(r_43 + "," + s_39);
                                }
                            }
                            catch (e_129_1) { e_129 = { error: e_129_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_129) throw e_129.error; }
                            }
                            n = n.join(" ");
                            var a = this.svgFactory.createElement(this.svgElementName);
                            a.setAttribute("points", n);
                            a.setAttribute("stroke-width", e.borderStyle.width || 1);
                            a.setAttribute("stroke", "transparent");
                            a.setAttribute("fill", "none");
                            s.appendChild(a);
                            this.container.append(s);
                            this._createPopup(a, e);
                            return this.container;
                        };
                        return PolylineAnnotationElement;
                    }(AnnotationElement)); 
                    var PolygonAnnotationElement = /** @class */ (function (_super) {
                        __extends(PolygonAnnotationElement, _super);
                        function PolygonAnnotationElement(e) {
                            var _this = _super.call(this, e) || this;
                            _this.containerClassName = "polygonAnnotation";
                            _this.svgElementName = "svg:polygon";
                            return _this;
                        }
                        return PolygonAnnotationElement;
                    }(PolylineAnnotationElement)); 
                    var CaretAnnotationElement = /** @class */ (function (_super) {
                        __extends(CaretAnnotationElement, _super);
                        function CaretAnnotationElement(e) {
                            return _super.call(this, e, { isRenderable: !!(e.data.hasPopup || e.data.title || e.data.contents), ignoreBorder: !0 }) || this;
                        }
                        CaretAnnotationElement.prototype.render = function () { this.container.className = "caretAnnotation"; this.data.hasPopup || this._createPopup(null, this.data); return this.container; };
                        return CaretAnnotationElement;
                    }(AnnotationElement)); 
                    var InkAnnotationElement = /** @class */ (function (_super) {
                        __extends(InkAnnotationElement, _super);
                        function InkAnnotationElement(e) {
                            var _this = _super.call(this, e, { isRenderable: !!(e.data.hasPopup || e.data.title || e.data.contents), ignoreBorder: !0 }) || this;
                            _this.containerClassName = "inkAnnotation";
                            _this.svgElementName = "svg:polyline";
                            return _this;
                        }
                        InkAnnotationElement.prototype.render = function () {
                            var e_130, _a, e_131, _b;
                            this.container.className = this.containerClassName;
                            var e = this.data, t = e.rect[2] - e.rect[0], r = e.rect[3] - e.rect[1], s = this.svgFactory.create(t, r);
                            try {
                                for (var _c = __values(e.inkLists), _d = _c.next(); !_d.done; _d = _c.next()) {
                                    var t_64 = _d.value;
                                    var r_44 = [];
                                    try {
                                        for (var t_63 = (e_131 = void 0, __values(t_64)), t_63_1 = t_63.next(); !t_63_1.done; t_63_1 = t_63.next()) {
                                            var s_40 = t_63_1.value;
                                            var t_65 = s_40.x - e.rect[0], n_24 = e.rect[3] - s_40.y;
                                            r_44.push(t_65 + "," + n_24);
                                        }
                                    }
                                    catch (e_131_1) { e_131 = { error: e_131_1 }; }
                                    finally {
                                        try {
                                            if (t_63_1 && !t_63_1.done && (_b = t_63.return)) _b.call(t_63);
                                        }
                                        finally { if (e_131) throw e_131.error; }
                                    }
                                    r_44 = r_44.join(" ");
                                    var n_25 = this.svgFactory.createElement(this.svgElementName);
                                    n_25.setAttribute("points", r_44);
                                    n_25.setAttribute("stroke-width", e.borderStyle.width || 1);
                                    n_25.setAttribute("stroke", "transparent");
                                    n_25.setAttribute("fill", "none");
                                    this._createPopup(n_25, e);
                                    s.appendChild(n_25);
                                }
                            }
                            catch (e_130_1) { e_130 = { error: e_130_1 }; }
                            finally {
                                try {
                                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                                }
                                finally { if (e_130) throw e_130.error; }
                            }
                            this.container.append(s);
                            return this.container;
                        };
                        return InkAnnotationElement;
                    }(AnnotationElement)); 
                    var HighlightAnnotationElement = /** @class */ (function (_super) {
                        __extends(HighlightAnnotationElement, _super);
                        function HighlightAnnotationElement(e) {
                            return _super.call(this, e, { isRenderable: !!(e.data.hasPopup || e.data.title || e.data.contents), ignoreBorder: !0, createQuadrilaterals: !0 }) || this;
                        }
                        HighlightAnnotationElement.prototype.render = function () { this.data.hasPopup || this._createPopup(null, this.data); if (this.quadrilaterals)
                            return this._renderQuadrilaterals("highlightAnnotation"); this.container.className = "highlightAnnotation"; return this.container; };
                        return HighlightAnnotationElement;
                    }(AnnotationElement)); 
                    var UnderlineAnnotationElement = /** @class */ (function (_super) {
                        __extends(UnderlineAnnotationElement, _super);
                        function UnderlineAnnotationElement(e) {
                            return _super.call(this, e, { isRenderable: !!(e.data.hasPopup || e.data.title || e.data.contents), ignoreBorder: !0, createQuadrilaterals: !0 }) || this;
                        }
                        UnderlineAnnotationElement.prototype.render = function () { this.data.hasPopup || this._createPopup(null, this.data); if (this.quadrilaterals)
                            return this._renderQuadrilaterals("underlineAnnotation"); this.container.className = "underlineAnnotation"; return this.container; };
                        return UnderlineAnnotationElement;
                    }(AnnotationElement)); 
                    var SquigglyAnnotationElement = /** @class */ (function (_super) {
                        __extends(SquigglyAnnotationElement, _super);
                        function SquigglyAnnotationElement(e) {
                            return _super.call(this, e, { isRenderable: !!(e.data.hasPopup || e.data.title || e.data.contents), ignoreBorder: !0, createQuadrilaterals: !0 }) || this;
                        }
                        SquigglyAnnotationElement.prototype.render = function () { this.data.hasPopup || this._createPopup(null, this.data); if (this.quadrilaterals)
                            return this._renderQuadrilaterals("squigglyAnnotation"); this.container.className = "squigglyAnnotation"; return this.container; };
                        return SquigglyAnnotationElement;
                    }(AnnotationElement)); 
                    var StrikeOutAnnotationElement = /** @class */ (function (_super) {
                        __extends(StrikeOutAnnotationElement, _super);
                        function StrikeOutAnnotationElement(e) {
                            return _super.call(this, e, { isRenderable: !!(e.data.hasPopup || e.data.title || e.data.contents), ignoreBorder: !0, createQuadrilaterals: !0 }) || this;
                        }
                        StrikeOutAnnotationElement.prototype.render = function () { this.data.hasPopup || this._createPopup(null, this.data); if (this.quadrilaterals)
                            return this._renderQuadrilaterals("strikeoutAnnotation"); this.container.className = "strikeoutAnnotation"; return this.container; };
                        return StrikeOutAnnotationElement;
                    }(AnnotationElement)); 
                    var StampAnnotationElement = /** @class */ (function (_super) {
                        __extends(StampAnnotationElement, _super);
                        function StampAnnotationElement(e) {
                            return _super.call(this, e, { isRenderable: !!(e.data.hasPopup || e.data.title || e.data.contents), ignoreBorder: !0 }) || this;
                        }
                        StampAnnotationElement.prototype.render = function () { this.container.className = "stampAnnotation"; this.data.hasPopup || this._createPopup(null, this.data); return this.container; };
                        return StampAnnotationElement;
                    }(AnnotationElement)); 
                    var FileAttachmentAnnotationElement = /** @class */ (function (_super) {
                        __extends(FileAttachmentAnnotationElement, _super);
                        function FileAttachmentAnnotationElement(e) {
                            var _a;
                            var _this = _super.call(this, e, { isRenderable: !0 }) || this;
                            var _b = _this.data.file, t = _b.filename, r = _b.content;
                            _this.filename = (0, s.getFilenameFromUrl)(t);
                            _this.content = r;
                            (_a = _this.linkService.eventBus) === null || _a === void 0 ? void 0 : _a.dispatch("fileattachmentannotation", { source: _this, id: (0, n.stringToPDFString)(t), filename: t, content: r });
                            return _this;
                        }
                        FileAttachmentAnnotationElement.prototype.render = function () { this.container.className = "fileAttachmentAnnotation"; var e = document.createElement("div"); e.style.height = this.container.style.height; e.style.width = this.container.style.width; e.addEventListener("dblclick", this._download.bind(this)); this.data.hasPopup || !this.data.title && !this.data.contents || this._createPopup(e, this.data); this.container.appendChild(e); return this.container; };
                        FileAttachmentAnnotationElement.prototype._download = function () { var _a; (_a = this.downloadManager) === null || _a === void 0 ? void 0 : _a.openOrDownloadData(this.container, this.content, this.filename); };
                        return FileAttachmentAnnotationElement;
                    }(AnnotationElement));  t.AnnotationLayer = /** @class */ (function () {
                    function AnnotationLayer() {
                    }
                    AnnotationLayer.render = function (e) {
                        var e_132, _a, e_133, _b, e_134, _c;
                        var t = [], r = [];
                        try {
                            for (var _d = __values(e.annotations), _e = _d.next(); !_e.done; _e = _d.next()) {
                                var s_42 = _e.value;
                                s_42 && (s_42.annotationType !== n.AnnotationType.POPUP ? t.push(s_42) : r.push(s_42));
                            }
                        }
                        catch (e_132_1) { e_132 = { error: e_132_1 }; }
                        finally {
                            try {
                                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                            }
                            finally { if (e_132) throw e_132.error; }
                        }
                        r.length && t.push.apply(t, __spreadArray([], __read(r)));
                        try {
                            for (var t_66 = __values(t), t_66_1 = t_66.next(); !t_66_1.done; t_66_1 = t_66.next()) {
                                var r_45 = t_66_1.value;
                                var t_67 = AnnotationElementFactory.create({ data: r_45, layer: e.div, page: e.page, viewport: e.viewport, linkService: e.linkService, downloadManager: e.downloadManager, imageResourcesPath: e.imageResourcesPath || "", renderInteractiveForms: !1 !== e.renderInteractiveForms, svgFactory: new s.DOMSVGFactory, annotationStorage: e.annotationStorage || new a.AnnotationStorage, enableScripting: e.enableScripting, hasJSActions: e.hasJSActions, mouseState: e.mouseState || { isDown: !1 } });
                                if (t_67.isRenderable) {
                                    var s_43 = t_67.render();
                                    r_45.hidden && (s_43.style.visibility = "hidden");
                                    if (Array.isArray(s_43))
                                        try {
                                            for (var s_41 = (e_134 = void 0, __values(s_43)), s_41_1 = s_41.next(); !s_41_1.done; s_41_1 = s_41.next()) {
                                                var t_68 = s_41_1.value;
                                                e.div.appendChild(t_68);
                                            }
                                        }
                                        catch (e_134_1) { e_134 = { error: e_134_1 }; }
                                        finally {
                                            try {
                                                if (s_41_1 && !s_41_1.done && (_c = s_41.return)) _c.call(s_41);
                                            }
                                            finally { if (e_134) throw e_134.error; }
                                        }
                                    else
                                        t_67 instanceof PopupAnnotationElement ? e.div.prepend(s_43) : e.div.appendChild(s_43);
                                }
                            }
                        }
                        catch (e_133_1) { e_133 = { error: e_133_1 }; }
                        finally {
                            try {
                                if (t_66_1 && !t_66_1.done && (_b = t_66.return)) _b.call(t_66);
                            }
                            finally { if (e_133) throw e_133.error; }
                        }
                    };
                    AnnotationLayer.update = function (e) {
                        var e_135, _a, e_136, _b;
                        var t = "matrix(" + e.viewport.transform.join(",") + ")";
                        try {
                            for (var _c = __values(e.annotations), _d = _c.next(); !_d.done; _d = _c.next()) {
                                var r_46 = _d.value;
                                var s_45 = e.div.querySelectorAll("[data-annotation-id=\"" + r_46.id + "\"]");
                                if (s_45)
                                    try {
                                        for (var s_44 = (e_136 = void 0, __values(s_45)), s_44_1 = s_44.next(); !s_44_1.done; s_44_1 = s_44.next()) {
                                            var e_137 = s_44_1.value;
                                            e_137.style.transform = t;
                                        }
                                    }
                                    catch (e_136_1) { e_136 = { error: e_136_1 }; }
                                    finally {
                                        try {
                                            if (s_44_1 && !s_44_1.done && (_b = s_44.return)) _b.call(s_44);
                                        }
                                        finally { if (e_136) throw e_136.error; }
                                    }
                            }
                        }
                        catch (e_135_1) { e_135 = { error: e_135_1 }; }
                        finally {
                            try {
                                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                            }
                            finally { if (e_135) throw e_135.error; }
                        }
                        e.div.hidden = !1;
                    };
                    return AnnotationLayer;
                }()); }, function (e, t) { Object.defineProperty(t, "__esModule", { value: !0 }); t.ColorConverters = void 0; function makeColorComp(e) { return Math.floor(255 * Math.max(0, Math.min(1, e))).toString(16).padStart(2, "0"); } t.ColorConverters = /** @class */ (function () {
                    function ColorConverters() {
                    }
                    ColorConverters.CMYK_G = function (_a) {
                        var _b = __read(_a, 4), e = _b[0], t = _b[1], r = _b[2], s = _b[3];
                        return ["G", 1 - Math.min(1, .3 * e + .59 * r + .11 * t + s)];
                    };
                    ColorConverters.G_CMYK = function (_a) {
                        var _b = __read(_a, 1), e = _b[0];
                        return ["CMYK", 0, 0, 0, 1 - e];
                    };
                    ColorConverters.G_RGB = function (_a) {
                        var _b = __read(_a, 1), e = _b[0];
                        return ["RGB", e, e, e];
                    };
                    ColorConverters.G_HTML = function (_a) {
                        var _b = __read(_a, 1), e = _b[0];
                        var t = makeColorComp(e);
                        return "#" + t + t + t;
                    };
                    ColorConverters.RGB_G = function (_a) {
                        var _b = __read(_a, 3), e = _b[0], t = _b[1], r = _b[2];
                        return ["G", .3 * e + .59 * t + .11 * r];
                    };
                    ColorConverters.RGB_HTML = function (_a) {
                        var _b = __read(_a, 3), e = _b[0], t = _b[1], r = _b[2];
                        return "#" + makeColorComp(e) + makeColorComp(t) + makeColorComp(r);
                    };
                    ColorConverters.T_HTML = function () { return "#00000000"; };
                    ColorConverters.CMYK_RGB = function (_a) {
                        var _b = __read(_a, 4), e = _b[0], t = _b[1], r = _b[2], s = _b[3];
                        return ["RGB", 1 - Math.min(1, e + s), 1 - Math.min(1, r + s), 1 - Math.min(1, t + s)];
                    };
                    ColorConverters.CMYK_HTML = function (e) { return this.RGB_HTML(this.CMYK_RGB(e)); };
                    ColorConverters.RGB_CMYK = function (_a) {
                        var _b = __read(_a, 3), e = _b[0], t = _b[1], r = _b[2];
                        var s = 1 - e, n = 1 - t, a = 1 - r;
                        return ["CMYK", s, n, a, Math.min(s, n, a)];
                    };
                    return ColorConverters;
                }()); }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.renderTextLayer = function renderTextLayer(e) { var t = new TextLayerRenderTask({ textContent: e.textContent, textContentStream: e.textContentStream, container: e.container, viewport: e.viewport, textDivs: e.textDivs, textContentItemsStr: e.textContentItemsStr, enhanceTextSelection: e.enhanceTextSelection }); t._render(e.timeout); return t; }; var s = r(2); var n = 30, a = new Map, i = /^\s+$/g; function appendText(e, t, r, o) { var l = document.createElement("span"), c = { angle: 0, canvasWidth: 0, hasText: "" !== t.str, hasEOL: t.hasEOL, originalTransform: null, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0, scale: 1 }; e._textDivs.push(l); var h = s.Util.transform(e._viewport.transform, t.transform); var d = Math.atan2(h[1], h[0]); var u = r[t.fontName]; u.vertical && (d += Math.PI / 2); var p = Math.hypot(h[2], h[3]), g = p * function getAscent(e, t) { var r = a.get(e); if (r)
                    return r; t.save(); t.font = "30px " + e; var s = t.measureText(""); var i = s.fontBoundingBoxAscent, o = Math.abs(s.fontBoundingBoxDescent); if (i) {
                    t.restore();
                    var r_47 = i / (i + o);
                    a.set(e, r_47);
                    return r_47;
                } t.strokeStyle = "red"; t.clearRect(0, 0, n, n); t.strokeText("g", 0, 0); var l = t.getImageData(0, 0, n, n).data; o = 0; for (var e_138 = l.length - 1 - 3; e_138 >= 0; e_138 -= 4)
                    if (l[e_138] > 0) {
                        o = Math.ceil(e_138 / 4 / n);
                        break;
                    } t.clearRect(0, 0, n, n); t.strokeText("A", 0, n); l = t.getImageData(0, 0, n, n).data; i = 0; for (var e_139 = 0, t_69 = l.length; e_139 < t_69; e_139 += 4)
                    if (l[e_139] > 0) {
                        i = n - Math.floor(e_139 / 4 / n);
                        break;
                    } t.restore(); if (i) {
                    var t_70 = i / (i + o);
                    a.set(e, t_70);
                    return t_70;
                } a.set(e, .8); return .8; }(u.fontFamily, o); var f, m; if (0 === d) {
                    f = h[4];
                    m = h[5] - g;
                }
                else {
                    f = h[4] + g * Math.sin(d);
                    m = h[5] - g * Math.cos(d);
                } l.style.left = f + "px"; l.style.top = m + "px"; l.style.fontSize = p + "px"; l.style.fontFamily = u.fontFamily; l.setAttribute("role", "presentation"); l.textContent = t.str; l.dir = t.dir; e._fontInspectorEnabled && (l.dataset.fontName = t.fontName); 0 !== d && (c.angle = d * (180 / Math.PI)); var A = !1; if (t.str.length > 1 || e._enhanceTextSelection && i.test(t.str))
                    A = !0;
                else if (t.transform[0] !== t.transform[3]) {
                    var e_140 = Math.abs(t.transform[0]), r_48 = Math.abs(t.transform[3]);
                    e_140 !== r_48 && Math.max(e_140, r_48) / Math.min(e_140, r_48) > 1.5 && (A = !0);
                } A && (u.vertical ? c.canvasWidth = t.height * e._viewport.scale : c.canvasWidth = t.width * e._viewport.scale); e._textDivProperties.set(l, c); e._textContentStream && e._layoutText(l); if (e._enhanceTextSelection && c.hasText) {
                    var r_49 = 1, n_26 = 0;
                    if (0 !== d) {
                        r_49 = Math.cos(d);
                        n_26 = Math.sin(d);
                    }
                    var a_14 = (u.vertical ? t.height : t.width) * e._viewport.scale, i_12 = p;
                    var o_10, c_1;
                    if (0 !== d) {
                        o_10 = [r_49, n_26, -n_26, r_49, f, m];
                        c_1 = s.Util.getAxialAlignedBoundingBox([0, 0, a_14, i_12], o_10);
                    }
                    else
                        c_1 = [f, m, f + a_14, m + i_12];
                    e._bounds.push({ left: c_1[0], top: c_1[1], right: c_1[2], bottom: c_1[3], div: l, size: [a_14, i_12], m: o_10 });
                } } function render(e) { if (e._canceled)
                    return; var t = e._textDivs, r = e._capability, s = t.length; if (s > 1e5) {
                    e._renderingDone = !0;
                    r.resolve();
                }
                else {
                    if (!e._textContentStream)
                        for (var r_50 = 0; r_50 < s; r_50++)
                            e._layoutText(t[r_50]);
                    e._renderingDone = !0;
                    r.resolve();
                } } function findPositiveMin(e, t, r) { var s = 0; for (var n_27 = 0; n_27 < r; n_27++) {
                    var r_51 = e[t++];
                    r_51 > 0 && (s = s ? Math.min(r_51, s) : r_51);
                } return s; } function expand(e) { var t = e._bounds, r = e._viewport, n = function expandBounds(e, t, r) {
                    var e_141, _a, e_142, _b;
                    var s = r.map((function (e, t) { return { x1: e.left, y1: e.top, x2: e.right, y2: e.bottom, index: t, x1New: void 0, x2New: void 0 }; }));
                    expandBoundsLTR(e, s);
                    var n = new Array(r.length);
                    try {
                        for (var s_46 = __values(s), s_46_1 = s_46.next(); !s_46_1.done; s_46_1 = s_46.next()) {
                            var e_143 = s_46_1.value;
                            var t_71 = e_143.index;
                            n[t_71] = { left: e_143.x1New, top: 0, right: e_143.x2New, bottom: 0 };
                        }
                    }
                    catch (e_141_1) { e_141 = { error: e_141_1 }; }
                    finally {
                        try {
                            if (s_46_1 && !s_46_1.done && (_a = s_46.return)) _a.call(s_46);
                        }
                        finally { if (e_141) throw e_141.error; }
                    }
                    r.map((function (t, r) { var a = n[r], i = s[r]; i.x1 = t.top; i.y1 = e - a.right; i.x2 = t.bottom; i.y2 = e - a.left; i.index = r; i.x1New = void 0; i.x2New = void 0; }));
                    expandBoundsLTR(t, s);
                    try {
                        for (var s_47 = __values(s), s_47_1 = s_47.next(); !s_47_1.done; s_47_1 = s_47.next()) {
                            var e_144 = s_47_1.value;
                            var t_72 = e_144.index;
                            n[t_72].top = e_144.x1New;
                            n[t_72].bottom = e_144.x2New;
                        }
                    }
                    catch (e_142_1) { e_142 = { error: e_142_1 }; }
                    finally {
                        try {
                            if (s_47_1 && !s_47_1.done && (_b = s_47.return)) _b.call(s_47);
                        }
                        finally { if (e_142) throw e_142.error; }
                    }
                    return n;
                }(r.width, r.height, t); for (var r_52 = 0; r_52 < n.length; r_52++) {
                    var a_15 = t[r_52].div, i_13 = e._textDivProperties.get(a_15);
                    if (0 === i_13.angle) {
                        i_13.paddingLeft = t[r_52].left - n[r_52].left;
                        i_13.paddingTop = t[r_52].top - n[r_52].top;
                        i_13.paddingRight = n[r_52].right - t[r_52].right;
                        i_13.paddingBottom = n[r_52].bottom - t[r_52].bottom;
                        e._textDivProperties.set(a_15, i_13);
                        continue;
                    }
                    var o = n[r_52], l = t[r_52], c = l.m, h = c[0], d = c[1], u = [[0, 0], [0, l.size[1]], [l.size[0], 0], l.size], p = new Float64Array(64);
                    for (var e_145 = 0, t_73 = u.length; e_145 < t_73; e_145++) {
                        var t_74 = s.Util.applyTransform(u[e_145], c);
                        p[e_145 + 0] = h && (o.left - t_74[0]) / h;
                        p[e_145 + 4] = d && (o.top - t_74[1]) / d;
                        p[e_145 + 8] = h && (o.right - t_74[0]) / h;
                        p[e_145 + 12] = d && (o.bottom - t_74[1]) / d;
                        p[e_145 + 16] = d && (o.left - t_74[0]) / -d;
                        p[e_145 + 20] = h && (o.top - t_74[1]) / h;
                        p[e_145 + 24] = d && (o.right - t_74[0]) / -d;
                        p[e_145 + 28] = h && (o.bottom - t_74[1]) / h;
                        p[e_145 + 32] = h && (o.left - t_74[0]) / -h;
                        p[e_145 + 36] = d && (o.top - t_74[1]) / -d;
                        p[e_145 + 40] = h && (o.right - t_74[0]) / -h;
                        p[e_145 + 44] = d && (o.bottom - t_74[1]) / -d;
                        p[e_145 + 48] = d && (o.left - t_74[0]) / d;
                        p[e_145 + 52] = h && (o.top - t_74[1]) / -h;
                        p[e_145 + 56] = d && (o.right - t_74[0]) / d;
                        p[e_145 + 60] = h && (o.bottom - t_74[1]) / -h;
                    }
                    var g = 1 + Math.min(Math.abs(h), Math.abs(d));
                    i_13.paddingLeft = findPositiveMin(p, 32, 16) / g;
                    i_13.paddingTop = findPositiveMin(p, 48, 16) / g;
                    i_13.paddingRight = findPositiveMin(p, 0, 16) / g;
                    i_13.paddingBottom = findPositiveMin(p, 16, 16) / g;
                    e._textDivProperties.set(a_15, i_13);
                } } function expandBoundsLTR(e, t) {
                    var e_146, _a, e_147, _b;
                    t.sort((function (e, t) { return e.x1 - t.x1 || e.index - t.index; }));
                    var r = [{ start: -1 / 0, end: 1 / 0, boundary: { x1: -1 / 0, y1: -1 / 0, x2: 0, y2: 1 / 0, index: -1, x1New: 0, x2New: 0 } }];
                    try {
                        for (var t_75 = __values(t), t_75_1 = t_75.next(); !t_75_1.done; t_75_1 = t_75.next()) {
                            var e_148 = t_75_1.value;
                            var t_76 = 0;
                            for (; t_76 < r.length && r[t_76].end <= e_148.y1;)
                                t_76++;
                            var s_48 = void 0, n_28 = void 0, a_16 = r.length - 1;
                            for (; a_16 >= 0 && r[a_16].start >= e_148.y2;)
                                a_16--;
                            var i_14 = void 0, o = void 0, l = -1 / 0;
                            for (i_14 = t_76; i_14 <= a_16; i_14++) {
                                s_48 = r[i_14];
                                n_28 = s_48.boundary;
                                var t_77 = void 0;
                                t_77 = n_28.x2 > e_148.x1 ? n_28.index > e_148.index ? n_28.x1New : e_148.x1 : void 0 === n_28.x2New ? (n_28.x2 + e_148.x1) / 2 : n_28.x2New;
                                t_77 > l && (l = t_77);
                            }
                            e_148.x1New = l;
                            for (i_14 = t_76; i_14 <= a_16; i_14++) {
                                s_48 = r[i_14];
                                n_28 = s_48.boundary;
                                void 0 === n_28.x2New ? n_28.x2 > e_148.x1 ? n_28.index > e_148.index && (n_28.x2New = n_28.x2) : n_28.x2New = l : n_28.x2New > l && (n_28.x2New = Math.max(l, n_28.x2));
                            }
                            var c = [];
                            var h = null;
                            for (i_14 = t_76; i_14 <= a_16; i_14++) {
                                s_48 = r[i_14];
                                n_28 = s_48.boundary;
                                var t_78 = n_28.x2 > e_148.x2 ? n_28 : e_148;
                                if (h === t_78)
                                    c[c.length - 1].end = s_48.end;
                                else {
                                    c.push({ start: s_48.start, end: s_48.end, boundary: t_78 });
                                    h = t_78;
                                }
                            }
                            if (r[t_76].start < e_148.y1) {
                                c[0].start = e_148.y1;
                                c.unshift({ start: r[t_76].start, end: e_148.y1, boundary: r[t_76].boundary });
                            }
                            if (e_148.y2 < r[a_16].end) {
                                c[c.length - 1].end = e_148.y2;
                                c.push({ start: e_148.y2, end: r[a_16].end, boundary: r[a_16].boundary });
                            }
                            for (i_14 = t_76; i_14 <= a_16; i_14++) {
                                s_48 = r[i_14];
                                n_28 = s_48.boundary;
                                if (void 0 !== n_28.x2New)
                                    continue;
                                var e_149 = !1;
                                for (o = t_76 - 1; !e_149 && o >= 0 && r[o].start >= n_28.y1; o--)
                                    e_149 = r[o].boundary === n_28;
                                for (o = a_16 + 1; !e_149 && o < r.length && r[o].end <= n_28.y2; o++)
                                    e_149 = r[o].boundary === n_28;
                                for (o = 0; !e_149 && o < c.length; o++)
                                    e_149 = c[o].boundary === n_28;
                                e_149 || (n_28.x2New = l);
                            }
                            Array.prototype.splice.apply(r, [t_76, a_16 - t_76 + 1].concat(c));
                        }
                    }
                    catch (e_146_1) { e_146 = { error: e_146_1 }; }
                    finally {
                        try {
                            if (t_75_1 && !t_75_1.done && (_a = t_75.return)) _a.call(t_75);
                        }
                        finally { if (e_146) throw e_146.error; }
                    }
                    try {
                        for (var r_53 = __values(r), r_53_1 = r_53.next(); !r_53_1.done; r_53_1 = r_53.next()) {
                            var t_79 = r_53_1.value;
                            var r_54 = t_79.boundary;
                            void 0 === r_54.x2New && (r_54.x2New = Math.max(e, r_54.x2));
                        }
                    }
                    catch (e_147_1) { e_147 = { error: e_147_1 }; }
                    finally {
                        try {
                            if (r_53_1 && !r_53_1.done && (_b = r_53.return)) _b.call(r_53);
                        }
                        finally { if (e_147) throw e_147.error; }
                    }
                }
                    var TextLayerRenderTask = /** @class */ (function () {
                        function TextLayerRenderTask(_a) {
                            var _this = this;
                            var e = _a.textContent, t = _a.textContentStream, r = _a.container, n = _a.viewport, a = _a.textDivs, i = _a.textContentItemsStr, o = _a.enhanceTextSelection;
                            var _b;
                            this._textContent = e;
                            this._textContentStream = t;
                            this._container = r;
                            this._document = r.ownerDocument;
                            this._viewport = n;
                            this._textDivs = a || [];
                            this._textContentItemsStr = i || [];
                            this._enhanceTextSelection = !!o;
                            this._fontInspectorEnabled = !!((_b = globalThis.FontInspector) === null || _b === void 0 ? void 0 : _b.enabled);
                            this._reader = null;
                            this._layoutTextLastFontSize = null;
                            this._layoutTextLastFontFamily = null;
                            this._layoutTextCtx = null;
                            this._textDivProperties = new WeakMap;
                            this._renderingDone = !1;
                            this._canceled = !1;
                            this._capability = (0, s.createPromiseCapability)();
                            this._renderTimer = null;
                            this._bounds = [];
                            this._capability.promise.finally((function () { if (_this._layoutTextCtx) {
                                _this._layoutTextCtx.canvas.width = 0;
                                _this._layoutTextCtx.canvas.height = 0;
                                _this._layoutTextCtx = null;
                            } })).catch((function () { }));
                        }
                        Object.defineProperty(TextLayerRenderTask.prototype, "promise", {
                            get: function () { return this._capability.promise; },
                            enumerable: false,
                            configurable: true
                        });
                        TextLayerRenderTask.prototype.cancel = function () { this._canceled = !0; if (this._reader) {
                            this._reader.cancel(new s.AbortException("TextLayer task cancelled."));
                            this._reader = null;
                        } if (null !== this._renderTimer) {
                            clearTimeout(this._renderTimer);
                            this._renderTimer = null;
                        } this._capability.reject(new Error("TextLayer task cancelled.")); };
                        TextLayerRenderTask.prototype._processItems = function (e, t) { for (var r_55 = 0, s_49 = e.length; r_55 < s_49; r_55++)
                            if (void 0 !== e[r_55].str) {
                                this._textContentItemsStr.push(e[r_55].str);
                                appendText(this, e[r_55], t, this._layoutTextCtx);
                            }
                            else if ("beginMarkedContentProps" === e[r_55].type || "beginMarkedContent" === e[r_55].type) {
                                var t_80 = this._container;
                                this._container = document.createElement("span");
                                this._container.classList.add("markedContent");
                                null !== e[r_55].id && this._container.setAttribute("id", "" + e[r_55].id);
                                t_80.appendChild(this._container);
                            }
                            else
                                "endMarkedContent" === e[r_55].type && (this._container = this._container.parentNode); };
                        TextLayerRenderTask.prototype._layoutText = function (e) { var t = this._textDivProperties.get(e); var r = ""; if (0 !== t.canvasWidth && t.hasText) {
                            var _a = e.style, s_50 = _a.fontSize, n_29 = _a.fontFamily;
                            if (s_50 !== this._layoutTextLastFontSize || n_29 !== this._layoutTextLastFontFamily) {
                                this._layoutTextCtx.font = s_50 + " " + n_29;
                                this._layoutTextLastFontSize = s_50;
                                this._layoutTextLastFontFamily = n_29;
                            }
                            var a_17 = this._layoutTextCtx.measureText(e.textContent).width;
                            if (a_17 > 0) {
                                t.scale = t.canvasWidth / a_17;
                                r = "scaleX(" + t.scale + ")";
                            }
                        } 0 !== t.angle && (r = "rotate(" + t.angle + "deg) " + r); if (r.length > 0) {
                            this._enhanceTextSelection && (t.originalTransform = r);
                            e.style.transform = r;
                        } t.hasText && this._container.appendChild(e); if (t.hasEOL) {
                            var e_150 = document.createElement("br");
                            e_150.setAttribute("role", "presentation");
                            this._container.appendChild(e_150);
                        } };
                        TextLayerRenderTask.prototype._render = function (e) {
                            var _this = this;
                            if (e === void 0) { e = 0; }
                            var t = (0, s.createPromiseCapability)();
                            var r = Object.create(null);
                            var a = this._document.createElement("canvas");
                            a.height = a.width = n;
                            a.mozOpaque = !0;
                            this._layoutTextCtx = a.getContext("2d", { alpha: !1 });
                            if (this._textContent) {
                                var e_151 = this._textContent.items, r_56 = this._textContent.styles;
                                this._processItems(e_151, r_56);
                                t.resolve();
                            }
                            else {
                                if (!this._textContentStream)
                                    throw new Error('Neither "textContent" nor "textContentStream" parameters specified.');
                                {
                                    var pump_1 = function () { _this._reader.read().then((function (_a) {
                                        var e = _a.value, s = _a.done;
                                        if (s)
                                            t.resolve();
                                        else {
                                            Object.assign(r, e.styles);
                                            _this._processItems(e.items, r);
                                            pump_1();
                                        }
                                    }), t.reject); };
                                    this._reader = this._textContentStream.getReader();
                                    pump_1();
                                }
                            }
                            t.promise.then((function () { r = null; e ? _this._renderTimer = setTimeout((function () { render(_this); _this._renderTimer = null; }), e) : render(_this); }), this._capability.reject);
                        };
                        TextLayerRenderTask.prototype.expandTextDivs = function (e) {
                            if (e === void 0) { e = !1; }
                            if (!this._enhanceTextSelection || !this._renderingDone)
                                return;
                            if (null !== this._bounds) {
                                expand(this);
                                this._bounds = null;
                            }
                            var t = [], r = [];
                            for (var s_51 = 0, n_30 = this._textDivs.length; s_51 < n_30; s_51++) {
                                var n_31 = this._textDivs[s_51], a_18 = this._textDivProperties.get(n_31);
                                if (a_18.hasText)
                                    if (e) {
                                        t.length = 0;
                                        r.length = 0;
                                        a_18.originalTransform && t.push(a_18.originalTransform);
                                        if (a_18.paddingTop > 0) {
                                            r.push(a_18.paddingTop + "px");
                                            t.push("translateY(" + -a_18.paddingTop + "px)");
                                        }
                                        else
                                            r.push(0);
                                        a_18.paddingRight > 0 ? r.push(a_18.paddingRight / a_18.scale + "px") : r.push(0);
                                        a_18.paddingBottom > 0 ? r.push(a_18.paddingBottom + "px") : r.push(0);
                                        if (a_18.paddingLeft > 0) {
                                            r.push(a_18.paddingLeft / a_18.scale + "px");
                                            t.push("translateX(" + -a_18.paddingLeft / a_18.scale + "px)");
                                        }
                                        else
                                            r.push(0);
                                        n_31.style.padding = r.join(" ");
                                        t.length && (n_31.style.transform = t.join(" "));
                                    }
                                    else {
                                        n_31.style.padding = null;
                                        n_31.style.transform = a_18.originalTransform;
                                    }
                            }
                        };
                        return TextLayerRenderTask;
                    }());  }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.SVGGraphics = void 0; var s = r(2), n = r(1), a = r(4); var i = /** @class */ (function () {
                    function i() {
                        (0, s.unreachable)("Not implemented: SVGGraphics");
                    }
                    return i;
                }()); t.SVGGraphics = i; {
                    var e_152 = { fontStyle: "normal", fontWeight: "normal", fillColor: "#000000" }, r_57 = "http://www.w3.org/XML/1998/namespace", o_11 = "http://www.w3.org/1999/xlink", l_3 = ["butt", "round", "square"], c_2 = ["miter", "round", "bevel"], h_3 = function () { var e = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), t = new Int32Array(256); for (var e_153 = 0; e_153 < 256; e_153++) {
                        var r_58 = e_153;
                        for (var e_154 = 0; e_154 < 8; e_154++)
                            r_58 = 1 & r_58 ? 3988292384 ^ r_58 >> 1 & 2147483647 : r_58 >> 1 & 2147483647;
                        t[e_153] = r_58;
                    } function writePngChunk(e, r, s, n) { var a = n; var i = r.length; s[a] = i >> 24 & 255; s[a + 1] = i >> 16 & 255; s[a + 2] = i >> 8 & 255; s[a + 3] = 255 & i; a += 4; s[a] = 255 & e.charCodeAt(0); s[a + 1] = 255 & e.charCodeAt(1); s[a + 2] = 255 & e.charCodeAt(2); s[a + 3] = 255 & e.charCodeAt(3); a += 4; s.set(r, a); a += r.length; var o = function crc32(e, r, s) { var n = -1; for (var a_19 = r; a_19 < s; a_19++) {
                        var r_59 = 255 & (n ^ e[a_19]);
                        n = n >>> 8 ^ t[r_59];
                    } return -1 ^ n; }(s, n + 4, a); s[a] = o >> 24 & 255; s[a + 1] = o >> 16 & 255; s[a + 2] = o >> 8 & 255; s[a + 3] = 255 & o; } function deflateSyncUncompressed(e) { var t = e.length; var r = 65535, s = Math.ceil(t / r), n = new Uint8Array(2 + t + 5 * s + 4); var a = 0; n[a++] = 120; n[a++] = 156; var i = 0; for (; t > r;) {
                        n[a++] = 0;
                        n[a++] = 255;
                        n[a++] = 255;
                        n[a++] = 0;
                        n[a++] = 0;
                        n.set(e.subarray(i, i + r), a);
                        a += r;
                        i += r;
                        t -= r;
                    } n[a++] = 1; n[a++] = 255 & t; n[a++] = t >> 8 & 255; n[a++] = 255 & ~t; n[a++] = (65535 & ~t) >> 8 & 255; n.set(e.subarray(i), a); a += e.length - i; var o = function adler32(e, t, r) { var s = 1, n = 0; for (var a_20 = t; a_20 < r; ++a_20) {
                        s = (s + (255 & e[a_20])) % 65521;
                        n = (n + s) % 65521;
                    } return n << 16 | s; }(e, 0, e.length); n[a++] = o >> 24 & 255; n[a++] = o >> 16 & 255; n[a++] = o >> 8 & 255; n[a++] = 255 & o; return n; } function encode(t, r, n, i) { var o = t.width, l = t.height; var c, h, d; var u = t.data; switch (r) {
                        case s.ImageKind.GRAYSCALE_1BPP:
                            h = 0;
                            c = 1;
                            d = o + 7 >> 3;
                            break;
                        case s.ImageKind.RGB_24BPP:
                            h = 2;
                            c = 8;
                            d = 3 * o;
                            break;
                        case s.ImageKind.RGBA_32BPP:
                            h = 6;
                            c = 8;
                            d = 4 * o;
                            break;
                        default: throw new Error("invalid format");
                    } var p = new Uint8Array((1 + d) * l); var g = 0, f = 0; for (var e_155 = 0; e_155 < l; ++e_155) {
                        p[g++] = 0;
                        p.set(u.subarray(f, f + d), g);
                        f += d;
                        g += d;
                    } if (r === s.ImageKind.GRAYSCALE_1BPP && i) {
                        g = 0;
                        for (var e_156 = 0; e_156 < l; e_156++) {
                            g++;
                            for (var e_157 = 0; e_157 < d; e_157++)
                                p[g++] ^= 255;
                        }
                    } var m = new Uint8Array([o >> 24 & 255, o >> 16 & 255, o >> 8 & 255, 255 & o, l >> 24 & 255, l >> 16 & 255, l >> 8 & 255, 255 & l, c, h, 0, 0, 0]), A = function deflateSync(e) { if (!a.isNodeJS)
                        return deflateSyncUncompressed(e); try {
                        var t_81;
                        t_81 = parseInt(process.versions.node) >= 8 ? e : Buffer.from(e);
                        var r_60 = require$$2__default["default"].deflateSync(t_81, { level: 9 });
                        return r_60 instanceof Uint8Array ? r_60 : new Uint8Array(r_60);
                    }
                    catch (e) {
                        (0, s.warn)("Not compressing PNG because zlib.deflateSync is unavailable: " + e);
                    } return deflateSyncUncompressed(e); }(p), _ = e.length + 36 + m.length + A.length, b = new Uint8Array(_); var y = 0; b.set(e, y); y += e.length; writePngChunk("IHDR", m, b, y); y += 12 + m.length; writePngChunk("IDATA", A, b, y); y += 12 + A.length; writePngChunk("IEND", new Uint8Array(0), b, y); return (0, s.createObjectURL)(b, "image/png", n); } return function convertImgDataToPng(e, t, r) { return encode(e, void 0 === e.kind ? s.ImageKind.GRAYSCALE_1BPP : e.kind, t, r); }; }();
                    var SVGExtraState_1 = /** @class */ (function () {
                        function SVGExtraState() {
                            this.fontSizeScale = 1;
                            this.fontWeight = e_152.fontWeight;
                            this.fontSize = 0;
                            this.textMatrix = s.IDENTITY_MATRIX;
                            this.fontMatrix = s.FONT_IDENTITY_MATRIX;
                            this.leading = 0;
                            this.textRenderingMode = s.TextRenderingMode.FILL;
                            this.textMatrixScale = 1;
                            this.x = 0;
                            this.y = 0;
                            this.lineX = 0;
                            this.lineY = 0;
                            this.charSpacing = 0;
                            this.wordSpacing = 0;
                            this.textHScale = 1;
                            this.textRise = 0;
                            this.fillColor = e_152.fillColor;
                            this.strokeColor = "#000000";
                            this.fillAlpha = 1;
                            this.strokeAlpha = 1;
                            this.lineWidth = 1;
                            this.lineJoin = "";
                            this.lineCap = "";
                            this.miterLimit = 0;
                            this.dashArray = [];
                            this.dashPhase = 0;
                            this.dependencies = [];
                            this.activeClipUrl = null;
                            this.clipGroup = null;
                            this.maskId = "";
                        }
                        SVGExtraState.prototype.clone = function () { return Object.create(this); };
                        SVGExtraState.prototype.setCurrentPoint = function (e, t) { this.x = e; this.y = t; };
                        return SVGExtraState;
                    }());
                    function opListToTree(e) {
                        var e_158, _a;
                        var t = [];
                        var r = [];
                        try {
                            for (var e_159 = __values(e), e_159_1 = e_159.next(); !e_159_1.done; e_159_1 = e_159.next()) {
                                var s_52 = e_159_1.value;
                                if ("save" !== s_52.fn)
                                    "restore" === s_52.fn ? t = r.pop() : t.push(s_52);
                                else {
                                    t.push({ fnId: 92, fn: "group", items: [] });
                                    r.push(t);
                                    t = t[t.length - 1].items;
                                }
                            }
                        }
                        catch (e_158_1) { e_158 = { error: e_158_1 }; }
                        finally {
                            try {
                                if (e_159_1 && !e_159_1.done && (_a = e_159.return)) _a.call(e_159);
                            }
                            finally { if (e_158) throw e_158.error; }
                        }
                        return t;
                    }
                    function pf(e) { if (Number.isInteger(e))
                        return e.toString(); var t = e.toFixed(10); var r = t.length - 1; if ("0" !== t[r])
                        return t; do {
                        r--;
                    } while ("0" === t[r]); return t.substring(0, "." === t[r] ? r : r + 1); }
                    function pm(e) { if (0 === e[4] && 0 === e[5]) {
                        if (0 === e[1] && 0 === e[2])
                            return 1 === e[0] && 1 === e[3] ? "" : "scale(" + pf(e[0]) + " " + pf(e[3]) + ")";
                        if (e[0] === e[3] && e[1] === -e[2]) {
                            return "rotate(" + pf(180 * Math.acos(e[0]) / Math.PI) + ")";
                        }
                    }
                    else if (1 === e[0] && 0 === e[1] && 0 === e[2] && 1 === e[3])
                        return "translate(" + pf(e[4]) + " " + pf(e[5]) + ")"; return "matrix(" + pf(e[0]) + " " + pf(e[1]) + " " + pf(e[2]) + " " + pf(e[3]) + " " + pf(e[4]) + " " + pf(e[5]) + ")"; }
                    var d_2 = 0, u_2 = 0, p_1 = 0;
                    t.SVGGraphics = i = /** @class */ (function () {
                        function class_1(e, t, r) {
                            if (r === void 0) { r = !1; }
                            this.svgFactory = new n.DOMSVGFactory;
                            this.current = new SVGExtraState_1;
                            this.transformMatrix = s.IDENTITY_MATRIX;
                            this.transformStack = [];
                            this.extraStack = [];
                            this.commonObjs = e;
                            this.objs = t;
                            this.pendingClip = null;
                            this.pendingEOFill = !1;
                            this.embedFonts = !1;
                            this.embeddedFonts = Object.create(null);
                            this.cssStyle = null;
                            this.forceDataSchema = !!r;
                            this._operatorIdMapping = [];
                            for (var e_160 in s.OPS)
                                this._operatorIdMapping[s.OPS[e_160]] = e_160;
                        }
                        class_1.prototype.save = function () { this.transformStack.push(this.transformMatrix); var e = this.current; this.extraStack.push(e); this.current = e.clone(); };
                        class_1.prototype.restore = function () { this.transformMatrix = this.transformStack.pop(); this.current = this.extraStack.pop(); this.pendingClip = null; this.tgrp = null; };
                        class_1.prototype.group = function (e) { this.save(); this.executeOpTree(e); this.restore(); };
                        class_1.prototype.loadDependencies = function (e) {
                            var e_161, _a;
                            var t = e.fnArray, r = e.argsArray;
                            for (var e_162 = 0, n_32 = t.length; e_162 < n_32; e_162++)
                                if (t[e_162] === s.OPS.dependency) {
                                    var _loop_2 = function (t_82) {
                                        var e_163 = t_82.startsWith("g_") ? this_1.commonObjs : this_1.objs, r_61 = new Promise((function (r) { e_163.get(t_82, r); }));
                                        this_1.current.dependencies.push(r_61);
                                    };
                                    var this_1 = this;
                                    try {
                                        for (var _b = (e_161 = void 0, __values(r[e_162])), _c = _b.next(); !_c.done; _c = _b.next()) {
                                            var t_82 = _c.value;
                                            _loop_2(t_82);
                                        }
                                    }
                                    catch (e_161_1) { e_161 = { error: e_161_1 }; }
                                    finally {
                                        try {
                                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                        }
                                        finally { if (e_161) throw e_161.error; }
                                    }
                                }
                            return Promise.all(this.current.dependencies);
                        };
                        class_1.prototype.transform = function (e, t, r, n, a, i) { var o = [e, t, r, n, a, i]; this.transformMatrix = s.Util.transform(this.transformMatrix, o); this.tgrp = null; };
                        class_1.prototype.getSVG = function (e, t) {
                            var _this = this;
                            this.viewport = t;
                            var r = this._initialize(t);
                            return this.loadDependencies(e).then((function () { _this.transformMatrix = s.IDENTITY_MATRIX; _this.executeOpTree(_this.convertOpList(e)); return r; }));
                        };
                        class_1.prototype.convertOpList = function (e) { var t = this._operatorIdMapping, r = e.argsArray, s = e.fnArray, n = []; for (var e_164 = 0, a_21 = s.length; e_164 < a_21; e_164++) {
                            var a_22 = s[e_164];
                            n.push({ fnId: a_22, fn: t[a_22], args: r[e_164] });
                        } return opListToTree(n); };
                        class_1.prototype.executeOpTree = function (e) {
                            var e_165, _a;
                            try {
                                for (var e_166 = __values(e), e_166_1 = e_166.next(); !e_166_1.done; e_166_1 = e_166.next()) {
                                    var t_83 = e_166_1.value;
                                    var e_167 = t_83.fn, r_62 = t_83.fnId, n_33 = t_83.args;
                                    switch (0 | r_62) {
                                        case s.OPS.beginText:
                                            this.beginText();
                                            break;
                                        case s.OPS.dependency: break;
                                        case s.OPS.setLeading:
                                            this.setLeading(n_33);
                                            break;
                                        case s.OPS.setLeadingMoveText:
                                            this.setLeadingMoveText(n_33[0], n_33[1]);
                                            break;
                                        case s.OPS.setFont:
                                            this.setFont(n_33);
                                            break;
                                        case s.OPS.showText:
                                        case s.OPS.showSpacedText:
                                            this.showText(n_33[0]);
                                            break;
                                        case s.OPS.endText:
                                            this.endText();
                                            break;
                                        case s.OPS.moveText:
                                            this.moveText(n_33[0], n_33[1]);
                                            break;
                                        case s.OPS.setCharSpacing:
                                            this.setCharSpacing(n_33[0]);
                                            break;
                                        case s.OPS.setWordSpacing:
                                            this.setWordSpacing(n_33[0]);
                                            break;
                                        case s.OPS.setHScale:
                                            this.setHScale(n_33[0]);
                                            break;
                                        case s.OPS.setTextMatrix:
                                            this.setTextMatrix(n_33[0], n_33[1], n_33[2], n_33[3], n_33[4], n_33[5]);
                                            break;
                                        case s.OPS.setTextRise:
                                            this.setTextRise(n_33[0]);
                                            break;
                                        case s.OPS.setTextRenderingMode:
                                            this.setTextRenderingMode(n_33[0]);
                                            break;
                                        case s.OPS.setLineWidth:
                                            this.setLineWidth(n_33[0]);
                                            break;
                                        case s.OPS.setLineJoin:
                                            this.setLineJoin(n_33[0]);
                                            break;
                                        case s.OPS.setLineCap:
                                            this.setLineCap(n_33[0]);
                                            break;
                                        case s.OPS.setMiterLimit:
                                            this.setMiterLimit(n_33[0]);
                                            break;
                                        case s.OPS.setFillRGBColor:
                                            this.setFillRGBColor(n_33[0], n_33[1], n_33[2]);
                                            break;
                                        case s.OPS.setStrokeRGBColor:
                                            this.setStrokeRGBColor(n_33[0], n_33[1], n_33[2]);
                                            break;
                                        case s.OPS.setStrokeColorN:
                                            this.setStrokeColorN(n_33);
                                            break;
                                        case s.OPS.setFillColorN:
                                            this.setFillColorN(n_33);
                                            break;
                                        case s.OPS.shadingFill:
                                            this.shadingFill(n_33[0]);
                                            break;
                                        case s.OPS.setDash:
                                            this.setDash(n_33[0], n_33[1]);
                                            break;
                                        case s.OPS.setRenderingIntent:
                                            this.setRenderingIntent(n_33[0]);
                                            break;
                                        case s.OPS.setFlatness:
                                            this.setFlatness(n_33[0]);
                                            break;
                                        case s.OPS.setGState:
                                            this.setGState(n_33[0]);
                                            break;
                                        case s.OPS.fill:
                                            this.fill();
                                            break;
                                        case s.OPS.eoFill:
                                            this.eoFill();
                                            break;
                                        case s.OPS.stroke:
                                            this.stroke();
                                            break;
                                        case s.OPS.fillStroke:
                                            this.fillStroke();
                                            break;
                                        case s.OPS.eoFillStroke:
                                            this.eoFillStroke();
                                            break;
                                        case s.OPS.clip:
                                            this.clip("nonzero");
                                            break;
                                        case s.OPS.eoClip:
                                            this.clip("evenodd");
                                            break;
                                        case s.OPS.paintSolidColorImageMask:
                                            this.paintSolidColorImageMask();
                                            break;
                                        case s.OPS.paintImageXObject:
                                            this.paintImageXObject(n_33[0]);
                                            break;
                                        case s.OPS.paintInlineImageXObject:
                                            this.paintInlineImageXObject(n_33[0]);
                                            break;
                                        case s.OPS.paintImageMaskXObject:
                                            this.paintImageMaskXObject(n_33[0]);
                                            break;
                                        case s.OPS.paintFormXObjectBegin:
                                            this.paintFormXObjectBegin(n_33[0], n_33[1]);
                                            break;
                                        case s.OPS.paintFormXObjectEnd:
                                            this.paintFormXObjectEnd();
                                            break;
                                        case s.OPS.closePath:
                                            this.closePath();
                                            break;
                                        case s.OPS.closeStroke:
                                            this.closeStroke();
                                            break;
                                        case s.OPS.closeFillStroke:
                                            this.closeFillStroke();
                                            break;
                                        case s.OPS.closeEOFillStroke:
                                            this.closeEOFillStroke();
                                            break;
                                        case s.OPS.nextLine:
                                            this.nextLine();
                                            break;
                                        case s.OPS.transform:
                                            this.transform(n_33[0], n_33[1], n_33[2], n_33[3], n_33[4], n_33[5]);
                                            break;
                                        case s.OPS.constructPath:
                                            this.constructPath(n_33[0], n_33[1]);
                                            break;
                                        case s.OPS.endPath:
                                            this.endPath();
                                            break;
                                        case 92:
                                            this.group(t_83.items);
                                            break;
                                        default: (0, s.warn)("Unimplemented operator " + e_167);
                                    }
                                }
                            }
                            catch (e_165_1) { e_165 = { error: e_165_1 }; }
                            finally {
                                try {
                                    if (e_166_1 && !e_166_1.done && (_a = e_166.return)) _a.call(e_166);
                                }
                                finally { if (e_165) throw e_165.error; }
                            }
                        };
                        class_1.prototype.setWordSpacing = function (e) { this.current.wordSpacing = e; };
                        class_1.prototype.setCharSpacing = function (e) { this.current.charSpacing = e; };
                        class_1.prototype.nextLine = function () { this.moveText(0, this.current.leading); };
                        class_1.prototype.setTextMatrix = function (e, t, r, s, n, a) { var i = this.current; i.textMatrix = i.lineMatrix = [e, t, r, s, n, a]; i.textMatrixScale = Math.hypot(e, t); i.x = i.lineX = 0; i.y = i.lineY = 0; i.xcoords = []; i.ycoords = []; i.tspan = this.svgFactory.createElement("svg:tspan"); i.tspan.setAttributeNS(null, "font-family", i.fontFamily); i.tspan.setAttributeNS(null, "font-size", pf(i.fontSize) + "px"); i.tspan.setAttributeNS(null, "y", pf(-i.y)); i.txtElement = this.svgFactory.createElement("svg:text"); i.txtElement.appendChild(i.tspan); };
                        class_1.prototype.beginText = function () { var e = this.current; e.x = e.lineX = 0; e.y = e.lineY = 0; e.textMatrix = s.IDENTITY_MATRIX; e.lineMatrix = s.IDENTITY_MATRIX; e.textMatrixScale = 1; e.tspan = this.svgFactory.createElement("svg:tspan"); e.txtElement = this.svgFactory.createElement("svg:text"); e.txtgrp = this.svgFactory.createElement("svg:g"); e.xcoords = []; e.ycoords = []; };
                        class_1.prototype.moveText = function (e, t) { var r = this.current; r.x = r.lineX += e; r.y = r.lineY += t; r.xcoords = []; r.ycoords = []; r.tspan = this.svgFactory.createElement("svg:tspan"); r.tspan.setAttributeNS(null, "font-family", r.fontFamily); r.tspan.setAttributeNS(null, "font-size", pf(r.fontSize) + "px"); r.tspan.setAttributeNS(null, "y", pf(-r.y)); };
                        class_1.prototype.showText = function (t) {
                            var e_168, _a;
                            var n = this.current, a = n.font, i = n.fontSize;
                            if (0 === i)
                                return;
                            var o = n.fontSizeScale, l = n.charSpacing, c = n.wordSpacing, h = n.fontDirection, d = n.textHScale * h, u = a.vertical, p = u ? 1 : -1, g = a.defaultVMetrics, f = i * n.fontMatrix[0];
                            var m = 0;
                            try {
                                for (var t_84 = __values(t), t_84_1 = t_84.next(); !t_84_1.done; t_84_1 = t_84.next()) {
                                    var e_169 = t_84_1.value;
                                    if (null === e_169) {
                                        m += h * c;
                                        continue;
                                    }
                                    if ((0, s.isNum)(e_169)) {
                                        m += p * e_169 * i / 1e3;
                                        continue;
                                    }
                                    var t_85 = (e_169.isSpace ? c : 0) + l, r_63 = e_169.fontChar;
                                    var d_3 = void 0, A_1 = void 0, _3 = void 0, b = e_169.width;
                                    if (u) {
                                        var t_86 = void 0;
                                        var r_64 = e_169.vmetric || g;
                                        t_86 = e_169.vmetric ? r_64[1] : .5 * b;
                                        t_86 = -t_86 * f;
                                        var s_53 = r_64[2] * f;
                                        b = r_64 ? -r_64[0] : b;
                                        d_3 = t_86 / o;
                                        A_1 = (m + s_53) / o;
                                    }
                                    else {
                                        d_3 = m / o;
                                        A_1 = 0;
                                    }
                                    if (e_169.isInFont || a.missingFile) {
                                        n.xcoords.push(n.x + d_3);
                                        u && n.ycoords.push(-n.y + A_1);
                                        n.tspan.textContent += r_63;
                                    }
                                    _3 = u ? b * f - t_85 * h : b * f + t_85 * h;
                                    m += _3;
                                }
                            }
                            catch (e_168_1) { e_168 = { error: e_168_1 }; }
                            finally {
                                try {
                                    if (t_84_1 && !t_84_1.done && (_a = t_84.return)) _a.call(t_84);
                                }
                                finally { if (e_168) throw e_168.error; }
                            }
                            n.tspan.setAttributeNS(null, "x", n.xcoords.map(pf).join(" "));
                            u ? n.tspan.setAttributeNS(null, "y", n.ycoords.map(pf).join(" ")) : n.tspan.setAttributeNS(null, "y", pf(-n.y));
                            u ? n.y -= m : n.x += m * d;
                            n.tspan.setAttributeNS(null, "font-family", n.fontFamily);
                            n.tspan.setAttributeNS(null, "font-size", pf(n.fontSize) + "px");
                            n.fontStyle !== e_152.fontStyle && n.tspan.setAttributeNS(null, "font-style", n.fontStyle);
                            n.fontWeight !== e_152.fontWeight && n.tspan.setAttributeNS(null, "font-weight", n.fontWeight);
                            var A = n.textRenderingMode & s.TextRenderingMode.FILL_STROKE_MASK;
                            if (A === s.TextRenderingMode.FILL || A === s.TextRenderingMode.FILL_STROKE) {
                                n.fillColor !== e_152.fillColor && n.tspan.setAttributeNS(null, "fill", n.fillColor);
                                n.fillAlpha < 1 && n.tspan.setAttributeNS(null, "fill-opacity", n.fillAlpha);
                            }
                            else
                                n.textRenderingMode === s.TextRenderingMode.ADD_TO_PATH ? n.tspan.setAttributeNS(null, "fill", "transparent") : n.tspan.setAttributeNS(null, "fill", "none");
                            if (A === s.TextRenderingMode.STROKE || A === s.TextRenderingMode.FILL_STROKE) {
                                var e_170 = 1 / (n.textMatrixScale || 1);
                                this._setStrokeAttributes(n.tspan, e_170);
                            }
                            var _ = n.textMatrix;
                            if (0 !== n.textRise) {
                                _ = _.slice();
                                _[5] += n.textRise;
                            }
                            n.txtElement.setAttributeNS(null, "transform", pm(_) + " scale(" + pf(d) + ", -1)");
                            n.txtElement.setAttributeNS(r_57, "xml:space", "preserve");
                            n.txtElement.appendChild(n.tspan);
                            n.txtgrp.appendChild(n.txtElement);
                            this._ensureTransformGroup().appendChild(n.txtElement);
                        };
                        class_1.prototype.setLeadingMoveText = function (e, t) { this.setLeading(-t); this.moveText(e, t); };
                        class_1.prototype.addFontStyle = function (e) { if (!e.data)
                            throw new Error('addFontStyle: No font data available, ensure that the "fontExtraProperties" API parameter is set.'); if (!this.cssStyle) {
                            this.cssStyle = this.svgFactory.createElement("svg:style");
                            this.cssStyle.setAttributeNS(null, "type", "text/css");
                            this.defs.appendChild(this.cssStyle);
                        } var t = (0, s.createObjectURL)(e.data, e.mimetype, this.forceDataSchema); this.cssStyle.textContent += "@font-face { font-family: \"" + e.loadedName + "\"; src: url(" + t + "); }\n"; };
                        class_1.prototype.setFont = function (e) { var t = this.current, r = this.commonObjs.get(e[0]); var n = e[1]; t.font = r; if (this.embedFonts && !r.missingFile && !this.embeddedFonts[r.loadedName]) {
                            this.addFontStyle(r);
                            this.embeddedFonts[r.loadedName] = r;
                        } t.fontMatrix = r.fontMatrix || s.FONT_IDENTITY_MATRIX; var a = "normal"; r.black ? a = "900" : r.bold && (a = "bold"); var i = r.italic ? "italic" : "normal"; if (n < 0) {
                            n = -n;
                            t.fontDirection = -1;
                        }
                        else
                            t.fontDirection = 1; t.fontSize = n; t.fontFamily = r.loadedName; t.fontWeight = a; t.fontStyle = i; t.tspan = this.svgFactory.createElement("svg:tspan"); t.tspan.setAttributeNS(null, "y", pf(-t.y)); t.xcoords = []; t.ycoords = []; };
                        class_1.prototype.endText = function () { var _a; var e = this.current; if (e.textRenderingMode & s.TextRenderingMode.ADD_TO_PATH_FLAG && ((_a = e.txtElement) === null || _a === void 0 ? void 0 : _a.hasChildNodes())) {
                            e.element = e.txtElement;
                            this.clip("nonzero");
                            this.endPath();
                        } };
                        class_1.prototype.setLineWidth = function (e) { e > 0 && (this.current.lineWidth = e); };
                        class_1.prototype.setLineCap = function (e) { this.current.lineCap = l_3[e]; };
                        class_1.prototype.setLineJoin = function (e) { this.current.lineJoin = c_2[e]; };
                        class_1.prototype.setMiterLimit = function (e) { this.current.miterLimit = e; };
                        class_1.prototype.setStrokeAlpha = function (e) { this.current.strokeAlpha = e; };
                        class_1.prototype.setStrokeRGBColor = function (e, t, r) { this.current.strokeColor = s.Util.makeHexColor(e, t, r); };
                        class_1.prototype.setFillAlpha = function (e) { this.current.fillAlpha = e; };
                        class_1.prototype.setFillRGBColor = function (e, t, r) { this.current.fillColor = s.Util.makeHexColor(e, t, r); this.current.tspan = this.svgFactory.createElement("svg:tspan"); this.current.xcoords = []; this.current.ycoords = []; };
                        class_1.prototype.setStrokeColorN = function (e) { this.current.strokeColor = this._makeColorN_Pattern(e); };
                        class_1.prototype.setFillColorN = function (e) { this.current.fillColor = this._makeColorN_Pattern(e); };
                        class_1.prototype.shadingFill = function (e) { var t = this.viewport.width, r = this.viewport.height, n = s.Util.inverseTransform(this.transformMatrix), a = s.Util.applyTransform([0, 0], n), i = s.Util.applyTransform([0, r], n), o = s.Util.applyTransform([t, 0], n), l = s.Util.applyTransform([t, r], n), c = Math.min(a[0], i[0], o[0], l[0]), h = Math.min(a[1], i[1], o[1], l[1]), d = Math.max(a[0], i[0], o[0], l[0]), u = Math.max(a[1], i[1], o[1], l[1]), p = this.svgFactory.createElement("svg:rect"); p.setAttributeNS(null, "x", c); p.setAttributeNS(null, "y", h); p.setAttributeNS(null, "width", d - c); p.setAttributeNS(null, "height", u - h); p.setAttributeNS(null, "fill", this._makeShadingPattern(e)); this.current.fillAlpha < 1 && p.setAttributeNS(null, "fill-opacity", this.current.fillAlpha); this._ensureTransformGroup().appendChild(p); };
                        class_1.prototype._makeColorN_Pattern = function (e) { return "TilingPattern" === e[0] ? this._makeTilingPattern(e) : this._makeShadingPattern(e); };
                        class_1.prototype._makeTilingPattern = function (e) {
                            var _a;
                            var t = e[1], r = e[2], n = e[3] || s.IDENTITY_MATRIX, _b = __read(e[4], 4), a = _b[0], i = _b[1], o = _b[2], l = _b[3], c = e[5], h = e[6], d = e[7], u = "shading" + p_1++, _c = __read(s.Util.normalizeRect(__spreadArray(__spreadArray([], __read(s.Util.applyTransform([a, i], n))), __read(s.Util.applyTransform([o, l], n)))), 4), g = _c[0], f = _c[1], m = _c[2], A = _c[3], _d = __read(s.Util.singularValueDecompose2dScale(n), 2), _ = _d[0], b = _d[1], y = c * _, S = h * b, v = this.svgFactory.createElement("svg:pattern");
                            v.setAttributeNS(null, "id", u);
                            v.setAttributeNS(null, "patternUnits", "userSpaceOnUse");
                            v.setAttributeNS(null, "width", y);
                            v.setAttributeNS(null, "height", S);
                            v.setAttributeNS(null, "x", "" + g);
                            v.setAttributeNS(null, "y", "" + f);
                            var x = this.svg, C = this.transformMatrix, P = this.current.fillColor, k = this.current.strokeColor, w = this.svgFactory.create(m - g, A - f);
                            this.svg = w;
                            this.transformMatrix = n;
                            if (2 === d) {
                                var e_171 = (_a = s.Util).makeHexColor.apply(_a, __spreadArray([], __read(t)));
                                this.current.fillColor = e_171;
                                this.current.strokeColor = e_171;
                            }
                            this.executeOpTree(this.convertOpList(r));
                            this.svg = x;
                            this.transformMatrix = C;
                            this.current.fillColor = P;
                            this.current.strokeColor = k;
                            v.appendChild(w.childNodes[0]);
                            this.defs.appendChild(v);
                            return "url(#" + u + ")";
                        };
                        class_1.prototype._makeShadingPattern = function (e) {
                            var e_172, _a;
                            switch (e[0]) {
                                case "RadialAxial":
                                    var t_87 = "shading" + p_1++, r_66 = e[3];
                                    var n_34;
                                    switch (e[1]) {
                                        case "axial":
                                            var r_67 = e[4], s_54 = e[5];
                                            n_34 = this.svgFactory.createElement("svg:linearGradient");
                                            n_34.setAttributeNS(null, "id", t_87);
                                            n_34.setAttributeNS(null, "gradientUnits", "userSpaceOnUse");
                                            n_34.setAttributeNS(null, "x1", r_67[0]);
                                            n_34.setAttributeNS(null, "y1", r_67[1]);
                                            n_34.setAttributeNS(null, "x2", s_54[0]);
                                            n_34.setAttributeNS(null, "y2", s_54[1]);
                                            break;
                                        case "radial":
                                            var a_23 = e[4], i_15 = e[5], o_12 = e[6], l_4 = e[7];
                                            n_34 = this.svgFactory.createElement("svg:radialGradient");
                                            n_34.setAttributeNS(null, "id", t_87);
                                            n_34.setAttributeNS(null, "gradientUnits", "userSpaceOnUse");
                                            n_34.setAttributeNS(null, "cx", i_15[0]);
                                            n_34.setAttributeNS(null, "cy", i_15[1]);
                                            n_34.setAttributeNS(null, "r", l_4);
                                            n_34.setAttributeNS(null, "fx", a_23[0]);
                                            n_34.setAttributeNS(null, "fy", a_23[1]);
                                            n_34.setAttributeNS(null, "fr", o_12);
                                            break;
                                        default: throw new Error("Unknown RadialAxial type: " + e[1]);
                                    }
                                    try {
                                        for (var r_65 = __values(r_66), r_65_1 = r_65.next(); !r_65_1.done; r_65_1 = r_65.next()) {
                                            var e_173 = r_65_1.value;
                                            var t_88 = this.svgFactory.createElement("svg:stop");
                                            t_88.setAttributeNS(null, "offset", e_173[0]);
                                            t_88.setAttributeNS(null, "stop-color", e_173[1]);
                                            n_34.appendChild(t_88);
                                        }
                                    }
                                    catch (e_172_1) { e_172 = { error: e_172_1 }; }
                                    finally {
                                        try {
                                            if (r_65_1 && !r_65_1.done && (_a = r_65.return)) _a.call(r_65);
                                        }
                                        finally { if (e_172) throw e_172.error; }
                                    }
                                    this.defs.appendChild(n_34);
                                    return "url(#" + t_87 + ")";
                                case "Mesh":
                                    (0, s.warn)("Unimplemented pattern Mesh");
                                    return null;
                                case "Dummy": return "hotpink";
                                default: throw new Error("Unknown IR type: " + e[0]);
                            }
                        };
                        class_1.prototype.setDash = function (e, t) { this.current.dashArray = e; this.current.dashPhase = t; };
                        class_1.prototype.constructPath = function (e, t) {
                            var e_174, _a;
                            var r = this.current;
                            var n = r.x, a = r.y, i = [], o = 0;
                            try {
                                for (var e_175 = __values(e), e_175_1 = e_175.next(); !e_175_1.done; e_175_1 = e_175.next()) {
                                    var r_68 = e_175_1.value;
                                    switch (0 | r_68) {
                                        case s.OPS.rectangle:
                                            n = t[o++];
                                            a = t[o++];
                                            var e_176 = n + t[o++], r_69 = a + t[o++];
                                            i.push("M", pf(n), pf(a), "L", pf(e_176), pf(a), "L", pf(e_176), pf(r_69), "L", pf(n), pf(r_69), "Z");
                                            break;
                                        case s.OPS.moveTo:
                                            n = t[o++];
                                            a = t[o++];
                                            i.push("M", pf(n), pf(a));
                                            break;
                                        case s.OPS.lineTo:
                                            n = t[o++];
                                            a = t[o++];
                                            i.push("L", pf(n), pf(a));
                                            break;
                                        case s.OPS.curveTo:
                                            n = t[o + 4];
                                            a = t[o + 5];
                                            i.push("C", pf(t[o]), pf(t[o + 1]), pf(t[o + 2]), pf(t[o + 3]), pf(n), pf(a));
                                            o += 6;
                                            break;
                                        case s.OPS.curveTo2:
                                            i.push("C", pf(n), pf(a), pf(t[o]), pf(t[o + 1]), pf(t[o + 2]), pf(t[o + 3]));
                                            n = t[o + 2];
                                            a = t[o + 3];
                                            o += 4;
                                            break;
                                        case s.OPS.curveTo3:
                                            n = t[o + 2];
                                            a = t[o + 3];
                                            i.push("C", pf(t[o]), pf(t[o + 1]), pf(n), pf(a), pf(n), pf(a));
                                            o += 4;
                                            break;
                                        case s.OPS.closePath: i.push("Z");
                                    }
                                }
                            }
                            catch (e_174_1) { e_174 = { error: e_174_1 }; }
                            finally {
                                try {
                                    if (e_175_1 && !e_175_1.done && (_a = e_175.return)) _a.call(e_175);
                                }
                                finally { if (e_174) throw e_174.error; }
                            }
                            i = i.join(" ");
                            if (r.path && e.length > 0 && e[0] !== s.OPS.rectangle && e[0] !== s.OPS.moveTo)
                                i = r.path.getAttributeNS(null, "d") + i;
                            else {
                                r.path = this.svgFactory.createElement("svg:path");
                                this._ensureTransformGroup().appendChild(r.path);
                            }
                            r.path.setAttributeNS(null, "d", i);
                            r.path.setAttributeNS(null, "fill", "none");
                            r.element = r.path;
                            r.setCurrentPoint(n, a);
                        };
                        class_1.prototype.endPath = function () {
                            var e_177, _a;
                            var e = this.current;
                            e.path = null;
                            if (!this.pendingClip)
                                return;
                            if (!e.element) {
                                this.pendingClip = null;
                                return;
                            }
                            var t = "clippath" + d_2++, r = this.svgFactory.createElement("svg:clipPath");
                            r.setAttributeNS(null, "id", t);
                            r.setAttributeNS(null, "transform", pm(this.transformMatrix));
                            var s = e.element.cloneNode(!0);
                            "evenodd" === this.pendingClip ? s.setAttributeNS(null, "clip-rule", "evenodd") : s.setAttributeNS(null, "clip-rule", "nonzero");
                            this.pendingClip = null;
                            r.appendChild(s);
                            this.defs.appendChild(r);
                            if (e.activeClipUrl) {
                                e.clipGroup = null;
                                try {
                                    for (var _b = __values(this.extraStack), _c = _b.next(); !_c.done; _c = _b.next()) {
                                        var e_178 = _c.value;
                                        e_178.clipGroup = null;
                                    }
                                }
                                catch (e_177_1) { e_177 = { error: e_177_1 }; }
                                finally {
                                    try {
                                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                    }
                                    finally { if (e_177) throw e_177.error; }
                                }
                                r.setAttributeNS(null, "clip-path", e.activeClipUrl);
                            }
                            e.activeClipUrl = "url(#" + t + ")";
                            this.tgrp = null;
                        };
                        class_1.prototype.clip = function (e) { this.pendingClip = e; };
                        class_1.prototype.closePath = function () { var e = this.current; if (e.path) {
                            var t_89 = e.path.getAttributeNS(null, "d") + "Z";
                            e.path.setAttributeNS(null, "d", t_89);
                        } };
                        class_1.prototype.setLeading = function (e) { this.current.leading = -e; };
                        class_1.prototype.setTextRise = function (e) { this.current.textRise = e; };
                        class_1.prototype.setTextRenderingMode = function (e) { this.current.textRenderingMode = e; };
                        class_1.prototype.setHScale = function (e) { this.current.textHScale = e / 100; };
                        class_1.prototype.setRenderingIntent = function (e) { };
                        class_1.prototype.setFlatness = function (e) { };
                        class_1.prototype.setGState = function (e) {
                            var e_179, _a;
                            try {
                                for (var e_180 = __values(e), e_180_1 = e_180.next(); !e_180_1.done; e_180_1 = e_180.next()) {
                                    var _b = __read(e_180_1.value, 2), t_90 = _b[0], r_70 = _b[1];
                                    switch (t_90) {
                                        case "LW":
                                            this.setLineWidth(r_70);
                                            break;
                                        case "LC":
                                            this.setLineCap(r_70);
                                            break;
                                        case "LJ":
                                            this.setLineJoin(r_70);
                                            break;
                                        case "ML":
                                            this.setMiterLimit(r_70);
                                            break;
                                        case "D":
                                            this.setDash(r_70[0], r_70[1]);
                                            break;
                                        case "RI":
                                            this.setRenderingIntent(r_70);
                                            break;
                                        case "FL":
                                            this.setFlatness(r_70);
                                            break;
                                        case "Font":
                                            this.setFont(r_70);
                                            break;
                                        case "CA":
                                            this.setStrokeAlpha(r_70);
                                            break;
                                        case "ca":
                                            this.setFillAlpha(r_70);
                                            break;
                                        default: (0, s.warn)("Unimplemented graphic state operator " + t_90);
                                    }
                                }
                            }
                            catch (e_179_1) { e_179 = { error: e_179_1 }; }
                            finally {
                                try {
                                    if (e_180_1 && !e_180_1.done && (_a = e_180.return)) _a.call(e_180);
                                }
                                finally { if (e_179) throw e_179.error; }
                            }
                        };
                        class_1.prototype.fill = function () { var e = this.current; if (e.element) {
                            e.element.setAttributeNS(null, "fill", e.fillColor);
                            e.element.setAttributeNS(null, "fill-opacity", e.fillAlpha);
                            this.endPath();
                        } };
                        class_1.prototype.stroke = function () { var e = this.current; if (e.element) {
                            this._setStrokeAttributes(e.element);
                            e.element.setAttributeNS(null, "fill", "none");
                            this.endPath();
                        } };
                        class_1.prototype._setStrokeAttributes = function (e, t) {
                            if (t === void 0) { t = 1; }
                            var r = this.current;
                            var s = r.dashArray;
                            1 !== t && s.length > 0 && (s = s.map((function (e) { return t * e; })));
                            e.setAttributeNS(null, "stroke", r.strokeColor);
                            e.setAttributeNS(null, "stroke-opacity", r.strokeAlpha);
                            e.setAttributeNS(null, "stroke-miterlimit", pf(r.miterLimit));
                            e.setAttributeNS(null, "stroke-linecap", r.lineCap);
                            e.setAttributeNS(null, "stroke-linejoin", r.lineJoin);
                            e.setAttributeNS(null, "stroke-width", pf(t * r.lineWidth) + "px");
                            e.setAttributeNS(null, "stroke-dasharray", s.map(pf).join(" "));
                            e.setAttributeNS(null, "stroke-dashoffset", pf(t * r.dashPhase) + "px");
                        };
                        class_1.prototype.eoFill = function () { this.current.element && this.current.element.setAttributeNS(null, "fill-rule", "evenodd"); this.fill(); };
                        class_1.prototype.fillStroke = function () { this.stroke(); this.fill(); };
                        class_1.prototype.eoFillStroke = function () { this.current.element && this.current.element.setAttributeNS(null, "fill-rule", "evenodd"); this.fillStroke(); };
                        class_1.prototype.closeStroke = function () { this.closePath(); this.stroke(); };
                        class_1.prototype.closeFillStroke = function () { this.closePath(); this.fillStroke(); };
                        class_1.prototype.closeEOFillStroke = function () { this.closePath(); this.eoFillStroke(); };
                        class_1.prototype.paintSolidColorImageMask = function () { var e = this.svgFactory.createElement("svg:rect"); e.setAttributeNS(null, "x", "0"); e.setAttributeNS(null, "y", "0"); e.setAttributeNS(null, "width", "1px"); e.setAttributeNS(null, "height", "1px"); e.setAttributeNS(null, "fill", this.current.fillColor); this._ensureTransformGroup().appendChild(e); };
                        class_1.prototype.paintImageXObject = function (e) { var t = e.startsWith("g_") ? this.commonObjs.get(e) : this.objs.get(e); t ? this.paintInlineImageXObject(t) : (0, s.warn)("Dependent image with object ID " + e + " is not ready yet"); };
                        class_1.prototype.paintInlineImageXObject = function (e, t) { var r = e.width, s = e.height, n = h_3(e, this.forceDataSchema, !!t), a = this.svgFactory.createElement("svg:rect"); a.setAttributeNS(null, "x", "0"); a.setAttributeNS(null, "y", "0"); a.setAttributeNS(null, "width", pf(r)); a.setAttributeNS(null, "height", pf(s)); this.current.element = a; this.clip("nonzero"); var i = this.svgFactory.createElement("svg:image"); i.setAttributeNS(o_11, "xlink:href", n); i.setAttributeNS(null, "x", "0"); i.setAttributeNS(null, "y", pf(-s)); i.setAttributeNS(null, "width", pf(r) + "px"); i.setAttributeNS(null, "height", pf(s) + "px"); i.setAttributeNS(null, "transform", "scale(" + pf(1 / r) + " " + pf(-1 / s) + ")"); t ? t.appendChild(i) : this._ensureTransformGroup().appendChild(i); };
                        class_1.prototype.paintImageMaskXObject = function (e) { var t = this.current, r = e.width, s = e.height, n = t.fillColor; t.maskId = "mask" + u_2++; var a = this.svgFactory.createElement("svg:mask"); a.setAttributeNS(null, "id", t.maskId); var i = this.svgFactory.createElement("svg:rect"); i.setAttributeNS(null, "x", "0"); i.setAttributeNS(null, "y", "0"); i.setAttributeNS(null, "width", pf(r)); i.setAttributeNS(null, "height", pf(s)); i.setAttributeNS(null, "fill", n); i.setAttributeNS(null, "mask", "url(#" + t.maskId + ")"); this.defs.appendChild(a); this._ensureTransformGroup().appendChild(i); this.paintInlineImageXObject(e, a); };
                        class_1.prototype.paintFormXObjectBegin = function (e, t) { Array.isArray(e) && 6 === e.length && this.transform(e[0], e[1], e[2], e[3], e[4], e[5]); if (t) {
                            var e_181 = t[2] - t[0], r_71 = t[3] - t[1], s_55 = this.svgFactory.createElement("svg:rect");
                            s_55.setAttributeNS(null, "x", t[0]);
                            s_55.setAttributeNS(null, "y", t[1]);
                            s_55.setAttributeNS(null, "width", pf(e_181));
                            s_55.setAttributeNS(null, "height", pf(r_71));
                            this.current.element = s_55;
                            this.clip("nonzero");
                            this.endPath();
                        } };
                        class_1.prototype.paintFormXObjectEnd = function () { };
                        class_1.prototype._initialize = function (e) { var t = this.svgFactory.create(e.width, e.height), r = this.svgFactory.createElement("svg:defs"); t.appendChild(r); this.defs = r; var s = this.svgFactory.createElement("svg:g"); s.setAttributeNS(null, "transform", pm(e.transform)); t.appendChild(s); this.svg = s; return t; };
                        class_1.prototype._ensureClipGroup = function () { if (!this.current.clipGroup) {
                            var e_182 = this.svgFactory.createElement("svg:g");
                            e_182.setAttributeNS(null, "clip-path", this.current.activeClipUrl);
                            this.svg.appendChild(e_182);
                            this.current.clipGroup = e_182;
                        } return this.current.clipGroup; };
                        class_1.prototype._ensureTransformGroup = function () { if (!this.tgrp) {
                            this.tgrp = this.svgFactory.createElement("svg:g");
                            this.tgrp.setAttributeNS(null, "transform", pm(this.transformMatrix));
                            this.current.activeClipUrl ? this._ensureClipGroup().appendChild(this.tgrp) : this.svg.appendChild(this.tgrp);
                        } return this.tgrp; };
                        return class_1;
                    }());
                } }, function (e, t) { Object.defineProperty(t, "__esModule", { value: !0 }); t.XfaLayer = void 0; t.XfaLayer = /** @class */ (function () {
                    function XfaLayer() {
                    }
                    XfaLayer.setupStorage = function (e, t, r, s, n) {
                        var e_183, _a;
                        var a = s.getValue(t, { value: null });
                        switch (r.name) {
                            case "textarea":
                                null !== a.value && (e.textContent = a.value);
                                if ("print" === n)
                                    break;
                                e.addEventListener("input", (function (e) { s.setValue(t, { value: e.target.value }); }));
                                break;
                            case "input":
                                if ("radio" === r.attributes.type || "checkbox" === r.attributes.type) {
                                    a.value === r.attributes.xfaOn && e.setAttribute("checked", !0);
                                    if ("print" === n)
                                        break;
                                    e.addEventListener("change", (function (e) { s.setValue(t, { value: e.target.getAttribute("xfaOn") }); }));
                                }
                                else {
                                    null !== a.value && e.setAttribute("value", a.value);
                                    if ("print" === n)
                                        break;
                                    e.addEventListener("input", (function (e) { s.setValue(t, { value: e.target.value }); }));
                                }
                                break;
                            case "select":
                                if (null !== a.value)
                                    try {
                                        for (var _b = __values(r.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                                            var e_184 = _c.value;
                                            e_184.attributes.value === a.value && (e_184.attributes.selected = !0);
                                        }
                                    }
                                    catch (e_183_1) { e_183 = { error: e_183_1 }; }
                                    finally {
                                        try {
                                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                        }
                                        finally { if (e_183) throw e_183.error; }
                                    }
                                e.addEventListener("input", (function (e) { var r = e.target.options, n = -1 === r.selectedIndex ? "" : r[r.selectedIndex].value; s.setValue(t, { value: n }); }));
                        }
                    };
                    XfaLayer.setAttributes = function (e, t, r, s) {
                        var e_185, _a;
                        var n = t.attributes;
                        "radio" === n.type && (n.name = n.name + "-" + s);
                        try {
                            for (var _b = __values(Object.entries(n)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var _d = __read(_c.value, 2), t_91 = _d[0], r_72 = _d[1];
                                null != r_72 && "dataId" !== t_91 && ("style" !== t_91 ? "textContent" === t_91 ? e.textContent = r_72 : "class" === t_91 ? e.setAttribute(t_91, r_72.join(" ")) : e.setAttribute(t_91, r_72) : Object.assign(e.style, r_72));
                            }
                        }
                        catch (e_185_1) { e_185 = { error: e_185_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_185) throw e_185.error; }
                        }
                        r && n.dataId && this.setupStorage(e, n.dataId, t, r);
                    };
                    XfaLayer.render = function (e) {
                        var e_186, _a;
                        var _b;
                        var t = e.annotationStorage, r = e.xfa, s = e.intent || "display", n = document.createElement(r.name);
                        r.attributes && this.setAttributes(n, r);
                        var a = [[r, -1, n]], i = e.div;
                        i.appendChild(n);
                        var o = "matrix(" + e.viewport.transform.join(",") + ")";
                        i.style.transform = o;
                        i.setAttribute("class", "xfaLayer xfaFont");
                        for (; a.length > 0;) {
                            var _c = __read(a[a.length - 1], 3), e_187 = _c[0], r_73 = _c[1], n_35 = _c[2];
                            if (r_73 + 1 === e_187.children.length) {
                                a.pop();
                                continue;
                            }
                            var i_16 = e_187.children[++a[a.length - 1][1]];
                            if (null === i_16)
                                continue;
                            var o_13 = i_16.name;
                            if ("#text" === o_13) {
                                n_35.appendChild(document.createTextNode(i_16.value));
                                continue;
                            }
                            var l = void 0;
                            l = ((_b = i_16 === null || i_16 === void 0 ? void 0 : i_16.attributes) === null || _b === void 0 ? void 0 : _b.xmlns) ? document.createElementNS(i_16.attributes.xmlns, o_13) : document.createElement(o_13);
                            n_35.appendChild(l);
                            i_16.attributes && this.setAttributes(l, i_16, t, s);
                            i_16.children && i_16.children.length > 0 ? a.push([i_16, -1, l]) : i_16.value && l.appendChild(document.createTextNode(i_16.value));
                        }
                        try {
                            for (var _d = __values(i.querySelectorAll(".xfaNonInteractive input, .xfaNonInteractive textarea")), _e = _d.next(); !_e.done; _e = _d.next()) {
                                var e_188 = _e.value;
                                e_188.setAttribute("readOnly", !0);
                            }
                        }
                        catch (e_186_1) { e_186 = { error: e_186_1 }; }
                        finally {
                            try {
                                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                            }
                            finally { if (e_186) throw e_186.error; }
                        }
                    };
                    XfaLayer.update = function (e) { var t = "matrix(" + e.viewport.transform.join(",") + ")"; e.div.style.transform = t; e.div.hidden = !1; };
                    return XfaLayer;
                }()); }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.PDFNodeStream = void 0; var s = r(2), n = r(23); var a = require$$0__default["default"], i = require$$3__default["default"], o = require$$4__default["default"], l = require$$5__default["default"], c = /^file:\/\/\/[a-zA-Z]:\//; t.PDFNodeStream = /** @class */ (function () {
                    function PDFNodeStream(e) {
                        this.source = e;
                        this.url = function parseUrl(e) { var t = l.parse(e); if ("file:" === t.protocol || t.host)
                            return t; if (/^[a-z]:[/\\]/i.test(e))
                            return l.parse("file:///" + e); t.host || (t.protocol = "file:"); return t; }(e.url);
                        this.isHttp = "http:" === this.url.protocol || "https:" === this.url.protocol;
                        this.isFsUrl = "file:" === this.url.protocol;
                        this.httpHeaders = this.isHttp && e.httpHeaders || {};
                        this._fullRequestReader = null;
                        this._rangeRequestReaders = [];
                    }
                    Object.defineProperty(PDFNodeStream.prototype, "_progressiveDataLength", {
                        get: function () { var _a, _b; return (_b = (_a = this._fullRequestReader) === null || _a === void 0 ? void 0 : _a._loaded) !== null && _b !== void 0 ? _b : 0; },
                        enumerable: false,
                        configurable: true
                    });
                    PDFNodeStream.prototype.getFullReader = function () { (0, s.assert)(!this._fullRequestReader, "PDFNodeStream.getFullReader can only be called once."); this._fullRequestReader = this.isFsUrl ? new PDFNodeStreamFsFullReader(this) : new PDFNodeStreamFullReader(this); return this._fullRequestReader; };
                    PDFNodeStream.prototype.getRangeReader = function (e, t) { if (t <= this._progressiveDataLength)
                        return null; var r = this.isFsUrl ? new PDFNodeStreamFsRangeReader(this, e, t) : new PDFNodeStreamRangeReader(this, e, t); this._rangeRequestReaders.push(r); return r; };
                    PDFNodeStream.prototype.cancelAllRequests = function (e) {
                        var e_189, _a;
                        this._fullRequestReader && this._fullRequestReader.cancel(e);
                        try {
                            for (var _b = __values(this._rangeRequestReaders.slice(0)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var t_92 = _c.value;
                                t_92.cancel(e);
                            }
                        }
                        catch (e_189_1) { e_189 = { error: e_189_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_189) throw e_189.error; }
                        }
                    };
                    return PDFNodeStream;
                }());
                    var BaseFullReader = /** @class */ (function () {
                        function BaseFullReader(e) {
                            this._url = e.url;
                            this._done = !1;
                            this._storedError = null;
                            this.onProgress = null;
                            var t = e.source;
                            this._contentLength = t.length;
                            this._loaded = 0;
                            this._filename = null;
                            this._disableRange = t.disableRange || !1;
                            this._rangeChunkSize = t.rangeChunkSize;
                            this._rangeChunkSize || this._disableRange || (this._disableRange = !0);
                            this._isStreamingSupported = !t.disableStream;
                            this._isRangeSupported = !t.disableRange;
                            this._readableStream = null;
                            this._readCapability = (0, s.createPromiseCapability)();
                            this._headersCapability = (0, s.createPromiseCapability)();
                        }
                        Object.defineProperty(BaseFullReader.prototype, "headersReady", {
                            get: function () { return this._headersCapability.promise; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(BaseFullReader.prototype, "filename", {
                            get: function () { return this._filename; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(BaseFullReader.prototype, "contentLength", {
                            get: function () { return this._contentLength; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(BaseFullReader.prototype, "isRangeSupported", {
                            get: function () { return this._isRangeSupported; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(BaseFullReader.prototype, "isStreamingSupported", {
                            get: function () { return this._isStreamingSupported; },
                            enumerable: false,
                            configurable: true
                        });
                        BaseFullReader.prototype.read = function () {
                            return __awaiter(this, void 0, void 0, function () { var e; return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this._readCapability.promise];
                                    case 1:
                                        _a.sent();
                                        if (this._done)
                                            return [2 /*return*/, { value: void 0, done: !0 }];
                                        if (this._storedError)
                                            throw this._storedError;
                                        e = this._readableStream.read();
                                        if (null === e) {
                                            this._readCapability = (0, s.createPromiseCapability)();
                                            return [2 /*return*/, this.read()];
                                        }
                                        this._loaded += e.length;
                                        this.onProgress && this.onProgress({ loaded: this._loaded, total: this._contentLength });
                                        return [2 /*return*/, { value: new Uint8Array(e).buffer, done: !1 }];
                                }
                            }); });
                        };
                        BaseFullReader.prototype.cancel = function (e) { this._readableStream ? this._readableStream.destroy(e) : this._error(e); };
                        BaseFullReader.prototype._error = function (e) { this._storedError = e; this._readCapability.resolve(); };
                        BaseFullReader.prototype._setReadableStream = function (e) {
                            var _this = this;
                            this._readableStream = e;
                            e.on("readable", (function () { _this._readCapability.resolve(); }));
                            e.on("end", (function () { e.destroy(); _this._done = !0; _this._readCapability.resolve(); }));
                            e.on("error", (function (e) { _this._error(e); }));
                            !this._isStreamingSupported && this._isRangeSupported && this._error(new s.AbortException("streaming is disabled"));
                            this._storedError && this._readableStream.destroy(this._storedError);
                        };
                        return BaseFullReader;
                    }()); 
                    var BaseRangeReader = /** @class */ (function () {
                        function BaseRangeReader(e) {
                            this._url = e.url;
                            this._done = !1;
                            this._storedError = null;
                            this.onProgress = null;
                            this._loaded = 0;
                            this._readableStream = null;
                            this._readCapability = (0, s.createPromiseCapability)();
                            var t = e.source;
                            this._isStreamingSupported = !t.disableStream;
                        }
                        Object.defineProperty(BaseRangeReader.prototype, "isStreamingSupported", {
                            get: function () { return this._isStreamingSupported; },
                            enumerable: false,
                            configurable: true
                        });
                        BaseRangeReader.prototype.read = function () {
                            return __awaiter(this, void 0, void 0, function () { var e; return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this._readCapability.promise];
                                    case 1:
                                        _a.sent();
                                        if (this._done)
                                            return [2 /*return*/, { value: void 0, done: !0 }];
                                        if (this._storedError)
                                            throw this._storedError;
                                        e = this._readableStream.read();
                                        if (null === e) {
                                            this._readCapability = (0, s.createPromiseCapability)();
                                            return [2 /*return*/, this.read()];
                                        }
                                        this._loaded += e.length;
                                        this.onProgress && this.onProgress({ loaded: this._loaded });
                                        return [2 /*return*/, { value: new Uint8Array(e).buffer, done: !1 }];
                                }
                            }); });
                        };
                        BaseRangeReader.prototype.cancel = function (e) { this._readableStream ? this._readableStream.destroy(e) : this._error(e); };
                        BaseRangeReader.prototype._error = function (e) { this._storedError = e; this._readCapability.resolve(); };
                        BaseRangeReader.prototype._setReadableStream = function (e) {
                            var _this = this;
                            this._readableStream = e;
                            e.on("readable", (function () { _this._readCapability.resolve(); }));
                            e.on("end", (function () { e.destroy(); _this._done = !0; _this._readCapability.resolve(); }));
                            e.on("error", (function (e) { _this._error(e); }));
                            this._storedError && this._readableStream.destroy(this._storedError);
                        };
                        return BaseRangeReader;
                    }());  function createRequestOptions(e, t) { return { protocol: e.protocol, auth: e.auth, host: e.hostname, port: e.port, path: e.path, method: "GET", headers: t }; }
                    var PDFNodeStreamFullReader = /** @class */ (function (_super) {
                        __extends(PDFNodeStreamFullReader, _super);
                        function PDFNodeStreamFullReader(e) {
                            var _this = _super.call(this, e) || this;
                            var handleResponse = function (t) { if (404 === t.statusCode) {
                                var e_190 = new s.MissingPDFException("Missing PDF \"" + _this._url + "\".");
                                _this._storedError = e_190;
                                _this._headersCapability.reject(e_190);
                                return;
                            } _this._headersCapability.resolve(); _this._setReadableStream(t); var getResponseHeader = function (e) { return _this._readableStream.headers[e.toLowerCase()]; }, _a = (0, n.validateRangeRequestCapabilities)({ getResponseHeader: getResponseHeader, isHttp: e.isHttp, rangeChunkSize: _this._rangeChunkSize, disableRange: _this._disableRange }), r = _a.allowRangeRequests, a = _a.suggestedLength; _this._isRangeSupported = r; _this._contentLength = a || _this._contentLength; _this._filename = (0, n.extractFilenameFromHeader)(getResponseHeader); };
                            _this._request = null;
                            "http:" === _this._url.protocol ? _this._request = i.request(createRequestOptions(_this._url, e.httpHeaders), handleResponse) : _this._request = o.request(createRequestOptions(_this._url, e.httpHeaders), handleResponse);
                            _this._request.on("error", (function (e) { _this._storedError = e; _this._headersCapability.reject(e); }));
                            _this._request.end();
                            return _this;
                        }
                        return PDFNodeStreamFullReader;
                    }(BaseFullReader)); 
                    var PDFNodeStreamRangeReader = /** @class */ (function (_super) {
                        __extends(PDFNodeStreamRangeReader, _super);
                        function PDFNodeStreamRangeReader(e, t, r) {
                            var _this = _super.call(this, e) || this;
                            _this._httpHeaders = {};
                            for (var t_93 in e.httpHeaders) {
                                var r_74 = e.httpHeaders[t_93];
                                void 0 !== r_74 && (_this._httpHeaders[t_93] = r_74);
                            }
                            _this._httpHeaders.Range = "bytes=" + t + "-" + (r - 1);
                            var handleResponse = function (e) { if (404 !== e.statusCode)
                                _this._setReadableStream(e);
                            else {
                                var e_191 = new s.MissingPDFException("Missing PDF \"" + _this._url + "\".");
                                _this._storedError = e_191;
                            } };
                            _this._request = null;
                            "http:" === _this._url.protocol ? _this._request = i.request(createRequestOptions(_this._url, _this._httpHeaders), handleResponse) : _this._request = o.request(createRequestOptions(_this._url, _this._httpHeaders), handleResponse);
                            _this._request.on("error", (function (e) { _this._storedError = e; }));
                            _this._request.end();
                            return _this;
                        }
                        return PDFNodeStreamRangeReader;
                    }(BaseRangeReader)); 
                    var PDFNodeStreamFsFullReader = /** @class */ (function (_super) {
                        __extends(PDFNodeStreamFsFullReader, _super);
                        function PDFNodeStreamFsFullReader(e) {
                            var _this = _super.call(this, e) || this;
                            var t = decodeURIComponent(_this._url.path);
                            c.test(_this._url.href) && (t = t.replace(/^\//, ""));
                            a.lstat(t, (function (e, r) { if (e) {
                                "ENOENT" === e.code && (e = new s.MissingPDFException("Missing PDF \"" + t + "\"."));
                                _this._storedError = e;
                                _this._headersCapability.reject(e);
                            }
                            else {
                                _this._contentLength = r.size;
                                _this._setReadableStream(a.createReadStream(t));
                                _this._headersCapability.resolve();
                            } }));
                            return _this;
                        }
                        return PDFNodeStreamFsFullReader;
                    }(BaseFullReader)); 
                    var PDFNodeStreamFsRangeReader = /** @class */ (function (_super) {
                        __extends(PDFNodeStreamFsRangeReader, _super);
                        function PDFNodeStreamFsRangeReader(e, t, r) {
                            var _this = _super.call(this, e) || this;
                            var s = decodeURIComponent(_this._url.path);
                            c.test(_this._url.href) && (s = s.replace(/^\//, ""));
                            _this._setReadableStream(a.createReadStream(s, { start: t, end: r - 1 }));
                            return _this;
                        }
                        return PDFNodeStreamFsRangeReader;
                    }(BaseRangeReader));  }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.createResponseStatusError = function createResponseStatusError(e, t) { if (404 === e || 0 === e && t.startsWith("file:"))
                    return new s.MissingPDFException('Missing PDF "' + t + '".'); return new s.UnexpectedResponseException("Unexpected server response (" + e + ") while retrieving PDF \"" + t + "\".", e); }; t.extractFilenameFromHeader = function extractFilenameFromHeader(e) { var t = e("Content-Disposition"); if (t) {
                    var e_192 = (0, n.getFilenameFromContentDispositionHeader)(t);
                    if (e_192.includes("%"))
                        try {
                            e_192 = decodeURIComponent(e_192);
                        }
                        catch (e) { }
                    if ((0, a.isPdfFile)(e_192))
                        return e_192;
                } return null; }; t.validateRangeRequestCapabilities = function validateRangeRequestCapabilities(_a) {
                    var e = _a.getResponseHeader, t = _a.isHttp, r = _a.rangeChunkSize, n = _a.disableRange;
                    (0, s.assert)(r > 0, "Range chunk size must be larger than zero");
                    var a = { allowRangeRequests: !1, suggestedLength: void 0 }, i = parseInt(e("Content-Length"), 10);
                    if (!Number.isInteger(i))
                        return a;
                    a.suggestedLength = i;
                    if (i <= 2 * r)
                        return a;
                    if (n || !t)
                        return a;
                    if ("bytes" !== e("Accept-Ranges"))
                        return a;
                    if ("identity" !== (e("Content-Encoding") || "identity"))
                        return a;
                    a.allowRangeRequests = !0;
                    return a;
                }; t.validateResponseStatus = function validateResponseStatus(e) { return 200 === e || 206 === e; }; var s = r(2), n = r(24), a = r(1); }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.getFilenameFromContentDispositionHeader = function getFilenameFromContentDispositionHeader(e) { var t = !0, r = toParamRegExp("filename\\*", "i").exec(e); if (r) {
                    r = r[1];
                    var e_193 = rfc2616unquote(r);
                    e_193 = unescape(e_193);
                    e_193 = rfc5987decode(e_193);
                    e_193 = rfc2047decode(e_193);
                    return fixupEncoding(e_193);
                } r = function rfc2231getparam(e) { var t = []; var r; var s = toParamRegExp("filename\\*((?!0\\d)\\d+)(\\*?)", "ig"); for (; null !== (r = s.exec(e));) {
                    var _a = __read(r, 4), e_194 = _a[1], s_56 = _a[2], n_36 = _a[3];
                    e_194 = parseInt(e_194, 10);
                    if (e_194 in t) {
                        if (0 === e_194)
                            break;
                    }
                    else
                        t[e_194] = [s_56, n_36];
                } var n = []; for (var e_195 = 0; e_195 < t.length && e_195 in t; ++e_195) {
                    var _b = __read(t[e_195], 2), r_75 = _b[0], s_57 = _b[1];
                    s_57 = rfc2616unquote(s_57);
                    if (r_75) {
                        s_57 = unescape(s_57);
                        0 === e_195 && (s_57 = rfc5987decode(s_57));
                    }
                    n.push(s_57);
                } return n.join(""); }(e); if (r) {
                    return fixupEncoding(rfc2047decode(r));
                } r = toParamRegExp("filename", "i").exec(e); if (r) {
                    r = r[1];
                    var e_196 = rfc2616unquote(r);
                    e_196 = rfc2047decode(e_196);
                    return fixupEncoding(e_196);
                } function toParamRegExp(e, t) { return new RegExp("(?:^|;)\\s*" + e + '\\s*=\\s*([^";\\s][^;\\s]*|"(?:[^"\\\\]|\\\\"?)+"?)', t); } function textdecode(e, r) { if (e) {
                    if (!/^[\x00-\xFF]+$/.test(r))
                        return r;
                    try {
                        var n = new TextDecoder(e, { fatal: !0 }), a = (0, s.stringToBytes)(r);
                        r = n.decode(a);
                        t = !1;
                    }
                    catch (s) {
                        if (/^utf-?8$/i.test(e))
                            try {
                                r = decodeURIComponent(escape(r));
                                t = !1;
                            }
                            catch (e) { }
                    }
                } return r; } function fixupEncoding(e) { if (t && /[\x80-\xff]/.test(e)) {
                    e = textdecode("utf-8", e);
                    t && (e = textdecode("iso-8859-1", e));
                } return e; } function rfc2616unquote(e) { if (e.startsWith('"')) {
                    var t_94 = e.slice(1).split('\\"');
                    for (var e_197 = 0; e_197 < t_94.length; ++e_197) {
                        var r_76 = t_94[e_197].indexOf('"');
                        if (-1 !== r_76) {
                            t_94[e_197] = t_94[e_197].slice(0, r_76);
                            t_94.length = e_197 + 1;
                        }
                        t_94[e_197] = t_94[e_197].replace(/\\(.)/g, "$1");
                    }
                    e = t_94.join('"');
                } return e; } function rfc5987decode(e) { var t = e.indexOf("'"); if (-1 === t)
                    return e; return textdecode(e.slice(0, t), e.slice(t + 1).replace(/^[^']*'/, "")); } function rfc2047decode(e) { return !e.startsWith("=?") || /[\x00-\x19\x80-\xff]/.test(e) ? e : e.replace(/=\?([\w-]*)\?([QqBb])\?((?:[^?]|\?(?!=))*)\?=/g, (function (e, t, r, s) { if ("q" === r || "Q" === r)
                    return textdecode(t, s = (s = s.replace(/_/g, " ")).replace(/=([0-9a-fA-F]{2})/g, (function (e, t) { return String.fromCharCode(parseInt(t, 16)); }))); try {
                    s = atob(s);
                }
                catch (e) { } return textdecode(t, s); })); } return ""; }; var s = r(2); }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.PDFNetworkStream = void 0; var s = r(2), n = r(23);
                    var NetworkManager = /** @class */ (function () {
                        function NetworkManager(e, t) {
                            this.url = e;
                            t = t || {};
                            this.isHttp = /^https?:/i.test(e);
                            this.httpHeaders = this.isHttp && t.httpHeaders || {};
                            this.withCredentials = t.withCredentials || !1;
                            this.getXhr = t.getXhr || function NetworkManager_getXhr() { return new XMLHttpRequest; };
                            this.currXhrId = 0;
                            this.pendingRequests = Object.create(null);
                        }
                        NetworkManager.prototype.requestRange = function (e, t, r) { var s = { begin: e, end: t }; for (var e_198 in r)
                            s[e_198] = r[e_198]; return this.request(s); };
                        NetworkManager.prototype.requestFull = function (e) { return this.request(e); };
                        NetworkManager.prototype.request = function (e) { var t = this.getXhr(), r = this.currXhrId++, s = this.pendingRequests[r] = { xhr: t }; t.open("GET", this.url); t.withCredentials = this.withCredentials; for (var e_199 in this.httpHeaders) {
                            var r_77 = this.httpHeaders[e_199];
                            void 0 !== r_77 && t.setRequestHeader(e_199, r_77);
                        } if (this.isHttp && "begin" in e && "end" in e) {
                            t.setRequestHeader("Range", "bytes=" + e.begin + "-" + (e.end - 1));
                            s.expectedStatus = 206;
                        }
                        else
                            s.expectedStatus = 200; t.responseType = "arraybuffer"; e.onError && (t.onerror = function (r) { e.onError(t.status); }); t.onreadystatechange = this.onStateChange.bind(this, r); t.onprogress = this.onProgress.bind(this, r); s.onHeadersReceived = e.onHeadersReceived; s.onDone = e.onDone; s.onError = e.onError; s.onProgress = e.onProgress; t.send(null); return r; };
                        NetworkManager.prototype.onProgress = function (e, t) { var r = this.pendingRequests[e]; r && r.onProgress && r.onProgress(t); };
                        NetworkManager.prototype.onStateChange = function (e, t) { var r = this.pendingRequests[e]; if (!r)
                            return; var n = r.xhr; if (n.readyState >= 2 && r.onHeadersReceived) {
                            r.onHeadersReceived();
                            delete r.onHeadersReceived;
                        } if (4 !== n.readyState)
                            return; if (!(e in this.pendingRequests))
                            return; delete this.pendingRequests[e]; if (0 === n.status && this.isHttp) {
                            r.onError && r.onError(n.status);
                            return;
                        } var a = n.status || 200; if (!(200 === a && 206 === r.expectedStatus) && a !== r.expectedStatus) {
                            r.onError && r.onError(n.status);
                            return;
                        } var i = function getArrayBuffer(e) { var t = e.response; return "string" != typeof t ? t : (0, s.stringToBytes)(t).buffer; }(n); if (206 === a) {
                            var e_200 = n.getResponseHeader("Content-Range"), t_95 = /bytes (\d+)-(\d+)\/(\d+)/.exec(e_200);
                            r.onDone({ begin: parseInt(t_95[1], 10), chunk: i });
                        }
                        else
                            i ? r.onDone({ begin: 0, chunk: i }) : r.onError && r.onError(n.status); };
                        NetworkManager.prototype.getRequestXhr = function (e) { return this.pendingRequests[e].xhr; };
                        NetworkManager.prototype.isPendingRequest = function (e) { return e in this.pendingRequests; };
                        NetworkManager.prototype.abortRequest = function (e) { var t = this.pendingRequests[e].xhr; delete this.pendingRequests[e]; t.abort(); };
                        return NetworkManager;
                    }());  t.PDFNetworkStream = /** @class */ (function () {
                    function PDFNetworkStream(e) {
                        this._source = e;
                        this._manager = new NetworkManager(e.url, { httpHeaders: e.httpHeaders, withCredentials: e.withCredentials });
                        this._rangeChunkSize = e.rangeChunkSize;
                        this._fullRequestReader = null;
                        this._rangeRequestReaders = [];
                    }
                    PDFNetworkStream.prototype._onRangeRequestReaderClosed = function (e) { var t = this._rangeRequestReaders.indexOf(e); t >= 0 && this._rangeRequestReaders.splice(t, 1); };
                    PDFNetworkStream.prototype.getFullReader = function () { (0, s.assert)(!this._fullRequestReader, "PDFNetworkStream.getFullReader can only be called once."); this._fullRequestReader = new PDFNetworkStreamFullRequestReader(this._manager, this._source); return this._fullRequestReader; };
                    PDFNetworkStream.prototype.getRangeReader = function (e, t) { var r = new PDFNetworkStreamRangeRequestReader(this._manager, e, t); r.onClosed = this._onRangeRequestReaderClosed.bind(this); this._rangeRequestReaders.push(r); return r; };
                    PDFNetworkStream.prototype.cancelAllRequests = function (e) {
                        var e_201, _a;
                        this._fullRequestReader && this._fullRequestReader.cancel(e);
                        try {
                            for (var _b = __values(this._rangeRequestReaders.slice(0)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var t_96 = _c.value;
                                t_96.cancel(e);
                            }
                        }
                        catch (e_201_1) { e_201 = { error: e_201_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_201) throw e_201.error; }
                        }
                    };
                    return PDFNetworkStream;
                }());
                    var PDFNetworkStreamFullRequestReader = /** @class */ (function () {
                        function PDFNetworkStreamFullRequestReader(e, t) {
                            this._manager = e;
                            var r = { onHeadersReceived: this._onHeadersReceived.bind(this), onDone: this._onDone.bind(this), onError: this._onError.bind(this), onProgress: this._onProgress.bind(this) };
                            this._url = t.url;
                            this._fullRequestId = e.requestFull(r);
                            this._headersReceivedCapability = (0, s.createPromiseCapability)();
                            this._disableRange = t.disableRange || !1;
                            this._contentLength = t.length;
                            this._rangeChunkSize = t.rangeChunkSize;
                            this._rangeChunkSize || this._disableRange || (this._disableRange = !0);
                            this._isStreamingSupported = !1;
                            this._isRangeSupported = !1;
                            this._cachedChunks = [];
                            this._requests = [];
                            this._done = !1;
                            this._storedError = void 0;
                            this._filename = null;
                            this.onProgress = null;
                        }
                        PDFNetworkStreamFullRequestReader.prototype._onHeadersReceived = function () { var e = this._fullRequestId, t = this._manager.getRequestXhr(e), getResponseHeader = function (e) { return t.getResponseHeader(e); }, _a = (0, n.validateRangeRequestCapabilities)({ getResponseHeader: getResponseHeader, isHttp: this._manager.isHttp, rangeChunkSize: this._rangeChunkSize, disableRange: this._disableRange }), r = _a.allowRangeRequests, s = _a.suggestedLength; r && (this._isRangeSupported = !0); this._contentLength = s || this._contentLength; this._filename = (0, n.extractFilenameFromHeader)(getResponseHeader); this._isRangeSupported && this._manager.abortRequest(e); this._headersReceivedCapability.resolve(); };
                        PDFNetworkStreamFullRequestReader.prototype._onDone = function (e) {
                            var e_202, _a;
                            if (e)
                                if (this._requests.length > 0) {
                                    this._requests.shift().resolve({ value: e.chunk, done: !1 });
                                }
                                else
                                    this._cachedChunks.push(e.chunk);
                            this._done = !0;
                            if (!(this._cachedChunks.length > 0)) {
                                try {
                                    for (var _b = __values(this._requests), _c = _b.next(); !_c.done; _c = _b.next()) {
                                        var e_203 = _c.value;
                                        e_203.resolve({ value: void 0, done: !0 });
                                    }
                                }
                                catch (e_202_1) { e_202 = { error: e_202_1 }; }
                                finally {
                                    try {
                                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                    }
                                    finally { if (e_202) throw e_202.error; }
                                }
                                this._requests.length = 0;
                            }
                        };
                        PDFNetworkStreamFullRequestReader.prototype._onError = function (e) {
                            var e_204, _a;
                            var t = this._url, r = (0, n.createResponseStatusError)(e, t);
                            this._storedError = r;
                            this._headersReceivedCapability.reject(r);
                            try {
                                for (var _b = __values(this._requests), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var e_205 = _c.value;
                                    e_205.reject(r);
                                }
                            }
                            catch (e_204_1) { e_204 = { error: e_204_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_204) throw e_204.error; }
                            }
                            this._requests.length = 0;
                            this._cachedChunks.length = 0;
                        };
                        PDFNetworkStreamFullRequestReader.prototype._onProgress = function (e) { this.onProgress && this.onProgress({ loaded: e.loaded, total: e.lengthComputable ? e.total : this._contentLength }); };
                        Object.defineProperty(PDFNetworkStreamFullRequestReader.prototype, "filename", {
                            get: function () { return this._filename; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFNetworkStreamFullRequestReader.prototype, "isRangeSupported", {
                            get: function () { return this._isRangeSupported; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFNetworkStreamFullRequestReader.prototype, "isStreamingSupported", {
                            get: function () { return this._isStreamingSupported; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFNetworkStreamFullRequestReader.prototype, "contentLength", {
                            get: function () { return this._contentLength; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFNetworkStreamFullRequestReader.prototype, "headersReady", {
                            get: function () { return this._headersReceivedCapability.promise; },
                            enumerable: false,
                            configurable: true
                        });
                        PDFNetworkStreamFullRequestReader.prototype.read = function () {
                            return __awaiter(this, void 0, void 0, function () { var e; return __generator(this, function (_a) {
                                if (this._storedError)
                                    throw this._storedError;
                                if (this._cachedChunks.length > 0) {
                                    return [2 /*return*/, { value: this._cachedChunks.shift(), done: !1 }];
                                }
                                if (this._done)
                                    return [2 /*return*/, { value: void 0, done: !0 }];
                                e = (0, s.createPromiseCapability)();
                                this._requests.push(e);
                                return [2 /*return*/, e.promise];
                            }); });
                        };
                        PDFNetworkStreamFullRequestReader.prototype.cancel = function (e) {
                            var e_206, _a;
                            this._done = !0;
                            this._headersReceivedCapability.reject(e);
                            try {
                                for (var _b = __values(this._requests), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var e_207 = _c.value;
                                    e_207.resolve({ value: void 0, done: !0 });
                                }
                            }
                            catch (e_206_1) { e_206 = { error: e_206_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_206) throw e_206.error; }
                            }
                            this._requests.length = 0;
                            this._manager.isPendingRequest(this._fullRequestId) && this._manager.abortRequest(this._fullRequestId);
                            this._fullRequestReader = null;
                        };
                        return PDFNetworkStreamFullRequestReader;
                    }()); 
                    var PDFNetworkStreamRangeRequestReader = /** @class */ (function () {
                        function PDFNetworkStreamRangeRequestReader(e, t, r) {
                            this._manager = e;
                            var s = { onDone: this._onDone.bind(this), onProgress: this._onProgress.bind(this) };
                            this._requestId = e.requestRange(t, r, s);
                            this._requests = [];
                            this._queuedChunk = null;
                            this._done = !1;
                            this.onProgress = null;
                            this.onClosed = null;
                        }
                        PDFNetworkStreamRangeRequestReader.prototype._close = function () { this.onClosed && this.onClosed(this); };
                        PDFNetworkStreamRangeRequestReader.prototype._onDone = function (e) {
                            var e_208, _a;
                            var t = e.chunk;
                            if (this._requests.length > 0) {
                                this._requests.shift().resolve({ value: t, done: !1 });
                            }
                            else
                                this._queuedChunk = t;
                            this._done = !0;
                            try {
                                for (var _b = __values(this._requests), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var e_209 = _c.value;
                                    e_209.resolve({ value: void 0, done: !0 });
                                }
                            }
                            catch (e_208_1) { e_208 = { error: e_208_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_208) throw e_208.error; }
                            }
                            this._requests.length = 0;
                            this._close();
                        };
                        PDFNetworkStreamRangeRequestReader.prototype._onProgress = function (e) { !this.isStreamingSupported && this.onProgress && this.onProgress({ loaded: e.loaded }); };
                        Object.defineProperty(PDFNetworkStreamRangeRequestReader.prototype, "isStreamingSupported", {
                            get: function () { return !1; },
                            enumerable: false,
                            configurable: true
                        });
                        PDFNetworkStreamRangeRequestReader.prototype.read = function () {
                            return __awaiter(this, void 0, void 0, function () { var e_210, e; return __generator(this, function (_a) {
                                if (null !== this._queuedChunk) {
                                    e_210 = this._queuedChunk;
                                    this._queuedChunk = null;
                                    return [2 /*return*/, { value: e_210, done: !1 }];
                                }
                                if (this._done)
                                    return [2 /*return*/, { value: void 0, done: !0 }];
                                e = (0, s.createPromiseCapability)();
                                this._requests.push(e);
                                return [2 /*return*/, e.promise];
                            }); });
                        };
                        PDFNetworkStreamRangeRequestReader.prototype.cancel = function (e) {
                            var e_211, _a;
                            this._done = !0;
                            try {
                                for (var _b = __values(this._requests), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var e_212 = _c.value;
                                    e_212.resolve({ value: void 0, done: !0 });
                                }
                            }
                            catch (e_211_1) { e_211 = { error: e_211_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_211) throw e_211.error; }
                            }
                            this._requests.length = 0;
                            this._manager.isPendingRequest(this._requestId) && this._manager.abortRequest(this._requestId);
                            this._close();
                        };
                        return PDFNetworkStreamRangeRequestReader;
                    }());  }, function (e, t, r) { Object.defineProperty(t, "__esModule", { value: !0 }); t.PDFFetchStream = void 0; var s = r(2), n = r(23); function createFetchOptions(e, t, r) { return { method: "GET", headers: e, signal: r === null || r === void 0 ? void 0 : r.signal, mode: "cors", credentials: t ? "include" : "same-origin", redirect: "follow" }; } function createHeaders(e) { var t = new Headers; for (var r_78 in e) {
                    var s_58 = e[r_78];
                    void 0 !== s_58 && t.append(r_78, s_58);
                } return t; } t.PDFFetchStream = /** @class */ (function () {
                    function PDFFetchStream(e) {
                        this.source = e;
                        this.isHttp = /^https?:/i.test(e.url);
                        this.httpHeaders = this.isHttp && e.httpHeaders || {};
                        this._fullRequestReader = null;
                        this._rangeRequestReaders = [];
                    }
                    Object.defineProperty(PDFFetchStream.prototype, "_progressiveDataLength", {
                        get: function () { var _a, _b; return (_b = (_a = this._fullRequestReader) === null || _a === void 0 ? void 0 : _a._loaded) !== null && _b !== void 0 ? _b : 0; },
                        enumerable: false,
                        configurable: true
                    });
                    PDFFetchStream.prototype.getFullReader = function () { (0, s.assert)(!this._fullRequestReader, "PDFFetchStream.getFullReader can only be called once."); this._fullRequestReader = new PDFFetchStreamReader(this); return this._fullRequestReader; };
                    PDFFetchStream.prototype.getRangeReader = function (e, t) { if (t <= this._progressiveDataLength)
                        return null; var r = new PDFFetchStreamRangeReader(this, e, t); this._rangeRequestReaders.push(r); return r; };
                    PDFFetchStream.prototype.cancelAllRequests = function (e) {
                        var e_213, _a;
                        this._fullRequestReader && this._fullRequestReader.cancel(e);
                        try {
                            for (var _b = __values(this._rangeRequestReaders.slice(0)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var t_97 = _c.value;
                                t_97.cancel(e);
                            }
                        }
                        catch (e_213_1) { e_213 = { error: e_213_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_213) throw e_213.error; }
                        }
                    };
                    return PDFFetchStream;
                }());
                    var PDFFetchStreamReader = /** @class */ (function () {
                        function PDFFetchStreamReader(e) {
                            var _this = this;
                            this._stream = e;
                            this._reader = null;
                            this._loaded = 0;
                            this._filename = null;
                            var t = e.source;
                            this._withCredentials = t.withCredentials || !1;
                            this._contentLength = t.length;
                            this._headersCapability = (0, s.createPromiseCapability)();
                            this._disableRange = t.disableRange || !1;
                            this._rangeChunkSize = t.rangeChunkSize;
                            this._rangeChunkSize || this._disableRange || (this._disableRange = !0);
                            "undefined" != typeof AbortController && (this._abortController = new AbortController);
                            this._isStreamingSupported = !t.disableStream;
                            this._isRangeSupported = !t.disableRange;
                            this._headers = createHeaders(this._stream.httpHeaders);
                            var r = t.url;
                            fetch(r, createFetchOptions(this._headers, this._withCredentials, this._abortController)).then((function (e) { if (!(0, n.validateResponseStatus)(e.status))
                                throw (0, n.createResponseStatusError)(e.status, r); _this._reader = e.body.getReader(); _this._headersCapability.resolve(); var getResponseHeader = function (t) { return e.headers.get(t); }, _a = (0, n.validateRangeRequestCapabilities)({ getResponseHeader: getResponseHeader, isHttp: _this._stream.isHttp, rangeChunkSize: _this._rangeChunkSize, disableRange: _this._disableRange }), t = _a.allowRangeRequests, a = _a.suggestedLength; _this._isRangeSupported = t; _this._contentLength = a || _this._contentLength; _this._filename = (0, n.extractFilenameFromHeader)(getResponseHeader); !_this._isStreamingSupported && _this._isRangeSupported && _this.cancel(new s.AbortException("Streaming is disabled.")); })).catch(this._headersCapability.reject);
                            this.onProgress = null;
                        }
                        Object.defineProperty(PDFFetchStreamReader.prototype, "headersReady", {
                            get: function () { return this._headersCapability.promise; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFFetchStreamReader.prototype, "filename", {
                            get: function () { return this._filename; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFFetchStreamReader.prototype, "contentLength", {
                            get: function () { return this._contentLength; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFFetchStreamReader.prototype, "isRangeSupported", {
                            get: function () { return this._isRangeSupported; },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(PDFFetchStreamReader.prototype, "isStreamingSupported", {
                            get: function () { return this._isStreamingSupported; },
                            enumerable: false,
                            configurable: true
                        });
                        PDFFetchStreamReader.prototype.read = function () {
                            return __awaiter(this, void 0, void 0, function () { var _a, e, t; return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, this._headersCapability.promise];
                                    case 1:
                                        _b.sent();
                                        return [4 /*yield*/, this._reader.read()];
                                    case 2:
                                        _a = _b.sent(), e = _a.value, t = _a.done;
                                        if (t)
                                            return [2 /*return*/, { value: e, done: t }];
                                        this._loaded += e.byteLength;
                                        this.onProgress && this.onProgress({ loaded: this._loaded, total: this._contentLength });
                                        return [2 /*return*/, { value: new Uint8Array(e).buffer, done: !1 }];
                                }
                            }); });
                        };
                        PDFFetchStreamReader.prototype.cancel = function (e) { this._reader && this._reader.cancel(e); this._abortController && this._abortController.abort(); };
                        return PDFFetchStreamReader;
                    }()); 
                    var PDFFetchStreamRangeReader = /** @class */ (function () {
                        function PDFFetchStreamRangeReader(e, t, r) {
                            var _this = this;
                            this._stream = e;
                            this._reader = null;
                            this._loaded = 0;
                            var a = e.source;
                            this._withCredentials = a.withCredentials || !1;
                            this._readCapability = (0, s.createPromiseCapability)();
                            this._isStreamingSupported = !a.disableStream;
                            "undefined" != typeof AbortController && (this._abortController = new AbortController);
                            this._headers = createHeaders(this._stream.httpHeaders);
                            this._headers.append("Range", "bytes=" + t + "-" + (r - 1));
                            var i = a.url;
                            fetch(i, createFetchOptions(this._headers, this._withCredentials, this._abortController)).then((function (e) { if (!(0, n.validateResponseStatus)(e.status))
                                throw (0, n.createResponseStatusError)(e.status, i); _this._readCapability.resolve(); _this._reader = e.body.getReader(); })).catch((function (e) { if ("AbortError" !== (e === null || e === void 0 ? void 0 : e.name))
                                throw e; }));
                            this.onProgress = null;
                        }
                        Object.defineProperty(PDFFetchStreamRangeReader.prototype, "isStreamingSupported", {
                            get: function () { return this._isStreamingSupported; },
                            enumerable: false,
                            configurable: true
                        });
                        PDFFetchStreamRangeReader.prototype.read = function () {
                            return __awaiter(this, void 0, void 0, function () { var _a, e, t; return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, this._readCapability.promise];
                                    case 1:
                                        _b.sent();
                                        return [4 /*yield*/, this._reader.read()];
                                    case 2:
                                        _a = _b.sent(), e = _a.value, t = _a.done;
                                        if (t)
                                            return [2 /*return*/, { value: e, done: t }];
                                        this._loaded += e.byteLength;
                                        this.onProgress && this.onProgress({ loaded: this._loaded });
                                        return [2 /*return*/, { value: new Uint8Array(e).buffer, done: !1 }];
                                }
                            }); });
                        };
                        PDFFetchStreamRangeReader.prototype.cancel = function (e) { this._reader && this._reader.cancel(e); this._abortController && this._abortController.abort(); };
                        return PDFFetchStreamRangeReader;
                    }());  }], __webpack_module_cache__ = {};
            function __w_pdfjs_require__(e) { var t = __webpack_module_cache__[e]; if (void 0 !== t)
                return t.exports; var r = __webpack_module_cache__[e] = { exports: {} }; __webpack_modules__[e](r, r.exports, __w_pdfjs_require__); return r.exports; }
            var __webpack_exports__ = {};
            (function () { var e = __webpack_exports__; Object.defineProperty(e, "__esModule", { value: !0 }); Object.defineProperty(e, "addLinkAttributes", { enumerable: !0, get: function () { return t.addLinkAttributes; } }); Object.defineProperty(e, "getFilenameFromUrl", { enumerable: !0, get: function () { return t.getFilenameFromUrl; } }); Object.defineProperty(e, "getPdfFilenameFromUrl", { enumerable: !0, get: function () { return t.getPdfFilenameFromUrl; } }); Object.defineProperty(e, "getXfaPageViewport", { enumerable: !0, get: function () { return t.getXfaPageViewport; } }); Object.defineProperty(e, "isPdfFile", { enumerable: !0, get: function () { return t.isPdfFile; } }); Object.defineProperty(e, "LinkTarget", { enumerable: !0, get: function () { return t.LinkTarget; } }); Object.defineProperty(e, "loadScript", { enumerable: !0, get: function () { return t.loadScript; } }); Object.defineProperty(e, "PDFDateString", { enumerable: !0, get: function () { return t.PDFDateString; } }); Object.defineProperty(e, "RenderingCancelledException", { enumerable: !0, get: function () { return t.RenderingCancelledException; } }); Object.defineProperty(e, "build", { enumerable: !0, get: function () { return r.build; } }); Object.defineProperty(e, "getDocument", { enumerable: !0, get: function () { return r.getDocument; } }); Object.defineProperty(e, "LoopbackPort", { enumerable: !0, get: function () { return r.LoopbackPort; } }); Object.defineProperty(e, "PDFDataRangeTransport", { enumerable: !0, get: function () { return r.PDFDataRangeTransport; } }); Object.defineProperty(e, "PDFWorker", { enumerable: !0, get: function () { return r.PDFWorker; } }); Object.defineProperty(e, "version", { enumerable: !0, get: function () { return r.version; } }); Object.defineProperty(e, "CMapCompressionType", { enumerable: !0, get: function () { return s.CMapCompressionType; } }); Object.defineProperty(e, "createObjectURL", { enumerable: !0, get: function () { return s.createObjectURL; } }); Object.defineProperty(e, "createPromiseCapability", { enumerable: !0, get: function () { return s.createPromiseCapability; } }); Object.defineProperty(e, "createValidAbsoluteUrl", { enumerable: !0, get: function () { return s.createValidAbsoluteUrl; } }); Object.defineProperty(e, "InvalidPDFException", { enumerable: !0, get: function () { return s.InvalidPDFException; } }); Object.defineProperty(e, "MissingPDFException", { enumerable: !0, get: function () { return s.MissingPDFException; } }); Object.defineProperty(e, "OPS", { enumerable: !0, get: function () { return s.OPS; } }); Object.defineProperty(e, "PasswordResponses", { enumerable: !0, get: function () { return s.PasswordResponses; } }); Object.defineProperty(e, "PermissionFlag", { enumerable: !0, get: function () { return s.PermissionFlag; } }); Object.defineProperty(e, "removeNullCharacters", { enumerable: !0, get: function () { return s.removeNullCharacters; } }); Object.defineProperty(e, "shadow", { enumerable: !0, get: function () { return s.shadow; } }); Object.defineProperty(e, "UnexpectedResponseException", { enumerable: !0, get: function () { return s.UnexpectedResponseException; } }); Object.defineProperty(e, "UNSUPPORTED_FEATURES", { enumerable: !0, get: function () { return s.UNSUPPORTED_FEATURES; } }); Object.defineProperty(e, "Util", { enumerable: !0, get: function () { return s.Util; } }); Object.defineProperty(e, "VerbosityLevel", { enumerable: !0, get: function () { return s.VerbosityLevel; } }); Object.defineProperty(e, "AnnotationLayer", { enumerable: !0, get: function () { return n.AnnotationLayer; } }); Object.defineProperty(e, "GlobalWorkerOptions", { enumerable: !0, get: function () { return a.GlobalWorkerOptions; } }); Object.defineProperty(e, "renderTextLayer", { enumerable: !0, get: function () { return o.renderTextLayer; } }); Object.defineProperty(e, "SVGGraphics", { enumerable: !0, get: function () { return l.SVGGraphics; } }); Object.defineProperty(e, "XfaLayer", { enumerable: !0, get: function () { return c.XfaLayer; } }); var t = __w_pdfjs_require__(1), r = __w_pdfjs_require__(6), s = __w_pdfjs_require__(2), n = __w_pdfjs_require__(17), a = __w_pdfjs_require__(12), i = __w_pdfjs_require__(4), o = __w_pdfjs_require__(19), l = __w_pdfjs_require__(20), c = __w_pdfjs_require__(21); if (i.isNodeJS) {
                var e_214 = __w_pdfjs_require__(22).PDFNodeStream;
                (0, r.setPDFNetworkStreamFactory)((function (t) { return new e_214(t); }));
            }
            else {
                var e_215 = __w_pdfjs_require__(25).PDFNetworkStream, s_59 = __w_pdfjs_require__(26).PDFFetchStream;
                (0, r.setPDFNetworkStreamFactory)((function (r) { return (0, t.isValidFetchUrl)(r.url) ? new s_59(r) : new e_215(r); }));
            } })();
            return __webpack_exports__;
        })(); }));
    }(pdf_min$1, pdf_min$1.exports));
    var pdf_min = /*@__PURE__*/ getDefaultExportFromCjs(pdf_min$1.exports);

    var PdfResourceLoader = /** @class */ (function (_super) {
        __extends(PdfResourceLoader, _super);
        function PdfResourceLoader(_imageCache) {
            var _this = _super.call(this) || this;
            _this._imageCache = _imageCache;
            _this.showItemsQuantity = true;
            return _this;
        }
        PdfResourceLoader.prototype.setUp = function () {
            var vm = this;
            if (vm.loading || !vm.src) {
                return;
            }
            var loadingTask = pdf_min$1.exports.getDocument(vm.src);
            vm.loading = true;
            vm.currentItem = 1;
            loadingTask.promise.then(function (pdf) {
                vm._pdf = pdf;
                vm.totalItem = pdf.numPages;
                vm.loaded = true;
                vm.loadResource();
            }, function (reason) {
                console.error(reason);
            });
        };
        PdfResourceLoader.prototype.loadResource = function () {
            var vm = this;
            if (!vm.loaded) {
                vm._pendingReload = true;
                return;
            }
            vm.loaded = false;
            var url = vm.src;
            var page = vm.currentItem;
            vm._pdf.getPage(page).then(function (pdfPage) {
                vm._page = pdfPage;
                vm.loadImage(url, page, function () {
                    vm.loaded = true;
                    vm.loading = false;
                    if (vm._pendingReload) {
                        vm._pendingReload = false;
                        vm.loadResource();
                    }
                    else {
                        vm.resourceChange.next();
                    }
                });
            });
        };
        PdfResourceLoader.prototype.loadImage = function (src, page, onFinish) {
            var vm = this;
            var cacheimg = vm._imageCache.getImage(src, page);
            if (cacheimg) {
                vm._image = cacheimg;
                onFinish();
                return;
            }
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            var pageVp = vm._page.getViewport({ scale: 2 });
            canvas.width = pageVp.width;
            canvas.height = pageVp.height;
            var renderContext = {
                canvasContext: context,
                viewport: pageVp
            };
            var renderTask = vm._page.render(renderContext);
            renderTask.promise.then(function () {
                canvas.toBlob(function (blob) {
                    var img = new Image();
                    img.onload = onFinish;
                    img.src = URL.createObjectURL(blob);
                    vm._imageCache.saveImage(src, page, img);
                    vm._image = img;
                });
            });
        };
        return PdfResourceLoader;
    }(ResourceLoader));

    var MIN_TOOLTIP_WIDTH_SPACE = 500;
    var ImageViewerComponent = /** @class */ (function () {
        //#endregion
        //#region Lifecycle events
        function ImageViewerComponent(_sanitizer, _renderer, _imageCache, config) {
            this._sanitizer = _sanitizer;
            this._renderer = _renderer;
            this._imageCache = _imageCache;
            this.config = config;
            // dirty state
            this._dirty = true;
            // contains all active buttons
            this._buttons = [];
            // current tool tip (used to track change of tool tip)
            this._currentTooltip = null;
            // cached data when touch events started
            this._touchStartState = {};
            // list of event listener destroyers
            this._listenDestroyList = [];
            this.config = this.extendsDefaultConfig(config);
            this._nextPageButton = new Button(this.config.nextPageButton, this.config.buttonStyle);
            this._beforePageButton = new Button(this.config.beforePageButton, this.config.buttonStyle);
            this._zoomOutButton = new Button(this.config.zoomOutButton, this.config.buttonStyle);
            this._zoomInButton = new Button(this.config.zoomInButton, this.config.buttonStyle);
            this._rotateLeftButton = new Button(this.config.rotateLeftButton, this.config.buttonStyle);
            this._rotateRightButton = new Button(this.config.rotateRightButton, this.config.buttonStyle);
            this._resetButton = new Button(this.config.resetButton, this.config.buttonStyle);
            this._buttons = [
                this._zoomOutButton,
                this._zoomInButton,
                this._rotateLeftButton,
                this._rotateRightButton,
                this._resetButton
            ].filter(function (item) { return item.display; })
                .sort(function (a, b) { return a.sortId - b.sortId; });
        }
        Object.defineProperty(ImageViewerComponent.prototype, "src", {
            get: function () { return this._src; },
            set: function (value) {
                if (value === this._src) {
                    return;
                }
                this._src = value;
                this.setUpResource();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ImageViewerComponent.prototype, "filetype", {
            get: function () { return this._filetype; },
            set: function (value) {
                if (value === this._filetype) {
                    return;
                }
                this._filetype = value;
                this.setUpResource();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ImageViewerComponent.prototype, "width", {
            get: function () { return this._width; },
            set: function (value) {
                if (value === this._width) {
                    return;
                }
                this._width = value;
                if (this._canvas) {
                    this._canvas.width = this._width;
                }
                this.resetImage();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ImageViewerComponent.prototype, "height", {
            get: function () { return this._height; },
            set: function (value) {
                if (value === this._height) {
                    return;
                }
                this._height = value;
                if (this._canvas) {
                    this._canvas.height = this._height;
                }
                this.resetImage();
            },
            enumerable: false,
            configurable: true
        });
        ImageViewerComponent.prototype.ngAfterViewInit = function () {
            var _this = this;
            this._canvas = this.canvasRef.nativeElement;
            this._context = this._canvas.getContext('2d');
            // setting canvas dimention
            this._canvas.width = this.width || this.config.width;
            this._canvas.height = this.height || this.config.height;
            // setting buttons actions
            this._nextPageButton.onClick = function (evt) { _this.nextPage(); return false; };
            this._beforePageButton.onClick = function (evt) { _this.previousPage(); return false; };
            this._zoomOutButton.onClick = function (evt) { _this.zoomOut(); return false; };
            this._zoomInButton.onClick = function (evt) { _this.zoomIn(); return false; };
            this._rotateLeftButton.onClick = function (evt) { _this.rotateLeft(); return false; };
            this._rotateRightButton.onClick = function (evt) { _this.rotateRight(); return false; };
            this._resetButton.onClick = function (evt) { _this.resetImage(); return false; };
            // register event listeners
            this.addEventListeners();
            this.updateCanvas();
        };
        ImageViewerComponent.prototype.ngOnDestroy = function () {
            // unregiste event listeners
            this._listenDestroyList.forEach(function (listenDestroy) {
                if (typeof listenDestroy === 'function') {
                    listenDestroy();
                }
            });
            this._imageCache.disposeCache();
        };
        ImageViewerComponent.prototype.setUpResource = function () {
            var _this = this;
            if (this.isImage(this.src) && (!this._resource || !(this._resource instanceof ImageResourceLoader))) {
                if (this._resourceChangeSub) {
                    this._resourceChangeSub.unsubscribe();
                }
                if (!this._imageResource) {
                    this._imageResource = new ImageResourceLoader();
                }
                this._resource = this._imageResource;
            }
            else if (this.isPdf(this.src) && (!this._resource || !(this._resource instanceof PdfResourceLoader))) {
                if (this._resourceChangeSub) {
                    this._resourceChangeSub.unsubscribe();
                }
                if (!this._pdfResource) {
                    this._pdfResource = new PdfResourceLoader(this._imageCache);
                }
                this._resource = this._pdfResource;
            }
            if (this._resource) {
                this._resource.src = this.src instanceof File ? URL.createObjectURL(this.src) : this.src;
                this._resourceChangeSub = this._resource.onResourceChange().subscribe(function () {
                    _this.updateCanvas();
                    if (_this.src instanceof File) {
                        URL.revokeObjectURL(_this._resource.src);
                    }
                });
                this._resource.setUp();
                this.resetImage();
                if (this._context) {
                    this.updateCanvas();
                }
            }
        };
        //#endregion
        //#region Touch events
        ImageViewerComponent.prototype.onTap = function (evt) {
            var position = { x: evt.clientX, y: evt.clientY };
            var activeElement = this.getUIElement(this.screenToCanvasCentre(position));
            if (activeElement !== null) {
                activeElement.onClick(evt);
            }
        };
        ImageViewerComponent.prototype.onTouchEnd = function () {
            this._touchStartState.viewport = undefined;
            this._touchStartState.scale = undefined;
            this._touchStartState.rotate = undefined;
        };
        ImageViewerComponent.prototype.processTouchEvent = function (evt) {
            // process pan
            if (!this._touchStartState.viewport) {
                this._touchStartState.viewport = Object.assign({}, this._resource.viewport);
            }
            var viewport = this._resource.viewport;
            viewport.x = this._touchStartState.viewport.x + evt.deltaX;
            viewport.y = this._touchStartState.viewport.y + evt.deltaY;
            // process pinch in/out
            if (!this._touchStartState.scale) {
                this._touchStartState.scale = this._resource.viewport.scale;
            }
            var newScale = this._touchStartState.scale * evt.scale;
            viewport.scale = newScale > this._resource.maxScale ? this._resource.maxScale :
                newScale < this._resource.minScale ? this._resource.minScale : newScale;
            // process rotate left/right
            if (!this._touchStartState.rotate) {
                this._touchStartState.rotate = { rotation: viewport.rotation, startRotate: evt.rotation };
            }
            if (evt.rotation !== 0) {
                var newAngle = this._touchStartState.rotate.rotation + evt.rotation - this._touchStartState.rotate.startRotate;
                viewport.rotation = this.config.rotateStepper ? toSquareAngle(newAngle) : newAngle;
            }
            this._dirty = true;
        };
        //#endregion
        //#region Mouse Events
        ImageViewerComponent.prototype.addEventListeners = function () {
            var _this = this;
            // zooming
            this._listenDestroyList.push(this._renderer.listen(this._canvas, 'DOMMouseScroll', function (evt) { return _this.onMouseWheel(evt); }));
            this._listenDestroyList.push(this._renderer.listen(this._canvas, 'mousewheel', function (evt) { return _this.onMouseWheel(evt); }));
            // show tooltip when mouseover it
            this._listenDestroyList.push(this._renderer.listen(this._canvas, 'mousemove', function (evt) { return _this.checkTooltipActivation(_this.screenToCanvasCentre({ x: evt.clientX, y: evt.clientY })); }));
        };
        ImageViewerComponent.prototype.onMouseWheel = function (evt) {
            if (!evt) {
                evt = event;
            }
            evt.preventDefault();
            if (evt.detail < 0 || evt.wheelDelta > 0) { // up -> larger
                this.zoomIn();
            }
            else { // down -> smaller
                this.zoomOut();
            }
        };
        ImageViewerComponent.prototype.checkTooltipActivation = function (pos) {
            this.getUIElements().forEach(function (x) { return x.hover = false; });
            var activeElement = this.getUIElement(pos);
            var oldToolTip = this._currentTooltip;
            if (activeElement !== null) {
                if (typeof activeElement.hover !== 'undefined') {
                    activeElement.hover = true;
                }
                if (typeof activeElement.tooltip !== 'undefined') {
                    this._currentTooltip = activeElement.tooltip;
                }
            }
            if (oldToolTip !== this._currentTooltip) {
                this._dirty = true;
            }
        };
        //#endregion
        //#region Button Actions
        ImageViewerComponent.prototype.nextPage = function () {
            if (!this._resource) {
                return;
            }
            if (this._resource.currentItem >= this._resource.totalItem) {
                return;
            }
            if (this._resource.currentItem < 1) {
                this._resource.currentItem = 0;
            }
            this._resource.currentItem++;
            this._resource.loadResource();
            this._dirty = true;
        };
        ImageViewerComponent.prototype.previousPage = function () {
            if (!this._resource) {
                return;
            }
            if (this._resource.currentItem <= 1) {
                return;
            }
            if (this._resource.currentItem > this._resource.totalItem) {
                this._resource.currentItem = this._resource.totalItem + 1;
            }
            this._resource.currentItem--;
            this._resource.loadResource();
            this._dirty = true;
        };
        ImageViewerComponent.prototype.zoomIn = function () {
            if (!this._resource) {
                return;
            }
            var newScale = this._resource.viewport.scale * (1 + this.config.scaleStep);
            this._resource.viewport.scale = newScale > this._resource.maxScale ? this._resource.maxScale : newScale;
            this._dirty = true;
        };
        ImageViewerComponent.prototype.zoomOut = function () {
            if (!this._resource) {
                return;
            }
            var newScale = this._resource.viewport.scale * (1 - this.config.scaleStep);
            this._resource.viewport.scale = newScale < this._resource.minScale ? this._resource.minScale : newScale;
            this._dirty = true;
        };
        ImageViewerComponent.prototype.rotateLeft = function () {
            if (!this._resource) {
                return;
            }
            var viewport = this._resource.viewport;
            viewport.rotation = viewport.rotation === 0 ? 270 : viewport.rotation - 90;
            this._dirty = true;
        };
        ImageViewerComponent.prototype.rotateRight = function () {
            if (!this._resource) {
                return;
            }
            var viewport = this._resource.viewport;
            viewport.rotation = viewport.rotation === 270 ? 0 : viewport.rotation + 90;
            this._dirty = true;
        };
        ImageViewerComponent.prototype.resetImage = function () {
            if (!this._resource) {
                return;
            }
            this._resource.resetViewport(this._canvas);
            this._dirty = true;
        };
        //#endregion
        //#region Draw Canvas
        ImageViewerComponent.prototype.updateCanvas = function () {
            this.resetImage();
            // start new render loop
            this.render();
        };
        ImageViewerComponent.prototype.render = function () {
            var _this = this;
            var vm = this;
            // only re-render if dirty
            if (this._dirty && this._resource) {
                this._dirty = false;
                var ctx_1 = this._context;
                ctx_1.save();
                this._resource.draw(ctx_1, this.config, this._canvas, function () {
                    ctx_1.restore();
                    if (vm._resource.loaded) {
                        // draw buttons
                        _this.drawButtons(ctx_1);
                        // draw paginator
                        if (_this._resource.showItemsQuantity) {
                            _this.drawPaginator(ctx_1);
                        }
                    }
                });
            }
            requestAnimationFrame(function () { return _this.render(); });
        };
        ImageViewerComponent.prototype.drawButtons = function (ctx) {
            var padding = this.config.tooltips.padding;
            var radius = this.config.tooltips.radius;
            var gap = 2 * radius + padding;
            var x = this._canvas.width - radius - padding;
            var y = this._canvas.height - radius - padding;
            // draw buttons
            for (var i = 0; i < this._buttons.length; i++) {
                this._buttons[i].draw(ctx, x, y - gap * i, radius);
            }
            // draw tooltip
            if (this._currentTooltip !== null && this._canvas.width > MIN_TOOLTIP_WIDTH_SPACE) {
                ctx.save();
                var fontSize = radius;
                ctx.font = fontSize + 'px sans-serif';
                // calculate position
                var textSize = ctx.measureText(this._currentTooltip).width, rectWidth = textSize + padding, rectHeight = fontSize * 0.70 + padding, rectX = this._canvas.width
                    - (2 * radius + 2 * padding) // buttons
                    - rectWidth, rectY = this._canvas.height - rectHeight - padding, textX = rectX + 0.5 * padding, textY = this._canvas.height - 1.5 * padding;
                ctx.globalAlpha = this.config.tooltips.bgAlpha;
                ctx.fillStyle = this.config.tooltips.bgStyle;
                this.drawRoundRectangle(ctx, rectX, rectY, rectWidth, rectHeight, 8, true, false);
                ctx.globalAlpha = this.config.tooltips.textAlpha;
                ctx.fillStyle = this.config.tooltips.textStyle;
                ctx.fillText(this._currentTooltip, textX, textY);
                ctx.restore();
            }
        };
        ImageViewerComponent.prototype.drawPaginator = function (ctx) {
            var padding = this.config.tooltips.padding;
            var radius = this.config.tooltips.radius;
            var labelWidth = 50;
            var x1 = (this._canvas.width - labelWidth) / 2 - radius - padding; // PrevPageButton
            var x2 = this._canvas.width / 2; // Label
            var x3 = (this._canvas.width + labelWidth) / 2 + radius + padding; // NextPageButton
            var y = this._canvas.height - radius - padding;
            var label = this._resource.currentItem + '/' + this._resource.totalItem;
            var fontSize = 25;
            ctx.save();
            this._beforePageButton.draw(ctx, x1, y, radius);
            this._nextPageButton.draw(ctx, x3, y, radius);
            ctx.restore();
            ctx.save();
            ctx.font = fontSize + 'px Verdana';
            ctx.textAlign = 'center';
            ctx.fillText(label, x2, this._canvas.height - padding - fontSize / 2, labelWidth);
            ctx.restore();
        };
        ImageViewerComponent.prototype.drawRoundRectangle = function (ctx, x, y, width, height, radius, fill, stroke) {
            radius = (typeof radius === 'number') ? radius : 5;
            fill = (typeof fill === 'boolean') ? fill : true; // fill = default
            stroke = (typeof stroke === 'boolean') ? stroke : false;
            // draw round rectangle
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            if (fill) {
                ctx.fill();
            }
            if (stroke) {
                ctx.stroke();
            }
        };
        //#endregion
        //#region Utils
        ImageViewerComponent.prototype.extendsDefaultConfig = function (cfg) {
            var defaultCfg = IMAGEVIEWER_CONFIG_DEFAULT;
            var localCfg = Object.assign({}, defaultCfg, cfg);
            if (cfg.buttonStyle) {
                localCfg.buttonStyle = Object.assign(defaultCfg.buttonStyle, cfg.buttonStyle);
            }
            if (cfg.tooltips) {
                localCfg.tooltips = Object.assign(defaultCfg.tooltips, cfg.tooltips);
            }
            if (cfg.nextPageButton) {
                localCfg.nextPageButton = Object.assign(defaultCfg.nextPageButton, cfg.nextPageButton);
            }
            if (cfg.beforePageButton) {
                localCfg.beforePageButton = Object.assign(defaultCfg.beforePageButton, cfg.beforePageButton);
            }
            if (cfg.zoomOutButton) {
                localCfg.zoomOutButton = Object.assign(defaultCfg.zoomOutButton, cfg.zoomOutButton);
            }
            if (cfg.zoomOutButton) {
                localCfg.zoomOutButton = Object.assign(defaultCfg.zoomOutButton, cfg.zoomOutButton);
            }
            if (cfg.zoomInButton) {
                localCfg.zoomInButton = Object.assign(defaultCfg.zoomInButton, cfg.zoomInButton);
            }
            if (cfg.rotateLeftButton) {
                localCfg.rotateLeftButton = Object.assign(defaultCfg.rotateLeftButton, cfg.rotateLeftButton);
            }
            if (cfg.rotateRightButton) {
                localCfg.rotateRightButton = Object.assign(defaultCfg.rotateRightButton, cfg.rotateRightButton);
            }
            if (cfg.resetButton) {
                localCfg.resetButton = Object.assign(defaultCfg.resetButton, cfg.resetButton);
            }
            return localCfg;
        };
        ImageViewerComponent.prototype.screenToCanvasCentre = function (pos) {
            var rect = this._canvas.getBoundingClientRect();
            return { x: pos.x - rect.left, y: pos.y - rect.top };
        };
        ImageViewerComponent.prototype.getUIElements = function () {
            var hoverElements = this._buttons.slice();
            hoverElements.push(this._nextPageButton);
            hoverElements.push(this._beforePageButton);
            return hoverElements;
        };
        ImageViewerComponent.prototype.getUIElement = function (pos) {
            var activeUIElement = this.getUIElements().filter(function (uiElement) {
                return uiElement.isWithinBounds(pos.x, pos.y);
            });
            return (activeUIElement.length > 0) ? activeUIElement[0] : null;
        };
        ImageViewerComponent.prototype.isImage = function (file) {
            if (this._filetype && this._filetype.toLowerCase() === 'image') {
                return true;
            }
            return testFile(file, '\\.(png|jpg|jpeg|gif)|image/png');
        };
        ImageViewerComponent.prototype.isPdf = function (file) {
            if (this._filetype && this._filetype.toLowerCase() === 'pdf') {
                return true;
            }
            return testFile(file, '\\.(pdf)|application/pdf');
        };
        return ImageViewerComponent;
    }());
    ImageViewerComponent.decorators = [
        { type: i0.Component, args: [{
                    selector: 'ngx-imageviewer',
                    template: "\n    <canvas #imageContainer [width]=\"width\" [height]=\"height\"\n      (click)=\"onTap($event)\" (pinchin)=\"processTouchEvent($event)\" (pinchout)=\"processTouchEvent($event)\"\n      (panmove)=\"processTouchEvent($event)\" (panend)=\"onTouchEnd()\" (rotatemove)=\"processTouchEvent($event)\"\n      (rotateend)=\"onTouchEnd()\">\n    </canvas>\n  ",
                    styles: ["\n    :host { display: block }\n    :host canvas { margin: 0 auto; display: block }\n    [hidden] { display: none !important }\n  "]
                },] }
    ];
    ImageViewerComponent.ctorParameters = function () { return [
        { type: platformBrowser.DomSanitizer },
        { type: i0.Renderer2 },
        { type: ImageCacheService },
        { type: ImageViewerConfig, decorators: [{ type: i0.Inject, args: [IMAGEVIEWER_CONFIG,] }] }
    ]; };
    ImageViewerComponent.propDecorators = {
        src: [{ type: i0.Input, args: ['src',] }],
        filetype: [{ type: i0.Input, args: ['filetype',] }],
        width: [{ type: i0.Input, args: ['width',] }],
        height: [{ type: i0.Input, args: ['height',] }],
        canvasRef: [{ type: i0.ViewChild, args: ['imageContainer', { static: false },] }]
    };
    function testFile(file, regexTest) {
        if (!file) {
            return false;
        }
        var name = file instanceof File ? file.name : file;
        return name.toLowerCase().match(regexTest) !== null;
    }

    var ɵ0 = IMAGEVIEWER_CONFIG_DEFAULT;
    var ImageViewerModule = /** @class */ (function () {
        function ImageViewerModule() {
        }
        return ImageViewerModule;
    }());
    ImageViewerModule.decorators = [
        { type: i0.NgModule, args: [{
                    providers: [{ provide: IMAGEVIEWER_CONFIG, useValue: ɵ0 }],
                    declarations: [ImageViewerComponent],
                    exports: [ImageViewerComponent],
                },] }
    ];

    /*
     * Public API Surface of ngx-imageviewer
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.IMAGEVIEWER_CONFIG = IMAGEVIEWER_CONFIG;
    exports.ImageViewerComponent = ImageViewerComponent;
    exports.ImageViewerConfig = ImageViewerConfig;
    exports.ImageViewerModule = ImageViewerModule;
    exports.createButtonConfig = createButtonConfig;
    exports["ɵa"] = IMAGEVIEWER_CONFIG_DEFAULT;
    exports["ɵb"] = ImageCacheService;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=emazv72-ngx-imageviewer.umd.js.map
