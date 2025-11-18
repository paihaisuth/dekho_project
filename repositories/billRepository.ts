import { billConnection } from "@/lib";
import { Ibill } from "@/schema";
import { IbillRepository } from "@/utils/interface";
import { ObjectId } from "mongodb";

export class BillRepository implements IbillRepository {
  constructor() {}

  async list(roomID: string, contractID: string): Promise<Ibill[]> {
    const billQuery = billConnection.find({ roomID, contractID });
    const bills = await billQuery.toArray();
    return bills.map((billData) => this.mapToIbill(billData));
  }

  async getByID(id: string): Promise<Ibill | null> {
    const billQuery = await billConnection.findOne({
      _id: new ObjectId(id),
    });
    return billQuery ? this.mapToIbill(billQuery) : null;
  }

  async createBill(bill: Ibill): Promise<void> {
    await billConnection.insertOne(bill);
    return;
  }

  async updateBill(id: string, billInfo: Partial<Ibill>): Promise<void> {
    await billConnection.updateOne(
      { _id: new ObjectId(id) },
      { $set: billInfo }
    );
    return;
  }

  async deleteBill(id: string): Promise<void> {
    await billConnection.deleteOne({ _id: new ObjectId(id) });
    return;
  }

  private mapToIbill(billData: Ibill & { _id: ObjectId }): Ibill {
    return {
      id: billData._id.toString(),
      billingDate: billData.billingDate,
      contractID: billData.contractID,
      electricityPrice: billData.electricityPrice,
      roomID: billData.roomID,
      waterPrice: billData.waterPrice,
      rentalPrice: billData.rentalPrice,
      status: billData.status,
      total: billData.total,
      payPrice: billData.payPrice,
      slipURL: billData.slipURL,
      createdAt: billData.createdAt,
      updatedAt: billData.updatedAt,
      payDate: billData.payDate,
    };
  }
}
