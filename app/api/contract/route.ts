import { generateAPIResponse, getBody } from "@/app/utils/function";
import { middleware } from "@/middleware";
import { BillRepository } from "@/repositories/billRepository";
import { ContractRepository } from "@/repositories/contractRepository";
import { DormitoryRepository } from "@/repositories/dormitoryRepository";
import { ReservationRepository } from "@/repositories/reservationRepository";
import { RoomRepository } from "@/repositories/roomRepository";
import { ContractService } from "@/services/contractService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

interface IbodyCreateContract {
  roomID: string;
  idCard: string;
  firstname: string;
  lastname: string;
  startDate: string;
  endDate: string;
  securityPrice: number;
  securityPriceDate: string;
}

// export const GET = async (req: NextRequest) => {
//   try {
//     console.log("========== START LIST CONTRACT ==========");
//     await middleware(req);

//     const roomID = await getQueryString(req, "roomID");
//     if (!roomID) throw new CustomError("Room ID is required", 400);

//     const { page, pageSize } = await getPagination(req);

//     const contractRepository = new ContractRepository();
//     const contractService = new ContractService(contractRepository);

//     const contracts = await contractService.list(roomID, page, pageSize);

//     console.log("========== END LIST CONTRACT ==========");
//     return generateAPIResponse(contracts, 200);
//   } catch (error) {
//     console.log("========== ERROR LIST CONTRACT ==========", error);
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
    console.log("========== START CREATE CONTRACT ==========");
    await middleware(req);

    const contractInfo = await getBody<IbodyCreateContract>(req);

    const reservationRepository = new ReservationRepository();
    const billRepository = new BillRepository();
    const roomRepository = new RoomRepository();
    const dormitoryRepository = new DormitoryRepository();
    const contractRepository = new ContractRepository();
    const contractService = new ContractService(contractRepository);

    await contractService.createContract(
      contractInfo,
      billRepository,
      dormitoryRepository,
      roomRepository,
      reservationRepository
    );
    console.log("========== END CREATE CONTRACT ==========");
    return generateAPIResponse({ message: "Create contract success" }, 201);
  } catch (error) {
    console.log("========== ERROR CREATE CONTRACT ==========", error);
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
