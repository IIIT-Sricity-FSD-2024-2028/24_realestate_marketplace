import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyerApi } from '../api/buyerApi.js';
import { formatOfferAmount, shortDate } from '../utils/format.js';
import useLiveRefresh from '../hooks/useLiveRefresh.js';
import PageHeader from '../components/PageHeader.jsx';
import StateMessage from '../components/StateMessage.jsx';
import { PinIcon } from '../components/Icons.jsx';

export default function PurchasedPropertiesPage() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = useCallback(async () => {
    try {
      const res = await buyerApi.getMinePurchases();
      setPurchases(res.data || []);
    } catch (err) {
      console.error('Failed to load purchased vault:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  useLiveRefresh(fetchPurchases, { intervalMs: 15000 });

  const completedDeals = useMemo(() => {
    return purchases.filter((p) => p.dealStatus === 'completed');
  }, [purchases]);

  return (
    <div>
      <PageHeader
        title="Purchased Properties"
        subtitle="Properties officially acquired and registered under your ownership"
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
            Total Owned: {completedDeals.length}
          </span>
        }
      />

      <div className="content-section">
        {loading ? (
          <StateMessage type="loading" title="Loading property vault…" message="Retrieving your registered assets." />
        ) : completedDeals.length === 0 ? (
          <StateMessage
            type="empty"
            icon="🏠"
            title="No purchased properties yet"
            message="Your officially completed and registered properties will appear in this portfolio vault."
            actionLabel="View Purchase Progress"
            onAction={() => {
              const target = window.location.pathname.startsWith('/buyer') ? '/buyer/purchase-initiation' : '/purchase-initiation';
              navigate(target);
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {completedDeals.map((p, i) => {
              const img =
                p.propertyImage ||
                'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80';
              const location = [p.propertyCity, p.propertyState].filter(Boolean).join(', ') || 'Hyderabad';
              const regCode = `REG-2026-${1000 + i}`;
              const regDate = shortDate(p.updatedAt || p.createdAt) || 'Recent';

              return (
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
                      src={img}
                      alt={p.propertyTitle}
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
                      Property
                    </span>
                    <span
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: '#1DB954',
                        color: '#000',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.65rem',
                        borderRadius: '0.25rem',
                      }}
                    >
                      Owned
                    </span>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: '300px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                          {p.propertyTitle || 'Property'}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                          {regCode}
                        </span>
                      </div>

                      <p
                        style={{
                          color: '#9ca3af',
                          fontSize: '0.85rem',
                          marginTop: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <PinIcon style={{ width: '0.85rem', height: '0.85rem', color: '#1DB954' }} />
                        {location}
                      </p>
                    </div>

                    <div
                      style={{
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        paddingTop: '0.85rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.85rem',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase' }}>
                          Purchased Price
                        </div>
                        <div style={{ fontSize: '1.35rem', color: '#1DB954', fontWeight: 800 }}>
                          {formatOfferAmount(p.agreedPrice)}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase' }}>
                          Date of Registration
                        </div>
                        <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 600 }}>
                          {regDate}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
