import UsersDataAccess from '../dataAccess/users'
import { ok, notFound, serverError } from '../helpers/httpResponse'

export default class UsersControllers {

  private dataAccess : UsersDataAccess

  constructor(){
    this.dataAccess  = new UsersDataAccess()
  }

  async getUsers() {
    try{
      const users = await this.dataAccess.getUsers()
      return ok(users)

    }catch(error){
      if (error instanceof Error) {
        return serverError(error.message)
      }
      return serverError('Ocorreu um erro inesperado ao buscar usuários.')
    }
  }

  async deleteUser(userId : string) {
    try{
      const result = await this.dataAccess.deleteUser(userId)
      return ok({message: 'Usuário deletado com sucesso!'})

    }catch(error){
      if (error instanceof Error) {
        return serverError(error.message)
      }
      return serverError('Erro ao deletar usuário!')
    }
  }

  async updateUser(userId : string, userData : object) {
    try{
      const result = await this.dataAccess.updateUser(userId, userData)
      return ok({message: 'Dados do usuário atualizados com sucesso!'})

    }catch(error){
      if (error instanceof Error) {
        return serverError(error.message)
      }
      return serverError('Erro ao atualizar usuário!')
    }
  }
}
