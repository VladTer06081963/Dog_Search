"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Breed = { id: number; name: string };

interface BreedDirectoryProps {
  onSelect: (name: string) => void;
}

export function BreedDirectory({ onSelect }: BreedDirectoryProps) {
  const [breeds, setBreeds] = useState<Breed[]>([]);

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const res = await fetch("/api/breeds");
        const data = await res.json();
        setBreeds(data);
      } catch (err) {
        console.error("Ошибка загрузки пород:", err);
      }
    };

    fetchBreeds();
  }, []);

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
