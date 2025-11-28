"use client";

import { useAuth } from "@/app/context/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const RepairManagementPage = () => {
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuth();
  const router = useRouter();

  // Validate role
  useEffect(() => {
    if (user?.roleName !== "owner") {
      router.push(`/${locale}/`);
    }
  }, [user, router, locale]);

  return <div>Repair Management Page</div>;
};

export default RepairManagementPage;
