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
exports.PropertiesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const properties_service_js_1 = require("./properties.service.js");
const create_property_dto_js_1 = require("./dto/create-property.dto.js");
const update_property_dto_js_1 = require("./dto/update-property.dto.js");
const property_response_dto_js_1 = require("./dto/property-response.dto.js");
const reject_property_dto_js_1 = require("./dto/reject-property.dto.js");
const review_queue_filter_dto_js_1 = require("./dto/review-queue-filter.dto.js");
const listing_filter_dto_js_1 = require("../listings/dto/listing-filter.dto.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const api_role_decorator_js_1 = require("../../common/decorators/api-role.decorator.js");
const current_user_decorator_js_1 = require("../../common/decorators/current-user.decorator.js");
const optional_jwt_auth_guard_js_1 = require("../../common/guards/optional-jwt-auth.guard.js");
const api_response_decorator_js_1 = require("../../common/decorators/api-response.decorator.js");
const upload_config_js_1 = require("../../common/upload/upload.config.js");
let PropertiesController = class PropertiesController {
    propertiesService;
    constructor(propertiesService) {
        this.propertiesService = propertiesService;
    }
    async create(dto, user) {
        const data = await this.propertiesService.create(dto, user);
        return { message: 'Property created successfully', data };
    }
    async findAll(filters) {
        const data = await this.propertiesService.search(filters);
        return { message: 'Properties retrieved successfully', data };
    }
    async findMine(user) {
        const data = await this.propertiesService.findByOwner(user.id);
        return { message: 'Your properties retrieved successfully', data };
    }
    async findForReview(filters, user) {
        const data = await this.propertiesService.findForReview(filters, user);
        return { message: 'Review queue retrieved successfully', data };
    }
    async findOne(id, user) {
        const data = await this.propertiesService.findOne(id, user);
        return { message: 'Property retrieved successfully', data };
    }
    async update(id, dto, user) {
        const data = await this.propertiesService.update(id, dto, user);
        return { message: 'Property updated successfully', data };
    }
    async verify(id, user) {
        const data = await this.propertiesService.verify(id, user);
        return { message: 'Property verified successfully', data };
    }
    async reject(id, dto, user) {
        const data = await this.propertiesService.reject(id, dto.reason, user);
        return { message: 'Property rejected', data };
    }
    async uploadDocuments(id, files, user) {
        if (!files || files.length === 0) {
            throw (0, upload_config_js_1.noValidFilesException)(upload_config_js_1.ALLOWED_DOCUMENT_MIME_TYPES);
        }
        const safeId = id.replace(/[^a-fA-F0-9]/g, '');
        const uploaded = files.map((f) => ({
            url: `/uploads/property-documents/${safeId}/${f.filename}`,
            originalName: f.originalname,
        }));
        const data = await this.propertiesService.addDocuments(id, user, uploaded);
        return { message: 'Documents uploaded successfully', data };
    }
    async uploadImages(id, files, user) {
        if (!files || files.length === 0) {
            throw (0, upload_config_js_1.noValidFilesException)(upload_config_js_1.ALLOWED_IMAGE_MIME_TYPES);
        }
        const safeId = id.replace(/[^a-fA-F0-9]/g, '');
        const urls = files.map((f) => `/uploads/property-images/${safeId}/${f.filename}`);
        const data = await this.propertiesService.addImages(id, user, urls);
        return { message: 'Photos uploaded successfully', data };
    }
    async remove(id, user) {
        await this.propertiesService.remove(id, user);
        return { message: 'Property deleted successfully', data: null };
    }
};
exports.PropertiesController = PropertiesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new property listing (seller accounts only)',
        description: 'ONLY a seller account may list a property — admins and superusers cannot, and neither can ' +
            'buyers. An admin\'s authority over the catalogue is verify / reject / delete. The listing ' +
            'starts `verificationStatus: pending` and stays hidden from public search until an admin ' +
            'verifies it. Price must be positive, bedrooms 0–20, bathrooms 1–20.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(property_response_dto_js_1.PropertyResponseDto, 201),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_property_dto_js_1.CreatePropertyDto, Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'List and filter verified properties (paginated)',
        description: 'Public search endpoint — only returns `verificationStatus: verified` listings. ' +
            'Supports filtering by city, state, type, listing type, status, price range, bedrooms, ' +
            'and area. Results are paginated (max 50 per page). If minPrice > maxPrice, a 400 error is returned.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Paginated list of matching properties',
        schema: {
            properties: {
                success: { type: 'boolean', example: true },
                statusCode: { type: 'number', example: 200 },
                message: { type: 'string', example: 'Properties retrieved successfully' },
                data: {
                    properties: {
                        items: { type: 'array', items: { $ref: '#/components/schemas/PropertyResponseDto' } },
                        total: { type: 'number', example: 42 },
                        page: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 10 },
                        totalPages: { type: 'number', example: 5 },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [listing_filter_dto_js_1.ListingFilterDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('mine'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN, role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: "List the authenticated user's own properties",
        description: 'For admins: every property they own. For sellers: every property they submitted, in ' +
            'any verification state (pending/verified/rejected).',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(property_response_dto_js_1.PropertyResponseDto, 200, true),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)('review-queue'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Admin/superuser property review queue',
        description: 'Every listing regardless of verification state, with the submitting seller\'s name/email ' +
            'populated where applicable. Filter by `verificationStatus` to see just pending submissions. ' +
            'Every admin sees the same full queue — no per-admin scoping.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(property_response_dto_js_1.PropertyResponseDto, 200, true),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [review_queue_filter_dto_js_1.ReviewQueueFilterDto, Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "findForReview", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_js_1.OptionalJwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get property by ID',
        description: 'Returns a single property. Public endpoint — an optional bearer token is honored if present, ' +
            'so the private `documents` array is included only when the caller is the admin/superuser or ' +
            'the seller who owns this listing; everyone else gets `images` only.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Property ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(property_response_dto_js_1.PropertyResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Property'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN, role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a property',
        description: 'Partially updates a property. Only send fields to change. Admins/superusers can update ' +
            "any property; sellers may only update their own submissions, which resets them to " +
            '`verificationStatus: pending` for re-review.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Property ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(property_response_dto_js_1.PropertyResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Property'),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_property_dto_js_1.UpdatePropertyDto, Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/verify'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify a pending property listing',
        description: 'Marks the listing verified so it appears in public search. Any admin/superuser may verify — ' +
            'no per-admin restriction — see PropertiesService.assertCanVerify.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Property ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(property_response_dto_js_1.PropertyResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Property'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "verify", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Reject a pending property listing',
        description: 'Marks the listing rejected, optionally with a reason. Any admin/superuser may act — no ' +
            'per-admin restriction.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Property ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(property_response_dto_js_1.PropertyResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Property'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reject_property_dto_js_1.RejectPropertyDto, Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/documents'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN, role_enum_js_1.Role.USER),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } },
        },
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload verification documents for a property',
        description: 'Up to 10 files (PDF/JPEG/PNG/WEBP, 10MB each). The property\'s owning seller, or any ' +
            'admin/superuser, may upload. Files are stored under /uploads and served statically.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Property ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(property_response_dto_js_1.PropertyResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Property'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', upload_config_js_1.MAX_FILES_PER_REQUEST, (0, upload_config_js_1.buildUploadOptions)({
        folder: 'property-documents',
        allowedMimeTypes: upload_config_js_1.ALLOWED_DOCUMENT_MIME_TYPES,
    }))),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "uploadDocuments", null);
__decorate([
    (0, common_1.Post)(':id/images'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN, role_enum_js_1.Role.USER),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } },
        },
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload photos for a property',
        description: 'Up to 10 files (JPEG/PNG/WEBP, 10MB each). These are the public, buyer-facing photos ' +
            "(shown in listings) — separate from /documents, which are private verification files only " +
            "the admin/superuser or owning seller can see. The property's owning seller, or any " +
            'admin/superuser, may upload.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Property ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(property_response_dto_js_1.PropertyResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Property'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', upload_config_js_1.MAX_FILES_PER_REQUEST, (0, upload_config_js_1.buildUploadOptions)({
        folder: 'property-images',
        allowedMimeTypes: upload_config_js_1.ALLOWED_IMAGE_MIME_TYPES,
    }))),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "uploadImages", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN, role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a property',
        description: 'Permanently deletes a property listing. Deleting is the only way an admin/superuser can ' +
            'remove a listing from the catalogue (they cannot create one) and they may delete any ' +
            'property; a seller may delete only their own submissions.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Property ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiNotFound)('Property'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "remove", null);
exports.PropertiesController = PropertiesController = __decorate([
    (0, swagger_1.ApiTags)('Properties'),
    (0, swagger_1.ApiExtraModels)(property_response_dto_js_1.PropertyResponseDto),
    (0, common_1.Controller)('properties'),
    __metadata("design:paramtypes", [properties_service_js_1.PropertiesService])
], PropertiesController);
//# sourceMappingURL=properties.controller.js.map