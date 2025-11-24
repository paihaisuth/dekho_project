"use client";

import React from "react";
import Link from "next/link";
import Button from "./Button";

export default function NavBar() {
  return (
    <header className="w-full bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-cyan-600">
          Dekho
        </Link>

        <nav className="flex items-center gap-3 flex-wrap">
          <Link href="/login">
            <Button variant="secondary" size="sm" className="whitespace-nowrap">
              Login
            </Button>
          </Link>

          <Link href="/register">
            <Button variant="primary" size="sm" className="whitespace-nowrap">
              Register
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
