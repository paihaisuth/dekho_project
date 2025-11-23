import { removeUndefinedKeys } from "@/app/utils/function";
import { reservationConnection } from "@/lib";
import { Ireservation } from "@/schema";
import { IreservationRepository } from "@/utils/interface";
import { ObjectId } from "mongodb";

export class ReservationRepository implements IreservationRepository {
  constructor() {}

  async getByRoomID(roomID: string): Promise<Ireservation | null> {
    const reservationQuery = await reservationConnection.findOne({
      roomID: roomID,
    });
    return reservationQuery ? this.mapToIreservation(reservationQuery) : null;
  }

  async getByID(id: string): Promise<Ireservation | null> {
    const reservationQuery = await reservationConnection.findOne({
      _id: new ObjectId(id),
    });
    return reservationQuery ? this.mapToIreservation(reservationQuery) : null;
  }

  async createReserve(reserveInfo: Ireservation): Promise<void> {
    const existingReserve = await this.getByRoomID(reserveInfo.roomID);
    if (existingReserve) {
      const toUpdate = removeUndefinedKeys<Partial<Ireservation>>(reserveInfo);
      await this.updateReserve(existingReserve.id as string, toUpdate);
      return;
    }
    await reservationConnection.insertOne(reserveInfo);
    return;
  }

  async updateReserve(
    id: string,
    reserveInfo: Partial<Ireservation>
  ): Promise<void> {
    await reservationConnection.updateOne(
      { _id: new ObjectId(id) },
      { $set: reserveInfo }
    );
    return;
  }

  async deleteReserve(id: string): Promise<void> {
    await reservationConnection.deleteOne({ _id: new ObjectId(id) });
    return;
  }

  async deleteByDormitoryID(dormitoryID: string): Promise<void> {
    await reservationConnection.deleteMany({ dormitoryID: dormitoryID });
    return;
  }

  async deleteByRoomID(roomID: string): Promise<void> {
    await reservationConnection.deleteMany({ roomID: roomID });
    return;
  }

  private mapToIreservation(
    reservationData: Ireservation & { _id: ObjectId }
  ): Ireservation {
    return {
      id: reservationData._id.toString(),
      roomID: reservationData.roomID,
      createdAt: reservationData.createdAt,
      firstname: reservationData.firstname,
      lastname: reservationData.lastname,
      idCard: reservationData.idCard,
      paidDate: reservationData.paidDate,
      slipURL: reservationData.slipURL,
      status: reservationData.status,
      reservePrice: reservationData.reservePrice,
      reservePriceDate: reservationData.reservePriceDate,
      securityPrice: reservationData.securityPrice,
      securityPriceDate: reservationData.securityPriceDate,
      totalPrice: reservationData.totalPrice,
      updatedAt: reservationData.updatedAt,
    };
  }
}
