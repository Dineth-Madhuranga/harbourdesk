import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Meeting from '@/models/Meeting';

export async function GET() {
  try {
    await dbConnect();
    const meetings = await Meeting.find({}).sort({ date: -1, time: -1 });
    return NextResponse.json(meetings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const meeting = await Meeting.create(body);
    return NextResponse.json({ success: true, meeting });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}
