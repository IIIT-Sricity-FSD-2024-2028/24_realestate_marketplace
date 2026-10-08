import { Types } from 'mongoose';

/**
 * Gets an ID from either a raw ObjectId/string reference or a populated
 * Mongoose document. A populated reference becomes `null` when its target
 * document has been deleted, so response mappers must tolerate that case.
 */
export function referenceId(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (value instanceof Types.ObjectId) return value.toString();
  if (typeof value === 'object' && '_id' in value) {
    return referenceId((value as { _id?: unknown })._id);
  }
  return null;
}
