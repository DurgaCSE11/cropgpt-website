import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardGrid from './components/DashboardGrid';
import MarketSidebar from './components/MarketSidebar';

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

import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState('');
  
  // Modal states
  const [authModalMode, setAuthModalMode] = useState(null); // 'login' | 'signup' | null
  const [weatherOpen, setWeatherOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [schemesOpen, setSchemesOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [farmKartOpen, setFarmKartOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Notification count
  const [unreadNotifications, setUnreadNotifications] = useState(2); // Default mock unread count for demos

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      if (data) setProfileName(data.name);
    } catch (err) {
      console.warn("Could not load user profile:", err.message);
    }
  };

  useEffect(() => {
    // 1. Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfileName('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
      />

      <div className="container">
        <Sidebar 
          user={user}
          profileName={profileName}
          onOpenLogin={() => setAuthModalMode('login')}
          onOpenSignup={() => setAuthModalMode('signup')}
          onLogout={handleLogout}
        />

        <DashboardGrid onOpenModal={handleOpenModal} />

        <MarketSidebar />
      </div>

      {/* --- ALL MODALS --- */}
      <AuthModal 
        isOpen={authModalMode !== null}
        mode={authModalMode}
        onClose={() => setAuthModalMode(null)}
        onAuthSuccess={() => {}}
      />

      <WeatherModal 
        isOpen={weatherOpen}
        onClose={() => setWeatherOpen(false)}
      />

      <FinanceModal 
        isOpen={financeOpen}
        onClose={() => setFinanceOpen(false)}
        user={user}
      />

      <CropModal 
        isOpen={cropOpen}
        onClose={() => setCropOpen(false)}
      />

      <SchemesModal 
        isOpen={schemesOpen}
        onClose={() => setSchemesOpen(false)}
      />

      <CommunityModal 
        isOpen={communityOpen}
        onClose={() => setCommunityOpen(false)}
        user={user}
      />

      <FarmKartModal 
        isOpen={farmKartOpen}
        onClose={() => setFarmKartOpen(false)}
      />

      <NotificationsModal 
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        user={user}
        onUpdateUnreadCount={setUnreadNotifications}
      />

      <AboutModal 
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />
    </div>
  );
}
