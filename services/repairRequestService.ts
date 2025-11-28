import { removeUndefinedKeys } from "@/app/utils/function";
import IrepairRequest from "@/schema/RepairRequest";
import {
  IfilterListRepairRequest,
  IrepairRequestRepository,
  IroomRepository,
} from "@/utils/interface";

export class RepairRequestService {
  constructor(private repairRequestRepository: IrepairRequestRepository) {}

  async list(
    filter: IfilterListRepairRequest,
    page: number = 1,
    pageSize: number = 10,
    roomRespository: IroomRepository
  ) {
    const cleanedFilter = {
      ...(filter.status !== undefined && { status: filter.status }),
      ...(filter.userID && { userID: filter.userID }),
      ...(filter.roomID && { roomID: filter.roomID }),
      ...(filter.dormitoryID && { dormitoryID: filter.dormitoryID }),
    };

    const result = await this.repairRequestRepository.list(
      cleanedFilter,
      page,
      pageSize
    );

    const mappedItems = [];

    for (const item of result.items) {
      const room = await roomRespository.getByID(item.roomID);
      if (room) {
        mappedItems.push({
          ...item,
          roomName: room.name,
          dormitoryID: room.dormitoryID,
        });
      }
    }

    return {
      page: result.page,
      pageCount: result.pageCount,
      total: result.total,
      items: mappedItems,
    };
  }

  async getByID(id: string) {
    return await this.repairRequestRepository.getByID(id);
  }

  async createRepairRequest(
    userID: string,
    roomID: string,
    dormitoryID: string,
    details: string
  ) {
    const toCreate = {
      userID,
      roomID,
      details,
      dormitoryID,
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
