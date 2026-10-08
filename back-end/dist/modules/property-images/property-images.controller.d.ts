import { PropertyImagesService } from './property-images.service.js';
import { CreatePropertyImageDto } from './dto/create-property-image.dto.js';
import { UpdatePropertyImageDto } from './dto/update-property-image.dto.js';
export declare class PropertyImagesController {
    private readonly service;
    constructor(service: PropertyImagesService);
    create(dto: CreatePropertyImageDto): Promise<{
        message: string;
        data: Omit<CreatePropertyImageDto & {
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
    update(id: string, dto: UpdatePropertyImageDto): Promise<{
        message: string;
        data: Omit<import("mongodb").WithId<import("../../shared/services/persistent-crud.service.js").PersistentDocument>, "_id">;
    }>;
    remove(id: string): Promise<{
        message: string;
        data: null;
    }>;
}
