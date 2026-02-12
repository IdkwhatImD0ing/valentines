"use client"

import { useState, useEffect } from "react"

const LETTER_TEXT = `Hey Emily,

I originally wanted to write this in Chinese.
Then I realized... my skill was not up to par. So for everyone's sake, we're sticking to English.
But if effort counts, just know I did consider it. :)

I've been thinking about how a bunch of small, random moments turned into something that feels important to me.

Like the Renaissance Fair.
Our first full day date. Watching you try on all the little accessories, completely in your own world. I remember just standing there, feeling strangely content, thinking you looked really happy. And really, really cute.

Then Yosemite.
A 9-hour hike that I was fully convinced I couldn't finish. Somewhere along the way my legs felt done, and I remember wondering if I'd overestimated myself. But we kept going anyway, just staying with it, step after step, and somehow we made it to the end. I don't think I would've finished that hike the same way without you there.

And that night, lying under the stars, talking about random things while looking at the stars. It didn't feel that long, but when we finally checked the time, two hours had somehow passed without either of us noticing. It didn't feel that long. It just felt easy. Quiet. Peaceful in a way that's hard to put into words.

And it's not just the big adventures.
It's cooking together for the first time and acting like we were professionals.
It's sitting on the couch watching our c drama and enjoying the action scenes.
It's the small, ordinary moments that don't feel ordinary when they're with you.

We're different in a lot of ways, and I don't pretend to know exactly what the future looks like. I just know that what we have feels real to me, and being with you makes me happy in a way that's steady and easy.

That's enough for me.`

function FloatingHeart({ delay, left, size }: { delay: number; left: number; size: number }) {
  return (
    <div
      className="absolute bottom-0 pointer-events-none"
      style={{
        left: `${left}%`,
        animation: `floatUp ${3 + Math.random() * 2}s ${delay}s ease-out forwards, sway ${2 + Math.random()}s ${delay}s ease-in-out infinite`,
        opacity: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="#E7AEB4"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>
  )
}

export default function LetterPage() {
  const [phase, setPhase] = useState<"closed" | "opening" | "open" | "letter">("closed")

  useEffect(() => {
    // Auto-start the envelope opening sequence
    const t1 = setTimeout(() => setPhase("opening"), 600)
    const t2 = setTimeout(() => setPhase("open"), 1200)
    const t3 = setTimeout(() => setPhase("letter"), 3500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Envelope container */}
      <div
        className="relative transition-all duration-1000 ease-in-out"
        style={{
          transform: phase === "letter" ? "translateY(-40px) scale(0.9)" : "translateY(0)",
          opacity: phase === "letter" ? 0 : 1,
        }}
      >
        {/* Envelope wrapper */}
        <div className="relative" style={{ width: 280, height: 180 }}>
          {/* Shadow behind envelope */}
          <div
            className="absolute rounded-b-md"
            style={{
              width: 280,
              height: 180,
              backgroundColor: "#b8937a",
              boxShadow: "0 4px 20px rgba(0,0,0,.2)",
            }}
          />

          {/* Letter inside envelope */}
          <div
            className="absolute left-1/2 rounded-md"
            style={{
              width: "90%",
              height: "90%",
              top: "5%",
              transform: `translateX(-50%) ${
                phase === "open" || phase === "letter" ? "translateY(-60px)" : "translateY(0)"
              }`,
              backgroundColor: "#FFF8F0",
              boxShadow: "0 2px 26px rgba(0,0,0,.12)",
              transition: "transform 0.4s 0.6s ease",
              zIndex: phase === "open" || phase === "letter" ? 2 : 1,
            }}
          >
            {/* Letter lines */}
            <div className="absolute left-[15%] right-[15%] top-[15%] h-[6%] bg-[#E5E7EB] rounded-sm" />
            <div className="absolute left-[15%] right-[15%] top-[30%] h-[6%] bg-[#E5E7EB] rounded-sm" />
            <div className="absolute left-[15%] right-[30%] top-[45%] h-[6%] bg-[#E5E7EB] rounded-sm" />
            <div className="absolute left-[15%] right-[15%] top-[60%] h-[6%] bg-[#E5E7EB] rounded-sm" />
          </div>

          {/* Envelope front face */}
          <div
            className="absolute rounded-b-md"
            style={{
              width: 280,
              height: 180,
              backgroundColor: "#E7AEB4",
              zIndex: 4,
              clipPath: "polygon(0 0, 50% 50%, 100% 0, 100% 100%, 0 100%)",
              borderBottomLeftRadius: 6,
              borderBottomRightRadius: 6,
            }}
          />

          {/* Envelope flap (triangle) */}
          <div
            className="absolute top-0 left-0"
            style={{
              width: 0,
              height: 0,
              borderLeft: "140px solid transparent",
              borderRight: "140px solid transparent",
              borderTop: "100px solid #c4878f",
              transformOrigin: "top center",
              transform:
                phase === "opening" || phase === "open" || phase === "letter"
                  ? "rotateX(180deg)"
                  : "rotateX(0deg)",
              transition: "transform 0.4s ease",
              zIndex: phase === "opening" || phase === "open" || phase === "letter" ? 1 : 5,
            }}
          />
        </div>
      </div>

      {/* Floating hearts - rendered outside envelope so they stay visible */}
      {(phase === "open" || phase === "letter") && (
        <div
          className="fixed pointer-events-none"
          style={{
            left: "50%",
            top: "50%",
            width: 280,
            height: 180,
            transform: "translate(-50%, -50%)",
            zIndex: 50,
          }}
        >
          <FloatingHeart delay={0.1} left={15} size={24} />
          <FloatingHeart delay={0.3} left={40} size={32} />
          <FloatingHeart delay={0.2} left={65} size={20} />
          <FloatingHeart delay={0.6} left={30} size={28} />
          <FloatingHeart delay={0.5} left={55} size={22} />
          <FloatingHeart delay={0.8} left={20} size={18} />
          <FloatingHeart delay={0.4} left={75} size={26} />
          <FloatingHeart delay={0.7} left={50} size={30} />
          <FloatingHeart delay={0.9} left={10} size={20} />
        </div>
      )}

      {/* Letter content that fades in */}
      <div
        className="fixed inset-0 overflow-y-auto transition-all duration-1000 ease-in-out"
        style={{
          opacity: phase === "letter" ? 1 : 0,
          transform: phase === "letter" ? "translateY(0)" : "translateY(60px)",
          pointerEvents: phase === "letter" ? "auto" : "none",
          zIndex: 60,
        }}
      >
        <div className="min-h-full flex items-start justify-center py-8 px-4">
          <div className="w-full max-w-2xl">
            <div className="bg-card rounded-lg shadow-2xl p-8 md:p-12 relative overflow-hidden">
              {/* Paper texture overlay */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
                }}
              />

              <div className="relative font-serif text-lg md:text-xl leading-relaxed text-card-foreground space-y-6">
                {LETTER_TEXT.split("\n\n").map((paragraph, i) => (
                  <p key={i} className={`text-balance ${i === 0 ? "text-2xl md:text-3xl font-medium" : ""}`}>
                    {paragraph}
                  </p>
                ))}
              </div>

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
        </div>
      </div>

      {/* Keyframes */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes floatUp {
              0% { opacity: 0; transform: translateY(0); }
              20% { opacity: 1; }
              100% { opacity: 0; transform: translateY(-250px); }
            }
            @keyframes sway {
              0%, 100% { margin-left: 0; }
              50% { margin-left: 30px; }
            }
          `,
        }}
      />
    </div>
  )
}
