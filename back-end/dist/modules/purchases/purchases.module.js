"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const purchases_controller_js_1 = require("./purchases.controller.js");
const purchases_service_js_1 = require("./purchases.service.js");
const purchase_schema_js_1 = require("./schemas/purchase.schema.js");
const properties_module_js_1 = require("../properties/properties.module.js");
const commissions_module_js_1 = require("../commissions/commissions.module.js");
let PurchasesModule = class PurchasesModule {
};
exports.PurchasesModule = PurchasesModule;
exports.PurchasesModule = PurchasesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: purchase_schema_js_1.Purchase.name, schema: purchase_schema_js_1.PurchaseSchema }]),
            properties_module_js_1.PropertiesModule,
            commissions_module_js_1.CommissionsModule,
        ],
        controllers: [purchases_controller_js_1.PurchasesController],
        providers: [purchases_service_js_1.PurchasesService],
        exports: [purchases_service_js_1.PurchasesService],
    })
], PurchasesModule);
//# sourceMappingURL=purchases.module.js.map