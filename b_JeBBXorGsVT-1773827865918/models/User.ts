import mongoose, { Schema } from 'mongoose'

export type UserDoc = {
  name: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
)

export const UserModel = mongoose.models.User || mongoose.model<UserDoc>('User', UserSchema)

