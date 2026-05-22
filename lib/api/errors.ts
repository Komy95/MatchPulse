import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { UnauthorizedError } from "@/lib/auth/user-context";

export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "GROUP_NOT_FOUND"
  | "GROUP_SEASON_NOT_FOUND"
  | "INVITE_INVALID"
  | "INVITE_EXPIRED"
  | "INVITE_REVOKED"
  | "GROUP_NAME_INVALID"
  | "VALIDATION_ERROR";

const statusByCode: Record<ApiErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  GROUP_NOT_FOUND: 404,
  GROUP_SEASON_NOT_FOUND: 404,
  INVITE_INVALID: 400,
  INVITE_EXPIRED: 400,
  INVITE_REVOKED: 400,
  GROUP_NAME_INVALID: 400,
  VALIDATION_ERROR: 400,
};

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return jsonError("UNAUTHENTICATED", error.message);
  }

  if (error instanceof ApiError) {
    return jsonError(error.code, error.message, error.details);
  }

  if (error instanceof ZodError) {
    return jsonError("VALIDATION_ERROR", "Request validation failed.", {
      issues: error.flatten(),
    });
  }

  return jsonError("VALIDATION_ERROR", "Request could not be processed.");
}

export function jsonError(
  code: ApiErrorCode,
  message: string,
  details: Record<string, unknown> = {},
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details,
      },
    },
    { status: statusByCode[code] },
  );
}
