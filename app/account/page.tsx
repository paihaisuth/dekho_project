"use client";

import { useEffect, useState } from "react";
import BottomBarMenu from "../components/BottomBarMenu";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthProvider";
import { Iuser } from "@/schema";
import { userQuery } from "../axios/userQuery";
import toast, { Toaster } from "react-hot-toast";
import Loading from "../components/Loading";

const initialUser = {
  id: "",
  username: "",
  password: "",
  firstname: "",
  lastname: "",
  email: "",
  phoneNumber: "",
  roleID: "",
  createdAt: "",
  updatedAt: "",
};

const AccountPage = () => {
  const { user, logout } = useAuth();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPersonalInfoModalOpen, setIsPersonalInfoModalOpen] = useState(false);
  const [userData, setUserData] =
    useState<Omit<Iuser, "passwordHash">>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  const initials = `${(userData.firstname || "").charAt(0)}${(
    userData.lastname || ""
  ).charAt(0)}`.toUpperCase();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      if (!user?.userID) return;
      const { data, errorMessage } = await userQuery.getUser(
        user?.userID || ""
      );
      if (errorMessage) {
        toast.error(errorMessage);
        return;
      }

      setUserData(data || initialUser);
      setIsLoading(false);
    };

    fetchUser();
  }, [user?.userID]);

  const handleInputChange = (name: string, value: string) => {
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Update Personal Info Handler
  const handleUpdatePersonalInfo = async () => {
    setIsLoading(true);
    const { errorMessage } = await userQuery.updateUser(user?.userID || "", {
      firstname: userData.firstname,
      lastname: userData.lastname,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
    });

    if (errorMessage) {
      toast.error(errorMessage);
      setIsLoading(false);
      return;
    }

    const { data } = await userQuery.getUser(user?.userID || "");
    setUserData(data || initialUser);
    toast.success("Personal information updated successfully");
    setIsPersonalInfoModalOpen(false);
    setIsLoading(false);
  };

  // Update Password Handler
  const handleUpdatePassword = async () => {
    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const { errorMessage } = await userQuery.updateUser(user?.userID || "", {
      password: passwordData.password,
    });

    if (errorMessage) {
      toast.error(errorMessage);
      setIsLoading(false);
      return;
    }

    toast.success("Password updated successfully");
    setPasswordData({ password: "", confirmPassword: "" });
    setIsPasswordModalOpen(false);
    setIsLoading(false);
    return;
  };

  // Delete Account Handler
  const handleDeleteAccount = async () => {
    setIsLoading(true);
    const { errorMessage } = await userQuery.deleteUser(user?.userID || "");

    if (errorMessage) {
      toast.error(errorMessage);
      setIsLoading(false);
      return;
    }

    toast.success("Account deleted successfully");
    setIsLoading(false);
    logout();
    return;
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="py-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-100 font-semibold ring-2 ring-blue-500">
            {initials || "U"}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {userData.firstname} {userData.lastname}
            </h2>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
              {user?.roleName || userData.roleID || "Unknown Role"}
            </span>
          </div>
        </div>
      </div>
      {/* Personal Information Preview */}
      <div className="py-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">
              First name
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {userData.firstname}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">
              Last name
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {userData.lastname}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {userData.email}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">
              Phone number
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {userData.phoneNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="py-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          Account Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">
              Created at
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {new Date(userData.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">
              Last updated
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {new Date(userData.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen  dark:bg-gray-900 pb-20">
      <Toaster position="top-center" />
      {isLoading && <Loading overlay />}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-1">
            Account Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Account Sections List */}
        <div className="space-y-6">{renderProfileTab()}</div>

        {/* Update and Delete Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
          <Button
            variant="primary"
            onClick={() => setIsPersonalInfoModalOpen(true)}
            className="w-full sm:w-auto"
          >
            Update Personal Info
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full sm:w-auto"
          >
            Change Password
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            className="w-full sm:w-auto"
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Personal Info Modal */}
      <Modal
        open={isPersonalInfoModalOpen}
        onClose={() => setIsPersonalInfoModalOpen(false)}
        title="Update Personal Information"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="First Name"
            name="firstname"
            value={userData.firstname}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            placeholder="Enter your first name"
          />
          <Input
            label="Last Name"
            name="lastname"
            value={userData.lastname}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            placeholder="Enter your last name"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={userData.email}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            placeholder="Enter your email"
          />
          <Input
            label="Phone Number"
            name="phoneNumber"
            value={userData.phoneNumber}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            placeholder="Enter your phone number"
          />
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setIsPersonalInfoModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePersonalInfo}
              className="w-full sm:w-auto"
            >
              Update
            </Button>
          </div>
        </div>
      </Modal>

      {/* Password Modal */}
      <Modal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Password"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="New Password"
            name="password"
            type="password"
            showToggle
            value={passwordData.password}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
              }))
            }
            placeholder="Enter new password"
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            showToggle
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
              }))
            }
            placeholder="Confirm new password"
          />
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setPasswordData({ password: "", confirmPassword: "" });
                setIsPasswordModalOpen(false);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePassword} className="w-full sm:w-auto">
              Update Password
            </Button>
          </div>
        </div>
      </Modal>

      <BottomBarMenu />
    </div>
  );
};

export default AccountPage;
