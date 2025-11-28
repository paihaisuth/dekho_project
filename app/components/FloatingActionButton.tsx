"use client";

import React from "react";
import { FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface FloatingActionButtonProps {
  onClick?: () => void;
  locale: string;
  icon?: React.ReactNode;
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  locale,
  icon = <FaPlus className="text-white text-xl" />,
  className = "",
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default action: navigate to create dormitory page
      router.push(`/${locale}/new-dormitory`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-full shadow-lg transition-colors duration-200 ${className}`}
      aria-label="Create Dormitory"
    >
      {icon}
    </button>
  );
};

export default FloatingActionButton;
