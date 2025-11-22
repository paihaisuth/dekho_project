import { Ireservation } from "@/schema";
import { getError, getResponse } from "../utils/function";
import axiosInstance from "./instance";

interface IlistReserve {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  items: Ireservation[];
}

const reserveQuery = {
  list: async (roomID: string) => {
    try {
      const response = await axiosInstance.get(`/reservation?roomID=${roomID}`);
      return getResponse<IlistReserve>(response);
    } catch (error) {
      return getError<IlistReserve>(error);
    }
  },

  get: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/reservation/${id}`);
      return getResponse<Ireservation>(response);
    } catch (error) {
      return getError<Ireservation>(error);
    }
  },

  createReserve: async (reserveInfo: Partial<Ireservation>) => {
    try {
      const response = await axiosInstance.post(`/reservation`, reserveInfo);
      return getResponse<Ireservation>(response);
    } catch (error) {
      return getError<Ireservation>(error);
    }
  },

  updateReserve: async (id: string, reserveInfo: Partial<Ireservation>) => {
    try {
      const response = await axiosInstance.put(
        `/reservation/${id}`,
        reserveInfo
      );
      return getResponse<void>(response);
    } catch (error) {
      return getError<void>(error);
    }
  },

  deleteReserve: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/reservation/${id}`);
      return getResponse<void>(response);
    } catch (error) {
      return getError<void>(error);
    }
  },
};

export default reserveQuery;
