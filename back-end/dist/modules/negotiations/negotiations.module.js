"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NegotiationsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const negotiations_controller_js_1 = require("./negotiations.controller.js");
const negotiations_service_js_1 = require("./negotiations.service.js");
const negotiation_schema_js_1 = require("./schemas/negotiation.schema.js");
const properties_module_js_1 = require("../properties/properties.module.js");
const purchases_module_js_1 = require("../purchases/purchases.module.js");
let NegotiationsModule = class NegotiationsModule {
};
exports.NegotiationsModule = NegotiationsModule;
exports.NegotiationsModule = NegotiationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: negotiation_schema_js_1.Negotiation.name, schema: negotiation_schema_js_1.NegotiationSchema }]),
            properties_module_js_1.PropertiesModule,
            purchases_module_js_1.PurchasesModule,
        ],
        controllers: [negotiations_controller_js_1.NegotiationsController],
        providers: [negotiations_service_js_1.NegotiationsService],
        exports: [negotiations_service_js_1.NegotiationsService],
    })
], NegotiationsModule);
//# sourceMappingURL=negotiations.module.js.map