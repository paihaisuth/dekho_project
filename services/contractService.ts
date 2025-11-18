import { Icontract } from "@/schema";
import { IcontractRepository } from "@/utils/interface";

export class ContractService {
  constructor(private contractRepository: IcontractRepository) {}

  async list(roomID: string) {
    return await this.contractRepository.list(roomID);
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

    const newContract: Partial<Icontract> = {
      ...contractInfo,
      createdAt: new Date().toISOString(),
      updagtedAt: new Date().toISOString(),
    };
    return await this.contractRepository.createContract(
      newContract as Icontract
    );
  }

  async updateContract(id: string, contractInfo: Partial<Icontract>) {
    contractInfo.updagtedAt = new Date().toISOString();
    return await this.contractRepository.updateContract(id, contractInfo);
  }

  async deleteContract(id: string) {
    return await this.contractRepository.deleteContract(id);
  }
}
