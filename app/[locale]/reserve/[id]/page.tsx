"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Input from "../../../components/Input";
import DateInput from "../../../components/DateInput";
import Button from "../../../components/Button";
import Loading from "../../../components/Loading";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../../../axios/instance";
import { getError, getResponse } from "../../../utils/function";
import reserveQuery from "@/app/axios/reserveQuery";
import fileQuery from "@/app/axios/fileQuery";
import { t } from "@/app/i18n";
import { useAuth } from "@/app/context/AuthProvider";

interface ReservationForm {
  id: string;
  idCard: string;
  firstname: string;
  lastname: string;
  reservePriceDate: string;
  reservePrice: number | "";
  securityPriceDate: string;
  securityPrice: number | "";
  slipURL: string;
}

const ReservePage = () => {
  const params = useParams();
  const router = useRouter();
  const roomID = (params as { id?: string })?.id ?? "";
  const locale = params.locale as string;
  const { user } = useAuth();

  // Redirect if not owner
  useEffect(() => {
    if (user?.roleName !== "owner") {
      router.push(`/${locale}/`);
    }
  }, [user, router, locale]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<ReservationForm>({
    id: "",
    idCard: "",
    firstname: "",
    lastname: "",
    reservePriceDate: "",
    reservePrice: "",
    securityPriceDate: "",
    securityPrice: "",
    slipURL: "",
  });

  const handleUploadEvidence = async (file: File) => {
    if (!file) {
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);

    const { data, errorMessage } = await fileQuery.upload(
      file,
      `reservation_evidences_${roomID}`
    );

    if (errorMessage) {
      toast.error(errorMessage || "Failed to upload evidence");
      return;
    }

    const { errorMessage: errorMessageUpdateReservation } =
      await reserveQuery.updateReserve(form.id, { slipURL: data?.url || "" });

    if (errorMessageUpdateReservation) {
      toast.error(
        errorMessageUpdateReservation ||
          "Failed to update reservation with evidence"
      );
      return;
    }

    toast.success("Evidence uploaded and reservation updated successfully");
  };

  useEffect(() => {
    const fetchReservation = async () => {
      setLoading(true);
      try {
        if (!roomID) {
          setLoading(false);
          return;
        }

        const res = await reserveQuery.get(roomID);
        if (res.statusCode === 200 && res.data) {
          const data = res.data;
          setForm({
            id: data.id || "",
            idCard: data.idCard || "",
            firstname: data.firstname || "",
            lastname: data.lastname || "",
            reservePriceDate: data.reservePriceDate
              ? new Date(data.reservePriceDate).toISOString().split("T")[0]
              : "",
            reservePrice: data.reservePrice || "",
            securityPriceDate: data.securityPriceDate
              ? new Date(data.securityPriceDate).toISOString().split("T")[0]
              : "",
            securityPrice: data.securityPrice || "",
            slipURL: data.slipURL || "",
          });
        } else {
          toast.error(res.errorMessage || "Failed to load reservation");
        }
      } catch {
        toast.error("Failed to load reservation");
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [roomID]);

  const handleChange = useCallback(
    (key: keyof ReservationForm, value: string | number | "") => {
      setForm((s) => ({ ...s, [key]: value }));
    },
    []
  );

  const handleReservePriceDateChange = useCallback((value: string) => {
    setForm((s) => ({ ...s, reservePriceDate: value }));
  }, []);

  const handleSecurityPriceDateChange = useCallback((value: string) => {
    setForm((s) => ({ ...s, securityPriceDate: value }));
  }, []);

  const validate = (): string | null => {
    if (!form.idCard || form.idCard.trim() === "") return "ID Card is required";
    if (!form.firstname || form.firstname.trim() === "")
      return "First name is required";
    if (!form.lastname || form.lastname.trim() === "")
      return "Last name is required";
    if (!form.reservePriceDate) return "Reserve price date is required";
    if (form.reservePrice === "" || Number.isNaN(Number(form.reservePrice)))
      return "Reserve price is required";
    if (!form.securityPriceDate) return "Security price date is required";
    if (form.securityPrice === "" || Number.isNaN(Number(form.securityPrice)))
      return "Security price is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    if (!roomID) {
      toast.error("Room ID is missing");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        roomID,
        idCard: form.idCard,
        firstname: form.firstname,
        lastname: form.lastname,
        reservePriceDate: new Date(form.reservePriceDate).toISOString(),
        reservePrice: Number(form.reservePrice),
        securityPriceDate: new Date(form.securityPriceDate).toISOString(),
        securityPrice: Number(form.securityPrice),
      };

      const response = await axiosInstance.post("/reservation", payload);
      const result = getResponse<void>(response);

      if (result.errorMessage) {
        toast.error(result.errorMessage);
        return;
      }

      toast.success("Reservation created successfully");
      router.back();
    } catch (error) {
      const result = getError<void>(error);
      toast.error(result.errorMessage || "Failed to create reservation");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await reserveQuery.deleteReserve(form.id);
      if (res.errorMessage) {
        toast.error(res.errorMessage);
        return;
      }

      toast.success("Reservation deleted successfully");
      router.back();
    } catch (error) {
      const result = getError<void>(error);
      toast.error(result.errorMessage || "Failed to delete reservation");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 dark:bg-zinc-900">
      <Toaster position="top-center" />
      {(loading || saving || deleting) && (
        <Loading
          overlay
          text={loading ? "Loading..." : deleting ? "Deleting..." : "Saving..."}
        />
      )}

      <div className="w-full max-w-2xl bg-white dark:bg-zinc-800 rounded-2xl shadow p-4 md:p-6">
        <h1 className="text-2xl font-semibold mb-4">
          {t(locale, "reservationTitle")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t(locale, "idCard")}
            value={form.idCard}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("idCard", e.target.value)
            }
            required
            placeholder={t(locale, "enterIdCard")}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t(locale, "firstName")}
              value={form.firstname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("firstname", e.target.value)
              }
              required
              placeholder={t(locale, "enterFirstName")}
            />
            <Input
              label={t(locale, "lastName")}
              value={form.lastname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("lastname", e.target.value)
              }
              required
              placeholder={t(locale, "enterLastName")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateInput
              label={t(locale, "reservePriceDate")}
              value={form.reservePriceDate}
              onChange={handleReservePriceDateChange}
              required
            />
            <Input
              label={t(locale, "reservePrice")}
              type="number"
              value={String(form.reservePrice)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("reservePrice", Number(e.target.value))
              }
              required
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateInput
              label={t(locale, "securityPriceDate")}
              value={form.securityPriceDate}
              onChange={handleSecurityPriceDateChange}
              required
            />
            <Input
              label={t(locale, "securityPrice")}
              type="number"
              value={String(form.securityPrice)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("securityPrice", Number(e.target.value))
              }
              required
              placeholder="0.00"
            />
          </div>
          {form.slipURL && (
            <div className="mt-4 relative w-full h-64 md:h-96">
              <Image
                src={form.slipURL}
                alt="Uploaded Slip"
                fill
                className="rounded-lg shadow-md object-contain"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <input
              type="file"
              id="evidenceFileInput"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files && e.target.files.length > 0) {
                  await handleUploadEvidence(e.target.files[0]);
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const fileInput = document.getElementById("evidenceFileInput");
                if (fileInput) {
                  fileInput.click();
                }
              }}
              className="w-full"
            >
              {t(locale, "uploadEvidence")}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              {t(locale, "back")}
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                loading={deleting}
                hidden={form.id === ""}
              >
                {t(locale, "delete")}
              </Button>
              <Button type="submit" loading={saving}>
                {t(locale, "save")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservePage;
