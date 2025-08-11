import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  BarChart3, 
  User, 
  LogOut,
  TrendingUp,
  Info
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Magasins', href: '/stores', icon: Store },
  { name: 'Stock', href: '/stock', icon: Package },
  { name: 'Ventes', href: '/sales', icon: TrendingUp },
  { name: 'Dimensions', href: '/product-dimensions', icon: Info },
  { name: 'Comparateur', href: '/comparateur', icon: BarChart3 },
  { name: 'Profil', href: '/profile', icon: User },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-sidebar-foreground">SofiSoft</span>
          </div>
        </div>

        {/* User info */}
        <div className="border-b border-sidebar-border p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={logout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
};