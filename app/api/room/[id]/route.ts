import { generateAPIResponse, getBody } from "@/app/utils/function";
import { middleware } from "@/middleware";
import { RoomRepository } from "@/repositories/roomRepository";
import { Iroom } from "@/schema";
import { RoomService } from "@/services/roomService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    console.log("========== START GET ROOM BY ID ==========");

    await middleware(req);

    const { id } = await params;
    if (!id) throw new CustomError("Room ID is required", 400);

    const roomRepository = new RoomRepository();
    const roomService = new RoomService(roomRepository);

    const roomData = await roomService.getByID(id);
    if (!roomData) throw new CustomError("Room not found", 404);

    console.log("========== END GET ROOM BY ID ==========");
    return generateAPIResponse(roomData, 200);
  } catch (error) {
    console.log("========== ERROR GET ROOM BY ID ==========", error);
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
    console.log("========== START UPDATE ROOM BY ID ==========");

    await middleware(req);

    const { id } = await params;

    const toUpdate = await getBody<
      Omit<
        Iroom,
        | "id"
        | "dormitoryID"
        | "images"
        | "refundURL"
        | "createdAt"
        | "updatedAt"
      >
    >(req);

    const roomRepository = new RoomRepository();
    const roomService = new RoomService(roomRepository);

    await roomService.updateRoom(id, toUpdate);

    console.log("========== END UPDATE ROOM BY ID ==========");
    return generateAPIResponse({ message: "Room updated successfully" }, 200);
  } catch (error) {
    console.log("========== ERROR UPDATE ROOM BY ID ==========", error);
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
    console.log("========== START DELETE ROOM BY ID ==========");

    await middleware(req);

    const { id } = await params;
    if (!id) throw new CustomError("Room ID is required", 400);

    const roomRepository = new RoomRepository();
    const roomService = new RoomService(roomRepository);

    await roomService.deleteRoom(id);

    console.log("========== END DELETE ROOM BY ID ==========");
    return generateAPIResponse({ message: "Room deleted successfully" }, 200);
  } catch (error) {
    console.log("========== ERROR DELETE ROOM BY ID ==========", error);
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
