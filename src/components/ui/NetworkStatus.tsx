import React, { useState, useEffect, useCallback } from 'react';

interface NetworkStatusProps {
  className?: string;
  onStatusChange?: (isOnline: boolean, quality?: 'good' | 'poor' | 'offline') => void;
}

interface NetworkQuality {
  quality: 'good' | 'poor' | 'offline';
  latency?: number;
  lastCheck: Date;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ className = '', onStatusChange }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [userDismissed, setUserDismissed] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>({
    quality: navigator.onLine ? 'good' : 'offline',
    lastCheck: new Date()
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkNetworkQuality = useCallback(async (): Promise<NetworkQuality> => {
    const startTime = Date.now();
    
    try {
      // Try to fetch a small resource to test connectivity
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      const latency = Date.now() - startTime;
      
      if (response.ok) {
        return {
          quality: latency < 1000 ? 'good' : 'poor',
          latency,
          lastCheck: new Date()
        };
      } else {
        return {
          quality: 'poor',
          latency,
          lastCheck: new Date()
        };
      }
    } catch (error) {
      return {
        quality: 'offline',
        lastCheck: new Date()
      };
    }
  }, []);

  const updateNetworkStatus = useCallback(async (online: boolean) => {
    setIsOnline(online);
    
    if (online) {
      setIsChecking(true);
      try {
        const quality = await checkNetworkQuality();
        setNetworkQuality(quality);
        onStatusChange?.(true, quality.quality);
        // Don't show banner for any online connection (good or poor)
        setShowBanner(false);
      } catch (error) {
        setNetworkQuality({
          quality: 'poor',
          lastCheck: new Date()
        });
        onStatusChange?.(true, 'poor');
        // Don't show banner for poor connections either
        setShowBanner(false);
      } finally {
        setIsChecking(false);
      }
    } else {
      setNetworkQuality({
        quality: 'offline',
        lastCheck: new Date()
      });
      onStatusChange?.(false, 'offline');
      setShowBanner(true);
      setUserDismissed(false); // Reset dismiss state when going offline
    }
  }, [checkNetworkQuality, onStatusChange]);

  useEffect(() => {
    const handleOnline = async () => {
      // Don't show banner immediately - wait for quality check
      const quality = await checkNetworkQuality();
      setNetworkQuality(quality);
      
      // Don't show banner for any online connection
      setShowBanner(false);
      
      onStatusChange?.(true, quality.quality);
    };

    const handleOffline = () => {
      setShowBanner(true);
      updateNetworkStatus(false);
    };

    // Initial network quality check - don't show banner if connection is good
    if (navigator.onLine) {
      // Use a more direct approach for initial check to avoid flickering
      checkNetworkQuality().then(quality => {
        setNetworkQuality(quality);
        setHasInitialized(true);
        // Don't show banner for any online connection
        setShowBanner(false);
        onStatusChange?.(true, quality.quality);
      }).catch(() => {
        // If initial check fails, assume poor connection but don't show banner
        setNetworkQuality({
          quality: 'poor',
          lastCheck: new Date()
        });
        setHasInitialized(true);
        setShowBanner(false);
        onStatusChange?.(true, 'poor');
      });
    } else {
      setHasInitialized(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Less frequent periodic network quality checks when online
    const qualityCheckInterval = setInterval(() => {
      if (navigator.onLine && !isChecking && !showBanner) {
        updateNetworkStatus(true);
      }
    }, 120000); // Check every 2 minutes instead of 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(qualityCheckInterval);
    };
  }, [updateNetworkStatus, isChecking, showBanner, checkNetworkQuality, onStatusChange]);

  const getStatusColor = () => {
    // Use networkQuality for color determination
    switch (networkQuality.quality) {
      case 'good':
        return 'bg-green-500';
      case 'poor':
        return 'bg-yellow-500';
      case 'offline':
      default:
        return 'bg-red-500';
    }
  };

  const getStatusIcon = () => {
    // Use networkQuality for icon determination
    switch (networkQuality.quality) {
      case 'good':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'poor':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'offline':
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getStatusMessage = () => {
    if (isChecking) {
      return 'Checking connection...';
    }
    
    // Use isOnline state for status message
    return isOnline ? 'Connection restored' : 'You are offline';
  };

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const quality = await checkNetworkQuality();
      setNetworkQuality(quality);
      onStatusChange?.(true, quality.quality);
    } catch (error) {
      setNetworkQuality({
        quality: 'offline',
        lastCheck: new Date()
      });
      onStatusChange?.(false, 'offline');
    } finally {
      setIsChecking(false);
    }
  };

  // Don't show anything until we've completed initial check
  if (!hasInitialized) {
    return null;
  }

  // Only show banner when completely offline and user hasn't dismissed it
  if (!showBanner || userDismissed) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      <div className={`px-4 py-3 text-center text-sm font-medium transition-all duration-300 ${getStatusColor()} text-white`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="flex items-center space-x-2">
            {isChecking ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              getStatusIcon()
            )}
            <span>{getStatusMessage()}</span>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleManualCheck}
              disabled={isChecking}
              className="text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs px-2 py-1 rounded border border-white/20 hover:bg-white/10 transition-colors"
            >
              {isChecking ? 'Checking...' : 'Check'}
            </button>
            
            <button
              onClick={() => {
                setShowBanner(false);
                setUserDismissed(true);
              }}
              className="text-white/80 hover:text-white text-xs px-2 py-1 rounded border border-white/20 hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* No additional info needed since banner only shows when offline */}
      </div>
    </div>
  );
};

export default NetworkStatus;
