"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const users_service_js_1 = require("../users/users.service.js");
const mail_service_js_1 = require("../mail/mail.service.js");
const TEMP_PASSWORD_LENGTH = 12;
const TEMP_PASSWORD_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
function generateTemporaryPassword() {
    const bytes = (0, crypto_1.randomBytes)(TEMP_PASSWORD_LENGTH);
    let out = '';
    for (let i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
        out += TEMP_PASSWORD_ALPHABET[bytes[i] % TEMP_PASSWORD_ALPHABET.length];
    }
    return out;
}
function parseExpiryToSeconds(expiresIn) {
    const match = /^(\d+)(s|m|h|d)$/.exec(expiresIn.trim());
    if (!match)
        return Number(expiresIn) || 86400;
    const value = Number(match[1]);
    const unit = match[2];
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * multipliers[unit];
}
let AuthService = AuthService_1 = class AuthService {
    usersService;
    jwtService;
    configService;
    mailService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(usersService, jwtService, configService, mailService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailService = mailService;
    }
    issueToken(user) {
        const payload = {
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const expiresIn = this.configService.get('jwt.expiresIn');
        return {
            accessToken: this.jwtService.sign(payload),
            tokenType: 'Bearer',
            expiresIn: parseExpiryToSeconds(expiresIn),
            user: this.usersService.toResponse(user),
        };
    }
    async register(dto) {
        await this.usersService.create({
            name: dto.name,
            email: dto.email,
            password: dto.password,
            role: role_enum_js_1.Role.USER,
            userType: dto.userType,
            phone: dto.phone,
        });
        const user = await this.usersService.findAccountForAuth(dto.email, dto.userType ?? null);
        return this.issueToken(user);
    }
    async login(dto) {
        const user = await this.usersService.findAccountForAuth(dto.email, dto.userType ?? null);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordMatches) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.isBlocked) {
            throw new common_1.ForbiddenException('This account has been blocked. Please contact an administrator.');
        }
        return this.issueToken(user);
    }
    async forgotPassword(dto) {
        const user = await this.usersService.findAccountForAuth(dto.email, dto.userType ?? null);
        if (!user) {
            return {};
        }
        const temporaryPassword = generateTemporaryPassword();
        const passwordHash = await users_service_js_1.UsersService.hashPassword(temporaryPassword);
        await this.usersService.resetPassword(user._id.toString(), passwordHash);
        await this.mailService.sendNewPasswordEmail(user.email, user.name, temporaryPassword, user.userType ?? null);
        this.logger.log(`New password emailed for ${user.email} (${user.userType ?? 'admin/superuser'}).`);
        return {};
    }
    async changePassword(actor, dto) {
        const user = await this.usersService.findDocumentByIdForAuth(actor.id);
        if (!user) {
            throw new common_1.UnauthorizedException('Account not found');
        }
        const currentMatches = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!currentMatches) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const newPasswordHash = await users_service_js_1.UsersService.hashPassword(dto.newPassword);
        await this.usersService.resetPassword(user._id.toString(), newPasswordHash);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_js_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_js_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map