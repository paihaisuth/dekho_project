import { generateAPIResponse, getBody } from "@/app/utils/function";
import { middleware, validateRole } from "@/middleware";
import { RoleRepository } from "@/repositories/roleRepository";
import { RoleService } from "@/services/roleService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

interface IbodyUpdateRole {
  name: string;
}

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    console.log("========== START GET ROLE BY ID ========== ");

    await middleware(req);
    await validateRole("owner", req);

    const { id } = await params;

    const roleRepository = new RoleRepository();
    const roleService = new RoleService(roleRepository);

    const roleData = await roleService.getRoleByID(id);

    console.log("========== END GET ROLE BY ID ========== ");
    return generateAPIResponse(roleData, 200);
  } catch (error) {
    console.log("========== ERROR GET ROLE BY ID ========== ", error);
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

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    console.log("========== START UPDATE ROLE ========== ");

    await middleware(req);
    await validateRole("owner", req);

    const { id } = await params;
    const roleInfo = await getBody<IbodyUpdateRole>(req);
    const roleRepository = new RoleRepository();
    const roleService = new RoleService(roleRepository);

    await roleService.updateRole(id, roleInfo);

    console.log("========== END UPDATE ROLE ========== ");
    return generateAPIResponse({ message: "Role updated successfully" }, 200);
  } catch (error) {
    console.log("========== ERROR UPDATE ROLE ========== ", error);
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

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    console.log("========== START DELETE ROLE ========== ");

    await middleware(req);
    await validateRole("owner", req);

    const { id } = await params;

    const roleRepository = new RoleRepository();
    const roleService = new RoleService(roleRepository);

    const userRepository = new (
      await import("@/repositories/userRepository")
    ).UserRepository();

    await roleService.deleteRole(id, userRepository);

    console.log("========== END DELETE ROLE ========== ");
    return generateAPIResponse({ message: "Role deleted successfully" }, 200);
  } catch (error) {
    console.log("========== ERROR DELETE ROLE ========== ", error);
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
