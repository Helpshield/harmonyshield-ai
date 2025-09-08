import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, TrendingUp, Users, Bell, Eye } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useResponsive } from '@/hooks/useResponsive';
import heroImage from '@/assets/hero-bg.jpg';

const LandingPage = () => {
  const { isMobile, isTablet, getColumnsForBreakpoint } = useResponsive();

  const featureColumns = getColumnsForBreakpoint({
    xs: 1,
    md: 2,
    lg: 3
  });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="container-mobile py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary shield-pulse" />
          <h1 className="text-lg sm:text-2xl font-bold text-foreground">Harmony Shield</h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <Link to="/auth" className="flex-1 sm:flex-initial">
            <Button variant="ghost" className="w-full sm:w-auto text-sm sm:text-base">
              Sign In
            </Button>
          </Link>
          <Link to="/auth" className="flex-1 sm:flex-initial">
            <Button variant="hero" className="w-full sm:w-auto text-sm sm:text-base">
              Get Protected
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <OptimizedImage
            src={heroImage}
            alt="Security background"
            className="w-full h-full object-cover"
            lazy={false}
            placeholder="blur"
          />
        </div>
        <div className="relative container-mobile py-12 sm:py-16 md:py-20 text-center">
          <div className="animate-fade-in-up max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Protect Yourself From
              <span className="bg-gradient-primary bg-clip-text text-transparent block sm:inline">
                {' '}Social Media Fraud
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Advanced AI-powered platform helping individuals worldwide stay safe from fraudulent activities across social media platforms
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button variant="hero" size={isMobile ? "default" : "lg"} className="w-full touch-target">
                  Start Protection Now
                </Button>
              </Link>
              <Button variant="outline" size={isMobile ? "default" : "lg"} className="w-full sm:w-auto touch-target">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container-mobile">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Advanced Protection Features
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Comprehensive tools designed to keep you safe in the digital world
            </p>
          </div>

          <div 
            className="grid gap-4 sm:gap-6"
            style={{ 
              gridTemplateColumns: `repeat(${featureColumns}, 1fr)` 
            }}
          >
            <Card className="hover-lift shadow-card">
              <CardHeader className="p-4 sm:p-6">
                <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 text-warning mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">Scam Reporting</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Report and track fraudulent activities with our comprehensive reporting system
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift shadow-card">
              <CardHeader className="p-4 sm:p-6">
                <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">Daily Scam News</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Stay informed with real-time updates from reliable sources about latest fraud trends
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift shadow-card">
              <CardHeader className="p-4 sm:p-6">
                <Eye className="h-8 w-8 sm:h-12 sm:w-12 text-secondary mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">Real-time Monitoring</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  AI-powered monitoring across social media platforms for suspicious activities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift shadow-card">
              <CardHeader className="p-4 sm:p-6">
                <Bell className="h-8 w-8 sm:h-12 sm:w-12 text-accent mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">Instant Alerts</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Get immediate notifications about potential threats and scams in your network
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift shadow-card">
              <CardHeader className="p-4 sm:p-6">
                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">Community Protection</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Join thousands of users working together to create a safer digital environment
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift shadow-card">
              <CardHeader className="p-4 sm:p-6">
                <Shield className="h-8 w-8 sm:h-12 sm:w-12 text-accent mb-3 sm:mb-4 shield-pulse" />
                <CardTitle className="text-lg sm:text-xl">Advanced Security</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Enterprise-grade security features to protect your personal information
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-hero">
        <div className="container-mobile text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-4 sm:mb-6">
            Ready to Take Control?
          </h3>
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Join thousands of users already protected by Harmony Shield
          </p>
          <Link to="/auth">
            <Button variant="secondary" size={isMobile ? "default" : "lg"} className="touch-target">
              Start Your Protection Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-8 sm:py-12">
        <div className="container-mobile text-center">
          <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-base sm:text-lg font-semibold text-foreground">Harmony Shield</span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Protecting communities worldwide from digital fraud
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;