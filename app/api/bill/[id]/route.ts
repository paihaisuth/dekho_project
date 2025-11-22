import { generateAPIResponse, getBody } from "@/app/utils/function";
import { middleware } from "@/middleware";
import { BillRepository } from "@/repositories/billRepository";
import { ContractRepository } from "@/repositories/contractRepository";
import { RoomRepository } from "@/repositories/roomRepository";
import { Ibill } from "@/schema";
import { BillService } from "@/services/billService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    console.log("========== START GET BILL BY ID ========== ");

    await middleware(req);

    const { id } = await params;

    const contractRepository = new ContractRepository();
    const roomRepository = new RoomRepository();
    const billRepository = new BillRepository();
    const billService = new BillService(billRepository);

    const bill = await billService.getByID(
      id,
      contractRepository,
      roomRepository
    );

    console.log("========== END GET BILL BY ID ========== ");
    return generateAPIResponse(bill, 200);
  } catch (error) {
    console.log("========== ERROR GET BILL BY ID ========== ", error);
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
    console.log("========== START UPDATE BILL ========== ");

    await middleware(req);

    const { id } = await params;
    const billData = await getBody<Partial<Ibill>>(req);

    const billRepository = new BillRepository();
    const billService = new BillService(billRepository);

    await billService.updateBill(id, billData);

    console.log("========== END UPDATE BILL ========== ");
    return generateAPIResponse({ message: "Bill updated successfully" }, 200);
  } catch (error) {
    console.log("========== ERROR UPDATE BILL ========== ", error);
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
    console.log("========== START DELETE BILL ========== ");
    await middleware(req);

    const { id } = await params;

    const billRepository = new BillRepository();
    const billService = new BillService(billRepository);

    await billService.deleteBill(id);

    console.log("========== END DELETE BILL ========== ");
    return generateAPIResponse({ message: "Bill deleted successfully" }, 200);
  } catch (error) {
    console.log("========== ERROR DELETE BILL ========== ", error);
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
