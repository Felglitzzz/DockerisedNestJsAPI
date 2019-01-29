import { EntityManager } from 'typeorm'

import { UserModel } from './userModel'

export interface IUserRepository{
  fetchUserByEmail(entityManager: EntityManager, email: string): Promise<UserModel>
  saveUser(entityManager: EntityManager, userModel: UserModel): Promise<string>
}

export class UserRepository implements IUserRepository  {
  async saveUser(entityManager: EntityManager, userModel: UserModel): Promise<string>{
    await entityManager.save(userModel)

    return userModel.id
  }

  async fetchUserByEmail(entityManager: EntityManager, email: string): Promise<UserModel> {
    return entityManager.findOne(UserModel, { emailAddress: email })
  }
}