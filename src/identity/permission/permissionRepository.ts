import { EntityManager } from 'typeorm'

import { PermissionModel } from './permissionModel'
import { ResourceModel } from '../resource/resourceModel'

export interface IPermissionRepository {
  fetchPermissionById(entityManager: EntityManager, id: string): Promise<PermissionModel>
  fetchCustomPermissionByName(entityManager: EntityManager, resource: ResourceModel, name: string): Promise<PermissionModel>
  fetchPermissionByResourceAndPermissionType(
    entityManager: EntityManager, resource: ResourceModel, permissionType: number,
  ): Promise<PermissionModel>
  fetchAllPermissions(
    entityManager: EntityManager, skipTake: { skip: number; take: number; }, where: { [k: string]: any; },
  ): Promise<Array<PermissionModel>>,
  createOrUpdatePermission(entityManager: EntityManager, permission: PermissionModel): Promise<string>
}

export class PermissionRepository implements IPermissionRepository {
  async fetchPermissionById(entityManager: EntityManager, id: string): Promise<PermissionModel> {
    return await entityManager
      .findOne(PermissionModel, { id })
  }

  async fetchCustomPermissionByName(entityManager: EntityManager, resource: ResourceModel, customName: string): Promise<PermissionModel> {
    return await entityManager
      .findOne(PermissionModel, { resource, customName, isCustom: true })
  }

  async fetchPermissionByResourceAndPermissionType(
    entityManager: EntityManager, resource: ResourceModel, permissionType: number,
  ): Promise<PermissionModel> {
    return await entityManager
      .findOne(PermissionModel, { resource, permissionType })
  }

  async createOrUpdatePermission(entityManager: EntityManager, permission: PermissionModel): Promise<string> {
    await entityManager.save(permission)

    return permission.id
  }

  async fetchAllPermissions(
    entityManager: EntityManager, skipTake: { skip: number; take: number; }, where: { [k: string]: any; },
  ): Promise<Array<PermissionModel>> {
    return entityManager
      .find(PermissionModel, { ...skipTake, where })
  }
}