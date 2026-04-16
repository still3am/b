import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Clock, DollarSign, Calendar, Sparkles } from 'lucide-react';

const SAMPLE_SERVICES = [
  { id: '1', name: 'Classic Manicure', category: 'manicure', price: 35, duration_minutes: 45, loyalty_points: 10 },
  { id: '2', name: 'Gel Manicure', category: 'manicure', price: 50, duration_minutes: 60, loyalty_points: 15 },
  { id: '3', name: 'Acrylic Full Set', category: 'extensions', price: 75, duration_minutes: 90, loyalty_points: 20 },
  { id: '4', name: 'Classic Pedicure', category: 'pedicure', price: 45, duration_minutes: 50, loyalty_points: 12 },
  { id: '5', name: 'Gel Pedicure', category: 'pedicure', price: 60, duration_minutes: 65, loyalty_points: 18 },
  { id: '6', name: 'Nail Art Design', category: 'nail_art', price: 25, duration_minutes: 30, loyalty_points: 8 },
  { id: '7', name: 'Custom Press-ons', category: 'press_ons', price: 45, duration_minutes: 30, loyalty_points: 12 },
  { id: '8', name: 'Nail Repair', category: 'repairs', price: 15, duration_minutes: 20, loyalty_points: 5 },
];

const DEFAULT_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

const categoryIcons = { manicure:'💅', pedicure:'🦶', nail_art:'🎨', extensions:'💎', press_ons:'🌸', repairs:'🔧' };

function getNext14Days() {
  const days = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    if (dow !== 0) days.push(d); // skip Sundays
  }
  return days;
}

export default function Book() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState(DEFAULT_SLOTS);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Service.list()
      .then(data => setServices(data.length > 0 ? data : SAMPLE_SERVICES))
      .catch(() => setServices(SAMPLE_SERVICES));
    base44.auth.me().then(u => {
      setUser(u);
      setForm(f => ({ ...f, name: u.full_name || '', email: u.email || '' }));
    }).catch(() => {});

    // Pre-select service from URL param
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('service');
    if (sid) {
      const found = SAMPLE_SERVICES.find(s => s.id === sid);
      if (found) { setSelectedService(found); setStep(2); }
    }
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    Promise.all([
      base44.entities.Availability.filter({ date: dateStr }),
      base44.entities.Booking.filter({ booking_date: dateStr, status: 'confirmed' }),
    ]).then(([avail, bookings]) => {
      setBookedSlots(bookings.map(b => b.booking_time));
      if (avail.length > 0 && avail[0].available_slots?.length > 0) {
        setAvailableSlots(avail[0].available_slots);
      } else if (avail.length > 0 && avail[0].is_blocked) {
        setAvailableSlots([]);
      } else {
        setAvailableSlots(DEFAULT_SLOTS);
      }
    }).catch(() => setAvailableSlots(DEFAULT_SLOTS));
  }, [selectedDate]);

  const freeSlots = availableSlots.filter(s => !bookedSlots.includes(s));
  const days = getNext14Days();

  const handleSubmit = async () => {
    setSubmitting(true);
    const dateStr = selectedDate.toISOString().split('T')[0];
    await base44.entities.Booking.create({
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      service_id: selectedService.id,
      service_name: selectedService.name,
      service_price: selectedService.price,
      booking_date: dateStr,
      booking_time: selectedTime,
      notes: form.notes,
      loyalty_points_earned: selectedService.loyalty_points || 10,
      status: 'pending',
      user_id: user?.id || '',
    });

    // Update loyalty points if logged in
    if (user) {
      const accounts = await base44.entities.LoyaltyAccount.filter({ user_email: user.email });
      const pts = selectedService.loyalty_points || 10;
      if (accounts.length > 0) {
        const acc = accounts[0];
        const newTotal = (acc.total_points || 0) + pts;
        const lifetime = (acc.lifetime_points || 0) + pts;
        const tier = lifetime >= 500 ? 'diamond' : lifetime >= 200 ? 'gold' : lifetime >= 75 ? 'silver' : 'bronze';
        await base44.entities.LoyaltyAccount.update(acc.id, {
          total_points: newTotal, lifetime_points: lifetime,
          total_visits: (acc.total_visits || 0) + 1, tier,
        });
      } else {
        await base44.entities.LoyaltyAccount.create({
          user_id: user.id, user_email: user.email, user_name: user.full_name,
          total_points: pts, lifetime_points: pts, total_visits: 1, tier: 'bronze',
        });
      }
    }
    setDone(true);
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="w-24 h-24 chrome-card rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-pink-600" />
          </div>
          <h2 className="font-playfair text-4xl font-bold text-foreground mb-3">You're Booked!</h2>
          <p className="text-muted-foreground mb-2">
            <strong>{selectedService.name}</strong> on{' '}
            <strong>{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong> at <strong>{selectedTime}</strong>
          </p>
          <p className="text-pink-500 text-sm mb-8">+{selectedService.loyalty_points} loyalty points earned ✨</p>
          <button
            onClick={() => navigate('/')}
            className="chrome-button text-white font-medium px-8 py-3 rounded-full"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-playfair text-5xl font-bold text-foreground mb-2">Book an Appointment</h1>
        <p className="text-muted-foreground text-sm">Three simple steps to your perfect nails.</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {[1,2,3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              step >= s ? 'chrome-button text-white' : 'bg-pink-100 text-pink-400'
            }`}>
              {step > s ? <Check size={14} /> : s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-pink-400' : 'bg-pink-100'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select service */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-playfair text-2xl font-semibold mb-6 text-center">Choose your service</h2>
            <div className="grid gap-3">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedService(s); setStep(2); }}
                  className={`glass-card rounded-2xl p-4 flex items-center gap-4 text-left hover:border-pink-300 transition-all ${
                    selectedService?.id === s.id ? 'border-2 border-pink-400' : ''
                  }`}
                >
                  <span className="text-2xl">{categoryIcons[s.category]}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground font-inter">{s.name}</p>
                    <p className="text-muted-foreground text-xs mt-0.5 flex items-center gap-2">
                      <Clock size={10} /> {s.duration_minutes}m
                    </p>
                  </div>
                  <span className="text-pink-600 font-bold font-inter">${s.price}</span>
                  <ChevronRight size={16} className="text-pink-300" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Select date & time */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="glass-card rounded-2xl p-4 flex items-center gap-3 mb-6">
              <span className="text-xl">{categoryIcons[selectedService?.category]}</span>
              <div>
                <p className="font-semibold font-inter">{selectedService?.name}</p>
                <p className="text-pink-500 text-sm">${selectedService?.price} · {selectedService?.duration_minutes}m</p>
              </div>
              <button onClick={() => setStep(1)} className="ml-auto text-pink-400 hover:text-pink-600 text-xs">Change</button>
            </div>

            <h2 className="font-playfair text-2xl font-semibold mb-4 text-center">Pick a date</h2>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
              {days.map(d => {
                const isSelected = selectedDate?.toDateString() === d.toDateString();
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                    className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl text-xs font-medium transition-all ${
                      isSelected ? 'chrome-button text-white' : 'glass-card hover:border-pink-300'
                    }`}
                  >
                    <span className="uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="text-lg font-bold mt-1">{d.getDate()}</span>
                    <span>{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <>
                <h2 className="font-playfair text-2xl font-semibold mb-4 text-center">Pick a time</h2>
                {freeSlots.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No availability on this day. Please choose another date.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {freeSlots.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                          selectedTime === t ? 'chrome-button text-white' : 'glass-card hover:border-pink-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 border border-pink-200 text-pink-600 px-5 py-2.5 rounded-full text-sm hover:bg-pink-50 transition-colors">
                <ChevronLeft size={14} /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 chrome-button text-white font-medium py-2.5 rounded-full text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                Continue <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Contact & confirm */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="glass-card rounded-2xl p-4 mb-6 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles size={14} className="text-pink-400" />
                <span className="font-semibold">{selectedService?.name}</span>
                <span className="text-pink-500 font-bold ml-auto">${selectedService?.price}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={14} className="text-pink-300" />
                {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
              </div>
            </div>

            <h2 className="font-playfair text-2xl font-semibold mb-5 text-center">Your details</h2>
            <div className="space-y-3">
              {[
                { key: 'name', placeholder: 'Full Name *', type: 'text' },
                { key: 'email', placeholder: 'Email *', type: 'email' },
                { key: 'phone', placeholder: 'Phone Number', type: 'tel' },
              ].map(f => (
                <input
                  key={f.key}
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full glass-card rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 transition-colors placeholder:text-muted-foreground"
                />
              ))}
              <textarea
                placeholder="Any special requests? (optional)"
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                rows={3}
                className="w-full glass-card rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 transition-colors placeholder:text-muted-foreground resize-none"
              />
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(2)} className="flex items-center gap-1 border border-pink-200 text-pink-600 px-5 py-2.5 rounded-full text-sm hover:bg-pink-50 transition-colors">
                <ChevronLeft size={14} /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.name || !form.email || submitting}
                className="flex-1 chrome-button text-white font-medium py-2.5 rounded-full text-sm disabled:opacity-40 flex items-center justify-center gap-1"
              >
                {submitting ? 'Booking...' : 'Confirm Booking'} {!submitting && <Check size={14} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}