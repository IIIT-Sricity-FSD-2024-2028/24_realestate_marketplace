/**
 * ShortlistSection.jsx
 * Purpose: "My Shortlist" — listings the buyer hearted (saved per account),
 *          with visit / consider / contact / details actions.
 * Inputs (props): data (optional), actions (optional)
 * Outputs: shortlist cards or an empty state.
 * API calls: none directly (all state managed via Redux).
 */
import { useDispatch, useSelector } from 'react-redux';
import { EmptyState, PageHeader } from '../../../components/common/ui.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import {
  selectBuyerCatalog,
  selectBuyerShortlist,
  toggleShortlist as toggleShortlistAction,
  addConsidering as addConsideringAction,
  openVisitModal,
  openContactModal,
  setDetailCard,
  savedMatches,
} from '../../../store/slices/buyerSlice.js';
import './ShortlistSection.css';

export default function ShortlistSection({ data, actions }) {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const reduxCatalog = useSelector(selectBuyerCatalog);
  const reduxShortlist = useSelector(selectBuyerShortlist);

  const catalog = data?.catalog || reduxCatalog;
  const shortlist = data?.shortlist || reduxShortlist;

  // Only listings that are still in the live catalogue are shown.
  const saved = catalog.filter((card) => shortlist.some((e) => savedMatches(e, card)));

  const handleRemove = (card) => {
    if (actions?.shortlist) {
      actions.shortlist(card);
    } else {
      dispatch(toggleShortlistAction(card));
      showToast('Removed from Shortlist');
    }
  };

  const handleVisit = (card) => {
    if (actions?.visit) {
      actions.visit(card);
    } else {
      dispatch(openVisitModal(card));
    }
  };

  const handleConsider = (card) => {
    if (actions?.consider) {
      actions.consider(card);
    } else {
      dispatch(addConsideringAction(card));
      showToast('✅ ' + card.title + ' added to Under Consideration!');
    }
  };

  const handleContact = (card) => {
    if (actions?.contact) {
      actions.contact(card);
    } else {
      dispatch(openContactModal(card));
    }
  };

  const handleOpen = (card) => {
    if (actions?.open) {
      actions.open(card);
    } else {
      dispatch(setDetailCard(card));
    }
  };

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
              <button type="button" className="saved-remove" onClick={() => handleRemove(card)} aria-label={'Remove ' + card.title + ' from shortlist'}>
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
                    <button type="button" className="btn btn-outline-green btn-sm" onClick={() => handleVisit(card)}>
                      Request Site Visit
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => handleConsider(card)}>
                      Under Consideration
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => handleContact(card)}>
                      Contact Property Manager
                    </button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => handleOpen(card)}>
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
