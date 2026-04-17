import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check, Sparkles } from 'lucide-react';

const CATEGORIES = ['manicure','pedicure','nail_art','extensions','press_ons','repairs'];
const categoryLabels = { manicure:'Manicure', pedicure:'Pedicure', nail_art:'Nail Art', extensions:'Extensions', press_ons:'Press-ons', repairs:'Repairs' };
const categoryIcons = { manicure:'💅', pedicure:'🦶', nail_art:'🎨', extensions:'💎', press_ons:'🌸', repairs:'🔧' };

const emptyService = { name:'', category:'manicure', description:'', price:'', duration_minutes:'', loyalty_points:10, is_active:true };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyService);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    base44.entities.Service.list().then(setServices).finally(() => setLoading(false));
  };

  const openAdd = () => { setEditing(null); setForm(emptyService); setShowForm(true); };
  const openEdit = (s) => { setEditing(s); setForm({...s, price: s.price?.toString(), duration_minutes: s.duration_minutes?.toString()}); setShowForm(true); };

  const save = async () => {
    if (!form.name || !form.price || !form.duration_minutes) return;
    setSaving(true);
    const data = { ...form, price: Number(form.price), duration_minutes: Number(form.duration_minutes), loyalty_points: Number(form.loyalty_points) };
    try {
      if (editing) { await base44.entities.Service.update(editing.id, data); }
      else { await base44.entities.Service.create(data); }
      setShowForm(false);
      load();
    } catch {}
    setSaving(false);
  };

  const remove = async (id) => {
    setDeleting(id);
    try { await base44.entities.Service.delete(id); setServices(prev => prev.filter(s => s.id !== id)); } catch {}
    setDeleting(null);
    setConfirmDelete(null);
  };

  const toggleActive = async (s) => {
    await base44.entities.Service.update(s.id, { is_active: !s.is_active });
    setServices(prev => prev.map(x => x.id === s.id ? {...x, is_active: !x.is_active} : x));
  };

  const f = (key, val) => setForm(p => ({...p, [key]: val}));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cormorant text-4xl font-bold text-foreground">Services</h1>
          <p className="font-dm text-muted-foreground text-sm mt-1">Manage your service menu and pricing.</p>
        </div>
        <button onClick={openAdd} className="chrome-button font-dm font-medium px-5 py-2.5 rounded-full text-sm flex items-center gap-2">
          <Plus size={14} /> Add Service
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-cormorant text-xl font-semibold">{editing ? 'Edit Service' : 'New Service'}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-dm text-xs font-medium text-muted-foreground mb-1 block">Service Name *</label>
                <input value={form.name} onChange={e => f('name',e.target.value)} placeholder="e.g. Gel Manicure" className="input-field" />
              </div>
              <div>
                <label className="font-dm text-xs font-medium text-muted-foreground mb-1 block">Category *</label>
                <select value={form.category} onChange={e => f('category',e.target.value)} className="input-field">
                  {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabels[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="font-dm text-xs font-medium text-muted-foreground mb-1 block">Price ($) *</label>
                <input type="number" value={form.price} onChange={e => f('price',e.target.value)} placeholder="45" className="input-field" />
              </div>
              <div>
                <label className="font-dm text-xs font-medium text-muted-foreground mb-1 block">Duration (minutes) *</label>
                <input type="number" value={form.duration_minutes} onChange={e => f('duration_minutes',e.target.value)} placeholder="60" className="input-field" />
              </div>
              <div>
                <label className="font-dm text-xs font-medium text-muted-foreground mb-1 block">Loyalty Points</label>
                <input type="number" value={form.loyalty_points} onChange={e => f('loyalty_points',e.target.value)} placeholder="10" className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="font-dm text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => f('description',e.target.value)} rows={2} placeholder="Brief service description..." className="input-field resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="glass-card text-pink-600 px-5 py-2 rounded-full text-sm font-dm hover:border-pink-300 transition-all">Cancel</button>
              <button onClick={save} disabled={!form.name || !form.price || saving}
                className="chrome-button font-dm font-medium px-6 py-2 rounded-full text-sm disabled:opacity-50 flex items-center gap-1">
                {saving ? 'Saving...' : <><Check size={12} /> Save Service</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array(6).fill(0).map((_,i) => <div key={i} className="skeleton-shimmer h-28 rounded-2xl" />)}</div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl">
          <Sparkles size={32} className="text-pink-200 mx-auto mb-3" />
          <p className="font-dm text-muted-foreground text-sm">No services yet. Add your first service.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i*0.06 }}
              className={`glass-card rounded-2xl p-4 flex items-start gap-3 ${!s.is_active ? 'opacity-50' : ''}`}>
              <span className="text-2xl mt-0.5">{categoryIcons[s.category]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-dm font-semibold text-foreground">{s.name}</p>
                  <span className="text-xs bg-pink-100 text-pink-600 rounded-full px-2 py-0.5 font-dm">{categoryLabels[s.category]}</span>
                  {!s.is_active && <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-dm">Hidden</span>}
                </div>
                <p className="font-cormorant text-lg text-pink-500 font-semibold mt-0.5">${s.price} · {s.duration_minutes}m · {s.loyalty_points} pts</p>
                {s.description && <p className="font-dm text-xs text-muted-foreground mt-1 truncate">{s.description}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleActive(s)} className="w-8 h-8 rounded-full hover:bg-pink-50 flex items-center justify-center text-muted-foreground transition-colors text-sm">
                  {s.is_active ? '👁' : '🔒'}
                </button>
                <button onClick={() => openEdit(s)} className="w-8 h-8 rounded-full hover:bg-pink-50 flex items-center justify-center text-muted-foreground hover:text-pink-600 transition-colors">
                  <Pencil size={13} />
                </button>
                {confirmDelete === s.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => remove(s.id)} disabled={deleting===s.id} className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg font-dm disabled:opacity-50">Yes</button>
                    <button onClick={() => setConfirmDelete(null)} className="text-xs glass-card text-muted-foreground px-2 py-1 rounded-lg font-dm">No</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(s.id)} className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}