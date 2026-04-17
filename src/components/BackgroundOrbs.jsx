export default function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div
        className="absolute animate-orb"
        style={{
          top: '-15%', left: '-10%',
          width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, rgba(219,39,119,0.06) 50%, transparent 70%)',
        }}
      />
      <div
        className="absolute animate-orb-delayed"
        style={{
          bottom: '-20%', right: '-10%',
          width: '700px', height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, rgba(236,72,153,0.05) 50%, transparent 70%)',
        }}
      />
    </div>
  );
}