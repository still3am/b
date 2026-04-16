import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Search, Filter, AlertCircle } from 'lucide-react';

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending' },
  confirmed: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Confirmed' },
  cancelled: { color: 'bg-red-100 text-red-500 border-red-200', label: 'Cancelled' },
  completed: { color: 'bg-blue-100 text-blue-600 border-blue-200', label: 'Completed' },
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    setLoading(true);
    base44.entities.Booking.list('-booking_date', 100)
      .then(setBookings)
      .finally(() => setLoading(false));
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    await base44.entities.Booking.update(id, { status });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    setUpdating(null);
  };

  const filtered = bookings.filter(b => {
    const matchSearch = b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.service_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-4xl font-bold text-foreground">Bookings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage and update appointment statuses.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, service, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full glass-card rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-pink-400 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="glass-card rounded-xl px-3 py-2.5 text-sm outline-none focus:border-pink-400 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="space-y-3">{Array(6).fill(0).map((_, i) => <div key={i} className="h-20 bg-pink-50 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl">
          <AlertCircle size={32} className="text-pink-200 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground font-inter">{b.customer_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusConfig[b.status]?.color}`}>
                    {statusConfig[b.status]?.label}
                  </span>
                </div>
                <p className="text-sm text-pink-600 font-medium">{b.service_name} · <span className="font-bold">${b.service_price}</span></p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {b.booking_date} at {b.booking_time} · {b.customer_email}
                  {b.customer_phone && ` · ${b.customer_phone}`}
                </p>
                {b.notes && <p className="text-xs text-muted-foreground italic mt-1">"{b.notes}"</p>}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {b.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(b.id, 'confirmed')}
                      disabled={updating === b.id}
                      className="flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={12} /> Confirm
                    </button>
                    <button
                      onClick={() => updateStatus(b.id, 'cancelled')}
                      disabled={updating === b.id}
                      className="flex items-center gap-1 bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <XCircle size={12} /> Cancel
                    </button>
                  </>
                )}
                {b.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => updateStatus(b.id, 'completed')}
                      disabled={updating === b.id}
                      className="flex items-center gap-1 bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={12} /> Complete
                    </button>
                    <button
                      onClick={() => updateStatus(b.id, 'cancelled')}
                      disabled={updating === b.id}
                      className="flex items-center gap-1 bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <XCircle size={12} /> Cancel
                    </button>
                  </>
                )}
                {(b.status === 'cancelled' || b.status === 'completed') && (
                  <span className="text-xs text-muted-foreground py-1.5">No actions</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}