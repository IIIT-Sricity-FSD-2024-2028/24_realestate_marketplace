import { beforeEach, describe, expect, it } from 'vitest';
import { clearApplicationState, store } from './index.js';
import { sessionStarted } from './slices/authSlice.js';
import { propertyCreated, propertyRemoved, propertyUpdated } from './slices/propertiesSlice.js';
import { userCreated, userRemoved, userUpdated } from './slices/usersSlice.js';

describe('Redux application store', () => {
  beforeEach(() => store.dispatch(clearApplicationState()));

  it('keeps the authenticated session in memory and clears it atomically on logout', () => {
    store.dispatch(sessionStarted({ id: 'buyer-1', name: 'Buyer', role: 'buyer', token: 'jwt' }));
    expect(store.getState().auth.user).toMatchObject({ id: 'buyer-1', token: 'jwt' });

    store.dispatch(clearApplicationState());
    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().properties.mine).toEqual([]);
  });

  it('supports property and user create, update, and delete reducers', () => {
    store.dispatch(propertyCreated({ id: 'property-1', title: 'Original home' }));
    store.dispatch(propertyUpdated({ id: 'property-1', title: 'Updated home' }));
    expect(store.getState().properties.mine).toEqual([{ id: 'property-1', title: 'Updated home' }]);
    store.dispatch(propertyRemoved('property-1'));
    expect(store.getState().properties.mine).toEqual([]);

    store.dispatch(userCreated({ id: 'user-1', name: 'Original user' }));
    store.dispatch(userUpdated({ id: 'user-1', name: 'Updated user' }));
    expect(store.getState().users.items).toEqual([{ id: 'user-1', name: 'Updated user' }]);
    store.dispatch(userRemoved('user-1'));
    expect(store.getState().users.items).toEqual([]);
  });
});
