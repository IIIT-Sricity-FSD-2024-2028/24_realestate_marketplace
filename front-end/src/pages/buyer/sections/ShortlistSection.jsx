/**
 * ShortlistSection.jsx
 * Purpose: "My Shortlist" — listings the buyer hearted (saved per account in
 *          this browser), with visit / consider / contact / details actions.
 * Inputs (props): data – useBuyerData(); actions – listing actions
 * Outputs: shortlist cards or an empty state.
 * API calls: none (visit requests go through ScheduleVisitModal).
 */
import { EmptyState, PageHeader } from '../../../components/common/ui.jsx';
import { savedMatches } from '../useBuyerData.js';
import './ShortlistSection.css';

export default function ShortlistSection({ data, actions }) {
  // Only listings that are still in the live catalogue are shown.
  const saved = data.catalog.filter((card) => data.shortlist.some((e) => savedMatches(e, card)));
  return (
    <>
      <PageHeader title="My Shortlist" subtitle={saved.length + ' propert' + (saved.length === 1 ? 'y' : 'ies') + ' saved'} icon="heart" />
      <div className="content">
        {saved.length === 0 ? (
          <EmptyState icon="♡" title="Shortlist is empty">
            Click the heart icon on any property to save it here.
          </EmptyState>
        ) : (
          saved.map((card) => (
            <article key={card.id} className="saved-card">
              <button type="button" className="saved-remove" onClick={() => actions.shortlist(card)} aria-label={'Remove ' + card.title + ' from shortlist'}>
                ✕
              </button>
              <div className="saved-media">
                <img src={card.img} alt={card.title} loading="lazy" />
                <span className="listing-tag listing-tag-left">{card.type}</span>
              </div>
              <div className="saved-body">
                <h3 className="card-title-lg">{card.title}</h3>
                <p className="text-secondary small mb-2">📍 {card.area}</p>
                <div className="row-wrap gap-lg mb-3 small">
                  {card.beds ? (
                    <span>
                      Bedrooms <strong>{card.beds}</strong>
                    </span>
                  ) : null}
                  {card.baths ? (
                    <span>
                      Bathrooms <strong>{card.baths}</strong>
                    </span>
                  ) : null}
                  {card.sqft ? (
                    <span>
                      Area <strong>{card.sqft} sqft</strong>
                    </span>
                  ) : null}
                </div>
                <div className="space-between wrap gap-md">
                  <div>
                    <div className="text-secondary small">Price</div>
                    <div className="price-lg">{card.priceFmt}</div>
                  </div>
                  <div className="action-row wrap">
                    <button type="button" className="btn btn-outline-green btn-sm" onClick={() => actions.visit(card)}>
                      Request Site Visit
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => actions.consider(card)}>
                      Under Consideration
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => actions.contact(card)}>
                      Contact Property Manager
                    </button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => actions.open(card)}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
