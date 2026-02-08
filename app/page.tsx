'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'

const LETTER_TEXT = `My Dearest,

As I sit here with pen in hand, I find myself struggling to capture in words what my heart has known for so long. Yet, I must try.

There is something magical about the way you move through the world—a quiet grace that turns ordinary moments into memories I treasure. The way morning light catches in your eyes, how your laughter fills a room with warmth, the gentle way you listen when I speak.

I've memorized the small things: the way you think when you're lost in thought, how you hum softly when you're content, the peaceful silence we share that needs no words.

Time with you feels different—slower, deeper, more real. As if the universe pauses to let me notice every detail, every fleeting expression, every breath we share.

I wanted you to know that you are seen, you are cherished, and you are loved in ways that words will always struggle to express.

Forever yours`

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationRef = useRef<number | null>(null)

  const words = LETTER_TEXT.split(/(\s+)/)
  const WORDS_PER_SECOND = 2.5 // Slow, contemplative pace
  const totalDuration = words.filter(w => w.trim()).length / WORDS_PER_SECOND

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const startAnimation = () => {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100)
      setProgress(newProgress)

      const wordIndex = Math.floor((elapsed * WORDS_PER_SECOND))
      setCurrentWordIndex(wordIndex)

      if (elapsed < totalDuration) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsPlaying(false)
        setCurrentWordIndex(-1)
      }
    }
    animationRef.current = requestAnimationFrame(animate)
  }

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      // Reset if completed
      if (progress >= 100) {
        setProgress(0)
        setCurrentWordIndex(-1)
      }
    } else {
      setIsPlaying(true)
      if (progress >= 100) {
        setProgress(0)
        setCurrentWordIndex(-1)
      }
      startAnimation()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentTime = (progress / 100) * totalDuration
  const remainingTime = totalDuration - currentTime

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 cursor-default">
      <style jsx global>{`
        * {
          cursor: default !important;
        }
        body {
          cursor: default;
        }
      `}</style>
      
      <div className="w-full max-w-2xl">
        {/* Letter Card */}
        <div className="bg-card rounded-lg shadow-2xl p-8 md:p-12 relative overflow-hidden">
          {/* Subtle paper texture */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Letter Content */}
          <div className="relative">
            <div className="font-serif text-lg md:text-xl leading-relaxed text-card-foreground space-y-6">
              {LETTER_TEXT.split('\n\n').map((paragraph, pIndex) => {
                const paragraphWords = paragraph.split(/(\s+)/)
                const wordsBeforeParagraph = LETTER_TEXT.substring(
                  0,
                  LETTER_TEXT.indexOf(paragraph)
                ).split(/(\s+)/).filter(w => w.trim()).length

                return (
                  <p key={pIndex} className="text-balance">
                    {paragraphWords.map((word, wIndex) => {
                      const globalWordIndex = wordsBeforeParagraph + paragraphWords
                        .slice(0, wIndex)
                        .filter(w => w.trim()).length
                      const isActive = currentWordIndex >= globalWordIndex && word.trim()
                      const shouldHighlight = isPlaying && isActive

                      return (
                        <span
                          key={wIndex}
                          className={`transition-all duration-300 ${
                            shouldHighlight 
                              ? 'text-card-foreground' 
                              : isPlaying 
                                ? 'text-card-foreground/40' 
                                : 'text-card-foreground'
                          }`}
                        >
                          {word}
                        </span>
                      )
                    })}
                  </p>
                )
              })}
            </div>

            {/* Voiceover Controls */}
            <div className="mt-12 pt-8 border-t border-card-foreground/10">
              <div className="flex items-center gap-4">
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-primary/60 hover:border-primary hover:bg-primary/5 transition-all duration-300 flex items-center justify-center group"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-primary" fill="currentColor" />
                  ) : (
                    <Play className="w-5 h-5 text-primary ml-0.5" fill="currentColor" />
                  )}
                </button>

                {/* Progress Bar */}
                <div className="flex-1 space-y-2">
                  <div className="h-1 bg-secondary/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-sans text-card-foreground/50">
                    <span>{formatTime(currentTime)}</span>
                    <span>-{formatTime(remainingTime)}</span>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-sm font-sans text-card-foreground/60 text-center">
                Listen as the words come alive
              </p>
            </div>
          </div>
        </div>

        {/* Signature or Note */}
        <div className="mt-6 text-center">
          <p className="text-sm font-sans text-foreground/40">
            With all my heart
          </p>
        </div>
      </div>
    </div>
  )
}
