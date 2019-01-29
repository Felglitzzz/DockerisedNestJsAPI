import { BaseQueryRequestDto } from '../../shared/baseQueryDto'

import { PermissionTypes } from './permissionService'
import { PermissionModel } from './permissionModel'

export class PermissionDto {
  readonly id: string
  readonly permissionType: number
  readonly permissionName: string
  readonly isCustomPermission: boolean
  readonly customName: string
  readonly resourceName: string
  readonly resourceBaseUrl: string

  public constructor(
    id: string, permissionType: number, permissionName: string,
    isCustomPermission: boolean, customName: string, resourceName: string, resourceBaseUrl: string,
  ) {
    this.id = id
    this.permissionType = permissionType
    this.permissionName = permissionName
    this.isCustomPermission = isCustomPermission
    this.customName = customName
    this.resourceName = resourceName
    this.resourceBaseUrl = resourceBaseUrl
  }

  static mapModelToDto(permission: PermissionModel) {
    return new PermissionDto(
      permission.id,
      permission.permissionType, PermissionTypes[permission.permissionType],
      permission.isCustom, permission.customName,
      permission.resource.name, permission.resource.baseUrl,
    )
  }
}

export class QueryPermissionRequestDto extends BaseQueryRequestDto {
  public constructor(limit: string, offset: string) {
    super(limit, offset)
  }
}