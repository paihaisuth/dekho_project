"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import roomQuery from "../../axios/roomQuery";
import { Iroom } from "@/schema";
import toast, { Toaster } from "react-hot-toast";
import Button from "../../components/Button";
import Loading from "../../components/Loading";
import Input from "../../components/Input";
import Dropdown from "../../components/Dropdown";
import { useRouter } from "next/navigation";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTools,
  FaDoorOpen,
  FaPlus,
  FaClock,
  FaBolt,
  FaSnowflake,
  FaWrench,
  FaWind,
  FaChevronLeft,
  FaTint,
} from "react-icons/fa";
import Pagination from "../../components/Pagination";
import { EroomStatus } from "@/utils/enum";
import Modal from "../../components/Modal";
import { EroomType } from "@/utils/enum";

function getIconByType(type: string) {
  switch ((type || "").toUpperCase()) {
    case "FAN":
      return <FaWind className="text-blue-600" />;
    case "AIR":
      return <FaSnowflake className="text-sky-600" />;
    default:
      return <FaTools className="text-gray-600" />;
  }
}

function getRepairBadge(repairStatus?: string) {
  const status = (repairStatus || "").toUpperCase();

  switch (status) {
    case "REPAIRING":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
          <FaWrench className="mr-1 text-xs text-yellow-700" /> Repairing
        </span>
      );
    case "SCHEDULED":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
          <FaWrench className="mr-1 text-xs text-yellow-700" /> Scheduled
        </span>
      );
    case "NONE":
    default:
      return <></>;
  }
}

function getStatusBadge(status: EroomStatus) {
  switch (status) {
    case "AVAILABLE":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-200 text-green-900">
          <FaCheckCircle className="mr-1 text-green-700" /> Available
        </span>
      );

    case "BOOKED":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-900">
          <FaExclamationTriangle className="mr-1 text-yellow-700" /> Booked
        </span>
      );

    case "LIVED_IN":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-900">
          <FaBolt className="mr-1 text-red-700" /> Occupied
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-900">
          <FaTools className="mr-1 text-gray-700" /> Unknown
        </span>
      );
  }
}

function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const dormitoryId = (params as { id?: string })?.id ?? "";
  const [rooms, setRooms] = useState<Iroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Iroom | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("ALL");
  const [roomStatusFilter, setRoomStatusFilter] = useState("ALL");
  const fetchRooms = useCallback(
    async (
      currentPage: number,
      dormitoryId: string,
      roomType?: string,
      roomStatus?: string,
      searchQuery?: string
    ) => {
      if (!dormitoryId) {
        toast.error("Dormitory ID is required.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const filters: {
          type?: EroomType;
          status?: EroomStatus;
          name?: string;
        } = {};
        if (roomType && roomType !== "ALL") {
          filters.type = roomType as EroomType;
        }
        if (roomStatus && roomStatus !== "ALL") {
          filters.status = roomStatus as EroomStatus;
        }
        if (searchQuery && searchQuery.trim() !== "") {
          filters.name = searchQuery;
        }
        const response = await roomQuery.list(
          dormitoryId,
          filters,
          currentPage
        );
        if (response.statusCode === 200) {
          const { items, page, pageCount } = response.data;
          setRooms(items);
          setPage(page);
          setTotalPages(pageCount);
        } else {
          toast.error(response.errorMessage || "Failed to fetch rooms.");
        }
      } catch {
        toast.error("An error occurred while fetching rooms.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleDeleteRoom = async () => {
    setLoading(true);
    if (!selectedRoom) return;

    setDeleting(true);
    const res = await roomQuery.delete(selectedRoom.id);
    setDeleting(false);
    if (res.errorMessage) {
      toast.error(res.errorMessage);
      setLoading(false);
      return;
    }
    toast.success("Room deleted successfully");
    setMenuOpen(false);
    fetchRooms(
      page,
      dormitoryId || "",
      roomTypeFilter,
      roomStatusFilter,
      searchQuery
    );
    setLoading(false);
    setPage(1);
  };

  useEffect(() => {
    fetchRooms(
      page,
      dormitoryId || "",
      roomTypeFilter,
      roomStatusFilter,
      searchQuery
    );
  }, [
    fetchRooms,
    page,
    dormitoryId,
    roomTypeFilter,
    roomStatusFilter,
    searchQuery,
  ]);

  const handlePreviousPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  return (
    <div className="p-6 relative min-h-[200px] pb-40 md:pb-32">
      <Toaster position="top-center"></Toaster>
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            leftIcon={<FaChevronLeft />}
            className="w-full sm:w-auto"
          >
            Back
          </Button>

          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            className="flex-1"
          />

          <Dropdown
            label=""
            options={[
              { value: "ALL", label: "Type" },
              { value: "FAN", label: "FAN" },
              { value: "AIR", label: "AIR" },
            ]}
            value={roomTypeFilter}
            onChange={(e: { target: { value: string } }) =>
              setRoomTypeFilter(e.target.value)
            }
            className="w-full sm:w-40"
          />

          <Dropdown
            label=""
            options={[
              { value: "ALL", label: "Status" },
              { value: "AVAILABLE", label: "Available" },
              { value: "BOOKED", label: "Booked" },
              { value: "LIVED_IN", label: "Occupied" },
            ]}
            value={roomStatusFilter}
            onChange={(e: { target: { value: string } }) =>
              setRoomStatusFilter(e.target.value)
            }
            className="w-full sm:w-40"
          />

          <Button
            leftIcon={<FaPlus />}
            onClick={() => router.push(`/new-room?dormitoryID=${dormitoryId}`)}
            variant="primary"
            size="md"
            disabled={loading}
            className="w-full sm:w-auto sm:ml-auto"
          >
            Create Room
          </Button>
        </div>
      </div>

      <div>
        {loading ? (
          <div
            className="flex items-center justify-center py-12"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <Loading size="lg" overlay />
          </div>
        ) : rooms && rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedRoom(room);
                  setMenuOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedRoom(room);
                    setMenuOpen(true);
                  }
                }}
                className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold mb-2 text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
                  <FaDoorOpen className="text-cyan-600" />
                  <span>{room.name}</span>
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                  {getIconByType(room.type)}
                  <span className="font-medium">{room.type}</span>
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                  <FaClock className="text-purple-600" /> Created:{" "}
                  {new Date(room.createdAt).toLocaleDateString()}
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                  <FaClock className="text-blue-600" /> Updated:{" "}
                  {new Date(room.updatedAt).toLocaleDateString()}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  {getRepairBadge(room.repairStatus)}
                  {getStatusBadge(room.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No rooms found for this dormitory.</p>
        )}
      </div>

      <Modal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={
          <div className="inline-flex items-center gap-2 text-cyan-600">
            <FaDoorOpen className="text-cyan-600" />{" "}
            {selectedRoom ? selectedRoom.name : "Actions"}
          </div>
        }
        size="sm"
      >
        <div className="flex flex-col gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              if (!selectedRoom) return;
              router.push(`/reserve/${selectedRoom.id}`);
            }}
          >
            Reserve
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              if (!selectedRoom) return;
              router.push(`/contract/${selectedRoom.id}`);
            }}
          >
            Make Contract
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              if (!selectedRoom) return;
              router.push(`/bill/${selectedRoom.id}`);
            }}
          >
            Billing
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              if (!selectedRoom) return;
              router.push(`/edit-room/${selectedRoom.id}`);
            }}
          >
            Edit
          </Button>

          <Button
            variant="danger"
            loading={deleting}
            onClick={handleDeleteRoom}
          >
            Delete
          </Button>
        </div>
      </Modal>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPrevious={handlePreviousPage}
        onNext={handleNextPage}
        autoShow
      />
    </div>
  );
}

export default RoomPage;
