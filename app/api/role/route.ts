import { generateAPIResponse, getBody } from "@/app/utils/function";
import { RoleRepository } from "@/repositories/roleRepository";
import { RoleService } from "@/services/roleService";
import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

interface IbodyCreateRole {
  name: string;
}

export const POST = async (req: NextRequest) => {
  try {
    console.log("========== START CREATE ROLE ========== ");

    const { name } = await getBody<IbodyCreateRole>(req);

    const roleRepository = new RoleRepository();
    const roleService = new RoleService(roleRepository);

    await roleService.createRole({ name });

    console.log("========== END CREATE ROLE ========== ");
    return generateAPIResponse({ message: "Role created successfully" }, 201);
  } catch (error) {
    console.log("========== ERROR CREATE ROLE ========== ", error);
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

export const GET = async (req: NextRequest) => {
  try {
    console.log("========== START GET ROLE ========== ");

    const roleRepository = new RoleRepository();
    const roleService = new RoleService(roleRepository);

    const roleList = await roleService.listRoles();

    console.log("========== END GET ROLE ========== ");
    return generateAPIResponse(roleList, 200);
  } catch (error) {
    console.log("========== ERROR GET ROLE ========== ", error);
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
