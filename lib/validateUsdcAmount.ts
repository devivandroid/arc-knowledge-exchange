import { parseUnits } from "ethers";
import { usdcDecimals } from "@/lib/contracts/microWorkEscrow";

export function isValidUsdcAmount(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  try {
    return parseUnits(value, usdcDecimals) > 0n;
  } catch {
    return false;
  }
}
