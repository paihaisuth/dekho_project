"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "../../components/Input";
import DateInput from "../../components/DateInput";
import Button from "../../components/Button";
import Loading from "../../components/Loading";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../../axios/instance";
import { getError, getResponse } from "../../utils/function";
import reserveQuery from "@/app/axios/reserveQuery";

interface ReservationForm {
  id: string;
  idCard: string;
  firstname: string;
  lastname: string;
  reservePriceDate: string;
  reservePrice: number | "";
  securityPriceDate: string;
  securityPrice: number | "";
}

const ReservePage = () => {
  const params = useParams();
  const router = useRouter();
  const roomID = (params as { id?: string })?.id ?? "";

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
  });

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

      <div className="w-full max-w-2xl bg-white dark:bg-zinc-800 rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Create Reservation</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="ID Card"
            value={form.idCard}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("idCard", e.target.value)
            }
            required
            placeholder="Enter ID card number"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={form.firstname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("firstname", e.target.value)
              }
              required
              placeholder="Enter first name"
            />
            <Input
              label="Last Name"
              value={form.lastname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("lastname", e.target.value)
              }
              required
              placeholder="Enter last name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DateInput
              label="Reserve Price Date"
              value={form.reservePriceDate}
              onChange={handleReservePriceDateChange}
              required
            />
            <Input
              label="Reserve Price"
              type="number"
              value={String(form.reservePrice)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("reservePrice", Number(e.target.value))
              }
              required
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DateInput
              label="Security Price Date"
              value={form.securityPriceDate}
              onChange={handleSecurityPriceDateChange}
              required
            />
            <Input
              label="Security Price"
              type="number"
              value={String(form.securityPrice)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("securityPrice", Number(e.target.value))
              }
              required
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Back
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                loading={deleting}
                hidden={form.id === ""}
              >
                Delete
              </Button>
              <Button type="submit" loading={saving}>
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservePage;
