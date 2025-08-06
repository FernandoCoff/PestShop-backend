import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: Buffer
  tel: string
  name: string,
  salt: Buffer
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: Buffer, required: true },
  tel: { type: String, required: true },
  name: { type: String, required: true },
  salt: { type: Buffer, required: true }
},{ timestamps: true})

export default mongoose.model<IUser>('User', UserSchema)
