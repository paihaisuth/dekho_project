import {
  generateAPIResponse,
  getBody,
  getPagination,
  getQueryString,
} from "@/app/utils/function";
import { middleware } from "@/middleware";
import { RepairRequestRepository } from "@/repositories/repairRequestRepository";
import { RoomRepository } from "@/repositories/roomRepository";
import { RepairRequestService } from "@/services/repairRequestService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

interface IcreateRepairRequestBody {
  roomID: string;
  dormitoryID: string;
  details: string;
}

export const GET = async (req: NextRequest) => {
  try {
    console.log("========== START LIST REPAIR REQUEST ==============");

    await middleware(req);
    const { page, pageSize } = await getPagination(req);
    const filter = (await getQueryString(req, "filter")) || "{}";
    const parsedFilter = JSON.parse(filter);

    const roomRespository = new RoomRepository();
    const repairRequestRepository = new RepairRequestRepository();
    const repairRequestService = new RepairRequestService(
      repairRequestRepository
    );

    const items = await repairRequestService.list(
      parsedFilter,
      page,
      pageSize,
      roomRespository
    );

    console.log("========== END LIST REPAIR REQUEST ==============");
    return generateAPIResponse(items, 200);
  } catch (error) {
    console.log("========== ERROR LIST REPAIR REQUEST ==============", error);

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
    console.log("========== START CREATE REPAIR REQUEST ==============");

    const { id } = await middleware(req);
    const { roomID, details, dormitoryID } =
      await getBody<IcreateRepairRequestBody>(req);

    const repairRequestRepository = new RepairRequestRepository();
    const repairRequestService = new RepairRequestService(
      repairRequestRepository
    );

    await repairRequestService.createRepairRequest(
      id,
      roomID,
      dormitoryID,
      details
    );

    console.log("========== END CREATE REPAIR REQUEST ==============");
    return generateAPIResponse(
      { message: "Repair request created successfully" },
      201
    );
  } catch (error) {
    console.log("========== ERROR CREATE REPAIR REQUEST ==============", error);

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
