/** @format */

export async function POST(req: Request) {
  const { breed } = await req.json();
  const isRussian = /[а-яА-ЯёЁ]/.test(breed);
  const lang = isRussian ? "ru" : "en";
  const query = encodeURIComponent(breed.trim().replace(/ /g, "_"));

  try {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${query}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`Wikipedia error ${res.status}`);
    const data = await res.json();

    return Response.json({
      result: {
        title: data.title,
        text: data.extract,
        image: data.thumbnail?.source || null,
        url: data.content_urls?.desktop?.page || null,
      },
    });
  } catch (err) {
    console.error("Wikipedia API error:", err);
    return Response.json({ error: "Wikipedia fetch failed" }, { status: 500 });
  }
}
