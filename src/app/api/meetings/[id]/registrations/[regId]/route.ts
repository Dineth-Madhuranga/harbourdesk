import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Registration from '@/models/Registration';

export async function PUT(req: Request, { params }: { params: Promise<{ regId: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const body = await req.json();
    const registration = await Registration.findByIdAndUpdate(
      resolvedParams.regId,
      { checkedIn: body.checkedIn },
      { new: true }
    );
    return NextResponse.json({ success: true, registration });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
  }
}
