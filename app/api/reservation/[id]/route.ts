import { generateAPIResponse, getBody } from "@/app/utils/function";
import { middleware } from "@/middleware";
import { ReservationRepository } from "@/repositories/reservationRepository";
import { ReservationService } from "@/services/reservationService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

interface IbodyUpdateReservation {
  idCard: string;
  firstname: string;
  lastname: string;
  reservePriceDate: string;
  reservePrice: number;
  securityPriceDate: string;
  securityPrice: number;
}

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    console.log("========== START GET RESERVATION BY ID ==========");

    await middleware(req);
    const { id } = await params;

    if (!id) throw new CustomError("Reservation ID is required", 400);

    const reservationRepository = new ReservationRepository();
    const reservationService = new ReservationService(reservationRepository);
    const reservation = await reservationService.getByID(id);
    if (!reservation) throw new CustomError("Reservation not found", 404);

    console.log("========== END GET RESERVATION BY ID ==========");
    return generateAPIResponse(reservation, 200);
  } catch (error) {
    console.log("========== ERROR GET RESERVATION BY ID ==========", error);
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

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    console.log("========== START UPDATE RESERVATION ==========");

    await middleware(req);
    const { id } = await params;
    const body = await getBody<IbodyUpdateReservation>(req);

    if (!id) throw new CustomError("Reservation ID is required", 400);

    const reservationRepository = new ReservationRepository();
    const reservationService = new ReservationService(reservationRepository);

    await reservationService.updateReserve(id, body);

    console.log("========== END UPDATE RESERVATION ==========");
    return generateAPIResponse({ message: "Reservation updated" }, 200);
  } catch (error) {
    console.log("========== ERROR UPDATE RESERVATION ==========", error);
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

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    console.log("========== START DELETE RESERVATION ==========");

    await middleware(req);
    const { id } = await params;

    if (!id) throw new CustomError("Reservation ID is required", 400);

    const reservationRepository = new ReservationRepository();
    const reservationService = new ReservationService(reservationRepository);

    await reservationService.deleteReserve(id);

    console.log("========== END DELETE RESERVATION ==========");
    return generateAPIResponse({ message: "Reservation deleted" }, 200);
  } catch (error) {
    console.log("========== ERROR DELETE RESERVATION ==========", error);
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
