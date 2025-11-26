"use client";

import React, { useState, useEffect, useCallback } from "react";
import Button from "../../components/Button";
import Loading from "../../components/Loading";
import Pagination from "../../components/Pagination";
import { useRouter, useParams } from "next/navigation";
import { FaChevronLeft, FaClock } from "react-icons/fa";
import { EbillStatus } from "../../../utils/enum"; // Corrected import path
import billQuery from "../../axios/billQuery";
import {
  FaExclamationCircle,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import Ibill from "../../../schema/Bill"; // Corrected to default import
import Dropdown from "../../components/Dropdown"; // Import the Dropdown component
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import DateInput from "../../components/DateInput"; // Import the DateInput component
import { toast, Toaster } from "react-hot-toast";
import fileQuery from "@/app/axios/fileQuery";
import Image from "next/image";
import FloatingActionButton from "../../components/FloatingActionButton";

// Define the DropdownOption type explicitly to match the Dropdown component's expectations
const dropdownOptions: { label: string; value: EbillStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "None", value: EbillStatus.NONE },
  { label: "Pending", value: EbillStatus.PENDING },
  { label: "Paid", value: EbillStatus.PAID },
  { label: "Overdue", value: EbillStatus.OVERDUE },
];

const getStatusBadge = (status: EbillStatus) => {
  switch (status) {
    case EbillStatus.PENDING:
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-900">
          <FaExclamationCircle className="mr-1 text-yellow-700" /> Pending
        </span>
      );

    case EbillStatus.PAID:
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-200 text-green-900">
          <FaCheckCircle className="mr-1 text-green-700" /> Paid
        </span>
      );

    case EbillStatus.OVERDUE:
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-900">
          <FaTimesCircle className="mr-1 text-red-700" /> Overdue
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-900">
          <FaClock className="mr-1 text-gray-700" /> None
        </span>
      );
  }
};

const BillPage = () => {
  const router = useRouter();
  const params = useParams();
  const roomID = (params as { id?: string })?.id ?? "";

  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<Ibill[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<EbillStatus | "ALL">("ALL"); // State for filter
  const [selectedBill, setSelectedBill] = useState<Ibill | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [paidDate, setPaidDate] = useState("");
  const [paidPrice, setPaidPrice] = useState("");
  const [slipUploading, setSlipUploading] = useState(false);

  const uploadBillSlip = async (file: File): Promise<void> => {
    if (!file) {
      toast.error("No file selected for upload.");
      return;
    }

    const { data, errorMessage } = await fileQuery.upload(file, "bill-slips");

    if (errorMessage) {
      toast.error(`File upload failed: ${errorMessage}`);
      return;
    }

    const { errorMessage: updateError } = await billQuery.update(
      selectedBill!.id,
      { slipURL: data?.url }
    );

    if (updateError) {
      toast.error(`Failed to update bill with slip URL: ${updateError}`);
      return;
    }

    toast.success("Slip uploaded and bill updated successfully.");

    // Refresh bills to update slipURL
    await fetchBills();

    handleCloseModal();
    return;
  };
  const fetchBills = useCallback(async () => {
    if (!roomID) return;

    setLoading(true);
    try {
      const statusFilter = filterStatus === "ALL" ? undefined : filterStatus;
      const response = await billQuery.list(roomID, page, undefined, {
        status: statusFilter,
      });
      if (response.statusCode === 200 && response.data) {
        const { items, pageCount } = response.data;
        setBills(items);
        setTotalPages(pageCount);
      } else {
        console.error(response.errorMessage || "Failed to fetch bills.");
      }
    } catch (error) {
      console.error("An error occurred while fetching bills.", error);
    } finally {
      setLoading(false);
    }
  }, [roomID, page, filterStatus]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handlePreviousPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handleBillClick = (bill: Ibill) => {
    setSelectedBill(bill);
    setPaidDate("");
    setPaidPrice("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBill(null);
    setPaidDate("");
    setPaidPrice("");
  };

  const handleSavePayment = async () => {
    if (!selectedBill) return;
    setLoading(true);
    handleCloseModal();

    try {
      const { errorMessage } = await billQuery.update(selectedBill.id, {
        payDate: paidDate ? new Date(paidDate).toISOString() : undefined,
        payPrice: parseFloat(paidPrice),
        status: selectedBill.status, // Include the selected status
      });

      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.success("Payment saved successfully");
        fetchBills();
      }
    } catch (error) {
      console.error("Failed to save payment:", error);
      toast.error("Failed to save payment");
    } finally {
      setLoading(false);
    }
  };

  const BillCard = ({ bill }: { bill: Ibill }) => {
    return (
      <div
        onClick={() => handleBillClick(bill)}
        className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 hover:shadow-lg transition cursor-pointer"
      >
        {bill.billingDate && (
          <p className="text-lg text-cyan-600 dark:text-cyan-300 font-bold mb-4 flex items-center gap-2">
            <FaClock className="text-cyan-600" />{" "}
            {new Date(bill.billingDate).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
          <FaClock className="text-purple-600" /> Created At:{" "}
          {new Date(bill.createdAt).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
          <FaClock className="text-blue-600" /> Updated At:{" "}
          {new Date(bill.updatedAt).toLocaleDateString()}
        </p>
        <div className="mt-2 flex items-center gap-2">
          {getStatusBadge(bill.status)}
          {bill.slipURL ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-900">
              <FaCheckCircle className="mr-1 text-blue-700" /> Slip Uploaded
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-900">
              <FaTimesCircle className="mr-1 text-yellow-700" /> Slip Not
              Uploaded
            </span>
          )}
        </div>
      </div>
    );
  };

  const parseISOToDMY = (isoString: string | undefined) => {
    if (!isoString) return { day: "", month: "", year: "" };
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    return { day, month, year };
  };

  const parsedPayDate = parseISOToDMY(paidDate || selectedBill?.payDate);

  return (
    <div className="p-6 relative min-h-[200px] pb-40 md:pb-32">
      <Toaster position="top-center" />

      {loading && <Loading overlay text="Loading bills..." />}

      <div className="flex items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            leftIcon={<FaChevronLeft />}
          >
            Back
          </Button>

          <Dropdown
            options={dropdownOptions.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            value={filterStatus}
            onChange={(event) =>
              setFilterStatus(event.target.value as EbillStatus | "ALL")
            }
          />
        </div>
      </div>

      {!loading && (
        <>
          <h1 className="text-2xl font-semibold mb-4">Billing List</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bills.map((bill, index) => (
              <BillCard key={index} bill={bill} />
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPrevious={handlePreviousPage}
              onNext={handleNextPage}
            />
          </div>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title="Payment Details"
        size="md"
      >
        <div className="space-y-4">
          <Dropdown
            label="Bill Status"
            options={Object.values(EbillStatus).map((status) => ({
              label: status,
              value: status,
            }))}
            value={selectedBill?.status || EbillStatus.NONE}
            onChange={(event) => {
              if (selectedBill) {
                setSelectedBill({
                  ...selectedBill,
                  status: event.target.value as EbillStatus,
                });
              }
            }}
          />

          {selectedBill && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bill Status: {getStatusBadge(selectedBill.status)}
              </p>
            </div>
          )}

          <DateInput
            label="Paid Date"
            value={`${parsedPayDate.year}-${parsedPayDate.month}-${parsedPayDate.day}`}
            onChange={(value) => {
              const [year, month, day] = value.split("-");
              const isoDate = new Date(`${year}-${month}-${day}`).toISOString();
              setPaidDate(isoDate);
            }}
          />

          <Input
            label="Paid Price"
            type="number"
            value={
              paidPrice ||
              (selectedBill?.payPrice ? selectedBill.payPrice.toString() : "")
            }
            onChange={(e) => setPaidPrice(e.target.value)}
            placeholder="Enter paid amount"
          />

          {/* Upload slip (local only, no API) */}
          <div>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) {
                  setSlipUploading(false);
                  return;
                }
                setSlipUploading(true);
                try {
                  await uploadBillSlip(file);
                } finally {
                  setSlipUploading(false);
                }
              }}
            />

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  (
                    document.querySelector(
                      'input[type="file"]'
                    ) as HTMLInputElement
                  )?.click()
                }
                loading={slipUploading}
                leftIcon={undefined}
              >
                Upload Slip
              </Button>
            </div>
          </div>

          {selectedBill?.slipURL && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Uploaded Slip:
              </p>
              <Image
                src={selectedBill.slipURL}
                alt="Uploaded Slip"
                width={200}
                height={200}
                className="max-h-40 object-contain rounded"
              />
            </div>
          )}

          <div className="flex gap-4 justify-end mt-6">
            <Button variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSavePayment}>
              Save Payment
            </Button>
          </div>
        </div>
      </Modal>

      <FloatingActionButton onClick={() => alert("Create Billing")} />
    </div>
  );
};

export default BillPage;
