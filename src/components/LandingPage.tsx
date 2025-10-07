import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSEOMeta } from '@/utils/seoHelpers';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Bell, 
  Eye,
  CheckCircle,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Globe,
  Lock,
  Zap,
  Brain,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useResponsive } from '@/hooks/useResponsive';
import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/utils';

// Import images
import heroSecurityImage from '@/assets/hero-security.jpg';
import testimonialsImage from '@/assets/testimonials-people.jpg';
import aiDetectionImage from '@/assets/ai-detection.jpg';

const LandingPage = () => {
  const { isMobile, isTablet, getColumnsForBreakpoint } = useResponsive();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // SEO optimization
  useSEOMeta({
    title: 'Digital Shield Against Social Media Fraud',
    description: 'Advanced AI-powered platform that monitors, detects, and protects you from fraudulent activities across all social media platforms in real-time.',
    keywords: 'social media fraud protection, AI scam detection, cybersecurity, fraud prevention, online safety',
    canonicalUrl: window.location.origin
  });

  const featureColumns = getColumnsForBreakpoint({
    xs: 1,
    md: 2,
    lg: 3
  });

  const statsColumns = getColumnsForBreakpoint({
    xs: 2,
    sm: 4
  });

  // Testimonials data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      content: "Harmony Shield saved me from a sophisticated phishing scam that could have cost my business thousands. The real-time alerts are incredible!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "College Student",
      content: "As someone who spends a lot of time on social media, this platform gives me peace of mind. The AI detection caught several suspicious messages I almost fell for.",
      rating: 5
    },
    {
      name: "Linda Rodriguez",
      role: "Retired Teacher",
      content: "I'm not very tech-savvy, but Harmony Shield is so easy to use. It's helped me identify and avoid multiple romance scams on social platforms.",
      rating: 5
    },
    {
      name: "David Park",
      role: "IT Manager",
      content: "The community reporting feature is brilliant. We're all working together to make the internet safer for everyone.",
      rating: 5
    }
  ];

  // Auto-advance testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
        <Logo variant="default" size="md" linkTo="/" />
        <div className="hidden md:flex items-center space-x-8">
          <Link to="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link to="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link to="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</Link>
          <Link to="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
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
        <div className="absolute inset-0 opacity-20">
          <OptimizedImage
            src={heroSecurityImage}
            alt="Digital security and protection"
            className="w-full h-full object-cover"
            lazy={false}
            placeholder="blur"
          />
        </div>
        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 text-center max-w-7xl mx-auto">
          <div className="animate-fade-in-up max-w-5xl mx-auto">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm">
              🔒 Trusted by 50,000+ Users Worldwide
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Your Digital Shield Against
              <span className="bg-gradient-primary bg-clip-text text-transparent block sm:inline">
                {' '}Social Media Fraud
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto px-4">
              Advanced AI-powered platform that monitors, detects, and protects you from fraudulent activities across all social media platforms in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 mb-12">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button variant="hero" size={isMobile ? "default" : "lg"} className="w-full touch-target group">
                  Start Free Protection Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size={isMobile ? "default" : "lg"} className="w-full sm:w-auto touch-target">
                Watch Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div 
              className="grid gap-6 max-w-4xl mx-auto"
              style={{ 
                gridTemplateColumns: `repeat(${statsColumns}, 1fr)` 
              }}
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">50K+</div>
                <div className="text-sm text-muted-foreground">Protected Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">1M+</div>
                <div className="text-sm text-muted-foreground">Scams Detected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">99.9%</div>
                <div className="text-sm text-muted-foreground">Detection Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">24/7</div>
                <div className="text-sm text-muted-foreground">Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 md:py-24 bg-background">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
              Complete Protection Suite
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Comprehensive AI-powered tools designed to keep you safe across all digital platforms
            </p>
          </div>

          <div 
            className="grid gap-6 mb-16"
            style={{ 
              gridTemplateColumns: `repeat(${featureColumns}, 1fr)` 
            }}
          >
            <Card className="hover-lift shadow-card border-0 bg-card/50 backdrop-blur">
              <CardHeader className="p-6">
                <Brain className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl">AI-Powered Detection</CardTitle>
                <CardDescription className="text-base">
                  Advanced machine learning algorithms analyze patterns to detect sophisticated fraud attempts in real-time
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift shadow-card border-0 bg-card/50 backdrop-blur">
              <CardHeader className="p-6">
                <AlertTriangle className="h-12 w-12 text-warning mb-4" />
                <CardTitle className="text-xl">Smart Scam Reporting</CardTitle>
                <CardDescription className="text-base">
                  Report suspicious activities with one click and help build a global database of fraud patterns
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift shadow-card border-0 bg-card/50 backdrop-blur">
              <CardHeader className="p-6">
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl">Real-Time News Feed</CardTitle>
                <CardDescription className="text-base">
                  Stay updated with the latest fraud trends and security alerts from verified sources worldwide
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift shadow-card border-0 bg-card/50 backdrop-blur">
              <CardHeader className="p-6">
                <Eye className="h-12 w-12 text-secondary mb-4" />
                <CardTitle className="text-xl">24/7 Monitoring</CardTitle>
                <CardDescription className="text-base">
                  Continuous surveillance across social media platforms to detect threats before they reach you
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift shadow-card border-0 bg-card/50 backdrop-blur">
              <CardHeader className="p-6">
                <Bell className="h-12 w-12 text-accent mb-4" />
                <CardTitle className="text-xl">Instant Alerts</CardTitle>
                <CardDescription className="text-base">
                  Receive immediate notifications about potential threats and suspicious activities in your network
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift shadow-card border-0 bg-card/50 backdrop-blur">
              <CardHeader className="p-6">
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl">Community Shield</CardTitle>
                <CardDescription className="text-base">
                  Join a global community of users working together to identify and stop fraud networks
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Feature Highlight */}
          <div className="bg-gradient-hero rounded-2xl p-8 sm:p-12 text-center">
            <div className="max-w-4xl mx-auto">
              <OptimizedImage
                src={aiDetectionImage}
                alt="AI fraud detection in action"
                className="w-full max-w-2xl mx-auto rounded-lg shadow-elegant mb-8"
                placeholder="blur"
              />
              <h3 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">
                Advanced AI Protection in Action
              </h3>
              <p className="text-lg text-primary-foreground/90 mb-6">
                Our sophisticated AI analyzes millions of data points to identify fraud patterns and protect you from emerging threats.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Zap className="w-4 h-4 mr-2" />
                  Real-time Analysis
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Lock className="w-4 h-4 mr-2" />
                  Bank-grade Security
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Globe className="w-4 h-4 mr-2" />
                  Global Coverage
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-20 md:py-24 bg-muted/30">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Trusted by Thousands
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our users say about their experience with Harmony Shield
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <OptimizedImage
                src={testimonialsImage}
                alt="Happy Harmony Shield users"
                className="w-full h-64 object-cover rounded-lg shadow-card"
              />
            </div>

            {/* Testimonial Carousel */}
            <div className="relative bg-card rounded-xl p-8 shadow-card">
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
                onClick={prevTestimonial}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                onClick={nextTestimonial}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="text-center max-w-2xl mx-auto">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                
                <blockquote className="text-lg sm:text-xl text-foreground mb-6 italic">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-muted-foreground">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>

              {/* Testimonial Indicators */}
              <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === currentTestimonial ? "bg-primary" : "bg-muted"
                    )}
                    onClick={() => setCurrentTestimonial(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20 md:py-24 bg-background">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">About Harmony Shield</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Your Trusted Partner in Digital Safety
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Founded by cybersecurity experts, Harmony Shield was created to address the growing threat of social media fraud. Our mission is to democratize advanced security technology and make it accessible to everyone.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Enterprise-Grade Security</h4>
                    <p className="text-muted-foreground">Military-level encryption and security protocols</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Global Coverage</h4>
                    <p className="text-muted-foreground">Protection across all major social media platforms worldwide</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">24/7 Support</h4>
                    <p className="text-muted-foreground">Round-the-clock assistance when you need it most</p>
                  </div>
                </div>
              </div>

              <Link to="/auth">
                <Button variant="hero" size="lg" className="group">
                  Join Our Community
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                <div className="text-sm text-muted-foreground">Users Protected</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">1M+</div>
                <div className="text-sm text-muted-foreground">Threats Blocked</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Monitoring</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-hero">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Secure Your Digital Life?
          </h2>
          <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto px-4">
            Join thousands of users who trust Harmony Shield to protect them from social media fraud. Start your free protection today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto group">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-card py-12 sm:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <Logo variant="default" size="lg" linkTo="/" className="mb-6" />
              <p className="text-muted-foreground mb-6 max-w-md">
                Harmony Shield is your trusted partner in digital safety, protecting communities worldwide from social media fraud with advanced AI technology.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm">
                  <Globe className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <div className="space-y-2">
                <Link to="/privacy-policy" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms-of-service" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
                <Link to="/data-protection" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Data Protection
                </Link>
                <Link to="/cookie-policy" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>

            {/* Compliance Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Compliance</h4>
              <div className="space-y-2">
                <Link to="/soc-compliance" className="block text-muted-foreground hover:text-foreground transition-colors">
                  SOC 2 Compliance
                </Link>
                <Link to="/gdpr" className="block text-muted-foreground hover:text-foreground transition-colors">
                  GDPR Compliance
                </Link>
                <Link to="/security-certifications" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Security Certifications
                </Link>
                <Link to="/audit-reports" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Audit Reports
                </Link>
              </div>
            </div>

            {/* Help & Newsletter */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Help & Updates</h4>
              <div className="space-y-2">
                <Link to="/help-center" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
                <Link to="/faq" className="block text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
                <Link to="/contact-support" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Contact Support
                </Link>
                <Link to="/newsletter" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Security Newsletter
                </Link>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Get security updates</p>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">support@harmonyshield.online</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Available 24/7</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Harmony Shield. All rights reserved. 
              <Link to="/logo" className="ml-2 hover:text-foreground transition-colors">
                Brand Assets
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
