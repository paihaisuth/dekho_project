import { EbillStatus } from "@/utils/enum";

interface Ibill {
  id: string;
  billingDate: string;
  status: EbillStatus;
  payDate: string;
  payPrice: number;
  waterPrice: number;
  electricityPrice: number;
  rentalPrice: number;
  total: number;
  slipURL: string;
  createdAt: string;
  updatedAt: string;
  roomID: string;
  contractID: string;
}

export default Ibill;
