/** @format */

import { Dispatch, SetStateAction } from "react";

interface BreedInfo {
  name: string;
  origin: string;
  temperament?: string;
  lifeSpan?: string;
  description: string;
  imageUrl: string | null;
  wikiUrl?: string | null;
  markdownContent?: string;
  isMarkdown?: boolean;
}

export async function fetchBreedInfo(
  breed: string,
  source: "default" | "wikipedia" | "chatgpt" = "default",
  setInfoContent: Dispatch<SetStateAction<string>>,
  setBreedInfo: Dispatch<SetStateAction<BreedInfo | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  setActiveSource: Dispatch<
    SetStateAction<"none" | "wikipedia" | "chatgpt" | "dogapi">
  >,
  lang: string = "en"
) {
  setIsLoading(true);
  if (source !== "default") {
    setActiveSource(source);
  }

  // setActiveSource(source);

  try {
    if (source === "chatgpt") {
      const response = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ breed }),
      });

      const data = await response.json();
      if (!response.ok || data.error)
        throw new Error(data.error || "Ошибка ChatGPT");

      setBreedInfo({
        name: breed,
        origin: "ChatGPT",
        description: data.markdown,
        markdownContent: data.markdown,
        isMarkdown: true,
        imageUrl: data.imageUrl || null,
        temperament: "",
        lifeSpan: "",
        wikiUrl: null,
      });

      setInfoContent(data.markdown);
      return;
    }

    if (source === "wikipedia") {
      const res = await fetch("/api/wikipedia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ breed, lang }),
      });

      const data = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || "Ошибка Википедии");

      setBreedInfo({
        name: data.result.title,
        origin: "Wikipedia",
        description: data.result.text,
        imageUrl: data.result.image || null,
        temperament: "",
        lifeSpan: "",
        wikiUrl: data.result.url || null,
        isMarkdown: false,
      });

      setInfoContent(data.result.text);
      return;
    }

    // fallback: Dog API + wiki
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: breed }),
    });

    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "Ошибка поиска");

    if (!data.result?.text) {
      throw new Error("Описание не найдено ни в Dog API, ни в Википедии.");
    }

    setBreedInfo({
      name: data.result.title,
      origin: data.source === "dogapi" ? "Dog API" : "Wikipedia",
      description: data.result.text,
      imageUrl: data.result.image || null,
      temperament: data.result.temperament || "",
      lifeSpan: data.result.lifeSpan || "",
      wikiUrl: data.result.url || null,
      isMarkdown: false,
    });

    setInfoContent(data.result.text);
    setActiveSource(data.source);
  } catch (error) {
    console.error("Ошибка получения информации:", error);
    setInfoContent(`Ошибка: ${(error as Error).message}`);
  } finally {
    setIsLoading(false);
  }
}
