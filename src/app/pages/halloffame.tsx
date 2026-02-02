import Leaderboard from "@/app/components/Leaderboard";


export function HallOfFamePage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-4">
          🏆 Hall of Fame
        </h1>

        <p className="text-blue-200 mb-10">
          Celebrating our greatest supporters who make change possible.
        </p>

        <Leaderboard />
      </div>
    </div>
  );
}
