import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import ChatInterface from './components/ChatInterface';
import { MessageCircle, WifiOff, Wifi } from 'lucide-react';

function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);

  // Check network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setShowConnectionStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show connection status temporarily when online
    if (isOnline) {
      setShowConnectionStatus(true);
      const timer = setTimeout(() => setShowConnectionStatus(false), 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

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

  // Connection status banner
  const renderConnectionStatus = () => (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg transition-all duration-500 ${
      isOnline ? 'bg-green-500/90 text-white' : 'bg-rose-500/90 text-white'
    } ${showConnectionStatus ? 'translate-y-0' : '-translate-y-20'}`}>
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Back online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Poor connection - attempting to reconnect</span>
        </>
      )}
    </div>
  );

  // Loading animation component
  const renderLoader = () => (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        {/* Animated gradient sphere */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-cyan-400 to-teal-500 rounded-full animate-pulse-slow opacity-70"></div>
          <div className="absolute inset-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full"></div>
          <div className="absolute inset-6 flex items-center justify-center">
            <MessageCircle className="w-12 h-12 text-cyan-400 animate-bounce-slow" />
          </div>
          
          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Animated text */}
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          Dire<span className="animate-pulse">.</span>Chat
        </h1>
        
        {/* Connection quality indicator */}
        <div className="max-w-md mx-auto mb-6">
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                isOnline ? 'bg-cyan-500' : 'bg-rose-500'
              } rounded-full animate-pulse-width`}
            ></div>
          </div>
          <p className="mt-2 text-gray-400 text-sm">
            {isOnline ? 'Securing connection...' : 'Waiting for network...'}
          </p>
        </div>
        
        {/* Tips for slow connections */}
        {!isOnline && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 max-w-md mx-auto mt-4 animate-fade-in">
            <p className="text-gray-300 text-sm">
              <span className="font-medium text-rose-400">Connection Tip:</span> Check your network 
              or move closer to your router for better performance.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading || !isOnline) {
    return (
      <>
        {renderLoader()}
        {renderConnectionStatus()}
      </>
    );
  }

  return (
    <div className="App">
      {renderConnectionStatus()}
      {user ? (
        <ChatInterface user={user} onSignOut={handleSignOut} />
      ) : (
        <Auth onAuth={() => setUser(true)} />
      )}
    </div>
  );
}

export default App;