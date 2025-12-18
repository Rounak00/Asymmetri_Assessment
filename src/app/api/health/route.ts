import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {

    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    const latency = Date.now() - start;


    return NextResponse.json(
      {
        status: "healthy",
        database: "connected",
        latency: `${latency}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health Check Error:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: "Database connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}