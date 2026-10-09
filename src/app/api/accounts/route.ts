import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Account from '@/models/Account';

export async function GET() {
  try {
    await dbConnect();
    const accounts = await Account.find({}).sort({ department: 1 }).select('-password');
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const existing = await Account.findOne({ username: body.username });
    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }
    const account = await Account.create(body);
    return NextResponse.json({ success: true, account });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
