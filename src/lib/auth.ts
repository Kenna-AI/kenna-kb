import crypto from 'crypto'
import { NextRequest } from 'next/server'

export function verifyToken(req: NextRequest): boolean {
  const token = req.headers.get('x-admin-token') || ''
  const [ts, hmac] = token.split(':')
  if (!ts || !hmac) return false
  const expected = crypto.createHmac('sha256', process.env.ADMIN_PASSWORD || '')
    .update(ts).digest('hex')
  if (hmac !== expected) return false
  // Token valid for 8 hours
  if (Date.now() - Number(ts) > 8 * 60 * 60 * 1000) return false
  return true
}
