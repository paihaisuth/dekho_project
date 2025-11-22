import { Icontract } from "@/schema";
import { getError, getResponse } from "../utils/function";
import axiosInstance from "./instance";

const contractQuery = {
  getByRoomID: async (roomID: string) => {
    try {
      const response = await axiosInstance.get(`/contract/${roomID}`);
      return getResponse<Icontract>(response);
    } catch (error) {
      return getError<Icontract>(error);
    }
  },

  create: async (contractData: Icontract) => {
    try {
      const response = await axiosInstance.post(`/contract`, contractData);
      return getResponse<Icontract>(response);
    } catch (error) {
      return getError<Icontract>(error);
    }
  },

  update: async (id: string, contractData: Partial<Icontract>) => {
    try {
      const response = await axiosInstance.put(`/contract/${id}`, contractData);
      return getResponse<void>(response);
    } catch (error) {
      return getError<void>(error);
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/contract/${id}`);
      return getResponse<void>(response);
    } catch (error) {
      return getError<void>(error);
    }
  },
};
export default contractQuery;
