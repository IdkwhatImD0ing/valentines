// Transcript type definitions
// The actual transcript data is loaded from /public/audio/transcript.json

export interface TranscriptWord {
  word: string
  start: number
  end: number
}

export interface TranscriptParagraph {
  words: TranscriptWord[]
}
