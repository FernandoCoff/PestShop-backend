import crypto, { pbkdf2 } from 'crypto'
import { promisify } from 'util'
import User from '../models/User'


type IUser = {
  email?: string
  password?: Buffer
  tel?: string
  name?: string,
  salt?: Buffer
}


export default class UsersDataAccess {
  async getUsers(){
    const result = await User.find({}, {_id:1, tel:1, name:1, email:1}).exec()
    return result
  }

  async deleteUser(userId : string ){
    const result = await User.findByIdAndDelete(userId)
    return result
  }

  async updateUser(userId: string, userData: IUser) {
  // 1. Verifica se uma nova senha foi enviada
  if (userData.password) {
    // Converte a função de callback pbkdf2 para uma Promise
    const pbkdf2Promise = promisify(pbkdf2)

    // Gera um salt único para este usuário
    const salt = crypto.randomBytes(16)

    // Gera o hash da senha (note o keylen aumentado para 64)
    const hashedPasswordBuffer = await pbkdf2Promise(
      userData.password,
      salt,
      310000,
      64,
      'sha256'
    )

    userData.password = hashedPasswordBuffer
    userData.salt = salt
  }

  // 3. Executa a atualização no banco UMA ÚNICA VEZ com os dados preparados
  const result = await User.findByIdAndUpdate(
    userId,
    { $set: userData },
    { new: true } // Garante que o documento retornado seja a versão atualizada
  ).exec();

  return result
}
}
