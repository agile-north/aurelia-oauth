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
            OAUTH_STARTPAGE_STORAGE_KEY = 'oauth.startPage';
            OAuthService = (function () {
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
            exports_1("OAuthService", OAuthService);
        }
    };
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,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SUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQzs2QkFDckM7d0JBQ0wsQ0FBQyxDQUFDO3dCQUVGLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN0QyxDQUFDLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztnQkFDNUIsQ0FBQzs7Z0JBNUxRLFlBQVk7b0JBRHhCLHlDQUFVLEVBQUU7cURBV3NCLHVDQUFpQjt3QkFDcEIsMEJBQWM7d0JBQ1QsK0JBQW1CLHNCQUN2QiwwQ0FBZSxvQkFBZiwwQ0FBZTttQkFibkMsWUFBWSxDQTZMeEI7Z0JBQUQsbUJBQUM7YUE3TEQsQUE2TEM7O1FBQUEsQ0FBQyIsImZpbGUiOiJvYXV0aC1zZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRBZ2dyZWdhdG9yIH0gZnJvbSAnYXVyZWxpYS1ldmVudC1hZ2dyZWdhdG9yJztcclxuaW1wb3J0IHsgYXV0b2luamVjdCB9IGZyb20gJ2F1cmVsaWEtZGVwZW5kZW5jeS1pbmplY3Rpb24nO1xyXG5cclxuaW1wb3J0IHsgT0F1dGhUb2tlblNlcnZpY2UsIE9BdXRoVG9rZW5EYXRhIH0gZnJvbSAnLi9vYXV0aC10b2tlbi1zZXJ2aWNlJztcclxuaW1wb3J0IFVybEhhc2hTZXJ2aWNlIGZyb20gJy4vdXJsLWhhc2gtc2VydmljZSc7XHJcbmltcG9ydCBMb2NhbFN0b3JhZ2VTZXJ2aWNlIGZyb20gJy4vbG9jYWwtc3RvcmFnZS1zZXJ2aWNlJztcclxuaW1wb3J0IHsgb2JqZWN0QXNzaWduIH0gZnJvbSAnLi9vYXV0aC1wb2x5ZmlsbHMnO1xyXG5cclxuY29uc3QgT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZOiBzdHJpbmcgPSAnb2F1dGguc3RhcnRQYWdlJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgT0F1dGhDb25maWcge1xyXG4gICAgbG9naW5Vcmw6IHN0cmluZztcclxuICAgIGxvZ291dFVybDogc3RyaW5nO1xyXG4gICAgY2xpZW50SWQ6IHN0cmluZztcclxuICAgIGxvZ291dFJlZGlyZWN0UGFyYW1ldGVyTmFtZT86IHN0cmluZztcclxuICAgIHNjb3BlPzogc3RyaW5nO1xyXG4gICAgc3RhdGU/OiBzdHJpbmc7XHJcbiAgICByZWRpcmVjdFVyaT86IHN0cmluZztcclxuICAgIGFsd2F5c1JlcXVpcmVMb2dpbj86IGJvb2xlYW47XHJcbiAgICBhdXRvVG9rZW5SZW5ld2FsPzogYm9vbGVhbjtcclxufVxyXG5cclxuQGF1dG9pbmplY3QoKVxyXG5leHBvcnQgY2xhc3MgT0F1dGhTZXJ2aWNlIHtcclxuXHJcbiAgICBwdWJsaWMgY29uZmlnOiBPQXV0aENvbmZpZztcclxuXHJcbiAgICBwcml2YXRlIGRlZmF1bHRzOiBPQXV0aENvbmZpZztcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldCBMT0dJTl9TVUNDRVNTX0VWRU5UKCk6IHN0cmluZyB7IHJldHVybiAnb2F1dGg6bG9naW5TdWNjZXNzJzsgfVxyXG4gICAgcHVibGljIHN0YXRpYyBnZXQgSU5WQUxJRF9UT0tFTl9FVkVOVCgpOiBzdHJpbmcgeyByZXR1cm4gJ29hdXRoOmludmFsaWRUb2tlbic7IH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIG9BdXRoVG9rZW5TZXJ2aWNlOiBPQXV0aFRva2VuU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHVybEhhc2hTZXJ2aWNlOiBVcmxIYXNoU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIGxvY2FsU3RvcmFnZVNlcnZpY2U6IExvY2FsU3RvcmFnZVNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBldmVudEFnZ3JlZ2F0b3I6IEV2ZW50QWdncmVnYXRvcikge1xyXG5cclxuICAgICAgICB0aGlzLmRlZmF1bHRzID0ge1xyXG4gICAgICAgICAgICBsb2dpblVybDogbnVsbCxcclxuICAgICAgICAgICAgbG9nb3V0VXJsOiBudWxsLFxyXG4gICAgICAgICAgICBjbGllbnRJZDogbnVsbCxcclxuICAgICAgICAgICAgbG9nb3V0UmVkaXJlY3RQYXJhbWV0ZXJOYW1lOiAncG9zdF9sb2dvdXRfcmVkaXJlY3RfdXJpJyxcclxuICAgICAgICAgICAgc2NvcGU6IG51bGwsXHJcbiAgICAgICAgICAgIHN0YXRlOiBudWxsLFxyXG4gICAgICAgICAgICBhbHdheXNSZXF1aXJlTG9naW46IGZhbHNlLFxyXG4gICAgICAgICAgICBhdXRvVG9rZW5SZW5ld2FsOiB0cnVlXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY29uZmlndXJlID0gKGNvbmZpZzogT0F1dGhDb25maWcpOiBPQXV0aENvbmZpZyA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT0F1dGhQcm92aWRlciBhbHJlYWR5IGNvbmZpZ3VyZWQuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgc2xhc2ggZnJvbSB1cmxzLlxyXG4gICAgICAgIGlmIChjb25maWcubG9naW5Vcmwuc3Vic3RyKC0xKSA9PT0gJy8nKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5sb2dpblVybCA9IGNvbmZpZy5sb2dpblVybC5zbGljZSgwLCAtMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLmxvZ291dFVybC5zdWJzdHIoLTEpID09PSAnLycpIHtcclxuICAgICAgICAgICAgY29uZmlnLmxvZ291dFVybCA9IGNvbmZpZy5sb2dvdXRVcmwuc2xpY2UoMCwgLTEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXh0ZW5kIGRlZmF1bHQgY29uZmlndXJhdGlvbi5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IG9iamVjdEFzc2lnbih0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xyXG5cclxuICAgICAgICAvLyBSZWRpcmVjdCBpcyBzZXQgdG8gY3VycmVudCBsb2NhdGlvbiBieSBkZWZhdWx0XHJcbiAgICAgICAgY29uc3QgZXhpc3RpbmdIYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XHJcbiAgICAgICAgbGV0IHBhdGhEZWZhdWx0ID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBub3QgbmVlZGVkIHBhcnRzIGZyb20gdXJscy5cclxuICAgICAgICBpZiAoZXhpc3RpbmdIYXNoKSB7XHJcbiAgICAgICAgICAgIHBhdGhEZWZhdWx0ID0gcGF0aERlZmF1bHQucmVwbGFjZShleGlzdGluZ0hhc2gsICcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwYXRoRGVmYXVsdC5zdWJzdHIoLTEpID09PSAnIycpIHtcclxuICAgICAgICAgICAgcGF0aERlZmF1bHQgPSBwYXRoRGVmYXVsdC5zbGljZSgwLCAtMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZy5yZWRpcmVjdFVyaSA9IGNvbmZpZy5yZWRpcmVjdFVyaSB8fCBwYXRoRGVmYXVsdDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbmZpZztcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGlzQXV0aGVudGljYXRlZCA9ICgpOiBib29sZWFuID0+IHtcclxuICAgICAgICByZXR1cm4gPGFueT50aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLmdldFRva2VuKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBsb2dpbiA9ICgpOiB2b2lkID0+IHtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHRoaXMuZ2V0UmVkaXJlY3RVcmwoKTtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGxvZ291dCA9ICgpOiB2b2lkID0+IHtcclxuICAgICAgICBjb25zdCByZWRpcmVjdFVybCA9IGAke3RoaXMuY29uZmlnLmxvZ291dFVybH0/YCArXHJcbiAgICAgICAgICAgIGAke3RoaXMuY29uZmlnLmxvZ291dFJlZGlyZWN0UGFyYW1ldGVyTmFtZX09JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5jb25maWcucmVkaXJlY3RVcmkpfWA7XHJcblxyXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcmVkaXJlY3RVcmw7XHJcbiAgICAgICAgdGhpcy5vQXV0aFRva2VuU2VydmljZS5yZW1vdmVUb2tlbigpO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgbG9naW5PblN0YXRlQ2hhbmdlID0gKHRvU3RhdGUpOiBib29sZWFuID0+IHtcclxuICAgICAgICBpZiAodG9TdGF0ZSAmJiB0aGlzLmlzTG9naW5SZXF1aXJlZCh0b1N0YXRlKSAmJiAhdGhpcy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiAhdGhpcy5nZXRUb2tlbkRhdGFGcm9tVXJsKCkpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5pc1N0b3JhZ2VTdXBwb3J0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5sb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldDxzdHJpbmc+KE9BVVRIX1NUQVJUUEFHRV9TVE9SQUdFX0tFWSkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IHRoaXMuZ2V0QmFzZVJvdXRlVXJsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5zZXQ8c3RyaW5nPihPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVksIHVybCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5sb2dpbigpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIHNldFRva2VuT25SZWRpcmVjdCA9ICgpOiB2b2lkID0+IHtcclxuICAgICAgICBjb25zdCB0b2tlbkRhdGEgPSB0aGlzLmdldFRva2VuRGF0YUZyb21VcmwoKTtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIHRva2VuRGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLnNldFRva2VuKHRva2VuRGF0YSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5sb2NhbFN0b3JhZ2VTZXJ2aWNlLmlzU3RvcmFnZVN1cHBvcnRlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzdGFydFBhZ2UgPSB0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0PHN0cmluZz4oT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2UucmVtb3ZlKE9BVVRIX1NUQVJUUEFHRV9TVE9SQUdFX0tFWSk7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHN0YXJ0UGFnZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIFJlZGlyZWN0IHRvIHRoZSBiYXNlIGFwcGxpY2F0aW9uIHJvdXRlXHJcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHRoaXMuZ2V0QmFzZVJvdXRlVXJsKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRBZ2dyZWdhdG9yLnB1Ymxpc2goT0F1dGhTZXJ2aWNlLkxPR0lOX1NVQ0NFU1NfRVZFTlQsIHRva2VuRGF0YSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5jb25maWcuYXV0b1Rva2VuUmVuZXdhbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdXRvbWF0aWNUb2tlblJlbmV3YWwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBpc0xvZ2luUmVxdWlyZWQgPSAoc3RhdGUpOiBib29sZWFuID0+IHtcclxuICAgICAgICBjb25zdCByb3V0ZUhhc0NvbmZpZyA9IHN0YXRlLnNldHRpbmdzICYmIHN0YXRlLnNldHRpbmdzLnJlcXVpcmVMb2dpbiAhPT0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGNvbnN0IHJvdXRlUmVxdWlyZXNMb2dpbiA9IHJvdXRlSGFzQ29uZmlnICYmIHN0YXRlLnNldHRpbmdzLnJlcXVpcmVMb2dpbiA/IHRydWUgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJvdXRlSGFzQ29uZmlnID8gcm91dGVSZXF1aXJlc0xvZ2luIDogdGhpcy5jb25maWcuYWx3YXlzUmVxdWlyZUxvZ2luO1xyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIGdldFRva2VuRGF0YUZyb21VcmwgPSAoaGFzaD86IHN0cmluZyk6IE9BdXRoVG9rZW5EYXRhID0+IHtcclxuICAgICAgICBjb25zdCBoYXNoRGF0YSA9IHRoaXMudXJsSGFzaFNlcnZpY2UuZ2V0SGFzaERhdGEoaGFzaCk7XHJcbiAgICAgICAgY29uc3QgdG9rZW5EYXRhID0gdGhpcy5vQXV0aFRva2VuU2VydmljZS5jcmVhdGVUb2tlbihoYXNoRGF0YSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0b2tlbkRhdGE7XHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgZ2V0QmFzZVJvdXRlVXJsID0gKCk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyAnLyMvJztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFNpbXBsZU5vbmNlVmFsdWUgPSAoKTogc3RyaW5nID0+IHtcclxuICAgICAgICByZXR1cm4gKChEYXRlLm5vdygpICsgTWF0aC5yYW5kb20oKSkgKiBNYXRoLnJhbmRvbSgpKS50b1N0cmluZygpLnJlcGxhY2UoJy4nLCAnJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRSZWRpcmVjdFVybCgpIHtcclxuICAgICAgICBsZXQgcmVkaXJlY3RVcmwgPSBgJHt0aGlzLmNvbmZpZy5sb2dpblVybH0/YCArXHJcbiAgICAgICAgICAgIGByZXNwb25zZV90eXBlPSR7dGhpcy5vQXV0aFRva2VuU2VydmljZS5jb25maWcubmFtZX0mYCArXHJcbiAgICAgICAgICAgIGBjbGllbnRfaWQ9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5jb25maWcuY2xpZW50SWQpfSZgICtcclxuICAgICAgICAgICAgYHJlZGlyZWN0X3VyaT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbmZpZy5yZWRpcmVjdFVyaSl9JmAgK1xyXG4gICAgICAgICAgICBgbm9uY2U9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5nZXRTaW1wbGVOb25jZVZhbHVlKCkpfWA7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5zY29wZSkge1xyXG4gICAgICAgICAgICByZWRpcmVjdFVybCArPSBgJnNjb3BlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY29uZmlnLnNjb3BlKX1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnN0YXRlKSB7XHJcbiAgICAgICAgICAgIHJlZGlyZWN0VXJsICs9IGAmc3RhdGU9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5jb25maWcuc3RhdGUpfWA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVkaXJlY3RVcmw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRBdXRvbWF0aWNUb2tlblJlbmV3YWwoKSB7XHJcbiAgICAgICAgY29uc3QgdG9rZW5FeHBpcmF0aW9uVGltZSA9IHRoaXMub0F1dGhUb2tlblNlcnZpY2UuZ2V0VG9rZW5FeHBpcmF0aW9uVGltZSgpICogMTAwMDtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlGcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xyXG4gICAgICAgICAgICBpRnJhbWUuc3JjID0gdGhpcy5nZXRSZWRpcmVjdFVybCgpO1xyXG4gICAgICAgICAgICBpRnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgaUZyYW1lLm9ubG9hZCA9IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBoYXNoV2l0aE5ld1Rva2VuID0gaUZyYW1lLmNvbnRlbnRXaW5kb3cubG9jYXRpb24uaGFzaDtcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGlGcmFtZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRva2VuRGF0YSA9IHRoaXMuZ2V0VG9rZW5EYXRhRnJvbVVybChoYXNoV2l0aE5ld1Rva2VuKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRva2VuRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLnNldFRva2VuKHRva2VuRGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0QXV0b21hdGljVG9rZW5SZW5ld2FsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpRnJhbWUuY29udGVudFdpbmRvdyBjYW4gZmFpbCB3aGVuIGFuIGlmcmFtZSBsb2FkcyBpZGVudGl0eSBzZXJ2ZXIgbG9naW4gcGFnZVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGJ1dCB0aGlzIHBhZ2Ugd2lsbCBub3QgcmVkaXJlY3QgYmFjayB0byB0aGUgYXBwIHVybCB3YWl0aW5nIGZvciB0aGUgdXNlciB0byBsb2dpbiBpblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgYmVoYXZpb3VyIG15IG9jY3VyIGkuZS4gd2hlbiBsb2dpbiBwYWdlIGF1dGhlbnRpY2F0aW9uIGNvb2tpZXMgZXhwaXJlXHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChpRnJhbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpRnJhbWUpO1xyXG4gICAgICAgIH0sIHRva2VuRXhwaXJhdGlvblRpbWUpO1xyXG4gICAgfVxyXG59Il19
