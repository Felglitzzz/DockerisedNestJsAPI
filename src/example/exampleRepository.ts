import { EntityManager } from 'typeorm'

import { ExampleModel } from './exampleModel'

export interface IExampleRepository {
  fetchExampleById(entityManager: EntityManager, id: string): Promise<ExampleModel>
  fetchExampleByName(entityManager: EntityManager, name: string): Promise<ExampleModel>
  fetchAllExamples(
    entityManager: EntityManager,
    skipTake: { skip: number; take: number; },
    where: { [k: string]: any; },
  ): Promise<Array<ExampleModel>>,
  createOrUpdateExample(entityManager: EntityManager, resource: ExampleModel): Promise<string>
}

export class ExampleRepository implements IExampleRepository {
  async fetchExampleById(entityManager: EntityManager, id: string): Promise<ExampleModel> {
    return await entityManager.findOne(ExampleModel, { id })
  }

  async fetchExampleByName(entityManager: EntityManager, name: string): Promise<ExampleModel> {
    return await entityManager.findOne(ExampleModel, { name })
  }

  async createOrUpdateExample(entityManager: EntityManager, resource: ExampleModel): Promise<string> {
    await entityManager.save(resource)

    return resource.id
  }

  async fetchAllExamples(
    entityManager: EntityManager,
    skipTake: { skip: number; take: number; },
    where: { [k: string]: any; },
  ): Promise<Array<ExampleModel>> {
    return entityManager.find(ExampleModel, { ...skipTake, where })
  }
}