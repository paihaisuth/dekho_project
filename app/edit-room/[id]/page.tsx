"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import roomQuery from "../../axios/roomQuery";
import { Iroom } from "@/schema";
import toast, { Toaster } from "react-hot-toast";
import Loading from "../../components/Loading";
import Input from "../../components/Input";
import Dropdown from "../../components/Dropdown";
import Button from "../../components/Button";
import { EroomType, EroomStatus } from "@/utils/enum";

const EditRoomPage = () => {
  const params = useParams();
  const id = (params as { id?: string })?.id ?? "";
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Iroom>>({
    name: "",
    description: "",
    type: EroomType.AIR,
    status: EroomStatus.AVAILABLE,
    securityPrice: 0,
    waterPerUnit: 0,
    electricityPerUnit: 0,
    rentalPrice: 0,
  });

  useEffect(() => {
    if (!id) return;
    const fetchRoom = async () => {
      setLoading(true);
      try {
        const res = await roomQuery.get(id);
        if (res.statusCode === 200 && res.data) {
          setForm(res.data as Partial<Iroom>);
        } else {
          toast.error(res.errorMessage || "Failed to load room");
        }
      } catch {
        toast.error("Failed to load room");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const handleChange = (
    key: keyof Partial<Iroom>,
    value: string | number | EroomType | EroomStatus | undefined
  ) => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  const validate = (): string | null => {
    if (!form.name || String(form.name).trim() === "")
      return "Name is required";
    if (!form.type) return "Type is required";
    if (!form.status) return "Status is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    if (!id) {
      toast.error("Missing room id");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Iroom> = {
        name: String(form.name || ""),
        description: String(form.description || ""),
        type: form.type as EroomType,
        status: form.status as EroomStatus,
        securityPrice: Number(form.securityPrice || 0),
        waterPerUnit: Number(form.waterPerUnit || 0),
        electricityPerUnit: Number(form.electricityPerUnit || 0),
        rentalPrice: Number(form.rentalPrice ?? 0),
      };

      const res = await roomQuery.update(id, payload as Partial<Iroom>);
      if (res.errorMessage) {
        toast.error(res.errorMessage);
        return;
      }
      toast.success("Room updated");
      router.back();
    } catch {
      toast.error("Failed to update room");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 dark:bg-zinc-900">
      <Toaster position="top-center" />
      {(loading || saving) && (
        <Loading overlay text={saving ? "Saving..." : "Loading room..."} />
      )}

      <div className="w-full max-w-2xl bg-white dark:bg-zinc-800 rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Edit Room</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={form.name as string}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("name", e.target.value)
            }
            required
          />

          <Input
            label="Description"
            value={form.description as string}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("description", e.target.value)
            }
          />

          <Dropdown
            label="Type"
            options={[
              { value: "AIR", label: "AIR" },
              { value: "FAN", label: "FAN" },
            ]}
            value={String(form.type)}
            onChange={(e: { target: { value: string } }) =>
              handleChange("type", e.target.value as EroomType)
            }
          />

          <Dropdown
            label="Status"
            options={[
              { value: "AVAILABLE", label: "Available" },
              { value: "BOOKED", label: "Booked" },
              { value: "LIVED_IN", label: "Occupied" },
            ]}
            value={String(form.status)}
            onChange={(e: { target: { value: string } }) =>
              handleChange("status", e.target.value as EroomStatus)
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Security Price"
              type="number"
              value={String(form.securityPrice ?? "")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("securityPrice", Number(e.target.value))
              }
            />
            <Input
              label="Water Per Unit"
              type="number"
              value={String(form.waterPerUnit ?? "")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("waterPerUnit", Number(e.target.value))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Electricity Per Unit"
              type="number"
              value={String(form.electricityPerUnit ?? "")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("electricityPerUnit", Number(e.target.value))
              }
            />
            <Input
              label="Rental Price"
              type="number"
              value={String(form.rentalPrice ?? "")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("rentalPrice", Number(e.target.value))
              }
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Back
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  // reset to fetched values by reloading
                  if (id) {
                    setLoading(true);
                    try {
                      const res = await roomQuery.get(id);
                      if (res.statusCode === 200 && res.data)
                        setForm(res.data as Partial<Iroom>);
                    } catch {
                      /* ignore */
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
              >
                Reset
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

export default EditRoomPage;
