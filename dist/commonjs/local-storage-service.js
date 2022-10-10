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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2NhbC1zdG9yYWdlLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtJQUFBO0lBb0JBLENBQUM7SUFuQlUsZ0RBQWtCLEdBQXpCO1FBQ0ksT0FBTyxNQUFNLENBQUMsWUFBWSxLQUFLLFNBQVMsQ0FBQztJQUM3QyxDQUFDO0lBRU0saUNBQUcsR0FBVixVQUFjLEdBQVcsRUFBRSxNQUFTO1FBQ2hDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFTSxpQ0FBRyxHQUFWLFVBQWMsR0FBVztRQUNyQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVNLG9DQUFNLEdBQWIsVUFBYyxHQUFXO1FBQ3JCLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU8scUNBQU8sR0FBZixVQUFnQixHQUFXO1FBQ3ZCLE9BQVUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLFNBQUksR0FBSyxDQUFDO0lBQ2hELENBQUM7SUFDTCwwQkFBQztBQUFELENBcEJBLEFBb0JDLElBQUEiLCJmaWxlIjoibG9jYWwtc3RvcmFnZS1zZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYWxTdG9yYWdlU2VydmljZSB7XG4gICAgcHVibGljIGlzU3RvcmFnZVN1cHBvcnRlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2UgIT09IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0PFQ+KGtleTogc3RyaW5nLCBvYmplY3Q6IFQpOiB2b2lkIHtcbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMubWFrZUtleShrZXkpLCBKU09OLnN0cmluZ2lmeShvYmplY3QpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0PFQ+KGtleTogc3RyaW5nKTogVCB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLm1ha2VLZXkoa2V5KSkpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmUoa2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMubWFrZUtleShrZXkpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG1ha2VLZXkoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYCR7d2luZG93LmxvY2F0aW9uLnBhdGhuYW1lfS8ke2tleX1gO1xuICAgIH1cbn0iXX0=
