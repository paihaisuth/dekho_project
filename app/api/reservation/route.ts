import {
  generateAPIResponse,
  getBody,
  getPagination,
  getQueryString,
} from "@/app/utils/function";
import { middleware } from "@/middleware";
import { ReservationRepository } from "@/repositories/reservationRepository";
import { RoomRepository } from "@/repositories/roomRepository";
import { ReservationService } from "@/services/reservationService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

interface IbodyCreateReservation {
  roomID: string;
  idCard: string;
  firstname: string;
  lastname: string;
  reservePriceDate: string;
  reservePrice: number;
  securityPriceDate: string;
  securityPrice: number;
}

// export const GET = async (req: NextRequest) => {
//   try {
//     console.log("========== START LIST RESERVATION BY ID ==========");

//     await middleware(req);
//     const roomID = await getQueryString(req, "roomID");

//     if (!roomID) throw new CustomError("Room ID is required", 400);

//     const { page, pageSize } = await getPagination(req);

//     const reservationRepository = new ReservationRepository();
//     const reservationService = new ReservationService(reservationRepository);

//     const reservations = await reservationService.list(roomID, page, pageSize);

//     console.log("========== END LIST RESERVATION BY ID ==========");
//     return generateAPIResponse(reservations, 200);
//   } catch (error) {
//     console.log("========== ERROR LIST RESERVATION BY ID ==========", error);
//     if (error instanceof CustomError)
//       return generateAPIResponse({ message: error.message }, error.status);
//     return generateAPIResponse(
//       {
//         message:
//           (error as { message: string }).message || "Internal Server Error",
//       },
//       (error as { status: number }).status || 500
//     );
//   }
// };

export const POST = async (req: NextRequest) => {
  try {
    console.log("========== START CREATE RESERVATION ==========");

    await middleware(req);

    const reserveInfo = await getBody<IbodyCreateReservation>(req);

    const roomRepository = new RoomRepository();
    const reservationRepository = new ReservationRepository();
    const reservationService = new ReservationService(reservationRepository);

    await reservationService.createReserve(reserveInfo, roomRepository);
    console.log("========== END CREATE RESERVATION ==========");
    return generateAPIResponse(
      { message: "Create reservation successfully" },
      201
    );
  } catch (error) {
    console.log("========== ERROR CREATE RESERVATION ==========", error);
    if (error instanceof CustomError)
      return generateAPIResponse({ message: error.message }, error.status);
    return generateAPIResponse(
      {
        message:
          (error as { message: string }).message || "Internal Server Error",
      },
      (error as { status: number }).status || 500
    );
  }
};
