"use client";
//добавим серверный кеш /+
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Breed = { id: number; name: string };

interface BreedDirectoryProps {
  onSelect: (name: string) => void;
}

export function BreedDirectory({ onSelect }: BreedDirectoryProps) {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Добавлено состояние загрузки

  useEffect(() => {
    const fetchBreeds = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/breeds");
        const data = await res.json();
        setBreeds(data);
        console.log(setBreeds(data));
      } catch (err) {
        console.error("Ошибка загрузки пород:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBreeds();
  }, []);

  if (isLoading) {
    return (
      <div className="mt-6">
        <h4 className="text-sm font-semibold mb-2">Каталог пород</h4>
        <div className="max-h-64 overflow-y-auto space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Button
              key={i}
              variant="ghost"
              className="w-full justify-start text-left text-sm"
              disabled
            >
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold mb-2">Каталог пород</h4>
      <div className="max-h-64 overflow-y-auto space-y-1">
        {breeds.map((breed) => (
          <Button
            key={breed.id}
            variant="ghost"
            className="w-full justify-start text-left text-sm"
            onClick={() => onSelect(breed.name)}
          >
            {breed.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
