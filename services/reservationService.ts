import { Ireservation } from "@/schema";
import { IreservationRepository } from "@/utils/interface";

export class ReservationService {
  constructor(private reservationRepository: IreservationRepository) {}

  async list(userID: string) {
    return await this.reservationRepository.list(userID);
  }

  async getByID(id: string) {
    return await this.reservationRepository.getByID(id);
  }

  async createReserve(reserveInfo: Partial<Ireservation>) {
    if (!reserveInfo.roomID) throw new Error("Room ID is required");
    if (!reserveInfo.firstname) throw new Error("First name is required");
    if (!reserveInfo.lastname) throw new Error("Last name is required");
    if (!reserveInfo.idCard) throw new Error("ID Card is required");
    if (!reserveInfo.paidDate) throw new Error("Paid date is required");
    if (!reserveInfo.status) throw new Error("Status is required");
    if (reserveInfo.reservePrice == null)
      throw new Error("Reserve price is required");
    if (reserveInfo.securityPrice == null)
      throw new Error("Security price is required");
    if (reserveInfo.totalPrice == null)
      throw new Error("Total price is required");

    const newReserve: Partial<Ireservation> = {
      ...reserveInfo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return await this.reservationRepository.createReserve(
      newReserve as Ireservation
    );
  }

  async updateReserve(id: string, reserveInfo: Partial<Ireservation>) {
    reserveInfo.updatedAt = new Date().toISOString();
    return await this.reservationRepository.updateReserve(id, reserveInfo);
  }

  async deleteReserve(id: string) {
    return await this.reservationRepository.deleteReserve(id);
  }
}
