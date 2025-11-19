import { removeUndefinedKeys } from "@/app/utils/function";
import { Icontract } from "@/schema";
import { EcontractStatus } from "@/utils/enum";
import { IcontractRepository } from "@/utils/interface";

export class ContractService {
  constructor(private contractRepository: IcontractRepository) {}

  async list(roomID: string, page: number = 1, pageSize: number = 10) {
    return await this.contractRepository.list(roomID, page, pageSize);
  }

  async getByID(id: string) {
    return await this.contractRepository.getByID(id);
  }

  async createContract(contractInfo: Partial<Icontract>) {
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

    const newContract: Partial<Icontract> = {
      ...contractInfo,
      status: EcontractStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      updagtedAt: new Date().toISOString(),
    };
    await this.contractRepository.createContract(newContract as Icontract);

    return;
  }

  async updateContract(id: string, contractInfo: Partial<Icontract>) {
    contractInfo.updagtedAt = new Date().toISOString();
    const toUpdate = removeUndefinedKeys(contractInfo);
    return await this.contractRepository.updateContract(id, toUpdate);
  }

  async deleteContract(id: string) {
    return await this.contractRepository.deleteContract(id);
  }
}
