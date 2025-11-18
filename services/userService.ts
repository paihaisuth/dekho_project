import { Iuser } from "@/schema";
import { CustomError } from "@/utils/customError";
import { IuserRepository } from "@/utils/interface";
import bcrypt from "bcrypt";

export class UserService {
  constructor(private userRepository: IuserRepository) {}

  async listUsers(): Promise<Iuser[]> {
    return this.userRepository.listUsers();
  }

  async getByID(id: string): Promise<Iuser | null> {
    return this.userRepository.getByID(id);
  }

  async getByEmail(email: string): Promise<Iuser | null> {
    return this.userRepository.getByEmail(email);
  }

  async getByUsername(username: string): Promise<Iuser | null> {
    return this.userRepository.getByUsername(username);
  }

  async createUser(user: Iuser & { password: string }): Promise<void> {
    if (!user.username) throw new CustomError("Username is required", 400);
    if (!user.password) throw new CustomError("Password is required", 400);
    if (!user.firstname) throw new CustomError("Firstname is required", 400);
    if (!user.lastname) throw new CustomError("Lastname is required", 400);
    if (!user.email) throw new CustomError("Email is required", 400);
    if (!user.roleID) throw new CustomError("Role ID is required", 400);
    if (!user.phoneNumber)
      throw new CustomError("Phone number is required", 400);

    const passwordHash = bcrypt.hashSync(user.password, 10);

    const now = new Date().toISOString();
    await this.userRepository.createUser({
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      roleID: user.roleID,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    } as Iuser);

    return;
  }

  async updateUser(
    id: string,
    userInfo: Partial<Iuser & { password?: string }>
  ): Promise<void> {
    if (userInfo.password) {
      userInfo.passwordHash = bcrypt.hashSync(userInfo.password, 10);
      delete userInfo.password;
    }
    userInfo.updatedAt = new Date().toISOString();

    await this.userRepository.updateUser(id, userInfo);
    return;
  }

  // TODO: delete related data in other collections
  async deleteUser(id: string): Promise<void> {
    await this.userRepository.deleteUser(id);
    return;
  }
}
