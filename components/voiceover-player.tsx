"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { Play, Pause, RotateCcw } from "lucide-react"
import type { TranscriptWord, TranscriptParagraph } from "@/lib/transcript"

interface TranscriptData {
  text: string
  words: TranscriptWord[]
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// Convert flat word array into paragraphs by detecting pauses > 0.5s
function wordsToParagraphs(words: TranscriptWord[]): TranscriptParagraph[] {
  if (words.length === 0) return []
  
  const paragraphs: TranscriptParagraph[] = []
  let currentParagraph: TranscriptWord[] = []
  const PAUSE_THRESHOLD = 0.5 // seconds
  
  for (let i = 0; i < words.length; i++) {
    currentParagraph.push(words[i])
    
    // Check if there's a pause before the next word
    if (i < words.length - 1) {
      const gap = words[i + 1].start - words[i].end
      if (gap > PAUSE_THRESHOLD) {
        paragraphs.push({ words: currentParagraph })
        currentParagraph = []
      }
    }
  }
  
  // Push the last paragraph
  if (currentParagraph.length > 0) {
    paragraphs.push({ words: currentParagraph })
  }
  
  return paragraphs
}

function getActiveWordIndex(
  paragraphs: TranscriptParagraph[],
  currentTime: number
): { paragraphIndex: number; wordIndex: number } | null {
  for (let p = 0; p < paragraphs.length; p++) {
    for (let w = 0; w < paragraphs[p].words.length; w++) {
      const word = paragraphs[p].words[w]
      if (currentTime >= word.start && currentTime < word.end) {
        return { paragraphIndex: p, wordIndex: w }
      }
    }
  }
  return null
}

function isWordSpoken(
  paragraphs: TranscriptParagraph[],
  pIndex: number,
  wIndex: number,
  currentTime: number
): boolean {
  const word = paragraphs[pIndex].words[wIndex]
  return currentTime >= word.start
}

export function VoiceoverLetterContent({ phase }: { phase: "closed" | "opening" | "open" | "letter" }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [hasEnded, setHasEnded] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptParagraph[]>([])
  const [totalDuration, setTotalDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationRef = useRef<number | null>(null)

  // Fetch transcript on mount
  useEffect(() => {
    fetch("/audio/transcript.json")
      .then((res) => res.json())
      .then((data: TranscriptData) => {
        // Merge punctuated text tokens with word timestamps
        const textTokens = data.text.split(/\s+/)
        const wordsWithPunctuation = data.words.map((w, i) => ({
          ...w,
          word: textTokens[i] ?? w.word,
        }))
        const paragraphs = wordsToParagraphs(wordsWithPunctuation)
        setTranscript(paragraphs)
        
        // Calculate total duration from the last word's end time
        if (data.words.length > 0) {
          const lastWord = data.words[data.words.length - 1]
          setTotalDuration(lastWord.end)
        }
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load transcript:", err)
        setIsLoading(false)
      })
  }, [])

  const syncTime = useCallback(() => {
    if (audioRef.current && isPlaying) {
      setCurrentTime(audioRef.current.currentTime)
      animationRef.current = requestAnimationFrame(syncTime)
    }
  }, [isPlaying])

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(syncTime)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, syncTime])

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return

    if (hasEnded) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
      setHasEnded(false)
      audioRef.current.play()
      setIsPlaying(true)
      return
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [isPlaying, hasEnded])

  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    setHasEnded(true)
  }, [])

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!audioRef.current || totalDuration === 0) return
      const rect = e.currentTarget.getBoundingClientRect()
      // Vertical progress bar: bottom = 0%, top = 100%
      const ratio = 1 - (e.clientY - rect.top) / rect.height
      const newTime = Math.max(0, Math.min(ratio, 1)) * totalDuration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
      setHasEnded(false)
    },
    [totalDuration]
  )

  const activeWord = getActiveWordIndex(transcript, currentTime)
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl flex items-center justify-center py-20">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} src="/audio/letter.mp3" onEnded={handleEnded} preload="auto" />

      {/* Letter card with highlighted words */}
      <div className="w-full max-w-4xl">
        <div className="bg-card rounded-lg shadow-2xl p-10 md:p-16 relative overflow-hidden">
          {/* Paper texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative text-2xl md:text-3xl leading-relaxed space-y-7" style={{ fontFamily: "var(--font-cursive)" }}>
            {transcript.map((paragraph, pIndex) => (
              <p
                key={pIndex}
                className={`text-balance ${pIndex === 0 ? "text-3xl md:text-5xl font-semibold" : ""}`}
              >
                {paragraph.words.map((wordObj, wIndex) => {
                  const spoken = isWordSpoken(transcript, pIndex, wIndex, currentTime)
                  const isActive =
                    activeWord !== null &&
                    activeWord.paragraphIndex === pIndex &&
                    activeWord.wordIndex === wIndex

                  const spacer = wIndex < paragraph.words.length - 1 ? " " : ""

                  return (
                    <span key={wIndex}>
                      <span className="relative inline-block">
                        {/* Ghost text for layout - always present but faded */}
                        <span className="text-card-foreground/20">
                          {wordObj.word}
                        </span>
                        {/* Revealed text with writing animation */}
                        {spoken && (
                          <span
                            className={`absolute left-0 top-0 ${
                              isActive ? "text-[#C0616E]" : "text-card-foreground"
                            }`}
                            style={{
                              animation: isActive ? "strokeReveal 0.35s ease-out forwards" : undefined,
                              clipPath: spoken && !isActive ? "inset(0 0 0 0)" : undefined,
                            }}
                          >
                            {wordObj.word}
                          </span>
                        )}
                      </span>
                      {spacer}
                    </span>
                  )
                })}
              </p>
            ))}
          </div>

          {/* Writing animation keyframes */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @keyframes strokeReveal {
                  0% {
                    clip-path: inset(0 100% 0 0);
                  }
                  100% {
                    clip-path: inset(0 0 0 0);
                  }
                }
              `,
            }}
          />

          <div className="mt-10 flex justify-center">
            <svg
              width={40}
              height={40}
              viewBox="0 0 24 24"
              fill="#E7AEB4"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>

        <p className="mt-6 pb-8 text-center text-sm font-sans text-foreground/40">
          Yours, always
        </p>
      </div>

      {/* Floating right-side playback control - rendered via portal */}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed flex flex-col items-center gap-3 transition-all duration-1000 ease-in-out"
            style={{
              right: 16,
              top: "50%",
              transform: phase === "letter" ? "translateY(-50%) translateX(0)" : "translateY(-50%) translateX(80px)",
              opacity: phase === "letter" ? 1 : 0,
              pointerEvents: phase === "letter" ? "auto" : "none",
              zIndex: 9999,
            }}
          >
            <div className="bg-card/90 backdrop-blur-md border border-border rounded-full shadow-lg px-2 py-3 flex flex-col items-center gap-3">
              {/* Play / Pause / Replay */}
              <button
                type="button"
                onClick={togglePlayback}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-center cursor-pointer"
                aria-label={hasEnded ? "Replay" : isPlaying ? "Pause" : "Play"}
              >
                {hasEnded ? (
                  <RotateCcw className="w-4 h-4 text-primary" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 text-primary" fill="currentColor" />
                ) : (
                  <Play className="w-4 h-4 text-primary ml-0.5" fill="currentColor" />
                )}
              </button>

              {/* Current time */}
              <span className="text-[10px] font-sans text-muted-foreground leading-none">
                {formatTime(currentTime)}
              </span>

              {/* Vertical progress bar */}
              <div
                className="w-1.5 bg-border rounded-full overflow-hidden cursor-pointer relative"
                style={{ height: 120 }}
                onClick={handleProgressClick}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {/* Fill from bottom */}
                <div
                  className="absolute bottom-0 left-0 w-full bg-primary rounded-full transition-[height] duration-100"
                  style={{ height: `${progress}%` }}
                />
              </div>

              {/* Total duration */}
              <span className="text-[10px] font-sans text-muted-foreground leading-none">
                {formatTime(totalDuration)}
              </span>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
