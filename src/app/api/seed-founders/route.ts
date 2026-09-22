import { NextResponse } from "next/server";
import { seedFounders } from "@/crawler/seed-founders";

export async function POST() {
  try {
    await seedFounders();
    return NextResponse.json({ success: true, message: "Seed completed" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
