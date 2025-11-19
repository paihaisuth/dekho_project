import { generateAPIResponse, getBody } from "@/app/utils/function";
import { middleware } from "@/middleware";
import { ContractRepository } from "@/repositories/contractRepository";
import { Icontract } from "@/schema";
import { ContractService } from "@/services/contractService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    console.log("========== START GET CONTRACT BY ID ==========");
    await middleware(req);
    const { id } = await params;
    if (!id) throw new CustomError("Contract ID is required", 400);

    const contractRepository = new ContractRepository();
    const contractService = new ContractService(contractRepository);

    const contract = await contractService.getByID(id);

    console.log("========== END GET CONTRACT BY ID ==========");
    return generateAPIResponse(contract, 200);
  } catch (error) {
    console.log("========== ERROR GET CONTRACT BY ID ==========", error);
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
    console.log("========== START UPDATE CONTRACT ==========");
    await middleware(req);
    const { id } = await params;
    if (!id) throw new CustomError("Contract ID is required", 400);

    const body = await getBody<Partial<Icontract>>(req);

    const contractRepository = new ContractRepository();
    const contractService = new ContractService(contractRepository);

    await contractService.updateContract(id, body);

    console.log("========== END UPDATE CONTRACT ==========");
    return generateAPIResponse(
      { message: "Contract updated successfully" },
      200
    );
  } catch (error) {
    console.log("========== ERROR UPDATE CONTRACT ==========", error);
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
    console.log("========== START DELETE CONTRACT ==========");
    await middleware(req);
    const { id } = await params;
    if (!id) throw new CustomError("Contract ID is required", 400);

    const contractRepository = new ContractRepository();
    const contractService = new ContractService(contractRepository);

    await contractService.deleteContract(id);

    console.log("========== END DELETE CONTRACT ==========");
    return generateAPIResponse(
      { message: "Contract deleted successfully" },
      200
    );
  } catch (error) {
    console.log("========== ERROR DELETE CONTRACT ==========", error);
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
