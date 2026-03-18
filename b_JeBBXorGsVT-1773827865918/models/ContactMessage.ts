import mongoose, { Schema } from 'mongoose'

export type ContactMessageDoc = {
  name: string
  message: string
  createdAt: Date
  updatedAt: Date
}

const ContactMessageSchema = new Schema<ContactMessageDoc>(
  {
    name: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
)

export const ContactMessageModel =
  mongoose.models.ContactMessage || mongoose.model<ContactMessageDoc>('ContactMessage', ContactMessageSchema)

