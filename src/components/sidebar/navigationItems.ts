import { 
  Home,
  FileText,
  Newspaper,
  ScanLine,
  Search,
  Bot,
  Link,
  Shield,
  Settings,
  Users,
  BookOpen,
  Bell,
  DollarSign
} from 'lucide-react';
import { NavigationItem } from './NavigationSection';

export const userNavigationItems: NavigationItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Security Alerts', url: '/alerts', icon: Bell, badge: 'NEW' },
  { title: 'Recovery', url: '/recovery', icon: Shield, badge: 'NEW' },
  { title: 'Deep Lookup', url: '/deepsearch', icon: Search, badge: 'AI' },
  { title: 'Scanner', url: '/scanner', icon: ScanLine },
  { title: 'Reports', url: '/reports', icon: FileText },
  { title: 'Feeds', url: '/smartfeeds', icon: Newspaper, badge: 'LIVE' },
];

export const aiNavigationItems: NavigationItem[] = [
  { title: 'AI Chat Assistant', url: '/chat-assistant', icon: Bot, badge: 'NEW' },
  { title: 'AI Bots', url: '/bots', icon: Bot },
  { title: 'AI Links', url: '/links', icon: Link },
];

export const adminNavigationItems: NavigationItem[] = [
  { title: 'Admin Panel', url: '/admin', icon: Shield },
  { title: 'Recovery Jobs', url: '/admin/recovery', icon: DollarSign, badge: 'NEW' },
  { title: 'User Management', url: '/admin/users', icon: Users },
  { title: 'Reports Management', url: '/admin/reports', icon: FileText },
  { title: 'Bot Management', url: '/admin/bots', icon: Bot },
  { title: 'Social Management', url: '/admin/social', icon: Users, badge: 'NEW' },
  { title: 'Admin Manual', url: '/admin/manual', icon: BookOpen },
  { title: 'Content Management', url: '/admin/contents', icon: Settings },
];