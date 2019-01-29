import { IsString, IsArray } from 'class-validator'
import { ApiModelProperty } from '@nestjs/swagger'
export class CreateRoleCommand {
  @IsString()
  @ApiModelProperty()
  readonly name: string

  @IsString()
  @ApiModelProperty()
  readonly parentRoleId: string

  @IsArray()
  @ApiModelProperty({ type: [String] })
  readonly permissions: string[]

  public constructor(parentRoleId: string, name: string) {
    this.parentRoleId = parentRoleId
    this.name = name
  }
}