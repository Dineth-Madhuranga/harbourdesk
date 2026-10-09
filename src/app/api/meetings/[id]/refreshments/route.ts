import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Refreshment from '@/models/Refreshment';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    let refreshments = await Refreshment.findOne({ meetingId: resolvedParams.id });
    if (!refreshments) {
      refreshments = await Refreshment.create({ meetingId: resolvedParams.id, items: [] });
    }
    return NextResponse.json(refreshments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch refreshments' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const body = await req.json();
    const refreshments = await Refreshment.findOneAndUpdate(
      { meetingId: resolvedParams.id },
      { items: body.items },
      { new: true, upsert: true }
    );
    return NextResponse.json({ success: true, refreshments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update refreshments' }, { status: 500 });
  }
}
