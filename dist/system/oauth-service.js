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
            exports_1("OAuthService", OAuthService);
        }
    };
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9vYXV0aC1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBU00sMkJBQTJCLEdBQVcsaUJBQWlCLENBQUM7O2dCQThCMUQsc0JBQ1ksaUJBQW9DLEVBQ3BDLGNBQThCLEVBQzlCLG1CQUF3QyxFQUN4QyxlQUFnQztvQkFKNUMsaUJBaUJDO29CQWhCVyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO29CQUNwQyxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7b0JBQzlCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7b0JBQ3hDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtvQkFlckMsY0FBUyxHQUFHLFVBQUMsTUFBbUI7d0JBQ25DLElBQUksS0FBSSxDQUFDLE1BQU0sRUFBRTs0QkFDYixNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7eUJBQ3hEO3dCQUdELElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7NEJBQ3BDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2xEO3dCQUVELElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7NEJBQ3JDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ3BEO3dCQUdELEtBQUksQ0FBQyxNQUFNLEdBQUcsOEJBQVksQ0FBQyxLQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUdsRCxJQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQzt3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b0NBQ1gsS0FBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQ0FDM0MsS0FBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7aUNBQ25DOzZCQUNKOzRCQUFDLE9BQU8sRUFBRSxFQUFFO2dDQUlULFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzZCQUNyQzt3QkFDTCxDQUFDLENBQUM7d0JBRUYsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3RDLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO2dCQUM1QixDQUFDOztnQkE5TFEsWUFBWTtvQkFEeEIseUNBQVUsRUFBRTtxREFnQnNCLHVDQUFpQjt3QkFDcEIsMEJBQWM7d0JBQ1QsK0JBQW1CLHNCQUN2QiwwQ0FBZSxvQkFBZiwwQ0FBZTttQkFsQm5DLFlBQVksQ0ErTHhCO2dCQUFELG1CQUFDO2FBL0xELEFBK0xDOztRQUFBLENBQUMiLCJmaWxlIjoib2F1dGgtc2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEB0cy1pZ25vcmVcbmltcG9ydCB7RXZlbnRBZ2dyZWdhdG9yfSBmcm9tICdhdXJlbGlhLWV2ZW50LWFnZ3JlZ2F0b3InO1xuaW1wb3J0IHthdXRvaW5qZWN0fSBmcm9tICdhdXJlbGlhLWRlcGVuZGVuY3ktaW5qZWN0aW9uJztcblxuaW1wb3J0IHtPQXV0aFRva2VuRGF0YSwgT0F1dGhUb2tlblNlcnZpY2V9IGZyb20gJy4vb2F1dGgtdG9rZW4tc2VydmljZSc7XG5pbXBvcnQgVXJsSGFzaFNlcnZpY2UgZnJvbSAnLi91cmwtaGFzaC1zZXJ2aWNlJztcbmltcG9ydCBMb2NhbFN0b3JhZ2VTZXJ2aWNlIGZyb20gJy4vbG9jYWwtc3RvcmFnZS1zZXJ2aWNlJztcbmltcG9ydCB7b2JqZWN0QXNzaWdufSBmcm9tICcuL29hdXRoLXBvbHlmaWxscyc7XG5cbmNvbnN0IE9BVVRIX1NUQVJUUEFHRV9TVE9SQUdFX0tFWTogc3RyaW5nID0gJ29hdXRoLnN0YXJ0UGFnZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT0F1dGhDb25maWcge1xuICAgIGxvZ2luVXJsOiBzdHJpbmc7XG4gICAgbG9nb3V0VXJsOiBzdHJpbmc7XG4gICAgY2xpZW50SWQ6IHN0cmluZztcbiAgICBsb2dvdXRSZWRpcmVjdFBhcmFtZXRlck5hbWU/OiBzdHJpbmc7XG4gICAgc2NvcGU/OiBzdHJpbmc7XG4gICAgc3RhdGU/OiBzdHJpbmc7XG4gICAgcmVkaXJlY3RVcmk/OiBzdHJpbmc7XG4gICAgYWx3YXlzUmVxdWlyZUxvZ2luPzogYm9vbGVhbjtcbiAgICBhdXRvVG9rZW5SZW5ld2FsPzogYm9vbGVhbjtcbiAgICBiYXNlUm91dGVVcmw6IHN0cmluZztcbn1cblxuQGF1dG9pbmplY3QoKVxuZXhwb3J0IGNsYXNzIE9BdXRoU2VydmljZSB7XG5cbiAgICBwdWJsaWMgY29uZmlnOiBPQXV0aENvbmZpZztcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgZGVmYXVsdHM6IE9BdXRoQ29uZmlnO1xuXG4gICAgcHVibGljIHN0YXRpYyBnZXQgTE9HSU5fU1VDQ0VTU19FVkVOVCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gJ29hdXRoOmxvZ2luU3VjY2Vzcyc7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXQgSU5WQUxJRF9UT0tFTl9FVkVOVCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gJ29hdXRoOmludmFsaWRUb2tlbic7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgb0F1dGhUb2tlblNlcnZpY2U6IE9BdXRoVG9rZW5TZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHVybEhhc2hTZXJ2aWNlOiBVcmxIYXNoU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBsb2NhbFN0b3JhZ2VTZXJ2aWNlOiBMb2NhbFN0b3JhZ2VTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGV2ZW50QWdncmVnYXRvcjogRXZlbnRBZ2dyZWdhdG9yKSB7XG5cbiAgICAgICAgdGhpcy5kZWZhdWx0cyA9IHtcbiAgICAgICAgICAgIGxvZ2luVXJsOiBudWxsLFxuICAgICAgICAgICAgbG9nb3V0VXJsOiBudWxsLFxuICAgICAgICAgICAgY2xpZW50SWQ6IG51bGwsXG4gICAgICAgICAgICBsb2dvdXRSZWRpcmVjdFBhcmFtZXRlck5hbWU6ICdwb3N0X2xvZ291dF9yZWRpcmVjdF91cmknLFxuICAgICAgICAgICAgc2NvcGU6IG51bGwsXG4gICAgICAgICAgICBzdGF0ZTogbnVsbCxcbiAgICAgICAgICAgIGFsd2F5c1JlcXVpcmVMb2dpbjogZmFsc2UsXG4gICAgICAgICAgICBhdXRvVG9rZW5SZW5ld2FsOiB0cnVlLFxuICAgICAgICAgICAgYmFzZVJvdXRlVXJsOiBudWxsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGNvbmZpZ3VyZSA9IChjb25maWc6IE9BdXRoQ29uZmlnKTogT0F1dGhDb25maWcgPT4ge1xuICAgICAgICBpZiAodGhpcy5jb25maWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT0F1dGhQcm92aWRlciBhbHJlYWR5IGNvbmZpZ3VyZWQuJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgc2xhc2ggZnJvbSB1cmxzLlxuICAgICAgICBpZiAoY29uZmlnLmxvZ2luVXJsLnN1YnN0cigtMSkgPT09ICcvJykge1xuICAgICAgICAgICAgY29uZmlnLmxvZ2luVXJsID0gY29uZmlnLmxvZ2luVXJsLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb25maWcubG9nb3V0VXJsLnN1YnN0cigtMSkgPT09ICcvJykge1xuICAgICAgICAgICAgY29uZmlnLmxvZ291dFVybCA9IGNvbmZpZy5sb2dvdXRVcmwuc2xpY2UoMCwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRXh0ZW5kIGRlZmF1bHQgY29uZmlndXJhdGlvbi5cbiAgICAgICAgdGhpcy5jb25maWcgPSBvYmplY3RBc3NpZ24odGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAgICAgICAvLyBSZWRpcmVjdCBpcyBzZXQgdG8gY3VycmVudCBsb2NhdGlvbiBieSBkZWZhdWx0XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nSGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgICAgICBsZXQgcGF0aERlZmF1bHQgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcblxuICAgICAgICAvLyBSZW1vdmUgbm90IG5lZWRlZCBwYXJ0cyBmcm9tIHVybHMuXG4gICAgICAgIGlmIChleGlzdGluZ0hhc2gpIHtcbiAgICAgICAgICAgIHBhdGhEZWZhdWx0ID0gcGF0aERlZmF1bHQucmVwbGFjZShleGlzdGluZ0hhc2gsICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXRoRGVmYXVsdC5zdWJzdHIoLTEpID09PSAnIycpIHtcbiAgICAgICAgICAgIHBhdGhEZWZhdWx0ID0gcGF0aERlZmF1bHQuc2xpY2UoMCwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb25maWcucmVkaXJlY3RVcmkgPSBjb25maWcucmVkaXJlY3RVcmkgfHwgcGF0aERlZmF1bHQ7XG4gICAgICAgIHRoaXMuY29uZmlnLmJhc2VSb3V0ZVVybCA9IGNvbmZpZy5iYXNlUm91dGVVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArICcjLyc7XG5cbiAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9O1xuXG4gICAgcHVibGljIGlzQXV0aGVudGljYXRlZCA9ICgpOiBib29sZWFuID0+IHtcbiAgICAgICAgcmV0dXJuIDxhbnk+dGhpcy5vQXV0aFRva2VuU2VydmljZS5nZXRUb2tlbigpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgbG9naW4gPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdGhpcy5nZXRSZWRpcmVjdFVybCgpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgbG9nb3V0ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGAke3RoaXMuY29uZmlnLmxvZ291dFVybH0/YCArXG4gICAgICAgICAgICBgJHt0aGlzLmNvbmZpZy5sb2dvdXRSZWRpcmVjdFBhcmFtZXRlck5hbWV9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY29uZmlnLnJlZGlyZWN0VXJpKX1gO1xuICAgICAgICB0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLnJlbW92ZVRva2VuKCk7XG4gICAgfTtcblxuICAgIHB1YmxpYyBsb2dpbk9uU3RhdGVDaGFuZ2UgPSAodG9TdGF0ZSk6IGJvb2xlYW4gPT4ge1xuICAgICAgICBpZiAodG9TdGF0ZSAmJiB0aGlzLmlzTG9naW5SZXF1aXJlZCh0b1N0YXRlKSAmJiAhdGhpcy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiAhdGhpcy5nZXRUb2tlbkRhdGFGcm9tVXJsKCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2UuaXNTdG9yYWdlU3VwcG9ydGVkKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldDxzdHJpbmc+KE9BVVRIX1NUQVJUUEFHRV9TVE9SQUdFX0tFWSkgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgICAgICAgICAgICAgICAgIGlmICghd2luZG93LmxvY2F0aW9uLmhhc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IHRoaXMuZ2V0QmFzZVJvdXRlVXJsKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldDxzdHJpbmc+KE9BVVRIX1NUQVJUUEFHRV9TVE9SQUdFX0tFWSwgdXJsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmxvZ2luKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgcHVibGljIHNldFRva2VuT25SZWRpcmVjdCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgdG9rZW5EYXRhID0gdGhpcy5nZXRUb2tlbkRhdGFGcm9tVXJsKCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIHRva2VuRGF0YSkge1xuICAgICAgICAgICAgdGhpcy5vQXV0aFRva2VuU2VydmljZS5zZXRUb2tlbih0b2tlbkRhdGEpO1xuICAgICAgICAgICAgbGV0IF8gPSB0aGlzLmdldEJhc2VSb3V0ZVVybCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5pc1N0b3JhZ2VTdXBwb3J0ZWQoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0UGFnZSA9IHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5nZXQ8c3RyaW5nPihPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVkpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5yZW1vdmUoT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnRQYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIF8gPSBzdGFydFBhZ2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ldmVudEFnZ3JlZ2F0b3IucHVibGlzaChPQXV0aFNlcnZpY2UuTE9HSU5fU1VDQ0VTU19FVkVOVCwgdG9rZW5EYXRhKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5hdXRvVG9rZW5SZW5ld2FsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdXRvbWF0aWNUb2tlblJlbmV3YWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGlzTG9naW5SZXF1aXJlZCA9IChzdGF0ZSk6IGJvb2xlYW4gPT4ge1xuICAgICAgICBjb25zdCByb3V0ZUhhc0NvbmZpZyA9IHN0YXRlLnNldHRpbmdzICYmIHN0YXRlLnNldHRpbmdzLnJlcXVpcmVMb2dpbiAhPT0gdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCByb3V0ZVJlcXVpcmVzTG9naW4gPSByb3V0ZUhhc0NvbmZpZyAmJiBzdGF0ZS5zZXR0aW5ncy5yZXF1aXJlTG9naW4gPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgcmV0dXJuIHJvdXRlSGFzQ29uZmlnID8gcm91dGVSZXF1aXJlc0xvZ2luIDogdGhpcy5jb25maWcuYWx3YXlzUmVxdWlyZUxvZ2luO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldFRva2VuRGF0YUZyb21VcmwgPSAoaGFzaD86IHN0cmluZyk6IE9BdXRoVG9rZW5EYXRhID0+IHtcbiAgICAgICAgY29uc3QgaGFzaERhdGEgPSB0aGlzLnVybEhhc2hTZXJ2aWNlLmdldEhhc2hEYXRhKGhhc2gpO1xuICAgICAgICBjb25zdCB0b2tlbkRhdGEgPSB0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLmNyZWF0ZVRva2VuKGhhc2hEYXRhKTtcblxuICAgICAgICByZXR1cm4gdG9rZW5EYXRhO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldEJhc2VSb3V0ZVVybCA9ICgpOiBzdHJpbmcgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcuYmFzZVJvdXRlVXJsO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldFNpbXBsZU5vbmNlVmFsdWUgPSAoKTogc3RyaW5nID0+IHtcbiAgICAgICAgcmV0dXJuICgoRGF0ZS5ub3coKSArIE1hdGgucmFuZG9tKCkpICogTWF0aC5yYW5kb20oKSkudG9TdHJpbmcoKS5yZXBsYWNlKCcuJywgJycpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldFJlZGlyZWN0VXJsKCkge1xuICAgICAgICBsZXQgcmVkaXJlY3RVcmwgPSBgJHt0aGlzLmNvbmZpZy5sb2dpblVybH0/YCArXG4gICAgICAgICAgICBgcmVzcG9uc2VfdHlwZT0ke3RoaXMub0F1dGhUb2tlblNlcnZpY2UuY29uZmlnLm5hbWV9JmAgK1xuICAgICAgICAgICAgYGNsaWVudF9pZD0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbmZpZy5jbGllbnRJZCl9JmAgK1xuICAgICAgICAgICAgYHJlZGlyZWN0X3VyaT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbmZpZy5yZWRpcmVjdFVyaSl9JmAgK1xuICAgICAgICAgICAgYG5vbmNlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuZ2V0U2ltcGxlTm9uY2VWYWx1ZSgpKX1gO1xuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5zY29wZSkge1xuICAgICAgICAgICAgcmVkaXJlY3RVcmwgKz0gYCZzY29wZT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbmZpZy5zY29wZSl9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5zdGF0ZSkge1xuICAgICAgICAgICAgcmVkaXJlY3RVcmwgKz0gYCZzdGF0ZT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbmZpZy5zdGF0ZSl9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZWRpcmVjdFVybDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldEF1dG9tYXRpY1Rva2VuUmVuZXdhbCgpIHtcbiAgICAgICAgY29uc3QgdG9rZW5FeHBpcmF0aW9uVGltZSA9IHRoaXMub0F1dGhUb2tlblNlcnZpY2UuZ2V0VG9rZW5FeHBpcmF0aW9uVGltZSgpICogMTAwMDtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlGcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgICAgICAgICAgaUZyYW1lLnNyYyA9IHRoaXMuZ2V0UmVkaXJlY3RVcmwoKTtcbiAgICAgICAgICAgIGlGcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgaUZyYW1lLm9ubG9hZCA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc2hXaXRoTmV3VG9rZW4gPSBpRnJhbWUuY29udGVudFdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGlGcmFtZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9rZW5EYXRhID0gdGhpcy5nZXRUb2tlbkRhdGFGcm9tVXJsKGhhc2hXaXRoTmV3VG9rZW4pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0b2tlbkRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub0F1dGhUb2tlblNlcnZpY2Uuc2V0VG9rZW4odG9rZW5EYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0QXV0b21hdGljVG9rZW5SZW5ld2FsKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpRnJhbWUuY29udGVudFdpbmRvdyBjYW4gZmFpbCB3aGVuIGFuIGlmcmFtZSBsb2FkcyBpZGVudGl0eSBzZXJ2ZXIgbG9naW4gcGFnZVxuICAgICAgICAgICAgICAgICAgICAvLyBidXQgdGhpcyBwYWdlIHdpbGwgbm90IHJlZGlyZWN0IGJhY2sgdG8gdGhlIGFwcCB1cmwgd2FpdGluZyBmb3IgdGhlIHVzZXIgdG8gbG9naW4gaW5cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBiZWhhdmlvdXIgbXkgb2NjdXIgaS5lLiB3aGVuIGxvZ2luIHBhZ2UgYXV0aGVudGljYXRpb24gY29va2llcyBleHBpcmVcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChpRnJhbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaUZyYW1lKTtcbiAgICAgICAgfSwgdG9rZW5FeHBpcmF0aW9uVGltZSk7XG4gICAgfVxufSJdfQ==
