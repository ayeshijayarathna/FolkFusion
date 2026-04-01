import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiChevronLeft, FiShoppingCart, FiCreditCard, FiArrowRight } from 'react-icons/fi';
import { BsBank2, BsCashCoin } from 'react-icons/bs';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { paymentAPI } from '../../../services/api';

/* helpers */
const fmt = (n) => `LKR ${Number(n || 0).toLocaleString('en-LK')}`;

/* stripe loads once at module level */
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/* payment methods */
const PAYMENT_METHODS = [
  { id: 'card',          label: 'Credit / Debit Card', icon: <FiCreditCard size={18} /> },
  { id: 'bank_transfer', label: 'Bank Transfer',        icon: <BsBank2 size={18} /> },
  { id: 'cash',          label: 'Cash on Delivery',     icon: <BsCashCoin size={18} /> },
];

const stripeElementStyle = {
  base: {
    fontFamily: '"Libre Baskerville", serif',
    fontSize: '13px',
    color: '#2E2E2E',
    '::placeholder': { color: '#bbb' },
  },
  invalid: { color: '#e53e3e' },
};

const Field = ({ label, required, children }) => (
  <div className="mb-3.5">
    <label className="block text-[10px] font-bold text-teal-600 tracking-widest uppercase mb-1.5 font-serif">
      {label}{required && <span className="text-red-500"> *</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  'w-full border border-amber-700/25 rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 bg-white outline-none font-serif transition-colors duration-150 focus:border-teal-500';

const OrderSummary = ({ cart, subtotal, shipping, total }) => (
  <div className="bg-amber-50 rounded-2xl p-4 h-fit">
    <h4 className="m-0 mb-3 font-serif text-xs text-amber-900 font-bold tracking-wide uppercase">Order Summary</h4>
    {cart.map((ci) => {
      const img = ci.artwork?.images?.find((i) => i.isPrimary) || ci.artwork?.images?.[0];
      return (
        <div key={ci._id} className="flex gap-2.5 mb-2.5">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-amber-900/10 flex-shrink-0">
            {img
              ? <img src={img.url} alt="" className="w-full h-full object-cover" />
              : <div className="h-full flex items-center justify-center text-lg">🎨</div>
            }
          </div>
          <div className="flex-1">
            <div className="font-serif text-[11px] text-amber-900 font-bold leading-tight">{ci.listingTitle}</div>
            <div className="font-serif text-[10px] text-amber-700 mt-0.5">×{ci.qty} · {fmt(ci.price.amount * ci.qty)}</div>
          </div>
        </div>
      );
    })}
    <div className="border-t border-dashed border-amber-700/25 pt-2.5 mt-2">
      {[['Subtotal', subtotal], ['Shipping', shipping]].map(([k, v]) => (
        <div key={k} className="flex justify-between mb-1">
          <span className="font-serif text-[11px] text-amber-700">{k}</span>
          <span className="font-serif text-[11px] font-bold text-gray-800">{fmt(v)}</span>
        </div>
      ))}
      <div className="flex justify-between border-t border-amber-700/10 pt-2 mt-1">
        <span className="font-serif text-xs font-bold text-amber-900">Total</span>
        <span className="font-serif text-xs font-bold text-teal-600">{fmt(total)}</span>
      </div>
    </div>
  </div>
);

const CheckoutForm = ({ cart, onClose, onOrderPlaced }) => {
  const stripe   = useStripe();
  const elements = useElements();

  const [step, setStep]             = useState(1);
  const [payMethod, setPayMethod]   = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId]       = useState(null);
  const [errorMsg, setErrorMsg]     = useState('');

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    address: '', city: '', postalCode: '',
    cardName: '', bankRef: '',
  });

  const set = useCallback((k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value })), []);

  const subtotal = cart.reduce((s, i) => s + i.price.amount * i.qty, 0);
  const shipping  = cart.reduce((s, i) => s + (i.shipping?.cost || 0) * i.qty, 0);
  const total     = subtotal + shipping;

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setErrorMsg('');

    try {
      let stripePaymentIntentId = null;

      if (payMethod === 'card') {
        if (!stripe || !elements) {
          setErrorMsg('Stripe is not loaded yet. Please wait a moment.');
          setSubmitting(false);
          return;
        }

        const intentRes = await paymentAPI.createIntent({
          amount: total,
          currency: 'lkr',
          description: `FolkFusion order by ${form.fullName}`,
          buyerEmail: form.email,
        });
        const { clientSecret } = intentRes.data;

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardNumberElement),
            billing_details: {
              name: form.cardName || form.fullName,
              email: form.email,
              phone: form.phone,
              address: {
                line1: form.address,
                city: form.city,
                postal_code: form.postalCode,
                country: 'LK',
              },
            },
          },
        });

        if (stripeError) {
          setErrorMsg(stripeError.message);
          setSubmitting(false);
          return;
        }

        if (paymentIntent.status !== 'succeeded') {
          setErrorMsg(`Payment status: ${paymentIntent.status}. Please try again.`);
          setSubmitting(false);
          return;
        }

        stripePaymentIntentId = paymentIntent.id;
      }

      const orderRes = await paymentAPI.createOrder({
        stripePaymentIntentId,
        method: payMethod,
        amount: total,
        buyer: {
          name:       form.fullName,
          email:      form.email,
          phone:      form.phone,
          address:    form.address,
          city:       form.city,
          postalCode: form.postalCode,
        },
        items: cart.map((ci) => ({
          listingId:    ci._id,
          listingTitle: ci.listingTitle,
          quantity:     ci.qty,
          unitPrice:    ci.price.amount,
        })),
        bankReference: payMethod === 'bank_transfer' ? form.bankRef : undefined,
      });

      setOrderId(orderRes.data.orderId);
      setStep(3);
      onOrderPlaced();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || err.message || 'Order failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1); setOrderId(null); setErrorMsg('');
    setForm({ fullName: '', email: '', phone: '', address: '', city: '', postalCode: '', cardName: '', bankRef: '' });
    onClose();
  };

  /* success screen*/
  if (step === 3) return (
    <div className="px-8 py-10 text-center">
      <div className="w-[72px] h-[72px] rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center mx-auto mb-5 text-3xl">
      </div>
      <h2 className="font-serif text-2xl text-amber-900 m-0 mb-2 font-bold">Order Confirmed!</h2>
      <p className="font-serif text-[13px] text-amber-700 mb-1">
        Thank you, <strong>{form.fullName}</strong>! Your order has been placed.
      </p>
      <div className="inline-block bg-amber-50 border-2 border-dashed border-yellow-500 rounded-xl px-7 py-3 my-3.5 font-serif text-[15px] text-amber-900 font-bold">
        Ref: {orderId}
      </div>

      {payMethod === 'card' && (
        <p className="font-serif text-xs text-teal-600 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2 mb-3">
           Payment processed via Stripe
        </p>
      )}
      {payMethod === 'bank_transfer' && (
        <p className="font-serif text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mb-3">
           Please complete your bank transfer with ref: <strong>{form.bankRef || orderId}</strong>
        </p>
      )}

      <p className="font-serif text-xs text-gray-400 mt-1.5 mb-6">
        Confirmation sent to <strong>{form.email}</strong>
      </p>
      <button
        onClick={resetAndClose}
        className="bg-teal-600 text-white border-none rounded-xl px-8 py-3 font-serif font-bold text-[13px] cursor-pointer hover:bg-teal-700 transition-colors"
      >
        Continue Shopping
      </button>
    </div>
  );

  return (
    <div className="p-7 px-8">
      {/* header */}
      <div className="flex items-center justify-between mb-6 border-b border-yellow-400/20 pb-4">
        <h2 className="m-0 font-serif text-base text-amber-900 font-bold">
          {step === 1 ? 'Delivery Details' : 'Payment'}
        </h2>
        <div className="flex gap-2 items-center">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-serif font-bold text-[11px] transition-all duration-200 ${step >= s ? 'bg-teal-600 border-2 border-teal-600 text-white' : 'bg-amber-50 border-2 border-amber-700/25 text-amber-700'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 2 && <div className={`w-7 h-0.5 ${step > s ? 'bg-teal-600' : 'bg-amber-700/20'}`} />}
            </React.Fragment>
          ))}
        </div>
        <button onClick={resetAndClose} className="border-none bg-transparent cursor-pointer text-gray-800 flex items-center p-1 rounded-full hover:bg-amber-50 transition-colors">
          <FiX size={20} />
        </button>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* left */}
        <div>
          {/* step 1*/}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Field label="Full Name" required>
                  <input className={inputCls} value={form.fullName} onChange={set('fullName')} placeholder="John Perera" autoComplete="name" />
                </Field>
              </div>
              <Field label="Email" required>
                <input className={inputCls} type="email" value={form.email} onChange={set('email')} autoComplete="email" />
              </Field>
              <Field label="Phone" required>
                <input className={inputCls} value={form.phone} onChange={set('phone')} placeholder="+94 77 xxx xxxx" autoComplete="tel" />
              </Field>
              <div className="col-span-2">
                <Field label="Delivery Address" required>
                  <textarea className={`${inputCls} min-h-[70px] resize-y`} value={form.address} onChange={set('address')} placeholder="No. 12, Galle Road…" autoComplete="street-address" />
                </Field>
              </div>
              <Field label="City" required>
                <input className={inputCls} value={form.city} onChange={set('city')} autoComplete="address-level2" />
              </Field>
              <Field label="Postal Code">
                <input className={inputCls} value={form.postalCode} onChange={set('postalCode')} placeholder="10001" autoComplete="postal-code" />
              </Field>
              <div className="col-span-2">
                <button
                  onClick={() => setStep(2)}
                  className="w-full h-12 bg-teal-600 text-white border-none rounded-xl font-serif font-bold text-[13px] cursor-pointer flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors"
                >
                  Continue to Payment <FiArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* step 2*/}
          {step === 2 && (
            <>
              {/* method selector */}
              <div className="flex flex-col gap-2.5 mb-4">
                {PAYMENT_METHODS.map((pm) => (
                  <label key={pm.id} className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border-2 transition-all duration-150 ${payMethod === pm.id ? 'border-teal-600 bg-teal-600/10' : 'border-amber-700/20 bg-white'}`}>
                    <input
                      type="radio"
                      value={pm.id}
                      checked={payMethod === pm.id}
                      onChange={() => { setPayMethod(pm.id); setErrorMsg(''); }}
                      className="accent-teal-600"
                    />
                    <span className="text-teal-600">{pm.icon}</span>
                    <span className="font-serif font-bold text-[13px] text-amber-900">{pm.label}</span>
                  </label>
                ))}
              </div>

              {/* card fields*/}
              {payMethod === 'card' && (
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-700/10 mb-3">
                  <Field label="Name on Card" required>
                    <input className={inputCls} value={form.cardName} onChange={set('cardName')} placeholder="John Perera" autoComplete="cc-name" />
                  </Field>
                  <Field label="Card Number" required>
                    <div className={`${inputCls} py-3`}>
                      <CardNumberElement options={{ style: stripeElementStyle, showIcon: true }} />
                    </div>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Expiry" required>
                      <div className={`${inputCls} py-3`}>
                        <CardExpiryElement options={{ style: stripeElementStyle }} />
                      </div>
                    </Field>
                    <Field label="CVV" required>
                      <div className={`${inputCls} py-3`}>
                        <CardCvcElement options={{ style: stripeElementStyle }} />
                      </div>
                    </Field>
                  </div>
                  <p className="font-serif text-[11px] text-amber-700 m-0 flex items-center gap-1.5">
                    <FiCreditCard size={12} /> Secured with Stripe · 256-bit SSL
                  </p>
                  {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') && (
                    <div className="mt-2.5 px-3 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-lg font-serif text-[11px] text-amber-900">
                       Test card: <strong>4242 4242 4242 4242</strong> · Any future expiry · Any CVV
                    </div>
                  )}
                </div>
              )}

              {/* bank transfer */}
              {payMethod === 'bank_transfer' && (
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-700/10 mb-3">
                  {[['Bank', 'Bank of Ceylon'], ['Account', '1234-5678-9012'], ['Branch', 'Colombo Fort'], ['Currency', 'LKR']].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-dashed border-amber-700/15 pb-1.5 mb-1.5">
                      <span className="font-serif text-[11px] text-amber-700 font-bold">{k}</span>
                      <span className="font-serif text-xs text-amber-900 font-bold">{v}</span>
                    </div>
                  ))}
                  <Field label="Bank Reference / Slip No.">
                    <input className={`${inputCls} mt-2.5`} value={form.bankRef} onChange={set('bankRef')} placeholder="TXN123456" />
                  </Field>
                </div>
              )}

              {/* cash on delivery */}
              {payMethod === 'cash' && (
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-700/10 mb-3">
                  <p className="font-serif text-[13px] text-gray-800 leading-relaxed m-0">
                    Pay in cash when your order arrives. Please prepare the exact amount: <strong className="text-teal-600">{fmt(total)}</strong>
                  </p>
                </div>
              )}

              {/* error message */}
              {errorMsg && (
                <div className="px-3.5 py-2.5 bg-red-50 border border-red-300 rounded-xl font-serif text-xs text-red-700 mb-3">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* action buttons */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => { setStep(1); setErrorMsg(''); }}
                  className="flex-none h-12 px-5 bg-amber-50 text-amber-900 border border-amber-700/25 rounded-xl font-serif font-bold text-[13px] cursor-pointer flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
                >
                  <FiChevronLeft size={15} /> Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting || (payMethod === 'card' && !stripe)}
                  className={`flex-1 h-12 border-none rounded-xl font-serif font-bold text-[13px] tracking-wide flex items-center justify-center gap-2 transition-colors ${submitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70' : 'bg-yellow-500 text-amber-900 cursor-pointer hover:bg-yellow-600'}`}
                >
                  <FiShoppingCart size={15} />
                  {submitting ? 'Processing…' : `Place Order · ${fmt(total)}`}
                </button>
              </div>
            </>
          )}
        </div>

        {/* right */}
        <OrderSummary cart={cart} subtotal={subtotal} shipping={shipping} total={total} />
      </div>
    </div>
  );
};

const CheckoutModal = ({ open, cart, onClose, onOrderPlaced }) => {
  if (!open) return null;
  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[8000] flex items-center justify-center p-5 bg-gray-800/65 animate-[fadeIn_.18s_ease]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-amber-50 rounded-[20px] w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-yellow-400/25 animate-[pop_.22s_ease]"
      >
        <Elements stripe={stripePromise}>
          <CheckoutForm cart={cart} onClose={onClose} onOrderPlaced={onOrderPlaced} />
        </Elements>
      </div>
    </div>,
    document.body
  );
};

export default CheckoutModal;