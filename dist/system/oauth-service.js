System.register(["aurelia-event-aggregator", "aurelia-dependency-injection", "./oauth-token-service", "./url-hash-service", "./local-storage-service", "./oauth-polyfills"], function (exports_1, context_1) {
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
    var aurelia_event_aggregator_1, aurelia_dependency_injection_1, oauth_token_service_1, url_hash_service_1, local_storage_service_1, oauth_polyfills_1, OAUTH_STARTPAGE_STORAGE_KEY, OAuthService;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (aurelia_event_aggregator_1_1) {
                aurelia_event_aggregator_1 = aurelia_event_aggregator_1_1;
            },
            function (aurelia_dependency_injection_1_1) {
                aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
            },
            function (oauth_token_service_1_1) {
                oauth_token_service_1 = oauth_token_service_1_1;
            },
            function (url_hash_service_1_1) {
                url_hash_service_1 = url_hash_service_1_1;
            },
            function (local_storage_service_1_1) {
                local_storage_service_1 = local_storage_service_1_1;
            },
            function (oauth_polyfills_1_1) {
                oauth_polyfills_1 = oauth_polyfills_1_1;
            }
        ],
        execute: function () {
            OAUTH_STARTPAGE_STORAGE_KEY = "oauth.startPage";
            OAuthService = (function () {
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
            exports_1("OAuthService", OAuthService);
        }
    };
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,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TSxTQUFTLEdBQ1gsS0FBSSxDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0NBRS9DLElBQUksU0FBUyxFQUFFO29DQUNYLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7b0NBQzNDLEtBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO2lDQUNuQzs2QkFDSjs0QkFBQyxPQUFPLEVBQUUsRUFBRTtnQ0FJVCxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQzs2QkFDckM7d0JBQ0wsQ0FBQyxDQUFDO3dCQUVGLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN0QyxDQUFDLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztnQkFDNUIsQ0FBQzs7Z0JBN05RLFlBQVk7b0JBRHhCLHlDQUFVLEVBQUU7cURBZXNCLHVDQUFpQjt3QkFDcEIsMEJBQWM7d0JBQ1QsK0JBQW1CO3dCQUN2QiwwQ0FBZTttQkFqQm5DLFlBQVksQ0E4TnhCO2dCQUFELG1CQUFDO2FBOU5ELEFBOE5DOztRQUNELENBQUMiLCJmaWxlIjoib2F1dGgtc2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEB0cy1pZ25vcmVcbmltcG9ydCB7IEV2ZW50QWdncmVnYXRvciB9IGZyb20gXCJhdXJlbGlhLWV2ZW50LWFnZ3JlZ2F0b3JcIjtcbmltcG9ydCB7IGF1dG9pbmplY3QgfSBmcm9tIFwiYXVyZWxpYS1kZXBlbmRlbmN5LWluamVjdGlvblwiO1xuXG5pbXBvcnQgeyBPQXV0aFRva2VuRGF0YSwgT0F1dGhUb2tlblNlcnZpY2UgfSBmcm9tIFwiLi9vYXV0aC10b2tlbi1zZXJ2aWNlXCI7XG5pbXBvcnQgVXJsSGFzaFNlcnZpY2UgZnJvbSBcIi4vdXJsLWhhc2gtc2VydmljZVwiO1xuaW1wb3J0IExvY2FsU3RvcmFnZVNlcnZpY2UgZnJvbSBcIi4vbG9jYWwtc3RvcmFnZS1zZXJ2aWNlXCI7XG5pbXBvcnQgeyBvYmplY3RBc3NpZ24gfSBmcm9tIFwiLi9vYXV0aC1wb2x5ZmlsbHNcIjtcblxuY29uc3QgT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZOiBzdHJpbmcgPSBcIm9hdXRoLnN0YXJ0UGFnZVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9BdXRoQ29uZmlnIHtcbiAgICBsb2dpblVybDogc3RyaW5nO1xuICAgIGxvZ291dFVybDogc3RyaW5nO1xuICAgIGNsaWVudElkOiBzdHJpbmc7XG4gICAgbG9nb3V0UmVkaXJlY3RQYXJhbWV0ZXJOYW1lPzogc3RyaW5nO1xuICAgIHNjb3BlPzogc3RyaW5nO1xuICAgIHN0YXRlPzogc3RyaW5nO1xuICAgIHJlZGlyZWN0VXJpPzogc3RyaW5nO1xuICAgIHJlZGlyZWN0VXJpUmVtb3ZlSGFzaD86IGJvb2xlYW47XG4gICAgYWx3YXlzUmVxdWlyZUxvZ2luPzogYm9vbGVhbjtcbiAgICBhdXRvVG9rZW5SZW5ld2FsPzogYm9vbGVhbjtcbiAgICBiYXNlUm91dGVVcmw6IHN0cmluZztcbn1cblxuQGF1dG9pbmplY3QoKVxuZXhwb3J0IGNsYXNzIE9BdXRoU2VydmljZSB7XG4gICAgcHVibGljIGNvbmZpZzogT0F1dGhDb25maWc7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IGRlZmF1bHRzOiBPQXV0aENvbmZpZztcblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IExPR0lOX1NVQ0NFU1NfRVZFTlQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwib2F1dGg6bG9naW5TdWNjZXNzXCI7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXQgSU5WQUxJRF9UT0tFTl9FVkVOVCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gXCJvYXV0aDppbnZhbGlkVG9rZW5cIjtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBvQXV0aFRva2VuU2VydmljZTogT0F1dGhUb2tlblNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgdXJsSGFzaFNlcnZpY2U6IFVybEhhc2hTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGxvY2FsU3RvcmFnZVNlcnZpY2U6IExvY2FsU3RvcmFnZVNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgZXZlbnRBZ2dyZWdhdG9yOiBFdmVudEFnZ3JlZ2F0b3JcbiAgICApIHtcbiAgICAgICAgdGhpcy5kZWZhdWx0cyA9IHtcbiAgICAgICAgICAgIGxvZ2luVXJsOiBudWxsLFxuICAgICAgICAgICAgbG9nb3V0VXJsOiBudWxsLFxuICAgICAgICAgICAgY2xpZW50SWQ6IG51bGwsXG4gICAgICAgICAgICBsb2dvdXRSZWRpcmVjdFBhcmFtZXRlck5hbWU6IFwicG9zdF9sb2dvdXRfcmVkaXJlY3RfdXJpXCIsXG4gICAgICAgICAgICBzY29wZTogbnVsbCxcbiAgICAgICAgICAgIHN0YXRlOiBudWxsLFxuICAgICAgICAgICAgYWx3YXlzUmVxdWlyZUxvZ2luOiBmYWxzZSxcbiAgICAgICAgICAgIHJlZGlyZWN0VXJpUmVtb3ZlSGFzaDogZmFsc2UsXG4gICAgICAgICAgICBhdXRvVG9rZW5SZW5ld2FsOiB0cnVlLFxuICAgICAgICAgICAgYmFzZVJvdXRlVXJsOiBudWxsLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBjb25maWd1cmUgPSAoY29uZmlnOiBPQXV0aENvbmZpZyk6IE9BdXRoQ29uZmlnID0+IHtcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPQXV0aFByb3ZpZGVyIGFscmVhZHkgY29uZmlndXJlZC5cIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgc2xhc2ggZnJvbSB1cmxzLlxuICAgICAgICBpZiAoY29uZmlnLmxvZ2luVXJsLnN1YnN0cigtMSkgPT09IFwiL1wiKSB7XG4gICAgICAgICAgICBjb25maWcubG9naW5VcmwgPSBjb25maWcubG9naW5Vcmwuc2xpY2UoMCwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbmZpZy5sb2dvdXRVcmwuc3Vic3RyKC0xKSA9PT0gXCIvXCIpIHtcbiAgICAgICAgICAgIGNvbmZpZy5sb2dvdXRVcmwgPSBjb25maWcubG9nb3V0VXJsLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEV4dGVuZCBkZWZhdWx0IGNvbmZpZ3VyYXRpb24uXG4gICAgICAgIHRoaXMuY29uZmlnID0gb2JqZWN0QXNzaWduKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgICAgICAgLy8gUmVkaXJlY3QgaXMgc2V0IHRvIGN1cnJlbnQgbG9jYXRpb24gYnkgZGVmYXVsdFxuICAgICAgICBjb25zdCBleGlzdGluZ0hhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICAgICAgbGV0IHBhdGhEZWZhdWx0ID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG5cbiAgICAgICAgLy8gUmVtb3ZlIG5vdCBuZWVkZWQgcGFydHMgZnJvbSB1cmxzLlxuICAgICAgICBpZiAoZXhpc3RpbmdIYXNoICYmIGNvbmZpZy5yZWRpcmVjdFVyaVJlbW92ZUhhc2gpIHtcbiAgICAgICAgICAgIHBhdGhEZWZhdWx0ID0gcGF0aERlZmF1bHQucmVwbGFjZShleGlzdGluZ0hhc2gsIFwiXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhdGhEZWZhdWx0LnN1YnN0cigtMSkgPT09IFwiI1wiKSB7XG4gICAgICAgICAgICBwYXRoRGVmYXVsdCA9IHBhdGhEZWZhdWx0LnNsaWNlKDAsIC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY29uZmlnLnJlZGlyZWN0VXJpID0gY29uZmlnLnJlZGlyZWN0VXJpIHx8IHBhdGhEZWZhdWx0O1xuICAgICAgICB0aGlzLmNvbmZpZy5iYXNlUm91dGVVcmwgPVxuICAgICAgICAgICAgY29uZmlnLmJhc2VSb3V0ZVVybCB8fFxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIFwiIy9cIjtcblxuICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgIH07XG5cbiAgICBwdWJsaWMgaXNBdXRoZW50aWNhdGVkID0gKCk6IGJvb2xlYW4gPT4ge1xuICAgICAgICByZXR1cm4gPGFueT50aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLmdldFRva2VuKCk7XG4gICAgfTtcblxuICAgIHB1YmxpYyBsb2dpbiA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB0aGlzLmdldFJlZGlyZWN0VXJsKCk7XG4gICAgfTtcblxuICAgIHB1YmxpYyBsb2dvdXQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID1cbiAgICAgICAgICAgIGAke3RoaXMuY29uZmlnLmxvZ291dFVybH0/YCArXG4gICAgICAgICAgICBgJHt0aGlzLmNvbmZpZy5sb2dvdXRSZWRpcmVjdFBhcmFtZXRlck5hbWV9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLnJlZGlyZWN0VXJpXG4gICAgICAgICAgICApfWA7XG4gICAgICAgIHRoaXMub0F1dGhUb2tlblNlcnZpY2UucmVtb3ZlVG9rZW4oKTtcbiAgICB9O1xuXG4gICAgcHVibGljIGxvZ2luT25TdGF0ZUNoYW5nZSA9ICh0b1N0YXRlKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHRvU3RhdGUgJiZcbiAgICAgICAgICAgIHRoaXMuaXNMb2dpblJlcXVpcmVkKHRvU3RhdGUpICYmXG4gICAgICAgICAgICAhdGhpcy5pc0F1dGhlbnRpY2F0ZWQoKSAmJlxuICAgICAgICAgICAgIXRoaXMuZ2V0VG9rZW5EYXRhRnJvbVVybCgpXG4gICAgICAgICkge1xuICAgICAgICAgICAgaWYgKHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5pc1N0b3JhZ2VTdXBwb3J0ZWQoKSkge1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldDxzdHJpbmc+KFxuICAgICAgICAgICAgICAgICAgICAgICAgT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZXG4gICAgICAgICAgICAgICAgICAgICkgPT0gbnVsbFxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgICAgICAgICAgICAgICAgIGlmICghd2luZG93LmxvY2F0aW9uLmhhc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IHRoaXMuZ2V0QmFzZVJvdXRlVXJsKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldDxzdHJpbmc+KFxuICAgICAgICAgICAgICAgICAgICAgICAgT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5sb2dpbigpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIHB1YmxpYyBzZXRUb2tlbk9uUmVkaXJlY3QgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHRva2VuRGF0YSA9IHRoaXMuZ2V0VG9rZW5EYXRhRnJvbVVybCgpO1xuXG4gICAgICAgIGlmICghdGhpcy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiB0b2tlbkRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMub0F1dGhUb2tlblNlcnZpY2Uuc2V0VG9rZW4odG9rZW5EYXRhKTtcbiAgICAgICAgICAgIGxldCBfID0gdGhpcy5nZXRCYXNlUm91dGVVcmwoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2UuaXNTdG9yYWdlU3VwcG9ydGVkKCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGFydFBhZ2UgPSB0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0PHN0cmluZz4oXG4gICAgICAgICAgICAgICAgICAgIE9BVVRIX1NUQVJUUEFHRV9TVE9SQUdFX0tFWVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVkpO1xuICAgICAgICAgICAgICAgIGlmIChzdGFydFBhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgXyA9IHN0YXJ0UGFnZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmV2ZW50QWdncmVnYXRvci5wdWJsaXNoKFxuICAgICAgICAgICAgICAgIE9BdXRoU2VydmljZS5MT0dJTl9TVUNDRVNTX0VWRU5ULFxuICAgICAgICAgICAgICAgIHRva2VuRGF0YVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5hdXRvVG9rZW5SZW5ld2FsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdXRvbWF0aWNUb2tlblJlbmV3YWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGlzTG9naW5SZXF1aXJlZCA9IChzdGF0ZSk6IGJvb2xlYW4gPT4ge1xuICAgICAgICBjb25zdCByb3V0ZUhhc0NvbmZpZyA9XG4gICAgICAgICAgICBzdGF0ZS5zZXR0aW5ncyAmJiBzdGF0ZS5zZXR0aW5ncy5yZXF1aXJlTG9naW4gIT09IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3Qgcm91dGVSZXF1aXJlc0xvZ2luID1cbiAgICAgICAgICAgIHJvdXRlSGFzQ29uZmlnICYmIHN0YXRlLnNldHRpbmdzLnJlcXVpcmVMb2dpbiA/IHRydWUgOiBmYWxzZTtcblxuICAgICAgICByZXR1cm4gcm91dGVIYXNDb25maWdcbiAgICAgICAgICAgID8gcm91dGVSZXF1aXJlc0xvZ2luXG4gICAgICAgICAgICA6IHRoaXMuY29uZmlnLmFsd2F5c1JlcXVpcmVMb2dpbjtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRUb2tlbkRhdGFGcm9tVXJsID0gKGhhc2g/OiBzdHJpbmcpOiBPQXV0aFRva2VuRGF0YSA9PiB7XG4gICAgICAgIGNvbnN0IGhhc2hEYXRhID0gdGhpcy51cmxIYXNoU2VydmljZS5nZXRIYXNoRGF0YShoYXNoKTtcbiAgICAgICAgY29uc3QgdG9rZW5EYXRhID0gdGhpcy5vQXV0aFRva2VuU2VydmljZS5jcmVhdGVUb2tlbihoYXNoRGF0YSk7XG5cbiAgICAgICAgcmV0dXJuIHRva2VuRGF0YTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRCYXNlUm91dGVVcmwgPSAoKTogc3RyaW5nID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLmJhc2VSb3V0ZVVybDtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRTaW1wbGVOb25jZVZhbHVlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgICAgIHJldHVybiAoKERhdGUubm93KCkgKyBNYXRoLnJhbmRvbSgpKSAqIE1hdGgucmFuZG9tKCkpXG4gICAgICAgICAgICAudG9TdHJpbmcoKVxuICAgICAgICAgICAgLnJlcGxhY2UoXCIuXCIsIFwiXCIpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldFJlZGlyZWN0VXJsKCkge1xuICAgICAgICBsZXQgcmVkaXJlY3RVcmwgPVxuICAgICAgICAgICAgYCR7dGhpcy5jb25maWcubG9naW5Vcmx9P2AgK1xuICAgICAgICAgICAgYHJlc3BvbnNlX3R5cGU9JHt0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLmNvbmZpZy5uYW1lfSZgICtcbiAgICAgICAgICAgIGBjbGllbnRfaWQ9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5jb25maWcuY2xpZW50SWQpfSZgICtcbiAgICAgICAgICAgIGByZWRpcmVjdF91cmk9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5jb25maWcucmVkaXJlY3RVcmkpfSZgICtcbiAgICAgICAgICAgIGBub25jZT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmdldFNpbXBsZU5vbmNlVmFsdWUoKSl9YDtcblxuICAgICAgICBpZiAodGhpcy5jb25maWcuc2NvcGUpIHtcbiAgICAgICAgICAgIHJlZGlyZWN0VXJsICs9IGAmc2NvcGU9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5jb25maWcuc2NvcGUpfWA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jb25maWcuc3RhdGUpIHtcbiAgICAgICAgICAgIHJlZGlyZWN0VXJsICs9IGAmc3RhdGU9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5jb25maWcuc3RhdGUpfWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVkaXJlY3RVcmw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRBdXRvbWF0aWNUb2tlblJlbmV3YWwoKSB7XG4gICAgICAgIGNvbnN0IHRva2VuRXhwaXJhdGlvblRpbWUgPVxuICAgICAgICAgICAgdGhpcy5vQXV0aFRva2VuU2VydmljZS5nZXRUb2tlbkV4cGlyYXRpb25UaW1lKCkgKiAxMDAwO1xuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaUZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlmcmFtZVwiKTtcbiAgICAgICAgICAgIGlGcmFtZS5zcmMgPSB0aGlzLmdldFJlZGlyZWN0VXJsKCk7XG4gICAgICAgICAgICBpRnJhbWUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgaUZyYW1lLm9ubG9hZCA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc2hXaXRoTmV3VG9rZW4gPSBpRnJhbWUuY29udGVudFdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGlGcmFtZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9rZW5EYXRhID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0VG9rZW5EYXRhRnJvbVVybChoYXNoV2l0aE5ld1Rva2VuKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodG9rZW5EYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLnNldFRva2VuKHRva2VuRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEF1dG9tYXRpY1Rva2VuUmVuZXdhbCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaUZyYW1lLmNvbnRlbnRXaW5kb3cgY2FuIGZhaWwgd2hlbiBhbiBpZnJhbWUgbG9hZHMgaWRlbnRpdHkgc2VydmVyIGxvZ2luIHBhZ2VcbiAgICAgICAgICAgICAgICAgICAgLy8gYnV0IHRoaXMgcGFnZSB3aWxsIG5vdCByZWRpcmVjdCBiYWNrIHRvIHRoZSBhcHAgdXJsIHdhaXRpbmcgZm9yIHRoZSB1c2VyIHRvIGxvZ2luIGluXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgYmVoYXZpb3VyIG15IG9jY3VyIGkuZS4gd2hlbiBsb2dpbiBwYWdlIGF1dGhlbnRpY2F0aW9uIGNvb2tpZXMgZXhwaXJlXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoaUZyYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGlGcmFtZSk7XG4gICAgICAgIH0sIHRva2VuRXhwaXJhdGlvblRpbWUpO1xuICAgIH1cbn1cbiJdfQ==
