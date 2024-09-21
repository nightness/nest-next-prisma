"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppMiddleware = void 0;
var common_1 = require("@nestjs/common");
var AppMiddleware = /** @class */ (function () {
    function AppMiddleware() {
        this.logger = new common_1.Logger('HTTP');
    }
    AppMiddleware.prototype.use = function (req, res, next) {
        var _this = this;
        var start = Date.now();
        // Log requests
        res.on('finish', function () {
            var responseTime = Date.now() - start;
            var message = "".concat(req.method, " ").concat(req.originalUrl, " ").concat(res.statusCode, " ").concat(res.get('Content-Length') || 0, " - ").concat(responseTime);
            // Log the request
            _this.logger.log(message);
        });
        // Loosen CSP for Swagger routes
        if (req.path.startsWith('/swagger') ||
            req.path.startsWith('/favicon.ico')) {
            res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;");
        }
        next();
    };
    AppMiddleware = __decorate([
        (0, common_1.Injectable)()
    ], AppMiddleware);
    return AppMiddleware;
}());
exports.AppMiddleware = AppMiddleware;
