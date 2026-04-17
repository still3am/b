import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Zap, Gift, Lock, Crown } from 'lucide-react';
import TierChip from '@/components/TierChip';

const TIERS = [
  { name: 'bronze', label: 'Bronze', min: 0, max: 74, icon: '🥉' },
  { name: 'silver', label: 'Silver', min: 75, max: 199, icon: '🥈' },
  { name: 'gold', label: 'Gold', min: 200, max: 499, icon: '🥇' },
  { name: 'diamond', label: 'Diamond', min: 500, max: Infinity, icon: '💎' },
];

const PERKS = {
  bronze: ['5% off on every visit', 'Birthday bonus points'],
  silver: ['10% off on every visit', 'Priority booking', 'Free nail art on 5th visit'],
  gold: ['15% off on every visit', 'Priority booking', 'Monthly free service upgrade', 'Exclusive gold member events'],
  diamond: ['20% off all services', 'VIP same-day booking', 'Monthly free manicure', 'Custom press-on set annually', 'Personal nail artist'],
};

const MILESTONES = [
  { pts: 25, icon: '🎨', label: 'Free nail art add-on' },
  { pts: 50, icon: '🤲', label: 'Hand & arm massage' },
  { pts: 100, icon: '✨', label: 'Service upgrade' },
  { pts: 200, icon: '🦶', label: 'Full pedicure free' },
  { pts: 350, icon: '💅', label: 'Luxury set free' },
];

export default function Loyalty() {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllMilestones, setShowAllMilestones] = useState(false);
  const [explorerTier, setExplorerTier] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      try {
        const accounts = await base44.entities.LoyaltyAccount.filter({ user_email: u.email });
        setAccount(accounts.length > 0 ? accounts[0] : null);
        setExplorerTier(accounts.length > 0 ? accounts[0].tier : 'bronze');
      } catch {}
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const currentTierData = TIERS.find(t => t.name === (account?.tier || 'bronze'));
  const lifetime = account?.lifetime_points || 0;
  const nextTier = TIERS.find(t => t.min > lifetime);
  const progressPct = nextTier
    ? Math.min(((lifetime - (currentTierData?.min || 0)) / (nextTier.min - (currentTierData?.min || 0))) * 100, 100)
    : 100;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton-shimmer rounded-3xl h-40" />)}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-24">
        <div className="animate-float text-6xl mb-6">🔒</div>
        <h1 className="font-cormorant text-4xl font-bold text-foreground mb-3">Sign in to see your rewards</h1>
        <p className="font-dm text-muted-foreground text-sm mb-8">Track your loyalty points and unlock exclusive perks.</p>
        <button onClick={() => base44.auth.redirectToLogin()} className="chrome-button font-dm font-medium px-8 py-3 rounded-full">
          Sign In to Unlock
        </button>
      </div>
    );
  }

  const tierGlow = account?.tier === 'gold' ? 'gold-glow' : account?.tier === 'diamond' ? 'diamond-glow' : 'loyalty-glow';

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 text-sm font-dm font-medium text-pink-600 mb-4">
          <Star size={14} /> Loyalty Program
        </div>
        <h1 className="font-cormorant text-5xl font-bold text-foreground mb-2">Rewards</h1>
        <p className="font-dm text-muted-foreground text-sm">Every visit gets you closer to exclusive perks.</p>
      </div>

      {/* Status card */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className={`chrome-card shine-overlay rounded-3xl p-8 ${tierGlow}`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground font-dm mb-1">Welcome back,</p>
            <h2 className="font-cormorant text-3xl font-bold text-foreground">{user.full_name}</h2>
            <div className="mt-2">
              <TierChip tier={account?.tier || 'bronze'} />
            </div>
          </div>
          <div className="text-right">
            <motion.p
              key={account?.total_points}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="font-cormorant text-5xl font-bold gradient-text"
            >
              {account?.total_points || 0}
            </motion.p>
            <p className="font-dm text-xs text-muted-foreground">available points</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Lifetime Points', value: lifetime },
            { label: 'Total Visits', value: account?.total_visits || 0 },
            { label: nextTier ? `Next Tier In` : 'Status', value: nextTier ? `${nextTier.min - lifetime} pts` : 'MAX ✨' },
          ].map(({ label, value }) => (
            <div key={label} className="glass-card rounded-xl p-3 text-center">
              <p className="font-cormorant text-2xl font-bold text-pink-600">{value}</p>
              <p className="font-dm text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {account?.tier === 'diamond' ? (
          <div className="flex items-center gap-2 justify-center">
            <Crown size={18} className="text-pink-500" />
            <p className="font-dm text-sm text-pink-600 font-medium">You've reached the highest tier!</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-xs font-dm text-muted-foreground mb-2">
              <span>{currentTierData?.label}</span>
              <span>{nextTier?.min - lifetime} pts to {nextTier?.label} {nextTier?.icon}</span>
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
              />
            </div>
          </>
        )}
      </motion.div>

      {/* Milestones */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cormorant text-xl font-semibold flex items-center gap-2"><Trophy size={18} className="text-pink-400" /> Point Milestones</h3>
          <button onClick={() => setShowAllMilestones(v => !v)} className="text-xs font-dm text-pink-500 hover:text-pink-700">{showAllMilestones ? 'Show less' : 'Show all'}</button>
        </div>
        <div className="space-y-2">
          {(showAllMilestones ? MILESTONES : MILESTONES.slice(0, 3)).map(m => {
            const unlocked = (account?.total_points || 0) >= m.pts;
            return (
              <div key={m.pts} className={`flex items-center gap-3 p-3 rounded-xl ${unlocked ? 'bg-pink-50' : 'bg-gray-50'}`}>
                <span className="text-xl">{m.icon}</span>
                <div className="flex-1">
                  <p className={`font-dm text-sm font-medium ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>{m.label}</p>
                  <p className="font-dm text-xs text-muted-foreground">{m.pts} pts</p>
                </div>
                {unlocked ? (
                  <span className="text-xs font-dm text-green-600 font-medium">✓ Unlocked</span>
                ) : (
                  <span className="text-xs font-dm text-muted-foreground">{m.pts - (account?.total_points || 0)} to go</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current perks */}
      <div className="glass-card rounded-3xl p-6">
        <h3 className="font-cormorant text-xl font-semibold mb-4 flex items-center gap-2"><Gift size={18} className="text-pink-400" /> Your {currentTierData?.label} Perks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PERKS[account?.tier || 'bronze']?.map(perk => (
            <div key={perk} className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 chrome-card rounded-full flex items-center justify-center flex-shrink-0">
                <Star size={10} className="text-pink-500" />
              </div>
              <span className="font-dm text-foreground">{perk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tier explorer */}
      <div>
        <h2 className="font-cormorant text-3xl font-bold text-center mb-6">Explore Tiers</h2>
        <div className="flex gap-2 justify-center mb-4 flex-wrap">
          {TIERS.map(t => (
            <button key={t.name} onClick={() => setExplorerTier(t.name)}
              className={`px-4 py-2 rounded-full text-sm font-dm font-medium transition-all ${explorerTier===t.name ? 'chrome-button' : 'glass-card text-pink-600'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {explorerTier && (
            <motion.div key={explorerTier} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
              className={`glass-card rounded-3xl p-6 ${explorerTier==='gold' ? 'gold-glow' : explorerTier==='diamond' ? 'diamond-glow' : ''}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{TIERS.find(t=>t.name===explorerTier)?.icon}</span>
                <div>
                  <h3 className="font-cormorant text-2xl font-bold text-foreground">{TIERS.find(t=>t.name===explorerTier)?.label}</h3>
                  <p className="font-dm text-xs text-muted-foreground">
                    {TIERS.find(t=>t.name===explorerTier)?.max===Infinity
                      ? `${TIERS.find(t=>t.name===explorerTier)?.min}+ lifetime pts`
                      : `${TIERS.find(t=>t.name===explorerTier)?.min}–${TIERS.find(t=>t.name===explorerTier)?.max} lifetime pts`}
                  </p>
                </div>
                {account?.tier === explorerTier && <TierChip tier={explorerTier} className="ml-auto" />}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PERKS[explorerTier]?.map(p => (
                  <div key={p} className="flex items-start gap-1.5 text-sm">
                    <Zap size={12} className="text-pink-400 mt-0.5 flex-shrink-0" />
                    <span className="font-dm text-muted-foreground">{p}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}