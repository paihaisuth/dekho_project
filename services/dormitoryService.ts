import { Idormitory } from "@/schema";
import { IdormitoryRepository } from "@/utils/interface";

export class DormitoryService implements IdormitoryRepository {
  constructor(private dormitoryRepository: IdormitoryRepository) {}

  async list(userID: string, filter: { name?: string }) {
    return this.dormitoryRepository.list(userID, filter);
  }

  async getByID(id: string) {
    return this.dormitoryRepository.getByID(id);
  }

  async createDormitory(dormitory: Idormitory) {
    if (!dormitory.name) throw new Error("Dormitory name is required");
    if (!dormitory.address) throw new Error("Dormitory address is required");
    if (!dormitory.userID) throw new Error("User ID is required");

    if (!dormitory.roomCount) dormitory.roomCount = 0;

    const newDormitory = {
      ...dormitory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.dormitoryRepository.createDormitory(newDormitory);
  }

  async updateDormitory(id: string, dormitoryInfo: Partial<Idormitory>) {
    dormitoryInfo.updatedAt = new Date().toISOString();
    return this.dormitoryRepository.updateDormitory(id, dormitoryInfo);
  }

  async deleteDormitory(id: string) {
    return this.dormitoryRepository.deleteDormitory(id);
  }
}
