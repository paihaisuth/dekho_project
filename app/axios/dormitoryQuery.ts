import { Idormitory } from "@/schema";
import { getError, getResponse } from "../utils/function";
import axiosInstance from "./instance";

interface IlistDormitory {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  items: Idormitory[];
}

interface IcreateDormitory {
  userID: string;
  name: string;
  address: string;
  billingDate: string;
  checkDate: string;
}

const dormitoryQuery = {
  list: async (
    userID: string,
    page: number,
    filters: { name?: string } = {}
  ) => {
    try {
      const filterQuery = filters.name
        ? `&filter={"name":"${filters.name}"}`
        : "";
      const response = await axiosInstance.get(
        `/dormitory?page=${page}&pageSize=8&userID=${userID}${filterQuery}`
      );
      return getResponse<IlistDormitory>(response);
    } catch (error) {
      return getError<IlistDormitory>(error);
    }
  },
  create: async (userID: string, data: IcreateDormitory) => {
    try {
      const response = await axiosInstance.post(
        `/dormitory?userID=${userID}`,
        data
      );
      return getResponse<Idormitory>(response);
    } catch (error) {
      return getError<Idormitory>(error);
    }
  },
  update: async (id: string, data: Partial<IcreateDormitory>) => {
    try {
      const response = await axiosInstance.put(`/dormitory/${id}`, data);
      return getResponse<{ message: string }>(response);
    } catch (error) {
      return getError<{ message: string }>(error);
    }
  },
  delete: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/dormitory/${id}`);
      return getResponse<{ message: string }>(response);
    } catch (error) {
      return getError<{ message: string }>(error);
    }
  },
};

export default dormitoryQuery;
