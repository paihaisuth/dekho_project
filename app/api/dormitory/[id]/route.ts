import { generateAPIResponse, getBody } from "@/app/utils/function";
import { middleware } from "@/middleware";
import { BillRepository } from "@/repositories/billRepository";
import { ContractRepository } from "@/repositories/contractRepository";
import { DormitoryRepository } from "@/repositories/dormitoryRepository";
import { ReservationRepository } from "@/repositories/reservationRepository";
import { RoomRepository } from "@/repositories/roomRepository";
import { DormitoryService } from "@/services/dormitoryService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

interface IbodyUpdateDormitory {
  name?: string;
  address?: string;
  billingDate?: string;
  checkDate?: string;
}

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    console.log("========== START GET DORMITORY BY ID ========== ");

    await middleware(req);

    const { id } = await params;

    const dormitoryRepository = new DormitoryRepository();
    const dormitoryService = new DormitoryService(dormitoryRepository);

    const dormitory = await dormitoryService.getByID(id);

    console.log("========== END GET DORMITORY BY ID ========== ");
    return generateAPIResponse(dormitory, 200);
  } catch (error) {
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
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    console.log("========== START UPDATE DORMITORY ========== ");

    await middleware(req);

    const { id } = await params;
    const { address, name, billingDate, checkDate } =
      await getBody<IbodyUpdateDormitory>(req);

    const dormitoryRepository = new DormitoryRepository();
    const dormitoryService = new DormitoryService(dormitoryRepository);

    await dormitoryService.updateDormitory(id, {
      address,
      name,
      billingDate,
      checkDate,
    });
    console.log("========== END UPDATE DORMITORY ========== ");
    return generateAPIResponse(
      { message: "Dormitory updated successfully" },
      200
    );
  } catch (error) {
    console.log("========== ERROR UPDATE DORMITORY ========== ", error);
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
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    console.log("========== START DELETE DORMITORY ========== ");

    await middleware(req);

    const { id } = await params;

    const roomRepository = new RoomRepository();
    const contractRepository = new ContractRepository();
    const reservationRepository = new ReservationRepository();
    const billRepository = new BillRepository();
    const dormitoryRepository = new DormitoryRepository();
    const dormitoryService = new DormitoryService(dormitoryRepository);

    await dormitoryService.deleteDormitory(
      id,
      roomRepository,
      contractRepository,
      reservationRepository,
      billRepository
    );

    console.log("========== END DELETE DORMITORY ========== ");
    return generateAPIResponse(
      { message: "Dormitory deleted successfully" },
      200
    );
  } catch (error) {
    console.log("========== ERROR DELETE DORMITORY ========== ", error);
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
