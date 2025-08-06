import express from 'express'
import type { Request, Response } from 'express'
import UsersControllers from '../controllers/users'


const usersRouter = express.Router()
const usersControllers : UsersControllers = new UsersControllers()

usersRouter.get('/', async ( req : Request , res : Response ) => {
  const  response = await usersControllers.getUsers()
  res.status(response.status).json(response)
})

usersRouter.delete('/:id', async ( req : Request , res : Response ) => {
  const response = await usersControllers.deleteUser(req.params.id)
  res.status(response.status).json(response)
})

usersRouter.put('/:id', async ( req : Request , res : Response ) => {
  const response = await usersControllers.updateUser(req.params.id, req.body)
  res.status(response.status).json(response)
})



export default usersRouter
