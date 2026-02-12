import 'dotenv/config';
import fs from 'fs';
import OpenAI from 'openai';

const client = new OpenAI(); // Uses OPENAI_API_KEY from .env

async function transcribe() {
  console.log('Transcribing speech_ai.mp3...');
  
  const transcription = await client.audio.transcriptions.create({
    model: 'whisper-1',
    file: fs.createReadStream('recording.m4a'),
    response_format: 'verbose_json',
    timestamp_granularities: ['word'],
  });

  const output = {
    text: transcription.text,
    words: transcription.words,
  };

  fs.writeFileSync('public/audio/transcript.json', JSON.stringify(output, null, 2));
  console.log('Saved to public/audio/transcript.json');
}

transcribe().catch(console.error);

