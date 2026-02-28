"use client";
import { motion } from "framer-motion";

export default function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        backdrop-blur-2xl
        bg-white/5
        border border-white/10
        shadow-[0_0_40px_rgba(255,255,255,0.08)]
        rounded-3xl
        transition
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}