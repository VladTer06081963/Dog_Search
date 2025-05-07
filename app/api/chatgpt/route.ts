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

  // 3. Запрос к OpenAI с таймаутом
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      signal: controller.signal,
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [
          {
            role: "user",
            content: `Расскажи о породе собак, найди и выдай их названия в украинской и русской Википедии. Если таких названий нет — напиши «данних по породе нет: ${breed}».`,
          },
        ],
      }),
    });
    clearTimeout(timeout);

    // 4. Обработка не-200 статусов
    if (!res.ok) {
      const errText = await res.text();
      console.error(`OpenAI API returned ${res.status}: ${errText}`);
      return NextResponse.json(
        { error: `OpenAI API error ${res.status}` },
        { status: res.status }
      );
    }

    // 5. Успешный ответ
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "Нет данных";
    return NextResponse.json({ result: content });
  } catch (err: any) {
    clearTimeout(timeout);
    // 6. Таймаут или другая ошибка fetch
    console.error("OpenAI fetch error:", err);
    const status = err.name === "AbortError" ? 504 : 500;
    return NextResponse.json(
      { error: err.message || "Failed to fetch from OpenAI" },
      { status }
    );
  }
}
