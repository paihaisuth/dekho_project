"use client";

import { useEffect, useRef, useState } from "react";
import BottomBarMenu from "../../components/BottomBarMenu";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthProvider";
import { Iuser } from "@/schema";
import { userQuery } from "../../axios/userQuery";
import toast, { Toaster } from "react-hot-toast";
import Loading from "../../components/Loading";
import fileQuery from "../../axios/fileQuery";
import Image from "next/image";
import { useParams } from "next/navigation";
import { t } from "../../i18n";

const initialUser = {
  id: "",
  username: "",
  password: "",
  firstname: "",
  lastname: "",
  email: "",
  phoneNumber: "",
  roleID: "",
  profileURL: "",
  createdAt: "",
  updatedAt: "",
};

const AccountPage = () => {
  const { user, logout } = useAuth();

  const params = useParams();
  const locale = params?.locale as string;

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPersonalInfoModalOpen, setIsPersonalInfoModalOpen] = useState(false);
  const [userData, setUserData] =
    useState<Omit<Iuser, "passwordHash">>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initials = `${(userData.firstname || "").charAt(0)}${(
    userData.lastname || ""
  ).charAt(0)}`.toUpperCase();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      if (!user?.userID) {
        setIsLoading(false);
        return;
      }
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

  const handleUploadProfilePicture = async (file: File) => {
    setIsLoading(true);
    const { data, errorMessage } = await fileQuery.upload(file, "profile");
    if (errorMessage) {
      toast.error(errorMessage);
      setIsLoading(false);
      return;
    }

    const profileURL = data?.url || "";
    const updateResponse = await userQuery.updateUser(user?.userID || "", {
      profileURL,
    });
    if (updateResponse.errorMessage) {
      toast.error(updateResponse.errorMessage);
      setIsLoading(false);
      return;
    }

    setUserData((prev) => ({ ...prev, profileURL }));
    toast.success("Profile picture updated successfully");
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
            {userData.profileURL ? (
              <Image
                src={userData.profileURL}
                alt="profile"
                className="w-full h-full rounded-full object-cover"
                width={56} // Adjust width as needed
                height={56} // Adjust height as needed
              />
            ) : (
              initials || "U"
            )}
          </div>

          {/* hidden file input for profile upload */}
          <input
            ref={fileInputRef}
            id="profile-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadProfilePicture(file);
              // reset so same file can be picked again if needed
              e.currentTarget.value = "";
            }}
          />

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {userData.firstname} {userData.lastname}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                {user?.roleName || userData.roleID}
              </span>
              <div className="ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm px-2 py-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t(locale, "updateProfile")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Preview */}
      <div className="py-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          {t(locale, "personalInformation")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">
              {t(locale, "firstName")}
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {userData.firstname}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">
              {t(locale, "lastName")}
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {userData.lastname}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">
              {t(locale, "email")}
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {userData.email}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">
              {t(locale, "phoneNumber")}
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
          {t(locale, "accountDetails")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">
              {t(locale, "createdAt")}
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
              {t(locale, "lastUpdated")}
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
            {t(locale, "accountPageTitle")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t(locale, "accountPageDescription")}
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
            {t(locale, "updatePersonalInfo")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full sm:w-auto"
          >
            {t(locale, "changePassword")}
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            className="w-full sm:w-auto"
          >
            {t(locale, "deleteAccount")}
          </Button>
        </div>
      </div>

      {/* Personal Info Modal */}
      <Modal
        open={isPersonalInfoModalOpen}
        onClose={() => setIsPersonalInfoModalOpen(false)}
        title={t(locale, "updatePersonalInfo")}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label={t(locale, "firstName")}
            name="firstname"
            value={userData.firstname}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            placeholder={t(locale, "enterFirstName")}
          />
          <Input
            label={t(locale, "lastName")}
            name="lastname"
            value={userData.lastname}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            placeholder={t(locale, "enterLastName")}
          />
          <Input
            label={t(locale, "email")}
            name="email"
            type="email"
            value={userData.email}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            placeholder={t(locale, "enterEmail")}
          />
          <Input
            label={t(locale, "phoneNumber")}
            name="phoneNumber"
            value={userData.phoneNumber}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            placeholder={t(locale, "enterPhoneNumber")}
          />
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setIsPersonalInfoModalOpen(false)}
              className="w-full sm:w-auto"
            >
              {t(locale, "cancel")}
            </Button>
            <Button
              onClick={handleUpdatePersonalInfo}
              className="w-full sm:w-auto"
            >
              {t(locale, "update")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Password Modal */}
      <Modal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title={t(locale, "changePassword")}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label={t(locale, "newPassword")}
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
            placeholder={t(locale, "enterNewPassword")}
          />
          <Input
            label={t(locale, "confirmPassword")}
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
            placeholder={t(locale, "enterConfirmPassword")}
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
              {t(locale, "cancel")}
            </Button>
            <Button onClick={handleUpdatePassword} className="w-full sm:w-auto">
              {t(locale, "updatePassword")}
            </Button>
          </div>
        </div>
      </Modal>

      <BottomBarMenu locale={locale} />
    </div>
  );
};

export default AccountPage;
