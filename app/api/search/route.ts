/** @format */

import { searchBreedCache, isValidDogExtract } from "@/components/dog-utils";

export async function POST(req: Request) {
  const { query } = await req.json();
  const name = query.trim();

  const isLatin = /^[a-z\s]+$/i.test(name);
  const isUkrainian = /[ґєії]/i.test(name);
  const isRussian = /[а-яё]/i.test(name);

  try {
    if (isLatin) {
      const localMatch = await searchBreedCache(name);
      if (localMatch) {
        return Response.json({
          source: "local_cache",
          result: localMatch,
        });
      }
      return await fetchFromWikipedia(name, "en");
    }

    if (isUkrainian) {
      return await fetchFromWikipedia(name, "uk");
    }

    if (isRussian) {
      const ruResult = await fetchFromWikipedia(name, "ru", false);
      if (ruResult) return ruResult;

      return await fetchFromWikipedia(name, "uk");
    }

    return await fetchFromWikipedia(name, "en");
  } catch (err) {
    console.error("Search API error:", err);
    return Response.json(
      { error: "Failed to fetch breed info" },
      { status: 500 }
    );
  }
}

// Поиск в Википедии с фильтром
async function fetchFromWikipedia(
  name: string,
  lang: string,
  throwOnFail = true,
  validateContent = true
) {
  const wikiQuery = encodeURIComponent(name.replace(/ /g, "_"));
  const wikiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${wikiQuery}`;
  const wikiRes = await fetch(wikiUrl);

  if (!wikiRes.ok) {
    if (throwOnFail) throw new Error(`Wikipedia error ${wikiRes.status}`);
    return null;
  }

  const wiki = await wikiRes.json();

  if (validateContent && !isValidDogExtract(name, wiki.extract)) {
    return Response.json(
      {
        error: "Похоже, вы ввели не название породы собаки.",
      },
      { status: 400 }
    );
  }

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
}
