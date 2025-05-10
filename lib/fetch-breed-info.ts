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
  temperament?: string;
  lifeSpan?: string;
  description: string;
  imageUrl: string | null;
  wikiUrl?: string | null;
  rawContent?: string; // Добавляем новое поле
  markdownContent?: string; // Добавляем поле для форматированного Markdown-контента
  isMarkdown?: boolean;     // Флаг, указывающий, что content содержит Markdown
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

  if (!setInfoContent || !setBreedInfo) {
    throw new Error("Missing required setState functions");
  }

  if (source !== "default") {
    setActiveSource(source);
  }

  try {
    if (source === "chatgpt") {
  const response = await fetch("/api/chatgpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ breed }),
  });
  const data = await response.json();
  
  if (!response.ok) throw new Error(data.error || "Ошибка ChatGPT");

  // Улучшенное извлечение изображения
  const extractImage = (content: string) => {
    // Пытаемся найти markdown-изображение
    const mdMatch = content.match(/!\[.*?\]\((.*?)\)/);
    if (mdMatch && mdMatch[1].startsWith('http')) return mdMatch[1];
    
    // Ищем название файла в формате "Файл:Название.jpg"
    const fileMatch = content.match(/Файл:\s*(.*?\.(jpg|jpeg|png|gif))/i);
    if (fileMatch) {
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileMatch[1])}?width=300`;
    }
    return null;
  };

  const imageUrl = extractImage(data.result);

  setBreedInfo((prev) => ({
    ...(prev || {
      name: "",
      origin: "",
      temperament: "",
      lifeSpan: "",
      description: "",
      imageUrl: null,
      wikiUrl: null,
    }),
    name: breed,
    origin: "ChatGPT",
    description: data.result,
    // markdownContent: data.result,
    markdownContent: data.result, // Явно указываем markdown-контент
    isMarkdown: true,
    imageUrl: imageUrl,
  }));
  
  setInfoContent(data.result);
  return;
    }

    // ... остальной код без изменений ...

    if (source === "wikipedia") {
      const res = await fetch("/api/wikipedia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({ breed }),
        body: JSON.stringify({ breed, lang }), // ← добавили lang
      });

      const data = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || "Ошибка Википедии");

      setInfoContent(data.result.text);
      setBreedInfo((prev) => ({
        ...(prev || {}),
        name: data.result.title,
        origin: "Wikipedia",
        temperament: "",
        lifeSpan: "",
        description: data.result.text,
        imageUrl: data.result.image,
        wikiUrl: data.result.url,
        isMarkdown: false, // Контент из Wikipedia не в формате Markdown
      }));
      return;
    }

    // По умолчанию: Dog API → fallback Wikipedia
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
      isMarkdown: false,  // Текст из Dog API не в формате Markdown
    });

    setActiveSource(data.source);
  } catch (error) {
    console.error("Ошибка получения информации:", error);
    setInfoContent(`Ошибка: ${(error as Error).message}`);
  } finally {
    setIsLoading(false);
  }
}
