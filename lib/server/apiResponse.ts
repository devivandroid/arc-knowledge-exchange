import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "INVALID_JSON"
  | "INVALID_INPUT"
  | "INVALID_METADATA"
  | "INVALID_PRICE_USDC"
  | "INVALID_BUDGET_USDC"
  | "INVALID_ADDRESS"
  | "RESOURCE_NOT_FOUND"
  | "REQUEST_NOT_FOUND"
  | "PAYMENT_REQUIRED"
  | "RPC_ERROR";

export function apiError({
  status,
  error,
  message,
  extra,
  details
}: {
  status: number;
  error: ApiErrorCode | string;
  message: string;
  extra?: Record<string, unknown>;
  details?: Record<string, unknown>;
}) {
  return NextResponse.json(
    {
      ok: false,
      error,
      message,
      ...(extra ?? {}),
      ...(details ? { details } : {})
    },
    { status }
  );
}
