import express from 'express'
import type { Request, Response } from 'express'
import OrdersControllers from '../controllers/orders'


const ordersRouter = express.Router()
const ordersControllers : OrdersControllers = new OrdersControllers()

ordersRouter.get('/', async ( req : Request , res : Response ) => {
  const  response = await ordersControllers.getOrdersAll()
  res.status(response.status).json(response)
})

ordersRouter.get('/active', async ( req : Request , res : Response ) => {
  const  response = await ordersControllers.getOrdersActive()
  res.status(response.status).json(response)
})

ordersRouter.post('/new', async ( req : Request , res : Response ) => {
  const  response = await ordersControllers.addOrder(req.body)
  res.status(response.status).json(response)
})

ordersRouter.put('/:id', async ( req : Request , res : Response ) => {
  const response = await ordersControllers.updateOrder(req.params.id, req.body)
  res.status(response.status).json(response)
})

ordersRouter.get('/:id', async ( req : Request , res : Response ) => {
  const response = await ordersControllers.getUserOrders(req.params.id)
  res.status(response.status).json(response)
})



export default ordersRouter
