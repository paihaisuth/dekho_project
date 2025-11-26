"use client";

import { useEffect, useState } from "react";
import NavBar from "./components/NavBar";
import Link from "next/link";
import { FiMapPin, FiHome, FiEye, FiLayers } from "react-icons/fi";
import { publicQuery } from "./axios/publicQuery";
import toast, { Toaster } from "react-hot-toast";
import { Idormitory } from "@/schema";
import Loading from "./components/Loading";

const LandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [dormitoryList, setDormitoryList] = useState<Idormitory[]>([]);

  useEffect(() => {
    async function fetchDormitories() {
      try {
        setLoading(true);
        const { data, errorMessage } = await publicQuery.dormitoryList();

        if (errorMessage) {
          toast.error(errorMessage || "Failed to fetch dormitories.");
          return;
        }
        setDormitoryList(data || []);
      } catch {
        toast.error("An error occurred while fetching dormitories.");
      } finally {
        setLoading(false);
      }
    }
    fetchDormitories();
  }, []);

  return (
    <>
      <NavBar />
      <Toaster position="top-center" />
      {loading && <Loading overlay />}

      <main className="max-w-6xl mx-auto p-6">
        {/* Visually-hidden heading for accessibility; page title intentionally not shown */}
        <h1 className="sr-only">Available Dormitories</h1>

        {dormitoryList.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No dormitories found.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dormitoryList.map((d) => (
              <article
                key={d.id}
                className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 hover:shadow-md transition"
                aria-labelledby={`dorm-${d.id}-title`}
              >
                <h2
                  id={`dorm-${d.id}-title`}
                  className="flex items-center gap-3 text-lg sm:text-xl font-bold text-cyan-600 dark:text-cyan-400"
                >
                  <span className="leading-tight">{d.name}</span>
                </h2>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2 flex items-center gap-2">
                  <FiMapPin
                    className="text-cyan-600 w-4 h-4 shrink-0"
                    aria-hidden
                  />
                  <span className="leading-tight">{d.address}</span>
                </p>

                <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-2">
                    <FiLayers
                      className="text-zinc-500 w-4 h-4 shrink-0"
                      aria-hidden
                    />
                    <span>{d.roomCount}</span>
                  </span>

                  <Link
                    href={`/dormitory/${d.id}`}
                    className="text-cyan-600 hover:text-cyan-700 ml-3 inline-flex items-center"
                    aria-label={`View ${d.name}`}
                  >
                    <FiEye className="w-5 h-5" aria-hidden />
                    <span className="sr-only">View {d.name}</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default LandingPage;
