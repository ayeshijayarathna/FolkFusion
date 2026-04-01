import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  FiSearch, FiPackage, FiTruck, FiCheckCircle,
  FiClock, FiX, FiMapPin, FiHash, FiUser,
  FiCalendar, FiLayers, FiAlertCircle,
} from 'react-icons/fi';
import { BsCashCoin, BsCreditCard, BsBank } from 'react-icons/bs';
import axios from 'axios';

// helpers
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const fmt   = (n) => `LKR ${Number(n || 0).toLocaleString('en-LK')}`;
const fdate = (d) => d ? new Date(d).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
const ftime = (d) => d ? new Date(d).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' }) : '';

// status config
const STEPS = [
  { key: 'pending',    Icon: FiClock,       label: 'Order Placed'    },
  { key: 'confirmed',  Icon: FiPackage,     label: 'Order Confirmed' },
  { key: 'processing', Icon: FiLayers,      label: 'Being Prepared'  },
  { key: 'shipped',    Icon: FiTruck,       label: 'Shipped'         },
  { key: 'delivered',  Icon: FiCheckCircle, label: 'Delivered'       },
];
const STEP_INDEX = Object.fromEntries(STEPS.map((s, i) => [s.key, i]));

const PAY_ICON = {
  cash:          BsCashCoin,
  card:          BsCreditCard,
  bank_transfer: BsBank,
};
const PAY_LABEL = {
  cash:          'Cash on Delivery',
  card:          'Credit / Debit Card',
  bank_transfer: 'Bank Transfer',
};
const PAY_STATUS_CFG = {
  pending:   { label: 'Payment Pending',   textCls: 'text-[color:var(--color-muted-clay)]', bgCls: 'bg-[color:var(--color-muted-clay)]/10' },
  completed: { label: 'Payment Confirmed', textCls: 'text-[color:var(--color-sage-green)]', bgCls: 'bg-[color:var(--color-sage-green)]/10' },
  failed:    { label: 'Payment Failed',    textCls: 'text-red-700',                          bgCls: 'bg-red-50'                             },
};

// sub components
const OrnamentDivider = () => (
  <div className="flex items-center gap-3 my-1">
    <div className="flex-1 h-px bg-[color:var(--color-muted-clay)]/20" />
    <div className="flex items-center gap-1.5">
      <div className="w-1 h-1 rounded-full bg-[color:var(--color-muted-clay)]/40" />
      <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-muted-clay)]/60" />
      <div className="w-1 h-1 rounded-full bg-[color:var(--color-muted-clay)]/40" />
    </div>
    <div className="flex-1 h-px bg-[color:var(--color-muted-clay)]/20" />
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-[color:var(--color-warm-sand)] rounded-2xl border border-[color:var(--color-muted-clay)]/15 shadow-[0_4px_24px_rgba(61,53,48,0.08)] ${className}`}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <p className="font-heading text-[9px] tracking-[.22em] uppercase text-[color:var(--color-muted-teal)] mb-4 m-0">
    {children}
  </p>
);

// main component
const OrderTracking = () => {
  const { ref }               = useParams();
  const [input,   setInput]   = useState(ref || '');
  const [loading, setLoading] = useState(false);
  const [order,   setOrder]   = useState(null);
  const [error,   setError]   = useState('');

  const handleTrack = useCallback(async (refOverride) => {
    const val = (refOverride || input).trim().toUpperCase();
    if (!val) return;
    setLoading(true); setError(''); setOrder(null);
    try {
      const res = await axios.get(`${API_URL}/marketplace/track/${val}`);
      setOrder(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Please check your reference number.');
    } finally {
      setLoading(false);
    }
  }, [input]);

  useEffect(() => {
    if (ref) { setInput(ref.toUpperCase()); handleTrack(ref.toUpperCase()); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const currentStep = order ? (STEP_INDEX[order.orderStatus] ?? 0) : 0;
  const isCancelled = order?.orderStatus === 'cancelled';
  const payCfg      = order ? (PAY_STATUS_CFG[order.paymentStatus] || PAY_STATUS_CFG.pending) : null;
  const PayIcon     = order ? (PAY_ICON[order.paymentMethod] || BsCashCoin) : null;

  return (
    <div
      className="min-h-screen font-body relative">
      
      {/* hero*/}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundImage: "url('/images/sen backroug.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingTop: 'clamp(48px, 8vw, 80px)',
          paddingBottom: 'clamp(60px, 10vw, 96px)',
        }}
      >
       
        <div className="relative z-10 max-w-xl mx-auto px-6 text-center">
          {/* top ornament row */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-14 bg-[color:var(--color-muted-clay)]/50" />
            <div className="w-2 h-2 rounded-full bg-[color:var(--color-muted-clay)]" />
            <div className="w-1 h-1 rounded-full bg-[color:var(--color-dusty-rose)]" />
            <div className="w-2 h-2 rounded-full bg-[color:var(--color-muted-clay)]" />
            <div className="h-px w-14 bg-[color:var(--color-muted-clay)]/50" />
          </div>

          <p className="font-heading text-[9px] tracking-[.35em] text-[color:var(--color-muted-clay)] mb-3 uppercase m-0">
            FolkFusion Heritage Marketplace
          </p>
          <h1
            className="font-heading text-[color:var(--color-warm-sand)] mb-3 m-0"
            style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 400, letterSpacing: '0.02em' }}
          >
            Order Tracking
          </h1>
          <p className="font-body text-[color:var(--color-muted-clay)] text-[13px] leading-relaxed m-0">
            Enter your reference number to trace your handcrafted treasure
          </p>

          {/* Bottom ornament */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-8 bg-[color:var(--color-muted-clay)]/40" />
            <div className="w-1 h-1 rounded-full bg-[color:var(--color-muted-clay)]/60" />
            <div className="h-px w-8 bg-[color:var(--color-muted-clay)]/40" />
          </div>
        </div>
      </div>

      {/*search card*/}
      <div className="max-w-[520px] mx-auto px-5 -mt-8 relative z-20 ot-appear">
        <Card className="p-6">
          <div className="h-0.5 w-14 bg-[color:var(--color-muted-clay)] rounded-full mb-5 mx-auto" />
          <SectionLabel>Reference Number</SectionLabel>

          <div className="flex gap-2">
            <div
              className="flex-1 flex items-center gap-2.5 rounded-xl px-4 py-3 border border-[color:var(--color-muted-clay)]/25 transition-colors focus-within:border-[color:var(--color-muted-teal)]"
              style={{ background: 'color-mix(in srgb, var(--color-warm-sand) 55%, white)' }}
            >
              <FiHash size={14} className="text-[color:var(--color-muted-clay)] flex-shrink-0" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                placeholder="e.g. AB12CD34"
                maxLength={24}
                className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold text-[color:var(--color-deep-brown)] placeholder:font-normal placeholder:text-[color:var(--color-muted-clay)]/55 font-body"
              />
              {input && (
                <button
                  onClick={() => { setInput(''); setOrder(null); setError(''); }}
                  className="border-none bg-transparent cursor-pointer text-[color:var(--color-muted-clay)] hover:text-[color:var(--color-deep-brown)] transition-colors flex items-center"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => handleTrack()}
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-body font-bold text-[13px] border-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ background: 'var(--color-deep-brown)', color: 'var(--color-warm-sand)' }}
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-[color:var(--color-warm-sand)]/30 border-t-[color:var(--color-warm-sand)] rounded-full" style={{ animation: 'otSpin .7s linear infinite' }} />
                : <FiSearch size={15} />}
              Track
            </button>
          </div>
          <p className="m-0 mt-3 text-[11px] text-[color:var(--color-muted-clay)]/65 font-body text-center">
            Your reference number is in the order confirmation email.
          </p>
        </Card>
      </div>

      {/* error*/}
      {error && (
        <div className="max-w-[520px] mx-auto px-5 mt-5 ot-appear">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200/80 rounded-2xl">
            <FiAlertCircle size={17} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="m-0 text-[13px] text-red-700 font-body">{error}</p>
          </div>
        </div>
      )}

      {/* result */}
      {order && (
        <div className="max-w-[520px] mx-auto px-5 mt-6 pb-16 flex flex-col gap-4">

          {/*order header card */}
          <Card className="overflow-hidden ot-appear">
            {/* rainbow accent strip */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--color-muted-clay), var(--color-dusty-rose), var(--color-sage-green), var(--color-muted-teal))' }} />
            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Item thumbnail */}
                {order.item?.image?.url ? (
                  <div className="w-[68px] h-[68px] rounded-xl overflow-hidden flex-shrink-0 border border-[color:var(--color-muted-clay)]/15">
                    <img src={order.item.image.url} alt={order.item.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-[68px] h-[68px] rounded-xl bg-[color:var(--color-muted-clay)]/10 flex items-center justify-center flex-shrink-0">
                    <FiPackage size={24} className="text-[color:var(--color-muted-clay)]/50" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-heading text-[9px] tracking-[.18em] text-[color:var(--color-muted-clay)] mb-0.5 uppercase m-0">
                    Order Reference
                  </p>
                  <p className="font-heading text-[color:var(--color-deep-brown)] text-[17px] mb-1 leading-none m-0" style={{ fontWeight: 400 }}>
                    #{order.refNum}
                  </p>
                  <p className="font-body text-[13px] font-bold text-[color:var(--color-deep-brown)] leading-snug line-clamp-2 m-0">
                    {order.item?.title}
                  </p>
                  {order.item?.category && (
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-body bg-[color:var(--color-sage-green)]/15 text-[color:var(--color-sage-green)] border border-[color:var(--color-sage-green)]/25">
                      {order.item.category}
                    </span>
                  )}
                </div>

                <div className="text-right flex-shrink-0 pl-2">
                  <p className="font-body text-[10px] text-[color:var(--color-muted-clay)] mb-0.5 m-0">Total</p>
                  <p className="font-heading text-[color:var(--color-muted-teal)] text-[15px] leading-none m-0" style={{ fontWeight: 400 }}>
                    {fmt(order.totalAmount)}
                  </p>
                </div>
              </div>

              <OrnamentDivider />

              {/* Payment row */}
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${payCfg?.bgCls}`}>
                <div className={`flex items-center gap-2 font-body text-[12px] font-bold ${payCfg?.textCls}`}>
                  {PayIcon && <PayIcon size={14} />}
                  {payCfg?.label}
                </div>
                <span className={`font-body text-[11px] ${payCfg?.textCls}`}>
                  {PAY_LABEL[order.paymentMethod] || order.paymentMethod}
                </span>
              </div>
            </div>
          </Card>

          {/*Progress stepper */}
          {!isCancelled ? (
            <Card className="p-5 ot-appear2">
              <SectionLabel>Delivery Progress</SectionLabel>
              <div className="relative pl-1">
                {/* Track line bg */}
                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-[color:var(--color-muted-clay)]/15 rounded-full" />
                {/* Track line fill */}
                <div
                  className="absolute left-[15px] top-4 w-0.5 bg-[color:var(--color-muted-teal)] rounded-full transition-all duration-700"
                  style={{ height: currentStep === 0 ? 0 : `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                />

                {STEPS.map((step, i) => {
                  const done    = i < currentStep;
                  const current = i === currentStep;
                  const future  = i > currentStep;
                  const StepIcon = done ? FiCheckCircle : step.Icon;
                  return (
                    <div key={step.key} className="relative z-10 flex items-start gap-3.5 mb-5 last:mb-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                        style={{
                          background: done ? 'var(--color-muted-teal)' : current ? 'var(--color-deep-brown)' : 'color-mix(in srgb, var(--color-warm-sand) 55%, white)',
                          color:      done || current ? 'var(--color-warm-sand)' : 'color-mix(in srgb, var(--color-muted-clay) 55%, transparent)',
                          border:     current ? '2px solid var(--color-muted-clay)' : done ? 'none' : '1.5px solid color-mix(in srgb, var(--color-muted-clay) 25%, transparent)',
                          boxShadow:  current ? '0 0 0 4px color-mix(in srgb, var(--color-muted-clay) 12%, transparent)' : 'none',
                        }}
                      >
                        <StepIcon size={14} />
                      </div>
                      <div className="pt-1">
                        <p className="font-body text-[12px] font-bold m-0" style={{ color: future ? 'color-mix(in srgb, var(--color-muted-clay) 55%, transparent)' : 'var(--color-deep-brown)' }}>
                          {step.label}
                        </p>
                        {done && step.key === 'shipped' && order.shippedDate && (
                          <p className="font-body text-[11px] text-[color:var(--color-muted-clay)] m-0 mt-0.5">{fdate(order.shippedDate)}</p>
                        )}
                        {done && step.key === 'delivered' && order.deliveredDate && (
                          <p className="font-body text-[11px] text-[color:var(--color-sage-green)] font-bold m-0 mt-0.5">{fdate(order.deliveredDate)}</p>
                        )}
                        {current && (
                          <p className="font-body text-[11px] text-[color:var(--color-muted-clay)] font-bold m-0 mt-0.5 ot-pulse">
                            Current status
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <Card className="p-5 ot-appear2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <FiX size={17} className="text-red-600" />
                </div>
                <div>
                  <p className="font-heading text-[13px] text-red-700 m-0 mb-1" style={{ fontWeight: 400 }}>Order Cancelled</p>
                  <p className="font-body text-[12px] text-red-600/80 m-0">This order has been cancelled. Contact us if you have questions.</p>
                </div>
              </div>
            </Card>
          )}

          {/* shipment info*/}
          {(order.trackingNumber || order.shippingCarrier) && (
            <Card className="p-5 ot-appear2">
              <SectionLabel>Shipment Information</SectionLabel>
              <div className="flex flex-col gap-3">
                {order.shippingCarrier && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-body text-[11px] font-bold uppercase tracking-[.1em] text-[color:var(--color-muted-clay)]">
                      <FiTruck size={12} /> Carrier
                    </div>
                    <span className="font-body text-[13px] font-bold text-[color:var(--color-deep-brown)]">{order.shippingCarrier}</span>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-body text-[11px] font-bold uppercase tracking-[.1em] text-[color:var(--color-muted-clay)]">
                      <FiHash size={12} /> Tracking No.
                    </div>
                    <span className="font-body text-[13px] font-bold text-[color:var(--color-muted-teal)]">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/*tracking history*/}
          {order.trackingHistory?.length > 0 && (
            <Card className="p-5 ot-appear3">
              <SectionLabel>Update History</SectionLabel>
              {[...order.trackingHistory].reverse().map((h, i, arr) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center flex-shrink-0 pt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[color:var(--color-muted-teal)]" />
                    {i < arr.length - 1 && <div className="w-0.5 flex-1 bg-[color:var(--color-muted-clay)]/15 my-1 min-h-[16px]" />}
                  </div>
                  <div className={`${i < arr.length - 1 ? 'pb-4' : 'pb-0'}`}>
                    <p className="font-body text-[11px] font-bold uppercase tracking-[.08em] text-[color:var(--color-muted-teal)] m-0">{h.status}</p>
                    {h.note && <p className="font-body text-[12px] text-[color:var(--color-deep-brown)] m-0 mt-0.5">{h.note}</p>}
                    <p className="font-body text-[10px] text-[color:var(--color-muted-clay)]/65 m-0 mt-0.5">{fdate(h.date)} {ftime(h.date)}</p>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Order details */}
          <Card className="p-5 ot-appear3">
            <SectionLabel>Order Details</SectionLabel>
            {[
              [FiUser,     'Buyer',       order.buyer?.name],
              [FiLayers,   'Quantity',    order.quantity],
              [FiCalendar, 'Order Date',  fdate(order.orderDate)],
              [FiTruck,    'Ship Method', order.shippingMethod],
              [FiPackage,  'Artisan',     order.artist?.name],
              [FiMapPin,   'Province',    order.artist?.province],
            ].filter(([, , v]) => v).map(([Icon, k, v], idx, arr) => (
              <div key={k} className={`flex items-center justify-between py-2.5 ${idx < arr.length - 1 ? 'border-b border-[color:var(--color-muted-clay)]/10' : ''}`}>
                <div className="flex items-center gap-2 font-body text-[11px] font-bold uppercase tracking-[.09em] text-[color:var(--color-muted-clay)]">
                  <Icon size={12} />
                  {k}
                </div>
                <span className="font-body text-[12px] font-bold text-[color:var(--color-deep-brown)]">{v}</span>
              </div>
            ))}
          </Card>

          {/* footer note*/}
          <div className="text-center pt-2 pb-2">
            <OrnamentDivider />
            <p className="font-body text-[11px] text-[color:var(--color-muted-clay)]/65 mt-4 mb-0 leading-relaxed">
              Questions about your order?<br />
              <a
                href="mailto:support@folkfusion.lk"
                className="font-bold text-[color:var(--color-muted-teal)] hover:text-[color:var(--color-deep-brown)] transition-colors"
                style={{ textDecoration: 'none' }}
              >
                support@folkfusion.lk
              </a>
            </p>
          </div>
        </div>
      )}

      {/*empty state*/}
      {!order && !error && !loading && (
        <div className="max-w-[520px] mx-auto px-5 mt-14 text-center ot-appear">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-[color:var(--color-muted-clay)]/8" style={{ animation: 'otPulse 2s ease infinite' }} />
            <div className="absolute inset-3 rounded-full bg-[color:var(--color-muted-clay)]/8" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FiPackage size={30} className="text-[color:var(--color-muted-clay)]/40" />
            </div>
          </div>
          <p className="font-heading text-[color:var(--color-deep-brown)]/55 text-[14px] mb-2 m-0" style={{ fontWeight: 400 }}>
            Ready to Track
          </p>
          <p className="font-body text-[13px] text-[color:var(--color-muted-clay)]/65 leading-relaxed m-0">
            Enter your order reference above to see delivery status,<br />
            shipment details, and tracking updates.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 font-body text-[10px] text-[color:var(--color-muted-clay)]/45 uppercase tracking-[.18em]">
            <div className="h-px w-10 bg-[color:var(--color-muted-clay)]/25" />
            Handcrafted with care
            <div className="h-px w-10 bg-[color:var(--color-muted-clay)]/25" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;