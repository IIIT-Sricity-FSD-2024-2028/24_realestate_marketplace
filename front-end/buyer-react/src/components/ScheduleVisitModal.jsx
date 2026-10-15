import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyerApi } from '../api/buyerApi.js';
import { errorText } from '../api/client.js';
import { getToken } from '../api/session.js';
import { useToast } from '../context/ToastContext.jsx';

const MONTH_NAMES = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
];

const TIME_SLOTS = [
  '10:00 AM – 11:30 AM',
  '11:30 AM – 01:00 PM',
  '02:00 PM – 03:30 PM',
  '04:00 PM – 05:30 PM',
  '05:30 PM – 07:00 PM',
];

export default function ScheduleVisitModal({ property, onClose, onScheduled }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.getDate();
  });
  const [selectedSlot, setSelectedSlot] = useState(() => TIME_SLOTS[0]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!property) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  function handleMonthChange(delta) {
    setViewDate(new Date(year, month + delta, 1));
    setSelectedDay(null);
  }

  // Calculate calendar days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
  // Monday as 0: (firstDayIndex === 0 ? 6 : firstDayIndex - 1)
  const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  async function handleConfirm() {
    const token = getToken();
    if (!token) {
      showToast('⚠️ Please log in to your buyer account to schedule a site visit.', 'error');
      const loginPath = window.location.pathname.startsWith('/buyer') ? '/buyer/login' : '/login';
      navigate(loginPath);
      return;
    }

    let targetPropId = property.realId || property._id;
    if (!targetPropId && typeof property.id === 'string' && /^[0-9a-fA-F]{24}$/.test(property.id)) {
      targetPropId = property.id;
    }
    if (!targetPropId) {
      try {
        const live = await buyerApi.getProperties(1, 20);
        const items = live.data?.items || live.data || [];
        const match = items.find(
          (it) => (it.title && property.title && it.title.toLowerCase() === property.title.toLowerCase()) ||
                  (it.city && property.location && it.city.toLowerCase() === property.location.toLowerCase())
        ) || items[0];
        if (match) targetPropId = match.id || match._id;
      } catch (e) {
        console.warn('Fallback property lookup failed:', e);
      }
    }

    if (!targetPropId) {
      showToast('⚠️ Could not connect to a live listing for this property.', 'error');
      return;
    }
    if (!selectedDay) {
      showToast('⚠️ Please select a date on the calendar.', 'error');
      return;
    }
    if (!selectedSlot) {
      showToast('⚠️ Please select a preferred time slot.', 'error');
      return;
    }

    const isoDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    setSubmitting(true);
    try {
      await buyerApi.requestVisit(targetPropId, isoDate, selectedSlot, message);
      showToast(`📅 Site visit requested for ${property.title}! Admin will confirm shortly.`);
      onClose();
      if (onScheduled) onScheduled();
      const targetPath = window.location.pathname.startsWith('/buyer') ? '/buyer/visit-status' : '/visit-status';
      navigate(targetPath);
    } catch (err) {
      showToast(errorText(err, 'Failed to schedule the visit'), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 4500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="modal-box"
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '1.25rem',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '2rem',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#fff' }}>
              Schedule Site Visit
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
              {property.title} · {property.area}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '1.25rem',
              cursor: 'pointer',
              width: '2rem',
              height: '2rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s, background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ✕
          </button>
        </div>

        {/* Month Navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
            background: '#121212',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => handleMonthChange(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: 700,
            }}
          >
            ‹
          </button>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', color: '#1DB954' }}>
            {MONTH_NAMES[month]} {year}
          </div>
          <button
            type="button"
            onClick={() => handleMonthChange(1)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: 700,
            }}
          >
            ›
          </button>
        </div>

        {/* Days of week header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#6b7280',
            marginBottom: '0.5rem',
          }}
        >
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
          <div>S</div>
        </div>

        {/* Calendar Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.25rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const thisDate = new Date(year, month, d);
            const isPast =
              thisDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isToday = isCurrentMonth && today.getDate() === d;
            const isSelected = selectedDay === d;

            let bg = 'transparent';
            let color = '#fff';
            let border = '1px solid transparent';

            if (isPast) {
              color = '#4b5563';
            } else if (isSelected) {
              bg = '#1DB954';
              color = '#000';
            } else if (isToday) {
              border = '1px solid #1DB954';
              color = '#1DB954';
            }

            return (
              <button
                key={d}
                type="button"
                disabled={isPast}
                onClick={() => setSelectedDay(d)}
                style={{
                  background: bg,
                  color,
                  border,
                  padding: '0.5rem 0',
                  borderRadius: '0.4rem',
                  cursor: isPast ? 'not-allowed' : 'pointer',
                  fontWeight: isSelected ? 800 : 500,
                  fontSize: '0.85rem',
                  transition: 'background 0.2s',
                }}
              >
                {d}
              </button>
            );
          })}
        </div>

        {/* Time Slots */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}
          >
            Available Time Slot
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {TIME_SLOTS.map((slot) => {
              const active = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  style={{
                    padding: '0.625rem 0.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid',
                    borderColor: active ? '#1DB954' : 'rgba(255, 255, 255, 0.1)',
                    background: active ? '#1DB954' : '#282828',
                    color: active ? '#000' : '#fff',
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Notes */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 700,
              marginBottom: '0.45rem',
            }}
          >
            Note / Request for Admin (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Please bring floor plans or arrange parking..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              width: '100%',
              background: '#282828',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '0.5rem',
              color: '#fff',
              padding: '0.65rem 0.85rem',
              fontSize: '0.85rem',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'none',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              flex: 1,
              background: '#282828',
              color: '#fff',
              border: 'none',
              padding: '0.85rem',
              borderRadius: '0.6rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            style={{
              flex: 2,
              background: '#1DB954',
              color: '#000',
              border: 'none',
              padding: '0.85rem',
              borderRadius: '0.6rem',
              fontWeight: 800,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Confirming…' : 'Confirm Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
