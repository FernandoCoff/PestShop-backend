import Order from "../models/Order"
import Product, { IProduct } from "../models/Product" // Assumindo que IProduct foi criada
import User from "../models/User"

// Tipos para a requisição e para o documento final do pedido
type OrdemItemRequest = {
  id: string
  quantity: number
}

type OrderItemFinal = {
  product: string
  name: string
  price: number
  quantity: number
}

type OrderType = {
  client: string
  orderItems: OrdemItemRequest[]
  shippingAddress: object
  payment: object
}

export default class OrdersDataAccess {

  /**
   * Adiciona um novo pedido ao banco de dados de forma segura e eficiente.
   * A lógica valida o cliente, busca os produtos para garantir preços e nomes corretos,
   * e calcula o valor total no backend para evitar manipulação.
   */
  async addOrder(order: OrderType) {
    const { client: clientId, payment, shippingAddress, orderItems: itemsFromRequest } = order

    // --- 1. Buscando dados essenciais em paralelo para maior performance ---
    // Usamos Promise.all para executar a busca do usuário e dos produtos simultaneamente,
    // economizando tempo de espera de I/O (entrada/saída) do banco de dados.
    const productIds = itemsFromRequest.map(item => item.id)

    const [user, productsFromDB] = await Promise.all([
      User.findById(clientId).exec(),
      Product.find({ '_id': { $in: productIds } }).exec()
    ])

    // --- 2. Validações críticas de integridade dos dados ---
    if (!user) {
      throw new Error(`O cliente com ID ${clientId} não foi encontrado`)
    }

    // Comparamos os IDs para garantir que todos os produtos solicitados existem no banco.
    if (productsFromDB.length !== productIds.length) {
      const foundIds = new Set(productsFromDB.map(p => p.id.toString()))
      const missingIds = productIds.filter(id => !foundIds.has(id))
      throw new Error(`Os seguintes produtos não foram encontrados: ${missingIds.join(', ')}`)
    }

    // --- 3. Processamento eficiente dos dados e cálculo do total ---
    // Criamos um 'Mapa' de quantidades para uma busca rápida (O(1)) em vez de usar 'find'
    // dentro de um loop (que seria O(n²)), tornando o código muito mais performático.
    const quantityMap = new Map(itemsFromRequest.map(item => [item.id, item.quantity]))

    // Usamos 'map' para a sua finalidade principal: transformar um array em outro.
    // Aqui, transformamos os dados do banco no formato que precisamos para o pedido.
    const finalOrderItems: OrderItemFinal[] = productsFromDB.map((product: IProduct) => ({
      product: product.id.toString(),
      name: product.title,
      price: product.price,
      quantity: quantityMap.get(product.id.toString())! // '!' é seguro devido à validação anterior
    }))

    // Usamos 'reduce' para a sua finalidade principal: agregar valores de um array.
    // Isso torna o código mais legível ao separar a transformação da agregação.
    const totalAmount = finalOrderItems.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)

    // --- 4. Criação e persistência do novo pedido no banco ---
    const newOrder = new Order({
      client: {name: user.name, tel: user.tel, email: user.email, id: user.id},
      payment,
      shippingAddress,
      orderItems: finalOrderItems,
      totalAmount: totalAmount.toFixed(2)
    })

    const result = await newOrder.save()
    return result
  }

  /**
   * Retorna todos os pedidos existentes.
   */
  async getOrdersAll() {
    const result = await Order.find({}).exec()
    return result
  }

  /**
   * Retorna os pedidos que não foram entregues ou cancelados.
   */
  async getOrdersActive() {
    const result = await Order.find({ status: { $nin: ['Entregue', 'Cancelado'] } }).exec()
    return result
  }

  async getUserOrders(userID : string){
    const result = await Order.find({ 'client.id': userID })
    return result
  }

  /**
   * Atualiza um pedido existente a partir do seu ID.
   * @param orderId O ID do pedido a ser atualizado.
   * @param orderData Os campos do pedido a serem modificados.
   */
  async updateOrder(orderId: string, orderData: object) {
    const result = await Order.findByIdAndUpdate(
      orderId,
      { $set: orderData },
      { new: true } // Opção para retornar o documento já atualizado.
    ).exec()

    return result
  }
}
