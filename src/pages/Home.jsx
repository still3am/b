import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Sparkles, ArrowRight, Calendar, Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

const SERVICES = [
  { name: 'Classic Manicure', price: '$35', icon: '💅', cat: 'Manicure' },
  { name: 'Gel Manicure', price: '$50', icon: '✨', cat: 'Manicure' },
  { name: 'Acrylic Full Set', price: '$75', icon: '💎', cat: 'Extensions' },
  { name: 'Classic Pedicure', price: '$45', icon: '🦶', cat: 'Pedicure' },
  { name: 'Nail Art Design', price: '$25+', icon: '🎨', cat: 'Nail Art' },
  { name: 'Custom Press-ons', price: '$45', icon: '🌸', cat: 'Press-ons' },
];

const TESTIMONIALS = [
  { name: 'Sofia M.', tier: 'diamond', quote: 'Absolutely obsessed with every visit. The gel manicure lasted 4 weeks — unreal quality!', stars: 5 },
  { name: 'Aria K.', tier: 'gold', quote: 'The booking experience is so seamless, and the loyalty points make it even better. Gold member for life!', stars: 5 },
  { name: 'Luna R.', tier: 'silver', quote: 'Best nail salon I\'ve ever been to. The press-ons are literally art pieces. Worth every penny.', stars: 5 },
];

function StatCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const step = Math.ceil(target / 60);
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev + step >= target) { clearInterval(interval); return target; }
        return prev + step;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const tierMap = { bronze: 'tier-bronze', silver: 'tier-silver', gold: 'tier-gold', diamond: 'tier-diamond' };
const tierIcons = { bronze: '🥉', silver: '🥈', gold: '🥇', diamond: '💎' };

export default function Home() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const t = setInterval(() => {
      setDirection(1);
      setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const goTo = (i) => {
    setDirection(i > testimonialIdx ? 1 : -1);
    setTestimonialIdx(i);
  };

  const t = TESTIMONIALS[testimonialIdx];

  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="relative text-center py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-5 py-2.5 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <Sparkles size={13} className="text-pink-500" />
            <span className="text-sm font-dm font-medium text-pink-700">Now accepting bookings</span>
          </div>

          <h1 className="font-cormorant text-7xl md:text-9xl font-bold gradient-text mb-4 leading-none">BOOKED</h1>
          <p className="font-cormorant italic text-xl md:text-3xl text-pink-500 mb-4 font-light">Where every nail tells a story.</p>
          <p className="font-dm text-muted-foreground max-w-md mx-auto mb-10 text-sm leading-relaxed">
            Premium services, loyalty rewards, and a seamless booking experience — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link to="/book" className="chrome-button font-dm font-medium px-8 py-3.5 rounded-full flex items-center justify-center gap-2 text-sm">
              Book Appointment <ArrowRight size={16} />
            </Link>
            <Link to="/services" className="glass-card text-pink-600 font-dm font-medium px-8 py-3.5 rounded-full hover:border-pink-300 transition-all text-sm flex items-center justify-center">
              View Services
            </Link>
          </div>

          {/* Social proof */}
          <div className="inline-flex items-center gap-3 chrome-card rounded-full px-5 py-2.5">
            <div className="flex -space-x-2">
              {['💅','✨','🌸','💎'].map((e, i) => (
                <div key={i} className="w-8 h-8 chrome-card rounded-full flex items-center justify-center text-sm border border-pink-200" style={{ zIndex: 4 - i }}>
                  {e}
                </div>
              ))}
            </div>
            <span className="font-dm text-xs text-pink-700 font-medium">2,400+ happy clients this year</span>
          </div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: '👩‍💅', label: 'Happy Clients', target: 2400, suffix: '+' },
          { icon: '⭐', label: 'Satisfaction Rate', target: 98, suffix: '%' },
          { icon: '💎', label: 'Loyalty Points Given', target: 4700, suffix: '+' },
        ].map(({ icon, label, target, suffix }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className="glass-card rounded-2xl p-6 text-center"
          >
            <div className="text-2xl mb-2">{icon}</div>
            <p className="font-cormorant text-4xl font-bold gradient-text">
              <StatCounter target={target} suffix={suffix} />
            </p>
            <p className="font-dm text-muted-foreground text-sm mt-1">{label}</p>
          </motion.div>
        ))}
      </section>

      {/* Features strip */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Calendar, title: 'Easy Booking', desc: 'Pick your service, choose a time, confirm in seconds. No calls needed.' },
          { icon: Star, title: 'Loyalty Rewards', desc: 'Earn points with every visit. Unlock exclusive perks as you rise through tiers.' },
          { icon: Heart, title: 'Premium Quality', desc: 'Every service crafted with precision, love, and only the finest products.' },
        ].map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 + 0.2 }}
            className="glass-card rounded-2xl p-6 text-center hover-lift"
          >
            <div className="w-14 h-14 chrome-card rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon size={24} className="text-pink-600" />
            </div>
            <h3 className="font-cormorant text-xl font-semibold text-foreground mb-2">{title}</h3>
            <p className="font-dm text-muted-foreground text-sm leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Featured spotlight */}
      <section className="chrome-card shine-overlay rounded-3xl p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <span className="inline-block bg-pink-100 text-pink-600 text-xs font-dm font-medium px-3 py-1 rounded-full mb-4">Featured Service</span>
            <h2 className="font-cormorant text-4xl font-bold text-foreground mb-3">Gel Manicure</h2>
            <p className="font-dm text-muted-foreground text-sm mb-4 leading-relaxed max-w-sm">
              Long-lasting gel polish that stays chip-free for weeks. UV-cured perfection with a mirror finish.
            </p>
            <div className="flex gap-3 mb-6">
              <span className="glass-card rounded-full px-4 py-1.5 text-xs font-dm text-pink-600">⏱ 60 min</span>
              <span className="glass-card rounded-full px-4 py-1.5 text-xs font-dm text-pink-600">⭐ 15 pts</span>
            </div>
            <p className="font-cormorant text-4xl font-bold gradient-text mb-6">$50</p>
            <Link to="/book" className="chrome-button font-dm font-medium px-7 py-3 rounded-full inline-flex items-center gap-2 text-sm">
              Book Now <ArrowRight size={14} />
            </Link>
          </div>
          <div className="text-8xl md:text-9xl animate-float">✨</div>
        </div>
      </section>

      {/* Services preview */}
      <section>
        <div className="text-center mb-10">
          <h2 className="font-cormorant text-4xl font-bold text-foreground mb-2">Our Services</h2>
          <p className="font-dm text-muted-foreground text-sm">Handcrafted beauty, tailored for you.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 + 0.1 }}
              className="glass-card rounded-2xl p-5 text-center hover-lift cursor-pointer"
            >
              <span className="text-3xl block mb-3 transition-transform duration-300 hover:scale-110">{s.icon}</span>
              <p className="text-xs font-dm text-pink-500 font-medium mb-1">{s.cat}</p>
              <h3 className="font-cormorant font-semibold text-foreground text-base">{s.name}</h3>
              <p className="gradient-text font-cormorant font-bold text-lg mt-1">{s.price}</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/services" className="text-pink-500 hover:text-pink-700 font-dm text-sm font-medium inline-flex items-center gap-1 transition-colors">
            View all services <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <div className="text-center mb-8">
          <h2 className="font-cormorant text-4xl font-bold text-foreground mb-2">What Our Clients Say</h2>
        </div>
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={testimonialIdx}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.35 }}
              className="glass-card rounded-3xl p-8 text-center max-w-2xl mx-auto"
            >
              <div className="w-14 h-14 chrome-card rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-cormorant font-bold text-pink-700">
                {t.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex justify-center gap-1 mb-4">
                {Array(t.stars).fill(0).map((_, i) => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="font-cormorant italic text-xl text-foreground mb-4 leading-relaxed">"{t.quote}"</p>
              <p className="font-dm font-medium text-foreground mb-2">{t.name}</p>
              <span className={tierMap[t.tier]}>{tierIcons[t.tier]} {t.tier.charAt(0).toUpperCase() + t.tier.slice(1)}</span>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-5">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? 'bg-pink-500 w-5' : 'bg-pink-200'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Loyalty teaser */}
      <section className="chrome-card shine-overlay rounded-3xl p-10 text-center mb-8">
        <Star size={32} className="text-pink-500 mx-auto mb-4" />
        <h2 className="font-cormorant text-4xl font-bold text-foreground mb-3">Join Our Loyalty Program</h2>
        <p className="font-dm text-muted-foreground max-w-md mx-auto mb-6 text-sm leading-relaxed">
          Earn points with every visit. Rise from Bronze to Diamond and unlock exclusive discounts, free services, and VIP perks.
        </p>
        <Link to="/loyalty" className="chrome-button font-dm font-medium px-8 py-3 rounded-full inline-flex items-center gap-2 text-sm">
          <Star size={14} /> Explore Rewards
        </Link>
      </section>
    </div>
  );
}