import { CustomError } from "@/utils/customError";
import { IauthResponse, Iregister, IuserRepository } from "@/utils/interface";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { RoleRepository } from "@/repositories/roleRepository";

dotenv.config();

export class AuthService {
  constructor(private userRepository: IuserRepository) {}

  async register(userInfo: Iregister): Promise<void> {
    if (!userInfo.roleID) throw new CustomError("Role ID is required", 400);
    if (!userInfo.firstname)
      throw new CustomError("First name is required", 400);
    if (!userInfo.lastname) throw new CustomError("Last name is required", 400);
    if (!userInfo.phoneNumber)
      throw new CustomError("Phone number is required", 400);
    if (!userInfo.email) throw new CustomError("Email is required", 400);
    if (!userInfo.username) throw new CustomError("Username is required", 400);
    if (!userInfo.password) throw new CustomError("Password is required", 400);

    const existingUsername = await this.userRepository.getByUsername(
      userInfo.username
    );
    if (existingUsername) throw new CustomError("Username already exists", 400);

    const existingEmail = await this.userRepository.getByEmail(userInfo.email);
    if (existingEmail) throw new CustomError("Email already exists", 400);

    const passwordHash = bcrypt.hashSync(userInfo.password, 10);

    await this.userRepository.createUser({
      firstname: userInfo.firstname,
      lastname: userInfo.lastname,
      phoneNumber: userInfo.phoneNumber,
      email: userInfo.email,
      username: userInfo.username,
      passwordHash,
      roleID: userInfo.roleID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  async login(
    username: string,
    password: string,
    roleRepository: RoleRepository
  ): Promise<IauthResponse> {
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

    const role = await roleRepository.getByID(userQuery.roleID);
    if (!role) throw new CustomError("Role not found", 404);

    const customAttributes = {
      userID: userQuery.id,
      firstname: userQuery.firstname,
      lastname: userQuery.lastname,
      username: userQuery.username,
      email: userQuery.email,
      roleID: userQuery.roleID,
      roleName: role.name,
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

    const userQuery = await this.userRepository.getByUsername(decoded.username);
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
