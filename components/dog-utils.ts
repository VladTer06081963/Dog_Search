/** @format */

// components/dog-utils.ts

// Импортируй только то, что нужно
export const breedWhitelist = [
  "шпиц",
  "spitz",
  "лайка",
  "laika",
  "дог",
  "dog",
  "булдог",
  "bulldog",
  "терьер",
  "terrier",
  "пинчер",
  "pinscher",
  "пудель",
  "poodle",
  "корги",
  "corgi",
  "колли",
  "collie",
  "овчарка",
  "shepherd",
  "мастиф",
  "mastiff",
  "чихуахуа",
  "chihuahua",
  "бигль",
  "beagle",
  "акита",
  "akita",
  "ретривер",
  "retriever",
  "лабрадор",
  "labrador",
  "хаски",
  "husky",
  "такса",
  "dachshund",
  "доберман",
  "doberman",
  "шарпей",
  "sharpei",
  "самоед",
  "samoyed",
  "шелти",
  "sheltie",
  "мопс",
  "pug",
  "грейхаунд",
  "greyhound",
  "сенбернар",
  "saint bernard",
  "спаниель",
  "spaniel",
];

export function isValidDogExtract(name: string, extract: string) {
  const normalized = name.toLowerCase();
  const extractText = extract?.toLowerCase() || "";

  const hasDogKeywords = /собак|порода|охота|дичь|canine|breed|dog/i.test(
    extractText
  );
  const isNameWhitelisted = breedWhitelist.includes(normalized);

  return hasDogKeywords || isNameWhitelisted;
}

// Кэш на уровне модуля
let cacheData: any[] | null = null;

export async function searchBreedCache(query: string) {
  if (!cacheData) {
    try {
      const url = `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/dog_breeds_cache.json`;
      const res = await fetch(url);
      const json = await res.json();
      cacheData = json.breeds || json;
    } catch (err) {
      console.error("🐞 Не удалось загрузить кеш из public:", err);
      return null;
    }
  }

  // ⛑️ Добавим защиту
  if (!cacheData) return null;

  const breed = cacheData.find(
    (b) => b.name.toLowerCase() === query.toLowerCase()
  );

  if (!breed) return null;

  return {
    title: breed.name,
    text: breed.bred_for || breed.description || "Описание не указано",
    temperament: breed.temperament || "",
    lifeSpan: breed.life_span || "",
    image: breed.image_url || null,
    url: breed.wikipedia_url || null,
  };
}


// // components/dog-utils.ts

// import { readFile } from "fs/promises";
// import path from "path";
// import { fileURLToPath } from "url";

// // Получаем путь к dog_breeds_cashe.json
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const cachePath = path.resolve(__dirname, "../data/dog_breeds_cache.json");

// // Whitelist — имена, которые могут быть неоднозначными
// export const breedWhitelist = [
//   "шпиц",
//   "spitz",
//   "лайка",
//   "laika",
//   "дог",
//   "dog",
//   "булдог",
//   "bulldog",
//   "терьер",
//   "terrier",
//   "пинчер",
//   "pinscher",
//   "пудель",
//   "poodle",
//   "корги",
//   "corgi",
//   "колли",
//   "collie",
//   "овчарка",
//   "shepherd",
//   "мастиф",
//   "mastiff",
//   "чихуахуа",
//   "chihuahua",
//   "бигль",
//   "beagle",
//   "акита",
//   "akita",
//   "ретривер",
//   "retriever",
//   "лабрадор",
//   "labrador",
//   "хаски",
//   "husky",
//   "такса",
//   "dachshund",
//   "доберман",
//   "doberman",
//   "шарпей",
//   "sharpei",
//   "самоед",
//   "samoyed",
//   "шелти",
//   "sheltie",
//   "мопс",
//   "pug",
//   "грейхаунд",
//   "greyhound",
//   "сенбернар",
//   "saint bernard",
//   "спаниель",
//   "spaniel",
// ];

// // Проверка, содержит ли extract признаки описания породы собаки
// export function isValidDogExtract(name: string, extract: string) {
//   const normalized = name.toLowerCase();
//   const extractText = extract?.toLowerCase() || "";

//   const hasDogKeywords = /собак|порода|охота|дичь|canine|breed|dog/i.test(
//     extractText
//   );
//   const isNameWhitelisted = breedWhitelist.includes(normalized);

//   return hasDogKeywords || isNameWhitelisted;
// }

// // Поиск в локальной базе
// export async function searchBreedCache(query: string) {
//   const rawData = await readFile(cachePath, "utf-8");
//   const json = JSON.parse(rawData);

//   const breed = json.breeds.find(
//     (b: any) => b.name.toLowerCase() === query.toLowerCase()
//   );

//   if (!breed) return null;

//   return {
//     title: breed.name,
//     text: breed.bred_for || breed.description || "Описание не указано",
//     temperament: breed.temperament || "",
//     lifeSpan: breed.life_span || "",
//     image: breed.image_url || null,
//     url: breed.wikipedia_url || null,
//   };
// }
