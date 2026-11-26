import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const records = await prisma.translation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ records });
  } catch (error) {
    console.error('GET /api/history error:', error);
    return NextResponse.json(
      { error: 'Failed to load translation history' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sourceText,
      translatedText,
      sourceLang,
      targetLang,
      engineUsed,
      latencyMs,
    } = body;

    if (!sourceText || !translatedText || !sourceLang || !targetLang) {
      return NextResponse.json(
        { error: 'Missing required translation fields' },
        { status: 400 }
      );
    }

    const record = await prisma.translation.create({
      data: {
        sourceText: String(sourceText),
        translatedText: String(translatedText),
        sourceLang: String(sourceLang),
        targetLang: String(targetLang),
        engineUsed: engineUsed ? String(engineUsed) : null,
        latencyMs: typeof latencyMs === 'number' ? Math.round(latencyMs) : null,
        saved: false,
      },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error('POST /api/history error:', error);
    return NextResponse.json(
      { error: 'Failed to save translation record' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.translation.deleteMany({});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/history error:', error);
    return NextResponse.json(
      { error: 'Failed to clear translation history' },
      { status: 500 }
    );
  }
}