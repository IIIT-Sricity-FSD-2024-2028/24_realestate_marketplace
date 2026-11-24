/** Checkout state is Redux-backed; this file exposes a hook and its one UI host. */
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../common/Modal.jsx';
import { formatINR } from '../../utils/format.js';
import { cancelCheckout, demoCheckout, openCheckout, verifyCheckout } from '../../store/actions/apiActions.js';
import { demoCheckoutClosed, demoCheckoutOpened } from '../../store/slices/billingSlice.js';
import { useToast } from '../feedback/ToastProvider.jsx';

let demoResolver = null;
function razorpayCheckout(order, user) {
  return new Promise((resolve, reject) => {
    const open = () => {
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency,
        name: 'truEstate',
        description: order.description,
        order_id: order.orderId,
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#1DB954' },
        handler: (response) =>
          resolve({ orderId: response.razorpay_order_id, paymentId: response.razorpay_payment_id, signature: response.razorpay_signature }),
        modal: { ondismiss: () => resolve(null) },
      });
      rzp.on('payment.failed', () => resolve(null));
      rzp.open();
    };
    if (window.Razorpay) return open();
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = open;
    script.onerror = () => reject(new Error('Could not reach the payment gateway.'));
    document.head.appendChild(script);
  });
}

export function PaymentHost() {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { demoOrder, processing } = useSelector((state) => state.billing.checkout);
  const finish = (result) => {
    dispatch(demoCheckoutClosed());
    demoResolver?.(result);
    demoResolver = null;
  };
  const payDemo = async () => {
    try {
      finish(await dispatch(demoCheckout(demoOrder.orderId)).unwrap());
    } catch (error) {
      showToast(error?.message || 'Payment failed', 'error');
    }
  };
  return (
    <Modal open={!!demoOrder} onClose={() => !processing && finish(null)} size="sm" hideClose className="checkout-box">
      {demoOrder && (
        <div>
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
              This is the built-in offline gateway. The server verifies its signature before anything is unlocked.
            </p>
            <button type="button" className="btn btn-primary btn-block" onClick={payDemo} disabled={processing}>
              {processing ? 'Processing…' : 'Pay ' + formatINR(demoOrder.amount)}
            </button>
            <button type="button" className="btn btn-link btn-block" onClick={() => finish(null)} disabled={processing}>
              Cancel payment
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function usePayment() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const pay = useCallback(
    async (request) => {
      const order = await dispatch(openCheckout(request)).unwrap();
      const signature =
        order.gateway === 'razorpay'
          ? await razorpayCheckout(order, user)
          : await new Promise((resolve) => {
              demoResolver = resolve;
              dispatch(demoCheckoutOpened(order));
            });
      if (!signature) {
        try {
          await dispatch(cancelCheckout({ orderId: order.orderId, reason: 'Cancelled by user' })).unwrap();
        } catch {
          /* abandoned gateway order is safe */
        }
        return null;
      }
      const payment = await dispatch(verifyCheckout(signature)).unwrap();
      return { payment, message: 'Payment completed' };
    },
    [dispatch, user],
  );
  return { pay };
}
