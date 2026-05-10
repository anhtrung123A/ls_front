import { AnimatePresence, motion } from 'framer-motion'

type AuthLinearProgressProps = {
  isVisible: boolean
}

export function AuthLinearProgress({ isVisible }: AuthLinearProgressProps) {
  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 10,
            height: 3,
            width: '100%',
            overflow: 'hidden',
            background: '#e8f0fe',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          <motion.div
            style={{ height: '100%', width: '35%', background: '#0842a0' }}
            initial={{ x: '-120%' }}
            animate={{ x: '320%' }}
            transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

