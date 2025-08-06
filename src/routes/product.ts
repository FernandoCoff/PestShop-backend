import express from 'express'
import type { Request, Response } from 'express'
import ProductsControllers from '../controllers/products'


const productsRouter = express.Router()
const productsControllers : ProductsControllers = new ProductsControllers()

productsRouter.get('/', async ( req : Request , res : Response ) => {
  const  response = await productsControllers.getProductsActive()
  res.status(response.status).json(response)
})

productsRouter.get('/all', async ( req : Request , res : Response ) => {
  const  response = await productsControllers.getProductsAll()
  res.status(response.status).json(response)
})

productsRouter.post('/add', async ( req : Request , res : Response ) => {
  const  response = await productsControllers.addProduct(req.body)
  res.status(response.status).json(response)
})

productsRouter.delete('/:id', async ( req : Request , res : Response ) => {
  const response = await productsControllers.deleteProduct(req.params.id)
  res.status(response.status).json(response)
})


productsRouter.put('/:id', async ( req : Request , res : Response ) => {
  const response = await productsControllers.updateProduct(req.params.id, req.body)
  res.status(response.status).json(response)
})



export default productsRouter
