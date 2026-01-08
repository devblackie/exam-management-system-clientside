// /src/components/ui/CommonButton.tsx
'use client';

import { motion } from 'framer-motion';
import { ReactNode, MouseEvent } from 'react';

interface CommonButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  bgColor?: string;
  textColor?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function CommonButton({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  bgColor = 'bg-gradient-to-r from-green-base to-lime-bright',
  textColor = 'text-gray-800 dark:text-gray-100',
}: CommonButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex justify-center items-center gap-2 mx-auto px-4 py-1 
        border-t rounded-full shadow-xl backdrop-blur-md lg:font-semibold w-full
        ${bgColor} ${textColor} 
        dark:hover:text-gray-100 
        relative overflow-hidden group 
        transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
        ${className}
      `}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <span className="relative z-10">{children}</span>
      <motion.div
        className="absolute inset-0 bg-emerald-500 dark:bg-emerald-600 -left-full rounded-full z-0"
        initial={{ x: '-100%' }}
        whileHover={{ x: disabled ? '-100%' : '0%' }}
        transition={{ duration: 0.7 }}
      />
    </motion.button>
  );
}