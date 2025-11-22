import { Iregister } from "@/utils/interface";
import { getError, getResponse } from "../utils/function";
import axiosInstance from "./instance";

interface Ilogin {
  username: string;
  password: string;
}

interface IloginResponse {
  accessToken: string;
  refreshToken: string;
}

const authQuery = {
  login: async (data: Ilogin) => {
    try {
      const response = await axiosInstance.post("/auth/login", data);
      return getResponse<IloginResponse>(response);
    } catch (error) {
      return getError<IloginResponse>(error);
    }
  },
  register: async (data: Iregister) => {
    try {
      const response = await axiosInstance.post("/auth/register", data);
      return getResponse(response);
    } catch (error) {
      return getError(error);
    }
  },
};

export default authQuery;
