"use client";

import { repairRequestQuery } from "@/app/axios";
import Loading from "@/app/components/Loading";
import Pagination from "@/app/components/Pagination";
import IrepairRequest from "@/schema/RepairRequest";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FaWrench,
  FaClock,
  FaInfoCircle,
  FaCalendarCheck,
} from "react-icons/fa";
import { t } from "@/app/i18n";
import Modal from "@/app/components/Modal";
import Button from "@/app/components/Button";

interface IExtendedRepairRequest extends IrepairRequest {
  roomName?: string;
  dormitoryID: string;
}

const RepairManagementPage = () => {
  const params = useParams();
  const locale = params.locale as string;
  const dormitoryID = params.id as string;

  const [repairRequests, setRepairRequests] = useState<
    IExtendedRepairRequest[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<IExtendedRepairRequest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchRepairRequests() {
      setIsLoading(true);
      const { data, errorMessage } = await repairRequestQuery.list(
        { dormitoryID },
        page,
        10
      );

      if (errorMessage) {
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      if (data) {
        setRepairRequests(data.items || []);
        setPage(data.page || page);
        setTotalPages(data.pageCount || 1);
      }
      setIsLoading(false);
    }
    fetchRepairRequests();
  }, [dormitoryID, page]);

  const handlePrevious = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  const openModal = (request: IExtendedRepairRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest) return;
    const newStatus = !selectedRequest.status;
    setIsUpdating(true);
    const { errorMessage } = await repairRequestQuery.update(
      selectedRequest.id,
      { status: newStatus }
    );
    setIsUpdating(false);
    if (errorMessage) {
      toast.error(errorMessage);
    } else {
      toast.success(t(locale, "updateSuccessful"));
      // Update the local state
      setRepairRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id ? { ...r, status: newStatus } : r
        )
      );
      closeModal();
    }
  };

  return (
    <div className="p-6 relative min-h-screen pb-40 md:pb-32">
      <Toaster position="top-center" />
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loading size="lg" overlay />
        </div>
      ) : null}

      <h1 className="text-2xl font-bold mb-4">
        {t(locale, "repairManagement")}
      </h1>

      {repairRequests && repairRequests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {repairRequests.map((r) => (
            <div
              onClick={() => openModal(r)}
              key={r.id}
              className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 cursor-default hover:shadow-lg transition"
            >
              <h3 className="text-xl font-bold mb-2 text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
                <FaWrench className="text-cyan-600" />
                <span className="truncate">{r.roomName}</span>
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                <FaInfoCircle className="text-green-600" />{" "}
                {t(locale, "details")}: {r.details}
              </p>

              {r.fixDate ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                  <FaCalendarCheck className="text-green-600" />{" "}
                  {t(locale, "fixDate")}:{" "}
                  {new Date(r.fixDate).toLocaleDateString()}
                </p>
              ) : null}

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                <FaClock className="text-purple-600" /> {t(locale, "createdAt")}
                : {new Date(r.createdAt).toLocaleDateString()}
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <FaClock className="text-blue-600" /> {t(locale, "updatedAt")}:{" "}
                {new Date(r.updatedAt).toLocaleDateString()}
              </p>

              {/* Status Badge */}
              <span
                className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full mt-2 ${
                  r.status ? "bg-green-500" : "bg-yellow-500"
                }`}
              >
                {r.status
                  ? t(locale, "statusCompleted")
                  : t(locale, "statusPending")}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p>{t(locale, "noRepairRequests") || "No repair requests found."}</p>
      )}

      <div className="mt-6">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrevious={handlePrevious}
          onNext={handleNext}
          autoShow
        />
      </div>

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title={selectedRequest?.roomName || t(locale, "repairDetails")}
        size="md"
      >
        {selectedRequest && (
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t(locale, "details")}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-zinc-700 dark:border-gray-600 dark:text-white"
                value={selectedRequest.details}
                disabled
                rows={3}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t(locale, "status")}
              </label>
              <div className="flex flex-col gap-3">
                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full w-fit ${
                    selectedRequest.status ? "bg-green-500" : "bg-yellow-500"
                  }`}
                >
                  {selectedRequest.status
                    ? t(locale, "statusCompleted")
                    : t(locale, "statusPending")}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={isUpdating}
                  onClick={handleStatusUpdate}
                >
                  {selectedRequest.status
                    ? t(locale, "markAsPending")
                    : t(locale, "markAsCompleted")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RepairManagementPage;
