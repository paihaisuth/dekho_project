"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Loading from "../../components/Loading";
import toast, { Toaster } from "react-hot-toast";
import Input from "../../components/Input";
import Dropdown from "../../components/Dropdown";
import { authQuery, roleQuery } from "../../axios";
import { t } from "@/app/i18n";
import Link from "next/link";

export default function RegisterPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [roleID, setRoleID] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter your first and last name.");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    if (!username.trim()) {
      toast.error("Please enter a username.");
      return;
    }
    if (!password) {
      toast.error("Please enter a password.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!roleID) {
      toast.error("Please select a role.");
      return;
    }

    setLoading(true);
    try {
      const { errorMessage } = await authQuery.register({
        firstname: firstName,
        lastname: lastName,
        email,
        username,
        password,
        phoneNumber,
        roleID,
      });

      if (errorMessage) {
        toast.error(errorMessage || "Registration failed.");
        return;
      }

      toast.success("Account created successfully. Redirecting...");

      // delay 3 seconds then redirect to /
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      return;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchRoles() {
      setLoading(true);
      try {
        const { statusCode, data, errorMessage } = await roleQuery.list();

        if (statusCode !== 200)
          toast.error(errorMessage || "Failed to fetch roles.");

        const roleOptions = data.items.map((r) => ({
          value: r.id,
          label: t(locale, r.name),
        }));
        setRoles(roleOptions);
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();
  }, [locale]);

  return (
    <div className="min-h-screen bg-cyan-50 dark:bg-black flex items-center justify-center p-6">
      {loading && <Loading overlay size="lg" />}
      <Toaster position="top-center" />

      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8 md:p-10">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
            {t(locale, "createAnAccount")}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            {t(locale, "registerDescription")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Dropdown
              label={t(locale, "role")}
              options={roles}
              value={roleID}
              onChange={(e) => setRoleID(e.target.value)}
              disabled={loading}
              locale={locale}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t(locale, "firstName")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t(locale, "enterFirstName")}
                disabled={loading}
              />
              <Input
                label={t(locale, "lastName")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t(locale, "enterLastName")}
                disabled={loading}
              />
            </div>

            <Input
              label={t(locale, "email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t(locale, "enterEmail")}
              disabled={loading}
            />

            <Input
              label={t(locale, "phoneNumber")}
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={t(locale, "enterPhoneNumber")}
              disabled={loading}
            />

            <Input
              label={t(locale, "username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t(locale, "usernamePlaceholder")}
              disabled={loading}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t(locale, "password")}
                type="password"
                showToggle
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t(locale, "passwordPlaceholder")}
                disabled={loading}
              />
              <Input
                label={t(locale, "confirmPassword")}
                type="password"
                showToggle
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t(locale, "enterConfirmPassword")}
                disabled={loading}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full cursor-pointer rounded-lg px-4 py-3 text-white font-medium transition ${
                  loading
                    ? "bg-cyan-700 opacity-90 cursor-wait"
                    : "bg-cyan-600 hover:bg-cyan-700"
                }`}
              >
                {loading
                  ? t(locale, "creatingAccount")
                  : t(locale, "createAccount")}
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center mt-3">
              {t(locale, "alreadyHaveAccount")}
              <Link href={`/${locale}/login`} className=" hover:underline">
                <span className="text-cyan-600">{t(locale, "loginNow")}</span>
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
