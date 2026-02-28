export default function StripeRadar() {
  return (
    <div className="fixed bottom-10 right-10 w-52 h-52 pointer-events-none z-20">
      <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping" />
      <div className="absolute inset-6 rounded-full border border-cyan-300/30 animate-ping delay-200" />
      <div className="absolute inset-12 rounded-full border border-cyan-200/20 animate-ping delay-500" />
    </div>
  );
}