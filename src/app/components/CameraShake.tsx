import { motion, AnimatePresence } from "framer-motion";

export default function CameraShake({ trigger }: { trigger: boolean }) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          initial={{ x: 0, y: 0 }}
          animate={{
            x: [0, -10, 10, -6, 6, 0],
            y: [0, 6, -6, 3, -3, 0],
          }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 pointer-events-none z-50"
        />
      )}
    </AnimatePresence>
  );
}