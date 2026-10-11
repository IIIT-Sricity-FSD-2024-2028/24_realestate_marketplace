import { getPropertyReviewQueue, listUsers } from '../api/adminApi.js';
import useAdminData from './useAdminData.js';

/**
 * Builds the sellers on this admin's desk from real data.
 * The property review queue is already city-scoped by the server, so every
 * seller with a listing in it is "under me". GET /users supplies prospects:
 * registered, unblocked sellers who have not listed here yet.
 *
 * Returns useAdminData() state where data = { sellers[], listingsById, prospects[] }.
 */
export default function useAdminSellers() {
  return useAdminData(async () => {
    const [queueRes, usersRes] = await Promise.all([
      getPropertyReviewQueue(),
      listUsers().catch(() => ({ data: [] })), // prospects are optional
    ]);
    const listings = queueRes.data.items || [];
    const users = usersRes.data || [];

    const sellersById = new Map();
    const listingsById = new Map();
    listings.forEach((listing) => {
      listingsById.set(listing.id, listing);
      // An admin-created listing has no seller, so it adds nobody to the list.
      if (!listing.sellerId) return;
      if (!sellersById.has(listing.sellerId)) {
        sellersById.set(listing.sellerId, {
          id: listing.sellerId,
          name: listing.sellerName || 'Unknown seller',
          email: listing.sellerEmail || '',
          phone: listing.sellerPhone || null,
          since: listing.sellerSince || null,
          listings: [],
        });
      }
      sellersById.get(listing.sellerId).listings.push(listing);
    });

    const prospects = users.filter((u) => u.userType === 'seller' && !u.isBlocked && !sellersById.has(u.id));
    return { sellers: [...sellersById.values()], listingsById, prospects };
  });
}
