/** @format */

"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface WikipediaModalProps {
  breedName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function WikipediaModal({
  breedName,
  isOpen,
  onClose,
}: WikipediaModalProps) {
  const [content, setContent] = useState("");

  // Mock function to generate test content
  const generateTestContent = () => {
    return `
      <h1 class="text-2xl font-bold mb-4">${breedName}</h1>
      
      <div class="mb-6">
        <img src="https://source.unsplash.com/random/600x400/?dog,${encodeURIComponent(
          breedName
        )}" 
             alt="${breedName}" 
             class="rounded-lg w-full h-64 object-cover mb-4">
        <p class="text-gray-600 text-sm">Изображение собаки породы ${breedName}</p>
      </div>
      
      <p class="mb-4"><strong>${breedName}</strong> — порода собак с богатой историей и уникальными характеристиками.</p>
      
      <h2 class="text-xl font-semibold mt-6 mb-3">История породы</h2>
      <p class="mb-4">Порода ${breedName} была выведена в XIX веке для охоты и охраны. Со временем эти собаки стали популярными компаньонами благодаря своему дружелюбному характеру.</p>
      
      <h2 class="text-xl font-semibold mt-6 mb-3">Характеристики</h2>
      <ul class="list-disc pl-5 mb-4 space-y-2">
        <li>Рост: 45-60 см в холке</li>
        <li>Вес: 15-30 кг</li>
        <li>Продолжительность жизни: 10-14 лет</li>
        <li>Окрас: разнообразный, чаще всего рыжий или черный</li>
      </ul>
      
      <h2 class="text-xl font-semibold mt-6 mb-3">Характер</h2>
      <p class="mb-4">Собаки породы ${breedName} известны своим умом, преданностью и энергичностью. Они хорошо ладят с детьми и другими животными.</p>
      
      <div class="bg-blue-50 p-4 rounded-lg mt-6">
        <h3 class="font-semibold text-blue-800 mb-2">Интересный факт</h3>
        <p>Порода ${breedName} была любимой породой нескольких известных исторических личностей, включая королеву Викторию.</p>
      </div>
      
      <p class="text-sm text-gray-500 mt-6">Это тестовая страница, имитирующая контент из Википедии. В реальном приложении здесь была бы информация, полученная из API Wikipedia.</p>
    `;
  };

  // Generate content when modal opens
  useEffect(() => {
    if (isOpen) {
      setContent(generateTestContent());
    }
  }, [isOpen, breedName]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Информация о породе: {breedName}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Подробная информация о породе собак
          </DialogDescription>
        </DialogHeader>

        <div
          className="wikipedia-content prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Закрыть</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// "use client"

// import { useState } from "react"
// import { X, Loader2 } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

// interface WikipediaModalProps {
//   breedName: string
//   isOpen: boolean
//   onClose: () => void
// }

// export function WikipediaModal({ breedName, isOpen, onClose }: WikipediaModalProps) {
//   const [isLoading, setIsLoading] = useState(true)
//   const [content, setContent] = useState("")
//   const [error, setError] = useState("")

//   // Function to fetch Wikipedia content
//   const fetchWikipediaContent = async () => {
//     if (!isOpen) return

//     setIsLoading(true)
//     setError("")

//     try {
//       // In a real application, you would fetch actual Wikipedia content
//       // This is a mock implementation
//       await new Promise((resolve) => setTimeout(resolve, 1500))

//       setContent(`
//         <h1>${breedName}</h1>
//         <p><strong>${breedName}</strong> - порода собак, которая имеет богатую историю и уникальные характеристики.</p>
//         <p>Эта порода известна своим особенным характером и внешним видом. Собаки этой породы обычно отличаются преданностью своим хозяевам и хорошо поддаются дрессировке.</p>
//         <h2>История породы</h2>
//         <p>История породы ${breedName} насчитывает несколько столетий. Изначально эти собаки использовались для различных целей, включая охоту, охрану и выпас скота.</p>
//         <p>С течением времени порода эволюционировала и приобрела те характеристики, которые мы знаем сегодня.</p>
//         <h2>Характеристики</h2>
//         <p>Собаки породы ${breedName} обычно обладают следующими характеристиками:</p>
//         <ul>
//           <li>Средний размер и вес</li>
//           <li>Дружелюбный характер</li>
//           <li>Высокий уровень интеллекта</li>
//           <li>Хорошее здоровье и долголетие</li>
//         </ul>
//         <h2>Уход и содержание</h2>
//         <p>Для поддержания здоровья и хорошего самочувствия собак породы ${breedName} необходимо обеспечить им правильное питание, регулярные физические нагрузки и своевременное медицинское обслуживание.</p>
//         <p>Также важно уделять внимание социализации щенков с раннего возраста, чтобы они выросли уравновешенными и дружелюбными собаками.</p>
//       `)
//     } catch (err) {
//       console.error("Error fetching Wikipedia content:", err)
//       setError(`Не удалось загрузить информацию о породе ${breedName} из Википедии.`)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Fetch content when modal opens
//   useState(() => {
//     if (isOpen) {
//       fetchWikipediaContent()
//     }
//   })

//   return (
//     <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
//       <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center justify-between">
//             <span>Статья из Википедии: {breedName}</span>
//             <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 p-0">
//               <X className="h-4 w-4" />
//             </Button>
//           </DialogTitle>
//           <DialogDescription>Полная информация о породе из Википедии</DialogDescription>
//         </DialogHeader>

//         {isLoading ? (
//           <div className="flex items-center justify-center py-12">
//             <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
//             <span className="ml-2 text-gray-500">Загрузка статьи...</span>
//           </div>
//         ) : error ? (
//           <div className="py-8 text-center">
//             <p className="text-red-500">{error}</p>
//             <Button onClick={fetchWikipediaContent} className="mt-4">
//               Попробовать снова
//             </Button>
//           </div>
//         ) : (
//           <div className="wikipedia-content prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
//         )}

//         <div className="mt-6 flex justify-end">
//           <Button onClick={onClose}>Вернуться к поиску</Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }
