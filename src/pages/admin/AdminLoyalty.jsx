import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Star, Trophy, Users } from 'lucide-react';
import TierChip from '@/components/TierChip';

export default function AdminLoyalty() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.LoyaltyAccount.list()
      .then(data => setAccounts([...data].sort((a,b) => (b.lifetime_points||0) - (a.lifetime_points||0))))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: accounts.length,
    diamond: accounts.filter(a => a.tier === 'diamond').length,
    gold: accounts.filter(a => a.tier === 'gold').length,
    totalPts: accounts.reduce((s,a) => s + (a.total_points||0), 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-cormorant text-4xl font-bold text-foreground">Loyalty Program</h1>
        <p className="font-dm text-muted-foreground text-sm mt-1">Overview of your loyalty members.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: stats.total, icon: Users },
          { label: 'Diamond Members', value: stats.diamond, icon: Trophy },
          { label: 'Gold Members', value: stats.gold, icon: Star },
          { label: 'Points Outstanding', value: stats.totalPts, icon: Star },
        ].map(({ label, value, icon: Icon }, i) => (
          <motion.div key={label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }}
            className="glass-card rounded-2xl p-5">
            <div className="w-10 h-10 chrome-card rounded-xl flex items-center justify-center mb-3">
              <Icon size={18} className="text-pink-400" />
            </div>
            <p className="font-cormorant text-3xl font-bold text-foreground">{value}</p>
            <p className="font-dm text-xs text-muted-foreground mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-3xl p-6">
        <h2 className="font-cormorant text-xl font-semibold mb-4">Members Leaderboard</h2>
        {loading ? (
          <div className="space-y-3">{Array(5).fill(0).map((_,i) => <div key={i} className="skeleton-shimmer h-14 rounded-xl" />)}</div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12">
            <Star size={32} className="text-pink-200 mx-auto mb-3" />
            <p className="font-dm text-muted-foreground text-sm">No loyalty members yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {accounts.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.04 }}
                className="flex items-center gap-4 p-3 bg-pink-50/50 rounded-xl">
                <span className="font-cormorant text-xl font-bold text-muted-foreground w-6 text-center">{i+1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-dm font-semibold text-sm text-foreground">{a.user_name || 'Unknown'}</p>
                  <p className="font-dm text-xs text-muted-foreground">{a.user_email} · {a.total_visits||0} visits</p>
                </div>
                <TierChip tier={a.tier || 'bronze'} />
                <div className="text-right">
                  <p className="font-cormorant font-bold text-pink-600 text-lg">{a.total_points||0} pts</p>
                  <p className="font-dm text-xs text-muted-foreground">{a.lifetime_points||0} lifetime</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}