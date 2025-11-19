import { removeUndefinedKeys } from "@/app/utils/function";
import { Ireservation } from "@/schema";
import { IreservationRepository } from "@/utils/interface";

export class ReservationService {
  constructor(private reservationRepository: IreservationRepository) {}

  async list(roomID: string, page: number = 1, pageSize: number = 10) {
    return await this.reservationRepository.list(roomID, page, pageSize);
  }

  async getByID(id: string) {
    return await this.reservationRepository.getByID(id);
  }

  async createReserve(reserveInfo: Partial<Ireservation>) {
    if (!reserveInfo.roomID) throw new Error("Room ID is required");
    if (!reserveInfo.firstname) throw new Error("First name is required");
    if (!reserveInfo.lastname) throw new Error("Last name is required");
    if (!reserveInfo.idCard) throw new Error("ID Card is required");
    if (typeof reserveInfo.reservePrice !== "number")
      throw new Error("Reserve price is required");
    if (typeof reserveInfo.securityPrice !== "number")
      throw new Error("Security price is required");

    const newReserve: Partial<Ireservation> = {
      ...reserveInfo,
      totalPrice: reserveInfo.reservePrice + reserveInfo.securityPrice,
      status: false, // Is paid status default to false
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return await this.reservationRepository.createReserve(
      newReserve as Ireservation
    );
  }

  async updateReserve(id: string, reserveInfo: Partial<Ireservation>) {
    reserveInfo.updatedAt = new Date().toISOString();
    const existingReserve = await this.reservationRepository.getByID(id);
    if (!existingReserve) throw new Error("Reservation not found");

    const toUpdate = removeUndefinedKeys(reserveInfo);
    return await this.reservationRepository.updateReserve(id, toUpdate);
  }

  async deleteReserve(id: string) {
    return await this.reservationRepository.deleteReserve(id);
  }
}
