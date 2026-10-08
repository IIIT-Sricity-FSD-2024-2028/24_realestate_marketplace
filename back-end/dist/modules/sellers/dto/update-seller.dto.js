"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSellerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_seller_dto_js_1 = require("./create-seller.dto.js");
class UpdateSellerDto extends (0, swagger_1.PartialType)(create_seller_dto_js_1.CreateSellerDto) {
}
exports.UpdateSellerDto = UpdateSellerDto;
//# sourceMappingURL=update-seller.dto.js.map