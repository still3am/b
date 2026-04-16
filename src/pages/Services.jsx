import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Clock, DollarSign, ArrowRight, Sparkles } from 'lucide-react';

const categoryLabels = {
  manicure: 'Manicure',
  pedicure: 'Pedicure',
  nail_art: 'Nail Art',
  extensions: 'Extensions',
  press_ons: 'Press-ons',
  repairs: 'Repairs',
};

const categoryIcons = {
  manicure: '💅', pedicure: '🦶', nail_art: '🎨',
  extensions: '💎', press_ons: '🌸', repairs: '🔧',
};

const SAMPLE_SERVICES = [
  { id: '1', name: 'Classic Manicure', category: 'manicure', price: 35, duration_minutes: 45, description: 'Clean, shape, and polish with your choice of regular nail polish.', loyalty_points: 10 },
  { id: '2', name: 'Gel Manicure', category: 'manicure', price: 50, duration_minutes: 60, description: 'Long-lasting gel polish that stays chip-free for weeks.', loyalty_points: 15 },
  { id: '3', name: 'Acrylic Full Set', category: 'extensions', price: 75, duration_minutes: 90, description: 'Full set of acrylic nail extensions, shaped and polished.', loyalty_points: 20 },
  { id: '4', name: 'Classic Pedicure', category: 'pedicure', price: 45, duration_minutes: 50, description: 'Soak, exfoliate, trim, and polish for beautiful feet.', loyalty_points: 12 },
  { id: '5', name: 'Gel Pedicure', category: 'pedicure', price: 60, duration_minutes: 65, description: 'All the benefits of a classic pedicure with long-lasting gel polish.', loyalty_points: 18 },
  { id: '6', name: 'Nail Art Design', category: 'nail_art', price: 25, duration_minutes: 30, description: 'Custom nail art — from simple florals to intricate designs.', loyalty_points: 8 },
  { id: '7', name: 'Custom Press-ons', category: 'press_ons', price: 45, duration_minutes: 30, description: 'Hand-crafted press-on nails customized to your style.', loyalty_points: 12 },
  { id: '8', name: 'Nail Repair', category: 'repairs', price: 15, duration_minutes: 20, description: 'Fix broken or chipped nails quickly and seamlessly.', loyalty_points: 5 },
];

export default function Services() {
  const [services, setServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Service.list()
      .then(data => setServices(data.length > 0 ? data : SAMPLE_SERVICES))
      .catch(() => setServices(SAMPLE_SERVICES))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...Object.keys(categoryLabels)];
  const filtered = activeCategory === 'all' ? services : services.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-10">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <Sparkles size={14} /> All Services
        </div>
        <h1 className="font-playfair text-5xl font-bold text-foreground mb-2">Our Menu</h1>
        <p className="text-muted-foreground font-inter text-sm">Choose your indulgence.</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium font-inter transition-all duration-200 ${
              activeCategory === cat
                ? 'chrome-button text-white'
                : 'border border-pink-200 text-pink-600 hover:bg-pink-50'
            }`}
          >
            {cat === 'all' ? 'All' : categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Services grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 animate-pulse h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{categoryIcons[service.category]}</span>
                <span className="bg-pink-100 text-pink-600 text-xs font-medium px-2.5 py-1 rounded-full">
                  {categoryLabels[service.category]}
                </span>
              </div>
              <h3 className="font-playfair text-lg font-semibold text-foreground mb-1">{service.name}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed mb-4 flex-1">{service.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock size={12} /> {service.duration_minutes}m</span>
                  <span className="flex items-center gap-1 text-pink-500 font-semibold"><DollarSign size={12} />{service.price}</span>
                </div>
                <Link
                  to={`/book?service=${service.id}`}
                  className="chrome-button text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1"
                >
                  Book <ArrowRight size={10} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}