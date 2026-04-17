const icons = { bronze: '🥉', silver: '🥈', gold: '🥇', diamond: '💎' };

export default function TierChip({ tier = 'bronze', className = '' }) {
  return (
    <span className={`tier-${tier} ${className}`}>
      {icons[tier]} {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </span>
  );
}