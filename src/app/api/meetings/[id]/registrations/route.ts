import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Registration from '@/models/Registration';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const registrations = await Registration.find({ meetingId: resolvedParams.id }).sort({ createdAt: 1 });
    return NextResponse.json(registrations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const body = await req.json();
    const registration = await Registration.create({ ...body, meetingId: resolvedParams.id });
    return NextResponse.json({ success: true, registration });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 });
  }
}
