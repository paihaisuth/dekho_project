import { generateAPIResponse, getBody } from "@/app/utils/function";
import { RoleRepository } from "@/repositories/roleRepository";
import { UserRepository } from "@/repositories/userRepository";
import { AuthService } from "@/services/authService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

interface IbodyLogin {
  username: string;
  password: string;
}

export const POST = async (req: NextRequest) => {
  try {
    console.log("========== START LOGIN ========== ");

    const { username, password } = await getBody<IbodyLogin>(req);

    const userRepository = new UserRepository();
    const roleRepository = new RoleRepository();
    const authService = new AuthService(userRepository);
    const { accessToken, refreshToken } = await authService.login(
      username,
      password,
      roleRepository
    );

    console.log("========== END LOGIN ========== ");
    return generateAPIResponse({ accessToken, refreshToken }, 200);
  } catch (error) {
    console.log("========== ERROR LOGIN ========== ", error);
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
