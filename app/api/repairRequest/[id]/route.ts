import { getBody, generateAPIResponse } from "@/app/utils/function";
import { RepairRequestRepository } from "@/repositories/repairRequestRepository";
import { RepairRequestService } from "@/services/repairRequestService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

interface IupdateRepairRequestBody {
  details: string;
  fixDate: string;
  status: boolean;
}

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    console.log("========== START GET REPAIR REQUEST BY ID ==============");

    const { id } = await params;

    const repairRequestRepository = new RepairRequestRepository();
    const repairRequestService = new RepairRequestService(
      repairRequestRepository
    );

    const item = await repairRequestService.getByID(id);

    console.log("========== END GET REPAIR REQUEST BY ID ==============");
    return generateAPIResponse(item, 200);
  } catch (error) {
    console.log(
      "========== ERROR GET REPAIR REQUEST BY ID ==============",
      error
    );

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
    console.log("========== START UPDATE REPAIR REQUEST ==============");

    const { id } = await params;
    const { details, fixDate, status } =
      await getBody<IupdateRepairRequestBody>(req);

    const repairRequestRepository = new RepairRequestRepository();
    const repairRequestService = new RepairRequestService(
      repairRequestRepository
    );

    await repairRequestService.updateRepairRequest(
      id,
      details,
      fixDate,
      status
    );

    console.log("========== END UPDATE REPAIR REQUEST ==============");
    return generateAPIResponse(
      { message: "Repair request updated successfully" },
      200
    );
  } catch (error) {
    console.log("========== ERROR UPDATE REPAIR REQUEST ==============", error);

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
    console.log("========== START DELETE REPAIR REQUEST ==============");

    const { id } = await params;

    const repairRequestRepository = new RepairRequestRepository();
    const repairRequestService = new RepairRequestService(
      repairRequestRepository
    );

    await repairRequestService.deleteRepairRequest(id);

    console.log("========== END DELETE REPAIR REQUEST ==============");
    return generateAPIResponse(
      { message: "Repair request deleted successfully" },
      200
    );
  } catch (error) {
    console.log("========== ERROR DELETE REPAIR REQUEST ==============", error);

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
