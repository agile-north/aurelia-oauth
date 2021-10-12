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
            _this.config.baseRouteUrl = config.baseRouteUrl || window.location.origin + window.location.pathname + '#/';
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
            return _this.config.baseRouteUrl;
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
            autoTokenRenewal: true,
            baseRouteUrl: null
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
    var OAuthService_1;
    OAuthService = OAuthService_1 = __decorate([
        aurelia_dependency_injection_1.autoinject(),
        __metadata("design:paramtypes", [oauth_token_service_1.OAuthTokenService,
            url_hash_service_1.default,
            local_storage_service_1.default,
            aurelia_event_aggregator_1.EventAggregator])
    ], OAuthService);
    return OAuthService;
}());
exports.OAuthService = OAuthService;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9vYXV0aC1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUVBQTJEO0FBQzNELDZFQUEwRDtBQUUxRCw2REFBMEU7QUFDMUUsdURBQWdEO0FBQ2hELGlFQUEwRDtBQUMxRCxxREFBaUQ7QUFFakQsSUFBTSwyQkFBMkIsR0FBVyxpQkFBaUIsQ0FBQztBQWdCOUQ7SUFTSSxzQkFDWSxpQkFBb0MsRUFDcEMsY0FBOEIsRUFDOUIsbUJBQXdDLEVBQ3hDLGVBQWdDO1FBSjVDLGlCQWlCQztRQWhCVyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1FBQ3BDLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUM5Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ3hDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQWVyQyxjQUFTLEdBQUcsVUFBQyxNQUFtQjtZQUNuQyxJQUFJLEtBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO2FBQ3hEO1lBR0QsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtnQkFDcEMsTUFBTSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNsRDtZQUVELElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7Z0JBQ3JDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDcEQ7WUFHRCxLQUFJLENBQUMsTUFBTSxHQUFHLDhCQUFZLENBQUMsS0FBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUds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QUMsU0FBUyxDQUFDLENBQUM7d0JBQzNDLEtBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO3FCQUNuQztpQkFDSjtnQkFBQyxPQUFPLEVBQUUsRUFBRTtvQkFJVCxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDckM7WUFDTCxDQUFDLENBQUM7WUFFRixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0QyxDQUFDLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztJQUM1QixDQUFDOztJQTlMUSxZQUFZO1FBRHhCLHlDQUFVLEVBQUU7eUNBV3NCLHVDQUFpQjtZQUNwQiwwQkFBYztZQUNULCtCQUFtQjtZQUN2QiwwQ0FBZTtPQWJuQyxZQUFZLENBK0x4QjtJQUFELG1CQUFDO0NBL0xELEFBK0xDLElBQUE7QUEvTFksb0NBQVkiLCJmaWxlIjoib2F1dGgtc2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50QWdncmVnYXRvciB9IGZyb20gJ2F1cmVsaWEtZXZlbnQtYWdncmVnYXRvcic7XG5pbXBvcnQgeyBhdXRvaW5qZWN0IH0gZnJvbSAnYXVyZWxpYS1kZXBlbmRlbmN5LWluamVjdGlvbic7XG5cbmltcG9ydCB7IE9BdXRoVG9rZW5TZXJ2aWNlLCBPQXV0aFRva2VuRGF0YSB9IGZyb20gJy4vb2F1dGgtdG9rZW4tc2VydmljZSc7XG5pbXBvcnQgVXJsSGFzaFNlcnZpY2UgZnJvbSAnLi91cmwtaGFzaC1zZXJ2aWNlJztcbmltcG9ydCBMb2NhbFN0b3JhZ2VTZXJ2aWNlIGZyb20gJy4vbG9jYWwtc3RvcmFnZS1zZXJ2aWNlJztcbmltcG9ydCB7IG9iamVjdEFzc2lnbiB9IGZyb20gJy4vb2F1dGgtcG9seWZpbGxzJztcblxuY29uc3QgT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZOiBzdHJpbmcgPSAnb2F1dGguc3RhcnRQYWdlJztcblxuZXhwb3J0IGludGVyZmFjZSBPQXV0aENvbmZpZyB7XG4gICAgbG9naW5Vcmw6IHN0cmluZztcbiAgICBsb2dvdXRVcmw6IHN0cmluZztcbiAgICBjbGllbnRJZDogc3RyaW5nO1xuICAgIGxvZ291dFJlZGlyZWN0UGFyYW1ldGVyTmFtZT86IHN0cmluZztcbiAgICBzY29wZT86IHN0cmluZztcbiAgICBzdGF0ZT86IHN0cmluZztcbiAgICByZWRpcmVjdFVyaT86IHN0cmluZztcbiAgICBhbHdheXNSZXF1aXJlTG9naW4/OiBib29sZWFuO1xuICAgIGF1dG9Ub2tlblJlbmV3YWw/OiBib29sZWFuO1xuICAgIGJhc2VSb3V0ZVVybDogc3RyaW5nO1xufVxuXG5AYXV0b2luamVjdCgpXG5leHBvcnQgY2xhc3MgT0F1dGhTZXJ2aWNlIHtcblxuICAgIHB1YmxpYyBjb25maWc6IE9BdXRoQ29uZmlnO1xuXG4gICAgcHJpdmF0ZSBkZWZhdWx0czogT0F1dGhDb25maWc7XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldCBMT0dJTl9TVUNDRVNTX0VWRU5UKCk6IHN0cmluZyB7IHJldHVybiAnb2F1dGg6bG9naW5TdWNjZXNzJzsgfVxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IElOVkFMSURfVE9LRU5fRVZFTlQoKTogc3RyaW5nIHsgcmV0dXJuICdvYXV0aDppbnZhbGlkVG9rZW4nOyB9XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBvQXV0aFRva2VuU2VydmljZTogT0F1dGhUb2tlblNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgdXJsSGFzaFNlcnZpY2U6IFVybEhhc2hTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGxvY2FsU3RvcmFnZVNlcnZpY2U6IExvY2FsU3RvcmFnZVNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgZXZlbnRBZ2dyZWdhdG9yOiBFdmVudEFnZ3JlZ2F0b3IpIHtcblxuICAgICAgICB0aGlzLmRlZmF1bHRzID0ge1xuICAgICAgICAgICAgbG9naW5Vcmw6IG51bGwsXG4gICAgICAgICAgICBsb2dvdXRVcmw6IG51bGwsXG4gICAgICAgICAgICBjbGllbnRJZDogbnVsbCxcbiAgICAgICAgICAgIGxvZ291dFJlZGlyZWN0UGFyYW1ldGVyTmFtZTogJ3Bvc3RfbG9nb3V0X3JlZGlyZWN0X3VyaScsXG4gICAgICAgICAgICBzY29wZTogbnVsbCxcbiAgICAgICAgICAgIHN0YXRlOiBudWxsLFxuICAgICAgICAgICAgYWx3YXlzUmVxdWlyZUxvZ2luOiBmYWxzZSxcbiAgICAgICAgICAgIGF1dG9Ub2tlblJlbmV3YWw6IHRydWUsXG4gICAgICAgICAgICBiYXNlUm91dGVVcmw6bnVsbFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBjb25maWd1cmUgPSAoY29uZmlnOiBPQXV0aENvbmZpZyk6IE9BdXRoQ29uZmlnID0+IHtcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09BdXRoUHJvdmlkZXIgYWxyZWFkeSBjb25maWd1cmVkLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHNsYXNoIGZyb20gdXJscy5cbiAgICAgICAgaWYgKGNvbmZpZy5sb2dpblVybC5zdWJzdHIoLTEpID09PSAnLycpIHtcbiAgICAgICAgICAgIGNvbmZpZy5sb2dpblVybCA9IGNvbmZpZy5sb2dpblVybC5zbGljZSgwLCAtMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29uZmlnLmxvZ291dFVybC5zdWJzdHIoLTEpID09PSAnLycpIHtcbiAgICAgICAgICAgIGNvbmZpZy5sb2dvdXRVcmwgPSBjb25maWcubG9nb3V0VXJsLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEV4dGVuZCBkZWZhdWx0IGNvbmZpZ3VyYXRpb24uXG4gICAgICAgIHRoaXMuY29uZmlnID0gb2JqZWN0QXNzaWduKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgICAgICAgLy8gUmVkaXJlY3QgaXMgc2V0IHRvIGN1cnJlbnQgbG9jYXRpb24gYnkgZGVmYXVsdFxuICAgICAgICBjb25zdCBleGlzdGluZ0hhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICAgICAgbGV0IHBhdGhEZWZhdWx0ID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG5cbiAgICAgICAgLy8gUmVtb3ZlIG5vdCBuZWVkZWQgcGFydHMgZnJvbSB1cmxzLlxuICAgICAgICBpZiAoZXhpc3RpbmdIYXNoKSB7XG4gICAgICAgICAgICBwYXRoRGVmYXVsdCA9IHBhdGhEZWZhdWx0LnJlcGxhY2UoZXhpc3RpbmdIYXNoLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGF0aERlZmF1bHQuc3Vic3RyKC0xKSA9PT0gJyMnKSB7XG4gICAgICAgICAgICBwYXRoRGVmYXVsdCA9IHBhdGhEZWZhdWx0LnNsaWNlKDAsIC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY29uZmlnLnJlZGlyZWN0VXJpID0gY29uZmlnLnJlZGlyZWN0VXJpIHx8IHBhdGhEZWZhdWx0O1xuICAgICAgICB0aGlzLmNvbmZpZy5iYXNlUm91dGVVcmwgPSBjb25maWcuYmFzZVJvdXRlVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyAnIy8nO1xuXG4gICAgICAgIHJldHVybiBjb25maWc7XG4gICAgfTtcblxuICAgIHB1YmxpYyBpc0F1dGhlbnRpY2F0ZWQgPSAoKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIHJldHVybiA8YW55PnRoaXMub0F1dGhUb2tlblNlcnZpY2UuZ2V0VG9rZW4oKTtcbiAgICB9O1xuXG4gICAgcHVibGljIGxvZ2luID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHRoaXMuZ2V0UmVkaXJlY3RVcmwoKTtcbiAgICB9O1xuXG4gICAgcHVibGljIGxvZ291dCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgcmVkaXJlY3RVcmwgPSBgJHt0aGlzLmNvbmZpZy5sb2dvdXRVcmx9P2AgK1xuICAgICAgICAgICAgYCR7dGhpcy5jb25maWcubG9nb3V0UmVkaXJlY3RQYXJhbWV0ZXJOYW1lfT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbmZpZy5yZWRpcmVjdFVyaSl9YDtcblxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHJlZGlyZWN0VXJsO1xuICAgICAgICB0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLnJlbW92ZVRva2VuKCk7XG4gICAgfTtcblxuICAgIHB1YmxpYyBsb2dpbk9uU3RhdGVDaGFuZ2UgPSAodG9TdGF0ZSk6IGJvb2xlYW4gPT4ge1xuICAgICAgICBpZiAodG9TdGF0ZSAmJiB0aGlzLmlzTG9naW5SZXF1aXJlZCh0b1N0YXRlKSAmJiAhdGhpcy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiAhdGhpcy5nZXRUb2tlbkRhdGFGcm9tVXJsKCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2UuaXNTdG9yYWdlU3VwcG9ydGVkKCkpIHtcbiAgICAgICAgICAgICAgICBpZih0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0PHN0cmluZz4oT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZKSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3aW5kb3cubG9jYXRpb24uaGFzaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gdGhpcy5nZXRCYXNlUm91dGVVcmwoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0PHN0cmluZz4oT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZLCB1cmwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubG9naW4oKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBwdWJsaWMgc2V0VG9rZW5PblJlZGlyZWN0ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCB0b2tlbkRhdGEgPSB0aGlzLmdldFRva2VuRGF0YUZyb21VcmwoKTtcblxuICAgICAgICBpZiAoIXRoaXMuaXNBdXRoZW50aWNhdGVkKCkgJiYgdG9rZW5EYXRhKSB7XG4gICAgICAgICAgICB0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLnNldFRva2VuKHRva2VuRGF0YSk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2UuaXNTdG9yYWdlU3VwcG9ydGVkKCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGFydFBhZ2UgPSB0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0PHN0cmluZz4oT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZKTtcblxuICAgICAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5yZW1vdmUoT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHN0YXJ0UGFnZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gUmVkaXJlY3QgdG8gdGhlIGJhc2UgYXBwbGljYXRpb24gcm91dGVcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHRoaXMuZ2V0QmFzZVJvdXRlVXJsKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuZXZlbnRBZ2dyZWdhdG9yLnB1Ymxpc2goT0F1dGhTZXJ2aWNlLkxPR0lOX1NVQ0NFU1NfRVZFTlQsIHRva2VuRGF0YSk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5hdXRvVG9rZW5SZW5ld2FsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdXRvbWF0aWNUb2tlblJlbmV3YWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGlzTG9naW5SZXF1aXJlZCA9IChzdGF0ZSk6IGJvb2xlYW4gPT4ge1xuICAgICAgICBjb25zdCByb3V0ZUhhc0NvbmZpZyA9IHN0YXRlLnNldHRpbmdzICYmIHN0YXRlLnNldHRpbmdzLnJlcXVpcmVMb2dpbiAhPT0gdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCByb3V0ZVJlcXVpcmVzTG9naW4gPSByb3V0ZUhhc0NvbmZpZyAmJiBzdGF0ZS5zZXR0aW5ncy5yZXF1aXJlTG9naW4gPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgcmV0dXJuIHJvdXRlSGFzQ29uZmlnID8gcm91dGVSZXF1aXJlc0xvZ2luIDogdGhpcy5jb25maWcuYWx3YXlzUmVxdWlyZUxvZ2luO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldFRva2VuRGF0YUZyb21VcmwgPSAoaGFzaD86IHN0cmluZyk6IE9BdXRoVG9rZW5EYXRhID0+IHtcbiAgICAgICAgY29uc3QgaGFzaERhdGEgPSB0aGlzLnVybEhhc2hTZXJ2aWNlLmdldEhhc2hEYXRhKGhhc2gpO1xuICAgICAgICBjb25zdCB0b2tlbkRhdGEgPSB0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLmNyZWF0ZVRva2VuKGhhc2hEYXRhKTtcblxuICAgICAgICByZXR1cm4gdG9rZW5EYXRhO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldEJhc2VSb3V0ZVVybCA9ICgpOiBzdHJpbmcgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcuYmFzZVJvdXRlVXJsO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U2ltcGxlTm9uY2VWYWx1ZSA9ICgpOiBzdHJpbmcgPT4ge1xuICAgICAgICByZXR1cm4gKChEYXRlLm5vdygpICsgTWF0aC5yYW5kb20oKSkgKiBNYXRoLnJhbmRvbSgpKS50b1N0cmluZygpLnJlcGxhY2UoJy4nLCAnJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRSZWRpcmVjdFVybCgpIHtcbiAgICAgICAgbGV0IHJlZGlyZWN0VXJsID0gYCR7dGhpcy5jb25maWcubG9naW5Vcmx9P2AgK1xuICAgICAgICAgICAgYHJlc3BvbnNlX3R5cGU9JHt0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLmNvbmZpZy5uYW1lfSZgICtcbiAgICAgICAgICAgIGBjbGllbnRfaWQ9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5jb25maWcuY2xpZW50SWQpfSZgICtcbiAgICAgICAgICAgIGByZWRpcmVjdF91cmk9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5jb25maWcucmVkaXJlY3RVcmkpfSZgICtcbiAgICAgICAgICAgIGBub25jZT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmdldFNpbXBsZU5vbmNlVmFsdWUoKSl9YDtcblxuICAgICAgICBpZiAodGhpcy5jb25maWcuc2NvcGUpIHtcbiAgICAgICAgICAgIHJlZGlyZWN0VXJsICs9IGAmc2NvcGU9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5jb25maWcuc2NvcGUpfWA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jb25maWcuc3RhdGUpIHtcbiAgICAgICAgICAgIHJlZGlyZWN0VXJsICs9IGAmc3RhdGU9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5jb25maWcuc3RhdGUpfWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVkaXJlY3RVcmw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRBdXRvbWF0aWNUb2tlblJlbmV3YWwoKSB7XG4gICAgICAgIGNvbnN0IHRva2VuRXhwaXJhdGlvblRpbWUgPSB0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLmdldFRva2VuRXhwaXJhdGlvblRpbWUoKSAqIDEwMDA7XG5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpRnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgICAgICAgICAgIGlGcmFtZS5zcmMgPSB0aGlzLmdldFJlZGlyZWN0VXJsKCk7XG4gICAgICAgICAgICBpRnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIGlGcmFtZS5vbmxvYWQgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBoYXNoV2l0aE5ld1Rva2VuID0gaUZyYW1lLmNvbnRlbnRXaW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChpRnJhbWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRva2VuRGF0YSA9IHRoaXMuZ2V0VG9rZW5EYXRhRnJvbVVybChoYXNoV2l0aE5ld1Rva2VuKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodG9rZW5EYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLnNldFRva2VuKHRva2VuRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEF1dG9tYXRpY1Rva2VuUmVuZXdhbCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaUZyYW1lLmNvbnRlbnRXaW5kb3cgY2FuIGZhaWwgd2hlbiBhbiBpZnJhbWUgbG9hZHMgaWRlbnRpdHkgc2VydmVyIGxvZ2luIHBhZ2VcbiAgICAgICAgICAgICAgICAgICAgLy8gYnV0IHRoaXMgcGFnZSB3aWxsIG5vdCByZWRpcmVjdCBiYWNrIHRvIHRoZSBhcHAgdXJsIHdhaXRpbmcgZm9yIHRoZSB1c2VyIHRvIGxvZ2luIGluXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgYmVoYXZpb3VyIG15IG9jY3VyIGkuZS4gd2hlbiBsb2dpbiBwYWdlIGF1dGhlbnRpY2F0aW9uIGNvb2tpZXMgZXhwaXJlXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoaUZyYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGlGcmFtZSk7XG4gICAgICAgIH0sIHRva2VuRXhwaXJhdGlvblRpbWUpO1xuICAgIH1cbn0iXX0=
