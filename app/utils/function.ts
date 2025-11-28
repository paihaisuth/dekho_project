import { AxiosError, AxiosResponse } from "axios";
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

export async function getPagination(
  req: NextRequest
): Promise<{ page: number; pageSize: number }> {
  const pageParam =
    req.nextUrl?.searchParams.get("page") ??
    new URL(req.url).searchParams.get("page");
  const pageSizeParam =
    req.nextUrl?.searchParams.get("pageSize") ??
    new URL(req.url).searchParams.get("pageSize");

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;

  if (Number.isNaN(page) || page < 1)
    throw new CustomError("Invalid `page` query parameter", 400);
  if (Number.isNaN(pageSize) || pageSize < 1)
    throw new CustomError("Invalid `pageSize` query parameter", 400);

  return { page, pageSize };
}

export const getQueryString = (
  req: NextRequest,
  key: string
): string | null => {
  return (
    req.nextUrl?.searchParams.get(key) ?? new URL(req.url).searchParams.get(key)
  );
};

export const removeUndefinedKeys = <T extends Record<string, unknown>>(
  obj: T
): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as Partial<T>;
};

export const getError = <T>(
  error: unknown
): { statusCode: number; errorMessage: string; data: T } => {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status || 400;
    const errorMessage = error.response?.data.message || "Unknow error";

    return { statusCode, errorMessage, data: error.response?.data };
  }
  return { statusCode: 400, errorMessage: "Unkown error", data: {} as T };
};

export const getResponse = <T>(
  response: AxiosResponse
): { statusCode: number; data: T; errorMessage: string } => {
  const statusCode = response.status;
  const data = response.data;
  return { statusCode, data, errorMessage: "" };
};
