/** @format */

// app/api/breeds/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.thedogapi.com/v1/breeds", {
      headers: {
        "x-api-key": process.env.DOG_API_KEY || "",
      },
    });

    const data = await res.json();

    const breeds = data.map((b: any) => ({
      id: b.id,
      name: b.name,
    }));

    return NextResponse.json(breeds);
  } catch (err) {
    console.error("Error fetching breeds:", err);
    return NextResponse.json([], { status: 500 });
  }
}
