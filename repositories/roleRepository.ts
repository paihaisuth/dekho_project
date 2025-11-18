import { roleConnection } from "@/lib/roleConnection";
import { Irole } from "@/schema";
import { IpaginationFormat, IroleRepository } from "@/utils/interface";
import { CustomError } from "@/utils/customError";
import { ObjectId } from "mongodb";

export class RoleRepository implements IroleRepository {
  constructor() {}

  async list(
    page: number,
    pageSize: number
  ): Promise<IpaginationFormat<Irole>> {
    const skip = (page - 1) * pageSize;
    const totalRoles = await roleConnection.countDocuments();

    const roles = await roleConnection
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const mapedRoles = roles.map((role) => this.matpToRole(role));

    const result = {
      items: mapedRoles,
      page,
      pageSize,
      pageCount: Math.ceil(totalRoles / pageSize),
      total: totalRoles,
    };
    return result;
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
    const existing = await roleConnection.findOne({ _id: new ObjectId(id) });
    if (!existing) throw new CustomError("Role not found", 404);

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
