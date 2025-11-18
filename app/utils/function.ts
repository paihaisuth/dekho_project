import { CustomError } from "@/utils/customError";
import { NextRequest } from "next/server";

export const generateAPIResponse = (data: unknown, status: number) => {
  return new Response(status === 204 ? null : JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

export const getBody = async <T>(request: NextRequest): Promise<T> => {
  try {
    const body = await request.json();
    if (!Object.keys(body).length)
      throw new CustomError("Body not found.", 400);
    return body as T;
  } catch (error) {
    throw new CustomError("Body not found.", 400);
  }
};

export function getPagination(
  req: NextRequest,
  opts?: {
    defaultPage?: number;
    defaultPageSize?: number;
    maxPageSize?: number;
  }
) {
  const defaultPage = opts?.defaultPage ?? 1;
  const defaultPageSize = opts?.defaultPageSize ?? 10;
  const maxPageSize = opts?.maxPageSize ?? 100;

  const pageParam =
    req.nextUrl?.searchParams.get("page") ??
    new URL(req.url).searchParams.get("page");
  const pageSizeParam =
    req.nextUrl?.searchParams.get("pageSize") ??
    new URL(req.url).searchParams.get("pageSize");

  const page = pageParam ? parseInt(pageParam, 10) : defaultPage;
  const pageSize = pageSizeParam
    ? parseInt(pageSizeParam, 10)
    : defaultPageSize;

  if (Number.isNaN(page) || page < 1)
    throw new CustomError("Invalid `page` query parameter", 400);
  if (Number.isNaN(pageSize) || pageSize < 1)
    throw new CustomError("Invalid `pageSize` query parameter", 400);
  if (pageSize > maxPageSize)
    throw new CustomError(`pageSize cannot exceed ${maxPageSize}`, 400);

  return { page, pageSize };
}
