import { removeUndefinedKeys } from "@/app/utils/function";
import { Ireservation } from "@/schema";
import { EroomStatus } from "@/utils/enum";
import { IreservationRepository, IroomRepository } from "@/utils/interface";

export class ReservationService {
  constructor(private reservationRepository: IreservationRepository) {}

  async getByRoomID(roomID: string) {
    return await this.reservationRepository.getByRoomID(roomID);
  }

  async createReserve(
    reserveInfo: Partial<Ireservation>,
    roomRepository: IroomRepository
  ) {
    if (!reserveInfo.roomID) throw new Error("Room ID is required");
    if (!reserveInfo.firstname) throw new Error("First name is required");
    if (!reserveInfo.lastname) throw new Error("Last name is required");
    if (!reserveInfo.idCard) throw new Error("ID Card is required");
    if (typeof reserveInfo.reservePrice !== "number")
      throw new Error("Reserve price is required");
    if (typeof reserveInfo.securityPrice !== "number")
      throw new Error("Security price is required");

    if (reserveInfo.roomID) {
      const existRoom = await roomRepository.getByID(reserveInfo.roomID);
      // If room status is occupied, throw error
      if (existRoom?.status === EroomStatus.LIVED_IN) {
        throw new Error("Room is already occupied");
      }
    }

    const newReserve: Partial<Ireservation> = {
      ...reserveInfo,
      totalPrice: reserveInfo.reservePrice + reserveInfo.securityPrice,
      status: false, // Is paid status default to false
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.reservationRepository.createReserve(newReserve as Ireservation);

    await roomRepository.updateRoom(reserveInfo.roomID, {
      status: EroomStatus.BOOKED,
    });

    return;
  }

  async updateReserve(id: string, reserveInfo: Partial<Ireservation>) {
    reserveInfo.updatedAt = new Date().toISOString();
    const existingReserve = await this.reservationRepository.getByID(id);
    if (!existingReserve) throw new Error("Reservation not found");

    const toUpdate = removeUndefinedKeys(reserveInfo);
    return await this.reservationRepository.updateReserve(id, toUpdate);
  }

  async deleteReserve(id: string, roomRepository: IroomRepository) {
    const existingReserve = await this.reservationRepository.getByID(id);
    if (!existingReserve) throw new Error("Reservation not found");

    await roomRepository.updateRoom(existingReserve.roomID, {
      status: EroomStatus.AVAILABLE,
    });
    await this.reservationRepository.deleteReserve(id);
    return;
  }
}
