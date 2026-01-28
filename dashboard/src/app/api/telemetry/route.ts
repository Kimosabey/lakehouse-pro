import { getRecentEvents, getStats } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const [events, stats] = await Promise.all([
            getRecentEvents(),
            getStats(),
        ]);

        return NextResponse.json({ events, stats });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch data" },
            { status: 500 }
        );
    }
}
