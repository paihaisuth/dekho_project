import { CustomError } from "@/utils/customError";
import { IauthResponse, IuserRepository } from "@/utils/interface";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {
  constructor(private userRepository: IuserRepository) {}
  async login(username: string, password: string): Promise<IauthResponse> {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!accessTokenSecret)
      throw new CustomError("Access token secret not set", 500);
    if (!refreshTokenSecret)
      throw new CustomError("Refresh token secret not set", 500);

    const userQuery = await this.userRepository.getByUsername(username);

    if (!userQuery) throw new CustomError("User not found", 404);

    const isPasswordValid = bcrypt.compareSync(
      password,
      userQuery.passwordHash
    );
    if (!isPasswordValid) throw new CustomError("Invalid password", 401);

    const customAttributes = {
      firstname: userQuery.firstname,
      lastname: userQuery.lastname,
      username: userQuery.username,
      email: userQuery.email,
      roleID: userQuery.roleID,
    };

    const accessToken = jwt.sign(
      { ...customAttributes, type: "access" },
      accessTokenSecret,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      { ...customAttributes, type: "refresh", key: userQuery.passwordHash },
      refreshTokenSecret,
      { expiresIn: "1d" }
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string): Promise<IauthResponse> {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!accessTokenSecret)
      throw new CustomError("Access token secret not set", 500);
    if (!refreshTokenSecret)
      throw new CustomError("Refresh token secret not set", 500);

    const decoded = jwt.verify(token, refreshTokenSecret) as jwt.JwtPayload;

    if (
      !decoded ||
      typeof decoded === "string" ||
      !decoded.key ||
      decoded.type !== "refresh"
    )
      throw new CustomError("Invalid token", 401);

    const userQuery = await this.userRepository.getByEmail(decoded.username);
    if (!userQuery) throw new CustomError("User not found", 404);
    if (userQuery.passwordHash !== decoded.key)
      throw new CustomError("Password has changed, please login again", 401);

    const customAttributes = {
      firstname: userQuery.firstname,
      lastname: userQuery.lastname,
      username: userQuery.username,
      email: userQuery.email,
      roleID: userQuery.roleID,
    };

    const accessToken = jwt.sign(
      { ...customAttributes, type: "access" },
      accessTokenSecret,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      { ...customAttributes, type: "refresh", key: userQuery.passwordHash },
      refreshTokenSecret,
      { expiresIn: "1d" }
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
