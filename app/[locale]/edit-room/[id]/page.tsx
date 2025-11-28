"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import roomQuery from "../../../axios/roomQuery";
import { Iroom } from "@/schema";
import toast, { Toaster } from "react-hot-toast";
import Loading from "../../../components/Loading";
import Input from "../../../components/Input";
import Dropdown from "../../../components/Dropdown";
import Button from "../../../components/Button";
import Toggle from "../../../components/Toggle";
import ImageUploadBlock from "../../../components/ImageUploadBlock";
import { EroomType, EroomStatus } from "@/utils/enum";
import fileQuery from "@/app/axios/fileQuery";
import { t } from "@/app/i18n";
import { useAuth } from "@/app/context/AuthProvider";

const EditRoomPageWrapper = () => {
  return (
    <Suspense fallback={<Loading overlay text="Loading..." />}>
      <EditRoomPage />
    </Suspense>
  );
};

const EditRoomPage = () => {
  const params = useParams();
  const id = (params as { id?: string })?.id ?? "";
  const locale = params?.locale as string;
  const router = useRouter();
  const { user } = useAuth();

  if (user?.roleName !== "owner") {
    router.push(`/${locale}/`);
  }

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Iroom>>({
    name: "",
    description: "",
    type: EroomType.AIR,
    status: EroomStatus.AVAILABLE,
    securityPrice: 0,
    waterPrice: 0,
    isFlatPriceWater: false,
    electricityPerUnit: 0,
    rentalPrice: 0,
  });
  const [isFlatPriceWater, setIsFlatPriceWater] = useState(false);
  const [waterPrice, setWaterPrice] = useState("");
  const [images, setImages] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  useEffect(() => {
    if (!id) return;
    const fetchRoom = async () => {
      setLoading(true);
      try {
        const res = await roomQuery.get(id);
        if (res.statusCode === 200 && res.data) {
          setForm(res.data as Partial<Iroom>);
          setIsFlatPriceWater(res.data.isFlatPriceWater);
          setWaterPrice(String(res.data.waterPrice));

          // Ensure exactly 4 images are displayed
          const fetchedImages = res.data.images || [];
          setImages(
            [
              ...fetchedImages,
              ...Array(4 - fetchedImages.length).fill(null),
            ].slice(0, 4)
          );
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
        waterPrice: Number(waterPrice),
        isFlatPriceWater: Boolean(isFlatPriceWater),
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

  const handleToggleChange = (value: boolean) => {
    setIsFlatPriceWater(value);
    if (value) {
      setWaterPrice("");
    }
    if (id) {
      const payload: Partial<Iroom> = {
        ...form,
        waterPrice: value ? Number(waterPrice) : 0,
        isFlatPriceWater: value,
      };
      roomQuery.update(id, payload);
    }
  };

  const uploadImage = async (file: File, index: number) => {
    const { data, errorMessage } = await fileQuery.upload(file, "room-images");
    if (errorMessage) {
      toast.error(errorMessage);
      return null;
    }

    // Replace new image at the specific index
    setImages((imgs) => {
      const newImages = [...imgs];
      newImages[index] = data?.url || null;
      return newImages;
    });

    const { errorMessage: updateError } = await roomQuery.update(id, {
      images: [...(form.images || []), data?.url],
    });

    if (updateError) {
      toast.error(updateError);
      return null;
    }

    toast.success("Image uploaded");
    return data?.url || null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 dark:bg-zinc-900">
      <Toaster position="top-center" />
      {(loading || saving) && (
        <Loading overlay text={saving ? "Saving..." : "Loading room..."} />
      )}

      <div className="w-full max-w-3xl bg-white dark:bg-zinc-800 rounded-2xl shadow p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {t(locale, "editRoom")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t(locale, "name")}
              value={form.name as string}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("name", e.target.value)
              }
              required
            />

            <Input
              label={t(locale, "description")}
              value={form.description as string}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("description", e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dropdown
              label={t(locale, "roomType")}
              options={[
                { value: "AIR", label: t(locale, "airConditioner") },
                { value: "FAN", label: t(locale, "fan") },
              ]}
              value={String(form.type)}
              onChange={(e: { target: { value: string } }) =>
                handleChange("type", e.target.value as EroomType)
              }
            />

            <Dropdown
              label={t(locale, "status")}
              options={[
                { value: "AVAILABLE", label: t(locale, "available") },
                { value: "BOOKED", label: t(locale, "booked") },
                { value: "LIVED_IN", label: t(locale, "occupied") },
              ]}
              value={String(form.status)}
              onChange={(e: { target: { value: string } }) =>
                handleChange("status", e.target.value as EroomStatus)
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t(locale, "securityPrice")}
              type="number"
              value={String(form.securityPrice ?? "")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("securityPrice", Number(e.target.value))
              }
              className="w-full"
            />

            <div className="flex gap-4">
              <div className="w-full flex flex-col sm:flex-row gap-4 items-stretch">
                <div className="flex-1">
                  <Input
                    label={t(locale, "waterPrice")}
                    type="number"
                    value={waterPrice}
                    onChange={async (
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => {
                      setWaterPrice(e.target.value);
                      if (id) {
                        const payload: Partial<Iroom> = {
                          ...form,
                          waterPrice: Number(e.target.value),
                          isFlatPriceWater,
                        };
                        await roomQuery.update(id, payload);
                      }
                    }}
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex flex-col justify-end sm:justify-center">
                    <Toggle
                      className="h-12"
                      options={[
                        {
                          value: "flatPrice",
                          label: t(locale, "flatPrice"),
                        },
                        {
                          value: "perUnit",
                          label: t(locale, "perUnit"),
                        },
                      ]}
                      onChange={() => handleToggleChange(!isFlatPriceWater)}
                      value={isFlatPriceWater ? "flatPrice" : "perUnit"}
                      size="md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t(locale, "electricityPrice")}
              type="number"
              value={String(form.electricityPerUnit ?? "")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("electricityPerUnit", Number(e.target.value))
              }
            />

            <Input
              label={t(locale, "rentalPrice")}
              type="number"
              value={String(form.rentalPrice ?? "")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("rentalPrice", Number(e.target.value))
              }
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              {t(locale, "back")}
            </Button>
            <Button type="submit" loading={saving} variant="primary">
              {t(locale, "save")}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <ImageUploadBlock
            images={images}
            handleUpload={async (file: File, index: number) => {
              setLoading(true);
              try {
                await uploadImage(file, index);
              } finally {
                setLoading(false);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditRoomPageWrapper;
