import { Iuser } from "@/schema";
import { getError, getResponse } from "../utils/function";
import axiosInstance from "./instance";
import { IbodyUpdateUser } from "../api/user/[id]/route";

const userQuery = {
  getUser: async (userID: string) => {
    try {
      const response = await axiosInstance.get(`/user/${userID}`);
      return getResponse<Iuser>(response);
    } catch (error) {
      return getError<Iuser>(error);
    }
  },
  updateUser: async (userID: string, data: Partial<IbodyUpdateUser>) => {
    try {
      const response = await axiosInstance.put(`/user/${userID}`, data);
      return getResponse<Omit<Iuser, "passwordHash">>(response);
    } catch (error) {
      return getError<Omit<Iuser, "passwordHash">>(error);
    }
  },
  deleteUser: async (userID: string) => {
    try {
      const response = await axiosInstance.delete(`/user/${userID}`);
      return getResponse<null>(response);
    } catch (error) {
      return getError<null>(error);
    }
  },
};

export { userQuery };
