import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Calendar, Star, Home, LogOut, ChevronLeft, Settings, Trash2, User } from 'lucide-react';
import BottomTabBar from './BottomTabBar';
import DeleteAccountDialog from './DeleteAccountDialog';
import PageTransition from './PageTransition';

const TAB_ROOTS = ['/', '/services', '/book', '/loyalty'];

function isTabRoot(pathname) {
  return TAB_ROOTS.includes(pathname);
}

export default function Layout() {
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const isAdmin = user?.role === 'admin';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const showBackButton = !isAdminRoute && !isTabRoot(location.pathname);

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
      <nav
        className="glass-card sticky top-0 z-50 px-4 md:px-6"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)', paddingBottom: '0.75rem' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Left: back button or logo */}
          <div className="flex items-center gap-2">
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="md:hidden flex items-center gap-1 text-pink-600 font-medium text-sm select-none"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
                Back
              </button>
            )}
            <Link to={isAdminRoute ? '/admin' : '/'} className="flex items-center gap-2">
              <span className={`font-playfair text-2xl font-bold bg-gradient-to-r from-pink-600 via-pink-500 to-pink-400 bg-clip-text text-transparent tracking-wide ${showBackButton ? 'hidden md:block' : ''}`}>
                BOOKED
              </span>
              {isAdminRoute && (
                <span className="text-xs font-inter font-medium text-pink-400 uppercase tracking-widest ml-1">
                  Admin
                </span>
              )}
            </Link>
          </div>

          {/* Desktop nav links */}
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

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Desktop only */}
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
                    className="flex items-center gap-1 text-sm text-pink-400 hover:text-pink-600 transition-colors select-none"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="chrome-button text-white text-sm font-medium px-5 py-2 rounded-full select-none"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile user menu */}
            {user ? (
              <div className="md:hidden relative">
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="w-9 h-9 chrome-card rounded-full flex items-center justify-center select-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <User size={16} className="text-pink-600" />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-11 z-50 glass-card rounded-2xl shadow-xl p-2 w-48 border border-pink-100">
                      <div className="px-3 py-2 border-b border-pink-100 mb-1">
                        <p className="text-xs font-semibold text-foreground truncate">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      {isAdmin && !isAdminRoute && (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-pink-600 hover:bg-pink-50 transition-colors"
                        >
                          <Settings size={14} /> Admin Panel
                        </Link>
                      )}
                      {isAdminRoute && (
                        <Link
                          to="/"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-pink-600 hover:bg-pink-50 transition-colors"
                        >
                          <Home size={14} /> Customer View
                        </Link>
                      )}
                      <button
                        onClick={() => { setShowUserMenu(false); base44.auth.logout(); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-pink-400 hover:bg-pink-50 transition-colors select-none"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                      <div className="border-t border-pink-100 mt-1 pt-1">
                        <button
                          onClick={() => { setShowUserMenu(false); setShowDeleteDialog(true); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors select-none"
                        >
                          <Trash2 size={14} /> Delete Account
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => base44.auth.redirectToLogin()}
                className="md:hidden chrome-button text-white text-xs font-medium px-4 py-2 rounded-full select-none"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-28 md:pb-8">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <footer className="hidden md:block text-center py-8 mt-12 border-t border-pink-100">
        <p className="font-playfair text-pink-400 text-sm italic">BOOKED — luxury nails, beautifully simple.</p>
      </footer>

      {!isAdminRoute && <BottomTabBar />}

      {showDeleteDialog && <DeleteAccountDialog onClose={() => setShowDeleteDialog(false)} />}
    </div>
  );
}