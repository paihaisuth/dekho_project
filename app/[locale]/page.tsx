"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiMapPin, FiEye, FiLayers, FiCheckCircle } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { IresponsePublicList } from "@/utils/interface";
import { publicQuery } from "../axios/publicQuery";
import Loading from "../components/Loading";
import NavBar from "../components/NavBar";
import { useParams } from "next/navigation";
import { t } from "../i18n";

const LandingPage = () => {
  const params = useParams();
  const locale = params?.locale as string;

  const [loading, setLoading] = useState(true);
  const [dormitoryList, setDormitoryList] = useState<IresponsePublicList[]>([]);

  useEffect(() => {
    async function fetchDormitories() {
      try {
        setLoading(true);
        const { data, errorMessage } = await publicQuery.dormitoryList();

        if (errorMessage) {
          toast.error(errorMessage || "Failed to fetch dormitories.");
          return;
        }
        setDormitoryList((data || []) as IresponsePublicList[]);
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
      <NavBar locale={locale} />
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
                  className="text-lg sm:text-xl font-bold text-cyan-600 dark:text-cyan-400"
                >
                  <span className="leading-tight">{d.name}</span>
                </h2>

                {/* badges moved into metadata row for balanced layout */}

                <div className="mt-4 flex items-start justify-between text-xs text-zinc-500">
                  <div className="flex flex-col items-start gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100 max-w-full">
                      <FiMapPin
                        className="text-cyan-600 w-4 h-4 shrink-0"
                        aria-hidden
                      />
                      <span className="leading-tight line-clamp-1">
                        {d.address}
                      </span>
                    </span>

                    {typeof d.availableRoomCount === "number" && (
                      <span
                        className={
                          `inline-flex items-center gap-2 text-xs font-medium px-2.5 py-0.5 rounded-full ` +
                          (d.availableRoomCount === 0
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-800 dark:text-rose-100"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100")
                        }
                      >
                        <FiCheckCircle
                          className={
                            `w-4 h-4 ` +
                            (d.availableRoomCount === 0
                              ? "text-rose-600 dark:text-rose-200"
                              : "text-emerald-600 dark:text-emerald-200")
                          }
                          aria-hidden
                        />
                        <span className="sm:hidden">
                          {d.availableRoomCount}
                        </span>
                        <span className="hidden sm:inline">
                          {d.availableRoomCount} {t(locale, "available")}
                        </span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      <FiLayers
                        className="text-zinc-500 w-4 h-4 shrink-0"
                        aria-hidden
                      />
                      <span className="sm:hidden">{d.roomCount}</span>
                      <span className="hidden sm:inline">
                        {d.roomCount} {t(locale, "rooms")}
                      </span>
                    </span>
                  </div>
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
