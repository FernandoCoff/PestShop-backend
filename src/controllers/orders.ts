import OrdersDataAccess from '../dataAccess/Orders'
import { ok, notFound, serverError } from '../helpers/httpResponse'

type OrdemItem = {
  id: string
  quantity: number
}


type OrderType = {
  client: string
  orderItems: OrdemItem[]
  shippingAddress: object
  payment: object
}


export default class OrdersControllers {

  private dataAccess : OrdersDataAccess

  constructor(){
    this.dataAccess  = new OrdersDataAccess()
  }

  async addOrder(order : OrderType){
    try{
      const neworder = await this.dataAccess.addOrder(order)
      return ok(neworder)

    }catch(error){
      if (error instanceof Error) {
        return serverError(error.message)
      }
      return notFound('Ocorreu um erro inesperado ao efetuar a compra!')
    }
  }

  async getOrdersAll() {
    try{
      const orders = await this.dataAccess.getOrdersAll()
      return ok(orders)

    }catch(error){
      if (error instanceof Error) {
        return serverError(error.message)
      }
      return notFound('Ocorreu um erro inesperado ao buscar os pedidos!')
    }
  }

  async getOrdersActive() {
    try{
      const orders = await this.dataAccess.getOrdersActive()
      return ok(orders)

    }catch(error){
      if (error instanceof Error) {
        return serverError(error.message)
      }
      return serverError('Ocorreu um erro inesperado ao buscar os pedidos!')
    }
  }

  async updateOrder(orderId : string, orderData : object) {
    try{
      const result = await this.dataAccess.updateOrder(orderId, orderData)
      return ok({message: 'Dados do Produto atualizados com sucesso!'})

    }catch(error){
      if (error instanceof Error) {
        return serverError(error.message)
      }
      return serverError('Erro ao atualizar Produto!')
    }
  }
}
