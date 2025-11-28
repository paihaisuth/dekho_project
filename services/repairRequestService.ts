import { removeUndefinedKeys } from "@/app/utils/function";
import IrepairRequest from "@/schema/RepairRequest";
import { IrepairRequestRepository } from "@/utils/interface";

export class RepairRequestService {
  constructor(private repairRequestRepository: IrepairRequestRepository) {}

  async list(userID: string, page: number = 1, pageSize: number = 10) {
    return await this.repairRequestRepository.list(userID, page, pageSize);
  }

  async getByID(id: string) {
    return await this.repairRequestRepository.getByID(id);
  }

  async createRepairRequest(userID: string, roomID: string, details: string) {
    const toCreate = {
      userID,
      roomID,
      details,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: false,
    };

    return await this.repairRequestRepository.createRepairRequest(toCreate);
  }

  async updateRepairRequest(
    id: string,
    details: string,
    fixDate: string,
    status: boolean
  ) {
    const toUpdate: Partial<IrepairRequest> = {
      details,
      fixDate,
      status,
      updatedAt: new Date().toISOString(),
    };

    return await this.repairRequestRepository.updateRepairRequest(
      id,
      removeUndefinedKeys<Partial<IrepairRequest>>(toUpdate)
    );
  }

  async deleteRepairRequest(id: string) {
    return await this.repairRequestRepository.deleteRepairRequest(id);
  }
}
