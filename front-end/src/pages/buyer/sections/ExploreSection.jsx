/**
 * ExploreSection.jsx
 * Purpose: Buyer "Explore" — search filters, real category counts, the
 *          "Popular Owner Properties" strip and the full recommendations list
 *          (promoted listings first). Data sourced directly from Redux store.
 * Inputs (props): data (optional), actions (optional)
 * Outputs: the browse page.
 * API calls: none directly (catalogue loaded via Redux fetchBuyerCatalog).
 */
import { useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EmptyState, PageHeader, StatusLine } from '../../../components/common/ui.jsx';
import Icon from '../../../components/common/Icon.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import {
  selectBuyerCatalog,
  selectBuyerLoading,
  selectBuyerErrors,
  selectBuyerShortlist,
  setDetailCard,
  openContactModal,
  toggleShortlist as toggleShortlistAction,
  savedMatches,
} from '../../../store/slices/buyerSlice.js';
import './ExploreSection.css';

const EMPTY = { listingType: '', location: '', price: '', beds: '', ptype: '' };

/** Applies the five filters to the catalogue (exported for unit tests). */
export function filterCatalog(catalog, f) {
  return catalog.filter((p) => {
    if (f.listingType && p.listingType !== f.listingType) return false;
    if (f.location && p.location !== f.location) return false;
    if (f.ptype && p.type !== f.ptype) return false;
    if (f.beds) {
      if (f.beds === '4' ? p.beds < 4 : p.beds !== parseInt(f.beds, 10)) return false;
    }
    if (f.price) {
      const lac = p.price / 100000;
      const crore = p.price / 10000000;
      if (f.price === '0-50' && lac >= 50) return false;
      if (f.price === '50-100' && (lac < 50 || crore > 1)) return false;
      if (f.price === '100-500' && (crore < 1 || crore > 5)) return false;
      if (f.price === '500+' && crore <= 5) return false;
    }
    return true;
  });
}

/** Small card for the horizontal "popular" strip. */
function PopularCard({ card, onOpen, showType }) {
  const dispatch = useDispatch();
  const handleOpen = () => {
    if (onOpen) {
      onOpen(card);
    } else {
      dispatch(setDetailCard(card));
    }
  };

  return (
    <button type="button" className="popular-card" onClick={handleOpen}>
      <div className="popular-media">
        <img src={card.img} alt={card.title} loading="lazy" />
        <span className="popular-photos">
          <Icon name="camera" size="0.8rem" /> {card.photoCount}
        </span>
        {showType && <span className={'popular-type ' + (card.listingType === 'Rent' ? 'rent' : 'buy')}>{card.listingType}</span>}
      </div>
      <div className="popular-body">
        <div className="text-secondary tiny">{card.beds > 0 ? card.beds + ' BHK ' + card.type : card.type}</div>
        <div className="strong">
          {card.priceFmt} <span className="text-secondary small">| {card.sqft} sqft</span>
        </div>
        <div className="text-secondary small truncate">{card.area}</div>
        <div className="text-muted tiny">{card.status}</div>
      </div>
    </button>
  );
}

/** Wide recommendation row with price, specs and quick actions. */
export function ListingRow({ card, actions }) {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const shortlist = useSelector(selectBuyerShortlist);

  const shortlisted = actions?.isShortlisted
    ? actions.isShortlisted(card)
    : shortlist.some((e) => savedMatches(e, card));

  const handleShortlist = () => {
    if (actions?.shortlist) {
      actions.shortlist(card);
    } else {
      dispatch(toggleShortlistAction(card));
      showToast(shortlisted ? 'Removed from Shortlist' : '♡ ' + card.title + ' added to Shortlist!');
    }
  };

  const handleOpen = () => {
    if (actions?.open) {
      actions.open(card);
    } else {
      dispatch(setDetailCard(card));
    }
  };

  const handlePhone = () => {
    if (actions?.phone) {
      actions.phone(card);
    } else {
      showToast("Phone numbers aren't shared publicly — request a site visit and the admin team will connect you.");
    }
  };

  const handleContact = () => {
    if (actions?.contact) {
      actions.contact(card);
    } else {
      dispatch(openContactModal(card));
    }
  };

  return (
    <article className="listing-row">
      <button type="button" className="listing-row-media" onClick={handleOpen} aria-label={'View ' + card.title}>
        <img src={card.img} alt="" loading="lazy" />
        {card.isFeatured && <span className="listing-tag listing-tag-featured">★ {String(card.featuredTier || 'featured').toUpperCase()}</span>}
        {card.popular && <span className="popular-flag">✓ POPULAR</span>}
      </button>
      <div className="listing-row-body">
        <div className="row-center gap-sm mb-2">
          <button
            type="button"
            className={'heart-btn' + (shortlisted ? ' on' : '')}
            onClick={handleShortlist}
            aria-pressed={shortlisted}
            aria-label={(shortlisted ? 'Remove ' : 'Add ') + card.title + (shortlisted ? ' from' : ' to') + ' shortlist'}
          >
            {shortlisted ? '♥' : '♡'}
          </button>
          <div>
            <h3 className="listing-row-title">
              <button type="button" className="link-button" onClick={handleOpen}>
                {card.title}
              </button>
            </h3>
            <p className="text-secondary small">Verified Seller Listing</p>
          </div>
        </div>
        <dl className="spec-row">
          <div>
            <dt>Super Area</dt>
            <dd>{card.sqft} sqft</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{card.status}</dd>
          </div>
          <div>
            <dt>Transaction</dt>
            <dd>{card.tx}</dd>
          </div>
          <div>
            <dt>Bedrooms</dt>
            <dd>{card.beds || '—'}</dd>
          </div>
          <div>
            <dt>Bathrooms</dt>
            <dd>{card.baths || '—'}</dd>
          </div>
        </dl>
        <p className="text-secondary small icon-line">
          <Icon name="pin" size="0.9rem" className="text-brand" /> {card.area}
        </p>
      </div>
      <div className="listing-row-side">
        <div className="align-right">
          <div className="price-lg">{card.priceFull}</div>
          <div className="text-secondary tiny">{card.perSqft}</div>
        </div>
        <div className="stack-sm">
          <button type="button" className="btn btn-outline-green btn-sm" onClick={handlePhone}>
            <Icon name="phone" size="0.9rem" /> Get Phone No.
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleContact}>
            <Icon name="chat" size="0.9rem" /> Contact Property Manager
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ExploreSection({ data, actions }) {
  const { showToast } = useToast();
  const reduxCatalog = useSelector(selectBuyerCatalog);
  const reduxLoading = useSelector(selectBuyerLoading);
  const reduxErrors = useSelector(selectBuyerErrors);

  const catalog = data?.catalog || reduxCatalog;
  const loading = data?.loading || reduxLoading;
  const errors = data?.errors || reduxErrors;

  // Local component-specific filter state (not shared globally)
  const [form, setForm] = useState(EMPTY);
  const [applied, setApplied] = useState(EMPTY);
  const [category, setCategory] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const stripRef = useRef(null);

  // Location / type options come from what is actually listed.
  const locations = useMemo(() => [...new Set(catalog.map((c) => c.location).filter(Boolean))].sort(), [catalog]);
  const types = useMemo(() => [...new Set(catalog.map((c) => c.type).filter(Boolean))].sort(), [catalog]);

  const visible = useMemo(() => {
    let list = filterCatalog(catalog, applied);
    if (category === 'budget') list = list.filter((p) => p.price / 100000 < 50); // under ₹50 Lac
    return list;
  }, [catalog, applied, category]);

  // Promoted listings first (what the seller paid for); ties keep API order.
  const ordered = useMemo(() => [...visible].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)), [visible]);
  const strip = showAll ? catalog : visible.filter((p) => p.popular);

  // Real counts for the three category cards.
  const counts = {
    buy: catalog.filter((p) => p.listingType === 'Buy').length,
    apartment: catalog.filter((p) => p.type === 'Apartment').length,
    budget: catalog.filter((p) => p.price / 100000 < 50).length,
  };

  const setField = (field) => (event) => {
    const next = { ...form, [field]: event.target.value };
    setForm(next);
    setApplied(next); // dropdowns apply immediately (as before)
    setCategory(null);
    setShowAll(false);
  };

  const reset = () => {
    setForm(EMPTY);
    setApplied(EMPTY);
    setCategory(null);
    setShowAll(false);
  };

  const pickCategory = (key) => {
    const next = { ...EMPTY, ...(key === 'buy' ? { listingType: 'Buy' } : key === 'apartment' ? { ptype: 'Apartment' } : {}) };
    setForm(next);
    setApplied(next);
    setCategory(key === 'budget' ? 'budget' : null);
    setShowAll(false);
  };

  const seeAll = () => {
    reset();
    setShowAll(true);
    stripRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('Showing all ' + catalog.length + ' properties');
  };

  return (
    <>
      <PageHeader title="Explore" />
      <div className="content">
        <form
          className="search-panel"
          onSubmit={(e) => {
            e.preventDefault();
            setApplied(form);
          }}
          aria-label="Search filters"
        >
          <h3 className="card-title">
            <Icon name="search" /> Search Filters
          </h3>
          <div className="search-grid">
            <label className="search-field">
              <span>Buy / Rent</span>
              <select value={form.listingType} onChange={setField('listingType')}>
                <option value="">All</option>
                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
              </select>
            </label>
            <label className="search-field">
              <span>Location</span>
              <select value={form.location} onChange={setField('location')}>
                <option value="">All Locations</option>
                {locations.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <label className="search-field">
              <span>Price Range</span>
              <select value={form.price} onChange={setField('price')}>
                <option value="">All Prices</option>
                <option value="0-50">Under ₹50 Lac</option>
                <option value="50-100">₹50 Lac – 1 Cr</option>
                <option value="100-500">₹1 Cr – 5 Cr</option>
                <option value="500+">Above ₹5 Cr</option>
              </select>
            </label>
            <label className="search-field">
              <span>Bedrooms</span>
              <select value={form.beds} onChange={setField('beds')}>
                <option value="">Any</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4+ BHK</option>
              </select>
            </label>
            <label className="search-field">
              <span>Property Type</span>
              <select value={form.ptype} onChange={setField('ptype')}>
                <option value="">All Types</option>
                {types.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="button-row">
            <button type="submit" className="btn btn-primary">
              🔍 Search Properties
            </button>
            <button type="button" className="btn btn-outline" onClick={reset}>
              Reset
            </button>
          </div>
        </form>

        <h2 className="section-title-sm">We&apos;ve got properties for everyone</h2>
        <div className="category-grid">
          <button type="button" className="category-card cat-green" onClick={() => pickCategory('buy')}>
            <strong>{counts.buy}</strong>
            <span>Properties for sale</span>
            <em>Explore →</em>
          </button>
          <button type="button" className="category-card cat-blue" onClick={() => pickCategory('apartment')}>
            <strong>{counts.apartment}</strong>
            <span>Apartments</span>
            <em>Explore →</em>
          </button>
          <button type="button" className="category-card cat-red" onClick={() => pickCategory('budget')}>
            <strong>{counts.budget}</strong>
            <span>Budget homes (under ₹50 Lac)</span>
            <em>Explore →</em>
          </button>
        </div>

        <div className="space-between mb-3" ref={stripRef}>
          <h2 className="section-title-sm mb-0">Popular Owner Properties</h2>
          <button type="button" className="btn btn-link" onClick={seeAll}>
            See all Properties →
          </button>
        </div>
        <StatusLine loading={loading.catalog && !catalog.length} loadingText="Loading listings…" error={!catalog.length ? errors.catalog : ''} />
        <div className="popular-strip">
          {strip.length
            ? strip.map((card) => <PopularCard key={card.id} card={card} onOpen={actions?.open} showType={showAll} />)
            : !loading.catalog && <p className="text-secondary">No popular properties match the current filters.</p>}
        </div>

        <div className="space-between mb-3">
          <h2 className="section-title-sm mb-0">Recommendations</h2>
          <span className="text-secondary small">Promoted listings first, then newest</span>
        </div>
        {!loading.catalog && ordered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No properties found"
            action={
              <button type="button" className="btn btn-primary" onClick={reset}>
                Reset Filters
              </button>
            }
          >
            Try adjusting your filters
          </EmptyState>
        ) : (
          <div className="stack-md">
            {ordered.map((card) => (
              <ListingRow key={card.id} card={card} actions={actions} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
