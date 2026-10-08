import { PropertyDocumentsService } from './property-documents.service.js';
import { CreatePropertyDocumentDto } from './dto/create-property-document.dto.js';
import { UpdatePropertyDocumentDto } from './dto/update-property-document.dto.js';
export declare class PropertyDocumentsController {
    private readonly service;
    constructor(service: PropertyDocumentsService);
    create(dto: CreatePropertyDocumentDto): Promise<{
        message: string;
        data: Omit<CreatePropertyDocumentDto & {
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
    update(id: string, dto: UpdatePropertyDocumentDto): Promise<{
        message: string;
        data: Omit<import("mongodb").WithId<import("../../shared/services/persistent-crud.service.js").PersistentDocument>, "_id">;
    }>;
    remove(id: string): Promise<{
        message: string;
        data: null;
    }>;
}
