import { RoleModel } from './roleModel'
import { PermissionModel } from '../permission/permissionModel'
import { PermissionDto } from '../permission/permissionDtos'

export class RoleDto {
  readonly id: string
  readonly name: string
  readonly permissions: Array<PermissionDto>

  public constructor(id: string, name: string, permissions: Array<PermissionModel>) {
    this.id = id
    this.name = name

    if (permissions && permissions.length > 0)
      this.permissions = permissions.map(PermissionDto.mapModelToDto)
  }

  static mapModelToDto(role: RoleModel): RoleDto {
    return new RoleDto(role.id, role.name, role.permissions)
  }
}