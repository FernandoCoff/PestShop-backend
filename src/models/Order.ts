import { Schema, model, Document, Types } from 'mongoose'


export interface IOrderItem extends Document {
  product: Types.ObjectId // ID DO PRODUTO
  title: string
  quantity: number
  price: number
}

export interface IOrder extends Document {
  client: Types.ObjectId // ID DO CLIENTE
  items: IOrderItem[]
  status: 'Pendente' | 'Processando' | 'Enviado' | 'Entregue' | 'Cancelado'
  totalAmount: number
  shippingAddress: {
    street: string
    city: string
    postalCode: string
    state: string
    country: string
  }
  payment: {
    method: string
    status: 'Pendente' | 'Pago' | 'Falhou'
  }
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema({
  client: { type: Object, required: true },
  orderItems: { type: [Object] },
  status: {
    type: String,
    enum: ['Pendente', 'Processando', 'Enviado', 'Entregue', 'Cancelado'],
    default: 'Pendente',
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
  },
  payment: {
    method: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pendente', 'Pago', 'Falhou'],
      default: 'Pendente',
    },
  },
}, {
  // Esta opção adiciona os campos 'createdAt' e 'updatedAt' automaticamente.
  // Exatamente como você tinha na sua interface!
  timestamps: true,
})

export const Order = model<IOrder>('Order', OrderSchema)
export default Order
