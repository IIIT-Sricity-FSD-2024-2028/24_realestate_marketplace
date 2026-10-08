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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const role_enum_js_1 = require("../../../common/enums/role.enum.js");
const user_schema_js_1 = require("../schemas/user.schema.js");
class UserResponseDto {
    id;
    name;
    email;
    role;
    userType;
    phone;
    city;
    state;
    isBlocked;
    createdAt;
    updatedAt;
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jane Doe' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'jane.doe@example.com' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: role_enum_js_1.Role, example: role_enum_js_1.Role.USER }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: user_schema_js_1.UserType,
        example: user_schema_js_1.UserType.BUYER,
        nullable: true,
        description: 'Display-only sub-category for regular users (buyer/seller)',
    }),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "userType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+911234567890', nullable: true }),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Chennai',
        nullable: true,
        description: 'Informational city for this account — no longer restricts what an admin can act on',
    }),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Tamil Nadu',
        nullable: true,
        description: 'Informational state for this account — no longer restricts what an admin can act on',
    }),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Blocked accounts cannot log in' }),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "isBlocked", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-01T05:30:00.000+05:30' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-15T05:30:00.000+05:30' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=user-response.dto.js.map