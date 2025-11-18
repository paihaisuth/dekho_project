import { getBody, generateAPIResponse } from "@/app/utils/function";
import { UserRepository } from "@/repositories/userRepository";
import { AuthService } from "@/services/authService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

export interface IbodyRegister {
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  password: string;
  roleID: string;
}

export const POST = async (req: NextRequest) => {
  try {
    console.log("========== START REGISTER ========== ");

    const {
      username,
      email,
      firstname,
      lastname,
      phoneNumber,
      password,
      roleID,
    } = await getBody<IbodyRegister>(req);

    const userRepository = new UserRepository();
    const authService = new AuthService(userRepository);
    await authService.register({
      username,
      email,
      firstname,
      lastname,
      phoneNumber,
      password,
      roleID,
    });
    console.log("========== END REGISTER ========== ");
    return generateAPIResponse(
      { message: "User registered successfully" },
      201
    );
  } catch (error) {
    console.log("========== ERROR REGISTER ========== ", error);
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
