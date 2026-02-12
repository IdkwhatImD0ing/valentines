"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { Play, Pause, RotateCcw } from "lucide-react"
import { transcript, totalDuration, type TranscriptParagraph } from "@/lib/transcript"

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
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

export function VoiceoverLetterContent() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [hasEnded, setHasEnded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationRef = useRef<number | null>(null)

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
      if (!audioRef.current) return
      const rect = e.currentTarget.getBoundingClientRect()
      const ratio = (e.clientX - rect.left) / rect.width
      const newTime = ratio * totalDuration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
      setHasEnded(false)
    },
    []
  )

  const activeWord = getActiveWordIndex(transcript, currentTime)
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  return (
    <>
      {/* Hidden audio element - replace src with your audio file */}
      <audio ref={audioRef} src="/audio/letter.mp3" onEnded={handleEnded} preload="auto" />

      {/* Letter card with highlighted words */}
      <div className="w-full max-w-2xl">
        <div className="bg-card rounded-lg shadow-2xl p-8 md:p-12 relative overflow-hidden">
          {/* Paper texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative text-base md:text-lg leading-relaxed space-y-5" style={{ fontFamily: "var(--font-cursive)" }}>
            {transcript.map((paragraph, pIndex) => (
              <p
                key={pIndex}
                className={`text-balance ${pIndex === 0 ? "text-xl md:text-2xl font-semibold" : ""}`}
              >
                {paragraph.words.map((wordObj, wIndex) => {
                  const spoken = isWordSpoken(transcript, pIndex, wIndex, currentTime)
                  const isActive =
                    activeWord !== null &&
                    activeWord.paragraphIndex === pIndex &&
                    activeWord.wordIndex === wIndex

                  return (
                    <span
                      key={wIndex}
                      className="relative inline-block"
                    >
                      {/* Ghost text for layout - always present but invisible */}
                      <span className="text-card-foreground/20">
                        {wordObj.word}
                      </span>
                      {/* Revealed text with writing animation */}
                      {spoken && (
                        <span
                          className={`absolute inset-0 ${
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
                      {wIndex < paragraph.words.length - 1 ? " " : ""}
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

        <p className="mt-6 pb-24 text-center text-sm font-sans text-foreground/40">
          Yours, always
        </p>
      </div>

      {/* Floating fixed playback bar - rendered via portal to avoid scroll container issues */}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="fixed bottom-0 left-0 right-0" style={{ zIndex: 9999 }}>
            <div className="bg-card/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
              <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
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

            {/* Progress bar */}
            <div className="flex-1 space-y-1">
              <div
                className="h-1.5 bg-border rounded-full overflow-hidden cursor-pointer"
                onClick={handleProgressClick}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full bg-primary rounded-full transition-[width] duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-sans text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
