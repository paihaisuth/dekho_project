import { roomConnection } from "@/lib";
import { Iroom } from "@/schema";
import {
  IfilterListRoom,
  IpaginationFormat,
  IroomRepository,
} from "@/utils/interface";
import { Filter, ObjectId } from "mongodb";

export class RoomRepository implements IroomRepository {
  constructor() {}

  async list(
    dormitoryID: string,
    filter: IfilterListRoom,
    page: number,
    pageSize: number
  ): Promise<IpaginationFormat<Iroom>> {
    const query: Filter<Iroom> = { dormitoryID: dormitoryID };

    if (filter.name) {
      query.name = { $regex: filter.name, $options: "i" };
    }
    if (filter.repairStatus) {
      query.repairStatus = filter.repairStatus;
    }
    if (filter.rentalStatus) {
      query.rentalStatus = filter.rentalStatus;
    }
    if (filter.type) {
      query.type = filter.type;
    }
    if (filter.status) {
      query.status = filter.status;
    }

    const roomQuery = await roomConnection
      .find(query)
      .sort({ _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const total = await roomConnection.countDocuments(query);
    const pageCount = Math.ceil(total / pageSize);

    const items = roomQuery.map((roomData) => this.mapToIroom(roomData));

    return {
      page,
      pageSize,
      pageCount,
      total,
      items,
    };
  }

  async getByID(id: string): Promise<Iroom | null> {
    const roomQuery = await roomConnection.findOne({ _id: new ObjectId(id) });
    return roomQuery ? this.mapToIroom(roomQuery) : null;
  }

  async getByName(name: string): Promise<Iroom | null> {
    const roomQuery = await roomConnection.findOne({ name: name });
    return roomQuery ? this.mapToIroom(roomQuery) : null;
  }

  async createRoom(dormitoryID: string, room: Iroom): Promise<void> {
    await roomConnection.insertOne({ ...room, dormitoryID });
    return;
  }

  async updateRoom(id: string, roomInfo: Partial<Iroom>): Promise<void> {
    await roomConnection.updateOne(
      { _id: new ObjectId(id) },
      { $set: roomInfo }
    );
    return;
  }

  async deleteRoom(id: string): Promise<void> {
    await roomConnection.deleteOne({ _id: new ObjectId(id) });
    return;
  }

  async deleteByDormitoryID(dormitoryID: string): Promise<void> {
    await roomConnection.deleteMany({ dormitoryID: dormitoryID });
    return;
  }

  private mapToIroom(roomData: Iroom & { _id: ObjectId }): Iroom {
    return {
      id: roomData._id.toString(),
      name: roomData.name,
      description: roomData.description,
      type: roomData.type,
      status: roomData.status,
      securityPrice: roomData.securityPrice,
      waterPerUnit: roomData.waterPerUnit,
      electricityPerUnit: roomData.electricityPerUnit,
      rentalPrice: roomData.rentalPrice,
      images: roomData.images,
      dormitoryID: roomData.dormitoryID,
      repairStatus: roomData.repairStatus,
      refundDate: roomData.refundDate,
      refundURL: roomData.refundURL,
      refundPrice: roomData.refundPrice,
      createdAt: roomData.createdAt,
      updatedAt: roomData.updatedAt,
    };
  }
}
