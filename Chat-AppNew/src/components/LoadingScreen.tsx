import React from 'react';
import { MessageCircle } from 'lucide-react';

interface LoadingScreenProps {
  isOnline: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isOnline }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-cyan-400 to-teal-500 rounded-full animate-pulse-slow opacity-70"></div>
          <div className="absolute inset-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full"></div>
          <div className="absolute inset-6 flex items-center justify-center">
            <MessageCircle className="w-12 h-12 text-cyan-400 animate-bounce-slow" />
          </div>
          
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
        
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          Dire<span className="animate-pulse">.</span>Chat
        </h1>
        
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
};

export default LoadingScreen;