"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LocalStorageService = (function () {
    function LocalStorageService() {
    }
    LocalStorageService.prototype.isStorageSupported = function () {
        return window.localStorage !== undefined;
    };
    LocalStorageService.prototype.set = function (key, object) {
        window.localStorage.setItem(key, JSON.stringify(object));
    };
    LocalStorageService.prototype.get = function (key) {
        return JSON.parse(window.localStorage.getItem(key));
    };
    LocalStorageService.prototype.remove = function (key) {
        window.localStorage.removeItem(key);
    };
    return LocalStorageService;
}());
exports.default = LocalStorageService;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2NhbC1zdG9yYWdlLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtJQUFBO0lBZ0JBLENBQUM7SUFmVSxnREFBa0IsR0FBekI7UUFDSSxPQUFPLE1BQU0sQ0FBQyxZQUFZLEtBQUssU0FBUyxDQUFDO0lBQzdDLENBQUM7SUFFTSxpQ0FBRyxHQUFWLFVBQWMsR0FBVyxFQUFFLE1BQVM7UUFDaEMsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRU0saUNBQUcsR0FBVixVQUFjLEdBQVc7UUFDckIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVNLG9DQUFNLEdBQWIsVUFBYyxHQUFXO1FBQ3JCLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFDTCwwQkFBQztBQUFELENBaEJBLEFBZ0JDLElBQUEiLCJmaWxlIjoibG9jYWwtc3RvcmFnZS1zZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYWxTdG9yYWdlU2VydmljZSB7XHJcbiAgICBwdWJsaWMgaXNTdG9yYWdlU3VwcG9ydGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlICE9PSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldDxUPihrZXk6IHN0cmluZywgb2JqZWN0OiBUKTogdm9pZCB7XHJcbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgSlNPTi5zdHJpbmdpZnkob2JqZWN0KSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldDxUPihrZXk6IHN0cmluZyk6IFQge1xyXG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVtb3ZlKGtleTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XHJcbiAgICB9XHJcbn0iXX0=
