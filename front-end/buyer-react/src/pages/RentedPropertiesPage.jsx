import PageHeader from '../components/PageHeader.jsx';
import { PinIcon, PhoneIcon } from '../components/Icons.jsx';
import { useToast } from '../context/ToastContext.jsx';

const RENTED_PROPERTIES = [
  {
    id: 'rent-1',
    title: 'Modern Condo',
    type: 'Apartment',
    badge: 'Active Lease',
    badgeColor: '#3b82f6',
    img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
    area: 'HITEC City, Hyderabad',
    monthlyRent: 'Rs 35,000',
    rentedSince: 'Jan 2025',
    leaseEnds: 'Dec 2025',
    size: '1,100 sqft',
    landlord: 'Priya Sharma',
    phone: '+91 98765 43210',
  },
  {
    id: 'rent-2',
    title: 'Central Studio Apartment',
    type: 'Studio',
    badge: 'Expiring Soon',
    badgeColor: '#f97316',
    img: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=600&q=80',
    area: 'Madhapur, Hyderabad',
    monthlyRent: 'Rs 18,000',
    rentedSince: 'Apr 2025',
    leaseEnds: 'Mar 2026',
    size: '480 sqft',
    landlord: 'Amit Verma',
    phone: '+91 91234 56789',
  },
];

export default function RentedPropertiesPage() {
  const { showToast } = useToast();

  return (
    <div>
      <PageHeader
        title="Rented Properties"
        subtitle="Active lease agreements and rental records associated with your account"
        rightAction={
          <span
            style={{
              background: 'rgba(29,185,84,0.15)',
              color: '#1DB954',
              fontSize: '0.875rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '0.375rem',
              fontWeight: 700,
            }}
          >
            Total Leases: {RENTED_PROPERTIES.length}
          </span>
        }
      />

      <div className="content-section">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {RENTED_PROPERTIES.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                minHeight: '160px',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  width: '210px',
                  minHeight: '160px',
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: '#111',
                }}
              >
                <img
                  src={p.img}
                  alt={p.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    left: '0.75rem',
                    background: '#1DB954',
                    color: '#000',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '0.25rem',
                  }}
                >
                  {p.type}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    background: p.badgeColor,
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '0.25rem',
                  }}
                >
                  {p.badge}
                </span>
              </div>

              <div style={{ flex: 1, minWidth: '300px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                    {p.title}
                  </h3>
                  <p
                    style={{
                      color: '#9ca3af',
                      fontSize: '0.85rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <PinIcon style={{ width: '0.85rem', height: '0.85rem', color: '#1DB954' }} />
                    {p.area}
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '0.75rem',
                      background: '#121212',
                      borderRadius: '0.625rem',
                      padding: '0.875rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                        Monthly Rent
                      </div>
                      <div style={{ fontWeight: 800, color: '#1DB954', fontSize: '1.05rem' }}>
                        {p.monthlyRent}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                        Rented Since
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>
                        {p.rentedSince}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                        Lease Ends
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>
                        {p.leaseEnds}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                        Unit Size
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>
                        {p.size}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <p style={{ fontSize: '0.825rem', color: '#9ca3af', margin: 0 }}>
                    Landlord: <span style={{ color: '#fff', fontWeight: 600 }}>{p.landlord}</span> &nbsp;·&nbsp; {p.phone}
                  </p>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => showToast(`Connecting to landlord ${p.landlord} (${p.phone})...`)}
                  >
                    <PhoneIcon style={{ width: '0.85rem', height: '0.85rem' }} />
                    Contact Landlord
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
