import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Menu, X, Sparkles, Calendar, Star, Home, Settings, LogOut } from 'lucide-react';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const isAdmin = user?.role === 'admin';
  const isAdminRoute = location.pathname.startsWith('/admin');

  const customerLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/services', label: 'Services', icon: Sparkles },
    { to: '/book', label: 'Book Now', icon: Calendar },
    { to: '/calendar', label: 'Availability', icon: Calendar },
    { to: '/loyalty', label: 'Loyalty', icon: Star },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: Home },
    { to: '/admin/bookings', label: 'Bookings', icon: Calendar },
    { to: '/admin/services', label: 'Services', icon: Sparkles },
    { to: '/admin/calendar', label: 'Calendar', icon: Calendar },
    { to: '/admin/loyalty', label: 'Loyalty', icon: Star },
  ];

  const links = isAdminRoute ? adminLinks : customerLinks;

  return (
    <div className="min-h-screen pink-gradient-bg">
      {/* Nav */}
      <nav className="glass-card sticky top-0 z-50 px-6 py-4 mx-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to={isAdminRoute ? '/admin' : '/'} className="flex items-center gap-2">
            <span className="font-playfair text-2xl font-bold bg-gradient-to-r from-pink-600 via-pink-500 to-pink-400 bg-clip-text text-transparent tracking-wide">
              BOOKED
            </span>
            {isAdminRoute && (
              <span className="text-xs font-inter font-medium text-pink-400 uppercase tracking-widest ml-1">
                Admin
              </span>
            )}
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-full text-sm font-medium font-inter transition-all duration-200 ${
                  location.pathname === to
                    ? 'chrome-button text-white'
                    : 'text-pink-700 hover:bg-pink-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {!isAdminRoute && isAdmin && (
                  <Link to="/admin" className="text-xs font-medium text-pink-500 hover:text-pink-700 transition-colors">
                    Admin Panel →
                  </Link>
                )}
                {isAdminRoute && (
                  <Link to="/" className="text-xs font-medium text-pink-500 hover:text-pink-700 transition-colors">
                    ← Customer View
                  </Link>
                )}
                <button
                  onClick={() => base44.auth.logout()}
                  className="flex items-center gap-1 text-sm text-pink-400 hover:text-pink-600 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => base44.auth.redirectToLogin()}
                className="chrome-button text-white text-sm font-medium px-5 py-2 rounded-full"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-pink-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-1 border-t border-pink-100 pt-4">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === to ? 'bg-pink-100 text-pink-700' : 'text-pink-600 hover:bg-pink-50'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            {!user ? (
              <button
                onClick={() => base44.auth.redirectToLogin()}
                className="chrome-button text-white text-sm font-medium px-5 py-3 rounded-xl mt-2"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={() => base44.auth.logout()}
                className="flex items-center gap-2 px-4 py-3 text-sm text-pink-400"
              >
                <LogOut size={14} /> Sign Out
              </button>
            )}
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="text-center py-8 mt-12 border-t border-pink-100">
        <p className="font-playfair text-pink-400 text-sm italic">BOOKED — luxury nails, beautifully simple.</p>
      </footer>
    </div>
  );
}