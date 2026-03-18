import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongodb'
import { ContactMessageModel } from '@/models/ContactMessage'

export async function GET() {
  try {
    await dbConnect()
    const msgs = await ContactMessageModel.find().sort({ createdAt: -1 }).limit(24).lean()
    return NextResponse.json(
      {
        messages: msgs.map((m) => ({
          id: String(m._id),
          name: m.name,
          message: m.message,
          createdAt: m.createdAt,
        })),
      },
      { status: 200 }
    )
  } catch {
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { name?: string; message?: string }
    const name = (body.name || '').trim()
    const message = (body.message || '').trim()

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 })

    await dbConnect()
    const created = await ContactMessageModel.create({ name, message })
    return NextResponse.json(
      { message: { id: String(created._id), name: created.name, message: created.message, createdAt: created.createdAt } },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

