// Transcript with word-level timestamps (in seconds)
// Each entry: { word, start, end }
// Replace these placeholder timestamps with your actual timed transcript.
// The audio file should be placed at /public/audio/letter.mp3

export interface TranscriptWord {
  word: string
  start: number
  end: number
}

export interface TranscriptParagraph {
  words: TranscriptWord[]
}

// Helper to generate placeholder timestamps from the letter text.
// Replace this entire array with your real timed transcript data.
function generatePlaceholderTranscript(text: string): TranscriptParagraph[] {
  const paragraphs = text.split("\n\n")
  let currentTime = 0
  const WORD_DURATION = 0.35
  const PAUSE_BETWEEN_WORDS = 0.1
  const PAUSE_BETWEEN_PARAGRAPHS = 0.8

  return paragraphs.map((para) => {
    const rawWords = para.split(/\s+/).filter((w) => w.length > 0)
    const words: TranscriptWord[] = rawWords.map((word) => {
      const start = currentTime
      const end = start + WORD_DURATION
      currentTime = end + PAUSE_BETWEEN_WORDS
      return { word, start, end }
    })
    currentTime += PAUSE_BETWEEN_PARAGRAPHS
    return { words }
  })
}

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

export const transcript: TranscriptParagraph[] = generatePlaceholderTranscript(LETTER_TEXT)

// Total duration of the transcript
export const totalDuration =
  transcript.length > 0
    ? Math.max(...transcript.flatMap((p) => p.words.map((w) => w.end)))
    : 0
