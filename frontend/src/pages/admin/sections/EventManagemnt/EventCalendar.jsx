import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, Clock, MapPin,
  Users, X, Eye, Edit2, AlertCircle, CheckCircle,
  XCircle, Layers, Filter, RefreshCw
} from 'lucide-react';
import { eventAPI } from '../../../../services/api';

/* status of events */
const STATUS_CONFIG = {
  upcoming:  { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: '#3b82f6', label: 'Upcoming'  },
  ongoing:   { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: '#d97706', label: 'Ongoing'   },
  completed: { bg: 'bg-purple-100', text: 'text-purple-700', dot: '#9333ea', label: 'Completed' },
  cancelled: { bg: 'bg-red-100',    text: 'text-red-700',    dot: '#ef4444', label: 'Cancelled' },
};

const EVENT_TYPE_COLORS = {
  Workshop:    '#8DAA91',
  Exhibition:  '#C48A6A',
  Festival:    '#7C9EBF',
  Competition: '#B07EC4',
  Training:    '#7ABFB5',
  Other:       '#A8A89C',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

/* tiny helpers */
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth()    &&
  a.getDate()     === b.getDate();

const eventSpansDay = (event, day) => {
  const start = new Date(event.startDate);
  const end   = new Date(event.endDate);
  start.setHours(0,0,0,0);
  end.setHours(23,59,59,999);
  return day >= start && day <= end;
};

/* status badge */
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { bg:'bg-gray-100', text:'text-gray-600', label: status };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${cfg.bg} ${cfg.text} rounded-full text-xs font-semibold`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }}/>
      {cfg.label}
    </span>
  );
};

/* event pill inside calendar cell */
const EventPill = ({ event, onClick }) => {
  const color = EVENT_TYPE_COLORS[event.eventType] || '#8DAA91';
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(event); }}
      className="w-full text-left text-xs rounded px-1.5 py-0.5 mb-0.5 truncate font-medium transition-opacity hover:opacity-80"
      style={{ background: color + '22', color, border: `1px solid ${color}44` }}
      title={event.title}
    >
      {event.startTime && <span className="opacity-70 mr-1">{event.startTime}</span>}
      {event.title}
    </button>
  );
};

/* detail panel  */
const EventDetailPanel = ({ event, onClose, onEdit }) => {
  if (!event) return null;
  const registeredCount = Array.isArray(event.participants)
    ? event.participants.filter(p => p.status === 'registered').length : 0;

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl rounded-r-2xl z-20 flex flex-col border-l border-[#8DAA91]/20 animate-slide-in">
      {/* header */}
      <div className="bg-[#8DAA91] px-5 py-4 rounded-tr-2xl flex items-start justify-between gap-3 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-0.5">{event.eventType}</p>
          <h3 className="text-white font-bold text-base leading-tight truncate">{event.title}</h3>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white mt-0.5 flex-shrink-0">
          <X size={18}/>
        </button>
      </div>

      {/* cover */}
      {event.coverImage?.url && (
        <img src={event.coverImage.url} alt={event.title}
          className="w-full h-32 object-cover flex-shrink-0"/>
      )}

      {/* body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <StatusBadge status={event.status}/>

        <p className="text-[#2E2E2E]/70 text-sm leading-relaxed line-clamp-4">
          {event.description || 'No description provided.'}
        </p>

        <div className="space-y-2.5 text-sm">
          <div className="flex items-start gap-2.5">
            <Calendar size={14} className="text-[#8DAA91] mt-0.5 flex-shrink-0"/>
            <div>
              <p className="font-semibold text-[#4A3F35]">
                {new Date(event.startDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
              </p>
              {!isSameDay(new Date(event.startDate), new Date(event.endDate)) && (
                <p className="text-[#2E2E2E]/50 text-xs">
                  → {new Date(event.endDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                </p>
              )}
            </div>
          </div>
          {event.startTime && (
            <div className="flex items-center gap-2.5">
              <Clock size={14} className="text-[#8DAA91] flex-shrink-0"/>
              <span className="text-[#4A3F35]">
                {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
              </span>
            </div>
          )}
          <div className="flex items-start gap-2.5">
            <MapPin size={14} className="text-[#8DAA91] mt-0.5 flex-shrink-0"/>
            <div>
              <p className="font-semibold text-[#4A3F35]">{event.location?.venue || 'TBA'}</p>
              {event.location?.district && (
                <p className="text-[#2E2E2E]/50 text-xs">{event.location.district}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Users size={14} className="text-[#8DAA91] flex-shrink-0"/>
            <span className="text-[#4A3F35]">
              {registeredCount} registered
              {event.capacity > 0 && ` / ${event.capacity} capacity`}
            </span>
          </div>
        </div>

        {event.categories?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.categories.map(c => (
              <span key={c} className="px-2 py-0.5 bg-[#C48A6A]/10 text-[#C48A6A] rounded text-xs">{c}</span>
            ))}
          </div>
        )}

        {/* participants quick summary */}
        {event.participants?.length > 0 && (
          <div className="bg-[#F0F8F1] rounded-xl p-3">
            <p className="text-xs font-semibold text-[#4A3F35] mb-2 uppercase tracking-wide">Participants</p>
            <div className="flex gap-2 flex-wrap">
              {['registered','attended','cancelled'].map(s => {
                const cnt = event.participants.filter(p => p.status === s).length;
                const cfg = STATUS_CONFIG[s] || {};
                return cnt > 0 ? (
                  <span key={s} className={`px-2 py-0.5 ${cfg.bg} ${cfg.text} rounded-full text-xs font-semibold`}>
                    {cnt} {s}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="p-4 border-t border-[#8DAA91]/20 flex gap-2 flex-shrink-0">
        <button onClick={() => onEdit(event)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors text-sm font-medium">
          <Edit2 size={14}/> Edit
        </button>
      </div>
    </div>
  );
};

/* event list row */
const EventListRow = ({ event, onClick }) => {
  const color = EVENT_TYPE_COLORS[event.eventType] || '#8DAA91';
  return (
    <button onClick={() => onClick(event)}
      className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-[#F0F8F1] transition-colors group">
      <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: color }}/>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-[#4A3F35] text-sm truncate">{event.title}</p>
          <StatusBadge status={event.status}/>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-[#2E2E2E]/50">
          <span className="flex items-center gap-1"><Calendar size={11}/> {new Date(event.startDate).toLocaleDateString('en-GB')}</span>
          {event.location?.venue && <span className="flex items-center gap-1"><MapPin size={11}/> {event.location.venue}</span>}
          <span className="ml-auto px-2 py-0.5 rounded text-xs" style={{ background: color+'22', color }}>{event.eventType}</span>
        </div>
      </div>
    </button>
  );
};

/* main calendar component */
const EventCalendar = ({ onEditEvent }) => {
  const today = new Date();

  const [events, setEvents]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [currentDate, setCurrentDate]   = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay]   = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView]                 = useState('month'); // 'month' | 'list'
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType]     = useState('all');

  const eventTypes = ['Workshop', 'Exhibition', 'Festival', 'Competition', 'Training', 'Other'];

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await eventAPI.getProvinceEvents({ limit: 100000 });
      if (res.data.success) setEvents(res.data.data || []);
    } catch (err) {
      console.error('Calendar fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /* filtered events */
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (filterStatus !== 'all' && e.status !== filterStatus) return false;
      if (filterType   !== 'all' && e.eventType !== filterType)  return false;
      return true;
    });
  }, [events, filterStatus, filterType]);

  /*calendar days*/
  const { calendarDays, monthStart, monthEnd } = useMemo(() => {
    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const mStart = new Date(year, month, 1);
    const mEnd   = new Date(year, month + 1, 0);

    // fill leading days from previous month
    const startPad = mStart.getDay();
    const days = [];
    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, inMonth: false });
    }
    for (let d = 1; d <= mEnd.getDate(); d++) {
      days.push({ date: new Date(year, month, d), inMonth: true });
    }
    // Fill trailing days
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(year, month + 1, d), inMonth: false });
    }
    return { calendarDays: days, monthStart: mStart, monthEnd: mEnd };
  }, [currentDate]);

  /* events for a specific day */
  const eventsForDay = (day) =>
    filteredEvents.filter(e => eventSpansDay(e, day));

  /* selected day events */
  const selectedDayEvents = useMemo(() =>
    selectedDay ? eventsForDay(selectedDay) : [],
    [selectedDay, filteredEvents]
  );

  /* upcoming events */
  const upcomingEvents = useMemo(() => {
    const now = new Date(); now.setHours(0,0,0,0);
    return [...filteredEvents]
      .filter(e => new Date(e.startDate) >= now)
      .sort((a,b) => new Date(a.startDate) - new Date(b.startDate));
  }, [filteredEvents]);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday   = () => { setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(today); };

  const handleEventClick = (event) => { setSelectedEvent(event); };

  /*counts per day for legend */
  const dayCounts = useMemo(() => {
    const map = {};
    filteredEvents.forEach(e => {
      calendarDays.forEach(({ date, inMonth }) => {
        if (inMonth && eventSpansDay(e, date)) {
          const key = date.toDateString();
          map[key] = (map[key] || 0) + 1;
        }
      });
    });
    return map;
  }, [filteredEvents, calendarDays]);

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* navigation */}
        <div className="flex items-center gap-2">
          <button onClick={prevMonth}
            className="p-2 rounded-lg border-2 border-[#8DAA91]/30 text-[#8DAA91] hover:bg-[#8DAA91]/10 transition-colors">
            <ChevronLeft size={18}/>
          </button>
          <h2 className="text-xl font-bold text-[#4A3F35] min-w-[180px] text-center">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={nextMonth}
            className="p-2 rounded-lg border-2 border-[#8DAA91]/30 text-[#8DAA91] hover:bg-[#8DAA91]/10 transition-colors">
            <ChevronRight size={18}/>
          </button>
          <button onClick={goToday}
            className="ml-2 px-3 py-1.5 text-sm font-semibold border-2 border-[#8DAA91] text-[#8DAA91] rounded-lg hover:bg-[#8DAA91]/10 transition-colors">
            Today
          </button>
        </div>

        {/* filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="text-sm px-3 py-2 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91] text-[#4A3F35]">
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
              <option key={val} value={val}>{cfg.label}</option>
            ))}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="text-sm px-3 py-2 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91] text-[#4A3F35]">
            <option value="all">All Types</option>
            {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={fetchEvents}
            className="p-2 rounded-lg border-2 border-[#8DAA91]/20 text-[#8DAA91] hover:bg-[#8DAA91]/10 transition-colors"
            title="Refresh">
            <RefreshCw size={16}/>
          </button>
          <div className="flex rounded-lg border-2 border-[#8DAA91]/30 overflow-hidden">
            {[{ key:'month', icon:<Layers size={15}/>, label:'Month' }, { key:'list', icon:<Calendar size={15}/>, label:'List' }].map(v => (
              <button key={v.key} onClick={() => setView(v.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  view === v.key ? 'bg-[#8DAA91] text-white' : 'text-[#8DAA91] hover:bg-[#8DAA91]/10'
                }`}>
                {v.icon}{v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* status legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(STATUS_CONFIG).map(([val, cfg]) => {
          const count = filteredEvents.filter(e => e.status === val).length;
          return (
            <button key={val}
              onClick={() => setFilterStatus(filterStatus === val ? 'all' : val)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
                filterStatus === val ? cfg.bg + ' ' + cfg.text + ' ring-2 ring-offset-1' : 'bg-gray-100 text-gray-500'
              }`}
              style={{ ringColor: cfg.dot }}>
              <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }}/>
              {cfg.label} ({count})
            </button>
          );
        })}
        <span className="text-xs text-[#2E2E2E]/40 ml-auto">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} shown
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8DAA91] border-t-transparent"/>
        </div>
      ) : view === 'month' ? (
        /*month view */
        <div className="relative">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/*day headers*/}
            <div className="grid grid-cols-7 bg-[#8DAA91]">
              {DAYS.map(d => (
                <div key={d} className="py-3 text-center text-xs font-bold text-white uppercase tracking-wider">{d}</div>
              ))}
            </div>

            {/* calendar grid */}
            <div className="grid grid-cols-7 border-l border-t border-[#8DAA91]/10">
              {calendarDays.map(({ date, inMonth }, idx) => {
                const isToday    = isSameDay(date, today);
                const isSelected = selectedDay && isSameDay(date, selectedDay);
                const dayEvents  = eventsForDay(date);
                const MAX_SHOW   = 3;

                return (
                  <div key={idx}
                    onClick={() => { setSelectedDay(date); setSelectedEvent(null); }}
                    className={`border-r border-b border-[#8DAA91]/10 min-h-[110px] p-1.5 cursor-pointer transition-colors ${
                      inMonth ? 'bg-white hover:bg-[#F0F8F1]/60' : 'bg-gray-50/50'
                    } ${isSelected ? 'bg-[#8DAA91]/10 ring-2 ring-inset ring-[#8DAA91]/40' : ''}`}>

                    {/* day number */}
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold mb-1 ${
                      isToday
                        ? 'bg-[#8DAA91] text-white'
                        : inMonth
                          ? 'text-[#4A3F35]'
                          : 'text-[#2E2E2E]/25'
                    }`}>
                      {date.getDate()}
                    </div>

                    {/* event pills */}
                    {dayEvents.slice(0, MAX_SHOW).map(ev => (
                      <EventPill key={ev._id} event={ev} onClick={handleEventClick}/>
                    ))}
                    {dayEvents.length > MAX_SHOW && (
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedDay(date); }}
                        className="text-xs text-[#8DAA91] font-semibold hover:underline pl-1">
                        +{dayEvents.length - MAX_SHOW} more
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* side panel */}
          {selectedDay && !selectedEvent && selectedDayEvents.length > 0 && (
            <div className="mt-4 bg-white rounded-2xl shadow-md p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-[#4A3F35] flex items-center gap-2">
                  <Calendar size={16} className="text-[#8DAA91]"/>
                  {selectedDay.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' })}
                  <span className="text-sm font-normal text-[#2E2E2E]/50">({selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? 's' : ''})</span>
                </h4>
                <button onClick={() => setSelectedDay(null)} className="text-[#2E2E2E]/40 hover:text-[#4A3F35]"><X size={16}/></button>
              </div>
              <div className="space-y-1">
                {selectedDayEvents.map(ev => (
                  <EventListRow key={ev._id} event={ev} onClick={handleEventClick}/>
                ))}
              </div>
            </div>
          )}

          {selectedDay && !selectedEvent && selectedDayEvents.length === 0 && (
            <div className="mt-4 bg-white rounded-2xl shadow-md p-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#2E2E2E]/50 text-sm">
                <Calendar size={16} className="text-[#8DAA91]"/>
                <span>No events on {selectedDay.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' })}</span>
              </div>
              <button onClick={() => setSelectedDay(null)} className="text-[#2E2E2E]/40 hover:text-[#4A3F35]"><X size={14}/></button>
            </div>
          )}

          {/* event detail panel */}
          {selectedEvent && (
            <div className="mt-4">
              <EventDetailPanel
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onEdit={(ev) => { setSelectedEvent(null); onEditEvent && onEditEvent(ev); }}
              />
            </div>
          )}
        </div>
      ) : (
        /*list view*/
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {upcomingEvents.length === 0 ? (
            <div className="py-20 text-center">
              <Calendar size={48} className="text-[#2E2E2E]/20 mx-auto mb-3"/>
              <p className="text-[#2E2E2E]/50 font-semibold">No upcoming events</p>
              <p className="text-[#2E2E2E]/30 text-sm mt-1">Adjust filters to see more events</p>
            </div>
          ) : (
            <div>
              {/* group by month */}
              {(() => {
                const groups = {};
                upcomingEvents.forEach(ev => {
                  const d = new Date(ev.startDate);
                  const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
                  if (!groups[key]) groups[key] = [];
                  groups[key].push(ev);
                });
                return Object.entries(groups).map(([month, evs]) => (
                  <div key={month}>
                    <div className="px-5 py-2.5 bg-[#F0F8F1] border-b border-[#8DAA91]/10">
                      <p className="text-xs font-bold text-[#8DAA91] uppercase tracking-widest">{month}</p>
                    </div>
                    <div className="divide-y divide-[#8DAA91]/10">
                      {evs.map(ev => (
                        <div key={ev._id} className="px-3">
                          <EventListRow event={ev} onClick={handleEventClick}/>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

          {/* event detail panel inline for list view */}
          {selectedEvent && (
            <div className="border-t border-[#8DAA91]/20 p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-[#4A3F35] flex items-center gap-2">
                  <Eye size={16} className="text-[#8DAA91]"/>Event Details
                </h4>
                <button onClick={() => setSelectedEvent(null)} className="text-[#2E2E2E]/40 hover:text-[#4A3F35]"><X size={16}/></button>
              </div>
              <div className="bg-[#F0F8F1] rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h5 className="font-bold text-[#4A3F35]">{selectedEvent.title}</h5>
                    <p className="text-xs text-[#2E2E2E]/50 mt-0.5">{selectedEvent.eventType}</p>
                  </div>
                  <StatusBadge status={selectedEvent.status}/>
                </div>
                <p className="text-sm text-[#2E2E2E]/70 leading-relaxed line-clamp-3">{selectedEvent.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#2E2E2E]/60">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={11} className="text-[#8DAA91]"/>
                    {new Date(selectedEvent.startDate).toLocaleDateString('en-GB')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={11} className="text-[#8DAA91]"/>
                    {selectedEvent.location?.venue || 'TBA'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={11} className="text-[#8DAA91]"/>
                    {selectedEvent.participants?.filter(p=>p.status==='registered').length || 0} registered
                  </span>
                  {selectedEvent.startTime && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} className="text-[#8DAA91]"/>
                      {selectedEvent.startTime}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setSelectedEvent(null); onEditEvent && onEditEvent(selectedEvent); }}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                  <Edit2 size={13}/> Edit Event
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* event type legend */}
      <div className="flex items-center gap-3 flex-wrap pt-1">
        <span className="text-xs text-[#2E2E2E]/40 font-medium">Event types:</span>
        {Object.entries(EVENT_TYPE_COLORS).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1 text-xs"
            style={{ color }}>
            <span className="w-2 h-2 rounded-sm" style={{ background: color + '44', border: `1px solid ${color}` }}/>
            {type}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default EventCalendar;