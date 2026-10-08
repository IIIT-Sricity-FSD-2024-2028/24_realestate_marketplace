"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyDocumentsModule = void 0;
const common_1 = require("@nestjs/common");
const property_documents_controller_js_1 = require("./property-documents.controller.js");
const property_documents_service_js_1 = require("./property-documents.service.js");
let PropertyDocumentsModule = class PropertyDocumentsModule {
};
exports.PropertyDocumentsModule = PropertyDocumentsModule;
exports.PropertyDocumentsModule = PropertyDocumentsModule = __decorate([
    (0, common_1.Module)({
        controllers: [property_documents_controller_js_1.PropertyDocumentsController],
        providers: [property_documents_service_js_1.PropertyDocumentsService]
    })
], PropertyDocumentsModule);
//# sourceMappingURL=property-documents.module.js.map