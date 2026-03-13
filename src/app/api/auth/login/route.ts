import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Simple signed token: base64(timestamp):hmac
  const ts = Date.now().toString()
  const hmac = crypto.createHmac('sha256', process.env.ADMIN_PASSWORD!)
    .update(ts).digest('hex')
  return NextResponse.json({ token: `${ts}:${hmac}` })
}
