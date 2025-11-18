import { roleConnection } from "@/lib/roleConnection";
import { Irole } from "@/schema";
import { IroleRepository } from "@/utils/interface";
import { ObjectId } from "mongodb";

export class RoleRepository implements IroleRepository {
  constructor() {}

  async list(): Promise<Irole[]> {
    const roles = await roleConnection.find().toArray();
    return roles.map((role) => this.matpToRole(role));
  }

  async getByID(id: string): Promise<Irole | null> {
    const role = await roleConnection.findOne({ _id: new ObjectId(id) });
    if (!role) return null;
    return this.matpToRole(role);
  }

  async createRole(roleInfo: Partial<Irole>): Promise<void> {
    const now = new Date().toISOString();
    await roleConnection.insertOne({
      ...roleInfo,
      createdAt: now,
      updatedAt: now,
    } as Irole);
  }

  async updateRole(id: string, roleInfo: Partial<Irole>): Promise<void> {
    const now = new Date().toISOString();
    await roleConnection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...roleInfo, updatedAt: now } }
    );
    return;
  }

  async deleteRole(id: string): Promise<void> {
    await roleConnection.deleteOne({ _id: new ObjectId(id) });
    return;
  }

  private matpToRole(role: Irole & { _id: ObjectId }): Irole {
    return {
      id: role._id.toHexString(),
      name: role.name,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
