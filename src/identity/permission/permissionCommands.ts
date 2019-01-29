import { IsString, IsInt, IsBoolean } from 'class-validator'
import { ApiModelProperty } from '@nestjs/swagger'

import { PermissionTypes } from './permissionService'

export class CreatePermissionCommand {
  @IsString()
  @ApiModelProperty()
  readonly resource: string

  @IsInt()
  @ApiModelProperty()
  readonly permissionType: PermissionTypes

  @IsBoolean()
  @ApiModelProperty()
  readonly isCustom: boolean

  @ApiModelProperty()
  readonly customName: string

  public constructor(resourceId: string, permissionType: PermissionTypes, isCustom: boolean, customName?: string) {
    this.resource = resourceId
    this.permissionType = permissionType
    this.isCustom = isCustom
    this.customName = customName
  }
}