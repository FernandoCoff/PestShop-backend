import express, { Request, Response } from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { pbkdf2 } from 'crypto'
import { promisify } from 'util'
import crypto from 'crypto'

// --- CONFIGURAÇÃO INICIAL ---

// A função 'pbkdf2' do módulo 'crypto' usa o padrão de callbacks.
// 'promisify' a transforma em uma função que retorna uma Promise.
// Isso nos permite usar a sintaxe moderna 'async/await' para hashear senhas,
// tornando o código mais limpo e legível.
const pbkdf2Promise = promisify(pbkdf2)

// --- ESTRATÉGIA DE AUTENTICAÇÃO LOCAL (LOGIN) ---

// 'passport.use' registra uma nova estratégia de autenticação.
// Estamos usando a 'LocalStrategy', que é a estratégia padrão de login com email/senha.
passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    // O bloco 'try...catch' captura qualquer erro que possa ocorrer durante
    // a consulta ao banco de dados ou o processo de verificação.
    try {
      // Procura por um usuário no banco de dados que tenha o email fornecido.
      const user = await User.findOne({ email })

      // Se nenhum usuário for encontrado com esse email, a autenticação falha.
      // 'done(null, false, ...)' informa ao Passport que não houve erro no servidor (null),
      // a autenticação não foi bem-sucedida (false), e envia uma mensagem de feedback.
      if (!user) {
        return done(null, false, { message: 'Usuário não encontrado.' })
      }

      // Se o usuário existe, recuperamos o 'salt' que foi salvo junto com ele no momento do cadastro.
      // O 'salt' é um dado aleatório que garante que o hash da senha seja único para cada usuário.
      const saltBuffer = user.salt

      // Geramos um novo hash usando a senha que o usuário tentou usar no login
      // e o 'salt' que está salvo no banco de dados. Os parâmetros (iterações, tamanho, algoritmo)
      // devem ser exatamente os mesmos usados durante o cadastro.
      const hashedPassword = await pbkdf2Promise(password, saltBuffer, 310000, 16, 'sha256')

      // Recuperamos o hash da senha que está salvo no banco de dados.
      const userPasswordBuffer = user.password

      // 'crypto.timingSafeEqual' é usado para comparar os dois hashes.
      // Esta função é "segura contra ataques de tempo", o que significa que ela sempre
      // leva a mesma quantidade de tempo para executar, impedindo que um atacante
      // adivinhe a senha com base no tempo de resposta do servidor.
      if (!crypto.timingSafeEqual(userPasswordBuffer, hashedPassword)) {
        return done(null, false, { message: 'Senha incorreta.' })
      }

      // Se a autenticação for bem-sucedida, removemos os dados sensíveis ('password' e 'salt')
      // do objeto do usuário antes de retorná-lo.
      const { password: userPassword, salt: userSalt, ...userObject } = user.toObject()

      // 'done(null, userObject)' informa ao Passport que não houve erro (null) e que
      // a autenticação foi um sucesso, passando o objeto do usuário autenticado.
      return done(null, userObject)

    } catch (error) {
      // Se ocorrer um erro inesperado (ex: falha na conexão com o banco),
      // 'done(error)' informa ao Passport que houve um erro no servidor.
      return done(error)
    }
  })
)

// --- ROTAS DE AUTENTICAÇÃO ---

// 'express.Router()' cria um conjunto de rotas que pode ser exportado
// e usado no arquivo principal do servidor, mantendo o código organizado.
const authRouter = express.Router()

// Define a rota de cadastro (signup) que responde a requisições POST.
authRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    // Extrai os dados do corpo da requisição (JSON enviado pelo frontend).
    const { email, password, tel, name } = req.body

    // Verifica se já existe um usuário cadastrado com o mesmo email para evitar duplicatas.
    const checkUser = await User.findOne({ email })

    if (checkUser) {
      // Se o usuário já existe, retorna um status 409 (Conflict) com uma mensagem de erro.
      return res.status(409).json({
        success: false,
        message: 'E-mail já cadastrado!',
      })
    }

    // Gera um 'salt' aleatório de 16 bytes para o novo usuário.
    const salt = crypto.randomBytes(16)
    // Gera o hash da senha do novo usuário usando o 'salt' recém-criado.
    const hashedPassword = await pbkdf2Promise(password, salt, 310000, 16, 'sha256')

    // 'User.create' é o método do Mongoose para criar e salvar um novo documento no banco de dados.
    const newUser = await User.create({
      email,
      password: hashedPassword,
      tel,
      name,
      salt,
    })

    // Cria o 'payload' para o JWT. O payload contém as informações que queremos
    // armazenar dentro do token. É uma boa prática incluir apenas o essencial,
    // como o ID e o email do usuário, para manter o token pequeno e seguro.
    const jwtPayload = {
      id: newUser._id,
      email: newUser.email,
    }

    // 'jwt.sign' cria o token. Ele recebe o payload, um segredo (que deve ser
    // armazenado de forma segura em variáveis de ambiente) e opções, como o tempo de expiração.
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d', // O token será válido por 1 dia.
    })

    // Remove os dados sensíveis do objeto do novo usuário antes de enviá-lo na resposta.
    const { password: userPassword, salt: userSalt, ...userResponse } = newUser.toObject()

    // Retorna um status 201 (Created) para indicar que o recurso foi criado com sucesso.
    // A resposta inclui o token de acesso e os dados do usuário recém-criado.
    return res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso!',
      token,
      user: userResponse,
    })

  } catch (error) {
    // Se ocorrer qualquer erro durante o processo de cadastro, ele é capturado aqui.
    console.error("Erro no cadastro:", error)
    // Retorna um status 500 (Internal Server Error) com uma mensagem genérica.
    return res.status(500).json({
      success: false,
      message: 'Ocorreu um erro inesperado no servidor.',
    })
  }
})

authRouter.post('/login', async (req: Request, res: Response) => {
  passport.authenticate('local', (error: string, user: object) => {
    try{
      if(error){
        return res.status(409).json({
          success: false,
          message: 'Falha na autenticação',
        })
      }

      if(!user){
        return res.status(400).json({
          success: false,
          message: 'Email e/ou senha incorretos!',
        })
      }

      const token = jwt.sign(user, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d', // O token será válido por 1 dia.
      })
      return res.status(200).json({
          success: true,
          message: 'Usuário autenticado corretamente!',
          user,
          token
        })

    }catch(error){
      console.error('Erro ao efetuar login ' + error)
    }
  })(req, res)
})

// Exporta o 'authRouter' para que ele possa ser importado e utilizado no
// arquivo principal da aplicação (ex: app.use('/auth', authRouter)).
export default authRouter
