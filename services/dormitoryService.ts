import { Idormitory } from "@/schema";
import {
  IbillRepository,
  IcontractRepository,
  IdormitoryRepository,
  IreservationRepository,
  IroomRepository,
  IuserRepository,
} from "@/utils/interface";

export class DormitoryService {
  constructor(private dormitoryRepository: IdormitoryRepository) {}

  async list(
    userID: string,
    filter: { name?: string },
    page: number = 1,
    pageSize: number = 10
  ) {
    return this.dormitoryRepository.list(userID, filter, page, pageSize);
  }

  async getByID(id: string) {
    return this.dormitoryRepository.getByID(id);
  }

  async createDormitory(
    dormitory: Partial<Idormitory>,
    userRepository: IuserRepository
  ) {
    if (!dormitory.name) throw new Error("Dormitory name is required");
    if (!dormitory.address) throw new Error("Dormitory address is required");
    if (!dormitory.userID) throw new Error("User ID is required");

    if (!dormitory.roomCount) dormitory.roomCount = 0;

    const user = await userRepository.getByID(dormitory.userID);
    if (!user) throw new Error("User not found");

    const newDormitory = {
      ...dormitory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.dormitoryRepository.createDormitory(newDormitory);
  }

  async updateDormitory(id: string, dormitoryInfo: Partial<Idormitory>) {
    dormitoryInfo.updatedAt = new Date().toISOString();

    return this.dormitoryRepository.updateDormitory(id, {
      ...(dormitoryInfo.name && { name: dormitoryInfo.name }),
      ...(dormitoryInfo.address && { address: dormitoryInfo.address }),
      updatedAt: dormitoryInfo.updatedAt,
    });
  }

  async deleteDormitory(
    id: string,
    roomRepsitory: IroomRepository,
    contractRepository: IcontractRepository,
    reservationRepository: IreservationRepository,
    billRepository: IbillRepository
  ) {
    await roomRepsitory.deleteByDormitoryID(id);
    await contractRepository.deleteByDormitoryID(id);
    await reservationRepository.deleteByDormitoryID(id);
    await billRepository.deleteByDormitoryID(id);

    return this.dormitoryRepository.deleteDormitory(id);
  }
}
