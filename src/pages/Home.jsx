import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Star, ArrowRight, Heart } from 'lucide-react';

const services = [
  { name: 'Classic Manicure', category: 'manicure', price: '$35', icon: '💅' },
  { name: 'Gel Pedicure', category: 'pedicure', price: '$55', icon: '✨' },
  { name: 'Acrylic Full Set', category: 'extensions', price: '$75', icon: '💎' },
  { name: 'Nail Art', category: 'nail_art', price: '$25+', icon: '🎨' },
  { name: 'Press-ons', category: 'press_ons', price: '$45', icon: '🌸' },
  { name: 'Nail Repair', category: 'repairs', price: '$15', icon: '🔧' },
];

export default function Home() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative text-center py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-pink-200 rounded-full opacity-30 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-pink-300 rounded-full opacity-20 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles size={14} />
            Luxury nail experience
          </div>

          <h1 className="font-playfair text-6xl md:text-8xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-600 via-pink-500 to-pink-400 bg-clip-text text-transparent">
              BOOKED
            </span>
          </h1>

          <p className="font-inter text-pink-500 text-xl md:text-2xl font-light mb-3 italic font-playfair">
            Where every nail tells a story.
          </p>

          <p className="font-inter text-muted-foreground max-w-md mx-auto mb-10 text-sm leading-relaxed">
            Book your next nail appointment effortlessly. Premium services, loyalty rewards, and a seamless experience — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book"
              className="chrome-button shine-overlay text-white font-medium px-8 py-3.5 rounded-full flex items-center justify-center gap-2 text-sm"
            >
              Book Appointment <ArrowRight size={16} />
            </Link>
            <Link
              to="/services"
              className="border border-pink-200 text-pink-600 font-medium px-8 py-3.5 rounded-full hover:bg-pink-50 transition-colors text-sm"
            >
              View Services
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features strip */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Calendar, title: 'Easy Booking', desc: 'Pick your service, choose a time, and confirm in seconds.' },
          { icon: Star, title: 'Loyalty Rewards', desc: 'Earn points with every visit. Unlock exclusive perks as you rise through tiers.' },
          { icon: Heart, title: 'Premium Care', desc: 'Every service crafted with precision, love, and luxury products.' },
        ].map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 + 0.3 }}
            className="glass-card rounded-2xl p-6 text-center"
          >
            <div className="w-12 h-12 chrome-card rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon size={22} className="text-pink-600" />
            </div>
            <h3 className="font-playfair text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Services preview */}
      <section>
        <div className="text-center mb-10">
          <h2 className="font-playfair text-4xl font-bold text-foreground mb-2">Our Services</h2>
          <p className="text-muted-foreground font-inter text-sm">Handcrafted beauty, tailored for you.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 + 0.2 }}
              className="chrome-card rounded-2xl p-5 text-center hover:scale-105 transition-transform duration-300 cursor-pointer shine-overlay"
            >
              <span className="text-3xl block mb-3">{s.icon}</span>
              <h3 className="font-playfair font-semibold text-foreground text-sm">{s.name}</h3>
              <p className="text-pink-500 font-medium text-sm mt-1">{s.price}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/services" className="text-pink-500 hover:text-pink-700 text-sm font-medium inline-flex items-center gap-1 transition-colors">
            View all services <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Loyalty teaser */}
      <section className="chrome-card rounded-3xl p-10 text-center shine-overlay">
        <Star size={32} className="text-pink-500 mx-auto mb-4" />
        <h2 className="font-playfair text-3xl font-bold text-foreground mb-3">
          Join Our Loyalty Program
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm leading-relaxed">
          Earn points with every visit. Rise from Bronze to Diamond and unlock exclusive discounts, free services, and VIP perks.
        </p>
        <Link
          to="/loyalty"
          className="chrome-button text-white font-medium px-8 py-3 rounded-full inline-flex items-center gap-2 text-sm"
        >
          <Star size={14} /> View Loyalty Program
        </Link>
      </section>
    </div>
  );
}