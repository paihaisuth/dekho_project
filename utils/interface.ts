import { Iuser } from "@/schema";

export interface IuserRepository {
  getByID(id: string): Promise<Iuser | null>;
  getByEmail(email: string): Promise<Iuser | null>;
  createUser(user: Iuser): Promise<void>;
  updateUser(id: string, userInfo: Partial<Iuser>): Promise<void>;
  deleteUser(id: string): Promise<void>;
}
