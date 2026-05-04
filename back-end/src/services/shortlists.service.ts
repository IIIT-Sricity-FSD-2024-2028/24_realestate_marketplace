import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ShortlistsService {
  private readonly items = new Map<string, any>();
  private counter = 0;

  create(dto: any) {
    const id = `shortlists_${++this.counter}`;
    const now = new Date();
    const item = { id, ...dto, createdAt: now, updatedAt: now };
    this.items.set(id, item);
    return item;
  }

  findAll() {
    return Array.from(this.items.values());
  }

  findOne(id: string) {
    const item = this.items.get(id);
    if (!item) throw new NotFoundException(`Item ${id} not found`);
    return item;
  }

  update(id: string, dto: any) {
    const item = this.findOne(id);
    const changes = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    );
    const updated = { ...item, ...changes, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  remove(id: string) {
    this.findOne(id);
    this.items.delete(id);
  }
}
