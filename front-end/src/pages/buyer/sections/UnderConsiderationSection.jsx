/**
 * UnderConsiderationSection.jsx
 * Purpose: "Under Consideration" — listings the buyer is thinking about
 *          (saved per account), with View / Make Offer / Remove.
 * Inputs (props): data – useBuyerData(); actions – listing actions
 * Outputs: list of saved listings or an empty state.
 * API calls: none (offers go through OfferFormModal).
 */
import { Badge, EmptyState, PageHeader } from '../../../components/common/ui.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { savedMatches } from '../useBuyerData.js';

export default function UnderConsiderationSection({ data, actions }) {
  const { showToast } = useToast();
  const list = data.catalog.filter((card) => data.considering.some((e) => savedMatches(e, card)));
  return (
    <>
      <PageHeader title="Under Consideration" subtitle="Properties you're thinking about – no offers made yet" icon="file" />
      <div className="content">
        {list.length === 0 ? (
          <EmptyState icon="📋" title="No properties yet">
            Browse and click Under Consideration to add properties here.
          </EmptyState>
        ) : (
          list.map((card) => (
            <article key={card.id} className="compact-card">
              <img src={card.img} alt={card.title} loading="lazy" />
              <div className="compact-body">
                <div>
                  <h3 className="strong">{card.title}</h3>
                  <p className="text-secondary small">📍 {card.area}</p>
                  <Badge tone="green">Under Consideration</Badge>
                </div>
                <div className="align-right">
                  <div className="price-md mb-2">{card.priceFmt}</div>
                  <div className="action-row wrap">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => actions.open(card)}>
                      View Details
                    </button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => actions.makeOffer(card)}>
                      🏠 Make Offer
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        data.removeConsidering(card);
                        showToast('Removed from Under Consideration');
                      }}
                    >
                      Remove
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
