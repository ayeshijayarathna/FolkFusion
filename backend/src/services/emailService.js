const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || `"FolkFusion" <${process.env.EMAIL_USER}>`;

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Cinzel+Decorative:wght@700&display=swap');
`;

const s = {
  body:       'margin:0;padding:0;background:#FFF8E7;font-family:"Libre Baskerville",Georgia,serif;',
  wrapper:    'max-width:560px;margin:0 auto;background:#FFF8E7;',
  header:     'background:linear-gradient(135deg,#2C3E35,#1a2820);padding:36px 32px 28px;text-align:center;',
  logo:       'font-family:"Cinzel Decorative","Times New Roman",serif;font-size:24px;font-weight:900;color:#D4AF37;letter-spacing:2px;margin:0 0 4px;',
  tagline:    'font-family:"Libre Baskerville",Georgia,serif;font-size:11px;color:#8DAA91;letter-spacing:3px;text-transform:uppercase;margin:0;',
  body_pad:   'padding:32px 32px 8px;',
  greeting:   'font-family:"Libre Baskerville",Georgia,serif;font-size:18px;font-weight:700;color:#2C3E35;margin:0 0 12px;',
  para:       'font-family:"Libre Baskerville",Georgia,serif;font-size:13px;color:#5C4A2A;line-height:1.75;margin:0 0 16px;',
  card:       'background:#fff;border:1px solid #E8D5A3;border-radius:12px;padding:20px 24px;margin:20px 0;',
  row:        'display:flex;justify-content:space-between;border-bottom:1px dashed #E8D5A3;padding:8px 0;',
  rowLast:    'display:flex;justify-content:space-between;padding:8px 0;',
  label:      'font-family:"Libre Baskerville",Georgia,serif;font-size:11px;font-weight:700;color:#A67C52;text-transform:uppercase;letter-spacing:1px;',
  value:      'font-family:"Libre Baskerville",Georgia,serif;font-size:13px;font-weight:700;color:#2C3E35;',
  amount_box: 'background:linear-gradient(135deg,#2C3E35,#1a2820);border-radius:12px;padding:20px 24px;text-align:center;margin:20px 0;',
  amount_lbl: 'font-family:"Libre Baskerville",Georgia,serif;font-size:11px;color:#8DAA91;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;',
  amount_val: 'font-family:"Cinzel Decorative","Times New Roman",serif;font-size:28px;font-weight:700;color:#D4AF37;margin:0;',
  ref_box:    'background:#FFF8E7;border:2px dashed #D4AF37;border-radius:10px;padding:12px 20px;text-align:center;margin:16px 0;',
  ref_lbl:    'font-family:"Libre Baskerville",Georgia,serif;font-size:10px;color:#A67C52;text-transform:uppercase;letter-spacing:2px;margin:0 0 4px;',
  ref_val:    'font-family:"Cinzel Decorative","Times New Roman",serif;font-size:16px;font-weight:700;color:#2C3E35;margin:0;',
  divider:    'border:none;border-top:1px solid #E8D5A3;margin:24px 0;',
  footer:     'background:#2C3E35;padding:24px 32px;text-align:center;',
  footer_txt: 'font-family:"Libre Baskerville",Georgia,serif;font-size:11px;color:#8DAA91;margin:0 0 6px;line-height:1.6;',
  footer_lnk: 'color:#D4AF37;text-decoration:none;',
};

// SVG icons for use inside email
const icon = {
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#276749" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  clock:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B7791F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  gift:        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,
  package:     `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2C7A7B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  truck:       `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2C7A7B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  star:        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  alertCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9B2C2C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  mail:        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B46C1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  bank:        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`,
  cash:        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22543D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  mapPin:      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2C7A7B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
};

const fmt      = (n) => `Rs. ${Number(n || 0).toLocaleString('en-LK')}`;
const fmtDate  = (d) => new Date(d || Date.now()).toLocaleDateString('en-LK', { year:'numeric', month:'long', day:'numeric' });
const purposeLabel = {
  'general':           'General Support',
  'artist-support':    'Artist Support',
  'event-sponsorship': 'Event Sponsorship',
  'preservation':      'Cultural Preservation',
  'education':         'Education',
};


// build the donation confirmation email
function buildDonationEmail({ donation, isAnonymous }) {
  const displayName = isAnonymous ? 'Valued Supporter' : donation.donor.fullName;
  const refNum      = donation._id?.toString().slice(-8).toUpperCase();
  const purpose     = purposeLabel[donation.purpose] || donation.purpose;
  const method      = donation.paymentMethod === 'bank-transfer' ? 'Bank Transfer' : 'Credit / Debit Card';
  const isPending   = donation.paymentStatus === 'pending';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Donation ${isPending ? 'Received' : 'Confirmed'} — FolkFusion</title>
  <style>${FONTS}</style>
</head>
<body style="${s.body}">
<div style="${s.wrapper}">

  <!-- HEADER -->
  <div style="${s.header}">
    <p style="${s.logo}">FOLKFUSION</p>
    <p style="${s.tagline}">Preserving Sri Lankan Heritage</p>
  </div>

  <!-- BODY -->
  <div style="${s.body_pad}">

    <p style="${s.greeting}">Dear ${displayName},</p>

    <p style="${s.para}">
      ${isPending
        ? `Thank you for initiating your donation to FolkFusion. Your bank transfer details have been recorded and our team will verify the payment within <strong>1–2 business days</strong>.`
        : `Your generous donation has been received and confirmed. You are helping preserve Sri Lanka's rich folk art traditions for generations to come.`
      }
    </p>

    <!-- AMOUNT BOX -->
    <div style="${s.amount_box}">
      <p style="${s.amount_lbl}">Donation Amount</p>
      <p style="${s.amount_val}">${fmt(donation.amount)}</p>
    </div>

    <!-- DETAILS CARD -->
    <div style="${s.card}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;">
            <span style="${s.label}">Purpose</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;text-align:right;">
            <span style="${s.value}">${purpose}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;">
            <span style="${s.label}">Province</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;text-align:right;">
            <span style="${s.value}">${donation.allocatedProvince || 'All Provinces'}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;">
            <span style="${s.label}">Payment Method</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;text-align:right;">
            <span style="${s.value}">${method}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;">
            <span style="${s.label}">Status</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;text-align:right;">
            <span style="font-family:'Libre Baskerville',Georgia,serif;font-size:12px;font-weight:700;
              color:${isPending ? '#B7791F' : '#276749'};
              background:${isPending ? '#FEFCBF' : '#C6F6D5'};
              padding:3px 10px;border-radius:20px;">
              ${isPending
                ? `${icon.clock} Pending Verification`
                : `${icon.checkCircle} Confirmed`
              }
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;">
            <span style="${s.label}">Date</span>
          </td>
          <td style="padding:8px 0;text-align:right;">
            <span style="${s.value}">${fmtDate(donation.createdAt)}</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- REFERENCE -->
    <div style="${s.ref_box}">
      <p style="${s.ref_lbl}">Donation Reference</p>
      <p style="${s.ref_val}">${refNum}</p>
    </div>

    ${isPending ? `
    <p style="${s.para}">
      <strong>Next steps:</strong> Once we verify your bank transfer, you will receive a confirmation email with your receipt. If you have any questions, please reply to this email with your reference number.
    </p>
    ` : `
    <p style="${s.para}">
      Your support directly sustains Sri Lanka's folk artists, cultural events, and the preservation of ancient traditions. On behalf of all the artists and communities you have helped — <strong>thank you</strong>.
    </p>
    `}

    <hr style="${s.divider}"/>

    <p style="font-family:'Libre Baskerville',Georgia,serif;font-size:11px;color:#A67C52;text-align:center;margin:0 0 24px;">
      Please keep this email as your donation record.<br/>
      For queries, contact us at <a href="mailto:support@folkfusion.lk" style="${s.footer_lnk}">support@folkfusion.lk</a>
    </p>

  </div>

  <!-- FOOTER -->
  <div style="${s.footer}">
    <p style="${s.footer_txt}">
      <strong style="color:#D4AF37;">FOLKFUSION</strong> — Preserving Sri Lankan Heritage<br/>
      Colombo, Sri Lanka &nbsp;|&nbsp;
      <a href="https://folkfusion.lk" style="${s.footer_lnk}">folkfusion.lk</a>
    </p>
    <p style="font-family:'Libre Baskerville',Georgia,serif;font-size:10px;color:#4A6741;margin:8px 0 0;">
      You received this email because you made a donation on FolkFusion.<br/>
      This is an automated receipt — please do not reply directly.
    </p>
  </div>

</div>
</body>
</html>`;
}

function buildDonationText({ donation, isAnonymous }) {
  const displayName = isAnonymous ? 'Valued Supporter' : donation.donor.fullName;
  const refNum      = donation._id?.toString().slice(-8).toUpperCase();
  const purpose     = purposeLabel[donation.purpose] || donation.purpose;
  const isPending   = donation.paymentStatus === 'pending';

  return `
FOLKFUSION — Donation ${isPending ? 'Received' : 'Confirmed'}

Dear ${displayName},

${isPending
  ? 'Your bank transfer details have been recorded. We will verify within 1–2 business days.'
  : 'Your donation has been confirmed. Thank you for supporting Sri Lankan heritage!'
}

AMOUNT:   ${fmt(donation.amount)}
PURPOSE:  ${purpose}
PROVINCE: ${donation.allocatedProvince || 'All Provinces'}
STATUS:   ${isPending ? 'Pending Verification' : 'Confirmed'}
DATE:     ${fmtDate(donation.createdAt)}

REFERENCE: ${refNum}

For queries: support@folkfusion.lk
FolkFusion — Preserving Sri Lankan Heritage
  `.trim();
}


// Public api
/**
 * Send donation confirmation email to the donor.
 * @param {Object} donation
 */
async function sendDonationConfirmation(donation) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email not configured — skipping donation confirmation email.');
    return;
  }

  const isAnonymous = donation.donor?.isAnonymous === true;
  const toEmail     = donation.donor?.email;

  if (!toEmail) {
    console.warn('No donor email — skipping confirmation email.');
    return;
  }

  const isPending = donation.paymentStatus === 'pending';
  const subject   = isPending
    ? `FolkFusion — Bank Transfer Received (Ref: ${donation._id?.toString().slice(-8).toUpperCase()})`
    : `FolkFusion — Thank You for Your Donation!`;

  try {
    await transporter.sendMail({
      from:     FROM,
      to:       toEmail,
      subject,
      html:     buildDonationEmail({ donation, isAnonymous }),
      text:     buildDonationText({ donation, isAnonymous }),
    });
    console.log(`Donation confirmation email sent to ${toEmail}`);
  } catch (err) {
    console.error('Failed to send donation email:', err.message);
  }
}

// order Email 
function buildOrderEmail({ order }) {
  const buyer    = order.buyer || {};
  const items    = order.items || [];
  const refNum   = order.orderId || order._id?.toString().slice(-8).toUpperCase();
  const method   = { card: 'Credit / Debit Card', bank_transfer: 'Bank Transfer', cash: 'Cash on Delivery' }[order.method] || order.method;
  const subtotal = items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
  const shipping = order.shippingCost || 0;
  const total    = order.amount || subtotal + shipping;

  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px dashed #E8D5A3;">
        <span style="${s.value}">${item.listingTitle}</span>
        <br/>
        <span style="${s.label}">x ${item.quantity} &nbsp;·&nbsp; ${fmt(item.unitPrice)} each</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px dashed #E8D5A3;text-align:right;vertical-align:top;">
        <span style="${s.value}">${fmt(item.unitPrice * item.quantity)}</span>
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Order Confirmed — FolkFusion</title>
  <style>${FONTS}</style>
</head>
<body style="${s.body}">
<div style="${s.wrapper}">

  <!-- HEADER -->
  <div style="${s.header}">
    <p style="${s.logo}">FOLKFUSION</p>
    <p style="${s.tagline}">Preserving Sri Lankan Heritage</p>
  </div>

  <!-- BODY -->
  <div style="${s.body_pad}">

    <p style="${s.greeting}">Dear ${buyer.name},</p>

    <p style="${s.para}">
      Your order has been <strong>confirmed</strong>! Thank you for supporting Sri Lankan artisans.
      Your purchase directly helps preserve our rich folk art traditions.
    </p>

    <!-- AMOUNT BOX -->
    <div style="${s.amount_box}">
      <p style="${s.amount_lbl}">Order Total</p>
      <p style="${s.amount_val}">${fmt(total)}</p>
    </div>

    <!-- ORDER REFERENCE -->
    <div style="${s.ref_box}">
      <p style="${s.ref_lbl}">Order Reference</p>
      <p style="${s.ref_val}">${refNum}</p>
    </div>

    <!-- ITEMS CARD -->
    <div style="${s.card}">
      <p style="font-family:'Libre Baskerville',Georgia,serif;font-size:11px;font-weight:700;color:#A67C52;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">
        Items Ordered
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${itemRows}
        <tr>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;">
            <span style="${s.label}">Subtotal</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;text-align:right;">
            <span style="${s.value}">${fmt(subtotal)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;">
            <span style="${s.label}">Shipping</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;text-align:right;">
            <span style="${s.value}">${fmt(shipping)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0 0;">
            <span style="font-family:'Libre Baskerville',Georgia,serif;font-size:12px;font-weight:700;color:#2C3E35;text-transform:uppercase;letter-spacing:1px;">Total</span>
          </td>
          <td style="padding:10px 0 0;text-align:right;">
            <span style="font-family:'Cinzel Decorative','Times New Roman',serif;font-size:15px;font-weight:700;color:#2C6B6B;">${fmt(total)}</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- DELIVERY & PAYMENT DETAILS -->
    <div style="${s.card}">
      <p style="font-family:'Libre Baskerville',Georgia,serif;font-size:11px;font-weight:700;color:#A67C52;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">
        Delivery &amp; Payment
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;"><span style="${s.label}">Deliver To</span></td>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;text-align:right;">
            <span style="${s.value}">${buyer.address || '—'}, ${buyer.city || ''}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;"><span style="${s.label}">Phone</span></td>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;text-align:right;">
            <span style="${s.value}">${buyer.phone || '—'}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;"><span style="${s.label}">Payment</span></td>
          <td style="padding:8px 0;text-align:right;">
            <span style="${s.value}">${method}</span>
          </td>
        </tr>
      </table>
    </div>

    ${order.method === 'bank_transfer' ? `
    <div style="background:#FFFBEB;border:2px dashed #D4AF37;border-radius:10px;padding:14px 20px;margin:0 0 20px;">
      <p style="font-family:'Libre Baskerville',Georgia,serif;font-size:12px;font-weight:700;color:#92400E;margin:0 0 6px;">
        ${icon.bank} Bank Transfer — Next Steps
      </p>
      <p style="font-family:'Libre Baskerville',Georgia,serif;font-size:12px;color:#5C4A2A;margin:0;line-height:1.7;">
        Please complete your bank transfer and use <strong>${refNum}</strong> as the reference.
        Your order will be processed once payment is verified (1–2 business days).
      </p>
    </div>
    ` : ''}

    ${order.method === 'cash' ? `
    <div style="background:#F0FFF4;border:2px dashed #48BB78;border-radius:10px;padding:14px 20px;margin:0 0 20px;">
      <p style="font-family:'Libre Baskerville',Georgia,serif;font-size:12px;font-weight:700;color:#22543D;margin:0 0 6px;">
        ${icon.cash} Cash on Delivery
      </p>
      <p style="font-family:'Libre Baskerville',Georgia,serif;font-size:12px;color:#5C4A2A;margin:0;line-height:1.7;">
        Please prepare <strong>${fmt(total)}</strong> when your order arrives.
        Our delivery partner will contact you before delivery.
      </p>
    </div>
    ` : ''}

    <p style="${s.para}">
      Your order will be carefully packaged and shipped by our artisans.
      You will receive a shipping notification once your order is on its way.
    </p>

    <hr style="${s.divider}"/>

    <p style="font-family:'Libre Baskerville',Georgia,serif;font-size:11px;color:#A67C52;text-align:center;margin:0 0 24px;">
      Questions? Contact us at <a href="mailto:support@folkfusion.lk" style="${s.footer_lnk}">support@folkfusion.lk</a><br/>
      Please quote your order reference: <strong>${refNum}</strong>
    </p>

  </div>

  <!-- FOOTER -->
  <div style="${s.footer}">
    <p style="${s.footer_txt}">
      <strong style="color:#D4AF37;">FOLKFUSION</strong> — Preserving Sri Lankan Heritage<br/>
      Colombo, Sri Lanka &nbsp;|&nbsp;
      <a href="https://folkfusion.lk" style="${s.footer_lnk}">folkfusion.lk</a>
    </p>
    <p style="font-family:'Libre Baskerville',Georgia,serif;font-size:10px;color:#4A6741;margin:8px 0 0;">
      You received this email because you placed an order on FolkFusion.<br/>
      This is an automated confirmation — please do not reply directly.
    </p>
  </div>

</div>
</body>
</html>`;
}

// order Email plain text builder
function buildOrderText({ order }) {
  const buyer  = order.buyer || {};
  const items  = order.items || [];
  const refNum = order.orderId || order._id?.toString().slice(-8).toUpperCase();
  const method = { card: 'Credit / Debit Card', bank_transfer: 'Bank Transfer', cash: 'Cash on Delivery' }[order.method] || order.method;
  const total  = order.amount || 0;

  const itemLines = items.map((i) => `  - ${i.listingTitle} x ${i.quantity} = ${fmt(i.unitPrice * i.quantity)}`).join('\n');

  return `
FOLKFUSION — Order Confirmed!

Dear ${buyer.name},

Your order has been confirmed. Thank you for supporting Sri Lankan artisans!

ORDER REFERENCE: ${refNum}
TOTAL:           ${fmt(total)}
PAYMENT:         ${method}

ITEMS:
${itemLines}

DELIVER TO:
  ${buyer.address}, ${buyer.city} ${buyer.postalCode || ''}
  Phone: ${buyer.phone}

${order.method === 'bank_transfer' ? `BANK TRANSFER: Please use reference "${refNum}" when making your transfer.\nYour order will be processed after verification (1–2 business days).` : ''}
${order.method === 'cash' ? `CASH ON DELIVERY: Please prepare ${fmt(total)} when your order arrives.` : ''}

For queries: support@folkfusion.lk
FolkFusion — Preserving Sri Lankan Heritage
  `.trim();
}

// Public api
async function sendOrderConfirmation(order) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email not configured — skipping order confirmation email.');
    return;
  }

  const toEmail = order.buyer?.email;
  if (!toEmail) {
    console.warn('No buyer email — skipping order confirmation email.');
    return;
  }

  const refNum  = order.orderId || order._id?.toString().slice(-8).toUpperCase();
  const subject = `FolkFusion — Order Confirmed! (Ref: ${refNum})`;

  try {
    await transporter.sendMail({
      from:    FROM,
      to:      toEmail,
      subject,
      html:    buildOrderEmail({ order }),
      text:    buildOrderText({ order }),
    });
    console.log(`Order confirmation email sent to ${toEmail}`);
  } catch (err) {
    console.error('Failed to send order email:', err.message);
  }
}

// status Update Email
const STATUS_EMAIL_CFG = {
  pending:    { icon: 'clock',       color: '#B7791F', bg: '#FFFBEB', label: 'Order Pending' },
  confirmed:  { icon: 'checkCircle', color: '#2B6CB0', bg: '#EBF8FF', label: 'Order Confirmed' },
  processing: { icon: 'mail',        color: '#6B46C1', bg: '#FAF5FF', label: 'Being Prepared' },
  shipped:    { icon: 'truck',       color: '#2C7A7B', bg: '#E6FFFA', label: 'Order Shipped' },
  delivered:  { icon: 'star',        color: '#276749', bg: '#F0FFF4', label: 'Order Delivered' },
  cancelled:  { icon: 'alertCircle', color: '#9B2C2C', bg: '#FFF5F5', label: 'Order Cancelled' },
};

// large centered SVG icons for status banner in status update emails
const statusBannerIcon = {
  clock:       `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#B7791F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2B6CB0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  mail:        `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6B46C1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  truck:       `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2C7A7B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  star:        `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#276749" stroke="#276749" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  alertCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9B2C2C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

function buildStatusUpdateEmail({ sale, orderStatus, trackingNumber, shippingCarrier, trackingNote }) {
  const cfg       = STATUS_EMAIL_CFG[orderStatus] || STATUS_EMAIL_CFG.confirmed;
  const refNum    = sale._id?.toString().slice(-8).toUpperCase();
  const buyerName = sale.buyer?.name || 'Valued Customer';
  const itemTitle = sale.marketplaceItem?.listingTitle || 'Your item';
  const fmtDate   = (d) => d ? new Date(d).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

  const trackingSection = (trackingNumber || shippingCarrier) ? `
    <div style="background:#E6FFFA;border:2px solid #2C7A7B44;border-radius:12px;padding:16px 20px;margin:20px 0;">
      <p style="font-family:'Libre Baskerville',Georgia,serif;font-size:11px;font-weight:700;color:#2C7A7B;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">
        ${icon.package} Shipment Details
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${shippingCarrier ? `
        <tr>
          <td style="padding:6px 0;font-family:'Libre Baskerville',Georgia,serif;font-size:11px;font-weight:700;color:#A67C52;text-transform:uppercase;letter-spacing:1px;">Carrier</td>
          <td style="padding:6px 0;text-align:right;font-family:'Libre Baskerville',Georgia,serif;font-size:13px;font-weight:700;color:#2C3E35;">${shippingCarrier}</td>
        </tr>` : ''}
        ${trackingNumber ? `
        <tr>
          <td style="padding:6px 0;font-family:'Libre Baskerville',Georgia,serif;font-size:11px;font-weight:700;color:#A67C52;text-transform:uppercase;letter-spacing:1px;">Tracking #</td>
          <td style="padding:6px 0;text-align:right;font-family:'Cinzel Decorative','Times New Roman',serif;font-size:13px;font-weight:700;color:#2C7A7B;">${trackingNumber}</td>
        </tr>` : ''}
      </table>
    </div>
  ` : '';

  const noteSection = trackingNote ? `
    <div style="background:#FFF8E7;border-left:4px solid #D4AF37;padding:12px 16px;margin:16px 0;border-radius:0 8px 8px 0;">
      <p style="font-family:'Libre Baskerville',Georgia,serif;font-size:12px;color:#5C4A2A;margin:0;line-height:1.7;">
        <strong>Update:</strong> ${trackingNote}
      </p>
    </div>
  ` : '';

  const trackOrderBtn = `
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track-order/${refNum}"
         style="display:inline-block;background:linear-gradient(135deg,#2C3E35,#1a2820);color:#D4AF37;text-decoration:none;padding:14px 32px;border-radius:12px;font-family:'Cinzel Decorative','Times New Roman',serif;font-size:13px;font-weight:700;letter-spacing:1px;">
        Track My Order
      </a>
    </div>
  `;

  const statusSpecificMsg = {
    confirmed:  `Your order has been confirmed and will be prepared soon. We'll notify you when it's on its way!`,
    processing: `Our artisan is carefully preparing your order. This ensures the highest quality for your handcrafted item.`,
    shipped:    `Your order is on its way! ${trackingNumber ? `You can track it using tracking number <strong>${trackingNumber}</strong>.` : 'You will receive delivery updates shortly.'}`,
    delivered:  `Your order has been delivered! We hope you love your handcrafted piece. Thank you for supporting Sri Lankan artisans.`,
    cancelled:  `Your order has been cancelled. If you have any questions, please contact us at <a href="mailto:support@folkfusion.lk" style="color:#D4AF37;">support@folkfusion.lk</a>.`,
  }[orderStatus] || `Your order status has been updated.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Order Update — FolkFusion</title>
</head>
<body style="margin:0;padding:0;background:#FFF8E7;font-family:'Libre Baskerville',Georgia,serif;">
<div style="max-width:560px;margin:0 auto;background:#FFF8E7;">

  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,#2C3E35,#1a2820);padding:36px 32px 28px;text-align:center;">
    <p style="font-family:'Cinzel Decorative','Times New Roman',serif;font-size:24px;font-weight:900;color:#D4AF37;letter-spacing:2px;margin:0 0 4px;">FOLKFUSION</p>
    <p style="font-size:11px;color:#8DAA91;letter-spacing:3px;text-transform:uppercase;margin:0;">Preserving Sri Lankan Heritage</p>
  </div>

  <!-- STATUS BANNER -->
  <div style="background:${cfg.bg};border-bottom:3px solid ${cfg.color}33;padding:24px 32px;text-align:center;">
    <div style="margin-bottom:8px;">${statusBannerIcon[cfg.icon] || statusBannerIcon.checkCircle}</div>
    <h2 style="font-family:'Cinzel Decorative','Times New Roman',serif;font-size:20px;font-weight:700;color:${cfg.color};margin:0 0 4px;">${cfg.label}</h2>
    <p style="font-size:12px;color:#5C4A2A;margin:0;">Order Reference: <strong>#${refNum}</strong></p>
  </div>

  <!-- BODY -->
  <div style="padding:32px 32px 8px;">

    <p style="font-size:18px;font-weight:700;color:#2C3E35;margin:0 0 12px;">Dear ${buyerName},</p>

    <p style="font-size:13px;color:#5C4A2A;line-height:1.75;margin:0 0 16px;">
      ${statusSpecificMsg}
    </p>

    ${noteSection}

    <!-- ORDER SUMMARY -->
    <div style="background:#fff;border:1px solid #E8D5A3;border-radius:12px;padding:20px 24px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;font-family:'Libre Baskerville',Georgia,serif;font-size:11px;font-weight:700;color:#A67C52;text-transform:uppercase;letter-spacing:1px;">Item</td>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;text-align:right;font-family:'Libre Baskerville',Georgia,serif;font-size:13px;font-weight:700;color:#2C3E35;">${itemTitle}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;font-family:'Libre Baskerville',Georgia,serif;font-size:11px;font-weight:700;color:#A67C52;text-transform:uppercase;letter-spacing:1px;">Quantity</td>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;text-align:right;font-family:'Libre Baskerville',Georgia,serif;font-size:13px;font-weight:700;color:#2C3E35;">${sale.quantity}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;font-family:'Libre Baskerville',Georgia,serif;font-size:11px;font-weight:700;color:#A67C52;text-transform:uppercase;letter-spacing:1px;">Total</td>
          <td style="padding:8px 0;border-bottom:1px dashed #E8D5A3;text-align:right;font-family:'Cinzel Decorative','Times New Roman',serif;font-size:14px;font-weight:700;color:#2C7A7B;">Rs. ${Number(sale.totalAmount || 0).toLocaleString('en-LK')}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-family:'Libre Baskerville',Georgia,serif;font-size:11px;font-weight:700;color:#A67C52;text-transform:uppercase;letter-spacing:1px;">Status</td>
          <td style="padding:8px 0;text-align:right;">
            <span style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.color}44;padding:3px 12px;border-radius:20px;font-family:'Libre Baskerville',Georgia,serif;font-size:12px;font-weight:700;">
              ${cfg.label}
            </span>
          </td>
        </tr>
        ${sale.shippedDate ? `
        <tr>
          <td style="padding:8px 0 0;font-family:'Libre Baskerville',Georgia,serif;font-size:11px;font-weight:700;color:#A67C52;text-transform:uppercase;letter-spacing:1px;">Shipped On</td>
          <td style="padding:8px 0 0;text-align:right;font-family:'Libre Baskerville',Georgia,serif;font-size:13px;font-weight:700;color:#2C3E35;">${fmtDate(sale.shippedDate)}</td>
        </tr>` : ''}
        ${sale.deliveredDate ? `
        <tr>
          <td style="padding:8px 0 0;font-family:'Libre Baskerville',Georgia,serif;font-size:11px;font-weight:700;color:#A67C52;text-transform:uppercase;letter-spacing:1px;">Delivered On</td>
          <td style="padding:8px 0 0;text-align:right;font-family:'Libre Baskerville',Georgia,serif;font-size:13px;font-weight:700;color:#276749;">${fmtDate(sale.deliveredDate)}</td>
        </tr>` : ''}
      </table>
    </div>

    ${trackingSection}
    ${trackOrderBtn}

    <hr style="border:none;border-top:1px solid #E8D5A3;margin:24px 0;"/>

    <p style="font-size:11px;color:#A67C52;text-align:center;margin:0 0 24px;">
      Questions? Contact us at <a href="mailto:support@folkfusion.lk" style="color:#D4AF37;text-decoration:none;">support@folkfusion.lk</a><br/>
      Please quote your order reference: <strong>#${refNum}</strong>
    </p>

  </div>

  <!-- FOOTER -->
  <div style="background:#2C3E35;padding:24px 32px;text-align:center;">
    <p style="font-size:11px;color:#8DAA91;margin:0 0 6px;line-height:1.6;">
      <strong style="color:#D4AF37;">FOLKFUSION</strong> — Preserving Sri Lankan Heritage<br/>
      Colombo, Sri Lanka &nbsp;|&nbsp;
      <a href="https://folkfusion.lk" style="color:#D4AF37;text-decoration:none;">folkfusion.lk</a>
    </p>
    <p style="font-size:10px;color:#4A6741;margin:8px 0 0;">
      You received this because you placed an order on FolkFusion.<br/>
      This is an automated message — please do not reply directly.
    </p>
  </div>

</div>
</body>
</html>`;
}

function buildStatusUpdateText({ sale, orderStatus, trackingNumber, shippingCarrier, trackingNote }) {
  const cfg    = STATUS_EMAIL_CFG[orderStatus] || STATUS_EMAIL_CFG.confirmed;
  const refNum = sale._id?.toString().slice(-8).toUpperCase();
  return `
FOLKFUSION — Order Update: ${cfg.label}

Dear ${sale.buyer?.name || 'Customer'},

Your order status has been updated to: ${cfg.label}

ORDER REFERENCE: #${refNum}
ITEM:            ${sale.marketplaceItem?.listingTitle || 'Your item'}
QUANTITY:        ${sale.quantity}
TOTAL:           Rs. ${Number(sale.totalAmount || 0).toLocaleString('en-LK')}
${trackingNumber  ? `TRACKING #:      ${trackingNumber}` : ''}
${shippingCarrier ? `CARRIER:         ${shippingCarrier}` : ''}
${trackingNote    ? `\nUPDATE: ${trackingNote}` : ''}

Track your order: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/track-order/${refNum}

For queries: support@folkfusion.lk
FolkFusion — Preserving Sri Lankan Heritage
  `.trim();
}

/**
 * send order status update email to buyer.
 * called from marketplaceController.updateOrderStatus
 *
 * @param {Object} sale            
 * @param {string} orderStatus    
 * @param {string} trackingNumber  
 * @param {string} shippingCarrier 
 * @param {string} trackingNote    
 */
async function sendOrderStatusUpdate({ sale, orderStatus, trackingNumber, shippingCarrier, trackingNote }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email not configured — skipping status update email.');
    return;
  }

  const toEmail = sale.buyer?.email;
  if (!toEmail) {
    console.warn('No buyer email on sale — skipping status update email.');
    return;
  }

  const cfg    = STATUS_EMAIL_CFG[orderStatus] || STATUS_EMAIL_CFG.confirmed;
  const refNum = sale._id?.toString().slice(-8).toUpperCase();
  const subject = `FolkFusion — ${cfg.label} (Ref: #${refNum})`;

  try {
    await transporter.sendMail({
      from:    FROM,
      to:      toEmail,
      subject,
      html:    buildStatusUpdateEmail({ sale, orderStatus, trackingNumber, shippingCarrier, trackingNote }),
      text:    buildStatusUpdateText({ sale, orderStatus, trackingNumber, shippingCarrier, trackingNote }),
    });
    console.log(`Status update email (${orderStatus}) sent to ${toEmail}`);
  } catch (err) {
    console.error('Failed to send status update email:', err.message);
  }
}

module.exports = { sendDonationConfirmation, sendOrderConfirmation, sendOrderStatusUpdate };