/**
 * LandingPage.jsx  (was: index.html — landing part)
 * Purpose: Public home page — hero search, real listing counts, featured
 *          listings (top of the catalogue, promoted first), the paginated
 *          "Live Listings" search, and a listing detail dialog.
 * Inputs:  none (reads the URL only through navigation).
 * Outputs: the full public page.
 * API calls:
 *   GET /properties?limit=1[&listingType=…]   – real totals for the stats row
 *   GET /properties?limit=9&…hero filters      – Featured / Search Results
 *   GET /properties?page=N&limit=6&…filters    – Live Listings with pagination
 *
 * Change from the old page: its "Featured Properties" were nine hard-coded
 * sample villas and its stats were fixed marketing numbers. Both now come
 * from the database, so nothing on the page is invented.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SiteHeader from '../components/layout/SiteHeader.jsx';
import PropertyCard from '../components/property/PropertyCard.jsx';
import PublicPropertyModal from '../components/property/PublicPropertyModal.jsx';
import Icon from '../components/common/Icon.jsx';
import { EmptyState, Pager, StatusLine } from '../components/common/ui.jsx';
import { propertiesApi } from '../api/services.js';
import { capitalize } from '../utils/format.js';
import { PROPERTY_TYPES, SERVICE_CITIES } from '../utils/constants.js';
import './LandingPage.css';

// Hero "Budget" choices → price range in rupees (1 Cr = 1,00,00,000).
const BUDGETS = {
  '': {},
  '50L-1Cr': { minPrice: 5000000, maxPrice: 9999999 },
  '1Cr-2Cr': { minPrice: 10000000, maxPrice: 19999999 },
  '2Cr-5Cr': { minPrice: 20000000, maxPrice: 49999999 },
  '5Cr+': { minPrice: 50000000 },
};
const FEATURED_COUNT = 9; // cards in the Featured grid
const LIVE_PAGE_SIZE = 6; // cards per Live Listings page (same as before)
const EMPTY_HERO = { listingType: '', city: '', type: '', budget: '' };
const EMPTY_LIVE = { city: '', type: '', minPrice: '', maxPrice: '' };

export default function LandingPage() {
  const navigate = useNavigate();
  const featuredRef = useRef(null); // scroll target after a hero search

  // ── Stats row (real totals) ──
  const [stats, setStats] = useState(null);

  // ── Hero search → Featured / Search Results ──
  const [hero, setHero] = useState(EMPTY_HERO); // form values
  const [heroApplied, setHeroApplied] = useState(EMPTY_HERO); // last searched values
  const [featured, setFeatured] = useState({ items: [], total: 0, loading: true, error: '' });

  // ── Live Listings (server-side filters + pages) ──
  const [live, setLive] = useState(EMPTY_LIVE);
  const [liveApplied, setLiveApplied] = useState(EMPTY_LIVE);
  const [livePage, setLivePage] = useState(1);
  const [liveData, setLiveData] = useState({ items: [], page: 1, totalPages: 1, total: 0, loading: true, error: '' });

  const [selected, setSelected] = useState(null); // listing in the detail dialog

  // Load the three real totals once.
  useEffect(() => {
    Promise.all([
      propertiesApi.list({ limit: 1 }),
      propertiesApi.list({ limit: 1, listingType: 'sale' }),
      propertiesApi.list({ limit: 1, listingType: 'rent' }),
    ])
      .then(([all, sale, rent]) => setStats({ all: all.data.total, sale: sale.data.total, rent: rent.data.total }))
      .catch(() => setStats(null)); // the stats row simply hides on failure
  }, []);

  // Featured grid follows the last applied hero search.
  useEffect(() => {
    let alive = true;
    setFeatured((f) => ({ ...f, loading: true, error: '' }));
    propertiesApi
      .list({
        limit: FEATURED_COUNT,
        listingType: heroApplied.listingType,
        city: heroApplied.city,
        type: heroApplied.type,
        ...BUDGETS[heroApplied.budget],
      })
      .then((res) => alive && setFeatured({ items: res.data.items, total: res.data.total, loading: false, error: '' }))
      .catch((err) => alive && setFeatured({ items: [], total: 0, loading: false, error: err.message }));
    return () => {
      alive = false; // ignore a slow response after a newer search
    };
  }, [heroApplied]);

  // Live Listings follow their own filters + page number.
  useEffect(() => {
    let alive = true;
    setLiveData((d) => ({ ...d, loading: true, error: '' }));
    propertiesApi
      .list({ page: livePage, limit: LIVE_PAGE_SIZE, ...liveApplied })
      .then((res) => alive && setLiveData({ ...res.data, loading: false, error: '' }))
      .catch(
        (err) =>
          alive &&
          setLiveData({
            items: [],
            page: 1,
            totalPages: 1,
            total: 0,
            loading: false,
            // A status means the API answered with an error; no status = unreachable.
            error: err.status !== undefined ? err.message : "Couldn't reach the API. Is the backend running?",
          }),
      );
    return () => {
      alive = false;
    };
  }, [liveApplied, livePage]);

  const heroActive = Object.values(heroApplied).some(Boolean); // any filter in use?

  /** Hero "Search Properties". */
  const searchFeatured = () => {
    setHeroApplied({ ...hero });
    featuredRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /** "Show All" / "Reset Filters". */
  const resetFeatured = () => {
    setHero(EMPTY_HERO);
    setHeroApplied(EMPTY_HERO);
  };

  /** Live Listings "Search" button (min ≤ max is also checked by the API). */
  const searchLive = (event) => {
    event.preventDefault();
    setLivePage(1);
    setLiveApplied({ ...live, city: live.city.trim() });
  };

  /** Footer city links filter the live listings by that city. */
  const browseCity = useCallback((city) => {
    setLive({ ...EMPTY_LIVE, city });
    setLiveApplied({ ...EMPTY_LIVE, city });
    setLivePage(1);
    document.getElementById('live-listings')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const setHeroField = (field) => (event) => setHero((h) => ({ ...h, [field]: event.target.value }));
  const setLiveField = (field) => (event) => setLive((l) => ({ ...l, [field]: event.target.value }));

  return (
    <div className="public-page">
      <SiteHeader onLogin={() => navigate('/login')} />

      <main>
        {/* ── Hero + search ── */}
        <section className="container hero" aria-labelledby="hero-title">
          <h1 id="hero-title" className="hero-title">
            Welcome to <span className="text-brand">truEstate</span>
          </h1>
          <p className="hero-subtitle">Find your dream property from verified listings</p>

          <form
            className="search-panel"
            onSubmit={(event) => {
              event.preventDefault();
              searchFeatured();
            }}
          >
            <div className="search-grid">
              <label className="search-field">
                <span>Buy / Rent</span>
                <select value={hero.listingType} onChange={setHeroField('listingType')}>
                  <option value="">Buy or Rent</option>
                  <option value="sale">Buy</option>
                  <option value="rent">Rent</option>
                </select>
              </label>
              <label className="search-field">
                <span>Location</span>
                <select value={hero.city} onChange={setHeroField('city')}>
                  <option value="">All Locations</option>
                  {SERVICE_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>
              <label className="search-field">
                <span>Property Type</span>
                <select value={hero.type} onChange={setHeroField('type')}>
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {capitalize(type)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="search-field">
                <span>Budget</span>
                <select value={hero.budget} onChange={setHeroField('budget')}>
                  <option value="">All Prices</option>
                  <option value="50L-1Cr">50L - 1Cr</option>
                  <option value="1Cr-2Cr">1Cr - 2Cr</option>
                  <option value="2Cr-5Cr">2Cr - 5Cr</option>
                  <option value="5Cr+">5Cr+</option>
                </select>
              </label>
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              <Icon name="search" /> Search Properties
            </button>
          </form>

          {/* ── Real platform totals ── */}
          {stats && (
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>{stats.all}</strong>
                <span>Verified listings</span>
              </div>
              <div className="hero-stat">
                <strong>{stats.sale}</strong>
                <span>For sale</span>
              </div>
              <div className="hero-stat">
                <strong>{stats.rent}</strong>
                <span>For rent</span>
              </div>
            </div>
          )}

          {/* ── Featured / Search Results ── */}
          <div ref={featuredRef} className="section-head">
            <h2 className="section-title">{heroActive ? 'Search Results (' + featured.total + ')' : 'Featured Properties'}</h2>
            {heroActive && (
              <button type="button" className="btn btn-link" onClick={resetFeatured}>
                <Icon name="refresh" /> Show All
              </button>
            )}
          </div>
          <StatusLine loading={featured.loading && !featured.items.length} error={featured.error} />
          {!featured.loading && !featured.error && featured.items.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No properties found"
              action={
                heroActive && (
                  <button type="button" className="btn btn-primary" onClick={resetFeatured}>
                    Reset Filters
                  </button>
                )
              }
            >
              {heroActive ? 'Try adjusting your search filters' : 'No verified listings yet — check back soon.'}
            </EmptyState>
          ) : (
            <div className="listing-grid">
              {featured.items.map((property) => (
                <PropertyCard key={property.id} property={property} onOpen={setSelected} />
              ))}
            </div>
          )}
        </section>

        {/* ── Live Listings ── */}
        <section id="live-listings" className="container live-section" aria-labelledby="live-title">
          <div className="section-head">
            <div>
              <h2 id="live-title" className="section-title">
                Live Listings
              </h2>
              <p className="text-secondary small">Fetched in real time from the database — filter by city, type, and price.</p>
            </div>
          </div>

          <form className="filter-panel" onSubmit={searchLive}>
            <label className="search-field">
              <span>City</span>
              <input type="text" placeholder="e.g. Chennai" value={live.city} onChange={setLiveField('city')} />
            </label>
            <label className="search-field">
              <span>Type</span>
              <select value={live.type} onChange={setLiveField('type')}>
                <option value="">All Types</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {capitalize(type)}
                  </option>
                ))}
              </select>
            </label>
            <label className="search-field">
              <span>Min Price (₹)</span>
              <input type="number" min="0" placeholder="0" value={live.minPrice} onChange={setLiveField('minPrice')} />
            </label>
            <label className="search-field">
              <span>Max Price (₹)</span>
              <input type="number" min="0" placeholder="Any" value={live.maxPrice} onChange={setLiveField('maxPrice')} />
            </label>
            <div className="button-row">
              <button type="submit" className="btn btn-primary">
                Search
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setLive(EMPTY_LIVE);
                  setLiveApplied(EMPTY_LIVE);
                  setLivePage(1);
                }}
              >
                Reset
              </button>
            </div>
          </form>

          <StatusLine loading={liveData.loading && !liveData.items.length} error={liveData.error} />
          {!liveData.loading && !liveData.error && liveData.items.length === 0 && <p className="state-line">No properties match those filters yet.</p>}
          <div className="listing-grid">
            {liveData.items.map((property) => (
              <PropertyCard key={property.id} property={property} onOpen={setSelected} />
            ))}
          </div>
          {!liveData.error && (
            <Pager page={liveData.page || livePage} totalPages={liveData.totalPages} total={liveData.total} onPage={(n) => setLivePage(Math.max(1, n))} />
          )}
        </section>
      </main>

      {/* ── Footer (only links that actually do something) ── */}
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h3>About truEstate</h3>
            <p className="text-secondary small">
              A platform dedicated to property buyers and sellers. Every listing is verified by a city admin before buyers can see it.
            </p>
          </div>
          <div>
            <h3>Properties in India</h3>
            <ul className="footer-links">
              {SERVICE_CITIES.map((city) => (
                <li key={city}>
                  <button type="button" className="link-button" onClick={() => browseCity(city)}>
                    Property in {city}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Portals</h3>
            <ul className="footer-links">
              <li>
                <Link to="/login">Buyer / Seller login</Link>
              </li>
              <li>
                <Link to="/admin/login">Admin login</Link>
              </li>
              <li>
                <Link to="/superuser/login">Superuser login</Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="footer-copy">
          All rights reserved © {new Date().getFullYear()} truEstate.com. All trademarks, logos and names are properties of their respective owners.
        </p>
      </footer>

      <PublicPropertyModal
        property={selected}
        onClose={() => setSelected(null)}
        onBuy={() => {
          setSelected(null);
          navigate('/login'); // buying needs an account
        }}
      />
    </div>
  );
}
