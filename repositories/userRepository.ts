import { userConnection } from "@/lib";
import { Iuser } from "@/schema";
import { IpaginationFormat, IuserRepository } from "@/utils/interface";
import { ObjectId } from "mongodb";

export class UserRepository implements IuserRepository {
  constructor() {}

  async listUsers(
    page: number,
    pageSize: number
  ): Promise<IpaginationFormat<Iuser>> {
    const skip = (page - 1) * pageSize;
    const total = await userConnection.countDocuments();
    const pageCount = Math.max(Math.ceil(total / pageSize), 1);

    const users = await userConnection
      .find()
      .skip(skip)
      .limit(pageSize)
      .toArray();
    return {
      page,
      pageSize,
      pageCount,
      total: total,
      items: users.map((user) => this.mapToEntity(user)),
    };
  }

  async getByID(id: string): Promise<Iuser | null> {
    const userQuery = await userConnection.findOne({ _id: new ObjectId(id) });

    return userQuery ? this.mapToEntity(userQuery) : null;
  }

  async getByEmail(email: string): Promise<Iuser | null> {
    const userQuery = await userConnection.findOne({ email: email });

    return userQuery ? this.mapToEntity(userQuery) : null;
  }

  async getByUsername(username: string): Promise<Iuser | null> {
    const userQuery = await userConnection.findOne({ username: username });

    return userQuery ? this.mapToEntity(userQuery) : null;
  }

  async getByRoleID(roleID: string): Promise<Iuser | null> {
    const userQuery = await userConnection.findOne({ roleID: roleID });

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

  private mapToEntity(userQuery: Iuser & { _id: ObjectId }): Iuser {
    return {
      id: userQuery._id.toString(),
      firstname: userQuery.firstname,
      lastname: userQuery.lastname,
      email: userQuery.email,
      phoneNumber: userQuery.phoneNumber,
      username: userQuery.username,
      roleID: userQuery.roleID,
      profileURL: userQuery.profileURL,
      passwordHash: userQuery.passwordHash,
      createdAt: userQuery.createdAt,
      updatedAt: userQuery.updatedAt,
    };
  }
}
