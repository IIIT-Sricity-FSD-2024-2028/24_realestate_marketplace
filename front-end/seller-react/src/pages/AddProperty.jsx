import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerApi } from '../api/sellerApi.js';
import { SERVICE_CITY_STATE, CITIES } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';
import QuotaUpgradeModal from '../components/QuotaUpgradeModal.jsx';

export default function AddProperty() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [type, setType] = useState('apartment');
  const [transactionType, setTransactionType] = useState('sale');
  const [readiness, setReadiness] = useState('Ready to Move');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [sqft, setSqft] = useState('');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [balcony, setBalcony] = useState('1');
  const [furnishing, setFurnishing] = useState('Semi-Furnished');
  const [description, setDescription] = useState('');

  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [quotaPlan, setQuotaPlan] = useState(null);
  const [quotaModalMsg, setQuotaModalMsg] = useState(null);

  // Fetch plan info to display quota notice before filling form
  useEffect(() => {
    sellerApi
      .getBillingSummary()
      .then((res) => {
        if (res.data?.plan) setQuotaPlan(res.data.plan);
      })
      .catch(() => {});
  }, []);

  const derivedState = city ? SERVICE_CITY_STATE[city] || '' : '';

  const quotaUsed = quotaPlan?.listingsUsed;
  const quotaTotal = quotaPlan?.listingQuota;
  const isQuotaFull = quotaTotal !== null && quotaTotal !== undefined && quotaUsed >= quotaTotal;

  async function handleSubmit(e) {
    e.preventDefault();

    const priceNum = Number(String(price).replace(/[^0-9.]/g, ''));
    if (!priceNum || priceNum <= 0) {
      showToast('⚠️ Please enter a valid property price', 'error');
      return;
    }
    if (description.trim().length < 20) {
      showToast('⚠️ Description must be at least 20 characters', 'error');
      return;
    }
    if (!SERVICE_CITY_STATE[city]) {
      showToast('⚠️ Please choose one of our four launch cities', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create property listing
      const res = await sellerApi.createProperty({
        title: name.trim(),
        type: type.toLowerCase(),
        listingType: transactionType,
        price: priceNum,
        areaSqft: Number(String(sqft).replace(/[^0-9.]/g, '')) || 1000,
        bedrooms: Number(bedrooms) || 0,
        bathrooms: Number(bathrooms) || 1,
        address: address.trim(),
        city: city.trim(),
        description: description.trim(),
      });

      const newProperty = res.data;

      // 2. Upload images if selected
      if (images.length > 0) {
        const imgFormData = new FormData();
        Array.from(images).forEach((f) => imgFormData.append('files', f));
        try {
          await sellerApi.uploadPropertyImages(newProperty.id, imgFormData);
        } catch (imgErr) {
          showToast('Property created, but photo upload encountered an issue: ' + imgErr.message, 'warning');
        }
      }

      // 3. Upload verification documents if selected
      if (documents.length > 0) {
        const docFormData = new FormData();
        Array.from(documents).forEach((f) => docFormData.append('files', f));
        try {
          await sellerApi.uploadPropertyDocuments(newProperty.id, docFormData);
        } catch (docErr) {
          showToast('Property created, but document upload encountered an issue: ' + docErr.message, 'warning');
        }
      }

      showToast('Property submitted successfully! It is now pending admin review.', 'success');
      navigate('/my-listings');
    } catch (err) {
      if (err.status === 402) {
        setQuotaModalMsg(err.message || 'You have used every listing slot on your plan.');
      } else {
        const detail = err.errors && err.errors.length ? `: ${err.errors[0]}` : '';
        showToast('⚠️ ' + (err.message || 'Failed to submit property') + detail, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="content-section" style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => navigate('/my-listings')}
          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.25rem', padding: '0.5rem' }}
          aria-label="Back to My Listings"
        >
          ←
        </button>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Add New Property</h1>
      </div>
      <p className="page-subtitle" style={{ marginBottom: '2rem', marginLeft: '2.75rem' }}>
        Fill in the details to submit your property for admin verification
      </p>

      {/* Quota Notice Banner */}
      {quotaPlan && (
        <div className={`quota-notice ${isQuotaFull ? 'full' : ''}`} style={{ marginBottom: '1.5rem' }}>
          <div className="quota-notice-main">
            <strong>{quotaPlan.planName} Plan</strong> ·{' '}
            {quotaTotal === null
              ? 'Unlimited properties available'
              : `${quotaUsed} of ${quotaTotal} used ${isQuotaFull ? '— you have reached your plan limit' : `· ${quotaTotal - quotaUsed} slots remaining`}`}
          </div>
          {isQuotaFull && (
            <button className="quota-notice-btn" onClick={() => navigate('/billing')}>
              Upgrade Plan
            </button>
          )}
        </div>
      )}

      <form id="addPropertyForm" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#1DB954' }}>🏠</span> Basic Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Property Name *</label>
              <input
                id="new-prop-name"
                type="text"
                className="form-control"
                placeholder="e.g. Luxury 3BHK Penthouse"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
              />
            </div>
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Property Type *</label>
              <select
                id="new-prop-type"
                className="form-control"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="penthouse">Penthouse</option>
                <option value="plot">Plot</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Transaction Type *</label>
              <select
                id="new-prop-transaction"
                className="form-control"
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                required
              >
                <option value="sale">Sell (Full Sale)</option>
                <option value="rent">Rent (Monthly Lease)</option>
              </select>
            </div>
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Readiness Status *</label>
              <select
                id="new-prop-readiness"
                className="form-control"
                value={readiness}
                onChange={(e) => setReadiness(e.target.value)}
                required
              >
                <option value="Ready to Move">Ready to Move</option>
                <option value="Under Construction">Under Construction</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#1DB954' }}>📍</span> Location Details
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>City *</label>
              <select
                id="new-prop-location"
                className="form-control"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              >
                <option value="">Select a launch city</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.4rem' }}>
                truEstate is actively operating in these 4 verified cities.
              </span>
            </div>
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>State</label>
              <input
                id="new-prop-state"
                type="text"
                readOnly
                className="form-control"
                value={derivedState}
                placeholder="Auto-derived from city"
                style={{ background: '#141414', color: '#9ca3af', cursor: 'not-allowed' }}
              />
            </div>
          </div>
          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem' }}>Full Address *</label>
            <input
              id="new-prop-address"
              type="text"
              className="form-control"
              placeholder="e.g. Flat 402, Highline Residency, Road No. 12, Banjara Hills"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Property Details */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#1DB954' }}>⚙️</span> Property Specifications
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                {transactionType === 'rent' ? 'Monthly Rent (₹) *' : 'Total Price (₹) *'}
              </label>
              <input
                id="new-prop-price"
                type="number"
                min="1"
                className="form-control"
                placeholder={transactionType === 'rent' ? 'e.g. 45000' : 'e.g. 12500000'}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Super Built-up Area (sqft) *</label>
              <input
                id="new-prop-sqft"
                type="number"
                min="1"
                className="form-control"
                placeholder="e.g. 1850"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Bedrooms *</label>
              <input
                id="new-prop-beds"
                type="number"
                min="0"
                className="form-control"
                placeholder="e.g. 3"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Bathrooms *</label>
              <input
                id="new-prop-baths"
                type="number"
                min="1"
                className="form-control"
                placeholder="e.g. 2"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Balconies</label>
              <input
                id="new-prop-balcony"
                type="number"
                min="0"
                className="form-control"
                placeholder="e.g. 1"
                value={balcony}
                onChange={(e) => setBalcony(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Furnishing Status *</label>
              <select
                id="new-prop-furnishing"
                className="form-control"
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
                required
              >
                <option value="Unfurnished">Unfurnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Fully Furnished">Fully Furnished</option>
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#1DB954' }}>📝</span> Description &amp; Amenities
          </h2>
          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem' }}>Detailed Description * (min 20 characters)</label>
            <textarea
              id="new-prop-description"
              rows={4}
              className="form-control"
              placeholder="Highlight property USPs, community amenities, facing, connectivity, and special features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={20}
            />
          </div>
        </div>

        {/* Photos Upload */}
        <div className="card" style={{ marginBottom: '1.5rem', borderStyle: 'dashed' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#1DB954' }}>🖼️</span> Property Photos (Public)
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.8125rem', marginBottom: '1rem' }}>
            High-resolution photos buyers will see on the listing. JPG, PNG, WEBP — up to 10MB each.
          </p>
          <input
            id="new-prop-images"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp"
            className="form-control"
            onChange={(e) => setImages(Array.from(e.target.files || []))}
          />
          {images.length > 0 && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#1DB954' }}>
              ✓ {images.length} photo{images.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* Verification Documents Upload */}
        <div className="card" style={{ marginBottom: '2rem', borderStyle: 'dashed' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#1DB954' }}>📄</span> Verification Documents (Admin Only)
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.8125rem', marginBottom: '1rem' }}>
            Upload title deed, property tax receipt, or approval documents for verification. Private — never shown to buyers.
          </p>
          <input
            id="new-prop-documents"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="form-control"
            onChange={(e) => setDocuments(Array.from(e.target.files || []))}
          />
          {documents.length > 0 && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#1DB954' }}>
              ✓ {documents.length} document{documents.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* Submit row */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '3rem' }}>
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate('/my-listings')}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
          >
            {submitting ? 'Submitting Property…' : 'Submit for Review'}
          </button>
        </div>
      </form>

      {/* Quota Upgrade Modal on 402 */}
      {quotaModalMsg && (
        <QuotaUpgradeModal
          message={quotaModalMsg}
          planName={quotaPlan?.planName}
          onClose={() => setQuotaModalMsg(null)}
        />
      )}
    </div>
  );
}
