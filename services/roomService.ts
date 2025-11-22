import { removeUndefinedKeys } from "@/app/utils/function";
import { Iroom } from "@/schema";
import { CustomError } from "@/utils/customError";
import { ErepairStatus, EroomStatus, EroomType } from "@/utils/enum";
import {
  IdormitoryRepository,
  IfilterListRoom,
  IroomRepository,
} from "@/utils/interface";

export class RoomService {
  constructor(private roomRepository: IroomRepository) {}

  async list(
    dormitoryID: string,
    filter: IfilterListRoom,
    page: number,
    pageSize: number
  ) {
    return await this.roomRepository.list(dormitoryID, filter, page, pageSize);
  }

  async getByID(id: string) {
    return await this.roomRepository.getByID(id);
  }

  async createRoom(
    dormitoryID: string,
    roomInfo: {
      name: string;
      type: EroomType;
      from: number;
      to: number;
      prefix: string;
      charLength: number;
    },
    dormitoryRepository: IdormitoryRepository
  ) {
    if (!roomInfo.name) throw new Error("Room name is required");
    if (!roomInfo.type) throw new Error("Room type is required");

    // Set default values for from and to
    if (roomInfo.from === undefined) roomInfo.from = 1;
    if (roomInfo.to === undefined) roomInfo.to = 1;

    const roomCount = roomInfo.to - roomInfo.from + 1;
    const existingRoomList = [];

    // Validate max length
    if (roomCount > 20)
      throw new CustomError("Cannot create more than 20 rooms at once", 400);

    // Validate from is >= 1 and to is >= from
    if (roomInfo.from < 1)
      throw new CustomError(
        "Room from must be greater than or equal to 1",
        400
      );
    if (roomInfo.to < roomInfo.from)
      throw new CustomError(
        "Room to must be greater than or equal to room from",
        400
      );

    // Validagte charLenght is positive and not less than length of length of to
    if (roomInfo.charLength < 1)
      throw new CustomError("Character length must be positive", 400);
    if (roomInfo.charLength < roomInfo.to.toString().length)
      throw new CustomError(
        "Character length must be greater than or equal to length of room to",
        400
      );

    if (roomInfo.name && roomCount === 1) {
      const existingRoom = await this.roomRepository.getByName(roomInfo.name);
      if (existingRoom && existingRoom.dormitoryID === dormitoryID)
        throw new CustomError("Room name already exists", 400);
    }

    // Check for existing rooms
    for (let i = 0; i < roomCount; i++) {
      const roomName = roomInfo.name
        ? roomInfo.name
        : `${roomInfo.prefix}${(i + roomInfo.from)
            .toString()
            .padStart(roomInfo.charLength, "0")}`;
      const existingRoom = await this.roomRepository.getByName(roomName);
      if (existingRoom) existingRoomList.push(roomName);
    }

    // If any rooms exist, throw an error
    if (existingRoomList.length > 0)
      throw new Error(`Rooms already exist: ${existingRoomList.join(", ")}`);

    // Create rooms
    for (let i = 0; i < roomCount; i++) {
      const roomName = roomInfo.name
        ? roomInfo.name
        : `${roomInfo.prefix}${(i + roomInfo.from)
            .toString()
            .padStart(roomInfo.charLength, "0")}`;
      const newRoom: Partial<Iroom> = {
        name: roomName,
        type: roomInfo.type,
        status: EroomStatus.AVAILABLE,
        repairStatus: ErepairStatus.NONE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await this.roomRepository.createRoom(dormitoryID, newRoom);
    }

    await dormitoryRepository.addRoomCount(dormitoryID, roomCount);

    return;
  }

  async updateRoom(id: string, roomInfo: Partial<Iroom>) {
    roomInfo.updatedAt = new Date().toISOString();
    const updatedRoomInfo = removeUndefinedKeys<Partial<Iroom>>(roomInfo);

    if (updatedRoomInfo.name) {
      const existingRoom = await this.roomRepository.getByName(
        updatedRoomInfo.name
      );
      if (existingRoom && existingRoom.id !== id) {
        throw new Error("Room name already exists");
      }
    }
    return await this.roomRepository.updateRoom(id, updatedRoomInfo);
  }

  async deleteRoom(id: string, dormitoryRepository: IdormitoryRepository) {
    const room = await this.roomRepository.getByID(id);
    if (!room) throw new Error("Room not found");

    await dormitoryRepository.addRoomCount(room.dormitoryID, -1);
    return await this.roomRepository.deleteRoom(id);
  }
}
