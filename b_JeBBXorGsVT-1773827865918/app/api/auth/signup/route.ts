import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { dbConnect } from '@/lib/mongodb'
import { UserModel } from '@/models/User'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { name?: string; email?: string; password?: string }
    const name = (body.name || '').trim()
    const email = (body.email || '').trim().toLowerCase()
    const password = body.password || ''

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    await dbConnect()
    const exists = await UserModel.findOne({ email }).lean()
    if (exists) return NextResponse.json({ error: 'Email already exists' }, { status: 409 })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await UserModel.create({ name, email, passwordHash })

    return NextResponse.json({ user: { name: user.name, email: user.email } }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}

