import { isAddress } from "ethers";
import { NextResponse, type NextRequest } from "next/server";
import {
  getResourceRatingSummaryAsync,
  getUserResourceRatingAsync,
  saveResourceRatingAsync
} from "@/lib/server/resourceRatings";

type RatingsRouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function GET(request: NextRequest, context: RatingsRouteContext) {
  const { id } = await context.params;
  const walletAddress = request.nextUrl.searchParams.get("walletAddress");
  const [summary, userRating] = await Promise.all([
    getResourceRatingSummaryAsync(id),
    getUserResourceRatingAsync({ resourceId: id, walletAddress })
  ]);

  return NextResponse.json({
    ok: true,
    resourceId: id,
    summary,
    userRating
  });
}

export async function POST(request: NextRequest, context: RatingsRouteContext) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  if (typeof body.walletAddress !== "string" || !isAddress(body.walletAddress)) {
    return NextResponse.json({ ok: false, error: "INVALID_WALLET" }, { status: 400 });
  }

  if (
    typeof body.rating !== "number" ||
    !Number.isFinite(body.rating) ||
    body.rating < 1 ||
    body.rating > 5
  ) {
    return NextResponse.json({ ok: false, error: "INVALID_RATING" }, { status: 400 });
  }

  const rating = await saveResourceRatingAsync({
    resourceId: id,
    walletAddress: body.walletAddress,
    rating: body.rating
  });
  const summary = await getResourceRatingSummaryAsync(id);

  return NextResponse.json(
    {
      ok: true,
      resourceId: id,
      rating,
      summary,
      message: "Rating saved."
    },
    { status: 201 }
  );
}
