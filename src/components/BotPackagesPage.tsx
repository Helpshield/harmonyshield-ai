import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Bot, Shield, Zap, Star, Crown, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AppLayout } from './AppLayout';

interface BotPackage {
  id: string;
  name: string;
  description: string;
  features: string[];
  price_monthly: number;
  price_yearly: number;
  image_url?: string;
  sort_order: number;
}

const BotPackagesPage = () => {
  const [packages, setPackages] = useState<BotPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadBotPackages();
  }, []);

  const loadBotPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      
      const processedPackages = (data || []).map(pkg => ({
        ...pkg,
        features: Array.isArray(pkg.features) ? pkg.features : 
                 typeof pkg.features === 'string' ? JSON.parse(pkg.features) : []
      }));
      
      setPackages(processedPackages);
    } catch (error) {
      console.error('Error loading bot packages:', error);
      toast({
        title: "Error",
        description: "Failed to load bot packages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivateBot = async (packageId: string, packageName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to activate a bot package",
          variant: "destructive"
        });
        return;
      }

      // Here you would integrate with Stripe for subscription
      // For now, we'll just show a success message
      toast({
        title: "Bot Activation",
        description: `${packageName} activation initiated. You'll be redirected to payment.`,
      });

      // TODO: Integrate with Stripe checkout
      
    } catch (error) {
      console.error('Error activating bot:', error);
      toast({
        title: "Error",
        description: "Failed to activate bot package",
        variant: "destructive"
      });
    }
  };

  const getBotIcon = (name: string) => {
    if (name.includes('Neon')) return <Zap className="h-6 w-6" />;
    if (name.includes('Ultimate')) return <Star className="h-6 w-6" />;
    if (name.includes('Omega')) return <Shield className="h-6 w-6" />;
    if (name.includes('Alpha')) return <Crown className="h-6 w-6" />;
    if (name.includes('Oracle')) return <Sparkles className="h-6 w-6" />;
    return <Bot className="h-6 w-6" />;
  };

  const getPackageColor = (name: string) => {
    if (name.includes('Neon')) return 'from-cyan-500 to-blue-600';
    if (name.includes('Ultimate')) return 'from-purple-500 to-pink-600';
    if (name.includes('Omega')) return 'from-orange-500 to-red-600';
    if (name.includes('Alpha')) return 'from-yellow-500 to-orange-600';
    if (name.includes('Oracle')) return 'from-green-500 to-teal-600';
    return 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AI Bot Protection Packages
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Choose your AI-powered security companion. Each bot is designed to provide 
            different levels of protection and features tailored to your needs.
          </p>

          {/* Billing Toggle */}
          <Tabs 
            value={billingCycle} 
            onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}
            className="w-fit mx-auto"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly 
                <Badge variant="secondary" className="ml-2">Save 17%</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Bot Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="relative overflow-hidden hover-lift shadow-card group">
              {/* Gradient Header */}
              <div className={`h-32 bg-gradient-to-br ${getPackageColor(pkg.name)} relative`}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-4 left-4 text-white">
                  {getBotIcon(pkg.name)}
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-bold text-lg">{pkg.name}</h3>
                </div>
              </div>

              <CardHeader className="pb-4">
                <CardDescription className="text-sm">
                  {pkg.description}
                </CardDescription>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    ${billingCycle === 'monthly' ? pkg.price_monthly : pkg.price_yearly}
                  </span>
                  <span className="text-muted-foreground">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>

                {billingCycle === 'yearly' && (
                  <Badge variant="secondary" className="w-fit">
                    Save ${((pkg.price_monthly * 12) - pkg.price_yearly).toFixed(2)}
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features List */}
                <div className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full mt-6" 
                  onClick={() => handleActivateBot(pkg.id, pkg.name)}
                  size="lg"
                >
                  Activate {pkg.name}
                </Button>
              </CardContent>

              {/* Popular Badge for certain packages */}
              {(pkg.name.includes('Ultimate') || pkg.name.includes('Omega')) && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-yellow-500 text-yellow-900">
                    Popular
                  </Badge>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16 p-8 bg-muted/30 rounded-lg">
          <h3 className="text-2xl font-semibold mb-4">Need Help Choosing?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our AI bots are designed to work together seamlessly. You can start with one 
            package and upgrade or add additional bots as your security needs grow.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="outline" className="px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              30-day money back guarantee
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <Bot className="h-4 w-4 mr-2" />
              24/7 AI monitoring
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              Instant activation
            </Badge>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BotPackagesPage;