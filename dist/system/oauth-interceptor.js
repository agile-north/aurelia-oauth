System.register(["aurelia-event-aggregator", "aurelia-dependency-injection", "./oauth-service", "./oauth-token-service"], function (exports_1, context_1) {
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
    var aurelia_event_aggregator_1, aurelia_dependency_injection_1, oauth_service_1, oauth_token_service_1, AUTHORIZATION_HEADER, OAuthInterceptor;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (aurelia_event_aggregator_1_1) {
                aurelia_event_aggregator_1 = aurelia_event_aggregator_1_1;
            },
            function (aurelia_dependency_injection_1_1) {
                aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
            },
            function (oauth_service_1_1) {
                oauth_service_1 = oauth_service_1_1;
            },
            function (oauth_token_service_1_1) {
                oauth_token_service_1 = oauth_token_service_1_1;
            }
        ],
        execute: function () {
            AUTHORIZATION_HEADER = 'Authorization';
            OAuthInterceptor = (function () {
                function OAuthInterceptor(oauthTokenService, eventAggregator) {
                    var _this = this;
                    this.oauthTokenService = oauthTokenService;
                    this.eventAggregator = eventAggregator;
                    this.request = function (config) {
                        if (_this.oauthTokenService.getToken() && !_this.oauthTokenService.isTokenValid()) {
                            config.tokenExpired = true;
                            _this.eventAggregator.publish(oauth_service_1.OAuthService.INVALID_TOKEN_EVENT);
                            return Promise.reject(config);
                        }
                        if (config.headers.add && !config.headers.get(AUTHORIZATION_HEADER)) {
                            config.headers.add(AUTHORIZATION_HEADER, _this.oauthTokenService.getAuthorizationHeader());
                        }
                        if (config.headers.append && !config.headers.get(AUTHORIZATION_HEADER)) {
                            config.headers.append(AUTHORIZATION_HEADER, _this.oauthTokenService.getAuthorizationHeader());
                        }
                        return config;
                    };
                    this.response = function (response, request) {
                        _this.handleRequestError(response, request);
                        return response;
                    };
                    this.responseError = function (response, request) {
                        _this.handleRequestError(response, request);
                        return Promise.reject(response);
                    };
                }
                OAuthInterceptor.prototype.handleRequestError = function (response, requestMessage) {
                    if (response && response.statusCode && response.statusCode === 401
                        && !response.requestMessage.tokenExpired && !this.oauthTokenService.isTokenValid()) {
                        response.tokenExpired = true;
                        this.eventAggregator.publish(oauth_service_1.OAuthService.INVALID_TOKEN_EVENT, response);
                    }
                    if (response && response.status && response.status === 401
                        && !requestMessage.tokenExpired && !this.oauthTokenService.isTokenValid()) {
                        response.tokenExpired = true;
                        this.eventAggregator.publish(oauth_service_1.OAuthService.INVALID_TOKEN_EVENT, response);
                    }
                };
                var _a;
                OAuthInterceptor = __decorate([
                    aurelia_dependency_injection_1.autoinject(),
                    __metadata("design:paramtypes", [oauth_token_service_1.OAuthTokenService, typeof (_a = typeof aurelia_event_aggregator_1.EventAggregator !== "undefined" && aurelia_event_aggregator_1.EventAggregator) === "function" && _a || Object])
                ], OAuthInterceptor);
                return OAuthInterceptor;
            }());
            exports_1("default", OAuthInterceptor);
        }
    };
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9vYXV0aC1pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQU1NLG9CQUFvQixHQUFXLGVBQWUsQ0FBQzs7Z0JBSWpELDBCQUNZLGlCQUFvQyxFQUNwQyxlQUFnQztvQkFGNUMsaUJBRWlEO29CQURyQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO29CQUNwQyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7b0JBRXJDLFlBQU8sR0FBRyxVQUFDLE1BQVc7d0JBQ3pCLElBQUksS0FBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRSxFQUFFOzRCQUM3RSxNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQzs0QkFDM0IsS0FBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsNEJBQVksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDOzRCQUUvRCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7eUJBQ2pDO3dCQUdELElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFOzRCQUNqRSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxLQUFJLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO3lCQUM3Rjt3QkFHRCxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsRUFBRTs0QkFDcEUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsb0JBQW9CLEVBQUUsS0FBSSxDQUFDLGlCQUFpQixDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQzt5QkFDaEc7d0JBRUQsT0FBTyxNQUFNLENBQUM7b0JBQ2xCLENBQUMsQ0FBQztvQkFFSyxhQUFRLEdBQUcsVUFBQyxRQUFhLEVBQUUsT0FBYTt3QkFDM0MsS0FBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQzt3QkFDM0MsT0FBTyxRQUFRLENBQUM7b0JBQ3BCLENBQUMsQ0FBQztvQkFFSyxrQkFBYSxHQUFHLFVBQUMsUUFBYSxFQUFFLE9BQWE7d0JBQ2hELEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7d0JBQzNDLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDcEMsQ0FBQyxDQUFDO2dCQS9COEMsQ0FBQztnQkFpQ3pDLDZDQUFrQixHQUExQixVQUEyQixRQUFhLEVBQUUsY0FBb0I7b0JBRTFELElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxHQUFHOzJCQUMzRCxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRSxFQUFFO3dCQUNwRixRQUFRLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQzt3QkFDN0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsNEJBQVksQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLENBQUMsQ0FBQztxQkFDNUU7b0JBR0QsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLEdBQUc7MkJBQ25ELENBQUMsY0FBYyxDQUFDLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsRUFBRTt3QkFDM0UsUUFBUSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7d0JBQzdCLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLDRCQUFZLENBQUMsbUJBQW1CLEVBQUUsUUFBUSxDQUFDLENBQUM7cUJBQzVFO2dCQUNMLENBQUM7O2dCQWxEZ0IsZ0JBQWdCO29CQURwQyx5Q0FBVSxFQUFFO3FEQUdzQix1Q0FBaUIsc0JBQ25CLDBDQUFlLG9CQUFmLDBDQUFlO21CQUgzQixnQkFBZ0IsQ0FtRHBDO2dCQUFELHVCQUFDO2FBbkRELEFBbURDO2lDQW5Eb0IsZ0JBQWdCO1FBbURwQyxDQUFDIiwiZmlsZSI6Im9hdXRoLWludGVyY2VwdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRBZ2dyZWdhdG9yIH0gZnJvbSAnYXVyZWxpYS1ldmVudC1hZ2dyZWdhdG9yJztcclxuaW1wb3J0IHsgYXV0b2luamVjdCB9IGZyb20gJ2F1cmVsaWEtZGVwZW5kZW5jeS1pbmplY3Rpb24nO1xyXG5cclxuaW1wb3J0IHsgT0F1dGhTZXJ2aWNlIH0gZnJvbSAnLi9vYXV0aC1zZXJ2aWNlJztcclxuaW1wb3J0IHsgT0F1dGhUb2tlblNlcnZpY2UgfSBmcm9tICcuL29hdXRoLXRva2VuLXNlcnZpY2UnO1xyXG5cclxuY29uc3QgQVVUSE9SSVpBVElPTl9IRUFERVI6IHN0cmluZyA9ICdBdXRob3JpemF0aW9uJztcclxuXHJcbkBhdXRvaW5qZWN0KClcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT0F1dGhJbnRlcmNlcHRvciB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIG9hdXRoVG9rZW5TZXJ2aWNlOiBPQXV0aFRva2VuU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIGV2ZW50QWdncmVnYXRvcjogRXZlbnRBZ2dyZWdhdG9yKSB7IH1cclxuXHJcbiAgICBwdWJsaWMgcmVxdWVzdCA9IChjb25maWc6IGFueSk6IGFueSA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMub2F1dGhUb2tlblNlcnZpY2UuZ2V0VG9rZW4oKSAmJiAhdGhpcy5vYXV0aFRva2VuU2VydmljZS5pc1Rva2VuVmFsaWQoKSkge1xyXG4gICAgICAgICAgICBjb25maWcudG9rZW5FeHBpcmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5ldmVudEFnZ3JlZ2F0b3IucHVibGlzaChPQXV0aFNlcnZpY2UuSU5WQUxJRF9UT0tFTl9FVkVOVCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoY29uZmlnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFN1cHBvcnQgZm9yIGh0dHAtY2xpZW50XHJcbiAgICAgICAgaWYgKGNvbmZpZy5oZWFkZXJzLmFkZCAmJiAhY29uZmlnLmhlYWRlcnMuZ2V0KEFVVEhPUklaQVRJT05fSEVBREVSKSkge1xyXG4gICAgICAgICAgICBjb25maWcuaGVhZGVycy5hZGQoQVVUSE9SSVpBVElPTl9IRUFERVIsIHRoaXMub2F1dGhUb2tlblNlcnZpY2UuZ2V0QXV0aG9yaXphdGlvbkhlYWRlcigpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFN1cHBvcnQgZm9yIGZldGNoLWNsaWVudFxyXG4gICAgICAgIGlmIChjb25maWcuaGVhZGVycy5hcHBlbmQgJiYgIWNvbmZpZy5oZWFkZXJzLmdldChBVVRIT1JJWkFUSU9OX0hFQURFUikpIHtcclxuICAgICAgICAgICAgY29uZmlnLmhlYWRlcnMuYXBwZW5kKEFVVEhPUklaQVRJT05fSEVBREVSLCB0aGlzLm9hdXRoVG9rZW5TZXJ2aWNlLmdldEF1dGhvcml6YXRpb25IZWFkZXIoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29uZmlnO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgcmVzcG9uc2UgPSAocmVzcG9uc2U6IGFueSwgcmVxdWVzdD86IGFueSk6IGFueSA9PiB7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0RXJyb3IocmVzcG9uc2UsIHJlcXVlc3QpO1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIHJlc3BvbnNlRXJyb3IgPSAocmVzcG9uc2U6IGFueSwgcmVxdWVzdD86IGFueSk6IGFueSA9PiB7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0RXJyb3IocmVzcG9uc2UsIHJlcXVlc3QpO1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZXNwb25zZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlUmVxdWVzdEVycm9yKHJlc3BvbnNlOiBhbnksIHJlcXVlc3RNZXNzYWdlPzogYW55KSB7XHJcbiAgICAgICAgLy8gU3VwcG9ydCBmb3IgaHR0cC1jbGllbnRcclxuICAgICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSAmJiByZXNwb25zZS5zdGF0dXNDb2RlID09PSA0MDFcclxuICAgICAgICAgICAgJiYgIXJlc3BvbnNlLnJlcXVlc3RNZXNzYWdlLnRva2VuRXhwaXJlZCAmJiAhdGhpcy5vYXV0aFRva2VuU2VydmljZS5pc1Rva2VuVmFsaWQoKSkge1xyXG4gICAgICAgICAgICByZXNwb25zZS50b2tlbkV4cGlyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50QWdncmVnYXRvci5wdWJsaXNoKE9BdXRoU2VydmljZS5JTlZBTElEX1RPS0VOX0VWRU5ULCByZXNwb25zZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTdXBwb3J0IGZvciBmZXRjaC1jbGllbnRcclxuICAgICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2Uuc3RhdHVzICYmIHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxXHJcbiAgICAgICAgICAgICYmICFyZXF1ZXN0TWVzc2FnZS50b2tlbkV4cGlyZWQgJiYgIXRoaXMub2F1dGhUb2tlblNlcnZpY2UuaXNUb2tlblZhbGlkKCkpIHtcclxuICAgICAgICAgICAgcmVzcG9uc2UudG9rZW5FeHBpcmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5ldmVudEFnZ3JlZ2F0b3IucHVibGlzaChPQXV0aFNlcnZpY2UuSU5WQUxJRF9UT0tFTl9FVkVOVCwgcmVzcG9uc2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==
