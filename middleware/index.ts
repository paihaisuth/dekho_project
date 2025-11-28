import { CustomError } from "../utils/customError";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { IresponseMiddleware } from "../utils/interface";

export const middleware = async (
  request: NextRequest
): Promise<IresponseMiddleware> => {
  try {
    // Read Authorization header
    const authHeader =
      request.headers.get("authorization") ||
      request.headers.get("Authorization");
    if (!authHeader) throw new CustomError("Unauthorized", 401);

    // Accept both "Bearer <token>" and raw token
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.trim();
    if (!token) throw new CustomError("Unauthorized: No token provided.", 401);

    if (!process.env.ACCESS_TOKEN_SECRET)
      throw new CustomError("ACCESS_TOKEN_SECRET not set", 500);

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as {
      id: string;
      username: string;
      roleName: string;
    };

    return {
      id: payload.id,
      username: payload.username,
      roleName: payload.roleName,
    };
  } catch (error) {
    console.log("Middleware error:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      throw new CustomError("Unauthorized: Invalid token.", 401);
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new CustomError("Unauthorized: Token has expired.", 401);
    } else if (error instanceof CustomError) {
      throw error;
    } else {
      throw new CustomError("Internal Server Error", 500);
    }
  }
};

export const validateRole = async (
  target: "owner" | "resident",
  req: NextRequest
): Promise<void> => {
  try {
    // Extract the payload using the middleware function
    const payload = await middleware(req);

    // Check if the role matches the target role
    if (payload.roleName !== target) {
      throw new CustomError("Forbidden: Insufficient role permissions.", 403);
    }
  } catch (error) {
    console.log("Role validation error:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new CustomError("Internal Server Error", 500);
    }
  }
};
