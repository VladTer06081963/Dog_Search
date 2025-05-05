/** @format */

"use client";

import { useState } from "react";
import { Search, Info, BookOpen, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRandomDogBreed, searchDogBreed } from "@/lib/dog-api";
import { DogBreedCard } from "@/components/dog-breed-card";
import { fetchBreedInfo } from "@/lib/fetch-breed-info";

export default function DogBreedSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("");
  const [breedInfo, setBreedInfo] = useState<any>(null);
  const [infoContent, setInfoContent] = useState("");
  const [activeSource, setActiveSource] = useState<
    "none" | "chatgpt" | "wikipedia"
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
        const breedData = await searchDogBreed(searchQuery);
        setBreedInfo(breedData);
        await fetchBreedInfo(
          searchQuery,
          "wikipedia",
          setInfoContent,
          setBreedInfo,
          setIsLoading,
          setActiveSource
        );
      } catch (error) {
        console.error("Ошибка поиска породы:", error);
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
      setBreedInfo(randomBreed);
      await fetchBreedInfo(
        randomBreed.name,
        "wikipedia",
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
        <aside className="w-64 bg-white border-r p-4 hidden md:block">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" /> Спросить ChatGPT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-3">
                Информация от ChatGPT
              </p>
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

        <div className="flex-1 flex flex-col">
          <div className="p-6 bg-white">
            <div className="max-w-xl mx-auto">
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Введите породу собаки"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  <Search className="h-4 w-4 mr-2" /> Поиск
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRandomBreed}
                  disabled={isSearching}
                >
                  Случайная порода
                </Button>
              </div>
            </div>
          </div>

          <div className="md:hidden border-t border-b">
            <Tabs defaultValue="search" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="search">Поиск</TabsTrigger>
                <TabsTrigger value="chatgpt">ChatGPT</TabsTrigger>
                <TabsTrigger value="wikipedia">Википедия</TabsTrigger>
              </TabsList>
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

          <div className="flex-1 p-4 overflow-auto">
            {isSearching ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Поиск породы...</p>
              </div>
            ) : breedInfo ? (
              <DogBreedCard breed={breedInfo} />
            ) : selectedBreed ? (
              <p className="text-center text-gray-500">Порода не найдена.</p>
            ) : (
              <p className="text-center text-gray-500">
                Введите породу для поиска
              </p>
            )}
          </div>
        </div>

        <aside className="w-64 bg-white border-l p-4 hidden md:block">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <BookOpen className="h-4 w-4 mr-2" /> Спросить Википедию
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-3">
                Информация из Википедии
              </p>
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
        </aside>
      </main>

      <footer className="bg-white border-t p-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <p className="text-center text-gray-500">Загрузка информации...</p>
          ) : infoContent ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" /> Информация о породе{" "}
                {selectedBreed}
                <span className="ml-2 text-xs text-gray-500">
                  (Источник:{" "}
                  {activeSource === "chatgpt" ? "ChatGPT" : "Википедия"})
                </span>
              </h3>
              <p className="text-sm whitespace-pre-line">{infoContent}</p>
            </div>
          ) : breedInfo ? (
            <p className="text-center text-gray-500">
              Выберите источник информации в боковой панели
            </p>
          ) : (
            <p className="text-center text-gray-500">Введите породу</p>
          )}
        </div>
      </footer>
    </div>
  );
}
