import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-4 max-w-7xl mx-auto border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <Logo variant="default" size="md" linkTo="/" />
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link to="/#about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link to="/#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</Link>
          <Link to="/#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
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

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card py-8 sm:py-12 mt-16 border-t border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="md:col-span-1">
              <Logo variant="default" size="md" linkTo="/" className="mb-4" />
              <p className="text-muted-foreground text-sm">
                Your trusted partner in digital safety.
              </p>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Legal</h4>
              <div className="space-y-2">
                <Link to="/privacy-policy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms-of-service" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
                <Link to="/data-protection" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Data Protection
                </Link>
                <Link to="/cookie-policy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>

            {/* Compliance Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Compliance</h4>
              <div className="space-y-2">
                <Link to="/soc-compliance" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Compliance & Certifications
                </Link>
              </div>
            </div>

            {/* Help Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Help & Updates</h4>
              <div className="space-y-2">
                <Link to="/help-center" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
                <Link to="/faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
                <Link to="/contact-support" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Support
                </Link>
                <Link to="/newsletter" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Security Newsletter
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Harmony Shield. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
