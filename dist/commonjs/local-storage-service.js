"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LocalStorageService = (function () {
    function LocalStorageService() {
    }
    LocalStorageService.prototype.isStorageSupported = function () {
        return window.localStorage !== undefined;
    };
    LocalStorageService.prototype.set = function (key, object) {
        window.localStorage.setItem(this.makeKey(key), JSON.stringify(object));
    };
    LocalStorageService.prototype.get = function (key) {
        return JSON.parse(window.localStorage.getItem(this.makeKey(key)));
    };
    LocalStorageService.prototype.remove = function (key) {
        window.localStorage.removeItem(this.makeKey(key));
    };
    LocalStorageService.prototype.makeKey = function (key) {
        return window.location.pathname + "/" + key;
    };
    return LocalStorageService;
}());
exports.default = LocalStorageService;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2NhbC1zdG9yYWdlLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtJQUFBO0lBb0JBLENBQUM7SUFuQlUsZ0RBQWtCLEdBQXpCO1FBQ0ksT0FBTyxNQUFNLENBQUMsWUFBWSxLQUFLLFNBQVMsQ0FBQztJQUM3QyxDQUFDO0lBRU0saUNBQUcsR0FBVixVQUFjLEdBQVcsRUFBRSxNQUFTO1FBQ2hDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFTSxpQ0FBRyxHQUFWLFVBQWMsR0FBVztRQUNyQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVNLG9DQUFNLEdBQWIsVUFBYyxHQUFXO1FBQ3JCLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU8scUNBQU8sR0FBZixVQUFnQixHQUFXO1FBQ3ZCLE9BQVUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLFNBQUksR0FBSyxDQUFDO0lBQ2hELENBQUM7SUFDTCwwQkFBQztBQUFELENBcEJBLEFBb0JDLElBQUEiLCJmaWxlIjoibG9jYWwtc3RvcmFnZS1zZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYWxTdG9yYWdlU2VydmljZSB7XHJcbiAgICBwdWJsaWMgaXNTdG9yYWdlU3VwcG9ydGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlICE9PSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldDxUPihrZXk6IHN0cmluZywgb2JqZWN0OiBUKTogdm9pZCB7XHJcbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMubWFrZUtleShrZXkpLCBKU09OLnN0cmluZ2lmeShvYmplY3QpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0PFQ+KGtleTogc3RyaW5nKTogVCB7XHJcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMubWFrZUtleShrZXkpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbW92ZShrZXk6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLm1ha2VLZXkoa2V5KSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBtYWtlS2V5KGtleTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gYCR7d2luZG93LmxvY2F0aW9uLnBhdGhuYW1lfS8ke2tleX1gO1xyXG4gICAgfVxyXG59Il19
