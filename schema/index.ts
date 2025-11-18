import {
  EbillStatus,
  EcontractStatus,
  ErepairStatus,
  EroomStatus,
  EroomType,
} from "@/utils/enum";

interface Iuser {
  id: string;
  username: string;
  passwordHash: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  roleID: string;
  createdAt: string;
  updatedAt: string;
}

interface Irole {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Idormitory {
  id: string;
  name: string;
  address: string;
  roomCount: number;
  createdAt: string;
  updatedAt: string;
  userID: string;
}

interface Iroom {
  id: string;
  name: string;
  description: string;
  image: string[];
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

interface Ireservation {
  id: string;
  idCard: string;
  firstname: string;
  lastname: string;
  status: boolean;
  paidDate: string;
  reservePriceDate: string;
  reservePrice: number;
  securityPriceDate: string;
  securityPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  roomID: string;
}

interface Icontract {
  id: string;
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

export type { Iuser, Irole, Idormitory, Iroom, Ireservation, Icontract, Ibill };
