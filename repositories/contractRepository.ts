import { contractConnection } from "@/lib";
import { Icontract } from "@/schema";
import { ObjectId } from "mongodb";

export class ContractRepository {
  constructor() {}

  async list(dormitoryID: string): Promise<Icontract[]> {
    const contractQuery = contractConnection.find({ dormitoryID });
    const contracts = await contractQuery.toArray();
    return contracts.map((contractData) => this.mapToIcontract(contractData));
  }

  async getByID(id: string): Promise<Icontract | null> {
    const contractQuery = await contractConnection.findOne({
      _id: new ObjectId(id),
    });
    return contractQuery ? this.mapToIcontract(contractQuery) : null;
  }

  async createContract(contract: Icontract): Promise<void> {
    await contractConnection.insertOne(contract);
    return;
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

  private mapToIcontract(
    contractData: Icontract & { _id: ObjectId }
  ): Icontract {
    return {
      id: contractData._id.toString(),
      billCollectionDate: contractData.billCollectionDate,
      contractURL: contractData.contractURL,
      createdAt: contractData.createdAt,
      firstname: contractData.firstname,
      lastname: contractData.lastname,
      idCardURL: contractData.idCardURL,
      securityPrice: contractData.securityPrice,
      securityPriceDate: contractData.securityPriceDate,
      totoalPrice: contractData.totoalPrice,
      updagtedAt: contractData.updagtedAt,
      endDate: contractData.endDate,
      roomID: contractData.roomID,
      startDate: contractData.startDate,
      status: contractData.status,
      idCard: contractData.idCard,
    };
  }
}
