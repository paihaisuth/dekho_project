import { generateAPIResponse, getBody } from "@/app/utils/function";
import { middleware } from "@/middleware";
import { UserRepository } from "@/repositories/userRepository";
import { UserService } from "@/services/userService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

interface IbodyUpdateUser {
  name?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  firstname?: string;
  lastname?: string;
  roleID?: string;
}

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    console.log("========== START GET USER BY ID ==========");

    await middleware(req);

    const { id } = await params;

    const userRepository = new UserRepository();
    const userService = new UserService(userRepository);

    const user = await userService.getByID(id);

    console.log("========== END GET USER BY ID ==========");
    return generateAPIResponse(user, 200);
  } catch (error) {
    console.log("========== ERROR GET USER BY ID ==========");
    if (error instanceof CustomError) {
      return generateAPIResponse({ message: error.message }, error.status);
    }
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
    console.log("========== START UPDATE USER BY ID ==========");

    await middleware(req);

    const { id } = await params;
    const body = await getBody<IbodyUpdateUser>(req);

    const userRepository = new UserRepository();
    const userService = new UserService(userRepository);

    const updatedUser = await userService.updateUser(id, body);

    console.log("========== END UPDATE USER BY ID ==========");
    return generateAPIResponse(updatedUser, 200);
  } catch (error) {
    console.log("========== ERROR UPDATE USER BY ID ==========");
    if (error instanceof CustomError) {
      return generateAPIResponse({ message: error.message }, error.status);
    }
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
    console.log("========== START DELETE USER BY ID ==========");

    await middleware(req);

    const { id } = await params;

    const userRepository = new UserRepository();
    const userService = new UserService(userRepository);

    await userService.deleteUser(id);

    console.log("========== END DELETE USER BY ID ==========");
    return generateAPIResponse({ message: "User deleted successfully" }, 200);
  } catch (error) {
    console.log("========== ERROR DELETE USER BY ID ==========");
    if (error instanceof CustomError) {
      return generateAPIResponse({ message: error.message }, error.status);
    }
    return generateAPIResponse(
      {
        message:
          (error as { message: string }).message || "Internal Server Error",
      },
      (error as { status: number }).status || 500
    );
  }
};
