"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingModule = void 0;
const common_1 = require("@nestjs/common");
const billing_controller_js_1 = require("./billing.controller.js");
const billing_service_js_1 = require("./billing.service.js");
const payments_module_js_1 = require("../payments/payments.module.js");
const subscriptions_module_js_1 = require("../subscriptions/subscriptions.module.js");
const commissions_module_js_1 = require("../commissions/commissions.module.js");
const properties_module_js_1 = require("../properties/properties.module.js");
let BillingModule = class BillingModule {
};
exports.BillingModule = BillingModule;
exports.BillingModule = BillingModule = __decorate([
    (0, common_1.Module)({
        imports: [payments_module_js_1.PaymentsModule, subscriptions_module_js_1.SubscriptionsModule, commissions_module_js_1.CommissionsModule, properties_module_js_1.PropertiesModule],
        controllers: [billing_controller_js_1.BillingController],
        providers: [billing_service_js_1.BillingService],
        exports: [billing_service_js_1.BillingService],
    })
], BillingModule);
//# sourceMappingURL=billing.module.js.map