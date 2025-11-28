import {
  generateAPIResponse,
  getBody,
  getPagination,
  getQueryString,
} from "@/app/utils/function";
import { middleware, validateRole } from "@/middleware";
import { DormitoryRepository } from "@/repositories/dormitoryRepository";
import { UserRepository } from "@/repositories/userRepository";
import { DormitoryService } from "@/services/dormitoryService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

interface IbodyCreateDormitory {
  name: string;
  address: string;
  userID: string;
  roomCount: number;
  billingDate: string;
  checkDate: string;
}

export const GET = async (req: NextRequest) => {
  try {
    console.log("========== START LIST DORMITORY ========== ");

    await middleware(req);
    await validateRole("owner", req);

    const userID = await getQueryString(req, "userID");
    if (!userID) throw new CustomError("User ID is required", 400);

    const filter = await getQueryString(req, "filter");
    const filterParsed = filter ? JSON.parse(filter) : {};

    const { page, pageSize } = await getPagination(req);

    const dormitoryRepository = new DormitoryRepository();
    const dormitoryService = new DormitoryService(dormitoryRepository);

    const dormitoryList = await dormitoryService.list(
      userID,
      filterParsed,
      page,
      pageSize
    );

    console.log("========== END LIST DORMITORY ========== ");
    return generateAPIResponse(dormitoryList, 200);
  } catch (error) {
    console.log("========== ERROR LIST DORMITORY ========== ", error);
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
    console.log("========== START CREATE DORMITORY ========== ");

    await middleware(req);
    await validateRole("owner", req);

    const {
      name,
      address,
      userID,
      roomCount = 0,
      billingDate,
      checkDate,
    } = await getBody<IbodyCreateDormitory>(req);

    const userRepository = new UserRepository();
    const dormitoryRepository = new DormitoryRepository();
    const dormitoryService = new DormitoryService(dormitoryRepository);

    await dormitoryService.createDormitory(
      {
        name,
        address,
        userID,
        roomCount,
        billingDate,
        checkDate,
      },
      userRepository
    );

    console.log("========== END CREATE DORMITORY ========== ");
    return generateAPIResponse(
      { message: "Dormitory created successfully" },
      201
    );
  } catch (error) {
    console.log("========== ERROR CREATE DORMITORY ========== ", error);
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
