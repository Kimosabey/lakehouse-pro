import { getRecentEvents, getStats } from "@/lib/db";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const [events, stats] = await Promise.all([
    getRecentEvents(),
    getStats(),
  ]);

  return <DashboardClient initialEvents={events} initialStats={stats} />;
}
