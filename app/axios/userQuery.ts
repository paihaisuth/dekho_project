import { Iuser } from "@/schema";
import { getError, getResponse } from "../utils/function";
import axiosInstance from "./instance";

const userQuery = {
  getUser: async (userID: string) => {
    try {
      const response = await axiosInstance.get(`/user/${userID}`);
      return getResponse<Iuser>(response);
    } catch (error) {
      return getError<Iuser>(error);
    }
  },
  updateUser: async (userID: string, data: Partial<Iuser>) => {
    try {
      const response = await axiosInstance.put(`/user/${userID}`, data);
      return getResponse<Iuser>(response);
    } catch (error) {
      return getError<Iuser>(error);
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
