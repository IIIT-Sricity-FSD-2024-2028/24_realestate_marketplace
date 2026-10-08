/**
 * Gives every seller-less property a seller.
 *
 * Why this exists: the seeded catalogue was created by the admin account, so
 * each listing had `sellerId: null`. Negotiation is strictly buyer-seller —
 * only the seller who listed a property may counter/accept/reject an offer on
 * it (admins never touch price; they drive the deal *after* acceptance). A
 * listing with no seller therefore has nobody who can answer an offer, and the
 * buyer's offer would sit pending forever.
 *
 * This alternates the seller-less listings between the platform's seller
 * accounts (deterministically, ordered by _id) and clears `adminId`, which
 * means "an admin listed this directly" and must not stay set once a listing
 * belongs to a seller.
 *
 * Safe to re-run — it only ever touches properties that still have no seller.
 *
 *   node scripts/assign-seed-property-sellers.js            # every seller account
 *   node scripts/assign-seed-property-sellers.js a@x.com b@y.com   # only these
 */
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/real_estate';
const dbName = new URL(uri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'http://')).pathname.slice(1) || 'real_estate';

async function main() {
  const wanted = process.argv.slice(2).map((e) => e.toLowerCase());
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const query = { role: 'user', userType: 'seller' };
  if (wanted.length) query.email = { $in: wanted };
  const sellers = await db.collection('users').find(query).sort({ _id: 1 }).toArray();
  if (!sellers.length) {
    console.error('No seller accounts found — register a seller first.');
    process.exitCode = 1;
    return;
  }

  const orphans = await db
    .collection('properties')
    .find({ $or: [{ sellerId: null }, { sellerId: { $exists: false } }] })
    .sort({ _id: 1 })
    .toArray();

  if (!orphans.length) {
    console.log('Every property already has a seller — nothing to do.');
    return;
  }

  const ops = orphans.map((property, i) => ({
    updateOne: {
      filter: { _id: property._id },
      // adminId is cleared on purpose: it means "an admin's own direct
      // listing". Leaving it set would keep the property in that admin's
      // /properties/mine even though a seller now owns it.
      update: { $set: { sellerId: sellers[i % sellers.length]._id, adminId: null } },
    },
  }));
  await db.collection('properties').bulkWrite(ops);

  const counts = new Map();
  orphans.forEach((p, i) => {
    const seller = sellers[i % sellers.length];
    counts.set(seller.email, (counts.get(seller.email) || 0) + 1);
    console.log(`  ${p.title} → ${seller.email}`);
  });
  console.log(`\nAssigned ${orphans.length} listing(s):`);
  for (const [email, n] of counts) console.log(`  ${email}: ${n}`);

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
