"use client";

import React from "react";
import Link from "next/link";
import Button from "./Button";
import { t } from "../i18n";

export default function NavBar({ locale = "en" }: { locale?: string }) {
  return (
    <header className="w-full bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href={`/${locale}`} className="text-2xl font-bold text-cyan-600">
          {t(locale, "websiteName")}
        </Link>

        <nav className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center border border-zinc-300 dark:border-zinc-600 rounded-md overflow-hidden">
            <Link
              href="/en"
              className={`px-4 py-2 text-sm font-medium ${
                locale === "en"
                  ? "bg-cyan-600 text-white font-bold"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              EN
            </Link>
            <Link
              href="/th"
              className={`px-4 py-2 text-sm font-medium ${
                locale === "th"
                  ? "bg-cyan-600 text-white font-bold"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              TH
            </Link>
          </div>

          <Link href={`/${locale}/login`}>
            <Button variant="secondary" size="sm" className="whitespace-nowrap">
              {t(locale, "login")}
            </Button>
          </Link>

          <Link href={`/${locale}/register`}>
            <Button variant="primary" size="sm" className="whitespace-nowrap">
              {t(locale, "register")}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
