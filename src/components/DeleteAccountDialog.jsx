import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteAccountDialog({ onClose }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const me = await base44.auth.me();
      const accounts = await base44.entities.LoyaltyAccount.filter({ user_email: me.email });
      await Promise.all(accounts.map(acc => base44.entities.LoyaltyAccount.delete(acc.id)));
      base44.auth.logout('/');
    } catch (e) {
      alert('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card rounded-3xl p-6 w-full max-w-sm z-10">
        {!confirming ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-playfair font-bold text-foreground">Delete Account</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Deleting your account will remove all your loyalty points, booking history, and personal data from BOOKED.
            </p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 border border-pink-200 text-pink-600 py-2.5 rounded-full text-sm font-medium hover:bg-pink-50 transition-colors select-none">
                Cancel
              </button>
              <button onClick={() => setConfirming(true)} className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-full text-sm font-medium hover:bg-red-100 transition-colors select-none">
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="font-playfair font-bold text-foreground mb-1">Are you absolutely sure?</h3>
              <p className="text-xs text-muted-foreground">Type "DELETE" below to confirm.</p>
            </div>
            <ConfirmInput onConfirmed={handleDelete} deleting={deleting} onCancel={onClose} />
          </>
        )}
      </div>
    </div>
  );
}

function ConfirmInput({ onConfirmed, deleting, onCancel }) {
  const [value, setValue] = useState('');
  return (
    <div className="space-y-3">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder='Type DELETE to confirm'
        className="w-full glass-card rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 transition-colors text-center tracking-widest font-bold"
      />
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 border border-pink-200 text-pink-600 py-2.5 rounded-full text-sm font-medium select-none">
          Cancel
        </button>
        <button
          onClick={onConfirmed}
          disabled={value !== 'DELETE' || deleting}
          className="flex-1 bg-red-500 text-white py-2.5 rounded-full text-sm font-medium disabled:opacity-40 transition-colors select-none"
        >
          {deleting ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>
    </div>
  );
}