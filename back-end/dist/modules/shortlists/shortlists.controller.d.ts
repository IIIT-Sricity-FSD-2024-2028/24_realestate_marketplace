import { ShortlistsService } from './shortlists.service.js';
import { CreateShortlistDto } from './dto/create-shortlist.dto.js';
import { UpdateShortlistDto } from './dto/update-shortlist.dto.js';
export declare class ShortlistsController {
    private readonly service;
    constructor(service: ShortlistsService);
    create(dto: CreateShortlistDto): Promise<{
        message: string;
        data: Omit<CreateShortlistDto & {
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
    update(id: string, dto: UpdateShortlistDto): Promise<{
        message: string;
        data: Omit<import("mongodb").WithId<import("../../shared/services/persistent-crud.service.js").PersistentDocument>, "_id">;
    }>;
    remove(id: string): Promise<{
        message: string;
        data: null;
    }>;
}
