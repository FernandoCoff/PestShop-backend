import Product from '../models/Product'

export default class ProductsDataAccess {
  async getProductsAll(){
    const result = await Product.find({}).exec()
    return result
  }

  async getProductsActive(){
    const result = await Product.find({ available : true }).exec()
    return result
  }

  async addProduct( product : object){
    const result = await Product.insertOne(product)
    return result
  }

  async deleteProduct(productId : string ){
    const result = await Product.findByIdAndDelete(productId)
    return result
  }

  async updateProduct(userId: string, userData: object) {
  const result = await Product.findByIdAndUpdate(
    userId,
    { $set: userData },
    { new: true } // Garante que o documento retornado seja a versão atualizada
  ).exec()

  return result
}
}
