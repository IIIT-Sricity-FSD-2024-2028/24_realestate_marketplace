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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const user_schema_js_1 = require("./schemas/user.schema.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const service_cities_js_1 = require("../../shared/constants/service-cities.js");
const ist_time_helper_js_1 = require("../../shared/helpers/ist-time.helper.js");
const SALT_ROUNDS = 10;
let UsersService = UsersService_1 = class UsersService {
    userModel;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(userModel) {
        this.userModel = userModel;
    }
    async onModuleInit() {
        try {
            await this.userModel.syncIndexes();
        }
        catch (error) {
            this.logger.warn(`Failed to sync User indexes: ${error.message}`);
        }
    }
    toResponse(user) {
        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            userType: user.userType ?? null,
            phone: user.phone ?? null,
            city: user.city ?? null,
            state: user.state ?? null,
            isBlocked: user.isBlocked ?? false,
            createdAt: (0, ist_time_helper_js_1.istTimestamp)(user.createdAt ?? new Date()),
            updatedAt: (0, ist_time_helper_js_1.istTimestamp)(user.updatedAt ?? new Date()),
        };
    }
    assertCanModifyTarget(target, actor) {
        if (target.role === role_enum_js_1.Role.SUPERUSER && actor.role !== role_enum_js_1.Role.SUPERUSER) {
            throw new common_1.ForbiddenException('Only a superuser can modify another superuser account');
        }
    }
    assertValidId(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException(`"${id}" is not a valid user ID`);
        }
    }
    static async hashPassword(plain) {
        return bcrypt.hash(plain, SALT_ROUNDS);
    }
    describeAccountType(userType) {
        return userType ? `${userType} ` : '';
    }
    async create(dto, actor) {
        if (actor && dto.role && dto.role !== role_enum_js_1.Role.USER && actor.role !== role_enum_js_1.Role.SUPERUSER) {
            throw new common_1.ForbiddenException(`Only a superuser can create ${dto.role} accounts. Admins can create user accounts only.`);
        }
        if (dto.role === role_enum_js_1.Role.ADMIN) {
            await this.assertCityIsFree(dto.city, null);
        }
        const userType = dto.userType ?? null;
        const existing = await this.userModel.findOne({ email: dto.email.toLowerCase(), userType });
        if (existing) {
            throw new common_1.ConflictException(`A ${this.describeAccountType(userType)}account with email "${dto.email}" already exists`);
        }
        const passwordHash = await UsersService_1.hashPassword(dto.password);
        const user = await this.userModel.create({
            name: dto.name,
            email: dto.email,
            passwordHash,
            role: dto.role,
            userType,
            phone: dto.phone ?? null,
            city: dto.city ?? null,
            state: dto.state ?? null,
        });
        return this.toResponse(user);
    }
    async findAll() {
        const users = await this.userModel.find().sort({ createdAt: -1 });
        return users.map((u) => this.toResponse(u));
    }
    async findOne(id) {
        this.assertValidId(id);
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        return this.toResponse(user);
    }
    async findAccountForAuth(email, userType = null) {
        return this.userModel
            .findOne({ email: email.toLowerCase(), userType })
            .select('+passwordHash');
    }
    async findDocumentById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.userModel.findById(id);
    }
    async findDocumentByIdForAuth(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.userModel.findById(id).select('+passwordHash');
    }
    async assertCityIsFree(city, excludeId) {
        const serviceCity = (0, service_cities_js_1.normalizeCity)(city);
        if (!serviceCity) {
            throw new common_1.BadRequestException(`An admin must be assigned to one of the cities we operate in: ${service_cities_js_1.SERVICE_CITIES.join(', ')}`);
        }
        const holder = await this.userModel.findOne({
            role: role_enum_js_1.Role.ADMIN,
            userType: null,
            city: serviceCity,
            ...(excludeId && { _id: { $ne: excludeId } }),
        });
        if (holder) {
            throw new common_1.ConflictException(`${serviceCity} already has an admin (${holder.email}). Each city has exactly one admin desk.`);
        }
    }
    async findAdminForCity(city) {
        const serviceCity = (0, service_cities_js_1.normalizeCity)(city);
        if (!serviceCity)
            return null;
        return this.userModel.findOne({ role: role_enum_js_1.Role.ADMIN, userType: null, city: serviceCity });
    }
    async update(id, dto, actor) {
        this.assertValidId(id);
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        this.assertCanModifyTarget(user, actor);
        if (dto.role === role_enum_js_1.Role.SUPERUSER && actor.role !== role_enum_js_1.Role.SUPERUSER) {
            throw new common_1.ForbiddenException('Only a superuser can grant the superuser role');
        }
        const nextEmail = dto.email ? dto.email.toLowerCase() : user.email;
        const nextUserType = dto.userType !== undefined ? dto.userType : user.userType;
        const identityChanged = nextEmail !== user.email || nextUserType !== user.userType;
        if (identityChanged) {
            const conflict = await this.userModel.findOne({
                email: nextEmail,
                userType: nextUserType,
                _id: { $ne: user._id },
            });
            if (conflict) {
                throw new common_1.ConflictException(`A ${this.describeAccountType(nextUserType)}account with email "${nextEmail}" already exists`);
            }
        }
        const nextRole = dto.role ?? user.role;
        const nextCity = dto.city !== undefined ? dto.city : user.city;
        if (nextRole === role_enum_js_1.Role.ADMIN && (dto.role !== undefined || dto.city !== undefined)) {
            await this.assertCityIsFree(nextCity, user._id);
        }
        if (dto.email !== undefined)
            user.email = dto.email;
        if (dto.name !== undefined)
            user.name = dto.name;
        if (dto.role !== undefined)
            user.role = dto.role;
        if (dto.userType !== undefined)
            user.userType = dto.userType;
        if (dto.phone !== undefined)
            user.phone = dto.phone;
        if (dto.city !== undefined)
            user.city = dto.city;
        if (dto.state !== undefined)
            user.state = dto.state;
        if (dto.isBlocked !== undefined)
            user.isBlocked = dto.isBlocked;
        await user.save();
        return this.toResponse(user);
    }
    async remove(id, actor) {
        this.assertValidId(id);
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        this.assertCanModifyTarget(user, actor);
        await user.deleteOne();
    }
    async resetPassword(userId, newPasswordHash) {
        await this.userModel.updateOne({ _id: userId }, {
            $set: { passwordHash: newPasswordHash },
            $unset: { passwordResetTokenHash: '', passwordResetExpires: '' },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_js_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map