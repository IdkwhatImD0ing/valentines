"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"

const NO_BUTTON_TEXTS = [
  "No",
  "Are you sure?",
  "Really?",
  "Think again!",
  "Last chance!",
  "Surely not?",
  "You might regret this!",
  "Please?",
]

export default function Home() {
  const router = useRouter()
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 })
  const [noButtonScale, setNoButtonScale] = useState(1)
  const [noButtonTextIndex, setNoButtonTextIndex] = useState(0)

  const handleNoHover = useCallback(() => {
    const maxX = window.innerWidth - 200
    const maxY = window.innerHeight - 100
    const newX = Math.random() * maxX - maxX / 2
    const newY = Math.random() * maxY - maxY / 2
    setNoButtonPosition({ x: newX, y: newY })
  }, [])

  const handleNoClick = useCallback(() => {
    const maxX = window.innerWidth - 200
    const maxY = window.innerHeight - 100
    const newX = Math.random() * maxX - maxX / 2
    const newY = Math.random() * maxY - maxY / 2
    setNoButtonPosition({ x: newX, y: newY })
    setNoButtonScale((prev) => Math.max(prev - 0.15, 0.3))
    setNoButtonTextIndex((prev) => Math.min(prev + 1, NO_BUTTON_TEXTS.length - 1))
  }, [])

  const handleYesClick = useCallback(() => {
    console.log("[v0] Yes clicked - navigating now")
    window.location.href = "/letter"
  }, [])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative">
      <div className="text-center relative z-10">
        <div className="flex justify-center mb-8 animate-pulse">
          <Heart className="w-20 h-20 text-primary fill-primary" />
        </div>

        <h1 className="font-serif text-4xl md:text-6xl text-foreground mb-4 text-balance">
          Will you be my Valentine?
        </h1>

        <p className="font-sans text-lg text-foreground/70 mb-12">
          I promise to make it worth your while
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center min-h-[120px] relative">
          <button
            type="button"
            onClick={handleYesClick}
            className="px-12 py-4 bg-primary text-primary-foreground font-sans font-semibold text-lg rounded-lg hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 relative z-20 cursor-pointer"
          >
            Yes
          </button>

          <button
            type="button"
            onMouseEnter={handleNoHover}
            onClick={handleNoClick}
            className="px-12 py-4 bg-secondary text-secondary-foreground font-sans font-semibold text-lg rounded-lg hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 absolute sm:relative cursor-pointer"
            style={{
              transform: `translate(${noButtonPosition.x}px, ${noButtonPosition.y}px) scale(${noButtonScale})`,
              transition: "transform 0.3s ease-out",
            }}
          >
            {NO_BUTTON_TEXTS[noButtonTextIndex]}
          </button>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${(i * 8.3) % 100}%`,
              top: `${(i * 7.7 + 10) % 100}%`,
              animation: `heartFloat ${12 + i * 2}s ${i * 0.8}s linear infinite`,
            }}
          >
            <Heart
              className="text-primary/15 fill-primary/15"
              style={{
                width: 20 + (i % 4) * 8,
                height: 20 + (i % 4) * 8,
              }}
            />
          </div>
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes heartFloat {
              0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0;
              }
              10% {
                opacity: 0.3;
              }
              90% {
                opacity: 0.3;
              }
              100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
              }
            }
          `,
        }}
      />
    </main>
  )
}
