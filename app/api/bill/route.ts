import {
  generateAPIResponse,
  getBody,
  getPagination,
  getQueryString,
} from "@/app/utils/function";
import { middleware } from "@/middleware";
import { BillRepository } from "@/repositories/billRepository";
import { ContractRepository } from "@/repositories/contractRepository";
import { RoomRepository } from "@/repositories/roomRepository";
import { BillService } from "@/services/billService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

interface IbodyCreateBill {
  roomID: string;
  contractID: string;
  billingDate: string;
  rentalPrice: number;
}

export const GET = async (req: NextRequest) => {
  try {
    console.log("========== START LIST BILL ========== ");

    await middleware(req);

    const roomID = getQueryString(req, "roomID");
    if (!roomID) throw new CustomError("Room ID is required", 400);
    const contractID = getQueryString(req, "contractID");
    if (!contractID) throw new CustomError("Contract ID is required", 400);

    const { page, pageSize } = await getPagination(req);

    const contractRepository = new ContractRepository();
    const roomRepository = new RoomRepository();
    const billRepository = new BillRepository();
    const billService = new BillService(billRepository);

    const bills = await billService.list(
      roomID,
      contractID,
      contractRepository,
      roomRepository,
      page,
      pageSize
    );

    console.log("========== END LIST BILL ========== ");
    return generateAPIResponse(bills, 200);
  } catch (error) {
    console.log("========== ERROR LIST BILL ========== ", error);
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

export const POST = async (req: NextRequest) => {
  try {
    console.log("========== START CREATE BILL ========== ");

    await middleware(req);

    const billData = await getBody<IbodyCreateBill>(req);

    const billRepository = new BillRepository();
    const billService = new BillService(billRepository);

    await billService.createBill(billData);

    console.log("========== END CREATE BILL ========== ");
    return generateAPIResponse({ message: "Bill created successfully" }, 201);
  } catch (error) {
    console.log("========== ERROR CREATE BILL ========== ", error);
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
