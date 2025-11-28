"use client";

import React, { useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { dormitoryQuery } from "../../axios";
import toast from "react-hot-toast";
import Loading from "../../components/Loading";
import { useAuth } from "../../context/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import { t } from "@/app/i18n";

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

export default function NewDormitoryPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [dormName, setDormName] = useState("");
  const [address, setAddress] = useState("");
  const [billingDate, setBillingDate] = useState("");
  const [checkDate, setCheckDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  if (user?.roleName !== "owner") {
    router.push(`/${locale}/`);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!user?.userID || user.userID.trim() === "") {
        setLoading(false);
        return;
      }

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

      if (locale === "th") {
        toast.success("สร้างหอพักเรียบร้อยแล้ว");
      } else {
        toast.success("Dormitory created successfully");
      }
      router.push(`/${locale}/dormitory`);
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
          {t(locale, "createNewDormitory")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label={t(locale, "dormitoryName")}
                placeholder={t(locale, "enterDormitoryName")}
                value={dormName}
                onChange={(e) => setDormName(e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                label={t(locale, "address")}
                placeholder={t(locale, "enterAddress")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CustomDateInput
                label={t(locale, "billingDate")}
                value={billingDate}
                onChange={(val) => setBillingDate(val)}
                required
              />
            </div>

            <div>
              <CustomDateInput
                label={t(locale, "checkDate")}
                value={checkDate}
                onChange={(val) => setCheckDate(val)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              {t(locale, "back")}
            </Button>

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
                {t(locale, "reset")}
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 focus:ring-2 focus:ring-cyan-400"
              >
                {t(locale, "save")}
              </button>
            </div>
          </div>
        </form>

        {loading && <Loading overlay text={t(locale, "creating")} />}
      </div>
    </div>
  );
}
