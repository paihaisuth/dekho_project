import { billConnection } from "@/lib";
import { Ibill } from "@/schema";
import { EbillStatus } from "@/utils/enum";
import { IbillRepository, IpaginationFormat } from "@/utils/interface";
import { ObjectId } from "mongodb";

export class BillRepository implements IbillRepository {
  constructor() {}

  async list(
    roomID: string,
    page: number,
    pageSize: number,
    filter: { status?: EbillStatus }
  ): Promise<IpaginationFormat<Ibill>> {
    const total = await billConnection.countDocuments({
      roomID,
      ...(filter.status ? { status: filter.status } : {}),
    });

    const pageCount = Math.max(Math.ceil(total / pageSize), 1);
    const billQuery = await billConnection
      .find({ roomID, ...(filter.status ? { status: filter.status } : {}) })
      .sort({ _id: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const items = billQuery.map((billData) => this.mapToIbill(billData));

    return {
      items,
      total,
      page,
      pageSize,
      pageCount,
    };
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

  async deleteByDormitoryID(dormitoryID: string): Promise<void> {
    await billConnection.deleteMany({ dormitoryID: dormitoryID });
    return;
  }

  async deleteByContractID(contractID: string): Promise<void> {
    await billConnection.deleteMany({ contractID: contractID });
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
