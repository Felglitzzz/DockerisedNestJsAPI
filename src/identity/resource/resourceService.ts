import { BadRequestException, Inject } from '@nestjs/common'
import { Connection } from 'typeorm'

import { TYPES } from '../../types'

import { IEventRepository } from '../../shared/event/eventRepository'
import { IResourceRepository } from './resourceRepository'

import { CreateResourceCommand } from './resourceCommands'

import { QueryResourceRequestDto } from './resourceDtos'
import { ResourceDto } from './resourceDtos'

import { EventModel } from '../../shared/event/eventModel'
import { ResourceModel } from './resourceModel'

export interface IResourceService {
  createResource(createResourceCommand: CreateResourceCommand): Promise<string>
  fetchResourceById(id: string): Promise<ResourceDto>
  fetchAllResource(queryResourceRequestDto: QueryResourceRequestDto): Promise<Array<ResourceDto>>
}

export class ResourceService implements IResourceService {
  private readonly asyncDatabaseConnection: Connection
  private readonly eventRepository: IEventRepository
  private readonly resourceRepository: IResourceRepository

  public constructor(
    @Inject(TYPES.AsyncDatabaseConnection) asyncDatabaseConnection: Connection,
    @Inject(TYPES.IEventRepository) eventRepository: IEventRepository,
    @Inject(TYPES.IResourceRepository) resourceRepository: IResourceRepository,
  ) {
    this.asyncDatabaseConnection = asyncDatabaseConnection
    this.eventRepository = eventRepository
    this.resourceRepository = resourceRepository
  }

  async createResource(createResourceCommand: CreateResourceCommand): Promise<string> {
    if (!createResourceCommand.name || createResourceCommand.name.length === 0)
      throw new BadRequestException('Resource name is required')
    if (!createResourceCommand.baseUrl || createResourceCommand.baseUrl.length === 0)
      throw new BadRequestException('Resource base url is required')

    const resourceExists = await this.resourceRepository.fetchResourceByName(this.asyncDatabaseConnection.manager, createResourceCommand.name)

    if (resourceExists)
      throw new BadRequestException(`Resource already exists - ${createResourceCommand.name}`)

    const resource = this.mapCommandToModel(createResourceCommand)

    const queryRunner = this.asyncDatabaseConnection.createQueryRunner()

    await queryRunner.startTransaction()

    try {
      const event = new EventModel(TYPES.STREAMS.Resource, TYPES.EVENTS.ResourceCreatedEvent, resource)

      await this.eventRepository.saveEvent(queryRunner.manager, event)

      resource.streamId = event.streamId
      resource.version = event.version

      await this.resourceRepository.createOrUpdateResource(queryRunner.manager, resource)

      await queryRunner.commitTransaction()

      return resource.id
    } catch (error) {
      await queryRunner.rollbackTransaction

      console.error(error)

      throw new Error('An error occured, check logs for details')
    } finally{
      await queryRunner.release()
    }
  }

  async fetchResourceById(id: string): Promise<ResourceDto> {
    const resourceModel = await this.resourceRepository.fetchResourceById(this.asyncDatabaseConnection.manager, id)

    return ResourceDto.mapModelToDto(resourceModel)
  }

  async fetchAllResource(queryResourceRequestDto: QueryResourceRequestDto): Promise<Array<ResourceDto>> {
    const skipTake = { skip: parseInt(queryResourceRequestDto.offset, 0), take: parseInt(queryResourceRequestDto.limit, 0)}
    const where: {[k: string]: any} = {}

    if (queryResourceRequestDto.name && queryResourceRequestDto.name.length > 0) {
      where.name = queryResourceRequestDto.name
    }

    if (queryResourceRequestDto.baseUrl && queryResourceRequestDto.baseUrl.length > 0) {
      where.baseUrl = queryResourceRequestDto.baseUrl
    }

    const resourceModelList = await this.resourceRepository.fetchAllResources(this.asyncDatabaseConnection.manager, skipTake, where)

    const resources = resourceModelList.map(k => ResourceDto.mapModelToDto(k))

    return resources
  }

  private mapCommandToModel(createResourceCommand: CreateResourceCommand): ResourceModel {
    return new ResourceModel(createResourceCommand.name, createResourceCommand.baseUrl)
  }
}
