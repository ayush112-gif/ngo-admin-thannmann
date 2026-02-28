import { motion } from "framer-motion";

export default function DonationHeatmap({ donors }: any) {
  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      {donors.map((_: any, i: number) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.7, scale: 0 }}
          animate={{ opacity: 0, scale: 6 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.4,
          }}
          className="absolute w-60 h-60 bg-blue-500/20 rounded-full blur-3xl"
          style={{
            left: Math.random() * window.innerWidth,
            top: Math.random() * window.innerHeight,
          }}
        />
      ))}
    </div>
  );
}