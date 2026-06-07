import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { askGemini } from '../geminiService';

export default function Sidebar({ user, profileName, onOpenLogin, onOpenSignup, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! Ask me about farming, crops, or schemes.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleToggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const handleCloseDropdown = () => setDropdownOpen(false);
    window.addEventListener('click', handleCloseDropdown);
    return () => window.removeEventListener('click', handleCloseDropdown);
  }, []);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');
    setLoading(true);

    // Add placeholder AI message
    setMessages(prev => [...prev, { sender: 'ai', text: '...' }]);

    const response = await askGemini(userMsg);

    setMessages(prev => {
      const filtered = prev.slice(0, -1); // remove placeholder
      return [...filtered, { sender: 'ai', text: response }];
    });
    setLoading(false);
  };

  return (
    <aside className="left-sidebar neon-border">
      <div className={`profile-container ${dropdownOpen ? 'open' : ''}`}>
        <div 
          id="profileTrigger" 
          className="profile-section neon-border"
          onClick={handleToggleDropdown}
        >
          <i className="fas fa-user-circle profile-icon"></i>
          <span>{user ? (profileName || 'Farmer') : 'Profile'}</span>
          <i className="fas fa-chevron-down dropdown-arrow"></i>
        </div>
        
        <div className={`profile-dropdown ${dropdownOpen ? 'show' : ''}`}>
          {user ? (
            <a 
              href="#" 
              className="dropdown-item" 
              onClick={(e) => { e.preventDefault(); onLogout(); }}
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </a>
          ) : (
            <>
              <a 
                href="#" 
                id="loginBtn" 
                className="dropdown-item"
                onClick={(e) => { e.preventDefault(); onOpenLogin(); }}
              >
                <i className="fas fa-sign-in-alt"></i> Login
              </a>
              <a 
                href="#" 
                id="signupBtn" 
                className="dropdown-item"
                onClick={(e) => { e.preventDefault(); onOpenSignup(); }}
              >
                <i className="fas fa-user-plus"></i> Sign Up
              </a>
            </>
          )}
        </div>
      </div>
      
      <div className="chats-section">
        <div className="chats-header">
          <h2>AI Chat</h2>
        </div>
        <div id="aiChatWindow">
          {messages.map((m, idx) => (
            <div key={idx} className={`chat-message ${m.sender}`}>
              {m.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form id="aiChatForm" className="ai-input-area" onSubmit={handleSendChat}>
          <input 
            type="text" 
            id="ai-input" 
            className="ai-input" 
            placeholder="Ask AI...." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
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
    </aside>
  );
}
