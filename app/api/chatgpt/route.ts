/** @format */
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. Проверка API-ключа
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set");
    return NextResponse.json(
      { error: "Server configuration error: API key is missing" },
      { status: 500 }
    );
  }

  // 2. Разбор и валидация тела запроса
  let breedData: { breed?: unknown };
  try {
    breedData = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { breed } = breedData;
  if (typeof breed !== "string" || !breed.trim() || breed.length > 100) {
    return NextResponse.json({ error: "Invalid breed name" }, { status: 400 });
  }

  // 3. Улучшенный промт для GPT
  const gptPrompt = `Предоставь информацию о породе собак "${breed}" в формате Markdown. Включи:
1. Краткое описание породы (3-5 предложений)
2. Основные черты характера и темперамента
3. Среднюю продолжительность жизни
4. Кликабельные ссылки на статьи в Википедии:
   - [Русская версия](https://ru.wikipedia.org/wiki/...)
   - [Украинская версия](https://uk.wikipedia.org/wiki/...)
5. Ссылку на изображение породы из Википедии в формате: ![${breed}](URL_изображения)
Если информация не найдена, напиши "Данные по породе ${breed} не найдены"`;

  // 4. Запрос к OpenAI с таймаутом
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // Увеличил таймаут

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      signal: controller.signal,
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1", // Обновил модель
        messages: [
          {
            role: "system",
            content:
              "Ты помощник, который предоставляет информацию о породах собак с ссылками на Википедию и изображениями.",
          },
          {
            role: "user",
            content: gptPrompt,
          },
        ],
        response_format: { type: "text" }, // Явно указываем текстовый ответ
      }),
    });
    clearTimeout(timeout);

    // 5. Обработка ответа
    if (!res.ok) {
      const errText = await res.text();
      console.error(`OpenAI API returned ${res.status}: ${errText}`);
      return NextResponse.json(
        { error: `OpenAI API error ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "Нет данных";
    // console.log(content);
    // 6. Извлекаем URL изображения из ответа
    const imageUrlMatch = content.match(/!\[.*?\]\((.*?)\)/);
    const imageUrl = imageUrlMatch ? imageUrlMatch[1] : null;
    console.log(imageUrl);

    return NextResponse.json({
      result: content,
      imageUrl: imageUrl, // Добавляем URL изображения в ответ
    });
  } catch (err: any) {
    clearTimeout(timeout);
    console.error("OpenAI fetch error:", err);
    const status = err.name === "AbortError" ? 504 : 500;
    return NextResponse.json(
      { error: err.message || "Failed to fetch from OpenAI" },
      { status }
    );
  }
}
