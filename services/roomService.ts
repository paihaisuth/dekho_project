import { Iroom } from "@/schema";
import { ErepairStatus, EroomStatus } from "@/utils/enum";
import { IfilterListRoom, IroomRepository } from "@/utils/interface";

export class RoomService {
  constructor(private roomRepository: IroomRepository) {}

  async list(userID: string, filter: IfilterListRoom) {
    return await this.roomRepository.list(userID, filter);
  }

  async getByID(id: string) {
    return await this.roomRepository.getByID(id);
  }

  async createRoom(dormitoryID: string, roomInfo: Partial<Iroom>) {
    if (!roomInfo.name) throw new Error("Room name is required");
    if (!roomInfo.type) throw new Error("Room type is required");

    const newRoom: Partial<Iroom> = {
      name: roomInfo.name,
      type: roomInfo.type,
      status: EroomStatus.AVAILABLE,
      repairStatus: ErepairStatus.NONE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return await this.roomRepository.createRoom(dormitoryID, newRoom);
  }

  async updateRoom(id: string, roomInfo: Partial<Iroom>) {
    roomInfo.updatedAt = new Date().toISOString();
    return await this.roomRepository.updateRoom(id, roomInfo);
  }

  async deleteRoom(id: string) {
    return await this.roomRepository.deleteRoom(id);
  }
}
