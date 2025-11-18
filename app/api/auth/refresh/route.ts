import { generateAPIResponse, getBody } from "@/app/utils/function";
import { UserRepository } from "@/repositories/userRepository";
import { AuthService } from "@/services/authService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

interface IbodyRefreshToken {
  refreshToken: string;
}

export const POST = async (req: NextRequest) => {
  try {
    console.log("========== START REFRESH TOKEN ========== ");

    const { refreshToken } = await getBody<IbodyRefreshToken>(req);

    const userRepository = new UserRepository();
    const authService = new AuthService(userRepository);
    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshToken(refreshToken);

    console.log("========== END REFRESH TOKEN ========== ");
    return generateAPIResponse(
      { accessToken, refreshToken: newRefreshToken },
      200
    );
  } catch (error) {
    console.log("========== ERROR REFRESH TOKEN ========== ", error);
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
