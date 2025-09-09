import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import logoImage from '@/assets/harmony-shield-logo.png';

interface LogoProps {
  variant?: 'default' | 'minimal' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  linkTo?: string;
  imageOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'default',
  size = 'md',
  showText = true,
  className,
  linkTo = '/',
  imageOnly = false
}) => {
  const sizeClasses = {
    sm: imageOnly ? 'h-8 w-8' : 'h-6 w-6',
    md: imageOnly ? 'h-12 w-12' : 'h-8 w-8',
    lg: imageOnly ? 'h-16 w-16' : 'h-12 w-12',
    xl: imageOnly ? 'h-24 w-24' : 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  const LogoContent = () => (
    <>
      {variant === 'full' ? (
        <OptimizedImage
          src={logoImage}
          alt="Harmony Shield Logo"
          className={cn(sizeClasses[size], "object-contain")}
          lazy={false}
        />
      ) : (
        <Shield className={cn(sizeClasses[size], "text-primary shield-pulse")} />
      )}
      {showText && !imageOnly && (
        <span className={cn(
          textSizeClasses[size],
          "font-bold text-foreground",
          variant === 'minimal' && "text-muted-foreground"
        )}>
          Harmony Shield
        </span>
      )}
    </>
  );

  if (linkTo) {
    return (
      <Link 
        to={linkTo}
        className={cn(
          "flex items-center space-x-2 transition-opacity hover:opacity-80",
          className
        )}
      >
        <LogoContent />
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <LogoContent />
    </div>
  );
};

// Standalone Logo page component for shareable link
export const LogoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-8">
        <Logo 
          variant="full" 
          size="xl" 
          showText={false}
          imageOnly
          linkTo={null}
          className="mx-auto"
        />
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Harmony Shield</h1>
          <p className="text-xl text-muted-foreground max-w-md">
            Protecting communities worldwide from digital fraud
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download our logo for press and media use
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={logoImage}
              download="harmony-shield-logo.png"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Download PNG
            </a>
            <Link
              to="/"
              className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Visit Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logo;