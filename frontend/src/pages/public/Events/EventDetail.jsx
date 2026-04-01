import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Clock, MapPin, ArrowLeft, Calendar, Users, Share2, Facebook, 
  Twitter, Linkedin, Copy, Check, DollarSign, Mail, Phone, Tag,
  AlertCircle, CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchEventDetail();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      setLoading(true);
      console.log('Fetching event with ID:', id);
      console.log('API URL:', `/api/events/${id}`);
      
      const response = await axios.get(`/api/events/${id}`);
      
      console.log('Event response:', response.data);
      
      if (response.data.success) {
        setEvent(response.data.data);
       
        if (user?.role === 'artist' && response.data.data.participants) {
          setIsRegistered(false); 
        }
 
        fetchRelatedEvents(response.data.data.eventType);
      }
    } catch (error) {
      console.error('Error fetching event:');
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedEvents = async (eventType) => {
    try {
      const response = await axios.get('/api/events', { 
        params: { eventType, limit: 3 } 
      });
      if (response.data.success) {

        const filtered = response.data.data.filter(item => item._id !== id);
        setRelatedEvents(filtered.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching related events:', error);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'artist') {
      alert('Only artists can register for events');
      return;
    }

    try {
      setRegistering(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/events/${id}/register`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('Successfully registered for the event!');
        setIsRegistered(true);
        fetchEventDetail(); 
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.response?.data?.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = event.title;
    const text = event.description;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank', 'width=600,height=400');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      default:
        if (navigator.share) {
          navigator.share({ title, text, url }).catch(err => console.log('Error sharing:', err));
        }
    }
    setShowShareMenu(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-[#8DAA91]';
      case 'ongoing':
        return 'bg-[#5F8B8C]';
      case 'completed':
        return 'bg-[#A67C52]';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const canRegister = () => {
    if (!event) return false;
    if (event.status === 'completed' || event.status === 'cancelled') return false;
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) return false;
    if (event.capacity > 0 && event.participants?.length >= event.capacity) return false;
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EDE4] pt-32">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#A67C52]"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EDE4] pt-32">
        <div className="text-center max-w-md mx-auto px-4">
          <Calendar size={64} className="mx-auto text-[#A67C52] mb-4" />
          <h2 className="text-2xl font-bold text-[#4A3F35] mb-4">Event Not Found</h2>
          <p className="text-[#2E2E2E]/70 mb-6">
            The event you're looking for doesn't exist or may have been removed.
          </p>
          <Link 
            to="/events" 
            className="inline-flex items-center px-6 py-3 bg-[#A67C52] text-white rounded-lg hover:bg-[#C48A6A] transition-all"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EDE4]">
 
      <article className="py-12 pt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-6 flex items-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/events')}
              className="flex items-center text-[#2E2E2E] hover:text-[#A67C52] transition-colors font-medium"
            >
              <ArrowLeft size={20} className="mr-2" />
              <span>Back to Events</span>
            </button>
            <span className="inline-block px-4 py-2 bg-[#8DAA91] text-white text-sm font-semibold rounded-full">
              {event.eventType}
            </span>
            <span className={`inline-block px-4 py-2 text-white text-sm font-semibold rounded-full ${getStatusColor(event.status)}`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
          </div>

          {/* Event Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-[#4A3F35] mb-6 leading-tight">
            {event.title}
          </h1>


          <div className="flex flex-wrap items-center gap-6 text-[#2E2E2E]/70 mb-8 pb-8 border-b border-[#8DAA91]/20">
            <div className="flex items-center">
              <Calendar size={18} className="mr-2 text-[#5F8B8C]" />
              <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
            </div>
            {event.startTime && (
              <div className="flex items-center">
                <Clock size={18} className="mr-2 text-[#5F8B8C]" />
                <span>{event.startTime} - {event.endTime}</span>
              </div>
            )}
            {event.location?.venue && (
              <div className="flex items-center">
                <MapPin size={18} className="mr-2 text-[#5F8B8C]" />
                <span>{event.location.venue}</span>
              </div>
            )}
            {event.capacity > 0 && (
              <div className="flex items-center">
                <Users size={18} className="mr-2 text-[#5F8B8C]" />
                <span>{event.participants?.length || 0} / {event.capacity}</span>
              </div>
            )}
            
            <div className="relative ml-auto">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center px-4 py-2 bg-[#A67C52] text-white rounded-lg hover:bg-[#C48A6A] transition-all shadow-md"
              >
                <Share2 size={18} className="mr-2" />
                Share
              </button>

              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-[#8DAA91]/20 z-50 overflow-hidden">
                  <div className="p-2">
                    <button onClick={() => handleShare('facebook')} className="w-full flex items-center px-4 py-3 hover:bg-[#F4EDE4] rounded-lg transition-all group">
                      <div className="w-8 h-8 flex items-center justify-center bg-[#1877F2] rounded-full mr-3">
                        <Facebook size={16} className="text-white" fill="white" />
                      </div>
                      <span className="text-[#2E2E2E] group-hover:text-[#A67C52]">Share on Facebook</span>
                    </button>
                    <button onClick={() => handleShare('twitter')} className="w-full flex items-center px-4 py-3 hover:bg-[#F4EDE4] rounded-lg transition-all group">
                      <div className="w-8 h-8 flex items-center justify-center bg-[#1DA1F2] rounded-full mr-3">
                        <Twitter size={16} className="text-white" fill="white" />
                      </div>
                      <span className="text-[#2E2E2E] group-hover:text-[#A67C52]">Share on Twitter</span>
                    </button>
                    <button onClick={() => handleShare('linkedin')} className="w-full flex items-center px-4 py-3 hover:bg-[#F4EDE4] rounded-lg transition-all group">
                      <div className="w-8 h-8 flex items-center justify-center bg-[#0A66C2] rounded-full mr-3">
                        <Linkedin size={16} className="text-white" fill="white" />
                      </div>
                      <span className="text-[#2E2E2E] group-hover:text-[#A67C52]">Share on LinkedIn</span>
                    </button>
                    <button onClick={() => handleShare('whatsapp')} className="w-full flex items-center px-4 py-3 hover:bg-[#F4EDE4] rounded-lg transition-all group">
                      <div className="w-8 h-8 flex items-center justify-center bg-[#25D366] rounded-full mr-3">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </div>
                      <span className="text-[#2E2E2E] group-hover:text-[#A67C52]">Share on WhatsApp</span>
                    </button>
                    <div className="my-2 border-t border-[#8DAA91]/20"></div>
                    <button onClick={() => handleShare('copy')} className="w-full flex items-center px-4 py-3 hover:bg-[#F4EDE4] rounded-lg transition-all group">
                      <div className="w-8 h-8 flex items-center justify-center bg-[#5F8B8C] rounded-full mr-3">
                        {copied ? <Check size={16} className="text-white" /> : <Copy size={16} className="text-white" />}
                      </div>
                      <span className="text-[#2E2E2E] group-hover:text-[#A67C52]">{copied ? 'Link Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {event.coverImage?.url && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={event.coverImage.url}
                alt={event.title}
                className="w-full h-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {user?.role === 'artist' && canRegister() && (
            <div className="mb-8 p-6 bg-white rounded-xl shadow-md border-2 border-[#8DAA91]/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#4A3F35] mb-1">Interested in participating?</h3>
                  <p className="text-[#2E2E2E]/70 text-sm">Register now to secure your spot!</p>
                </div>
                <button
                  onClick={handleRegister}
                  disabled={registering || isRegistered}
                  className="px-6 py-3 bg-[#A67C52] text-white rounded-lg hover:bg-[#C48A6A] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isRegistered ? (
                    <>
                      <CheckCircle size={20} />
                      Registered
                    </>
                  ) : registering ? (
                    'Registering...'
                  ) : (
                    'Register Now'
                  )}
                </button>
              </div>
            </div>
          )}

          {!canRegister() && event.status !== 'completed' && (
            <div className="mb-8 p-6 bg-[#A67C52]/10 rounded-xl border-2 border-[#A67C52]/30 flex items-start gap-3">
              <AlertCircle size={24} className="text-[#A67C52] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-[#4A3F35] mb-1">Registration Closed</h3>
                <p className="text-[#2E2E2E]/70 text-sm">
                  {event.capacity > 0 && event.participants?.length >= event.capacity
                    ? 'This event has reached maximum capacity.'
                    : 'The registration deadline for this event has passed.'}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white border-l-4 border-[#A67C52] p-6 rounded-r-xl mb-8 shadow-md">
            <h2 className="text-2xl font-bold text-[#4A3F35] mb-4">About This Event</h2>
            <div className="text-[#2E2E2E]/90 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            {event.location && (
              <div className="bg-white p-6 rounded-xl shadow-md border border-[#8DAA91]/20">
                <h3 className="text-lg font-bold text-[#4A3F35] mb-4 flex items-center">
                  <MapPin size={20} className="mr-2 text-[#5F8B8C]" />
                  Location
                </h3>
                <div className="space-y-2 text-[#2E2E2E]/80">
                  <p><span className="font-medium">Venue:</span> {event.location.venue}</p>
                  {event.location.address && <p><span className="font-medium">Address:</span> {event.location.address}</p>}
                  {event.location.district && <p><span className="font-medium">District:</span> {event.location.district}</p>}
                  <p><span className="font-medium">Province:</span> {event.province}</p>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-md border border-[#8DAA91]/20">
              <h3 className="text-lg font-bold text-[#4A3F35] mb-4 flex items-center">
                <Users size={20} className="mr-2 text-[#5F8B8C]" />
                Registration Info
              </h3>
              <div className="space-y-2 text-[#2E2E2E]/80">
                {event.registrationDeadline && (
                  <p><span className="font-medium">Deadline:</span> {formatDate(event.registrationDeadline)}</p>
                )}
                {event.capacity > 0 && (
                  <p><span className="font-medium">Capacity:</span> {event.capacity} participants</p>
                )}
                <p><span className="font-medium">Registered:</span> {event.participants?.length || 0}</p>
                {event.fees?.amount > 0 && (
                  <p className="flex items-center">
                    <DollarSign size={16} className="mr-1" />
                    <span className="font-medium">Fee:</span> {event.fees.currency} {event.fees.amount}
                  </p>
                )}
              </div>
            </div>
          </div>

          {event.categories && event.categories.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-md border border-[#8DAA91]/20 mb-8">
              <h3 className="text-lg font-bold text-[#4A3F35] mb-4 flex items-center">
                <Tag size={20} className="mr-2 text-[#5F8B8C]" />
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.categories.map((category, index) => (
                  <span key={index} className="px-3 py-1 bg-[#8DAA91]/10 text-[#5F8B8C] rounded-full text-sm font-medium">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {event.contactInfo && (
            <div className="bg-white p-6 rounded-xl shadow-md border border-[#8DAA91]/20 mb-8">
              <h3 className="text-lg font-bold text-[#4A3F35] mb-4">Contact Information</h3>
              <div className="space-y-2 text-[#2E2E2E]/80">
                {event.contactInfo.email && (
                  <p className="flex items-center">
                    <Mail size={16} className="mr-2 text-[#5F8B8C]" />
                    {event.contactInfo.email}
                  </p>
                )}
                {event.contactInfo.phone && (
                  <p className="flex items-center">
                    <Phone size={16} className="mr-2 text-[#5F8B8C]" />
                    {event.contactInfo.phone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </article>

      {relatedEvents.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#4A3F35] mb-8">Related Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedEvents.map((item) => (
                <Link
                  key={item._id}
                  to={`/events/${item._id}`}
                  className="group bg-[#F4EDE4] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.coverImage?.url || '/images/event-placeholder.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(135deg, #A67C52 0%, #C48A6A 100%)';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-block px-3 py-1 bg-[#8DAA91] text-white text-xs font-semibold rounded-full">
                        {item.eventType}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-[#4A3F35] mb-2 line-clamp-2 group-hover:text-[#A67C52] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[#2E2E2E]/70 text-sm line-clamp-2 mb-3">
                      {item.description}
                    </p>
                    <div className="flex items-center text-sm text-[#2E2E2E]/60">
                      <Calendar size={14} className="mr-1 text-[#5F8B8C]" />
                      {formatDate(item.startDate)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {showShareMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowShareMenu(false)}
        ></div>
      )}
    </div>
  );
};

export default EventDetail;