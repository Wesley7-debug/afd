import { NextResponse } from "next/server";
import { seedInitialSources } from "@/crawler/seed";

export async function POST() {
  try {
    await seedInitialSources();
    return NextResponse.json({ message: "Initial sources seeded successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to seed initial sources" },
      { status: 500 }
    );
  }
}
