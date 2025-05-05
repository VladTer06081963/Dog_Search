/** @format */

// app/api/wikipedia/route.ts

export async function POST(req: Request) {
  const { breed } = await req.json();
  const isRussian = /[а-яА-ЯёЁ]/.test(breed);
  const lang = isRussian ? "ru" : "en";
  const query = encodeURIComponent(breed.trim().replace(/ /g, "_"));
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${query}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Wiki error: ${res.status}`);

    const data = await res.json();

    return Response.json({
      result: data.extract || "Нет информации.",
      image: data.thumbnail?.source || null,
      title: data.title,
      url: data.content_urls?.desktop?.page,
    });
  } catch (err) {
    return Response.json(
      { result: `Ошибка при запросе к Википедии для породы "${breed}".` },
      { status: 500 }
    );
  }
}
