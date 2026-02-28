import { motion } from "framer-motion";

export default function EnergyRing({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <motion.div
      initial={{ scale: 0.2, opacity: 1 }}
      animate={{ scale: 3, opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 m-auto w-40 h-40 rounded-full
                 border border-cyan-400 blur-xl z-20"
    />
  );
}