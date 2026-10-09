import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Account from '@/models/Account';

const HR_CREDENTIALS = { username: 'admin@potcity.com', password: 'admin@1234' };

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { username, password, role } = body;

    if (role === 'admin') {
      if (username === HR_CREDENTIALS.username && password === HR_CREDENTIALS.password) {
        return NextResponse.json({ success: true, user: { role: 'admin', username } });
      } else {
        return NextResponse.json({ error: 'Incorrect username or password' }, { status: 401 });
      }
    } else {
      const account = await Account.findOne({ username, password });
      if (account && account.active !== false) {
        return NextResponse.json({
          success: true,
          user: { role: 'dept', username, department: account.department, email: account.email }
        });
      } else {
        return NextResponse.json({ error: 'Incorrect credentials, or the account is inactive' }, { status: 401 });
      }
    }
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
