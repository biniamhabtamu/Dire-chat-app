import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';

interface ConnectionStatusBannerProps {
  isOnline: boolean;
  showConnectionStatus: boolean;
}

const ConnectionStatusBanner: React.FC<ConnectionStatusBannerProps> = ({ 
  isOnline, 
  showConnectionStatus 
}) => {
  return (
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
};

export default ConnectionStatusBanner;