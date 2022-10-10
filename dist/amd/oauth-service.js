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
    var OAUTH_STARTPAGE_STORAGE_KEY = "oauth.startPage";
    var OAuthService = (function () {
        function OAuthService(oAuthTokenService, urlHashService, localStorageService, eventAggregator) {
            var _this = this;
            this.oAuthTokenService = oAuthTokenService;
            this.urlHashService = urlHashService;
            this.localStorageService = localStorageService;
            this.eventAggregator = eventAggregator;
            this.configure = function (config) {
                if (_this.config) {
                    throw new Error("OAuthProvider already configured.");
                }
                if (config.loginUrl.substr(-1) === "/") {
                    config.loginUrl = config.loginUrl.slice(0, -1);
                }
                if (config.logoutUrl.substr(-1) === "/") {
                    config.logoutUrl = config.logoutUrl.slice(0, -1);
                }
                _this.config = oauth_polyfills_1.objectAssign(_this.defaults, config);
                var existingHash = window.location.hash;
                var pathDefault = window.location.href;
                if (existingHash && config.redirectUriRemoveHash) {
                    pathDefault = pathDefault.replace(existingHash, "");
                }
                if (pathDefault.substr(-1) === "#") {
                    pathDefault = pathDefault.slice(0, -1);
                }
                _this.config.redirectUri = config.redirectUri || pathDefault;
                _this.config.baseRouteUrl =
                    config.baseRouteUrl ||
                        window.location.origin + window.location.pathname + "#/";
                return config;
            };
            this.isAuthenticated = function () {
                return _this.oAuthTokenService.getToken();
            };
            this.login = function () {
                window.location.href = _this.getRedirectUrl();
            };
            this.logout = function () {
                window.location.href =
                    _this.config.logoutUrl + "?" +
                        (_this.config.logoutRedirectParameterName + "=" + encodeURIComponent(_this.config.redirectUri));
                _this.oAuthTokenService.removeToken();
            };
            this.loginOnStateChange = function (toState) {
                if (toState &&
                    _this.isLoginRequired(toState) &&
                    !_this.isAuthenticated() &&
                    !_this.getTokenDataFromUrl()) {
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
                return routeHasConfig
                    ? routeRequiresLogin
                    : _this.config.alwaysRequireLogin;
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
                return ((Date.now() + Math.random()) * Math.random())
                    .toString()
                    .replace(".", "");
            };
            this.defaults = {
                loginUrl: null,
                logoutUrl: null,
                clientId: null,
                logoutRedirectParameterName: "post_logout_redirect_uri",
                scope: null,
                state: null,
                alwaysRequireLogin: false,
                redirectUriRemoveHash: false,
                autoTokenRenewal: true,
                baseRouteUrl: null,
            };
        }
        OAuthService_1 = OAuthService;
        Object.defineProperty(OAuthService, "LOGIN_SUCCESS_EVENT", {
            get: function () {
                return "oauth:loginSuccess";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OAuthService, "INVALID_TOKEN_EVENT", {
            get: function () {
                return "oauth:invalidToken";
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
                var iFrame = document.createElement("iframe");
                iFrame.src = _this.getRedirectUrl();
                iFrame.style.display = "none";
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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SSxTQUFTLEVBQUU7NEJBQ1gsS0FBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQzs0QkFDM0MsS0FBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7eUJBQ25DO3FCQUNKO29CQUFDLE9BQU8sRUFBRSxFQUFFO3dCQUlULFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUNyQztnQkFDTCxDQUFDLENBQUM7Z0JBRUYsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdEMsQ0FBQyxFQUFFLG1CQUFtQixDQUFDLENBQUM7UUFDNUIsQ0FBQzs7UUE3TlEsWUFBWTtZQUR4Qix5Q0FBVSxFQUFFOzZDQWVzQix1Q0FBaUI7Z0JBQ3BCLDBCQUFjO2dCQUNULCtCQUFtQjtnQkFDdkIsMENBQWU7V0FqQm5DLFlBQVksQ0E4TnhCO1FBQUQsbUJBQUM7S0E5TkQsQUE4TkMsSUFBQTtJQTlOWSxvQ0FBWSIsImZpbGUiOiJvYXV0aC1zZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHsgRXZlbnRBZ2dyZWdhdG9yIH0gZnJvbSBcImF1cmVsaWEtZXZlbnQtYWdncmVnYXRvclwiO1xuaW1wb3J0IHsgYXV0b2luamVjdCB9IGZyb20gXCJhdXJlbGlhLWRlcGVuZGVuY3ktaW5qZWN0aW9uXCI7XG5cbmltcG9ydCB7IE9BdXRoVG9rZW5EYXRhLCBPQXV0aFRva2VuU2VydmljZSB9IGZyb20gXCIuL29hdXRoLXRva2VuLXNlcnZpY2VcIjtcbmltcG9ydCBVcmxIYXNoU2VydmljZSBmcm9tIFwiLi91cmwtaGFzaC1zZXJ2aWNlXCI7XG5pbXBvcnQgTG9jYWxTdG9yYWdlU2VydmljZSBmcm9tIFwiLi9sb2NhbC1zdG9yYWdlLXNlcnZpY2VcIjtcbmltcG9ydCB7IG9iamVjdEFzc2lnbiB9IGZyb20gXCIuL29hdXRoLXBvbHlmaWxsc1wiO1xuXG5jb25zdCBPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVk6IHN0cmluZyA9IFwib2F1dGguc3RhcnRQYWdlXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT0F1dGhDb25maWcge1xuICAgIGxvZ2luVXJsOiBzdHJpbmc7XG4gICAgbG9nb3V0VXJsOiBzdHJpbmc7XG4gICAgY2xpZW50SWQ6IHN0cmluZztcbiAgICBsb2dvdXRSZWRpcmVjdFBhcmFtZXRlck5hbWU/OiBzdHJpbmc7XG4gICAgc2NvcGU/OiBzdHJpbmc7XG4gICAgc3RhdGU/OiBzdHJpbmc7XG4gICAgcmVkaXJlY3RVcmk/OiBzdHJpbmc7XG4gICAgcmVkaXJlY3RVcmlSZW1vdmVIYXNoPzogYm9vbGVhbjtcbiAgICBhbHdheXNSZXF1aXJlTG9naW4/OiBib29sZWFuO1xuICAgIGF1dG9Ub2tlblJlbmV3YWw/OiBib29sZWFuO1xuICAgIGJhc2VSb3V0ZVVybDogc3RyaW5nO1xufVxuXG5AYXV0b2luamVjdCgpXG5leHBvcnQgY2xhc3MgT0F1dGhTZXJ2aWNlIHtcbiAgICBwdWJsaWMgY29uZmlnOiBPQXV0aENvbmZpZztcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgZGVmYXVsdHM6IE9BdXRoQ29uZmlnO1xuXG4gICAgcHVibGljIHN0YXRpYyBnZXQgTE9HSU5fU1VDQ0VTU19FVkVOVCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gXCJvYXV0aDpsb2dpblN1Y2Nlc3NcIjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldCBJTlZBTElEX1RPS0VOX0VWRU5UKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIm9hdXRoOmludmFsaWRUb2tlblwiO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIG9BdXRoVG9rZW5TZXJ2aWNlOiBPQXV0aFRva2VuU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSB1cmxIYXNoU2VydmljZTogVXJsSGFzaFNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgbG9jYWxTdG9yYWdlU2VydmljZTogTG9jYWxTdG9yYWdlU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBldmVudEFnZ3JlZ2F0b3I6IEV2ZW50QWdncmVnYXRvclxuICAgICkge1xuICAgICAgICB0aGlzLmRlZmF1bHRzID0ge1xuICAgICAgICAgICAgbG9naW5Vcmw6IG51bGwsXG4gICAgICAgICAgICBsb2dvdXRVcmw6IG51bGwsXG4gICAgICAgICAgICBjbGllbnRJZDogbnVsbCxcbiAgICAgICAgICAgIGxvZ291dFJlZGlyZWN0UGFyYW1ldGVyTmFtZTogXCJwb3N0X2xvZ291dF9yZWRpcmVjdF91cmlcIixcbiAgICAgICAgICAgIHNjb3BlOiBudWxsLFxuICAgICAgICAgICAgc3RhdGU6IG51bGwsXG4gICAgICAgICAgICBhbHdheXNSZXF1aXJlTG9naW46IGZhbHNlLFxuICAgICAgICAgICAgcmVkaXJlY3RVcmlSZW1vdmVIYXNoOiBmYWxzZSxcbiAgICAgICAgICAgIGF1dG9Ub2tlblJlbmV3YWw6IHRydWUsXG4gICAgICAgICAgICBiYXNlUm91dGVVcmw6IG51bGwsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGNvbmZpZ3VyZSA9IChjb25maWc6IE9BdXRoQ29uZmlnKTogT0F1dGhDb25maWcgPT4ge1xuICAgICAgICBpZiAodGhpcy5jb25maWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9BdXRoUHJvdmlkZXIgYWxyZWFkeSBjb25maWd1cmVkLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBzbGFzaCBmcm9tIHVybHMuXG4gICAgICAgIGlmIChjb25maWcubG9naW5Vcmwuc3Vic3RyKC0xKSA9PT0gXCIvXCIpIHtcbiAgICAgICAgICAgIGNvbmZpZy5sb2dpblVybCA9IGNvbmZpZy5sb2dpblVybC5zbGljZSgwLCAtMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29uZmlnLmxvZ291dFVybC5zdWJzdHIoLTEpID09PSBcIi9cIikge1xuICAgICAgICAgICAgY29uZmlnLmxvZ291dFVybCA9IGNvbmZpZy5sb2dvdXRVcmwuc2xpY2UoMCwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRXh0ZW5kIGRlZmF1bHQgY29uZmlndXJhdGlvbi5cbiAgICAgICAgdGhpcy5jb25maWcgPSBvYmplY3RBc3NpZ24odGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAgICAgICAvLyBSZWRpcmVjdCBpcyBzZXQgdG8gY3VycmVudCBsb2NhdGlvbiBieSBkZWZhdWx0XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nSGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgICAgICBsZXQgcGF0aERlZmF1bHQgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcblxuICAgICAgICAvLyBSZW1vdmUgbm90IG5lZWRlZCBwYXJ0cyBmcm9tIHVybHMuXG4gICAgICAgIGlmIChleGlzdGluZ0hhc2ggJiYgY29uZmlnLnJlZGlyZWN0VXJpUmVtb3ZlSGFzaCkge1xuICAgICAgICAgICAgcGF0aERlZmF1bHQgPSBwYXRoRGVmYXVsdC5yZXBsYWNlKGV4aXN0aW5nSGFzaCwgXCJcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGF0aERlZmF1bHQuc3Vic3RyKC0xKSA9PT0gXCIjXCIpIHtcbiAgICAgICAgICAgIHBhdGhEZWZhdWx0ID0gcGF0aERlZmF1bHQuc2xpY2UoMCwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb25maWcucmVkaXJlY3RVcmkgPSBjb25maWcucmVkaXJlY3RVcmkgfHwgcGF0aERlZmF1bHQ7XG4gICAgICAgIHRoaXMuY29uZmlnLmJhc2VSb3V0ZVVybCA9XG4gICAgICAgICAgICBjb25maWcuYmFzZVJvdXRlVXJsIHx8XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgXCIjL1wiO1xuXG4gICAgICAgIHJldHVybiBjb25maWc7XG4gICAgfTtcblxuICAgIHB1YmxpYyBpc0F1dGhlbnRpY2F0ZWQgPSAoKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIHJldHVybiA8YW55PnRoaXMub0F1dGhUb2tlblNlcnZpY2UuZ2V0VG9rZW4oKTtcbiAgICB9O1xuXG4gICAgcHVibGljIGxvZ2luID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHRoaXMuZ2V0UmVkaXJlY3RVcmwoKTtcbiAgICB9O1xuXG4gICAgcHVibGljIGxvZ291dCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPVxuICAgICAgICAgICAgYCR7dGhpcy5jb25maWcubG9nb3V0VXJsfT9gICtcbiAgICAgICAgICAgIGAke3RoaXMuY29uZmlnLmxvZ291dFJlZGlyZWN0UGFyYW1ldGVyTmFtZX09JHtlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcucmVkaXJlY3RVcmlcbiAgICAgICAgICAgICl9YDtcbiAgICAgICAgdGhpcy5vQXV0aFRva2VuU2VydmljZS5yZW1vdmVUb2tlbigpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgbG9naW5PblN0YXRlQ2hhbmdlID0gKHRvU3RhdGUpOiBib29sZWFuID0+IHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgdG9TdGF0ZSAmJlxuICAgICAgICAgICAgdGhpcy5pc0xvZ2luUmVxdWlyZWQodG9TdGF0ZSkgJiZcbiAgICAgICAgICAgICF0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmXG4gICAgICAgICAgICAhdGhpcy5nZXRUb2tlbkRhdGFGcm9tVXJsKClcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5sb2NhbFN0b3JhZ2VTZXJ2aWNlLmlzU3RvcmFnZVN1cHBvcnRlZCgpKSB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0PHN0cmluZz4oXG4gICAgICAgICAgICAgICAgICAgICAgICBPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVlcbiAgICAgICAgICAgICAgICAgICAgKSA9PSBudWxsXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3aW5kb3cubG9jYXRpb24uaGFzaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gdGhpcy5nZXRCYXNlUm91dGVVcmwoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0PHN0cmluZz4oXG4gICAgICAgICAgICAgICAgICAgICAgICBPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVksXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmxvZ2luKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgcHVibGljIHNldFRva2VuT25SZWRpcmVjdCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgdG9rZW5EYXRhID0gdGhpcy5nZXRUb2tlbkRhdGFGcm9tVXJsKCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIHRva2VuRGF0YSkge1xuICAgICAgICAgICAgdGhpcy5vQXV0aFRva2VuU2VydmljZS5zZXRUb2tlbih0b2tlbkRhdGEpO1xuICAgICAgICAgICAgbGV0IF8gPSB0aGlzLmdldEJhc2VSb3V0ZVVybCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5pc1N0b3JhZ2VTdXBwb3J0ZWQoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0UGFnZSA9IHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5nZXQ8c3RyaW5nPihcbiAgICAgICAgICAgICAgICAgICAgT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2UucmVtb3ZlKE9BVVRIX1NUQVJUUEFHRV9TVE9SQUdFX0tFWSk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0UGFnZSkge1xuICAgICAgICAgICAgICAgICAgICBfID0gc3RhcnRQYWdlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZXZlbnRBZ2dyZWdhdG9yLnB1Ymxpc2goXG4gICAgICAgICAgICAgICAgT0F1dGhTZXJ2aWNlLkxPR0lOX1NVQ0NFU1NfRVZFTlQsXG4gICAgICAgICAgICAgICAgdG9rZW5EYXRhXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLmF1dG9Ub2tlblJlbmV3YWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEF1dG9tYXRpY1Rva2VuUmVuZXdhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBfO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgaXNMb2dpblJlcXVpcmVkID0gKHN0YXRlKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGNvbnN0IHJvdXRlSGFzQ29uZmlnID1cbiAgICAgICAgICAgIHN0YXRlLnNldHRpbmdzICYmIHN0YXRlLnNldHRpbmdzLnJlcXVpcmVMb2dpbiAhPT0gdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCByb3V0ZVJlcXVpcmVzTG9naW4gPVxuICAgICAgICAgICAgcm91dGVIYXNDb25maWcgJiYgc3RhdGUuc2V0dGluZ3MucmVxdWlyZUxvZ2luID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgICAgIHJldHVybiByb3V0ZUhhc0NvbmZpZ1xuICAgICAgICAgICAgPyByb3V0ZVJlcXVpcmVzTG9naW5cbiAgICAgICAgICAgIDogdGhpcy5jb25maWcuYWx3YXlzUmVxdWlyZUxvZ2luO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldFRva2VuRGF0YUZyb21VcmwgPSAoaGFzaD86IHN0cmluZyk6IE9BdXRoVG9rZW5EYXRhID0+IHtcbiAgICAgICAgY29uc3QgaGFzaERhdGEgPSB0aGlzLnVybEhhc2hTZXJ2aWNlLmdldEhhc2hEYXRhKGhhc2gpO1xuICAgICAgICBjb25zdCB0b2tlbkRhdGEgPSB0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLmNyZWF0ZVRva2VuKGhhc2hEYXRhKTtcblxuICAgICAgICByZXR1cm4gdG9rZW5EYXRhO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldEJhc2VSb3V0ZVVybCA9ICgpOiBzdHJpbmcgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcuYmFzZVJvdXRlVXJsO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldFNpbXBsZU5vbmNlVmFsdWUgPSAoKTogc3RyaW5nID0+IHtcbiAgICAgICAgcmV0dXJuICgoRGF0ZS5ub3coKSArIE1hdGgucmFuZG9tKCkpICogTWF0aC5yYW5kb20oKSlcbiAgICAgICAgICAgIC50b1N0cmluZygpXG4gICAgICAgICAgICAucmVwbGFjZShcIi5cIiwgXCJcIik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0UmVkaXJlY3RVcmwoKSB7XG4gICAgICAgIGxldCByZWRpcmVjdFVybCA9XG4gICAgICAgICAgICBgJHt0aGlzLmNvbmZpZy5sb2dpblVybH0/YCArXG4gICAgICAgICAgICBgcmVzcG9uc2VfdHlwZT0ke3RoaXMub0F1dGhUb2tlblNlcnZpY2UuY29uZmlnLm5hbWV9JmAgK1xuICAgICAgICAgICAgYGNsaWVudF9pZD0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbmZpZy5jbGllbnRJZCl9JmAgK1xuICAgICAgICAgICAgYHJlZGlyZWN0X3VyaT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbmZpZy5yZWRpcmVjdFVyaSl9JmAgK1xuICAgICAgICAgICAgYG5vbmNlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuZ2V0U2ltcGxlTm9uY2VWYWx1ZSgpKX1gO1xuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5zY29wZSkge1xuICAgICAgICAgICAgcmVkaXJlY3RVcmwgKz0gYCZzY29wZT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbmZpZy5zY29wZSl9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5zdGF0ZSkge1xuICAgICAgICAgICAgcmVkaXJlY3RVcmwgKz0gYCZzdGF0ZT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbmZpZy5zdGF0ZSl9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZWRpcmVjdFVybDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldEF1dG9tYXRpY1Rva2VuUmVuZXdhbCgpIHtcbiAgICAgICAgY29uc3QgdG9rZW5FeHBpcmF0aW9uVGltZSA9XG4gICAgICAgICAgICB0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLmdldFRva2VuRXhwaXJhdGlvblRpbWUoKSAqIDEwMDA7XG5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpRnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaWZyYW1lXCIpO1xuICAgICAgICAgICAgaUZyYW1lLnNyYyA9IHRoaXMuZ2V0UmVkaXJlY3RVcmwoKTtcbiAgICAgICAgICAgIGlGcmFtZS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICBpRnJhbWUub25sb2FkID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGFzaFdpdGhOZXdUb2tlbiA9IGlGcmFtZS5jb250ZW50V2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoaUZyYW1lKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0b2tlbkRhdGEgPVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRUb2tlbkRhdGFGcm9tVXJsKGhhc2hXaXRoTmV3VG9rZW4pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0b2tlbkRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub0F1dGhUb2tlblNlcnZpY2Uuc2V0VG9rZW4odG9rZW5EYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0QXV0b21hdGljVG9rZW5SZW5ld2FsKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpRnJhbWUuY29udGVudFdpbmRvdyBjYW4gZmFpbCB3aGVuIGFuIGlmcmFtZSBsb2FkcyBpZGVudGl0eSBzZXJ2ZXIgbG9naW4gcGFnZVxuICAgICAgICAgICAgICAgICAgICAvLyBidXQgdGhpcyBwYWdlIHdpbGwgbm90IHJlZGlyZWN0IGJhY2sgdG8gdGhlIGFwcCB1cmwgd2FpdGluZyBmb3IgdGhlIHVzZXIgdG8gbG9naW4gaW5cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBiZWhhdmlvdXIgbXkgb2NjdXIgaS5lLiB3aGVuIGxvZ2luIHBhZ2UgYXV0aGVudGljYXRpb24gY29va2llcyBleHBpcmVcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChpRnJhbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaUZyYW1lKTtcbiAgICAgICAgfSwgdG9rZW5FeHBpcmF0aW9uVGltZSk7XG4gICAgfVxufVxuIl19
