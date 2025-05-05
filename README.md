# 🐶 Dog Breed Search App

Приложение на Next.js для поиска информации о породах собак. Использует:

- [TheDogAPI](https://thedogapi.com/) — поиск по базе пород и изображений (англ.)
- Wikipedia API — fallback, если порода введена на русском или не найдена
- ChatGPT (OpenAI API) — для получения описания породы от ИИ

## 🚀 Функциональность

- 🔍 Поиск по названию породы (на русском или английском)
- 🐕 Получение информации из Dog API, Wikipedia или ChatGPT
- 🎲 Кнопка случайной породы
- 📱 Поддержка мобильной и десктопной версии
- ⚡ Быстрый переключатель между источниками

## 🛠️ Установка и запуск

```bash
git clone https://github.com/your-username/dog-breed-search.git
cd dog-breed-search
npm install
