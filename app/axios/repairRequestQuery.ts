import IrepairRequest from "@/schema/RepairRequest";
import { getError, getResponse } from "../utils/function";
import { IpaginationFormat } from "../utils/interface";
import axiosInstance from "./instance";
import { IfilterListRepairRequest } from "@/utils/interface";

const repairRequestQuery = {
  async list(
    filter: IfilterListRepairRequest,
    page: number,
    pageSize: number = 10
  ) {
    try {
      const response = await axiosInstance.get(`/repairRequest`, {
        params: {
          filter: JSON.stringify(filter),
          page,
          pageSize,
        },
      });
      return getResponse<IpaginationFormat<IrepairRequest>>(response);
    } catch (error) {
      return getError<IpaginationFormat<IrepairRequest>>(error);
    }
  },
  async getByID(repairRequestID: string) {
    try {
      const response = await axiosInstance.get(
        `/repairRequest/${repairRequestID}`
      );
      return getResponse<IrepairRequest>(response);
    } catch (error) {
      return getError<IrepairRequest>(error);
    }
  },
  async update(repairRequestID: string, data: Partial<IrepairRequest>) {
    try {
      const response = await axiosInstance.put(
        `/repairRequest/${repairRequestID}`,
        data
      );
      return getResponse<IrepairRequest>(response);
    } catch (error) {
      return getError<IrepairRequest>(error);
    }
  },
  async delete(repairRequestID: string) {
    try {
      const response = await axiosInstance.delete(
        `/repairRequest/${repairRequestID}`
      );
      return getResponse<IrepairRequest>(response);
    } catch (error) {
      return getError<IrepairRequest>(error);
    }
  },
};

export default repairRequestQuery;
