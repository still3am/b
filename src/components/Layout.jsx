import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, ChevronLeft, LogOut, User, Settings, Home, ShieldAlert, Lock } from 'lucide-react';
import BottomTabBar from './BottomTabBar';
import DeleteAccountDialog from './DeleteAccountDialog';
import PageTransition from './PageTransition';
import BackgroundOrbs from './BackgroundOrbs';
import AdminLockScreen from './AdminLockScreen';

const TAB_ROOTS = ['/', '/services', '/book', '/loyalty', '/admin', '/admin/bookings', '/admin/services', '/admin/calendar', '/admin/loyalty'];

function checkAdminAuth() {
  const val = sessionStorage.getItem('booked_admin_auth');
  if (!val) return false;
  const ts = parseInt(val, 10);
  return Date.now() - ts < 4 * 60 * 60 * 1000;
}

const customerLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/book', label: 'Book' },
  { to: '/calendar', label: 'Availability' },
  { to: '/loyalty', label: 'Loyalty' },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/calendar', label: 'Calendar' },
  { to: '/admin/loyalty', label: 'Loyalty' },
];

export default function Layout() {
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdmin = user?.role === 'admin';

  const showBack = !TAB_ROOTS.includes(location.pathname);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (isAdminRoute) setAdminAuthed(checkAdminAuth());
  }, [location.pathname]);

  const handleUnlock = () => {
    setAdminAuthed(true);
  };

  const lockAdmin = () => {
    sessionStorage.removeItem('booked_admin_auth');
    setAdminAuthed(false);
    navigate('/');
  };

  const links = isAdminRoute ? adminLinks : customerLinks;

  const isActive = (to) => {
    if (to === '/' || to === '/admin') return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  if (isAdminRoute && !adminAuthed) {
    return (
      <div className="min-h-screen pink-gradient-bg">
        <BackgroundOrbs />
        <AdminLockScreen onUnlock={handleUnlock} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #fff5f8, #ffeaf3, #ffd6e8, #fff5f8)' }}>
      <BackgroundOrbs />

      {/* Nav */}
      <nav
        className="glass-card sticky top-0 z-50 px-4 md:px-6 relative"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)', paddingBottom: '0.75rem' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-2">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="md:hidden flex items-center gap-1 text-pink-600 font-dm font-medium text-sm"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
                Back
              </button>
            )}
            <Link to={isAdminRoute ? '/admin' : '/'} className={showBack ? 'hidden md:flex items-center gap-2' : 'flex items-center gap-2'}>
              <span className="font-cormorant text-2xl font-bold gradient-text tracking-wide">BOOKED</span>
              {isAdminRoute && (
                <div className="flex items-center gap-1 ml-1">
                  <ShieldAlert size={13} className="text-pink-400" />
                  <span className="text-xs font-dm font-medium text-pink-400 uppercase tracking-widest">Admin</span>
                </div>
              )}
            </Link>
          </div>

          {/* Center — desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-full text-sm font-dm font-medium transition-all duration-200 ${
                  isActive(to) ? 'chrome-button text-white' : 'text-pink-700 hover:bg-pink-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              {isAdminRoute && (
                <button
                  onClick={lockAdmin}
                  className="flex items-center gap-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1.5 rounded-full text-xs font-dm font-medium transition-colors"
                >
                  <Lock size={12} /> Lock Admin
                </button>
              )}
              {user ? (
                <>
                  {!isAdminRoute && isAdmin && (
                    <Link to="/admin" className="text-xs font-dm font-medium text-pink-500 hover:text-pink-700 transition-colors">
                      Admin →
                    </Link>
                  )}
                  {isAdminRoute && (
                    <Link to="/" className="text-xs font-dm font-medium text-pink-500 hover:text-pink-700 transition-colors">
                      ← Customer View
                    </Link>
                  )}
                  <button
                    onClick={() => base44.auth.logout()}
                    className="flex items-center gap-1 text-sm font-dm text-pink-400 hover:text-pink-600 transition-colors"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="chrome-button text-white text-sm font-dm font-medium px-5 py-2 rounded-full"
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
                  className="w-9 h-9 chrome-card rounded-full flex items-center justify-center"
                >
                  <User size={16} className="text-pink-600" />
                </button>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-11 z-50 glass-card rounded-2xl shadow-xl p-2 w-52">
                      <div className="px-3 py-2 border-b border-pink-100 mb-1">
                        <p className="text-xs font-dm font-semibold text-foreground truncate">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate font-dm">{user.email}</p>
                      </div>
                      {isAdmin && !isAdminRoute && (
                        <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-pink-600 hover:bg-pink-50 transition-colors font-dm">
                          <Settings size={14} /> Admin Panel
                        </Link>
                      )}
                      {isAdminRoute && (
                        <>
                          <button onClick={() => { setShowUserMenu(false); lockAdmin(); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-amber-600 hover:bg-amber-50 transition-colors font-dm">
                            <Lock size={14} /> Lock Admin
                          </button>
                          <Link to="/" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-pink-600 hover:bg-pink-50 transition-colors font-dm">
                            <Home size={14} /> Customer View
                          </Link>
                        </>
                      )}
                      <button onClick={() => { setShowUserMenu(false); base44.auth.logout(); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-pink-400 hover:bg-pink-50 transition-colors font-dm">
                        <LogOut size={14} /> Sign Out
                      </button>
                      <div className="border-t border-pink-100 mt-1 pt-1">
                        <button onClick={() => { setShowUserMenu(false); setShowDeleteDialog(true); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors font-dm">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button onClick={() => base44.auth.redirectToLogin()} className="md:hidden chrome-button text-white text-xs font-dm font-medium px-4 py-2 rounded-full">
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-28 md:pb-12 relative z-10">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <footer className="hidden md:block text-center py-8 mt-4 border-t border-pink-100 relative z-10">
        <p className="font-cormorant text-pink-400 text-sm italic">BOOKED — luxury nails, beautifully simple.</p>
      </footer>

      {!isAdminRoute && <BottomTabBar />}
      {showDeleteDialog && <DeleteAccountDialog onClose={() => setShowDeleteDialog(false)} />}
    </div>
  );
}