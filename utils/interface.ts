import {
  Ibill,
  Icontract,
  Idormitory,
  Ireservation,
  Iroom,
  Iuser,
} from "@/schema";
import { EbillStatus, ErepairStatus, EroomStatus, EroomType } from "./enum";

// -------------------- Repository Interface --------------------
export interface IuserRepository {
  getByID(id: string): Promise<Iuser | null>;
  getByEmail(email: string): Promise<Iuser | null>;
  getByUsername(username: string): Promise<Iuser | null>;
  createUser(user: Iuser): Promise<void>;
  updateUser(id: string, userInfo: Partial<Iuser>): Promise<void>;
  deleteUser(id: string): Promise<void>;
}

export interface IdormitoryRepository {
  list(userID: string, filter: { name?: string }): Promise<Idormitory[]>;
  getByID(id: string): Promise<Idormitory | null>;
  createDormitory(dormitory: Idormitory): Promise<void>;
  updateDormitory(
    id: string,
    dormitoryInfo: Partial<Idormitory>
  ): Promise<void>;
  deleteDormitory(id: string): Promise<void>;
}

export interface IroomRepository {
  list(userID: string, filter: IfilterListRoom): Promise<Iroom[]>;
  getByID(id: string): Promise<Iroom | null>;
  createRoom(dormitoryID: string, room: Partial<Iroom>): Promise<void>;
  updateRoom(id: string, roomInfo: Partial<Iroom>): Promise<void>;
  deleteRoom(id: string): Promise<void>;
}

export interface IbillRepository {
  list(
    roomID: string,
    contractID: string,
    contractRepository: IcontractRepository,
    roomRepository: IroomRepository
  ): Promise<Ibill[]>;
  getByID(id: string): Promise<Ibill | null>;
  createBill(bill: IcreateBill): Promise<void>;
  updateBill(id: string, billInfo: Partial<IupdateBill>): Promise<void>;
}

export interface IcontractRepository {
  list(userID: string): Promise<Icontract[]>;
  getByID(id: string): Promise<Icontract | null>;
  createContract(contract: Icontract): Promise<void>;
  updateContract(id: string, contractInfo: Partial<Icontract>): Promise<void>;
  deleteContract(id: string): Promise<void>;
}

export interface IreservationRepository {
  list(userID: string): Promise<Ireservation[]>;
  getByID(id: string): Promise<Ireservation | null>;
  createReserve(reserveInfo: Partial<Ireservation>): Promise<void>;
  updateReserve(id: string, reserveInfo: Partial<Ireservation>): Promise<void>;
  deleteReserve(id: string): Promise<void>;
}

// -------------------- Other Interfaces --------------------
export interface IauthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IfilterListRoom {
  name?: string;
  repairStatus?: ErepairStatus;
  rentalStatus?: EbillStatus;
  type?: EroomType;
  status?: EroomStatus;
}

export interface IresponseBill {
  firstname: string;
  lastname: string;
  status: EbillStatus;
  billingDate: string;
  waterPrice: number;
  electricityPrice: number;
  rentalPrice: number;
  total: number;
  payPrice: number;
  slipURL: string;
  createdAt: string;
  updatedAt: string;
}

export interface IcreateBill {
  roomID: string;
  contractID: string;
  billingDate: string;
  rentalPrice: number;
}

export interface IupdateBill {
  roomID: string;
  contractID: string;
  waterPrice: number;
  electricityPrice: number;
  payDate: string;
  payPrice: number;
  slipURL: string;
}
