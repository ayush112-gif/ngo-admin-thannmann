import { motion } from "framer-motion";

export default function Particles() {
  const dots = Array.from({ length: 60 });

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {dots.map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-10vh", opacity: [0, 1, 0] }}
          transition={{
            duration: 10 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full blur-sm"
          style={{ left: `${Math.random() * 100}%` }}
        />
      ))}
    </div>
  );
}