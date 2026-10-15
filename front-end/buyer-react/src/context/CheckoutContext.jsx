import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { buyerApi } from '../api/buyerApi.js';
import { getUser } from '../api/session.js';
import CheckoutModal from '../components/CheckoutModal.jsx';

const CheckoutContext = createContext(null);

export function CheckoutProvider({ children }) {
  const [activeOrder, setActiveOrder] = useState(null);
  const resolverRef = useRef(null);

  const _razorpayCheckout = useCallback((order) => {
    return new Promise((resolve, reject) => {
      function open() {
        const user = getUser() || {};
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount * 100,
          currency: order.currency,
          name: 'truEstate',
          description: order.description,
          order_id: order.orderId,
          prefill: { name: user.name || '', email: user.email || '' },
          theme: { color: '#1DB954' },
          handler: (response) => {
            resolve({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
          },
          modal: { ondismiss: () => resolve(null) },
        });
        rzp.on('payment.failed', () => resolve(null));
        rzp.open();
      }

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
  }, []);

  const pay = useCallback(
    async (request) => {
      const orderRes = await buyerApi.checkoutBilling(request);
      const order = orderRes.data;

      let signature = null;
      if (order.gateway === 'razorpay') {
        signature = await _razorpayCheckout(order);
      } else {
        // Open offline / demo checkout modal
        signature = await new Promise((resolve) => {
          resolverRef.current = resolve;
          setActiveOrder(order);
        });
      }

      if (!signature) {
        try {
          await buyerApi.cancelBillingOrder(order.orderId, 'Cancelled by user');
        } catch { /* ignore */ }
        return null;
      }

      const verified = await buyerApi.verifyBilling(signature);
      return { payment: verified.data, message: verified.message };
    },
    [_razorpayCheckout]
  );

  const handleModalResolve = useCallback((sig) => {
    setActiveOrder(null);
    if (resolverRef.current) {
      resolverRef.current(sig);
      resolverRef.current = null;
    }
  }, []);

  const handleModalCancel = useCallback(() => {
    setActiveOrder(null);
    if (resolverRef.current) {
      resolverRef.current(null);
      resolverRef.current = null;
    }
  }, []);

  return (
    <CheckoutContext.Provider value={{ pay }}>
      {children}
      {activeOrder && (
        <CheckoutModal
          order={activeOrder}
          onResolve={handleModalResolve}
          onCancel={handleModalCancel}
        />
      )}
    </CheckoutContext.Provider>
  );
}

export const useCheckout = () => useContext(CheckoutContext);
