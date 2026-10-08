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
var VisitsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const visit_schema_js_1 = require("./schemas/visit.schema.js");
const visit_enum_js_1 = require("../../shared/enums/visit.enum.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const user_schema_js_1 = require("../users/schemas/user.schema.js");
const properties_service_js_1 = require("../properties/properties.service.js");
const objectid_backfill_helper_js_1 = require("../../shared/helpers/objectid-backfill.helper.js");
const reference_id_helper_js_1 = require("../../shared/helpers/reference-id.helper.js");
const ist_time_helper_js_1 = require("../../shared/helpers/ist-time.helper.js");
function isPopulated(ref) {
    return !!ref && typeof ref === 'object' && '_id' in ref;
}
let VisitsService = VisitsService_1 = class VisitsService {
    visitModel;
    propertiesService;
    logger = new common_1.Logger(VisitsService_1.name);
    constructor(visitModel, propertiesService) {
        this.visitModel = visitModel;
        this.propertiesService = propertiesService;
    }
    async onModuleInit() {
        await (0, objectid_backfill_helper_js_1.backfillObjectIdStrings)(this.visitModel, ['propertyId', 'buyerId'], this.logger);
    }
    toResponse(v) {
        const property = v.propertyId;
        const buyer = v.buyerId;
        const propertyPopulated = isPopulated(property);
        const buyerPopulated = isPopulated(buyer);
        return {
            id: v._id.toString(),
            propertyId: (0, reference_id_helper_js_1.referenceId)(property),
            buyerId: (0, reference_id_helper_js_1.referenceId)(buyer),
            requestedDate: v.requestedDate,
            requestedSlot: v.requestedSlot,
            message: v.message ?? null,
            status: v.status,
            cancelReason: v.cancelReason ?? null,
            ...(propertyPopulated && {
                propertyTitle: property.title,
                propertyCity: property.city,
                propertyState: property.state,
                propertyImage: property.images?.[0] ?? null,
            }),
            ...(buyerPopulated && {
                buyerName: buyer.name,
                buyerEmail: buyer.email,
            }),
            createdAt: (0, ist_time_helper_js_1.istTimestamp)(v.createdAt ?? new Date()),
            updatedAt: (0, ist_time_helper_js_1.istTimestamp)(v.updatedAt ?? new Date()),
        };
    }
    assertValidId(id, label = 'visit') {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException(`"${id}" is not a valid ${label} ID`);
        }
    }
    async loadOrThrow(id) {
        this.assertValidId(id);
        const visit = await this.visitModel.findById(id);
        if (!visit) {
            throw new common_1.NotFoundException(`Visit with ID "${id}" not found`);
        }
        return visit;
    }
    assertOwnsOrElevated(visit, actor) {
        if (actor.role === role_enum_js_1.Role.SUPERUSER)
            return;
        if ((0, reference_id_helper_js_1.referenceId)(visit.buyerId) === actor.id)
            return;
        throw new common_1.ForbiddenException('You do not have permission to access this visit');
    }
    async assertCanManage(visit, actor) {
        if (actor.role !== role_enum_js_1.Role.ADMIN && actor.role !== role_enum_js_1.Role.SUPERUSER) {
            throw new common_1.ForbiddenException('Only an admin or superuser may manage this visit');
        }
        await this.propertiesService.assertAdminHandlesProperty((0, reference_id_helper_js_1.referenceId)(visit.propertyId), actor);
    }
    async create(dto, actor) {
        if (actor.userType !== user_schema_js_1.UserType.BUYER) {
            throw new common_1.ForbiddenException('Only buyer accounts can request a site visit');
        }
        await this.propertiesService.findOne(dto.propertyId);
        const visit = await this.visitModel.create({
            propertyId: dto.propertyId,
            buyerId: actor.id,
            requestedDate: dto.requestedDate,
            requestedSlot: dto.requestedSlot,
            message: dto.message ?? null,
            status: visit_enum_js_1.VisitStatus.PENDING,
        });
        return this.toResponse(visit);
    }
    async findByOwner(buyerId) {
        this.assertValidId(buyerId, 'user');
        const visits = await this.visitModel
            .find({ buyerId })
            .populate('propertyId', 'title city state images')
            .sort({ createdAt: -1 });
        return visits.map((v) => this.toResponse(v));
    }
    async findForReview(actor, filters) {
        const query = {};
        if (filters.status)
            query.status = filters.status;
        const propertyIds = await this.propertiesService.propertyIdsForAdmin(actor);
        if (propertyIds)
            query.propertyId = { $in: propertyIds };
        const page = filters.page ?? 1;
        const limit = Math.min(filters.limit ?? 20, 50);
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.visitModel
                .find(query)
                .populate('propertyId', 'title city state images')
                .populate('buyerId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            this.visitModel.countDocuments(query),
        ]);
        return {
            items: items.map((v) => this.toResponse(v)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }
    async confirm(id, actor) {
        const visit = await this.loadOrThrow(id);
        await this.assertCanManage(visit, actor);
        if (![visit_enum_js_1.VisitStatus.PENDING, visit_enum_js_1.VisitStatus.RESCHEDULED].includes(visit.status)) {
            throw new common_1.BadRequestException(`Cannot confirm a visit that is ${visit.status}`);
        }
        visit.status = visit_enum_js_1.VisitStatus.CONFIRMED;
        await visit.save();
        return this.toResponse(visit);
    }
    async reschedule(id, dto, actor) {
        const visit = await this.loadOrThrow(id);
        await this.assertCanManage(visit, actor);
        if (![visit_enum_js_1.VisitStatus.PENDING, visit_enum_js_1.VisitStatus.CONFIRMED, visit_enum_js_1.VisitStatus.RESCHEDULED].includes(visit.status)) {
            throw new common_1.BadRequestException(`Cannot reschedule a visit that is ${visit.status}`);
        }
        visit.requestedDate = dto.requestedDate;
        visit.requestedSlot = dto.requestedSlot;
        visit.status = visit_enum_js_1.VisitStatus.RESCHEDULED;
        await visit.save();
        return this.toResponse(visit);
    }
    async complete(id, actor) {
        const visit = await this.loadOrThrow(id);
        await this.assertCanManage(visit, actor);
        if (![visit_enum_js_1.VisitStatus.CONFIRMED, visit_enum_js_1.VisitStatus.RESCHEDULED].includes(visit.status)) {
            throw new common_1.BadRequestException(`Cannot complete a visit that is ${visit.status}`);
        }
        visit.status = visit_enum_js_1.VisitStatus.COMPLETED;
        await visit.save();
        return this.toResponse(visit);
    }
    async cancel(id, dto, actor) {
        const visit = await this.loadOrThrow(id);
        if ((0, reference_id_helper_js_1.referenceId)(visit.buyerId) !== actor.id) {
            await this.assertCanManage(visit, actor);
        }
        if ([visit_enum_js_1.VisitStatus.COMPLETED, visit_enum_js_1.VisitStatus.CANCELLED].includes(visit.status)) {
            throw new common_1.BadRequestException(`Cannot cancel a visit that is already ${visit.status}`);
        }
        visit.status = visit_enum_js_1.VisitStatus.CANCELLED;
        visit.cancelReason = dto.reason ?? null;
        await visit.save();
        return this.toResponse(visit);
    }
    async findOne(id, actor) {
        const visit = await this.loadOrThrow(id);
        this.assertOwnsOrElevated(visit, actor);
        await visit.populate([
            { path: 'propertyId', select: 'title city state images' },
            { path: 'buyerId', select: 'name email' },
        ]);
        return this.toResponse(visit);
    }
};
exports.VisitsService = VisitsService;
exports.VisitsService = VisitsService = VisitsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(visit_schema_js_1.Visit.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        properties_service_js_1.PropertiesService])
], VisitsService);
//# sourceMappingURL=visits.service.js.map