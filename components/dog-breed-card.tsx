/** @format */

"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DogBreed as BaseDogBreed } from "@/lib/dog-api";

interface ExtendedDogBreed extends BaseDogBreed {
  isMarkdown?: boolean;
  markdownContent?: string;
  wikiUrl?: string;
}

interface DogBreedCardProps {
  breed: ExtendedDogBreed;
}

function extractFileNameFromContent(content: string): string | null {
  const fileTag = content.match(/File:([^\]\)\n\r]+)/)?.[1];
  if (fileTag) return fileTag.trim();

  const pathMatch = content.match(/\/([\w\-]+\.(jpg|jpeg|png))/i);
  if (pathMatch) return pathMatch[1];

  return null;
}

export function DogBreedCard({ breed }: DogBreedCardProps) {
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);

  const isMarkdown =
    breed.isMarkdown || breed.origin === "ChatGPT" || !!breed.markdownContent;

  const contentToRender = breed.markdownContent || breed.description || "";
  const extractedFileName = extractFileNameFromContent(contentToRender);
  const containsMarkdownImage = /!\[.*?\]\((.*?)\)/.test(contentToRender);

  useEffect(() => {
    let isMounted = true;

    if (containsMarkdownImage) {
      console.log(
        "⛔ Пропускаем загрузку imageUrl — есть изображение в Markdown"
      );
      return () => {};
    }

    async function resolveImage() {
      if (breed.imageUrl) {
        setResolvedImageUrl(breed.imageUrl);
        return;
      }

      if (extractedFileName) {
        try {
          const res = await fetch(
            `/api/image-info?file=${encodeURIComponent(extractedFileName)}`
          );
          const data = await res.json();
          if (data.imageUrl && isMounted) {
            setResolvedImageUrl(data.imageUrl);
          }
        } catch (err) {
          console.warn("Ошибка загрузки изображения:", err);
        }
      }
    }

    resolveImage();

    return () => {
      isMounted = false;
    };
  }, [breed.imageUrl, extractedFileName, containsMarkdownImage]);

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{breed.name}</CardTitle>
        {breed.origin && (
          <p className="text-xs text-gray-500">Источник: {breed.origin}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {!containsMarkdownImage && resolvedImageUrl && (
          <div className="relative w-full h-64 overflow-hidden rounded-md">
            <img
              src={resolvedImageUrl}
              alt={breed.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.warn(
                  "🚫 Ошибка загрузки основного изображения:",
                  e.currentTarget.src
                );
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-medium">Описание</h3>
          {isMarkdown ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                p: ({ node, ...props }) => <p className="text-sm" {...props} />,
                img: ({ node, ...props }) => {
                  console.log("🖼️ Рендерим Markdown изображение:", props.src);

                  const handleError = (
                    e: React.SyntheticEvent<HTMLImageElement>
                  ) => {
                    const fallback = breed.imageUrl || "/placeholder.svg";

                    if (
                      !fallback ||
                      props.src === fallback ||
                      e.currentTarget.src === fallback ||
                      e.currentTarget.src.endsWith("placeholder.svg")
                    ) {
                      console.warn(
                        "♻️ Подставляем placeholder.svg — Markdown и fallback не помогли"
                      );
                      e.currentTarget.src = "/placeholder.svg";
                      return;
                    }

                    console.warn(
                      "🚫 Markdown img error:",
                      props.src,
                      "→ fallback:",
                      fallback
                    );
                    e.currentTarget.src = fallback;
                  };

                  return (
                    <img
                      {...props}
                      onError={handleError}
                      className="rounded-md max-w-full h-auto border border-gray-200 shadow-sm my-4"
                      alt={props.alt || ""}
                    />
                  );
                },
              }}
            >
              {contentToRender}
            </ReactMarkdown>
          ) : (
            <p className="text-sm whitespace-pre-line">{contentToRender}</p>
          )}
        </div>

        {breed.temperament && (
          <div>
            <h3 className="font-medium">Характер</h3>
            <p className="text-sm">{breed.temperament}</p>
          </div>
        )}

        {breed.lifeSpan && (
          <div>
            <h3 className="font-medium">Продолжительность жизни</h3>
            <p className="text-sm">{breed.lifeSpan}</p>
          </div>
        )}

        {breed.wikiUrl && (
          <div>
            <a
              href={breed.wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              Подробнее на Википедии
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
