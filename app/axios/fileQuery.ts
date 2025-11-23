import { IresponseUploadFile } from "@/utils/interface";
import { getError, getResponse } from "../utils/function";
import axiosInstance from "./instance";

const fileQuery = {
  upload: async (file: File, prefix: string) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post("/file", formData, {
        params: { prefix },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return getResponse<IresponseUploadFile>(response);
    } catch (error) {
      return getError<IresponseUploadFile>(error);
    }
  },
  delete: async (key: string) => {
    try {
      const response = await axiosInstance.delete("/file", {
        params: { key },
      });
      return getResponse(response);
    } catch (error) {
      return getError(error);
    }
  },
};

export default fileQuery;
