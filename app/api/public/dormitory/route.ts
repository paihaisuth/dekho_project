import { generateAPIResponse } from "@/app/utils/function";
import { DormitoryRepository } from "@/repositories/dormitoryRepository";
import { RoomRepository } from "@/repositories/roomRepository";
import { DormitoryService } from "@/services/dormitoryService";
import { CustomError } from "@/utils/customError";

export const GET = async () => {
  try {
    console.log("========== [PUBLIC] START LIST DORMITORY ==========");

    const roomRepository = new RoomRepository();
    const dormitoryRepository = new DormitoryRepository();
    const dormitoryService = new DormitoryService(dormitoryRepository);

    const dormitoryList = await dormitoryService.publicList(roomRepository);

    console.log("========== [PUBLIC] END LIST DORMITORY ==========");
    return generateAPIResponse(dormitoryList, 200);
  } catch (error) {
    console.error("========== [PUBLIC] ERROR LIST DORMITORY ==========", error);
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
