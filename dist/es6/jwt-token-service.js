System.register([], function (exports_1, context_1) {
    "use strict";
    var JwtTokenService;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            JwtTokenService = (function () {
                function JwtTokenService() {
                    var _this = this;
                    this.getJwtClaims = function (encodedToken) {
                        var jwtToken = _this.createJwtToken(encodedToken);
                        var base64Decoded = _this.decodeBase64String(jwtToken.payload);
                        return JSON.parse(base64Decoded);
                    };
                    this.createJwtToken = function (token) {
                        var jwtTokenPartsRegex = /^([^\.\s]*)\.([^\.\s]+)\.([^\.\s]*)$/;
                        var matches = jwtTokenPartsRegex.exec(token);
                        var isValidToken = matches && matches.length === 4;
                        return {
                            header: isValidToken ? matches[1] : '',
                            payload: isValidToken ? matches[2] : '',
                            signature: isValidToken ? matches[3] : ''
                        };
                    };
                    this.decodeBase64String = function (base64IdToken) {
                        base64IdToken = base64IdToken.replace(/-/g, '+').replace(/_/g, '/');
                        if (!window.atob) {
                            throw new Error('Browser doesn\'t implement atob');
                        }
                        return window.atob(base64IdToken);
                    };
                }
                return JwtTokenService;
            }());
            exports_1("default", JwtTokenService);
        }
    };
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9qd3QtdG9rZW4tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O1lBY0E7Z0JBQUE7b0JBQUEsaUJBNkJDO29CQTVCVSxpQkFBWSxHQUFHLFVBQUMsWUFBb0I7d0JBQ3ZDLElBQU0sUUFBUSxHQUFHLEtBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7d0JBQ25ELElBQU0sYUFBYSxHQUFHLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBRWhFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDckMsQ0FBQyxDQUFDO29CQUVNLG1CQUFjLEdBQUcsVUFBQyxLQUFhO3dCQUNuQyxJQUFNLGtCQUFrQixHQUFHLHNDQUFzQyxDQUFDO3dCQUNsRSxJQUFNLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQy9DLElBQU0sWUFBWSxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQzt3QkFFckQsT0FBaUI7NEJBQ2IsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFOzRCQUN0QyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7NEJBQ3ZDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTt5QkFDNUMsQ0FBQztvQkFDTixDQUFDLENBQUM7b0JBRU0sdUJBQWtCLEdBQUcsVUFBQyxhQUFxQjt3QkFDL0MsYUFBYSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBRXBFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFOzRCQUNkLE1BQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQzt5QkFDdEQ7d0JBRUQsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUN0QyxDQUFDLENBQUM7Z0JBQ04sQ0FBQztnQkFBRCxzQkFBQztZQUFELENBN0JBLEFBNkJDLElBQUE7O1FBQUEsQ0FBQyIsImZpbGUiOiJqd3QtdG9rZW4tc2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImludGVyZmFjZSBKd3RUb2tlbiB7XHJcbiAgICBoZWFkZXI6IHN0cmluZztcclxuICAgIHBheWxvYWQ6IHN0cmluZztcclxuICAgIHNpZ25hdHVyZTogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEp3dENsYWltcyB7XHJcbiAgICBleHA6IG51bWJlcjtcclxuICAgIG5iZj86IG51bWJlcjtcclxuICAgIGlhdD86IG51bWJlcjtcclxuICAgIHBwaWQ/OiBzdHJpbmc7XHJcbiAgICBnaXZlbl9uYW1lPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBKd3RUb2tlblNlcnZpY2Uge1xyXG4gICAgcHVibGljIGdldEp3dENsYWltcyA9IChlbmNvZGVkVG9rZW46IHN0cmluZyk6IEp3dENsYWltcyA9PiB7XHJcbiAgICAgICAgY29uc3Qgand0VG9rZW4gPSB0aGlzLmNyZWF0ZUp3dFRva2VuKGVuY29kZWRUb2tlbik7XHJcbiAgICAgICAgY29uc3QgYmFzZTY0RGVjb2RlZCA9IHRoaXMuZGVjb2RlQmFzZTY0U3RyaW5nKGp3dFRva2VuLnBheWxvYWQpO1xyXG5cclxuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShiYXNlNjREZWNvZGVkKTtcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBjcmVhdGVKd3RUb2tlbiA9ICh0b2tlbjogc3RyaW5nKTogSnd0VG9rZW4gPT4ge1xyXG4gICAgICAgIGNvbnN0IGp3dFRva2VuUGFydHNSZWdleCA9IC9eKFteXFwuXFxzXSopXFwuKFteXFwuXFxzXSspXFwuKFteXFwuXFxzXSopJC87XHJcbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGp3dFRva2VuUGFydHNSZWdleC5leGVjKHRva2VuKTtcclxuICAgICAgICBjb25zdCBpc1ZhbGlkVG9rZW4gPSBtYXRjaGVzICYmIG1hdGNoZXMubGVuZ3RoID09PSA0O1xyXG5cclxuICAgICAgICByZXR1cm4gPEp3dFRva2VuPntcclxuICAgICAgICAgICAgaGVhZGVyOiBpc1ZhbGlkVG9rZW4gPyBtYXRjaGVzWzFdIDogJycsXHJcbiAgICAgICAgICAgIHBheWxvYWQ6IGlzVmFsaWRUb2tlbiA/IG1hdGNoZXNbMl0gOiAnJyxcclxuICAgICAgICAgICAgc2lnbmF0dXJlOiBpc1ZhbGlkVG9rZW4gPyBtYXRjaGVzWzNdIDogJydcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIGRlY29kZUJhc2U2NFN0cmluZyA9IChiYXNlNjRJZFRva2VuOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG4gICAgICAgIGJhc2U2NElkVG9rZW4gPSBiYXNlNjRJZFRva2VuLnJlcGxhY2UoLy0vZywgJysnKS5yZXBsYWNlKC9fL2csICcvJyk7XHJcblxyXG4gICAgICAgIGlmICghd2luZG93LmF0b2IpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCcm93c2VyIGRvZXNuXFwndCBpbXBsZW1lbnQgYXRvYicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5hdG9iKGJhc2U2NElkVG9rZW4pO1xyXG4gICAgfTtcclxufSJdfQ==
