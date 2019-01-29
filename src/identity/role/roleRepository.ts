import { EntityManager } from 'typeorm'

import { RoleModel } from './roleModel'

export interface IRoleRepository {
  fetchRoleByName(entityManager: EntityManager, name: string): Promise<RoleModel>
  fetchRoleById(entityManager: EntityManager, id: string): Promise<RoleModel>
  createOrUpdateRole(entityManager: EntityManager, role: RoleModel): Promise<string>
}

export class RoleRepository implements IRoleRepository {
  async fetchRoleByName(entityManager: EntityManager, name: string): Promise<RoleModel> {
    return await entityManager
      .findOne(RoleModel, { name })
  }

  async fetchRoleById(entityManager: EntityManager, id: string): Promise<RoleModel>{
    return await entityManager
      .findOne(RoleModel, { id })
  }

  async createOrUpdateRole(entityManager: EntityManager, role: RoleModel): Promise<string> {
    await entityManager.save(role)

    return role.id
  }
}