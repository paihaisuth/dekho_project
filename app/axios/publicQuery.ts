import { Idormitory } from "@/schema";
import { getError, getResponse } from "../utils/function";
import axiosInstance from "./instance";

const publicQuery = {
  dormitoryList: async () => {
    try {
      const response = await axiosInstance.get("/public/dormitory");
      return getResponse<Idormitory[]>(response);
    } catch (error) {
      return getError<Idormitory[]>(error);
    }
  },
};

export { publicQuery };
