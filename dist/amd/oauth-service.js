var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define(["require", "exports", "aurelia-event-aggregator", "aurelia-dependency-injection", "./oauth-token-service", "./url-hash-service", "./local-storage-service", "./oauth-polyfills"], function (require, exports, aurelia_event_aggregator_1, aurelia_dependency_injection_1, oauth_token_service_1, url_hash_service_1, local_storage_service_1, oauth_polyfills_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
                window.location.href = _this.config.logoutUrl + "?" +
                    (_this.config.logoutRedirectParameterName + "=" + encodeURIComponent(_this.config.redirectUri));
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
                    var _ = _this.getBaseRouteUrl();
                    if (_this.localStorageService.isStorageSupported()) {
                        var startPage = _this.localStorageService.get(OAUTH_STARTPAGE_STORAGE_KEY);
                        _this.localStorageService.remove(OAUTH_STARTPAGE_STORAGE_KEY);
                        if (startPage) {
                            _ = startPage;
                        }
                    }
                    _this.eventAggregator.publish(OAuthService_1.LOGIN_SUCCESS_EVENT, tokenData);
                    if (_this.config.autoTokenRenewal) {
                        _this.setAutomaticTokenRenewal();
                    }
                    window.location.href = _;
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
            get: function () {
                return 'oauth:loginSuccess';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OAuthService, "INVALID_TOKEN_EVENT", {
            get: function () {
                return 'oauth:invalidToken';
            },
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
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQzt5QkFDbkM7cUJBQ0o7b0JBQUMsT0FBTyxFQUFFLEVBQUU7d0JBSVQsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3JDO2dCQUNMLENBQUMsQ0FBQztnQkFFRixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN0QyxDQUFDLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUM1QixDQUFDOztRQTlMUSxZQUFZO1lBRHhCLHlDQUFVLEVBQUU7NkNBZ0JzQix1Q0FBaUI7Z0JBQ3BCLDBCQUFjO2dCQUNULCtCQUFtQixzQkFDdkIsMENBQWUsb0JBQWYsMENBQWU7V0FsQm5DLFlBQVksQ0ErTHhCO1FBQUQsbUJBQUM7S0EvTEQsQUErTEMsSUFBQTtJQS9MWSxvQ0FBWSIsImZpbGUiOiJvYXV0aC1zZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHtFdmVudEFnZ3JlZ2F0b3J9IGZyb20gJ2F1cmVsaWEtZXZlbnQtYWdncmVnYXRvcic7XG5pbXBvcnQge2F1dG9pbmplY3R9IGZyb20gJ2F1cmVsaWEtZGVwZW5kZW5jeS1pbmplY3Rpb24nO1xuXG5pbXBvcnQge09BdXRoVG9rZW5EYXRhLCBPQXV0aFRva2VuU2VydmljZX0gZnJvbSAnLi9vYXV0aC10b2tlbi1zZXJ2aWNlJztcbmltcG9ydCBVcmxIYXNoU2VydmljZSBmcm9tICcuL3VybC1oYXNoLXNlcnZpY2UnO1xuaW1wb3J0IExvY2FsU3RvcmFnZVNlcnZpY2UgZnJvbSAnLi9sb2NhbC1zdG9yYWdlLXNlcnZpY2UnO1xuaW1wb3J0IHtvYmplY3RBc3NpZ259IGZyb20gJy4vb2F1dGgtcG9seWZpbGxzJztcblxuY29uc3QgT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZOiBzdHJpbmcgPSAnb2F1dGguc3RhcnRQYWdlJztcblxuZXhwb3J0IGludGVyZmFjZSBPQXV0aENvbmZpZyB7XG4gICAgbG9naW5Vcmw6IHN0cmluZztcbiAgICBsb2dvdXRVcmw6IHN0cmluZztcbiAgICBjbGllbnRJZDogc3RyaW5nO1xuICAgIGxvZ291dFJlZGlyZWN0UGFyYW1ldGVyTmFtZT86IHN0cmluZztcbiAgICBzY29wZT86IHN0cmluZztcbiAgICBzdGF0ZT86IHN0cmluZztcbiAgICByZWRpcmVjdFVyaT86IHN0cmluZztcbiAgICBhbHdheXNSZXF1aXJlTG9naW4/OiBib29sZWFuO1xuICAgIGF1dG9Ub2tlblJlbmV3YWw/OiBib29sZWFuO1xuICAgIGJhc2VSb3V0ZVVybDogc3RyaW5nO1xufVxuXG5AYXV0b2luamVjdCgpXG5leHBvcnQgY2xhc3MgT0F1dGhTZXJ2aWNlIHtcblxuICAgIHB1YmxpYyBjb25maWc6IE9BdXRoQ29uZmlnO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBkZWZhdWx0czogT0F1dGhDb25maWc7XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldCBMT0dJTl9TVUNDRVNTX0VWRU5UKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiAnb2F1dGg6bG9naW5TdWNjZXNzJztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldCBJTlZBTElEX1RPS0VOX0VWRU5UKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiAnb2F1dGg6aW52YWxpZFRva2VuJztcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBvQXV0aFRva2VuU2VydmljZTogT0F1dGhUb2tlblNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgdXJsSGFzaFNlcnZpY2U6IFVybEhhc2hTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGxvY2FsU3RvcmFnZVNlcnZpY2U6IExvY2FsU3RvcmFnZVNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgZXZlbnRBZ2dyZWdhdG9yOiBFdmVudEFnZ3JlZ2F0b3IpIHtcblxuICAgICAgICB0aGlzLmRlZmF1bHRzID0ge1xuICAgICAgICAgICAgbG9naW5Vcmw6IG51bGwsXG4gICAgICAgICAgICBsb2dvdXRVcmw6IG51bGwsXG4gICAgICAgICAgICBjbGllbnRJZDogbnVsbCxcbiAgICAgICAgICAgIGxvZ291dFJlZGlyZWN0UGFyYW1ldGVyTmFtZTogJ3Bvc3RfbG9nb3V0X3JlZGlyZWN0X3VyaScsXG4gICAgICAgICAgICBzY29wZTogbnVsbCxcbiAgICAgICAgICAgIHN0YXRlOiBudWxsLFxuICAgICAgICAgICAgYWx3YXlzUmVxdWlyZUxvZ2luOiBmYWxzZSxcbiAgICAgICAgICAgIGF1dG9Ub2tlblJlbmV3YWw6IHRydWUsXG4gICAgICAgICAgICBiYXNlUm91dGVVcmw6IG51bGxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29uZmlndXJlID0gKGNvbmZpZzogT0F1dGhDb25maWcpOiBPQXV0aENvbmZpZyA9PiB7XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPQXV0aFByb3ZpZGVyIGFscmVhZHkgY29uZmlndXJlZC4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBzbGFzaCBmcm9tIHVybHMuXG4gICAgICAgIGlmIChjb25maWcubG9naW5Vcmwuc3Vic3RyKC0xKSA9PT0gJy8nKSB7XG4gICAgICAgICAgICBjb25maWcubG9naW5VcmwgPSBjb25maWcubG9naW5Vcmwuc2xpY2UoMCwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbmZpZy5sb2dvdXRVcmwuc3Vic3RyKC0xKSA9PT0gJy8nKSB7XG4gICAgICAgICAgICBjb25maWcubG9nb3V0VXJsID0gY29uZmlnLmxvZ291dFVybC5zbGljZSgwLCAtMSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFeHRlbmQgZGVmYXVsdCBjb25maWd1cmF0aW9uLlxuICAgICAgICB0aGlzLmNvbmZpZyA9IG9iamVjdEFzc2lnbih0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gICAgICAgIC8vIFJlZGlyZWN0IGlzIHNldCB0byBjdXJyZW50IGxvY2F0aW9uIGJ5IGRlZmF1bHRcbiAgICAgICAgY29uc3QgZXhpc3RpbmdIYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgICAgIGxldCBwYXRoRGVmYXVsdCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuXG4gICAgICAgIC8vIFJlbW92ZSBub3QgbmVlZGVkIHBhcnRzIGZyb20gdXJscy5cbiAgICAgICAgaWYgKGV4aXN0aW5nSGFzaCkge1xuICAgICAgICAgICAgcGF0aERlZmF1bHQgPSBwYXRoRGVmYXVsdC5yZXBsYWNlKGV4aXN0aW5nSGFzaCwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhdGhEZWZhdWx0LnN1YnN0cigtMSkgPT09ICcjJykge1xuICAgICAgICAgICAgcGF0aERlZmF1bHQgPSBwYXRoRGVmYXVsdC5zbGljZSgwLCAtMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbmZpZy5yZWRpcmVjdFVyaSA9IGNvbmZpZy5yZWRpcmVjdFVyaSB8fCBwYXRoRGVmYXVsdDtcbiAgICAgICAgdGhpcy5jb25maWcuYmFzZVJvdXRlVXJsID0gY29uZmlnLmJhc2VSb3V0ZVVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgJyMvJztcblxuICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgIH07XG5cbiAgICBwdWJsaWMgaXNBdXRoZW50aWNhdGVkID0gKCk6IGJvb2xlYW4gPT4ge1xuICAgICAgICByZXR1cm4gPGFueT50aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLmdldFRva2VuKCk7XG4gICAgfTtcblxuICAgIHB1YmxpYyBsb2dpbiA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB0aGlzLmdldFJlZGlyZWN0VXJsKCk7XG4gICAgfTtcblxuICAgIHB1YmxpYyBsb2dvdXQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYCR7dGhpcy5jb25maWcubG9nb3V0VXJsfT9gICtcbiAgICAgICAgICAgIGAke3RoaXMuY29uZmlnLmxvZ291dFJlZGlyZWN0UGFyYW1ldGVyTmFtZX09JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5jb25maWcucmVkaXJlY3RVcmkpfWA7XG4gICAgICAgIHRoaXMub0F1dGhUb2tlblNlcnZpY2UucmVtb3ZlVG9rZW4oKTtcbiAgICB9O1xuXG4gICAgcHVibGljIGxvZ2luT25TdGF0ZUNoYW5nZSA9ICh0b1N0YXRlKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGlmICh0b1N0YXRlICYmIHRoaXMuaXNMb2dpblJlcXVpcmVkKHRvU3RhdGUpICYmICF0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmICF0aGlzLmdldFRva2VuRGF0YUZyb21VcmwoKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5pc1N0b3JhZ2VTdXBwb3J0ZWQoKSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0PHN0cmluZz4oT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZKSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3aW5kb3cubG9jYXRpb24uaGFzaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gdGhpcy5nZXRCYXNlUm91dGVVcmwoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0PHN0cmluZz4oT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZLCB1cmwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubG9naW4oKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBwdWJsaWMgc2V0VG9rZW5PblJlZGlyZWN0ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCB0b2tlbkRhdGEgPSB0aGlzLmdldFRva2VuRGF0YUZyb21VcmwoKTtcblxuICAgICAgICBpZiAoIXRoaXMuaXNBdXRoZW50aWNhdGVkKCkgJiYgdG9rZW5EYXRhKSB7XG4gICAgICAgICAgICB0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLnNldFRva2VuKHRva2VuRGF0YSk7XG4gICAgICAgICAgICBsZXQgXyA9IHRoaXMuZ2V0QmFzZVJvdXRlVXJsKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5sb2NhbFN0b3JhZ2VTZXJ2aWNlLmlzU3RvcmFnZVN1cHBvcnRlZCgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnRQYWdlID0gdGhpcy5sb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldDxzdHJpbmc+KE9BVVRIX1NUQVJUUEFHRV9TVE9SQUdFX0tFWSk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVkpO1xuICAgICAgICAgICAgICAgIGlmIChzdGFydFBhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgXyA9IHN0YXJ0UGFnZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmV2ZW50QWdncmVnYXRvci5wdWJsaXNoKE9BdXRoU2VydmljZS5MT0dJTl9TVUNDRVNTX0VWRU5ULCB0b2tlbkRhdGEpO1xuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLmF1dG9Ub2tlblJlbmV3YWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEF1dG9tYXRpY1Rva2VuUmVuZXdhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBfO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgaXNMb2dpblJlcXVpcmVkID0gKHN0YXRlKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGNvbnN0IHJvdXRlSGFzQ29uZmlnID0gc3RhdGUuc2V0dGluZ3MgJiYgc3RhdGUuc2V0dGluZ3MucmVxdWlyZUxvZ2luICE9PSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHJvdXRlUmVxdWlyZXNMb2dpbiA9IHJvdXRlSGFzQ29uZmlnICYmIHN0YXRlLnNldHRpbmdzLnJlcXVpcmVMb2dpbiA/IHRydWUgOiBmYWxzZTtcblxuICAgICAgICByZXR1cm4gcm91dGVIYXNDb25maWcgPyByb3V0ZVJlcXVpcmVzTG9naW4gOiB0aGlzLmNvbmZpZy5hbHdheXNSZXF1aXJlTG9naW47XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0VG9rZW5EYXRhRnJvbVVybCA9IChoYXNoPzogc3RyaW5nKTogT0F1dGhUb2tlbkRhdGEgPT4ge1xuICAgICAgICBjb25zdCBoYXNoRGF0YSA9IHRoaXMudXJsSGFzaFNlcnZpY2UuZ2V0SGFzaERhdGEoaGFzaCk7XG4gICAgICAgIGNvbnN0IHRva2VuRGF0YSA9IHRoaXMub0F1dGhUb2tlblNlcnZpY2UuY3JlYXRlVG9rZW4oaGFzaERhdGEpO1xuXG4gICAgICAgIHJldHVybiB0b2tlbkRhdGE7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0QmFzZVJvdXRlVXJsID0gKCk6IHN0cmluZyA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5iYXNlUm91dGVVcmw7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0U2ltcGxlTm9uY2VWYWx1ZSA9ICgpOiBzdHJpbmcgPT4ge1xuICAgICAgICByZXR1cm4gKChEYXRlLm5vdygpICsgTWF0aC5yYW5kb20oKSkgKiBNYXRoLnJhbmRvbSgpKS50b1N0cmluZygpLnJlcGxhY2UoJy4nLCAnJyk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0UmVkaXJlY3RVcmwoKSB7XG4gICAgICAgIGxldCByZWRpcmVjdFVybCA9IGAke3RoaXMuY29uZmlnLmxvZ2luVXJsfT9gICtcbiAgICAgICAgICAgIGByZXNwb25zZV90eXBlPSR7dGhpcy5vQXV0aFRva2VuU2VydmljZS5jb25maWcubmFtZX0mYCArXG4gICAgICAgICAgICBgY2xpZW50X2lkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY29uZmlnLmNsaWVudElkKX0mYCArXG4gICAgICAgICAgICBgcmVkaXJlY3RfdXJpPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY29uZmlnLnJlZGlyZWN0VXJpKX0mYCArXG4gICAgICAgICAgICBgbm9uY2U9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5nZXRTaW1wbGVOb25jZVZhbHVlKCkpfWA7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnNjb3BlKSB7XG4gICAgICAgICAgICByZWRpcmVjdFVybCArPSBgJnNjb3BlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY29uZmlnLnNjb3BlKX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnN0YXRlKSB7XG4gICAgICAgICAgICByZWRpcmVjdFVybCArPSBgJnN0YXRlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY29uZmlnLnN0YXRlKX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlZGlyZWN0VXJsO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0QXV0b21hdGljVG9rZW5SZW5ld2FsKCkge1xuICAgICAgICBjb25zdCB0b2tlbkV4cGlyYXRpb25UaW1lID0gdGhpcy5vQXV0aFRva2VuU2VydmljZS5nZXRUb2tlbkV4cGlyYXRpb25UaW1lKCkgKiAxMDAwO1xuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaUZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgICAgICAgICBpRnJhbWUuc3JjID0gdGhpcy5nZXRSZWRpcmVjdFVybCgpO1xuICAgICAgICAgICAgaUZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICBpRnJhbWUub25sb2FkID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGFzaFdpdGhOZXdUb2tlbiA9IGlGcmFtZS5jb250ZW50V2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoaUZyYW1lKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0b2tlbkRhdGEgPSB0aGlzLmdldFRva2VuRGF0YUZyb21VcmwoaGFzaFdpdGhOZXdUb2tlbik7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRva2VuRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vQXV0aFRva2VuU2VydmljZS5zZXRUb2tlbih0b2tlbkRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRBdXRvbWF0aWNUb2tlblJlbmV3YWwoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlGcmFtZS5jb250ZW50V2luZG93IGNhbiBmYWlsIHdoZW4gYW4gaWZyYW1lIGxvYWRzIGlkZW50aXR5IHNlcnZlciBsb2dpbiBwYWdlXG4gICAgICAgICAgICAgICAgICAgIC8vIGJ1dCB0aGlzIHBhZ2Ugd2lsbCBub3QgcmVkaXJlY3QgYmFjayB0byB0aGUgYXBwIHVybCB3YWl0aW5nIGZvciB0aGUgdXNlciB0byBsb2dpbiBpblxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIGJlaGF2aW91ciBteSBvY2N1ciBpLmUuIHdoZW4gbG9naW4gcGFnZSBhdXRoZW50aWNhdGlvbiBjb29raWVzIGV4cGlyZVxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGlGcmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpRnJhbWUpO1xuICAgICAgICB9LCB0b2tlbkV4cGlyYXRpb25UaW1lKTtcbiAgICB9XG59Il19
