/** @format */

export async function POST(req: Request) {
  const { query } = await req.json();
  const isRussian = /[а-яА-ЯёЁ]/.test(query);
  const lang = isRussian ? "ru" : "en";
  const name = query.trim();

  try {
    // 1. Попытка найти в TheDogAPI
    const dogRes = await fetch(
      `https://api.thedogapi.com/v1/breeds/search?q=${encodeURIComponent(
        name
      )}`,
      {
        headers: {
          "x-api-key": process.env.DOG_API_KEY || "",
        },
      }
    );

    const dogData = await dogRes.json();

    if (dogData.length > 0) {
      const breed = dogData[0];

      const imageRes = await fetch(
        `https://api.thedogapi.com/v1/images/search?breed_ids=${breed.id}`,
        {
          headers: {
            "x-api-key": process.env.DOG_API_KEY || "",
          },
        }
      );

      const imageData = await imageRes.json();

      return Response.json({
        source: "dogapi",
        result: {
          title: breed.name,
          text: breed.bred_for || "Описание не указано",
          temperament: breed.temperament || "",
          lifeSpan: breed.life_span || "",
          image: imageData[0]?.url || null,
          url: null,
        },
      });
    }

    // 2. Fallback на Википедию
    const wikiQuery = encodeURIComponent(name.replace(/ /g, "_"));
    const wikiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${wikiQuery}`;
    const wikiRes = await fetch(wikiUrl);

    if (!wikiRes.ok) throw new Error(`Wikipedia error ${wikiRes.status}`);
    const wiki = await wikiRes.json();

    return Response.json({
      source: "wikipedia",
      result: {
        title: wiki.title,
        text: wiki.extract,
        temperament: "",
        lifeSpan: "",
        image: wiki.thumbnail?.source || null,
        url: wiki.content_urls?.desktop?.page || null,
      },
    });
  } catch (err) {
    console.error("Search API error:", err);
    return Response.json(
      { error: "Failed to fetch breed info" },
      { status: 500 }
    );
  }
}
