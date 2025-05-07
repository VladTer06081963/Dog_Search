/** @format */
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. Распарсим тело и попробуем прочитать явный lang
  const body = (await req.json()) as {
    breed: string;
    lang?: string;
  };
  const { breed } = body;

  // 2. Определяем язык:
  //    - если передан явно — используем его;
  //    - иначе, если есть украинские буквы — 'uk';
  //    - иначе, если есть русские буквы — 'ru';
  //    - во всех остальных случаях — 'en' (дефолт).
  let lang = body.lang;
  if (!lang) {
    if (/[ҐЄІЇґєії]/.test(breed)) {
      lang = "uk";
    } else if (/[а-яА-ЯёЁ]/.test(breed)) {
      lang = "ru";
    } else {
      lang = "en";
    }
  }

  // 3. Подготовим slug для URL
  const query = encodeURIComponent(breed.trim().replace(/ /g, "_"));

  try {
    // 4. Формируем REST API вызов к нужной Википедии
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${query}`;
    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      console.error(`Wikipedia ${lang} API error ${res.status}:`, text);
      return NextResponse.json(
        { error: `Wikipedia ${lang} fetch failed (${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      result: {
        title: data.title,
        text: data.extract,
        image: data.thumbnail?.source || null,
        url: data.content_urls?.desktop?.page || null,
      },
    });
  } catch (err: any) {
    console.error("Wikipedia fetch error:", err);
    return NextResponse.json(
      { error: err.message || "Wikipedia fetch failed" },
      { status: 500 }
    );
  }
}

// export async function POST(req: Request) {
//   const { breed } = await req.json();
//   const isRussian = /[а-яА-ЯёЁ]/.test(breed);
//   const lang = isRussian ? "ru" : "en";
//   const query = encodeURIComponent(breed.trim().replace(/ /g, "_"));

//   try {
//     const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${query}`;
//     const res = await fetch(url);

//     if (!res.ok) throw new Error(`Wikipedia error ${res.status}`);
//     const data = await res.json();

//     return Response.json({
//       result: {
//         title: data.title,
//         text: data.extract,
//         image: data.thumbnail?.source || null,
//         url: data.content_urls?.desktop?.page || null,
//       },
//     });
//   } catch (err) {
//     console.error("Wikipedia API error:", err);
//     return Response.json({ error: "Wikipedia fetch failed" }, { status: 500 });
//   }
// }
