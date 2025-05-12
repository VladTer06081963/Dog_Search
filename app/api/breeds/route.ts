/** @format */

import { NextResponse } from "next/server";
// import { Redis } from "@upstash/redis";
import { getCache, setCache } from "@/lib/cache";
import crypto from "crypto";
import { EnrichedBreed } from "@/types";

// Redis client
// const redis = new Redis({
//   url: process.env.KV_URL!,
//   token: process.env.KV_REST_API_TOKEN!,
// });

const DOG_API_URL = "https://api.thedogapi.com/v1";
const CACHE_KEY = "dog_breeds_cache";
const CACHE_TTL = 24 * 60 * 60; // 24 часа (в секундах)

interface Breed {
  id: number;
  name: string;
  temperament?: string;
  life_span?: string;
  origin?: string;
  weight?: { metric: string };
  height?: { metric: string };
  bred_for?: string;
  breed_group?: string;
  reference_image_id?: string;
  wikipedia_url?: string;
  description?: string;
}

interface CacheData {
  timestamp: number;
  dataHash: string;
  breeds: EnrichedBreed[];
}

// Генерация хеша
function generateDataHash(breeds: Breed[]): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(breeds))
    .digest("hex");
}

async function fetchAllBreeds(): Promise<Breed[]> {
  const res = await fetch(`${DOG_API_URL}/breeds`, {
    headers: {
      "x-api-key": process.env.DOG_API_KEY || "",
    },
  });

  if (!res.ok) throw new Error(`Dog API error: ${res.status}`);
  return await res.json();
}

async function enrichBreed(breed: Breed): Promise<EnrichedBreed> {
  const imageUrl = breed.reference_image_id
    ? `https://cdn2.thedogapi.com/images/${breed.reference_image_id}.jpg`
    : "/placeholder.svg";

  return {
    id: breed.id,
    name: breed.name,
    description:
      breed.description || breed.temperament || "No description available",
    temperament: breed.temperament || "Not specified",
    life_span: breed.life_span || "Unknown",
    origin: breed.origin || "Unknown",
    weight: breed.weight?.metric || "Unknown",
    height: breed.height?.metric || "Unknown",
    bred_for: breed.bred_for || "Not specified",
    breed_group: breed.breed_group || "Not specified",
    image_url: imageUrl,
    wikipedia_url: breed.wikipedia_url || "",
  };
}

export async function GET() {
  try {
    // Чтение из Redis
 const cache = await getCache<CacheData>();
 const now = Date.now();

 if (cache && now - cache.timestamp < CACHE_TTL * 1000) {
   return NextResponse.json(cache.breeds);
 }

 const breedsData = await fetchAllBreeds();
 const currentHash = generateDataHash(breedsData);

 if (cache?.dataHash === currentHash) {
   return NextResponse.json(cache.breeds);
 }

 const enrichedBreeds = await Promise.all(breedsData.map(enrichBreed));
 const newCache: CacheData = {
   timestamp: now,
   dataHash: currentHash,
   breeds: enrichedBreeds.filter((b) => b.image_url && b.name),
 };

 await setCache(newCache);
 return NextResponse.json(newCache.breeds);

  } catch (err) {
    console.error("Breed fetch failed:", err);

    // const fallback = await redis.get<CacheData>(CACHE_KEY);
    const fallback = await getCache<CacheData>();

    if (fallback?.breeds) {
      console.warn("Using stale Redis cache due to error.");
      return NextResponse.json(fallback.breeds);
    }

    return NextResponse.json(
      { error: "Failed to fetch breeds" },
      { status: 500 }
    );
  }
}
