import { AdminsService } from './admins.service.js';
import { CreateAdminDto } from './dto/create-admin.dto.js';
import { UpdateAdminDto } from './dto/update-admin.dto.js';
export declare class AdminsController {
    private readonly service;
    constructor(service: AdminsService);
    create(dto: CreateAdminDto): Promise<{
        message: string;
        data: Omit<CreateAdminDto & {
            id: string;
            _id: string;
            createdAt: Date;
        }, "_id">;
    }>;
    findAll(): Promise<{
        message: string;
        data: Omit<import("mongodb").WithId<import("../../shared/services/persistent-crud.service.js").PersistentDocument>, "_id">[];
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: Omit<import("mongodb").WithId<import("../../shared/services/persistent-crud.service.js").PersistentDocument>, "_id">;
    }>;
    update(id: string, dto: UpdateAdminDto): Promise<{
        message: string;
        data: Omit<import("mongodb").WithId<import("../../shared/services/persistent-crud.service.js").PersistentDocument>, "_id">;
    }>;
    remove(id: string): Promise<{
        message: string;
        data: null;
    }>;
}
