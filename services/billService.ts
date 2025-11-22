import { removeUndefinedKeys } from "@/app/utils/function";
import { Ibill } from "@/schema";
import { CustomError } from "@/utils/customError";
import { EbillStatus } from "@/utils/enum";
import {
  IbillRepository,
  IcontractRepository,
  IcreateBill,
  IpaginationFormat,
  IresponseBill,
  IroomRepository,
} from "@/utils/interface";

export class BillService {
  constructor(private billRepository: IbillRepository) {}

  async list(
    roomID: string,
    contractRepository: IcontractRepository,
    roomRepository: IroomRepository,
    page: number = 1,
    pageSize: number = 10,
    filter: { status?: EbillStatus } = {}
  ): Promise<IpaginationFormat<IresponseBill>> {
    const bills = await this.billRepository.list(
      roomID,
      page,
      pageSize,
      filter
    );

    const responseBills: IresponseBill[] = [];
    for (const bill of bills.items) {
      const room = await roomRepository.getByID(bill.roomID);
      const contract = await contractRepository.getByID(bill.contractID);

      if (!room) throw new CustomError("Room not found", 404);
      if (!contract) throw new CustomError("Contract not found", 404);

      responseBills.push({
        id: bill.id,
        billingDate: bill.billingDate,
        electricityPrice: bill.electricityPrice,
        waterPrice: bill.waterPrice,
        rentalPrice: bill.rentalPrice ? bill.rentalPrice : room?.rentalPrice,
        status: bill.status,
        total: bill.total,
        payPrice: bill.payPrice,
        payDate: bill.payDate,
        slipURL: bill.slipURL,
        createdAt: bill.createdAt,
        updatedAt: bill.updatedAt,
        firstname: contract.firstname,
        lastname: contract.lastname,
      });
    }
    return {
      items: responseBills,
      total: bills.total,
      page: bills.page,
      pageSize: bills.pageSize,
      pageCount: bills.pageCount,
    };
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
      id: bill.id,
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
      payDate: bill.payDate,
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

    // Validate status is a valid enum value
    if (
      billInfo.status &&
      !Object.values(EbillStatus).includes(billInfo.status)
    )
      throw new CustomError("Invalid bill status", 400);

    const bill = await this.billRepository.getByID(id);
    if (!bill) throw new CustomError("Bill not found", 404);

    if (billInfo.rentalPrice)
      billInfo.total =
        billInfo.rentalPrice +
        (bill.waterPrice || 0) +
        (bill.electricityPrice || 0);

    const toUpdate = removeUndefinedKeys<Partial<Ibill>>(billInfo);
    return await this.billRepository.updateBill(id, toUpdate);
  }

  async deleteBill(id: string) {
    return await this.billRepository.deleteBill(id);
  }
}
