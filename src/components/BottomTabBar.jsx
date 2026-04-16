import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Calendar, Star } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/services', label: 'Services', icon: Sparkles },
  { to: '/book', label: 'Book', icon: Calendar },
  { to: '/loyalty', label: 'Loyalty', icon: Star },
];

export default function BottomTabBar() {
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-pink-100 flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ to, label, icon: Icon }) => {
        const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 select-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Icon
              size={22}
              className={`transition-colors duration-200 ${isActive ? 'text-pink-600' : 'text-pink-300'}`}
              strokeWidth={isActive ? 2.2 : 1.8}
            />
            <span className={`text-[10px] font-medium font-inter transition-colors duration-200 ${isActive ? 'text-pink-600' : 'text-pink-300'}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}