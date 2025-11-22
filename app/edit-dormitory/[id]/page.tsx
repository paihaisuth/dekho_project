"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosInstance from "../../axios/instance";
import Input from "../../components/Input";
import { dormitoryQuery } from "../../axios";
import toast from "react-hot-toast";
import Loading from "../../components/Loading";
import { useAuth } from "../../context/AuthProvider";

const CustomDateInput = ({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) => {
  return (
    <Input
      label={label}
      value={value}
      onChange={(e) => {
        const cleaned = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
        const dayNum = Number(cleaned);
        if (dayNum >= 1 && dayNum <= 28) {
          onChange(cleaned);
        } else {
          onChange("");
        }
      }}
      placeholder="DD (1-28)"
      required={required}
    />
  );
};

export default function EditDormitoryPage() {
  const [dormName, setDormName] = useState("");
  const [address, setAddress] = useState("");
  const [billingDate, setBillingDate] = useState("");
  const [checkDate, setCheckDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = (params as { id?: string })?.id ?? "";

  useEffect(() => {
    if (!id) return;

    const fetchDorm = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/dormitory/${id}`);
        if (data) {
          setDormName(data.name || "");
          setAddress(data.address || "");
          setBillingDate(data.billingDate || "");
          setCheckDate(data.checkDate || "");
        }
      } catch (err) {
        console.error("Failed to fetch dormitory:", err);
        toast.error("Failed to load dormitory");
      } finally {
        setLoading(false);
      }
    };

    fetchDorm();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!user?.userID || user.userID.trim() === "") {
        setLoading(false);
        return;
      }
      if (id) {
        // update existing dormitory (API expects name/address in body)
        const { errorMessage } = await dormitoryQuery.update(id, {
          name: dormName,
          address,
          billingDate,
          checkDate,
        });

        if (errorMessage) {
          toast.error(`${errorMessage}`);
          setLoading(false);
          return;
        }

        toast.success("Dormitory updated successfully");
        router.push("/dormitory");
      } else {
        const { errorMessage } = await dormitoryQuery.create(user.userID, {
          userID: user.userID,
          name: dormName,
          address,
          billingDate,
          checkDate,
        });

        if (errorMessage) {
          toast.error(`${errorMessage}`);
          setLoading(false);
          return;
        }

        toast.success("Dormitory created successfully");
        router.push("/dormitory");
      }
    } catch (error) {
      console.error("Error creating dormitory:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 dark:bg-zinc-900">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-4">
          {id ? "Edit Dormitory" : "Create New Dormitory"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Dormitory Name"
                placeholder="Enter dormitory name"
                value={dormName}
                onChange={(e) => setDormName(e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                label="Address"
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CustomDateInput
                label="Billing Date"
                value={billingDate}
                onChange={(val) => setBillingDate(val)}
                required
              />
            </div>

            <div>
              <CustomDateInput
                label="Check Date"
                value={checkDate}
                onChange={(val) => setCheckDate(val)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
            >
              Back
            </button>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setDormName("");
                  setAddress("");
                  setBillingDate("");
                  setCheckDate("");
                }}
                className="px-5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
              >
                Reset
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 focus:ring-2 focus:ring-cyan-400"
              >
                Save Dormitory
              </button>
            </div>
          </div>
        </form>

        {loading && <Loading overlay text="Creating dormitory..." />}
      </div>
    </div>
  );
}
