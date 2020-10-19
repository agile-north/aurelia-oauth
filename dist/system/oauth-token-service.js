System.register(["aurelia-dependency-injection", "./jwt-token-service", "./oauth-polyfills"], function (exports_1, context_1) {
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
    var aurelia_dependency_injection_1, jwt_token_service_1, oauth_polyfills_1, OAuthTokenService;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (aurelia_dependency_injection_1_1) {
                aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
            },
            function (jwt_token_service_1_1) {
                jwt_token_service_1 = jwt_token_service_1_1;
            },
            function (oauth_polyfills_1_1) {
                oauth_polyfills_1 = oauth_polyfills_1_1;
            }
        ],
        execute: function () {
            OAuthTokenService = (function () {
                function OAuthTokenService(jwtTokenService) {
                    var _this = this;
                    this.jwtTokenService = jwtTokenService;
                    this.configure = function (config) {
                        if (config.urlTokenParameters) {
                            config.urlTokenParameters = oauth_polyfills_1.objectAssign(_this.config.urlTokenParameters, config.urlTokenParameters);
                        }
                        _this.config = oauth_polyfills_1.objectAssign(_this.config, config);
                        return config;
                    };
                    this.createToken = function (urlTokenData) {
                        var token = urlTokenData[_this.config.urlTokenParameters.idToken];
                        var tokenType = urlTokenData[_this.config.urlTokenParameters.tokenType] || 'Bearer';
                        if (!token) {
                            return null;
                        }
                        var claims = _this.jwtTokenService.getJwtClaims(token);
                        var issuedTime = claims.nbf ? claims.nbf : claims.iat;
                        var expirationTime = claims.exp - issuedTime;
                        return {
                            token: token,
                            tokenType: tokenType,
                            expiresAt: _this.getTimeNow() + expirationTime,
                            jwtClaims: claims
                        };
                    };
                    this.setToken = function (data) {
                        return _this.tokenData = data;
                    };
                    this.getToken = function () {
                        return _this.tokenData;
                    };
                    this.getIdToken = function () {
                        return _this.getToken() ? _this.getToken().token : undefined;
                    };
                    this.getAuthorizationHeader = function () {
                        if (!(_this.getTokenType() && _this.getIdToken())) {
                            return '';
                        }
                        var tokenType = _this.getTokenType().charAt(0).toUpperCase() + _this.getTokenType().substr(1);
                        return tokenType + " " + _this.getIdToken();
                    };
                    this.getTokenType = function () {
                        return _this.getToken() ? _this.getToken().tokenType : undefined;
                    };
                    this.getTokenExpirationTime = function () {
                        var tokenRenewalOffsetSeconds = 30;
                        var expireOffset = _this.config.expireOffsetSeconds + tokenRenewalOffsetSeconds;
                        return (_this.tokenData.expiresAt - _this.getTimeNow() - expireOffset);
                    };
                    this.removeToken = function () {
                        return _this.tokenData = null;
                    };
                    this.isTokenValid = function () {
                        var token = _this.getToken();
                        if (!token) {
                            return false;
                        }
                        var timeNow = _this.getTimeNow();
                        var expiresAt = token.expiresAt;
                        var isValid = (expiresAt && (expiresAt > timeNow + _this.config.expireOffsetSeconds));
                        return isValid;
                    };
                    this.getTimeNow = function () {
                        return Math.round(new Date().getTime() / 1000.0);
                    };
                    this.config = {
                        name: 'id_token',
                        urlTokenParameters: {
                            idToken: 'id_token',
                            tokenType: 'token_type'
                        },
                        expireOffsetSeconds: 60
                    };
                }
                OAuthTokenService = __decorate([
                    aurelia_dependency_injection_1.autoinject(),
                    __metadata("design:paramtypes", [jwt_token_service_1.default])
                ], OAuthTokenService);
                return OAuthTokenService;
            }());
            exports_1("OAuthTokenService", OAuthTokenService);
        }
    };
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9vYXV0aC10b2tlbi1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQkE0QkksMkJBQW9CLGVBQWdDO29CQUFwRCxpQkFTQztvQkFUbUIsb0JBQWUsR0FBZixlQUFlLENBQWlCO29CQVc3QyxjQUFTLEdBQUcsVUFBQyxNQUF3Qjt3QkFHeEMsSUFBSSxNQUFNLENBQUMsa0JBQWtCLEVBQUU7NEJBQzNCLE1BQU0sQ0FBQyxrQkFBa0IsR0FBRyw4QkFBWSxDQUFDLEtBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7eUJBQ3ZHO3dCQUVELEtBQUksQ0FBQyxNQUFNLEdBQUcsOEJBQVksQ0FBQyxLQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUVoRCxPQUFPLE1BQU0sQ0FBQztvQkFDbEIsQ0FBQyxDQUFDO29CQUVLLGdCQUFXLEdBQUcsVUFBQyxZQUFpQjt3QkFDbkMsSUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLEtBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ25FLElBQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxLQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQzt3QkFFckYsSUFBSSxDQUFDLEtBQUssRUFBRTs0QkFDUixPQUFPLElBQUksQ0FBQzt5QkFDZjt3QkFFRCxJQUFNLE1BQU0sR0FBYyxLQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDbkUsSUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQzt3QkFDeEQsSUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLEdB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bUJBQW1CLEVBQUUsRUFBRTtxQkFDMUIsQ0FBQztnQkFDTixDQUFDO2dCQWZRLGlCQUFpQjtvQkFEN0IseUNBQVUsRUFBRTtxREFPNEIsMkJBQWU7bUJBTjNDLGlCQUFpQixDQXVHN0I7Z0JBQUQsd0JBQUM7YUF2R0QsQUF1R0M7O1FBQUEsQ0FBQyIsImZpbGUiOiJvYXV0aC10b2tlbi1zZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYXV0b2luamVjdCB9IGZyb20gJ2F1cmVsaWEtZGVwZW5kZW5jeS1pbmplY3Rpb24nO1xyXG5cclxuaW1wb3J0IEp3dFRva2VuU2VydmljZSwgeyBKd3RDbGFpbXMgfSBmcm9tICcuL2p3dC10b2tlbi1zZXJ2aWNlJztcclxuaW1wb3J0IHsgb2JqZWN0QXNzaWduIH0gZnJvbSAnLi9vYXV0aC1wb2x5ZmlsbHMnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBPQXV0aFRva2VuQ29uZmlnIHtcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIHVybFRva2VuUGFyYW1ldGVycz86IHtcclxuICAgICAgICBpZFRva2VuOiBzdHJpbmc7XHJcbiAgICAgICAgdG9rZW5UeXBlPzogc3RyaW5nO1xyXG4gICAgfTtcclxuICAgIGV4cGlyZU9mZnNldFNlY29uZHM/OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgT0F1dGhUb2tlbkRhdGEge1xyXG4gICAgdG9rZW46IHN0cmluZztcclxuICAgIHRva2VuVHlwZTogc3RyaW5nO1xyXG4gICAgZXhwaXJlc0F0OiBudW1iZXI7XHJcbiAgICBqd3RDbGFpbXM/OiBKd3RDbGFpbXM7XHJcbn1cclxuXHJcbkBhdXRvaW5qZWN0KClcclxuZXhwb3J0IGNsYXNzIE9BdXRoVG9rZW5TZXJ2aWNlIHtcclxuXHJcbiAgICBwdWJsaWMgY29uZmlnOiBPQXV0aFRva2VuQ29uZmlnO1xyXG5cclxuICAgIHByaXZhdGUgdG9rZW5EYXRhOiBPQXV0aFRva2VuRGF0YTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGp3dFRva2VuU2VydmljZTogSnd0VG9rZW5TZXJ2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdpZF90b2tlbicsXHJcbiAgICAgICAgICAgIHVybFRva2VuUGFyYW1ldGVyczoge1xyXG4gICAgICAgICAgICAgICAgaWRUb2tlbjogJ2lkX3Rva2VuJyxcclxuICAgICAgICAgICAgICAgIHRva2VuVHlwZTogJ3Rva2VuX3R5cGUnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGV4cGlyZU9mZnNldFNlY29uZHM6IDYwXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY29uZmlndXJlID0gKGNvbmZpZzogT0F1dGhUb2tlbkNvbmZpZyk6IE9BdXRoVG9rZW5Db25maWcgPT4ge1xyXG5cclxuICAgICAgICAvLyBFeHRlbmQgZGVmYXVsdCBjb25maWdyYXRpb24gd2l0aCBzdXBwbGllZCBjb25maWcgZGF0YVxyXG4gICAgICAgIGlmIChjb25maWcudXJsVG9rZW5QYXJhbWV0ZXJzKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy51cmxUb2tlblBhcmFtZXRlcnMgPSBvYmplY3RBc3NpZ24odGhpcy5jb25maWcudXJsVG9rZW5QYXJhbWV0ZXJzLCBjb25maWcudXJsVG9rZW5QYXJhbWV0ZXJzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gb2JqZWN0QXNzaWduKHRoaXMuY29uZmlnLCBjb25maWcpO1xyXG5cclxuICAgICAgICByZXR1cm4gY29uZmlnO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgY3JlYXRlVG9rZW4gPSAodXJsVG9rZW5EYXRhOiBhbnkpOiBPQXV0aFRva2VuRGF0YSA9PiB7XHJcbiAgICAgICAgY29uc3QgdG9rZW4gPSB1cmxUb2tlbkRhdGFbdGhpcy5jb25maWcudXJsVG9rZW5QYXJhbWV0ZXJzLmlkVG9rZW5dO1xyXG4gICAgICAgIGNvbnN0IHRva2VuVHlwZSA9IHVybFRva2VuRGF0YVt0aGlzLmNvbmZpZy51cmxUb2tlblBhcmFtZXRlcnMudG9rZW5UeXBlXSB8fCAnQmVhcmVyJztcclxuXHJcbiAgICAgICAgaWYgKCF0b2tlbikge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNsYWltczogSnd0Q2xhaW1zID0gdGhpcy5qd3RUb2tlblNlcnZpY2UuZ2V0Snd0Q2xhaW1zKHRva2VuKTtcclxuICAgICAgICBjb25zdCBpc3N1ZWRUaW1lID0gY2xhaW1zLm5iZiA/IGNsYWltcy5uYmYgOiBjbGFpbXMuaWF0O1xyXG4gICAgICAgIGNvbnN0IGV4cGlyYXRpb25UaW1lID0gY2xhaW1zLmV4cCAtIGlzc3VlZFRpbWU7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHRva2VuOiB0b2tlbixcclxuICAgICAgICAgICAgdG9rZW5UeXBlOiB0b2tlblR5cGUsXHJcbiAgICAgICAgICAgIGV4cGlyZXNBdDogdGhpcy5nZXRUaW1lTm93KCkgKyBleHBpcmF0aW9uVGltZSxcclxuICAgICAgICAgICAgand0Q2xhaW1zOiBjbGFpbXNcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgc2V0VG9rZW4gPSAoZGF0YTogT0F1dGhUb2tlbkRhdGEpOiBPQXV0aFRva2VuRGF0YSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudG9rZW5EYXRhID0gZGF0YTtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGdldFRva2VuID0gKCk6IE9BdXRoVG9rZW5EYXRhID0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy50b2tlbkRhdGE7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBnZXRJZFRva2VuID0gKCk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VG9rZW4oKSA/IHRoaXMuZ2V0VG9rZW4oKS50b2tlbiA6IHVuZGVmaW5lZDtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGdldEF1dGhvcml6YXRpb25IZWFkZXIgPSAoKTogc3RyaW5nID0+IHtcclxuICAgICAgICBpZiAoISh0aGlzLmdldFRva2VuVHlwZSgpICYmIHRoaXMuZ2V0SWRUb2tlbigpKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB0b2tlblR5cGUgPSB0aGlzLmdldFRva2VuVHlwZSgpLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGhpcy5nZXRUb2tlblR5cGUoKS5zdWJzdHIoMSk7XHJcblxyXG4gICAgICAgIHJldHVybiBgJHt0b2tlblR5cGV9ICR7dGhpcy5nZXRJZFRva2VuKCl9YDtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGdldFRva2VuVHlwZSA9ICgpOiBzdHJpbmcgPT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFRva2VuKCkgPyB0aGlzLmdldFRva2VuKCkudG9rZW5UeXBlIDogdW5kZWZpbmVkO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgZ2V0VG9rZW5FeHBpcmF0aW9uVGltZSA9ICgpOiBudW1iZXIgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRva2VuUmVuZXdhbE9mZnNldFNlY29uZHMgPSAzMDtcclxuICAgICAgICBjb25zdCBleHBpcmVPZmZzZXQgPSB0aGlzLmNvbmZpZy5leHBpcmVPZmZzZXRTZWNvbmRzICsgdG9rZW5SZW5ld2FsT2Zmc2V0U2Vjb25kcztcclxuXHJcbiAgICAgICAgcmV0dXJuICh0aGlzLnRva2VuRGF0YS5leHBpcmVzQXQgLSB0aGlzLmdldFRpbWVOb3coKSAtIGV4cGlyZU9mZnNldCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyByZW1vdmVUb2tlbiA9ICgpOiBPQXV0aFRva2VuRGF0YSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudG9rZW5EYXRhID0gbnVsbDtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGlzVG9rZW5WYWxpZCA9ICgpOiBib29sZWFuID0+IHtcclxuICAgICAgICBjb25zdCB0b2tlbiA9IHRoaXMuZ2V0VG9rZW4oKTtcclxuXHJcbiAgICAgICAgaWYgKCF0b2tlbikge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB0aW1lTm93ID0gdGhpcy5nZXRUaW1lTm93KCk7XHJcbiAgICAgICAgY29uc3QgZXhwaXJlc0F0ID0gdG9rZW4uZXhwaXJlc0F0O1xyXG4gICAgICAgIGNvbnN0IGlzVmFsaWQgPSAoZXhwaXJlc0F0ICYmIChleHBpcmVzQXQgPiB0aW1lTm93ICsgdGhpcy5jb25maWcuZXhwaXJlT2Zmc2V0U2Vjb25kcykpO1xyXG5cclxuICAgICAgICByZXR1cm4gaXNWYWxpZDtcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRUaW1lTm93ID0gKCk6IG51bWJlciA9PiB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQobmV3IERhdGUoKS5nZXRUaW1lKCkgLyAxMDAwLjApO1xyXG4gICAgfTtcclxufSJdfQ==
