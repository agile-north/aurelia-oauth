"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var aurelia_event_aggregator_1 = require("aurelia-event-aggregator");
var aurelia_dependency_injection_1 = require("aurelia-dependency-injection");
var oauth_token_service_1 = require("./oauth-token-service");
var url_hash_service_1 = require("./url-hash-service");
var local_storage_service_1 = require("./local-storage-service");
var oauth_polyfills_1 = require("./oauth-polyfills");
var OAUTH_STARTPAGE_STORAGE_KEY = 'oauth.startPage';
var OAuthService = (function () {
    function OAuthService(oAuthTokenService, urlHashService, localStorageService, eventAggregator) {
        var _this = this;
        this.oAuthTokenService = oAuthTokenService;
        this.urlHashService = urlHashService;
        this.localStorageService = localStorageService;
        this.eventAggregator = eventAggregator;
        this.configure = function (config) {
            if (_this.config) {
                throw new Error('OAuthProvider already configured.');
            }
            if (config.loginUrl.substr(-1) === '/') {
                config.loginUrl = config.loginUrl.slice(0, -1);
            }
            if (config.logoutUrl.substr(-1) === '/') {
                config.logoutUrl = config.logoutUrl.slice(0, -1);
            }
            _this.config = oauth_polyfills_1.objectAssign(_this.defaults, config);
            var existingHash = window.location.hash;
            var pathDefault = window.location.href;
            if (existingHash) {
                pathDefault = pathDefault.replace(existingHash, '');
            }
            if (pathDefault.substr(-1) === '#') {
                pathDefault = pathDefault.slice(0, -1);
            }
            _this.config.redirectUri = config.redirectUri || pathDefault;
            return config;
        };
        this.isAuthenticated = function () {
            return _this.oAuthTokenService.getToken();
        };
        this.login = function () {
            window.location.href = _this.getRedirectUrl();
        };
        this.logout = function () {
            var redirectUrl = _this.config.logoutUrl + "?" +
                (_this.config.logoutRedirectParameterName + "=" + encodeURIComponent(_this.config.redirectUri));
            window.location.href = redirectUrl;
            _this.oAuthTokenService.removeToken();
        };
        this.loginOnStateChange = function (toState) {
            if (toState && _this.isLoginRequired(toState) && !_this.isAuthenticated() && !_this.getTokenDataFromUrl()) {
                if (_this.localStorageService.isStorageSupported()) {
                    if (_this.localStorageService.get(OAUTH_STARTPAGE_STORAGE_KEY) == null) {
                        var url = window.location.href;
                        if (!window.location.hash) {
                            url = _this.getBaseRouteUrl();
                        }
                        _this.localStorageService.set(OAUTH_STARTPAGE_STORAGE_KEY, url);
                    }
                }
                _this.login();
                return true;
            }
            return false;
        };
        this.setTokenOnRedirect = function () {
            var tokenData = _this.getTokenDataFromUrl();
            if (!_this.isAuthenticated() && tokenData) {
                _this.oAuthTokenService.setToken(tokenData);
                if (_this.localStorageService.isStorageSupported()) {
                    var startPage = _this.localStorageService.get(OAUTH_STARTPAGE_STORAGE_KEY);
                    _this.localStorageService.remove(OAUTH_STARTPAGE_STORAGE_KEY);
                    window.location.href = startPage;
                }
                else {
                    window.location.href = _this.getBaseRouteUrl();
                }
                _this.eventAggregator.publish(OAuthService_1.LOGIN_SUCCESS_EVENT, tokenData);
                if (_this.config.autoTokenRenewal) {
                    _this.setAutomaticTokenRenewal();
                }
            }
        };
        this.isLoginRequired = function (state) {
            var routeHasConfig = state.settings && state.settings.requireLogin !== undefined;
            var routeRequiresLogin = routeHasConfig && state.settings.requireLogin ? true : false;
            return routeHasConfig ? routeRequiresLogin : _this.config.alwaysRequireLogin;
        };
        this.getTokenDataFromUrl = function (hash) {
            var hashData = _this.urlHashService.getHashData(hash);
            var tokenData = _this.oAuthTokenService.createToken(hashData);
            return tokenData;
        };
        this.getBaseRouteUrl = function () {
            return window.location.origin + '/#/';
        };
        this.getSimpleNonceValue = function () {
            return ((Date.now() + Math.random()) * Math.random()).toString().replace('.', '');
        };
        this.defaults = {
            loginUrl: null,
            logoutUrl: null,
            clientId: null,
            logoutRedirectParameterName: 'post_logout_redirect_uri',
            scope: null,
            state: null,
            alwaysRequireLogin: false,
            autoTokenRenewal: true
        };
    }
    OAuthService_1 = OAuthService;
    Object.defineProperty(OAuthService, "LOGIN_SUCCESS_EVENT", {
        get: function () { return 'oauth:loginSuccess'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OAuthService, "INVALID_TOKEN_EVENT", {
        get: function () { return 'oauth:invalidToken'; },
        enumerable: true,
        configurable: true
    });
    OAuthService.prototype.getRedirectUrl = function () {
        var redirectUrl = this.config.loginUrl + "?" +
            ("response_type=" + this.oAuthTokenService.config.name + "&") +
            ("client_id=" + encodeURIComponent(this.config.clientId) + "&") +
            ("redirect_uri=" + encodeURIComponent(this.config.redirectUri) + "&") +
            ("nonce=" + encodeURIComponent(this.getSimpleNonceValue()));
        if (this.config.scope) {
            redirectUrl += "&scope=" + encodeURIComponent(this.config.scope);
        }
        if (this.config.state) {
            redirectUrl += "&state=" + encodeURIComponent(this.config.state);
        }
        return redirectUrl;
    };
    OAuthService.prototype.setAutomaticTokenRenewal = function () {
        var _this = this;
        var tokenExpirationTime = this.oAuthTokenService.getTokenExpirationTime() * 1000;
        setTimeout(function () {
            var iFrame = document.createElement('iframe');
            iFrame.src = _this.getRedirectUrl();
            iFrame.style.display = 'none';
            iFrame.onload = function (event) {
                try {
                    var hashWithNewToken = iFrame.contentWindow.location.hash;
                    document.body.removeChild(iFrame);
                    var tokenData = _this.getTokenDataFromUrl(hashWithNewToken);
                    if (tokenData) {
                        _this.oAuthTokenService.setToken(tokenData);
                        _this.setAutomaticTokenRenewal();
                    }
                }
                catch (ex) {
                    document.body.removeChild(iFrame);
                }
            };
            document.body.appendChild(iFrame);
        }, tokenExpirationTime);
    };
    var OAuthService_1, _a;
    OAuthService = OAuthService_1 = __decorate([
        aurelia_dependency_injection_1.autoinject(),
        __metadata("design:paramtypes", [oauth_token_service_1.OAuthTokenService,
            url_hash_service_1.default,
            local_storage_service_1.default, typeof (_a = typeof aurelia_event_aggregator_1.EventAggregator !== "undefined" && aurelia_event_aggregator_1.EventAggregator) === "function" && _a || Object])
    ], OAuthService);
    return OAuthService;
}());
exports.OAuthService = OAuthService;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUNyQztZQUNMLENBQUMsQ0FBQztZQUVGLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RDLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBQzVCLENBQUM7O0lBNUxRLFlBQVk7UUFEeEIseUNBQVUsRUFBRTt5Q0FXc0IsdUNBQWlCO1lBQ3BCLDBCQUFjO1lBQ1QsK0JBQW1CLHNCQUN2QiwwQ0FBZSxvQkFBZiwwQ0FBZTtPQWJuQyxZQUFZLENBNkx4QjtJQUFELG1CQUFDO0NBN0xELEFBNkxDLElBQUE7QUE3TFksb0NBQVkiLCJmaWxlIjoib2F1dGgtc2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50QWdncmVnYXRvciB9IGZyb20gJ2F1cmVsaWEtZXZlbnQtYWdncmVnYXRvcic7XHJcbmltcG9ydCB7IGF1dG9pbmplY3QgfSBmcm9tICdhdXJlbGlhLWRlcGVuZGVuY3ktaW5qZWN0aW9uJztcclxuXHJcbmltcG9ydCB7IE9BdXRoVG9rZW5TZXJ2aWNlLCBPQXV0aFRva2VuRGF0YSB9IGZyb20gJy4vb2F1dGgtdG9rZW4tc2VydmljZSc7XHJcbmltcG9ydCBVcmxIYXNoU2VydmljZSBmcm9tICcuL3VybC1oYXNoLXNlcnZpY2UnO1xyXG5pbXBvcnQgTG9jYWxTdG9yYWdlU2VydmljZSBmcm9tICcuL2xvY2FsLXN0b3JhZ2Utc2VydmljZSc7XHJcbmltcG9ydCB7IG9iamVjdEFzc2lnbiB9IGZyb20gJy4vb2F1dGgtcG9seWZpbGxzJztcclxuXHJcbmNvbnN0IE9BVVRIX1NUQVJUUEFHRV9TVE9SQUdFX0tFWTogc3RyaW5nID0gJ29hdXRoLnN0YXJ0UGFnZSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE9BdXRoQ29uZmlnIHtcclxuICAgIGxvZ2luVXJsOiBzdHJpbmc7XHJcbiAgICBsb2dvdXRVcmw6IHN0cmluZztcclxuICAgIGNsaWVudElkOiBzdHJpbmc7XHJcbiAgICBsb2dvdXRSZWRpcmVjdFBhcmFtZXRlck5hbWU/OiBzdHJpbmc7XHJcbiAgICBzY29wZT86IHN0cmluZztcclxuICAgIHN0YXRlPzogc3RyaW5nO1xyXG4gICAgcmVkaXJlY3RVcmk/OiBzdHJpbmc7XHJcbiAgICBhbHdheXNSZXF1aXJlTG9naW4/OiBib29sZWFuO1xyXG4gICAgYXV0b1Rva2VuUmVuZXdhbD86IGJvb2xlYW47XHJcbn1cclxuXHJcbkBhdXRvaW5qZWN0KClcclxuZXhwb3J0IGNsYXNzIE9BdXRoU2VydmljZSB7XHJcblxyXG4gICAgcHVibGljIGNvbmZpZzogT0F1dGhDb25maWc7XHJcblxyXG4gICAgcHJpdmF0ZSBkZWZhdWx0czogT0F1dGhDb25maWc7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXQgTE9HSU5fU1VDQ0VTU19FVkVOVCgpOiBzdHJpbmcgeyByZXR1cm4gJ29hdXRoOmxvZ2luU3VjY2Vzcyc7IH1cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IElOVkFMSURfVE9LRU5fRVZFTlQoKTogc3RyaW5nIHsgcmV0dXJuICdvYXV0aDppbnZhbGlkVG9rZW4nOyB9XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBvQXV0aFRva2VuU2VydmljZTogT0F1dGhUb2tlblNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSB1cmxIYXNoU2VydmljZTogVXJsSGFzaFNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBsb2NhbFN0b3JhZ2VTZXJ2aWNlOiBMb2NhbFN0b3JhZ2VTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgZXZlbnRBZ2dyZWdhdG9yOiBFdmVudEFnZ3JlZ2F0b3IpIHtcclxuXHJcbiAgICAgICAgdGhpcy5kZWZhdWx0cyA9IHtcclxuICAgICAgICAgICAgbG9naW5Vcmw6IG51bGwsXHJcbiAgICAgICAgICAgIGxvZ291dFVybDogbnVsbCxcclxuICAgICAgICAgICAgY2xpZW50SWQ6IG51bGwsXHJcbiAgICAgICAgICAgIGxvZ291dFJlZGlyZWN0UGFyYW1ldGVyTmFtZTogJ3Bvc3RfbG9nb3V0X3JlZGlyZWN0X3VyaScsXHJcbiAgICAgICAgICAgIHNjb3BlOiBudWxsLFxyXG4gICAgICAgICAgICBzdGF0ZTogbnVsbCxcclxuICAgICAgICAgICAgYWx3YXlzUmVxdWlyZUxvZ2luOiBmYWxzZSxcclxuICAgICAgICAgICAgYXV0b1Rva2VuUmVuZXdhbDogdHJ1ZVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNvbmZpZ3VyZSA9IChjb25maWc6IE9BdXRoQ29uZmlnKTogT0F1dGhDb25maWcgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09BdXRoUHJvdmlkZXIgYWxyZWFkeSBjb25maWd1cmVkLicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHNsYXNoIGZyb20gdXJscy5cclxuICAgICAgICBpZiAoY29uZmlnLmxvZ2luVXJsLnN1YnN0cigtMSkgPT09ICcvJykge1xyXG4gICAgICAgICAgICBjb25maWcubG9naW5VcmwgPSBjb25maWcubG9naW5Vcmwuc2xpY2UoMCwgLTEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZy5sb2dvdXRVcmwuc3Vic3RyKC0xKSA9PT0gJy8nKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5sb2dvdXRVcmwgPSBjb25maWcubG9nb3V0VXJsLnNsaWNlKDAsIC0xKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEV4dGVuZCBkZWZhdWx0IGNvbmZpZ3VyYXRpb24uXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSBvYmplY3RBc3NpZ24odGhpcy5kZWZhdWx0cywgY29uZmlnKTtcclxuXHJcbiAgICAgICAgLy8gUmVkaXJlY3QgaXMgc2V0IHRvIGN1cnJlbnQgbG9jYXRpb24gYnkgZGVmYXVsdFxyXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nSGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xyXG4gICAgICAgIGxldCBwYXRoRGVmYXVsdCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xyXG5cclxuICAgICAgICAvLyBSZW1vdmUgbm90IG5lZWRlZCBwYXJ0cyBmcm9tIHVybHMuXHJcbiAgICAgICAgaWYgKGV4aXN0aW5nSGFzaCkge1xyXG4gICAgICAgICAgICBwYXRoRGVmYXVsdCA9IHBhdGhEZWZhdWx0LnJlcGxhY2UoZXhpc3RpbmdIYXNoLCAnJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGF0aERlZmF1bHQuc3Vic3RyKC0xKSA9PT0gJyMnKSB7XHJcbiAgICAgICAgICAgIHBhdGhEZWZhdWx0ID0gcGF0aERlZmF1bHQuc2xpY2UoMCwgLTEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcucmVkaXJlY3RVcmkgPSBjb25maWcucmVkaXJlY3RVcmkgfHwgcGF0aERlZmF1bHQ7XHJcblxyXG4gICAgICAgIHJldHVybiBjb25maWc7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBpc0F1dGhlbnRpY2F0ZWQgPSAoKTogYm9vbGVhbiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIDxhbnk+dGhpcy5vQXV0aFRva2VuU2VydmljZS5nZXRUb2tlbigpO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgbG9naW4gPSAoKTogdm9pZCA9PiB7XHJcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB0aGlzLmdldFJlZGlyZWN0VXJsKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBsb2dvdXQgPSAoKTogdm9pZCA9PiB7XHJcbiAgICAgICAgY29uc3QgcmVkaXJlY3RVcmwgPSBgJHt0aGlzLmNvbmZpZy5sb2dvdXRVcmx9P2AgK1xyXG4gICAgICAgICAgICBgJHt0aGlzLmNvbmZpZy5sb2dvdXRSZWRpcmVjdFBhcmFtZXRlck5hbWV9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY29uZmlnLnJlZGlyZWN0VXJpKX1gO1xyXG5cclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHJlZGlyZWN0VXJsO1xyXG4gICAgICAgIHRoaXMub0F1dGhUb2tlblNlcnZpY2UucmVtb3ZlVG9rZW4oKTtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGxvZ2luT25TdGF0ZUNoYW5nZSA9ICh0b1N0YXRlKTogYm9vbGVhbiA9PiB7XHJcbiAgICAgICAgaWYgKHRvU3RhdGUgJiYgdGhpcy5pc0xvZ2luUmVxdWlyZWQodG9TdGF0ZSkgJiYgIXRoaXMuaXNBdXRoZW50aWNhdGVkKCkgJiYgIXRoaXMuZ2V0VG9rZW5EYXRhRnJvbVVybCgpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2UuaXNTdG9yYWdlU3VwcG9ydGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5nZXQ8c3RyaW5nPihPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVkpID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3aW5kb3cubG9jYXRpb24uaGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSB0aGlzLmdldEJhc2VSb3V0ZVVybCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0PHN0cmluZz4oT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZLCB1cmwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubG9naW4oKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBzZXRUb2tlbk9uUmVkaXJlY3QgPSAoKTogdm9pZCA9PiB7XHJcbiAgICAgICAgY29uc3QgdG9rZW5EYXRhID0gdGhpcy5nZXRUb2tlbkRhdGFGcm9tVXJsKCk7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiB0b2tlbkRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5vQXV0aFRva2VuU2VydmljZS5zZXRUb2tlbih0b2tlbkRhdGEpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5pc1N0b3JhZ2VTdXBwb3J0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnRQYWdlID0gdGhpcy5sb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldDxzdHJpbmc+KE9BVVRIX1NUQVJUUEFHRV9TVE9SQUdFX0tFWSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVkpO1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBzdGFydFBhZ2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBSZWRpcmVjdCB0byB0aGUgYmFzZSBhcHBsaWNhdGlvbiByb3V0ZVxyXG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB0aGlzLmdldEJhc2VSb3V0ZVVybCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmV2ZW50QWdncmVnYXRvci5wdWJsaXNoKE9BdXRoU2VydmljZS5MT0dJTl9TVUNDRVNTX0VWRU5ULCB0b2tlbkRhdGEpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLmF1dG9Ub2tlblJlbmV3YWwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0QXV0b21hdGljVG9rZW5SZW5ld2FsKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgaXNMb2dpblJlcXVpcmVkID0gKHN0YXRlKTogYm9vbGVhbiA9PiB7XHJcbiAgICAgICAgY29uc3Qgcm91dGVIYXNDb25maWcgPSBzdGF0ZS5zZXR0aW5ncyAmJiBzdGF0ZS5zZXR0aW5ncy5yZXF1aXJlTG9naW4gIT09IHVuZGVmaW5lZDtcclxuICAgICAgICBjb25zdCByb3V0ZVJlcXVpcmVzTG9naW4gPSByb3V0ZUhhc0NvbmZpZyAmJiBzdGF0ZS5zZXR0aW5ncy5yZXF1aXJlTG9naW4gPyB0cnVlIDogZmFsc2U7XHJcblxyXG4gICAgICAgIHJldHVybiByb3V0ZUhhc0NvbmZpZyA/IHJvdXRlUmVxdWlyZXNMb2dpbiA6IHRoaXMuY29uZmlnLmFsd2F5c1JlcXVpcmVMb2dpbjtcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRUb2tlbkRhdGFGcm9tVXJsID0gKGhhc2g/OiBzdHJpbmcpOiBPQXV0aFRva2VuRGF0YSA9PiB7XHJcbiAgICAgICAgY29uc3QgaGFzaERhdGEgPSB0aGlzLnVybEhhc2hTZXJ2aWNlLmdldEhhc2hEYXRhKGhhc2gpO1xyXG4gICAgICAgIGNvbnN0IHRva2VuRGF0YSA9IHRoaXMub0F1dGhUb2tlblNlcnZpY2UuY3JlYXRlVG9rZW4oaGFzaERhdGEpO1xyXG5cclxuICAgICAgICByZXR1cm4gdG9rZW5EYXRhO1xyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIGdldEJhc2VSb3V0ZVVybCA9ICgpOiBzdHJpbmcgPT4ge1xyXG4gICAgICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgJy8jLyc7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRTaW1wbGVOb25jZVZhbHVlID0gKCk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgcmV0dXJuICgoRGF0ZS5ub3coKSArIE1hdGgucmFuZG9tKCkpICogTWF0aC5yYW5kb20oKSkudG9TdHJpbmcoKS5yZXBsYWNlKCcuJywgJycpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0UmVkaXJlY3RVcmwoKSB7XHJcbiAgICAgICAgbGV0IHJlZGlyZWN0VXJsID0gYCR7dGhpcy5jb25maWcubG9naW5Vcmx9P2AgK1xyXG4gICAgICAgICAgICBgcmVzcG9uc2VfdHlwZT0ke3RoaXMub0F1dGhUb2tlblNlcnZpY2UuY29uZmlnLm5hbWV9JmAgK1xyXG4gICAgICAgICAgICBgY2xpZW50X2lkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY29uZmlnLmNsaWVudElkKX0mYCArXHJcbiAgICAgICAgICAgIGByZWRpcmVjdF91cmk9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5jb25maWcucmVkaXJlY3RVcmkpfSZgICtcclxuICAgICAgICAgICAgYG5vbmNlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuZ2V0U2ltcGxlTm9uY2VWYWx1ZSgpKX1gO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jb25maWcuc2NvcGUpIHtcclxuICAgICAgICAgICAgcmVkaXJlY3RVcmwgKz0gYCZzY29wZT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbmZpZy5zY29wZSl9YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5zdGF0ZSkge1xyXG4gICAgICAgICAgICByZWRpcmVjdFVybCArPSBgJnN0YXRlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY29uZmlnLnN0YXRlKX1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlZGlyZWN0VXJsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0QXV0b21hdGljVG9rZW5SZW5ld2FsKCkge1xyXG4gICAgICAgIGNvbnN0IHRva2VuRXhwaXJhdGlvblRpbWUgPSB0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLmdldFRva2VuRXhwaXJhdGlvblRpbWUoKSAqIDEwMDA7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpRnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcclxuICAgICAgICAgICAgaUZyYW1lLnNyYyA9IHRoaXMuZ2V0UmVkaXJlY3RVcmwoKTtcclxuICAgICAgICAgICAgaUZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIGlGcmFtZS5vbmxvYWQgPSAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGFzaFdpdGhOZXdUb2tlbiA9IGlGcmFtZS5jb250ZW50V2luZG93LmxvY2F0aW9uLmhhc2g7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChpRnJhbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0b2tlbkRhdGEgPSB0aGlzLmdldFRva2VuRGF0YUZyb21VcmwoaGFzaFdpdGhOZXdUb2tlbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0b2tlbkRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vQXV0aFRva2VuU2VydmljZS5zZXRUb2tlbih0b2tlbkRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEF1dG9tYXRpY1Rva2VuUmVuZXdhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaUZyYW1lLmNvbnRlbnRXaW5kb3cgY2FuIGZhaWwgd2hlbiBhbiBpZnJhbWUgbG9hZHMgaWRlbnRpdHkgc2VydmVyIGxvZ2luIHBhZ2VcclxuICAgICAgICAgICAgICAgICAgICAvLyBidXQgdGhpcyBwYWdlIHdpbGwgbm90IHJlZGlyZWN0IGJhY2sgdG8gdGhlIGFwcCB1cmwgd2FpdGluZyBmb3IgdGhlIHVzZXIgdG8gbG9naW4gaW5cclxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIGJlaGF2aW91ciBteSBvY2N1ciBpLmUuIHdoZW4gbG9naW4gcGFnZSBhdXRoZW50aWNhdGlvbiBjb29raWVzIGV4cGlyZVxyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoaUZyYW1lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaUZyYW1lKTtcclxuICAgICAgICB9LCB0b2tlbkV4cGlyYXRpb25UaW1lKTtcclxuICAgIH1cclxufSJdfQ==
