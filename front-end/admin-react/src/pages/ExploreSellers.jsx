import PageHeader from '../components/PageHeader.jsx';
import StateMessage, { DataState } from '../components/StateMessage.jsx';
import useAdminSellers from '../hooks/useAdminSellers.js';
import { AVATAR_COLORS, initials } from '../utils/format.js';

/**
 * Explore Sellers (was data-section="explore-sellers").
 * Prospects = registered, unblocked sellers with no listing in this admin's
 * city yet (GET /users + GET /properties/review-queue). Like the old page,
 * this section has no sidebar link; it is reachable at #/explore-sellers.
 */
export default function ExploreSellers() {
  const { status, data, error } = useAdminSellers();
  const prospects = data ? data.prospects : [];

  return (
    <>
      <PageHeader title="Explore Sellers" subtitle="Find new seller clients" />
      <div className="page-body">
        <div className="grid grid-2">
          <DataState status={status} error={error} fallbackError="Couldn't load sellers." fullRow />
          {status === 'ready' && prospects.length === 0 && (
            <StateMessage fullRow>Every registered seller already has a listing on your desk.</StateMessage>
          )}
          {status === 'ready' && prospects.map((u, i) => (
            <div key={u.id} className="card card-pad">
              <div className="person-row" style={{ marginBottom: '1rem' }}>
                <div className="avatar avatar--lg" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>{initials(u.name)}</div>
                <div className="person-row__text">
                  <h3 className="strong">{u.name || 'Unnamed seller'}</h3>
                  <p className="muted small-plus">{u.email || ''}</p>
                  <p className="muted small-plus">No listings in your city yet</p>
                </div>
              </div>
              <a className="btn btn-primary btn-block btn-md" href={'mailto:' + (u.email || '')}>✉️ Contact</a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
