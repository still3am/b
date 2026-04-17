import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Clock, Calendar, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_SERVICES = [
  { id:'1', name:'Classic Manicure', category:'manicure', price:35, duration_minutes:45, loyalty_points:10 },
  { id:'2', name:'Gel Manicure', category:'manicure', price:50, duration_minutes:60, loyalty_points:15 },
  { id:'3', name:'Acrylic Full Set', category:'extensions', price:75, duration_minutes:90, loyalty_points:20 },
  { id:'4', name:'Classic Pedicure', category:'pedicure', price:45, duration_minutes:50, loyalty_points:12 },
  { id:'5', name:'Gel Pedicure', category:'pedicure', price:60, duration_minutes:65, loyalty_points:18 },
  { id:'6', name:'Nail Art Design', category:'nail_art', price:25, duration_minutes:30, loyalty_points:8 },
  { id:'7', name:'Custom Press-ons', category:'press_ons', price:45, duration_minutes:30, loyalty_points:12 },
  { id:'8', name:'Nail Repair', category:'repairs', price:15, duration_minutes:20, loyalty_points:5 },
];

const DEFAULT_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];
const categoryIcons = { manicure:'💅', pedicure:'🦶', nail_art:'🎨', extensions:'💎', press_ons:'🌸', repairs:'🔧' };
const categoryLabels = { manicure:'Manicure', pedicure:'Pedicure', nail_art:'Nail Art', extensions:'Extensions', press_ons:'Press-ons', repairs:'Repairs' };

function getNext14Days() {
  const days = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    if (d.getDay() !== 0) days.push(d);
  }
  return days;
}

function formatPhone(val) {
  const digits = val.replace(/\D/g, '').slice(0, 10);
  if (digits.length >= 7) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  if (digits.length >= 4) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  if (digits.length >= 1) return `(${digits}`;
  return '';
}

export default function Book() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState(DEFAULT_SLOTS);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Service.list()
      .then(data => setServices(data.filter(s => s.is_active !== false).length > 0 ? data.filter(s => s.is_active !== false) : SAMPLE_SERVICES))
      .catch(() => setServices(SAMPLE_SERVICES));

    base44.auth.me().then(u => {
      setUser(u);
      setForm(f => ({ ...f, name: u.full_name || '', email: u.email || '' }));
    }).catch(() => {});

    const params = new URLSearchParams(window.location.search);
    const sid = params.get('service');
    if (sid) {
      const found = SAMPLE_SERVICES.find(s => s.id === sid);
      if (found) { setSelectedService(found); setStep(2); }
    }
  }, []);

  const loadSlots = useCallback(async (date) => {
    if (!date) return;
    setLoadingSlots(true);
    setSelectedTime(null);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const [avail, bookings] = await Promise.all([
        base44.entities.Availability.filter({ date: dateStr }),
        base44.entities.Booking.filter({ booking_date: dateStr }),
      ]);
      const booked = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').map(b => b.booking_time);
      const slots = avail.length > 0 && avail[0].is_blocked ? [] :
        avail.length > 0 && avail[0].available_slots?.length > 0 ? avail[0].available_slots : DEFAULT_SLOTS;
      setAvailableSlots(slots.filter(s => !booked.includes(s)));
    } catch {
      setAvailableSlots(DEFAULT_SLOTS);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => { loadSlots(selectedDate); }, [selectedDate, loadSlots]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const existing = await base44.entities.Booking.filter({ booking_date: dateStr, booking_time: selectedTime, status: 'confirmed' });
      if (existing.length > 0) {
        setErrors({ submit: 'Sorry, that slot was just taken. Please choose another time.' });
        await loadSlots(selectedDate);
        setStep(2);
        return;
      }

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

      if (user?.email) {
        try {
          const accounts = await base44.entities.LoyaltyAccount.filter({ user_email: user.email });
          const pts = selectedService.loyalty_points || 10;
          if (accounts.length > 0) {
            const acc = accounts[0];
            const lifetime = (acc.lifetime_points || 0) + pts;
            const tier = lifetime >= 500 ? 'diamond' : lifetime >= 200 ? 'gold' : lifetime >= 75 ? 'silver' : 'bronze';
            await base44.entities.LoyaltyAccount.update(acc.id, {
              total_points: (acc.total_points || 0) + pts,
              lifetime_points: lifetime,
              total_visits: (acc.total_visits || 0) + 1,
              tier,
            });
          } else {
            await base44.entities.LoyaltyAccount.create({
              user_id: user.id, user_email: user.email, user_name: user.full_name,
              total_points: pts, lifetime_points: pts, total_visits: 1, tier: 'bronze',
            });
          }
        } catch (e) { console.warn('Loyalty update failed', e); }
      }

      confetti({ particleCount: 100, spread: 80, colors: ['#f472b6','#ec4899','#db2777','#ffffff','#ffd6e8'] });
      setDone(true);
    } catch (err) {
      setErrors({ submit: 'Booking failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const days = getNext14Days();
  const filteredServices = activeCategory === 'all' ? services : services.filter(s => s.category === activeCategory);

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="w-24 h-24 chrome-card rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-pink-600" />
          </div>
          <h2 className="font-cormorant text-5xl font-bold gradient-text mb-3">Booked!</h2>
          <p className="font-dm text-muted-foreground text-sm mb-1">
            <strong>{selectedService.name}</strong> on{' '}
            <strong>{selectedDate?.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}</strong> at <strong>{selectedTime}</strong>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-pink-500 text-sm font-dm mt-3 mb-8">
            <Star size={14} className="fill-pink-500" /> +{selectedService.loyalty_points} loyalty points earned
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/')} className="chrome-button font-dm font-medium px-7 py-3 rounded-full text-sm">Back to Home</button>
            <button onClick={() => navigate('/loyalty')} className="glass-card text-pink-600 font-dm font-medium px-7 py-3 rounded-full text-sm hover:border-pink-300 transition-all">View Points</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-cormorant text-5xl font-bold text-foreground mb-2">Book an Appointment</h1>
        <p className="font-dm text-muted-foreground text-sm">Three simple steps to your perfect nails.</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {['Service', 'Date & Time', 'Details'].map((label, i) => {
          const s = i + 1;
          const done_ = step > s;
          const active = step === s;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-dm font-semibold transition-all relative ${
                  done_ ? 'bg-green-500 text-white' : active ? 'chrome-button text-white' : 'bg-pink-100 text-pink-400'
                }`}>
                  {active && <span className="absolute inset-0 rounded-full animate-ping bg-pink-400 opacity-25" />}
                  {done_ ? <Check size={15} /> : s}
                </div>
                <span className={`text-xs font-dm hidden sm:block ${active ? 'text-pink-600 font-medium' : 'text-pink-300'}`}>{label}</span>
              </div>
              {s < 3 && <div className={`w-10 h-0.5 mb-4 sm:mb-0 transition-all ${step > s ? 'bg-pink-400' : 'bg-pink-100'}`} />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1 */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
            <h2 className="font-cormorant text-2xl font-semibold mb-4 text-center">Choose your service</h2>
            <div className="flex flex-wrap gap-2 justify-center mb-5">
              {['all', ...Object.keys(categoryLabels)].map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-dm font-medium transition-all ${activeCategory===cat ? 'chrome-button' : 'glass-card text-pink-600'}`}>
                  {cat === 'all' ? 'All' : categoryLabels[cat]}
                </button>
              ))}
            </div>
            {filteredServices.length === 0 ? (
              <div className="text-center py-8 glass-card rounded-2xl">
                <p className="font-dm text-muted-foreground text-sm">No services in this category.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredServices.map(s => (
                  <button key={s.id} onClick={() => { setSelectedService(s); setStep(2); }}
                    className={`glass-card rounded-2xl p-4 flex items-center gap-4 text-left hover-lift transition-all ${selectedService?.id===s.id ? 'border-pink-400 border' : ''}`}>
                    <div className="w-12 h-12 chrome-card rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{categoryIcons[s.category]}</div>
                    <div className="flex-1">
                      <p className="font-cormorant font-semibold text-foreground text-lg">{s.name}</p>
                      <p className="font-dm text-muted-foreground text-xs flex items-center gap-2">
                        <Clock size={10} /> {s.duration_minutes}m &nbsp;·&nbsp; <Star size={10} /> {s.loyalty_points} pts
                      </p>
                    </div>
                    <span className="gradient-text font-cormorant font-bold text-2xl">${s.price}</span>
                    <ChevronRight size={16} className="text-pink-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
            <div className="glass-card rounded-2xl p-4 flex items-center gap-3 mb-6">
              <div className="w-10 h-10 chrome-card rounded-xl flex items-center justify-center text-xl">{categoryIcons[selectedService?.category]}</div>
              <div>
                <p className="font-cormorant font-semibold">{selectedService?.name}</p>
                <p className="font-dm text-pink-500 text-sm">${selectedService?.price} · {selectedService?.duration_minutes}m</p>
              </div>
              <button onClick={() => setStep(1)} className="ml-auto text-pink-400 hover:text-pink-600 text-xs font-dm">Change</button>
            </div>

            <h2 className="font-cormorant text-2xl font-semibold mb-4 text-center">Pick a date</h2>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
              {days.map(d => {
                const isSelected = selectedDate?.toDateString() === d.toDateString();
                return (
                  <button key={d.toISOString()} onClick={() => setSelectedDate(d)}
                    className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl text-xs font-dm font-medium transition-all border ${isSelected ? 'chrome-button border-transparent' : 'glass-card hover:border-pink-300'}`}>
                    <span className="uppercase text-[10px]">{d.toLocaleDateString('en-US',{weekday:'short'})}</span>
                    <span className="font-cormorant text-2xl font-bold mt-0.5">{d.getDate()}</span>
                    <span>{d.toLocaleDateString('en-US',{month:'short'})}</span>
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <>
                <h2 className="font-cormorant text-2xl font-semibold mb-4 text-center">Pick a time</h2>
                {loadingSlots ? (
                  <div className="grid grid-cols-4 gap-2">
                    {Array(8).fill(0).map((_,i) => <div key={i} className="skeleton-shimmer rounded-xl h-10" />)}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center glass-card rounded-2xl py-8">
                    <p className="font-dm text-muted-foreground text-sm">No availability on this day. Please choose another date.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map(t => (
                      <button key={t} onClick={() => setSelectedTime(t)}
                        className={`py-2.5 rounded-xl text-sm font-dm font-medium transition-all ${selectedTime===t ? 'chrome-button' : 'glass-card hover:border-pink-300'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {errors.submit && (
              <p className="text-red-500 text-sm font-dm text-center mt-4">{errors.submit}</p>
            )}

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 glass-card text-pink-600 px-5 py-2.5 rounded-full text-sm font-dm hover:border-pink-300 transition-all">
                <ChevronLeft size={14} /> Back
              </button>
              <button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime}
                className="flex-1 chrome-button font-dm font-medium py-2.5 rounded-full text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1">
                Continue <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
            <div className="chrome-card shine-overlay rounded-2xl p-4 mb-6 space-y-2">
              <div className="flex items-center gap-2 text-sm font-dm">
                <Sparkles size={14} className="text-pink-400" />
                <span className="font-cormorant font-semibold text-lg">{selectedService?.name}</span>
                <span className="gradient-text font-cormorant font-bold text-xl ml-auto">${selectedService?.price}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-dm text-muted-foreground">
                <Calendar size={12} className="text-pink-300" />
                {selectedDate?.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})} at {selectedTime}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-dm text-pink-500">
                <Star size={11} className="fill-pink-400 text-pink-400" /> +{selectedService?.loyalty_points} loyalty points earned
              </div>
            </div>

            <h2 className="font-cormorant text-2xl font-semibold mb-5 text-center">Your details</h2>
            <fieldset disabled={submitting} className="space-y-3">
              <div>
                <input type="text" placeholder="Full Name *" value={form.name}
                  onChange={e => setForm(p => ({...p, name: e.target.value}))}
                  className={`input-field ${errors.name ? 'border-red-400' : ''}`} />
                {errors.name && <p className="text-red-500 text-xs font-dm mt-1 ml-1">{errors.name}</p>}
              </div>
              <div>
                <input type="email" placeholder="Email *" value={form.email}
                  onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  className={`input-field ${errors.email ? 'border-red-400' : ''}`} />
                {errors.email && <p className="text-red-500 text-xs font-dm mt-1 ml-1">{errors.email}</p>}
              </div>
              <input type="tel" placeholder="Phone Number" value={form.phone}
                onChange={e => setForm(p => ({...p, phone: formatPhone(e.target.value)}))}
                className="input-field" />
              <textarea placeholder="Any special requests? (optional)" value={form.notes}
                onChange={e => setForm(p => ({...p, notes: e.target.value}))}
                rows={3} className="input-field resize-none" />
            </fieldset>

            {errors.submit && <p className="text-red-500 text-sm font-dm text-center mt-3">{errors.submit}</p>}

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(2)} className="flex items-center gap-1 glass-card text-pink-600 px-5 py-2.5 rounded-full text-sm font-dm hover:border-pink-300 transition-all">
                <ChevronLeft size={14} /> Back
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 chrome-button font-dm font-medium py-2.5 rounded-full text-sm disabled:opacity-40 flex items-center justify-center gap-1">
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Booking...</>
                ) : (
                  <>Confirm Booking <Check size={14} /></>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}