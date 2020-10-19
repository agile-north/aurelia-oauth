"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UrlHashService = (function () {
    function UrlHashService() {
        var _this = this;
        this.getHash = function (hashValue) {
            var hash = hashValue ? hashValue : window.location.hash;
            if (hash.indexOf('#/') > -1) {
                hash = hash.substring(hash.indexOf('#/') + 2);
            }
            else if (hash.indexOf('#') > -1) {
                hash = hash.substring(1);
            }
            return hash;
        };
        this.getHashData = function (hashValue) {
            var hash = _this.getHash(hashValue);
            var searchRegex = /([^&=]+)=?([^&]*)/g;
            var hashData = {};
            var match = searchRegex.exec(hash);
            while (match) {
                var parameter = _this.decodeUrlData(match[1]);
                var value = _this.decodeUrlData(match[2]);
                hashData[parameter] = value;
                match = searchRegex.exec(hash);
            }
            return hashData;
        };
        this.clearHash = function () {
            window.location.hash = '';
        };
        this.decodeUrlData = function (s) {
            return decodeURIComponent(s.replace(/\+/g, ' '));
        };
    }
    return UrlHashService;
}());
exports.default = UrlHashService;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91cmwtaGFzaC1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7SUFBQTtRQUFBLGlCQXFDQztRQXBDVSxZQUFPLEdBQUcsVUFBQyxTQUFrQjtZQUNoQyxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFFeEQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUN6QixJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ2pEO2lCQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDL0IsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDNUI7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDLENBQUM7UUFFSyxnQkFBVyxHQUFHLFVBQUMsU0FBa0I7WUFDcEMsSUFBTSxJQUFJLEdBQUcsS0FBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyQyxJQUFNLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQztZQUN6QyxJQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFFcEIsSUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuQyxPQUFPLEtBQUssRUFBRTtnQkFDVixJQUFNLFNBQVMsR0FBRyxLQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQyxJQUFNLEtBQUssR0FBRyxLQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUUzQyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUM1QixLQUFLLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNsQztZQUVELE9BQU8sUUFBUSxDQUFDO1FBQ3BCLENBQUMsQ0FBQztRQUVLLGNBQVMsR0FBRztZQUNmLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUM5QixDQUFDLENBQUM7UUFFTSxrQkFBYSxHQUFHLFVBQUMsQ0FBUztZQUM5QixPQUFPLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDckQsQ0FBQyxDQUFDO0lBQ04sQ0FBQztJQUFELHFCQUFDO0FBQUQsQ0FyQ0EsQUFxQ0MsSUFBQSIsImZpbGUiOiJ1cmwtaGFzaC1zZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgY2xhc3MgVXJsSGFzaFNlcnZpY2Uge1xyXG4gICAgcHVibGljIGdldEhhc2ggPSAoaGFzaFZhbHVlPzogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuICAgICAgICBsZXQgaGFzaCA9IGhhc2hWYWx1ZSA/IGhhc2hWYWx1ZSA6IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xyXG5cclxuICAgICAgICBpZiAoaGFzaC5pbmRleE9mKCcjLycpID4gLTEpIHtcclxuICAgICAgICAgICAgaGFzaCA9IGhhc2guc3Vic3RyaW5nKGhhc2guaW5kZXhPZignIy8nKSArIDIpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaGFzaC5pbmRleE9mKCcjJykgPiAtMSkge1xyXG4gICAgICAgICAgICBoYXNoID0gaGFzaC5zdWJzdHJpbmcoMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaGFzaDtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGdldEhhc2hEYXRhID0gKGhhc2hWYWx1ZT86IHN0cmluZyk6IGFueSA9PiB7XHJcbiAgICAgICAgY29uc3QgaGFzaCA9IHRoaXMuZ2V0SGFzaChoYXNoVmFsdWUpO1xyXG4gICAgICAgIGNvbnN0IHNlYXJjaFJlZ2V4ID0gLyhbXiY9XSspPT8oW14mXSopL2c7XHJcbiAgICAgICAgY29uc3QgaGFzaERhdGEgPSB7fTtcclxuXHJcbiAgICAgICAgbGV0IG1hdGNoID0gc2VhcmNoUmVnZXguZXhlYyhoYXNoKTtcclxuICAgICAgICB3aGlsZSAobWF0Y2gpIHtcclxuICAgICAgICAgICAgY29uc3QgcGFyYW1ldGVyID0gdGhpcy5kZWNvZGVVcmxEYXRhKG1hdGNoWzFdKTtcclxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmRlY29kZVVybERhdGEobWF0Y2hbMl0pO1xyXG5cclxuICAgICAgICAgICAgaGFzaERhdGFbcGFyYW1ldGVyXSA9IHZhbHVlO1xyXG4gICAgICAgICAgICBtYXRjaCA9IHNlYXJjaFJlZ2V4LmV4ZWMoaGFzaCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaGFzaERhdGE7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBjbGVhckhhc2ggPSAoKTogdm9pZCA9PiB7XHJcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnJztcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBkZWNvZGVVcmxEYXRhID0gKHM6IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzLnJlcGxhY2UoL1xcKy9nLCAnICcpKTtcclxuICAgIH07XHJcbn0iXX0=
