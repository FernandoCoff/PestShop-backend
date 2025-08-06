import express from 'express'
import type { Request, Response } from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import 'dotenv/config'
import { Error } from './helpers/auxiliar'
import authRouter from './auth/auth'
import usersRouter from './routes/users'

// FUNÇÃO MAIN
const main = async () => {
  /*
  1- RECEBE A CAHAVE DE ACESSO DA DATABASE ATRAVÉS DO PRECESS.ENV OU RECEBE
  UMA STRING VAZIA, PORQUE NA CAHAMADA DO MONGOOSE.CONNECT O VALOR NÃO PODE
  SER UNDEFINED.
  2- SE A STRING FOR VAZIA, CHAMA A FUNCÃO DE ERROR, QUE EXIBE UMA MENSAGEM NO
  CONSOLE E FINALIZA O SERVIDOR.
  */
  const dbKey = process.env.DB_KEY || ''
  if(dbKey === '') Error('Error: Database connection key undefined!')

  // CASO A CHAVE DA DB ESTEJA DECLARADA TENTA INCIAR A CONEXÃO
  try {
    await mongoose.connect(dbKey)
    // MENSAGEM DE SUCESSO NA CONEXÃO
    console.log('DATABASE CONNECTED!')

  // 1- DEFINE O APP 2- DEFINE A PORTA
  const app = express()
  const port = process.env.PORT || 3000

  // 1- FORMATA AS RESPOSTAS PARA JSON (MIDDLEWARE)
  // 2 -PERMITE A COMUNIÇÃO COM O FRONT-END APARTIR DE UMA URL DIFERENTE
  app.use(express.json())
  app.use(cors())

  app.get('/', ( req : Request, res : Response ) => {
    res.status(200).json({message : 'success'})
  })

  app.use('/auth', authRouter)
  app.use('/users', usersRouter)

  // DEFINE A PORTA E EXIBE MENSAGEM DE QUE O SERVIDOR ESTÁ RODANDO
  app.listen(port, () => console.log('SERVER IS RUNNING!'))

  // CASO NÃO CONSIGA SE CONECTAR A DB CHAMA A FUNÇÃO ERROR, E ENCERRA A APLICAÇÃO
  }catch (error){
    Error('Error: Database connection failed! Erro: ' + error)
  }

}
// EXECUTA A FUNÇÃO MAIN
main()
