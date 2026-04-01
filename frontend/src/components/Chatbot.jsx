import { useState } from 'react';
import { X, Send } from 'lucide-react';

const Chatbot = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! Welcome to FolkFusion. How can I help you today?", sender: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputMessage,
        sender: 'user'
      };
      setMessages([...messages, newMessage]);
      setInputMessage('');

      setTimeout(() => {
        const botResponse = {
          id: messages.length + 2,
          text: "Thank you for your message. Our team will assist you shortly!",
          sender: 'bot'
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  return (
    <>
      {/* floating trigger button */}
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center z-50 bg-[#6B4423] border-[3px] border-[#C48A6A]"
        aria-label="Open Chatbot"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
          <img
            src="/images/chatbot.jpg"
            alt="Chatbot"
            className="w-full h-full object-cover"
          />
        </div>

        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-red-600 text-white border-2 border-white">
          1
        </span>
      </button>

      {/* chat panel */}
      {isChatbotOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-end p-6">

          {/* backdrop */}
          <div
            className="absolute inset-0 bg-transparent"
            onClick={() => setIsChatbotOpen(false)}
          />

          {/* chat panel */}
          <div className="relative rounded-2xl shadow-2xl overflow-hidden w-[400px] h-[600px] bg-[#F4EDE4] mb-20">

            {/* header */}
            <div className="p-4 flex items-center justify-between border-b-2 border-[#C48A6A] bg-gradient-to-br from-[#6B4423] to-[#4A3F35]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                  <img
                    src="/images/chatbot.jpg"
                    alt="Chatbot"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white font-heading text-sm">
                    FolkFusion Assistant
                  </h3>
                  <p className="text-xs text-[#C48A6A]">Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatbotOpen(false)}
                className="text-white hover:text-red-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* messages area */}
            <div className="p-4 overflow-y-auto bg-[#F9F6F1]" style={{ height: 'calc(100% - 140px)' }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 font-body text-[0.9rem] text-[#F4EDE4] ${
                      message.sender === 'user'
                        ? 'bg-[#C48A6A] rounded-[20px_20px_4px_20px]'
                        : 'bg-[#6B4423] rounded-[20px_20px_20px_4px]'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            {/* input form */}
            <form
              onSubmit={handleSendMessage}
              className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#C48A6A] bg-[#F4EDE4]"
            >
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 rounded-full border-2 border-[#C48A6A] focus:outline-none bg-white text-[#4A3F35] font-body text-sm"
                />
                <button
                  type="submit"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 bg-[#C48A6A] hover:bg-[#6B4423]"
                >
                  <Send size={18} className="text-[#F4EDE4]" />
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;