import { userConnection } from "@/lib";
import { Iuser } from "@/schema";
import { IuserRepository } from "@/utils/interface";
import { ObjectId } from "mongodb";

export class UserRepository implements IuserRepository {
  constructor() {}

  async getByID(id: string): Promise<Iuser | null> {
    const userQuery = await userConnection.findOne({
      where: { _id: new ObjectId(id) },
    });

    return userQuery ? this.mapToEntity(userQuery) : null;
  }

  async getByEmail(email: string): Promise<Iuser | null> {
    const userQuery = await userConnection.findOne({
      where: { email: email },
    });

    return userQuery ? this.mapToEntity(userQuery) : null;
  }

  async createUser(user: Iuser): Promise<void> {
    await userConnection.insertOne(user);
    return;
  }

  async updateUser(id: string, userInfo: Partial<Iuser>): Promise<void> {
    await userConnection.updateOne(
      { _id: new ObjectId(id) },
      { $set: userInfo }
    );
    return;
  }

  async deleteUser(id: string): Promise<void> {
    await userConnection.deleteOne({ _id: new ObjectId(id) });
    return;
  }

  private mapToEntity(userQuery: Iuser): Iuser {
    return {
      id: userQuery.id.toString(),
      firstname: userQuery.firstname,
      lastname: userQuery.lastname,
      email: userQuery.email,
      phoneNumber: userQuery.phoneNumber,
      username: userQuery.username,
      roleID: userQuery.roleID,
      passwordHash: userQuery.passwordHash,
      createdAt: userQuery.createdAt,
      updatedAt: userQuery.updatedAt,
    };
  }
}
