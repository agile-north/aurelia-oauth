define(["require", "exports"], function (require, exports) {
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
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2NhbC1zdG9yYWdlLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBQUE7UUFBQTtRQW9CQSxDQUFDO1FBbkJVLGdEQUFrQixHQUF6QjtZQUNJLE9BQU8sTUFBTSxDQUFDLFlBQVksS0FBSyxTQUFTLENBQUM7UUFDN0MsQ0FBQztRQUVNLGlDQUFHLEdBQVYsVUFBYyxHQUFXLEVBQUUsTUFBUztZQUNoQyxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBRU0saUNBQUcsR0FBVixVQUFjLEdBQVc7WUFDckIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFTSxvQ0FBTSxHQUFiLFVBQWMsR0FBVztZQUNyQixNQUFNLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVPLHFDQUFPLEdBQWYsVUFBZ0IsR0FBVztZQUN2QixPQUFVLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxTQUFJLEdBQUssQ0FBQztRQUNoRCxDQUFDO1FBQ0wsMEJBQUM7SUFBRCxDQXBCQSxBQW9CQyxJQUFBIiwiZmlsZSI6ImxvY2FsLXN0b3JhZ2Utc2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGNsYXNzIExvY2FsU3RvcmFnZVNlcnZpY2Uge1xuICAgIHB1YmxpYyBpc1N0b3JhZ2VTdXBwb3J0ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlICE9PSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIHNldDxUPihrZXk6IHN0cmluZywgb2JqZWN0OiBUKTogdm9pZCB7XG4gICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLm1ha2VLZXkoa2V5KSwgSlNPTi5zdHJpbmdpZnkob2JqZWN0KSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldDxUPihrZXk6IHN0cmluZyk6IFQge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5tYWtlS2V5KGtleSkpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlKGtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLm1ha2VLZXkoa2V5KSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtYWtlS2V5KGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGAke3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZX0vJHtrZXl9YDtcbiAgICB9XG59Il19
