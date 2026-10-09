import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Meeting from '@/models/Meeting';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const meeting = await Meeting.findById(resolvedParams.id);
    if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(meeting);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch meeting' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const body = await req.json();
    const meeting = await Meeting.findByIdAndUpdate(resolvedParams.id, body, { new: true });
    return NextResponse.json({ success: true, meeting });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
  }
}
