import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ServiceWorkerManagerProps {
  children: React.ReactNode;
}

const ServiceWorkerManager: React.FC<ServiceWorkerManagerProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showUpdateAvailable, setShowUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdatePending, setIsUpdatePending] = useState(false);

  useEffect(() => {
    // Register service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          
          setRegistration(reg);
          console.log('Service worker registered successfully');
          
          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setShowUpdateAvailable(true);
                }
              });
            }
          });
          
          // Listen for controller change (when new SW takes control)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });
          
        } catch (error) {
          console.error('Service worker registration failed:', error);
        }
      }
    };

    registerServiceWorker();

    // Online/offline event listeners
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Your connection has been restored. Syncing data...",
      });
      
      // Trigger background sync
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_DATA'
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're Offline",
        description: "Don't worry, you can still use many features offline.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for messages from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SYNC_DATA') {
        // Handle sync completion
        console.log('Data synced from service worker');
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleUpdate = async () => {
    if (!registration || !registration.waiting) return;
    
    setIsUpdatePending(true);
    
    // Tell the waiting service worker to skip waiting and become active
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // The app will reload automatically when the new SW takes control
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const dismissUpdate = () => {
    setShowUpdateAvailable(false);
  };

  return (
    <>
      {children}
      
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-4 right-4 z-50">
          <Alert className="border-warning bg-warning/10">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="flex items-center gap-2">
              <span>You're offline</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="ml-auto"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Update available notification */}
      {showUpdateAvailable && (
        <div className="fixed top-4 right-4 z-50">
          <Alert className="border-primary bg-primary/10">
            <RefreshCw className="h-4 w-4" />
            <AlertDescription className="flex items-center gap-2">
              <span>A new version is available!</span>
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpdate}
                  disabled={isUpdatePending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isUpdatePending ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissUpdate}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Connection restored indicator - Removed for cleaner UI */}
    </>
  );
};

export default ServiceWorkerManager;