"use client"

import { useState } from "react"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WikipediaModal } from "./wikipedia-modal"
import type { DogBreed } from "@/lib/dog-api"

interface DogBreedCardProps {
  breed: DogBreed
}

export function DogBreedCard({ breed }: DogBreedCardProps) {
  const [isWikiModalOpen, setIsWikiModalOpen] = useState(false)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">{breed.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-md h-64 overflow-hidden rounded-lg">
            <Image
              src={breed.imageUrl || "/placeholder.svg"}
              alt={
                breed.imageUrl
                  ? `Фото породы ${breed.name}` : "Заглушка — изображение не найдено"
              }
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p>
            <span className="font-semibold">Происхождение:</span> {breed.origin}
          </p>
          <p>
            <span className="font-semibold">Темперамент:</span>{" "}
            {breed.temperament}
          </p>
          <p>
            <span className="font-semibold">Продолжительность жизни:</span>{" "}
            {breed.lifeSpan}
          </p>
          <p>{breed.description}</p>
        </div>

        <div className="pt-2 text-right">
          <Button
            variant="link"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 p-0"
            onClick={() => setIsWikiModalOpen(true)}
          >
            Читать полную статью на Википедии
            <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>

      <WikipediaModal
        breedName={breed.name}
        isOpen={isWikiModalOpen}
        onClose={() => setIsWikiModalOpen(false)}
      />
    </Card>
  );
}
