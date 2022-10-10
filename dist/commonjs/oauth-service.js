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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9vYXV0aC1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQ0EscUVBQTJEO0FBQzNELDZFQUEwRDtBQUUxRCw2REFBMEU7QUFDMUUsdURBQWdEO0FBQ2hELGlFQUEwRDtBQUMxRCxxREFBaUQ7QUFFakQsSUFBTSwyQkFBMkIsR0FBVyxpQkFBaUIsQ0FBQztBQWlCOUQ7SUFhSSxzQkFDWSxpQkFBb0MsRUFDcEMsY0FBOEIsRUFDOUIsbUJBQXdDLEVBQ3hDLGVBQWdDO1FBSjVDLGlCQWtCQztRQWpCVyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1FBQ3BDLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUM5Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ3hDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQWdCckMsY0FBUyxHQUFHLFVBQUMsTUFBbUI7WUFDbkMsSUFBSSxLQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQzthQUN4RDtZQUdELElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7Z0JBQ3BDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbEQ7WUFFRCxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO2dCQUNyQyxNQUFNLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BEO1lBR0QsS0FBSSxDQUFDLE1BQU0sR0FBRyw4QkFBWSxDQUFDLEtBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFH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QUFDLENBQUM7b0JBRS9DLElBQUksU0FBUyxFQUFFO3dCQUNYLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQzNDLEtBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO3FCQUNuQztpQkFDSjtnQkFBQyxPQUFPLEVBQUUsRUFBRTtvQkFJVCxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDckM7WUFDTCxDQUFDLENBQUM7WUFFRixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0QyxDQUFDLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztJQUM1QixDQUFDOztJQTdOUSxZQUFZO1FBRHhCLHlDQUFVLEVBQUU7eUNBZXNCLHVDQUFpQjtZQUNwQiwwQkFBYztZQUNULCtCQUFtQjtZQUN2QiwwQ0FBZTtPQWpCbkMsWUFBWSxDQThOeEI7SUFBRCxtQkFBQztDQTlORCxBQThOQyxJQUFBO0FBOU5ZLG9DQUFZIiwiZmlsZSI6Im9hdXRoLXNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAdHMtaWdub3JlXG5pbXBvcnQgeyBFdmVudEFnZ3JlZ2F0b3IgfSBmcm9tIFwiYXVyZWxpYS1ldmVudC1hZ2dyZWdhdG9yXCI7XG5pbXBvcnQgeyBhdXRvaW5qZWN0IH0gZnJvbSBcImF1cmVsaWEtZGVwZW5kZW5jeS1pbmplY3Rpb25cIjtcblxuaW1wb3J0IHsgT0F1dGhUb2tlbkRhdGEsIE9BdXRoVG9rZW5TZXJ2aWNlIH0gZnJvbSBcIi4vb2F1dGgtdG9rZW4tc2VydmljZVwiO1xuaW1wb3J0IFVybEhhc2hTZXJ2aWNlIGZyb20gXCIuL3VybC1oYXNoLXNlcnZpY2VcIjtcbmltcG9ydCBMb2NhbFN0b3JhZ2VTZXJ2aWNlIGZyb20gXCIuL2xvY2FsLXN0b3JhZ2Utc2VydmljZVwiO1xuaW1wb3J0IHsgb2JqZWN0QXNzaWduIH0gZnJvbSBcIi4vb2F1dGgtcG9seWZpbGxzXCI7XG5cbmNvbnN0IE9BVVRIX1NUQVJUUEFHRV9TVE9SQUdFX0tFWTogc3RyaW5nID0gXCJvYXV0aC5zdGFydFBhZ2VcIjtcblxuZXhwb3J0IGludGVyZmFjZSBPQXV0aENvbmZpZyB7XG4gICAgbG9naW5Vcmw6IHN0cmluZztcbiAgICBsb2dvdXRVcmw6IHN0cmluZztcbiAgICBjbGllbnRJZDogc3RyaW5nO1xuICAgIGxvZ291dFJlZGlyZWN0UGFyYW1ldGVyTmFtZT86IHN0cmluZztcbiAgICBzY29wZT86IHN0cmluZztcbiAgICBzdGF0ZT86IHN0cmluZztcbiAgICByZWRpcmVjdFVyaT86IHN0cmluZztcbiAgICByZWRpcmVjdFVyaVJlbW92ZUhhc2g/OiBib29sZWFuO1xuICAgIGFsd2F5c1JlcXVpcmVMb2dpbj86IGJvb2xlYW47XG4gICAgYXV0b1Rva2VuUmVuZXdhbD86IGJvb2xlYW47XG4gICAgYmFzZVJvdXRlVXJsOiBzdHJpbmc7XG59XG5cbkBhdXRvaW5qZWN0KClcbmV4cG9ydCBjbGFzcyBPQXV0aFNlcnZpY2Uge1xuICAgIHB1YmxpYyBjb25maWc6IE9BdXRoQ29uZmlnO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBkZWZhdWx0czogT0F1dGhDb25maWc7XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldCBMT0dJTl9TVUNDRVNTX0VWRU5UKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIm9hdXRoOmxvZ2luU3VjY2Vzc1wiO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IElOVkFMSURfVE9LRU5fRVZFTlQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwib2F1dGg6aW52YWxpZFRva2VuXCI7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgb0F1dGhUb2tlblNlcnZpY2U6IE9BdXRoVG9rZW5TZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHVybEhhc2hTZXJ2aWNlOiBVcmxIYXNoU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBsb2NhbFN0b3JhZ2VTZXJ2aWNlOiBMb2NhbFN0b3JhZ2VTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGV2ZW50QWdncmVnYXRvcjogRXZlbnRBZ2dyZWdhdG9yXG4gICAgKSB7XG4gICAgICAgIHRoaXMuZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICBsb2dpblVybDogbnVsbCxcbiAgICAgICAgICAgIGxvZ291dFVybDogbnVsbCxcbiAgICAgICAgICAgIGNsaWVudElkOiBudWxsLFxuICAgICAgICAgICAgbG9nb3V0UmVkaXJlY3RQYXJhbWV0ZXJOYW1lOiBcInBvc3RfbG9nb3V0X3JlZGlyZWN0X3VyaVwiLFxuICAgICAgICAgICAgc2NvcGU6IG51bGwsXG4gICAgICAgICAgICBzdGF0ZTogbnVsbCxcbiAgICAgICAgICAgIGFsd2F5c1JlcXVpcmVMb2dpbjogZmFsc2UsXG4gICAgICAgICAgICByZWRpcmVjdFVyaVJlbW92ZUhhc2g6IGZhbHNlLFxuICAgICAgICAgICAgYXV0b1Rva2VuUmVuZXdhbDogdHJ1ZSxcbiAgICAgICAgICAgIGJhc2VSb3V0ZVVybDogbnVsbCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29uZmlndXJlID0gKGNvbmZpZzogT0F1dGhDb25maWcpOiBPQXV0aENvbmZpZyA9PiB7XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT0F1dGhQcm92aWRlciBhbHJlYWR5IGNvbmZpZ3VyZWQuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHNsYXNoIGZyb20gdXJscy5cbiAgICAgICAgaWYgKGNvbmZpZy5sb2dpblVybC5zdWJzdHIoLTEpID09PSBcIi9cIikge1xuICAgICAgICAgICAgY29uZmlnLmxvZ2luVXJsID0gY29uZmlnLmxvZ2luVXJsLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb25maWcubG9nb3V0VXJsLnN1YnN0cigtMSkgPT09IFwiL1wiKSB7XG4gICAgICAgICAgICBjb25maWcubG9nb3V0VXJsID0gY29uZmlnLmxvZ291dFVybC5zbGljZSgwLCAtMSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFeHRlbmQgZGVmYXVsdCBjb25maWd1cmF0aW9uLlxuICAgICAgICB0aGlzLmNvbmZpZyA9IG9iamVjdEFzc2lnbih0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gICAgICAgIC8vIFJlZGlyZWN0IGlzIHNldCB0byBjdXJyZW50IGxvY2F0aW9uIGJ5IGRlZmF1bHRcbiAgICAgICAgY29uc3QgZXhpc3RpbmdIYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgICAgIGxldCBwYXRoRGVmYXVsdCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuXG4gICAgICAgIC8vIFJlbW92ZSBub3QgbmVlZGVkIHBhcnRzIGZyb20gdXJscy5cbiAgICAgICAgaWYgKGV4aXN0aW5nSGFzaCAmJiBjb25maWcucmVkaXJlY3RVcmlSZW1vdmVIYXNoKSB7XG4gICAgICAgICAgICBwYXRoRGVmYXVsdCA9IHBhdGhEZWZhdWx0LnJlcGxhY2UoZXhpc3RpbmdIYXNoLCBcIlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXRoRGVmYXVsdC5zdWJzdHIoLTEpID09PSBcIiNcIikge1xuICAgICAgICAgICAgcGF0aERlZmF1bHQgPSBwYXRoRGVmYXVsdC5zbGljZSgwLCAtMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbmZpZy5yZWRpcmVjdFVyaSA9IGNvbmZpZy5yZWRpcmVjdFVyaSB8fCBwYXRoRGVmYXVsdDtcbiAgICAgICAgdGhpcy5jb25maWcuYmFzZVJvdXRlVXJsID1cbiAgICAgICAgICAgIGNvbmZpZy5iYXNlUm91dGVVcmwgfHxcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBcIiMvXCI7XG5cbiAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9O1xuXG4gICAgcHVibGljIGlzQXV0aGVudGljYXRlZCA9ICgpOiBib29sZWFuID0+IHtcbiAgICAgICAgcmV0dXJuIDxhbnk+dGhpcy5vQXV0aFRva2VuU2VydmljZS5nZXRUb2tlbigpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgbG9naW4gPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdGhpcy5nZXRSZWRpcmVjdFVybCgpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgbG9nb3V0ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9XG4gICAgICAgICAgICBgJHt0aGlzLmNvbmZpZy5sb2dvdXRVcmx9P2AgK1xuICAgICAgICAgICAgYCR7dGhpcy5jb25maWcubG9nb3V0UmVkaXJlY3RQYXJhbWV0ZXJOYW1lfT0ke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5yZWRpcmVjdFVyaVxuICAgICAgICAgICAgKX1gO1xuICAgICAgICB0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLnJlbW92ZVRva2VuKCk7XG4gICAgfTtcblxuICAgIHB1YmxpYyBsb2dpbk9uU3RhdGVDaGFuZ2UgPSAodG9TdGF0ZSk6IGJvb2xlYW4gPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICB0b1N0YXRlICYmXG4gICAgICAgICAgICB0aGlzLmlzTG9naW5SZXF1aXJlZCh0b1N0YXRlKSAmJlxuICAgICAgICAgICAgIXRoaXMuaXNBdXRoZW50aWNhdGVkKCkgJiZcbiAgICAgICAgICAgICF0aGlzLmdldFRva2VuRGF0YUZyb21VcmwoKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxvY2FsU3RvcmFnZVNlcnZpY2UuaXNTdG9yYWdlU3VwcG9ydGVkKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5nZXQ8c3RyaW5nPihcbiAgICAgICAgICAgICAgICAgICAgICAgIE9BVVRIX1NUQVJUUEFHRV9TVE9SQUdFX0tFWVxuICAgICAgICAgICAgICAgICAgICApID09IG51bGxcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSB0aGlzLmdldEJhc2VSb3V0ZVVybCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5zZXQ8c3RyaW5nPihcbiAgICAgICAgICAgICAgICAgICAgICAgIE9BVVRIX1NUQVJUUEFHRV9TVE9SQUdFX0tFWSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubG9naW4oKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBwdWJsaWMgc2V0VG9rZW5PblJlZGlyZWN0ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCB0b2tlbkRhdGEgPSB0aGlzLmdldFRva2VuRGF0YUZyb21VcmwoKTtcblxuICAgICAgICBpZiAoIXRoaXMuaXNBdXRoZW50aWNhdGVkKCkgJiYgdG9rZW5EYXRhKSB7XG4gICAgICAgICAgICB0aGlzLm9BdXRoVG9rZW5TZXJ2aWNlLnNldFRva2VuKHRva2VuRGF0YSk7XG4gICAgICAgICAgICBsZXQgXyA9IHRoaXMuZ2V0QmFzZVJvdXRlVXJsKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5sb2NhbFN0b3JhZ2VTZXJ2aWNlLmlzU3RvcmFnZVN1cHBvcnRlZCgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnRQYWdlID0gdGhpcy5sb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldDxzdHJpbmc+KFxuICAgICAgICAgICAgICAgICAgICBPQVVUSF9TVEFSVFBBR0VfU1RPUkFHRV9LRVlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlU2VydmljZS5yZW1vdmUoT0FVVEhfU1RBUlRQQUdFX1NUT1JBR0VfS0VZKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnRQYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIF8gPSBzdGFydFBhZ2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ldmVudEFnZ3JlZ2F0b3IucHVibGlzaChcbiAgICAgICAgICAgICAgICBPQXV0aFNlcnZpY2UuTE9HSU5fU1VDQ0VTU19FVkVOVCxcbiAgICAgICAgICAgICAgICB0b2tlbkRhdGFcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAodGhpcy5jb25maWcuYXV0b1Rva2VuUmVuZXdhbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QXV0b21hdGljVG9rZW5SZW5ld2FsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IF87XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBpc0xvZ2luUmVxdWlyZWQgPSAoc3RhdGUpOiBib29sZWFuID0+IHtcbiAgICAgICAgY29uc3Qgcm91dGVIYXNDb25maWcgPVxuICAgICAgICAgICAgc3RhdGUuc2V0dGluZ3MgJiYgc3RhdGUuc2V0dGluZ3MucmVxdWlyZUxvZ2luICE9PSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHJvdXRlUmVxdWlyZXNMb2dpbiA9XG4gICAgICAgICAgICByb3V0ZUhhc0NvbmZpZyAmJiBzdGF0ZS5zZXR0aW5ncy5yZXF1aXJlTG9naW4gPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgcmV0dXJuIHJvdXRlSGFzQ29uZmlnXG4gICAgICAgICAgICA/IHJvdXRlUmVxdWlyZXNMb2dpblxuICAgICAgICAgICAgOiB0aGlzLmNvbmZpZy5hbHdheXNSZXF1aXJlTG9naW47XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0VG9rZW5EYXRhRnJvbVVybCA9IChoYXNoPzogc3RyaW5nKTogT0F1dGhUb2tlbkRhdGEgPT4ge1xuICAgICAgICBjb25zdCBoYXNoRGF0YSA9IHRoaXMudXJsSGFzaFNlcnZpY2UuZ2V0SGFzaERhdGEoaGFzaCk7XG4gICAgICAgIGNvbnN0IHRva2VuRGF0YSA9IHRoaXMub0F1dGhUb2tlblNlcnZpY2UuY3JlYXRlVG9rZW4oaGFzaERhdGEpO1xuXG4gICAgICAgIHJldHVybiB0b2tlbkRhdGE7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0QmFzZVJvdXRlVXJsID0gKCk6IHN0cmluZyA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5iYXNlUm91dGVVcmw7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0U2ltcGxlTm9uY2VWYWx1ZSA9ICgpOiBzdHJpbmcgPT4ge1xuICAgICAgICByZXR1cm4gKChEYXRlLm5vdygpICsgTWF0aC5yYW5kb20oKSkgKiBNYXRoLnJhbmRvbSgpKVxuICAgICAgICAgICAgLnRvU3RyaW5nKClcbiAgICAgICAgICAgIC5yZXBsYWNlKFwiLlwiLCBcIlwiKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRSZWRpcmVjdFVybCgpIHtcbiAgICAgICAgbGV0IHJlZGlyZWN0VXJsID1cbiAgICAgICAgICAgIGAke3RoaXMuY29uZmlnLmxvZ2luVXJsfT9gICtcbiAgICAgICAgICAgIGByZXNwb25zZV90eXBlPSR7dGhpcy5vQXV0aFRva2VuU2VydmljZS5jb25maWcubmFtZX0mYCArXG4gICAgICAgICAgICBgY2xpZW50X2lkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY29uZmlnLmNsaWVudElkKX0mYCArXG4gICAgICAgICAgICBgcmVkaXJlY3RfdXJpPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY29uZmlnLnJlZGlyZWN0VXJpKX0mYCArXG4gICAgICAgICAgICBgbm9uY2U9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5nZXRTaW1wbGVOb25jZVZhbHVlKCkpfWA7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnNjb3BlKSB7XG4gICAgICAgICAgICByZWRpcmVjdFVybCArPSBgJnNjb3BlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY29uZmlnLnNjb3BlKX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnN0YXRlKSB7XG4gICAgICAgICAgICByZWRpcmVjdFVybCArPSBgJnN0YXRlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY29uZmlnLnN0YXRlKX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlZGlyZWN0VXJsO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0QXV0b21hdGljVG9rZW5SZW5ld2FsKCkge1xuICAgICAgICBjb25zdCB0b2tlbkV4cGlyYXRpb25UaW1lID1cbiAgICAgICAgICAgIHRoaXMub0F1dGhUb2tlblNlcnZpY2UuZ2V0VG9rZW5FeHBpcmF0aW9uVGltZSgpICogMTAwMDtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlGcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIik7XG4gICAgICAgICAgICBpRnJhbWUuc3JjID0gdGhpcy5nZXRSZWRpcmVjdFVybCgpO1xuICAgICAgICAgICAgaUZyYW1lLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIGlGcmFtZS5vbmxvYWQgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBoYXNoV2l0aE5ld1Rva2VuID0gaUZyYW1lLmNvbnRlbnRXaW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChpRnJhbWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRva2VuRGF0YSA9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldFRva2VuRGF0YUZyb21VcmwoaGFzaFdpdGhOZXdUb2tlbik7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRva2VuRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vQXV0aFRva2VuU2VydmljZS5zZXRUb2tlbih0b2tlbkRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRBdXRvbWF0aWNUb2tlblJlbmV3YWwoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlGcmFtZS5jb250ZW50V2luZG93IGNhbiBmYWlsIHdoZW4gYW4gaWZyYW1lIGxvYWRzIGlkZW50aXR5IHNlcnZlciBsb2dpbiBwYWdlXG4gICAgICAgICAgICAgICAgICAgIC8vIGJ1dCB0aGlzIHBhZ2Ugd2lsbCBub3QgcmVkaXJlY3QgYmFjayB0byB0aGUgYXBwIHVybCB3YWl0aW5nIGZvciB0aGUgdXNlciB0byBsb2dpbiBpblxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIGJlaGF2aW91ciBteSBvY2N1ciBpLmUuIHdoZW4gbG9naW4gcGFnZSBhdXRoZW50aWNhdGlvbiBjb29raWVzIGV4cGlyZVxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGlGcmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpRnJhbWUpO1xuICAgICAgICB9LCB0b2tlbkV4cGlyYXRpb25UaW1lKTtcbiAgICB9XG59XG4iXX0=
