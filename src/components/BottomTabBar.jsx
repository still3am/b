import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Sparkles, Calendar, Star, LayoutDashboard, BookOpen, Settings } from 'lucide-react';

const CUSTOMER_TABS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/services', label: 'Services', icon: Sparkles },
  { to: '/book', label: 'Book', icon: Calendar },
  { to: '/loyalty', label: 'Loyalty', icon: Star },
];

const ADMIN_TABS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/bookings', label: 'Bookings', icon: BookOpen },
  { to: '/admin/services', label: 'Services', icon: Sparkles },
  { to: '/admin/calendar', label: 'Calendar', icon: Calendar },
];

export default function BottomTabBar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const tabs = isAdmin ? ADMIN_TABS : CUSTOMER_TABS;

  const isActive = (to) => {
    if (to === '/' || to === '/admin') return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-card"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around py-2 px-2">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 relative"
            >
              {active && (
                <motion.div
                  layoutId="tab-pip"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-1 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #db2777, #ec4899)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div whileTap={{ scale: 0.85 }}>
                <Icon
                  size={22}
                  className={active ? 'text-pink-600' : 'text-pink-300'}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </motion.div>
              <span className={`text-[10px] font-dm font-medium ${active ? 'text-pink-600' : 'text-pink-300'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}