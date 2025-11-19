import { removeUndefinedKeys } from "@/app/utils/function";
import { Ibill, Icontract } from "@/schema";
import { EbillStatus, EcontractStatus } from "@/utils/enum";
import {
  IbillRepository,
  IcontractRepository,
  IdormitoryRepository,
  IroomRepository,
} from "@/utils/interface";

export class ContractService {
  constructor(private contractRepository: IcontractRepository) {}

  async list(roomID: string, page: number = 1, pageSize: number = 10) {
    return await this.contractRepository.list(roomID, page, pageSize);
  }

  async getByID(id: string) {
    return await this.contractRepository.getByID(id);
  }

  async createContract(
    contractInfo: Partial<Icontract>,
    billRepository: IbillRepository,
    dormitoryRepository: IdormitoryRepository,
    roomRepository: IroomRepository
  ) {
    if (!contractInfo.roomID) throw new Error("Room ID is required");
    if (!contractInfo.firstname) throw new Error("First name is required");
    if (!contractInfo.lastname) throw new Error("Last name is required");
    if (!contractInfo.idCard) throw new Error("ID Card is required");
    if (!contractInfo.startDate) throw new Error("Start date is required");
    if (!contractInfo.endDate) throw new Error("End date is required");
    if (typeof contractInfo.securityPrice !== "number")
      throw new Error("Security price must be a number");
    if (!contractInfo.securityPriceDate)
      throw new Error("Security price date is required");

    // Count month between startDate and endDate withnot this month
    const start = new Date(contractInfo.startDate);
    const end = new Date(contractInfo.endDate);
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    if (months < 1) throw new Error("Contract must be at least 1 month long");

    const newContract: Partial<Icontract> = {
      ...contractInfo,
      status: EcontractStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const contract = await this.contractRepository.createContract(
      newContract as Icontract
    );

    const roomQuery = await roomRepository.getByID(contractInfo.roomID);
    if (!roomQuery) throw new Error("Room not found for the given room ID");

    const dormitory = await dormitoryRepository.getByID(roomQuery.dormitoryID);
    if (!dormitory)
      throw new Error("Dormitory not found for the given room ID");

    // Create bills for each month
    for (let i = 0; i < months; i++) {
      const newBill: Partial<Ibill> = {
        contractID: contract.id,
        roomID: contractInfo.roomID,
        billingDate: dormitory.billingDate,
        rentalPrice: roomQuery.rentalPrice,
        status: EbillStatus.NONE,
        total: roomQuery.rentalPrice,
        payPrice: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await billRepository.createBill(newBill);
    }
    return;
  }

  async updateContract(id: string, contractInfo: Partial<Icontract>) {
    contractInfo.updatedAt = new Date().toISOString();
    const toUpdate = removeUndefinedKeys(contractInfo);
    return await this.contractRepository.updateContract(id, toUpdate);
  }

  async deleteContract(id: string) {
    return await this.contractRepository.deleteContract(id);
  }
}
