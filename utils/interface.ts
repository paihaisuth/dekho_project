import {
  Ibill,
  Icontract,
  Idormitory,
  Ireservation,
  Irole,
  Iroom,
  Iuser,
} from "@/schema";
import { EbillStatus, ErepairStatus, EroomStatus, EroomType } from "./enum";

// -------------------- Repository Interface --------------------
export interface IuserRepository {
  listUsers(page: number, pageSize: number): Promise<IpaginationFormat<Iuser>>;
  getByID(id: string): Promise<Iuser | null>;
  getByRoleID(roleID: string): Promise<Iuser | null>;
  getByEmail(email: string): Promise<Iuser | null>;
  getByUsername(username: string): Promise<Iuser | null>;
  createUser(user: Partial<Iuser>): Promise<void>;
  updateUser(id: string, userInfo: Partial<Iuser>): Promise<void>;
  deleteUser(id: string): Promise<void>;
}

export interface IdormitoryRepository {
  list(
    userID: string,
    filter: { name?: string },
    page: number,
    pageSize: number
  ): Promise<IpaginationFormat<Idormitory>>;
  getByID(id: string): Promise<Idormitory | null>;
  createDormitory(dormitory: Partial<Idormitory>): Promise<void>;
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
  deleteByDormitoryID(dormitoryID: string): Promise<void>;
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
  deleteByDormitoryID(dormitoryID: string): Promise<void>;
}

export interface IcontractRepository {
  list(userID: string): Promise<Icontract[]>;
  getByID(id: string): Promise<Icontract | null>;
  createContract(contract: Icontract): Promise<void>;
  updateContract(id: string, contractInfo: Partial<Icontract>): Promise<void>;
  deleteContract(id: string): Promise<void>;
  deleteByDormitoryID(dormitoryID: string): Promise<void>;
}

export interface IreservationRepository {
  list(userID: string): Promise<Ireservation[]>;
  getByID(id: string): Promise<Ireservation | null>;
  createReserve(reserveInfo: Partial<Ireservation>): Promise<void>;
  updateReserve(id: string, reserveInfo: Partial<Ireservation>): Promise<void>;
  deleteReserve(id: string): Promise<void>;
  deleteByDormitoryID(dormitoryID: string): Promise<void>;
}

export interface IroleRepository {
  list(page: number, pageSize: number): Promise<IpaginationFormat<Irole>>;
  getByID(id: string): Promise<Irole | null>;
  createRole(roleInfo: Partial<Irole>): Promise<void>;
  updateRole(id: string, roleInfo: Partial<Irole>): Promise<void>;
  deleteRole(id: string): Promise<void>;
}

// -------------------- Other Interfaces --------------------

export interface IresponseMiddleware {
  id: string;
  username: string;
}

export interface Iregister {
  firstname: string;
  lastname: string;
  phoneNumber: string;
  email: string;
  username: string;
  password: string;
  roleID: string;
}

export interface IpaginationFormat<T> {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  items: T[];
}
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
