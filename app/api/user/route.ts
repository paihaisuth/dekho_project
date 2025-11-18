import { generateAPIResponse } from "@/app/utils/function";
import { middleware } from "@/middleware";
import { UserRepository } from "@/repositories/userRepository";
import { UserService } from "@/services/userService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    console.log("========== START GET USER ========== ");

    await middleware(req);

    const userRepository = new UserRepository();
    const userService = new UserService(userRepository);

    const userList = await userService.listUsers();

    console.log("========== END GET USER ========== ");
    return generateAPIResponse({ items: userList }, 200);
  } catch (error) {
    console.log("========== ERROR GET USER ========== ", error);
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
