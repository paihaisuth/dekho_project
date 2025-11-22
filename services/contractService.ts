import { removeUndefinedKeys } from "@/app/utils/function";
import { Ibill, Icontract } from "@/schema";
import { CustomError } from "@/utils/customError";
import { EbillStatus, EcontractStatus, EroomStatus } from "@/utils/enum";
import {
  IbillRepository,
  IcontractRepository,
  IdormitoryRepository,
  IreservationRepository,
  IroomRepository,
} from "@/utils/interface";

export class ContractService {
  constructor(private contractRepository: IcontractRepository) {}

  // async list(roomID: string, page: number = 1, pageSize: number = 10) {
  //   return await this.contractRepository.list(roomID, page, pageSize);
  // }

  async getByID(id: string) {
    return await this.contractRepository.getByID(id);
  }

  async getByRoomID(roomID: string) {
    return await this.contractRepository.getByRoomID(roomID);
  }

  async createContract(
    contractInfo: Partial<Icontract>,
    billRepository: IbillRepository,
    dormitoryRepository: IdormitoryRepository,
    roomRepository: IroomRepository,
    reservationRepository: IreservationRepository
  ) {
    if (!contractInfo.roomID) throw new CustomError("Room ID is required", 400);
    if (!contractInfo.firstname)
      throw new CustomError("First name is required", 400);
    if (!contractInfo.lastname)
      throw new CustomError("Last name is required", 400);
    if (!contractInfo.idCard) throw new CustomError("ID Card is required", 400);
    if (!contractInfo.startDate)
      throw new CustomError("Start date is required", 400);
    if (!contractInfo.endDate)
      throw new CustomError("End date is required", 400);
    if (typeof contractInfo.securityPrice !== "number")
      throw new CustomError("Security price must be a number", 400);
    if (!contractInfo.securityPriceDate)
      throw new CustomError("Security price date is required", 400);

    const existingContract = await this.contractRepository.getByRoomID(
      contractInfo.roomID
    );
    if (existingContract) {
      const toUpdate = await removeUndefinedKeys(contractInfo);
      await this.updateContract(existingContract.id!, toUpdate);

      // Update room status to occupied
      await roomRepository.updateRoom(contractInfo.roomID, {
        status: EroomStatus.LIVED_IN,
      });
      return;
    }

    const start = new Date(contractInfo.startDate);
    const end = new Date(contractInfo.endDate);
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    if (months < 1)
      throw new CustomError("Contract must be at least 1 month long", 400);

    const newContract: Partial<Icontract> = {
      updatedAt: new Date().toISOString(),
    };

    const contract = await this.contractRepository.createContract(
      newContract as Icontract
    );

    const roomQuery = await roomRepository.getByID(contractInfo.roomID);
    if (!roomQuery)
      throw new CustomError("Room not found for the given room ID", 404);

    const dormitory = await dormitoryRepository.getByID(roomQuery.dormitoryID);

    if (!dormitory)
      throw new CustomError("Dormitory not found for the given room ID", 404);

    // Validate month count <= 12
    if (months > 12)
      throw new CustomError("Contract cannot be longer than 12 months", 400);

    // Create bills for each month
    for (let i = 0; i < months; i++) {
      const billingDay = parseInt(dormitory.billingDate, 10); // Interpret billingDate as the day of the month
      const billingDate = new Date();
      billingDate.setDate(1); // Start with the first day of the month to avoid overflow
      billingDate.setMonth(billingDate.getMonth() + i); // Increment the month

      // Set the day of the month, ensuring it doesn't exceed the month's maximum days
      const maxDay = new Date(
        billingDate.getFullYear(),
        billingDate.getMonth() + 1,
        0
      ).getDate();
      billingDate.setDate(Math.min(billingDay, maxDay));

      const newBill: Partial<Ibill> = {
        contractID: contract.id,
        roomID: contractInfo.roomID,
        billingDate: billingDate.toISOString(), // Store the full date as ISO string
        rentalPrice: roomQuery.rentalPrice,
        status: EbillStatus.NONE,
        total: roomQuery.rentalPrice,
        payPrice: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await billRepository.createBill(newBill);
    }

    // Update room status to occupied
    await roomRepository.updateRoom(contractInfo.roomID, {
      status: EroomStatus.LIVED_IN,
    });

    // Remove reservation if exists
    await reservationRepository.deleteByRoomID(contractInfo.roomID);
    return;
  }

  async updateContract(id: string, contractInfo: Partial<Icontract>) {
    contractInfo.updatedAt = new Date().toISOString();
    const toUpdate = removeUndefinedKeys(contractInfo);
    return await this.contractRepository.updateContract(id, toUpdate);
  }

  async deleteContract(
    id: string,
    roomRepository: IroomRepository,
    billRepository: IbillRepository
  ) {
    const existingContract = await this.contractRepository.getByID(id);
    if (!existingContract) throw new CustomError("Contract not found", 404);

    const existRoom = await roomRepository.getByID(existingContract.roomID);
    if (existRoom)
      await roomRepository.updateRoom(existRoom.id!, {
        status: EroomStatus.AVAILABLE,
      });

    await billRepository.deleteByContractID(id);

    await this.contractRepository.deleteContract(id);
    return;
  }
}
