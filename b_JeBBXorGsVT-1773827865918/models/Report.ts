import mongoose, { Schema } from 'mongoose'

export type ReportDoc = {
  userEmail: string
  record: Record<string, unknown>
  topK: number
  result: { disease: string; probability: number }[]
  createdAt: Date
  updatedAt: Date
}

const ReportSchema = new Schema<ReportDoc>(
  {
    userEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    record: { type: Schema.Types.Mixed, required: true },
    topK: { type: Number, required: true },
    result: {
      type: [{ disease: { type: String, required: true }, probability: { type: Number, required: true } }],
      required: true,
    },
  },
  { timestamps: true }
)

export const ReportModel = mongoose.models.Report || mongoose.model<ReportDoc>('Report', ReportSchema)

