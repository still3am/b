import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Users, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const CATEGORY_COLORS = ['#f472b6','#ec4899','#db2777','#be185d','#9d174d'];

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [members, setMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const load = useCallback(async () => {
    setSpinning(true);
    try {
      const [bkgs, loyalty] = await Promise.all([
        base44.entities.Booking.list(),
        base44.entities.LoyaltyAccount.list(),
      ]);
      setBookings([...bkgs].sort((a,b) => (b.booking_date||'').localeCompare(a.booking_date||'')));
      setMembers(loyalty.length);
      setLastUpdated(new Date());
    } catch {}
    setLoading(false);
    setSpinning(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.booking_date === today);
  const pending = bookings.filter(b => b.status === 'pending');
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const revenue = bookings.filter(b => b.status === 'completed').reduce((s,b) => s + (b.service_price||0), 0);
  const diamond = 0; // would need separate query

  const byDow = DOW.map((name, i) => ({
    name,
    count: bookings.filter(b => b.booking_date && new Date(b.booking_date + 'T00:00:00').getDay() === i).length,
  }));

  // Revenue by category
  const completed = bookings.filter(b => b.status === 'completed');
  const catRevMap = {};
  completed.forEach(b => { const cat = b.service_name || 'Other'; catRevMap[cat] = (catRevMap[cat]||0) + (b.service_price||0); });
  const topCats = Object.entries(catRevMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxCatRev = topCats[0]?.[1] || 1;

  const statusConfig = {
    pending: { color: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
    confirmed: { color: 'bg-green-400', badge: 'bg-green-100 text-green-700' },
    cancelled: { color: 'bg-red-400', badge: 'bg-red-100 text-red-600' },
    completed: { color: 'bg-blue-400', badge: 'bg-blue-100 text-blue-600' },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cormorant text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="font-dm text-muted-foreground text-sm mt-1">
            {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>
        <button onClick={load} className="glass-card rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-dm text-pink-600 hover:border-pink-300 transition-all">
          <RefreshCw size={14} className={spinning ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Bookings", value: todayBookings.length, icon: Calendar, extra: todayBookings.length > 0 ? <ArrowUpRight size={12} className="text-green-500" /> : null },
          { label: 'Awaiting Approval', value: pending.length, icon: Clock, highlight: pending.length > 0 },
          { label: 'Total Members', value: members, icon: Users },
          { label: 'Total Revenue', value: `$${revenue}`, icon: TrendingUp },
        ].map(({ label, value, icon: Icon, extra, highlight }, i) => (
          <motion.div key={label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }}
            className={`glass-card rounded-2xl p-5 ${highlight ? 'ring-2 ring-amber-300 ring-opacity-50' : ''}`}>
            <div className="w-10 h-10 chrome-card rounded-xl flex items-center justify-center mb-3">
              <Icon size={18} className="text-pink-600" />
            </div>
            <p className="font-cormorant text-3xl font-bold text-foreground flex items-center gap-1">{value}{extra}</p>
            <p className="font-dm text-xs text-muted-foreground mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-3xl p-6">
          <h2 className="font-cormorant text-xl font-semibold mb-4">Bookings by Day of Week</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byDow}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '0.5px solid rgba(255,150,185,0.3)', borderRadius: 12, fontFamily: 'DM Sans', fontSize: 12 }} />
              <Bar dataKey="count" fill="#ec4899" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h2 className="font-cormorant text-xl font-semibold mb-4">Revenue by Service</h2>
          {topCats.length === 0 ? (
            <p className="font-dm text-muted-foreground text-sm text-center py-8">No completed bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {topCats.map(([name, rev], i) => (
                <motion.div key={name} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.1 }}>
                  <div className="flex justify-between text-xs font-dm mb-1">
                    <span className="text-foreground font-medium">{name}</span>
                    <span className="text-pink-600 font-bold">${rev}</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${(rev/maxCatRev)*100}%` }}
                      transition={{ duration: 0.8, delay: i*0.1, ease: [0.34,1.56,0.64,1] }}
                      style={{ background: CATEGORY_COLORS[i] }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: '/admin/bookings', icon: Calendar, title: 'Manage Bookings', desc: 'View, confirm, cancel appointments', badge: pending.length },
          { to: '/admin/services', icon: CheckCircle, title: 'Edit Services', desc: 'Update services & pricing' },
          { to: '/admin/calendar', icon: Clock, title: 'Set Availability', desc: 'Block dates, customize time slots' },
        ].map(({ to, icon: Icon, title, desc, badge }) => (
          <Link key={to} to={to} className="glass-card rounded-2xl p-5 hover-lift transition-all relative group">
            {badge > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-dm font-bold rounded-full w-5 h-5 flex items-center justify-center">{badge}</span>
            )}
            <Icon size={20} className="text-pink-400 mb-2 group-hover:text-pink-600 transition-colors" />
            <p className="font-dm font-semibold text-foreground">{title}</p>
            <p className="font-dm text-xs text-muted-foreground mt-1">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-cormorant text-xl font-semibold">Recent Bookings</h2>
          <Link to="/admin/bookings" className="text-pink-500 text-xs font-dm font-medium hover:text-pink-700">View all →</Link>
        </div>
        {loading ? (
          <div className="space-y-3">{Array(5).fill(0).map((_,i) => <div key={i} className="skeleton-shimmer h-14 rounded-xl" />)}</div>
        ) : bookings.length === 0 ? (
          <p className="text-center font-dm text-muted-foreground py-8 text-sm">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {bookings.slice(0,10).map((b,i) => {
              const cfg = statusConfig[b.status] || statusConfig.pending;
              return (
                <motion.div key={b.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.04 }}
                  className="flex items-center gap-3 p-3 bg-pink-50/50 rounded-xl">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-dm font-medium text-sm text-foreground truncate">{b.customer_name}</p>
                    <p className="font-dm text-xs text-muted-foreground">{b.service_name} · {b.booking_date} {b.booking_time}</p>
                  </div>
                  <span className={`text-xs font-dm font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>{b.status}</span>
                  <span className="font-cormorant font-bold text-pink-600">${b.service_price}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}