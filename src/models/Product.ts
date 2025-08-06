import { Schema, model, Document } from 'mongoose'

export interface IProduct extends Document {
  title: string
  quantity: number
  description: string
  price: number
  category: string[]
  type: string[]
  brand: string
  available: boolean
  rating: number
  images: string[]
  createdAt: Date
  updatedAt: Date
}

// 2. O SCHEMA (o molde para o banco de dados)
const ProductSchema = new Schema({
  title: { type: String, required: true },
  quantity: { type: Number, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  brand: { type: String, required: true },
  available: { type: Boolean, required: true },
  rating: { type: Number, required: true },
  images: { type: [String], required: true },
  type: { type: [String], required: true },
  category: { type: [String], required: true }
},
{
  // Adiciona 'createdAt' e 'updatedAt' automaticamente
  timestamps: true,
})


const Product = model<IProduct>('Product', ProductSchema)

export default Product
