/** @format */
"use client";

import { useState } from "react";
import { Search, Info, BookOpen, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DogBreedCard } from "@/components/dog-breed-card";
import { getRandomDogBreed, searchDogBreed } from "@/lib/dog-api";
import { fetchBreedInfo } from "@/lib/fetch-breed-info";
import { BreedDirectory } from "@/components/BreedDirectory";

export default function DogBreedSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("");
  const [breedInfo, setBreedInfo] = useState<any>(null);
  const [infoContent, setInfoContent] = useState("");
  const [activeSource, setActiveSource] = useState<
    "none" | "wikipedia" | "chatgpt" | "dogapi"
  >("none");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      setSelectedBreed(searchQuery);
      setInfoContent("");
      setActiveSource("none");

      try {
        await fetchBreedInfo(
          searchQuery,
          "default",
          setInfoContent,
          setBreedInfo,
          setIsLoading,
          setActiveSource
        );
      } catch (err) {
        console.error("Ошибка поиска породы:", err);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleRandomBreed = async () => {
    setIsSearching(true);
    setInfoContent("");
    setActiveSource("none");

    try {
      const randomBreed = await getRandomDogBreed();
      setSearchQuery(randomBreed.name);
      setSelectedBreed(randomBreed.name);
      await fetchBreedInfo(
        randomBreed.name,
        "default",
        setInfoContent,
        setBreedInfo,
        setIsLoading,
        setActiveSource
      );
    } catch (error) {
      console.error("Ошибка случайной породы:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold text-center">Поиск пород собак</h1>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Левая панель (только на десктопе) */}
        <aside className="w-64 bg-white border-r p-4 hidden md:block">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Спросить ChatGPT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={
                  !selectedBreed || (activeSource === "chatgpt" && isLoading)
                }
                onClick={() =>
                  fetchBreedInfo(
                    selectedBreed,
                    "chatgpt",
                    setInfoContent,
                    setBreedInfo,
                    setIsLoading,
                    setActiveSource
                  )
                }
              >
                {isLoading && activeSource === "chatgpt"
                  ? "Загрузка..."
                  : "Спросить ChatGPT"}
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Центральная часть */}
        <div className="flex-1 flex flex-col">
          {/* Поисковая строка и кнопки */}
          <div className="p-6 bg-white">
            <div className="max-w-xl mx-auto flex flex-col gap-3">
              <Input
                placeholder="Введите породу собаки"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full"
              />
              <div className="flex gap-2 justify-between">
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="flex-1"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Поиск
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRandomBreed}
                  disabled={isSearching}
                  className="flex-1"
                >
                  Случайная порода
                </Button>
              </div>
            </div>
          </div>

          {/* Вкладки на мобилке */}
          <div className="md:hidden border-t border-b">
            <Tabs defaultValue="search" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="search">Поиск</TabsTrigger>
                <TabsTrigger value="chatgpt">ChatGPT</TabsTrigger>
                <TabsTrigger value="wikipedia">Википедия</TabsTrigger>
              </TabsList>

              {/* Вкладка Поиск — здесь нужно вставить каталог пород */}
              <TabsContent value="search" className="p-4">
                <BreedDirectory
                  onSelect={(breedName) => {
                    setSearchQuery(breedName);
                    handleSearch();
                  }}
                />
              </TabsContent>

              <TabsContent value="chatgpt" className="p-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={
                    !selectedBreed || (activeSource === "chatgpt" && isLoading)
                  }
                  onClick={() =>
                    fetchBreedInfo(
                      selectedBreed,
                      "chatgpt",
                      setInfoContent,
                      setBreedInfo,
                      setIsLoading,
                      setActiveSource
                    )
                  }
                >
                  {isLoading && activeSource === "chatgpt"
                    ? "Загрузка..."
                    : "Спросить ChatGPT"}
                </Button>
              </TabsContent>

              <TabsContent value="wikipedia" className="p-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={
                    !selectedBreed ||
                    (activeSource === "wikipedia" && isLoading)
                  }
                  onClick={() =>
                    fetchBreedInfo(
                      selectedBreed,
                      "wikipedia",
                      setInfoContent,
                      setBreedInfo,
                      setIsLoading,
                      setActiveSource
                    )
                  }
                >
                  {isLoading && activeSource === "wikipedia"
                    ? "Загрузка..."
                    : "Спросить Википедию"}
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          {/* Карточка результата */}
          <div className="flex-1 p-4 overflow-auto">
            {isSearching ? (
              <p className="text-center text-gray-500">Поиск породы...</p>
            ) : breedInfo ? (
              <DogBreedCard breed={breedInfo} />
            ) : selectedBreed ? (
              <p className="text-center text-gray-500">Порода не найдена.</p>
            ) : (
              <p className="text-center text-gray-500 text-sm max-w-md mx-auto">
                🐶 Введите название породы или выберите из{" "}
                <strong>каталога</strong>. <br />
                🐕 Нажмите <strong>Поиск</strong> или выберите{" "}
                <strong>Случайную породу</strong>.<br />
                📚 Хотите больше информации? Спросите <strong>
                  Википедию
                </strong>{" "}
                или 🤖 <strong>ChatGPT</strong> — просто нажмите соответствующую
                кнопку!
              </p>
            )}
          </div>
        </div>

        {/* Правая панель (только на десктопе) */}
        <aside className="w-64 bg-white border-l p-4 hidden md:flex flex-col gap-6">
          {/* Википедия */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Спросить Википедию
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={
                  !selectedBreed || (activeSource === "wikipedia" && isLoading)
                }
                onClick={() =>
                  fetchBreedInfo(
                    selectedBreed,
                    "wikipedia",
                    setInfoContent,
                    setBreedInfo,
                    setIsLoading,
                    setActiveSource
                  )
                }
              >
                {isLoading && activeSource === "wikipedia"
                  ? "Загрузка..."
                  : "Спросить Википедию"}
              </Button>
            </CardContent>
          </Card>

          {/* Каталог пород */}
          <BreedDirectory
            onSelect={(breedName) => {
              setSearchQuery(breedName);
              setSelectedBreed(breedName);
              fetchBreedInfo(
                breedName,
                "default",
                setInfoContent,
                setBreedInfo,
                setIsLoading,
                setActiveSource
              );
            }}
          />
        </aside>
      </main>

      <footer className="bg-white border-t p-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <p className="text-center text-gray-500">Загрузка информации...</p>
          ) : infoContent ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Информация о породе {selectedBreed}
                <span className="ml-2 text-xs text-gray-500">
                  (Источник: {activeSource})
                </span>
              </h3>
              <p className="text-sm whitespace-pre-line">{infoContent}</p>
            </div>
          ) : breedInfo ? (
            <p className="text-center text-gray-500">
              Выберите источник информации
            </p>
          ) : (
            <p className="text-center text-gray-500">Введите породу</p>
          )}
        </div>
      </footer>
    </div>
  );
}
