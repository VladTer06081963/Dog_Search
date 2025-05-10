/** @format */

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const { breed } = await req.json();
  if (!breed || typeof breed !== "string") {
    return NextResponse.json({ error: "Invalid breed name" }, { status: 400 });
  }

  const prompt = `
Ты — эксперт по собакам. Дай ответ на **русском языке** в формате следующего JSON:

{
  "markdown": "...описание породы в Markdown...",
  "imageWikiFile": "Файл_изображения.jpg"
}

📌 Поле "markdown" должно включать:

- Заголовок: ## Название породы
- Краткое описание (3–5 предложений)
- Темперамент и характер
- Среднюю продолжительность жизни
- **Ссылки на Википедию**:
  - [Русская версия](https://ru.wikipedia.org/wiki/...)
  - [Украинская версия](https://uk.wikipedia.org/wiki/...)
  - [Английская версия](https://en.wikipedia.org/wiki/...)

⚠️ Не вставляй изображение в markdown. Файл изображения верни отдельно в поле "imageWikiFile" (только имя файла, без File: и URL).

Ответ строго в JSON. Без пояснений, комментариев или текста вокруг.
`;

//   const prompt = `
// Дай информацию о породе собак "${breed}" в формате JSON:

// {
//   "markdown": "...описание в формате Markdown...",
//   "imageWikiFile": "Название_файла.jpg"
// }

// 📌 Правила:
// - Поле "markdown" должно содержать заголовок, описание, темперамент, продолжительность жизни, ссылки на Википедию — всё в Markdown.
// - Поле "imageWikiFile" должно содержать только имя файла изображения на Википедии (без File: и без URL).
// - Не вставляй изображение в markdown. Только JSON-структура.
// - Ответ строго в JSON-формате. Никаких пояснений, комментариев, текста вокруг.
// `;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content:
              "Ты помощник, который возвращает JSON-ответы без лишнего текста.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("GPT error:", errorText);
      return NextResponse.json(
        { error: "GPT request failed" },
        { status: 500 }
      );
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content;

    let parsed: { markdown: string; imageWikiFile?: string };
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("❌ GPT вернул невалидный JSON:", raw);
      return NextResponse.json(
        { error: "Invalid JSON from GPT" },
        { status: 500 }
      );
    }

    const { markdown, imageWikiFile } = parsed;

    let imageUrl: string | null = null;
    if (imageWikiFile) {
      try {
        const wikiRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(
            imageWikiFile
          )}&prop=imageinfo&iiprop=url&format=json&origin=*`
        );
        const wikiData = await wikiRes.json();
        const pages = wikiData?.query?.pages;
        const page = pages[Object.keys(pages)[0]];
        imageUrl = page?.imageinfo?.[0]?.url || null;
      } catch (e) {
        console.warn("⚠️ Ошибка получения imageinfo от Википедии:", e);
      }
    }

    return NextResponse.json({ markdown, imageUrl });
  } catch (error) {
    console.error("❌ Общая ошибка запроса:", error);
    return NextResponse.json(
      { error: "Failed to fetch from ChatGPT" },
      { status: 500 }
    );
  }
}

// /** @format */

// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   // 1. Проверка API-ключа
//   const apiKey = process.env.OPENAI_API_KEY;
//   if (!apiKey) {
//     console.error("OPENAI_API_KEY is not set");
//     return NextResponse.json(
//       { error: "Server configuration error: API key is missing" },
//       { status: 500 }
//     );
//   }

//   // 2. Разбор и валидация тела запроса
//   let breedData: { breed?: unknown };
//   try {
//     breedData = await req.json();
//   } catch {
//     return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
//   }

//   const { breed } = breedData;
//   if (typeof breed !== "string" || !breed.trim() || breed.length > 100) {
//     return NextResponse.json({ error: "Invalid breed name" }, { status: 400 });
//   }

//   // 3. Промт с генерацией markdown + картинки
//   const gptPrompt = `Предоставь информацию о породе собак "${breed}" в формате Markdown. Включи:
// 1. Краткое описание породы (3-5 предложений)
// 2. Основные черты характера и темперамента
// 3. Среднюю продолжительность жизни
// 4. Ссылки на статьи в Википедии:
//    - [Русская версия](https://ru.wikipedia.org/wiki/...)
//    - [Украинская версия](https://uk.wikipedia.org/wiki/...)
// 5. Markdown-изображение: ![${breed}](https://...)

// Только рабочие изображения с:
// - https://cdn2.thedogapi.com
// - https://upload.wikimedia.org
// - https://images.unsplash.com

// Не вставляй ссылки с File: или Wikimedia Commons в формате "File:..."`;

//   // 4. Таймаут и вызов OpenAI
//   const controller = new AbortController();
//   const timeout = setTimeout(() => controller.abort(), 15000);

//   try {
//     const res = await fetch("https://api.openai.com/v1/chat/completions", {
//       signal: controller.signal,
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${apiKey}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "gpt-4-turbo",
//         messages: [
//           {
//             role: "system",
//             content:
//               "Ты помощник, который предоставляет информацию о породах собак с ссылками и изображениями.",
//           },
//           {
//             role: "user",
//             content: gptPrompt,
//           },
//         ],
//         temperature: 0.7,
//       }),
//     });

//     clearTimeout(timeout);

//     if (!res.ok) {
//       const errText = await res.text();
//       console.error(`OpenAI API returned ${res.status}: ${errText}`);
//       return NextResponse.json(
//         { error: `OpenAI API error ${res.status}` },
//         { status: res.status }
//       );
//     }

//     const data = await res.json();
//     const content = data.choices?.[0]?.message?.content || "Нет данных";

//     const imageUrlMatch = content.match(/!\[.*?\]\((.*?)\)/);
//     const imageUrl = imageUrlMatch ? imageUrlMatch[1] : null;
//     console.log("🐶 Сгенерировано изображение:", imageUrl);

//     return NextResponse.json({
//       markdown: content,
//       imageUrl,
//     });
//   } catch (err: any) {
//     clearTimeout(timeout);
//     console.error("❌ OpenAI fetch error:", err);
//     const status = err.name === "AbortError" ? 504 : 500;
//     return NextResponse.json(
//       { error: err.message || "Failed to fetch from OpenAI" },
//       { status }
//     );
//   }
// }
