"use client";

import { useParams } from "next/navigation";
import BottomBarMenu from "../../components/BottomBarMenu";

const DashboardPage = () => {
  const params = useParams();
  const locale = params?.locale as string;

  return (
    <div className="relative min-h-screen">
      <div>Welcome to the Home Page</div>

      {/* BottomBarMenu Component */}
      <BottomBarMenu locale={locale} />
    </div>
  );
};

export default DashboardPage;
