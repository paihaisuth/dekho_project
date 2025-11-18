import {
  generateAPIResponse,
  getBody,
  getPagination,
} from "@/app/utils/function";
import { middleware } from "@/middleware";
import { UserRepository } from "@/repositories/userRepository";
import { UserService } from "@/services/userService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";
import { IbodyRegister } from "../auth/register/route";

export const GET = async (req: NextRequest) => {
  try {
    console.log("========== START GET USER ========== ");

    await middleware(req);

    const { page, pageSize } = await getPagination(req);

    const userRepository = new UserRepository();
    const userService = new UserService(userRepository);

    const userList = await userService.listUsers(page, pageSize);

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

export const POST = async (req: NextRequest) => {
  try {
    console.log("========== START CREATE USER ========== ");

    await middleware(req);

    const {
      email,
      firstname,
      lastname,
      password,
      phoneNumber,
      roleID,
      username,
    } = await getBody<IbodyRegister>(req);

    const userRepository = new UserRepository();
    const userService = new UserService(userRepository);

    await userService.createUser({
      email,
      firstname,
      lastname,
      password,
      phoneNumber,
      roleID,
      username,
    });

    console.log("========== END CREATE USER ========== ");
    return generateAPIResponse({ message: "User created successfully" }, 201);
  } catch (error) {
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
