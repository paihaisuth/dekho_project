"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaTachometerAlt,
  FaHome,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

const BottomBarMenu = () => {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/";
  };

  const menuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt size={24} />,
    },
    { href: "/dormitory", label: "Dormitory", icon: <FaHome size={24} /> },
    { href: "/account", label: "Account", icon: <FaUserCircle size={24} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md">
      <ul className="flex justify-around items-center py-2">
        {menuItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex flex-col items-center text-sm hover:text-blue-500 cursor-pointer ${
                pathname === item.href ? "text-blue-500" : "text-gray-600"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
        <li>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center text-sm text-gray-600 hover:text-red-500 cursor-pointer"
          >
            <FaSignOutAlt size={24} />
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default BottomBarMenu;
