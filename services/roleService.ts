import { Irole } from "@/schema";
import { CustomError } from "@/utils/customError";
import { IroleRepository, IuserRepository } from "@/utils/interface";

export class RoleService {
  constructor(private roleRepository: IroleRepository) {}

  async listRoles() {
    return await this.roleRepository.list();
  }

  async getRoleByID(id: string) {
    return await this.roleRepository.getByID(id);
  }

  async createRole(roleInfo: Partial<Irole>) {
    if (!roleInfo.name) throw new CustomError("Role name is required", 400);

    await this.roleRepository.createRole(roleInfo);
    return;
  }

  async updateRole(id: string, roleInfo: Partial<Irole>) {
    await this.roleRepository.updateRole(id, roleInfo);
    return;
  }

  async deleteRole(id: string, userRepository: IuserRepository) {
    const userQuery = await userRepository.getByRoleID(id);

    if (userQuery)
      throw new CustomError(
        "Cannot delete role because it is assigned to users",
        400
      );

    await this.roleRepository.deleteRole(id);
    return;
  }
}
