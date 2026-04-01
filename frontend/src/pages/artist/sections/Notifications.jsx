import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  FiBell, FiBellOff, FiCheck, FiTrash2, FiRefreshCw,
  FiFilter, FiExternalLink, FiAlertTriangle, FiCheckCircle,
  FiEye, FiHeart, FiStar, FiShoppingCart,
  FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight,
} from 'react-icons/fi';
import { MdOutlineEvent, MdOutlineMenuBook, MdOutlineMarkEmailRead } from 'react-icons/md';
import { notificationAPI } from '../../../services/api';
import { useSocket } from '../../../context/SocketContext';

// types of notifications
const TYPE_META = {
  ARTWORK_LIKED:           { Icon: FiHeart,              color: '#e06090', bg: '#FEF0F6', label: 'Artwork Liked',    actionLabel: 'View Artworks', actionPath: '/artist/dashboard/artworks'   },
  ARTWORK_VIEWS_MILESTONE: { Icon: FiEye,                color: '#5F8B8C', bg: '#EFF7F7', label: 'Views Milestone', actionLabel: 'View Artworks', actionPath: '/artist/dashboard/artworks'   },
  EVENT_ADDED:             { Icon: MdOutlineEvent,        color: '#8DAA91', bg: '#F0F8F1', label: 'New Event',       actionLabel: 'View Events',   actionPath: '/events'                      },
  ORDER_PLACED:            { Icon: FiShoppingCart,        color: '#d3ab2a', bg: '#FFFBEF', label: 'Order Received', actionLabel: 'View Orders',   actionPath: '/artist/dashboard/orders'     },
  ARTIST_FEATURED:         { Icon: FiStar,                color: '#f6ad55', bg: '#FFF8EC', label: "You're Featured!", actionLabel: 'View Artworks', actionPath: '/artist/dashboard/artworks'  },
  COURSE_PUBLISHED:        { Icon: MdOutlineMenuBook,     color: '#7B68EE', bg: '#F3F0FF', label: 'New Course',     actionLabel: 'View Courses',  actionPath: '/courses'                     },
  INQUIRY_REPLIED:         { Icon: MdOutlineMarkEmailRead, color: '#C48A6A', bg: '#FDF3EC', label: 'Inquiry Reply',  actionLabel: 'View Inquiries', actionPath: '/artist/dashboard/inquiries' },
};

const FILTER_OPTIONS = [
  { value: 'all',                     label: 'All'      },
  { value: 'ARTWORK_LIKED',           label: 'Likes'    },
  { value: 'ARTWORK_VIEWS_MILESTONE', label: 'Views'    },
  { value: 'EVENT_ADDED',             label: 'Events'   },
  { value: 'ORDER_PLACED',            label: 'Orders'   },
  { value: 'ARTIST_FEATURED',         label: 'Featured' },
  { value: 'COURSE_PUBLISHED',        label: 'Courses'  },
  { value: 'INQUIRY_REPLIED',         label: 'Replies'  },
];

//helpers
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)     return `${diff}s ago`;
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB');
}

const buildPages = (current, total) => {
  if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 5) pages.push('…');
  const start = Math.max(2, current - 3);
  const end   = Math.min(total - 1, current + 3);
  for (let p = start; p <= end; p++) pages.push(p);
  if (current < total - 4) pages.push('…');
  pages.push(total);
  return pages;
};

// toast
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => { if (!msg) return; const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [msg, onDone]);
  if (!msg || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="fixed bottom-7 right-7 z-[99999] flex items-center gap-2.5 px-6 py-3.5 rounded-xl shadow-2xl text-white text-[13px] font-bold"
      style={{ background: type === 'error' ? '#c0392b' : '#5F8B8C', animation: 'nfToastIn .3s ease', maxWidth: 360, fontFamily: 'Libre Baskerville, serif' }}
    >
      {type === 'error' ? <FiAlertTriangle size={17} /> : <FiCheckCircle size={17} />}
      <span>{msg}</span>
    </div>,
    document.body
  );
};

// ─── Page button ──────────────────────────────────────────────────────────────
const PageBtn = ({ label, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center justify-center min-w-[36px] h-9 rounded-lg font-bold text-[13px] px-2.5 transition-all"
    style={{
      border: active ? 'none' : '1.5px solid #d3ab2a44',
      background: active ? '#d3ab2a' : disabled ? '#f5f0e8' : '#fff',
      color: active ? '#4A3F35' : disabled ? '#ccc' : '#2E2E2E',
      boxShadow: active ? '0 2px 8px #d3ab2a66' : 'none',
      opacity: disabled ? .55 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'Libre Baskerville, serif',
    }}
  >
    {label}
  </button>
);

//system stat card
const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded-xl px-5 py-4" style={{ border: '1px solid #d3ab2a33', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
    <p className="m-0 text-[10px] font-bold text-[#5F8B8C] uppercase tracking-[.1em]" style={{ fontFamily: 'Libre Baskerville, serif' }}>{label}</p>
    <p className="m-0 mt-1.5 text-[26px] font-black" style={{ color: color || '#4A3F35', fontFamily: 'Cinzel Decorative, serif' }}>{value}</p>
  </div>
);

// notification row component
const NotifRow = ({ notif, onMarkRead, onDelete, onAction }) => {
  const meta = TYPE_META[notif.type] || { Icon: FiBell, color: '#5F8B8C', bg: '#EFF7F7', label: notif.type, actionLabel: null, actionPath: null };
  const { Icon } = meta;

  return (
    <tr
      className="nf-row transition-colors"
      style={{
        borderBottom: '1px solid #d3ab2a22',
        background: notif.isRead ? '#fff' : '#FFFDF5',
        borderLeft: `3px solid ${notif.isRead ? 'transparent' : meta.color}`,
        animation: 'nfRowIn .2s ease',
      }}
    >
      {/* Icon */}
      <td className="p-3 w-[52px]">
        <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}>
          <Icon size={18} color={meta.color} />
        </div>
      </td>

      {/* Type badge */}
      <td className="p-2.5 w-[140px]">
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide whitespace-nowrap"
          style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}33`, fontFamily: 'Libre Baskerville, serif' }}
        >
          {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: meta.color }} />}
          {meta.label}
        </span>
      </td>

      {/* Title + message */}
      <td className="p-2.5">
        <p className="m-0 mb-0.5 text-[13px] font-bold text-[#4A3F35] leading-snug" style={{ fontFamily: 'Cinzel Decorative, serif', letterSpacing: '.01em' }}>
          {notif.title}
        </p>
        <p className="m-0 text-xs text-gray-500 leading-relaxed" style={{ fontFamily: 'Libre Baskerville, serif' }}>
          {notif.message}
        </p>
      </td>

      {/* Time */}
      <td className="p-2.5 text-[11px] text-gray-400 whitespace-nowrap" style={{ fontFamily: 'Libre Baskerville, serif' }}>
        {timeAgo(notif.createdAt)}
      </td>

      {/* Status */}
      <td className="p-2.5 whitespace-nowrap">
        {notif.isRead ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#dcf5e7] text-[#2d8a55]" style={{ border: '1px solid #2d8a5533', fontFamily: 'Libre Baskerville, serif' }}>
            <FiCheckCircle size={10} /> Read
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fff8e1] text-[#d3ab2a]" style={{ border: '1px solid #d3ab2a55', fontFamily: 'Libre Baskerville, serif' }}>
            <FiAlertTriangle size={10} /> Unread
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="p-3 whitespace-nowrap">
        <div className="flex gap-1.5 items-center">
          {meta.actionPath && (
            <button
              onClick={() => onAction(notif, meta.actionPath)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all whitespace-nowrap"
              style={{ border: `1.5px solid ${meta.color}55`, background: meta.bg, color: meta.color, fontFamily: 'Libre Baskerville, serif' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = meta.color; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = meta.bg; e.currentTarget.style.color = meta.color; }}
            >
              <FiExternalLink size={11} /> {meta.actionLabel}
            </button>
          )}
          {!notif.isRead && (
            <button
              onClick={() => onMarkRead(notif._id)}
              title="Mark as read"
              className="w-[30px] h-[30px] rounded-lg border-none cursor-pointer flex items-center justify-center transition-colors bg-[#dcf5e7] hover:bg-[#b3eacc]"
            >
              <FiCheck size={14} color="#2d8a55" />
            </button>
          )}
          <button
            onClick={() => onDelete(notif._id)}
            title="Delete"
            className="w-[30px] h-[30px] rounded-lg border-none cursor-pointer flex items-center justify-center transition-colors bg-[#fde8e8] hover:bg-[#f9c6c6]"
          >
            <FiTrash2 size={14} color="#e53e3e" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState('all');
  const [unreadOnly, setUnreadOnly]       = useState(false);
  const [page, setPage]                   = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [totalUnread, setTotalUnread]     = useState(0);
  const [total, setTotal]                 = useState(0);
  const [toast, setToast]                 = useState({ msg: '', type: 'success' });

  const { setUnreadCount } = useSocket();
  const notify = useCallback((msg, type = 'success') => setToast({ msg, type }), []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (unreadOnly) params.unreadOnly = 'true';
      const res = await notificationAPI.getAll(params);
      if (res.data.success) {
        let data = res.data.data;
        if (filter !== 'all') data = data.filter((n) => n.type === filter);
        setNotifications(data);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
        setTotalUnread(res.data.unreadCount || 0);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch { notify('Failed to load notifications', 'error'); }
    finally { setLoading(false); }
  }, [page, unreadOnly, filter, setUnreadCount, notify]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleAction = async (notif, path) => {
    try {
      if (!notif.isRead) {
        await notificationAPI.markAsRead(notif._id);
        setNotifications((prev) => prev.map((n) => n._id === notif._id ? { ...n, isRead: true } : n));
        setTotalUnread((prev) => Math.max(0, prev - 1));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      navigate(path);
    } catch { navigate(path); }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setTotalUnread((prev) => Math.max(0, prev - 1));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      notify('Marked as read');
    } catch { notify('Failed to update', 'error'); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setTotalUnread(0); setUnreadCount(0);
      notify('All notifications marked as read');
    } catch { notify('Failed to update', 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.deleteOne(id);
      const deleted = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (deleted && !deleted.isRead) {
        setTotalUnread((prev) => Math.max(0, prev - 1));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      notify('Notification deleted');
    } catch { notify('Failed to delete', 'error'); }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications? This cannot be undone.')) return;
    try {
      await notificationAPI.clearAll();
      setNotifications([]); setTotalUnread(0); setUnreadCount(0);
      notify('All notifications cleared');
    } catch { notify('Failed to clear', 'error'); }
  };

  const displayed = notifications.filter((n) => filter === 'all' || n.type === filter);

  return (
    <>
      <div className="p-6 min-h-screen" style={{ fontFamily: 'Libre Baskerville, serif', color: '#2E2E2E', background: '#FFF8E1' }}>

        {/* header */}
        <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h2 className="m-0 text-xl font-black text-[#4A3F35] tracking-tight" style={{ fontFamily: 'Cinzel Decorative, serif' }}>Notifications</h2>
            <p className="mt-1.5 m-0 text-[#5F8B8C] text-[13px]" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              {totalUnread > 0
                ? <><strong className="text-[#d3ab2a]">{totalUnread}</strong> unread notification{totalUnread !== 1 ? 's' : ''}</>
                : "You're all caught up!"}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={fetchNotifications}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[#5F8B8C] text-xs font-bold cursor-pointer transition-all"
              style={{ border: '1.5px solid #5F8B8C55', background: 'transparent', fontFamily: 'Libre Baskerville, serif' }}
            >
              <FiRefreshCw size={13} /> Refresh
            </button>
            {totalUnread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#5F8B8C] text-white text-xs font-bold cursor-pointer border-none transition-all hover:opacity-90"
                style={{ fontFamily: 'Libre Baskerville, serif' }}
              >
                <MdOutlineMarkEmailRead size={15} /> Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[#e53e3e] text-xs font-bold cursor-pointer transition-all hover:opacity-90"
                style={{ border: '1.5px solid #e53e3e55', background: '#e53e3e18', fontFamily: 'Libre Baskerville, serif' }}
              >
                <FiTrash2 size={13} /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* stats */}
        <div className="grid grid-cols-4 gap-3.5 mb-5">
          <StatCard label="Total"   value={total}              color="#4A3F35" />
          <StatCard label="Unread"  value={totalUnread}         color="#d3ab2a" />
          <StatCard label="Read"    value={total - totalUnread} color="#2d8a55" />
          <StatCard label="Showing" value={displayed.length}    color="#5F8B8C" />
        </div>

        {/* filter bar */}
        <div className="bg-white rounded-[14px] px-4 py-3.5 mb-4 flex gap-2 flex-wrap items-center" style={{ border: '1px solid #d3ab2a33', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
          <span className="text-[10px] font-bold text-[#C48A6A] uppercase tracking-[.1em] inline-flex items-center gap-1 mr-1" style={{ fontFamily: 'Libre Baskerville, serif' }}>
            <FiFilter size={12} /> Filter
          </span>
          {FILTER_OPTIONS.map((ft) => (
            <button
              key={ft.value}
              className="nf-filter-btn px-3.5 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition-all"
              onClick={() => { setFilter(ft.value); setPage(1); }}
              style={{
                border: `1.5px solid ${filter === ft.value ? '#d3ab2a' : '#d3ab2a44'}`,
                background: filter === ft.value ? '#d3ab2a' : '#fff',
                color: filter === ft.value ? '#4A3F35' : '#2E2E2E',
                boxShadow: filter === ft.value ? '0 2px 8px #d3ab2a55' : 'none',
                fontFamily: 'Libre Baskerville, serif',
              }}
            >
              {ft.label}
            </button>
          ))}
          <button
            className="nf-filter-btn ml-1 px-3.5 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition-all"
            onClick={() => { setUnreadOnly((p) => !p); setPage(1); }}
            style={{
              border: `1.5px solid ${unreadOnly ? '#5F8B8C' : '#5F8B8C44'}`,
              background: unreadOnly ? '#5F8B8C' : '#fff',
              color: unreadOnly ? '#fff' : '#5F8B8C',
              fontFamily: 'Libre Baskerville, serif',
            }}
          >
            Unread only
          </button>
        </div>

        {/* table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3.5">
            <div className="w-10 h-10 rounded-full border-4 border-[#d3ab2a44] border-t-[#d3ab2a]" style={{ animation: 'nfSpin .8s linear infinite' }} />
            <p className="text-[#5F8B8C] m-0 text-[13px]" style={{ fontFamily: 'Libre Baskerville, serif' }}>Loading notifications…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-14 text-[#5F8B8C]">
            <FiBellOff size={52} color="#5F8B8C" className="mx-auto mb-3" />
            <p className="text-[15px] font-bold m-0 mb-1.5" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
              {total === 0 ? 'No notifications yet' : 'No notifications match your filters'}
            </p>
            <p className="text-xs text-gray-400 m-0" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              {total === 0 ? 'Notifications will appear here when something happens.' : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-[14px] mb-1.5 overflow-hidden" style={{ border: '1px solid #d3ab2a33', boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 820 }}>
                <thead>
                  <tr>
                    {['', 'Type', 'Notification', 'Time', 'Status', 'Actions'].map((h, i) => (
                      <th
                        key={i}
                        className="p-3 text-left text-[10px] font-bold text-[#5F8B8C] tracking-[.1em] uppercase whitespace-nowrap"
                        style={{ background: '#fffbef', borderBottom: '2px solid #d3ab2a44', fontFamily: 'Libre Baskerville, serif' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((notif) => (
                    <NotifRow
                      key={notif._id}
                      notif={notif}
                      onMarkRead={handleMarkRead}
                      onDelete={handleDelete}
                      onAction={handleAction}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between flex-wrap gap-3 mt-4 px-5 py-3.5 bg-white rounded-xl" style={{ border: '1px solid #d3ab2a33' }}>
            <span className="text-xs text-[#5F8B8C]" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex gap-1.5 items-center flex-wrap">
              <PageBtn label={<FiChevronsLeft size={14} />} disabled={page <= 1} onClick={() => setPage(1)} />
              <PageBtn label={<FiChevronLeft  size={14} />} disabled={page <= 1} onClick={() => setPage((p) => p - 1)} />
              {buildPages(page, totalPages).map((item, i) =>
                item === '…'
                  ? <span key={`el-${i}`} className="text-[#C48A6A] px-1 text-sm select-none" style={{ fontFamily: 'Libre Baskerville, serif' }}>…</span>
                  : <PageBtn key={item} label={item} active={item === page} onClick={() => setPage(item)} />
              )}
              <PageBtn label={<FiChevronRight  size={14} />} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} />
              <PageBtn label={<FiChevronsRight size={14} />} disabled={page >= totalPages} onClick={() => setPage(totalPages)} />
            </div>
          </div>
        )}
      </div>

      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: '', type: 'success' })} />
    </>
  );
};

export default Notifications;