"use client";

import React from "react";
import { FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface FloatingActionButtonProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon = <FaPlus className="text-white text-xl" />,
  className = "",
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default action: navigate to create dormitory page
      router.push("/new-dormitory");
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-20 right-4 bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-full shadow-lg transition-colors duration-200 z-50 ${className}`}
      aria-label="Create Dormitory"
    >
      {icon}
    </button>
  );
};

export default FloatingActionButton;
