import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, BellOff, Check, CheckCheck, Trash2, RefreshCw,
  Palette, ShoppingBag, Heart, MessageSquare, TrendingUp,
  Package, Filter, AlertCircle, CheckCircle, ExternalLink,
} from 'lucide-react';
import { notificationAPI } from '../../../services/api';
import { useSocket } from '../../../context/SocketContext';

const TYPE_META = {
  ARTWORK_ADDED: {
    icon: Palette, color: '#8DAA91', bg: '#F0F8F1', label: 'Artwork Added',
    actionLabel: 'View Artworks', actionPath: '/admin/artworks',
  },
  ARTWORK_LIKES_MILESTONE: {
    icon: TrendingUp, color: '#A67C52', bg: '#FAF0E6', label: 'Likes Milestone',
    actionLabel: 'View Artworks', actionPath: '/admin/artworks',
  },
  MARKETPLACE_SALE: {
    icon: ShoppingBag, color: '#5F8B8C', bg: '#EFF7F7', label: 'Marketplace Sale',
    actionLabel: 'View Sales', actionPath: '/admin/sales',
  },
  MARKETPLACE_ITEM_ADDED: {
    icon: Package, color: '#C48A6A', bg: '#FDF3EC', label: 'Item Listed',
    actionLabel: 'View Sales', actionPath: '/admin/sales',
  },
  DONATION_RECEIVED: {
    icon: Heart, color: '#e06090', bg: '#FEF0F6', label: 'Donation Received',
    actionLabel: 'View Donations', actionPath: '/admin/donations',
  },
  INQUIRY_RECEIVED: {
    icon: MessageSquare, color: '#7B68EE', bg: '#F3F0FF', label: 'Inquiry Received',
    actionLabel: 'View Inquiries', actionPath: '/admin/inquiries',
  },
};

const FILTER_TYPES = [
  { value: 'all',                     label: 'All'          },
  { value: 'ARTWORK_ADDED',           label: 'Artworks'     },
  { value: 'ARTWORK_LIKES_MILESTONE', label: 'Likes'        },
  { value: 'MARKETPLACE_SALE',        label: 'Sales'        },
  { value: 'MARKETPLACE_ITEM_ADDED',  label: 'New Listings' },
  { value: 'DONATION_RECEIVED',       label: 'Donations'    },
  { value: 'INQUIRY_RECEIVED',        label: 'Inquiries'    },
];

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)     return `${diff}s ago`;
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB');
}

// single notification row in the table
const NotificationRow = ({ notif, onMarkRead, onDelete, onAction }) => {
  const meta = TYPE_META[notif.type] || {
    icon: Bell, color: '#A67C52', bg: '#FAF0E6', label: notif.type,
    actionLabel: null, actionPath: null,
  };
  const Icon = meta.icon;

  return (
    <tr className={`transition-colors hover:bg-[#FAF0E6]/60 ${!notif.isRead ? 'bg-[#FFFBF5]' : 'bg-white'}`}>

      {/* type badge */}
      <td className="px-6 py-4 w-52">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: meta.bg }}>
            <Icon size={17} color={meta.color}/>
          </div>
          <span className="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
            style={{ background: meta.bg, color: meta.color }}>
            {meta.label}
          </span>
        </div>
      </td>

      {/*title & message */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-[#4A3F35] text-sm">{notif.title}</p>
          {!notif.isRead && <span className="w-2 h-2 rounded-full bg-[#C48A6A] flex-shrink-0"/>}
        </div>
        <p className="text-xs text-[#2E2E2E]/60 leading-relaxed">{notif.message}</p>
      </td>

      {/* time */}
      <td className="px-6 py-4 text-xs text-[#2E2E2E]/40 whitespace-nowrap">
        {timeAgo(notif.createdAt)}
      </td>

      {/* status badge */}
      <td className="px-6 py-4">
        {notif.isRead ? (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
            <CheckCircle size={12}/> Read
          </span>
        ) : (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
            <AlertCircle size={12}/> Unread
          </span>
        )}
      </td>

      {/* actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 flex-wrap">

          {/* view button*/}
          {meta.actionPath && (
            <button
              onClick={() => onAction(notif, meta.actionPath)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#A67C52]/10 text-[#A67C52] border border-[#A67C52]/30 rounded-lg hover:bg-[#A67C52] hover:text-white transition-all text-xs font-semibold"
            >
              <ExternalLink size={12}/> {meta.actionLabel}
            </button>
          )}

          {/* mark as read */}
          {!notif.isRead && (
            <button
              onClick={() => onMarkRead(notif._id)}
              title="Mark as read"
              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
            >
              <Check size={15}/>
            </button>
          )}

          {/* delete */}
          <button
            onClick={() => onDelete(notif._id)}
            title="Delete"
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            <Trash2 size={15}/>
          </button>
        </div>
      </td>
    </tr>
  );
};

//main component
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

  const { setUnreadCount } = useSocket();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (unreadOnly) params.unreadOnly = 'true';

      const res = await notificationAPI.getAll(params);
      if (res.data.success) {
        let data = res.data.data;
        if (filter !== 'all') data = data.filter(n => n.type === filter);
        setNotifications(data);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
        setTotalUnread(res.data.unreadCount || 0);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally { setLoading(false); }
  }, [page, unreadOnly, filter, setUnreadCount]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleAction = async (notif, path) => {
    try {
      if (!notif.isRead) {
        await notificationAPI.markAsRead(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setTotalUnread(prev => Math.max(0, prev - 1));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      navigate(path);
    } catch (err) { console.error(err); navigate(path); }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setTotalUnread(prev => Math.max(0, prev - 1));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setTotalUnread(0); setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.deleteOne(id);
      const deleted = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (deleted && !deleted.isRead) {
        setTotalUnread(prev => Math.max(0, prev - 1));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) { console.error(err); }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      await notificationAPI.clearAll();
      setNotifications([]); setTotalUnread(0); setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const displayed = notifications.filter(n => filter === 'all' || n.type === filter);

  return (
    <div className="space-y-6">

      {/* header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#4A3F35]">Notifications</h1>
          <p className="text-[#2E2E2E]/70 mt-1">
            {totalUnread > 0
              ? <><strong className="text-[#C48A6A]">{totalUnread}</strong> unread notifications in your province</>
              : 'All caught up — no unread notifications!'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={fetchNotifications}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#A67C52]/30 text-[#A67C52] rounded-xl hover:bg-[#A67C52]/10 transition-all text-sm font-semibold">
            <RefreshCw size={15}/> Refresh
          </button>
          {totalUnread > 0 && (
            <button onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8DAA91] to-[#C48A6A] text-white rounded-xl hover:shadow-lg transition-all text-sm font-semibold">
              <CheckCheck size={15}/> Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-100 text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-200 transition-all text-sm font-semibold">
              <Trash2 size={15}/> Clear All
            </button>
          )}
        </div>
      </div>

      {/* stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',   value: total,               color: 'text-[#4A3F35]', bg: 'bg-[#A67C52]/10' },
          { label: 'Unread',  value: totalUnread,          color: 'text-[#C48A6A]', bg: 'bg-[#C48A6A]/10' },
          { label: 'Read',    value: total - totalUnread,  color: 'text-green-600', bg: 'bg-green-100'     },
          { label: 'Showing', value: displayed.length,     color: 'text-[#5F8B8C]', bg: 'bg-[#5F8B8C]/10' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-md">
            <p className="text-[#2E2E2E]/60 text-sm">{label}</p>
            <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* filter bar */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-[#A67C52] flex items-center gap-1 mr-1">
            <Filter size={13}/> Filter:
          </span>
          {FILTER_TYPES.map(ft => (
            <button key={ft.value} onClick={() => { setFilter(ft.value); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                filter === ft.value
                  ? 'bg-[#A67C52] text-white border-[#A67C52]'
                  : 'border-[#A67C52]/20 text-[#4A3F35] hover:bg-[#A67C52]/10'
              }`}>
              {ft.label}
            </button>
          ))}
          <button onClick={() => { setUnreadOnly(p => !p); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border-2 transition-all ml-2 ${
              unreadOnly
                ? 'bg-[#C48A6A] text-white border-[#C48A6A]'
                : 'border-[#C48A6A]/30 text-[#C48A6A] hover:bg-[#C48A6A]/10'
            }`}>
            Unread only
          </button>
        </div>
      </div>

      {/* table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#A67C52] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Notification</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#A67C52]/10">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#A67C52] border-t-transparent"/>
                  </div>
                </td></tr>
              ) : displayed.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-16 text-center">
                  <BellOff size={48} className="text-[#2E2E2E]/20 mb-4 mx-auto"/>
                  <p className="text-[#2E2E2E]/60 text-lg font-semibold mb-2">No Notifications Found</p>
                  <p className="text-[#2E2E2E]/40 text-sm">
                    {filter !== 'all' || unreadOnly ? 'Try adjusting your filters' : "You're all caught up!"}
                  </p>
                </td></tr>
              ) : (
                displayed.map(notif => (
                  <NotificationRow
                    key={notif._id}
                    notif={notif}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                    onAction={handleAction}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-md px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-[#2E2E2E]/60">
            Page <strong className="text-[#4A3F35]">{page}</strong> of <strong className="text-[#4A3F35]">{totalPages}</strong>
          </p>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-4 py-2 border-2 border-[#A67C52]/20 text-[#A67C52] rounded-lg hover:bg-[#A67C52]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-semibold">
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-semibold border-2 transition-colors ${
                  page === p
                    ? 'bg-[#A67C52] text-white border-[#A67C52]'
                    : 'border-[#A67C52]/20 text-[#4A3F35] hover:bg-[#A67C52]/10'
                }`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-4 py-2 border-2 border-[#A67C52]/20 text-[#A67C52] rounded-lg hover:bg-[#A67C52]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-semibold">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;