import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const DEFAULT_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availability, setAvailability] = useState({});
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all availability records for this month
    setLoading(true);
    const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    Promise.all([
      base44.entities.Availability.list(),
      base44.entities.Booking.filter({ status: 'confirmed' }),
    ]).then(([avail, bkgs]) => {
      const map = {};
      avail.forEach(a => { map[a.date] = a; });
      setAvailability(map);
      setBookings(bkgs);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [currentMonth, currentYear]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11); }
    else setCurrentMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0); }
    else setCurrentMonth(m => m + 1);
    setSelectedDate(null);
  };

  const getDayStatus = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const avail = availability[dateStr];
    const d = new Date(currentYear, currentMonth, day);
    if (d.getDay() === 0) return 'closed'; // Sunday
    if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return 'past';
    if (avail?.is_blocked) return 'blocked';
    const dayBookings = bookings.filter(b => b.booking_date === dateStr);
    const slots = avail?.available_slots || DEFAULT_SLOTS;
    if (dayBookings.length >= slots.length) return 'full';
    if (dayBookings.length >= slots.length * 0.7) return 'limited';
    return 'available';
  };

  const selectedDateStr = selectedDate
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
    : null;
  const selectedAvail = selectedDateStr ? (availability[selectedDateStr] || {}) : {};
  const selectedSlots = selectedAvail.available_slots || DEFAULT_SLOTS;
  const selectedBookings = bookings.filter(b => b.booking_date === selectedDateStr);
  const bookedTimes = selectedBookings.map(b => b.booking_time);

  const statusColors = {
    available: 'bg-green-100 text-green-700 hover:bg-green-200',
    limited: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    full: 'bg-red-100 text-red-400 cursor-not-allowed',
    blocked: 'bg-gray-100 text-gray-400 cursor-not-allowed',
    closed: 'bg-gray-50 text-gray-300 cursor-not-allowed',
    past: 'bg-transparent text-muted-foreground/40 cursor-not-allowed',
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <Calendar size={14} /> Availability Calendar
        </div>
        <h1 className="font-playfair text-5xl font-bold text-foreground mb-2">When to Book</h1>
        <p className="text-muted-foreground text-sm">See open slots before booking your appointment.</p>
      </div>

      <div className="glass-card rounded-3xl p-6">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="w-9 h-9 rounded-full border border-pink-200 flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <h2 className="font-playfair text-2xl font-semibold text-foreground">{monthName}</h2>
          <button onClick={nextMonth} className="w-9 h-9 rounded-full border border-pink-200 flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const status = getDayStatus(day);
            const isSelected = selectedDate === day;
            return (
              <button
                key={day}
                onClick={() => status !== 'past' && status !== 'closed' && setSelectedDate(day)}
                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                  isSelected ? 'chrome-button text-white' : statusColors[status]
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-5 justify-center text-xs">
          {[
            { color: 'bg-green-100', label: 'Available' },
            { color: 'bg-yellow-100', label: 'Limited spots' },
            { color: 'bg-red-100', label: 'Full' },
            { color: 'bg-gray-100', label: 'Closed / Blocked' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected day time slots */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6"
        >
          <h3 className="font-playfair text-xl font-semibold mb-4">
            {new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          {selectedAvail.is_blocked ? (
            <p className="text-muted-foreground text-sm text-center py-4">This day is closed / blocked.</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {selectedSlots.map(slot => {
                const isBooked = bookedTimes.includes(slot);
                return (
                  <div
                    key={slot}
                    className={`py-2 rounded-xl text-center text-xs font-medium ${
                      isBooked ? 'bg-red-50 text-red-300 line-through' : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {slot}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}