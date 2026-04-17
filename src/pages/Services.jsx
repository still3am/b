import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';
import SkeletonCard from '@/components/SkeletonCard';

const categoryLabels = { manicure:'Manicure', pedicure:'Pedicure', nail_art:'Nail Art', extensions:'Extensions', press_ons:'Press-ons', repairs:'Repairs' };
const categoryIcons = { manicure:'💅', pedicure:'🦶', nail_art:'🎨', extensions:'💎', press_ons:'🌸', repairs:'🔧' };

const SAMPLE_SERVICES = [
  { id:'1', name:'Classic Manicure', category:'manicure', price:35, duration_minutes:45, loyalty_points:10, description:'Clean, shape, and polish with your choice of regular nail polish.' },
  { id:'2', name:'Gel Manicure', category:'manicure', price:50, duration_minutes:60, loyalty_points:15, description:'Long-lasting gel polish that stays chip-free for weeks.' },
  { id:'3', name:'Acrylic Full Set', category:'extensions', price:75, duration_minutes:90, loyalty_points:20, description:'Full set of acrylic nail extensions, shaped and polished.' },
  { id:'4', name:'Classic Pedicure', category:'pedicure', price:45, duration_minutes:50, loyalty_points:12, description:'Soak, exfoliate, trim, and polish for beautiful feet.' },
  { id:'5', name:'Gel Pedicure', category:'pedicure', price:60, duration_minutes:65, loyalty_points:18, description:'All the benefits of a classic pedicure with long-lasting gel polish.' },
  { id:'6', name:'Nail Art Design', category:'nail_art', price:25, duration_minutes:30, loyalty_points:8, description:'Custom nail art — from simple florals to intricate designs.' },
  { id:'7', name:'Custom Press-ons', category:'press_ons', price:45, duration_minutes:30, loyalty_points:12, description:'Hand-crafted press-on nails customized to your style.' },
  { id:'8', name:'Nail Repair', category:'repairs', price:15, duration_minutes:20, loyalty_points:5, description:'Fix broken or chipped nails quickly and seamlessly.' },
];

export default function Services() {
  const [services, setServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Service.list()
      .then(data => setServices(data.filter(s => s.is_active !== false).length > 0 ? data.filter(s => s.is_active !== false) : SAMPLE_SERVICES))
      .catch(() => setServices(SAMPLE_SERVICES))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...Object.keys(categoryLabels)];
  const filtered = activeCategory === 'all' ? services : services.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-10">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 text-sm font-dm font-medium text-pink-600 mb-4">
          <Sparkles size={14} /> All Services
        </div>
        <h1 className="font-cormorant text-5xl md:text-6xl font-bold text-foreground mb-2">Our Menu</h1>
        <p className="font-dm text-muted-foreground text-sm">Choose your indulgence.</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-dm font-medium transition-all duration-200 ${
              activeCategory === cat ? 'chrome-button' : 'glass-card text-pink-600 hover:border-pink-300'
            }`}
          >
            {cat === 'all' ? 'All' : categoryLabels[cat]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl">
          <Sparkles size={32} className="text-pink-200 mx-auto mb-3" />
          <p className="font-dm text-muted-foreground text-sm">No services in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card rounded-2xl p-6 hover-lift flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 chrome-card rounded-xl flex items-center justify-center text-2xl">{categoryIcons[service.category]}</div>
                <span className="bg-pink-100 text-pink-600 text-xs font-dm font-medium px-2.5 py-1 rounded-full">{categoryLabels[service.category]}</span>
              </div>
              <h3 className="font-cormorant text-xl font-semibold text-foreground mb-1">{service.name}</h3>
              <p className="font-dm text-muted-foreground text-xs leading-relaxed mb-4 flex-1">{service.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 font-dm"><Clock size={12} /> {service.duration_minutes}m</span>
                  <span className="gradient-text font-cormorant font-bold text-lg">${service.price}</span>
                </div>
                <Link
                  to={`/book?service=${service.id}`}
                  className="chrome-button font-dm text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1"
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