import { EntityManager } from 'typeorm'

import { ResourceModel } from './resourceModel'

export interface IResourceRepository {
  fetchResourceById(entityManager: EntityManager, id: string): Promise<ResourceModel>
  fetchResourceByName(entityManager: EntityManager, name: string): Promise<ResourceModel>
  fetchAllResources(
    entityManager: EntityManager, skipTake: { skip: number; take: number; }, where: { [k: string]: any; },
  ): Promise<Array<ResourceModel>>,
  createOrUpdateResource(entityManager: EntityManager, resource: ResourceModel): Promise<string>
}

export class ResourceRepository implements IResourceRepository {
  async fetchResourceById(entityManager: EntityManager, id: string): Promise<ResourceModel> {
    return await entityManager
      .findOne(ResourceModel, { id })
  }

  async fetchResourceByName(entityManager: EntityManager, name: string): Promise<ResourceModel> {
    return await entityManager
      .findOne(ResourceModel, { name })
  }

  async createOrUpdateResource(entityManager: EntityManager, resource: ResourceModel): Promise<string> {
    await entityManager.save(resource)

    return resource.id
  }

  async fetchAllResources(
    entityManager: EntityManager, skipTake: { skip: number; take: number; }, where: { [k: string]: any; },
  ): Promise<Array<ResourceModel>> {
    return entityManager
      .find(ResourceModel, { ...skipTake, where })
  }
}