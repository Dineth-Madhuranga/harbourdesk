import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Account from '@/models/Account';

export async function PUT(req: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const body = await req.json();
    const account = await Account.findOneAndUpdate(
      { username: resolvedParams.username },
      { active: body.active },
      { new: true }
    ).select('-password');
    return NextResponse.json({ success: true, account });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}
