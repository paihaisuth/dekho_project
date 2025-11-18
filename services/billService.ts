import { Ibill } from "@/schema";
import { CustomError } from "@/utils/customError";
import { EbillStatus } from "@/utils/enum";
import {
  IbillRepository,
  IcontractRepository,
  IcreateBill,
  IresponseBill,
  IroomRepository,
} from "@/utils/interface";

export class BillService {
  constructor(private billRepository: IbillRepository) {}

  async list(
    roomID: string,
    contractID: string,
    contractRepository: IcontractRepository,
    roomRepository: IroomRepository
  ): Promise<IresponseBill[]> {
    const bills = await this.billRepository.list(
      roomID,
      contractID,
      contractRepository,
      roomRepository
    );

    const responseBills: IresponseBill[] = [];
    for (const bill of bills) {
      const room = await roomRepository.getByID(bill.roomID);
      const contract = await contractRepository.getByID(bill.contractID);

      if (!room) throw new CustomError("Room not found", 404);
      if (!contract) throw new CustomError("Contract not found", 404);

      responseBills.push({
        billingDate: bill.billingDate,
        electricityPrice: bill.electricityPrice,
        waterPrice: bill.waterPrice,
        rentalPrice: bill.rentalPrice ? bill.rentalPrice : room?.rentalPrice,
        status: bill.status,
        total: bill.total,
        payPrice: bill.payPrice,
        slipURL: bill.slipURL,
        createdAt: bill.createdAt,
        updatedAt: bill.updatedAt,
        firstname: contract.firstname,
        lastname: contract.lastname,
      });
    }
    return responseBills;
  }

  async getByID(
    id: string,
    contractRepository: IcontractRepository,
    roomRepository: IroomRepository
  ): Promise<IresponseBill | null> {
    const bill = await this.billRepository.getByID(id);

    if (!bill) throw new CustomError("Bill not found", 404);

    const room = await roomRepository.getByID(bill.roomID);
    const contract = await contractRepository.getByID(bill.contractID);

    if (!room) throw new CustomError("Room not found", 404);
    if (!contract) throw new CustomError("Contract not found", 404);

    return {
      billingDate: bill.billingDate,
      electricityPrice: bill.electricityPrice,
      waterPrice: bill.waterPrice,
      rentalPrice: bill.rentalPrice ? bill.rentalPrice : room?.rentalPrice,
      status: bill.status,
      total: bill.total,
      payPrice: bill.payPrice,
      slipURL: bill.slipURL,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
      firstname: contract.firstname,
      lastname: contract.lastname,
    };
  }

  async createBill(billInfo: IcreateBill) {
    if (!billInfo.roomID) throw new CustomError("Room ID is required", 400);
    if (!billInfo.contractID)
      throw new CustomError("Contract ID is required", 400);
    if (!billInfo.billingDate)
      throw new CustomError("Billing date is required", 400);

    const newBill: Partial<Ibill> = {
      roomID: billInfo.roomID,
      contractID: billInfo.contractID,
      billingDate: billInfo.billingDate,
      status: EbillStatus.PENDING,
      rentalPrice: billInfo.rentalPrice,
      total: billInfo.rentalPrice,
      waterPrice: 0,
      electricityPrice: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return await this.billRepository.createBill(newBill as Ibill);
  }

  async updateBill(id: string, billInfo: Partial<Ibill>) {
    billInfo.updatedAt = new Date().toISOString();
    return await this.billRepository.updateBill(id, billInfo);
  }
}
