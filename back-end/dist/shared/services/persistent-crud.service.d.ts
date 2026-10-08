import { Connection } from 'mongoose';
export interface PersistentDocument {
    _id: string;
    [key: string]: any;
}
export declare abstract class PersistentCrudService {
    private readonly connection;
    private readonly collectionName;
    private readonly idPrefix;
    protected constructor(connection: Connection, collectionName: string, idPrefix: string);
    private collection;
    private toResponse;
    create<T extends Record<string, any>>(dto: T): Promise<Omit<T & {
        id: string;
        _id: string;
        createdAt: Date;
    }, "_id">>;
    findAll(): Promise<Omit<import("mongodb").WithId<PersistentDocument>, "_id">[]>;
    findOne(id: string): Promise<Omit<import("mongodb").WithId<PersistentDocument>, "_id">>;
    update<T extends Record<string, any>>(id: string, dto: T): Promise<Omit<import("mongodb").WithId<PersistentDocument>, "_id">>;
    remove(id: string): Promise<void>;
}
