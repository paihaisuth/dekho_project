import { EcontractStatus } from "@/utils/enum";

interface Icontract {
  id: string;
  idCard: string;
  firstname: string;
  lastname: string;
  status: EcontractStatus;
  startDate: string;
  endDate: string;
  securityPriceDate: string;
  securityPrice: number;
  billCollectionDate: string;
  totoalPrice: number;
  contractURL: string;
  idCardURL: string;
  createdAt: string;
  updagtedAt: string;
  roomID: string;
}

export default Icontract;
