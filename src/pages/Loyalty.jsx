import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Star, Trophy, Zap, Gift, Lock } from 'lucide-react';

const TIERS = [
  { name: 'Bronze', min: 0, max: 74, color: 'from-amber-600 to-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', icon: '🥉' },
  { name: 'Silver', min: 75, max: 199, color: 'from-slate-500 to-slate-300', bg: 'bg-slate-50', text: 'text-slate-600', icon: '🥈' },
  { name: 'Gold', min: 200, max: 499, color: 'from-yellow-500 to-yellow-300', bg: 'bg-yellow-50', text: 'text-yellow-700', icon: '🥇' },
  { name: 'Diamond', min: 500, max: Infinity, color: 'from-pink-500 to-pink-300', bg: 'bg-pink-50', text: 'text-pink-600', icon: '💎' },
];

const PERKS = {
  bronze: ['5% off on every visit', 'Birthday bonus points'],
  silver: ['10% off on every visit', 'Priority booking', 'Free nail art on 5th visit'],
  gold: ['15% off on every visit', 'Priority booking', 'Monthly free service upgrade', 'Exclusive gold member events'],
  diamond: ['20% off all services', 'VIP same-day booking', 'Monthly free manicure', 'Custom press-on set annually', 'Personal nail artist'],
};

export default function Loyalty() {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const accounts = await base44.entities.LoyaltyAccount.filter({ user_email: u.email });
      setAccount(accounts.length > 0 ? accounts[0] : null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const currentTier = TIERS.find(t => t.name.toLowerCase() === (account?.tier || 'bronze'));
  const lifetimePoints = account?.lifetime_points || 0;
  const nextTier = TIERS.find(t => t.min > lifetimePoints);
  const progressToNext = nextTier
    ? ((lifetimePoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  return (
    <div className="space-y-10 max-w-3xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <Star size={14} /> Loyalty Program
        </div>
        <h1 className="font-playfair text-5xl font-bold text-foreground mb-2">Rewards</h1>
        <p className="text-muted-foreground text-sm">Every visit gets you closer to exclusive perks.</p>
      </div>

      {!user && !loading && (
        <div className="glass-card rounded-3xl p-10 text-center">
          <Lock size={40} className="text-pink-300 mx-auto mb-4" />
          <h3 className="font-playfair text-2xl font-bold mb-2">Sign in to see your rewards</h3>
          <p className="text-muted-foreground text-sm mb-6">Create an account or sign in to track your loyalty points and unlock exclusive perks.</p>
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="chrome-button text-white font-medium px-8 py-3 rounded-full"
          >
            Sign In / Register
          </button>
        </div>
      )}

      {user && !loading && (
        <>
          {/* Current status card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`chrome-card shine-overlay rounded-3xl p-8 loyalty-glow`}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground font-inter">Welcome back,</p>
                <h2 className="font-playfair text-3xl font-bold text-foreground">{user.full_name}</h2>
              </div>
              <div className="text-center">
                <span className="text-5xl">{currentTier?.icon}</span>
                <p className="font-bold text-pink-600 text-sm mt-1">{currentTier?.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-pink-600 font-playfair">{account?.total_points || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Available Points</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-pink-600 font-playfair">{account?.total_visits || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Visits</p>
              </div>
            </div>

            {nextTier && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>{lifetimePoints} pts</span>
                  <span>{nextTier.min} pts to {nextTier.name}</span>
                </div>
                <div className="w-full bg-pink-100 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progressToNext, 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-3 rounded-full chrome-button"
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Current perks */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="font-playfair text-xl font-semibold mb-4 flex items-center gap-2">
              <Gift size={18} className="text-pink-400" /> Your {currentTier?.name} Perks
            </h3>
            <div className="space-y-2">
              {PERKS[account?.tier || 'bronze']?.map(perk => (
                <div key={perk} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 chrome-card rounded-full flex items-center justify-center flex-shrink-0">
                    <Star size={10} className="text-pink-500" />
                  </div>
                  <span className="text-foreground">{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tier overview */}
      <div>
        <h2 className="font-playfair text-3xl font-bold text-center mb-6">Tier Benefits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TIERS.map((tier, i) => {
            const isCurrentTier = account?.tier === tier.name.toLowerCase();
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card rounded-2xl p-5 ${isCurrentTier ? 'ring-2 ring-pink-400' : ''}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{tier.icon}</span>
                  <div>
                    <h3 className="font-playfair font-bold text-foreground">{tier.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {tier.max === Infinity ? `${tier.min}+ lifetime pts` : `${tier.min}–${tier.max} lifetime pts`}
                    </p>
                  </div>
                  {isCurrentTier && (
                    <span className="ml-auto text-xs bg-pink-100 text-pink-600 rounded-full px-2 py-0.5 font-medium">Current</span>
                  )}
                </div>
                <ul className="space-y-1">
                  {PERKS[tier.name.toLowerCase()].map(p => (
                    <li key={p} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <Zap size={10} className="text-pink-400 mt-0.5 flex-shrink-0" /> {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}