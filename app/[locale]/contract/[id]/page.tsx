"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "../../../components/Input";
import DateInput from "../../../components/DateInput";
import Button from "../../../components/Button";
import Image from "next/image";
import Loading from "../../../components/Loading";
import { FiUpload } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../../../axios/instance";
import { getError, getResponse } from "../../../utils/function";
import contractQuery from "@/app/axios/contractQuery";
import fileQuery from "@/app/axios/fileQuery";
import { t } from "@/app/i18n";
import { useAuth } from "@/app/context/AuthProvider";

const ContractPage = () => {
  const params = useParams();
  const router = useRouter();
  const roomID = (params as { id?: string })?.id ?? "";
  const locale = (params as { locale?: string })?.locale ?? "en";
  const { user } = useAuth();

  useEffect(() => {
    if (user?.roleName !== "owner") {
      router.push(`/${locale}/`);
    }
  }, [user, router, locale]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [idCardUploading, setIdCardUploading] = useState(false);
  const [contractUploading, setContractUploading] = useState(false);
  const [form, setForm] = useState({
    id: "",
    idCard: "",
    firstname: "",
    lastname: "",
    startDate: "",
    endDate: "",
    securityPriceDate: "",
    securityPrice: 0,
    idCardURL: "",
    contractURL: "",
  });

  const idCardInputRef = useRef<HTMLInputElement | null>(null);
  const contractInputRef = useRef<HTMLInputElement | null>(null);

  const uploadIDCard = async (file: File) => {
    setIdCardUploading(true);
    try {
      const { data, errorMessage } = await fileQuery.upload(
        file,
        `contract/${roomID}`
      );

      if (errorMessage) {
        toast.error(`Failed to upload ID Card file`);
        return;
      }

      const { errorMessage: errorMessageUpdateContract } =
        await contractQuery.update(form.id, {
          idCardURL: data?.url || "",
        });

      if (errorMessageUpdateContract) {
        toast.error(`Failed to update contract with ID Card URL`);
        return;
      }

      toast.success("ID Card uploaded successfully");
      await fetchContract();
      return;
    } finally {
      setIdCardUploading(false);
    }
  };

  const uploadContractDoc = async (file: File) => {
    setContractUploading(true);
    try {
      const { data, errorMessage } = await fileQuery.upload(
        file,
        `contract/${roomID}`
      );

      if (errorMessage) {
        toast.error(`Failed to upload Contract Doc file`);
        return;
      }

      const { errorMessage: errorMessageUpdateContract } =
        await contractQuery.update(form.id, {
          contractURL: data?.url || "",
        });

      if (errorMessageUpdateContract) {
        toast.error(`Failed to update contract with Contract Doc URL`);
        return;
      }

      toast.success("Contract Doc uploaded successfully");
      await fetchContract();

      return;
    } finally {
      setContractUploading(false);
    }
  };

  const fetchContract = useCallback(async () => {
    if (!roomID) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { statusCode, errorMessage, data } =
        await contractQuery.getByRoomID(roomID);

      if (statusCode === 200 && data) {
        setForm({
          id: data.id || "",
          idCard: data.idCard || "",
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          startDate: data.startDate
            ? new Date(data.startDate).toISOString().split("T")[0]
            : "",
          endDate: data.endDate
            ? new Date(data.endDate).toISOString().split("T")[0]
            : "",
          securityPriceDate: data.securityPriceDate
            ? new Date(data.securityPriceDate).toISOString().split("T")[0]
            : "",
          securityPrice: data.securityPrice || 0,
          idCardURL: data.idCardURL || "",
          contractURL: data.contractURL || "",
        });
      } else {
        toast.error(errorMessage || "Failed to load contract");
      }
    } catch {
      toast.error("Failed to load contract");
    } finally {
      setLoading(false);
    }
  }, [roomID]);

  const handleChange = useCallback((key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    fetchContract();
  }, [fetchContract, locale]);

  const validate = useCallback(() => {
    if (!form.idCard.trim()) return t(locale, "requiredIDCard");
    if (!form.firstname.trim()) return t(locale, "requiredFirstName");
    if (!form.lastname.trim()) return t(locale, "requiredLastName");
    if (!form.startDate) return t(locale, "requiredStartDate");
    if (!form.endDate) return t(locale, "requiredEndDate");
    if (!form.securityPriceDate) return t(locale, "requiredSecurityPriceDate");
    if (!form.securityPrice || Number.isNaN(Number(form.securityPrice)))
      return t(locale, "requiredSecurityPrice");

    if (new Date(form.endDate) <= new Date(form.startDate)) {
      return t(locale, "validateStartEndDate");
    }

    return null;
  }, [form, locale]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
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
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        securityPriceDate: new Date(form.securityPriceDate).toISOString(),
        securityPrice: Number(form.securityPrice),
      };

      const response = await axiosInstance.post("/contract", payload);
      const result = getResponse(response);

      if (result.errorMessage) {
        toast.error(result.errorMessage || t(locale, "failCreateContract"));
        return;
      }

      toast.success(t(locale, "successCreateContract"));
      router.back();
    } catch (error) {
      const result = getError(error);
      toast.error(result.errorMessage || t(locale, "failCreateContract"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!roomID) {
      toast.error("Room ID is missing");
      return;
    }

    setDeleting(true);
    try {
      const { errorMessage } = await contractQuery.delete(form.id);

      if (errorMessage) {
        toast.error(errorMessage || t(locale, "failDeleteContract"));
        return;
      }

      toast.success(t(locale, "successDeleteContract"));
      router.back();
    } catch (error) {
      const result = getError(error);
      toast.error(result.errorMessage || "Failed to delete contract");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 dark:bg-zinc-900">
      <Toaster position="top-center" />
      {(loading ||
        saving ||
        deleting ||
        idCardUploading ||
        contractUploading) && (
        <Loading
          overlay
          text={
            loading
              ? "Loading..."
              : idCardUploading
              ? "Uploading ID Card..."
              : contractUploading
              ? "Uploading Contract..."
              : deleting
              ? "Deleting..."
              : "Saving..."
          }
        />
      )}

      <div className="w-full max-w-2xl bg-white dark:bg-zinc-800 rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">
          {t(locale, "createContract")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t(locale, "idCard")}
            value={form.idCard}
            onChange={(e) => handleChange("idCard", e.target.value)}
            required
            placeholder={t(locale, "enterIdCard")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t(locale, "firstName")}
              value={form.firstname}
              onChange={(e) => handleChange("firstname", e.target.value)}
              required
              placeholder={t(locale, "enterFirstName")}
            />
            <Input
              label={t(locale, "lastName")}
              value={form.lastname}
              onChange={(e) => handleChange("lastname", e.target.value)}
              required
              placeholder={t(locale, "enterLastName")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DateInput
              label={t(locale, "startDate")}
              value={form.startDate}
              onChange={(value) => handleChange("startDate", value)}
              required
            />
            <DateInput
              label={t(locale, "endDate")}
              value={form.endDate}
              onChange={(value) => handleChange("endDate", value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DateInput
              label={t(locale, "securityPriceDate")}
              value={form.securityPriceDate}
              onChange={(value) => handleChange("securityPriceDate", value)}
              required
            />
            <Input
              label={t(locale, "securityPrice")}
              type="number"
              value={String(form.securityPrice)}
              onChange={(e) =>
                handleChange("securityPrice", Number(e.target.value))
              }
              required
              placeholder="0.00"
            />
          </div>

          {/* ID Card section (top) */}
          <div className="mb-4">
            <input
              ref={idCardInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await uploadIDCard(file);
              }}
            />

            <div className="flex flex-col items-start gap-2">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => idCardInputRef.current?.click()}
                loading={idCardUploading}
                leftIcon={<FiUpload />}
                className="inline-flex items-center gap-2"
                aria-label="Upload ID Card"
              >
                <span className="inline">{t(locale, "uploadIDCard")}</span>
              </Button>

              {form.idCardURL && (
                <div className="mt-2 w-full">
                  <div className="mb-2">
                    <Image
                      src={form.idCardURL}
                      alt="ID Card preview"
                      width={800}
                      height={450}
                      className="w-full max-h-60 object-contain rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contract Doc section (bottom) */}
          <div className="mb-4">
            <input
              ref={contractInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await uploadContractDoc(file);
              }}
            />

            <div className="flex flex-col items-start gap-2">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => contractInputRef.current?.click()}
                loading={contractUploading}
                leftIcon={<FiUpload />}
                className="inline-flex items-center gap-2"
                aria-label="Upload Contract Doc"
              >
                <span className="inline">{t(locale, "uploadContractDoc")}</span>
              </Button>

              {form.contractURL && (
                <div className="mt-2 w-full">
                  <div className="mb-2">
                    <Image
                      src={form.contractURL}
                      alt="Contract preview"
                      width={800}
                      height={450}
                      className="w-full max-h-60 object-contain rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              {t(locale, "back")}
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                loading={deleting}
                hidden={!form.id}
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

export default ContractPage;
