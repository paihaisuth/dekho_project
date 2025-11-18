import { EroomStatus, EroomType, ErepairStatus } from "@/utils/enum";

interface Iroom {
  id: string;
  name: string;
  description: string;
  images: string[];
  type: EroomType;
  status: EroomStatus;
  repairStatus: ErepairStatus;
  securityPrice: number;
  waterPerUnit: number;
  electricityPerUnit: number;
  rentalPrice: number;
  refundPrice: number;
  refundDate: string;
  refundURL: string;
  createdAt: string;
  updatedAt: string;
  dormitoryID: string;
}
export default Iroom;
