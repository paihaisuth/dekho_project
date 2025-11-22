import { contractConnection } from "@/lib";
import { Icontract } from "@/schema";
import { CustomError } from "@/utils/customError";
import { IcontractRepository } from "@/utils/interface";
// import { IpaginationFormat } from "@/utils/interface";
import { ObjectId } from "mongodb";

export class ContractRepository implements IcontractRepository {
  constructor() {}

  // async list(
  //   roomID: string,
  //   page: number,
  //   pageSize: number
  // ): Promise<IpaginationFormat<Icontract>> {
  //   const contractQuery = await contractConnection
  //     .find({ roomID })
  //     .sort({ createdAt: -1 })
  //     .skip((page - 1) * pageSize)
  //     .limit(pageSize)
  //     .toArray();
  //   const total = await contractConnection.countDocuments({ roomID });
  //   const pageCount = Math.max(Math.ceil(total / pageSize), 1);
  //   const items = contractQuery.map((contractData) =>
  //     this.mapToIcontract(contractData)
  //   );

  //   return {
  //     page,
  //     pageSize,
  //     pageCount,
  //     total,
  //     items,
  //   };
  // }

  async getByRoomID(roomID: string): Promise<Icontract | null> {
    const contractQuery = await contractConnection.findOne({ roomID: roomID });
    return contractQuery ? this.mapToIcontract(contractQuery) : null;
  }

  async getByID(id: string): Promise<Icontract | null> {
    const contractQuery = await contractConnection.findOne({
      _id: new ObjectId(id),
    });

    return contractQuery ? this.mapToIcontract(contractQuery) : null;
  }

  async createContract(contract: Icontract): Promise<Icontract> {
    const result = await contractConnection.insertOne(contract);
    const insertedContract = await contractConnection.findOne({
      _id: result.insertedId,
    });

    if (!insertedContract) {
      throw new CustomError("Failed to create contract", 500);
    }

    return this.mapToIcontract(insertedContract);
  }

  async updateContract(
    id: string,
    contractInfo: Partial<Icontract>
  ): Promise<void> {
    await contractConnection.updateOne(
      { _id: new ObjectId(id) },
      { $set: contractInfo }
    );
    return;
  }

  async deleteContract(id: string): Promise<void> {
    await contractConnection.deleteOne({ _id: new ObjectId(id) });
    return;
  }

  async deleteByDormitoryID(dormitoryID: string): Promise<void> {
    await contractConnection.deleteMany({ dormitoryID: dormitoryID });
    return;
  }

  private mapToIcontract(
    contractData: Icontract & { _id: ObjectId }
  ): Icontract {
    return {
      id: contractData._id.toString(),
      contractURL: contractData.contractURL,
      createdAt: contractData.createdAt,
      firstname: contractData.firstname,
      lastname: contractData.lastname,
      idCardURL: contractData.idCardURL,
      securityPrice: contractData.securityPrice,
      securityPriceDate: contractData.securityPriceDate,
      totoalPrice: contractData.totoalPrice,
      updatedAt: contractData.updatedAt,
      endDate: contractData.endDate,
      roomID: contractData.roomID,
      startDate: contractData.startDate,
      status: contractData.status,
      idCard: contractData.idCard,
    };
  }
}
