import { getError, getResponse } from "../utils/function";
import axiosInstance from "./instance";
import { Irole } from "@/schema";

interface IlistRole {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  items: Irole[];
}

const roleQuery = {
  list: async () => {
    try {
      const response = await axiosInstance.get("/role");
      return getResponse<IlistRole>(response);
    } catch (error) {
      return getError<IlistRole>(error);
    }
  },
};

export default roleQuery;
