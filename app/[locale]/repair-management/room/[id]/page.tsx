"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

const RepairManagementPage = () => {
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {}, []);
  return <div>Repair Management Page</div>;
};

export default RepairManagementPage;
