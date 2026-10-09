import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const feedback = await Feedback.find({ meetingId: resolvedParams.id }).sort({ createdAt: 1 });
    return NextResponse.json(feedback);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const body = await req.json();
    const feedback = await Feedback.create({ ...body, meetingId: resolvedParams.id });
    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 });
  }
}
