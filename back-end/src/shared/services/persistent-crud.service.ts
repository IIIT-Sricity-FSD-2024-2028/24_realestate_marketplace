import { NotFoundException } from '@nestjs/common';
import { Collection } from 'mongodb';
import { Connection } from 'mongoose';

export interface PersistentDocument {
  _id: string;
  [key: string]: any;
}

export abstract class PersistentCrudService {
  protected constructor(
    private readonly connection: Connection,
    private readonly collectionName: string,
    private readonly idPrefix: string,
  ) {}

  private collection(): Collection<PersistentDocument> {
    return this.connection.collection<PersistentDocument>(this.collectionName);
  }

  private toResponse<T extends Record<string, any>>(document: T): Omit<T, '_id'> {
    const { _id, ...response } = document;
    return response as Omit<T, '_id'>;
  }

  async create<T extends Record<string, any>>(dto: T) {
    const id = `${this.idPrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const item = { ...dto, id, _id: id, createdAt: new Date() };
    await this.collection().insertOne(item);
    return this.toResponse(item);
  }

  async findAll() {
    const items = await this.collection().find({}).sort({ createdAt: -1 }).toArray();
    return items.map((item) => this.toResponse(item));
  }

  async findOne(id: string) {
    const item = await this.collection().findOne({ _id: id });
    if (!item) throw new NotFoundException(`Item ${id} not found`);
    return this.toResponse(item);
  }

  async update<T extends Record<string, any>>(id: string, dto: T) {
    const result = await this.collection().findOneAndUpdate(
      { _id: id },
      { $set: { ...dto, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    if (!result) throw new NotFoundException(`Item ${id} not found`);
    return this.toResponse(result);
  }

  async remove(id: string) {
    const result = await this.collection().findOneAndDelete({ _id: id });
    if (!result) throw new NotFoundException(`Item ${id} not found`);
  }
}
