import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardGrid from './components/DashboardGrid';
import MarketSidebar from './components/MarketSidebar';
import AiChatPanel from './components/AiChatPanel';

// Modals
import AuthModal from './components/Modals/AuthModal';
import WeatherModal from './components/Modals/WeatherModal';
import FinanceModal from './components/Modals/FinanceModal';
import CropModal from './components/Modals/CropModal';
import SchemesModal from './components/Modals/SchemesModal';
import CommunityModal from './components/Modals/CommunityModal';
import FarmKartModal from './components/Modals/FarmKartModal';
import NotificationsModal from './components/Modals/NotificationsModal';
import AboutModal from './components/Modals/AboutModal';
import AdminCockpitModal from './components/Modals/AdminCockpitModal';

import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  
  // Global Language selection
  const [language, setLanguage] = useState('English');

  // Modal states
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [adminCockpitOpen, setAdminCockpitOpen] = useState(false);
  
  const [weatherOpen, setWeatherOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [schemesOpen, setSchemesOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [farmKartOpen, setFarmKartOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Notification count
  const [unreadNotifications, setUnreadNotifications] = useState(2); // Mock alerts unread count

  useEffect(() => {
    // 1. Fetch active admin session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      if (currentUser && currentUser.email === 'durgaprasadmahapatra21@gmail.com') {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    // 2. Listen for session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      if (currentUser && currentUser.email === 'durgaprasadmahapatra21@gmail.com') {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setAdminCockpitOpen(false);
      alert("Logged out successfully!");
    } catch (err) {
      alert("Logout error: " + err.message);
    }
  };

  const handleOpenModal = (key) => {
    if (key === 'weather') setWeatherOpen(true);
    else if (key === 'finance') setFinanceOpen(true);
    else if (key === 'crop') setCropOpen(true);
    else if (key === 'schemes') setSchemesOpen(true);
    else if (key === 'community') setCommunityOpen(true);
    else if (key === 'farmkart') setFarmKartOpen(true);
  };

  return (
    <div>
      <Header 
        unreadNotificationsCount={unreadNotifications}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
        language={language}
        onLanguageChange={setLanguage}
      />

      <div className="container">
        {/* Custom Sidebar Wrapper adjusting for Admin Controls */}
        <Sidebar 
          user={user}
          profileName="Administrator"
          onOpenLogin={() => setLoginModalOpen(true)}
          onOpenSignup={() => {}} // No registration for farmers
          onLogout={handleLogout}
          language={language}
        />

        <DashboardGrid onOpenModal={handleOpenModal}>
          <AiChatPanel language={language} />
        </DashboardGrid>

        <MarketSidebar language={language} />
      </div>

      {/* Floating Cockpit Trigger Button for Logged-In Admins */}
      {user && (
        <button
          onClick={() => setAdminCockpitOpen(true)}
          style={{
            position: 'fixed',
            bottom: '25px',
            right: '25px',
            backgroundColor: '#00dd00',
            color: '#000000',
            border: 'none',
            borderRadius: '50px',
            padding: '15px 25px',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(0, 221, 0, 0.8)',
            zIndex: 99,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          🛰️ Open Admin Cockpit
        </button>
      )}

      {/* --- ALL MODALS --- */}
      <AuthModal 
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />

      <AdminCockpitModal 
        isOpen={adminCockpitOpen}
        onClose={() => setAdminCockpitOpen(false)}
      />

      <WeatherModal 
        isOpen={weatherOpen}
        onClose={() => setWeatherOpen(false)}
        language={language}
      />

      <FinanceModal 
        isOpen={financeOpen}
        onClose={() => setFinanceOpen(false)}
        user={null} // Finance is public, saving to guest localStorage
      />

      <CropModal 
        isOpen={cropOpen}
        onClose={() => setCropOpen(false)}
        language={language}
      />

      <SchemesModal 
        isOpen={schemesOpen}
        onClose={() => setSchemesOpen(false)}
        language={language}
      />

      <CommunityModal 
        isOpen={communityOpen}
        onClose={() => setCommunityOpen(false)}
        isAdmin={!!user} // Admin can delete forum posts
      />

      <FarmKartModal 
        isOpen={farmKartOpen}
        onClose={() => setFarmKartOpen(false)}
      />

      <NotificationsModal 
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        user={null} // Read static notifications
        onUpdateUnreadCount={setUnreadNotifications}
      />

      <AboutModal 
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />
    </div>
  );
}
