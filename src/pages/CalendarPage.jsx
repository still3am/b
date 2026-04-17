import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const DEFAULT_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [availability, setAvailability] = useState({});
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      base44.entities.Availability.list(),
      base44.entities.Booking.filter({ status: 'confirmed' }),
    ]).then(([avail, bkgs]) => {
      const map = {};
      avail.forEach(a => { map[a.date] = a; });
      setAvailability(map);
      setBookings(bkgs);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => { if (month === 0) { setYear(y => y-1); setMonth(11); } else setMonth(m => m-1); setSelectedDay(null); };
  const nextMonth = () => { if (month === 11) { setYear(y => y+1); setMonth(0); } else setMonth(m => m+1); setSelectedDay(null); };

  const getDayStatus = (day) => {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const avail = availability[dateStr];
    const d = new Date(year, month, day);
    if (d.getDay() === 0) return 'closed';
    if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return 'past';
    if (avail?.is_blocked) return 'blocked';
    const dayBookings = bookings.filter(b => b.booking_date === dateStr);
    const slots = avail?.available_slots || DEFAULT_SLOTS;
    const pct = dayBookings.length / slots.length;
    if (pct >= 1) return 'full';
    if (pct >= 0.7) return 'limited';
    return 'available';
  };

  const selectedDateStr = selectedDay
    ? `${year}-${String(month+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`
    : null;
  const selectedAvail = selectedDateStr ? (availability[selectedDateStr] || {}) : {};
  const selectedSlots = selectedAvail.available_slots || DEFAULT_SLOTS;
  const bookedTimes = bookings.filter(b => b.booking_date === selectedDateStr).map(b => b.booking_time);

  const statusStyle = {
    available: 'bg-green-100 text-green-700 hover:bg-green-200',
    limited: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    full: 'bg-red-100 text-red-400 cursor-not-allowed',
    blocked: 'bg-gray-100 text-gray-400 cursor-not-allowed',
    closed: 'bg-gray-50 text-gray-300 cursor-not-allowed',
    past: 'bg-transparent text-muted-foreground/30 cursor-not-allowed',
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 text-sm font-dm font-medium text-pink-600 mb-4">
          <Calendar size={14} /> Availability Calendar
        </div>
        <h1 className="font-cormorant text-5xl font-bold text-foreground mb-2">When to Book</h1>
        <p className="font-dm text-muted-foreground text-sm">See open slots before booking your appointment.</p>
      </div>

      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-pink-500 hover:border-pink-300 transition-all">
            <ChevronLeft size={16} />
          </button>
          <h2 className="font-cormorant text-2xl font-semibold text-foreground">{monthName}</h2>
          <button onClick={nextMonth} className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-pink-500 hover:border-pink-300 transition-all">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="text-center text-xs font-dm font-medium text-muted-foreground py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array(firstDay).fill(null).map((_,i) => <div key={`e${i}`} />)}
          {Array(daysInMonth).fill(null).map((_,i) => {
            const day = i + 1;
            const status = getDayStatus(day);
            const isSelected = selectedDay === day;
            const clickable = status !== 'past' && status !== 'closed' && status !== 'full' && status !== 'blocked';
            return (
              <button key={day}
                onClick={() => clickable && setSelectedDay(day)}
                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-dm font-medium transition-all ${
                  isSelected ? 'chrome-button' : statusStyle[status]
                }`}>
                {day}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 mt-5 justify-center text-xs font-dm">
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

      {selectedDay && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-cormorant text-xl font-semibold">
              {new Date(year, month, selectedDay).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
            </h3>
            <Link
              to={`/book?date=${selectedDateStr}`}
              className="chrome-button font-dm text-xs font-medium px-4 py-2 rounded-full"
            >
              Book for this date →
            </Link>
          </div>
          {selectedAvail.is_blocked ? (
            <p className="font-dm text-muted-foreground text-sm text-center py-4">This day is closed / blocked.</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {selectedSlots.map(slot => {
                const isBooked = bookedTimes.includes(slot);
                return (
                  <div key={slot} className={`py-2 rounded-xl text-center text-xs font-dm font-medium ${isBooked ? 'bg-red-50 text-red-300 line-through' : 'bg-green-50 text-green-700'}`}>
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