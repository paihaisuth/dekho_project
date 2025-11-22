"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "./components/Input";
import Button from "./components/Button";
import { toast, Toaster } from "react-hot-toast";
import { authQuery } from "./axios";
import { useAuth } from "./context/AuthProvider";

const LoginPage = () => {
  const { login } = useAuth();

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
        toast.error(errorMessage || "Login failed. Please try again.");
        return;
      }

      if (data) {
        login(data.accessToken, data.refreshToken);
        toast.success("Login successful!");
        router.push("/dashboard"); // Redirect to home page after successful login
      } else {
        toast.error("Login failed. Please try again.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-center" />
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6"
      >
        <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-6">
          Welcome to Dekho
        </h1>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-4">
          Dormitory Management System
        </p>
        <div className="space-y-4">
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            disabled={loading}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={loading}
          />
        </div>
        <Button
          className="w-full mt-6"
          variant="primary"
          type="submit"
          disabled={loading || !username || !password}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
          Don’t have an account?{" "}
          <Link href="/register" className="text-cyan-600 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
