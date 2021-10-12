System.register([], function (exports_1, context_1) {
    "use strict";
    var LocalStorageService;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            LocalStorageService = (function () {
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
            exports_1("default", LocalStorageService);
        }
    };
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2NhbC1zdG9yYWdlLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztZQUFBO2dCQUFBO2dCQW9CQSxDQUFDO2dCQW5CVSxnREFBa0IsR0FBekI7b0JBQ0ksT0FBTyxNQUFNLENBQUMsWUFBWSxLQUFLLFNBQVMsQ0FBQztnQkFDN0MsQ0FBQztnQkFFTSxpQ0FBRyxHQUFWLFVBQWMsR0FBVyxFQUFFLE1BQVM7b0JBQ2hDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUMzRSxDQUFDO2dCQUVNLGlDQUFHLEdBQVYsVUFBYyxHQUFXO29CQUNyQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RFLENBQUM7Z0JBRU0sb0NBQU0sR0FBYixVQUFjLEdBQVc7b0JBQ3JCLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDdEQsQ0FBQztnQkFFTyxxQ0FBTyxHQUFmLFVBQWdCLEdBQVc7b0JBQ3ZCLE9BQVUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLFNBQUksR0FBSyxDQUFDO2dCQUNoRCxDQUFDO2dCQUNMLDBCQUFDO1lBQUQsQ0FwQkEsQUFvQkMsSUFBQTs7UUFBQSxDQUFDIiwiZmlsZSI6ImxvY2FsLXN0b3JhZ2Utc2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGNsYXNzIExvY2FsU3RvcmFnZVNlcnZpY2Uge1xuICAgIHB1YmxpYyBpc1N0b3JhZ2VTdXBwb3J0ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlICE9PSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIHNldDxUPihrZXk6IHN0cmluZywgb2JqZWN0OiBUKTogdm9pZCB7XG4gICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLm1ha2VLZXkoa2V5KSwgSlNPTi5zdHJpbmdpZnkob2JqZWN0KSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldDxUPihrZXk6IHN0cmluZyk6IFQge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5tYWtlS2V5KGtleSkpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlKGtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLm1ha2VLZXkoa2V5KSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtYWtlS2V5KGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGAke3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZX0vJHtrZXl9YDtcbiAgICB9XG59Il19
