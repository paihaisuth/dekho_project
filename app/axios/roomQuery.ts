import { IfilterListRoom } from "@/utils/interface";
import axiosInstance from "./instance";
import { getError, getResponse } from "../utils/function";
import { Iroom } from "@/schema";
import { EroomType } from "@/utils/enum";

interface IlistRoom {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  items: Iroom[];
}

interface IcreateRoom {
  type: EroomType;
  from?: number;
  to?: number;
  prefix?: string;
  dormitoryID: string;
  charLength?: number;
  name?: string;
}

const roomQuery = {
  list: async (dormitoryID: string, filter: IfilterListRoom, page: number) => {
    try {
      const response = await axiosInstance.get("/room", {
        params: {
          dormitoryID,
          filter: JSON.stringify(filter),
          page,
          pageSize: 8,
        },
      });
      return getResponse<IlistRoom>(response);
    } catch (error) {
      return getError<IlistRoom>(error);
    }
  },
  create: async (data: IcreateRoom) => {
    try {
      const response = await axiosInstance.post("/room", data);
      return getResponse<void>(response);
    } catch (error) {
      return getError<void>(error);
    }
  },
  get: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/room/${id}`);
      return getResponse<Iroom>(response);
    } catch (error) {
      return getError<Iroom>(error);
    }
  },
  update: async (id: string, roomInfo: Partial<Iroom>) => {
    try {
      const response = await axiosInstance.put(`/room/${id}`, roomInfo);
      return getResponse<void>(response);
    } catch (error) {
      return getError<void>(error);
    }
  },
  delete: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/room/${id}`);
      return getResponse<void>(response);
    } catch (error) {
      return getError<void>(error);
    }
  },
};

export default roomQuery;
