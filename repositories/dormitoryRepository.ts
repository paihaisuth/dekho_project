import { dormitoryConnection } from "@/lib";
import { Idormitory } from "@/schema";
import { IdormitoryRepository, IpaginationFormat } from "@/utils/interface";
import { ObjectId } from "mongodb";

export class DormitoryRepository implements IdormitoryRepository {
  constructor() {}

  async list(
    userID: string,
    filter: { name?: string },
    page: number,
    pageSize: number
  ): Promise<IpaginationFormat<Idormitory>> {
    const query: {
      userID: string;
      name?: { $regex: string; $options: string };
    } = { userID: userID };

    if (filter.name) {
      query.name = { $regex: filter.name, $options: "i" };
    }

    const total = await dormitoryConnection.countDocuments(query);
    const pageCount = Math.ceil(total / pageSize);

    const dormitoryQuery = await dormitoryConnection
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const items = dormitoryQuery.map((dormitoryData) =>
      this.mapToIdormitory(dormitoryData)
    );

    return {
      page,
      pageSize,
      pageCount,
      total,
      items,
    };
  }

  async getByID(id: string): Promise<Idormitory | null> {
    const dormitoryQuery = await dormitoryConnection.findOne({
      _id: new ObjectId(id),
    });
    return dormitoryQuery ? this.mapToIdormitory(dormitoryQuery) : null;
  }

  async createDormitory(dormitory: Idormitory): Promise<void> {
    await dormitoryConnection.insertOne(dormitory);
    return;
  }

  async updateDormitory(
    id: string,
    dormitoryInfo: Partial<Idormitory>
  ): Promise<void> {
    await dormitoryConnection.updateOne(
      { _id: new ObjectId(id) },
      { $set: dormitoryInfo }
    );
    return;
  }

  async deleteDormitory(id: string): Promise<void> {
    await dormitoryConnection.deleteOne({ _id: new ObjectId(id) });
    return;
  }

  private mapToIdormitory(
    dormitoryData: Idormitory & { _id: ObjectId }
  ): Idormitory {
    return {
      id: dormitoryData._id.toString(),
      name: dormitoryData.name,
      address: dormitoryData.address,
      roomCount: dormitoryData.roomCount,
      billingDate: dormitoryData.billingDate,
      checkDate: dormitoryData.checkDate,
      createdAt: dormitoryData.createdAt,
      updatedAt: dormitoryData.updatedAt,
      userID: dormitoryData.userID,
    };
  }
}
