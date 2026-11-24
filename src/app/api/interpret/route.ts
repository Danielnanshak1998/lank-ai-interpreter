import { NextResponse } from 'next/server';
import { translateText } from '../../../lib/translator';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const rawText = formData.get('text') as string | null;
    const sourceLang = (formData.get('sourceLang') as string) || 'en';
    const targetLang = (formData.get('targetLang') as string) || 'ha';

    let transcribedText = rawText || '';

    // If audio is provided, send to Whisper (simulated / endpoint)
    if (audioFile) {
      // In production: forward audioBuffer to OpenAI Whisper API
      transcribedText = "Sample transcribed speech from voice input.";
    }

    if (!transcribedText) {
      return NextResponse.json({ error: "No audio or text provided" }, { status: 400 });
    }

    // Run multi-engine translation cascade
    const result = await translateText(transcribedText, sourceLang, targetLang);

    return NextResponse.json({
      transcript: transcribedText,
      translation: result.translation,
      engineUsed: result.engineUsed,
      latencyMs: result.latencyMs
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
