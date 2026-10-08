import { BuyersService } from './buyers.service.js';
import { CreateBuyerDto } from './dto/create-buyer.dto.js';
import { UpdateBuyerDto } from './dto/update-buyer.dto.js';
export declare class BuyersController {
    private readonly service;
    constructor(service: BuyersService);
    create(dto: CreateBuyerDto): Promise<{
        message: string;
        data: Omit<CreateBuyerDto & {
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
    update(id: string, dto: UpdateBuyerDto): Promise<{
        message: string;
        data: Omit<import("mongodb").WithId<import("../../shared/services/persistent-crud.service.js").PersistentDocument>, "_id">;
    }>;
    remove(id: string): Promise<{
        message: string;
        data: null;
    }>;
}
