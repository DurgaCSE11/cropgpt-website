import React, { useState } from 'react';

import Header from './components/Header';
import DashboardGrid from './components/DashboardGrid';
import MarketSidebar from './components/MarketSidebar';
import AiChatPanel from './components/AiChatPanel';

// Modals
import WeatherModal from './components/Modals/WeatherModal';
import FinanceModal from './components/Modals/FinanceModal';
import CropModal from './components/Modals/CropModal';
import SchemesModal from './components/Modals/SchemesModal';
import CommunityModal from './components/Modals/CommunityModal';
import FarmKartModal from './components/Modals/FarmKartModal';
import NotificationsModal from './components/Modals/NotificationsModal';
import AboutModal from './components/Modals/AboutModal';
import ProfileModal from './components/Modals/ProfileModal'; // <-- The new profile modal

import './App.css';

export default function App() {
  // Global Language selection
  const [language, setLanguage] = useState('English');

  // Modal states
  const [weatherOpen, setWeatherOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [schemesOpen, setSchemesOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [farmKartOpen, setFarmKartOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false); // <-- State for the profile modal

  // Notification count
  const [unreadNotifications, setUnreadNotifications] = useState(2); // Mock alerts unread count

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
        onOpenProfile={() => setProfileOpen(true)} // <-- Passes the click handler to the avatar in Header
        language={language}
        onLanguageChange={setLanguage}
      />

      <div className="container">
        <DashboardGrid onOpenModal={handleOpenModal}>
          <AiChatPanel language={language} />
        </DashboardGrid>

        <MarketSidebar language={language} />
      </div>

      {/* --- ALL MODALS --- */}
      <WeatherModal 
        isOpen={weatherOpen}
        onClose={() => setWeatherOpen(false)}
        language={language}
      />

      <FinanceModal 
        isOpen={financeOpen}
        onClose={() => setFinanceOpen(false)}
        user={null} // Finance is public
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
        isAdmin={false} // Access is purely public now
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

      {/* --- NEW PROFILE MODAL --- */}
      <ProfileModal 
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        language={language}
      />
    </div>
  );
}