import { motion, AnimatePresence } from "framer-motion";

export default function DonationBeam({ trigger }: { trigger: boolean }) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed left-1/2 top-0 w-1 h-full bg-gradient-to-b 
                     from-cyan-400 via-blue-500 to-transparent
                     blur-sm z-40 origin-top pointer-events-none"
          style={{ transform: "translateX(-50%)" }}
        />
      )}
    </AnimatePresence>
  );
}