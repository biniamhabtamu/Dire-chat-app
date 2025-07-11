import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import ChatInterface from './components/ChatInterface';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import { MessageCircle, WifiOff, Wifi } from 'lucide-react';
import LoadingScreen from './components/LoadingScreen';
import ConnectionStatusBanner from './components/ConnectionStatusBanner';

function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'profile' | 'settings'>('chat');

  // Check network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowConnectionStatus(true);
      setTimeout(() => setShowConnectionStatus(false), 2000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowConnectionStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkSession = async () => {
      try {
        // Show loading for at least 1s to prevent flash
        timeoutId = setTimeout(() => setIsLoading(false), 1000);
        
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    checkSession();

    return () => {
      subscription?.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const renderView = () => {
    if (isLoading || !isOnline) {
      return (
        <>
          <LoadingScreen isOnline={isOnline} />
          <ConnectionStatusBanner 
            isOnline={isOnline} 
            showConnectionStatus={showConnectionStatus} 
          />
        </>
      );
    }

    switch (currentView) {
      case 'profile':
        return <ProfilePage user={user} onBack={() => setCurrentView('chat')} />;
      case 'settings':
        return <SettingsPage user={user} onBack={() => setCurrentView('chat')} />;
      case 'chat':
      default:
        return (
          <>
            <ConnectionStatusBanner 
              isOnline={isOnline} 
              showConnectionStatus={showConnectionStatus} 
            />
            {user ? (
              <ChatInterface 
                user={user} 
                onSignOut={handleSignOut} 
                onProfileClick={() => setCurrentView('profile')}
                onSettingsClick={() => setCurrentView('settings')}
              />
            ) : (
              <Auth onAuth={() => setUser(true)} />
            )}
          </>
        );
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;