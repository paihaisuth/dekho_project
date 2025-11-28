import {
  generateAPIResponse,
  getBody,
  getPagination,
  getQueryString,
} from "@/app/utils/function";
import { middleware, validateRole } from "@/middleware";
import { DormitoryRepository } from "@/repositories/dormitoryRepository";
import { RoomRepository } from "@/repositories/roomRepository";
import { RoomService } from "@/services/roomService";
import { CustomError } from "@/utils/customError";
import { EroomType } from "@/utils/enum";
import { NextRequest } from "next/server";

interface IbodyCreateRoom {
  name: string;
  type: EroomType;
  from: number;
  to: number;
  prefix: string;
  dormitoryID: string;
  charLength: number;
}

export const GET = async (req: NextRequest) => {
  try {
    console.log("========== START LIST ROOM ==========");

    await middleware(req);
    await validateRole("owner", req);

    const dormitoryID = await getQueryString(req, "dormitoryID");
    if (!dormitoryID) throw new CustomError("Dormitory ID is required", 400);
    const { page, pageSize } = await getPagination(req);

    const filter = await getQueryString(req, "filter");
    const parsedFilter = filter ? JSON.parse(filter) : {};

    const roomRepository = new RoomRepository();
    const roomService = new RoomService(roomRepository);

    const roomList = await roomService.list(
      dormitoryID,
      parsedFilter,
      page,
      pageSize
    );

    console.log("========== END LIST ROOM ==========");
    return generateAPIResponse(roomList, 200);
  } catch (error) {
    console.log("========== ERROR LIST ROOM ==========", error);
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
    console.log("========== START CREATE ROOM ==========");

    await middleware(req);
    await validateRole("owner", req);

    const { name, type, from, to, prefix, dormitoryID, charLength } =
      await getBody<IbodyCreateRoom>(req);

    const dormitoryRepository = new DormitoryRepository();
    const roomRepository = new RoomRepository();
    const roomService = new RoomService(roomRepository);

    await roomService.createRoom(
      dormitoryID,
      {
        name,
        type,
        from,
        to,
        prefix,
        charLength,
      },
      dormitoryRepository
    );

    console.log("========== END CREATE ROOM ==========");
    return generateAPIResponse({ message: "Room created successfully" }, 201);
  } catch (error) {
    console.log("========== ERROR CREATE ROOM ==========", error);
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
