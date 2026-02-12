"use client"

import { useState, useCallback, useRef, useEffect } from "react"
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

interface FloatingHeart {
  id: number
  left: number
  top: number
  size: number
  delay: number
  duration: number
}

function generateHearts(count: number): FloatingHeart[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 12 + Math.random() * 18,
    delay: Math.random() * 8,
    duration: 3 + Math.random() * 4,
  }))
}

export default function Home() {
  const router = useRouter()
  const [noButtonMoved, setNoButtonMoved] = useState(false)
  const [noButtonOffset, setNoButtonOffset] = useState({ x: 0, y: 0 })
  const [noButtonScale, setNoButtonScale] = useState(1)
  const [noButtonTextIndex, setNoButtonTextIndex] = useState(0)
  const [hearts, setHearts] = useState<FloatingHeart[]>([])

  const noButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setHearts(generateHearts(20))
  }, [])
  const originalRect = useRef<{ left: number; top: number } | null>(null)

  const moveNoButton = useCallback(() => {
    if (!noButtonRef.current) return

    // Capture the button's original layout position on first move
    if (!originalRect.current) {
      const rect = noButtonRef.current.getBoundingClientRect()
      originalRect.current = { left: rect.left, top: rect.top }
    }

    const padding = 80
    const targetX = padding + Math.random() * (window.innerWidth - padding * 2)
    const targetY = padding + Math.random() * (window.innerHeight - padding * 2)

    setNoButtonOffset({
      x: targetX - originalRect.current.left,
      y: targetY - originalRect.current.top,
    })
    setNoButtonMoved(true)
  }, [])

  const handleNoHover = useCallback(() => {
    moveNoButton()
  }, [moveNoButton])

  const handleNoClick = useCallback(() => {
    moveNoButton()
    setNoButtonScale((prev) => Math.max(prev - 0.15, 0.3))
    setNoButtonTextIndex((prev) => Math.min(prev + 1, NO_BUTTON_TEXTS.length - 1))
  }, [moveNoButton])

  const handleYesClick = useCallback(() => {
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

        <div className="flex flex-row gap-6 justify-center items-center">
          <button
            ref={noButtonRef}
            type="button"
            onMouseEnter={handleNoHover}
            onClick={handleNoClick}
            className="px-12 py-4 bg-secondary text-secondary-foreground font-sans font-semibold text-lg rounded-lg hover:shadow-lg active:scale-95 duration-200 cursor-pointer relative z-10"
            style={{
              transform: noButtonMoved
                ? `translate(${noButtonOffset.x}px, ${noButtonOffset.y}px) scale(${noButtonScale})`
                : undefined,
              transition: noButtonMoved
                ? "transform 0.3s ease-out"
                : undefined,
            }}
          >
            {NO_BUTTON_TEXTS[noButtonTextIndex]}
          </button>

          <button
            type="button"
            onClick={handleYesClick}
            className="px-12 py-4 bg-primary text-primary-foreground font-sans font-semibold text-lg rounded-lg hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer relative z-30"
          >
            Yes
          </button>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute"
            style={{
              left: `${heart.left}%`,
              top: `${heart.top}%`,
              animation: `heartFade ${heart.duration}s ${heart.delay}s ease-in-out infinite`,
              opacity: 0,
            }}
          >
            <Heart
              className="text-primary fill-primary"
              style={{
                width: heart.size,
                height: heart.size,
                opacity: 0.5,
              }}
            />
          </div>
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes heartFade {
              0%, 100% {
                opacity: 0;
                transform: scale(0.8) rotate(-5deg);
              }
              50% {
                opacity: 1;
                transform: scale(1) rotate(5deg);
              }
            }
          `,
        }}
      />
    </main>
  )
}
