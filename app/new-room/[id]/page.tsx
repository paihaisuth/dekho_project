"use client";

import React, { useState } from "react";
import Input from "../../components/Input";
import Dropdown from "../../components/Dropdown";
import Button from "../../components/Button";
import Loading from "../../components/Loading";
import Toggle from "../../components/Toggle";
import toast, { Toaster } from "react-hot-toast";
import roomQuery from "../../axios/roomQuery";
import { EroomType } from "@/utils/enum";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

interface IcreateRoom {
  name: string;
  type: EroomType;
  from: number;
  to: number;
  prefix: string;
  dormitoryID: string;
  charLength: number;
}

interface FormState {
  name?: string;
  type: EroomType;
  from?: number | "";
  to?: number | "";
  prefix?: string;
  charLength?: number | "";
  dormitoryID?: string;
}

export default function NewRoomPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const routeDormitoryID =
    (params as { id?: string; dormitoryID?: string })?.id ?? "";
  const [dormitoryID, setDormitoryID] = useState<string>(
    routeDormitoryID || (searchParams?.get("dormitoryID") ?? "")
  );
  useEffect(() => {
    setDormitoryID(
      routeDormitoryID || (searchParams?.get("dormitoryID") ?? "")
    );
  }, [routeDormitoryID, searchParams]);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    type: EroomType.AIR,
    from: "",
    to: "",
    prefix: "",
    charLength: "",
  });
  const [mode, setMode] = useState<"single" | "multiple">("single");

  const handleChange = (key: keyof FormState, value: string | number | "") => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  const handleModeChange = (v: string) => {
    const m = v as "single" | "multiple";
    setMode(m);
    if (m === "multiple") {
      setForm((s) => ({ ...s, name: "" }));
    }
  };

  const validate = (): string | null => {
    if (mode === "single") {
      if (!form.name || form.name.trim() === "") return "Name is required.";
      if (!form.type) return "Type is required.";
      return null;
    }

    // multiple
    if (!form.type) return "Type is required.";
    if (form.from === "" || Number.isNaN(Number(form.from)))
      return "From is required.";
    if (form.to === "" || Number.isNaN(Number(form.to)))
      return "To is required.";
    // prefix is optional now
    if (
      form.charLength === "" ||
      Number.isNaN(Number(form.charLength)) ||
      Number(form.charLength) < 1
    )
      return "Char length must be a number >= 1.";
    if (Number(form.from) > Number(form.to))
      return "'From' must be less than or equal to 'To'.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave();
  };

  const handleSave = async () => {
    if (saving) return;
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    if (!dormitoryID || dormitoryID.trim() === "") {
      toast.error("Missing dormitoryID in query string.");
      return;
    }

    setSaving(true);
    try {
      if (mode === "single") {
        // default from/to to 1 when single
        const payload = {
          dormitoryID,
          name: form.name ?? "",
          type: form.type,
          from:
            form.from !== "" && form.from !== undefined ? Number(form.from) : 1,
          to: form.to !== "" && form.to !== undefined ? Number(form.to) : 1,
          prefix: form.prefix ?? "",
          charLength:
            form.charLength !== "" && form.charLength !== undefined
              ? Number(form.charLength)
              : 1,
        };

        const { errorMessage } = await roomQuery.create(payload as IcreateRoom);
        if (errorMessage) {
          toast.error(`${errorMessage}`);
          return;
        }
        toast.success("Room successfully created");
        router.back();
        return;
      }

      // multiple
      const from = Number(form.from);
      const to = Number(form.to);
      const clen = Number(form.charLength);
      for (let i = from; i <= to; i++) {
        const suffix = String(i).padStart(clen, "0");
        const payload = {
          dormitoryID,
          name: `${form.prefix || ""}${suffix}`,
          type: form.type,
          from: i,
          to: i,
          prefix: form.prefix ?? "",
          charLength: clen,
        };

        const { errorMessage } = await roomQuery.create(payload as IcreateRoom);
        if (errorMessage) {
          toast.error(`${errorMessage}`);
          return;
        }
      }

      toast.success("Rooms created");
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 dark:bg-zinc-900">
      <Toaster position="top-center" />
      {saving && <Loading overlay text="Saving..." />}
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-800 rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Create New Room</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-2">
            <Toggle
              value={mode}
              onChange={handleModeChange}
              ariaLabel="Room creation mode"
              size="md"
            />
          </div>

          {mode === "single" ? (
            <>
              <Input
                label="Name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
              <Dropdown
                label="Type"
                options={[
                  { value: "AIR", label: "AIR" },
                  { value: "FAN", label: "FAN" },
                ]}
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
              />
            </>
          ) : (
            <>
              <Dropdown
                label="Type"
                options={[
                  { value: "AIR", label: "AIR" },
                  { value: "FAN", label: "FAN" },
                ]}
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="From"
                  type="number"
                  value={form.from}
                  onChange={(e) =>
                    handleChange(
                      "from",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  required
                />
                <Input
                  label="To"
                  type="number"
                  value={form.to}
                  onChange={(e) =>
                    handleChange(
                      "to",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prefix (optional)"
                  value={form.prefix}
                  onChange={(e) => handleChange("prefix", e.target.value)}
                />
                <Input
                  label="Char Length"
                  type="number"
                  min={1}
                  value={form.charLength}
                  onChange={(e) =>
                    handleChange(
                      "charLength",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  required
                />
              </div>

              {form.from !== "" && form.to !== "" && form.charLength !== "" && (
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                  <div className="font-medium mb-1">Example names</div>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const from = Number(form.from);
                      const to = Number(form.to);
                      const clen = Number(form.charLength);
                      const count = Math.max(0, to - from + 1);
                      const maxShow = Math.min(10, count);
                      const arr: React.ReactNode[] = [];
                      for (let i = from; i < from + maxShow; i++) {
                        const suffix = String(i).padStart(clen, "0");
                        arr.push(
                          <span
                            key={i}
                            className="px-2 py-1 bg-white dark:bg-zinc-700 rounded"
                          >
                            {`${form.prefix || ""}${suffix}`}
                          </span>
                        );
                      }
                      if (count > maxShow) {
                        arr.push(
                          <span
                            key="more"
                            className="px-2 py-1 text-sm text-zinc-500"
                          >
                            +{count - maxShow} more
                          </span>
                        );
                      }
                      return arr;
                    })()}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-between gap-3">
            <div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => window.history.back()}
              >
                Back
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setForm({
                    name: "",
                    type: EroomType.AIR,
                    from: "",
                    to: "",
                    prefix: "",
                    charLength: "",
                  })
                }
              >
                Reset
              </Button>
              <Button type="button" onClick={handleSave} loading={saving}>
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
