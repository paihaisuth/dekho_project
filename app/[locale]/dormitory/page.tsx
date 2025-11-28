"use client";

import React, { useCallback, useEffect, useState } from "react";
import BottomBarMenu from "../../components/BottomBarMenu";
import { dormitoryQuery } from "../../axios";
import Loading from "../../components/Loading";
import toast, { Toaster } from "react-hot-toast";
import { Idormitory } from "@/schema";
import { useAuth } from "../../context/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaDoorOpen,
  FaClock,
} from "react-icons/fa";
import Pagination from "../../components/Pagination";
import Modal, { useModal } from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";
import FloatingActionButton from "../../components/FloatingActionButton";
import { t } from "@/app/i18n";

interface IdormitoryDisplay {
  id: string;
  name: string;
  address: string;
  billingDate: string;
  checkDate: string;
  roomCount: number;
  createdAt: string;
}

const DormitoryPage = () => {
  const router = useRouter();
  const { user } = useAuth();

  const params = useParams();
  const locale = params.locale as string;

  // Redirect if not owner
  useEffect(() => {
    if (user?.roleName !== "owner") {
      router.push(`/${locale}/`);
    }
  }, [user, router, locale]);

  const [dormitories, setDormitories] = useState<IdormitoryDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDormitories = useCallback(
    async (currentPage: number, filterName: string = "") => {
      setLoading(true);
      try {
        if (!user?.userID || user.userID.trim() === "") {
          setLoading(false);
          return;
        }

        const userID = user.userID || ""; // Ensure userID is always a string
        const { data, errorMessage } = await dormitoryQuery.list(
          userID,
          currentPage,
          { name: filterName } // Add filter name to query string
        );

        if (errorMessage) {
          toast.error(`${errorMessage}`);
          return;
        }

        if (data && data.items) {
          const { page, pageCount } = data;
          setPage(page);
          setTotalPages(pageCount);
          setDormitories(
            data.items.map((item: Idormitory) => ({
              id: item.id,
              name: item.name,
              address: item.address,
              billingDate: item.billingDate,
              checkDate: item.checkDate,
              roomCount: item.roomCount,
              createdAt: item.createdAt,
            }))
          );
        }
      } catch {
        toast.error("Failed to fetch dormitories.");
      } finally {
        setLoading(false);
      }
    },
    [user]
  ); // Add user as a dependency

  useEffect(() => {
    fetchDormitories(page);
  }, [page, fetchDormitories]); // Add fetchDormitories as a dependency

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleSearch = () => {
    fetchDormitories(1, searchTerm);
  };

  const DormitoryCard = ({ dormitory }: { dormitory: IdormitoryDisplay }) => (
    <div
      key={dormitory.id}
      role="button"
      tabIndex={0}
      onClick={() => openDormModal(dormitory)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDormModal(dormitory);
        }
      }}
      className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition"
    >
      <h2 className="text-xl font-bold mb-2 text-cyan-700 dark:text-cyan-400">
        <span className="inline-flex items-center gap-2">
          <FaDoorOpen className="text-cyan-600" />
          <span>{dormitory.name}</span>
        </span>
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
        <FaMapMarkerAlt className="text-cyan-600" /> {t(locale, "address")}:{" "}
        {dormitory.address}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
        <FaCalendarAlt className="text-green-600" /> {t(locale, "billingDate")}:{" "}
        {dormitory.billingDate} {t(locale, "everyMonth")}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
        <FaCalendarAlt className="text-blue-600" /> {t(locale, "checkDate")}:{" "}
        {dormitory.checkDate} {t(locale, "everyMonth")}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
        <FaDoorOpen className="text-yellow-600" /> {t(locale, "roomCount")}:{" "}
        {dormitory.roomCount}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <FaClock className="text-purple-600" /> {t(locale, "createdAt")}:{" "}
        {new Date(dormitory.createdAt).toLocaleDateString()}
      </p>
    </div>
  );

  // modal state for dormitory actions
  const {
    open: dormModalOpen,
    openModal: openDormModalFn,
    closeModal: closeDormModal,
  } = useModal(false);
  const [selectedDormitory, setSelectedDormitory] =
    useState<IdormitoryDisplay | null>(null);

  function openDormModal(dorm: IdormitoryDisplay) {
    setSelectedDormitory(dorm);
    openDormModalFn();
  }

  async function handleDeleteDormitory(id: string) {
    closeDormModal();
    setLoading(true);
    if (!user?.userID) {
      toast.error("You must be logged in to delete a dormitory.");
      return;
    }
    try {
      const { errorMessage } = await dormitoryQuery.delete(id);
      if (errorMessage) {
        toast.error(`${errorMessage}`);
        return;
      }
    } catch (err: unknown) {
      // try to read axios error message
      const errObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        errObj?.response?.data?.message ||
        errObj?.message ||
        "Error deleting dormitory";
      toast.error(message);
    } finally {
      toast.success("Dormitory deleted successfully.");
      // refresh dormitory list
      setLoading(false);
      fetchDormitories(1);
    }
  }

  function handleSeeRooms(id: string) {
    closeDormModal();
    router.push(`/${locale}/room/${id}`);
  }

  function handleEditDormitory(id: string) {
    closeDormModal();
    router.push(`/${locale}/edit-dormitory/${id}`);
  }

  return (
    <div className="relative min-h-screen pb-56 md:pb-40">
      <Toaster position="top-center" />
      {loading ? (
        <Loading overlay size="lg" />
      ) : (
        <div className="p-4">
          <div className="flex flex-wrap items-center mb-4 gap-4 px-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t(locale, "searchByName")}
                className="w-full max-w-md"
              />
              <Button onClick={handleSearch}>{t(locale, "search")}</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
            {dormitories.map((dormitory) => (
              <DormitoryCard key={dormitory.id} dormitory={dormitory} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrevious={handlePreviousPage}
            onNext={handleNextPage}
            autoShow
          />
        </div>
      )}
      <Modal
        open={dormModalOpen}
        onClose={closeDormModal}
        title={
          <span className="inline-flex items-center gap-2">
            <FaDoorOpen className="text-cyan-600" />
            <span>{selectedDormitory?.name || "Dormitory"}</span>
          </span>
        }
        size="sm"
      >
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <Button
              onClick={() =>
                selectedDormitory && handleSeeRooms(selectedDormitory.id)
              }
            >
              {t(locale, "seeRoom")}
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                if (!selectedDormitory) return;
                closeDormModal();
                router.push(
                  `/${locale}/repair-management/dormitory/${selectedDormitory.id}`
                );
              }}
            >
              {t(locale, "repairManagement")}
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                selectedDormitory && handleEditDormitory(selectedDormitory.id)
              }
            >
              {t(locale, "edit")}
            </Button>

            <Button
              variant="danger"
              onClick={() =>
                selectedDormitory && handleDeleteDormitory(selectedDormitory.id)
              }
            >
              {t(locale, "delete")}
            </Button>
          </div>
        </div>
      </Modal>

      <FloatingActionButton locale={locale} />

      <BottomBarMenu locale={locale} />
    </div>
  );
};

export default DormitoryPage;
