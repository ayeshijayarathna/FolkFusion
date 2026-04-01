import { useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  FiHeart, FiMail, FiPhone, FiGlobe,
  FiCreditCard, FiArrowRight,
  FiChevronLeft, FiAlertCircle,
  FiGift, FiStar, FiMapPin,
  FiShield, FiCheckCircle, FiBook, FiUser,
  FiX, FiInfo, FiAlertTriangle,
} from 'react-icons/fi';
import { BsBank2 } from 'react-icons/bs';
import { RiMusicLine, RiLeafLine } from 'react-icons/ri';
import { MdOutlinePalette } from 'react-icons/md';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ─── Constants ────────────────────────────────────────────────────────────────
const PURPOSES = [
  { value: 'general',           label: 'General Support',       icon: FiHeart,     color: 'var(--color-muted-clay)' },
  { value: 'artist-support',    label: 'Artist Support',        icon: FiStar,      color: 'var(--color-dusty-rose)' },
  { value: 'event-sponsorship', label: 'Event Sponsorship',     icon: RiMusicLine, color: 'var(--color-muted-teal)' },
  { value: 'preservation',      label: 'Cultural Preservation', icon: RiLeafLine,  color: 'var(--color-sage-green)' },
  { value: 'education',         label: 'Education',             icon: FiGift,      color: 'var(--color-muted-clay)' },
];

const PROVINCES = [
  'All Provinces','Western','Central','Southern','Northern',
  'Eastern','North Western','North Central','Uva','Sabaragamuwa',
];

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

const FUNDS = [
  {
    title: 'Folk Art Fund',
    Icon: MdOutlinePalette,
    description: 'Directly supports Sri Lankan folk artists in preserving traditional crafts — from Batik weaving and wood carving to traditional mask-making and lacquer work.',
    purpose: 'artist-support',
    color: 'var(--color-muted-clay)',
    bg: '/images/fund2.png',
  },
  {
    title: 'Fellowship Fund',
    Icon: RiMusicLine,
    description: "Funds regional festivals, cultural exhibitions, and community events that celebrate Sri Lanka's living folk heritage through traditional music, dance, and craft.",
    purpose: 'event-sponsorship',
    color: 'var(--color-muted-teal)',
    bg: '/images/fund2.png',
  },
  {
    title: 'Living Libraries Fund',
    Icon: FiBook,
    description: 'Preserves and digitizes rare folk art knowledge — oral traditions, rare techniques, and cultural stories passed down through generations.',
    purpose: 'preservation',
    color: 'var(--color-sage-green)',
    bg: '/images/fund2.png',
  },
];

const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString('en-LK')}`;

const stripeElementStyle = {
  base: {
    fontFamily: '"Libre Baskerville", serif',
    fontSize: '13px',
    color: '#2E2828',
    '::placeholder': { color: '#bbb' },
  },
  invalid: { color: '#e53e3e' },
};

const inputCls =
  'w-full border border-[#C97B5A33] rounded-xl px-3.5 py-2.5 text-[13px] text-[#2E2828] bg-white outline-none transition-colors duration-150 focus:border-[#5F8B8C] focus:ring-1 focus:ring-[#5F8B8C22]';

const Field = ({ label, required, children }) => (
  <div className="mb-3.5">
    <label className="block text-[10px] font-bold text-[#5F8B8C] tracking-widest uppercase mb-1.5 font-body">
      {label}{required && <span className="text-red-400"> *</span>}
    </label>
    {children}
  </div>
);

const SectionCard = ({ children, className = '' }) => (
  <div className={`rounded-2xl p-4 border border-white/20 mb-4 ${className}`} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)' }}>{children}</div>
);

const SectionHeading = ({ children }) => (
  <h4 className="m-0 mb-3 text-xs font-bold tracking-widest uppercase font-heading text-[#3D3530]">{children}</h4>
);

function buildDonorPayload(form) {
  return {
    fullName:    form.fullName,
    email:       form.email,
    phone:       form.phone,
    country:     form.country,
    isAnonymous: form.isAnonymous,
  };
}

//card payment form
function CardPaymentForm({ donationData, onSuccess, onError, onBack }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [cardName, setCardName]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) { onError('Stripe is not loaded yet.'); return; }
    setSubmitting(true);
    try {
      const donRes = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor:             buildDonorPayload(donationData),
          amount:            donationData.amount,
          purpose:           donationData.purpose,
          allocatedProvince: donationData.province,
          message:           donationData.message,
          paymentMethod:     'card',
        }),
      });
      const donJson = await donRes.json();
      if (!donJson.success) throw new Error(donJson.message);
      const donationId = donJson.data.donationId;

      const intentRes = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount:      donationData.amount,
          currency:    'lkr',
          description: `Donation – ${donationData.purpose}`,
          buyerEmail:  donationData.email,
        }),
      });
      const intentJson = await intentRes.json();
      if (!intentJson.success) throw new Error(intentJson.message);

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        intentJson.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardNumberElement),
            billing_details: { name: cardName || donationData.fullName, email: donationData.email },
          },
        }
      );
      if (stripeError) throw new Error(stripeError.message);
      if (paymentIntent.status !== 'succeeded') throw new Error(`Payment status: ${paymentIntent.status}`);

      await fetch(`/api/donations/${donationId}/payment-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: paymentIntent.id,
          paymentStatus: 'completed',
          paymentId:     paymentIntent.id,
          statusCode:    '2',
          statusMessage: 'SUCCESS',
        }),
      });
      onSuccess({ donationId, amount: donationData.amount });
    } catch (err) {
      onError(err.message || 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Field label="Name on Card" required>
        <input className={inputCls} value={cardName} onChange={(e) => setCardName(e.target.value)}
          placeholder={donationData.fullName || 'John Perera'} autoComplete="cc-name" />
      </Field>
      <Field label="Card Number" required>
        <div className={`${inputCls} !py-3`}><CardNumberElement options={{ style: stripeElementStyle, showIcon: true }} /></div>
      </Field>
      <Field label="Expiry" required>
        <div className={`${inputCls} !py-3`}><CardExpiryElement options={{ style: stripeElementStyle }} /></div>
      </Field>
      <Field label="CVV" required>
        <div className={`${inputCls} !py-3`}><CardCvcElement options={{ style: stripeElementStyle }} /></div>
      </Field>
      <p className="text-[11px] text-[#C4917A] mb-4 flex items-center gap-1.5 font-body">
        <FiShield size={12} className="text-[#5F8B8C]" /> Secured with Stripe · 256-bit SSL encryption
      </p>
      {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') && (
        <div className="mb-3.5 px-3 py-2.5 bg-yellow-50 border border-yellow-300/50 rounded-xl text-[11px] text-[#3D3530] font-body flex items-start gap-2">
          <FiAlertTriangle size={12} className="mt-0.5 shrink-0 text-yellow-600" />
          <div>
            <strong className="font-bold">Test card:</strong> 4242 4242 4242 4242 · Any future expiry · Any CVV
          </div>
        </div>
      )}
      <div className="flex gap-2.5 mt-2">
        <button onClick={onBack}
          className="flex-none h-12 px-5 bg-[#FDF6EE] text-[#3D3530] border border-[#C97B5A33] rounded-xl font-bold text-[13px] cursor-pointer flex items-center gap-1.5 hover:bg-[#F4EDE4] transition-colors font-body">
          <FiChevronLeft size={15} /> Back
        </button>
        <button onClick={handlePay} disabled={submitting || !stripe}
          className={`flex-1 h-12 border-none rounded-xl font-bold text-[13px] tracking-wide flex items-center justify-center gap-2 transition-all font-body ${submitting ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'btn-primary text-white cursor-pointer'}`}>
          <FiHeart size={15} />
          {submitting ? 'Processing…' : `Donate · ${fmt(donationData.amount)}`}
        </button>
      </div>
    </div>
  );
}

// bank transfer form
function BankTransferForm({ donationData, onSuccess, onError, onBack }) {
  const [bankRef, setBankRef]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!bankRef.trim()) { onError('Please enter your bank reference number.'); return; }
    setSubmitting(true);
    try {
      const donRes = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor:             buildDonorPayload(donationData),
          amount:            donationData.amount,
          purpose:           donationData.purpose,
          allocatedProvince: donationData.province,
          message:           donationData.message,
          paymentMethod:     'bank-transfer',
        }),
      });
      const donJson = await donRes.json();
      if (!donJson.success) throw new Error(donJson.message);
      await fetch(`/api/donations/${donJson.data.donationId}/payment-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: bankRef, paymentStatus: 'pending', statusMessage: 'Bank transfer pending verification' }),
      });
      onSuccess({ donationId: donJson.data.donationId, amount: donationData.amount, method: 'bank' });
    } catch (err) {
      onError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="rounded-xl border border-white/30 p-4 mb-4" style={{ background: 'rgba(255,255,255,0.5)' }}>
        {[['Bank','Bank of Ceylon'],['Account Name','FolkFusion Cultural Fund'],['Account No','8001234567'],['Branch','Colombo Main'],['Swift Code','BCEYLKLX']].map(([k, v]) => (
          <div key={k} className="flex justify-between py-1.5 border-b border-dashed border-[#C97B5A20] last:border-0">
            <span className="text-[11px] text-[#C4917A] font-bold font-body">{k}</span>
            <span className="text-xs text-[#3D3530] font-bold font-body">{v}</span>
          </div>
        ))}
      </div>
      <Field label="Bank Reference / Slip No." required>
        <input className={`${inputCls} mt-1`} value={bankRef} onChange={(e) => setBankRef(e.target.value)} placeholder="TXN123456" />
      </Field>
      <div className="flex gap-2.5 mt-2">
        <button onClick={onBack}
          className="flex-none h-12 px-5 bg-[#FDF6EE] text-[#3D3530] border border-[#C97B5A33] rounded-xl font-bold text-[13px] cursor-pointer flex items-center gap-1.5 hover:bg-[#F4EDE4] transition-colors font-body">
          <FiChevronLeft size={15} /> Back
        </button>
        <button onClick={handleSubmit} disabled={submitting || !bankRef.trim()}
          className={`flex-1 h-12 border-none rounded-xl font-bold text-[13px] tracking-wide flex items-center justify-center gap-2 transition-all font-body ${submitting || !bankRef.trim() ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'btn-primary text-white cursor-pointer'}`}>
          <BsBank2 size={15} />
          {submitting ? 'Submitting…' : 'Submit Transfer'}
        </button>
      </div>
    </div>
  );
}

// donation form
function DonationForm({ initialPurpose = 'general', onSuccess }) {
  const [step, setStep]                     = useState(1);
  const [payMethod, setPayMethod]           = useState('card');
  const [errorMsg, setErrorMsg]             = useState('');
  const [customAmount, setCustomAmount]     = useState('');
  const [selectedPreset, setSelectedPreset] = useState(1000);

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', country: 'Sri Lanka',
    isAnonymous: false, purpose: initialPurpose,
    province: 'All Provinces', message: '',
  });

  const set = useCallback((k) => (v) => setForm((f) => ({ ...f, [k]: v })), []);
  const amount      = customAmount ? Number(customAmount) : selectedPreset;
  const canProceed  = form.fullName.trim() && form.email.trim() && amount >= 100;
  const donationData = { ...form, amount };

  return (
    <div>
      {/* Step header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#C97B5A30]">
        <div>
          <h2 className="m-0 text-base font-black text-[#3D3530] font-heading">
            {step === 1 ? 'Donation Details' : 'Complete Payment'}
          </h2>
          <p className="m-0 mt-0.5 text-[11px] text-[#C4917A] font-body">
            {step === 1 ? 'Fill in your details below' : 'Choose your payment method'}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {[1, 2].map((s) => (
            <span key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] transition-all duration-200 font-heading ${step >= s ? 'text-white btn-primary' : 'text-[#C4917A] bg-[#FDF6EE] border border-[#C97B5A44]'}`}>
                {step > s ? <FiCheckCircle size={14} /> : s}
              </div>
              {s < 2 && <div className={`w-8 h-0.5 rounded-full ${step > s ? 'bg-[#C97B5A]' : 'bg-[#C97B5A30]'}`} />}
            </span>
          ))}
        </div>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 mb-4 flex items-start gap-2 font-body">
          <FiAlertCircle size={14} className="mt-0.5 shrink-0" />
          <span className="flex-1">{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-red-600 border-none bg-transparent cursor-pointer">
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* ── Step 1 ── */}
      {step === 1 && (
        <>
          {/* TOP ROW: Amount+Province (left) | Purpose (right) */}
          <div className="grid grid-cols-2 gap-3 items-start mb-3">

            {/* LEFT: Donation Amount + Province stacked */}
            <div className="flex flex-col gap-3">
              <SectionCard className="!mb-0">
                <SectionHeading>Donation Amount</SectionHeading>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {PRESET_AMOUNTS.map((v) => (
                    <button key={v}
                      onClick={() => { setSelectedPreset(v); setCustomAmount(''); }}
                      className={`py-2 rounded-xl text-[12px] font-bold border transition-all duration-150 font-body ${selectedPreset === v && !customAmount ? 'text-white btn-primary border-transparent' : 'border-[#C97B5A33] text-[#3D3530] hover:border-[#5F8B8C]'}`}
                      style={(selectedPreset === v && !customAmount) ? {} : { background: 'rgba(255,255,255,0.7)' }}>
                      {v >= 1000 ? `${v / 1000}k` : v}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[#C4917A] font-body">Rs.</span>
                  <input type="number" min="100" placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setSelectedPreset(null); }}
                    className={`${inputCls} pl-10`} />
                </div>
                {amount > 0 && amount < 100 && (
                  <p className="text-[11px] text-red-400 mt-1.5 m-0 font-body">Minimum donation is Rs. 100</p>
                )}
              </SectionCard>

              <SectionCard className="!mb-0">
                <SectionHeading>Allocate to Province</SectionHeading>
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C4917A]" size={14} />
                  <select value={form.province} onChange={(e) => set('province')(e.target.value)}
                    className={`${inputCls} pl-9 pr-8 appearance-none cursor-pointer`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C4917A' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </SectionCard>
            </div>

            {/* RIGHT: Purpose full height */}
            <SectionCard className="!mb-0 h-full">
              <SectionHeading>Purpose</SectionHeading>
              <div className="flex flex-col gap-2">
                {PURPOSES.map(({ value, label, icon: Icon, color }) => (
                  <button key={value} onClick={() => set('purpose')(value)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all duration-150 cursor-pointer w-full ${form.purpose === value ? 'border-[#5F8B8C]' : 'border-white/30 hover:border-[#5F8B8C55]'}`}
                    style={{ background: form.purpose === value ? 'rgba(95,139,140,0.15)' : 'rgba(255,255,255,0.5)' }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}22` }}>
                      <Icon size={12} style={{ color }} />
                    </div>
                    <span className="text-[12px] text-[#3D3530] font-bold leading-tight font-body">{label}</span>
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* FULL WIDTH: Your Details */}
          <SectionCard className="!mb-0">
            <SectionHeading>Your Details</SectionHeading>

            {/* Anonymous toggle */}
            <div className="flex items-center gap-2.5 cursor-pointer mb-3 select-none p-2.5 rounded-xl border border-white/30 hover:border-[#5F8B8C44] transition-colors"
              style={{ background: 'rgba(255,255,255,0.5)' }}
              onClick={() => set('isAnonymous')(!form.isAnonymous)}>
              <div className={`w-9 h-5 rounded-full transition-all duration-200 relative flex-shrink-0 ${form.isAnonymous ? 'bg-[#5F8B8C]' : 'bg-[#C97B5A33]'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${form.isAnonymous ? 'left-4' : 'left-0.5'}`} />
              </div>
              <span className="text-[13px] text-[#3D3530] font-bold flex-1 font-body">Donate Anonymously</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-body ${form.isAnonymous ? 'bg-[#5F8B8C22] text-[#5F8B8C]' : 'bg-[#FDF6EE] text-[#C4917A]'}`}>
                {form.isAnonymous ? 'ON' : 'OFF'}
              </span>
            </div>

            {form.isAnonymous && (
              <div className="mb-3 px-2.5 py-2 rounded-xl text-[11px] text-[#5F8B8C] flex items-start gap-1.5 border border-[#5F8B8C33] font-body"
                style={{ background: 'rgba(95,139,140,0.08)' }}>
                <FiShield size={11} className="flex-shrink-0 mt-0.5" />
                Your name will be hidden from public records. We still need your email to send a receipt.
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <Field label="Full Name" required>
                  <div className="relative">
                    <input className={`${inputCls} pl-9`} value={form.fullName} onChange={(e) => set('fullName')(e.target.value)}
                      placeholder={form.isAnonymous ? 'Kept private' : 'John Perera'} autoComplete="name" />
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4917A]" size={13} />
                  </div>
                </Field>
              </div>
              <div>
                <Field label="Email" required>
                  <div className="relative">
                    <input className={`${inputCls} pl-9`} type="email" value={form.email} onChange={(e) => set('email')(e.target.value)}
                      placeholder="you@email.com" autoComplete="email" />
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4917A]" size={13} />
                  </div>
                </Field>
              </div>
              <div>
                <Field label="Phone">
                  <div className="relative">
                    <input className={`${inputCls} pl-9`} value={form.phone} onChange={(e) => set('phone')(e.target.value)}
                      placeholder="+94 77 xxx xxxx" autoComplete="tel" />
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4917A]" size={13} />
                  </div>
                </Field>
              </div>
              <div>
                <Field label="Country">
                  <div className="relative">
                    <input className={`${inputCls} pl-9`} value={form.country} onChange={(e) => set('country')(e.target.value)} />
                    <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4917A]" size={13} />
                  </div>
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Message (Optional)">
                  <div className="relative">
                    <textarea className={`${inputCls} min-h-[70px] resize-none`} value={form.message}
                      onChange={(e) => set('message')(e.target.value)}
                      placeholder="Share why you're donating…" maxLength={500} />
                    <span className="absolute right-3 bottom-2 text-[10px] text-[#C97B5A55] font-body">{form.message.length}/500</span>
                  </div>
                </Field>
              </div>
            </div>
          </SectionCard>

          {/* Continue button */}
          <button
            onClick={() => { setErrorMsg(''); setStep(2); }}
            disabled={!canProceed}
            className={`w-full h-12 mt-3 border-none rounded-xl font-bold text-[13px] tracking-wide flex items-center justify-center gap-2 transition-all font-body ${canProceed ? 'btn-primary text-white cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            Continue to Payment <FiArrowRight size={15} />
          </button>
        </>
      )}

      {step === 2 && (
        <>
          {/* Summary */}
          <div className="rounded-2xl p-4 mb-4 border border-[#C97B5A22] overflow-hidden relative bg-gradient-to-br from-[#3D3530] to-[#5F8B8C]">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'url(/images/cards.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#C97B5A] font-bold uppercase tracking-widest mb-1 font-body">
                  {PURPOSES.find((p) => p.value === form.purpose)?.label} · {form.province}
                </div>
                <div className="text-2xl font-black text-white font-heading">{fmt(amount)}</div>
                <div className="text-[11px] text-white/70 mt-1 flex items-center gap-1 font-body">
                  {form.isAnonymous
                    ? <><FiShield size={10} className="text-[#C97B5A]" /> Anonymous donation</>
                    : `From ${form.fullName}`}
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <FiHeart size={24} className="text-[#C97B5A]" />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <SectionCard>
            <SectionHeading>Payment Method</SectionHeading>
            <div className="flex flex-col gap-2 mb-4">
              {[
                { id: 'card', label: 'Credit / Debit Card', icon: <FiCreditCard size={17} />, sub: 'Visa, Mastercard, Amex' },
                { id: 'bank', label: 'Bank Transfer',       icon: <BsBank2 size={17} />,      sub: 'Direct bank deposit' },
              ].map((pm) => (
                <label key={pm.id}
                  className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border-2 transition-all duration-150 ${payMethod === pm.id ? 'border-[#5F8B8C]' : 'border-white/30 hover:border-[#5F8B8C55]'}`}
                  style={{ background: payMethod === pm.id ? 'rgba(95,139,140,0.15)' : 'rgba(255,255,255,0.5)' }}>
                  <input type="radio" value={pm.id} checked={payMethod === pm.id}
                    onChange={() => { setPayMethod(pm.id); setErrorMsg(''); }}
                    className="accent-[#5F8B8C]" />
                  <span className="text-[#5F8B8C]">{pm.icon}</span>
                  <div className="flex-1">
                    <div className="font-bold text-[13px] text-[#3D3530] font-body">{pm.label}</div>
                    <div className="text-[10px] text-[#C4917A] font-body">{pm.sub}</div>
                  </div>
                  {payMethod === pm.id && <FiCheckCircle size={16} className="text-[#5F8B8C]" />}
                </label>
              ))}
            </div>

            {payMethod === 'card' && (
              <Elements stripe={stripePromise}>
                <CardPaymentForm donationData={donationData} onSuccess={onSuccess} onError={setErrorMsg} onBack={() => setStep(1)} />
              </Elements>
            )}
            {payMethod === 'bank' && (
              <BankTransferForm donationData={donationData} onSuccess={onSuccess} onError={setErrorMsg} onBack={() => setStep(1)} />
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}

// main page
export default function DonatePage() {
  const [success, setSuccess]         = useState(null);
  const [formPurpose, setFormPurpose] = useState('general');
  const [showForm, setShowForm]       = useState(false);

  const openForm = (purpose) => {
    setFormPurpose(purpose);
    setShowForm(true);
    setSuccess(null);
    setTimeout(() => document.getElementById('donate-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleSuccess = (result) => {
    setSuccess(result);
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="font-body bg-[#FDF6EE]">

      {/* hero */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: 560 }}>
        {/* Background image */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/help.png)' }} />
        {/* decorative bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#FDF6EE]" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-24 max-w-3xl mx-auto" style={{ minHeight: 560 }}>
        
          <h1 className="text-4xl md:text-[52px] font-black text-white leading-tight mb-5 m-0 font-heading">
            Preserve Our<br />
            <span className="text-[#C97B5A]">Living Heritage</span>
          </h1>
          <p className="text-black text-base md:text-lg leading-relaxed m-0 max-w-xl mx-auto font-body">
            Your generosity sustains Sri Lanka's folk artists, festivals, and ancient traditions —
            keeping them alive for generations to come.
          </p>
        </div>
      </section>

      {/* success */}
      {success && (
        <div className="max-w-2xl mx-auto mt-10 px-4">
          <div className="bg-white rounded-[20px] border border-[#C97B5A33] p-8 text-center"
            style={{ boxShadow: '0 8px 40px rgba(0,0,0,.10)' }}>
            <div className="w-[68px] h-[68px] rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-2xl text-[#3D3530] font-bold mb-2 font-heading">
              {success.method === 'bank' ? 'Submission Received!' : 'Thank You!'}
            </h2>
            <p className="text-[13px] text-[#C4917A] mb-3 leading-relaxed font-body">
              {success.method === 'bank'
                ? "Your bank transfer details have been recorded. We'll verify within 1–2 business days."
                : `Your donation of ${fmt(success.amount)} has been received. You're helping preserve Sri Lanka's folk heritage.`}
            </p>
            <div className="inline-block bg-[#FFF8E1] border-2 border-dashed border-[#C97B5A] rounded-xl px-6 py-2.5 text-[14px] text-[#3D3530] font-bold mb-5 font-body">
              Ref: {success.donationId?.toString().slice(-8).toUpperCase()}
            </div>
            <br />
            <button onClick={() => { setSuccess(null); setShowForm(false); }}
              className="btn-primary text-white border-none rounded-xl px-7 py-3 font-bold text-[13px] cursor-pointer font-body">
              Make Another Donation
            </button>
          </div>
        </div>
      )}


      {/*choose a fund */}
      <section id="choose-fund" className="max-w-6xl mx-auto px-6 pb-16">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold tracking-widest text-[#5F8B8C] uppercase mb-3 font-body">Where Your Money Goes</p>
          <h2 className="text-3xl md:text-4xl font-black text-[#3D3530] mb-4 m-0 font-heading">Choose a Fund</h2>
          <p className="text-[#C4917A] max-w-lg mx-auto leading-relaxed m-0 font-body">
            Every contribution goes directly to sustaining Sri Lanka's rich folk art traditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FUNDS.map((fund) => (
            <div key={fund.title}
              className="bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2 group"
              style={{ border: '1px solid #C97B5A22', boxShadow: '0 4px 24px rgba(0,0,0,.07)' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,.14)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,.07)'}>

              {/* Card image header */}
              <div className="relative h-36 overflow-hidden">
                <img src={fund.bg} alt={fund.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-3 left-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', color: fund.color }}>
                    <fund.Icon size={20} />
                  </div>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white font-body" style={{ background: `${fund.color}cc` }}>
                    {fund.stat}
                  </span>
                </div>
              </div>

              {/* Colour bar */}
              <div className="h-1 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(90deg, ${fund.color}, ${fund.color}66)` }} />

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-black text-lg text-[#3D3530] mb-2.5 leading-tight m-0 font-heading">
                  {fund.title}
                </h3>
                <p className="text-[13px] text-[#C4917A] leading-relaxed flex-1 mb-5 m-0 font-body">
                  {fund.description}
                </p>
                <button onClick={() => openForm(fund.purpose)}
                  className="w-full py-3 rounded-xl font-bold text-[13px] border-2 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 font-body bg-transparent"
                  style={{ borderColor: fund.color, color: fund.color }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = fund.color; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = fund.color; }}>
                  Donate to this Fund <FiArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* donation */}
      {showForm && (
        <section id="donate-form" className="relative py-20">
          {/* background image only */}
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/do.jpg)' }} />

          <div className="relative z-10 max-w-3xl mx-auto px-4">
            {/* form card */}
            <div className="rounded-[24px] overflow-hidden"
              style={{ background: 'rgba(253,246,238,0.55)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', boxShadow: '0 32px 80px rgba(0,0,0,0.35)', border: '1.5px solid rgba(255,255,255,0.35)' }}>

              {/* form card top accent */}
              <div className="h-1.5 w-full batik-divider" />

              {/* header inside card */}
              <div className="px-7 pt-6 pb-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl btn-primary flex items-center justify-center">
                  <FiHeart size={18} color="#fff" />
                </div>
                <div>
                  <p className="m-0 text-[10px] font-bold uppercase tracking-widest text-[#5F8B8C] font-body">FolkFusion</p>
                  <p className="m-0 text-[11px] text-[#C4917A] font-body">Secure Donation Portal</p>
                </div>
                {/* trust badges */}
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 border border-green-200">
                    <FiShield size={10} className="text-green-600" />
                    <span className="text-[9px] font-bold text-green-700 font-body">SSL</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200">
                    <FiCheckCircle size={10} className="text-blue-600" />
                    <span className="text-[9px] font-bold text-blue-700 font-body">Verified</span>
                  </div>
                </div>
              </div>

              <div className="px-7 pb-7">
                <DonationForm initialPurpose={formPurpose} onSuccess={handleSuccess} />
              </div>
            </div>

            {/* below card note */}
            <p className="text-center text-[11px] mt-4 flex items-center justify-center gap-1.5 font-bold text-white/85 font-body" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
              <FiShield size={11} /> Your payment is encrypted and secure. FolkFusion never stores your card details.
            </p>
          </div>
        </section>
      )}

    </div>
  );
}