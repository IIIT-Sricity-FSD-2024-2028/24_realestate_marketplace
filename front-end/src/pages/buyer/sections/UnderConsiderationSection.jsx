/**
 * UnderConsiderationSection.jsx
 * Purpose: "Under Consideration" — listings the buyer is thinking about
 *          (saved per account), with View / Make Offer / Remove.
 * Inputs (props): data (optional), actions (optional)
 * Outputs: list of saved listings or an empty state.
 * API calls: none directly (all state managed via Redux).
 */
import { useDispatch, useSelector } from 'react-redux';
import { Badge, EmptyState, PageHeader } from '../../../components/common/ui.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import {
  selectBuyerCatalog,
  selectBuyerConsidering,
  removeConsidering as removeConsideringAction,
  openOfferModal,
  setDetailCard,
  savedMatches,
} from '../../../store/slices/buyerSlice.js';
import './UnderConsiderationSection.css';

export default function UnderConsiderationSection({ data, actions }) {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const reduxCatalog = useSelector(selectBuyerCatalog);
  const reduxConsidering = useSelector(selectBuyerConsidering);

  const catalog = data?.catalog || reduxCatalog;
  const considering = data?.considering || reduxConsidering;

  const list = catalog.filter((card) => considering.some((e) => savedMatches(e, card)));

  const handleOpen = (card) => {
    if (actions?.open) {
      actions.open(card);
    } else {
      dispatch(setDetailCard(card));
    }
  };

  const handleMakeOffer = (card) => {
    if (actions?.makeOffer) {
      actions.makeOffer(card);
    } else {
      dispatch(openOfferModal(card));
    }
  };

  const handleRemove = (card) => {
    if (data?.removeConsidering) {
      data.removeConsidering(card);
    } else {
      dispatch(removeConsideringAction(card));
    }
    showToast('Removed from Under Consideration');
  };

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
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleOpen(card)}>
                      View Details
                    </button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => handleMakeOffer(card)}>
                      🏠 Make Offer
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemove(card)}>
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
