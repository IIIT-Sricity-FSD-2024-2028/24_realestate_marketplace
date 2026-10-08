"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRole = ApiRole;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_js_1 = require("./roles.decorator.js");
const roles_guard_js_1 = require("../guards/roles.guard.js");
const jwt_auth_guard_js_1 = require("../guards/jwt-auth.guard.js");
function ApiRole(...roles) {
    return (0, common_1.applyDecorators)((0, roles_decorator_js_1.Roles)(...roles), (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard), (0, swagger_1.ApiBearerAuth)('access-token'), (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid authentication token' }), (0, swagger_1.ApiForbiddenResponse)({ description: `Forbidden. Required role(s): ${roles.join(', ')}` }));
}
//# sourceMappingURL=api-role.decorator.js.map