/**
 * PaymentProvider.jsx
 * Purpose: The single checkout flow every paid feature uses
 *          (ported from TruEstate.pay / _demoCheckout / _razorpayCheckout).
 * Inputs (props): children — the app.
 * Outputs: usePayment() → pay(request) which resolves to
 *          { payment, message } when paid, or null if the user backed out.
 *          Renders the built-in TEST MODE checkout when no Razorpay keys exist.
 * API calls:
 *   POST /billing/checkout          – opens an order (server sets the price)
 *   POST /billing/demo-checkout/:id – test gateway signs the order
 *   POST /billing/verify            – server verifies the signature
 *   POST /billing/cancelled         – closes an abandoned order
 *
 * Note: the request never contains an amount. The server prices it from its
 * rate card, so the page cannot change what anything costs.
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Modal from '../common/Modal.jsx';
import { billingApi } from '../../api/services.js';
import { getUser } from '../../auth/session.js';
import { formatINR } from '../../utils/format.js';
import { useToast } from '../feedback/ToastProvider.jsx';
import './PaymentProvider.css';

const PaymentContext = createContext(null);

/** Loads Razorpay's widget script once and opens it for `order`. */
function razorpayCheckout(order) {
  return new Promise((resolve, reject) => {
    const open = () => {
      const user = getUser() || {};
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount * 100, // Razorpay counts in paise
        currency: order.currency,
        name: 'truEstate',
        description: order.description,
        order_id: order.orderId,
        prefill: { name: user.name || '', email: user.email || '' },
        theme: { color: '#1DB954' },
        // Success → hand back the signature triplet for /billing/verify.
        handler: (response) =>
          resolve({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          }),
        modal: { ondismiss: () => resolve(null) }, // closed the widget
      });
      rzp.on('payment.failed', () => resolve(null));
      rzp.open();
    };
    if (window.Razorpay) {
      open();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = open;
    script.onerror = () => reject(new Error('Could not reach the payment gateway.'));
    document.head.appendChild(script);
  });
}

export function PaymentProvider({ children }) {
  const { showToast } = useToast();
  const [demoOrder, setDemoOrder] = useState(null); // order shown in the test checkout
  const [processing, setProcessing] = useState(false); // "Processing…" state of Pay button
  const resolverRef = useRef(null); // resolves the demo checkout promise

  /** Opens the in-app TEST MODE checkout and waits for Pay or Cancel. */
  const demoCheckout = useCallback(
    (order) =>
      new Promise((resolve) => {
        resolverRef.current = resolve;
        setDemoOrder(order);
      }),
    [],
  );

  /** Closes the test checkout with a result (signature or null). */
  const finishDemo = (value) => {
    setDemoOrder(null);
    setProcessing(false);
    if (resolverRef.current) resolverRef.current(value);
    resolverRef.current = null;
  };

  /** Pay pressed → ask the server's mock gateway for a real HMAC signature. */
  const payDemo = async () => {
    setProcessing(true);
    try {
      const res = await billingApi.demoCheckout(demoOrder.orderId);
      finishDemo(res.data);
    } catch (err) {
      setProcessing(false);
      showToast(err.message || 'Payment failed', 'error');
    }
  };

  /** The public pay() — see file header. */
  const pay = useCallback(
    async (request) => {
      const order = (await billingApi.checkout(request)).data; // server-priced order
      const signature = order.gateway === 'razorpay' ? await razorpayCheckout(order) : await demoCheckout(order);
      if (!signature) {
        // Backed out → close the order so it doesn't sit open forever.
        try {
          await billingApi.cancelled(order.orderId, 'Cancelled by user');
        } catch {
          /* the order simply stays CREATED; harmless */
        }
        return null;
      }
      const verified = await billingApi.verify(signature); // server checks HMAC
      return { payment: verified.data, message: verified.message };
    },
    [demoCheckout],
  );

  const value = useMemo(() => ({ pay }), [pay]);

  return (
    <PaymentContext.Provider value={value}>
      {children}
      <Modal open={!!demoOrder} onClose={() => !processing && finishDemo(null)} size="sm" hideClose className="checkout-box">
        {demoOrder && (
          <div>
            {/* Never dismissible: this gateway moves no real money. */}
            <div className="checkout-banner">TEST MODE · NO REAL MONEY MOVES</div>
            <div className="checkout-body">
              <div className="checkout-brand">
                <span className="checkout-logo" aria-hidden="true">
                  t
                </span>
                <div>
                  <div className="checkout-brand-name">truEstate</div>
                  <div className="text-muted small">Secure checkout</div>
                </div>
              </div>
              <div className="text-secondary small">You are paying for</div>
              <h2 className="checkout-desc">{demoOrder.description}</h2>
              <dl className="checkout-lines">
                <div>
                  <dt>Amount</dt>
                  <dd>{formatINR(demoOrder.baseAmount)}</dd>
                </div>
                <div>
                  <dt>GST (18%)</dt>
                  <dd>{formatINR(demoOrder.taxAmount)}</dd>
                </div>
                <div className="checkout-total">
                  <dt>Total payable</dt>
                  <dd>{formatINR(demoOrder.amount)}</dd>
                </div>
              </dl>
              <p className="checkout-note">
                Receipt <span>{demoOrder.receipt}</span>
                <br />
                Order <span>{demoOrder.orderId}</span>
                <br />
                This is the built-in offline gateway. It signs the order exactly as Razorpay would, and the server verifies that signature before anything is
                unlocked — add RAZORPAY_KEY_ID to .env and the real widget opens here instead.
              </p>
              <button type="button" className="btn btn-primary btn-block" onClick={payDemo} disabled={processing}>
                {processing ? 'Processing…' : 'Pay ' + formatINR(demoOrder.amount)}
              </button>
              <button type="button" className="btn btn-link btn-block" onClick={() => finishDemo(null)} disabled={processing}>
                Cancel payment
              </button>
            </div>
          </div>
        )}
      </Modal>
    </PaymentContext.Provider>
  );
}

/** Hook: const { pay } = usePayment(); */
export function usePayment() {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error('usePayment must be used inside <PaymentProvider>');
  return ctx;
}
