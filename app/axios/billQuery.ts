import { Ibill } from "@/schema";
import { getError, getResponse } from "../utils/function";
import axiosInstance from "./instance";
import { EbillStatus } from "@/utils/enum";

interface IlistBill {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  items: Ibill[];
}

const billQuery = {
  list: async (
    roomID: string,
    page: number = 1,
    pageSize: number = 8,
    filter: { status?: EbillStatus } = {}
  ) => {
    try {
      const params: {
        page: number;
        pageSize: number;
        roomID: string;
        filter: { status?: EbillStatus };
      } = { page, pageSize, roomID, filter };

      const response = await axiosInstance.get(
        `/bill?filter=${JSON.stringify(filter)}`,
        {
          params,
        }
      );
      return getResponse<IlistBill>(response);
    } catch (error) {
      return getError<IlistBill>(error);
    }
  },
  get: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/bill/detail/${id}`);
      return getResponse<Ibill>(response);
    } catch (error) {
      return getError<Ibill>(error);
    }
  },
  update: async (id: string, billData: Partial<Ibill>) => {
    try {
      const response = await axiosInstance.put(`/bill/${id}`, billData);
      return getResponse<Ibill>(response);
    } catch (error) {
      return getError<Ibill>(error);
    }
  },
  delete: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/bill/${id}`);
      return getResponse<null>(response);
    } catch (error) {
      return getError<null>(error);
    }
  },
};

export default billQuery;
