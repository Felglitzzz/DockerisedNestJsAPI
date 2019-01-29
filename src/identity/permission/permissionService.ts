import { BadRequestException, Inject, NotFoundException } from '@nestjs/common'
import { Connection } from 'typeorm'

import { TYPES } from '../../types'

import { IEventRepository } from '../../shared/event/eventRepository'
import { IPermissionRepository } from './permissionRepository'
import { IResourceRepository } from '../resource/resourceRepository'

import { EventModel } from '../../shared/event/eventModel'
import { PermissionModel } from './permissionModel'
import { ResourceModel } from '../resource/resourceModel'

import { CreatePermissionCommand } from './permissionCommands'

import { PermissionDto, QueryPermissionRequestDto } from './permissionDtos'

export enum PermissionTypes {
  CAN_CREATE = 1,
  CAN_READ = 2,
  CAN_UPDATE = 3,
  CAN_DELETE = 4,
}

export interface IPermissionService {
  fetchPermissionTypes(): Promise<Array<{id: any, name: string}>>
  createPermission(createPermissionCommand: CreatePermissionCommand): Promise<string>
  fetchResourceById(id: string): Promise<PermissionDto>
  fetchAllPermissions(queryPermissionRequestDto: QueryPermissionRequestDto): Promise<Array<PermissionDto>>
}

export class PermissionService implements IPermissionService {
  private readonly asyncDatabaseConnection: Connection
  private readonly eventRepository: IEventRepository
  private readonly permissionRepository: IPermissionRepository
  private readonly resourceRepository: IResourceRepository

  public constructor(
    @Inject(TYPES.AsyncDatabaseConnection) asyncDatabaseConnection: Connection,
    @Inject(TYPES.IEventRepository) eventRepository: IEventRepository,
    @Inject(TYPES.IPermissionRepository) permissionRepository: IPermissionRepository,
    @Inject(TYPES.IResourceRepository) resourceRepository: IResourceRepository,
  ) {
    this.asyncDatabaseConnection = asyncDatabaseConnection
    this.eventRepository = eventRepository
    this.permissionRepository = permissionRepository
    this.resourceRepository = resourceRepository
  }

  async fetchPermissionTypes(): Promise<Array<{id: any, name: string}>> {
    const permissions = Object.keys(PermissionTypes).map(key => ({ id: PermissionTypes[key], name: key })).filter(permission => !isNaN(permission.id))

    return permissions
  }

  async createPermission(createPermissionCommand: CreatePermissionCommand): Promise<string> {
    if (!createPermissionCommand.resource || createPermissionCommand.resource.length === 0)
      throw new BadRequestException('Resource is required')

    if (isNaN(createPermissionCommand.permissionType))
      throw new BadRequestException('Permission is required')

    if (createPermissionCommand.permissionType > 4 || createPermissionCommand.permissionType !== 0 &&
      (createPermissionCommand.isCustom || (createPermissionCommand.customName  && createPermissionCommand.customName.length > 0)))
      throw new BadRequestException('Invalid permission')

    const resourceExists = await this.resourceRepository.fetchResourceById(this.asyncDatabaseConnection.manager, createPermissionCommand.resource)

    if (!resourceExists)
      throw new NotFoundException(`Resource does not exist - ${createPermissionCommand.resource}`)

    const permissionExists =
      await this.permissionRepository
        .fetchPermissionByResourceAndPermissionType(
          this.asyncDatabaseConnection.manager, resourceExists, createPermissionCommand.permissionType,
        )

    if (permissionExists && !createPermissionCommand.isCustom ||
      permissionExists && createPermissionCommand.isCustom && createPermissionCommand.customName === permissionExists.customName)
      throw new BadRequestException(`Permission already exists - ${createPermissionCommand.permissionType}`)

    const permission = this.mapCommandToModel(createPermissionCommand, resourceExists)

    const queryRunner = this.asyncDatabaseConnection.createQueryRunner()

    await queryRunner.startTransaction()

    try {
      const event = new EventModel(TYPES.STREAMS.Permission, TYPES.EVENTS.PermissionCreatedEvent, permission)

      await this.eventRepository.saveEvent(queryRunner.manager, event)

      permission.streamId = event.streamId
      permission.version = event.version

      await this.permissionRepository.createOrUpdatePermission(queryRunner.manager, permission)

      await queryRunner.commitTransaction()

      return permission.id
    } catch (error) {
      await queryRunner.rollbackTransaction

      console.log(error)

      throw new Error('An error occured, check logs for details')
    } finally{
      await queryRunner.release()
    }
  }

  async fetchResourceById(id: string): Promise<PermissionDto> {
    const resourceModel = await this.permissionRepository.fetchPermissionById(this.asyncDatabaseConnection.manager, id)

    return PermissionDto.mapModelToDto(resourceModel)
  }

  async fetchAllPermissions(queryPermissionRequestDto: QueryPermissionRequestDto): Promise<Array<PermissionDto>> {
    const skipTake = { skip: parseInt(queryPermissionRequestDto.offset, 0), take: parseInt(queryPermissionRequestDto.limit, 0)}
    const where: {[k: string]: any} = {}

    const permissionModelList = await this.permissionRepository.fetchAllPermissions(this.asyncDatabaseConnection.manager, skipTake, where)

    const permissions = permissionModelList.map(k => PermissionDto.mapModelToDto(k))

    return permissions
  }

  private mapCommandToModel(createResourceCommand: CreatePermissionCommand, resource: ResourceModel): PermissionModel {
    return new PermissionModel(resource, createResourceCommand.permissionType, createResourceCommand.isCustom, createResourceCommand.customName)
  }
}
