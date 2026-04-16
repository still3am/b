import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Calendar, Users, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Booking.list('-created_date', 50)
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.booking_date === today);
  const pending = bookings.filter(b => b.status === 'pending');
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const revenue = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.service_price || 0), 0);

  const stats = [
    { label: "Today's Appointments", value: todayBookings.length, icon: Calendar, color: 'text-pink-500' },
    { label: 'Pending Approval', value: pending.length, icon: Clock, color: 'text-yellow-500' },
    { label: 'Confirmed', value: confirmed.length, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Total Revenue', value: `$${revenue}`, icon: TrendingUp, color: 'text-pink-600' },
  ];

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
    confirmed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    cancelled: { color: 'bg-red-100 text-red-600', icon: XCircle },
    completed: { color: 'bg-blue-100 text-blue-600', icon: CheckCircle },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back — here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl p-5"
          >
            <Icon size={20} className={`${color} mb-3`} />
            <p className="text-2xl font-bold font-playfair text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/bookings" className="glass-card rounded-2xl p-5 hover:border-pink-300 transition-all group">
          <Calendar size={20} className="text-pink-400 mb-2 group-hover:text-pink-600 transition-colors" />
          <p className="font-semibold text-foreground">Manage Bookings</p>
          <p className="text-xs text-muted-foreground mt-1">View, confirm, cancel appointments</p>
        </Link>
        <Link to="/admin/services" className="glass-card rounded-2xl p-5 hover:border-pink-300 transition-all group">
          <Users size={20} className="text-pink-400 mb-2 group-hover:text-pink-600 transition-colors" />
          <p className="font-semibold text-foreground">Manage Services</p>
          <p className="text-xs text-muted-foreground mt-1">Edit services & pricing</p>
        </Link>
        <Link to="/admin/calendar" className="glass-card rounded-2xl p-5 hover:border-pink-300 transition-all group">
          <Clock size={20} className="text-pink-400 mb-2 group-hover:text-pink-600 transition-colors" />
          <p className="font-semibold text-foreground">Edit Calendar</p>
          <p className="text-xs text-muted-foreground mt-1">Block dates, set availability</p>
        </Link>
      </div>

      {/* Recent bookings */}
      <div className="glass-card rounded-3xl p-6">
        <h2 className="font-playfair text-xl font-semibold mb-4">Recent Bookings</h2>
        {loading ? (
          <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-14 bg-pink-50 rounded-xl animate-pulse" />)}</div>
        ) : bookings.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {bookings.slice(0, 10).map(b => {
              const cfg = statusConfig[b.status];
              const Icon = cfg?.icon || AlertCircle;
              return (
                <div key={b.id} className="flex items-center gap-3 p-3 bg-pink-50/50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{b.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{b.service_name} · {b.booking_date} {b.booking_time}</p>
                  </div>
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg?.color}`}>
                    <Icon size={10} /> {b.status}
                  </span>
                  <span className="text-pink-600 font-bold text-sm">${b.service_price}</span>
                </div>
              );
            })}
          </div>
        )}
        <Link to="/admin/bookings" className="text-pink-500 text-xs font-medium mt-4 inline-block hover:text-pink-700 transition-colors">
          View all bookings →
        </Link>
      </div>
    </div>
  );
}