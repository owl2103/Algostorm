import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongodb'
import { UserModel } from '@/models/User'
import { ReportModel } from '@/models/Report'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const email = (url.searchParams.get('email') || '').trim().toLowerCase()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    await dbConnect()
    const userExists = await UserModel.findOne({ email }).lean()
    if (!userExists) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const reports = await ReportModel.find({ userEmail: email }).sort({ createdAt: -1 }).limit(30).lean()
    return NextResponse.json(
      {
        reports: reports.map((r) => ({
          id: String(r._id),
          userEmail: r.userEmail,
          record: r.record,
          topK: r.topK,
          result: r.result,
          createdAt: r.createdAt,
        })),
      },
      { status: 200 }
    )
  } catch {
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string
      record?: Record<string, unknown>
      topK?: number
      result?: { disease: string; probability: number }[]
    }
    const email = (body.email || '').trim().toLowerCase()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    if (!body.record) return NextResponse.json({ error: 'Record is required' }, { status: 400 })
    if (!body.result || body.result.length === 0) return NextResponse.json({ error: 'Result is required' }, { status: 400 })
    const topK = Number(body.topK || body.result.length)

    await dbConnect()
    const userExists = await UserModel.findOne({ email }).lean()
    if (!userExists) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const created = await ReportModel.create({
      userEmail: email,
      record: body.record,
      topK,
      result: body.result,
    })

    return NextResponse.json({ id: String(created._id) }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 })
  }
}

