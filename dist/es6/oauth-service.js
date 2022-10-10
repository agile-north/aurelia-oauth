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
                                var url = window.location.href;
                                if (!window.location.hash) {
                                    url = _this.getBaseRouteUrl();
                                }
                                _this.localStorageService.set(OAUTH_STARTPAGE_STORAGE_KEY, url);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9vYXV0aC1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBU00sMkJBQTJCLEdBQVcsaUJBQWlCLENBQUM7O2dCQThCMUQsc0JBQ1ksaUJBQW9DLEVBQ3BDLGNBQThCLEVBQzlCLG1CQUF3QyxFQUN4QyxlQUFnQztvQkFKNUMsaUJBaUJDO29CQWhCVyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO29CQUNwQyxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7b0JBQzlCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7b0JBQ3hDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtvQkFlckMsY0FBUyxHQUFHLFVBQUMsTUFBbUI7d0JBQ25DLElBQUksS0FBSSxDQUFDLE1BQU0sRUFBRTs0QkFDYixNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7eUJBQ3hEO3dCQUdELElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7NEJBQ3BDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2xEO3dCQUVELElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7NEJBQ3JDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ3BEO3dCQUdELEtBQUksQ0FBQyxNQUFNLEdBQUcsOEJBQVksQ0FBQyxLQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUdsRCxJQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQzt3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RUFBRSxDQUFDO2lDQUNuQzs2QkFDSjs0QkFBQyxPQUFPLEVBQUUsRUFBRTtnQ0FJVCxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQzs2QkFDckM7d0JBQ0wsQ0FBQyxDQUFDO3dCQUVGLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN0QyxDQUFDLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztnQkFDNUIsQ0FBQzs7Z0JBOUxRLFlBQVk7b0JBRHhCLHlDQUFVLEVBQUU7cURBZ0JzQix1Q0FBaUI7d0JBQ3BCLDBCQUFjO3dCQUNULCtCQUFtQjt3QkFDdkIsMENBQWU7bUJBbEJuQyxZQUFZLENBK0x4QjtnQkFBRCxtQkFBQzthQS9MRCxBQStMQzs7UUFBQSxDQUFDIiwiZmlsZSI6Im9hdXRoLXNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAdHMtaWdub3JlXHJcbmltcG9ydCB7RXZlbnRBZ2dyZWdhdG9yfSBmcm9tICdhdXJlbGlhLWV2ZW50LWFnZ3JlZ2F0b3InO1xyXG5pbXBvcnQge2F1dG9pbmplY3R9IGZyb20gJ2F1cmVsaWEtZGVwZW5kZW5jeS1pbmplY3Rpb24nO1xyXG5cclxuaW1wb3J0IHtPQXV0aFRva2VuRGF0YSwgT0F1dGhUb2tlblNlcnZpY2V9IGZyb20gJy4vb2F1dGgtdG9rZW4tc2VydmljZSc7XHJcbmltcG9ydCBVcmxIYXNoU2VydmljZSBmcm9tICcuL3VybC1oYXNoLXNlcnZpY2UnO1xyXG5pbXBvcnQgTG9jYWxTdG9yYWdlU2VydmljZSBmcm9tICcuL2xvY2FsLXN0b3JhZ2Utc2VydmljZSc7XHJcbmltcG9ydCB7b2JqZWN0QXNzaWdufSBmcm9tICcuL29hdXRoLXBvbHlmaWxscyc7XHJcblxyXG5jb25zdCBPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVk6IHN0cmluZyA9ICdvYXV0aC5zdGFydFBhZ2UnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBPQXV0aENvbmZpZyB7XHJcbiAgICBsb2dpblVybDogc3RyaW5nO1xyXG4gICAgbG9nb3V0VXJsOiBzdHJpbmc7XHJcbiAgICBjbGllbnRJZDogc3RyaW5nO1xyXG4gICAgbG9nb3V0UmVkaXJlY3RQYXJhbWV0ZXJOYW1lPzogc3RyaW5nO1xyXG4gICAgc2NvcGU/OiBzdHJpbmc7XHJcbiAgICBzdGF0ZT86IHN0cmluZztcclxuICAgIHJlZGlyZWN0VXJpPzogc3RyaW5nO1xyXG4gICAgYWx3YXlzUmVxdWlyZUxvZ2luPzogYm9vbGVhbjtcclxuICAgIGF1dG9Ub2tlblJlbmV3YWw/OiBib29sZWFuO1xyXG4gICAgYmFzZVJvdXRlVXJsOiBzdHJpbmc7XHJcbn1cclxuXHJcbkBhdXRvaW5qZWN0KClcclxuZXhwb3J0IGNsYXNzIE9BdXRoU2VydmljZSB7XHJcblxyXG4gICAgcHVibGljIGNvbmZpZzogT0F1dGhDb25maWc7XHJcblxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBkZWZhdWx0czogT0F1dGhDb25maWc7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXQgTE9HSU5fU1VDQ0VTU19FVkVOVCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiAnb2F1dGg6bG9naW5TdWNjZXNzJztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldCBJTlZBTElEX1RPS0VOX0VWRU5UKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuICdvYXV0aDppbnZhbGlkVG9rZW4nO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgb0F1dGhUb2tlblNlcnZpY2U6IE9BdXRoVG9rZW5TZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgdXJsSGFzaFNlcnZpY2U6IFVybEhhc2hTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgbG9jYWxTdG9yYWdlU2VydmljZTogTG9jYWxTdG9yYWdlU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIGV2ZW50QWdncmVnYXRvcjogRXZlbnRBZ2dyZWdhdG9yKSB7XHJcblxyXG4gICAgICAgIHRoaXMuZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgICAgIGxvZ2luVXJsOiBudWxsLFxyXG4gICAgICAgICAgICBsb2dvdXRVcmw6IG51bGwsXHJcbiAgICAgICAgICAgIGNsaWVudElkOiBudWxsLFxyXG4gICAgICAgICAgICBsb2dvdXRSZWRpcmVjdFBhcmFtZXRlck5hbWU6ICdwb3N0X2xvZ291dF9yZWRpcmVjdF91cmknLFxyXG4gICAgICAgICAgICBzY29wZTogbnVsbCxcclxuICAgICAgICAgICAgc3RhdGU6IG51bGwsXHJcbiAgICAgICAgICAgIGFsd2F5c1JlcXVpcmVMb2dpbjogZmFsc2UsXHJcbiAgICAgICAgICAgIGF1dG9Ub2tlblJlbmV3YWw6IHRydWUsXHJcbiAgICAgICAgICAgIGJhc2VSb3V0ZVVybDogbnVsbFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNvbmZpZ3VyZSA9IChjb25maWc6IE9BdXRoQ29uZmlnKTogT0F1dGhDb25maWcgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09BdXRoUHJvdmlkZXIgYWxyZWFkeSBjb25maWd1cmVkLicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHNsYXNoIGZyb20gdXJscy5cclxuICAgICAgICBpZiAoY29uZmlnLmxvZ2luVXJsLnN1YnN0cigtMSkgPT09ICcvJykge1xyXG4gICAgICAgICAgICBjb25maWcubG9naW5VcmwgPSBjb25maWcubG9naW5Vcmwuc2xpY2UoMCwgLTEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZy5sb2dvdXRVcmwuc3Vic3RyKC0xKSA9PT0gJy8nKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5sb2dvdXRVcmwgPSBjb25maWcubG9nb3V0VXJsLnNsaWNlKDAsIC0xKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEV4dGVuZCBkZWZhdWx0IGNvbmZpZ3VyYXRpb24uXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSBvYmplY3RBc3NpZ24odGhpcy5kZWZhdWx0cywgY29uZmlnKTtcclxuXHJcbiAgICAgICAgLy8gUmVkaXJlY3QgaXMgc2V0IHRvIGN1cnJlbnQgbG9jYXRpb24gYnkgZGVmYXVsdFxyXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nSGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xyXG4gICAgICAgIGxldCBwYXRoRGVmYXVsdCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xyXG5cclxuICAgICAgICAvLyBSZW1vdmUgbm90IG5lZWRlZCBwYXJ0cyBmcm9tIHVybHMuXHJcbiAgICAgICAgaWYgKGV4aXN0aW5nSGFzaCkge1xyXG4gICAgICAgICAgICBwYXRoRGVmYXVsdCA9IHBhdGhEZWZhdWx0LnJlcGxhY2UoZXhpc3RpbmdIYXNoLCAnJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGF0aERlZmF1bHQuc3Vic3RyKC0xKSA9PT0gJyMnKSB7XHJcbiAgICAgICAgICAgIHBhdGhEZWZhdWx0ID0gcGF0aERlZmF1bHQuc2xpY2UoMCwgLTEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcucmVkaXJlY3RVcmkgPSBjb25maWcucmVkaXJlY3RVcmkgfHwgcGF0aERlZmF1bHQ7XHJcbiAgICAgICAgdGhpcy5jb25maWcuYmFzZVJvdXRlVXJsID0gY29uZmlnLmJhc2VSb3V0ZVVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgJyMvJztcclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbmZpZztcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGlzQXV0aGVudGljYXRlZCA9ICgpOiBib29sZWFuID0+IHtcclxuICAgICAgICByZXR1cm4gPGFueT50aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLmdldFRva2VuKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBsb2dpbiA9ICgpOiB2b2lkID0+IHtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHRoaXMuZ2V0UmVkaXJlY3RVcmwoKTtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGxvZ291dCA9ICgpOiB2b2lkID0+IHtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGAke3RoaXMuY29uZmlnLmxvZ291dFVybH0/YCArXHJcbiAgICAgICAgICAgIGAke3RoaXMuY29uZmlnLmxvZ291dFJlZGlyZWN0UGFyYW1ldGVyTmFtZX09JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5jb25maWcucmVkaXJlY3RVcmkpfWA7XHJcbiAgICAgICAgdGhpcy5vQXV0aFRva2VuU2VydmljZS5yZW1vdmVUb2tlbigpO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgbG9naW5PblN0YXRlQ2hhbmdlID0gKHRvU3RhdGUpOiBib29sZWFuID0+IHtcclxuICAgICAgICBpZiAodG9TdGF0ZSAmJiB0aGlzLmlzTG9naW5SZXF1aXJlZCh0b1N0YXRlKSAmJiAhdGhpcy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiAhdGhpcy5nZXRUb2tlbkRhdGFGcm9tVXJsKCkpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5pc1N0b3JhZ2VTdXBwb3J0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5nZXQ8c3RyaW5nPihPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVkpID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3aW5kb3cubG9jYXRpb24uaGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSB0aGlzLmdldEJhc2VSb3V0ZVVybCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0PHN0cmluZz4oT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZLCB1cmwpO1xyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubG9naW4oKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBzZXRUb2tlbk9uUmVkaXJlY3QgPSAoKTogdm9pZCA9PiB7XHJcbiAgICAgICAgY29uc3QgdG9rZW5EYXRhID0gdGhpcy5nZXRUb2tlbkRhdGFGcm9tVXJsKCk7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiB0b2tlbkRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5vQXV0aFRva2VuU2VydmljZS5zZXRUb2tlbih0b2tlbkRhdGEpO1xyXG4gICAgICAgICAgICBsZXQgXyA9IHRoaXMuZ2V0QmFzZVJvdXRlVXJsKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2UuaXNTdG9yYWdlU3VwcG9ydGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0UGFnZSA9IHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5nZXQ8c3RyaW5nPihPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0UGFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIF8gPSBzdGFydFBhZ2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5ldmVudEFnZ3JlZ2F0b3IucHVibGlzaChPQXV0aFNlcnZpY2UuTE9HSU5fU1VDQ0VTU19FVkVOVCwgdG9rZW5EYXRhKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLmF1dG9Ub2tlblJlbmV3YWwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0QXV0b21hdGljVG9rZW5SZW5ld2FsKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBfO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBpc0xvZ2luUmVxdWlyZWQgPSAoc3RhdGUpOiBib29sZWFuID0+IHtcclxuICAgICAgICBjb25zdCByb3V0ZUhhc0NvbmZpZyA9IHN0YXRlLnNldHRpbmdzICYmIHN0YXRlLnNldHRpbmdzLnJlcXVpcmVMb2dpbiAhPT0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGNvbnN0IHJvdXRlUmVxdWlyZXNMb2dpbiA9IHJvdXRlSGFzQ29uZmlnICYmIHN0YXRlLnNldHRpbmdzLnJlcXVpcmVMb2dpbiA/IHRydWUgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJvdXRlSGFzQ29uZmlnID8gcm91dGVSZXF1aXJlc0xvZ2luIDogdGhpcy5jb25maWcuYWx3YXlzUmVxdWlyZUxvZ2luO1xyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIGdldFRva2VuRGF0YUZyb21VcmwgPSAoaGFzaD86IHN0cmluZyk6IE9BdXRoVG9rZW5EYXRhID0+IHtcclxuICAgICAgICBjb25zdCBoYXNoRGF0YSA9IHRoaXMudXJsSGFzaFNlcnZpY2UuZ2V0SGFzaERhdGEoaGFzaCk7XHJcbiAgICAgICAgY29uc3QgdG9rZW5EYXRhID0gdGhpcy5vQXV0aFRva2VuU2VydmljZS5jcmVhdGVUb2tlbihoYXNoRGF0YSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0b2tlbkRhdGE7XHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgZ2V0QmFzZVJvdXRlVXJsID0gKCk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLmJhc2VSb3V0ZVVybDtcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRTaW1wbGVOb25jZVZhbHVlID0gKCk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgcmV0dXJuICgoRGF0ZS5ub3coKSArIE1hdGgucmFuZG9tKCkpICogTWF0aC5yYW5kb20oKSkudG9TdHJpbmcoKS5yZXBsYWNlKCcuJywgJycpO1xyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIGdldFJlZGlyZWN0VXJsKCkge1xyXG4gICAgICAgIGxldCByZWRpcmVjdFVybCA9IGAke3RoaXMuY29uZmlnLmxvZ2luVXJsfT9gICtcclxuICAgICAgICAgICAgYHJlc3BvbnNlX3R5cGU9JHt0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLmNvbmZpZy5uYW1lfSZgICtcclxuICAgICAgICAgICAgYGNsaWVudF9pZD0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbmZpZy5jbGllbnRJZCl9JmAgK1xyXG4gICAgICAgICAgICBgcmVkaXJlY3RfdXJpPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY29uZmlnLnJlZGlyZWN0VXJpKX0mYCArXHJcbiAgICAgICAgICAgIGBub25jZT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmdldFNpbXBsZU5vbmNlVmFsdWUoKSl9YDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnNjb3BlKSB7XHJcbiAgICAgICAgICAgIHJlZGlyZWN0VXJsICs9IGAmc2NvcGU9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5jb25maWcuc2NvcGUpfWA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jb25maWcuc3RhdGUpIHtcclxuICAgICAgICAgICAgcmVkaXJlY3RVcmwgKz0gYCZzdGF0ZT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbmZpZy5zdGF0ZSl9YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZWRpcmVjdFVybDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldEF1dG9tYXRpY1Rva2VuUmVuZXdhbCgpIHtcclxuICAgICAgICBjb25zdCB0b2tlbkV4cGlyYXRpb25UaW1lID0gdGhpcy5vQXV0aFRva2VuU2VydmljZS5nZXRUb2tlbkV4cGlyYXRpb25UaW1lKCkgKiAxMDAwO1xyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaUZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XHJcbiAgICAgICAgICAgIGlGcmFtZS5zcmMgPSB0aGlzLmdldFJlZGlyZWN0VXJsKCk7XHJcbiAgICAgICAgICAgIGlGcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICBpRnJhbWUub25sb2FkID0gKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc2hXaXRoTmV3VG9rZW4gPSBpRnJhbWUuY29udGVudFdpbmRvdy5sb2NhdGlvbi5oYXNoO1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoaUZyYW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9rZW5EYXRhID0gdGhpcy5nZXRUb2tlbkRhdGFGcm9tVXJsKGhhc2hXaXRoTmV3VG9rZW4pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAodG9rZW5EYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub0F1dGhUb2tlblNlcnZpY2Uuc2V0VG9rZW4odG9rZW5EYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRBdXRvbWF0aWNUb2tlblJlbmV3YWwoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlGcmFtZS5jb250ZW50V2luZG93IGNhbiBmYWlsIHdoZW4gYW4gaWZyYW1lIGxvYWRzIGlkZW50aXR5IHNlcnZlciBsb2dpbiBwYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYnV0IHRoaXMgcGFnZSB3aWxsIG5vdCByZWRpcmVjdCBiYWNrIHRvIHRoZSBhcHAgdXJsIHdhaXRpbmcgZm9yIHRoZSB1c2VyIHRvIGxvZ2luIGluXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBiZWhhdmlvdXIgbXkgb2NjdXIgaS5lLiB3aGVuIGxvZ2luIHBhZ2UgYXV0aGVudGljYXRpb24gY29va2llcyBleHBpcmVcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGlGcmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGlGcmFtZSk7XHJcbiAgICAgICAgfSwgdG9rZW5FeHBpcmF0aW9uVGltZSk7XHJcbiAgICB9XHJcbn0iXX0=
