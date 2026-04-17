import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Lock, Unlock, Save } from 'lucide-react';

const DEFAULT_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

export default function AdminCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [availability, setAvailability] = useState({});
  const [bookings, setBookings] = useState([]);
  const [editSlots, setEditSlots] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [existingRecord, setExistingRecord] = useState(null);

  useEffect(() => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    Promise.all([
      base44.entities.Availability.list(),
      base44.entities.Booking.list(),
    ]).then(([avail, bkgs]) => {
      const map = {};
      avail.filter(a => a.date?.startsWith(monthStr)).forEach(a => { map[a.date] = a; });
      setAvailability(map);
      setBookings(bkgs.filter(b => b.booking_date?.startsWith(monthStr)));
    });
  }, [year, month]);

  const selectDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const avail = availability[dateStr];
    setSelectedDay(day);
    setExistingRecord(avail || null);
    setIsBlocked(avail?.is_blocked || false);
    setBlockReason(avail?.block_reason || '');
    setEditSlots(avail?.available_slots || DEFAULT_SLOTS);
  };

  const toggleSlot = (slot) => {
    setEditSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot].sort()
    );
  };

  const saveAvailability = async () => {
    if (!selectedDay) return;
    setSaving(true);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const data = { date: dateStr, is_blocked: isBlocked, block_reason: blockReason, available_slots: isBlocked ? [] : editSlots };
    if (existingRecord) {
      await base44.entities.Availability.update(existingRecord.id, data);
      setAvailability(prev => ({ ...prev, [dateStr]: { ...existingRecord, ...data } }));
    } else {
      const created = await base44.entities.Availability.create(data);
      setAvailability(prev => ({ ...prev, [dateStr]: created }));
      setExistingRecord(created);
    }
    setSaving(false);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const selectedDateStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const dayBookings = bookings.filter(b => b.booking_date === selectedDateStr);

  const getDayStatus = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const avail = availability[dateStr];
    const d = new Date(year, month, day);
    if (d.getDay() === 0) return 'sunday';
    if (avail?.is_blocked) return 'blocked';
    if (avail?.available_slots) return 'custom';
    return 'default';
  };

  const dayColors = {
    sunday: 'bg-gray-50 text-gray-300',
    blocked: 'bg-red-100 text-red-400',
    custom: 'bg-pink-100 text-pink-600',
    default: 'bg-white text-foreground hover:bg-pink-50',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-4xl font-bold text-foreground">Calendar Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Set availability, block days, customize time slots.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => { if (month === 0) { setYear(y => y-1); setMonth(11); } else setMonth(m => m-1); setSelectedDay(null); }}
              className="w-9 h-9 rounded-full border border-pink-200 flex items-center justify-center text-pink-500 hover:bg-pink-50">
              <ChevronLeft size={16} />
            </button>
            <h2 className="font-playfair text-xl font-semibold">{monthName}</h2>
            <button onClick={() => { if (month === 11) { setYear(y => y+1); setMonth(0); } else setMonth(m => m+1); setSelectedDay(null); }}
              className="w-9 h-9 rounded-full border border-pink-200 flex items-center justify-center text-pink-500 hover:bg-pink-50">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1;
              const status = getDayStatus(day);
              const isSelected = selectedDay === day;
              return (
                <button key={day} onClick={() => status !== 'sunday' && selectDay(day)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all border ${
                    isSelected ? 'chrome-button text-white border-transparent' : `${dayColors[status]} border-transparent`
                  } ${status === 'sunday' ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  {day}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-4 text-xs">
            {[
              { color: 'bg-white border border-gray-200', label: 'Default hours' },
              { color: 'bg-pink-100', label: 'Custom slots' },
              { color: 'bg-red-100', label: 'Blocked' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day editor */}
        <div className="glass-card rounded-3xl p-6">
          {!selectedDay ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <div className="text-5xl mb-3">📅</div>
                <p className="text-muted-foreground text-sm">Click a day to edit its availability.</p>
              </div>
            </div>
          ) : (
            <motion.div key={selectedDay} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-playfair text-xl font-semibold">
                  {new Date(year, month, selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <button
                  onClick={() => setIsBlocked(b => !b)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {isBlocked ? <><Lock size={11} /> Blocked</> : <><Unlock size={11} /> Open</>}
                </button>
              </div>

              {isBlocked ? (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Block Reason (optional)</label>
                  <input
                    value={blockReason}
                    onChange={e => setBlockReason(e.target.value)}
                    placeholder="e.g. Holiday, Staff unavailable..."
                    className="w-full glass-card rounded-xl px-3 py-2.5 text-sm outline-none focus:border-pink-400 transition-colors"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-muted-foreground">Available time slots (click to toggle)</p>
                    <div className="flex gap-2">
                      <button onClick={() => setEditSlots(DEFAULT_SLOTS)} className="text-xs text-pink-500 hover:text-pink-700">All</button>
                      <button onClick={() => setEditSlots([])} className="text-xs text-muted-foreground hover:text-foreground">None</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {DEFAULT_SLOTS.map(slot => (
                      <button
                        key={slot}
                        onClick={() => toggleSlot(slot)}
                        className={`py-2 rounded-lg text-xs font-medium transition-all ${
                          editSlots.includes(slot)
                            ? 'chrome-button text-white'
                            : 'bg-pink-50 text-pink-300 hover:bg-pink-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {dayBookings.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Bookings on this day ({dayBookings.length})</p>
                  <div className="space-y-1.5">
                    {dayBookings.map(b => (
                      <div key={b.id} className="flex items-center gap-2 text-xs bg-pink-50 rounded-lg px-3 py-2">
                        <span className="font-medium text-foreground">{b.booking_time}</span>
                        <span className="text-muted-foreground">{b.customer_name} — {b.service_name}</span>
                        <span className={`ml-auto ${b.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}`}>{b.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={saveAvailability}
                disabled={saving}
                className="w-full chrome-button text-white py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save Availability'}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}