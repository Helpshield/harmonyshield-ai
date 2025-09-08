import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Menu, Shield, X, User, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface MobileNavProps {
  items: NavigationItem[];
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  onSignOut?: () => void;
  onProfileClick?: () => void;
  className?: string;
}

export function MobileNav({
  items,
  user,
  onSignOut,
  onProfileClick,
  className
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActiveRoute = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn("md:hidden p-2", className)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="p-0 w-80 max-w-[85vw]"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary shield-pulse" />
              <SheetTitle className="text-xl font-bold">
                Harmony Shield
              </SheetTitle>
            </div>
          </SheetHeader>

          {/* User Profile Section */}
          {user && (
            <div className="px-6 pb-4">
              <div 
                className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => {
                  onProfileClick?.();
                  handleItemClick();
                }}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.name || 'User'} />
                  <AvatarFallback>
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                {user.role && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {user.role}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Navigation Items */}
          <nav className="flex-1 px-6 py-4">
            <div className="space-y-1">
              {items.map((item, index) => {
                const isActive = isActiveRoute(item.href);
                
                return (
                  <Link
                    key={index}
                    to={item.href}
                    onClick={handleItemClick}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      "hover:bg-muted/50 active:scale-95 active:transition-transform active:duration-100",
                      isActive 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "text-foreground hover:text-foreground",
                      item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                    )}
                    aria-disabled={item.disabled}
                  >
                    <span className={cn("shrink-0", isActive && "text-primary-foreground")}>
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <Badge 
                        variant={isActive ? "secondary" : "default"} 
                        className="ml-auto text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer Actions */}
          {(onProfileClick || onSignOut) && (
            <>
              <Separator />
              <div className="p-6 pt-4 space-y-2">
                {onProfileClick && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      onProfileClick();
                      handleItemClick();
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                )}
                
                {onSignOut && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      onSignOut();
                      handleItemClick();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Mobile bottom navigation component
interface BottomNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface MobileBottomNavProps {
  items: BottomNavItem[];
  className?: string;
}

export function MobileBottomNav({ items, className }: MobileBottomNavProps) {
  const location = useLocation();

  const isActiveRoute = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden",
      "px-4 py-2 safe-area-pb",
      className
    )}>
      <div className="flex items-center justify-around">
        {items.map((item, index) => {
          const isActive = isActiveRoute(item.href);
          
          return (
            <Link
              key={index}
              to={item.href}
              className={cn(
                "flex flex-col items-center space-y-1 px-2 py-1.5 rounded-lg min-w-0 transition-colors",
                "active:scale-95 active:transition-transform active:duration-100",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <span className={cn("block", isActive && "text-primary")}>
                  {item.icon}
                </span>
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-xs font-medium truncate max-w-full",
                isActive && "text-primary"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}