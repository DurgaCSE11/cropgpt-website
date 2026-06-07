import React, { useState, useEffect, useRef } from 'react';
import { askGemini } from '../geminiService';

export default function AiChatPanel({ language }) {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! Ask me about farming, crops, or schemes.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Translate chatbot greeting on language change
  useEffect(() => {
    const greetings = {
      English: 'Hello! Ask me about farming, crops, or schemes.',
      Hindi: 'नमस्ते! मुझसे खेती, फसलों या योजनाओं के बारे में पूछें।',
      Odia: 'ନମସ୍କାର! ମତେ ଚାଷ, ଫସଲ କିମ୍ବା ଯୋଜନା ବିଷୟରେ ପଚାରନ୍ତୁ।'
    };
    setMessages([{ sender: 'ai', text: greetings[language] || greetings.English }]);
  }, [language]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');
    setLoading(true);

    // Add loading placeholder message
    setMessages(prev => [...prev, { sender: 'ai', text: '...' }]);

    const response = await askGemini(userMsg, language);

    setMessages(prev => {
      const filtered = prev.slice(0, -1); // remove placeholder
      return [...filtered, { sender: 'ai', text: response }];
    });
    setLoading(false);
  };

  return (
    <div className="chats-section neon-border" style={{ marginTop: '20px', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="chats-header">
        <h2>🛰️ CropGPT AI Copilot</h2>
      </div>
      
      <div 
        id="aiChatWindow" 
        style={{ 
          height: '250px', 
          overflowY: 'auto', 
          padding: '10px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px' 
        }}
      >
        {messages.map((m, idx) => (
          <div 
            key={idx} 
            className={`chat-message ${m.sender}`}
            style={{
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '75%'
            }}
          >
            {m.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form id="aiChatForm" onSubmit={handleSendChat} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <input 
          type="text" 
          className="ai-input" 
          placeholder={language === 'Odia' ? 'ପଚାରନ୍ତୁ...' : language === 'Hindi' ? 'पूछें...' : 'Ask AI anything about your farm...'} 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
          style={{ flexGrow: 1 }}
        />
        <button 
          type="submit" 
          className="voice-btn" 
          title="Send"
          disabled={loading}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
}
