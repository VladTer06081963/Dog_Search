"use client"

import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface WikipediaModalProps {
  breedName: string
  isOpen: boolean
  onClose: () => void
}

export function WikipediaModal({ breedName, isOpen, onClose }: WikipediaModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [content, setContent] = useState("")
  const [error, setError] = useState("")

  // Function to fetch Wikipedia content
  const fetchWikipediaContent = async () => {
    if (!isOpen) return

    setIsLoading(true)
    setError("")

    try {
      // In a real application, you would fetch actual Wikipedia content
      // This is a mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setContent(`
        <h1>${breedName}</h1>
        <p><strong>${breedName}</strong> - порода собак, которая имеет богатую историю и уникальные характеристики.</p>
        <p>Эта порода известна своим особенным характером и внешним видом. Собаки этой породы обычно отличаются преданностью своим хозяевам и хорошо поддаются дрессировке.</p>
        <h2>История породы</h2>
        <p>История породы ${breedName} насчитывает несколько столетий. Изначально эти собаки использовались для различных целей, включая охоту, охрану и выпас скота.</p>
        <p>С течением времени порода эволюционировала и приобрела те характеристики, которые мы знаем сегодня.</p>
        <h2>Характеристики</h2>
        <p>Собаки породы ${breedName} обычно обладают следующими характеристиками:</p>
        <ul>
          <li>Средний размер и вес</li>
          <li>Дружелюбный характер</li>
          <li>Высокий уровень интеллекта</li>
          <li>Хорошее здоровье и долголетие</li>
        </ul>
        <h2>Уход и содержание</h2>
        <p>Для поддержания здоровья и хорошего самочувствия собак породы ${breedName} необходимо обеспечить им правильное питание, регулярные физические нагрузки и своевременное медицинское обслуживание.</p>
        <p>Также важно уделять внимание социализации щенков с раннего возраста, чтобы они выросли уравновешенными и дружелюбными собаками.</p>
      `)
    } catch (err) {
      console.error("Error fetching Wikipedia content:", err)
      setError(`Не удалось загрузить информацию о породе ${breedName} из Википедии.`)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch content when modal opens
  useState(() => {
    if (isOpen) {
      fetchWikipediaContent()
    }
  })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Статья из Википедии: {breedName}</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>Полная информация о породе из Википедии</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Загрузка статьи...</span>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchWikipediaContent} className="mt-4">
              Попробовать снова
            </Button>
          </div>
        ) : (
          <div className="wikipedia-content prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Вернуться к поиску</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
