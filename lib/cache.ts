/** @format */

import fs from "fs/promises";
import path from "path";
import { Redis } from "@upstash/redis";

const CACHE_KEY = "dog_breeds_cache";
const CACHE_FILE = path.join(process.cwd(), "data", "dog_breeds_cache.json");
const CACHE_TTL = 24 * 60 * 60; // 24ч в секундах

const redis =
  process.env.KV_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;

export async function getCache<T>(): Promise<T | null> {
  if (redis) {
    const cached = await redis.get<T>(CACHE_KEY);
    return cached ?? null;
  }

  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCache<T>(data: T): Promise<void> {
  if (redis) {
    await redis.set(CACHE_KEY, data, { ex: CACHE_TTL });
  } else {
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2));
  }
}
