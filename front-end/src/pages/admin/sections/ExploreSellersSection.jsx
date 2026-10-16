/**
 * ExploreSellersSection.jsx
 * Purpose: "Explore Sellers" — registered, unblocked sellers who have not
 *          listed anything in this city yet (prospects), with an email link.
 *          (This section existed on the old page but had no menu entry; it
 *          is now reachable under Sellers.)
 * Inputs (props): desk – shared users + listings
 * Outputs: prospect cards.
 * API calls: none (uses desk.users from GET /users and desk.listings).
 */
import { Avatar, EmptyState, PageHeader, StatusLine } from '../../../components/common/ui.jsx';
import { groupSellers } from '../useAdminDesk.js';
import { AVATAR_COLORS } from '../../../utils/constants.js';

export default function ExploreSellersSection({ desk }) {
  const onDesk = groupSellers(desk.listings); // sellers already listing here
  const prospects = desk.users.filter((u) => u.userType === 'seller' && !u.isBlocked && !onDesk.has(u.id));
  const loading = desk.loading.users || desk.loading.listings;

  return (
    <>
      <PageHeader title="Explore Sellers" subtitle="Find new seller clients" />
      <div className="content">
        <StatusLine loading={loading && !prospects.length} error={desk.errors.users} />
        {!loading && prospects.length === 0 && <EmptyState icon="🤝">Every registered seller already has a listing on your desk.</EmptyState>}
        <div className="card-grid-2">
          {prospects.map((u, i) => (
            <article key={u.id} className="card">
              <div className="row-center gap-md mb-3">
                <Avatar name={u.name} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} textColor="#000" />
                <div>
                  <h3 className="strong">{u.name || 'Unnamed seller'}</h3>
                  <p className="text-secondary small">{u.email}</p>
                  <p className="text-secondary small">No listings in your city yet</p>
                </div>
              </div>
              <a className="btn btn-primary btn-block" href={'mailto:' + (u.email || '')}>
                ✉️ Contact
              </a>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
