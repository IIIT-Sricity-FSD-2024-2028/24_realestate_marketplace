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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const throttler_1 = require("@nestjs/throttler");
const app_service_js_1 = require("./app.service.js");
const ist_time_helper_js_1 = require("./shared/helpers/ist-time.helper.js");
let AppController = class AppController {
    appService;
    mongoConnection;
    constructor(appService, mongoConnection) {
        this.appService = appService;
        this.mongoConnection = mongoConnection;
    }
    getHello() {
        return this.appService.getHello();
    }
    getHealth() {
        const dbConnected = this.mongoConnection.readyState === mongoose_2.ConnectionStates.connected;
        return {
            status: dbConnected ? 'ok' : 'degraded',
            uptime: process.uptime(),
            timestamp: (0, ist_time_helper_js_1.istTimestamp)(),
            database: dbConnected ? 'connected' : 'disconnected',
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, throttler_1.SkipThrottle)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [app_service_js_1.AppService,
        mongoose_2.Connection])
], AppController);
//# sourceMappingURL=app.controller.js.map