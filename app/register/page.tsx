"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";
import toast, { Toaster } from "react-hot-toast";
import Input from "../components/Input";
import Dropdown from "../components/Dropdown";
import { authQuery, roleQuery } from "../axios";

export default function RegisterPage() {
  const [roleID, setRoleID] = useState<string>(""); // Ensure "Please select" is shown first
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
        router.push("/");
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
          label: r.name,
        }));
        setRoles(roleOptions);
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();
  }, []);

  return (
    <div className="min-h-screen bg-cyan-50 dark:bg-black flex items-center justify-center p-6">
      {loading && <Loading overlay size="lg" />}
      <Toaster position="top-center" />

      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="hidden md:flex items-center justify-center bg-linear-to-br from-cyan-500 to-white p-8">
          <div className="text-center">
            <Image
              src="/next.svg"
              alt="Logo"
              width={96}
              height={28}
              className="dark:invert mx-auto mb-6"
            />
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Join Dekho
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto">
              Create an account to manage or reserve rooms. Choose your role and
              fill in the details.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
            Create an account
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Fill in the form to create your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Dropdown
              label="Role"
              options={roles}
              value={roleID}
              onChange={(e) => setRoleID(e.target.value)}
              disabled={loading}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                disabled={loading}
              />
              <Input
                label="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                disabled={loading}
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              disabled={loading}
            />

            <Input
              label="Phone number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 555 555 5555"
              disabled={loading}
            />

            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              disabled={loading}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                showToggle
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
              <Input
                label="Confirm password"
                type="password"
                showToggle
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
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
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center mt-3">
              Already have an account?{" "}
              <span className="text-cyan-600">Sign in</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
