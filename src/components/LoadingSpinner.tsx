import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  text?: string;
}

export const LoadingSpinner = ({ size = 40, color = '#3B82F6', text }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className="rounded-full border-t-2 border-b-2"
        style={{
          width: size,
          height: size,
          borderColor: color,
        }}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-sm text-gray-400"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
