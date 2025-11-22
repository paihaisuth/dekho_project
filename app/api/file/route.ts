import {
  generateAPIResponse,
  getBody,
  getQueryString,
} from "@/app/utils/function";
import { middleware } from "@/middleware";
import { FileRepository } from "@/repositories/fileRepository";
import { FileService } from "@/services/fileService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    console.log("========== START UPLOAD FILE ========== ");

    await middleware(req);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const prefix = getQueryString(req, "prefix");

    if (!file) throw new CustomError("File is required", 400);

    const fileRepository = new FileRepository();
    const fileService = new FileService(fileRepository);

    const uploadResult = await fileService.uploadFile(file, prefix || "");

    console.log("========== END UPLOAD FILE ========== ");
    return generateAPIResponse(uploadResult, 201);
  } catch (error) {
    console.log("========== ERROR UPLOAD FILE ========== ", error);
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

export const DELETE = async (req: NextRequest) => {
  try {
    console.log("========== START DELETE FILE ========== ");

    await middleware(req);

    const { key } = await getBody<{ key: string }>(req);

    if (!key) throw new CustomError("File key is required", 400);

    const fileRepository = new FileRepository();
    const fileService = new FileService(fileRepository);

    await fileService.deleteFile(key);

    console.log("========== END DELETE FILE ========== ");
    return generateAPIResponse({ message: "File deleted successfully" }, 200);
  } catch (error) {
    console.log("========== ERROR DELETE FILE ========== ", error);
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
