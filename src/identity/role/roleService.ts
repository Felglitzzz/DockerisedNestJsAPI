import { BadRequestException, Inject, NotFoundException } from '@nestjs/common'
import { Connection } from 'typeorm'

import { TYPES } from '../../types'

import { IEventRepository } from '../../shared/event/eventRepository'
import { IRoleRepository } from './roleRepository'
import { IPermissionRepository } from '../permission/permissionRepository'

import { EventModel } from '../../shared/event/eventModel'
import { RoleModel } from './roleModel'
import { PermissionModel } from '../permission/permissionModel'

import { CreateRoleCommand } from './roleCommands'

import { RoleDto } from './roleDtos'

export interface IRoleService {
  createRole(createRoleCommand: CreateRoleCommand): Promise<string>
  fetchRoleById(id: string): Promise<RoleDto>
}

export class RoleService implements IRoleService {
  private readonly asyncDatabaseConnection: Connection
  private readonly eventRepository: IEventRepository
  private readonly roleRepository: IRoleRepository
  private readonly permissionRepository: IPermissionRepository

  public constructor(
    @Inject(TYPES.AsyncDatabaseConnection) asyncDatabaseConnection: Connection,
    @Inject(TYPES.IEventRepository) eventRepository: IEventRepository,
    @Inject(TYPES.IRoleRepository) roleRepository: IRoleRepository,
    @Inject(TYPES.IPermissionRepository) permissionRepository: IPermissionRepository,
  ) {
    this.asyncDatabaseConnection = asyncDatabaseConnection
    this.eventRepository = eventRepository
    this.roleRepository = roleRepository
    this.permissionRepository = permissionRepository
  }

  async createRole(createRoleCommand: CreateRoleCommand): Promise<string> {
    if (!createRoleCommand.name)
      throw new BadRequestException('Role name is required')

    if (createRoleCommand.parentRoleId) {
      const parentRole = await this.roleRepository.fetchRoleById(this.asyncDatabaseConnection.manager, createRoleCommand.parentRoleId)

      if (!parentRole)
        throw new NotFoundException(`Parent role does not exist ${createRoleCommand.parentRoleId}`)
    }

    const validPermissions = new Array<PermissionModel>()
    const inValidPermissions = new Array<string>()
    if (createRoleCommand.permissions && createRoleCommand.permissions.length > 0) {
      for (const permissionId of createRoleCommand.permissions) {
        const permission = await this.permissionRepository.fetchPermissionById(this.asyncDatabaseConnection.manager, permissionId)

        if (!permission)
          inValidPermissions.push(permissionId)
        else
          validPermissions.push(permission)
      }
    }

    if (inValidPermissions.length > 0)
      throw new NotFoundException(`Permission(s) not found - ${inValidPermissions.join(',')}`)

    const roleExists = await this.roleRepository.fetchRoleByName(this.asyncDatabaseConnection.manager, createRoleCommand.name)

    if (roleExists)
      throw new BadRequestException(`Role already exists - ${createRoleCommand.name}`)

    const role = this.mapCommandToModel(createRoleCommand, validPermissions)

    const queryRunner = this.asyncDatabaseConnection.createQueryRunner()

    await queryRunner.startTransaction()

    try {
      const event = new EventModel(TYPES.STREAMS.Role, TYPES.EVENTS.RoleCreatedEvent, role)

      await this.eventRepository.saveEvent(queryRunner.manager, event)

      role.streamId = event.streamId
      role.version = event.version

      await this.roleRepository.createOrUpdateRole(queryRunner.manager, role)

      await queryRunner.commitTransaction()

      return role.id
    } catch (error) {
      await queryRunner.rollbackTransaction

      console.log(error)

      throw new Error('An error occured, check logs for details')
    } finally {
      await queryRunner.release()
    }
  }

  async fetchRoleById(id: string): Promise<RoleDto> {
    const role = await this.roleRepository.fetchRoleById(this.asyncDatabaseConnection.manager, id)

    return RoleDto.mapModelToDto(role)
  }

  private mapCommandToModel(createRoleCommand: CreateRoleCommand, permissions: Array<PermissionModel>): RoleModel {
    return new RoleModel(createRoleCommand.name, createRoleCommand.parentRoleId, permissions)
  }
}