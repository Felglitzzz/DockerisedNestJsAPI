import { IPermissionService, PermissionTypes } from '../permissionService'
import { CreatePermissionCommand } from '../permissionCommands'
import { QueryPermissionRequestDto } from '../permissionDtos'

export class PermissionFactory {
  private permissionService: IPermissionService
  private resourceIds: string[]

  private permissionTypes

  public constructor(permissionService: IPermissionService, resourceIds: string[]) {
    this.permissionService = permissionService
    this.resourceIds = resourceIds
  }

  public async seedPermission() {
    this.permissionTypes = await this.permissionService.fetchPermissionTypes()

    const permissions = new Array<CreatePermissionCommand>()
    this.resourceIds.map(resourceId => {
      this.permissionTypes.map(permissionType => {
        permissions.push(new CreatePermissionCommand(resourceId, permissionType.id as PermissionTypes, false))
      })
    })

    const createPermissionPromises = permissions.map(permission =>
      this.permissionService.createPermission(permission),
    )

    await Promise.all(createPermissionPromises)

    const createdPermissions = await this.permissionService.fetchAllPermissions(new QueryPermissionRequestDto('10', '0'))

    return createdPermissions.map(createdPermission => createdPermission.id)
  }
}