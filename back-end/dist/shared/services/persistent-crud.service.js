"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistentCrudService = void 0;
const common_1 = require("@nestjs/common");
class PersistentCrudService {
    connection;
    collectionName;
    idPrefix;
    constructor(connection, collectionName, idPrefix) {
        this.connection = connection;
        this.collectionName = collectionName;
        this.idPrefix = idPrefix;
    }
    collection() {
        return this.connection.collection(this.collectionName);
    }
    toResponse(document) {
        const { _id, ...response } = document;
        return response;
    }
    async create(dto) {
        const id = `${this.idPrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const item = { ...dto, id, _id: id, createdAt: new Date() };
        await this.collection().insertOne(item);
        return this.toResponse(item);
    }
    async findAll() {
        const items = await this.collection().find({}).sort({ createdAt: -1 }).toArray();
        return items.map((item) => this.toResponse(item));
    }
    async findOne(id) {
        const item = await this.collection().findOne({ _id: id });
        if (!item)
            throw new common_1.NotFoundException(`Item ${id} not found`);
        return this.toResponse(item);
    }
    async update(id, dto) {
        const result = await this.collection().findOneAndUpdate({ _id: id }, { $set: { ...dto, updatedAt: new Date() } }, { returnDocument: 'after' });
        if (!result)
            throw new common_1.NotFoundException(`Item ${id} not found`);
        return this.toResponse(result);
    }
    async remove(id) {
        const result = await this.collection().findOneAndDelete({ _id: id });
        if (!result)
            throw new common_1.NotFoundException(`Item ${id} not found`);
    }
}
exports.PersistentCrudService = PersistentCrudService;
//# sourceMappingURL=persistent-crud.service.js.map