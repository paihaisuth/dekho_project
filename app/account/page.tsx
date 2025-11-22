"use client";

import BottomBarMenu from "../components/BottomBarMenu";
import { useAuth } from "../context/AuthProvider";

const AccountPage = () => {
  const { user } = useAuth();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Account Page</h1>
      <p>Manage your account settings and preferences here.</p>

      {/* Display decoded payload */}
      {user && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Decoded Token Payload:</h2>
          <pre className="text-sm bg-white p-2 rounded-md shadow-md overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}

      <BottomBarMenu />
    </div>
  );
};

export default AccountPage;
