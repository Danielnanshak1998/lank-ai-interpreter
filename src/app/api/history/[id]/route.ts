import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.translation.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Translation record not found' },
        { status: 404 }
      );
    }

    const record = await prisma.translation.update({
      where: { id },
      data: { saved: !existing.saved },
    });

    return NextResponse.json({ record });
  } catch (error) {
    console.error('PATCH /api/history/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update bookmark state' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.translation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/history/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete translation record' },
      { status: 500 }
    );
  }
}