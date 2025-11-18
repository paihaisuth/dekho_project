import { dormitoryConnection } from "@/lib";
import { Idormitory } from "@/schema";
import { IdormitoryRepository } from "@/utils/interface";
import { ObjectId } from "mongodb";

export class DormitoryRepository implements IdormitoryRepository {
  constructor() {}

  async list(userID: string, filter: { name?: string }): Promise<Idormitory[]> {
    const query: {
      userID: string;
      name?: { $regex: string; $options: string };
    } = { userID: userID };

    if (filter.name) {
      query.name = { $regex: filter.name, $options: "i" };
    }

    const dormitoryQuery = await dormitoryConnection.find(query).toArray();

    return dormitoryQuery.map((dormitoryData) =>
      this.mapToIdormitory(dormitoryData)
    );
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
      createdAt: dormitoryData.createdAt,
      updatedAt: dormitoryData.updatedAt,
      userID: dormitoryData.userID,
    };
  }
}
