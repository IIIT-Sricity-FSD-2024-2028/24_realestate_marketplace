import { useState, useEffect, useMemo, useCallback } from 'react';
import { buyerApi } from '../api/buyerApi.js';
import { cardIdForRealId, formatIndianPriceFmt, firstDisplayImage, allDisplayImages } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';
import { useBuyerProfile } from '../context/BuyerProfileContext.jsx';
import useLiveRefresh from '../hooks/useLiveRefresh.js';
import PageHeader from '../components/PageHeader.jsx';
import StateMessage from '../components/StateMessage.jsx';
import PropertyDetailModal from '../components/PropertyDetailModal.jsx';
import MakeOfferModal from '../components/MakeOfferModal.jsx';
import OfferSuccessModal from '../components/OfferSuccessModal.jsx';
import ScheduleVisitModal from '../components/ScheduleVisitModal.jsx';
import ManagerNotifiedModal from '../components/ManagerNotifiedModal.jsx';
import { SearchIcon, PinIcon, PhoneIcon, ChatIcon } from '../components/Icons.jsx';

const STATUS_LABELS = { available: 'Available', sold: 'Sold', rented: 'Rented' };

function mapBackendPropertyToCard(rp) {
  const price = rp.price || 0;
  const typeLabel = rp.type ? rp.type.charAt(0).toUpperCase() + rp.type.slice(1) : 'Property';
  const displayImage = firstDisplayImage(rp);
  const gallery = allDisplayImages(rp);
  const cid = cardIdForRealId(rp.id);

  return {
    id: cid,
    realId: rp.id,
    title: rp.title,
    builder: 'Verified Seller Listing',
    type: typeLabel,
    listingType: rp.listingType === 'rent' ? 'Rent' : 'Buy',
    location: rp.city,
    area: rp.address ? `${rp.address}, ${rp.city}` : rp.city || '',
    price: price,
    priceLabel: 'Rs\n' + price.toLocaleString('en-IN'),
    priceFmt: formatIndianPriceFmt(price),
    perSqft: rp.areaSqft ? `Rs ${Math.round(price / rp.areaSqft).toLocaleString('en-IN')} per sqft` : 'N/A',
    beds: rp.bedrooms || 0,
    baths: rp.bathrooms || 0,
    sqft: rp.areaSqft || 0,
    balcony: null,
    floor: null,
    parking: null,
    furnish: null,
    status: STATUS_LABELS[rp.status] || 'Available',
    tx: rp.listingType === 'rent' ? 'For Rent' : 'For Sale',
    img: displayImage,
    gallery: gallery,
    photoCount: gallery.length || 1,
    popular: false,
    isFeatured: !!rp.isFeatured,
    featuredTier: rp.featuredTier || null,
    desc: rp.description || 'A verified property listing on truEstate.',
  };
}

const PREFERRED_MANAGERS = [
  {
    name: 'Riyaz',
    agency: 'Max Serv',
    since: 2015,
    initial: 'R',
    color: '#1DB954',
    forSale: 196,
    forRent: 0,
    buyersServed: 2000,
    location: 'Hyderabad',
  },
  {
    name: 'Indramurthy',
    agency: 'Shaiq Homes',
    since: 2021,
    initial: 'I',
    color: '#f97316',
    forSale: 95,
    forRent: 10,
    buyersServed: 1000,
    location: 'Bangalore',
  },
  {
    name: 'Lavanya',
    agency: 'Vanya Homes',
    since: 2020,
    initial: 'L',
    color: '#8b5cf6',
    forSale: 38,
    forRent: 15,
    buyersServed: 500,
    location: 'Hyderabad',
  },
  {
    name: 'Santosh',
    agency: 'SK Realty',
    since: 2018,
    initial: 'S',
    color: '#3b82f6',
    forSale: 273,
    forRent: 22,
    buyersServed: 3500,
    location: 'Chennai',
  },
  {
    name: 'Meera',
    agency: 'Prime Properties',
    since: 2019,
    initial: 'M',
    color: '#ef4444',
    forSale: 142,
    forRent: 35,
    buyersServed: 1800,
    location: 'Hyderabad',
  },
  {
    name: 'Arjun',
    agency: 'Gold Homes',
    since: 2016,
    initial: 'A',
    color: '#eab308',
    forSale: 87,
    forRent: 28,
    buyersServed: 920,
    location: 'Kochi',
  },
];

export default function ExplorePage() {
  const { showToast } = useToast();
  const { isShortlisted, toggleShortlist } = useBuyerProfile();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterPrice, setFilterPrice] = useState('');
  const [filterBeds, setFilterBeds] = useState('');
  const [filterPtype, setFilterPtype] = useState('');
  const [managerQuery, setManagerQuery] = useState('');

  // Modals state
  const [activeModalProperty, setActiveModalProperty] = useState(null);
  const [offerProperty, setOfferProperty] = useState(null);
  const [offerSuccessData, setOfferSuccessData] = useState(null);
  const [visitProperty, setVisitProperty] = useState(null);
  const [notifiedProperty, setNotifiedProperty] = useState(null);

  const fetchListings = useCallback(async () => {
    try {
      const items = await buyerApi.fetchEveryListing();
      const mapped = items.map(mapBackendPropertyToCard);
      // Mark first 8 as popular strip
      mapped.forEach((c, i) => {
        c.popular = i < 8;
      });
      setProperties(mapped);
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Live auto-refresh polling
  useLiveRefresh(fetchListings, { intervalMs: 15000 });

  // Filter options derived from actual database records
  const availableLocations = useMemo(() => {
    const set = new Set(properties.map((p) => p.location).filter(Boolean));
    return Array.from(set).sort();
  }, [properties]);

  const availableTypes = useMemo(() => {
    const set = new Set(properties.map((p) => p.type).filter(Boolean));
    return Array.from(set).sort();
  }, [properties]);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (filterType && p.listingType !== filterType) return false;
      if (filterLocation && p.location !== filterLocation) return false;
      if (filterPtype && p.type !== filterPtype) return false;
      if (filterBeds) {
        if (filterBeds === '4' && p.beds < 4) return false;
        else if (filterBeds !== '4' && p.beds !== parseInt(filterBeds, 10)) return false;
      }
      if (filterPrice) {
        const crore = p.price / 10000000;
        const lac = p.price / 100000;
        if (filterPrice === '0-50' && lac >= 50) return false;
        if (filterPrice === '50-100' && (lac < 50 || crore > 1)) return false;
        if (filterPrice === '100-500' && (crore < 1 || crore > 5)) return false;
        if (filterPrice === '500+' && crore <= 5) return false;
      }
      return true;
    });
  }, [properties, filterType, filterLocation, filterPtype, filterBeds, filterPrice]);

  // Popular items
  const popularProperties = useMemo(() => {
    const popular = filteredProperties.filter((p) => p.popular);
    return popular.length ? popular : filteredProperties.slice(0, 8);
  }, [filteredProperties]);

  // Recommendations: Promoted items first
  const recommendationProperties = useMemo(() => {
    return filteredProperties.slice().sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }, [filteredProperties]);

  function resetFilters() {
    setFilterType('');
    setFilterLocation('');
    setFilterPrice('');
    setFilterBeds('');
    setFilterPtype('');
  }

  function handleCategoryClick(cat) {
    resetFilters();
    if (cat === 'Buy') setFilterType('Buy');
    else if (cat === 'Apartment') setFilterPtype('Apartment');
    else if (cat === 'budget') setFilterPrice('0-50');
  }

  const filteredManagers = useMemo(() => {
    const q = managerQuery.trim().toLowerCase();
    if (!q) return PREFERRED_MANAGERS;
    return PREFERRED_MANAGERS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.agency.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q)
    );
  }, [managerQuery]);

  return (
    <div>
      <PageHeader
        title="Explore"
        subtitle="Discover verified properties, schedule visits & negotiate directly with sellers"
      />

      <div className="content-section">
        {/* Search Filters Card */}
        <div className="search-bar">
          <h3
            style={{
              fontWeight: 700,
              fontSize: '1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <SearchIcon style={{ width: '1.25rem', height: '1.25rem', color: '#1DB954' }} />
            Search Filters
          </h3>

          <div className="search-grid">
            <div className="search-field">
              <label>Buy / Rent</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">All Types</option>
                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
              </select>
            </div>

            <div className="search-field">
              <label>Location</label>
              <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
                <option value="">All Locations</option>
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-field">
              <label>Price Range</label>
              <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)}>
                <option value="">All Prices</option>
                <option value="0-50">Under ₹50 Lac</option>
                <option value="50-100">₹50 Lac – ₹1 Cr</option>
                <option value="100-500">₹1 Cr – ₹5 Cr</option>
                <option value="500+">Above ₹5 Cr</option>
              </select>
            </div>

            <div className="search-field">
              <label>Bedrooms</label>
              <select value={filterBeds} onChange={(e) => setFilterBeds(e.target.value)}>
                <option value="">Any BHK</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4+ BHK</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <div className="search-field" style={{ flex: 1, minWidth: '180px' }}>
              <label>Property Category</label>
              <select value={filterPtype} onChange={(e) => setFilterPtype(e.target.value)}>
                <option value="">All Categories</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="search-btn"
              onClick={() => showToast(`Filtered ${filteredProperties.length} properties`)}
            >
              🔍 Apply Filters
            </button>

            <button
              onClick={resetFilters}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#9ca3af',
                padding: '0.65rem 1.25rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Category Cards */}
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          We've got properties for everyone
        </h2>
        <div className="category-grid">
          <div
            className="category-card"
            style={{ background: 'linear-gradient(135deg,#1a2e1a,#0d1f0d)' }}
            onClick={() => handleCategoryClick('Buy')}
          >
            <div className="overlay">
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>37,300+</div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Owner Properties For Sale</div>
              <div style={{ color: '#1DB954', fontSize: '0.875rem', marginTop: '0.25rem', fontWeight: 600 }}>
                Explore Buy listings →
              </div>
            </div>
          </div>

          <div
            className="category-card"
            style={{ background: 'linear-gradient(135deg,#1a1a2e,#0d0d1f)' }}
            onClick={() => handleCategoryClick('Apartment')}
          >
            <div className="overlay">
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>1,000+</div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Apartment & Project Units</div>
              <div style={{ color: '#1DB954', fontSize: '0.875rem', marginTop: '0.25rem', fontWeight: 600 }}>
                Explore Apartments →
              </div>
            </div>
          </div>

          <div
            className="category-card"
            style={{ background: 'linear-gradient(135deg,#2e1a1a,#1f0d0d)' }}
            onClick={() => handleCategoryClick('budget')}
          >
            <div className="overlay">
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>845+</div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Budget Homes Under ₹50 Lac</div>
              <div style={{ color: '#1DB954', fontSize: '0.875rem', marginTop: '0.25rem', fontWeight: 600 }}>
                Explore Budget →
              </div>
            </div>
          </div>
        </div>

        {/* Popular Owner Properties Horizontal Scroll */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Popular Owner Properties</h2>
          <span
            onClick={resetFilters}
            style={{ color: '#1DB954', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 }}
          >
            Show All ({properties.length}) →
          </span>
        </div>

        <div className="popular-scroll-container">
          {popularProperties.map((p) => (
            <div
              key={p.id}
              onClick={() => setActiveModalProperty(p)}
              style={{
                minWidth: '220px',
                maxWidth: '220px',
                background: '#1a1a1a',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                cursor: 'pointer',
                flexShrink: 0,
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1DB954';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                <img
                  src={p.img}
                  alt={p.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '0.6rem',
                    left: '0.6rem',
                    background: 'rgba(0,0,0,0.65)',
                    color: '#fff',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  📷 {p.photoCount}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: '0.6rem',
                    right: '0.6rem',
                    background: p.listingType === 'Rent' ? '#3b82f6' : '#1DB954',
                    color: '#000',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                  }}
                >
                  {p.listingType}
                </div>
              </div>

              <div style={{ padding: '0.9rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                  {p.beds > 0 ? `${p.beds} BHK ${p.type}` : p.type}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem', color: '#fff' }}>
                  {p.priceFmt}{' '}
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 400 }}>
                    | {p.sqft} sqft
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                  {p.area}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{p.status}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations List */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recommended For You</h2>
          <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            Showing {recommendationProperties.length} properties
          </span>
        </div>

        {loading ? (
          <StateMessage type="loading" title="Loading listings…" message="Connecting to truEstate property database." />
        ) : recommendationProperties.length === 0 ? (
          <StateMessage
            type="empty"
            title="No properties match your filters"
            message="Try broadening your location, budget, or bedroom selections."
            actionLabel="Reset All Filters"
            onAction={resetFilters}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {recommendationProperties.map((p) => {
              const shortlisted = isShortlisted(p.id);
              return (
                <div
                  key={p.id}
                  className="rec-card"
                  onClick={() => setActiveModalProperty(p)}
                >
                  {/* Left image wrapper */}
                  <div className="rec-card-img-wrap">
                    <img src={p.img} alt={p.title} />
                    {p.popular && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0.75rem',
                          left: '0.75rem',
                          background: 'rgba(29,185,84,0.15)',
                          border: '1px solid rgba(29,185,84,0.5)',
                          color: '#1DB954',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          zIndex: 2,
                        }}
                      >
                        ✓ POPULAR PROJECT
                      </div>
                    )}
                    {p.isFeatured && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '0.75rem',
                          left: '0.75rem',
                          background: '#f59e0b',
                          color: '#111',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          zIndex: 2,
                        }}
                      >
                        ★ {String(p.featuredTier || 'featured').toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Middle content details */}
                  <div className="rec-card-body">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleShortlist(p.id);
                              showToast(shortlisted ? 'Removed from Shortlist' : `♡ ${p.title} shortlisted!`);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: shortlisted ? '#ef4444' : '#9ca3af',
                              fontSize: '1.35rem',
                              padding: 0,
                              lineHeight: 1,
                            }}
                            title="Shortlist"
                          >
                            {shortlisted ? '♥' : '♡'}
                          </button>
                          <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.1rem', color: '#fff' }}>
                              {p.title}
                            </h3>
                            <p style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>{p.builder}</p>
                          </div>
                        </div>
                      </div>

                      {/* Specs Matrix */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontSize: '0.625rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Super Area
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#fff' }}>{p.sqft} sqft</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.625rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Status
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#fff' }}>{p.status}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.625rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Transaction
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#fff' }}>{p.tx}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.625rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Furnishing
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#fff' }}>{p.furnish || '—'}</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontSize: '0.625rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Bedrooms
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{p.beds || '—'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.625rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Bathroom
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{p.baths || '—'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.625rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Balcony
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{p.balcony || '—'}</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#9ca3af', fontSize: '0.8125rem' }}>
                      <PinIcon style={{ width: '0.875rem', height: '0.875rem', color: '#1DB954' }} />
                      {p.area}
                    </div>
                  </div>

                  {/* Right side price & actions */}
                  <div className="rec-card-price-col">
                    <div style={{ textAlign: 'right', width: '100%' }}>
                      <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Total Price</div>
                      <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1DB954', lineHeight: 1.1 }}>
                        {p.priceFmt}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.3rem' }}>{p.perSqft}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', marginTop: '1rem' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVisitProperty(p);
                        }}
                        style={{
                          background: 'transparent',
                          border: '2px solid #1DB954',
                          color: '#1DB954',
                          padding: '0.55rem 0.75rem',
                          borderRadius: '0.5rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(29, 185, 84, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        📅 Request Site Visit
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast('📞 Direct seller/office phone: +91 98765 43210');
                        }}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#9ca3af',
                          padding: '0.55rem 0.75rem',
                          borderRadius: '0.5rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <PhoneIcon style={{ width: '0.85rem', height: '0.85rem' }} />
                        Get Phone No.
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotifiedProperty(p);
                        }}
                        style={{
                          background: '#1DB954',
                          color: '#000',
                          padding: '0.55rem 0.75rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <ChatIcon style={{ width: '0.85rem', height: '0.85rem' }} />
                        Contact Manager
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Property Managers Section */}
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                TE Preferred Property Managers in YOUR LOCATION
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '0.8125rem', marginTop: '0.2rem' }}>
                Verified experts to guide site visits, paper verification and deal execution
              </p>
            </div>
            <input
              type="text"
              placeholder="Search by manager name or location..."
              value={managerQuery}
              onChange={(e) => setManagerQuery(e.target.value)}
              style={{
                background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '0.6rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                width: '260px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {filteredManagers.map((m) => (
              <div
                key={m.name}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-0.7rem',
                    left: '1.25rem',
                    background: '#1DB954',
                    color: '#000',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                  }}
                >
                  TE Preferred
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', marginTop: '0.5rem' }}>
                  <div
                    style={{
                      width: '3.25rem',
                      height: '3.25rem',
                      borderRadius: '9999px',
                      background: m.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#000',
                      border: `2px solid ${m.color}`,
                    }}
                  >
                    {m.initial}
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{m.name}</h4>
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>🏠 {m.agency} · {m.location}</p>
                    <p style={{ color: '#6b7280', fontSize: '0.7rem' }}>Operating Since {m.since}</p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                    textAlign: 'center',
                    marginBottom: '1rem',
                    background: '#121212',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{m.forSale}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.65rem' }}>For Sale</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{m.forRent}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.65rem' }}>For Rent</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1DB954' }}>{m.buyersServed}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.65rem' }}>Buyers Served</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => showToast(`💬 Contact request sent to ${m.name} (${m.agency})!`)}
                  style={{ width: '100%', padding: '0.65rem', fontSize: '0.825rem' }}
                >
                  Contact Property Manager
                </button>
              </div>
            ))}
          </div>

          {/* Post Requirement CTA banner */}
          <div
            style={{
              background: 'linear-gradient(135deg,#1a3d2a,#0d1f15)',
              border: '1px solid rgba(29,185,84,0.3)',
              borderRadius: '0.75rem',
              padding: '1.75rem',
              cursor: 'pointer',
              marginBottom: '2rem',
            }}
            onClick={() => showToast('Requirement posted! Managers will contact you soon.')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#fff', marginBottom: '0.35rem' }}>
                  Post Your Property Requirement
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', maxWidth: '600px' }}>
                  Tell us what you're looking for and let verified TE Preferred Property Managers reach out with
                  tailored off-market matches.
                </p>
              </div>
              <span style={{ color: '#1DB954', fontSize: '1.5rem', fontWeight: 800 }}>→</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {activeModalProperty && (
        <PropertyDetailModal
          property={activeModalProperty}
          onClose={() => setActiveModalProperty(null)}
          onOpenOffer={(p) => setOfferProperty(p)}
          onOpenScheduleVisit={(p) => setVisitProperty(p)}
          onNotifyManager={(p) => setNotifiedProperty(p)}
        />
      )}

      {/* Offer Form Modal */}
      {offerProperty && (
        <MakeOfferModal
          property={offerProperty}
          onClose={() => setOfferProperty(null)}
          onSuccess={({ property, amount }) => {
            setOfferSuccessData({ property, amount });
          }}
        />
      )}

      {/* Offer Success Modal */}
      {offerSuccessData && (
        <OfferSuccessModal
          property={offerSuccessData.property}
          amount={offerSuccessData.amount}
          onClose={() => setOfferSuccessData(null)}
        />
      )}

      {/* Schedule Visit Modal */}
      {visitProperty && (
        <ScheduleVisitModal
          property={visitProperty}
          onClose={() => setVisitProperty(null)}
          onScheduled={fetchListings}
        />
      )}

      {/* Manager Notified Feedback Modal */}
      {notifiedProperty && (
        <ManagerNotifiedModal
          property={notifiedProperty}
          onClose={() => setNotifiedProperty(null)}
        />
      )}
    </div>
  );
}
