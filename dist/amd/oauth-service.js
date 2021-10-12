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
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QzNDLEtBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO3lCQUNuQztxQkFDSjtvQkFBQyxPQUFPLEVBQUUsRUFBRTt3QkFJVCxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDckM7Z0JBQ0wsQ0FBQyxDQUFDO2dCQUVGLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RDLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQzVCLENBQUM7O1FBOUxRLFlBQVk7WUFEeEIseUNBQVUsRUFBRTs2Q0FXc0IsdUNBQWlCO2dCQUNwQiwwQkFBYztnQkFDVCwrQkFBbUI7Z0JBQ3ZCLDBDQUFlO1dBYm5DLFlBQVksQ0ErTHhCO1FBQUQsbUJBQUM7S0EvTEQsQUErTEMsSUFBQTtJQS9MWSxvQ0FBWSIsImZpbGUiOiJvYXV0aC1zZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRBZ2dyZWdhdG9yIH0gZnJvbSAnYXVyZWxpYS1ldmVudC1hZ2dyZWdhdG9yJztcbmltcG9ydCB7IGF1dG9pbmplY3QgfSBmcm9tICdhdXJlbGlhLWRlcGVuZGVuY3ktaW5qZWN0aW9uJztcblxuaW1wb3J0IHsgT0F1dGhUb2tlblNlcnZpY2UsIE9BdXRoVG9rZW5EYXRhIH0gZnJvbSAnLi9vYXV0aC10b2tlbi1zZXJ2aWNlJztcbmltcG9ydCBVcmxIYXNoU2VydmljZSBmcm9tICcuL3VybC1oYXNoLXNlcnZpY2UnO1xuaW1wb3J0IExvY2FsU3RvcmFnZVNlcnZpY2UgZnJvbSAnLi9sb2NhbC1zdG9yYWdlLXNlcnZpY2UnO1xuaW1wb3J0IHsgb2JqZWN0QXNzaWduIH0gZnJvbSAnLi9vYXV0aC1wb2x5ZmlsbHMnO1xuXG5jb25zdCBPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVk6IHN0cmluZyA9ICdvYXV0aC5zdGFydFBhZ2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9BdXRoQ29uZmlnIHtcbiAgICBsb2dpblVybDogc3RyaW5nO1xuICAgIGxvZ291dFVybDogc3RyaW5nO1xuICAgIGNsaWVudElkOiBzdHJpbmc7XG4gICAgbG9nb3V0UmVkaXJlY3RQYXJhbWV0ZXJOYW1lPzogc3RyaW5nO1xuICAgIHNjb3BlPzogc3RyaW5nO1xuICAgIHN0YXRlPzogc3RyaW5nO1xuICAgIHJlZGlyZWN0VXJpPzogc3RyaW5nO1xuICAgIGFsd2F5c1JlcXVpcmVMb2dpbj86IGJvb2xlYW47XG4gICAgYXV0b1Rva2VuUmVuZXdhbD86IGJvb2xlYW47XG4gICAgYmFzZVJvdXRlVXJsOiBzdHJpbmc7XG59XG5cbkBhdXRvaW5qZWN0KClcbmV4cG9ydCBjbGFzcyBPQXV0aFNlcnZpY2Uge1xuXG4gICAgcHVibGljIGNvbmZpZzogT0F1dGhDb25maWc7XG5cbiAgICBwcml2YXRlIGRlZmF1bHRzOiBPQXV0aENvbmZpZztcblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IExPR0lOX1NVQ0NFU1NfRVZFTlQoKTogc3RyaW5nIHsgcmV0dXJuICdvYXV0aDpsb2dpblN1Y2Nlc3MnOyB9XG4gICAgcHVibGljIHN0YXRpYyBnZXQgSU5WQUxJRF9UT0tFTl9FVkVOVCgpOiBzdHJpbmcgeyByZXR1cm4gJ29hdXRoOmludmFsaWRUb2tlbic7IH1cblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIG9BdXRoVG9rZW5TZXJ2aWNlOiBPQXV0aFRva2VuU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSB1cmxIYXNoU2VydmljZTogVXJsSGFzaFNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgbG9jYWxTdG9yYWdlU2VydmljZTogTG9jYWxTdG9yYWdlU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBldmVudEFnZ3JlZ2F0b3I6IEV2ZW50QWdncmVnYXRvcikge1xuXG4gICAgICAgIHRoaXMuZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICBsb2dpblVybDogbnVsbCxcbiAgICAgICAgICAgIGxvZ291dFVybDogbnVsbCxcbiAgICAgICAgICAgIGNsaWVudElkOiBudWxsLFxuICAgICAgICAgICAgbG9nb3V0UmVkaXJlY3RQYXJhbWV0ZXJOYW1lOiAncG9zdF9sb2dvdXRfcmVkaXJlY3RfdXJpJyxcbiAgICAgICAgICAgIHNjb3BlOiBudWxsLFxuICAgICAgICAgICAgc3RhdGU6IG51bGwsXG4gICAgICAgICAgICBhbHdheXNSZXF1aXJlTG9naW46IGZhbHNlLFxuICAgICAgICAgICAgYXV0b1Rva2VuUmVuZXdhbDogdHJ1ZSxcbiAgICAgICAgICAgIGJhc2VSb3V0ZVVybDpudWxsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGNvbmZpZ3VyZSA9IChjb25maWc6IE9BdXRoQ29uZmlnKTogT0F1dGhDb25maWcgPT4ge1xuICAgICAgICBpZiAodGhpcy5jb25maWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT0F1dGhQcm92aWRlciBhbHJlYWR5IGNvbmZpZ3VyZWQuJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgc2xhc2ggZnJvbSB1cmxzLlxuICAgICAgICBpZiAoY29uZmlnLmxvZ2luVXJsLnN1YnN0cigtMSkgPT09ICcvJykge1xuICAgICAgICAgICAgY29uZmlnLmxvZ2luVXJsID0gY29uZmlnLmxvZ2luVXJsLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb25maWcubG9nb3V0VXJsLnN1YnN0cigtMSkgPT09ICcvJykge1xuICAgICAgICAgICAgY29uZmlnLmxvZ291dFVybCA9IGNvbmZpZy5sb2dvdXRVcmwuc2xpY2UoMCwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRXh0ZW5kIGRlZmF1bHQgY29uZmlndXJhdGlvbi5cbiAgICAgICAgdGhpcy5jb25maWcgPSBvYmplY3RBc3NpZ24odGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAgICAgICAvLyBSZWRpcmVjdCBpcyBzZXQgdG8gY3VycmVudCBsb2NhdGlvbiBieSBkZWZhdWx0XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nSGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgICAgICBsZXQgcGF0aERlZmF1bHQgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcblxuICAgICAgICAvLyBSZW1vdmUgbm90IG5lZWRlZCBwYXJ0cyBmcm9tIHVybHMuXG4gICAgICAgIGlmIChleGlzdGluZ0hhc2gpIHtcbiAgICAgICAgICAgIHBhdGhEZWZhdWx0ID0gcGF0aERlZmF1bHQucmVwbGFjZShleGlzdGluZ0hhc2gsICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXRoRGVmYXVsdC5zdWJzdHIoLTEpID09PSAnIycpIHtcbiAgICAgICAgICAgIHBhdGhEZWZhdWx0ID0gcGF0aERlZmF1bHQuc2xpY2UoMCwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb25maWcucmVkaXJlY3RVcmkgPSBjb25maWcucmVkaXJlY3RVcmkgfHwgcGF0aERlZmF1bHQ7XG4gICAgICAgIHRoaXMuY29uZmlnLmJhc2VSb3V0ZVVybCA9IGNvbmZpZy5iYXNlUm91dGVVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArICcjLyc7XG5cbiAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9O1xuXG4gICAgcHVibGljIGlzQXV0aGVudGljYXRlZCA9ICgpOiBib29sZWFuID0+IHtcbiAgICAgICAgcmV0dXJuIDxhbnk+dGhpcy5vQXV0aFRva2VuU2VydmljZS5nZXRUb2tlbigpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgbG9naW4gPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdGhpcy5nZXRSZWRpcmVjdFVybCgpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgbG9nb3V0ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCByZWRpcmVjdFVybCA9IGAke3RoaXMuY29uZmlnLmxvZ291dFVybH0/YCArXG4gICAgICAgICAgICBgJHt0aGlzLmNvbmZpZy5sb2dvdXRSZWRpcmVjdFBhcmFtZXRlck5hbWV9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY29uZmlnLnJlZGlyZWN0VXJpKX1gO1xuXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcmVkaXJlY3RVcmw7XG4gICAgICAgIHRoaXMub0F1dGhUb2tlblNlcnZpY2UucmVtb3ZlVG9rZW4oKTtcbiAgICB9O1xuXG4gICAgcHVibGljIGxvZ2luT25TdGF0ZUNoYW5nZSA9ICh0b1N0YXRlKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGlmICh0b1N0YXRlICYmIHRoaXMuaXNMb2dpblJlcXVpcmVkKHRvU3RhdGUpICYmICF0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmICF0aGlzLmdldFRva2VuRGF0YUZyb21VcmwoKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5pc1N0b3JhZ2VTdXBwb3J0ZWQoKSkge1xuICAgICAgICAgICAgICAgIGlmKHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5nZXQ8c3RyaW5nPihPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVkpID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSB0aGlzLmdldEJhc2VSb3V0ZVVybCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5zZXQ8c3RyaW5nPihPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVksIHVybCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5sb2dpbigpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIHB1YmxpYyBzZXRUb2tlbk9uUmVkaXJlY3QgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHRva2VuRGF0YSA9IHRoaXMuZ2V0VG9rZW5EYXRhRnJvbVVybCgpO1xuXG4gICAgICAgIGlmICghdGhpcy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiB0b2tlbkRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMub0F1dGhUb2tlblNlcnZpY2Uuc2V0VG9rZW4odG9rZW5EYXRhKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5pc1N0b3JhZ2VTdXBwb3J0ZWQoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0UGFnZSA9IHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5nZXQ8c3RyaW5nPihPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVkpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gc3RhcnRQYWdlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBSZWRpcmVjdCB0byB0aGUgYmFzZSBhcHBsaWNhdGlvbiByb3V0ZVxuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdGhpcy5nZXRCYXNlUm91dGVVcmwoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5ldmVudEFnZ3JlZ2F0b3IucHVibGlzaChPQXV0aFNlcnZpY2UuTE9HSU5fU1VDQ0VTU19FVkVOVCwgdG9rZW5EYXRhKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLmF1dG9Ub2tlblJlbmV3YWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEF1dG9tYXRpY1Rva2VuUmVuZXdhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgaXNMb2dpblJlcXVpcmVkID0gKHN0YXRlKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGNvbnN0IHJvdXRlSGFzQ29uZmlnID0gc3RhdGUuc2V0dGluZ3MgJiYgc3RhdGUuc2V0dGluZ3MucmVxdWlyZUxvZ2luICE9PSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHJvdXRlUmVxdWlyZXNMb2dpbiA9IHJvdXRlSGFzQ29uZmlnICYmIHN0YXRlLnNldHRpbmdzLnJlcXVpcmVMb2dpbiA/IHRydWUgOiBmYWxzZTtcblxuICAgICAgICByZXR1cm4gcm91dGVIYXNDb25maWcgPyByb3V0ZVJlcXVpcmVzTG9naW4gOiB0aGlzLmNvbmZpZy5hbHdheXNSZXF1aXJlTG9naW47XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0VG9rZW5EYXRhRnJvbVVybCA9IChoYXNoPzogc3RyaW5nKTogT0F1dGhUb2tlbkRhdGEgPT4ge1xuICAgICAgICBjb25zdCBoYXNoRGF0YSA9IHRoaXMudXJsSGFzaFNlcnZpY2UuZ2V0SGFzaERhdGEoaGFzaCk7XG4gICAgICAgIGNvbnN0IHRva2VuRGF0YSA9IHRoaXMub0F1dGhUb2tlblNlcnZpY2UuY3JlYXRlVG9rZW4oaGFzaERhdGEpO1xuXG4gICAgICAgIHJldHVybiB0b2tlbkRhdGE7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0QmFzZVJvdXRlVXJsID0gKCk6IHN0cmluZyA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5iYXNlUm91dGVVcmw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTaW1wbGVOb25jZVZhbHVlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgICAgIHJldHVybiAoKERhdGUubm93KCkgKyBNYXRoLnJhbmRvbSgpKSAqIE1hdGgucmFuZG9tKCkpLnRvU3RyaW5nKCkucmVwbGFjZSgnLicsICcnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFJlZGlyZWN0VXJsKCkge1xuICAgICAgICBsZXQgcmVkaXJlY3RVcmwgPSBgJHt0aGlzLmNvbmZpZy5sb2dpblVybH0/YCArXG4gICAgICAgICAgICBgcmVzcG9uc2VfdHlwZT0ke3RoaXMub0F1dGhUb2tlblNlcnZpY2UuY29uZmlnLm5hbWV9JmAgK1xuICAgICAgICAgICAgYGNsaWVudF9pZD0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbmZpZy5jbGllbnRJZCl9JmAgK1xuICAgICAgICAgICAgYHJlZGlyZWN0X3VyaT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbmZpZy5yZWRpcmVjdFVyaSl9JmAgK1xuICAgICAgICAgICAgYG5vbmNlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuZ2V0U2ltcGxlTm9uY2VWYWx1ZSgpKX1gO1xuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5zY29wZSkge1xuICAgICAgICAgICAgcmVkaXJlY3RVcmwgKz0gYCZzY29wZT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbmZpZy5zY29wZSl9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5zdGF0ZSkge1xuICAgICAgICAgICAgcmVkaXJlY3RVcmwgKz0gYCZzdGF0ZT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbmZpZy5zdGF0ZSl9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZWRpcmVjdFVybDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldEF1dG9tYXRpY1Rva2VuUmVuZXdhbCgpIHtcbiAgICAgICAgY29uc3QgdG9rZW5FeHBpcmF0aW9uVGltZSA9IHRoaXMub0F1dGhUb2tlblNlcnZpY2UuZ2V0VG9rZW5FeHBpcmF0aW9uVGltZSgpICogMTAwMDtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlGcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgICAgICAgICAgaUZyYW1lLnNyYyA9IHRoaXMuZ2V0UmVkaXJlY3RVcmwoKTtcbiAgICAgICAgICAgIGlGcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgaUZyYW1lLm9ubG9hZCA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc2hXaXRoTmV3VG9rZW4gPSBpRnJhbWUuY29udGVudFdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGlGcmFtZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9rZW5EYXRhID0gdGhpcy5nZXRUb2tlbkRhdGFGcm9tVXJsKGhhc2hXaXRoTmV3VG9rZW4pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0b2tlbkRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub0F1dGhUb2tlblNlcnZpY2Uuc2V0VG9rZW4odG9rZW5EYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0QXV0b21hdGljVG9rZW5SZW5ld2FsKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpRnJhbWUuY29udGVudFdpbmRvdyBjYW4gZmFpbCB3aGVuIGFuIGlmcmFtZSBsb2FkcyBpZGVudGl0eSBzZXJ2ZXIgbG9naW4gcGFnZVxuICAgICAgICAgICAgICAgICAgICAvLyBidXQgdGhpcyBwYWdlIHdpbGwgbm90IHJlZGlyZWN0IGJhY2sgdG8gdGhlIGFwcCB1cmwgd2FpdGluZyBmb3IgdGhlIHVzZXIgdG8gbG9naW4gaW5cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBiZWhhdmlvdXIgbXkgb2NjdXIgaS5lLiB3aGVuIGxvZ2luIHBhZ2UgYXV0aGVudGljYXRpb24gY29va2llcyBleHBpcmVcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChpRnJhbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaUZyYW1lKTtcbiAgICAgICAgfSwgdG9rZW5FeHBpcmF0aW9uVGltZSk7XG4gICAgfVxufSJdfQ==
