import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';

const TrackingRedirectPage = () => {
  const { shortCode } = useParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [linkTitle, setLinkTitle] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');

  useEffect(() => {
    const processVisit = async () => {
      try {
        if (!shortCode) {
          setStatus('error');
          return;
        }

        // Call track-visitor function
        const { data, error } = await supabase.functions.invoke('track-visitor', {
          body: { shortCode }
        });

        if (error) {
          console.error('Tracking error:', error);
          setStatus('error');
          return;
        }

        setLinkTitle(data.title);
        setRedirectUrl(data.redirect_url);
        setStatus('success');

        // Redirect after a brief delay
        setTimeout(() => {
          window.location.href = data.redirect_url;
        }, 2000);

      } catch (error) {
        console.error('Error processing visit:', error);
        setStatus('error');
      }
    };

    processVisit();
  }, [shortCode]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Processing...</h2>
            <p className="text-muted-foreground">Please wait while we verify your link</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Link Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This tracking link is invalid, expired, or has been disabled.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="text-primary hover:underline"
            >
              Go to Harmony Shield
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary animate-shield-pulse" />
            </div>
          </div>
          
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          
          <h2 className="text-xl font-semibold mb-2">Verified Successfully</h2>
          <p className="text-muted-foreground mb-4">
            {linkTitle || 'Link verification complete'}
          </p>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>You will be redirected shortly...</p>
            <p>
              If not redirected, <a href={redirectUrl} className="text-primary hover:underline">click here</a>
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Protected by <span className="font-semibold text-primary">Harmony Shield</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackingRedirectPage;