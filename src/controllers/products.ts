import ProductsDataAccess from '../dataAccess/products'
import { ok, notFound, serverError } from '../helpers/httpResponse'

export default class ProductsControllers {

  private dataAccess : ProductsDataAccess

  constructor(){
    this.dataAccess  = new ProductsDataAccess()
  }

  async addProduct(product : object){
    try{
      const newProduct = await this.dataAccess.addProduct(product)
      return ok(newProduct)

    }catch(error){
      if (error instanceof Error) {
        return serverError(error.message)
      }
      return notFound('Ocorreu um erro inesperado ao buscar os produtos!')
    }
  }

  async getProductsAll() {
    try{
      const products = await this.dataAccess.getProductsAll()
      return ok(products)

    }catch(error){
      if (error instanceof Error) {
        return serverError(error.message)
      }
      return notFound('Ocorreu um erro inesperado ao buscar os produtos!')
    }
  }

  async getProductsActive() {
    try{
      const products = await this.dataAccess.getProductsActive()
      return ok(products)

    }catch(error){
      if (error instanceof Error) {
        return serverError(error.message)
      }
      return serverError('Ocorreu um erro inesperado ao buscar os produtos!')
    }
  }

  async deleteProduct(productId : string) {
    try{
      const result = await this.dataAccess.deleteProduct(productId)
      return ok({message: 'Produto deletado com sucesso!'})

    }catch(error){
      if (error instanceof Error) {
        return serverError(error.message)
      }
      return serverError('Erro ao deletar o Produto!')
    }
  }

  async updateProduct(productId : string, productData : object) {
    try{
      const result = await this.dataAccess.updateProduct(productId, productData)
      return ok({message: 'Dados do Produto atualizados com sucesso!'})

    }catch(error){
      if (error instanceof Error) {
        return serverError(error.message)
      }
      return serverError('Erro ao atualizar Produto!')
    }
  }
}
