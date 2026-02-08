'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'

const NO_BUTTON_TEXTS = [
  'No',
  'Are you sure?',
  'Really?',
  'Think again!',
  'Last chance!',
  'Surely not?',
  'You might regret this!',
  'Please?',
]

export default function Home() {
  const router = useRouter()
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 })
  const [noButtonScale, setNoButtonScale] = useState(1)
  const [noButtonTextIndex, setNoButtonTextIndex] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const handleNoHover = () => {
    const maxX = window.innerWidth - 200
    const maxY = window.innerHeight - 100
    
    const newX = Math.random() * maxX - maxX / 2
    const newY = Math.random() * maxY - maxY / 2
    
    setNoButtonPosition({ x: newX, y: newY })
  }

  const handleNoClick = () => {
    const newScale = Math.max(noButtonScale - 0.15, 0.3)
    setNoButtonScale(newScale)
    
    const maxX = window.innerWidth - 200
    const maxY = window.innerHeight - 100
    const newX = Math.random() * maxX - maxX / 2
    const newY = Math.random() * maxY - maxY / 2
    setNoButtonPosition({ x: newX, y: newY })
    
    if (noButtonTextIndex < NO_BUTTON_TEXTS.length - 1) {
      setNoButtonTextIndex(noButtonTextIndex + 1)
    }
  }

  const handleYesClick = () => {
    setShowConfetti(true)
    setTimeout(() => {
      router.push('/letter')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative">
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

        {!showConfetti ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center min-h-[120px] relative">
            <button
              onClick={handleYesClick}
              className="px-12 py-4 bg-primary text-primary-foreground font-sans font-semibold text-lg rounded-lg hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 relative z-20"
            >
              Yes
            </button>

            <button
              onMouseEnter={handleNoHover}
              onClick={handleNoClick}
              className="px-12 py-4 bg-secondary text-secondary-foreground font-sans font-semibold text-lg rounded-lg hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 absolute sm:relative"
              style={{
                transform: `translate(${noButtonPosition.x}px, ${noButtonPosition.y}px) scale(${noButtonScale})`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              {NO_BUTTON_TEXTS[noButtonTextIndex]}
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <div className="bg-card px-12 py-8 rounded-lg shadow-xl inline-block">
              <Heart className="w-16 h-16 text-primary fill-primary mx-auto mb-4 animate-bounce" />
              <h2 className="font-serif text-3xl text-card-foreground mb-2">
                Yay!
              </h2>
              <p className="font-sans text-card-foreground/70">
                I knew you would say yes!
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <Heart
            key={i}
            className="absolute text-primary/20 fill-primary/20 animate-float"
            style={{
              width: Math.random() * 30 + 20,
              height: Math.random() * 30 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  )
}
