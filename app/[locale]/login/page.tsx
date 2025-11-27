"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { authQuery } from "../../axios";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useAuth } from "../../context/AuthProvider";
import { t } from "../../i18n";

const LoginPage = () => {
  const { login } = useAuth();

  const params = useParams();
  const locale = params?.locale as string;

  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault(); // Prevent default form submission
    setLoading(true);
    try {
      const { errorMessage, data } = await authQuery.login({
        username: username.trim(),
        password,
      });

      if (errorMessage) {
        if (errorMessage === "User not found" && locale === "th") {
          toast.error("ไม่พบผู้ใช้ กรุณาลองใหม่อีกครั้ง");
          setLoading(false);
          return;
        }
        if (errorMessage === "Invalid password" && locale === "th") {
          toast.error("รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
          setLoading(false);
          return;
        }
        toast.error(errorMessage || t(locale, "loginFailed"));
        return;
      }

      if (data) {
        login(data.accessToken, data.refreshToken);
        toast.success(t(locale, "loginSuccessful"));
        router.push(`/${locale}/dashboard`);
      } else {
        toast.error(t(locale, "loginFailed"));
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen dark:bg-gray-900 px-4">
      <Toaster position="top-center" />
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md md:max-w-lg bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 sm:p-8 mx-auto"
        role="main"
      >
        <h1 className="text-2xl sm:text-3xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-6">
          {t(locale, "welcomeMessage")}
        </h1>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-4">
          {t(locale, "loginDescription")}
        </p>
        <div className="space-y-4">
          <Input
            label={t(locale, "username")}
            placeholder={t(locale, "usernamePlaceholder")}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <Input
            label={t(locale, "password")}
            placeholder={t(locale, "passwordPlaceholder")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button
          className="w-full mt-6"
          variant="primary"
          type="submit"
          disabled={loading || !username || !password}
        >
          {loading ? t(locale, "loggingIn") : t(locale, "login")}
        </Button>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
          {t(locale, "notHaveAccount")}{" "}
          <Link
            href={`/${locale}/register`}
            className="text-cyan-600 hover:underline"
          >
            {t(locale, "register")}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
