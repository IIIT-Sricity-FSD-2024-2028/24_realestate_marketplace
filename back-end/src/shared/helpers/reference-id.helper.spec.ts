import { Types } from 'mongoose';
import { referenceId } from './reference-id.helper.js';

describe('referenceId', () => {
  it('returns null for a missing populated reference', () => {
    expect(referenceId(null)).toBeNull();
    expect(referenceId(undefined)).toBeNull();
  });

  it('returns the id from raw and populated references', () => {
    const id = new Types.ObjectId();

    expect(referenceId(id)).toBe(id.toString());
    expect(referenceId(id.toString())).toBe(id.toString());
    expect(referenceId({ _id: id })).toBe(id.toString());
  });

  it('does not turn arbitrary objects into invalid IDs', () => {
    expect(referenceId({})).toBeNull();
  });
});
