import { Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';

/**
 * One-time migration run from a service's `onModuleInit()`: casts any of
 * `fields` that got persisted as a raw BSON string back to a real
 * `ObjectId`.
 *
 * Why this exists: `@nestjs/mongoose`'s `SchemaFactory` only recognizes
 * `mongoose.Schema.Types.ObjectId` as the ObjectId schema type — passing
 * `mongoose.Types.ObjectId` (the BSON value class, an easy mistake since
 * both are commonly imported as `Types` from `'mongoose'`) silently falls
 * through to `Mixed`, which performs no casting on save. Every ref field
 * declared that way before the fix got written to MongoDB as a plain
 * string instead of an ObjectId — invisible to `.toString()` equality
 * checks and to `.populate()` (which casts using the *foreign* model's
 * `_id` type), but never matched by a direct `{ field: someObjectId }` or
 * `{ field: { $in: [...] } }` query, since MongoDB compares BSON types
 * exactly. This backfill (paired with fixing the schema's `type:` going
 * forward) repairs already-written documents so both query styles work.
 */
export async function backfillObjectIdStrings<T>(
  model: Model<T>,
  fields: string[],
  logger: Logger,
): Promise<void> {
  try {
    const query = { $or: fields.map((f) => ({ [f]: { $type: 'string' } })) };
    // .lean() is essential here: once a field is correctly schema-typed as
    // ObjectId (the fix this backfill accompanies), Mongoose's ObjectId
    // getter casts a raw string value to a real Types.ObjectId *in memory*
    // the moment a hydrated document reads it — even though nothing's been
    // saved yet — so a normal `.find()` would make every value look
    // already-fixed and this backfill would silently no-op. `.lean()`
    // returns the driver's raw decoded value instead, bypassing that cast.
    const docs = await model.find(query as Record<string, unknown>).select(fields.join(' ')).lean();
    if (docs.length === 0) return;

    const ops = docs.map((doc) => {
      const set: Record<string, Types.ObjectId> = {};
      for (const field of fields) {
        const value = (doc as unknown as Record<string, unknown>)[field];
        if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
          set[field] = new Types.ObjectId(value);
        }
      }
      return {
        updateOne: {
          filter: { _id: (doc as unknown as { _id: unknown })._id },
          update: { $set: set },
        },
      };
    });

    // Building a properly-typed AnyBulkWriteOperation<T> here fights the
    // generic — this helper is intentionally schema-agnostic (`fields` is
    // just a list of path names), so a plain shape is cast at the boundary.
    await model.bulkWrite(ops as Parameters<typeof model.bulkWrite>[0]);
    logger.log(`Backfilled ${ops.length} document(s) with string-stored ObjectId fields (${fields.join(', ')}).`);
  } catch (error) {
    logger.warn(`Failed to backfill ObjectId-string fields (${fields.join(', ')}): ${(error as Error).message}`);
  }
}
