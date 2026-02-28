export default function CinematicGlow() {
  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-purple-600/20 blur-3xl" />
    </div>
  );
}