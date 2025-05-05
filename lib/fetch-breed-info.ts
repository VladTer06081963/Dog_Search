/** @format */

import { Dispatch, SetStateAction } from "react";

interface BreedInfoResult {
  title: string;
  text: string;
  temperament?: string;
  lifeSpan?: string;
  image?: string;
  url?: string;
}

interface BreedInfo {
  name: string;
  origin: string;
  temperament: string;
  lifeSpan: string;
  description: string;
  imageUrl: string | null;
  wikiUrl?: string | null;
}

export async function fetchBreedInfo(
  breed: string,
  source: "wikipedia" | "chatgpt" = "wikipedia",
  setInfoContent: Dispatch<SetStateAction<string>>,
  setBreedInfo: Dispatch<SetStateAction<BreedInfo | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  setActiveSource: Dispatch<SetStateAction<"none" | "wikipedia" | "chatgpt">>
) {
  setIsLoading(true);
  setActiveSource(source);

  try {
    if (source === "chatgpt") {
      const response = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ breed }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ошибка ChatGPT");

      setInfoContent(data.result);
      return;
    }

    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: breed }),
    });

    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "Ошибка API");

    if (!data.result?.text) {
      throw new Error("Описание не найдено ни в Dog API, ни в Википедии.");
    }

    const result: BreedInfoResult = data.result;

    setInfoContent(result.text);
    setBreedInfo({
      name: result.title,
      origin: data.source === "dogapi" ? "Dog API" : "Wikipedia",
      temperament: result.temperament || "",
      lifeSpan: result.lifeSpan || "",
      description: result.text,
      imageUrl: result.image || null,
      wikiUrl: result.url || null,
    });
  } catch (error) {
    console.error("Ошибка получения информации:", error);
    setInfoContent(`Ошибка: ${(error as Error).message}`);
  } finally {
    setIsLoading(false);
  }
}
