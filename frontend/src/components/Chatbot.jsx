import { useState, useRef, useEffect } from 'react';
import {
  RiCloseLine, RiSendPlane2Line, RiImageAddLine,
  RiDeleteBin6Line, RiUserLine, RiLeafLine,
  RiShoppingBagLine, RiCalendarEventLine,
  RiUserAddLine, RiBookOpenLine, RiInformationLine,
  RiLoader4Line, RiArrowRightLine, RiPhoneLine,
} from 'react-icons/ri';
import api from '../services/api';

const SUGGESTIONS = [
  { icon: RiLeafLine,          text: 'What folk arts are in Sri Lanka?' },
  { icon: RiShoppingBagLine,   text: 'Show marketplace items'           },
  { icon: RiCalendarEventLine, text: 'Upcoming events'                  },
  { icon: RiUserAddLine,       text: 'How to register as artist?'       },
  { icon: RiBookOpenLine,      text: 'Available courses'                },
  { icon: RiInformationLine,   text: 'About FolkFusion'                 },
];

/*markdown-lite renderer*/
const renderText = (text) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('## '))
      return <p key={i} className="font-semibold text-[#F4EDE4] mt-2 mb-1 text-sm">{line.slice(3)}</p>;
    if (line.startsWith('# '))
      return <p key={i} className="font-bold text-[#F4EDE4] mt-2 mb-1">{line.slice(2)}</p>;
    if (line.startsWith('- ') || line.startsWith('• '))
      return (
        <div key={i} className="flex gap-1.5 pl-1">
          <span className="text-[#C48A6A] mt-0.5 flex-shrink-0">•</span>
          <p>{line.slice(2)}</p>
        </div>
      );
    if (line === '') return <br key={i} />;
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i}>
        {parts.map((p, j) =>
          p.startsWith('**') && p.endsWith('**')
            ? <strong key={j} className="text-[#C48A6A]">{p.slice(2, -2)}</strong>
            : p
        )}
      </p>
    );
  });
};

/* user info form */
const UserInfoForm = ({ onSubmit }) => {
  const [name,    setName]    = useState('');
  const [contact, setContact] = useState('');
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim())                              e.name    = 'Name is required';
    if (!contact.trim())                           e.contact = 'Contact number is required';
    else if (!/^[0-9+\s\-]{7,15}$/.test(contact)) e.contact = 'Enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (validate()) onSubmit(name.trim(), contact.trim());
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F9F6F1]">
      {/* avatar */}
      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#C48A6A] shadow-lg mb-4">
        <img src="/images/chatbot.jpg" alt="Chatbot" className="w-full h-full object-cover" />
      </div>

      <h3 className="font-bold text-[#4A3F35] text-lg mb-1 text-center">ආයුබෝවන්! Welcome!</h3>
      <p className="text-[#9A8880] text-xs text-center mb-6 leading-relaxed">
        Before we begin, please share your name and contact number so we can assist you better.
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {/* name */}
        <div>
          <label className="block text-xs font-semibold text-[#6B4423] mb-1.5 uppercase tracking-wide">
            Your Name
          </label>
          <div className="relative">
            <RiUserLine
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C48A6A]"
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kamal Perera"
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border-2 text-sm text-[#4A3F35] bg-white focus:outline-none transition-colors
                ${errors.name ? 'border-red-400 focus:border-red-500' : 'border-[#C48A6A]/40 focus:border-[#C48A6A]'}`}
            />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Contact */}
        <div>
          <label className="block text-xs font-semibold text-[#6B4423] mb-1.5 uppercase tracking-wide">
            Contact Number
          </label>
          <div className="relative">
            <RiPhoneLine
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C48A6A]"
            />
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. 077 123 4567"
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border-2 text-sm text-[#4A3F35] bg-white focus:outline-none transition-colors
                ${errors.contact ? 'border-red-400 focus:border-red-500' : 'border-[#C48A6A]/40 focus:border-[#C48A6A]'}`}
            />
          </div>
          {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#6B4423] hover:bg-[#4A3F35] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          Start Chatting <RiArrowRightLine size={16} />
        </button>
      </form>

      <p className="text-[10px] text-[#9A8880] mt-4 text-center">
        🔒 Your info is only used to improve your experience
      </p>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN CHATBOT COMPONENT
══════════════════════════════════════════ */
const Chatbot = () => {
  const [isOpen,       setIsOpen]       = useState(false);
  const [userInfoDone, setUserInfoDone] = useState(false);
  const [userName,     setUserName]     = useState('');
  const [userContact,  setUserContact]  = useState('');
  const [sessionId,    setSessionId]    = useState(null);   // ← persisted across messages
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [imageB64,     setImageB64]     = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showChips,    setShowChips]    = useState(true);

  const bottomRef = useRef(null);
  const fileRef   = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* collect user info, then start chat */
  const handleUserInfoSubmit = (name, contact) => {
    setUserName(name);
    setUserContact(contact);
    setUserInfoDone(true);
    setMessages([
      {
        id: 1, role: 'assistant',
        content: `ආයුබෝවන් ${name}! 🙏 Welcome to FolkFusion. I can help you explore Sri Lankan folk art, find artists, browse our marketplace, and navigate the platform. How can I assist you today?`,
      },
    ]);
  };

  /* Pick image  */
  const handleImagePick = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageB64(e.target.result);
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  /*  Send message */
  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content && !imageB64) return;
    setShowChips(false);

    const userMsg = { id: Date.now(), role: 'user', content, image: imagePreview };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setImageB64(null);
    setImagePreview(null);
    setLoading(true);

    try {
      const payload = {
        sessionId: sessionId || undefined,  
        name:      !sessionId ? userName    : undefined,
        contact:   !sessionId ? userContact : undefined,
        message:   content,
        image:     imagePreview || undefined,
      };

      const res = await api.post('/chat', payload);

      if (res.data?.success) {
        // Persist the sessionId returned by backend
        if (res.data.sessionId) setSessionId(res.data.sessionId);

        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, role: 'assistant', content: res.data.reply },
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1, role: 'assistant',
          content: "Sorry, I'm having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /*clear chat (keep user info & session) */
  const clearChat = () => {
    setMessages([{
      id: Date.now(), role: 'assistant',
      content: `Chat cleared${userName ? `, ${userName}` : ''}. How can I help you?`,
    }]);
    setShowChips(true);
  };

  return (
    <>
      {/* trigger button*/}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center z-50 bg-[#6B4423] border-[3px] border-[#C48A6A]"
        aria-label="Open Chatbot"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img src="/images/chatbot.jpg" alt="Chatbot" className="w-full h-full object-cover" />
        </div>
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-red-600 text-white border-2 border-white">
          1
        </span>
      </button>

      {/*cChat panel*/}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-end p-4 sm:p-6">
          <div className="absolute inset-0 bg-transparent" onClick={() => setIsOpen(false)} />

          <div className="relative rounded-2xl shadow-2xl overflow-hidden w-full max-w-[400px] h-[600px] sm:h-[640px] bg-[#F4EDE4] mb-20 flex flex-col">

            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b-2 border-[#C48A6A] bg-gradient-to-br from-[#6B4423] to-[#4A3F35] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
                  <img src="/images/chatbot.jpg" alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold font-heading text-sm tracking-wide" style={{ color: '#ffffff' }}>FolkFusion Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-xs text-[#C48A6A]">
                      {userName ? `Hi, ${userName} · Online` : 'AI Powered · Online'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {userInfoDone && (
                  <button onClick={clearChat} title="Clear chat"
                    className="text-white/60 hover:text-white transition-colors p-1">
                    <RiDeleteBin6Line size={17} />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)}
                  className="text-white hover:text-red-400 transition-colors">
                  <RiCloseLine size={22} />
                </button>
              </div>
            </div>

            {/* body-either user-info form OR chat messages*/}
            {!userInfoDone ? (
              <UserInfoForm onSubmit={handleUserInfoSubmit} />
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9F6F1]">
                  {messages.map((msg) => (
                    <div key={msg.id}
                      className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-1 border border-[#C48A6A]/30">
                          <img src="/images/chatbot.jpg" alt="" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {msg.image && (
                          <div className="rounded-xl overflow-hidden max-w-[180px] border border-[#C48A6A]/30">
                            <img src={msg.image} alt="Uploaded" className="w-full object-cover" />
                          </div>
                        )}
                        {msg.content && (
                          <div className={`px-4 py-2.5 text-sm font-body leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-[#C48A6A] text-[#F4EDE4] rounded-[20px_20px_4px_20px]'
                              : 'bg-[#6B4423] text-[#F4EDE4] rounded-[20px_20px_20px_4px]'
                          }`}>
                            {msg.role === 'assistant' ? renderText(msg.content) : msg.content}
                          </div>
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-[#C48A6A] flex items-center justify-center flex-shrink-0 mt-1">
                          <RiUserLine size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading dots */}
                  {loading && (
                    <div className="flex gap-2 justify-start">
                      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-1 border border-[#C48A6A]/30">
                        <img src="/images/chatbot.jpg" alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="bg-[#6B4423] rounded-[20px_20px_20px_4px] px-4 py-3 flex items-center gap-1.5">
                        {[0, 150, 300].map((delay) => (
                          <div key={delay}
                            className="w-2 h-2 rounded-full bg-[#C48A6A] animate-bounce"
                            style={{ animationDelay: `${delay}ms` }} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestion chips */}
                  {showChips && messages.length <= 2 && !loading && (
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] text-[#9A8880] font-body text-center uppercase tracking-wider">
                        Quick questions
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {SUGGESTIONS.map((s, i) => (
                          <button key={i} onClick={() => sendMessage(s.text)}
                            className="flex items-center gap-1.5 text-[11px] font-body px-3 py-1.5 rounded-full bg-white border border-[#C48A6A]/30 text-[#6B4423] hover:bg-[#C48A6A]/10 hover:border-[#C48A6A] transition-colors">
                            <s.icon size={12} className="text-[#C48A6A] flex-shrink-0" />
                            {s.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>

                {/* Image preview */}
                {imagePreview && (
                  <div className="px-4 py-2 bg-[#F4EDE4] border-t border-[#C48A6A]/20 flex items-center gap-2 flex-shrink-0">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#C48A6A]/30">
                      <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setImageB64(null); setImagePreview(null); }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center">
                        <RiCloseLine size={10} />
                      </button>
                    </div>
                    <p className="text-xs font-body text-[#9A8880]">Image ready to send</p>
                  </div>
                )}

                {/* Input */}
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  className="flex-shrink-0 p-3 border-t border-[#C48A6A]/30 bg-[#F4EDE4]"
                >
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[#C48A6A] hover:bg-[#C48A6A]/10 transition-colors flex-shrink-0"
                      title="Upload image">
                      <RiImageAddLine size={18} />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { handleImagePick(e.target.files[0]); e.target.value = ''; }} />

                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about folk art, artists, events…"
                      disabled={loading}
                      className="flex-1 px-4 py-2 rounded-full border-2 border-[#C48A6A]/40 focus:border-[#C48A6A] focus:outline-none bg-white text-[#4A3F35] font-body text-sm disabled:opacity-50 transition-colors"
                    />

                    <button type="submit"
                      disabled={loading || (!input.trim() && !imageB64)}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-[#C48A6A] hover:bg-[#6B4423] disabled:opacity-40 transition-all flex-shrink-0">
                      {loading
                        ? <RiLoader4Line size={16} className="text-white animate-spin" />
                        : <RiSendPlane2Line size={16} className="text-white" />
                      }
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;