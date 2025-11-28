"use client";

import { useParams, useRouter } from "next/navigation";
import BottomBarMenu from "../../components/BottomBarMenu";
import { useEffect } from "react";
import { useAuth } from "@/app/context/AuthProvider";

const DashboardPage = () => {
  const params = useParams();
  const locale = params?.locale as string;
  const { user } = useAuth();
  const router = useRouter();

  // Validate role
  useEffect(() => {
    if (user?.roleName !== "owner") {
      router.push(`/${locale}/`);
    }
  }, [user, router, locale]);

  return (
    <div className="relative min-h-screen">
      <div>Welcome to the Home Page</div>

      {/* BottomBarMenu Component */}
      <BottomBarMenu locale={locale} />
    </div>
  );
};

export default DashboardPage;
