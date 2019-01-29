import { Module } from '@nestjs/common'
import { ClassProvider } from '@nestjs/common/interfaces'

import { TYPES } from '../types'

import { AuthenticationController } from './authentication/authenticationController'

import { UserController } from './user/userController'
import { UserService } from './user/userService'
import { UserRepository } from './user/userRepository'

import { ResourceController } from './resource/resourceController'
import { ResourceService } from './resource/resourceService'
import { ResourceRepository } from './resource/resourceRepository'

import { PermissionController } from './permission/permissionController'
import { PermissionService } from './permission/permissionService'
import { PermissionRepository } from './permission/permissionRepository'

import { RoleController } from './role/roleController'
import { RoleService } from './role/roleService'
import { RoleRepository } from './role/roleRepository'

import { EventRepository } from '../shared//event/eventRepository'

const userServiceProvider: ClassProvider = { provide: TYPES.IUserService, useClass:  UserService}
const userRepositoryProvider: ClassProvider = { provide: TYPES.IUserRepository, useClass:  UserRepository}

const resourceServiceProvider: ClassProvider = { provide: TYPES.IResourceService, useClass:  ResourceService}
const resourceRepositoryProvider: ClassProvider = { provide: TYPES.IResourceRepository, useClass:  ResourceRepository}

const permissionServiceProvider: ClassProvider = { provide: TYPES.IPermissionService, useClass:  PermissionService}
const permissionRepositoryProvider: ClassProvider = { provide: TYPES.IPermissionRepository, useClass:  PermissionRepository}

const roleServiceProvider: ClassProvider = { provide: TYPES.IRoleService, useClass:  RoleService}
const roleRepositoryProvider: ClassProvider = { provide: TYPES.IRoleRepository, useClass:  RoleRepository}

const eventRepositoryProvider: ClassProvider = { provide: TYPES.IEventRepository, useClass:  EventRepository}

@Module({
  controllers: [UserController, ResourceController, PermissionController, RoleController, AuthenticationController],
  providers: [
    eventRepositoryProvider,
    resourceServiceProvider, resourceRepositoryProvider,
    permissionServiceProvider, permissionRepositoryProvider,
    roleServiceProvider, roleRepositoryProvider,
    userServiceProvider, userRepositoryProvider,
  ],
})

export class IdentityModule {}