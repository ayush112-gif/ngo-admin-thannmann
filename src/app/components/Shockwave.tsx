import { motion, AnimatePresence } from "framer-motion";

export default function Shockwave({ trigger }: { trigger: boolean }) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          initial={{ scale: 0.2, opacity: 0.7 }}
          animate={{ scale: 6, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 m-auto w-40 h-40 rounded-full 
                     bg-cyan-400/30 blur-3xl z-30 pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
}