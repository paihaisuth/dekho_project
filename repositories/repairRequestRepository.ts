import { repairRequestConnection } from "@/lib";
import IrepairRequest from "@/schema/RepairRequest";
import {
  IfilterListRepairRequest,
  IpaginationFormat,
  IrepairRequestRepository,
} from "@/utils/interface";
import { ObjectId } from "mongodb";

export class RepairRequestRepository implements IrepairRequestRepository {
  async list(
    filter: IfilterListRepairRequest,
    page: number,
    pageSize: number
  ): Promise<IpaginationFormat<IrepairRequest>> {
    const skip = (page - 1) * pageSize;

    const total = await repairRequestConnection.countDocuments(filter);

    const items = await repairRequestConnection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const pageCount = Math.ceil(total / pageSize);

    return {
      page,
      pageSize,
      pageCount,
      total,
      items: items.map(this.mapToRepairRequest),
    };
  }

  async getByID(id: string): Promise<IrepairRequest | null> {
    const repairRequest = await repairRequestConnection.findOne({
      _id: new ObjectId(id),
    });
    return repairRequest ? this.mapToRepairRequest(repairRequest) : null;
  }

  async createRepairRequest(
    repairRequestInfo: Partial<IrepairRequest>
  ): Promise<void> {
    await repairRequestConnection.insertOne(
      repairRequestInfo as IrepairRequest
    );
    return;
  }

  async updateRepairRequest(
    id: string,
    repairRequestInfo: Partial<IrepairRequest>
  ): Promise<void> {
    await repairRequestConnection.updateOne(
      { _id: new ObjectId(id) },
      { $set: repairRequestInfo }
    );
    return;
  }

  async deleteRepairRequest(id: string): Promise<void> {
    await repairRequestConnection.deleteOne({
      _id: new ObjectId(id),
    });
    return;
  }

  private mapToRepairRequest(
    data: IrepairRequest & { _id: ObjectId }
  ): IrepairRequest {
    return {
      id: data._id.toString(),
      details: data.details,
      fixDate: data.fixDate,
      userID: data.userID,
      roomID: data.roomID,
      dormitoryID: data.dormitoryID,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
