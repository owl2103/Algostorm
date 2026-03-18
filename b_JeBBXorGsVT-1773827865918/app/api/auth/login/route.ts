import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { dbConnect } from '@/lib/mongodb'
import { UserModel } from '@/models/User'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string }
    const email = (body.email || '').trim().toLowerCase()
    const password = body.password || ''

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    if (!password) return NextResponse.json({ error: 'Password is required' }, { status: 400 })

    await dbConnect()
    const user = await UserModel.findOne({ email })
    if (!user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    return NextResponse.json({ user: { name: user.name, email: user.email } }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

